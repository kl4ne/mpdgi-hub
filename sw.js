const VERSION='1.2.0';
const CACHE_PREFIX='mpdgi-hub';
const SHELL_CACHE=`${CACHE_PREFIX}-shell-${VERSION}`;
const RUNTIME_CACHE=`${CACHE_PREFIX}-runtime-${VERSION}`;
const CRITICAL_ASSETS=[
  './','./index.html','./css/style.css','./js/app.js','./manifest.json',
  './data/config.json','./data/links.json','./assets/profile/logo-mpdg.png',
  './assets/icons/icon-192.png','./assets/icons/icon-512.svg'
];
const OPTIONAL_ASSETS=['./data/changelog.json'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(SHELL_CACHE);
    await cache.addAll(CRITICAL_ASSETS);
    await Promise.allSettled(OPTIONAL_ASSETS.map(asset=>cache.add(asset)));
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

function isDataRequest(url){return url.pathname.endsWith('/data/config.json')||url.pathname.endsWith('/data/links.json')||url.pathname.endsWith('/data/changelog.json');}
function offlineResponse(){return new Response('Offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
async function putIfCacheable(cacheName,request,response){if(!response||!response.ok||response.type==='opaque')return;try{const cache=await caches.open(cacheName);await cache.put(request,response.clone());}catch(e){console.warn('[MPDGI Hub] Cache write failed:',e);}}
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
async function dataNetworkFirst(request){
  const requestUrl=new URL(request.url),scopeUrl=new URL(self.registration.scope);
  const relative=requestUrl.pathname.startsWith(scopeUrl.pathname)?requestUrl.pathname.slice(scopeUrl.pathname.length):requestUrl.pathname.split('/').pop();
  const canonical=new URL(relative,self.registration.scope).href;
  try{
    const response=await fetch(request);
    if(response?.ok){const cache=await caches.open(SHELL_CACHE);await cache.put(canonical,response.clone());return response;}
    return(await caches.match(canonical,{ignoreSearch:true}))||response||offlineResponse();
  }catch{return(await caches.match(canonical,{ignoreSearch:true}))||offlineResponse();}
}
async function staleWhileRevalidate(request){
  const cached=await caches.match(request,{ignoreSearch:true});
  const network=fetch(request).then(async response=>{if(response?.ok)await putIfCacheable(RUNTIME_CACHE,request,response);return response;}).catch(()=>null);
  if(cached){network.catch(()=>{});return cached;}
  return(await network)||offlineResponse();
}
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin)return;
  if(isDataRequest(url)){event.respondWith(dataNetworkFirst(request));return;}
  if(request.mode==='navigate'){event.respondWith(networkFirst(request,RUNTIME_CACHE,'./index.html'));return;}
  if(['script','style','image','manifest'].includes(request.destination)){event.respondWith(staleWhileRevalidate(request));return;}
  event.respondWith(networkFirst(request,RUNTIME_CACHE));
});
