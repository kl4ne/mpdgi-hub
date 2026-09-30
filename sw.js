'use strict';

const SCRIPT_VERSION=new URL(self.location.href).searchParams.get('v')||'dev';
const BUILD_ID='2026-09-29-v1.5.1-device-detection';
importScripts('./js/version-v1.5.1.js');
const VERSION=self.MPDGI_HUB_VERSION||SCRIPT_VERSION;
const CACHE_PREFIX='mpdgi-hub';
const SHELL_CACHE=`${CACHE_PREFIX}-shell-${VERSION}`;
const RUNTIME_CACHE=`${CACHE_PREFIX}-runtime-${VERSION}`;

const CRITICAL_ASSETS=[
  './',
  './index.html',
  './css/style-v1.5.1.css',
  './js/version-v1.5.1.js',
  './js/app-v1.5.1.js',
  './manifest.json',
  './data/config.json',
  './data/links.json',
  './assets/profile/logo-mpdg.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/brands/social/facebook.svg',
  './assets/brands/social/instagram.svg',
  './assets/brands/social/youtube.svg',
  './assets/brands/social/tiktok.svg'
];
const CRITICAL_URLS=new Set(CRITICAL_ASSETS.map(asset=>new URL(asset,self.registration.scope).href));

async function fetchFresh(url){
  const request=new Request(url,{cache:'reload',credentials:'same-origin'});
  const response=await fetch(request);
  if(!response.ok)throw new Error(`Precache failed ${response.status}: ${url}`);
  return response;
}
async function refreshShellCache(){
  const cache=await caches.open(SHELL_CACHE);
  await Promise.all(CRITICAL_ASSETS.map(async asset=>{
    const url=new URL(asset,self.registration.scope).href;
    const response=await fetchFresh(url);
    await cache.put(url,response.clone());
  }));
}
async function purgeOldCaches(){
  const valid=new Set([SHELL_CACHE,RUNTIME_CACHE]);
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&!valid.has(key)).map(key=>caches.delete(key)));
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    await refreshShellCache();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    await purgeOldCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING'){
    self.skipWaiting();
    return;
  }
  if(event.data?.type==='REPAIR_CACHES'){
    event.waitUntil((async()=>{
      await purgeOldCaches();
      await refreshShellCache();
    })());
  }
});

function isDataRequest(url){
  return url.pathname.endsWith('/data/config.json')||url.pathname.endsWith('/data/links.json');
}
function offlineResponse(){
  return new Response('Offline',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
}
async function putIfCacheable(cacheName,request,response){
  if(!response||!response.ok||response.type==='opaque')return;
  try{
    const cache=await caches.open(cacheName);
    await cache.put(request,response.clone());
  }catch(e){
    console.warn('[MPDGI Hub] Cache write failed:',e);
  }
}
async function shellCacheFirst(request){
  const cache=await caches.open(SHELL_CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  try{
    const response=await fetch(new Request(request,{cache:'reload'}));
    if(response?.ok)await cache.put(request,response.clone());
    return response||offlineResponse();
  }catch{
    return offlineResponse();
  }
}
async function networkFirst(request,cacheName,fallbackUrl=null){
  const cache=await caches.open(cacheName);
  try{
    const response=await fetch(request);
    if(response?.ok)await cache.put(request,response.clone());
    if(response)return response;
  }catch{}
  const cached=await cache.match(request);
  if(cached)return cached;
  if(fallbackUrl){
    const shell=await caches.open(SHELL_CACHE);
    const fallback=await shell.match(new URL(fallbackUrl,self.registration.scope).href);
    if(fallback)return fallback;
  }
  return offlineResponse();
}
async function dataStaleWhileRevalidate(request,event){
  const cache=await caches.open(SHELL_CACHE);
  const cached=await cache.match(request);
  const network=fetch(new Request(request,{cache:'no-store'})).then(async response=>{
    if(response?.ok)await cache.put(request,response.clone());
    return response;
  }).catch(()=>null);
  if(cached){
    event.waitUntil(network.then(()=>undefined));
    return cached;
  }
  return(await network)||offlineResponse();
}
async function runtimeStaleWhileRevalidate(request){
  const cache=await caches.open(RUNTIME_CACHE);
  const cached=await cache.match(request);
  const network=fetch(request).then(async response=>{
    if(response?.ok)await cache.put(request,response.clone());
    return response;
  }).catch(()=>null);
  if(cached){
    network.catch(()=>{});
    return cached;
  }
  return(await network)||offlineResponse();
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(networkFirst(request,RUNTIME_CACHE,'./index.html'));
    return;
  }
  if(isDataRequest(url)){
    event.respondWith(dataStaleWhileRevalidate(request,event));
    return;
  }
  if(CRITICAL_URLS.has(url.href)){
    event.respondWith(shellCacheFirst(request));
    return;
  }
  if(['script','style','image','manifest','font'].includes(request.destination)){
    event.respondWith(runtimeStaleWhileRevalidate(request));
    return;
  }
  event.respondWith(networkFirst(request,RUNTIME_CACHE));
});
