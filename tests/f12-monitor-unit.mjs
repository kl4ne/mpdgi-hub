import assert from 'node:assert/strict';
import {attempt,getTargets,inspectTarget,syncIncidents,makeGitHubRequest} from '../.github/scripts/f12-monitor.mjs';

const approved={tithely:'https://tithe.ly/give_new/www/#/tithely/give-one-time/6513581',
  square:'https://square.link/u/8veQoUxF'};
const config={...approved,customDomain:'https://hub.mpdgi.org/'};
assert.deepEqual(getTargets(approved,config).map(x=>x.id),['hub','tithely','square']);
assert.throws(()=>getTargets(approved,{...config,square:'https://example.invalid/'}));

const respond=(statuses,body='<title>MPDGI Hub</title>')=>{
  let count=0;
  return async(url,opts)=>{
    assert.equal(opts.method,'GET','Monitor must never submit payment data');
    assert.equal(opts.redirect,'follow');
    return new Response(body,{status:statuses[Math.min(count++,statuses.length-1)]});
  };
};
const noWait=async()=>{};
const hub={id:'hub',url:'https://hub.mpdgi.org/'};
const sq={id:'square',url:approved.square};
assert.equal((await attempt(hub,respond([200]))).state,'ok');
assert.equal((await attempt(hub,respond([200],'unrecognized website'))).state,'failed');
assert.equal((await attempt(sq,respond([403]))).state,'inconclusive');
assert.equal((await attempt(sq,respond([429]))).state,'inconclusive');
assert.equal((await inspectTarget(sq,{request:respond([503,502,200]),wait:noWait})).state,'ok');
assert.equal((await inspectTarget(sq,{request:respond([503,503,503]),wait:noWait})).state,'failed');
assert.equal((await inspectTarget(sq,{request:respond([403,403,403]),wait:noWait})).state,'inconclusive');

const failed={id:'square',state:'failed',attempts:3,detail:'HTTP 404 / HTTP 404 / HTTP 404'};
const recovered={...failed,state:'ok',detail:'HTTP 200'};
const blocked={...failed,state:'inconclusive',detail:'HTTP 403'};
const issues=[];
async function api(method,path,data){
  if(method==='GET')return issues.filter(i=>i.state==='open');
  if(method==='POST'){
    issues.push({number:issues.length+1,title:data.title,state:'open'});
    return issues.at(-1);
  }
  if(method==='PATCH'){
    const issue=issues.find(i=>path.endsWith('/'+i.number));
    issue.state=data.state;
    return issue;
  }
  throw Error('Unexpected method');
}
assert.deepEqual(await syncIncidents([failed],api),['opened square']);
assert.equal(issues.length,1);
assert.deepEqual(await syncIncidents([failed],api),[]);
assert.equal(issues.length,1,'Repeated failures must not create duplicate alerts');
assert.deepEqual(await syncIncidents([blocked],api),[],'Inconclusive result must leave incident unchanged');
assert.equal(issues[0].state,'open');
assert.deepEqual(await syncIncidents([recovered],api),['resolved square']);
assert.equal(issues[0].state,'closed');
assert.deepEqual(await syncIncidents([recovered],api),[]);
await assert.rejects(syncIncidents([failed],api,'untrusted/repo'));

const requests=[];
const githubRequest=makeGitHubRequest('fake-token',async(url,opts)=>{
  requests.push({url,opts});
  return new Response('[]',{status:200,headers:{'content-type':'application/json'}});
});
await githubRequest('GET','/repos/kl4ne/mpdgi-hub/issues?state=open');
assert.ok(requests[0].opts.headers.Authorization.startsWith('Bearer '));
console.log('F12: read-only, retries, uncertainty, alert de-duplication and recovery passed');
