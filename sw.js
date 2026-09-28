importScripts('./js/version.js');

const VERSION=self.MPDGI_HUB_VERSION||'dev';
const CACHE_PREFIX='mpdgi-hub';
const SHELL_CACHE=`${CACHE_PREFIX}-shell-${VERSION}`;
const RUNTIME_CACHE=`${CACHE_PREFIX}-runtime-${VERSION}`;
const CRITICAL_ASSETS=[
  './','./index.html','./css/style.css','./js/version.js','./js/app.js','./manifest.json',
  './data/config.json','./data/links.json','./assets/profile/logo-mpdg.png',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/apple-touch-icon.png',
  './assets/brands/social/facebook.svg','./assets/brands/social/instagram.svg',
  './assets/brands/social/youtube.svg','./assets/brands/social/tiktok.svg',
  './assets/brands/payments/tithely.svg','./assets/brands/payments/square.svg',
  './assets/brands/payments/visa.svg','./assets/brands/payments/mastercard.svg',
  './assets/brands/payments/amex.svg','./assets/brands/payments/discover.svg',
  './assets/brands/payments/jcb.svg','./assets/brands/payments/unionpay.svg',
  './assets/brands/payments/applepay.svg','./assets/brands/payments/googlepay.svg',
  './assets/brands/payments/cashapp.svg'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL_CACHE);
    await cache.addAll(CRITICAL_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const valid=new Set([SHELL_CACHE,RUNTIME_CACHE]);
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&!valid.has(k)).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});

function isDataRequest(url){
  return url.pathname.endsWith('/data/config.json')||url.pathname.endsWith('/data/links.json');
}
function offlineResponse(){
  return new Response('Offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
async function putIfCacheable(cacheName,request,response){
  if(!response||!response.ok||response.type==='opaque')return;
  try{const cache=await caches.open(cacheName);await cache.put(request,response.clone());}
  catch(e){console.warn('[MPDGI Hub] Cache write failed:',e);}
}
async function networkFirst(request,cacheName,fallbackUrl=null){
  try{
    const response=await fetch(request);
    if(response?.ok){await putIfCacheable(cacheName,request,response);return response;}
    const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;
    if(fallbackUrl){const fallback=await caches.match(fallbackUrl,{ignoreSearch:true});if(fallback)return fallback;}
    return response||offlineResponse();
  }catch{
    const cached=await caches.match(request,{ignoreSearch:true});if(cached)return cached;
    if(fallbackUrl){const fallback=await caches.match(fallbackUrl,{ignoreSearch:true});if(fallback)return fallback;}
    return offlineResponse();
  }
}
async function dataStaleWhileRevalidate(request,event){
  const requestUrl=new URL(request.url),scopeUrl=new URL(self.registration.scope);
  const relative=requestUrl.pathname.startsWith(scopeUrl.pathname)
    ?requestUrl.pathname.slice(scopeUrl.pathname.length)
    :requestUrl.pathname.split('/').pop();
  const canonical=new URL(relative,self.registration.scope).href;
  const cached=await caches.match(canonical,{ignoreSearch:true});
  const network=fetch(request).then(async response=>{
    if(response?.ok){
      const cache=await caches.open(SHELL_CACHE);
      await cache.put(canonical,response.clone());
    }
    return response;
  }).catch(()=>null);
  if(cached){
    event.waitUntil(network.then(()=>undefined));
    return cached;
  }
  return(await network)||offlineResponse();
}
async function staleWhileRevalidate(request){
  const cached=await caches.match(request,{ignoreSearch:true});
  const network=fetch(request).then(async response=>{
    if(response?.ok)await putIfCacheable(RUNTIME_CACHE,request,response);
    return response;
  }).catch(()=>null);
  if(cached){network.catch(()=>{});return cached;}
  return(await network)||offlineResponse();
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(isDataRequest(url)){event.respondWith(dataStaleWhileRevalidate(request,event));return;}
  if(request.mode==='navigate'){event.respondWith(networkFirst(request,RUNTIME_CACHE,'./index.html'));return;}
  if(['script','style','image','manifest'].includes(request.destination)){event.respondWith(staleWhileRevalidate(request));return;}
  event.respondWith(networkFirst(request,RUNTIME_CACHE));
});
