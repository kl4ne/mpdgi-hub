import {json,methodNotAllowed} from '../_lib/http.js';
import {requireUser} from '../_lib/auth.js';
import {getDashboardData} from '../_lib/reporting.js';

export async function onRequest(context){
  if(context.request.method!=='GET')return methodNotAllowed('GET');
  const auth=await requireUser(context);if(auth.response)return auth.response;
  try{
    const data=await getDashboardData(context.env,context.request.url);
    return json(data);
  }catch(error){
    console.error('[MPDGI Stats] dashboard query failed',error);
    return json({error:error.message||'dashboard_unavailable'},error.status||503);
  }
}
