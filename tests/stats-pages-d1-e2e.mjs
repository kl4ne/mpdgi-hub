import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {writeFileSync,unlinkSync} from 'node:fs';
import {createTargetPasswordRecord,passwordSalt,passwordVerifier,LEGACY_PASSWORD_SCHEME} from '../functions/_lib/auth.js';

const WRANGLER=['--yes','wrangler@4.147.0'];
const CONFIG='wrangler.test.toml';
const PAGES_CONFIG='wrangler.jsonc';
const DB='mpdgi-stats-test';
const BASE='http://127.0.0.1:8788';
const PEPPER='local-pages-d1-integration-pepper';
const MODERN_INPUT='Modern-local-password-1234!';
const LEGACY_INPUT='Legacy-local-password-1234!';

function runWrangler(args,{capture=false}={}){
  const result=spawnSync('npx',[...WRANGLER,...args],{
    encoding:'utf8',
    stdio:capture?'pipe':'inherit',
    env:{...process.env,WRANGLER_SEND_METRICS:'false'}
  });
  if(result.status!==0){
    if(capture){
      process.stderr.write(result.stdout||'');
      process.stderr.write(result.stderr||'');
    }
    throw new Error('Wrangler command failed: '+args.join(' '));
  }
  return result;
}

function sql(value){
  return "'"+String(value).replaceAll("'","''")+"'";
}

async function prepareLocalD1(){
  for(const file of ['migrations/0001_initial.sql','migrations/0002_campaigns.sql','migrations/0003_collector_metrics.sql']){
    runWrangler(['d1','execute',DB,'--local','--config',CONFIG,'--file',file]);
  }

  const modern=await createTargetPasswordRecord(MODERN_INPUT,PEPPER);
  const legacySalt=passwordSalt();
  const legacyHash=await passwordVerifier(LEGACY_INPUT,legacySalt,PEPPER);

  const seed=[
    `INSERT INTO admin_users(id,email,password_hash,password_salt,password_scheme,role,active) VALUES(
      'modern-local','modern@example.test',${sql(modern.password_hash)},${sql(modern.password_salt)},${sql(modern.password_scheme)},'owner',1
    );`,
    `INSERT INTO admin_users(id,email,password_hash,password_salt,password_scheme,role,active) VALUES(
      'legacy-local','legacy@example.test',${sql(legacyHash)},${sql(legacySalt)},${sql(LEGACY_PASSWORD_SCHEME)},'admin',1
    );`
  ].join('\n');

  runWrangler(['d1','execute',DB,'--local','--config',CONFIG,'--command',seed]);
}

async function waitUntilReady(){
  const deadline=Date.now()+30000;
  let lastError;
  while(Date.now()<deadline){
    try{
      const response=await fetch(BASE+'/',{cache:'no-store',signal:AbortSignal.timeout(5000)});
      if(response.ok)return;
    }catch(error){lastError=error;}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  throw new Error('Local Pages dev did not become ready'+(lastError?': '+lastError.message:''));
}

async function login(email,password,ip='203.0.113.10'){
  return fetch(BASE+'/api/auth/login',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Origin':BASE,
      'CF-Connecting-IP':ip
    },
    body:JSON.stringify({email,password,remember:false}),
    signal:AbortSignal.timeout(10000)
  });
}

function cookiePair(response){
  const raw=response.headers.get('set-cookie')||'';
  const pair=raw.split(';')[0];
  assert.match(pair,/^mpdgi_stats_session=[^;]+$/);
  return pair;
}

async function verifySession(cookie){
  const response=await fetch(BASE+'/api/auth/session',{
    headers:{Cookie:cookie,'Origin':BASE},
    cache:'no-store',
    signal:AbortSignal.timeout(5000)
  });
  assert.equal(response.status,200);
  const body=await response.json();
  assert.equal(body.authenticated,true);
  return body;
}

await prepareLocalD1();

// Pages dev requires the standard Wrangler config filename. Generate this
// local-only file at test time so no fake database ID can affect deployment.
writeFileSync(PAGES_CONFIG,JSON.stringify({
  name:'mpdgi-stats-local-test',
  compatibility_date:'2026-09-29',
  pages_build_output_dir:'public',
  d1_databases:[{
    binding:'STATS_DB',
    database_name:DB,
    database_id:'00000000-0000-0000-0000-000000000001',
    preview_database_id:'STATS_DB'
  }]
},null,2));

const server=spawn('npx',[
  ...WRANGLER,'pages','dev',
  '--ip','127.0.0.1',
  '--port','8788',
  '--binding','AUTH_PEPPER='+PEPPER
],{
  stdio:['ignore','pipe','pipe'],
  env:{...process.env,WRANGLER_SEND_METRICS:'false'}
});

let serverOutput='';
server.stdout.on('data',chunk=>{serverOutput+=String(chunk);});
server.stderr.on('data',chunk=>{serverOutput+=String(chunk);});

try{
  await waitUntilReady();

  // Modern PBKDF2 login exercises the real Pages Function + local D1 binding.
  {
    const response=await login('modern@example.test',MODERN_INPUT,'203.0.113.11');
    assert.equal(response.status,200);
    const cookie=cookiePair(response);
    const session=await verifySession(cookie);
    assert.equal(session.user.email,'modern@example.test');
    assert.equal(session.user.role,'owner');
  }

  // Legacy login succeeds through the real D1 binding and leaves a usable session.
  {
    const response=await login('legacy@example.test',LEGACY_INPUT,'203.0.113.12');
    assert.equal(response.status,200);
    const cookie=cookiePair(response);
    const session=await verifySession(cookie);
    assert.equal(session.user.email,'legacy@example.test');
    assert.equal(session.user.role,'admin');
  }

  // Wrong password is rejected and never produces a session cookie.
  {
    const response=await login('modern@example.test','Definitely-wrong-password-9999!','203.0.113.13');
    assert.equal(response.status,401);
    assert.equal(response.headers.get('set-cookie'),null);
    const body=await response.json();
    assert.equal(body.error,'invalid_credentials');
  }

  // The ninth attempt in the same rate window is blocked.
  {
    const ip='203.0.113.14';
    for(let attempt=0;attempt<8;attempt++){
      const response=await login('modern@example.test','Wrong-rate-password-9999!',ip);
      assert.equal(response.status,401);
    }
    const blocked=await login('modern@example.test','Wrong-rate-password-9999!',ip);
    assert.equal(blocked.status,429);
    assert.equal(blocked.headers.get('retry-after'),'600');
  }

  console.log('MPDGI Stats real Pages + local D1 auth E2E passed');
}finally{
  server.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve=>server.once('exit',resolve)),
    new Promise(resolve=>setTimeout(resolve,3000))
  ]);
  if(server.exitCode===null)server.kill('SIGKILL');
  try{unlinkSync(PAGES_CONFIG);}catch{}
  if(process.env.CI&&serverOutput)process.stdout.write(serverOutput);
}
