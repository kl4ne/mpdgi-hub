import {readFileSync,existsSync,appendFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join,normalize,sep} from 'node:path';

const pkg=JSON.parse(readFileSync('package.json','utf8'));
const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
const sw=readFileSync('public/sw.js','utf8');
const js=readFileSync('public/js/stats-version.js','utf8');
function version(text,pattern,description){
  const m=pattern.exec(text);
  if(!m)throw Error('Missing '+description);
  return m[1];
}
const current=version(sw,/const VERSION='([^']+)'/,'SW version');
const client=version(js,/MPDGI_STATS_VERSION='([^']+)'/,'client version');
if(current!==client||current!==pkg.version||current!==lock.version||
   current!==lock.packages?.['']?.version)
  throw Error('Inconsistent Stats package, lock, PWA and service-worker versions');
const shell=/const SHELL=\[([\s\S]*?)\];/.exec(sw)?.[1];
if(!shell)throw Error('Missing service-worker shell');
const assets=[...shell.matchAll(/'([^']+)'/g)].map(x=>x[1]);
if(assets.length<8)throw Error('Service-worker shell unexpectedly incomplete');
for(const asset of assets){
  const relative=asset==='./'?'index.html':asset.replace(/^\.\//,'');
  const safe=normalize(relative);
  if(!safe||safe.startsWith('..')||safe.startsWith(sep)||
     !existsSync(join('public',safe)))throw Error('Missing or unsafe shell asset: '+asset);
}
if(!sw.includes("if(!response.ok)throw new Error("))
  throw Error('Service-worker install must fail for unavailable shell assets');
if(!sw.includes("url.pathname.startsWith('/api/')"))
  throw Error('Authenticated APIs must never be cached by the service worker');
let full=true;
if(process.env.GITHUB_EVENT_NAME==='pull_request'){
  const base=process.env.GITHUB_BASE_REF;
  if(!/^[A-Za-z0-9._/-]+$/.test(base||''))throw Error('Invalid PR base');
  const ref='origin/'+base;
  const changed=execFileSync('git',['diff','--name-only',ref+'...HEAD','--'],{encoding:'utf8'})
    .trim().split('\n').filter(Boolean);
  if(!changed.length)throw Error('Empty pull request diff');
  const cached=changed.some(p=>p==='public/index.html'||p.startsWith('public/css/')||
     p.startsWith('public/js/')||p==='public/manifest.json'||p.startsWith('public/assets/'));
  if(cached){
    const previous=execFileSync('git',['show',ref+':public/sw.js'],{encoding:'utf8'});
    if(version(previous,/const VERSION='([^']+)'/,'base SW version')===current)
      throw Error('Cached application shell changed without SW version increase');
  }
  full=!changed.every(p=>p==='.gitignore'||p.endsWith('.md'));
}
if(process.env.GITHUB_OUTPUT)
  appendFileSync(process.env.GITHUB_OUTPUT,'run_full='+(full?'true':'false')+'\n');
console.log('MPDGI Stats '+current+' release guard passed; full tests: '+full);
