import {json,NO_STORE_HEADERS,methodNotAllowed} from '../_lib/http.js';
import {validateEvent,validateCollectorIdentity,isLikelyBot,easternDay} from '../_lib/validation.js';
import {sha256} from '../_lib/auth.js';
import {ensureCampaignSchema} from '../_lib/schema.js';

async function bumpCollectorMetric(db,day,values={}){
  const received=Number(values.received||0),accepted=Number(values.accepted||0),duplicates=Number(values.duplicates||0),
    rejected=Number(values.rejected||0),delayed=Number(values.delayed||0),timestamp=values.timestamp||new Date().toISOString();
  await db.prepare(`INSERT INTO collector_metrics(day_et,received,accepted,duplicates,rejected,delayed,last_received_at)
    VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(day_et) DO UPDATE SET
      received=received+excluded.received,
      accepted=accepted+excluded.accepted,
      duplicates=duplicates+excluded.duplicates,
      rejected=rejected+excluded.rejected,
      delayed=delayed+excluded.delayed,
      last_received_at=excluded.last_received_at`)
    .bind(day,received,accepted,duplicates,rejected,delayed,timestamp).run();
}

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
  const configured=String(context.env.ANALYTICS_ALLOWED_ORIGINS||context.env.ANALYTICS_ALLOWED_ORIGIN||'')
    .split(',').map(value=>value.trim()).filter(Boolean);
  const defaults=['https://hub.mpdgi.org','https://rscard.mpdgi.org','https://npcard.mpdgi.org','https://npcard.pages.dev'];
  const allowed=new Set([...defaults,...configured]);
  if(allowed.has(origin))return origin;
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
  if(!context.env.STATS_DB||!context.env.AUTH_PEPPER)return json({error:'collector_unavailable'},503,corsHeaders(origin));
  if(isLikelyBot(context.request.headers.get('User-Agent')))return new Response(null,{status:204,headers:corsHeaders(origin)});

  const raw=await context.request.text();
  try{await ensureCampaignSchema(context.env);}catch(error){console.error('[MPDGI Stats] schema upgrade failed',error);return json({error:'collector_unavailable'},503,corsHeaders(origin));}
  const now=new Date(),serverTs=now.toISOString(),day=easternDay(now);
  await bumpCollectorMetric(context.env.STATS_DB,day,{received:1,timestamp:serverTs});
  if(raw.length>8192){
    await bumpCollectorMetric(context.env.STATS_DB,day,{rejected:1,timestamp:serverTs});
    return json({error:'payload_too_large'},413,corsHeaders(origin));
  }
  let parsed;try{parsed=JSON.parse(raw);}catch{
    await bumpCollectorMetric(context.env.STATS_DB,day,{rejected:1,timestamp:serverTs});
    return json({error:'invalid_json'},400,corsHeaders(origin));
  }
  const checked=validateEvent(parsed);
  if(!checked.ok){
    await bumpCollectorMetric(context.env.STATS_DB,day,{rejected:1,timestamp:serverTs});
    return json({error:checked.error},400,corsHeaders(origin));
  }

  const event=checked.event;
  const identityCheck=validateCollectorIdentity(origin,event);
  if(!identityCheck.ok){
    await bumpCollectorMetric(context.env.STATS_DB,day,{rejected:1,timestamp:serverTs});
    return json({error:identityCheck.error},400,corsHeaders(origin));
  }

  // Anonymous rate control: raw IP is never persisted.
  {
    const ip=context.request.headers.get('CF-Connecting-IP')||'unknown';
    const nowSeconds=Math.floor(now.getTime()/1000);
    const windowStarted=Math.floor(nowSeconds/600)*600;
    const rateKey=await sha256('collector-rate|'+ip+'|'+windowStarted+'|'+context.env.AUTH_PEPPER);
    const rate=await context.env.STATS_DB.prepare('SELECT event_count FROM collector_rate WHERE rate_key=?').bind(rateKey).first();
    if(Number(rate?.event_count||0)>=200){
      await bumpCollectorMetric(context.env.STATS_DB,day,{rejected:1,timestamp:serverTs});
      return new Response(null,{status:204,headers:corsHeaders(origin)});
    }
    await context.env.STATS_DB.prepare(
      'INSERT INTO collector_rate(rate_key,window_started,event_count) VALUES(?,?,1) ON CONFLICT(rate_key) DO UPDATE SET event_count=event_count+1'
    ).bind(rateKey,windowStarted).run();
    if(Math.random()<0.01)await context.env.STATS_DB.prepare('DELETE FROM collector_rate WHERE window_started<?').bind(windowStarted-7200).run();
  }

  try{
    // Reject a forged reuse of an existing session under a different anonymous visitor.
    const existingSession=await context.env.STATS_DB.prepare('SELECT visitor_id FROM sessions WHERE session_id=? LIMIT 1').bind(event.session_id).first();
    if(existingSession&&String(existingSession.visitor_id)!==event.visitor_id){
      await bumpCollectorMetric(context.env.STATS_DB,day,{rejected:1,timestamp:serverTs});
      return json({error:'session_visitor_mismatch'},409,corsHeaders(origin));
    }

    // Server-side canonical truth: first acquisition and session-entry values never mutate.
    await context.env.STATS_DB.batch([
      context.env.STATS_DB.prepare(
        'INSERT OR IGNORE INTO visitors(visitor_id,acquisition_source,acquisition_campaign,first_seen_at,first_seen_day_et) VALUES(?,?,?,?,?)'
      ).bind(event.visitor_id,event.acquisition_source,event.acquisition_campaign,serverTs,day),
      context.env.STATS_DB.prepare(
        'INSERT OR IGNORE INTO sessions(session_id,visitor_id,session_entry,session_campaign,display_mode,first_seen_at,first_seen_day_et) VALUES(?,?,?,?,?,?,?)'
      ).bind(event.session_id,event.visitor_id,event.session_entry,event.session_campaign,event.display_mode,serverTs,day)
    ]);
    const eventResult=await context.env.STATS_DB.prepare(
      'INSERT OR IGNORE INTO events(event_id,visitor_id,session_id,event_type,acquisition_source,acquisition_campaign,session_entry,session_campaign,display_mode,language,app_version,device_category,browser,action_name,target,client_ts,server_ts,server_day_et) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).bind(
      event.event_id,event.visitor_id,event.session_id,event.event_type,event.acquisition_source,event.acquisition_campaign,event.session_entry,event.session_campaign,
      event.display_mode,event.language,event.app_version,event.device_category,event.browser,event.action_name,event.target,event.client_ts||null,serverTs,day
    ).run();
    const inserted=Number(eventResult?.meta?.changes||0)>0;
    const clientTime=event.client_ts?Date.parse(event.client_ts):NaN;
    const delayed=Number.isFinite(clientTime)&&now.getTime()-clientTime>120000?1:0;
    await bumpCollectorMetric(context.env.STATS_DB,day,{
      accepted:inserted?1:0,duplicates:inserted?0:1,delayed,timestamp:serverTs
    });
    return new Response(null,{status:204,headers:corsHeaders(origin)});
  }catch(error){
    console.error('[MPDGI Stats] collector D1 failure',error);
    return json({error:'collector_unavailable'},503,corsHeaders(origin));
  }
}
