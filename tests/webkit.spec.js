const {test,expect}=require('@playwright/test');

test('WebKit mobile layout stays compact and usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-card-id]')).toHaveCount(8);
  const dims=await page.evaluate(()=>({innerWidth:window.innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  expect(dims.scrollWidth).toBeLessThanOrEqual(dims.innerWidth+1);
  expect(errors).toEqual([]);
});

test('WebKit language and accessibility labels switch correctly',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.skip-link')).toHaveText('Saltar al contenido');
  await page.locator('#language-toggle').click();
  await expect(page.locator('#language-code')).toHaveText('EN');
  await expect(page.locator('.skip-link')).toHaveText('Skip to content');
  await expect(page.locator('.visit-info')).toHaveAttribute('aria-label','Church information');
});

test('WebKit social modal exposes all official social profiles',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-card-id="social"] .card-action').click();
  await expect(page.locator('.social-facebook')).toHaveAttribute('href','https://www.facebook.com/mpdginc');
  await expect(page.locator('.social-instagram')).toHaveAttribute('href','https://www.instagram.com/mpdginc/');
  await expect(page.locator('.social-youtube')).toHaveAttribute('href','https://www.youtube.com/@ministerioplenituddegracia');
  await expect(page.locator('.social-tiktok')).toHaveAttribute('href','https://www.tiktok.com/@mpdginc');
});

test('WebKit giving modal keeps Square wallets and Zelle instructions',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('[data-card-id="give"] .card-action').click();
  await expect(page.locator('.square-button')).toHaveAttribute('href','https://square.link/u/8veQoUxF');
  await expect(page.locator('.payment-wallet-applepay')).toHaveCount(1);
  await expect(page.locator('.payment-wallet-googlepay')).toHaveCount(1);
  await expect(page.locator('.payment-wallet-cashapp')).toContainText('Cash App Pay');
  await expect(page.locator('.zelle-email')).toHaveText('mpdginc@gmail.com');
});


test('WebKit production exposes directions and automatic copyright',async({page})=>{
  await page.goto('/',{waitUntil:'networkidle'});
  await expect(page.locator('#address-link')).toHaveAttribute('href',/maps/);
  await expect(page.locator('#copyright-text')).toContainText('2026');
});
