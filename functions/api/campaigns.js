import {json,isSameOrigin,methodNotAllowed} from '../_lib/http.js';
import {requireUser,requireRole} from '../_lib/auth.js';
import {ensureCampaignSchema} from '../_lib/schema.js';

const VALID_SOURCES=new Set(['link','qr','nfc']);

function cleanName(value){
  return String(value||'').trim().replace(/\s+/g,' ').slice(0,64);
}
function slugify(value){
  return String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,64);
}
function buildUrl(source,slug){
  const url=new URL('https://hub.mpdgi.org/');
  url.searchParams.set('src',source);
  url.searchParams.set('campaign',slug);
  return url.toString();
}
function shape(row){
  return {...row,url:buildUrl(row.source,row.slug)};
}

export async function onRequest(context){
  if(!['GET','POST'].includes(context.request.method))return methodNotAllowed('GET, POST');
  if(!context.env.STATS_DB)return json({error:'service_not_configured'},503);
  if(context.request.method==='POST'&&!isSameOrigin(context.request))return json({error:'origin_not_allowed'},403);
  const auth=context.request.method==='POST'
    ?await requireRole(context,['owner','admin'])
    :await requireUser(context);
  if(auth.response)return auth.response;
  await ensureCampaignSchema(context.env);
  const db=context.env.STATS_DB;

  if(context.request.method==='GET'){
    const result=await db.prepare(
      'SELECT id,name,slug,source,active,created_at,created_by FROM campaigns WHERE active=1 ORDER BY created_at DESC LIMIT 100'
    ).all();
    return json({campaigns:(result.results||[]).map(shape)});
  }

  const raw=await context.request.text();
  if(raw.length>4096)return json({error:'payload_too_large'},413);
  let body;try{body=JSON.parse(raw||'{}');}catch{return json({error:'invalid_json'},400);}
  const name=cleanName(body.name);
  const source=String(body.source||'').trim().toLowerCase();
  const slug=slugify(body.slug||name);
  if(!name||!slug)return json({error:'campaign_name_required'},400);
  if(!VALID_SOURCES.has(source))return json({error:'invalid_campaign_source'},400);

  const existing=await db.prepare(
    'SELECT id,name,slug,source,active,created_at,created_by FROM campaigns WHERE slug=? AND source=? LIMIT 1'
  ).bind(slug,source).first();
  if(existing)return json({created:false,campaign:shape(existing)});

  const id=crypto.randomUUID(),createdAt=new Date().toISOString();
  await db.prepare(
    'INSERT INTO campaigns(id,name,slug,source,active,created_at,created_by) VALUES(?,?,?,?,1,?,?)'
  ).bind(id,name,slug,source,createdAt,auth.user.id).run();

  return json({
    created:true,
    campaign:{id,name,slug,source,active:1,created_at:createdAt,created_by:auth.user.id,url:buildUrl(source,slug)}
  },201);
}
