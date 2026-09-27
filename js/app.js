'use strict';

const HUB_VERSION = '1.0.0';
const STORAGE_LANGUAGE_KEY = 'mpdgiHubLanguage';
const VALID_THEMES = new Set(['live','blue','green','purple','gold','slate','teal','social','website']);
const VALID_MODAL_TYPES = new Set(['give','social']);

const UI = {
  es: {
    linksHeading: 'Accesos principales',
    sunday: 'Domingos',
    wednesday: 'Miércoles',
    install: 'Instalar',
    about: 'Acerca de',
    close: 'Cerrar',
    offline: 'Sin conexión • algunos enlaces externos no estarán disponibles',
    loadError: 'No fue posible cargar los accesos. Visita mpdgi.org para continuar.',
    giveTitle: 'Ofrendar',
    giveIntro: 'Selecciona una opción segura para apoyar a Ministerio Plenitud de Gracia.',
    tithely: 'Ofrendar con Tithe.ly',
    zelleLabel: 'Zelle',
    zelleInstruction: 'Correo oficial para Zelle',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'No se pudo copiar. Mantén presionado el correo para copiarlo.',
    socialTitle: 'Redes Sociales',
    socialIntro: 'Síguenos en nuestras plataformas oficiales.',
    facebook: 'Abrir Facebook',
    instagram: 'Abrir Instagram',
    aboutTitle: 'Acerca de MPDGI Hub',
    aboutIntro: 'Hub digital oficial preparado para NFC de Ministerio Plenitud de Gracia, diseñado para brindar a miembros y visitantes acceso rápido a recursos de la iglesia, servicios, ofrendas, oración, eventos, ministerios y plataformas oficiales en línea.',
    version: 'Versión',
    website: 'Sitio web oficial',
    external: 'Servicios externos',
    externalText: 'Los enlaces de Tithe.ly, ChMeetings, YouTube, Facebook, Instagram y otros servicios externos están sujetos a sus propios términos y políticas de privacidad.',
    privacy: 'Privacidad',
    privacyText: 'Este Hub no almacena contraseñas, información de pago ni información personal sensible.',
    developerCredit: 'Diseñado y desarrollado por Roberto S. Macfie para MPDGI',
    copyright: '© 2026 Ministerio Plenitud de Gracia. Todos los derechos reservados.',
    officialWebsite: 'Abrir mpdgi.org'
  },
  en: {
    linksHeading: 'Main access links',
    sunday: 'Sundays',
    wednesday: 'Wednesdays',
    install: 'Install',
    about: 'About',
    close: 'Close',
    offline: 'Offline • some external links will not be available',
    loadError: 'The hub links could not be loaded. Visit mpdgi.org to continue.',
    giveTitle: 'Give',
    giveIntro: 'Choose a secure option to support Ministerio Plenitud de Gracia.',
    tithely: 'Give with Tithe.ly',
    zelleLabel: 'Zelle',
    zelleInstruction: 'Official Zelle email',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Could not copy. Press and hold the email address to copy it.',
    socialTitle: 'Social Media',
    socialIntro: 'Follow us on our official platforms.',
    facebook: 'Open Facebook',
    instagram: 'Open Instagram',
    aboutTitle: 'About MPDGI Hub',
    aboutIntro: 'Official NFC-ready digital hub for Ministerio Plenitud de Gracia, designed to provide members and visitors with fast access to church resources, services, giving, prayer, events, ministries, and official online platforms.',
    version: 'Version',
    website: 'Official website',
    external: 'External services',
    externalText: 'Tithe.ly, ChMeetings, YouTube, Facebook, Instagram, and other external services are subject to their respective terms and privacy policies.',
    privacy: 'Privacy',
    privacyText: 'This Hub does not store passwords, payment information, or sensitive personal information.',
    developerCredit: 'Designed & Developed by Roberto S. Macfie for MPDGI',
    copyright: '© 2026 Ministerio Plenitud de Gracia. All Rights Reserved.',
    officialWebsite: 'Open mpdgi.org'
  }
};

const FALLBACK_LINKS = [
  {id:'live',order:1,title:{es:'Servicio en Vivo',en:'Watch Live'},subtitle:{es:'YouTube oficial',en:'Official YouTube'},url:'https://www.youtube.com/@ministerioplenituddegracia',action:'direct',open:'new',theme:'live',icon:'play'},
  {id:'members',order:2,title:{es:'Portal de Miembros',en:'Member Portal'},subtitle:{es:'Accede a tu cuenta',en:'Access your account'},url:'https://mpdgi.chmeetings.com',action:'direct',open:'new',theme:'blue',icon:'users'},
  {id:'give',order:3,title:{es:'Ofrendar',en:'Give'},subtitle:{es:'Tithe.ly • Zelle',en:'Tithe.ly • Zelle'},action:'modal',modal:'give',theme:'green',icon:'heart'},
  {id:'prayer',order:4,title:{es:'Petición de Oración',en:'Prayer Request'},subtitle:{es:'Permítenos orar por ti',en:'Let us pray for you'},url:'https://mpdgi.org/oracion',action:'direct',open:'new',theme:'purple',icon:'prayer'},
  {id:'events',order:5,title:{es:'Eventos',en:'Events'},subtitle:{es:'Próximos eventos',en:'Upcoming events'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'gold',icon:'calendar'},
  {id:'resources',order:6,title:{es:'Recursos',en:'Resources'},subtitle:{es:'Prédicas y más',en:'Sermons and more'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'slate',icon:'book'},
  {id:'ministries',order:7,title:{es:'Ministerios',en:'Ministries'},subtitle:{es:'Sirve con nosotros',en:'Serve with us'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'teal',icon:'church'},
  {id:'social',order:8,title:{es:'Redes Sociales',en:'Social Media'},subtitle:{es:'Síguenos',en:'Follow us'},action:'modal',modal:'social',theme:'social',icon:'social'},
  {id:'website',order:9,title:{es:'Sitio Web',en:'Website'},subtitle:{es:'mpdgi.org',en:'mpdgi.org'},url:'https://mpdgi.org',action:'direct',open:'new',theme:'website',icon:'globe',wide:true}
];

const DEFAULT_CONFIG = {
  version: HUB_VERSION,
  churchName: 'Ministerio Plenitud de Gracia',
  tagline: 'Yo no he venido a ser servido, sino a servir.',
  taglineEn: 'I did not come to be served, but to serve.',
  scripture: 'Mateo 20:28',
  scriptureEn: 'Matthew 20:28',
  address: '1045 E Normandy Blvd, Deltona, FL 32725',
  sundayService: '10:00 AM',
  wednesdayBibleStudy: '7:00 PM',
  website: 'https://mpdgi.org',
  memberPortal: 'https://mpdgi.chmeetings.com',
  prayer: 'https://mpdgi.org/oracion',
  youtube: 'https://www.youtube.com/@ministerioplenituddegracia',
  facebook: 'https://www.facebook.com/mpdginc',
  instagram: 'https://www.instagram.com/mpdginc/',
  tithely: 'https://tithe.ly/give_new/www/#/tithely/give-one-time/6513581',
  zelle: 'mpdginc@gmail.com',
  defaultLanguage: 'es'
};

let config = {...DEFAULT_CONFIG};
let links = [...FALLBACK_LINKS];
let currentLanguage = 'es';
let installPrompt = null;
let lastModalTrigger = null;

const ICONS = {
  play: [
    ['circle',{cx:'12',cy:'12',r:'9'}],
    ['path',{d:'M10 8.7 16 12l-6 3.3Z',fill:'currentColor',stroke:'none'}]
  ],
  users: [
    ['path',{d:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'}],
    ['circle',{cx:'9',cy:'7',r:'4'}],
    ['path',{d:'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'}]
  ],
  heart: [
    ['path',{d:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z'}]
  ],
  prayer: [
    ['path',{d:'M8.6 3.5 11 9l-1.8 4.1L5 17.2'}],
    ['path',{d:'M15.4 3.5 13 9l1.8 4.1 4.2 4.1'}],
    ['path',{d:'M9.2 13.1 12 15l2.8-1.9'}],
    ['path',{d:'M7 21h10'}]
  ],
  calendar: [
    ['rect',{x:'3',y:'5',width:'18',height:'16',rx:'2'}],
    ['path',{d:'M16 3v4M8 3v4M3 10h18'}],
    ['path',{d:'M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01'}]
  ],
  book: [
    ['path',{d:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20'}],
    ['path',{d:'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z'}]
  ],
  church: [
    ['path',{d:'M12 3v4M10 5h4'}],
    ['path',{d:'M4 21V11l8-5 8 5v10Z'}],
    ['path',{d:'M9 21v-6h6v6'}]
  ],
  social: [
    ['circle',{cx:'12',cy:'12',r:'3'}],
    ['circle',{cx:'12',cy:'12',r:'9'}],
    ['path',{d:'M15.5 8.5h.01'}]
  ],
  globe: [
    ['circle',{cx:'12',cy:'12',r:'9'}],
    ['path',{d:'M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18'}]
  ],
  pin: [
    ['path',{d:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z'}],
    ['circle',{cx:'12',cy:'10',r:'2.4'}]
  ],
  clock: [
    ['circle',{cx:'12',cy:'12',r:'9'}],
    ['path',{d:'M12 7v5l3 2'}]
  ]
};

function createIcon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('fill','none');
  svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-linecap','round');
  svg.setAttribute('stroke-linejoin','round');
  svg.setAttribute('aria-hidden','true');

  (ICONS[name] || ICONS.globe).forEach(([tag, attrs]) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg',tag);
    Object.entries(attrs).forEach(([key,value]) => el.setAttribute(key,value));
    svg.append(el);
  });

  return svg;
}

function textElement(tag, className, value) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = value;
  return el;
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path,{cache:'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`[MPDGI Hub] Could not load ${path}:`, error);
    return fallback;
  }
}

function translated(value) {
  if (value && typeof value === 'object') {
    return value[currentLanguage] || value.es || value.en || '';
  }
  return typeof value === 'string' ? value : '';
}

function setLanguage(language, persist = true) {
  currentLanguage = language === 'en' ? 'en' : 'es';
  document.documentElement.lang = currentLanguage;

  if (persist) {
    try { localStorage.setItem(STORAGE_LANGUAGE_KEY,currentLanguage); } catch {}
  }

  document.querySelectorAll('.lang-option').forEach((button) => {
    const selected = button.dataset.lang === currentLanguage;
    button.setAttribute('aria-pressed',String(selected));
  });

  const strings = UI[currentLanguage];
  document.getElementById('links-heading').textContent = strings.linksHeading;
  document.getElementById('tagline').textContent = `“${currentLanguage === 'es' ? config.tagline : config.taglineEn}”`;
  document.getElementById('scripture').textContent = currentLanguage === 'es' ? config.scripture : config.scriptureEn;
  document.getElementById('sunday-label').textContent = strings.sunday;
  document.getElementById('wednesday-label').textContent = strings.wednesday;
  document.getElementById('install-button').textContent = strings.install;
  document.getElementById('about-button').textContent = strings.about;
  document.getElementById('modal-close').setAttribute('aria-label',strings.close);
  document.getElementById('developer-credit').textContent = strings.developerCredit;
  document.getElementById('copyright-text').textContent = strings.copyright;
  updateOfflineState();
  renderCards();
}

function buildCard(item) {
  const article = document.createElement('article');
  const theme = VALID_THEMES.has(item.theme) ? item.theme : 'blue';
  article.className = `hub-card card-${theme}${item.wide ? ' card-wide' : ''}`;

  const action = item.action === 'modal' ? document.createElement('button') : document.createElement('a');
  action.className = 'card-action';

  if (item.action === 'modal' && VALID_MODAL_TYPES.has(item.modal)) {
    action.type = 'button';
    action.addEventListener('click',() => openNamedModal(item.modal,action));
  } else {
    const url = safeHttpsUrl(item.url);
    if (!url) return null;
    action.href = url;
    if ((item.open || 'new') === 'new') {
      action.target = '_blank';
      action.rel = 'noopener noreferrer';
    }
  }

  const icon = document.createElement('span');
  icon.className = 'card-icon';
  icon.append(createIcon(item.icon));

  const copy = document.createElement('span');
  copy.className = 'card-copy';
  copy.append(
    textElement('strong','card-title',translated(item.title)),
    textElement('span','card-subtitle',translated(item.subtitle))
  );

  const arrow = textElement('span','card-arrow','›');
  arrow.setAttribute('aria-hidden','true');
  action.append(icon,copy,arrow);
  article.append(action);
  return article;
}

function renderCards() {
  const container = document.getElementById('links-container');
  if (!container) return;

  const validItems = Array.isArray(links)
    ? links.filter((item) => item && item.id !== 'connect').sort((a,b) => (Number(a.order)||999) - (Number(b.order)||999))
    : [];

  const fragment = document.createDocumentFragment();
  validItems.forEach((item) => {
    const card = buildCard(item);
    if (card) fragment.append(card);
  });

  if (!fragment.childNodes.length) {
    container.replaceChildren(textElement('p','error-state',UI[currentLanguage].loadError));
  } else {
    container.replaceChildren(fragment);
  }
  container.setAttribute('aria-busy','false');
}

function setupInfoIcons() {
  document.querySelectorAll('[data-info-icon]').forEach((holder) => {
    holder.replaceChildren(createIcon(holder.dataset.infoIcon));
  });
}

function updateStaticInfo() {
  const address = config.address || DEFAULT_CONFIG.address;
  const parts = address.split(',').map((part) => part.trim());
  const addressText = document.getElementById('address-text');
  if (parts.length >= 2) {
    addressText.replaceChildren(document.createTextNode(parts[0]),document.createElement('br'),document.createTextNode(parts.slice(1).join(', ')));
  } else {
    addressText.textContent = address;
  }
  document.getElementById('sunday-time').textContent = config.sundayService || DEFAULT_CONFIG.sundayService;
  document.getElementById('wednesday-time').textContent = config.wednesdayBibleStudy || DEFAULT_CONFIG.wednesdayBibleStudy;
  document.getElementById('version-label').textContent = `v${config.version || HUB_VERSION}`;
}

function focusableElements() {
  const modal = document.getElementById('hub-modal');
  return [...modal.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
}

function openModal(title, trigger) {
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  lastModalTrigger = trigger || document.activeElement;
  document.getElementById('modal-title').textContent = title;
  body.replaceChildren();
  overlay.hidden = false;
  document.body.classList.add('modal-open');
  document.getElementById('modal-close').focus();
  return body;
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay.hidden) return;
  overlay.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
    lastModalTrigger.focus();
  }
}

function externalLink(label, url, className = '') {
  const safe = safeHttpsUrl(url);
  const anchor = document.createElement('a');
  anchor.className = `modal-action ${className}`.trim();
  anchor.textContent = label;
  anchor.href = safe || '#';
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  if (!safe) anchor.setAttribute('aria-disabled','true');
  return anchor;
}

function renderGiveModal(trigger) {
  const strings = UI[currentLanguage];
  const body = openModal(strings.giveTitle,trigger);
  body.append(textElement('p','modal-text',strings.giveIntro));
  body.append(externalLink(strings.tithely,config.tithely,'primary'));

  const zelle = document.createElement('section');
  zelle.className = 'zelle-box';
  zelle.append(
    textElement('p','zelle-label',strings.zelleInstruction),
    textElement('p','zelle-email',config.zelle)
  );

  const copyRow = document.createElement('div');
  copyRow.className = 'copy-row';
  const copyButton = textElement('button','copy-button',strings.copy);
  copyButton.type = 'button';
  const status = textElement('span','copy-status','');
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');

  copyButton.addEventListener('click',async () => {
    const ok = await copyText(config.zelle);
    status.textContent = ok ? strings.copied : strings.copyFailed;
    if (ok) {
      window.setTimeout(() => { status.textContent = ''; },1800);
    }
  });

  copyRow.append(copyButton,status);
  zelle.append(copyRow);
  body.append(zelle);
}

async function copyText(value) {
  if (!value) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly','');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function renderSocialModal(trigger) {
  const strings = UI[currentLanguage];
  const body = openModal(strings.socialTitle,trigger);
  body.append(textElement('p','modal-text',strings.socialIntro));
  body.append(externalLink(strings.facebook,config.facebook,'social-facebook'));
  body.append(externalLink(strings.instagram,config.instagram,'social-instagram'));
}

function renderAboutModal(trigger) {
  const strings = UI[currentLanguage];
  const body = openModal(strings.aboutTitle,trigger);
  body.append(textElement('p','modal-text',strings.aboutIntro));

  const meta = document.createElement('div');
  meta.className = 'about-meta';
  const version = document.createElement('div');
  version.append(textElement('span','',strings.version),textElement('strong','',`v${config.version || HUB_VERSION}`));
  const website = document.createElement('div');
  website.append(textElement('span','',strings.website),textElement('strong','','mpdgi.org'));
  meta.append(version,website);
  body.append(meta);

  body.append(textElement('p','modal-text',`${strings.external}: ${strings.externalText}`));
  body.append(textElement('p','modal-text',`${strings.privacy}: ${strings.privacyText}`));
  body.append(textElement('p','modal-text about-credit',strings.developerCredit));
  body.append(textElement('p','modal-text',strings.copyright));
  body.append(externalLink(strings.officialWebsite,config.website));
}

function openNamedModal(type, trigger) {
  if (type === 'give') renderGiveModal(trigger);
  if (type === 'social') renderSocialModal(trigger);
}

function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').addEventListener('click',closeModal);
  document.getElementById('about-button').addEventListener('click',(event) => renderAboutModal(event.currentTarget));
  overlay.addEventListener('click',(event) => {
    if (event.target === overlay) closeModal();
  });

  document.addEventListener('keydown',(event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;

    const items = focusableElements();
    if (!items.length) {
      event.preventDefault();
      document.getElementById('hub-modal').focus();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function updateOfflineState() {
  const badge = document.getElementById('offline-badge');
  badge.hidden = navigator.onLine;
  badge.textContent = navigator.onLine ? '' : UI[currentLanguage].offline;
}

function setupLanguageControls() {
  document.querySelectorAll('.lang-option').forEach((button) => {
    button.addEventListener('click',() => setLanguage(button.dataset.lang,true));
  });
}

function setupInstall() {
  const installButton = document.getElementById('install-button');
  window.addEventListener('beforeinstallprompt',(event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener('click',async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    installPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled',() => {
    installPrompt = null;
    installButton.hidden = true;
  });
}

function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load',async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js',{scope:'./'});
      if (registration.waiting) registration.waiting.postMessage({type:'SKIP_WAITING'});
      registration.addEventListener('updatefound',() => {
        const worker = registration.installing;
        worker?.addEventListener('statechange',() => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
    } catch (error) {
      console.warn('[MPDGI Hub] Service Worker registration failed:',error);
    }
  },{once:true});
}

function resolveInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_LANGUAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {}
  return config.defaultLanguage === 'en' ? 'en' : 'es';
}

async function init() {
  setupInfoIcons();
  setupLanguageControls();
  setupModal();
  setupInstall();
  setupServiceWorker();

  const [loadedConfig,loadedLinks] = await Promise.all([
    fetchJson('data/config.json',DEFAULT_CONFIG),
    fetchJson('data/links.json',FALLBACK_LINKS)
  ]);

  config = {...DEFAULT_CONFIG,...loadedConfig};
  links = Array.isArray(loadedLinks) && loadedLinks.length ? loadedLinks : [...FALLBACK_LINKS];
  updateStaticInfo();
  setLanguage(resolveInitialLanguage(),false);
  updateOfflineState();
}

window.addEventListener('online',updateOfflineState);
window.addEventListener('offline',updateOfflineState);

init();
window.__MPDGI_HUB_VERSION__ = HUB_VERSION;
