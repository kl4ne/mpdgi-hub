import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const canonical='https://hub.mpdgi.org/';
const index=read('index.html');
const robots=read('robots.txt');
const sitemap=read('sitemap.xml');

assert.ok(index.includes('<link rel="canonical" href="'+canonical+'">'),'Homepage canonical mismatch');
assert.ok(robots.split(/\r?\n/).includes('User-agent: *'),'Missing robots crawler directive');
assert.ok(robots.split(/\r?\n/).includes('Allow: /'),'Missing robots allow directive');
assert.ok(robots.split(/\r?\n/).includes('Sitemap: '+canonical+'sitemap.xml'),'Missing production sitemap directive');
assert.doesNotMatch(robots,/^Disallow:/mi,'Unexpected robots disallow directive');
assert.match(sitemap,/^<\?xml version="1\.0" encoding="UTF-8"\?>/,'Sitemap XML declaration missing');
assert.ok(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'),'Missing sitemap namespace');
const locations=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
assert.deepEqual(locations,[canonical],'Sitemap must contain only the canonical public Hub homepage');
assert.equal(read('CNAME').trim(),new URL(canonical).hostname,'Custom domain mismatch');
console.log('Public robots/sitemap canonical metadata verified');
