import {json,readJson,isSameOrigin,methodNotAllowed} from '../../_lib/http.js';
import {
  verifyPasswordRecord,maybeUpgradePasswordRecord,sha256,randomToken,sessionCookie,
  TARGET_PASSWORD_SCHEME,LEGACY_PASSWORD_SCHEME,PBKDF2_ITERATIONS
} from '../../_lib/auth.js';

const PAIR_WINDOW_SECONDS=600;
const PAIR_MAX_ATTEMPTS=8;
const IP_WINDOW_SECONDS=600;
const IP_MAX_ATTEMPTS=30;
const EMAIL_WINDOW_SECONDS=3600;
const EMAIL_MAX_ATTEMPTS=60;

// Static dummy verifier contains no real password or per-account secret.
const DUMMY_PASSWORD_RECORD=Object.freeze({
  password_scheme:TARGET_PASSWORD_SCHEME,
  password_salt:'A'.repeat(24),
  password_hash:'i='+PBKDF2_ITERATIONS+'$'+'A'.repeat(43)
});
async function equalizeMissingAccount(password,pepper){
  await verifyPasswordRecord(password,DUMMY_PASSWORD_RECORD,pepper);
}

// SQLite performs the conditional UPSERT atomically for simultaneous requests.
export async function reserveLoginAttempt(db,key,now,windowSeconds,maxAttempts){
  const result=await db.prepare(`
    INSERT INTO login_rate(rate_key,window_started,attempts) VALUES(?,?,1)
    ON CONFLICT(rate_key) DO UPDATE SET
      attempts=CASE WHEN excluded.window_started-login_rate.window_started>=?
                    THEN 1 ELSE login_rate.attempts+1 END,
      window_started=CASE WHEN excluded.window_started-login_rate.window_started>=?
                          THEN excluded.window_started ELSE login_rate.window_started END
    WHERE excluded.window_started-login_rate.window_started>=?
          OR login_rate.attempts<?
  `).bind(key,now,windowSeconds,windowSeconds,windowSeconds,maxAttempts).run();
  return Number(result?.meta?.changes||0)===1;
}

export async function onRequest(context){
  if(context.request.method!=='POST')return methodNotAllowed('POST');
  if(!isSameOrigin(context.request))return json({error:'origin_not_allowed'},403);
  if(!context.env.STATS_DB||!context.env.AUTH_PEPPER)return json({error:'service_not_configured'},503);
  let body;try{body=await readJson(context.request,4096);}catch(error){return json({error:error.message},error.status||400);}
  const email=typeof body?.email==='string'?body.email.trim().toLowerCase():'';
  const password=typeof body?.password==='string'?body.password:'';
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||password.length<16||password.length>128)return json({error:'invalid_credentials'},401);

  const ip=context.request.headers.get('CF-Connecting-IP')||'unknown';
  const now=Math.floor(Date.now()/1000);
  const pepper=context.env.AUTH_PEPPER;
  const ipKey=await sha256('login-ip|'+ip+'|'+pepper);
  const emailKey=await sha256('login-email|'+email+'|'+pepper);
  // Retain historical per-IP-and-email rate counters after the rollout.
  const pairKey=await sha256(ip+'|'+email+'|'+pepper);

  // Always reserve BEFORE password verification, including dummy PBKDF2.
  // IP covers many emails; email covers distributed IPs; pair retains 8/10m.
  for(const [key,windowSeconds,limit] of [
    [ipKey,IP_WINDOW_SECONDS,IP_MAX_ATTEMPTS],
    [emailKey,EMAIL_WINDOW_SECONDS,EMAIL_MAX_ATTEMPTS],
    [pairKey,PAIR_WINDOW_SECONDS,PAIR_MAX_ATTEMPTS]
  ]){
    if(!await reserveLoginAttempt(context.env.STATS_DB,key,now,windowSeconds,limit))
      return json({error:'too_many_attempts'},429,{'Retry-After':String(windowSeconds)});
  }
  // Avoid one cleanup write per request while limiting stale-row retention.
  if(Math.random()<0.005)
    await context.env.STATS_DB.prepare('DELETE FROM login_rate WHERE window_started<?').bind(now-86400).run();

  const user=await context.env.STATS_DB.prepare('SELECT id,email,password_hash,password_salt,password_scheme,role,active FROM admin_users WHERE email=? LIMIT 1').bind(email).first();
  if(!user||Number(user.active)!==1){
    await equalizeMissingAccount(password,pepper);
    return json({error:'invalid_credentials'},401);
  }

  const verification=await verifyPasswordRecord(password,user,pepper);
  if(verification.error){
    // Account database errors must not become an enumeration signal.
    console.warn('password_record_unusable');
    await equalizeMissingAccount(password,pepper);
    return json({error:'invalid_credentials'},401);
  }
  if(!verification.ok){
    // Legacy HMAC is fast. Give failed legacy credentials modern KDF cost.
    if(user.password_scheme===LEGACY_PASSWORD_SCHEME)
      await equalizeMissingAccount(password,pepper);
    return json({error:'invalid_credentials'},401);
  }

  try{
    await maybeUpgradePasswordRecord(context.env.STATS_DB,user,password,context.env.AUTH_PEPPER,verification);
  }catch(error){
    // A verifier-upgrade failure must never block an otherwise valid login.
    console.warn('password_upgrade_deferred');
  }

  // Clear only the pair counter after success; aggregate anti-abuse budgets remain.
  await context.env.STATS_DB.prepare('DELETE FROM login_rate WHERE rate_key=?').bind(pairKey).run();
  await context.env.STATS_DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(now).run();

  const token=randomToken(32),tokenHash=await sha256(token);
  const maxAge=body.remember===true?60*60*24*7:60*60*12;
  const expiresAt=now+maxAge;
  await context.env.STATS_DB.prepare('INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(tokenHash,user.id,expiresAt).run();

  return json({ok:true,user:{email:user.email,role:user.role},expires_at:expiresAt},200,{'Set-Cookie':sessionCookie(token,maxAge)});
}
