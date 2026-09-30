import {easternDay} from './validation.js';
import {ensureCampaignSchema} from './schema.js';

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
  await ensureCampaignSchema(env);
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
    db.prepare(`SELECT c.id,c.name,c.slug,c.source,c.created_at,
      (SELECT COUNT(DISTINCT s.session_id) FROM sessions s WHERE s.session_campaign=c.slug AND s.session_entry=c.source AND s.first_seen_day_et BETWEEN ? AND ?) AS sessions,
      (SELECT COUNT(DISTINCT s.visitor_id) FROM sessions s WHERE s.session_campaign=c.slug AND s.session_entry=c.source AND s.first_seen_day_et BETWEEN ? AND ?) AS visitors,
      (SELECT COUNT(DISTINCT v.visitor_id) FROM visitors v WHERE v.acquisition_campaign=c.slug AND v.acquisition_source=c.source AND v.first_seen_day_et BETWEEN ? AND ?) AS acquired_visitors,
      (SELECT MAX(s.first_seen_at) FROM sessions s WHERE s.session_campaign=c.slug AND s.session_entry=c.source AND s.first_seen_day_et BETWEEN ? AND ?) AS last_activity_at
      FROM campaigns c WHERE c.active=1 ORDER BY c.created_at DESC LIMIT 100`).bind(
        range.from,range.to,range.from,range.to,range.from,range.to,range.from,range.to
      ),
    db.prepare('SELECT MAX(server_ts) AS last_event_at FROM events'),
    db.prepare('SELECT session_id,first_seen_at FROM sessions WHERE first_seen_day_et BETWEEN ? AND ?').bind(range.from,range.to),
    db.prepare('SELECT COALESCE(SUM(received),0) AS received,COALESCE(SUM(accepted),0) AS accepted,COALESCE(SUM(duplicates),0) AS duplicates,COALESCE(SUM(rejected),0) AS rejected,COALESCE(SUM(delayed),0) AS delayed,MAX(last_received_at) AS last_received_at FROM collector_metrics WHERE day_et BETWEEN ? AND ?').bind(range.from,range.to),
    db.prepare('SELECT COUNT(*) AS stored,COUNT(DISTINCT event_id) AS unique_event_ids,COALESCE(SUM(CASE WHEN client_ts<>'' AND julianday(server_ts)-julianday(client_ts)>0.0013888889 THEN 1 ELSE 0 END),0) AS delayed_events FROM events WHERE server_day_et BETWEEN ? AND ?').bind(range.from,range.to)
  ];
  const result=await db.batch(statements);
  const current=one(result[0]),previous=one(result[1]),last=one(result[12]);
  const sessionTimes=rows(result[13]);
  const metricQuality=one(result[14]);
  const eventQuality=one(result[15]);
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
    campaigns:rows(result[11]).map(r=>({
      id:String(r.id||''),name:String(r.name||r.slug||''),slug:String(r.slug||''),source:String(r.source||''),
      created_at:r.created_at||null,sessions:Number(r.sessions)||0,visitors:Number(r.visitors)||0,
      acquired_visitors:Number(r.acquired_visitors)||0,last_activity_at:r.last_activity_at||null
    })),
    activity:buildActivityInsights(sessionTimes),
    data_quality:{
      events_received:Number(metricQuality.received)||Number(eventQuality.stored)||0,
      events_stored:Number(eventQuality.stored)||0,
      unique_event_ids:Number(eventQuality.unique_event_ids)||0,
      duplicates_prevented:Number(metricQuality.duplicates)||0,
      rejected:Number(metricQuality.rejected)||0,
      delayed_events:Math.max(Number(metricQuality.delayed)||0,Number(eventQuality.delayed_events)||0),
      last_received_at:metricQuality.last_received_at||last.last_event_at||null
    },
    health:{collector:'operational',database:'operational',last_event_at:last.last_event_at||null}
  };
}

function buildActivityInsights(sessionRows){
  const hourly=Array.from({length:24},(_,hour)=>({key:String(hour),value:0}));
  const weekday=Array.from({length:7},(_,day)=>({key:String(day),value:0}));
  const weekdayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  for(const row of sessionRows){
    const ts=Date.parse(row.first_seen_at||'');
    if(!Number.isFinite(ts))continue;
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(new Date(ts));
    const hour=Number(parts.find(p=>p.type==='hour')?.value);
    const weekdayName=parts.find(p=>p.type==='weekday')?.value||'';
    const day=weekdayNames.findIndex(name=>name.startsWith(weekdayName));
    if(Number.isInteger(hour)&&hour>=0&&hour<24)hourly[hour].value++;
    if(day>=0)weekday[day].value++;
  }
  const peakHour=hourly.reduce((best,item)=>item.value>best.value?item:best,{key:'0',value:0});
  const peakDay=weekday.reduce((best,item)=>item.value>best.value?item:best,{key:'0',value:0});
  return {
    hourly_sessions:hourly,
    weekday_sessions:weekday,
    peak_hour:Number(peakHour.key)||0,
    peak_hour_sessions:Number(peakHour.value)||0,
    peak_weekday:Number(peakDay.key)||0,
    peak_weekday_sessions:Number(peakDay.value)||0,
    sunday_sessions:weekday[0].value,
    wednesday_sessions:weekday[3].value
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
  for(const item of data.campaigns){
    const label=item.name+' ['+item.source+']';
    lines.push(['Campaign Sessions',label,item.sessions]);
    lines.push(['Campaign Estimated Visitors',label,item.visitors]);
    lines.push(['Campaign First-touch Visitors',label,item.acquired_visitors]);
  }
  for(const item of data.daily_visits)lines.push(['Daily Visits',item.day,item.value]);
  for(const item of (data.activity?.hourly_sessions||[]))lines.push(['Hourly Activity',item.key+':00',item.value]);
  for(const item of (data.activity?.weekday_sessions||[]))lines.push(['Weekday Activity',item.key,item.value]);
  lines.push(['Activity Insight','Peak Hour',data.activity?.peak_hour??'']);
  lines.push(['Activity Insight','Peak Weekday',data.activity?.peak_weekday??'']);
  lines.push(['Activity Insight','Sunday Sessions',data.activity?.sunday_sessions??0]);
  lines.push(['Activity Insight','Wednesday Sessions',data.activity?.wednesday_sessions??0]);
  lines.push(['Data Quality','Events Received',data.data_quality?.events_received??0]);
  lines.push(['Data Quality','Events Stored',data.data_quality?.events_stored??0]);
  lines.push(['Data Quality','Duplicates Prevented',data.data_quality?.duplicates_prevented??0]);
  lines.push(['Data Quality','Rejected',data.data_quality?.rejected??0]);
  lines.push(['Data Quality','Delayed Events',data.data_quality?.delayed_events??0]);
  return lines.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
