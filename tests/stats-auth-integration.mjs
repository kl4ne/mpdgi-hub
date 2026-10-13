import assert from 'node:assert/strict';
import {onRequest as loginHandler,reserveLoginAttempt} from '../functions/api/auth/login.js';
import {onRequest as dashboardHandler} from '../functions/api/dashboard.js';
import {onRequest as campaignsHandler} from '../functions/api/campaigns.js';
import {onRequest as exportHandler} from '../functions/api/export.js';
import {onRequest as sessionHandler} from '../functions/api/auth/session.js';
import {getCookie} from '../functions/_lib/http.js';
import {
  passwordSalt,passwordVerifier,createTargetPasswordRecord,sha256,
  LEGACY_PASSWORD_SCHEME,TARGET_PASSWORD_SCHEME
} from '../functions/_lib/auth.js';

const ORIGIN='https://stats.test';
const PEPPER='integration-test-pepper';
const LEGACY_INPUT='Legacy-password-1234!';
const MODERN_INPUT='Modern-password-1234!';

class FakeD1{
  constructor(users=[]){
    this.users=new Map(users.map(user=>[user.email,{...user}]));
    this.loginRate=new Map();
    this.sessions=new Map();
    this.failUpgrade=false;
    this.upgradeWrites=0;
  }
  prepare(sql){
    const db=this;
    const normalized=String(sql).replace(/\s+/g,' ').trim();
    return {
      bind(...args){
        return {
          async first(){
            if(normalized.startsWith('SELECT window_started,attempts FROM login_rate')){
              return db.loginRate.get(args[0])||null;
            }
            if(normalized.startsWith('SELECT id,email,password_hash,password_salt,password_scheme,role,active FROM admin_users')){
              return db.users.get(args[0])||null;
            }
            throw new Error('Unhandled FakeD1 first SQL: '+normalized);
          },
          async run(){
            if(normalized.startsWith('DELETE FROM login_rate WHERE window_started<')){
              const cutoff=Number(args[0]);
              let changes=0;
              for(const [key,row] of [...db.loginRate.entries()]){
                if(Number(row.window_started)<cutoff){db.loginRate.delete(key);changes++;}
              }
              return {meta:{changes}};
            }
            if(normalized.startsWith('INSERT INTO login_rate')&&normalized.includes('WHERE excluded.window_started-login_rate.window_started>=')){
              const [key,now,win1,win2,win3,limit]=args;
              assert.equal(win1,win2);
              assert.equal(win2,win3);
              const old=db.loginRate.get(key);
              if(!old||Number(now)-Number(old.window_started)>=Number(win3)){
                db.loginRate.set(key,{window_started:Number(now),attempts:1});
                return {meta:{changes:1}};
              }
              if(Number(old.attempts)>=Number(limit))return {meta:{changes:0}};
              old.attempts++;
              return {meta:{changes:1}};
            }
            if(normalized.startsWith('DELETE FROM login_rate WHERE rate_key=')){
              const changes=db.loginRate.delete(args[0])?1:0;
              return {meta:{changes}};
            }
            if(normalized.startsWith('UPDATE admin_users SET password_hash=')){
              db.upgradeWrites++;
              if(db.failUpgrade)throw new Error('simulated_upgrade_write_failure');
              const [hash,salt,scheme,id,expectedScheme,expectedHash]=args;
              const user=[...db.users.values()].find(item=>item.id===id);
              if(!user||user.password_scheme!==expectedScheme||user.password_hash!==expectedHash)return {meta:{changes:0}};
              user.password_hash=hash;
              user.password_salt=salt;
              user.password_scheme=scheme;
              user.updated_at=new Date().toISOString();
              return {meta:{changes:1}};
            }
            if(normalized.startsWith('DELETE FROM admin_sessions WHERE expires_at<=')){
              const cutoff=Number(args[0]);
              let changes=0;
              for(const [key,row] of [...db.sessions.entries()]){
                if(Number(row.expires_at)<=cutoff){db.sessions.delete(key);changes++;}
              }
              return {meta:{changes}};
            }
            if(normalized.startsWith('INSERT INTO admin_sessions')){
              db.sessions.set(args[0],{user_id:args[1],expires_at:Number(args[2])});
              return {meta:{changes:1}};
            }
            throw new Error('Unhandled FakeD1 run SQL: '+normalized);
          }
        };
      }
    };
  }
}

async function legacyUser(email='legacy@example.com'){
  const salt=passwordSalt();
  return {
    id:'legacy-1',email,
    password_hash:await passwordVerifier(LEGACY_INPUT,salt,PEPPER),
    password_salt:salt,password_scheme:LEGACY_PASSWORD_SCHEME,
    role:'owner',active:1
  };
}

async function modernUser(email='modern@example.com'){
  const record=await createTargetPasswordRecord(MODERN_INPUT,PEPPER);
  return {id:'modern-1',email,...record,role:'owner',active:1};
}

function request(email,password,{origin=ORIGIN,ip='203.0.113.10',remember=false}={}){
  return new Request(ORIGIN+'/api/auth/login',{
    method:'POST',
    headers:{'Content-Type':'application/json','Origin':origin,'CF-Connecting-IP':ip},
    body:JSON.stringify({email,password,remember})
  });
}

async function runLogin(db,email,password,options={}){
  return loginHandler({
    request:request(email,password,options),
    env:{STATS_DB:db,AUTH_PEPPER:options.pepper===undefined?PEPPER:options.pepper}
  });
}

// Legacy credential succeeds, creates a session, and transparently upgrades.
{
  const user=await legacyUser();
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,LEGACY_INPUT);
  assert.equal(response.status,200);
  assert.match(response.headers.get('Set-Cookie')||'',/HttpOnly; Secure; SameSite=Strict/);
  assert.equal(db.sessions.size,1);
  assert.equal(db.users.get(user.email).password_scheme,TARGET_PASSWORD_SCHEME);
  assert.equal(db.upgradeWrites,1);
}

// Current PBKDF2 credential succeeds without rewriting the verifier.
{
  const user=await modernUser();
  const originalHash=user.password_hash;
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,MODERN_INPUT);
  assert.equal(response.status,200);
  assert.equal(db.sessions.size,1);
  assert.equal(db.users.get(user.email).password_hash,originalHash);
  assert.equal(db.upgradeWrites,0);
}

// Wrong password is a 401 and never creates a session or upgrades credentials.
{
  const user=await modernUser('wrong@example.com');
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,'Wrong-password-9999!');
  assert.equal(response.status,401);
  assert.equal(db.sessions.size,0);
  assert.equal(db.upgradeWrites,0);
}

// A failed transparent legacy upgrade must not block an otherwise valid login.
{
  const user=await legacyUser('deferred@example.com');
  const db=new FakeD1([user]);
  db.failUpgrade=true;
  const response=await runLogin(db,user.email,LEGACY_INPUT);
  assert.equal(response.status,200);
  assert.equal(db.sessions.size,1);
  assert.equal(db.users.get(user.email).password_scheme,LEGACY_PASSWORD_SCHEME);
  assert.equal(db.upgradeWrites,1);
}

// Existing rate-limit state is enforced before password verification.
{
  const user=await legacyUser('limited@example.com');
  const db=new FakeD1([user]);
  const ip='203.0.113.77';
  const rateKey=await sha256(ip+'|'+user.email+'|'+PEPPER);
  db.loginRate.set(rateKey,{window_started:Math.floor(Date.now()/1000),attempts:8});
  const response=await runLogin(db,user.email,LEGACY_INPUT,{ip});
  assert.equal(response.status,429);
  assert.equal(response.headers.get('Retry-After'),'600');
  assert.equal(db.sessions.size,0);
}

// Unsupported/corrupt credential schemes fail closed without leaking account existence.
{
  const user=await legacyUser('scheme@example.com');
  user.password_scheme='future-scheme';
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,LEGACY_INPUT);
  assert.equal(response.status,401);
  const body=await response.json();
  assert.equal(body.error,'invalid_credentials');
}

// Missing auth configuration fails closed.
{
  const user=await legacyUser('config@example.com');
  const db=new FakeD1([user]);
  const response=await loginHandler({
    request:request(user.email,LEGACY_INPUT),
    env:{STATS_DB:db,AUTH_PEPPER:''}
  });
  assert.equal(response.status,503);
  assert.equal(db.sessions.size,0);
}



// Password-length boundaries accepted by the login contract remain covered.
{
  const input='A'.repeat(16);
  const record=await createTargetPasswordRecord(input,PEPPER);
  const user={id:'boundary-16',email:'boundary16@example.com',...record,role:'admin',active:1};
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,input,{ip:'203.0.113.81'});
  assert.equal(response.status,200);
}
{
  const input='B'.repeat(128);
  const record=await createTargetPasswordRecord(input,PEPPER);
  const user={id:'boundary-128',email:'boundary128@example.com',...record,role:'admin',active:1};
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,input,{ip:'203.0.113.82'});
  assert.equal(response.status,200);
}
{
  const tooShort='C'.repeat(15);
  const db=new FakeD1([]);
  const response=await runLogin(db,'short@example.com',tooShort,{ip:'203.0.113.83'});
  assert.equal(response.status,401);
}
{
  const tooLong='D'.repeat(129);
  const db=new FakeD1([]);
  const response=await runLogin(db,'long@example.com',tooLong,{ip:'203.0.113.84'});
  assert.equal(response.status,401);
}

// Unicode passwords round-trip through the target verifier and real login handler.
{
  const input='Contraseña-🔐-Segura-2026!';
  const record=await createTargetPasswordRecord(input,PEPPER);
  const user={id:'unicode-1',email:'unicode@example.com',...record,role:'admin',active:1};
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,input,{ip:'203.0.113.85'});
  assert.equal(response.status,200);
}

// H2 regression: malformed cookie encoding must fail closed without a server error.
{
  const malformed='mpdgi_stats_session=%E0%A4%A';
  const badCookieRequest=new Request(ORIGIN+'/',{headers:{Cookie:malformed}});
  assert.equal(getCookie(badCookieRequest,'mpdgi_stats_session'),'');
  assert.equal(getCookie(new Request(ORIGIN+'/',{headers:{Cookie:'mpdgi_stats_session=ok%3Dvalue'}}),'mpdgi_stats_session'),'ok=value');
  for(const [route,handler] of [
    ['/api/dashboard',dashboardHandler],
    ['/api/campaigns',campaignsHandler],
    ['/api/export',exportHandler],
    ['/api/auth/session',sessionHandler]
  ]){
    const response=await handler({
      request:new Request(ORIGIN+route,{headers:{Cookie:malformed}}),
      env:{STATS_DB:{}}
    });
    assert.equal(response.status,401,route+' must reject malformed cookies with 401');
    assert.deepEqual(await response.json(),{error:'unauthorized'});
  }
}

// S5: atomic reservation enforces exactly eight admits under concurrency.
{
  const db=new FakeD1([]);
  const results=await Promise.all(Array.from({length:20},()=>
    reserveLoginAttempt(db,'test-atomic-pair',1000,600,8)
  ));
  assert.equal(results.filter(Boolean).length,8);
  assert.equal(results.filter(value=>!value).length,12);
  assert.equal(db.loginRate.get('test-atomic-pair').attempts,8);
  assert.equal(await reserveLoginAttempt(db,'test-atomic-pair',1600,600,8),true);
  assert.equal(db.loginRate.get('test-atomic-pair').attempts,1);
}
// S5: IP budget blocks an attacker cycling email addresses before KDF.
{
  const ip='203.0.113.90',db=new FakeD1([]);
  const ipKey=await sha256('login-ip|'+ip+'|'+PEPPER);
  db.loginRate.set(ipKey,{window_started:Math.floor(Date.now()/1000),attempts:30});
  const response=await runLogin(db,'unrelated@example.com','Unknown-password-1234!',{ip});
  assert.equal(response.status,429);
  assert.equal(db.loginRate.size,1,'blocked IP must not write other rate keys');
}
// S5: Email budget blocks an attacker cycling IP addresses.
{
  const email='target@example.com',db=new FakeD1([]);
  const emailKey=await sha256('login-email|'+email+'|'+PEPPER);
  db.loginRate.set(emailKey,{window_started:Math.floor(Date.now()/1000),attempts:60});
  const response=await runLogin(db,email,'Unknown-password-1234!',{ip:'203.0.113.91'});
  assert.equal(response.status,429);
}
// S4: absent accounts fail generically, including after a hypothetical pepper change.
{
  const db=new FakeD1([]);
  const response=await runLogin(db,'absent@example.com','Unknown-password-1234!',{ip:'203.0.113.92'});
  assert.equal(response.status,401);
  assert.equal((await response.json()).error,'invalid_credentials');
  const withOtherPepper=await runLogin(db,'absent@example.com','Unknown-password-1234!',{ip:'203.0.113.93',pepper:'different-pepper'});
  assert.equal(withOtherPepper.status,401);
  assert.equal(db.sessions.size,0);
}
// S4: malformed credential JSON is rejected as invalid credentials, never 500.
{
  const db=new FakeD1([]);
  for(const body of [
    {email:{toString:1,valueOf:1},password:'A'.repeat(20)},
    {email:'absent@example.com',password:{toString:1,valueOf:1}},
    null
  ]){
    const response=await loginHandler({
      request:new Request(ORIGIN+'/api/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/json',Origin:ORIGIN},
        body:JSON.stringify(body)
      }),
      env:{STATS_DB:db,AUTH_PEPPER:PEPPER}
    });
    assert.equal(response.status,401);
  }
}

console.log('MPDGI Stats auth integration validation passed');
