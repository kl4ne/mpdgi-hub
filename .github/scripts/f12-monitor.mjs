import assert from 'node:assert/strict';
import {appendFileSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

const ROOT=new URL('../../',import.meta.url);
const read=path=>readFileSync(new URL(path,ROOT),'utf8');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const REPO='kl4ne/mpdgi-hub';
const ISSUE_TITLES={
  hub:'[F12] Disponibilidad: MPDGI Hub',
  tithely:'[F12] Disponibilidad: Tithe.ly',
  square:'[F12] Disponibilidad: Square'
};
const DISPLAY={hub:'MPDGI Hub',tithely:'Tithe.ly',square:'Square'};

export function getTargets(approved,config){
  const hub='https://hub.mpdgi.org/';
  for(const key of ['tithely','square']){
    assert.equal(approved[key],config[key],key+' differs from approved configuration');
    assert.equal(new URL(approved[key]).protocol,'https:',key+' must use HTTPS');
  }
  assert.equal(config.customDomain,hub,'Hub production domain differs from approved URL');
  return [{id:'hub',url:hub},{id:'tithely',url:approved.tithely},{id:'square',url:approved.square}];
}

export async function attempt(target,request=fetch,timeoutMs=12000){
  let response;
  try{
    response=await request(target.url,{
      method:'GET',redirect:'follow',signal:AbortSignal.timeout(timeoutMs),
      headers:{'User-Agent':'MPDGI-Hub-Availability/1.0',Accept:'text/html,application/xhtml+xml,*/*'}
    });
    const code=response.status;
    if([401,403,429].includes(code))return {state:'inconclusive',reason:'HTTP '+code+' (access control or rate limit)'};
    if(code>=200&&code<400){
      if(target.id==='hub'){
        if(code!==200)return {state:'failed',reason:'Hub returned HTTP '+code};
        const html=await response.text();
        if(!html.includes('MPDGI Hub'))return {state:'failed',reason:'Hub HTML marker missing'};
      }
      return {state:'ok',reason:'HTTP '+code};
    }
    return {state:'failed',reason:'HTTP '+code};
  }catch(error){
    return {state:'failed',reason:error?.name==='TimeoutError'?'request timed out':'connection unavailable'};
  }finally{
    try{await response?.body?.cancel();}catch{}
  }
}

export async function inspectTarget(target,{request=fetch,wait=sleep,attempts=3,delayMs=1800}={}){
  assert.ok(Number.isInteger(attempts)&&attempts>=2,'At least two attempts required');
  const outcomes=[];
  for(let i=0;i<attempts;i++){
    outcomes.push(await attempt(target,request));
    if(outcomes.at(-1).state==='ok')break;
    if(i<attempts-1)await wait(delayMs);
  }
  const state=outcomes.some(x=>x.state==='ok')?'ok':
    outcomes.some(x=>x.state==='inconclusive')?'inconclusive':'failed';
  return {id:target.id,state,attempts:outcomes.length,
    detail:state==='ok'?outcomes.find(x=>x.state==='ok').reason:
      outcomes.map(x=>x.reason).join(' / ')};
}

export async function syncIncidents(results,request,repository=REPO){
  assert.equal(repository,REPO,'Issue updates restricted to Hub repository');
  const open=await request('GET','/repos/'+repository+'/issues?state=open&per_page=100');
  assert.ok(Array.isArray(open),'Expected GitHub issue list');
  const changes=[];
  for(const result of results){
    const title=ISSUE_TITLES[result.id];
    assert.ok(title,'Unexpected endpoint ID');
    const existing=open.find(issue=>!issue.pull_request&&issue.title===title);
    if(result.state==='failed'&&!existing){
      const body=[
        'F12 detected a repeated availability problem with **'+DISPLAY[result.id]+'**.',
        '',
        '- Attempts: '+result.attempts,
        '- Observations: '+result.detail,
        '- Read-only requests; no payment was initiated.',
        '- A remote service may still work for visitors; verify manually before changing a giving destination.',
        '',
        'Owner notification: @kl4ne',
        '',
        'This issue closes automatically when a later run confirms recovery.'
      ].join('\n');
      await request('POST','/repos/'+repository+'/issues',{title,body});
      changes.push('opened '+result.id);
    }else if(result.state==='ok'&&existing){
      await request('PATCH','/repos/'+repository+'/issues/'+existing.number,{state:'closed',state_reason:'completed'});
      changes.push('resolved '+result.id);
    }
  }
  return changes;
}

export function makeGitHubRequest(token,request=fetch){
  assert.ok(token,'Missing GitHub Actions token');
  return async(method,path,body)=>{
    const response=await request('https://api.github.com'+path,{
      method,
      headers:{
        Accept:'application/vnd.github+json',
        Authorization:'Bearer '+token,
        'X-GitHub-Api-Version':'2022-11-28',
        'Content-Type':'application/json',
        'User-Agent':'MPDGI-Hub-F12-Availability'
      },
      body:body===undefined?undefined:JSON.stringify(body),
      signal:AbortSignal.timeout(15000)
    });
    if(!response.ok)throw new Error('GitHub issue API failed: '+method+' '+response.status);
    return await response.json();
  };
}

async function main(){
  if(process.env.GITHUB_REPOSITORY!==REPO)throw new Error('F12 monitor must run only in '+REPO);
  const targets=getTargets(JSON.parse(read('tests/approved-destinations.json')),
    JSON.parse(read('data/config.json')));
  const results=await Promise.all(targets.map(target=>inspectTarget(target)));
  const table=[
    '### F12 — MPDGI link availability',
    '| Endpoint | Result | Attempts |',
    '|---|---|---|',
    ...results.map(r=>'| '+DISPLAY[r.id]+' | '+r.state+' | '+r.attempts+' |'),
    '',
    'Checks are read-only. HTTP 401/403/429 is inconclusive, not a confirmed outage.',
    'Provider link checks do not simulate payment or validate the entire checkout.',
    ''
  ].join('\n');
  process.stdout.write(table+'\n');
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,table+'\n');
  if(!process.env.GH_TOKEN)throw Error('Missing GitHub Actions token for incident reporting');
  const changes=await syncIncidents(results,makeGitHubRequest(process.env.GH_TOKEN));
  process.stdout.write('Incident updates: '+(changes.join(', ')||'none')+'\n');
  if(results.some(r=>r.state==='failed'))process.exitCode=1;
  if(results.some(r=>r.state==='inconclusive'))process.stdout.write('An access-control response was inconclusive; no incident opened for that endpoint.\n');
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  main().catch(error=>{console.error('F12 monitoring failed:',error.message);process.exitCode=1;});
}
