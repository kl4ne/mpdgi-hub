import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const files=['css/style.css','css/style-v1.6.5.css'];
const originals=new Map(files.map(file=>[file,readFileSync(file,'utf8')]));
assert.equal(originals.get(files[0]),originals.get(files[1]),'Pinned and canonical CSS differ');

function withoutMedia(css,rule){
  const marker='@media ('+rule+')',start=css.indexOf(marker);
  assert(start!==-1,'Missing media rule: '+rule);
  assert(css.indexOf(marker,start+marker.length)===-1,'Duplicate media rule: '+rule);
  const open=css.indexOf('{',start);
  assert(open!==-1);
  let depth=0;
  for(let i=open;i<css.length;i++){
    if(css[i]==='{')depth++;
    else if(css[i]==='}'){
      depth--;
      if(depth===0)return css.slice(0,start)+css.slice(i+1);
    }
  }
  throw Error('Unterminated media rule: '+rule);
}
const cases=[
  {rule:'forced-colors: active',title:'high-contrast accessibility preferences preserve usable controls',evidence:'should be hidden in forced-colors'},
  {rule:'prefers-contrast: more',title:'prefers-contrast: more strengthens text and borders',evidence:'Expected:'}
];
try{
  for(const c of cases){
    for(const file of files)writeFileSync(file,withoutMedia(originals.get(file),c.rule));
    const cli=join(process.cwd(),'node_modules','@playwright','test','cli.js');
    const result=spawnSync(process.execPath,[cli,'test','--project=chromium','--grep',c.title,'--retries=0'],{
      encoding:'utf8',timeout:90000,env:{...process.env,BASE_URL:'http://127.0.0.1:4173'}
    });
    if(result.error)throw result.error;
    const output=(result.stdout||'')+'\n'+(result.stderr||'');
    assert.equal(result.status,1,'Browser check must reject absent '+c.rule+'\n'+output.slice(-3000));
    assert(output.includes(c.evidence),'Expected style failure absent for '+c.rule+'\n'+output.slice(-3000));
    for(const file of files)writeFileSync(file,originals.get(file));
    console.log('Verified missing '+c.rule+' rules are rejected');
  }
}finally{
  for(const file of files)writeFileSync(file,originals.get(file));
}
console.log('Contrast mutation regressions verified');
