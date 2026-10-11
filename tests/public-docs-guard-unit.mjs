import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const guard=fileURLToPath(new URL('./public-docs-guard.mjs',import.meta.url));
const temp=mkdtempSync(join(tmpdir(),'mpdgi-hub-doc-guard-'));
const exec=(...args)=>execFileSync('git',args,{cwd:temp,stdio:'pipe'});
function put(path,body='example'){
  const file=join(temp,path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,body);exec('add','-A');
}
function check(shouldPass,label){
  const r=spawnSync(process.execPath,[guard],{cwd:temp,encoding:'utf8',timeout:12000});
  assert.equal(r.error,undefined,label+' failed to launch');
  assert.equal(r.status===0,shouldPass,label+': '+r.stdout+' '+r.stderr);
}
try{
  exec('init','-q');
  put('README.md','# Public introduction');
  put('SECURITY.md','# Public security contact');
  put('assets/qr/README.md','# QR setup');
  put('robots.txt','User-agent: *\nAllow: /\n\nSitemap: https://hub.mpdgi.org/sitemap.xml\n');
  put('sitemap.xml','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://hub.mpdgi.org/</loc></url></urlset>');
  check(true,'approved baseline');
  for(const path of [
    'MASTER_STATUS.md','internal/ARCHITECTURE.md','docs/audit.rst','records/notes.txt',
    'reports/internal.pdf','files/private.docx','notes/presentation.pptx',
    'reports/export.xlsx','archive/record.json','backup.zip','backup.sql',
    'keys/owner.pem','confidential/notes.json','donor-list.txt'
  ]){
    put(path);
    check(false,'reject '+path);
    rmSync(join(temp,path),{force:true});exec('add','-A');
    check(true,'recover after '+path);
  }
  put('README.md','EXAMPLE_DEVELOPER_TOKEN');
  check(false,'reject sensitive content in allowlisted document');
  put('README.md','# Public introduction');
  check(true,'restored approved README');
  rmSync(join(temp,'SECURITY.md'),{force:true});exec('add','-A');
  check(false,'required public document removed');
  console.log('Public documentation guard regression cases passed');
}finally{
  rmSync(temp,{recursive:true,force:true});
}
