import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const read=path=>readFileSync(path,'utf8');
const config=JSON.parse(read('data/config.json'));
const links=JSON.parse(read('data/links.json'));
const app=read('js/app.js');
const cutoff=app.indexOf('const ICONS=');
assert(cutoff>0,'Defaults declaration not found');
const {DEFAULT_CONFIG,FALLBACK_LINKS}=runInNewContext(
  app.slice(0,cutoff)+'\n({DEFAULT_CONFIG,FALLBACK_LINKS})',
  {MPDGI_HUB_VERSION:'1.6.6'},{timeout:1000}
);

for(const [key,value] of Object.entries(DEFAULT_CONFIG)){
  assert(Object.hasOwn(config,key),'Missing configured fallback key: '+key);
  assert.equal(JSON.stringify(config[key]),JSON.stringify(value),'Configuration mismatch: '+key);
}
assert.equal(config.version,'1.6.6');
assert.equal(FALLBACK_LINKS.length,links.length,'Fallback link count mismatch');
const byId=new Map(links.map(item=>[item.id,item]));
assert.equal(byId.size,links.length,'Duplicate link ID');
for(const fallback of FALLBACK_LINKS){
  const configured=byId.get(fallback.id);
  assert(configured,'Missing configured link: '+fallback.id);
  assert.equal(JSON.stringify(configured),JSON.stringify(fallback),'Fallback link mismatch: '+fallback.id);
}

const approved=Object.freeze(JSON.parse(read('tests/approved-destinations.json')));
for(const [provider,destination] of Object.entries(approved)){
  assert.equal(config[provider],destination,'Unapproved destination: '+provider);
  assert.equal(DEFAULT_CONFIG[provider],destination,'Unapproved fallback destination: '+provider);
}
const give=byId.get('give');
assert(give&&give.action==='modal'&&give.modal==='give','Giving flow changed');
const wiring=[
  "paymentMethodLink('tithely','Tithe.ly',s.tithely,config.tithely,'tithely-button')",
  "paymentMethodLink('square','Square',s.square,config.square,'square-button')",
  "textElement('p','zelle-email',config.zelle)",
  "copyText(config.zelle)"
];
for(const snippet of wiring){
  assert.equal(app.split(snippet).length-1,1,'Giving wiring changed: '+snippet);
}
console.log('Configuration and approved destinations verified');
