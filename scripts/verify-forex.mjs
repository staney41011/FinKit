import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import vm from 'node:vm';

const read=path=>readFile(new URL('../site/'+path,import.meta.url),'utf8');
const [fx,home,app,landing,sitemap]=await Promise.all([
 read('calculators/currency-converter.html'),read('index.html'),read('app.js'),
 read('tools/foreign-exchange-calculator.html'),read('sitemap.xml')
]);
const scripts=[...fx.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
const code=scripts.at(-1)?.[1];
assert.ok(code,'Currency calculator must contain its executable script');
new vm.Script(code,{filename:'currency-converter.html'});

const where=code.indexOf("for(const sel of ['from','to'])");
assert.ok(where>0,'Currency calculator initialization marker missing');
const pureCode=code.slice(0,where)+"window.FinKitFX={crossRate,convert,normalizeEr,normalizeFrankfurter};})();";
const isolated={window:{},Intl,Date,Object,Math,Number,console};
vm.runInNewContext(pureCode,isolated,{timeout:1000});
const fxCalc=isolated.window.FinKitFX;
const base={USD:1,TWD:32,JPY:150,EUR:.85,GBP:.75,KRW:1300};
assert.equal(fxCalc.crossRate(base,'USD','TWD'),32);
assert.equal(fxCalc.crossRate(base,'TWD','JPY'),150/32);
assert.equal(fxCalc.crossRate(base,'JPY','USD'),1/150);
assert.equal(fxCalc.crossRate(base,'USD','USD'),1);
assert.equal(fxCalc.crossRate(base,'USD','XXX'),null);
assert.equal(fxCalc.convert(1000,base,'TWD','JPY'),4687.5);
assert.equal(fxCalc.convert(1000,base,'USD','TWD'),32000);
assert.equal(fxCalc.convert(-1,base,'USD','TWD'),null);
const er=fxCalc.normalizeEr({result:'success',rates:base,time_last_update_utc:'Tue, 13 Oct 2026 00:00:01 +0000'});
assert.equal(er.rates.TWD,32);
assert.equal(er.source,'ExchangeRate-API');
const ff=fxCalc.normalizeFrankfurter([
 {base:'USD',quote:'TWD',rate:32,date:'2026-10-13'},
 {base:'USD',quote:'JPY',rate:150,date:'2026-10-13'},
 {base:'USD',quote:'EUR',rate:.85,date:'2026-10-13'}
]);
assert.equal(ff.rates.TWD,32);
assert.equal(ff.source,'Frankfurter');
assert.equal(ff.asOf,'2026-10-13');
assert.throws(()=>fxCalc.normalizeFrankfurter([{base:'USD',quote:'EUR',rate:.85,date:'2026-10-13'}]));
assert.throws(()=>fxCalc.normalizeEr({result:'error'}));

function mockBrowser(fetchImpl,cachedValue){
 const dom=new Map(),quick=[];
 function element(id){
  if(!dom.has(id)){
   const el={
    id,value:'',textContent:'',disabled:false,children:[],listeners:{},dataset:{},className:'',
    attributes:{},classList:{toggle(){}},
    append(...items){this.children.push(...items)},
    replaceChildren(){this.children=[]},
    setAttribute(key,value){this.attributes[key]=value},
    addEventListener(name,fn){this.listeners[name]=fn},
    fire(name){this.listeners[name]?.()}
   };
   if(id==='amount')el.value='1000';
   if(id==='manualRate')el.value='';
   dom.set(id,el);
  }
  return dom.get(id);
 }
 for(const pair of ['USD,TWD','TWD,JPY','JPY,USD','EUR,TWD']){
   const el=element('quick:'+pair);el.dataset.pair=pair;quick.push(el);
 }
 let store=cachedValue?JSON.stringify(cachedValue):null;
 const ctx={window:{},document:{getElementById:element,createElement:()=>({
   value:'',textContent:'',children:[],append(...items){this.children.push(...items)},
   colSpan:1
 }),querySelectorAll(selector){assert.equal(selector,'[data-pair]');return quick}},
 localStorage:{getItem(){return store},setItem(k,v){store=v}},
 fetch:fetchImpl,Date,Math,Number,Object,Intl,AbortController,setTimeout,clearTimeout,console};
 vm.runInNewContext(code,ctx,{timeout:1500});
 return {dom:element,quick,ctx,getCache:()=>store};
}
async function flush(){for(let i=0;i<15;i++)await Promise.resolve();}
const live=mockBrowser(async url=>({ok:true,json:async()=>({
 result:'success',rates:base,time_last_update_utc:'Tue, 13 Oct 2026 00:00:01 +0000'
})}));
await flush();
assert.match(live.dom('converted').textContent,/32,000/);
assert.match(live.dom('sourceInfo').textContent,/ExchangeRate-API/);
assert.ok(live.dom('basket').children.length>=4);
live.quick[1].fire('click');
assert.equal(live.dom('from').value,'TWD');
assert.equal(live.dom('to').value,'JPY');
assert.match(live.dom('converted').textContent,/4,687\.5/);
live.dom('swap').fire('click');
assert.equal(live.dom('from').value,'JPY');
assert.equal(live.dom('to').value,'TWD');
live.dom('manualMode').fire('click');
live.dom('manualRate').value='0.21';
live.dom('manualRate').fire('input');
assert.match(live.dom('converted').textContent,/210/);
assert.match(live.dom('sourceInfo').textContent,/手動輸入/);

let attempts=0;
const fallback=mockBrowser(async url=>{
 attempts++;
 if(url.includes('open.er-api.com'))throw Error('blocked');
 return{ok:true,json:async()=>[
 {base:'USD',quote:'TWD',rate:32,date:'2026-10-12'},
 {base:'USD',quote:'JPY',rate:150,date:'2026-10-12'},
 {base:'USD',quote:'EUR',rate:.85,date:'2026-10-12'}
 ]};
});
await flush();
assert.equal(attempts,2,'Should use second public rate provider if primary fails');
assert.match(fallback.dom('sourceInfo').textContent,/Frankfurter/);
const cached=mockBrowser(async()=>{throw Error('offline')},{
 rates:base,source:'Cached reference',asOf:'2026-10-11',fetchedAt:Date.now()-3*86400000
});
await flush();
assert.match(cached.dom('converted').textContent,/32,000/);
assert.match(cached.dom('status').textContent,/快取/);
assert.match(cached.dom('sourceInfo').textContent,/快取可能過期/);
const empty=mockBrowser(async()=>{throw Error('offline')},null);
await flush();
assert.equal(empty.dom('converted').textContent,'—');
assert.match(empty.dom('status').textContent,/手動/);

assert.ok(home.includes("window.location.assign('/calculators/currency-converter.html')"),'Homepage FX tool must open standalone calculator');
assert.ok(app.includes("window.location.assign('/calculators/currency-converter.html')"),'Source app JS must have same forex routing');
assert.ok(home.includes('href="/calculators/currency-converter.html"'),'Static homepage must link to calculator');
assert.ok(!home.includes('內容與工具分離'),'Removed homepage section came back');
assert.ok(!/<footer class="footer">[\s\S]*?<a /i.test(home),'Homepage bottom-right footer links came back');
assert.ok(landing.includes('href="/calculators/currency-converter.html"'),'SEO landing action is not pointing to live FX tool');
assert.ok(sitemap.includes('https://finkit.top/calculators/currency-converter.html'),'Sitemap missing FX tool');
assert.ok(!/pagead2\.googlesyndication\.com|adsbygoogle/.test(fx),'Calculator-only page must not include AdSense serving script');
console.log('FinKit FX passed: USD/TWD, TWD/JPY, swap, manual bank quote, primary/secondary API, cache fallback, no-data safety, homepage cleanup and SEO links.');
