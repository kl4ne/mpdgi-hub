'use strict';

const HUB_VERSION=globalThis.MPDGI_HUB_VERSION||'dev';
const STORAGE_LANGUAGE_KEY='mpdgiHubLanguage';
const STORAGE_VERSION_KEY='mpdgiHubVersion';
const ANALYTICS_SCHEMA_VERSION=1;
const ANALYTICS_QUEUE_KEY='mpdgiAnalyticsQueue';
const ANALYTICS_VISITOR_KEY='mpdgiAnalyticsVisitorId';
const ANALYTICS_FIRST_SOURCE_KEY='mpdgiAnalyticsFirstSource';
const ANALYTICS_FIRST_CAMPAIGN_KEY='mpdgiAnalyticsFirstCampaign';
const ANALYTICS_SESSION_KEY='mpdgiAnalyticsSessionId';
const ANALYTICS_SESSION_LAST_KEY='mpdgiAnalyticsSessionLast';
const ANALYTICS_SESSION_ENTRY_KEY='mpdgiAnalyticsSessionEntry';
const ANALYTICS_SESSION_TIMEOUT=30*60*1000;
const ANALYTICS_MAX_QUEUE=100;
const ANALYTICS_COOKIE_MAX_AGE=60*60*24*730;
const VALID_ACQUISITION_SOURCES=new Set(['nfc','qr','link','unattributed']);
const VALID_SESSION_ENTRIES=new Set(['nfc','qr','link','web','pwa']);
const COPYRIGHT_START_YEAR=2026;
const VALID_THEMES=new Set(['blue','green','purple','gold','teal','social','website','about']);
const VALID_MODAL_TYPES=new Set(['give','social','bible','about']);

const UI={
  es:{
    linksHeading:'Accesos principales',sunday:'Domingos',wednesday:'Miércoles',install:'Instalar',about:'Acerca de',skip:'Saltar al contenido',visitInfoLabel:'Información de la iglesia',logoAlt:'Logo oficial de Ministerio Plenitud de Gracia',directionsLabel:'Abrir indicaciones para llegar a Ministerio Plenitud de Gracia',
    close:'Cerrar',offline:'Sin conexión • algunos enlaces externos no estarán disponibles',
    loadError:'No fue posible cargar los accesos. Visita mpdgi.org para continuar.',
    giveTitle:'Ofrendar',giveIntro:'Selecciona una opción segura para apoyar a Ministerio Plenitud de Gracia.',
    tithely:'Ofrendar con Tithe.ly',square:'Ofrendar con Square',acceptedCards:'Tarjetas aceptadas por Square',wallets:'También disponible con Square',zelle:'Zelle®',zelleTitle:'Cómo ofrendar con Zelle®',zelleInstruction:'Correo oficial de MPDGI',zelleStep1:'Abre la aplicación de tu banco y entra a Zelle®.',zelleStep2:'Selecciona Enviar o Send money.',zelleStep3:'Elige Añadir destinatario o Add new recipient.',zelleStep4:'Selecciona Email y usa el correo oficial que aparece abajo.',zelleStep5:'Verifica los datos del destinatario, escribe la cantidad y envía.',zelleNote:'Los nombres de los botones pueden variar según tu banco.',copy:'Copiar correo',copied:'Copiado',
    copyFailed:'No se pudo copiar. Mantén presionado el correo para copiarlo.',
    socialTitle:'Redes Sociales',socialIntro:'Selecciona una de nuestras plataformas oficiales.',
    facebook:'Facebook',instagram:'Instagram',youtube:'YouTube',tiktok:'TikTok',
    bibleTitle:'Biblia',bibleIntro:'Selecciona el idioma y la versión que deseas leer.',
    bibleSpanish:'Biblia en Español',bibleSpanishVersion:'Reina-Valera 1960 (RVR1960)',
    bibleEnglish:'Bible in English',bibleEnglishVersion:'King James Version (KJV)',
    aboutTitle:'Acerca de MPDGI Hub',
    aboutIntro:'Hub digital oficial preparado para NFC de Ministerio Plenitud de Gracia, creado para brindar acceso rápido a los servicios y recursos oficiales de la iglesia.',
    version:'Versión',website:'Sitio web oficial',external:'Servicios externos',
    externalText:'Tithe.ly, Square, ChMeetings, BibleGateway, YouTube, Facebook, Instagram y TikTok están sujetos a sus propios términos y políticas de privacidad.',
    privacy:'Privacidad',privacyText:'Este Hub no almacena contraseñas, información de pago ni información personal sensible.',
    developerCredit:'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright:'© {year} Ministerio Plenitud de Gracia. Todos los derechos reservados.',
    officialWebsite:'Abrir mpdgi.org',languageLabel:'Cambiar idioma a inglés'
  },
  en:{
    linksHeading:'Main access links',sunday:'Sundays',wednesday:'Wednesdays',install:'Install',about:'About',skip:'Skip to content',visitInfoLabel:'Church information',logoAlt:'Official logo of Ministerio Plenitud de Gracia',directionsLabel:'Get directions to Ministerio Plenitud de Gracia',
    close:'Close',offline:'Offline • some external links will not be available',
    loadError:'The hub links could not be loaded. Visit mpdgi.org to continue.',
    giveTitle:'Give',giveIntro:'Choose a secure option to support Ministerio Plenitud de Gracia.',
    tithely:'Give with Tithe.ly',square:'Give with Square',acceptedCards:'Cards accepted by Square',wallets:'Also available with Square',zelle:'Zelle®',zelleTitle:'How to give with Zelle®',zelleInstruction:'Official MPDGI email',zelleStep1:'Open your banking app and go to Zelle®.',zelleStep2:'Select Send or Send money.',zelleStep3:'Choose Add recipient or Add new recipient.',zelleStep4:'Select Email and use the official address shown below.',zelleStep5:'Verify the recipient details, enter the amount, and send.',zelleNote:'Button names may vary by bank.',copy:'Copy email',copied:'Copied',
    copyFailed:'Could not copy. Press and hold the email address to copy it.',
    socialTitle:'Social Media',socialIntro:'Choose one of our official platforms.',
    facebook:'Facebook',instagram:'Instagram',youtube:'YouTube',tiktok:'TikTok',
    bibleTitle:'Bible',bibleIntro:'Choose the language and version you want to read.',
    bibleSpanish:'Biblia en Español',bibleSpanishVersion:'Reina-Valera 1960 (RVR1960)',
    bibleEnglish:'Bible in English',bibleEnglishVersion:'King James Version (KJV)',
    aboutTitle:'About MPDGI Hub',
    aboutIntro:'Official NFC-ready digital hub for Ministerio Plenitud de Gracia, created to provide fast access to the church’s official services and resources.',
    version:'Version',website:'Official website',external:'External services',
    externalText:'Tithe.ly, Square, ChMeetings, BibleGateway, YouTube, Facebook, Instagram, and TikTok are subject to their respective terms and privacy policies.',
    privacy:'Privacy',privacyText:'This Hub does not store passwords, payment information, or sensitive personal information.',
    developerCredit:'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright:'© {year} Ministerio Plenitud de Gracia. All Rights Reserved.',
    officialWebsite:'Open mpdgi.org',languageLabel:'Change language to Spanish'
  }
};

const DEFAULT_CONFIG={
  version:HUB_VERSION,churchName:'Ministerio Plenitud de Gracia',
  tagline:'Yo no he venido a ser servido, sino a servir.',taglineEn:'I did not come to be served, but to serve.',
  scripture:'Mateo 20:28',scriptureEn:'Matthew 20:28',address:'1045 E Normandy Blvd, Deltona, FL 32725',
  sundayService:'10:00 AM',wednesdayBibleStudy:'7:00 PM',website:'https://mpdgi.org',
  memberPortal:'https://mpdgi.chmeetings.com',prayer:'https://mpdgi.org/oracion',
  ministries:'https://mpdgi.org/ministerios',youtube:'https://www.youtube.com/@ministerioplenituddegracia',
  facebook:'https://www.facebook.com/mpdginc',instagram:'https://www.instagram.com/mpdginc/',tiktok:'https://www.tiktok.com/@mpdginc',
  tithely:'https://tithe.ly/give_new/www/#/tithely/give-one-time/6513581',square:'https://square.link/u/8veQoUxF',zelle:'mpdginc@gmail.com',
  bibleSpanish:'https://www.biblegateway.com/versions/Reina-Valera-1960-RVR1960-Biblia/',
  bibleEnglish:'https://www.biblegateway.com/versions/King-James-Version-KJV-Bible/',
  defaultLanguage:'es',
  analyticsEnabled:true,
  analyticsCollector:'https://mpdgi-stats.pages.dev/api/collect'
};

const FALLBACK_LINKS=[
  {id:'members',order:1,title:{es:'Portal de Miembros',en:'Member Portal'},subtitle:{es:'ChMeetings',en:'ChMeetings'},url:'https://mpdgi.chmeetings.com',action:'direct',open:'new',theme:'blue',icon:'member'},
  {id:'give',order:2,title:{es:'Ofrendar',en:'Give'},subtitle:{es:'Tithe.ly • Square • Zelle',en:'Tithe.ly • Square • Zelle'},action:'modal',modal:'give',theme:'green',icon:'offering'},
  {id:'prayer',order:3,title:{es:'Petición de Oración',en:'Prayer Request'},subtitle:{es:'Envíanos tu petición',en:'Send us your request'},url:'https://mpdgi.org/oracion',action:'direct',open:'new',theme:'purple',icon:'prayer'},
  {id:'bible',order:4,title:{es:'Biblia',en:'Bible'},subtitle:{es:'Español • English',en:'Español • English'},action:'modal',modal:'bible',theme:'gold',icon:'bible'},
  {id:'ministries',order:5,title:{es:'Ministerios',en:'Ministries'},subtitle:{es:'Sirve con nosotros',en:'Serve with us'},url:'https://mpdgi.org/ministerios',action:'direct',open:'new',theme:'teal',icon:'ministry'},
  {id:'social',order:6,title:{es:'Redes Sociales',en:'Social Media'},subtitle:{es:'Facebook • Instagram • YouTube • TikTok',en:'Facebook • Instagram • YouTube • TikTok'},action:'modal',modal:'social',theme:'social',icon:'share'},
  {id:'website',order:7,title:{es:'Sitio Web',en:'Website'},subtitle:{es:'mpdgi.org',en:'mpdgi.org'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'website',icon:'website'},
  {id:'about',order:8,title:{es:'Acerca de',en:'About'},subtitle:{es:'Información del Hub',en:'Hub information'},action:'modal',modal:'about',theme:'about',icon:'about'}
];

const ICONS={
  member:[
    ['rect',{x:'3',y:'4',width:'18',height:'16',rx:'3'}],
    ['circle',{cx:'9',cy:'10',r:'2.2'}],
    ['path',{d:'M5.8 16c.9-2 2-3 3.2-3s2.3 1 3.2 3M14.5 9h3.5M14.5 13h3.5'}]
  ],
  offering:[
    ['path',{d:'M4 16.5h4l2.1 2H16l4-3.2c.8-.7.8-1.8.1-2.5-.6-.6-1.5-.7-2.2-.2l-3 2'}],
    ['path',{d:'M4 16.5V21h4l2.5-1.7'}],
    ['path',{d:'M12 11.5 8.8 8.4a2.5 2.5 0 0 1 3.5-3.6l.7.7.7-.7a2.5 2.5 0 0 1 3.5 3.6Z'}]
  ],
  prayer:[
    ['path',{d:'M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z'}],
    ['path',{d:'M12 13.2 9.6 11a1.8 1.8 0 0 1 2.5-2.6l.1.1.1-.1a1.8 1.8 0 0 1 2.5 2.6Z'}]
  ],
  bible:[
    ['path',{d:'M4 5.5c2.8-.8 5.2-.4 8 1.2v12c-2.8-1.6-5.2-2-8-1.2Z'}],
    ['path',{d:'M20 5.5c-2.8-.8-5.2-.4-8 1.2v12c2.8-1.6 5.2-2 8-1.2Z'}],
    ['path',{d:'M12 7v12M16 9v4M14 11h4'}]
  ],
  ministry:[
    ['circle',{cx:'12',cy:'12',r:'8.5'}],
    ['path',{d:'M12 6v12M8.5 9.5h7'}],
    ['path',{d:'M5.5 17.5 8 15M18.5 17.5 16 15'}]
  ],
  share:[
    ['circle',{cx:'6',cy:'12',r:'2.3'}],
    ['circle',{cx:'18',cy:'7',r:'2.3'}],
    ['circle',{cx:'18',cy:'17',r:'2.3'}],
    ['path',{d:'m8.1 11 7.7-3M8.1 13l7.7 3'}]
  ],
  website:[
    ['circle',{cx:'12',cy:'12',r:'8.5'}],
    ['path',{d:'M3.5 12h17M12 3.5c2.5 2.7 3.6 5.5 3.6 8.5S14.5 17.8 12 20.5M12 3.5C9.5 6.2 8.4 9 8.4 12s1.1 5.8 3.6 8.5'}]
  ],
  about:[
    ['circle',{cx:'12',cy:'12',r:'8.5'}],
    ['path',{d:'M12 10.5v6M12 7.2h.01'}]
  ],
  pin:[['path',{d:'M19.5 9.8c0 5.5-7.5 11.2-7.5 11.2S4.5 15.3 4.5 9.8a7.5 7.5 0 1 1 15 0Z'}],['circle',{cx:'12',cy:'9.8',r:'2.1'}]],
  clock:[['circle',{cx:'12',cy:'12',r:'8.5'}],['path',{d:'M12 7.5V12l3 1.8'}]],
  book:[['path',{d:'M4 5.5c2.8-.8 5.2-.4 8 1.2v12c-2.8-1.6-5.2-2-8-1.2ZM20 5.5c-2.8-.8-5.2-.4-8 1.2v12c2.8-1.6 5.2-2 8-1.2Z'}]]
};

function createIcon(name){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  (ICONS[name]||ICONS.website).forEach(([tag,attrs])=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);});
  return svg;
}

const SOCIAL_BRAND_ASSETS={
  facebook:'assets/brands/social/facebook.svg',
  instagram:'assets/brands/social/instagram.svg',
  youtube:'assets/brands/social/youtube.svg',
  tiktok:'assets/brands/social/tiktok.svg'
};
function createBrandMark(name){
  const wrap=document.createElement('span');wrap.className='brand-mark social-brand-'+name;wrap.setAttribute('aria-hidden','true');
  const src=SOCIAL_BRAND_ASSETS[name];if(src){const img=document.createElement('img');img.src=src;img.alt='';img.decoding='async';wrap.append(img);}
  return wrap;
}

function textElement(tag,className,value){const el=document.createElement(tag);if(className)el.className=className;el.textContent=value;return el;}
function safeHttpsUrl(value){try{const u=new URL(value,location.href);return u.protocol==='https:'?u.href:null;}catch{return null;}}
async function fetchJson(path,fallback){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(String(r.status));return await r.json();}catch(e){console.warn('[MPDGI Hub]',path,e);return fallback;}}
function translated(v){return v&&typeof v==='object'?(v[currentLanguage]||v.es||v.en||''):(typeof v==='string'?v:'');}
function copyrightYearRange(year=new Date().getFullYear()){
  const y=Number.isInteger(year)&&year>COPYRIGHT_START_YEAR?year:COPYRIGHT_START_YEAR;
  return y===COPYRIGHT_START_YEAR?String(COPYRIGHT_START_YEAR):`${COPYRIGHT_START_YEAR}–${y}`;
}
function copyrightText(language=currentLanguage,year=new Date().getFullYear()){
  const template=(UI[language==='en'?'en':'es']||UI.es).copyright;
  return template.replace('{year}',copyrightYearRange(year));
}
function isAppleMobile(){
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function directionsUrl(address){
  const q=encodeURIComponent(address||DEFAULT_CONFIG.address);
  return isAppleMobile()?`https://maps.apple.com/?daddr=${q}&dirflg=d`:`https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
function detectStoredVersionMismatch(){
  try{
    const stored=localStorage.getItem(STORAGE_VERSION_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY,HUB_VERSION);
    return Boolean(stored&&stored!==HUB_VERSION);
  }catch{return false;}
}

function storageGet(key){try{return localStorage.getItem(key);}catch{return null;}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true;}catch{return false;}}
function cookieGet(name){
  const prefix=name+'=';
  const part=document.cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(prefix));
  return part?decodeURIComponent(part.slice(prefix.length)):'';
}
function cookieSet(name,value,maxAge=ANALYTICS_COOKIE_MAX_AGE){
  const secure=location.protocol==='https:'?'; Secure':'';
  document.cookie=`${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}
function cookieDelete(name){
  const secure=location.protocol==='https:'?'; Secure':'';
  document.cookie=`${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}
function randomId(){
  if(crypto?.randomUUID)return crypto.randomUUID();
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const h=[...bytes].map(v=>v.toString(16).padStart(2,'0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
const ANALYTICS_UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validAnalyticsId(value){return ANALYTICS_UUID_RE.test(String(value||''));}
function normalizeSource(value){
  const v=String(value||'').trim().toLowerCase();
  return VALID_ACQUISITION_SOURCES.has(v)?v:null;
}
function normalizeCampaign(value){
  const v=String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'-').replace(/-+/g,'-').slice(0,64);
  return v||'';
}
function isStandaloneMode(){return Boolean(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true);}
function deviceCategory(){
  const ua=navigator.userAgent||'';
  const platform=navigator.platform||'';
  const touchPoints=Number(navigator.maxTouchPoints)||0;
  const ipadDesktopMode=/iPad/i.test(ua)||((/Macintosh|Mac OS X/i.test(ua)||/MacIntel/i.test(platform))&&touchPoints>1);
  if(ipadDesktopMode||/Tablet|Android(?!.*Mobile)/i.test(ua))return 'tablet';
  if(/Mobi|iPhone|iPod|Android/i.test(ua))return 'mobile';
  return 'desktop';
}
function browserFamily(){
  const ua=navigator.userAgent||'';
  if(/Edg\//.test(ua))return 'edge';
  if(/Firefox\//.test(ua))return 'firefox';
  if(/CriOS\//.test(ua))return 'chrome';
  if(/FxiOS\//.test(ua))return 'firefox';
  if(/Chrome\//.test(ua))return 'chrome';
  if(/Safari\//.test(ua))return 'safari';
  return 'other';
}
function analyticsIsEnabled(){
  return config.analyticsEnabled!==false&&Boolean(safeHttpsUrl(config.analyticsCollector))&&(location.hostname==='hub.mpdgi.org'||globalThis.__MPDGI_ANALYTICS_FORCE__===true);
}
function captureEntryHint(){
  let source=null,campaign='';
  try{
    const url=new URL(location.href);
    source=normalizeSource(url.searchParams.get('src'));
    campaign=normalizeCampaign(url.searchParams.get('campaign'));
    if(source||campaign){
      url.searchParams.delete('src');url.searchParams.delete('campaign');
      history.replaceState(history.state,'',url.pathname+(url.search||'')+(url.hash||''));
    }
  }catch{}
  const cookieSource=normalizeSource(cookieGet('mpdgi_entry_source'));
  const cookieCampaign=normalizeCampaign(cookieGet('mpdgi_entry_campaign'));
  if(!source&&cookieSource)source=cookieSource;
  if(!campaign&&cookieCampaign)campaign=cookieCampaign;
  cookieDelete('mpdgi_entry_source');cookieDelete('mpdgi_entry_campaign');
  return {source,campaign};
}
function resolveAnalyticsIdentity(entry){
  let visitorId=storageGet(ANALYTICS_VISITOR_KEY)||cookieGet('mpdgi_visitor_id');
  if(!validAnalyticsId(visitorId))visitorId=randomId();
  storageSet(ANALYTICS_VISITOR_KEY,visitorId);cookieSet('mpdgi_visitor_id',visitorId);

  let firstSource=normalizeSource(storageGet(ANALYTICS_FIRST_SOURCE_KEY))||normalizeSource(cookieGet('mpdgi_first_source'));
  if(!firstSource)firstSource=entry.source&&entry.source!=='unattributed'?entry.source:'unattributed';
  storageSet(ANALYTICS_FIRST_SOURCE_KEY,firstSource);cookieSet('mpdgi_first_source',firstSource);

  let firstCampaign=normalizeCampaign(storageGet(ANALYTICS_FIRST_CAMPAIGN_KEY)||cookieGet('mpdgi_first_campaign'));
  if(!firstCampaign&&entry.campaign)firstCampaign=entry.campaign;
  if(firstCampaign){storageSet(ANALYTICS_FIRST_CAMPAIGN_KEY,firstCampaign);cookieSet('mpdgi_first_campaign',firstCampaign);}

  return {visitorId,firstSource,firstCampaign};
}
function resolveAnalyticsSession(entry){
  const now=Date.now();
  const last=Number(storageGet(ANALYTICS_SESSION_LAST_KEY)||cookieGet('mpdgi_session_last')||0);
  let sessionId=storageGet(ANALYTICS_SESSION_KEY)||cookieGet('mpdgi_session_id');
  let sessionEntry=storageGet(ANALYTICS_SESSION_ENTRY_KEY)||cookieGet('mpdgi_session_entry');
  if(!validAnalyticsId(sessionId))sessionId='';
  const attributedEntry=entry.source&&entry.source!=='unattributed'?entry.source:null;
  const standalone=isStandaloneMode();
  const age=Number.isFinite(last)?now-last:ANALYTICS_SESSION_TIMEOUT+1;
  const expired=!sessionId||!last||age<0||age>ANALYTICS_SESSION_TIMEOUT;
  const contextChanged=(standalone&&sessionEntry!=='pwa')||(!standalone&&sessionEntry==='pwa');
  const forceNew=Boolean(attributedEntry)||contextChanged;
  const isNew=expired||forceNew;
  if(isNew){
    sessionId=randomId();
    sessionEntry=attributedEntry||(standalone?'pwa':'web');
  }
  sessionEntry=VALID_SESSION_ENTRIES.has(sessionEntry)?sessionEntry:(standalone?'pwa':'web');
  storageSet(ANALYTICS_SESSION_KEY,sessionId);cookieSet('mpdgi_session_id',sessionId,1800);
  storageSet(ANALYTICS_SESSION_ENTRY_KEY,sessionEntry);cookieSet('mpdgi_session_entry',sessionEntry,1800);
  storageSet(ANALYTICS_SESSION_LAST_KEY,String(now));cookieSet('mpdgi_session_last',String(now),1800);
  return {sessionId,sessionEntry,isNew};
}
function analyticsContext(){
  if(!analyticsState)return null;
  const activityNow=Date.now();
  storageSet(ANALYTICS_SESSION_LAST_KEY,String(activityNow));cookieSet('mpdgi_session_last',String(activityNow),1800);
  cookieSet('mpdgi_session_id',analyticsState.sessionId,1800);cookieSet('mpdgi_session_entry',analyticsState.sessionEntry,1800);
  return {
    schema_version:ANALYTICS_SCHEMA_VERSION,
    visitor_id:analyticsState.visitorId,
    session_id:analyticsState.sessionId,
    acquisition_source:analyticsState.firstSource,
    acquisition_campaign:analyticsState.firstCampaign||'',
    session_entry:analyticsState.sessionEntry,
    display_mode:isStandaloneMode()?'pwa':'browser',
    language:currentLanguage,
    app_version:HUB_VERSION,
    device_category:deviceCategory(),
    browser:browserFamily()
  };
}
function queueAnalyticsPayload(payload){
  try{
    const current=JSON.parse(storageGet(ANALYTICS_QUEUE_KEY)||'[]');
    const queue=Array.isArray(current)?current:[];
    queue.push(payload);
    storageSet(ANALYTICS_QUEUE_KEY,JSON.stringify(queue.slice(-ANALYTICS_MAX_QUEUE)));
  }catch{}
}
async function postAnalyticsPayload(payload,urgent=false){
  if(!analyticsIsEnabled())return 'sent';
  if(!navigator.onLine)return 'retry';
  const endpoint=safeHttpsUrl(config.analyticsCollector);if(!endpoint)return 'drop';
  const body=JSON.stringify(payload);
  if(urgent&&navigator.sendBeacon){
    try{if(navigator.sendBeacon(endpoint,new Blob([body],{type:'text/plain;charset=UTF-8'})))return 'sent';}catch{}
  }
  try{
    const response=await fetch(endpoint,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',keepalive:urgent,headers:{'Content-Type':'text/plain;charset=UTF-8'},body});
    if(response.ok)return 'sent';
    if(response.status>=400&&response.status<500)return 'drop';
    return 'retry';
  }catch{return 'retry';}
}
async function flushAnalyticsQueue(){
  if(!analyticsIsEnabled()||!navigator.onLine)return;
  let queue=[];
  try{const raw=JSON.parse(storageGet(ANALYTICS_QUEUE_KEY)||'[]');if(Array.isArray(raw))queue=raw;}catch{}
  if(!queue.length)return;
  const remaining=[];
  for(let i=0;i<queue.length;i++){
    const status=await postAnalyticsPayload(queue[i],false);
    if(status==='retry'){remaining.push(...queue.slice(i));break;}
  }
  storageSet(ANALYTICS_QUEUE_KEY,JSON.stringify(remaining.slice(-ANALYTICS_MAX_QUEUE)));
}
function trackAnalytics(eventType,actionName='',target='',urgent=false){
  const context=analyticsContext();if(!context||!analyticsIsEnabled())return;
  const payload={...context,event_id:randomId(),event_type:eventType,action_name:String(actionName||'').slice(0,80),target:String(target||'').slice(0,160),client_ts:new Date().toISOString()};
  void postAnalyticsPayload(payload,urgent).then(status=>{if(status==='retry')queueAnalyticsPayload(payload);});
}
function markAnalytics(element,action,target=''){
  if(!element)return element;
  element.dataset.analyticsAction=String(action||'').slice(0,80);
  if(target)element.dataset.analyticsTarget=String(target).slice(0,160);
  return element;
}
function setupAnalyticsInteractions(){
  document.addEventListener('click',event=>{
    const el=event.target.closest?.('[data-analytics-action]');if(!el)return;
    trackAnalytics('action',el.dataset.analyticsAction||'',el.dataset.analyticsTarget||'',true);
  },{capture:true});
}
function initAnalytics(){
  markAnalytics(document.getElementById('address-link'),'directions',config.address);
  if(!analyticsIsEnabled())return;
  const entry=INITIAL_ANALYTICS_ENTRY;
  const identity=resolveAnalyticsIdentity(entry);
  const session=resolveAnalyticsSession(entry);
  analyticsState={...identity,...session};
  void flushAnalyticsQueue();
  if(session.isNew)trackAnalytics('session_start');
  trackAnalytics('page_view');
}

const INITIAL_ANALYTICS_ENTRY=captureEntryHint();

let config={...DEFAULT_CONFIG},links=[...FALLBACK_LINKS],currentLanguage='es',installPrompt=null,lastModalTrigger=null,pendingUpdateReload=false,cacheRepairNeeded=detectStoredVersionMismatch(),analyticsState=null;

function setLanguage(language,persist=true){
  currentLanguage=language==='en'?'en':'es';document.documentElement.lang=currentLanguage;
  if(persist){try{localStorage.setItem(STORAGE_LANGUAGE_KEY,currentLanguage);}catch{}}
  const s=UI[currentLanguage];
  document.getElementById('language-code').textContent=currentLanguage.toUpperCase();
  document.getElementById('language-toggle').setAttribute('aria-label',s.languageLabel);
  document.querySelector('.skip-link').textContent=s.skip;
  document.querySelector('.visit-info').setAttribute('aria-label',s.visitInfoLabel);
  document.querySelector('.church-logo').alt=s.logoAlt;
  document.getElementById('links-heading').textContent=s.linksHeading;
  document.getElementById('tagline').textContent='“'+(currentLanguage==='es'?config.tagline:config.taglineEn)+'”';
  document.getElementById('scripture').textContent=currentLanguage==='es'?config.scripture:config.scriptureEn;
  document.getElementById('sunday-label').textContent=s.sunday;document.getElementById('wednesday-label').textContent=s.wednesday;
  document.getElementById('modal-close').setAttribute('aria-label',s.close);
  document.getElementById('developer-credit').textContent=s.developerCredit;document.getElementById('copyright-text').textContent=copyrightText(currentLanguage);const addressLink=document.getElementById('address-link');addressLink.setAttribute('aria-label',s.directionsLabel);addressLink.title=s.directionsLabel;
  updateOfflineState();renderCards();
}

function buildCard(item){
  const article=document.createElement('article');const theme=VALID_THEMES.has(item.theme)?item.theme:'blue';
  article.className='hub-card card-'+theme+(item.wide?' card-wide':'');article.dataset.cardId=item.id;
  const action=item.action==='modal'?document.createElement('button'):document.createElement('a');action.className='card-action';
  if(item.action==='modal'&&VALID_MODAL_TYPES.has(item.modal)){action.type='button';action.addEventListener('click',()=>openNamedModal(item.modal,action));}
  else{const url=safeHttpsUrl(item.url);if(!url)return null;action.href=url;if((item.open||'new')==='new'){action.target='_blank';action.rel='noopener noreferrer';}}
  markAnalytics(action,'card_'+item.id,item.url||item.modal||'');
  const icon=document.createElement('span');icon.className='card-icon';icon.append(createIcon(item.icon));
  const copy=document.createElement('span');copy.className='card-copy';copy.append(textElement('strong','card-title',translated(item.title)),textElement('span','card-subtitle',translated(item.subtitle)));
  const arrow=textElement('span','card-arrow','›');arrow.setAttribute('aria-hidden','true');action.append(icon,copy,arrow);article.append(action);return article;
}
function renderCards(){
  const c=document.getElementById('links-container');const items=Array.isArray(links)?links.filter(Boolean).sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999)):[];
  const f=document.createDocumentFragment();items.forEach(i=>{const card=buildCard(i);if(card)f.append(card);});
  if(!f.childNodes.length)c.replaceChildren(textElement('p','error-state',UI[currentLanguage].loadError));else c.replaceChildren(f);c.setAttribute('aria-busy','false');
}
function setupIcons(){document.querySelectorAll('[data-info-icon]').forEach(h=>h.replaceChildren(createIcon(h.dataset.infoIcon)));}
function updateStaticInfo(){
  const address=config.address||DEFAULT_CONFIG.address,parts=address.split(',').map(x=>x.trim()),el=document.getElementById('address-text');
  if(parts.length>=2)el.replaceChildren(document.createTextNode(parts[0]),document.createElement('br'),document.createTextNode(parts.slice(1).join(', ')));else el.textContent=address;
  const addressLink=document.getElementById('address-link');addressLink.href=directionsUrl(address);
  document.getElementById('sunday-time').textContent=config.sundayService;document.getElementById('wednesday-time').textContent=config.wednesdayBibleStudy;
}
function focusableElements(){return[...document.getElementById('hub-modal').querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(e=>!e.hidden&&e.offsetParent!==null);}
function setBackgroundInert(state){const main=document.getElementById('main-content');if(!main)return;main.inert=state;if(state)main.setAttribute('aria-hidden','true');else main.removeAttribute('aria-hidden');}
function modalIsOpen(){return !document.getElementById('modal-overlay').hidden;}
function reloadAfterUpdateIfSafe(){if(!pendingUpdateReload||modalIsOpen()||document.visibilityState!=='visible')return;pendingUpdateReload=false;location.reload();}
function openModal(title,trigger){const o=document.getElementById('modal-overlay'),b=document.getElementById('modal-body');lastModalTrigger=trigger||document.activeElement;document.getElementById('modal-title').textContent=title;b.replaceChildren();o.hidden=false;document.body.classList.add('modal-open');setBackgroundInert(true);document.getElementById('modal-close').focus();return b;}
function closeModal(){const o=document.getElementById('modal-overlay');if(o.hidden)return;o.hidden=true;document.body.classList.remove('modal-open');setBackgroundInert(false);lastModalTrigger?.focus?.();reloadAfterUpdateIfSafe();}
function externalLink(label,url,className='',analyticsAction='external_link'){const a=document.createElement('a');a.className=('modal-action '+className).trim();a.href=safeHttpsUrl(url)||'#';a.target='_blank';a.rel='noopener noreferrer';a.append(textElement('span','',label));markAnalytics(a,analyticsAction,url);return a;}
function brandedLink(brand,label,url,className=''){const a=externalLink(label,url,className,'social_'+brand);a.prepend(createBrandMark(brand));return a;}

const PAYMENT_BRAND_SVGS={
  tithely:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#181f36"/><path fill="#5bd9a4" d="M8.5 9.4c0-1.5 1.2-2.7 2.7-2.7h9.6c1.5 0 2.7 1.2 2.7 2.7v2.7c0 4.4-3.2 8-7.5 8.6v4.6h-4v-4.6a8.2 8.2 0 0 1-3.5-6.7V9.4Zm4 1.5v3a4 4 0 0 0 3.5 4 4 4 0 0 0 3.5-4v-3h-7Z"/></svg>',
  square:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M4.01 0A4.01 4.01 0 000 4.01v15.98c0 2.21 1.8 4 4.01 4.01h15.98C22.2 24 24 22.2 24 19.99V4A4.01 4.01 0 0019.99 0H4zm1.62 4.36h12.74c.7 0 1.26.57 1.26 1.27v12.74c0 .7-.56 1.27-1.26 1.27H5.63c-.7 0-1.26-.57-1.26-1.27V5.63a1.27 1.27 0 011.26-1.27zm3.83 4.35a.73.73 0 00-.73.73v5.09c0 .4.32.72.72.72h5.1a.73.73 0 00.73-.72V9.44a.73.73 0 00-.73-.73h-5.1Z"/></svg>',
  zelle:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#6D1ED4" d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-2.765H5.638a.667.667 0 0 1-.666-.666v-2.234a.67.67 0 0 1 .142-.412l8.139-10.382h-7.25a.667.667 0 0 1-.667-.667V3.914c0-.367.299-.666.666-.666h4.23V.483c0-.266.217-.483.483-.483h2.841c.266 0 .483.217.483.483v2.765h4.323c.367 0 .666.299.666.666v2.137a.67.67 0 0 1-.141.41l-8.19 10.481h7.665c.367 0 .666.299.666.666v2.477a.667.667 0 0 1-.666.667h-4.32v2.765a.483.483 0 0 1-.483.483Z"/></svg>',
  visa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1434CB" d="M9.112 8.262 5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 0 1 1.913.336l.34-1.59a5.207 5.207 0 0 0-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 0 0-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656 1.02-2.815.588 2.815zm-8.16-4.84-1.603 7.496H8.34l1.605-7.496z"/></svg>',
  mastercard:'<svg viewBox="0 0 64 40" aria-hidden="true"><circle cx="25" cy="20" r="13" fill="#EB001B"/><circle cx="39" cy="20" r="13" fill="#F79E1B"/><path d="M32 9.4a13 13 0 0 1 0 21.2 13 13 0 0 1 0-21.2Z" fill="#FF5F00"/></svg>',
  amex:'<svg viewBox="0 0 64 40" aria-hidden="true"><rect x="2" y="4" width="60" height="32" rx="5" fill="#2E77BB"/><text x="32" y="18" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="#fff">AMERICAN</text><text x="32" y="29" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="#fff">EXPRESS</text></svg>',
  discover:'<svg viewBox="0 0 64 40" aria-hidden="true"><rect width="64" height="40" rx="6" fill="#fff"/><text x="5" y="24" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="#111">DISC</text><circle cx="37" cy="20" r="7" fill="#FF6000"/><text x="44" y="24" font-family="Arial,sans-serif" font-size="8.5" font-weight="800" fill="#111">VER</text></svg>',
  jcb:'<svg viewBox="0 0 64 40" aria-hidden="true"><rect x="7" y="5" width="16" height="30" rx="4" fill="#0B6FB8"/><rect x="24" y="5" width="16" height="30" rx="4" fill="#D9232E"/><rect x="41" y="5" width="16" height="30" rx="4" fill="#168447"/><text x="15" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#fff">J</text><text x="32" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#fff">C</text><text x="49" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#fff">B</text></svg>',
  unionpay:'<svg viewBox="0 0 72 40" aria-hidden="true"><path d="M8 5h22l-7 30H1L8 5Z" fill="#D81E3B"/><path d="M26 5h22l-7 30H19l7-30Z" fill="#1879B9"/><path d="M44 5h22l-7 30H37l7-30Z" fill="#149A78"/><text x="35" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="800" fill="#fff">UnionPay</text></svg>',
  applepay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M2.15 4.318a42.16 42.16 0 0 0-.454.003c-.15.005-.303.013-.452.04a1.44 1.44 0 0 0-1.06.772c-.07.138-.114.278-.14.43-.028.148-.037.3-.04.45A10.2 10.2 0 0 0 0 6.222v11.557c0 .07.002.138.003.207.004.15.013.303.04.452.027.15.072.291.142.429a1.436 1.436 0 0 0 .63.63c.138.07.278.115.43.142.148.027.3.036.45.04l.208.003h20.194l.207-.003c.15-.004.303-.013.452-.04.15-.027.291-.071.428-.141a1.432 1.432 0 0 0 .631-.631c.07-.138.115-.278.141-.43.027-.148.036-.3.04-.45.002-.07.003-.138.003-.208l.001-.246V6.221c0-.07-.002-.138-.004-.207a2.995 2.995 0 0 0-.04-.452 1.446 1.446 0 0 0-1.2-1.201 3.022 3.022 0 0 0-.452-.04 10.448 10.448 0 0 0-.453-.003zm0 .512h19.942c.066 0 .131.002.197.003.115.004.25.01.375.032.109.02.2.05.287.094a.927.927 0 0 1 .407.407.997.997 0 0 1 .094.288c.022.123.028.258.031.374.002.065.003.13.003.197v11.552c0 .065 0 .13-.003.196-.003.115-.009.25-.032.375a.927.927 0 0 1-.5.693 1.002 1.002 0 0 1-.286.094 2.598 2.598 0 0 1-.373.032l-.2.003H1.906c-.066 0-.133-.002-.196-.003a2.61 2.61 0 0 1-.375-.032c-.109-.02-.2-.05-.288-.094a.918.918 0 0 1-.406-.407 1.006 1.006 0 0 1-.094-.288 2.531 2.531 0 0 1-.032-.373 9.588 9.588 0 0 1-.002-.197V6.224c0-.065 0-.131.002-.197.004-.114.01-.248.032-.375.02-.108.05-.199.094-.287a.925.925 0 0 1 .407-.406 1.03 1.03 0 0 1 .287-.094c.125-.022.26-.029.375-.032.065-.002.131-.002.196-.003zm4.71 3.7c-.3.016-.668.199-.88.456-.191.22-.36.58-.316.918.338.03.675-.169.888-.418.205-.258.345-.603.308-.955zm2.207.42v5.493h.852v-1.877h1.18c1.078 0 1.835-.739 1.835-1.812 0-1.07-.742-1.805-1.808-1.805zm.852.719h.982c.739 0 1.161.396 1.161 1.089 0 .692-.422 1.092-1.164 1.092h-.979zm-3.154.3c-.45.01-.83.28-1.05.28-.235 0-.593-.264-.981-.257a1.446 1.446 0 0 0-1.23.747c-.527.908-.139 2.255.374 2.995.249.366.549.769.944.754.373-.014.52-.242.973-.242.454 0 .586.242.98.235.41-.007.667-.366.915-.733.286-.417.403-.82.41-.841-.007-.008-.79-.308-.797-1.209-.008-.754.615-1.113.644-1.135-.352-.52-.9-.578-1.09-.593a1.123 1.123 0 0 0-.092-.002zm8.204.397c-.99 0-1.606.533-1.652 1.256h.777c.072-.358.369-.586.845-.586.502 0 .803.266.803.711v.309l-1.097.064c-.951.054-1.488.484-1.488 1.184 0 .72.548 1.207 1.332 1.207.526 0 1.032-.281 1.264-.727h.019v.659h.788v-2.76c0-.803-.62-1.317-1.591-1.317zm1.94.072l1.446 4.009c0 .003-.073.24-.073.247-.125.41-.33.571-.711.571-.069 0-.206 0-.267-.015v.666c.06.011.267.019.335.019.83 0 1.226-.312 1.568-1.283l1.5-4.214h-.868l-1.012 3.259h-.015l-1.013-3.26zm-1.167 2.189v.316c0 .521-.45.917-1.024.917-.442 0-.731-.228-.731-.579 0-.342.278-.56.769-.593z"/></svg>',
  googlepay:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M3.963 7.235A3.963 3.963 0 00.422 9.419a3.963 3.963 0 000 3.559 3.963 3.963 0 003.541 2.184c1.07 0 1.97-.352 2.627-.957.748-.69 1.18-1.71 1.18-2.916a4.722 4.722 0 00-.07-.806H3.964v1.526h2.14a1.835 1.835 0 01-.79 1.205c-.356.241-.814.379-1.35.379-1.034 0-1.911-.697-2.225-1.636a2.375 2.375 0 010-1.517c.314-.94 1.191-1.636 2.225-1.636a2.152 2.152 0 011.52.594l1.132-1.13a3.808 3.808 0 0 0-2.652-1.033zm6.501.55v6.9h.886V11.89h1.465c.603 0 1.11-.196 1.522-.588a1.911 1.911 0 00.635-1.464 1.92 1.92 0 00-.635-1.456 2.125 2.125 0 00-1.522-.598zm2.427.85a1.156 1.156 0 01.823.365 1.176 1.176 0 010 1.686 1.171 1.171 0 01-.877.357H11.35V8.635h1.487a1.156 1.156 0 01.054 0zm4.124 1.175c-.842 0-1.477.308-1.907.925l.781.491c.288-.417.68-.626 1.175-.626a1.255 1.255 0 01.856.323 1.009 1.009 0 01.366.785v.202c-.34-.193-.774-.289-1.3-.289-.617 0-1.11.145-1.479.434-.37.288-.554.677-.554 1.165a1.476 1.476 0 00.525 1.156c.35.308.785.463 1.305.463.61 0 1.098-.27 1.465-.81h.038v.655h.848v-2.909c0-.61-.19-1.09-.568-1.44-.38-.35-.896-.525-1.551-.525zm2.263.154l1.946 4.422-1.098 2.38h.915L24 9.963h-.965l-1.368 3.391h-.02l-1.406-3.39zm-2.146 2.368c.494 0 .88.11 1.156.33 0 .372-.147.696-.44.973a1.413 1.413 0 01-.997.414 1.081 1.081 0 01-.69-.232.708.708 0 01-.293-.578c0-.257.12-.47.363-.647.24-.173.54-.26.9-.26Z"/></svg>',
  cashapp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00D64F" d="M23.59 3.475a5.1 5.1 0 00-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 00-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 003.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 003.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zm-6.17 4.63-.93.93a.5.5 0 01-.67.01 5 5 0 00-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 3.95l-.26 1.2a.49.49 0 01-.48.39H9.63l-.09-.01a.5.5 0 01-.38-.59l.28-1.27a6.54 6.54 0 01-2.88-1.57v-.01a.48.48 0 010-.68l1-.97a.49.49 0 01.67 0c.91.86 2.13 1.34 3.39 1.32 1.3 0 2.17-.55 2.17-1.42 0-.87-.88-1.1-2.54-1.72-1.76-.63-3.43-1.52-3.43-3.6 0-2.42 2.01-3.6 4.39-3.71l.25-1.23a.48.48 0 01.48-.38h1.78l.1.01c.26.06.43.31.37.57l-.27 1.37c.9.3 1.75.77 2.48 1.39l.02.02c.19.2.19.5 0 .68z"/></svg>'
};
function createPaymentBrandMark(name,label=''){
  const wrap=document.createElement('span');wrap.className='payment-brand-logo payment-brand-'+name;wrap.innerHTML=PAYMENT_BRAND_SVGS[name]||'';
  if(label){wrap.setAttribute('role','img');wrap.setAttribute('aria-label',label);}else wrap.setAttribute('aria-hidden','true');
  return wrap;
}
function paymentMethodLink(brand,brandName,label,url,className=''){
  const a=document.createElement('a');a.className=('modal-action provider-button '+className).trim();a.href=safeHttpsUrl(url)||'#';a.target='_blank';a.rel='noopener noreferrer';
  const lockup=document.createElement('span');lockup.className='provider-lockup';lockup.append(createPaymentBrandMark(brand),textElement('strong','provider-wordmark provider-wordmark-'+brand,brandName));
  a.append(lockup,textElement('small','provider-action',label));markAnalytics(a,'give_'+brand,url);return a;
}
const PAYMENT_CARD_LOGOS=[['visa','Visa'],['mastercard','Mastercard'],['amex','American Express'],['discover','Discover'],['jcb','JCB'],['unionpay','UnionPay']];
const PAYMENT_WALLETS=[['applepay','Apple Pay'],['googlepay','Google Pay'],['cashapp','Cash App Pay']];
function paymentCards(label){
  const section=document.createElement('section');section.className='payment-cards';section.setAttribute('aria-label',label);
  section.append(textElement('p','payment-cards-label',label));
  const strip=document.createElement('div');strip.className='payment-card-strip';strip.setAttribute('role','list');
  PAYMENT_CARD_LOGOS.forEach(([brand,name])=>{const chip=document.createElement('span');chip.className='payment-card-chip';chip.setAttribute('role','listitem');chip.append(createPaymentBrandMark(brand,name));strip.append(chip);});
  section.append(strip);return section;
}
function paymentWallets(label){
  const section=document.createElement('section');section.className='payment-wallets';section.setAttribute('aria-label',label);
  section.append(textElement('p','payment-cards-label',label));
  const strip=document.createElement('div');strip.className='payment-wallet-strip';strip.setAttribute('role','list');
  PAYMENT_WALLETS.forEach(([brand,name])=>{const chip=document.createElement('span');chip.className='payment-wallet-chip payment-wallet-'+brand;chip.setAttribute('role','listitem');chip.append(createPaymentBrandMark(brand,name));if(brand==='cashapp')chip.append(textElement('span','cashapp-pay-text','Cash App Pay'));strip.append(chip);});
  section.append(strip);return section;
}
function bibleLink(label,version,url,className=''){const a=document.createElement('a');a.className=('modal-action '+className).trim();a.href=safeHttpsUrl(url)||'#';a.target='_blank';a.rel='noopener noreferrer';const mark=document.createElement('span');mark.className='brand-mark';mark.append(createIcon('bible'));const copy=document.createElement('span');copy.className='modal-action-copy';copy.append(textElement('strong','',label),textElement('small','modal-subline',version));a.append(mark,copy);markAnalytics(a,className.includes('spanish')?'bible_spanish':'bible_english',url);return a;}
async function copyText(value){if(!value)return false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}}catch{}try{const t=document.createElement('textarea');t.value=value;t.readOnly=true;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();return ok;}catch{return false;}}

function renderGiveModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.giveTitle,trigger);
  b.append(textElement('p','modal-text',s.giveIntro),
    paymentMethodLink('tithely','Tithe.ly',s.tithely,config.tithely,'tithely-button'),
    paymentMethodLink('square','Square',s.square,config.square,'square-button'),
    paymentCards(s.acceptedCards),
    paymentWallets(s.wallets));
  const z=document.createElement('section');z.className='zelle-box';
  const brand=textElement('div','zelle-wordmark',s.zelle);
  const title=textElement('h3','zelle-title',s.zelleTitle);
  const steps=document.createElement('ol');steps.className='zelle-steps';
  [s.zelleStep1,s.zelleStep2,s.zelleStep3,s.zelleStep4,s.zelleStep5].forEach(step=>steps.append(textElement('li','',step)));
  z.append(brand,title,steps,textElement('p','zelle-label',s.zelleInstruction),textElement('p','zelle-email',config.zelle));
  const row=document.createElement('div');row.className='copy-row';const btn=textElement('button','copy-button',s.copy);btn.type='button';const status=textElement('span','copy-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  markAnalytics(btn,'give_zelle_copy','zelle');btn.addEventListener('click',async()=>{const ok=await copyText(config.zelle);status.textContent=ok?s.copied:s.copyFailed;if(ok)setTimeout(()=>status.textContent='',1800);});row.append(btn,status);z.append(row,textElement('p','zelle-note',s.zelleNote));b.append(z);
}
function renderSocialModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.socialTitle,trigger);
  b.append(textElement('p','modal-text',s.socialIntro),
    brandedLink('facebook',s.facebook,config.facebook,'social-facebook'),
    brandedLink('instagram',s.instagram,config.instagram,'social-instagram'),
    brandedLink('youtube',s.youtube,config.youtube,'social-youtube'),
    brandedLink('tiktok',s.tiktok,config.tiktok,'social-tiktok'));
}
function renderBibleModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.bibleTitle,trigger);b.append(textElement('p','modal-text',s.bibleIntro));
  b.append(
    bibleLink(s.bibleSpanish,s.bibleSpanishVersion,config.bibleSpanish,'bible-spanish'),
    bibleLink(s.bibleEnglish,s.bibleEnglishVersion,config.bibleEnglish,'bible-english')
  );
}
function createInstallAction(){
  if(!installPrompt)return null;
  const s=UI[currentLanguage],btn=textElement('button','modal-action install-app',s.install);btn.type='button';
  markAnalytics(btn,'pwa_install_prompt','install');btn.addEventListener('click',async()=>{if(!installPrompt)return;const prompt=installPrompt;installPrompt=null;btn.disabled=true;await prompt.prompt();await prompt.userChoice.catch(()=>null);btn.remove();});
  return btn;
}
function renderAboutModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.aboutTitle,trigger);b.append(textElement('p','modal-text',s.aboutIntro));
  const meta=document.createElement('div');meta.className='about-meta';const v=document.createElement('div');v.append(textElement('span','',s.version),textElement('strong','', 'v'+(config.version||HUB_VERSION)));const w=document.createElement('div');w.append(textElement('span','',s.website),textElement('strong','','mpdgi.org'));meta.append(v,w);b.append(meta);
  const install=createInstallAction();if(install)b.append(install);
  b.append(textElement('p','modal-text',s.external+': '+s.externalText),textElement('p','modal-text',s.privacy+': '+s.privacyText),textElement('p','modal-text about-credit',s.developerCredit),textElement('p','modal-text',copyrightText(currentLanguage)),externalLink(s.officialWebsite,config.website));
}
function openNamedModal(type,trigger){if(type==='give')renderGiveModal(trigger);if(type==='social')renderSocialModal(trigger);if(type==='bible')renderBibleModal(trigger);if(type==='about')renderAboutModal(trigger);}
function setupModal(){
  const o=document.getElementById('modal-overlay');document.getElementById('modal-close').addEventListener('click',closeModal);o.addEventListener('click',e=>{if(e.target===o)closeModal();});
  document.addEventListener('keydown',e=>{if(o.hidden)return;if(e.key==='Escape'){e.preventDefault();closeModal();return;}if(e.key!=='Tab')return;const items=focusableElements();if(!items.length){e.preventDefault();document.getElementById('hub-modal').focus();return;}const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
}
function updateOfflineState(){const b=document.getElementById('offline-badge');b.hidden=navigator.onLine;b.textContent=navigator.onLine?'':UI[currentLanguage].offline;}
function setupLanguage(){document.getElementById('language-toggle').addEventListener('click',()=>{const next=currentLanguage==='es'?'en':'es';setLanguage(next,true);trackAnalytics('action','language_change',next);});}
function setupInstall(){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});window.addEventListener('appinstalled',()=>{installPrompt=null;trackAnalytics('action','pwa_installed','installed');});}
function setupServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  window.addEventListener('load',async()=>{
    try{
      const hadController=Boolean(navigator.serviceWorker.controller);
      let reloadingForUpdate=false;
      if(hadController){
        navigator.serviceWorker.addEventListener('controllerchange',()=>{
          if(reloadingForUpdate)return;
          reloadingForUpdate=true;
          pendingUpdateReload=true;
          requestCacheRepair();
          reloadAfterUpdateIfSafe();
        });
      }
      const r=await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(HUB_VERSION)}`,{scope:'./',updateViaCache:'none'});
      const requestCacheRepair=()=>{
        if(!cacheRepairNeeded)return;
        const worker=r.active||navigator.serviceWorker.controller;
        if(worker){worker.postMessage({type:'REPAIR_CACHES',version:HUB_VERSION});cacheRepairNeeded=false;}
      };
      const activateWaiting=()=>{if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});};
      const checkForUpdate=async()=>{try{await r.update();activateWaiting();}catch{}};
      activateWaiting();
      requestCacheRepair();
      r.addEventListener('updatefound',()=>{
        const w=r.installing;
        w?.addEventListener('statechange',()=>{
          if(w.state==='installed'&&navigator.serviceWorker.controller)w.postMessage({type:'SKIP_WAITING'});
        });
      });
      setTimeout(checkForUpdate,1500);
      setInterval(checkForUpdate,15*60*1000);
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){checkForUpdate();reloadAfterUpdateIfSafe();}});
    }catch(e){console.warn('[MPDGI Hub] Service Worker registration failed:',e);}
  },{once:true});
}
function resolveInitialLanguage(){try{const s=localStorage.getItem(STORAGE_LANGUAGE_KEY);if(s==='es'||s==='en')return s;}catch{}return config.defaultLanguage==='en'?'en':'es';}

async function init(){
  setupIcons();setupLanguage();setupModal();setupInstall();setupServiceWorker();setupAnalyticsInteractions();
  const [loadedConfig,loadedLinks]=await Promise.all([fetchJson('data/config.json',DEFAULT_CONFIG),fetchJson('data/links.json',FALLBACK_LINKS)]);
  config={...DEFAULT_CONFIG,...loadedConfig};links=Array.isArray(loadedLinks)&&loadedLinks.length?loadedLinks:[...FALLBACK_LINKS];updateStaticInfo();setLanguage(resolveInitialLanguage(),false);updateOfflineState();initAnalytics();
}
window.addEventListener('online',()=>{updateOfflineState();void flushAnalyticsQueue();});window.addEventListener('offline',updateOfflineState);init();window.__MPDGI_HUB_VERSION__=HUB_VERSION;window.__MPDGI_COPYRIGHT_RANGE__=copyrightYearRange;window.__MPDGI_ANALYTICS__={captureEntryHint,normalizeSource,normalizeCampaign,isStandaloneMode,deviceCategory,browserFamily};
