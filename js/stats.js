'use strict';

const STATS_VERSION=globalThis.MPDGI_STATS_VERSION||'dev';
const SOURCE_COLORS={nfc:'#1468e8',qr:'#5aa2f8',link:'#efb94f',unattributed:'#9ca9bb'};
const SOURCE_LABELS={nfc:'NFC',qr:'QR',link:'Enlace',unattributed:'Web / Sin atribuir'};
const ENTRY_LABELS={nfc:'NFC',qr:'QR',link:'Enlace',web:'Web',pwa:'PWA instalada'};
const DISPLAY_LABELS={pwa:'PWA instalada',browser:'Navegador'};
const DEVICE_LABELS={mobile:'Móvil',desktop:'Computadora',tablet:'Tableta',other:'Otro'};
const BROWSER_LABELS={edge:'Edge',chrome:'Chrome',safari:'Safari',firefox:'Firefox',other:'Otro'};
const LANGUAGE_LABELS={es:'ES — Español',en:'EN — English',other:'Otro'};
const VISITOR_MIX_LABELS={new:'Nuevos',returning:'Recurrentes'};
const ACTION_LABELS={
  card_members:'Portal de Miembros',card_give:'Ofrendar',card_prayer:'Petición de Oración',card_bible:'Biblia',
  card_ministries:'Ministerios',card_social:'Redes Sociales',card_website:'Sitio Web',card_about:'Acerca de',
  give_tithely:'Tithe.ly',give_square:'Square',give_zelle_copy:'Copiar Zelle',
  social_facebook:'Facebook',social_instagram:'Instagram',social_youtube:'YouTube',social_tiktok:'TikTok',
  bible_spanish:'Biblia RVR1960',bible_english:'Bible KJV',directions:'Indicaciones / GPS',
  language_change:'Cambio de idioma',pwa_install_prompt:'Instalar PWA',pwa_installed:'PWA instalada',external_link:'Enlace externo'
};

let currentPreset='30d';
let currentData=null;

const $=id=>document.getElementById(id);
const fmt=new Intl.NumberFormat('en-US');

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
function percentChange(value){
  if(value===null||value===undefined||Number.isNaN(Number(value)))return '';
  const n=Number(value),arrow=n>0?'↑':n<0?'↓':'→';
  return arrow+' '+Math.abs(n).toFixed(1)+'% vs. período anterior';
}
function applyChange(id,value){
  const el=$(id);if(!el)return;el.textContent=percentChange(value);
  el.style.color=Number(value)>0?'#12a63a':Number(value)<0?'#b42318':'#667792';
}
function labelFor(map,key){return map[key]||String(key||'Otro');}
function safePercent(value,total){return total>0?(Number(value)/total)*100:0;}

function renderBars(containerId,items,labelMap){
  const root=$(containerId);root.replaceChildren();
  const max=Math.max(1,...items.map(x=>Number(x.value)||0));
  for(const item of items){
    const row=document.createElement('div');row.className='bar-row';
    const label=document.createElement('span');label.textContent=labelFor(labelMap,item.key);
    const track=document.createElement('div');track.className='bar-track';
    const fill=document.createElement('div');fill.className='bar-fill';fill.style.width=Math.max(2,(Number(item.value)||0)/max*100)+'%';track.append(fill);
    const value=document.createElement('strong');value.textContent=fmt.format(Number(item.value)||0);
    row.append(label,track,value);root.append(row);
  }
  if(!items.length)root.textContent='Sin datos para este período.';
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
    label.append(dot,document.createTextNode(SOURCE_LABELS[item.key]||item.key));
    const pct=document.createElement('span');pct.textContent=safePercent(item.value,total).toFixed(1)+'%';
    const value=document.createElement('strong');value.textContent=fmt.format(Number(item.value)||0);
    row.append(label,pct,value);root.append(row);
  }
  changeText('source-total',fmt.format(total));
  let cursor=0;
  const parts=normalized.map(item=>{
    const start=cursor,end=cursor+safePercent(item.value,total);cursor=end;
    return (SOURCE_COLORS[item.key]||'#9ca9bb')+' '+start+'% '+end+'%';
  });
  $('source-donut').style.background=total?'conic-gradient('+parts.join(',')+')':'conic-gradient(#dfe7f1 0 100%)';
}

function renderDaily(items){
  const root=$('daily-chart');root.replaceChildren();
  const max=Math.max(1,...items.map(x=>Number(x.value)||0));
  let total=0;
  for(const item of items){
    total+=Number(item.value)||0;
    const bar=document.createElement('div');bar.className='daily-bar';
    bar.style.height=Math.max(2,(Number(item.value)||0)/max*100)+'%';
    bar.dataset.label=item.day+': '+fmt.format(Number(item.value)||0);
    bar.title=bar.dataset.label;root.append(bar);
  }
  changeText('daily-total',fmt.format(total)+' sesiones');
}

function renderHealth(health){
  const ok=health?.database==='operational'&&health?.collector==='operational';
  const overall=$('health-overall');overall.textContent=ok?'● Todos los sistemas operacionales':'● Atención requerida';overall.className=ok?'health-ok':'';
  changeText('health-collector',health?.collector==='operational'?'Operacional':'Revisar');
  changeText('health-db',health?.database==='operational'?'Operacional':'Revisar');
  changeText('health-last-event',health?.last_event_at?new Date(health.last_event_at).toLocaleString():'Sin eventos');
}

function renderDashboard(data){
  currentData=data;
  changeText('range-label',data.range.from+' — '+data.range.to);
  changeText('print-range',data.range.from+' — '+data.range.to);
  changeText('generated-label','Generado '+new Date(data.generated_at).toLocaleString());
  changeText('metric-visits',fmt.format(data.summary.visits));
  changeText('metric-unique',fmt.format(data.summary.unique_visitors));
  changeText('metric-pwa',fmt.format(data.summary.pwa_sessions));
  changeText('metric-pageviews',fmt.format(data.summary.page_views));
  applyChange('metric-visits-change',data.comparison.visits_pct);
  applyChange('metric-unique-change',data.comparison.unique_visitors_pct);
  applyChange('metric-pwa-change',data.comparison.pwa_sessions_pct);
  applyChange('metric-pageviews-change',data.comparison.page_views_pct);
  renderDaily(data.daily_visits||[]);
  renderLegend(data.acquisition_sources||[]);
  renderBars('session-entry-list',data.session_entries||[],ENTRY_LABELS);
  renderBars('actions-list',data.top_actions||[],ACTION_LABELS);
  renderBars('display-list',data.display_modes||[],DISPLAY_LABELS);
  renderBars('devices-list',data.devices||[],DEVICE_LABELS);
  renderBars('browsers-list',data.browsers||[],BROWSER_LABELS);
  renderBars('languages-list',data.languages||[],LANGUAGE_LABELS);
  renderBars('visitor-mix-list',data.visitor_mix||[],VISITOR_MIX_LABELS);
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
    $('health-overall').textContent='● No fue posible cargar las estadísticas';
    $('health-overall').className='';
  }
}

async function checkSession(){
  try{
    const session=await api('/api/auth/session');
    setView(true);
    await loadDashboard();
    return session;
  }catch(error){
    setView(false);
    return null;
  }
}

function setupLogin(){
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const errorEl=$('login-error');errorEl.hidden=true;
    const button=$('login-button');button.disabled=true;button.textContent='Entrando…';
    try{
      await api('/api/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:$('login-email').value,password:$('login-password').value,remember:$('login-remember').checked})
      });
      $('login-password').value='';
      setView(true);await loadDashboard();
    }catch(error){
      errorEl.textContent=error.status===429?'Demasiados intentos. Intenta nuevamente en unos minutos.':'Correo o contraseña incorrectos.';
      errorEl.hidden=false;
    }finally{button.disabled=false;button.textContent='Entrar';}
  });
}

function setupDashboard(){
  $('range-select').addEventListener('change',async event=>{
    currentPreset=event.target.value;
    $('custom-range').hidden=currentPreset!=='custom';
    if(currentPreset!=='custom')await loadDashboard();
  });
  $('apply-range').addEventListener('click',async()=>{
    const from=$('range-from').value,to=$('range-to').value;
    if(!from||!to||from>to){alert('Selecciona un rango de fechas válido.');return;}
    await loadDashboard();
  });
  $('print-button').addEventListener('click',()=>window.print());
  $('export-button').addEventListener('click',async()=>{
    const button=$('export-button');button.disabled=true;
    try{
      const response=await fetch('/api/export'+dashboardQuery(),{credentials:'same-origin',cache:'no-store'});
      if(response.status===401){setView(false);return;}
      if(!response.ok)throw new Error('export failed');
      const blob=await response.blob();const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download=response.headers.get('x-filename')||'mpdgi-stats.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
    }catch{alert('No fue posible generar el CSV.');}
    finally{button.disabled=false;}
  });
  $('logout-button').addEventListener('click',async()=>{
    try{await api('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});}catch{}
    setView(false);
  });
  document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));item.classList.add('active');
  }));
}

async function setupServiceWorker(){
  if(!('serviceWorker'in navigator))return;
  try{await navigator.serviceWorker.register('./sw.js?v='+encodeURIComponent(STATS_VERSION),{scope:'./',updateViaCache:'none'});}catch(error){console.warn('[MPDGI Stats] service worker',error);}
}

async function init(){
  changeText('stats-version',STATS_VERSION);
  setupLogin();setupDashboard();void setupServiceWorker();
  await checkSession();
}
init();
