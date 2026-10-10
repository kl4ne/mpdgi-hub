import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

const allowed=new Set(['README.md','SECURITY.md','assets/qr/README.md']);
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const docs=tracked.filter(path=>/\.md$/i.test(path));
const unexpected=docs.filter(path=>!allowed.has(path));

assert.equal(unexpected.length,0,'Unreviewed Markdown documents must not be published: '+unexpected.join(', '));
for(const file of allowed)assert(tracked.includes(file),'Required public documentation missing: '+file);

// Apply broad checks to the few intentionally public documents. This guard
// is not a replacement for manual reviews or repository access controls.
const sensitiveForms=[
  /\b[A-Z][A-Z0-9_]*(?:_SECRET|_PASSWORD|_PEPPER|_TOKEN|_KEY)\b|\bpassword[_-]?hash\b/i,
  /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}\b|\bAKIA[0-9A-Z]{16}\b/i
];
for(const file of allowed){
  const content=readFileSync(file,'utf8');
  for(const pattern of sensitiveForms)assert(!pattern.test(content),'Review potentially restricted content in: '+file);
}
console.log('Public documentation boundary verified');
