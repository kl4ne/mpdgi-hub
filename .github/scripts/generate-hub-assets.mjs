import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630}, deviceScaleFactor:1});
  const svgPath = resolve('assets/social/mpdgi-hub-share.svg');
  await page.goto('file://' + svgPath);
  const artwork = page.locator('svg');
  await artwork.waitFor();
  const box = await artwork.boundingBox();
  if (!box || Math.round(box.width) !== 1200 || Math.round(box.height) !== 630)
    throw new Error('Social artwork must be exactly 1200x630');
  await artwork.screenshot({path:'assets/social/mpdgi-hub-share.png',animations:'disabled'});
  const png = readFileSync('assets/social/mpdgi-hub-share.png');
  if (png.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||png.readUInt32BE(16)!==1200||png.readUInt32BE(20)!==630)
    throw new Error('Generated social PNG failed dimension/signature checks');

  const icon = readFileSync('assets/icons/icon-512.png').toString('base64');
  const mask = await browser.newPage({viewport:{width:512,height:512},deviceScaleFactor:1});
  await mask.setContent('<!doctype html><html><head><style>html,body{margin:0;width:512px;height:512px;background:#071A36}body{display:grid;place-items:center}img{display:block;width:70%;height:70%;object-fit:contain}</style></head><body><img src="data:image/png;base64,'+icon+'" alt=""></body></html>');
  await mask.locator('img').evaluate(img => img.decode());
  await mask.screenshot({path:'assets/icons/icon-512-maskable.png',animations:'disabled'});
  const masked = readFileSync('assets/icons/icon-512-maskable.png');
  if (masked.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||masked.readUInt32BE(16)!==512||masked.readUInt32BE(20)!==512)
    throw new Error('Maskable PNG invalid');
  console.log('Generated social preview 1200x630 and safe-area maskable icon 512x512');
} finally {
  await browser.close();
}
