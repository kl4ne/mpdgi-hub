import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEvent,validateCollectorIdentity,isLikelyBot,easternDay} from '../functions/_lib/validation.js';
import {resolveRange} from '../functions/_lib/reporting.js';
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
assert.equal(validateCollectorIdentity('https://npcard.pages.dev',{...valid,event_type:'action',action_name:'bc_call',target:'business_card:nancy-pagan'}).ok,true);
assert.equal(validateCollectorIdentity('https://npcard.mpdgi.org',{...valid,event_type:'action',action_name:'unknown_action',target:'business_card:nancy-pagan'}).error,'invalid_action');
assert.equal(validateCollectorIdentity('https://hub.mpdgi.org',{...valid,target:'https://mpdgi.org/'}).ok,true);
assert.equal(isLikelyBot('Mozilla/5.0 HeadlessChrome Lighthouse'),true);
assert.equal(isLikelyBot('Mozilla/5.0 iPhone Version/26.0 Mobile Safari/605.1.15'),false);
assert.equal(easternDay(new Date('2026-09-29T16:00:00Z')),'2026-09-29');

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
assert.match(loginSource,/verifyPasswordRecord\(password,user,context\.env\.AUTH_PEPPER\)/);
assert.match(loginSource,/maybeUpgradePasswordRecord\(context\.env\.STATS_DB,user,password,context\.env\.AUTH_PEPPER,verification\)/);
const bootstrapSource=readFileSync(new URL('../functions/api/auth/bootstrap.js',import.meta.url),'utf8');
assert.match(bootstrapSource,/createTargetPasswordRecord\(password,context\.env\.AUTH_PEPPER\)/);

console.log('MPDGI Stats unit validation passed');


const reportingSource=readFileSync(new URL('../functions/_lib/reporting.js',import.meta.url),'utf8');
const hubIsolationFilters=(reportingSource.match(/NOT LIKE 'business_card:%'/g)||[]).length;
assert.ok(hubIsolationFilters>=11,'Hub reporting must exclude business-card events from Hub-centric metrics');
assert.match(reportingSource,/target LIKE 'business_card:%'/,'Digital Cards reporting must keep its dedicated business-card query');
assert.match(reportingSource,/SELECT DISTINCT s\.session_id,s\.first_seen_at[\s\S]*?e\.target NOT LIKE 'business_card:%'/,'Activity insights must exclude Digital Card sessions');
