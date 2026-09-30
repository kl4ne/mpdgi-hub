import {json,methodNotAllowed} from '../_lib/http.js';
import {requireUser} from '../_lib/auth.js';
import {ensureCampaignSchema} from '../_lib/schema.js';

export async function onRequest(context){
  if(context.request.method!=='GET')return methodNotAllowed('GET');
  const auth=await requireUser(context);if(auth.response)return auth.response;
  await ensureCampaignSchema(context.env);
  const result=await context.env.STATS_DB.prepare(
    'SELECT id,name,slug,source,active,created_at,created_by FROM campaigns WHERE active=1 ORDER BY created_at DESC LIMIT 100'
  ).all();
  return json({campaigns:result.results||[]});
}
