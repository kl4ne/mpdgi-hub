import {NO_STORE_HEADERS,json,methodNotAllowed} from '../_lib/http.js';
import {requireUser} from '../_lib/auth.js';
import {getDashboardData,dashboardCsv} from '../_lib/reporting.js';

export async function onRequest(context){
  if(context.request.method!=='GET')return methodNotAllowed('GET');
  const auth=await requireUser(context);if(auth.response)return auth.response;
  try{
    const data=await getDashboardData(context.env,context.request.url);
    const csv=dashboardCsv(data);
    const filename='mpdgi-stats-'+data.range.from+'_to_'+data.range.to+'.csv';
    return new Response(csv,{status:200,headers:{
      ...NO_STORE_HEADERS,
      'Content-Type':'text/csv; charset=utf-8',
      'Content-Disposition':'attachment; filename="'+filename+'"',
      'X-Filename':filename
    }});
  }catch(error){
    console.error('[MPDGI Stats] export failed',error);
    return json({error:error.message||'export_unavailable'},error.status||503);
  }
}
