import {pathToFileURL} from 'node:url';

const REPO=process.env.GITHUB_REPOSITORY||'';
const TOKEN=process.env.GITHUB_TOKEN||'';

export const PROTECTED_BRANCHES=new Set([
  'main',
  'mpdgi-stats-v1.0',
  'checkpoint/hub-v1.6.0-current',
  'checkpoint/stats-v1.4.10-auth-e2e',
  'checkpoint/stats-v1.4.7-dual-scheme'
]);

const BOOTSTRAP_PREFIXES=[
  /^audit-fix\//,
  /^docs\//,
  /^ops\//,
  /^hotfix\//,
  /^hub-v/,
  /^stats-v/,
  /^v\d+\./,
  /^mpdgi-stats-v(?!1\.0$)/,
  /^checkpoint\//
];

export function selectBootstrapCandidates(branches,{openBranches=new Set()}={}){
  return branches.filter(name=>{
    if(PROTECTED_BRANCHES.has(name))return false;
    if(openBranches.has(name))return false;
    return BOOTSTRAP_PREFIXES.some(re=>re.test(name));
  });
}

export function shouldDeleteMergedHead(name,{merged=true,sameRepo=true}={}){
  if(!merged||!sameRepo||!name)return false;
  if(PROTECTED_BRANCHES.has(name))return false;
  if(name.startsWith('checkpoint/'))return false;
  return true;
}

async function api(path,options={}){
  if(!REPO||!TOKEN)throw new Error('GitHub repository/token context is missing');
  const response=await fetch('https://api.github.com'+path,{
    ...options,
    headers:{
      Accept:'application/vnd.github+json',
      Authorization:'Bearer '+TOKEN,
      'X-GitHub-Api-Version':'2022-11-28',
      ...(options.headers||{})
    }
  });
  if(response.status===204)return null;
  const text=await response.text();
  if(!response.ok)throw new Error(`${options.method||'GET'} ${path} failed: ${response.status} ${text}`);
  return text?JSON.parse(text):null;
}

async function listBranches(){
  const out=[];
  for(let page=1;;page++){
    const rows=await api(`/repos/${REPO}/branches?per_page=100&page=${page}`);
    out.push(...rows.map(row=>row.name));
    if(rows.length<100)break;
  }
  return out;
}

async function listOpenHeadBranches(){
  const out=new Set();
  for(let page=1;;page++){
    const rows=await api(`/repos/${REPO}/pulls?state=open&per_page=100&page=${page}`);
    for(const pr of rows){
      if(pr.head?.repo?.full_name===REPO)out.add(pr.head.ref);
    }
    if(rows.length<100)break;
  }
  return out;
}

async function deleteBranch(name){
  const encoded=name.split('/').map(encodeURIComponent).join('%2F');
  await api(`/repos/${REPO}/git/refs/heads/${encoded}`,{method:'DELETE'});
  console.log('deleted branch:',name);
}

async function cleanupBootstrap(){
  const branches=await listBranches();
  const openBranches=await listOpenHeadBranches();
  const candidates=selectBootstrapCandidates(branches,{openBranches});
  console.log('bootstrap cleanup candidates:',candidates.length);
  for(const name of candidates){
    try{await deleteBranch(name);}
    catch(error){console.warn('branch cleanup skipped:',name,String(error));}
  }
}

async function cleanupMergedHead(){
  const head=process.env.CLEANUP_HEAD||'';
  const headRepo=process.env.CLEANUP_HEAD_REPO||'';
  const merged=process.env.CLEANUP_PR_MERGED==='true';
  if(!shouldDeleteMergedHead(head,{merged,sameRepo:headRepo===REPO})){
    console.log('merged-head cleanup skipped:',{head,headRepo,merged});
    return;
  }
  try{await deleteBranch(head);}
  catch(error){console.warn('merged-head cleanup skipped:',head,String(error));}
}

async function main(){
  const event=process.env.GITHUB_EVENT_NAME||'';
  if(event==='pull_request')return cleanupMergedHead();
  if(event==='push'||event==='workflow_dispatch')return cleanupBootstrap();
  console.log('No cleanup action for event:',event);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().catch(error=>{console.error(error);process.exitCode=1;});
}
