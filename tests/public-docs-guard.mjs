import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// Explicitly reviewed public documentation: new types must be approved before publishing.
const allowed=new Set(['README.md','SECURITY.md','assets/qr/README.md','robots.txt','sitemap.xml']);
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);

// Fail closed for alternative document formats and for private/backup directories.
// Robots.txt, sitemap and other legitimate new files require a deliberate allowlist review.
const documentExtension=/\.(?:md|markdown|mdown|rst|adoc|asciidoc|txt|text|pdf|doc|docx|odt|rtf|pages|ppt|pptx|keynote|key|xls|xlsx|csv|tsv|zip|tar|gz|7z|bak|sql|sqlite|sqlite3|db)$/i;
const privatePath=/(?:^|\/)(?:docs?|documentation|private|internal|confidential|archives?|backups?|checkpoints?|runbooks?|reports?|secrets?)(?:\/|$)/i;
const sensitiveFilename=/(?:^|\/)(?:\.env(?:\.[^/]*)?|id_(?:rsa|ed25519)|.+\.(?:pem|p12|pfx|kdbx|asc|gpg))$/i;
const unexpected=tracked.filter(path=>!allowed.has(path)&&(documentExtension.test(path)||privatePath.test(path)||sensitiveFilename.test(path)));

assert.equal(unexpected.length,0,'Unexpected document/private artifact in public repository: '+unexpected.join(', '));
for(const file of allowed)assert(tracked.includes(file),'Required public documentation missing: '+file);

// Broad checks on the few deliberately public text documents.
// This cannot undo exposure in Git history or replace review of changes.
const sensitiveForms=[
  /\b[A-Z][A-Z0-9_]*(?:_SECRET|_PASSWORD|_PEPPER|_TOKEN|_KEY)\b|\bpassword[_-]?hash\b/i,
  /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}\b|\bAKIA[0-9A-Z]{16}\b/i
];
for(const file of allowed){
  const content=readFileSync(file,'utf8');
  for(const pattern of sensitiveForms)assert(!pattern.test(content),'Review potentially restricted content in: '+file);
}
console.log('Public documentation boundary verified (multiple document types)');
