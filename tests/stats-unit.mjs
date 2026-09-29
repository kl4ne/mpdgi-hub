import assert from 'node:assert/strict';
import {validateEvent,isLikelyBot,easternDay} from '../functions/_lib/validation.js';
import {resolveRange} from '../functions/_lib/reporting.js';
import {randomToken,sha256,passwordSalt,passwordVerifier,constantTimeEqual} from '../functions/_lib/auth.js';

const valid={
  schema_version:1,
  event_id:'11111111-1111-4111-8111-111111111111',
  visitor_id:'22222222-2222-4222-8222-222222222222',
  session_id:'33333333-3333-4333-8333-333333333333',
  event_type:'session_start',
  acquisition_source:'nfc',
  acquisition_campaign:'credential-test',
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
assert.equal(validateEvent({...valid,acquisition_source:'magic'}).ok,false);
assert.equal(validateEvent({...valid,event_type:'action',action_name:''}).ok,false);
assert.equal(isLikelyBot('Mozilla/5.0 HeadlessChrome Lighthouse'),true);
assert.equal(isLikelyBot('Mozilla/5.0 iPhone Version/26.0 Mobile Safari/605.1.15'),false);
assert.equal(easternDay(new Date('2026-09-29T16:00:00Z')),'2026-09-29');

const range=resolveRange('https://stats.mpdgi.org/api/dashboard?from=2026-09-01&to=2026-09-29');
assert.equal(range.from,'2026-09-01');
assert.equal(range.to,'2026-09-29');
assert.equal(range.days,29);
assert.equal(range.previous_to,'2026-08-31');

const token=randomToken(32),salt=passwordSalt();
assert.ok(token.length>30&&salt.length>15);
const verifier=await passwordVerifier('A-very-long-demo-password!',salt,'server-side-test-pepper');
assert.equal(constantTimeEqual(verifier,await passwordVerifier('A-very-long-demo-password!',salt,'server-side-test-pepper')),true);
assert.equal(constantTimeEqual(verifier,await passwordVerifier('different-password-value',salt,'server-side-test-pepper')),false);
assert.notEqual(await sha256('a'),await sha256('b'));

console.log('MPDGI Stats unit validation passed');
