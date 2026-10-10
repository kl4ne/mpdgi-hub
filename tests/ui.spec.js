const {test,expect}=require('@playwright/test');

const viewports=[
  {name:'320x568',width:320,height:568},
  {name:'375x667',width:375,height:667},
  {name:'390x844',width:390,height:844},
  {name:'430x932',width:430,height:932}
];

for(const viewport of viewports){
  test('mobile layout '+viewport.name+' fits without overflow',async({page})=>{
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    const errors=[];
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/',{waitUntil:'networkidle'});
    await expect(page.locator('[data-card-id]')).toHaveCount(8);
    const dims=await page.evaluate(()=>({
      innerWidth:window.innerWidth,
      innerHeight:window.innerHeight,
      scrollWidth:document.documentElement.scrollWidth,
      scrollHeight:document.documentElement.scrollHeight
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.innerWidth+1);
    expect(dims.scrollHeight).toBeLessThanOrEqual(dims.innerHeight+4);
    expect(errors).toEqual([]);
  });
}

test('Spanish and English UI remain consistent',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('[data-card-id="about"] .card-title')).toHaveText('Acerca de');
  await expect(page.locator('#language-code')).toHaveText('ES');
  await page.locator('#language-toggle').click();
  await expect(page.locator('[data-card-id="about"] .card-title')).toHaveText('About');
  await expect(page.locator('#language-code')).toHaveText('EN');
  await expect(page.locator('#language-toggle')).toHaveAttribute('aria-label','Change language to Spanish');
});

test('all modal flows open, isolate background and close cleanly',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  for(const id of ['give','bible','social','about']){
    await page.locator('[data-card-id="'+id+'"] .card-action').click();
    await expect(page.locator('#modal-overlay')).toBeVisible();
    await expect(page.locator('#main-content')).toHaveAttribute('aria-hidden','true');
    await page.locator('#modal-close').click();
    await expect(page.locator('#modal-overlay')).toBeHidden();
    await expect(page.locator('#main-content')).not.toHaveAttribute('aria-hidden','true');
  }
});

test('primary links and footer structure are correct',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('[data-card-id="members"] a')).toHaveAttribute('href','https://mpdgi.chmeetings.com/');
  await expect(page.locator('[data-card-id="prayer"] a')).toHaveAttribute('href','https://mpdgi.org/oracion');
  await expect(page.locator('[data-card-id="ministries"] a')).toHaveAttribute('href','https://mpdgi.org/ministerios');
  await expect(page.locator('[data-card-id="website"] a')).toHaveAttribute('href','https://mpdgi.org/');
  await expect(page.locator('.hub-footer #install-button')).toHaveCount(0);
  await expect(page.locator('#developer-credit')).toHaveText('Designed & Developed by Roberto S. Macfie for MPDGI');
  const developerLink=page.locator('#developer-credit a');
  await expect(developerLink).toHaveCount(1);
  await expect(developerLink).toHaveText('Roberto S. Macfie');
  await expect(developerLink).toHaveAttribute('href','https://rmcard.pages.dev/');
  await expect(developerLink).toHaveAttribute('target','_blank');
  await expect(developerLink).toHaveAttribute('rel','noopener noreferrer');
  await page.locator('#language-toggle').click();
  await expect(page.locator('#developer-credit')).toHaveText('Designed & Developed by Roberto S. Macfie for MPDGI');
  await expect(developerLink).toHaveCount(1);
  await expect(developerLink).toHaveAttribute('href','https://rmcard.pages.dev/');
});

test('service worker registers on localhost',async({page,browserName})=>{
  test.skip(browserName==='webkit','Service worker registration assertion is Chromium-only in CI.');
  await page.goto('/',{waitUntil:'networkidle'});
  const registered=await page.evaluate(async()=>{
    if(!('serviceWorker' in navigator))return false;
    for(let i=0;i<30;i++){
      const regs=await navigator.serviceWorker.getRegistrations();
      if(regs.length)return true;
      await new Promise(r=>setTimeout(r,100));
    }
    return false;
  });
  expect(registered).toBe(true);
});


test('giving modal includes Tithe.ly, Square, Zelle and accepted card branding',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('[data-card-id="give"] .card-action').click();
  await expect(page.locator('.tithely-button')).toHaveAttribute('href','https://tithe.ly/give_new/www/#/tithely/give-one-time/6513581');
  await expect(page.locator('.square-button')).toHaveAttribute('href','https://square.link/u/8veQoUxF');
  await expect(page.locator('.zelle-email')).toHaveText('mpdginc@gmail.com');
  await expect(page.locator('.payment-card-chip')).toHaveCount(6);
  await expect(page.locator('.payment-brand-visa')).toHaveCount(1);
  await expect(page.locator('.payment-brand-mastercard')).toHaveCount(1);
  await expect(page.locator('.payment-brand-amex')).toHaveCount(1);
  await expect(page.locator('.payment-brand-discover')).toHaveCount(1);
  await expect(page.locator('.payment-brand-jcb')).toHaveCount(1);
  await expect(page.locator('.payment-brand-unionpay')).toHaveCount(1);
});


test('Square wallets and Zelle instructions are present and readable',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('[data-card-id="give"] .card-action').click();
  await expect(page.locator('.payment-wallet-applepay')).toHaveCount(1);
  await expect(page.locator('.payment-wallet-googlepay')).toHaveCount(1);
  await expect(page.locator('.payment-wallet-cashapp')).toContainText('Cash App Pay');
  await expect(page.locator('.zelle-title')).toHaveText('Cómo ofrendar con Zelle®');
  await expect(page.locator('.zelle-steps li')).toHaveCount(5);
  await expect(page.locator('.zelle-email')).toHaveText('mpdginc@gmail.com');
  await expect(page.locator('.copy-button')).toHaveText('Copiar correo');
});

test('English giving instructions translate correctly',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('#language-toggle').click();
  await page.locator('[data-card-id="give"] .card-action').click();
  await expect(page.locator('.zelle-title')).toHaveText('How to give with Zelle®');
  await expect(page.locator('.copy-button')).toHaveText('Copy email');
  await expect(page.locator('.payment-wallet-cashapp')).toContainText('Cash App Pay');
});


test('social modal includes Facebook, Instagram, YouTube and TikTok brand links',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('[data-card-id="social"] .card-action').click();
  await expect(page.locator('.social-facebook')).toHaveAttribute('href','https://www.facebook.com/mpdginc');
  await expect(page.locator('.social-instagram')).toHaveAttribute('href','https://www.instagram.com/mpdginc/');
  await expect(page.locator('.social-youtube')).toHaveAttribute('href','https://www.youtube.com/@ministerioplenituddegracia');
  await expect(page.locator('.social-tiktok')).toHaveAttribute('href','https://www.tiktok.com/@mpdginc');
  await expect(page.locator('.social-facebook .social-brand-facebook')).toHaveCount(1);
  await expect(page.locator('.social-instagram .social-brand-instagram')).toHaveCount(1);
  await expect(page.locator('.social-youtube .social-brand-youtube')).toHaveCount(1);
  await expect(page.locator('.social-tiktok .social-brand-tiktok')).toHaveCount(1);
});

test('social card subtitle includes TikTok in both languages',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('[data-card-id="social"] .card-subtitle')).toContainText('TikTok');
  await page.locator('#language-toggle').click();
  await expect(page.locator('[data-card-id="social"] .card-subtitle')).toContainText('TikTok');
});


test('shared runtime version is loaded and matches config',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  const values=await page.evaluate(async()=>{
    const response=await fetch('data/config.json',{cache:'no-store'});
    const config=await response.json();
    return {
      runtime:window.__MPDGI_HUB_VERSION__,
      source:globalThis.MPDGI_HUB_VERSION,
      config:config.version
    };
  });
  expect(values.runtime).toBe('1.6.3');
  expect(values.source).toBe('1.6.3');
  expect(values.config).toBe('1.6.3');
});

test('accessibility labels switch with language',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('.skip-link')).toHaveText('Saltar al contenido');
  await expect(page.locator('.visit-info')).toHaveAttribute('aria-label','Información de la iglesia');
  await page.locator('#language-toggle').click();
  await expect(page.locator('.skip-link')).toHaveText('Skip to content');
  await expect(page.locator('.visit-info')).toHaveAttribute('aria-label','Church information');
  await expect(page.locator('.church-logo')).toHaveAttribute('alt','Official logo of Ministerio Plenitud de Gracia');
});

test('cached shell reloads offline in Chromium',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','Offline PWA cache assertion is Chromium-only in CI.');
  await page.goto('/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:10000});
  await page.reload({waitUntil:'networkidle'});
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-card-id]')).toHaveCount(8);
  await expect(page.locator('#offline-badge')).toBeVisible();
  await expect(page.locator('[data-card-id="social"] .card-subtitle')).toContainText('TikTok');
  await context.setOffline(false);
});


test('payment logos use known-good inline SVG rendering',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('[data-card-id="give"] .card-action').click();
  await expect(page.locator('.payment-card-chip svg')).toHaveCount(6);
  await expect(page.locator('.payment-wallet-applepay svg')).toHaveCount(1);
  await expect(page.locator('.payment-wallet-googlepay svg')).toHaveCount(1);
  await expect(page.locator('.payment-wallet-cashapp svg')).toHaveCount(1);
  const boxes=await page.locator('.payment-card-chip svg,.payment-wallet-chip svg').evaluateAll(nodes=>nodes.map(n=>{
    const r=n.getBoundingClientRect();return {w:r.width,h:r.height};
  }));
  expect(boxes.length).toBeGreaterThanOrEqual(9);
  expect(boxes.every(b=>b.w>10&&b.h>10)).toBeTruthy();
});


test('release-pinned assets prevent mixed-version CSS and JS',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute('href','css/style-v1.6.3.css');
  await expect(page.locator('script[src="js/version-v1.6.3.js"]')).toHaveCount(1);
  await expect(page.locator('script[src="js/app-v1.6.3.js"]')).toHaveCount(1);
});

test('church address opens directions and translates its accessibility label',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  const address=page.locator('#address-link');
  await expect(address).toHaveAttribute('href',/google\.com\/maps\/dir\/\?api=1/);
  await expect(address).toHaveAttribute('href',/1045/);
  await expect(address).toHaveAttribute('aria-label','Abrir indicaciones para llegar a Ministerio Plenitud de Gracia');
  await page.locator('#language-toggle').click();
  await expect(address).toHaveAttribute('aria-label','Get directions to Ministerio Plenitud de Gracia');
});

test('copyright year range never goes below the 2026 launch year',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  const ranges=await page.evaluate(()=>[
    window.__MPDGI_COPYRIGHT_RANGE__(2020),
    window.__MPDGI_COPYRIGHT_RANGE__(2026),
    window.__MPDGI_COPYRIGHT_RANGE__(2027),
    window.__MPDGI_COPYRIGHT_RANGE__(2031),
    window.__MPDGI_COPYRIGHT_RANGE__(Number.NaN)
  ]);
  expect(ranges).toEqual(['2026','2026','2026–2027','2026–2031','2026']);
  await expect(page.locator('#copyright-text')).toContainText('2026');
});

test('stored version mismatch repairs old MPDGI caches',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker?.controller),null,{timeout:10000});
  await page.evaluate(async()=>{
    localStorage.setItem('mpdgiHubVersion','1.4.5');
    await caches.open('mpdgi-hub-shell-1.4.5');
    await caches.open('mpdgi-hub-runtime-1.4.6-stale');
  });
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(async()=>{
    const keys=await caches.keys();
    return !keys.includes('mpdgi-hub-shell-1.4.5')&&!keys.includes('mpdgi-hub-runtime-1.4.6-stale');
  },null,{timeout:10000});
  const keys=await page.evaluate(()=>caches.keys());
  expect(keys).toContain('mpdgi-hub-shell-1.6.3');
});

test('payment logos remain stable across repeated Chromium reopen cycles',async({context})=>{
  for(let i=0;i<5;i++){
    const p=await context.newPage();
    await p.goto('/',{waitUntil:'networkidle'});
    await p.locator('[data-card-id="give"] .card-action').click();
    await expect(p.locator('.payment-card-chip svg')).toHaveCount(6);
    await expect(p.locator('.payment-wallet-applepay svg')).toHaveCount(1);
    await expect(p.locator('.payment-wallet-googlepay svg')).toHaveCount(1);
    const good=await p.locator('.payment-card-chip svg,.payment-wallet-chip svg').evaluateAll(nodes=>nodes.every(n=>{
      const r=n.getBoundingClientRect();return r.width>10&&r.height>10;
    }));
    expect(good).toBeTruthy();
    await p.close();
  }
});


test('About modal renders automatic copyright instead of the year placeholder',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('[data-card-id="about"] .card-action').click();
  const modal=page.locator('#modal-body');
  await expect(modal).toContainText('© 2026 Ministerio Plenitud de Gracia');
  await expect(modal).not.toContainText('{year}');
  await page.locator('#modal-close').click();
  await page.locator('#language-toggle').click();
  await page.locator('[data-card-id="about"] .card-action').click();
  await expect(page.locator('#modal-body')).not.toContainText('{year}');
});


test('NFC source is captured, URL is cleaned and collector receives separated attribution fields',async({page})=>{
  const events=[];
  await page.addInitScript(()=>{globalThis.__MPDGI_ANALYTICS_FORCE__=true;});
  await page.route('https://mpdgi-stats.pages.dev/api/collect',async route=>{
    const body=route.request().postData();
    if(body)events.push(JSON.parse(body));
    await route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
  });
  await page.goto('/?src=nfc&campaign=credential-test',{waitUntil:'networkidle'});
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(()=>events.some(e=>e.event_type==='session_start')).toBeTruthy();
  const session=events.find(e=>e.event_type==='session_start');
  expect(session.acquisition_source).toBe('nfc');
  expect(session.acquisition_campaign).toBe('credential-test');
  expect(session.session_entry).toBe('nfc');
  expect(session.session_campaign).toBe('credential-test');
  expect(session.display_mode).toBe('browser');
  expect(session.visitor_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(session.session_id).toMatch(/^[0-9a-f-]{36}$/);
});

test('first acquisition source stays immutable when a later attributed entry uses another source',async({page})=>{
  const events=[];
  await page.addInitScript(()=>{globalThis.__MPDGI_ANALYTICS_FORCE__=true;});
  await page.route('https://mpdgi-stats.pages.dev/api/collect',async route=>{
    const body=route.request().postData();
    if(body)events.push(JSON.parse(body));
    await route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
  });
  await page.goto('/?src=qr',{waitUntil:'networkidle'});
  events.length=0;
  await page.goto('/?src=nfc&campaign=leaders-meeting',{waitUntil:'networkidle'});
  await expect.poll(()=>events.some(e=>e.event_type==='session_start')).toBeTruthy();
  const session=events.find(e=>e.event_type==='session_start');
  expect(session.acquisition_source).toBe('qr');
  expect(session.acquisition_campaign).toBe('');
  expect(session.session_entry).toBe('nfc');
  expect(session.session_campaign).toBe('leaders-meeting');
});

test('cookie continuity restores anonymous acquisition after local storage is cleared for an installed-PWA style launch',async({page,context})=>{
  const events=[];
  await page.addInitScript(()=>{globalThis.__MPDGI_ANALYTICS_FORCE__=true;});
  await page.route('https://mpdgi-stats.pages.dev/api/collect',async route=>{
    const body=route.request().postData();
    if(body)events.push(JSON.parse(body));
    await route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
  });
  await page.goto('/?src=nfc',{waitUntil:'networkidle'});
  const firstVisitor=await page.evaluate(()=>localStorage.getItem('mpdgiAnalyticsVisitorId'));
  await page.evaluate(()=>localStorage.clear());
  await page.close();

  const p=await context.newPage();
  await p.addInitScript(()=>{
    globalThis.__MPDGI_ANALYTICS_FORCE__=true;
    const native=window.matchMedia.bind(window);
    window.matchMedia=query=>query==='(display-mode: standalone)'
      ? {matches:true,media:query,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return false;}}
      : native(query);
  });
  await p.route('https://mpdgi-stats.pages.dev/api/collect',async route=>{
    const body=route.request().postData();
    if(body)events.push(JSON.parse(body));
    await route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
  });
  events.length=0;
  await p.goto('/',{waitUntil:'networkidle'});
  await expect.poll(()=>events.some(e=>e.event_type==='session_start')).toBeTruthy();
  const session=events.find(e=>e.event_type==='session_start');
  expect(session.visitor_id).toBe(firstVisitor);
  expect(session.acquisition_source).toBe('nfc');
  expect(session.session_entry).toBe('pwa');
  expect(session.session_campaign).toBe('');
  expect(session.display_mode).toBe('pwa');
});

test('analytics action markers cover core navigation without exposing Stats in the public Hub UI',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('text=MPDGI Stats')).toHaveCount(0);
  await expect(page.locator('[data-card-id="members"] .card-action')).toHaveAttribute('data-analytics-action','card_members');
  await expect(page.locator('#address-link')).toHaveAttribute('data-analytics-action','directions');
  await page.locator('[data-card-id="give"] .card-action').click();
  await expect(page.locator('.tithely-button')).toHaveAttribute('data-analytics-action','give_tithely');
  await expect(page.locator('.square-button')).toHaveAttribute('data-analytics-action','give_square');
  await expect(page.locator('.copy-button')).toHaveAttribute('data-analytics-action','give_zelle_copy');
});


test('switching from browser use to installed-PWA mode starts a PWA session without changing acquisition',async({page,context})=>{
  const events=[];
  await page.addInitScript(()=>{globalThis.__MPDGI_ANALYTICS_FORCE__=true;});
  await page.route('https://mpdgi-stats.pages.dev/api/collect',async route=>{
    const body=route.request().postData();if(body)events.push(JSON.parse(body));
    await route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
  });
  await page.goto('/?src=link',{waitUntil:'networkidle'});
  const visitor=await page.evaluate(()=>localStorage.getItem('mpdgiAnalyticsVisitorId'));
  const saved=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
  await page.close();

  const p=await context.newPage();
  await p.addInitScript(state=>{
    globalThis.__MPDGI_ANALYTICS_FORCE__=true;
    for(const [key,value] of Object.entries(state))localStorage.setItem(key,value);
    const native=window.matchMedia.bind(window);
    window.matchMedia=query=>query==='(display-mode: standalone)'
      ? {matches:true,media:query,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return false;}}
      : native(query);
  },saved);
  await p.route('https://mpdgi-stats.pages.dev/api/collect',async route=>{
    const body=route.request().postData();if(body)events.push(JSON.parse(body));
    await route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}});
  });
  events.length=0;
  await p.goto('/',{waitUntil:'networkidle'});
  await expect.poll(()=>events.some(e=>e.event_type==='session_start')).toBeTruthy();
  const session=events.find(e=>e.event_type==='session_start');
  expect(session.visitor_id).toBe(visitor);
  expect(session.acquisition_source).toBe('link');
  expect(session.session_entry).toBe('pwa');
  expect(session.display_mode).toBe('pwa');
});


test('iPadOS desktop-mode Safari is categorized as tablet',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'userAgent',{configurable:true,get:()=> 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'});
    Object.defineProperty(navigator,'platform',{configurable:true,get:()=> 'MacIntel'});
    Object.defineProperty(navigator,'maxTouchPoints',{configurable:true,get:()=> 5});
  });
  await page.goto('/',{waitUntil:'networkidle'});
  const category=await page.evaluate(()=>window.__MPDGI_ANALYTICS__.deviceCategory());
  expect(category).toBe('tablet');
});


test('About exposes attributed Share Hub and changelog-derived Last Updated metadata',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.locator('[data-card-id="about"] .card-action').click();
  const modal=page.locator('#modal-body');
  await expect(modal).toContainText(/Última actualización|Last updated/);
  await expect(modal.locator('button.share-hub')).toHaveCount(1);
  const appSource=await page.request.get('/js/app-v1.6.3.js').then(r=>r.text());
  expect(appSource).toContain('https://hub.mpdgi.org/?src=link');
  expect(appSource).toContain('navigator.share');
});

test('social preview raster and maskable PWA icon have valid metadata and dimensions',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content','https://hub.mpdgi.org/assets/social/mpdgi-hub-share.png');
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content','image/png');
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content','https://hub.mpdgi.org/assets/social/mpdgi-hub-share.png');
  for(const [path,width,height] of [
    ['/assets/social/mpdgi-hub-share.png',1200,630],
    ['/assets/icons/icon-512-maskable.png',512,512]
  ]){
    const response=await page.request.get(path);
    expect(response.ok()).toBeTruthy();
    const png=await response.body();
    expect(png.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(width);
    expect(png.readUInt32BE(20)).toBe(height);
  }
  const manifest=await page.request.get('/manifest.json').then(r=>r.json());
  expect(manifest.icons.some(icon=>icon.src==='assets/icons/icon-512-maskable.png'&&icon.purpose==='maskable')).toBeTruthy();
});

test('keyboard-accessible primary navigation and modal focus',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  const give=page.locator('[data-card-id="give"] .card-action');
  await give.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#modal-close')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(give).toBeFocused();
});

test('high-contrast accessibility preferences preserve usable controls',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('[data-card-id]')).toHaveCount(8);
  const forced=await page.evaluate(()=>({
    enabled:matchMedia('(forced-colors: active)').matches,
    borderStyle:getComputedStyle(document.querySelector('.hub-card')).borderStyle,
    borderWidth:getComputedStyle(document.querySelector('.hub-card')).borderTopWidth,
    buttonName:document.querySelector('#language-toggle').getAttribute('aria-label')
  }));
  expect(forced.enabled).toBe(true);
  expect(forced.borderStyle).toBe('solid');
  expect(parseFloat(forced.borderWidth)).toBeGreaterThanOrEqual(1);
  expect(forced.buttonName.length).toBeGreaterThan(0);
  await page.emulateMedia({forcedColors:'none',contrast:'more'});
  expect(await page.evaluate(()=>matchMedia('(prefers-contrast: more)').matches)).toBe(true);
  await expect(page.locator('#developer-credit a')).toHaveAttribute('href','https://rmcard.pages.dev/');
});
