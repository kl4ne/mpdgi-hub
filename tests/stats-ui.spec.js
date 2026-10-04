import {test,expect} from '@playwright/test';

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
  visitor_mix:[{key:'new',value:54},{key:'returning',value:30}],
  campaigns:[
    {id:'c1',name:'Credential Test',slug:'credential-test',source:'nfc',created_at:'2026-09-20T14:00:00.000Z',sessions:22,visitors:18,acquired_visitors:16,last_activity_at:'2026-09-29T18:40:00.000Z'},
    {id:'c2',name:'Youth Campaign 2026',slug:'youth-campaign-2026',source:'link',created_at:'2026-09-24T14:00:00.000Z',sessions:9,visitors:8,acquired_visitors:6,last_activity_at:'2026-09-28T18:40:00.000Z'}
  ],
  digital_cards:[
    {card_id:'ruben-suarez',sessions:41,visitors:29,opens:43,save_contact:16,calls:7,texts:5,directions:4,website:9,shares:3,flips:24,nfc_sessions:31,link_sessions:6,web_sessions:4,last_activity_at:'2026-09-29T18:57:00.000Z'}
  ],
  activity:{
    hourly_sessions:Array.from({length:24},(_,hour)=>({key:String(hour),value:hour===10?31:hour===19?22:1})),
    weekday_sessions:[{key:'0',value:44},{key:'1',value:8},{key:'2',value:11},{key:'3',value:29},{key:'4',value:9},{key:'5',value:7},{key:'6',value:20}],
    peak_hour:10,peak_hour_sessions:31,peak_weekday:0,peak_weekday_sessions:44,sunday_sessions:44,wednesday_sessions:29
  },
  data_quality:{events_received:260,events_stored:258,unique_event_ids:258,duplicates_prevented:2,rejected:1,delayed_events:7,last_received_at:'2026-09-29T18:59:00.000Z'},
  health:{collector:'operational',database:'operational',event_pipeline:'operational',database_latency_ms:18,last_received_at:'2026-09-29T18:59:00.000Z',last_event_at:'2026-09-29T18:58:00.000Z'}
};

test('unauthenticated users see only the secure login experience',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:401,contentType:'application/json',body:'{"error":"unauthorized"}'}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#login-view')).toBeVisible();
  await expect(page.locator('#app-view')).toBeHidden();
  await expect(page.locator('h1#login-title')).toHaveText('MPDGI Stats');
  await expect(page.locator('text=Acceso autorizado solamente')).toBeVisible();
});

test('authenticated dashboard renders the same server aggregates including zero-value QR',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#app-view')).toBeVisible();
  await expect(page.locator('#metric-visits')).toHaveText('128');
  await expect(page.locator('#metric-unique')).toHaveText('84');
  await page.locator('.nav-item[data-view="sources"]').click();
  await expect(page.locator('[data-view-panel="sources"]')).toBeVisible();
  await expect(page.locator('[data-view-panel="dashboard"]')).toBeHidden();
  await expect(page.locator('#source-legend')).toContainText('QR');
  await expect(page.locator('#source-legend')).toContainText('0');
  await page.locator('.nav-item[data-view="system"]').click();
  await expect(page.locator('#health-overall')).toContainText('Todos los sistemas operacionales');
  await expect(page.locator('#health-collector-light')).toHaveClass(/status-green/);
  await expect(page.locator('#health-db-light')).toHaveClass(/status-green/);
  await expect(page.locator('#health-pipeline-light')).toHaveClass(/status-green/);
  await expect(page.locator('#health-db')).toContainText('18 ms');
});

test('Digital Cards view renders NFC business-card usage and actions',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('.nav-item[data-view="cards"]').click();
  const panel=page.locator('[data-view-panel="cards"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Pastor Ruben Suárez');
  await expect(panel).toContainText('41');
  await expect(panel).toContainText('Guardar contacto');
  await expect(panel).toContainText('Llamar (toques)');
  await expect(panel).toContainText('Dirección (toques)');
  await expect(panel.locator('[data-tooltip-key="tipCardNfc"]')).toHaveAttribute('title',/NFC/);
  await expect(panel.locator('[data-tooltip-key="tipCardSave"]')).toHaveAttribute('title',/no confirma/);
  await expect(panel).toContainText('31');
});

test('print layout exposes the professional report header and hides navigation',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.emulateMedia({media:'print'});
  await expect(page.locator('#report-header')).toBeVisible();
  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('#print-range')).toContainText('2026-08-31');
});

test('mobile Stats dashboard avoids horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const dims=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}));
  expect(dims.scroll).toBeLessThanOrEqual(dims.inner+1);
  await page.locator('.nav-item[data-view="sources"]').click();
  await expect(page.locator('#source-donut')).toBeVisible();
});


test('custom report range keeps controls professional and drives the dashboard request',async({page,browserName})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  const requested=[];
  await page.route('**/api/dashboard**',r=>{
    requested.push(r.request().url());
    return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)});
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#range-select').selectOption('custom');
  await expect(page.locator('#custom-range')).toBeVisible();
  await page.locator('#range-from').evaluate(el=>{el.type='text';el.value='2026-09-01';});
  await page.locator('#range-to').evaluate(el=>{el.type='text';el.value='2026-09-29';});
  await expect(page.locator('#range-from')).toHaveValue('2026-09-01');
  await expect(page.locator('#range-to')).toHaveValue('2026-09-29');
  if(browserName!=='webkit'){
    await page.locator('#apply-range').click();
    await expect.poll(()=>requested.some(url=>url.includes('preset=custom'))).toBeTruthy();
    const customRequest=requested.find(url=>url.includes('preset=custom'))||'';
    expect(customRequest).toContain('from=2026-09-01');
    expect(customRequest).toContain('to=2026-09-29');
  }
  await expect(page.locator('#visitor-mix-list')).toContainText('Nuevos');
  await expect(page.locator('#campaigns-list')).toContainText('Credential Test');
});


test('left navigation behaves as real views instead of scrolling one long dashboard',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-view-panel="dashboard"]')).toBeVisible();
  await expect(page.locator('[data-view-panel="reports"]')).toBeHidden();
  await page.locator('.nav-item[data-view="reports"]').click();
  await expect(page.locator('[data-view-panel="dashboard"]')).toBeHidden();
  await expect(page.locator('[data-view-panel="reports"]')).toBeVisible();
  await expect(page.locator('.daily-day')).toHaveCount(sample.daily_visits.length);
});

test('English mode translates the private interface and printable report',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('#app-view .lang-button[data-lang="en"]').click();
  await expect(page.locator('.nav-item[data-view="reports"] span')).toHaveText('Reports');
  await expect(page.locator('[data-view-panel="dashboard"]')).toContainText('Estimated unique visitors');
  await page.emulateMedia({media:'print'});
  await expect(page.locator('#report-header')).toContainText('Analytics Report');
});

test('campaign builder persists records and Open URL preserves the tagged destination',async({page,browserName})=>{
  let saves=0,lastBody=null;
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.route('**/api/campaigns*',async r=>{
    saves++;lastBody=JSON.parse(r.request().postData()||'{}');
    const url='https://hub.mpdgi.org/?src='+lastBody.source+'&campaign='+lastBody.slug;
    await r.fulfill({status:201,contentType:'application/json',body:JSON.stringify({created:true,campaign:{id:'new',...lastBody,url}})});
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('.nav-item[data-view="campaigns"]').click();
  await page.locator('#campaign-name').fill('Reunión Líderes Octubre');
  await expect(page.locator('#campaign-url')).toHaveValue(/src=link.*campaign=reunion-lideres-octubre/);
  await page.locator('#campaign-source').selectOption('qr');
  await expect(page.locator('#campaign-url')).toHaveValue(/src=qr.*campaign=reunion-lideres-octubre/);

  if(browserName==='webkit'){
    await page.locator('#campaign-create').evaluate(el=>el.click());
  }else{
    await page.evaluate(()=>{
      window.__openedCampaignTargets=[];
      window.open=()=>({opener:null,location:{replace(target){window.__openedCampaignTargets.push(target);},set href(target){window.__openedCampaignTargets.push(target);}}});
    });
    await page.locator('#campaign-open').click();
  }

  await expect.poll(()=>saves).toBe(1);
  expect(lastBody).toEqual({name:'Reunión Líderes Octubre',source:'qr',slug:'reunion-lideres-octubre'});
  if(browserName!=='webkit'){
    await expect.poll(()=>page.evaluate(()=>window.__openedCampaignTargets[0]||'')).toContain('src=qr');
  }
  await expect(page.locator('#campaign-feedback')).toContainText('Campaña creada');
  await expect(page.locator('#campaigns-list')).toContainText('Credential Test');
  await expect(page.locator('#general-link-url')).toHaveValue('https://hub.mpdgi.org/?src=link');
});


test('v1.2.0 executive insights, activity and data-quality views render from server data',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#executive-summary-text')).toContainText('128');
  await expect(page.locator('#executive-peak-hour')).toContainText('10');
  await page.locator('.nav-item[data-view="reports"]').click();
  await expect(page.locator('#hourly-activity-list .activity-row')).toHaveCount(24);
  await expect(page.locator('#weekday-activity-list .activity-row')).toHaveCount(7);
  await page.locator('.nav-item[data-view="system"]').click();
  await expect(page.locator('#quality-received')).toHaveText('260');
  await expect(page.locator('#quality-duplicates')).toHaveText('2');
  await expect(page.locator('#quality-delayed')).toHaveText('7');
});

test('print mode can expose all report sections for the executive PDF',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
  await expect(page.locator('body')).toHaveClass(/print-all/);
  await expect(page.locator('[data-view-panel="reports"]')).toBeVisible();
  await expect(page.locator('[data-view-panel="system"]')).toBeVisible();
});


test('System Health distinguishes quiet traffic from system failure',async({page})=>{
  const quiet=structuredClone(sample);
  quiet.health={collector:'no_recent_activity',database:'operational',event_pipeline:'no_recent_activity',database_latency_ms:22,last_received_at:null,last_event_at:null};
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(quiet)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('.nav-item[data-view="system"]').click();
  await expect(page.locator('#health-collector')).toContainText('Sin actividad reciente');
  await expect(page.locator('#health-collector-light')).toHaveClass(/status-yellow/);
  await expect(page.locator('#health-db-light')).toHaveClass(/status-green/);
});

test('Methodology view documents definitions, privacy and retention without automatic deletion',async({page})=>{
  await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":true,"user":{"email":"owner@example.com","role":"owner"}}'}));
  await page.route('**/api/dashboard**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(sample)}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('.nav-item[data-view="methodology"]').click();
  const panel=page.locator('[data-view-panel="methodology"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Estimated Visitor');
  await expect(panel).toContainText('24 meses');
  await expect(panel).toContainText('v1.4.2');
  await expect(panel).toContainText('no activa borrado automático');
  await expect(page.locator('#sidebar-version')).toHaveText('v1.4.2');
});
