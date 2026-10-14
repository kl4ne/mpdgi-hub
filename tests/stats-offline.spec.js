import {test,expect} from '@playwright/test';

// The normal dashboard suite blocks SWs so mocked API responses remain deterministic.
test.use({serviceWorkers:'allow'});
test('installed shell works offline without caching private API responses',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','Offline regression runs in Chromium; normal UI suite also covers WebKit');
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{
    if(!('serviceWorker'in navigator))throw Error('No service worker API');
    await navigator.serviceWorker.ready;
  });
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),{timeout:15000}).toBe(true);
  const cacheBefore=await page.evaluate(async()=>{
    const all=await caches.keys();
    const current=all.find(name=>name==='mpdgi-stats-shell-1.4.12');
    if(!current)return [];
    const cache=await caches.open(current);
    return (await cache.keys()).map(request=>new URL(request.url).pathname);
  });
  expect(cacheBefore).toContain('/js/stats.js');
  expect(cacheBefore).toContain('/index.html');
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#login-form')).toBeVisible();
  await expect(page.locator('#sidebar-version')).toHaveCount(1);
  const response=await page.evaluate(async()=>{
    try{return (await fetch('/api/dashboard')).status;}catch{return 'offline';}
  });
  expect(response).toBe('offline');
  await context.setOffline(false);
});
