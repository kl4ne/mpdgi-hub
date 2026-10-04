export const VALID_EVENT_TYPES=new Set(['session_start','page_view','action']);
export const VALID_ACQUISITION_SOURCES=new Set(['nfc','qr','link','unattributed']);
export const VALID_SESSION_ENTRIES=new Set(['nfc','qr','link','web','pwa']);
export const VALID_DISPLAY_MODES=new Set(['pwa','browser']);
export const VALID_DEVICES=new Set(['mobile','desktop','tablet','other']);
export const VALID_BROWSERS=new Set(['edge','chrome','safari','firefox','other']);
export const VALID_LANGUAGES=new Set(['es','en','other']);

const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTION_RE=/^[a-z0-9_:-]{0,80}$/;
const VERSION_RE=/^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][a-z0-9.-]+)?$/i;
const CARD_ORIGIN_TARGETS=new Map([
  ['https://rscard.mpdgi.org','business_card:ruben-suarez'],
  ['https://npcard.mpdgi.org','business_card:nancy-pagan'],
  ['https://npcard.pages.dev','business_card:nancy-pagan']
]);
const CARD_ACTIONS=new Set(['bc_save_contact','bc_call','bc_text','bc_directions','bc_website','bc_share','bc_flip','bc_language']);

function clean(value,max=160){return String(value||'').trim().slice(0,max);}
function campaign(value){return clean(value,64).toLowerCase().replace(/[^a-z0-9_-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}

export function validateEvent(input){
  if(!input||typeof input!=='object')return {ok:false,error:'invalid_event'};
  const event={
    schema_version:Number(input.schema_version),
    event_id:clean(input.event_id,64),
    visitor_id:clean(input.visitor_id,64),
    session_id:clean(input.session_id,64),
    event_type:clean(input.event_type,32),
    acquisition_source:clean(input.acquisition_source,32),
    acquisition_campaign:campaign(input.acquisition_campaign),
    session_campaign:campaign(input.session_campaign),
    session_entry:clean(input.session_entry,32),
    display_mode:clean(input.display_mode,32),
    language:clean(input.language,16),
    app_version:clean(input.app_version,32),
    device_category:clean(input.device_category,32),
    browser:clean(input.browser,32),
    action_name:clean(input.action_name,80),
    target:clean(input.target,160),
    client_ts:clean(input.client_ts,48)
  };
  if(event.schema_version!==1)return {ok:false,error:'unsupported_schema'};
  if(!UUID_RE.test(event.event_id)||!UUID_RE.test(event.visitor_id)||!UUID_RE.test(event.session_id))return {ok:false,error:'invalid_identifier'};
  if(!VALID_EVENT_TYPES.has(event.event_type))return {ok:false,error:'invalid_event_type'};
  if(!VALID_ACQUISITION_SOURCES.has(event.acquisition_source))return {ok:false,error:'invalid_acquisition_source'};
  if(!VALID_SESSION_ENTRIES.has(event.session_entry))return {ok:false,error:'invalid_session_entry'};
  if(!VALID_DISPLAY_MODES.has(event.display_mode))return {ok:false,error:'invalid_display_mode'};
  if(!VALID_DEVICES.has(event.device_category))return {ok:false,error:'invalid_device'};
  if(!VALID_BROWSERS.has(event.browser))return {ok:false,error:'invalid_browser'};
  if(!VALID_LANGUAGES.has(event.language))event.language='other';
  if(!VERSION_RE.test(event.app_version))return {ok:false,error:'invalid_version'};
  if(!ACTION_RE.test(event.action_name))return {ok:false,error:'invalid_action'};
  if(event.event_type==='action'&&!event.action_name)return {ok:false,error:'missing_action'};
  if(event.client_ts&&Number.isNaN(Date.parse(event.client_ts)))event.client_ts='';
  return {ok:true,event};
}

export function validateCollectorIdentity(origin,event){
  const expectedTarget=CARD_ORIGIN_TARGETS.get(String(origin||''));
  if(!expectedTarget)return {ok:true};
  if(event.target!==expectedTarget)return {ok:false,error:'invalid_target'};
  if(event.event_type==='action'&&!CARD_ACTIONS.has(event.action_name))return {ok:false,error:'invalid_action'};
  if(event.event_type!=='action'&&event.action_name)return {ok:false,error:'invalid_action'};
  return {ok:true};
}

export function isLikelyBot(userAgent){
  const ua=String(userAgent||'').toLowerCase();
  return /(bot|crawler|spider|slurp|headlesschrome|lighthouse|playwright|puppeteer|selenium|facebookexternalhit|discordbot|whatsapp|preview)/.test(ua);
}

export function easternDay(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get=type=>parts.find(p=>p.type===type)?.value||'00';
  return get('year')+'-'+get('month')+'-'+get('day');
}
