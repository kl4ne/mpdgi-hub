import assert from 'node:assert/strict';
import {copyFileSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const root=mkdtempSync(join(tmpdir(),'mpdgi-guards-'));
const source=readFileSync('js/app.js','utf8');
const checks=[
  ["paymentMethodLink('tithely','Tithe.ly',s.tithely,config.tithely,'tithely-button')",
   "paymentMethodLink('tithely','Tithe.ly',s.tithely,'https://example.invalid/', 'tithely-button')"],
  ["paymentMethodLink('square','Square',s.square,config.square,'square-button')",
   "paymentMethodLink('square','Square',s.square,'https://example.invalid/','square-button')"],
  ["copyText(config.zelle)","copyText('not-approved@example.invalid')"],
  ["textElement('p','zelle-email',config.zelle)","textElement('p','zelle-email','not-approved@example.invalid')"]
];
try{
  for(const dir of ['js','data','tests'])mkdirSync(join(root,dir));
  for(const file of ['data/config.json','data/links.json','tests/config-parity.mjs','tests/approved-destinations.json']){
    copyFileSync(file,join(root,file));
  }
  const appPath=join(root,'js/app.js');
  const run=()=>{
    const result=spawnSync(process.execPath,['tests/config-parity.mjs'],{cwd:root,encoding:'utf8',timeout:10000});
    assert.equal(result.error,undefined,result.error?.message);
    return result.status;
  };
  writeFileSync(appPath,source);
  assert.equal(run(),0,'Approved baseline must pass');
  for(const [original,changed] of checks){
    assert.equal(source.split(original).length-1,1,'Expected unique source pattern');
    writeFileSync(appPath,source.replace(original,changed));
    assert.notEqual(run(),0,'Altered destination should fail verification');
  }
  writeFileSync(appPath,source);
  assert.equal(run(),0,'Restored baseline must pass');
  console.log('Payment verification controls pass their negative cases');
}finally{
  rmSync(root,{recursive:true,force:true});
}
