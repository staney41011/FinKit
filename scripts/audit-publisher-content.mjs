import {readFile,readdir} from 'node:fs/promises';
import {strict as assert} from 'node:assert';
const site=new URL('../site/',import.meta.url);
const read=path=>readFile(new URL(path,site),'utf8');
const slugs=['dca-investing-guide','emergency-fund-guide','retirement-withdrawal-guide','fcn-risk-guide','mortgage-affordability-guide','asset-allocation-guide'];
function visible(s){return s.replace(/<style[\s\S]*?<\/style>/g,'').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
let count=0;
const articleDates=new Map();
for(const slug of slugs){
 const s=await read('learn/'+slug+'.html');
 const length=visible(s).length;
 assert.ok(length>=980,slug+' needs more useful explanation: '+length);
 assert.ok(s.includes('<table')&&s.includes('</table>'),slug+' needs a reproducible comparison');
 assert.ok(s.includes('href="/?tool='),slug+' must link to a working calculator');
 const modified=s.match(/"dateModified":"(2026-\d{2}-\d{2})"/)?.[1];
 assert.ok(modified && modified>='2026-10-16',slug+' needs a current and valid revision date');
 articleDates.set(slug,modified);
 count+=length;
}
for(const name of ['about.html','editorial-policy.html','methodology.html']){
 const s=await read(name);
 assert.ok(visible(s).length>=650,name+' needs a substantive methodology or disclosure');
}
const sitemap=await read('sitemap.xml');
for(const slug of slugs)assert.ok(sitemap.includes('<loc>https://finkit.top/learn/'+slug+'.html</loc><lastmod>'+articleDates.get(slug)+'</lastmod>'),slug+' sitemap lastmod does not match article date');
const home=await read('index.html');
assert.ok(home.includes('class="app-shell"')&&home.includes('class="fallback-grid"'),'Homepage stability regression');
assert.ok(!home.includes('內容與工具分離'),'Previously removed homepage section returned');
assert.ok((await read('ads.txt')).includes('pub-4463068342710380'),'Publisher ads.txt missing');
let flagged=[];
async function scan(rel){
 for(const item of await readdir(new URL(rel,site),{withFileTypes:true})){
  const path=rel+item.name;
  if(item.isDirectory())await scan(path+'/');
  else if(path.endsWith('.html')){
   const s=await read(path);
   if(/<script[^>]+src=["'][^"']*pagead2\.googlesyndication\.com|adsbygoogle\.push\s*\(/i.test(s))flagged.push(path);
  }
 }
}
await scan('');
assert.deepEqual(flagged,[],'Active AdSense ad code should not be installed before approval');
console.log('Editorial quality guard passed: six reviewed case guides ('+count+' visible chars), publisher transparency, sitemap freshness and ad-code safety. This check is NOT Google AdSense approval.');
