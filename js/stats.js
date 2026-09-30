'use strict';

const STATS_VERSION=globalThis.MPDGI_STATS_VERSION||'dev';
const LANGUAGE_KEY='mpdgiStatsLanguage';
const HUB_BASE='https://hub.mpdgi.org/';
const SOURCE_COLORS={nfc:'#1468e8',qr:'#5aa2f8',link:'#efb94f',unattributed:'#9ca9bb'};

const I18N={
  es:{
    authorized:'Acceso autorizado solamente',loginHelp:'Inicia sesión para ver las estadísticas privadas de MPDGI.',email:'Correo electrónico',password:'Contraseña',remember:'Recordarme en este dispositivo',signIn:'Entrar',secureNote:'🔒 Acceso privado para administradores aprobados de MPDGI.',
    navDashboard:'Dashboard',navReports:'Reportes',navSources:'Fuentes',navCampaigns:'Campañas',navEngagement:'Interacción',navTechnology:'Tecnología',navSystem:'Sistema',adminsOnly:'Solo administradores autorizados',
    period:'Período',range7:'Últimos 7 días',range30:'Últimos 30 días',range90:'Últimos 90 días',rangeMonth:'Este mes',rangeYear:'Este año',range365:'Últimos 12 meses',rangeCustom:'Rango personalizado',from:'Desde',to:'Hasta',apply:'Aplicar',printPdf:'🖨 Imprimir / PDF',logout:'Salir',analyticsReport:'Reporte de Analítica',
    summary:'Resumen',loadingPeriod:'Cargando período…',visits:'Visitas (sesiones)',uniqueVisitors:'Visitantes únicos estimados',pwaSessions:'Sesiones desde PWA',pageViews:'Page Views',currentPeriod:'Período actual',lastUpdated:'Última actualización',
    reportsTitle:'Reportes',reportsIntro:'Resumen visual e imprimible del período seleccionado.',dailyVisits:'Visitas diarias',newReturning:'Visitantes nuevos vs recurrentes',anonymousEstimate:'Estimación anónima',reportNoteTitle:'Acerca del reporte',reportNote:'El dashboard, el CSV y el reporte impreso utilizan los mismos datos agregados del servidor. No se exportan identificadores anónimos individuales.',
    sourcesTitle:'Fuentes',sourcesIntro:'Cómo llegaron los visitantes y cómo comenzó cada sesión.',acquisitionSource:'Fuente de adquisición',estimatedVisitors:'Visitantes estimados',total:'Total',source:'Fuente',visitorsShort:'Visitantes',sessionEntry:'Entrada de sesión',usageMode:'Modo de uso',
    campaignsTitle:'Campañas',campaignsIntro:'Crea enlaces etiquetados para saber cuándo una visita llega por Link, QR o NFC.',createCampaign:'Crear campaña',noCost:'Sin servicios adicionales',campaignName:'Nombre de campaña',campaignSource:'Tipo de acceso',sharedLink:'Enlace compartido',generatedUrl:'URL generada',copyUrl:'Copiar URL',openUrl:'Abrir URL',campaignResults:'Resultados de campañas',firstTouch:'Adquisición inicial etiquetada',generalShareLink:'Enlace general para compartir',generalShareHelp:'Usa este enlace cuando envíes el Hub por WhatsApp, Messages, correo o redes y quieras que Stats lo clasifique como Enlace.',copy:'Copiar',
    engagementTitle:'Interacción',engagementIntro:'Qué acciones realizan los visitantes dentro del Hub.',topActions:'Acciones principales',
    technologyTitle:'Tecnología',technologyIntro:'Dispositivos, navegadores e idioma observado.',devices:'Dispositivos',browsers:'Navegadores',languages:'Idiomas',
    systemTitle:'Estado del sistema',systemIntro:'Comprobación de los componentes principales de MPDGI Stats.',systemHealth:'Salud del sistema',database:'Base de datos',lastEvent:'Último evento',authorizedFooter:'🔒 Solo administradores autorizados.',
    noData:'Sin datos para este período.',sessions:'sesiones',generated:'Generado',previousPeriod:'vs. período anterior',allOperational:'● Todos los sistemas operacionales',attentionRequired:'● Atención requerida',operational:'Operacional',review:'Revisar',noEvents:'Sin eventos',
    loginError:'Correo o contraseña incorrectos.',rateError:'Demasiados intentos. Intenta nuevamente en unos minutos.',validRange:'Selecciona un rango de fechas válido.',exportError:'No fue posible generar el CSV.',copied:'URL copiada.',copyFailed:'No fue posible copiar automáticamente. Selecciona y copia la URL.',campaignPlaceholder:'reunion-lideres-octubre',
    dashboardSummary:(visits,users)=>visits+' sesiones · '+users+' visitantes estimados',
    tipVisits:'Número de sesiones observadas durante el período seleccionado. Una misma persona o dispositivo puede iniciar más de una sesión.',
    tipUnique:'Estimación anónima de navegadores o dispositivos únicos observados. No identifica personas por nombre.',
    tipPwa:'Sesiones que se abrieron desde la PWA instalada de MPDGI Hub.',
    tipPageViews:'Cantidad de vistas de página registradas por el Hub durante el período.',
    tipOverview:'Resumen ejecutivo del período seleccionado y la hora en que Stats actualizó la información.',
    tipDaily:'Distribución diaria de sesiones. Cada barra muestra el día del mes y, al pasar el mouse, la fecha y el total.',
    tipVisitorMix:'Estimación de visitantes vistos por primera vez frente a visitantes que ya habían aparecido anteriormente.',
    tipReport:'El reporte impreso y el CSV usan los mismos agregados del servidor y no exportan identificadores individuales.',
    tipAcquisition:'Primera fuente conocida por la que llegó cada visitante anónimo. La adquisición inicial no cambia en visitas posteriores.',
    tipSessionEntry:'Cómo comenzó cada sesión específica: NFC, QR, Link, Web o PWA instalada.',
    tipDisplayMode:'Indica si la sesión se utilizó en navegador o desde la PWA instalada.',
    tipCampaignBuilder:'Genera URLs etiquetadas para que MPDGI Stats pueda distinguir enlaces compartidos, QR y NFC.',
    tipCampaignResults:'Campañas registradas como parte de la adquisición inicial de visitantes anónimos.',
    tipGeneralLink:'Enlace listo para compartir. El parámetro src=link permite clasificar la entrada como Enlace.',
    tipActions:'Acciones más utilizadas dentro del Hub, como Portal de Miembros, Ofrendar, Biblia, redes o GPS.',
    tipDevices:'Categoría del dispositivo reportada por el Hub: móvil, computadora, tableta u otro.',
    tipBrowsers:'Familia de navegador observada en las sesiones.',
    tipLanguages:'Idioma activo del Hub durante las sesiones observadas.',
    tipSystem:'Estado de los componentes esenciales: collector, base D1 y recepción de eventos.'
  },
  en:{
    authorized:'Authorized access only',loginHelp:'Sign in to view MPDGI private analytics.',email:'Email address',password:'Password',remember:'Remember me on this device',signIn:'Sign in',secureNote:'🔒 Private access for approved MPDGI administrators.',
    navDashboard:'Dashboard',navReports:'Reports',navSources:'Sources',navCampaigns:'Campaigns',navEngagement:'Engagement',navTechnology:'Technology',navSystem:'System',adminsOnly:'Authorized administrators only',
    period:'Period',range7:'Last 7 days',range30:'Last 30 days',range90:'Last 90 days',rangeMonth:'This month',rangeYear:'This year',range365:'Last 12 months',rangeCustom:'Custom range',from:'From',to:'To',apply:'Apply',printPdf:'🖨 Print / PDF',logout:'Sign out',analyticsReport:'Analytics Report',
    summary:'Summary',loadingPeriod:'Loading period…',visits:'Visits (sessions)',uniqueVisitors:'Estimated unique visitors',pwaSessions:'PWA sessions',pageViews:'Page Views',currentPeriod:'Current period',lastUpdated:'Last updated',
    reportsTitle:'Reports',reportsIntro:'Visual and printable summary for the selected period.',dailyVisits:'Daily visits',newReturning:'New vs returning visitors',anonymousEstimate:'Anonymous estimate',reportNoteTitle:'About this report',reportNote:'The dashboard, CSV export and printed report use the same aggregated server data. Individual anonymous identifiers are not exported.',
    sourcesTitle:'Sources',sourcesIntro:'How visitors arrived and how each session started.',acquisitionSource:'Acquisition source',estimatedVisitors:'Estimated visitors',total:'Total',source:'Source',visitorsShort:'Visitors',sessionEntry:'Session entry',usageMode:'Usage mode',
    campaignsTitle:'Campaigns',campaignsIntro:'Create tagged URLs to identify visits arriving through Link, QR or NFC.',createCampaign:'Create campaign',noCost:'No additional services',campaignName:'Campaign name',campaignSource:'Access type',sharedLink:'Shared link',generatedUrl:'Generated URL',copyUrl:'Copy URL',openUrl:'Open URL',campaignResults:'Campaign results',firstTouch:'Tagged initial acquisition',generalShareLink:'General share link',generalShareHelp:'Use this link when sharing the Hub through WhatsApp, Messages, email or social media and you want Stats to classify it as Link.',copy:'Copy',
    engagementTitle:'Engagement',engagementIntro:'What visitors do inside the Hub.',topActions:'Top actions',
    technologyTitle:'Technology',technologyIntro:'Observed devices, browsers and Hub language.',devices:'Devices',browsers:'Browsers',languages:'Languages',
    systemTitle:'System status',systemIntro:'Status of the main MPDGI Stats components.',systemHealth:'System Health',database:'Database',lastEvent:'Last event',authorizedFooter:'🔒 For authorized administrators only.',
    noData:'No data for this period.',sessions:'sessions',generated:'Generated',previousPeriod:'vs. previous period',allOperational:'● All systems operational',attentionRequired:'● Attention required',operational:'Operational',review:'Review',noEvents:'No events',
    loginError:'Incorrect email or password.',rateError:'Too many attempts. Try again in a few minutes.',validRange:'Select a valid date range.',exportError:'The CSV could not be generated.',copied:'URL copied.',copyFailed:'Automatic copy failed. Select and copy the URL.',campaignPlaceholder:'leaders-meeting-october',
    dashboardSummary:(visits,users)=>visits+' sessions · '+users+' estimated visitors',
    tipVisits:'Number of observed sessions during the selected period. The same person or device can start more than one session.',
    tipUnique:'Anonymous estimate of unique browsers or devices observed. It does not identify people by name.',
    tipPwa:'Sessions opened from the installed MPDGI Hub PWA.',
    tipPageViews:'Number of page views recorded by the Hub during the selected period.',
    tipOverview:'Executive summary for the selected period and the time Stats last refreshed the information.',
    tipDaily:'Daily session distribution. Every bar shows the day of the month; hover for the full date and total.',
    tipVisitorMix:'Estimate of first-time visitors compared with visitors observed previously.',
    tipReport:'The printed report and CSV use the same server aggregates and do not export individual identifiers.',
    tipAcquisition:'The first known source for each anonymous visitor. Initial acquisition does not change on later visits.',
    tipSessionEntry:'How each specific session started: NFC, QR, Link, Web or installed PWA.',
    tipDisplayMode:'Whether the session was used in a browser or from the installed PWA.',
    tipCampaignBuilder:'Creates tagged URLs so MPDGI Stats can distinguish shared links, QR and NFC.',
    tipCampaignResults:'Campaigns recorded as part of anonymous visitors’ initial acquisition.',
    tipGeneralLink:'Ready-to-share URL. The src=link parameter classifies the entry as Link.',
    tipActions:'Most-used Hub actions, such as Member Portal, Give, Bible, social media or GPS.',
    tipDevices:'Device category reported by the Hub: mobile, desktop, tablet or other.',
    tipBrowsers:'Browser family observed during sessions.',
    tipLanguages:'Active Hub language during observed sessions.',
    tipSystem:'Status of essential components: collector, D1 database and event reception.'
  }
};

const LABELS={
  es:{
    source:{nfc:'NFC',qr:'QR',link:'Enlace',unattributed:'Web / Sin atribuir'},
    entry:{nfc:'NFC',qr:'QR',link:'Enlace',web:'Web',pwa:'PWA instalada'},
    display:{pwa:'PWA instalada',browser:'Navegador'},
    device:{mobile:'Móvil',desktop:'Computadora',tablet:'Tableta',other:'Otro'},
    browser:{edge:'Edge',chrome:'Chrome',safari:'Safari',firefox:'Firefox',other:'Otro'},
    language:{es:'ES — Español',en:'EN — English',other:'Otro'},
    mix:{new:'Nuevos',returning:'Recurrentes'},
    action:{card_members:'Portal de Miembros',card_give:'Ofrendar',card_prayer:'Petición de Oración',card_bible:'Biblia',card_ministries:'Ministerios',card_social:'Redes Sociales',card_website:'Sitio Web',card_about:'Acerca de',give_tithely:'Tithe.ly',give_square:'Square',give_zelle_copy:'Copiar Zelle',social_facebook:'Facebook',social_instagram:'Instagram',social_youtube:'YouTube',social_tiktok:'TikTok',bible_spanish:'Biblia RVR1960',bible_english:'Bible KJV',directions:'Indicaciones / GPS',language_change:'Cambio de idioma',pwa_install_prompt:'Instalar PWA',pwa_installed:'PWA instalada',external_link:'Enlace externo'}
  },
  en:{
    source:{nfc:'NFC',qr:'QR',link:'Link',unattributed:'Web / Unattributed'},
    entry:{nfc:'NFC',qr:'QR',link:'Link',web:'Web',pwa:'Installed PWA'},
    display:{pwa:'Installed PWA',browser:'Browser'},
    device:{mobile:'Mobile',desktop:'Desktop',tablet:'Tablet',other:'Other'},
    browser:{edge:'Edge',chrome:'Chrome',safari:'Safari',firefox:'Firefox',other:'Other'},
    language:{es:'ES — Spanish',en:'EN — English',other:'Other'},
    mix:{new:'New',returning:'Returning'},
    action:{card_members:'Member Portal',card_give:'Give',card_prayer:'Prayer Request',card_bible:'Bible',card_ministries:'Ministries',card_social:'Social Media',card_website:'Website',card_about:'About',give_tithely:'Tithe.ly',give_square:'Square',give_zelle_copy:'Copy Zelle',social_facebook:'Facebook',social_instagram:'Instagram',social_youtube:'YouTube',social_tiktok:'TikTok',bible_spanish:'Bible RVR1960',bible_english:'Bible KJV',directions:'Directions / GPS',language_change:'Language change',pwa_install_prompt:'Install PWA',pwa_installed:'PWA installed',external_link:'External link'}
  }
};

let currentPreset='30d';
let currentData=null;
let currentView='dashboard';
function storageGet(key){try{return localStorage.getItem(key);}catch{return null;}}
function storageSet(key,value){try{localStorage.setItem(key,value);}catch{}}
let currentLang=storageGet(LANGUAGE_KEY)==='en'?'en':'es';

const $=id=>document.getElementById(id);
const t=key=>I18N[currentLang][key]??key;
const number=value=>new Intl.NumberFormat(currentLang==='es'?'es-US':'en-US').format(Number(value)||0);
const dateTime=value=>new Date(value).toLocaleString(currentLang==='es'?'es-US':'en-US');
const dateLong=value=>new Date(value+'T12:00:00').toLocaleDateString(currentLang==='es'?'es-US':'en-US',{month:'short',day:'numeric',year:'numeric'});

async function api(path,options={}){
  const response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options,headers:{Accept:'application/json',...(options.headers||{})}});
  if(response.status===401)throw Object.assign(new Error('unauthorized'),{status:401});
  if(!response.ok){
    let message='Request failed';
    try{const body=await response.json();message=body.error||message;}catch{}
    throw Object.assign(new Error(message),{status:response.status});
  }
  if(response.status===204)return null;
  return response.json();
}

function setView(authenticated){
  $('login-view').hidden=authenticated;
  $('app-view').hidden=!authenticated;
}
function changeText(id,value){const el=$(id);if(el)el.textContent=value??'—';}
function labelFor(map,key){return map[key]||String(key||LABELS[currentLang].device.other);}
function safePercent(value,total){return total>0?(Number(value)/total)*100:0;}
function percentChange(value){
  if(value===null||value===undefined||Number.isNaN(Number(value)))return '';
  const n=Number(value),arrow=n>0?'↑':n<0?'↓':'→';
  return arrow+' '+Math.abs(n).toFixed(1)+'% '+t('previousPeriod');
}
function applyChange(id,value){
  const el=$(id);if(!el)return;el.textContent=percentChange(value);
  el.style.color=Number(value)>0?'#12a63a':Number(value)<0?'#b42318':'#667792';
}

function applyTranslations(){
  document.documentElement.lang=currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;if(typeof I18N[currentLang][key]==='string')el.textContent=t(key);});
  document.querySelectorAll('.lang-button').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===currentLang));
  const campaignName=$('campaign-name');if(campaignName)campaignName.placeholder=t('campaignPlaceholder');
  document.querySelectorAll('[data-tooltip-key]').forEach(el=>{el.title=t(el.dataset.tooltipKey);});
  if(currentData)renderDashboard(currentData);
  updateCampaignUrl();
}

function setLanguage(lang){
  currentLang=lang==='en'?'en':'es';
  storageSet(LANGUAGE_KEY,currentLang);
  applyTranslations();
}

function renderBars(containerId,items,labelMap){
  const root=$(containerId);if(!root)return;root.replaceChildren();
  const max=Math.max(1,...items.map(x=>Number(x.value)||0));
  for(const item of items){
    const row=document.createElement('div');row.className='bar-row';
    const label=document.createElement('span');label.textContent=labelFor(labelMap,item.key);
    const track=document.createElement('div');track.className='bar-track';
    const fill=document.createElement('div');fill.className='bar-fill';fill.style.width=Math.max(2,(Number(item.value)||0)/max*100)+'%';track.append(fill);
    const value=document.createElement('strong');value.textContent=number(item.value);
    row.append(label,track,value);root.append(row);
  }
  if(!items.length)root.textContent=t('noData');
}

function renderLegend(items){
  const root=$('source-legend');root.replaceChildren();
  const total=items.reduce((sum,x)=>sum+(Number(x.value)||0),0);
  const order=['nfc','qr','link','unattributed'];
  const normalized=order.map(key=>items.find(x=>x.key===key)||{key,value:0});
  for(const item of normalized){
    const row=document.createElement('div');row.className='legend-row';
    const label=document.createElement('span');
    const dot=document.createElement('i');dot.className='legend-dot';dot.style.background=SOURCE_COLORS[item.key]||'#9ca9bb';
    label.append(dot,document.createTextNode(LABELS[currentLang].source[item.key]||item.key));
    const pct=document.createElement('span');pct.textContent=safePercent(item.value,total).toFixed(1)+'%';
    const value=document.createElement('strong');value.textContent=number(item.value);
    row.append(label,pct,value);root.append(row);
  }
  changeText('source-total',number(total));
  let cursor=0;
  const parts=normalized.map(item=>{
    const start=cursor,end=cursor+safePercent(item.value,total);cursor=end;
    return (SOURCE_COLORS[item.key]||'#9ca9bb')+' '+start+'% '+end+'%';
  });
  $('source-donut').style.background=total?'conic-gradient('+parts.join(',')+')':'conic-gradient(#dfe7f1 0 100%)';
}

function renderDaily(items){
  const root=$('daily-chart');root.replaceChildren();
  const bars=document.createElement('div');bars.className='daily-bars';
  const max=Math.max(1,...items.map(x=>Number(x.value)||0));
  let total=0;
  for(const item of items){
    const value=Number(item.value)||0;total+=value;
    const slot=document.createElement('div');slot.className='daily-slot';
    const bar=document.createElement('div');bar.className='daily-bar';
    bar.style.height=Math.max(2,value/max*100)+'%';
    bar.dataset.label=dateLong(item.day)+' — '+number(value)+' '+t('sessions');
    bar.title=bar.dataset.label;
    const day=document.createElement('span');day.className='daily-day';day.textContent=String(Number(item.day.slice(-2)));
    slot.append(bar,day);bars.append(slot);
  }
  root.append(bars);
  changeText('daily-total',number(total)+' '+t('sessions'));
}

function setStatusLight(id,status){
  const el=$(id);if(!el)return;
  el.className='status-light '+(status==='ok'?'status-green':status==='bad'?'status-red':'status-neutral');
}
function renderHealth(health){
  const collectorOk=health?.collector==='operational';
  const dbOk=health?.database==='operational';
  const lastEventOk=Boolean(health?.last_event_at);
  const ok=collectorOk&&dbOk;
  const overall=$('health-overall');overall.textContent=ok?t('allOperational'):t('attentionRequired');overall.className=ok?'health-ok':'';
  changeText('health-collector',collectorOk?t('operational'):t('review'));
  changeText('health-db',dbOk?t('operational'):t('review'));
  changeText('health-last-event',lastEventOk?dateTime(health.last_event_at):t('noEvents'));
  setStatusLight('health-collector-light',collectorOk?'ok':'bad');
  setStatusLight('health-db-light',dbOk?'ok':'bad');
  setStatusLight('health-event-light',lastEventOk?'ok':'bad');
}

function renderDashboard(data){
  currentData=data;
  changeText('range-label',data.range.from+' — '+data.range.to);
  changeText('print-range',data.range.from+' — '+data.range.to);
  changeText('generated-label',t('generated')+' '+dateTime(data.generated_at));
  changeText('metric-visits',number(data.summary.visits));
  changeText('metric-unique',number(data.summary.unique_visitors));
  changeText('metric-pwa',number(data.summary.pwa_sessions));
  changeText('metric-pageviews',number(data.summary.page_views));
  applyChange('metric-visits-change',data.comparison.visits_pct);
  applyChange('metric-unique-change',data.comparison.unique_visitors_pct);
  applyChange('metric-pwa-change',data.comparison.pwa_sessions_pct);
  applyChange('metric-pageviews-change',data.comparison.page_views_pct);
  changeText('dashboard-period-summary',t('dashboardSummary')(number(data.summary.visits),number(data.summary.unique_visitors)));
  changeText('dashboard-last-updated',dateTime(data.generated_at));
  renderDaily(data.daily_visits||[]);
  renderLegend(data.acquisition_sources||[]);
  renderBars('session-entry-list',data.session_entries||[],LABELS[currentLang].entry);
  renderBars('actions-list',data.top_actions||[],LABELS[currentLang].action);
  renderBars('display-list',data.display_modes||[],LABELS[currentLang].display);
  renderBars('devices-list',data.devices||[],LABELS[currentLang].device);
  renderBars('browsers-list',data.browsers||[],LABELS[currentLang].browser);
  renderBars('languages-list',data.languages||[],LABELS[currentLang].language);
  renderBars('visitor-mix-list',data.visitor_mix||[],LABELS[currentLang].mix);
  renderBars('visitor-mix-list-secondary',data.visitor_mix||[],LABELS[currentLang].mix);
  renderBars('campaigns-list',data.campaigns||[],{});
  renderHealth(data.health||{});
}

function dashboardQuery(){
  if(currentPreset==='custom'){
    const from=$('range-from').value,to=$('range-to').value;
    if(from&&to&&from<=to)return '?preset=custom&from='+encodeURIComponent(from)+'&to='+encodeURIComponent(to);
    return '?preset=30d';
  }
  return '?preset='+encodeURIComponent(currentPreset);
}

async function loadDashboard(){
  try{
    const data=await api('/api/dashboard'+dashboardQuery());
    renderDashboard(data);
  }catch(error){
    if(error.status===401){setView(false);return;}
    console.error('[MPDGI Stats] dashboard load failed',error);
    $('health-overall').textContent=t('attentionRequired');
    $('health-overall').className='';
    setStatusLight('health-collector-light','bad');setStatusLight('health-db-light','bad');setStatusLight('health-event-light','bad');
  }
}

async function checkSession(){
  try{
    const session=await api('/api/auth/session');
    setView(true);showPanel(currentView);await loadDashboard();return session;
  }catch(error){globalThis.__MPDGI_STATS_SESSION_ERROR__=String(error?.message||error);console.warn('[MPDGI Stats] session check failed',error);setView(false);return null;}
}

function showPanel(view){
  currentView=view||'dashboard';
  document.querySelectorAll('[data-view-panel]').forEach(panel=>{panel.hidden=panel.dataset.viewPanel!==currentView;panel.classList.toggle('active-view',!panel.hidden);});
  document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item.dataset.view===currentView));
  try{window.scrollTo(0,0);}catch{}
}

function slugify(value){
  return String(value||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,64);
}
function updateCampaignUrl(){
  const name=$('campaign-name'),source=$('campaign-source'),output=$('campaign-url');
  if(!name||!source||!output)return;
  const url=new URL(HUB_BASE);
  url.searchParams.set('src',source.value);
  const slug=slugify(name.value);
  if(slug)url.searchParams.set('campaign',slug);
  output.value=url.toString();
}
async function copyValue(value,feedbackId){
  try{
    await navigator.clipboard.writeText(value);
    changeText(feedbackId,t('copied'));
  }catch{
    const el=$(feedbackId);if(el){el.textContent=t('copyFailed');el.style.color='#b42318';}
  }
}

function setupLogin(){
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const errorEl=$('login-error');errorEl.hidden=true;
    const button=$('login-button');button.disabled=true;button.textContent=currentLang==='es'?'Entrando…':'Signing in…';
    try{
      await api('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('login-email').value,password:$('login-password').value,remember:$('login-remember').checked})});
      $('login-password').value='';setView(true);showPanel('dashboard');await loadDashboard();
    }catch(error){
      errorEl.textContent=error.status===429?t('rateError'):t('loginError');errorEl.hidden=false;
    }finally{button.disabled=false;button.textContent=t('signIn');}
  });
}

function setupDashboard(){
  document.querySelectorAll('.lang-button').forEach(btn=>btn.addEventListener('click',()=>setLanguage(btn.dataset.lang)));
  document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>showPanel(item.dataset.view)));

  $('range-select').addEventListener('change',async event=>{
    currentPreset=event.target.value;$('custom-range').hidden=currentPreset!=='custom';
    if(currentPreset!=='custom')await loadDashboard();
  });
  $('apply-range').addEventListener('click',async()=>{
    const from=$('range-from').value,to=$('range-to').value;
    if(!from||!to||from>to){alert(t('validRange'));return;}await loadDashboard();
  });
  $('print-button').addEventListener('click',()=>window.print());
  $('export-button').addEventListener('click',async()=>{
    const button=$('export-button');button.disabled=true;
    try{
      const response=await fetch('/api/export'+dashboardQuery(),{credentials:'same-origin',cache:'no-store'});
      if(response.status===401){setView(false);return;}
      if(!response.ok)throw new Error('export failed');
      const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=response.headers.get('x-filename')||'mpdgi-stats.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    }catch{alert(t('exportError'));}finally{button.disabled=false;}
  });
  $('logout-button').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});}catch{}setView(false);});

  $('campaign-name').addEventListener('input',updateCampaignUrl);
  $('campaign-source').addEventListener('change',updateCampaignUrl);
  $('campaign-copy').addEventListener('click',()=>copyValue($('campaign-url').value,'campaign-feedback'));
  $('campaign-open').addEventListener('click',()=>window.open($('campaign-url').value,'_blank','noopener,noreferrer'));
  $('general-link-copy').addEventListener('click',()=>copyValue($('general-link-url').value,'campaign-feedback'));
}

async function setupServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  try{await navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(STATS_VERSION),{scope:'./',updateViaCache:'none'});}catch(error){console.warn('[MPDGI Stats] service worker',error);}
}

async function init(){
  changeText('stats-version',STATS_VERSION);
  applyTranslations();setupLogin();setupDashboard();updateCampaignUrl();void setupServiceWorker();
  await checkSession();
}
init();
