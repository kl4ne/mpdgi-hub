import assert from 'node:assert/strict';
import {onRequest as loginHandler} from '../functions/api/auth/login.js';
import {
  passwordSalt,passwordVerifier,createTargetPasswordRecord,sha256,
  LEGACY_PASSWORD_SCHEME,TARGET_PASSWORD_SCHEME
} from '../functions/_lib/auth.js';

const ORIGIN='https://stats.test';
const PEPPER='integration-test-pepper';
const LEGACY_PASSWORD='Legacy-password-1234!';
const MODERN_PASSWORD='Modern-password-1234!';

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
            if(normalized.startsWith('INSERT INTO login_rate')){
              db.loginRate.set(args[0],{window_started:Number(args[1]),attempts:1});
              return {meta:{changes:1}};
            }
            if(normalized.startsWith('UPDATE login_rate SET attempts=attempts+1')){
              const row=db.loginRate.get(args[0]);
              if(row)row.attempts=Number(row.attempts)+1;
              return {meta:{changes:row?1:0}};
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
    password_hash:await passwordVerifier(LEGACY_PASSWORD,salt,PEPPER),
    password_salt:salt,password_scheme:LEGACY_PASSWORD_SCHEME,
    role:'owner',active:1
  };
}

async function modernUser(email='modern@example.com'){
  const record=await createTargetPasswordRecord(MODERN_PASSWORD,PEPPER);
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
  const response=await runLogin(db,user.email,LEGACY_PASSWORD);
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
  const response=await runLogin(db,user.email,MODERN_PASSWORD);
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
  const response=await runLogin(db,user.email,LEGACY_PASSWORD);
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
  const response=await runLogin(db,user.email,LEGACY_PASSWORD,{ip});
  assert.equal(response.status,429);
  assert.equal(response.headers.get('Retry-After'),'600');
  assert.equal(db.sessions.size,0);
}

// Unsupported/corrupt credential scheme is a service failure, not a false invalid-password response.
{
  const user=await legacyUser('scheme@example.com');
  user.password_scheme='future-scheme';
  const db=new FakeD1([user]);
  const response=await runLogin(db,user.email,LEGACY_PASSWORD);
  assert.equal(response.status,503);
  const body=await response.json();
  assert.equal(body.error,'unsupported_password_scheme');
}

// Missing auth configuration fails closed.
{
  const user=await legacyUser('config@example.com');
  const db=new FakeD1([user]);
  const response=await loginHandler({
    request:request(user.email,LEGACY_PASSWORD),
    env:{STATS_DB:db,AUTH_PEPPER:''}
  });
  assert.equal(response.status,503);
  assert.equal(db.sessions.size,0);
}

console.log('MPDGI Stats auth integration validation passed');
