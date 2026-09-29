import {json,readJson,isSameOrigin,methodNotAllowed} from '../../_lib/http.js';
import {PASSWORD_SCHEME,passwordVerifier,sha256,constantTimeEqual,randomToken,sessionCookie} from '../../_lib/auth.js';

const WINDOW_SECONDS=600;
const MAX_ATTEMPTS=8;

export async function onRequest(context){
  if(context.request.method!=='POST')return methodNotAllowed('POST');
  if(!isSameOrigin(context.request))return json({error:'origin_not_allowed'},403);
  if(!context.env.STATS_DB||!context.env.AUTH_PEPPER)return json({error:'service_not_configured'},503);
  let body;try{body=await readJson(context.request,4096);}catch(error){return json({error:error.message},error.status||400);}
  const email=String(body.email||'').trim().toLowerCase();
  const password=String(body.password||'');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||password.length<12||password.length>128)return json({error:'invalid_credentials'},401);

  const ip=context.request.headers.get('CF-Connecting-IP')||'unknown';
  const rateKey=await sha256(ip+'|'+email+'|'+context.env.AUTH_PEPPER);
  const now=Math.floor(Date.now()/1000);
  const rate=await context.env.STATS_DB.prepare('SELECT window_started,attempts FROM login_rate WHERE rate_key=?').bind(rateKey).first();
  if(rate&&now-Number(rate.window_started)<WINDOW_SECONDS&&Number(rate.attempts)>=MAX_ATTEMPTS)return json({error:'too_many_attempts'},429,{'Retry-After':'600'});
  if(!rate||now-Number(rate.window_started)>=WINDOW_SECONDS){
    await context.env.STATS_DB.prepare('INSERT INTO login_rate(rate_key,window_started,attempts) VALUES(?,?,1) ON CONFLICT(rate_key) DO UPDATE SET window_started=excluded.window_started,attempts=1').bind(rateKey,now).run();
  }else{
    await context.env.STATS_DB.prepare('UPDATE login_rate SET attempts=attempts+1 WHERE rate_key=?').bind(rateKey).run();
  }

  const user=await context.env.STATS_DB.prepare('SELECT id,email,password_hash,password_salt,password_scheme,role,active FROM admin_users WHERE email=? LIMIT 1').bind(email).first();
  if(!user||Number(user.active)!==1)return json({error:'invalid_credentials'},401);
  if(user.password_scheme!==PASSWORD_SCHEME)return json({error:'unsupported_password_scheme'},503);
  const calculated=await passwordVerifier(password,user.password_salt,context.env.AUTH_PEPPER);
  if(!constantTimeEqual(calculated,user.password_hash))return json({error:'invalid_credentials'},401);

  await context.env.STATS_DB.prepare('DELETE FROM login_rate WHERE rate_key=?').bind(rateKey).run();
  await context.env.STATS_DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(now).run();

  const token=randomToken(32),tokenHash=await sha256(token);
  const maxAge=body.remember===true?60*60*24*7:60*60*12;
  const expiresAt=now+maxAge;
  await context.env.STATS_DB.prepare('INSERT INTO admin_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(tokenHash,user.id,expiresAt).run();

  return json({ok:true,user:{email:user.email,role:user.role},expires_at:expiresAt},200,{'Set-Cookie':sessionCookie(token,maxAge)});
}
