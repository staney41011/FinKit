import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const root = new URL('../site/', import.meta.url);
const read = path => readFile(new URL(path, root),'utf8');
const errors = [];
const check=(condition,msg)=>{if(!condition)errors.push(msg)};
const paths=[
 'index.html','calculators/overseas-tax.html','learn/index.html',
 'learn/overseas-income-amt-guide.html','learn/overseas-income-amt-examples.html',
 'learn/mortgage-grace-period-payment.html','learn/fund-fee-compounding-20-years.html',
 'learn/taiwan-etf-transaction-cost-example.html','tools/taiwan-overseas-income-tax-calculator.html'
];
const htmls=await Promise.all(paths.map(read));
for(let i=0;i<paths.length;i++){
 const content=htmls[i], path=paths[i];
 check(content.includes('<title>') && content.includes('rel="canonical"'),`SEO metadata missing: ${path}`);
 const ld=[...content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 for(const [,body] of ld){try{JSON.parse(body)}catch(e){errors.push(`Invalid JSON-LD in ${path}: ${e.message}`)}}
 const absolute=[...content.matchAll(/<a\b[^>]*href="(\/[^"#?]*)(?:[?#][^"]*)?"/g)].map(m=>m[1]);
 for(const href of absolute){
  const fp=href.endsWith('/')?href.slice(1)+'index.html':href.slice(1);
  try{await access(new URL(fp,root));}catch{errors.push(`Broken internal link from ${path} to ${href}`)}
 }
}
const home=htmls[0],tax=htmls[1];
check(home.includes('class="fallback-grid"'),'Homepage fallback content must be preserved');
check(home.includes("window.location.assign('/calculators/overseas-tax.html')"),'Embedded tax tool does not route to independent calculator');
check(!/<script[^>]+src=|<link[^>]+rel="stylesheet"/i.test(home),'Homepage has new external startup dependency');
check(tax.includes('綜合所得淨額'),'Tax calculator must include domestic net income');
check(tax.includes('id="scenarioBody"') && tax.includes('scenarioLevels='),'Dynamic overseas-income comparison missing');
check(!home.includes('class="version">'),'Public homepage must not show version badges');
check(!/pagead2\.googlesyndication\.com|adsbygoogle/i.test(tax),'Tax interactive page should not serve ads while review pending');
check(htmls[8].includes('href="/calculators/overseas-tax.html"'),'Tax SEO landing link is outdated');

const scripts=[...tax.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
check(scripts.length>=1,'No calculator script found');
if(scripts.length){
 const src=scripts.at(-1);
 try{new vm.Script(src,{filename:'overseas-tax.html inline code'})}catch(e){errors.push(`Calculator JavaScript parse error: ${e.message}`)}
 const values={net:5000000,foreign:5800000,dividends:0,other:3000000,ordinary:1170400,investmentCredit:0,foreignPaid:130000,deduction:7500000,rate:20};
 const elements=new Map();
 const element=(id)=>{if(!elements.has(id))elements.set(id,{value:String(values[id]??0),hidden:false,textContent:'',addEventListener() {},onclick:null});return elements.get(id)};
 const context={window:{},document:{getElementById:element},Number,Math,Intl,console};
 try{
  vm.runInNewContext(src,context,{timeout:1000});
  const fn=context.window.FinKitAMT;
  assert.equal(typeof fn,'function');
  const actual=fn(values);
  assert.equal(actual.basicIncome,13800000);
  assert.equal(actual.basicTax,1260000);
  assert.equal(actual.gap,89600);
  assert.equal(Math.round(actual.credit),59055);
  assert.equal(Math.round(actual.extra),30545);
  const low=fn({...values,net:2000000,foreign:900000,other:0,ordinary:100000,foreignPaid:0});
  assert.equal(low.inc,0);
  assert.equal(low.basicIncome,2000000);
  const simple=fn({...values,net:2000000,foreign:8000000,other:0,ordinary:200000,foreignPaid:100000});
  assert.equal(simple.basicTax,500000);
  assert.equal(simple.extra,200000);
  const noSourceTax=fn({...values,foreignPaid:0});
  assert.equal(noSourceTax.extra,89600);
  const investmentCreditScenario=fn({...values,investmentCredit:40000});
  assert.equal(Math.round(investmentCreditScenario.credit),32691);
  assert.equal(Math.round(investmentCreditScenario.extra),56909);
  console.log('AMT tests: official case, under-1M threshold, 8M scenario, no credit all pass.');
 }catch(e){errors.push(`AMT scenario tests failed: ${e.message}`)}
}
const homeScripts=[...home.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
for(const [i,s] of homeScripts.entries()){
 if(s.trim().startsWith('{'))continue; // JSON-LD already validated
 try{new vm.Script(s,{filename:`homepage inline ${i}`})}catch(e){errors.push(`Homepage inline script ${i}: ${e.message}`)}
}
const scriptExternal=await read('app.js');
check(scriptExternal.includes("window.location.assign('/calculators/overseas-tax.html')"),'Source app.js route does not match homepage');
const dataExternal=await read('tools-data.js');
check(dataExternal.includes("F('net','綜合所得淨額'"),'Source tax model missing domestic net income');
check(home.includes("F('net','綜合所得淨額'"),'Inline tax model missing domestic net income');

const siteMap=await read('sitemap.xml');
const urls=[...siteMap.matchAll(/<loc>https:\/\/finkit\.top\/([^<]*)<\/loc>/g)].map(m=>m[1]);
check(new Set(urls).size===urls.length,'Duplicate sitemap URL');
for(const path of urls){
 const local=path===''?'index.html':path.endsWith('/')?path+'index.html':path;
 try{await access(new URL(local,root))}catch{errors.push('Sitemap target missing: '+path)}
}
for(const p of paths.slice(1,8)){const target=p.endsWith('/index.html')?p.replace(/index\.html$/,''):p;check(urls.includes(target),'Missing sitemap entry: '+p);}
check(urls.length>=47,'Sitemap lost pages');
const hub=htmls[2];
for(const p of paths.slice(3,8))check(hub.includes('/'+p),'Missing knowledge hub link '+p);

const fee=await read('learn/fund-fee-compounding-20-years.html');
const futureValue=(p,m,annual,years)=>{const r=annual/12,n=years*12;return p*(1+r)**n + m*((1+r)**n-1)/r};
const a=futureValue(1000000,10000,.057,20),b=futureValue(1000000,10000,.042,20);
assert.equal(Math.round(a/10000),758);
assert.equal(Math.round(b/10000),606);
assert.equal(Math.round((a-b)/10000),151);
check(fee.includes('758 萬元')&&fee.includes('606 萬元')&&fee.includes('151 萬元'),'Fee article values do not match the declared assumptions');
console.log(`SEO audit: ${urls.length} sitemap URLs; ${paths.length} key pages; content hub links and case studies checked.`);
if(errors.length){for(const e of errors)console.error('FAIL: '+e);process.exit(1)}
console.log('FinKit content and finance quality audit passed.');
