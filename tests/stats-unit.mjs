import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEvent,validateCollectorIdentity,isLikelyBot,easternDay} from '../functions/_lib/validation.js';
import {resolveRange,completeDigitalCards} from '../functions/_lib/reporting.js';
import {onRequest as collectHandler} from '../functions/api/collect.js';
import {randomToken,sha256,passwordSalt,passwordVerifier,pbkdf2PasswordVerifier,parsePbkdf2Verifier,createTargetPasswordRecord,verifyPasswordRecord,maybeUpgradePasswordRecord,PBKDF2_ITERATIONS,LEGACY_PASSWORD_SCHEME,TARGET_PASSWORD_SCHEME,PASSWORD_SCHEME,constantTimeEqual} from '../functions/_lib/auth.js';

const valid={
  schema_version:1,
  event_id:'11111111-1111-4111-8111-111111111111',
  visitor_id:'22222222-2222-4222-8222-222222222222',
  session_id:'33333333-3333-4333-8333-333333333333',
  event_type:'session_start',
  acquisition_source:'nfc',
  acquisition_campaign:'credential-test',
  session_campaign:'leaders-meeting',
  session_entry:'nfc',
  display_mode:'browser',
  language:'es',
  app_version:'1.5.0',
  device_category:'mobile',
  browser:'safari',
  action_name:'',
  target:'',
  client_ts:'2026-09-29T15:00:00.000Z'
};
assert.equal(validateEvent(valid).ok,true);
assert.equal(validateEvent(valid).event.session_campaign,'leaders-meeting');
assert.equal(validateEvent({...valid,acquisition_source:'magic'}).ok,false);
assert.equal(validateEvent({...valid,event_type:'action',action_name:''}).ok,false);
assert.deepEqual(validateCollectorIdentity('https://rscard.mpdgi.org',{...valid,target:'business_card:ruben-suarez'}),{ok:true});
assert.equal(validateCollectorIdentity('https://rscard.mpdgi.org',{...valid,target:'business_card:nancy-pagan'}).error,'invalid_target');
assert.deepEqual(validateCollectorIdentity('https://rmcard.pages.dev',{...valid,target:'business_card:roberto-macfie'}),{ok:true});
assert.equal(validateCollectorIdentity('https://rmcard.pages.dev',{...valid,target:'business_card:ruben-suarez'}).error,'invalid_target');
assert.equal(validateCollectorIdentity('https://rmcard.pages.dev',{...valid,target:'business_card:nancy-pagan'}).error,'invalid_target');
assert.equal(validateCollectorIdentity('https://npcard.mpdgi.org',{...valid,target:'business_card:roberto-macfie'}).error,'invalid_target');
assert.equal(validateCollectorIdentity('https://rmcard.pages.dev',{...valid,target:'business_card:roberto-macfie',event_type:'action',action_name:'bc_save_contact'}).ok,true);
assert.equal(validateCollectorIdentity('https://rmcard.pages.dev',{...valid,target:'business_card:roberto-macfie',event_type:'action',action_name:'unauthorized_action'}).error,'invalid_action');
assert.equal(validateCollectorIdentity('https://npcard.pages.dev',{...valid,event_type:'action',action_name:'bc_call',target:'business_card:nancy-pagan'}).ok,true);
assert.equal(validateCollectorIdentity('https://npcard.mpdgi.org',{...valid,event_type:'action',action_name:'unknown_action',target:'business_card:nancy-pagan'}).error,'invalid_action');
assert.equal(validateCollectorIdentity('https://hub.mpdgi.org',{...valid,target:'https://mpdgi.org/'}).ok,true);
// S6: Hub, or any unmapped origin, cannot forge reserved Digital Card targets.
for(const target of ['business_card:ruben-suarez','business_card:nancy-pagan','business_card:roberto-macfie']){
  assert.equal(validateCollectorIdentity('https://hub.mpdgi.org',{...valid,target}).error,'invalid_target');
  assert.equal(validateCollectorIdentity('https://unknown.test',{...valid,target}).error,'invalid_target');
}
assert.equal(validateCollectorIdentity('https://rscard.mpdgi.org',{...valid,target:'business_card:ruben-suarez'}).ok,true);
assert.equal(validateCollectorIdentity('https://npcard.mpdgi.org',{...valid,target:'business_card:nancy-pagan'}).ok,true);
assert.equal(validateCollectorIdentity('https://hub.mpdgi.org',{...valid,target:'link:facebook'}).ok,true);
assert.equal(isLikelyBot('Mozilla/5.0 HeadlessChrome Lighthouse'),true);
assert.equal(isLikelyBot('Mozilla/5.0 (Linux; Android 15) Chrome/130 Mobile Safari/537.36 WhatsApp/2.26'),false,
  'real WhatsApp in-app browsers must be counted as human visitors');
assert.equal(isLikelyBot('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) WhatsApp/2.26 Mobile Safari/604.1'),false);
assert.equal(isLikelyBot('facebookexternalhit/1.1'),true,'social preview crawler remains blocked');
assert.equal(isLikelyBot('Discordbot/2.0'),true,'unfurl bot remains blocked');
assert.equal(isLikelyBot('Mozilla/5.0 iPhone Version/26.0 Mobile Safari/605.1.15'),false);
assert.equal(easternDay(new Date('2026-09-29T16:00:00Z')),'2026-09-29');


// S1: JSON-compatible hostile values may not trigger coercion exceptions.
for(const body of [
  '{"schema_version":1,"event_id":{"toString":1,"valueOf":1}}',
  '{"schema_version":{"toString":1,"valueOf":1}}',
  '{"schema_version":1,"visitor_id":[{"toString":1}]}',
  '[]','null','5'
]){
  let result;
  assert.doesNotThrow(()=>{result=validateEvent(JSON.parse(body));},'unsafe coercion: '+body);
  assert.equal(result.ok,false,'hostile payload must be rejected: '+body);
}

// S2: even an invalid JSON request must be dropped before ALL writes if its
// source has already reached the per-IP budget.
const cappedDb={
  prepare(sql){
    assert.match(sql,/^SELECT event_count FROM collector_rate WHERE rate_key=\?/,'must read rate before writing anything');
    return {bind:()=>({first:async()=>({event_count:200})})};
  }
};
const blockedCollector=await collectHandler({
  request:new Request('https://stats.test/api/collect',{
    method:'POST',
    headers:{Origin:'https://hub.mpdgi.org','CF-Connecting-IP':'203.0.113.210','User-Agent':'Mozilla/5.0'},
    body:'{not-json'
  }),
  env:{STATS_DB:cappedDb,AUTH_PEPPER:'test-only-secret'}
});
assert.equal(blockedCollector.status,204,'rate-limited hostile traffic must not reach D1 metric writes');

// Active cards must not disappear when they register zero visits in a range.
const emptyCards=completeDigitalCards([]);
assert.deepEqual(emptyCards.map(card=>card.card_id),['ruben-suarez','nancy-pagan','roberto-macfie']);
for(const card of emptyCards){
  for(const field of ['sessions','visitors','opens','nfc_sessions','qr_sessions','save_contact','website'])
    assert.equal(card[field],0,'empty '+card.card_id+' must have zero '+field);
  assert.equal(card.last_activity_at,null);
}
const mixedCards=completeDigitalCards([
  {card_id:'nancy-pagan',sessions:12,visitors:10,nfc_sessions:9,qr_sessions:3,save_contact:5,last_activity_at:'2026-10-01T15:00:00Z'},
  {card_id:'future-card',sessions:2,visitors:1}
]);
assert.deepEqual(mixedCards.map(card=>card.card_id),[
  'ruben-suarez','nancy-pagan','roberto-macfie','future-card'
]);
assert.equal(mixedCards[0].sessions,0);
assert.equal(mixedCards[1].sessions,12);
assert.equal(mixedCards[1].save_contact,5);
assert.equal(mixedCards[1].qr_sessions,3);
assert.equal(mixedCards[2].qr_sessions,0);
assert.equal(mixedCards[2].sessions,0);
assert.equal(mixedCards[3].sessions,2);
assert.equal(completeDigitalCards(mixedCards).length,4,'fixed catalog does not duplicate existing cards');

const range=resolveRange('https://stats.mpdgi.org/api/dashboard?from=2026-09-01&to=2026-09-29');
assert.equal(range.from,'2026-09-01');
assert.equal(range.to,'2026-09-29');
assert.equal(range.days,29);
assert.equal(range.previous_to,'2026-08-31');

const monthRange=resolveRange('https://stats.mpdgi.org/api/dashboard?preset=month');
assert.match(monthRange.from,/^\d{4}-\d{2}-01$/);
assert.ok(monthRange.days>=1&&monthRange.days<=31);

const yearRange=resolveRange('https://stats.mpdgi.org/api/dashboard?preset=year');
assert.match(yearRange.from,/^\d{4}-01-01$/);
assert.ok(yearRange.days>=1&&yearRange.days<=366);

const token=randomToken(32),salt=passwordSalt();
assert.ok(token.length>30&&salt.length>15);
const verifier=await passwordVerifier('A-very-long-demo-password!',salt,'server-side-test-pepper');
assert.equal(constantTimeEqual(verifier,await passwordVerifier('A-very-long-demo-password!',salt,'server-side-test-pepper')),true);
assert.equal(constantTimeEqual(verifier,await passwordVerifier('different-password-value',salt,'server-side-test-pepper')),false);
assert.notEqual(await sha256('a'),await sha256('b'));

assert.equal(PASSWORD_SCHEME,TARGET_PASSWORD_SCHEME,'new password records must use the PBKDF2 target scheme');
assert.equal(TARGET_PASSWORD_SCHEME,'pbkdf2-sha256-v1');
assert.equal(PBKDF2_ITERATIONS,600000);

const pbkdf2Salt=passwordSalt();
const modernVerifier=await pbkdf2PasswordVerifier('Contraseña-segura-🔐-demo!',pbkdf2Salt,'server-side-test-pepper');
const parsed=parsePbkdf2Verifier(modernVerifier);
assert.equal(parsed.iterations,PBKDF2_ITERATIONS);
assert.ok(parsed.verifier.length>30);
assert.equal(
  constantTimeEqual(modernVerifier,await pbkdf2PasswordVerifier('Contraseña-segura-🔐-demo!',pbkdf2Salt,'server-side-test-pepper')),
  true
);
assert.equal(
  constantTimeEqual(modernVerifier,await pbkdf2PasswordVerifier('Contraseña-incorrecta-🔐',pbkdf2Salt,'server-side-test-pepper')),
  false
);
assert.equal(parsePbkdf2Verifier('garbage'),null);
assert.equal(parsePbkdf2Verifier('i=1$abc'),null);
assert.equal(parsePbkdf2Verifier(),null);

const legacyRecord={
  password_hash:await passwordVerifier('Legacy-password-1234!',pbkdf2Salt,'server-side-test-pepper'),
  password_salt:pbkdf2Salt,
  password_scheme:LEGACY_PASSWORD_SCHEME
};
assert.deepEqual(
  await verifyPasswordRecord('Legacy-password-1234!',legacyRecord,'server-side-test-pepper'),
  {ok:true,needsUpgrade:true,error:null}
);
assert.equal((await verifyPasswordRecord('wrong-password-1234!',legacyRecord,'server-side-test-pepper')).ok,false);

const targetRecord=await createTargetPasswordRecord('Modern-password-1234!','server-side-test-pepper');
assert.equal(targetRecord.password_scheme,TARGET_PASSWORD_SCHEME);
assert.deepEqual(
  await verifyPasswordRecord('Modern-password-1234!',targetRecord,'server-side-test-pepper'),
  {ok:true,needsUpgrade:false,error:null}
);
assert.equal((await verifyPasswordRecord('wrong-password-5678!',targetRecord,'server-side-test-pepper')).ok,false);
assert.equal(
  (await verifyPasswordRecord('Modern-password-1234!',{...targetRecord,password_hash:'malformed'},'server-side-test-pepper')).error,
  'invalid_password_record'
);
assert.equal(
  (await verifyPasswordRecord('anything',{...targetRecord,password_scheme:'future-scheme'},'server-side-test-pepper')).error,
  'unsupported_password_scheme'
);

const weakModernSalt=passwordSalt();
const weakModernRecord={
  password_hash:await pbkdf2PasswordVerifier('Modern-password-1234!',weakModernSalt,'server-side-test-pepper',100000),
  password_salt:weakModernSalt,
  password_scheme:TARGET_PASSWORD_SCHEME
};
assert.deepEqual(
  await verifyPasswordRecord('Modern-password-1234!',weakModernRecord,'server-side-test-pepper'),
  {ok:true,needsUpgrade:true,error:null}
);

const writes=[];
const fakeDb={
  prepare(sql){
    return {
      bind(...args){
        return {
          async run(){
            writes.push({sql,args});
            return {meta:{changes:1}};
          }
        };
      }
    };
  }
};
const verifiedLegacy=await verifyPasswordRecord('Legacy-password-1234!',legacyRecord,'server-side-test-pepper');
assert.equal(await maybeUpgradePasswordRecord(
  fakeDb,{id:'owner-1',...legacyRecord},'Legacy-password-1234!','server-side-test-pepper',verifiedLegacy
),true);
assert.equal(writes.length,1);
assert.match(writes[0].sql,/UPDATE admin_users SET password_hash=/);
assert.equal(writes[0].args[2],TARGET_PASSWORD_SCHEME);
assert.equal(writes[0].args[3],'owner-1');
assert.equal(writes[0].args[4],LEGACY_PASSWORD_SCHEME);

const failedLegacy=await verifyPasswordRecord('wrong-password-1234!',legacyRecord,'server-side-test-pepper');
assert.equal(await maybeUpgradePasswordRecord(
  fakeDb,{id:'owner-1',...legacyRecord},'wrong-password-1234!','server-side-test-pepper',failedLegacy
),false);
assert.equal(writes.length,1,'failed authentication must not mutate password fields');

const verifiedModern=await verifyPasswordRecord('Modern-password-1234!',targetRecord,'server-side-test-pepper');
assert.equal(await maybeUpgradePasswordRecord(
  fakeDb,{id:'owner-2',...targetRecord},'Modern-password-1234!','server-side-test-pepper',verifiedModern
),false);
assert.equal(writes.length,1,'current modern verifier must not be rewritten or downgraded');

const loginSource=readFileSync(new URL('../functions/api/auth/login.js',import.meta.url),'utf8');
assert.match(loginSource,/verifyPasswordRecord\(password,user,pepper\)/);
assert.match(loginSource,/reserveLoginAttempt\(context\.env\.STATS_DB,key,now,windowSeconds,limit\)/,'login rate reservations must precede password verification');
assert.match(loginSource,/equalizeMissingAccount\(password,pepper\)/,'missing-account KDF equalizer must remain enabled');
assert.match(loginSource,/maybeUpgradePasswordRecord\(context\.env\.STATS_DB,user,password,context\.env\.AUTH_PEPPER,verification\)/);
const bootstrapSource=readFileSync(new URL('../functions/api/auth/bootstrap.js',import.meta.url),'utf8');
assert.match(bootstrapSource,/createTargetPasswordRecord\(password,context\.env\.AUTH_PEPPER\)/);

console.log('MPDGI Stats unit validation passed');


const reportingSource=readFileSync(new URL('../functions/_lib/reporting.js',import.meta.url),'utf8');
const hubIsolationFilters=(reportingSource.match(/NOT LIKE 'business_card:%'/g)||[]).length;
assert.ok(hubIsolationFilters>=11,'Hub reporting must exclude business-card events from Hub-centric metrics');
assert.match(reportingSource,/target LIKE 'business_card:%'/,'Digital Cards reporting must keep its dedicated business-card query');
assert.match(reportingSource,/SELECT DISTINCT s\.session_id,s\.first_seen_at[\s\S]*?e\.target NOT LIKE 'business_card:%'/,'Activity insights must exclude Digital Card sessions');


const collectorSource=readFileSync(new URL('../functions/api/collect.js',import.meta.url),'utf8');
assert.match(
  collectorSource,
  /const canonicalSession=await context\.env\.STATS_DB\.prepare\([\s\S]*?SELECT visitor_id FROM sessions WHERE session_id=\?/,
  'Collector must re-read the canonical session after INSERT OR IGNORE'
);
assert.match(
  collectorSource,
  /if\(!canonicalSession\|\|String\(canonicalSession\.visitor_id\)!==event\.visitor_id\)/,
  'Collector must reject a raced session bound to a different visitor'
);
