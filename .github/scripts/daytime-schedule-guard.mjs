// Only permit scheduled F12 monitoring when GitHub actually starts it during Eastern daytime.
import {appendFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function schedulePermission(eventName,now=new Date()){
  if(eventName!=='schedule')return {allow:true,reason:'non-scheduled-event'};
  if(!(now instanceof Date)||!Number.isFinite(now.getTime()))
    return {allow:false,reason:'invalid-time'};
  try{
    const parts=new Intl.DateTimeFormat('en-US',{
      timeZone:'America/New_York',hourCycle:'h23',hour:'2-digit',minute:'2-digit'
    }).formatToParts(now);
    const hour=Number(parts.find(p=>p.type==='hour')?.value);
    const minute=Number(parts.find(p=>p.type==='minute')?.value);
    if(!Number.isInteger(hour)||!Number.isInteger(minute)||hour<0||hour>23||minute<0||minute>59)
      return {allow:false,reason:'invalid-eastern-clock'};
    const allow=hour>=9&&hour<17;
    return {allow,reason:allow?'within-eastern-daytime':'outside-eastern-daytime',
      easternTime:String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0')};
  }catch{return {allow:false,reason:'timezone-unavailable'};}
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=schedulePermission(process.env.GITHUB_EVENT_NAME);
  if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,
    'allow='+(result.allow?'true':'false')+'\n');
  console.log('F12 Eastern runtime guard: '+result.reason+
    (result.easternTime?' '+result.easternTime:'')+
    (result.allow?' — check permitted':' — skip external requests and incident writes'));
}
