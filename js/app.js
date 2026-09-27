'use strict';

const HUB_VERSION='1.1.0';
const STORAGE_LANGUAGE_KEY='mpdgiHubLanguage';
const VALID_THEMES=new Set(['blue','green','purple','gold','teal','social','website']);
const VALID_MODAL_TYPES=new Set(['give','social']);

const UI={
  es:{
    linksHeading:'Accesos principales',sunday:'Domingos',wednesday:'Miércoles',install:'Instalar app',about:'Acerca de',
    close:'Cerrar',offline:'Sin conexión • algunos enlaces externos no estarán disponibles',
    loadError:'No fue posible cargar los accesos. Visita mpdgi.org para continuar.',
    giveTitle:'Ofrendar',giveIntro:'Selecciona una opción segura para apoyar a Ministerio Plenitud de Gracia.',
    tithely:'Ofrendar con Tithe.ly',zelleInstruction:'Correo oficial para Zelle',copy:'Copiar',copied:'Copiado',
    copyFailed:'No se pudo copiar. Mantén presionado el correo para copiarlo.',
    socialTitle:'Redes Sociales',socialIntro:'Síguenos y accede a nuestro contenido en las plataformas oficiales.',
    facebook:'Abrir Facebook',instagram:'Abrir Instagram',youtube:'Abrir YouTube',
    aboutTitle:'Acerca de MPDGI Hub',
    aboutIntro:'Hub digital oficial preparado para NFC de Ministerio Plenitud de Gracia, creado para brindar acceso rápido a los servicios y recursos oficiales de la iglesia.',
    version:'Versión',website:'Sitio web oficial',external:'Servicios externos',
    externalText:'Tithe.ly, ChMeetings, YouTube, Facebook e Instagram están sujetos a sus propios términos y políticas de privacidad.',
    privacy:'Privacidad',privacyText:'Este Hub no almacena contraseñas, información de pago ni información personal sensible.',
    developerCredit:'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright:'© 2026 Ministerio Plenitud de Gracia. Todos los derechos reservados.',
    officialWebsite:'Abrir mpdgi.org',navHome:'Inicio',navConnect:'Conéctate',navMinistries:'Ministerios',navMore:'Más',
    languageLabel:'Cambiar idioma a inglés'
  },
  en:{
    linksHeading:'Main access links',sunday:'Sundays',wednesday:'Wednesdays',install:'Install app',about:'About',
    close:'Close',offline:'Offline • some external links will not be available',
    loadError:'The hub links could not be loaded. Visit mpdgi.org to continue.',
    giveTitle:'Give',giveIntro:'Choose a secure option to support Ministerio Plenitud de Gracia.',
    tithely:'Give with Tithe.ly',zelleInstruction:'Official Zelle email',copy:'Copy',copied:'Copied',
    copyFailed:'Could not copy. Press and hold the email address to copy it.',
    socialTitle:'Social Media',socialIntro:'Follow us and access our content on the official platforms.',
    facebook:'Open Facebook',instagram:'Open Instagram',youtube:'Open YouTube',
    aboutTitle:'About MPDGI Hub',
    aboutIntro:'Official NFC-ready digital hub for Ministerio Plenitud de Gracia, created to provide fast access to the church’s official services and resources.',
    version:'Version',website:'Official website',external:'External services',
    externalText:'Tithe.ly, ChMeetings, YouTube, Facebook, and Instagram are subject to their respective terms and privacy policies.',
    privacy:'Privacy',privacyText:'This Hub does not store passwords, payment information, or sensitive personal information.',
    developerCredit:'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright:'© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.',
    officialWebsite:'Open mpdgi.org',navHome:'Home',navConnect:'Connect',navMinistries:'Ministries',navMore:'More',
    languageLabel:'Cambiar idioma a español'
  }
};

const DEFAULT_CONFIG={
  version:HUB_VERSION,churchName:'Ministerio Plenitud de Gracia',
  tagline:'Yo no he venido a ser servido, sino a servir.',taglineEn:'I did not come to be served, but to serve.',
  scripture:'Mateo 20:28',scriptureEn:'Matthew 20:28',address:'1045 E Normandy Blvd, Deltona, FL 32725',
  sundayService:'10:00 AM',wednesdayBibleStudy:'7:00 PM',website:'https://mpdgi.org',
  memberPortal:'https://mpdgi.chmeetings.com',prayer:'https://mpdgi.org/oracion',connect:'https://mpdgi.org',
  ministries:'https://mpdgi.org/ministerios',youtube:'https://www.youtube.com/@ministerioplenituddegracia',
  facebook:'https://www.facebook.com/mpdginc',instagram:'https://www.instagram.com/mpdginc/',
  tithely:'https://tithe.ly/give_new/www/#/tithely/give-one-time/6513581',zelle:'mpdginc@gmail.com',defaultLanguage:'es'
};

const FALLBACK_LINKS=[
  {id:'members',order:1,title:{es:'Portal de Miembros',en:'Member Portal'},subtitle:{es:'ChMeetings',en:'ChMeetings'},url:'https://mpdgi.chmeetings.com',action:'direct',open:'new',theme:'blue',icon:'users'},
  {id:'give',order:2,title:{es:'Ofrendar',en:'Give'},subtitle:{es:'Tithe.ly • Zelle',en:'Tithe.ly • Zelle'},action:'modal',modal:'give',theme:'green',icon:'give'},
  {id:'prayer',order:3,title:{es:'Petición de Oración',en:'Prayer Request'},subtitle:{es:'Envíanos tu petición',en:'Send us your request'},url:'https://mpdgi.org/oracion',action:'direct',open:'new',theme:'purple',icon:'prayer'},
  {id:'connect',order:4,title:{es:'Conéctate',en:'Connect'},subtitle:{es:'Visitantes y Nuevos',en:'Visitors & Newcomers'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'gold',icon:'users'},
  {id:'ministries',order:5,title:{es:'Ministerios',en:'Ministries'},subtitle:{es:'Sirve con nosotros',en:'Serve with us'},url:'https://mpdgi.org/ministerios',action:'direct',open:'new',theme:'teal',icon:'church'},
  {id:'social',order:6,title:{es:'Redes Sociales',en:'Social Media'},subtitle:{es:'Facebook • Instagram • YouTube',en:'Facebook • Instagram • YouTube'},action:'modal',modal:'social',theme:'social',icon:'social'},
  {id:'website',order:7,title:{es:'Sitio Web',en:'Website'},subtitle:{es:'mpdgi.org',en:'mpdgi.org'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'website',icon:'globe',wide:true}
];

const ICONS={
  users:[['path',{d:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'}],['circle',{cx:'9',cy:'7',r:'4'}],['path',{d:'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'}]],
  give:[['path',{d:'M3 13.5h4.5l2.3 2.1h4.7c1.2 0 2.2.9 2.2 2.1H9.8'}],['path',{d:'M3 13.5V21h4l3-2h7.2l3.8-3.2c.8-.7.8-1.9.1-2.6-.6-.6-1.5-.7-2.2-.2l-2.8 2'}],['path',{d:'M12 10.7 8.8 7.6a2.5 2.5 0 0 1 3.5-3.6L12 4.3l.3-.3a2.5 2.5 0 0 1 3.5 3.6Z'}]],
  prayer:[['path',{d:'M8.6 3.5 11 9l-1.8 4.1L5 17.2'}],['path',{d:'M15.4 3.5 13 9l1.8 4.1 4.2 4.1'}],['path',{d:'M9.2 13.1 12 15l2.8-1.9'}],['path',{d:'M7 21h10'}]],
  church:[['path',{d:'M12 3v4M10 5h4'}],['path',{d:'M4 21V11l8-5 8 5v10Z'}],['path',{d:'M9 21v-6h6v6'}]],
  social:[['rect',{x:'2.5',y:'6.5',width:'6',height:'6',rx:'1.5'}],['circle',{cx:'5.5',cy:'9.5',r:'1.4'}],['path',{d:'M13 17V9.5a2.5 2.5 0 0 1 2.5-2.5H17'}],['path',{d:'M12 11h4'}],['rect',{x:'17',y:'7',width:'5',height:'5',rx:'1'}],['path',{d:'m19 8.5 2 1-2 1Z',fill:'currentColor',stroke:'none'}]],
  globe:[['circle',{cx:'12',cy:'12',r:'9'}],['path',{d:'M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18'}]],
  pin:[['path',{d:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z'}],['circle',{cx:'12',cy:'10',r:'2.4'}]],
  clock:[['circle',{cx:'12',cy:'12',r:'9'}],['path',{d:'M12 7v5l3 2'}]],
  book:[['path',{d:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20'}],['path',{d:'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'}]],
  home:[['path',{d:'m3 11 9-8 9 8'}],['path',{d:'M5 10v11h14V10M9 21v-7h6v7'}]],
  menu:[['path',{d:'M4 6h16M4 12h16M4 18h16'}]]
};

let config={...DEFAULT_CONFIG},links=[...FALLBACK_LINKS],currentLanguage='es',installPrompt=null,lastModalTrigger=null;

function createIcon(name){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
  (ICONS[name]||ICONS.globe).forEach(([tag,attrs])=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));svg.append(el);});
  return svg;
}
function textElement(tag,className,value){const el=document.createElement(tag);if(className)el.className=className;el.textContent=value;return el;}
function safeHttpsUrl(value){try{const u=new URL(value,location.href);return u.protocol==='https:'?u.href:null;}catch{return null;}}
async function fetchJson(path,fallback){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(String(r.status));return await r.json();}catch(e){console.warn('[MPDGI Hub]',path,e);return fallback;}}
function translated(v){return v&&typeof v==='object'?(v[currentLanguage]||v.es||v.en||''):(typeof v==='string'?v:'');}

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
  document.getElementById('install-button').textContent=s.install;
  document.getElementById('modal-close').setAttribute('aria-label',s.close);
  document.getElementById('nav-home').textContent=s.navHome;document.getElementById('nav-connect').textContent=s.navConnect;
  document.getElementById('nav-ministries').textContent=s.navMinistries;document.getElementById('nav-more').textContent=s.navMore;
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
function setupIcons(){document.querySelectorAll('[data-info-icon]').forEach(h=>h.replaceChildren(createIcon(h.dataset.infoIcon)));document.querySelectorAll('[data-nav-icon]').forEach(h=>h.replaceChildren(createIcon(h.dataset.navIcon)));}
function updateStaticInfo(){
  const parts=(config.address||DEFAULT_CONFIG.address).split(',').map(x=>x.trim()),el=document.getElementById('address-text');
  if(parts.length>=2)el.replaceChildren(document.createTextNode(parts[0]),document.createElement('br'),document.createTextNode(parts.slice(1).join(', ')));else el.textContent=config.address;
  document.getElementById('sunday-time').textContent=config.sundayService;document.getElementById('wednesday-time').textContent=config.wednesdayBibleStudy;
  document.getElementById('nav-ministries-link').href=safeHttpsUrl(config.ministries)||DEFAULT_CONFIG.ministries;
}
function focusableElements(){return[...document.getElementById('hub-modal').querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(e=>!e.hidden&&e.offsetParent!==null);}
function openModal(title,trigger){const o=document.getElementById('modal-overlay'),b=document.getElementById('modal-body');lastModalTrigger=trigger||document.activeElement;document.getElementById('modal-title').textContent=title;b.replaceChildren();o.hidden=false;document.body.classList.add('modal-open');document.getElementById('modal-close').focus();return b;}
function closeModal(){const o=document.getElementById('modal-overlay');if(o.hidden)return;o.hidden=true;document.body.classList.remove('modal-open');lastModalTrigger?.focus?.();}
function externalLink(label,url,className=''){const a=document.createElement('a');a.className=('modal-action '+className).trim();a.textContent=label;a.href=safeHttpsUrl(url)||'#';a.target='_blank';a.rel='noopener noreferrer';return a;}
async function copyText(value){if(!value)return false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}}catch{}try{const t=document.createElement('textarea');t.value=value;t.readOnly=true;t.style.cssText='position:fixed;opacity:0';document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();return ok;}catch{return false;}}

function renderGiveModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.giveTitle,trigger);b.append(textElement('p','modal-text',s.giveIntro),externalLink(s.tithely,config.tithely,'primary'));
  const z=document.createElement('section');z.className='zelle-box';z.append(textElement('p','zelle-label',s.zelleInstruction),textElement('p','zelle-email',config.zelle));
  const row=document.createElement('div');row.className='copy-row';const btn=textElement('button','copy-button',s.copy);btn.type='button';const status=textElement('span','copy-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  btn.addEventListener('click',async()=>{const ok=await copyText(config.zelle);status.textContent=ok?s.copied:s.copyFailed;if(ok)setTimeout(()=>status.textContent='',1800);});row.append(btn,status);z.append(row);b.append(z);
}
function renderSocialModal(trigger){const s=UI[currentLanguage],b=openModal(s.socialTitle,trigger);b.append(textElement('p','modal-text',s.socialIntro),externalLink(s.facebook,config.facebook,'social-facebook'),externalLink(s.instagram,config.instagram,'social-instagram'),externalLink(s.youtube,config.youtube,'social-youtube'));}
function renderAboutModal(trigger){
  const s=UI[currentLanguage],b=openModal(s.aboutTitle,trigger);b.append(textElement('p','modal-text',s.aboutIntro));
  const meta=document.createElement('div');meta.className='about-meta';const v=document.createElement('div');v.append(textElement('span','',s.version),textElement('strong','', 'v'+(config.version||HUB_VERSION)));const w=document.createElement('div');w.append(textElement('span','',s.website),textElement('strong','','mpdgi.org'));meta.append(v,w);b.append(meta);
  b.append(textElement('p','modal-text',s.external+': '+s.externalText),textElement('p','modal-text',s.privacy+': '+s.privacyText),textElement('p','modal-text about-credit',s.developerCredit),textElement('p','modal-text',s.copyright),externalLink(s.officialWebsite,config.website));
}
function openNamedModal(type,trigger){if(type==='give')renderGiveModal(trigger);if(type==='social')renderSocialModal(trigger);}
function setupModal(){
  const o=document.getElementById('modal-overlay');document.getElementById('modal-close').addEventListener('click',closeModal);o.addEventListener('click',e=>{if(e.target===o)closeModal();});
  document.addEventListener('keydown',e=>{if(o.hidden)return;if(e.key==='Escape'){e.preventDefault();closeModal();return;}if(e.key!=='Tab')return;const items=focusableElements();if(!items.length){e.preventDefault();document.getElementById('hub-modal').focus();return;}const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
}
function updateOfflineState(){const b=document.getElementById('offline-badge');b.hidden=navigator.onLine;b.textContent=navigator.onLine?'':UI[currentLanguage].offline;}
function setupLanguage(){document.getElementById('language-toggle').addEventListener('click',()=>setLanguage(currentLanguage==='es'?'en':'es',true));}
function setActiveNav(item){document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('is-active',x===item));}
function focusCard(id,navItem){const card=document.querySelector('[data-card-id="'+id+'"]');if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.querySelector('.card-action')?.focus({preventScroll:true});}if(navItem)setActiveNav(navItem);}
function setupNavigation(){
  document.querySelectorAll('[data-nav-action="home"]').forEach(btn=>btn.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});setActiveNav(btn);}));
  document.querySelectorAll('[data-nav-card]').forEach(btn=>btn.addEventListener('click',()=>focusCard(btn.dataset.navCard,btn)));
  document.querySelectorAll('[data-nav-action="about"]').forEach(btn=>btn.addEventListener('click',()=>{setActiveNav(btn);renderAboutModal(btn);}));
  document.getElementById('nav-ministries-link').addEventListener('click',e=>setActiveNav(e.currentTarget));
}
function setupInstall(){const btn=document.getElementById('install-button');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;btn.hidden=false;});btn.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice.catch(()=>null);installPrompt=null;btn.hidden=true;});window.addEventListener('appinstalled',()=>{installPrompt=null;btn.hidden=true;});}
function setupServiceWorker(){if(!('serviceWorker'in navigator))return;window.addEventListener('load',async()=>{try{const r=await navigator.serviceWorker.register('./sw.js',{scope:'./'});if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});r.addEventListener('updatefound',()=>{const w=r.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)w.postMessage({type:'SKIP_WAITING'});});});}catch(e){console.warn('[MPDGI Hub] Service Worker registration failed:',e);}},{once:true});}
function resolveInitialLanguage(){try{const s=localStorage.getItem(STORAGE_LANGUAGE_KEY);if(s==='es'||s==='en')return s;}catch{}return config.defaultLanguage==='en'?'en':'es';}

async function init(){
  setupIcons();setupLanguage();setupModal();setupNavigation();setupInstall();setupServiceWorker();
  const [loadedConfig,loadedLinks]=await Promise.all([fetchJson('data/config.json',DEFAULT_CONFIG),fetchJson('data/links.json',FALLBACK_LINKS)]);
  config={...DEFAULT_CONFIG,...loadedConfig};links=Array.isArray(loadedLinks)&&loadedLinks.length?loadedLinks:[...FALLBACK_LINKS];updateStaticInfo();setLanguage(resolveInitialLanguage(),false);updateOfflineState();
}
window.addEventListener('online',updateOfflineState);window.addEventListener('offline',updateOfflineState);init();window.__MPDGI_HUB_VERSION__=HUB_VERSION;
