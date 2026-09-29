import {json,isSameOrigin,methodNotAllowed,getCookie} from '../../_lib/http.js';
import {sha256,clearSessionCookie} from '../../_lib/auth.js';

export async function onRequest(context){
  if(context.request.method!=='POST')return methodNotAllowed('POST');
  if(!isSameOrigin(context.request))return json({error:'origin_not_allowed'},403);
  const token=getCookie(context.request,'mpdgi_stats_session');
  if(token&&context.env.STATS_DB){
    const hash=await sha256(token);
    await context.env.STATS_DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(hash).run();
  }
  return json({ok:true},200,{'Set-Cookie':clearSessionCookie()});
}
