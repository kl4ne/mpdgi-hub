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
  await expect(page.locator('#developer-credit')).toContainText('Roberto S. Macfie');
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
  expect(values.runtime).toBe('1.4.5');
  expect(values.source).toBe('1.4.5');
  expect(values.config).toBe('1.4.5');
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
