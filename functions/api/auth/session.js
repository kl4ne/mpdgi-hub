import {json,methodNotAllowed} from '../../_lib/http.js';
import {requireUser} from '../../_lib/auth.js';

export async function onRequest(context){
  if(context.request.method!=='GET')return methodNotAllowed('GET');
  if(!context.env.STATS_DB)return json({error:'service_not_configured'},503);
  const auth=await requireUser(context);if(auth.response)return auth.response;
  return json({authenticated:true,user:{email:auth.user.email,role:auth.user.role},expires_at:auth.user.expires_at});
}
