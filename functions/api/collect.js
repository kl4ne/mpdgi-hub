import {json,NO_STORE_HEADERS,methodNotAllowed} from '../_lib/http.js';
import {validateEvent,isLikelyBot,easternDay} from '../_lib/validation.js';

function corsHeaders(origin){
  return {
    ...NO_STORE_HEADERS,
    'Access-Control-Allow-Origin':origin,
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Max-Age':'86400',
    'Vary':'Origin'
  };
}
function allowedOrigin(context){
  const origin=context.request.headers.get('Origin')||'';
  const configured=context.env.ANALYTICS_ALLOWED_ORIGIN||'https://hub.mpdgi.org';
  if(origin===configured)return origin;
  if(context.env.ALLOW_LOCAL_ANALYTICS==='true'&&(origin==='http://127.0.0.1:4173'||origin==='http://localhost:4173'))return origin;
  return '';
}

export async function onRequest(context){
  const origin=allowedOrigin(context);
  if(context.request.method==='OPTIONS'){
    if(!origin)return new Response(null,{status:403,headers:NO_STORE_HEADERS});
    return new Response(null,{status:204,headers:corsHeaders(origin)});
  }
  if(context.request.method!=='POST')return methodNotAllowed('POST, OPTIONS');
  if(!origin)return json({error:'origin_not_allowed'},403);
  if(!context.env.STATS_DB)return json({error:'collector_unavailable'},503,corsHeaders(origin));
  if(isLikelyBot(context.request.headers.get('User-Agent')))return new Response(null,{status:204,headers:corsHeaders(origin)});

  const raw=await context.request.text();
  if(raw.length>8192)return json({error:'payload_too_large'},413,corsHeaders(origin));
  let parsed;try{parsed=JSON.parse(raw);}catch{return json({error:'invalid_json'},400,corsHeaders(origin));}
  const checked=validateEvent(parsed);
  if(!checked.ok)return json({error:checked.error},400,corsHeaders(origin));

  const event=checked.event;
  const now=new Date(),serverTs=now.toISOString(),day=easternDay(now);
  try{
    await context.env.STATS_DB.prepare(
      'INSERT OR IGNORE INTO events(event_id,visitor_id,session_id,event_type,acquisition_source,acquisition_campaign,session_entry,display_mode,language,app_version,device_category,browser,action_name,target,client_ts,server_ts,server_day_et) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(
      event.event_id,event.visitor_id,event.session_id,event.event_type,event.acquisition_source,event.acquisition_campaign,event.session_entry,
      event.display_mode,event.language,event.app_version,event.device_category,event.browser,event.action_name,event.target,event.client_ts||null,serverTs,day
    ).run();
    return new Response(null,{status:204,headers:corsHeaders(origin)});
  }catch(error){
    console.error('[MPDGI Stats] collector D1 failure',error);
    return json({error:'collector_unavailable'},503,corsHeaders(origin));
  }
}
