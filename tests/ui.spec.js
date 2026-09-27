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

test('service worker registers on localhost',async({page})=>{
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
