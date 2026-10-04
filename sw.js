'use strict';
// Digital Cards tooltip shell refresh 2026-10-04
const VERSION='1.4.4';
const CACHE='mpdgi-stats-shell-'+VERSION;
const SHELL=['./','./index.html','./css/stats.css','./js/stats-version.js','./js/stats.js','./manifest.json','./assets/profile/logo-mpdg.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/apple-touch-icon.png'];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const asset of SHELL){
      const response=await fetch(new Request(asset,{cache:'reload'}));
      if(response.ok)await cache.put(asset,response.clone());
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('mpdgi-stats-')&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/'))return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{return await fetch(new Request(request,{cache:'no-store'}));}
      catch{
        const cache=await caches.open(CACHE);
        return (await cache.match('./index.html'))||Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok&&['script','style','image','manifest'].includes(request.destination))await cache.put(request,response.clone());
      return response;
    }catch{return Response.error();}
  })());
});
