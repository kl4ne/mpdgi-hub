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
const VIEWER_INPUT='Viewer-local-password-1234!';

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
  const viewer=await createTargetPasswordRecord(VIEWER_INPUT,PEPPER);

  const seed=[
    `INSERT INTO admin_users(id,email,password_hash,password_salt,password_scheme,role,active) VALUES(
      'modern-local','modern@example.test',${sql(modern.password_hash)},${sql(modern.password_salt)},${sql(modern.password_scheme)},'owner',1
    );`,
    `INSERT INTO admin_users(id,email,password_hash,password_salt,password_scheme,role,active) VALUES(
      'legacy-local','legacy@example.test',${sql(legacyHash)},${sql(legacySalt)},${sql(LEGACY_PASSWORD_SCHEME)},'admin',1
    );`,
    `INSERT INTO admin_users(id,email,password_hash,password_salt,password_scheme,role,active) VALUES(
      'viewer-local','viewer@example.test',${sql(viewer.password_hash)},${sql(viewer.password_salt)},${sql(viewer.password_scheme)},'viewer',1
    );
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
  detached:process.platform!=='win32',
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


  // S1 real Pages Function + local D1: adversarial JSON must yield 400, not 500.
  for(const raw of [
    '{"schema_version":1,"event_id":{"toString":1,"valueOf":1}}',
    '{"schema_version":{"toString":1,"valueOf":1}}'
  ]){
    const response=await fetch(BASE+'/api/collect',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Origin':'https://hub.mpdgi.org',
        'User-Agent':'Mozilla/5.0',
        'CF-Connecting-IP':'203.0.113.211'
      },
      body:raw,
      signal:AbortSignal.timeout(10000)
    });
    assert.equal(response.status,400,'hostile Collector input must not cause HTTP 500');
  }


  // S6: Hub-origin spoofing cannot contaminate Digital Card reporting.
  const cardPayload={
    schema_version:1,
    event_id:'a1111111-1111-4111-8111-111111111111',
    visitor_id:'b2222222-2222-4222-8222-222222222222',
    session_id:'c3333333-3333-4333-8333-333333333333',
    event_type:'page_view',
    acquisition_source:'nfc',
    acquisition_campaign:'',
    session_campaign:'',
    session_entry:'nfc',
    display_mode:'browser',
    language:'es',
    app_version:'1.4.10',
    device_category:'mobile',
    browser:'chrome',
    action_name:'',
    target:'business_card:ruben-suarez',
    client_ts:''
  };
  const postCollector=(origin,event,ip)=>fetch(BASE+'/api/collect',{
    method:'POST',
    headers:{'Content-Type':'application/json','Origin':origin,'User-Agent':'Mozilla/5.0','CF-Connecting-IP':ip},
    body:JSON.stringify(event),
    signal:AbortSignal.timeout(10000)
  });
  {
    const blocked=await postCollector('https://hub.mpdgi.org',cardPayload,'203.0.113.212');
    assert.equal(blocked.status,400,'Hub-origin Digital Card target must be rejected');
    assert.equal((await blocked.json()).error,'invalid_target');
  }
  {
    const accepted=await postCollector('https://rscard.mpdgi.org',cardPayload,'203.0.113.213');
    assert.equal(accepted.status,204,'legitimate Digital Card origin must continue working');
  }
  {
    const hubEvent={
      ...cardPayload,
      event_id:'d4444444-4444-4444-8444-444444444444',
      visitor_id:'e5555555-5555-4555-8555-555555555555',
      session_id:'f6666666-6666-4666-8666-666666666666',
      target:'https://mpdgi.org/'
    };
    const accepted=await postCollector('https://hub.mpdgi.org',hubEvent,'203.0.113.214');
    assert.equal(accepted.status,204,'legitimate Hub events must continue working');
  }

  // S4/S5 real Pages+D1: concurrent unknown-account attempts must be
  // reserved atomically; at most eight get through per IP/email pair.
  {
    const ip='203.0.113.76';
    const responses=await Promise.all(Array.from({length:12},()=>login(
      'unknown-concurrent@example.test','Wrong-concurrent-password-2026!',ip
    )));
    const statuses=responses.map(response=>response.status);
    assert.equal(statuses.filter(code=>code===401).length,8,'eight attempts admitted');
    assert.equal(statuses.filter(code=>code===429).length,4,'four attempts denied before KDF');
  }

  // S4: unknown users present the same status/body as a wrong password.
  {
    const response=await login('unregistered@example.test','Wrong-password-123456789!','203.0.113.77');
    assert.equal(response.status,401);
    assert.equal((await response.json()).error,'invalid_credentials');
    assert.equal(response.headers.get('set-cookie'),null);
  }


  // Phase 4: isolated local D1 API authentication and malformed-cookie checks.
  for(const endpoint of ['/api/auth/session','/api/dashboard','/api/campaigns','/api/export']){
    const response=await fetch(BASE+endpoint,{signal:AbortSignal.timeout(10000)});
    assert.equal(response.status,401,endpoint+' must reject anonymous GET');
    assert.equal((await response.json()).error,'unauthorized');
    const malformed=await fetch(BASE+endpoint,{
      headers:{Cookie:'mpdgi_stats_session=%E0%A4%A'},
      signal:AbortSignal.timeout(10000)
    });
    assert.equal(malformed.status,401,endpoint+' must reject malformed cookies');
  }

  const ownerResponse=await login('modern@example.test',MODERN_INPUT,'203.0.113.101');
  assert.equal(ownerResponse.status,200);
  const ownerCookie=cookiePair(ownerResponse);
  const signedInHeaders={Cookie:ownerCookie};

  // Real D1 reporting and CSV, not mocked browser responses.
  const liveDashboard=await fetch(BASE+'/api/dashboard',{headers:signedInHeaders});
  assert.equal(liveDashboard.status,200);
  const liveReport=await liveDashboard.json();
  assert.equal(typeof liveReport.summary.visits,'number');
  assert.ok(Array.isArray(liveReport.digital_cards));
  assert.ok(liveReport.digital_cards.some(card=>card.card_id==='ruben-suarez'));

  const csvResponse=await fetch(BASE+'/api/export',{headers:signedInHeaders});
  assert.equal(csvResponse.status,200);
  assert.match(csvResponse.headers.get('content-type')||'',/^text\/csv/);
  assert.match((await csvResponse.text()).slice(0,40),/^Section,Category,Value/);


  // Phase 4: exercise actual campaign authorization and input handling.
  const postCampaign=(cookie,body,origin=BASE)=>fetch(BASE+'/api/campaigns',{
    method:'POST',
    headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},
    body:typeof body==='string'?body:JSON.stringify(body),
    signal:AbortSignal.timeout(10000)
  });
  const candidate={name:'Phase Four Review',slug:'phase-four-review',source:'qr'};
  assert.equal((await postCampaign(null,candidate)).status,401);
  assert.equal((await postCampaign(ownerCookie,candidate,'https://example.invalid')).status,403);

  for(const invalidBody of [
    'null','[]','5',
    '{"name":{"toString":1},"source":"qr"}',
    '{"name":"Valid Name","source":{"toString":1}}',
    '{"name":"Valid Name","source":"qr","slug":{"toString":1}}'
  ]){
    const response=await postCampaign(ownerCookie,invalidBody);
    assert.equal(response.status,400,'malformed campaign fields must not cause 500');
  }
  {
    const response=await postCampaign(ownerCookie,candidate);
    assert.equal(response.status,201);
    const created=await response.json();
    assert.equal(created.campaign.slug,candidate.slug);
    const repeated=await postCampaign(ownerCookie,candidate);
    assert.equal(repeated.status,200);
    assert.equal((await repeated.json()).created,false);
    const list=await fetch(BASE+'/api/campaigns',{headers:signedInHeaders});
    assert.equal(list.status,200);
    assert.ok((await list.json()).campaigns.some(c=>c.slug===candidate.slug));
  }

  // S7: read-only viewer can read but cannot modify campaigns.
  {
    const viewerResponse=await login('viewer@example.test',VIEWER_INPUT,'203.0.113.105');
    assert.equal(viewerResponse.status,200);
    const viewerCookie=cookiePair(viewerResponse);
    assert.equal((await verifySession(viewerCookie)).user.role,'viewer');
    assert.equal((await postCampaign(viewerCookie,{
      name:'Viewer Must Not Save',slug:'viewer-must-not-save',source:'link'
    })).status,403);
    assert.equal((await fetch(BASE+'/api/campaigns',{
      headers:{Cookie:viewerCookie}
    })).status,200);
  }

  // Session revocation must remove the actual local D1 session.
  {
    const response=await fetch(BASE+'/api/auth/logout',{
      method:'POST',headers:{Cookie:ownerCookie,Origin:BASE},
      signal:AbortSignal.timeout(10000)
    });
    assert.equal(response.status,200);
    assert.match(response.headers.get('set-cookie')||'',/Max-Age=0/);
    assert.equal((await fetch(BASE+'/api/auth/session',{
      headers:{Cookie:ownerCookie}
    })).status,401);
    assert.equal((await fetch(BASE+'/api/dashboard',{
      headers:{Cookie:ownerCookie}
    })).status,401);
  }

  console.log('MPDGI Stats real Pages + local D1 auth E2E passed');
}finally{
  const stop=signal=>{
    try{
      if(process.platform!=='win32')process.kill(-server.pid,signal);
      else server.kill(signal);
    }catch{
      try{server.kill(signal);}catch{}
    }
  };
  stop('SIGTERM');
  await Promise.race([
    new Promise(resolve=>server.once('exit',resolve)),
    new Promise(resolve=>setTimeout(resolve,3000))
  ]);
  if(server.exitCode===null)stop('SIGKILL');
  try{unlinkSync(PAGES_CONFIG);}catch{}
  if(process.env.CI&&serverOutput)process.stdout.write(serverOutput);
}
