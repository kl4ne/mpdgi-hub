const {test,expect}=require('@playwright/test');

const sample={
  generated_at:'2026-09-29T19:00:00.000Z',
  range:{preset:'30d',from:'2026-08-31',to:'2026-09-29',days:30,previous_from:'2026-08-01',previous_to:'2026-08-30'},
  summary:{visits:128,unique_visitors:84,pwa_sessions:31,page_views:212},
  previous_summary:{visits:100,unique_visitors:70,pwa_sessions:20,page_views:180},
  comparison:{visits_pct:28,unique_visitors_pct:20,pwa_sessions_pct:55,page_views_pct:17.8},
  daily_visits:[
    {day:'2026-09-26',value:12},{day:'2026-09-27',value:21},{day:'2026-09-28',value:18},{day:'2026-09-29',value:29}
  ],
  acquisition_sources:[{key:'nfc',value:48},{key:'qr',value:0},{key:'link',value:21},{key:'unattributed',value:15}],
  session_entries:[{key:'nfc',value:61},{key:'qr',value:0},{key:'link',value:24},{key:'web',value:29},{key:'pwa',value:14}],
  display_modes:[{key:'pwa',value:31},{key:'browser',value:97}],
  devices:[{key:'mobile',value:92},{key:'desktop',value:27},{key:'tablet',value:9},{key:'other',value:0}],
  browsers:[{key:'edge',value:22},{key:'chrome',value:40},{key:'safari',value:60},{key:'firefox',value:6},{key:'other',value:0}],
  languages:[{key:'es',value:103},{key:'en',value:25},{key:'other',value:0}],
  top_actions:[{key:'card_members',value:51},{key:'card_bible',value:34},{key:'give_square',value:12},{key:'directions',value:9}],
  health:{collector:'operational',database:'operational',last_event_at:'2026-09-29T18:58:00.000Z'}
};

test('unauthenticated users see only the secure login experience',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:401,contentType:'application/json',body:'{"error":"unauthorized"}'}));
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('#login-view')).toBeVisible();
  await expect(page.locator('#app-view')).toBeHidden();
  await expect(page.locator('h1#login-title')).toHaveText('MPDGI Stats');
  await expect(page.locator('text=Acceso autorizado solamente')).toBeVisible();
});

test('authenticated dashboard renders the same server aggregates including zero-value QR',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('#app-view')).toBeVisible();
  await expect(page.locator('#metric-visits')).toHaveText('128');
  await expect(page.locator('#metric-unique')).toHaveText('84');
  await expect(page.locator('#source-legend')).toContainText('QR');
  await expect(page.locator('#source-legend')).toContainText('0');
  await expect(page.locator('#health-overall')).toContainText('Todos los sistemas operacionales');
});

test('print layout exposes the professional report header and hides navigation',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print'});
  await expect(page.locator('#report-header')).toBeVisible();
  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('#print-range')).toContainText('2026-08-31');
});

test('mobile Stats dashboard avoids horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'networkidle'});
  const dims=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(dims.scroll).toBeLessThanOrEqual(dims.inner+1);
  await expect(page.locator('#source-donut')).toBeVisible();
});
