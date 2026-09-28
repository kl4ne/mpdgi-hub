'use strict';

const HUB_VERSION='1.4.2';
const STORAGE_LANGUAGE_KEY='mpdgiHubLanguage';
const VALID_THEMES=new Set(['blue','green','purple','gold','teal','social','website','about']);
const VALID_MODAL_TYPES=new Set(['give','social','bible','about']);

const UI={
  es:{
    linksHeading:'Accesos principales',sunday:'Domingos',wednesday:'Miércoles',install:'Instalar',about:'Acerca de',
    close:'Cerrar',offline:'Sin conexión • algunos enlaces externos no estarán disponibles',
    loadError:'No fue posible cargar los accesos. Visita mpdgi.org para continuar.',
    giveTitle:'Ofrendar',giveIntro:'Selecciona una opción segura para apoyar a Ministerio Plenitud de Gracia.',
    tithely:'Ofrendar con Tithe.ly',square:'Ofrendar con Square',acceptedCards:'Tarjetas aceptadas por Square',zelle:'Zelle',zelleInstruction:'Correo oficial para Zelle',copy:'Copiar',copied:'Copiado',
    copyFailed:'No se pudo copiar. Mantén presionado el correo para copiarlo.',
    socialTitle:'Redes Sociales',socialIntro:'Selecciona una de nuestras plataformas oficiales.',
    facebook:'Facebook',instagram:'Instagram',youtube:'YouTube',
    bibleTitle:'Biblia',bibleIntro:'Selecciona el idioma y la versión que deseas leer.',
    bibleSpanish:'Biblia en Español',bibleSpanishVersion:'Reina-Valera 1960 (RVR1960)',
    bibleEnglish:'Bible in English',bibleEnglishVersion:'King James Version (KJV)',
    aboutTitle:'Acerca de MPDGI Hub',
    aboutIntro:'Hub digital oficial preparado para NFC de Ministerio Plenitud de Gracia, creado para brindar acceso rápido a los servicios y recursos oficiales de la iglesia.',
    version:'Versión',website:'Sitio web oficial',external:'Servicios externos',
    externalText:'Tithe.ly, Square, ChMeetings, BibleGateway, YouTube, Facebook e Instagram están sujetos a sus propios términos y políticas de privacidad.',
    privacy:'Privacidad',privacyText:'Este Hub no almacena contraseñas, información de pago ni información personal sensible.',
    developerCredit:'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright:'© 2026 Ministerio Plenitud de Gracia. Todos los derechos reservados.',
    officialWebsite:'Abrir mpdgi.org',languageLabel:'Cambiar idioma a inglés'
  },
  en:{
    linksHeading:'Main access links',sunday:'Sundays',wednesday:'Wednesdays',install:'Install',about:'About',
    close:'Close',offline:'Offline • some external links will not be available',
    loadError:'The hub links could not be loaded. Visit mpdgi.org to continue.',
    giveTitle:'Give',giveIntro:'Choose a secure option to support Ministerio Plenitud de Gracia.',
    tithely:'Give with Tithe.ly',square:'Give with Square',acceptedCards:'Cards accepted by Square',zelle:'Zelle',zelleInstruction:'Official Zelle email',copy:'Copy',copied:'Copied',
    copyFailed:'Could not copy. Press and hold the email address to copy it.',
    socialTitle:'Social Media',socialIntro:'Choose one of our official platforms.',
    facebook:'Facebook',instagram:'Instagram',youtube:'YouTube',
    bibleTitle:'Bible',bibleIntro:'Choose the language and version you want to read.',
    bibleSpanish:'Biblia en Español',bibleSpanishVersion:'Reina-Valera 1960 (RVR1960)',
    bibleEnglish:'Bible in English',bibleEnglishVersion:'King James Version (KJV)',
    aboutTitle:'About MPDGI Hub',
    aboutIntro:'Official NFC-ready digital hub for Ministerio Plenitud de Gracia, created to provide fast access to the church’s official services and resources.',
    version:'Version',website:'Official website',external:'External services',
    externalText:'Tithe.ly, Square, ChMeetings, BibleGateway, YouTube, Facebook, and Instagram are subject to their respective terms and privacy policies.',
    privacy:'Privacy',privacyText:'This Hub does not store passwords, payment information, or sensitive personal information.',
    developerCredit:'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright:'© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.',
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
  facebook:'https://www.facebook.com/mpdginc',instagram:'https://www.instagram.com/mpdginc/',
  tithely:'https://tithe.ly/give_new/www/#/tithely/give-one-time/6513581',square:'https://square.link/u/8veQoUxF',zelle:'mpdginc@gmail.com',
  bibleSpanish:'https://www.biblegateway.com/versions/Reina-Valera-1960-RVR1960-Biblia/',
  bibleEnglish:'https://www.biblegateway.com/versions/King-James-Version-KJV-Bible/',
  defaultLanguage:'es'
};

const FALLBACK_LINKS=[
  {id:'members',order:1,title:{es:'Portal de Miembros',en:'Member Portal'},subtitle:{es:'ChMeetings',en:'ChMeetings'},url:'https://mpdgi.chmeetings.com',action:'direct',open:'new',theme:'blue',icon:'member'},
  {id:'give',order:2,title:{es:'Ofrendar',en:'Give'},subtitle:{es:'Tithe.ly • Square • Zelle',en:'Tithe.ly • Square • Zelle'},action:'modal',modal:'give',theme:'green',icon:'offering'},
  {id:'prayer',order:3,title:{es:'Petición de Oración',en:'Prayer Request'},subtitle:{es:'Envíanos tu petición',en:'Send us your request'},url:'https://mpdgi.org/oracion',action:'direct',open:'new',theme:'purple',icon:'prayer'},
  {id:'bible',order:4,title:{es:'Biblia',en:'Bible'},subtitle:{es:'Español • English',en:'Español • English'},action:'modal',modal:'bible',theme:'gold',icon:'bible'},
  {id:'ministries',order:5,title:{es:'Ministerios',en:'Ministries'},subtitle:{es:'Sirve con nosotros',en:'Serve with us'},url:'https://mpdgi.org/ministerios',action:'direct',open:'new',theme:'teal',icon:'ministry'},
  {id:'social',order:6,title:{es:'Redes Sociales',en:'Social Media'},subtitle:{es:'Facebook • Instagram • YouTube',en:'Facebook • Instagram • YouTube'},action:'modal',modal:'social',theme:'social',icon:'share'},
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

function createBrandMark(name){
  const wrap=document.createElement('span');wrap.className='brand-mark';wrap.setAttribute('aria-hidden','true');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');
  if(name==='facebook'){
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d','M13.6 8H17V4h-3.4C10 4 8 6.1 8 9.5V12H5v4h3v5h4v-5h3.6l.7-4H12V9.8c0-1.2.5-1.8 1.6-1.8Z');
    p.setAttribute('fill','currentColor');svg.append(p);
  }else if(name==='instagram'){
    svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');
    const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x','3.5');r.setAttribute('y','3.5');r.setAttribute('width','17');r.setAttribute('height','17');r.setAttribute('rx','5');svg.append(r);
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx','12');c.setAttribute('cy','12');c.setAttribute('r','4');svg.append(c);
    const d=document.createElementNS('http://www.w3.org/2000/svg','circle');d.setAttribute('cx','17.2');d.setAttribute('cy','6.8');d.setAttribute('r','1');d.setAttribute('fill','currentColor');d.setAttribute('stroke','none');svg.append(d);
  }else{
    const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x','2');r.setAttribute('y','5');r.setAttribute('width','20');r.setAttribute('height','14');r.setAttribute('rx','4');r.setAttribute('fill','currentColor');svg.append(r);
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d','m10 9 6 3-6 3Z');p.setAttribute('fill','#fff');svg.append(p);
  }
  wrap.append(svg);return wrap;
}

function textElement(tag,className,value){const el=document.createElement(tag);if(className)el.className=className;el.textContent=value;return el;}
function safeHttpsUrl(value){try{const u=new URL(value,location.href);return u.protocol==='https:'?u.href:null;}catch{return null;}}
async function fetchJson(path,fallback){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(String(r.status));return await r.json();}catch(e){console.warn('[MPDGI Hub]',path,e);return fallback;}}
function translated(v){return v&&typeof v==='object'?(v[currentLanguage]||v.es||v.en||''):(typeof v==='string'?v:'');}

let config={...DEFAULT_CONFIG},links=[...FALLBACK_LINKS],currentLanguage='es',installPrompt=null,lastModalTrigger=null,pendingUpdateReload=false;

function setLanguage(language,persist=true){
  currentLanguage=language==='en'?'en':'es';document.documentElement.lang=currentLanguage;
  if(persist){try{localStorage.setItem(STORAGE_LANGUAGE_KEY,currentLanguage);}catch{}}
  const s=UI[currentLanguage];
  document.getElementById('language-code').textContent=currentLanguage.toUpperCase();
  document.getElementById('language-toggle').setAttribute('aria-label',s.languageLabel);
  document.getElementById('links-heading').textContent=s.linksHeading;
  document.getElementById('tagline').textContent='“'+(currentLanguage==='es'?config.tagline:config.taglineEn)+'”';
  document.getElementById('scripture').textContent=currentLanguage==='es'?config.scripture:config.scriptureEn;
  document.getElementById('sunday-label').textContent=s.sunday;document.getElementById('wednesday-label').textContent=s.wednesday;
  document.getElementById('modal-close').setAttribute('aria-label',s.close);
  document.getElementById('developer-credit').textContent=s.developerCredit;document.getElementById('copyright-text').textContent=s.copyright;
  updateOfflineState();renderCards();
}

function buildCard(item){
  const article=document.createElement('article');const theme=VALID_THEMES.has(item.theme)?item.theme:'blue';
  article.className='hub-card card-'+theme+(item.wide?' card-wide':'');article.dataset.cardId=item.id;
  const action=item.action==='modal'?document.createElement('button'):document.createElement('a');action.className='card-action';
  if(item.action==='modal'&&VALID_MODAL_TYPES.has(item.modal)){action.type='button';action.addEventListener('click',()=>openNamedModal(item.modal,action));}
  else{const url=safeHttpsUrl(item.url);if(!url)return null;action.href=url;if((item.open||'new')==='new'){action.target='_blank';action.rel='noopener noreferrer';}}
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
  const parts=(config.address||DEFAULT_CONFIG.address).split(',').map(x=>x.trim()),el=document.getElementById('address-text');
  if(parts.length>=2)el.replaceChildren(document.createTextNode(parts[0]),document.createElement('br'),document.createTextNode(parts.slice(1).join(', ')));else el.textContent=config.address;
  document.getElementById('sunday-time').textContent=config.sundayService;document.getElementById('wednesday-time').textContent=config.wednesdayBibleStudy;
}
function focusableElements(){return[...document.getElementById('hub-modal').querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(e=>!e.hidden&&e.offsetParent!==null);}
function setBackgroundInert(state){const main=document.getElementById('main-content');if(!main)return;main.inert=state;if(state)main.setAttribute('aria-hidden','true');else main.removeAttribute('aria-hidden');}
function modalIsOpen(){return !document.getElementById('modal-overlay').hidden;}
function reloadAfterUpdateIfSafe(){if(!pendingUpdateReload||modalIsOpen()||document.visibilityState!=='visible')return;pendingUpdateReload=false;location.reload();}
function openModal(title,trigger){const o=document.getElementById('modal-overlay'),b=document.getElementById('modal-body');lastModalTrigger=trigger||document.activeElement;document.getElementById('modal-title').textContent=title;b.replaceChildren();o.hidden=false;document.body.classList.add('modal-open');setBackgroundInert(true);document.getElementById('modal-close').focus();return b;}
function closeModal(){const o=document.getElementById('modal-overlay');if(o.hidden)return;o.hidden=true;document.body.classList.remove('modal-open');setBackgroundInert(false);lastModalTrigger?.focus?.();reloadAfterUpdateIfSafe();}
function externalLink(label,url,className=''){const a=document.createElement('a');a.className=('modal-action '+className).trim();a.href=safeHttpsUrl(url)||'#';a.target='_blank';a.rel='noopener noreferrer';a.append(textElement('span','',label));return a;}
function brandedLink(brand,label,url,className=''){const a=externalLink(label,url,className);a.prepend(createBrandMark(brand));return a;}

const PAYMENT_BRAND_SVGS={
  tithely:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#181f36"/><path fill="#5bd9a4" d="M8.5 9.4c0-1.5 1.2-2.7 2.7-2.7h9.6c1.5 0 2.7 1.2 2.7 2.7v2.7c0 4.4-3.2 8-7.5 8.6v4.6h-4v-4.6a8.2 8.2 0 0 1-3.5-6.7V9.4Zm4 1.5v3a4 4 0 0 0 3.5 4 4 4 0 0 0 3.5-4v-3h-7Z"/></svg>',
  square:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M4.01 0A4.01 4.01 0 000 4.01v15.98c0 2.21 1.8 4 4.01 4.01h15.98C22.2 24 24 22.2 24 19.99V4A4.01 4.01 0 0019.99 0H4zm1.62 4.36h12.74c.7 0 1.26.57 1.26 1.27v12.74c0 .7-.56 1.27-1.26 1.27H5.63c-.7 0-1.26-.57-1.26-1.27V5.63a1.27 1.27 0 011.26-1.27zm3.83 4.35a.73.73 0 00-.73.73v5.09c0 .4.32.72.72.72h5.1a.73.73 0 00.73-.72V9.44a.73.73 0 00-.73-.73h-5.1Z"/></svg>',
  zelle:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#6D1ED4" d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-2.765H5.638a.667.667 0 0 1-.666-.666v-2.234a.67.67 0 0 1 .142-.412l8.139-10.382h-7.25a.667.667 0 0 1-.667-.667V3.914c0-.367.299-.666.666-.666h4.23V.483c0-.266.217-.483.483-.483h2.841c.266 0 .483.217.483.483v2.765h4.323c.367 0 .666.299.666.666v2.137a.67.67 0 0 1-.141.41l-8.19 10.481h7.665c.367 0 .666.299.666.666v2.477a.667.667 0 0 1-.666.667h-4.32v2.765a.483.483 0 0 1-.483.483Z"/></svg>',
  visa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1434CB" d="M9.112 8.262 5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 0 1 .894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 0 1 1.913.336l.34-1.59a5.207 5.207 0 0 0-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 0 0-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656 1.02-2.815.588 2.815zm-8.16-4.84-1.603 7.496H8.34l1.605-7.496z"/></svg>',
  mastercard:'<svg viewBox="0 0 64 40" aria-hidden="true"><circle cx="25" cy="20" r="13" fill="#EB001B"/><circle cx="39" cy="20" r="13" fill="#F79E1B"/><path d="M32 9.4a13 13 0 0 1 0 21.2 13 13 0 0 1 0-21.2Z" fill="#FF5F00"/></svg>',
  amex:'<svg viewBox="0 0 64 40" aria-hidden="true"><rect x="2" y="4" width="60" height="32" rx="5" fill="#2E77BB"/><text x="32" y="18" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="#fff">AMERICAN</text><text x="32" y="29" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="#fff">EXPRESS</text></svg>',
  discover:'<svg viewBox="0 0 64 40" aria-hidden="true"><rect width="64" height="40" rx="6" fill="#fff"/><text x="5" y="24" font-family="Arial,sans-serif" font-size="10" font-weight="800" fill="#111">DISC</text><circle cx="37" cy="20" r="7" fill="#FF6000"/><text x="44" y="24" font-family="Arial,sans-serif" font-size="8.5" font-weight="800" fill="#111">VER</text></svg>',
  jcb:'<svg viewBox="0 0 64 40" aria-hidden="true"><rect x="7" y="5" width="16" height="30" rx="4" fill="#0B6FB8"/><rect x="24" y="5" width="16" height="30" rx="4" fill="#D9232E"/><rect x="41" y="5" width="16" height="30" rx="4" fill="#168447"/><text x="15" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#fff">J</text><text x="32" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#fff">C</text><text x="49" y="25" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="800" fill="#fff">B</text></svg>',
  unionpay:'<svg viewBox="0 0 72 40" aria-hidden="true"><path d="M8 5h22l-7 30H1L8 5Z" fill="#D81E3B"/><path d="M26 5h22l-7 30H19l7-30Z" fill="#1879B9"/><path d="M44 5h22l-7 30H37l7-30Z" fill="#149A78"/><text x="35" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" font-weight="800" fill="#fff">UnionPay</text></svg>'
};
function createPaymentBrandMark(name,label=''){
  const wrap=document.createElement('span');wrap.className='payment-brand-logo payment-brand-'+name;wrap.innerHTML=PAYMENT_BRAND_SVGS[name]||'';
  if(label){wrap.setAttribute('role','img');wrap.setAttribute('aria-label',label);}else wrap.setAttribute('aria-hidden','true');
  return wrap;
}
function paymentMethodLink(brand,label,url,className=''){
  const a=externalLink(label,url,className);a.prepend(createPaymentBrandMark(brand));return a;
}
const PAYMENT_CARD_LOGOS=[['visa','Visa'],['mastercard','Mastercard'],['amex','American Express'],['discover','Discover'],['jcb','JCB'],['unionpay','UnionPay']];
function paymentCards(label){
  const section=document.createElement('section');section.className='payment-cards';section.setAttribute('aria-label',label);
  section.append(textElement('p','payment-cards-label',label));
  const strip=document.createElement('div');strip.className='payment-card-strip';strip.setAttribute('role','list');
  PAYMENT_CARD_LOGOS.forEach(([brand,name])=>{const chip=document.createElement('span');chip.className='payment-card-chip';chip.setAttribute('role','listitem');chip.append(createPaymentBrandMark(brand,name));strip.append(chip);});
  section.append(strip);return section;
}
function bibleLink(label,version,url,className=''){const a=document.createElement('a');a.className=('modal-action '+className).trim();a.href=safeHttpsUrl(url)||'#';a.target='_blank';a.rel='noopener noreferrer';const mark=document.createElement('span');mark.className='brand-mark';mark.append(createIcon('bible'));const copy=document.createElement('span');copy.className='modal-action-copy';copy.append(textElement('strong','',label),textElement('small','modal-subline',version));a.append(mark,copy);return a;}
async function copyText(value){if(!value)return false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}}catch{}try{const t=document.createElement('textarea');t.value=value;t.readOnly=true;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();return ok;}catch{return false;}}

function renderGiveModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.giveTitle,trigger);
  b.append(textElement('p','modal-text',s.giveIntro),
    paymentMethodLink('tithely',s.tithely,config.tithely,'tithely-button'),
    paymentMethodLink('square',s.square,config.square,'square-button'),
    paymentCards(s.acceptedCards));
  const z=document.createElement('section');z.className='zelle-box';
  const brand=document.createElement('div');brand.className='zelle-brand';brand.append(createPaymentBrandMark('zelle'),textElement('strong','',s.zelle));
  z.append(brand,textElement('p','zelle-label',s.zelleInstruction),textElement('p','zelle-email',config.zelle));
  const row=document.createElement('div');row.className='copy-row';const btn=textElement('button','copy-button',s.copy);btn.type='button';const status=textElement('span','copy-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  btn.addEventListener('click',async()=>{const ok=await copyText(config.zelle);status.textContent=ok?s.copied:s.copyFailed;if(ok)setTimeout(()=>status.textContent='',1800);});row.append(btn,status);z.append(row);b.append(z);
}
function renderSocialModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.socialTitle,trigger);
  b.append(textElement('p','modal-text',s.socialIntro),
    brandedLink('facebook',s.facebook,config.facebook,'social-facebook'),
    brandedLink('instagram',s.instagram,config.instagram,'social-instagram'),
    brandedLink('youtube',s.youtube,config.youtube,'social-youtube'));
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
  btn.addEventListener('click',async()=>{if(!installPrompt)return;const prompt=installPrompt;installPrompt=null;btn.disabled=true;await prompt.prompt();await prompt.userChoice.catch(()=>null);btn.remove();});
  return btn;
}
function renderAboutModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.aboutTitle,trigger);b.append(textElement('p','modal-text',s.aboutIntro));
  const meta=document.createElement('div');meta.className='about-meta';const v=document.createElement('div');v.append(textElement('span','',s.version),textElement('strong','', 'v'+(config.version||HUB_VERSION)));const w=document.createElement('div');w.append(textElement('span','',s.website),textElement('strong','','mpdgi.org'));meta.append(v,w);b.append(meta);
  const install=createInstallAction();if(install)b.append(install);
  b.append(textElement('p','modal-text',s.external+': '+s.externalText),textElement('p','modal-text',s.privacy+': '+s.privacyText),textElement('p','modal-text about-credit',s.developerCredit),textElement('p','modal-text',s.copyright),externalLink(s.officialWebsite,config.website));
}
function openNamedModal(type,trigger){if(type==='give')renderGiveModal(trigger);if(type==='social')renderSocialModal(trigger);if(type==='bible')renderBibleModal(trigger);if(type==='about')renderAboutModal(trigger);}
function setupModal(){
  const o=document.getElementById('modal-overlay');document.getElementById('modal-close').addEventListener('click',closeModal);o.addEventListener('click',e=>{if(e.target===o)closeModal();});
  document.addEventListener('keydown',e=>{if(o.hidden)return;if(e.key==='Escape'){e.preventDefault();closeModal();return;}if(e.key!=='Tab')return;const items=focusableElements();if(!items.length){e.preventDefault();document.getElementById('hub-modal').focus();return;}const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
}
function updateOfflineState(){const b=document.getElementById('offline-badge');b.hidden=navigator.onLine;b.textContent=navigator.onLine?'':UI[currentLanguage].offline;}
function setupLanguage(){document.getElementById('language-toggle').addEventListener('click',()=>setLanguage(currentLanguage==='es'?'en':'es',true));}
function setupInstall(){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});window.addEventListener('appinstalled',()=>{installPrompt=null;});}
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
          reloadAfterUpdateIfSafe();
        });
      }
      const r=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
      const activateWaiting=()=>{if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});};
      const checkForUpdate=async()=>{try{await r.update();activateWaiting();}catch{}};
      activateWaiting();
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
  setupIcons();setupLanguage();setupModal();setupInstall();setupServiceWorker();
  const [loadedConfig,loadedLinks]=await Promise.all([fetchJson('data/config.json',DEFAULT_CONFIG),fetchJson('data/links.json',FALLBACK_LINKS)]);
  config={...DEFAULT_CONFIG,...loadedConfig};links=Array.isArray(loadedLinks)&&loadedLinks.length?loadedLinks:[...FALLBACK_LINKS];updateStaticInfo();setLanguage(resolveInitialLanguage(),false);updateOfflineState();
}
window.addEventListener('online',updateOfflineState);window.addEventListener('offline',updateOfflineState);init();window.__MPDGI_HUB_VERSION__=HUB_VERSION;
