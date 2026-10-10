import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cpSync,createReadStream,existsSync,mkdtempSync,readFileSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {extname,join,normalize,sep} from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const match=/css\/(style-v[0-9.]+\.css)/.exec(readFileSync(join(ROOT,'index.html'),'utf8'));
assert(match,'Pinned stylesheet not found');
const cssFiles=['css/style.css','css/'+match[1]];
const before=new Map(cssFiles.map(file=>[file,sha(join(ROOT,file))]));
assert.equal(before.get(cssFiles[0]),before.get(cssFiles[1]),'Pinned and canonical styles differ');

function withoutMedia(css,rule){
  const marker='@media ('+rule+')',start=css.indexOf(marker);
  assert(start>=0,'Missing media block: '+rule);
  assert.equal(css.indexOf(marker,start+marker.length),-1,'Duplicate media block: '+rule);
  const open=css.indexOf('{',start);
  assert(open>=0,'Missing block opening: '+rule);
  let depth=0;
  for(let i=open;i<css.length;i++){
    if(css[i]==='{')depth++;
    else if(css[i]==='}'){
      depth--;
      if(depth===0)return css.slice(0,start)+css.slice(i+1);
    }
  }
  throw Error('Unterminated media block: '+rule);
}

const MIME={
  '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.png':'image/png',
  '.svg':'image/svg+xml',
  '.webp':'image/webp',
  '.ico':'image/x-icon'
};
function serve(directory){
  return new Promise((resolve,reject)=>{
    const server=createServer((req,res)=>{
      try{
        let urlPath=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
        if(urlPath.endsWith('/'))urlPath+='index.html';
        const file=normalize(join(directory,urlPath));
        if(!file.startsWith(directory+sep)||!existsSync(file)||!statSync(file).isFile()){
          res.writeHead(404);res.end('Not found');return;
        }
        res.writeHead(200,{'Content-Type':MIME[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
        createReadStream(file).pipe(res);
      }catch{
        res.writeHead(400);res.end('Bad request');
      }
    });
    server.once('error',reject);
    server.listen(0,'127.0.0.1',()=>{server.off('error',reject);resolve(server);});
  });
}

function runPlaywright(url,title){
  const cli=join(ROOT,'node_modules','@playwright','test','cli.js');
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[cli,'test','--project=chromium','--grep',title,'--retries=0'],{
      cwd:ROOT,env:{...process.env,BASE_URL:url}
    });
    let output='',timedOut=false;
    child.stdout.on('data',data=>{output+=data.toString();});
    child.stderr.on('data',data=>{output+=data.toString();});
    const timer=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},90000);
    child.once('error',err=>{clearTimeout(timer);reject(err);});
    child.once('close',status=>{clearTimeout(timer);resolve({status,output,timedOut});});
  });
}

const sandbox=mkdtempSync(join(tmpdir(),'mpdgi-contrast-'));
let server;
process.on('exit',()=>{try{rmSync(sandbox,{recursive:true,force:true});}catch{}});
for(const signal of ['SIGINT','SIGTERM','SIGHUP'])process.on(signal,()=>process.exit(130));

try{
  for(const part of ['index.html','sw.js','manifest.json','css','js','data','assets']){
    if(existsSync(join(ROOT,part)))cpSync(join(ROOT,part),join(sandbox,part),{recursive:true});
  }
  server=await serve(sandbox);
  const baseUrl='http://127.0.0.1:'+server.address().port;
  const cases=[
    {rule:'forced-colors: active',title:'high-contrast accessibility preferences preserve usable controls',evidence:'should be hidden in forced-colors'},
    {rule:'prefers-contrast: more',title:'prefers-contrast: more strengthens text and borders',evidence:'prefers-contrast subtitle must be white'}
  ];
  for(const testCase of cases){
    for(const file of cssFiles)cpSync(join(ROOT,file),join(sandbox,file));
    const baseline=await runPlaywright(baseUrl,testCase.title);
    assert(!baseline.timedOut,'Baseline browser test timed out');
    assert.equal(baseline.status,0,'Baseline must pass: '+testCase.title+'\n'+baseline.output.slice(-2800));
    for(const file of cssFiles){
      const css=readFileSync(join(ROOT,file),'utf8');
      writeFileSync(join(sandbox,file),withoutMedia(css,testCase.rule));
    }
    const altered=await runPlaywright(baseUrl,testCase.title);
    assert(!altered.timedOut,'Negative browser test timed out');
    assert.equal(altered.status,1,'Missing '+testCase.rule+' must fail the browser test\n'+altered.output.slice(-2800));
    assert(altered.output.includes(testCase.evidence),'Expected style failure not observed\n'+altered.output.slice(-2800));
    console.log('Verified baseline and negative case: '+testCase.rule);
  }
  for(const [file,digest] of before)assert.equal(sha(join(ROOT,file)),digest,'Original CSS was modified: '+file);
  console.log('Contrast mutation regressions verified; original CSS unchanged');
}finally{
  if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(sandbox,{recursive:true,force:true});
}
