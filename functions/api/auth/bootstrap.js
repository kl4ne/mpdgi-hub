import {json,readJson,isSameOrigin,methodNotAllowed} from '../../_lib/http.js';
import {createTargetPasswordRecord,randomToken,constantTimeEqual} from '../../_lib/auth.js';

export async function onRequest(context){
  if(context.request.method!=='POST')return methodNotAllowed('POST');
  if(context.env.BOOTSTRAP_ENABLED!=='true')return json({error:'not_found'},404);
  if(!isSameOrigin(context.request))return json({error:'origin_not_allowed'},403);
  if(!context.env.STATS_DB||!context.env.AUTH_PEPPER||!context.env.BOOTSTRAP_SECRET)return json({error:'service_not_configured'},503);
  const supplied=context.request.headers.get('X-Bootstrap-Secret')||'';
  if(!constantTimeEqual(supplied,context.env.BOOTSTRAP_SECRET))return json({error:'forbidden'},403);

  const count=await context.env.STATS_DB.prepare('SELECT COUNT(*) AS count FROM admin_users').first();
  if(Number(count?.count||0)>0)return json({error:'bootstrap_closed'},409);

  let body;try{body=await readJson(context.request,4096);}catch(error){return json({error:error.message},error.status||400);}
  const email=String(body.email||'').trim().toLowerCase();
  const password=String(body.password||'');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return json({error:'invalid_email'},400);
  if(password.length<16||password.length>128)return json({error:'password_must_be_16_to_128_characters'},400);

  const record=await createTargetPasswordRecord(password,context.env.AUTH_PEPPER);
  const id=randomToken(18);
  await context.env.STATS_DB.prepare('INSERT INTO admin_users(id,email,password_hash,password_salt,password_scheme,role,active) VALUES(?,?,?,?,?,?,1)')
    .bind(id,email,record.password_hash,record.password_salt,record.password_scheme,'owner').run();
  return json({ok:true,email,role:'owner'},201);
}
