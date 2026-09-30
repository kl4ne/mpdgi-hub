import {json,NO_STORE_HEADERS,methodNotAllowed} from '../_lib/http.js';
import {validateEvent,isLikelyBot,easternDay} from '../_lib/validation.js';
import {sha256} from '../_lib/auth.js';
import {ensureCampaignSchema} from '../_lib/schema.js';

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
  try{await ensureCampaignSchema(context.env);}catch(error){console.error('[MPDGI Stats] schema upgrade failed',error);return json({error:'collector_unavailable'},503,corsHeaders(origin));}
  const now=new Date(),serverTs=now.toISOString(),day=easternDay(now);

  // Anonymous rate control: raw IP is never persisted.
  if(context.env.AUTH_PEPPER){
    const ip=context.request.headers.get('CF-Connecting-IP')||'unknown';
    const nowSeconds=Math.floor(now.getTime()/1000);
    const windowStarted=Math.floor(nowSeconds/600)*600;
    const rateKey=await sha256('collector-rate|'+ip+'|'+windowStarted+'|'+context.env.AUTH_PEPPER);
    const rate=await context.env.STATS_DB.prepare('SELECT event_count FROM collector_rate WHERE rate_key=?').bind(rateKey).first();
    if(Number(rate?.event_count||0)>=200)return new Response(null,{status:204,headers:corsHeaders(origin)});
    await context.env.STATS_DB.prepare(
      'INSERT INTO collector_rate(rate_key,window_started,event_count) VALUES(?,?,1) ON CONFLICT(rate_key) DO UPDATE SET event_count=event_count+1'
    ).bind(rateKey,windowStarted).run();
    if(Math.random()<0.01)await context.env.STATS_DB.prepare('DELETE FROM collector_rate WHERE window_started<?').bind(windowStarted-7200).run();
  }

  try{
    // Server-side canonical truth: first acquisition and session-entry values never mutate.
    await context.env.STATS_DB.batch([
      context.env.STATS_DB.prepare(
        'INSERT OR IGNORE INTO visitors(visitor_id,acquisition_source,acquisition_campaign,first_seen_at,first_seen_day_et) VALUES(?,?,?,?,?)'
      ).bind(event.visitor_id,event.acquisition_source,event.acquisition_campaign,serverTs,day),
      context.env.STATS_DB.prepare(
        'INSERT OR IGNORE INTO sessions(session_id,visitor_id,session_entry,session_campaign,display_mode,first_seen_at,first_seen_day_et) VALUES(?,?,?,?,?,?,?)'
      ).bind(event.session_id,event.visitor_id,event.session_entry,event.session_campaign,event.display_mode,serverTs,day),
      context.env.STATS_DB.prepare(
        'INSERT OR IGNORE INTO events(event_id,visitor_id,session_id,event_type,acquisition_source,acquisition_campaign,session_entry,session_campaign,display_mode,language,app_version,device_category,browser,action_name,target,client_ts,server_ts,server_day_et) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
      ).bind(
        event.event_id,event.visitor_id,event.session_id,event.event_type,event.acquisition_source,event.acquisition_campaign,event.session_entry,event.session_campaign,
        event.display_mode,event.language,event.app_version,event.device_category,event.browser,event.action_name,event.target,event.client_ts||null,serverTs,day
      )
    ]);
    return new Response(null,{status:204,headers:corsHeaders(origin)});
  }catch(error){
    console.error('[MPDGI Stats] collector D1 failure',error);
    return json({error:'collector_unavailable'},503,corsHeaders(origin));
  }
}
