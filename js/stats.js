'use strict';

const STATS_VERSION=globalThis.MPDGI_STATS_VERSION||'dev';
const LANGUAGE_KEY='mpdgiStatsLanguage';
const HUB_BASE='https://hub.mpdgi.org/';
const SOURCE_COLORS={nfc:'#1468e8',qr:'#5aa2f8',link:'#efb94f',unattributed:'#9ca9bb'};

const I18N={
  es:{
    authorized:'Acceso autorizado solamente',loginHelp:'Inicia sesión para ver las estadísticas privadas de MPDGI.',email:'Correo electrónico',password:'Contraseña',remember:'Recordarme en este dispositivo',signIn:'Entrar',secureNote:'🔒 Acceso privado para administradores aprobados de MPDGI.',
    navDashboard:'Dashboard',navReports:'Reportes',navSources:'Fuentes',navCampaigns:'Campañas',navEngagement:'Interacción',navCards:'Tarjetas Digitales',navTechnology:'Tecnología',navSystem:'Sistema',navMethodology:'Metodología',adminsOnly:'Solo administradores autorizados',
    period:'Período',range7:'Últimos 7 días',range30:'Últimos 30 días',range90:'Últimos 90 días',rangeMonth:'Este mes',rangeYear:'Este año',range365:'Últimos 12 meses',rangeCustom:'Rango personalizado',from:'Desde',to:'Hasta',apply:'Aplicar',printPdf:'🖨 Imprimir / PDF',logout:'Salir',analyticsReport:'Reporte de Analítica',
    summary:'Resumen',loadingPeriod:'Cargando período…',visits:'Visitas (sesiones)',uniqueVisitors:'Visitantes únicos estimados',pwaSessions:'Sesiones desde PWA',pageViews:'Page Views',currentPeriod:'Período actual',lastUpdated:'Última actualización',executiveSnapshot:'Resumen ejecutivo',executivePeriod:'Período seleccionado',peakHour:'Hora de mayor actividad',peakDay:'Día de mayor actividad',sundayActivity:'Sesiones dominicales',wednesdayActivity:'Sesiones del miércoles',topSource:'Fuente principal',topAction:'Acción principal',hourlyActivity:'Actividad por hora',weekdayActivity:'Actividad por día de la semana',
    reportsTitle:'Reportes',reportsIntro:'Resumen visual e imprimible del período seleccionado.',dailyVisits:'Visitas diarias',newReturning:'Visitantes nuevos vs recurrentes',anonymousEstimate:'Estimación anónima',reportNoteTitle:'Acerca del reporte',reportNote:'El dashboard, el CSV y el reporte impreso utilizan los mismos datos agregados del servidor. No se exportan identificadores anónimos individuales.',
    sourcesTitle:'Fuentes',sourcesIntro:'Cómo llegaron los visitantes y cómo comenzó cada sesión.',acquisitionSource:'Fuente de adquisición',estimatedVisitors:'Visitantes estimados',total:'Total',source:'Fuente',visitorsShort:'Visitantes',sessionEntry:'Entrada de sesión',usageMode:'Modo de uso',
    campaignsTitle:'Campañas',campaignsIntro:'Crea enlaces etiquetados para saber cuándo una visita llega por Link, QR o NFC.',createCampaign:'Crear campaña',noCost:'Sin servicios adicionales',campaignName:'Nombre de campaña',campaignSource:'Tipo de acceso',sharedLink:'Enlace compartido',generatedUrl:'URL generada',copyUrl:'Copiar URL',openUrl:'Abrir URL',campaignResults:'Resultados de campañas',firstTouch:'Sesiones atribuidas y adquisición inicial',generalShareLink:'Enlace general para compartir',generalShareHelp:'Usa este enlace cuando envíes el Hub por WhatsApp, Messages, correo o redes y quieras que Stats lo clasifique como Enlace.',copy:'Copiar',
    engagementTitle:'Interacción',engagementIntro:'Qué acciones realizan los visitantes dentro del Hub.',topActions:'Acciones principales',cardsTitle:'Tarjetas Digitales',cardsIntro:'Uso de las business cards NFC de los líderes de MPDGI.',cardsPerformance:'Rendimiento por tarjeta',cardsMeasurementTitle:'Qué mide esta sección',cardsMeasurementNote:'Guardar contacto, llamar y otras acciones cuentan el toque dentro de la tarjeta digital; no confirman que la acción se completó fuera del navegador.',cardsSessions:'Sesiones',cardsVisitors:'Visitantes estimados',cardsNfc:'NFC',cardsShared:'Enlace compartido',cardsDirect:'Web directa',cardsSave:'Guardar contacto (toques)',cardsCalls:'Llamar (toques)',cardsTexts:'Mensaje (toques)',cardsDirections:'Dirección (toques)',cardsWebsite:'Website (toques)',cardsShares:'Compartir (toques)',cardsLast:'Última actividad',
    technologyTitle:'Tecnología',technologyIntro:'Dispositivos, navegadores e idioma observado.',devices:'Dispositivos',browsers:'Navegadores',languages:'Idiomas',
    systemTitle:'Estado del sistema',systemIntro:'Comprobación de los componentes principales de MPDGI Stats.',systemHealth:'Salud del sistema',database:'Base de datos',lastEvent:'Último evento',lastCheck:'Última comprobación',dataQuality:'Calidad de datos',eventsReceived:'Eventos recibidos',eventsStored:'Eventos almacenados',duplicatesPrevented:'Duplicados evitados',rejectedEvents:'Eventos rechazados',delayedEvents:'Eventos retrasados / recuperados',qualityNote:'Los eventos retrasados indican registros recibidos más de dos minutos después de su marca de tiempo del cliente; suelen corresponder a entregas tardías o recuperación de cola offline.',authorizedFooter:'🔒 Solo administradores autorizados.',
    eventPipeline:'Flujo de eventos',degraded:'Degradado',noRecentActivity:'Sin actividad reciente',errorStatus:'Error',
    methodologyTitle:'Metodología y privacidad',methodologyIntro:'Cómo MPDGI Stats define, calcula y conserva sus métricas anónimas.',definitionsTitle:'Definiciones de analítica',
    defSessionTitle:'Session',defSession:'ID anónimo de una visita activa; expira después de 30 minutos de inactividad o cuando cambia el contexto de entrada.',
    defVisitorTitle:'Estimated Visitor',defVisitor:'Navegador/dispositivo anónimo aproximado. No representa una persona identificada.',
    defAcquisitionTitle:'Acquisition Source',defAcquisition:'Primera fuente conocida del visitante anónimo; se conserva y no se sobrescribe.',
    defEntryTitle:'Session Entry',defEntry:'Cómo comenzó la sesión actual: NFC, QR, Link, Web o PWA.',
    defCampaignTitle:'Campaign',defCampaign:'Etiqueta de la sesión actual, separada de la adquisición original.',
    defPwaTitle:'PWA Session',defPwa:'Sesión observada cuando el Hub corre en modo standalone instalado.',
    privacyMethodTitle:'Privacidad y límites',privacyMethod:'No se almacenan nombres de visitantes, emails, pagos, IP cruda, ubicación precisa ni User-Agent completo. La zona oficial de reportes es America/New_York.',
    retentionTitle:'Política de retención',retentionAggregates:'Agregados y reportes: conservación indefinida.',retentionEvents:'Eventos anónimos detallados: hasta 24 meses como política objetivo.',retentionRate:'Datos de rate control: retención corta y operativa.',retentionCampaigns:'Campañas: hasta archivo o eliminación administrativa.',retentionNoDelete:'v{version} no activa borrado automático; cualquier purga futura requiere revisión del volumen D1 y aprobación administrativa.',
    noData:'Sin datos para este período.',sessions:'sesiones',generated:'Generado',previousPeriod:'vs. período anterior',allOperational:'● Todos los sistemas operacionales',attentionRequired:'● Atención requerida',operational:'Operacional',review:'Revisar',noEvents:'Sin eventos',
    loginError:'Correo o contraseña incorrectos.',rateError:'Demasiados intentos. Intenta nuevamente en unos minutos.',validRange:'Selecciona un rango de fechas válido.',exportError:'No fue posible generar el CSV.',copied:'URL copiada.',copyFailed:'No fue posible copiar automáticamente. Selecciona y copia la URL.',campaignPlaceholder:'reunion-lideres-octubre',createCampaignButton:'Crear campaña',campaignCreated:'Campaña creada y guardada.',campaignExists:'La campaña ya existía; se usará el registro existente.',campaignCreateError:'No fue posible guardar la campaña.',campaignNameRequired:'Escribe un nombre de campaña.',campaignSessions:'Sesiones',campaignVisitors:'Visitantes estimados',campaignFirstTouch:'Adquisición inicial',campaignCreatedOn:'Creada',campaignLastActivity:'Última actividad',campaignNoActivity:'Sin actividad en este período',
    executiveSummary:(visits,users,change,source,action,hour,day,sunday,wednesday)=>'Durante el período seleccionado se registraron '+visits+' sesiones y '+users+' visitantes estimados'+(change?' ('+change+')':'')+'. La fuente principal fue '+source+' y la acción más utilizada fue '+action+'. La mayor actividad se observó alrededor de '+hour+' el '+day+'. Domingo registró '+sunday+' sesiones y miércoles '+wednesday+'.',
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
    tipCampaignResults:'Campañas guardadas y resultados del período: sesiones atribuidas, visitantes estimados y adquisición inicial.',
    tipGeneralLink:'Enlace listo para compartir. El parámetro src=link permite clasificar la entrada como Enlace.',
    tipActions:'Acciones más utilizadas dentro del Hub, como Portal de Miembros, Ofrendar, Biblia, redes o GPS.',tipDigitalCards:'Métricas agregadas de las tarjetas digitales NFC: sesiones, visitantes estimados, fuente de entrada y acciones principales.',tipCardSessions:'Sesiones registradas para esta tarjeta digital durante el período seleccionado.',tipCardVisitors:'Estimación anónima de visitantes únicos que abrieron esta tarjeta digital.',tipCardNfc:'Sesiones que comenzaron al tocar una tarjeta NFC y entrar con src=nfc.',tipCardShared:'Sesiones que llegaron mediante un enlace compartido de esta tarjeta.',tipCardDirect:'Sesiones que abrieron esta tarjeta directamente desde la web sin NFC ni enlace etiquetado.',tipCardSave:'Toques en Guardar contacto. Mide la intención de abrir el contacto; no confirma que se haya guardado.',tipCardCalls:'Toques en Llamar. No confirma que la llamada se haya completado.',tipCardTexts:'Toques en Mensaje. No confirma que el SMS se haya enviado.',tipCardDirections:'Toques en Dirección para abrir el mapa o GPS.',tipCardWebsite:'Toques en Website para abrir mpdgi.org desde la tarjeta.',tipCardShares:'Toques en Compartir tarjeta. No confirma que el destinatario haya abierto el enlace.',tipCardLast:'Fecha y hora de la actividad más reciente registrada para esta tarjeta.',
    tipDevices:'Categoría del dispositivo reportada por el Hub: móvil, computadora, tableta u otro.',
    tipBrowsers:'Familia de navegador observada en las sesiones.',
    tipLanguages:'Idioma activo del Hub durante las sesiones observadas.',
    tipSystem:'Estado de los componentes esenciales: collector, base D1 y recepción de eventos.',
    tipExecutive:'Resumen ejecutivo generado con los datos agregados del período seleccionado.',
    tipHourly:'Sesiones agrupadas por hora local del Este de Estados Unidos.',
    tipWeekday:'Sesiones agrupadas por día de la semana según la hora local del Este.',
    tipDataQuality:'Indicadores de calidad del flujo de eventos. Los contadores de duplicados y rechazos comienzan a medirse con esta versión.'
  },
  en:{
    authorized:'Authorized access only',loginHelp:'Sign in to view MPDGI private analytics.',email:'Email address',password:'Password',remember:'Remember me on this device',signIn:'Sign in',secureNote:'🔒 Private access for approved MPDGI administrators.',
    navDashboard:'Dashboard',navReports:'Reports',navSources:'Sources',navCampaigns:'Campaigns',navEngagement:'Engagement',navCards:'Digital Cards',navTechnology:'Technology',navSystem:'System',navMethodology:'Methodology',adminsOnly:'Authorized administrators only',
    period:'Period',range7:'Last 7 days',range30:'Last 30 days',range90:'Last 90 days',rangeMonth:'This month',rangeYear:'This year',range365:'Last 12 months',rangeCustom:'Custom range',from:'From',to:'To',apply:'Apply',printPdf:'🖨 Print / PDF',logout:'Sign out',analyticsReport:'Analytics Report',
    summary:'Summary',loadingPeriod:'Loading period…',visits:'Visits (sessions)',uniqueVisitors:'Estimated unique visitors',pwaSessions:'PWA sessions',pageViews:'Page Views',currentPeriod:'Current period',lastUpdated:'Last updated',executiveSnapshot:'Executive Snapshot',executivePeriod:'Selected period',peakHour:'Peak activity hour',peakDay:'Peak activity day',sundayActivity:'Sunday sessions',wednesdayActivity:'Wednesday sessions',topSource:'Top source',topAction:'Top action',hourlyActivity:'Hourly activity',weekdayActivity:'Weekday activity',
    reportsTitle:'Reports',reportsIntro:'Visual and printable summary for the selected period.',dailyVisits:'Daily visits',newReturning:'New vs returning visitors',anonymousEstimate:'Anonymous estimate',reportNoteTitle:'About this report',reportNote:'The dashboard, CSV export and printed report use the same aggregated server data. Individual anonymous identifiers are not exported.',
    sourcesTitle:'Sources',sourcesIntro:'How visitors arrived and how each session started.',acquisitionSource:'Acquisition source',estimatedVisitors:'Estimated visitors',total:'Total',source:'Source',visitorsShort:'Visitors',sessionEntry:'Session entry',usageMode:'Usage mode',
    campaignsTitle:'Campaigns',campaignsIntro:'Create tagged URLs to identify visits arriving through Link, QR or NFC.',createCampaign:'Create campaign',noCost:'No additional services',campaignName:'Campaign name',campaignSource:'Access type',sharedLink:'Shared link',generatedUrl:'Generated URL',copyUrl:'Copy URL',openUrl:'Open URL',campaignResults:'Campaign results',firstTouch:'Attributed sessions and initial acquisition',generalShareLink:'General share link',generalShareHelp:'Use this link when sharing the Hub through WhatsApp, Messages, email or social media and you want Stats to classify it as Link.',copy:'Copy',
    engagementTitle:'Engagement',engagementIntro:'What visitors do inside the Hub.',topActions:'Top actions',cardsTitle:'Digital Cards',cardsIntro:'Usage of MPDGI leaders’ NFC business cards.',cardsPerformance:'Performance by card',cardsMeasurementTitle:'What this section measures',cardsMeasurementNote:'Save contact, call and other actions count the tap inside the digital card; they do not confirm completion outside the browser.',cardsSessions:'Sessions',cardsVisitors:'Estimated visitors',cardsNfc:'NFC',cardsShared:'Shared link',cardsDirect:'Direct web',cardsSave:'Save contact (taps)',cardsCalls:'Call taps',cardsTexts:'Text taps',cardsDirections:'Directions taps',cardsWebsite:'Website taps',cardsShares:'Share taps',cardsLast:'Last activity',
    technologyTitle:'Technology',technologyIntro:'Observed devices, browsers and Hub language.',devices:'Devices',browsers:'Browsers',languages:'Languages',
    systemTitle:'System status',systemIntro:'Status of the main MPDGI Stats components.',systemHealth:'System Health',database:'Database',lastEvent:'Last event',lastCheck:'Last check',dataQuality:'Data quality',eventsReceived:'Events received',eventsStored:'Events stored',duplicatesPrevented:'Duplicates prevented',rejectedEvents:'Rejected events',delayedEvents:'Delayed / recovered events',qualityNote:'Delayed events are records received more than two minutes after the client timestamp; they commonly indicate late delivery or offline-queue recovery.',authorizedFooter:'🔒 For authorized administrators only.',
    eventPipeline:'Event pipeline',degraded:'Degraded',noRecentActivity:'No recent activity',errorStatus:'Error',
    methodologyTitle:'Methodology & privacy',methodologyIntro:'How MPDGI Stats defines, calculates and retains anonymous metrics.',definitionsTitle:'Analytics definitions',
    defSessionTitle:'Session',defSession:'Anonymous ID for an active visit; expires after 30 minutes of inactivity or when the entry context changes.',
    defVisitorTitle:'Estimated Visitor',defVisitor:'Approximate anonymous browser/device. It is not an identified person.',
    defAcquisitionTitle:'Acquisition Source',defAcquisition:'The anonymous visitor’s first known source; it remains immutable.',
    defEntryTitle:'Session Entry',defEntry:'How the current session began: NFC, QR, Link, Web or PWA.',
    defCampaignTitle:'Campaign',defCampaign:'Tag for the current session, kept separate from original acquisition.',
    defPwaTitle:'PWA Session',defPwa:'Session observed while the Hub runs in installed standalone mode.',
    privacyMethodTitle:'Privacy & limits',privacyMethod:'Visitor names, visitor emails, payment data, raw IP addresses, precise location and full User-Agent strings are not stored. Official reporting timezone is America/New_York.',
    retentionTitle:'Data retention policy',retentionAggregates:'Aggregates and reports: retained indefinitely.',retentionEvents:'Detailed anonymous events: target retention up to 24 months.',retentionRate:'Rate-control data: short operational retention.',retentionCampaigns:'Campaigns: retained until administratively archived or deleted.',retentionNoDelete:'v{version} does not enable automatic deletion; any future purge requires D1 volume review and administrative approval.',
    noData:'No data for this period.',sessions:'sessions',generated:'Generated',previousPeriod:'vs. previous period',allOperational:'● All systems operational',attentionRequired:'● Attention required',operational:'Operational',review:'Review',noEvents:'No events',
    loginError:'Incorrect email or password.',rateError:'Too many attempts. Try again in a few minutes.',validRange:'Select a valid date range.',exportError:'The CSV could not be generated.',copied:'URL copied.',copyFailed:'Automatic copy failed. Select and copy the URL.',campaignPlaceholder:'leaders-meeting-october',createCampaignButton:'Create campaign',campaignCreated:'Campaign created and saved.',campaignExists:'This campaign already existed; the existing record will be used.',campaignCreateError:'The campaign could not be saved.',campaignNameRequired:'Enter a campaign name.',campaignSessions:'Sessions',campaignVisitors:'Estimated visitors',campaignFirstTouch:'Initial acquisition',campaignCreatedOn:'Created',campaignLastActivity:'Last activity',campaignNoActivity:'No activity in this period',
    executiveSummary:(visits,users,change,source,action,hour,day,sunday,wednesday)=>'The selected period recorded '+visits+' sessions and '+users+' estimated visitors'+(change?' ('+change+')':'')+'. The top source was '+source+' and the most-used action was '+action+'. Peak activity occurred around '+hour+' on '+day+'. Sunday recorded '+sunday+' sessions and Wednesday '+wednesday+'.',
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
    tipCampaignResults:'Saved campaigns and period results: attributed sessions, estimated visitors and initial acquisition.',
    tipGeneralLink:'Ready-to-share URL. The src=link parameter classifies the entry as Link.',
    tipActions:'Most-used Hub actions, such as Member Portal, Give, Bible, social media or GPS.',tipDigitalCards:'Aggregated NFC digital-card metrics: sessions, estimated visitors, entry source and primary actions.',tipCardSessions:'Sessions recorded for this digital card during the selected period.',tipCardVisitors:'Anonymous estimate of unique visitors who opened this digital card.',tipCardNfc:'Sessions that began by tapping an NFC card and entering with src=nfc.',tipCardShared:'Sessions that arrived through a shared link for this card.',tipCardDirect:'Sessions that opened this card directly on the web without NFC or a tagged shared link.',tipCardSave:'Taps on Save Contact. Measures intent to open the contact; it does not confirm the contact was saved.',tipCardCalls:'Taps on Call. It does not confirm that a call was completed.',tipCardTexts:'Taps on Text. It does not confirm that an SMS was sent.',tipCardDirections:'Taps on Directions to open maps or GPS.',tipCardWebsite:'Taps on Website to open mpdgi.org from the card.',tipCardShares:'Taps on Share Card. It does not confirm that a recipient opened the link.',tipCardLast:'Date and time of the most recent activity recorded for this card.',
    tipDevices:'Device category reported by the Hub: mobile, desktop, tablet or other.',
    tipBrowsers:'Browser family observed during sessions.',
    tipLanguages:'Active Hub language during observed sessions.',
    tipSystem:'Status of essential components: collector, D1 database and event reception.',
    tipExecutive:'Executive snapshot generated from aggregated data for the selected period.',
    tipHourly:'Sessions grouped by local Eastern Time hour.',
    tipWeekday:'Sessions grouped by weekday using local Eastern Time.',
    tipDataQuality:'Event-flow quality indicators. Duplicate and rejection counters begin tracking with this release.'
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
    weekday:{0:'Domingo',1:'Lunes',2:'Martes',3:'Miércoles',4:'Jueves',5:'Viernes',6:'Sábado'},
    action:{bc_save_contact:'Guardar contacto (toque)',bc_call:'Llamar (toque)',bc_text:'Mensaje (toque)',bc_directions:'Dirección (toque)',bc_website:'Website (toque)',bc_share:'Compartir tarjeta (toque)',bc_flip:'Girar tarjeta (toque)',card_members:'Portal de Miembros',card_give:'Ofrendar',card_prayer:'Petición de Oración',card_bible:'Biblia',card_ministries:'Ministerios',card_social:'Redes Sociales',card_website:'Sitio Web',card_about:'Acerca de',give_tithely:'Tithe.ly',give_square:'Square',give_zelle_copy:'Copiar Zelle',social_facebook:'Facebook',social_instagram:'Instagram',social_youtube:'YouTube',social_tiktok:'TikTok',bible_spanish:'Biblia RVR1960',bible_english:'Bible KJV',directions:'Indicaciones / GPS',language_change:'Cambio de idioma',pwa_install_prompt:'Instalar PWA',pwa_installed:'PWA instalada',external_link:'Enlace externo'}
  },
  en:{
    source:{nfc:'NFC',qr:'QR',link:'Link',unattributed:'Web / Unattributed'},
    entry:{nfc:'NFC',qr:'QR',link:'Link',web:'Web',pwa:'Installed PWA'},
    display:{pwa:'Installed PWA',browser:'Browser'},
    device:{mobile:'Mobile',desktop:'Desktop',tablet:'Tablet',other:'Other'},
    browser:{edge:'Edge',chrome:'Chrome',safari:'Safari',firefox:'Firefox',other:'Other'},
    language:{es:'ES — Spanish',en:'EN — English',other:'Other'},
    mix:{new:'New',returning:'Returning'},
    weekday:{0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'},
    action:{bc_save_contact:'Save Contact (tap)',bc_call:'Call (tap)',bc_text:'Text (tap)',bc_directions:'Directions (tap)',bc_website:'Website (tap)',bc_share:'Share Card (tap)',bc_flip:'Flip Card (tap)',card_members:'Member Portal',card_give:'Give',card_prayer:'Prayer Request',card_bible:'Bible',card_ministries:'Ministries',card_social:'Social Media',card_website:'Website',card_about:'About',give_tithely:'Tithe.ly',give_square:'Square',give_zelle_copy:'Copy Zelle',social_facebook:'Facebook',social_instagram:'Instagram',social_youtube:'YouTube',social_tiktok:'TikTok',bible_spanish:'Bible RVR1960',bible_english:'Bible KJV',directions:'Directions / GPS',language_change:'Language change',pwa_install_prompt:'Install PWA',pwa_installed:'PWA installed',external_link:'External link'}
  }
};

let currentPreset='30d';
let currentData=null;
let currentView='dashboard';
function storageGet(key){try{return localStorage.getItem(key);}catch{return null;}}
function storageSet(key,value){try{localStorage.setItem(key,value);}catch{}}
let currentLang=storageGet(LANGUAGE_KEY)==='en'?'en':'es';

const $=id=>document.getElementById(id);
const t=key=>{
  const value=I18N[currentLang][key]??key;
  return typeof value==='string'?value.replaceAll('{version}',STATS_VERSION):value;
};
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

function hourLabel(hour){
  const base=new Date(Date.UTC(2026,0,1,Number(hour)||0,0,0));
  return new Intl.DateTimeFormat(currentLang==='es'?'es-US':'en-US',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:'UTC'}).format(base);
}
function renderActivityBars(containerId,items,type){
  const root=$(containerId);if(!root)return;root.replaceChildren();
  if(!items.length){root.textContent=t('noData');return;}
  const max=Math.max(1,...items.map(x=>Number(x.value)||0));
  for(const item of items){
    const row=document.createElement('div');row.className='activity-row';
    const label=document.createElement('span');label.textContent=type==='hour'?hourLabel(Number(item.key)):LABELS[currentLang].weekday[item.key]||item.key;
    const track=document.createElement('div');track.className='bar-track';
    const fill=document.createElement('div');fill.className='bar-fill';fill.style.width=Math.max(2,(Number(item.value)||0)/max*100)+'%';
    const value=document.createElement('strong');value.textContent=number(item.value);
    row.append(label,track,value);root.append(row);
  }
}
function renderExecutiveSummary(data){
  const source=(data.acquisition_sources||[]).reduce((best,item)=>Number(item.value)>Number(best.value||0)?item:best,{key:'unattributed',value:0});
  const action=(data.top_actions||[])[0]||{key:'—',value:0};
  const activity=data.activity||{};
  const change=percentChange(data.comparison?.visits_pct);
  const sourceLabel=LABELS[currentLang].source[source.key]||source.key;
  const actionLabel=LABELS[currentLang].action[action.key]||action.key;
  const dayLabel=LABELS[currentLang].weekday[String(activity.peak_weekday)]||'—';
  changeText('executive-summary-text',t('executiveSummary')(number(data.summary.visits),number(data.summary.unique_visitors),change,sourceLabel,actionLabel,hourLabel(activity.peak_hour),dayLabel,number(activity.sunday_sessions||0),number(activity.wednesday_sessions||0)));
  changeText('executive-period',data.range.from+' — '+data.range.to);
  changeText('executive-peak-hour',hourLabel(activity.peak_hour));
  changeText('executive-peak-day',dayLabel);
  changeText('executive-sunday',number(activity.sunday_sessions||0));
  changeText('executive-wednesday',number(activity.wednesday_sessions||0));
  changeText('executive-source',sourceLabel);
  changeText('executive-action',actionLabel);
}
function renderDataQuality(data){
  const q=data.data_quality||{};
  changeText('quality-received',number(q.events_received));
  changeText('quality-stored',number(q.events_stored));
  changeText('quality-duplicates',number(q.duplicates_prevented));
  changeText('quality-rejected',number(q.rejected));
  changeText('quality-delayed',number(q.delayed_events));
  changeText('quality-window',data.range.from+' — '+data.range.to);
  changeText('quality-note',t('qualityNote'));
}
function renderCampaigns(items){
  const root=$('campaigns-list');if(!root)return;root.replaceChildren();
  if(!items.length){root.textContent=t('noData');return;}
  items=[...items].sort((a,b)=>(Number(b.sessions)||0)-(Number(a.sessions)||0)||(Number(b.visitors)||0)-(Number(a.visitors)||0)||String(b.created_at||'').localeCompare(String(a.created_at||'')));
  for(const item of items){
    const card=document.createElement('div');card.className='campaign-result';
    const head=document.createElement('div');head.className='campaign-result-head';
    const title=document.createElement('strong');title.textContent=item.name||item.slug||'—';
    const badge=document.createElement('span');badge.className='campaign-source-badge';badge.textContent=String(item.source||'').toUpperCase();
    head.append(title,badge);
    const metrics=document.createElement('div');metrics.className='campaign-result-metrics';
    const metric=(label,value)=>{const box=document.createElement('span');const k=document.createElement('small');k.textContent=label;const v=document.createElement('b');v.textContent=number(value);box.append(k,v);return box;};
    metrics.append(metric(t('campaignSessions'),item.sessions),metric(t('campaignVisitors'),item.visitors),metric(t('campaignFirstTouch'),item.acquired_visitors));
    const meta=document.createElement('div');meta.className='campaign-result-meta';
    const created=document.createElement('span');created.textContent=t('campaignCreatedOn')+': '+(item.created_at?dateTime(item.created_at):'—');
    const last=document.createElement('span');last.textContent=t('campaignLastActivity')+': '+(item.last_activity_at?dateTime(item.last_activity_at):t('campaignNoActivity'));
    meta.append(created,last);
    card.append(head,metrics,meta);root.append(card);
  }
}

function cardDisplayName(id){
  const known={'ruben-suarez':'Pastor Ruben Suárez'};
  if(known[id])return known[id];
  return String(id||'').split('-').filter(Boolean).map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ')||'—';
}
function renderDigitalCards(items){
  const root=$('digital-cards-list');if(!root)return;root.replaceChildren();
  if(!items.length){root.textContent=t('noData');return;}
  for(const item of items){
    const card=document.createElement('article');card.className='digital-card-result';
    const head=document.createElement('div');head.className='digital-card-head';
    const identity=document.createElement('div');
    const title=document.createElement('strong');title.textContent=cardDisplayName(item.card_id);
    const slug=document.createElement('small');slug.textContent=item.card_id||'';
    identity.append(title,slug);
    const sessions=document.createElement('div');sessions.className='digital-card-session-total';sessions.dataset.tooltipKey='tipCardSessions';sessions.title=t('tipCardSessions');
    const sessionValue=document.createElement('b');sessionValue.textContent=number(item.sessions);
    const sessionLabel=document.createElement('span');sessionLabel.textContent=t('cardsSessions');
    sessions.append(sessionValue,sessionLabel);
    head.append(identity,sessions);

    const metrics=document.createElement('div');metrics.className='digital-card-metrics';
    const metric=(label,value,accent=false,tipKey='')=>{
      const box=document.createElement('div');if(accent)box.classList.add('metric-accent');
      if(tipKey){box.dataset.tooltipKey=tipKey;box.title=t(tipKey);}
      const k=document.createElement('span');k.textContent=label;
      const v=document.createElement('strong');v.textContent=number(value);
      box.append(k,v);return box;
    };
    metrics.append(
      metric(t('cardsVisitors'),item.visitors,true,'tipCardVisitors'),
      metric(t('cardsNfc'),item.nfc_sessions,true,'tipCardNfc'),
      metric(t('cardsShared'),item.link_sessions,false,'tipCardShared'),
      metric(t('cardsDirect'),item.web_sessions,false,'tipCardDirect'),
      metric(t('cardsSave'),item.save_contact,true,'tipCardSave'),
      metric(t('cardsCalls'),item.calls,false,'tipCardCalls'),
      metric(t('cardsTexts'),item.texts,false,'tipCardTexts'),
      metric(t('cardsDirections'),item.directions,false,'tipCardDirections'),
      metric(t('cardsWebsite'),item.website,false,'tipCardWebsite'),
      metric(t('cardsShares'),item.shares,false,'tipCardShares')
    );
    const foot=document.createElement('div');foot.className='digital-card-foot';foot.dataset.tooltipKey='tipCardLast';foot.title=t('tipCardLast');
    foot.textContent=t('cardsLast')+': '+(item.last_activity_at?dateTime(item.last_activity_at):t('noEvents'));
    card.append(head,metrics,foot);root.append(card);
  }
}

function setStatusLight(id,status){
  const el=$(id);if(!el)return;
  el.className='status-light '+(status==='ok'?'status-green':status==='warn'?'status-yellow':status==='bad'?'status-red':'status-neutral');
}
function renderHealth(health){
  const label=status=>status==='operational'?t('operational'):status==='degraded'?t('degraded'):status==='no_recent_activity'?t('noRecentActivity'):t('errorStatus');
  const light=status=>status==='operational'?'ok':status==='no_recent_activity'||status==='degraded'?'warn':'bad';
  const collector=health?.collector||'error',database=health?.database||'error',pipeline=health?.event_pipeline||'error';
  const lastEventOk=Boolean(health?.last_event_at);
  const ok=collector==='operational'&&database==='operational'&&pipeline==='operational';
  const overall=$('health-overall');overall.textContent=ok?t('allOperational'):t('attentionRequired');overall.className=ok?'health-ok':'';
  changeText('health-collector',label(collector));
  changeText('health-db',label(database)+(Number.isFinite(Number(health?.database_latency_ms))?' · '+number(health.database_latency_ms)+' ms':''));
  changeText('health-pipeline',label(pipeline));
  changeText('health-last-event',lastEventOk?dateTime(health.last_event_at):t('noEvents'));
  changeText('health-last-check',dateTime(new Date().toISOString()));
  setStatusLight('health-collector-light',light(collector));
  setStatusLight('health-db-light',light(database));
  setStatusLight('health-pipeline-light',light(pipeline));
  setStatusLight('health-event-light',lastEventOk?'ok':collector==='no_recent_activity'?'warn':'bad');
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
  renderExecutiveSummary(data);
  renderDaily(data.daily_visits||[]);
  renderActivityBars('hourly-activity-list',data.activity?.hourly_sessions||[],'hour');
  renderActivityBars('weekday-activity-list',data.activity?.weekday_sessions||[],'weekday');
  renderLegend(data.acquisition_sources||[]);
  renderBars('session-entry-list',data.session_entries||[],LABELS[currentLang].entry);
  renderBars('actions-list',data.top_actions||[],LABELS[currentLang].action);
  renderBars('display-list',data.display_modes||[],LABELS[currentLang].display);
  renderBars('devices-list',data.devices||[],LABELS[currentLang].device);
  renderBars('browsers-list',data.browsers||[],LABELS[currentLang].browser);
  renderBars('languages-list',data.languages||[],LABELS[currentLang].language);
  renderBars('visitor-mix-list',data.visitor_mix||[],LABELS[currentLang].mix);
  renderBars('visitor-mix-list-secondary',data.visitor_mix||[],LABELS[currentLang].mix);
  renderCampaigns(data.campaigns||[]);
  renderDigitalCards(data.digital_cards||[]);
  renderDataQuality(data);
  renderHealth(data.health||{});

}

function dashboardQuery(){
  const selected=$('range-select')?.value||currentPreset;
  currentPreset=selected;
  if(selected==='custom'){
    const from=$('range-from').value,to=$('range-to').value;
    if(from&&to&&from<=to)return '?preset=custom&from='+encodeURIComponent(from)+'&to='+encodeURIComponent(to);
    return '?preset=30d';
  }
  return '?preset='+encodeURIComponent(selected);
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
    setStatusLight('health-collector-light','bad');setStatusLight('health-db-light','bad');setStatusLight('health-pipeline-light','bad');setStatusLight('health-event-light','bad');
  }
}

async function checkSession(){
  try{
    const session=await api('/api/auth/session');
    setView(true);showPanel(currentView);await loadDashboard();return session;
  }catch(error){console.warn('[MPDGI Stats] session check failed',error);setView(false);return null;}
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
async function saveCampaign(){
  const name=$('campaign-name').value.trim(),source=$('campaign-source').value,slug=slugify(name);
  const feedback=$('campaign-feedback');
  if(!name||!slug){feedback.textContent=t('campaignNameRequired');feedback.style.color='#b42318';return null;}
  const button=$('campaign-create');if(button)button.disabled=true;
  try{
    const result=await api('/api/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,source,slug})});
    if(result?.campaign?.url)$('campaign-url').value=result.campaign.url;
    feedback.textContent=result?.created===false?t('campaignExists'):t('campaignCreated');
    feedback.style.color='#147a32';
    await loadDashboard();
    return result?.campaign||{url:$('campaign-url').value};
  }catch(error){
    feedback.textContent=t('campaignCreateError');feedback.style.color='#b42318';
    console.error('[MPDGI Stats] campaign save failed',error);return null;
  }finally{if(button)button.disabled=false;}
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
    currentPreset=$('range-select').value||currentPreset;
    const from=$('range-from').value,to=$('range-to').value;
    if(!from||!to||from>to){alert(t('validRange'));return;}
    await loadDashboard();
  });
  $('print-button').addEventListener('click',()=>{
    document.body.classList.add('print-all');
    const cleanup=()=>document.body.classList.remove('print-all');
    window.addEventListener('afterprint',cleanup,{once:true});
    window.print();
    setTimeout(cleanup,3000);
  });
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
  $('campaign-create').addEventListener('click',()=>void saveCampaign());
  $('campaign-copy').addEventListener('click',async()=>{
    const saved=await saveCampaign();
    if(saved)await copyValue(saved.url||$('campaign-url').value,'campaign-feedback');
  });
  $('campaign-open').addEventListener('click',async()=>{
    const url=$('campaign-url').value;
    const popup=window.open('about:blank','_blank');
    if(popup){try{popup.opener=null;}catch{}}
    const saved=await saveCampaign();
    const target=saved?.url||url;
    if(popup){
      try{popup.location.replace(target);}catch{try{popup.location.href=target;}catch{}}
    }else if(saved){
      window.open(target,'_blank','noopener,noreferrer');
    }
  });
  $('general-link-copy').addEventListener('click',()=>copyValue($('general-link-url').value,'campaign-feedback'));
}

window.addEventListener('beforeprint',()=>document.body.classList.add('print-all'));
window.addEventListener('afterprint',()=>document.body.classList.remove('print-all'));

async function setupServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  const RELOAD_GUARD_KEY='mpdgiStatsSwReloadAt';
  let hadController=Boolean(navigator.serviceWorker.controller);
  let reloadingForUpdate=false;
  const reloadOnce=()=>{
    if(reloadingForUpdate)return;
    const now=Date.now();
    try{
      const previous=Number(sessionStorage.getItem(RELOAD_GUARD_KEY)||0);
      if(now-previous<5000)return;
      sessionStorage.setItem(RELOAD_GUARD_KEY,String(now));
    }catch{}
    reloadingForUpdate=true;
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!hadController){hadController=true;return;}
    reloadOnce();
  });
  try{
    const registration=await navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(STATS_VERSION),{scope:'./',updateViaCache:'none'});
    const activateWaiting=()=>{if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});};
    const checkForUpdate=async()=>{
      if(!navigator.onLine)return;
      try{await registration.update();activateWaiting();}catch{}
    };
    activateWaiting();
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      worker?.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'});
      });
    });
    setTimeout(()=>void checkForUpdate(),1500);
    setInterval(()=>void checkForUpdate(),15*60*1000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void checkForUpdate();});
    window.addEventListener('pageshow',event=>{if(event.persisted)void checkForUpdate();});
    window.addEventListener('online',()=>void checkForUpdate());
  }catch(error){console.warn('[MPDGI Stats] service worker',error);}
}

async function init(){
  changeText('stats-version',STATS_VERSION);
  changeText('sidebar-version','v'+STATS_VERSION);
  applyTranslations();setupLogin();setupDashboard();updateCampaignUrl();void setupServiceWorker();
  await checkSession();
}
init();
