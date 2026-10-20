import {readFile} from 'node:fs/promises';
import {strict as assert} from 'node:assert';
import vm from 'node:vm';

const site=new URL('../site/',import.meta.url);
const read=path=>readFile(new URL(path,site),'utf8');
const [home,app,calc,toolIndex,mortgageLanding,sitemap,css]=await Promise.all([
 read('index.html'),read('app.js'),read('calculators/mortgage-stress-test.html'),
 read('tools/index.html'),read('tools/mortgage-calculator.html'),
 read('sitemap.xml'),read('styles.css')
]);

assert.ok(home.includes('id="homeToolSearch"'),'Search-first homepage missing');
assert.ok(home.includes('id="toolGrid"'),'Interactive tool grid missing');
assert.ok(home.includes('class="fallback-grid"'),'Readable no-JS fallback missing');
assert.ok(home.includes('href="/calculators/mortgage-stress-test.html"'),'Mortgage tool quick link missing');
assert.ok(!home.includes('內容與工具分離'),'Previously removed homepage section returned');
assert.ok(!home.includes('首頁現在本身就是完整網站'),'Outdated technical copy visible to readers');
assert.ok(app.includes("id=\"copyResults\"") && app.includes("id=\"resetTool\"") && app.includes("id=\"shareTool\""),'Missing reset, copy or share features');
assert.ok(app.includes("shareTool").valueOf(),'Share tool handler missing');
assert.ok(app.includes("aliases={"),'User-need-based search aliases missing');
assert.ok(app.includes("if(h.tagName==='A')e.preventDefault()"),'Clickable link navigation must be intercepted');
assert.ok(app.includes("location.origin+'/?tool='"),'Deep links should include tool identifier only');
assert.ok(!app.includes("location.origin+'/?tool='+encodeURIComponent(id)+'&'"),'Shared URLs must not contain user amounts');
assert.ok(home.includes(app.trim()),'Inline app is different from maintained app source');
assert.ok(home.includes('ItemList'),'Crawlable tool structured list missing');
assert.ok(css.includes('.quick-tools'),'Standalone stylesheet missing interaction styles');
assert.ok(mortgageLanding.includes('href="/calculators/mortgage-stress-test.html"'),'Mortgage docs must link to actual calculator');
assert.ok(toolIndex.includes('href="/calculators/mortgage-stress-test.html"'),'Tool index not linked');
assert.ok(sitemap.includes('<loc>https://finkit.top/calculators/mortgage-stress-test.html</loc>'),'Sitemap missing mortgage comparison');
assert.ok(!/pagead2\.googlesyndication\.com|adsbygoogle/i.test(calc),'Never inject ads into an unapproved calculator screen');

for(const [i,script] of [...home.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].entries()){
 if(script[0].includes('application/ld+json')) {JSON.parse(script[1]);continue}
 new vm.Script(script[1],{filename:'index inline script '+i});
}
const scripts=[...calc.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
const js=scripts.at(-1)?.[1];
assert.ok(js,'Standalone mortgage script missing');
new vm.Script(js,{filename:'mortgage comparison calculator'});
const p=js.indexOf('function pmt('),end=js.indexOf('window.FinKitMortgage=',p);
assert.ok(p>=0&&end>p,'Mortgage finance functions missing');
const {pmt,scenario}=vm.runInNewContext(js.slice(p,end)+'({pmt,scenario})',{Math,Number,NaN});
const close=(value,expected,tolerance,label)=>assert.ok(Math.abs(value-expected)<tolerance,label+': got '+value+', expected '+expected);
close(pmt(1e7,2.5,360),39512.09,.1,'30yr 2.5%');
close(pmt(1e7,3.5,360),44904.47,.1,'30yr 3.5%');
close(pmt(120000,0,12),10000,.01,'zero interest');
const base=scenario(1e7,2.5,30,0),higher=scenario(1e7,3.5,30,0);
const grace=scenario(1e7,2.5,30,3),graceHigher=scenario(1e7,3.5,30,3);
close(base.after,39512.09,.1,'baseline monthly');
close(higher.after-base.after,5392.38,.2,'rate-rise monthly burden');
close(grace.during,20833.33,.1,'interest-only period');
close(grace.after,42474.88,.1,'remaining 27y amortization');
close(graceHigher.after,47752.72,.1,'stress after grace');
assert.ok(grace.interest>base.interest,'Grace period must increase total interest with same interest rate');
assert.equal(scenario(1e7,2.5,30,30),null,'Grace must be less than total term');
assert.equal(scenario(-1,2.5,30,3),null,'Negative principal invalid');
assert.ok(Number.isFinite(grace.interest),'Total interest should be finite');
console.log('User-first audit passed: homepage search, quick tools, copy/reset/share, crawlable links, calculator math and grace-period comparisons.');
