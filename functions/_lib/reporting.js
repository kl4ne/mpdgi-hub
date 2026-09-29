import {easternDay} from './validation.js';

const PRESETS={ '7d':7,'30d':30,'90d':90,'365d':365 };
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;

function shiftDay(day,delta){
  const date=new Date(day+'T12:00:00Z');
  date.setUTCDate(date.getUTCDate()+delta);
  return date.toISOString().slice(0,10);
}
function daysBetween(from,to){
  return Math.floor((Date.parse(to+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000)+1;
}
function monthStart(day){return day.slice(0,8)+'01';}
function yearStart(day){return day.slice(0,4)+'-01-01';}
export function resolveRange(urlString){
  const url=new URL(urlString);
  const requested=url.searchParams.get('preset')||'30d';
  const preset=(PRESETS[requested]||requested==='month'||requested==='year'||requested==='custom')?requested:'30d';
  const today=easternDay(new Date());
  let from,to=today,days=30;
  const customFrom=url.searchParams.get('from'),customTo=url.searchParams.get('to');

  if(DATE_RE.test(customFrom||'')&&DATE_RE.test(customTo||'')&&customFrom<=customTo){
    const count=daysBetween(customFrom,customTo);
    if(count>=1&&count<=366){from=customFrom;to=customTo;days=count;}
    else{days=30;from=shiftDay(to,-29);}
  }else if(preset==='month'){
    from=monthStart(today);days=daysBetween(from,to);
  }else if(preset==='year'){
    from=yearStart(today);days=daysBetween(from,to);
  }else{
    days=PRESETS[preset]||30;
    from=shiftDay(to,-(days-1));
  }

  const previousTo=shiftDay(from,-1),previousFrom=shiftDay(previousTo,-(days-1));
  return {preset,from,to,days,previous_from:previousFrom,previous_to:previousTo};
}
function pct(current,previous){
  const c=Number(current)||0,p=Number(previous)||0;
  if(p===0)return c===0?0:null;
  return ((c-p)/p)*100;
}
function one(result){return result?.results?.[0]||{};}
function rows(result){return Array.isArray(result?.results)?result.results:[];}
function normalize(rowsInput,keys){
  const map=new Map(rowsInput.map(row=>[String(row.key),Number(row.value)||0]));
  return keys.map(key=>({key,value:map.get(key)||0}));
}
function fillDaily(input,from,to){
  const map=new Map(input.map(row=>[String(row.key),Number(row.value)||0])),out=[];
  for(let day=from;day<=to;day=shiftDay(day,1))out.push({day,value:map.get(day)||0});
  return out;
}

export async function getDashboardData(env,urlString){
  if(!env.STATS_DB)throw Object.assign(new Error('database_not_configured'),{status:503});
  const range=resolveRange(urlString);
  const summarySql=`SELECT
    COUNT(DISTINCT e.session_id) AS visits,
    COUNT(DISTINCT e.visitor_id) AS unique_visitors,
    COUNT(DISTINCT CASE WHEN s.display_mode='pwa' THEN e.session_id END) AS pwa_sessions,
    SUM(CASE WHEN e.event_type='page_view' THEN 1 ELSE 0 END) AS page_views
    FROM events e LEFT JOIN sessions s ON s.session_id=e.session_id
    WHERE e.server_day_et BETWEEN ? AND ?`;
  const db=env.STATS_DB;
  const statements=[
    db.prepare(summarySql).bind(range.from,range.to),
    db.prepare(summarySql).bind(range.previous_from,range.previous_to),
    db.prepare('SELECT server_day_et AS key,COUNT(DISTINCT session_id) AS value FROM events WHERE server_day_et BETWEEN ? AND ? GROUP BY server_day_et ORDER BY server_day_et').bind(range.from,range.to),
    db.prepare('SELECT v.acquisition_source AS key,COUNT(DISTINCT e.visitor_id) AS value FROM events e JOIN visitors v ON v.visitor_id=e.visitor_id WHERE e.server_day_et BETWEEN ? AND ? GROUP BY v.acquisition_source').bind(range.from,range.to),
    db.prepare('SELECT s.session_entry AS key,COUNT(DISTINCT e.session_id) AS value FROM events e JOIN sessions s ON s.session_id=e.session_id WHERE e.server_day_et BETWEEN ? AND ? GROUP BY s.session_entry').bind(range.from,range.to),
    db.prepare('SELECT s.display_mode AS key,COUNT(DISTINCT e.session_id) AS value FROM events e JOIN sessions s ON s.session_id=e.session_id WHERE e.server_day_et BETWEEN ? AND ? GROUP BY s.display_mode').bind(range.from,range.to),
    db.prepare('SELECT device_category AS key,COUNT(DISTINCT session_id) AS value FROM events WHERE server_day_et BETWEEN ? AND ? GROUP BY device_category').bind(range.from,range.to),
    db.prepare('SELECT browser AS key,COUNT(DISTINCT session_id) AS value FROM events WHERE server_day_et BETWEEN ? AND ? GROUP BY browser').bind(range.from,range.to),
    db.prepare('SELECT language AS key,COUNT(DISTINCT session_id) AS value FROM events WHERE server_day_et BETWEEN ? AND ? GROUP BY language').bind(range.from,range.to),
    db.prepare("SELECT action_name AS key,COUNT(*) AS value FROM events WHERE server_day_et BETWEEN ? AND ? AND event_type='action' AND action_name<>'' GROUP BY action_name ORDER BY value DESC LIMIT 12").bind(range.from,range.to),
    db.prepare("SELECT CASE WHEN v.first_seen_day_et BETWEEN ? AND ? THEN 'new' ELSE 'returning' END AS key,COUNT(DISTINCT e.visitor_id) AS value FROM events e JOIN visitors v ON v.visitor_id=e.visitor_id WHERE e.server_day_et BETWEEN ? AND ? GROUP BY key").bind(range.from,range.to,range.from,range.to),
    db.prepare("SELECT v.acquisition_campaign AS key,COUNT(DISTINCT e.visitor_id) AS value FROM events e JOIN visitors v ON v.visitor_id=e.visitor_id WHERE e.server_day_et BETWEEN ? AND ? AND v.acquisition_campaign<>'' GROUP BY v.acquisition_campaign ORDER BY value DESC LIMIT 12").bind(range.from,range.to),
    db.prepare('SELECT MAX(server_ts) AS last_event_at FROM events')
  ];
  const result=await db.batch(statements);
  const current=one(result[0]),previous=one(result[1]),last=one(result[12]);
  const summary={
    visits:Number(current.visits)||0,
    unique_visitors:Number(current.unique_visitors)||0,
    pwa_sessions:Number(current.pwa_sessions)||0,
    page_views:Number(current.page_views)||0
  };
  const previousSummary={
    visits:Number(previous.visits)||0,
    unique_visitors:Number(previous.unique_visitors)||0,
    pwa_sessions:Number(previous.pwa_sessions)||0,
    page_views:Number(previous.page_views)||0
  };
  return {
    generated_at:new Date().toISOString(),
    range,
    summary,
    previous_summary:previousSummary,
    comparison:{
      visits_pct:pct(summary.visits,previousSummary.visits),
      unique_visitors_pct:pct(summary.unique_visitors,previousSummary.unique_visitors),
      pwa_sessions_pct:pct(summary.pwa_sessions,previousSummary.pwa_sessions),
      page_views_pct:pct(summary.page_views,previousSummary.page_views)
    },
    daily_visits:fillDaily(rows(result[2]).map(r=>({key:r.key,value:r.value})),range.from,range.to),
    acquisition_sources:normalize(rows(result[3]),['nfc','qr','link','unattributed']),
    session_entries:normalize(rows(result[4]),['nfc','qr','link','web','pwa']),
    display_modes:normalize(rows(result[5]),['pwa','browser']),
    devices:normalize(rows(result[6]),['mobile','desktop','tablet','other']),
    browsers:normalize(rows(result[7]),['edge','chrome','safari','firefox','other']),
    languages:normalize(rows(result[8]),['es','en','other']),
    top_actions:rows(result[9]).map(r=>({key:String(r.key),value:Number(r.value)||0})),
    visitor_mix:normalize(rows(result[10]),['new','returning']),
    campaigns:rows(result[11]).map(r=>({key:String(r.key),value:Number(r.value)||0})),
    health:{collector:'operational',database:'operational',last_event_at:last.last_event_at||null}
  };
}

function csvCell(value){
  const text=String(value??'');
  return /[",\n]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;
}
export function dashboardCsv(data){
  const lines=[['Section','Category','Value']];
  lines.push(['Summary','Visits (Sessions)',data.summary.visits]);
  lines.push(['Summary','Estimated Unique Visitors',data.summary.unique_visitors]);
  lines.push(['Summary','PWA Sessions',data.summary.pwa_sessions]);
  lines.push(['Summary','Page Views',data.summary.page_views]);
  for(const item of data.acquisition_sources)lines.push(['Acquisition Source',item.key,item.value]);
  for(const item of data.session_entries)lines.push(['Session Entry',item.key,item.value]);
  for(const item of data.display_modes)lines.push(['Display Mode',item.key,item.value]);
  for(const item of data.devices)lines.push(['Devices',item.key,item.value]);
  for(const item of data.browsers)lines.push(['Browsers',item.key,item.value]);
  for(const item of data.languages)lines.push(['Languages',item.key,item.value]);
  for(const item of data.top_actions)lines.push(['Top Actions',item.key,item.value]);
  for(const item of data.visitor_mix)lines.push(['Visitor Mix',item.key,item.value]);
  for(const item of data.campaigns)lines.push(['Campaigns',item.key,item.value]);
  for(const item of data.daily_visits)lines.push(['Daily Visits',item.day,item.value]);
  return lines.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
