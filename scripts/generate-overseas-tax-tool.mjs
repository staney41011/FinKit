import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://finkit.top';
const ADSENSE_CLIENT = 'ca-pub-4463068342710380';
const LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const toolsDir = join(publicDir, 'tools');
const learnDir = join(publicDir, 'learn');
const toolPath = join(toolsDir, 'taiwan-overseas-income-tax-calculator.html');
const guidePath = join(learnDir, 'taiwan-overseas-income-tax-guide.html');

const sourceLinks = [
  ['財政部：115年度免稅額、扣除額與課稅級距公告', 'https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=34b463dc8f1b49f29d440d92a6fd5139'],
  ['財政部稅務入口網：最低稅負制與海外所得', 'https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-saving-manual/national/individual-income-tax/6xKrvGR'],
  ['財政部稅務入口網：基本稅額計算', 'https://www.etax.nat.gov.tw/etwmain/alien-tax-service/individual-income-basic-tax/2wAQRlM'],
  ['財政部臺北國稅局：115年度累進稅率', 'https://www.ntbt.gov.tw/multiplehtml/1b82b380e1a34de9afd204d39b007db2'],
  ['財政部稅務入口網：股利合併 8.5% 抵減與 28% 分開計稅', 'https://www.etax.nat.gov.tw/etwmain/alien-tax-service/alien-individual-income-tax/zrgbAb3'],
];

const faq = [
  ['海外所得免稅額到底是 100 萬還是 750 萬？', '兩個數字代表不同規則。全戶全年海外所得未達 100 萬元時，不計入個人基本所得額；達 100 萬元時則全數計入。750 萬元則是計算個人基本稅額時，基本所得額可以先扣除的金額，不是單獨給海外所得的免稅額。'],
  ['海外所得超過 100 萬就一定要繳最低稅負嗎？', '不一定。海外所得達 100 萬元只是進入基本所得額的門檻，還要把綜合所得淨額、分開計稅股利及其他基本所得一起計算，再比較基本稅額與一般所得稅額。'],
  ['個人最低稅負怎麼算？', '115年度個人基本稅額的核心公式為：（基本所得額－750萬元）×20%。若計算出的基本稅額沒有高於一般所得稅額，通常不會因最低稅負再增加稅額。'],
  ['美股賣出獲利算海外所得嗎？', '台灣稅務居民透過海外市場取得的財產交易所得，通常屬海外所得範圍；海外證券交易所得並沒有因為是證券交易就當然免稅。實際所得認定、成本及匯率仍應依申報規定與證明文件判斷。'],
  ['美股股息或海外基金配息也算海外所得嗎？', '若屬中華民國來源所得以外的所得，原則上會涉及海外所得規則。不同商品的所得性質與來源地仍可能不同，正式申報應以所得憑證與稅務規定為準。'],
  ['夫妻的海外所得 100 萬門檻是各算各的嗎？', '不是。個人最低稅負以申報戶為單位判斷，全戶全年海外所得合計達 100 萬元時，應按規定全數計入基本所得額。'],
  ['在國外已經繳過所得稅，台灣還要再繳嗎？', '符合規定的海外已納所得稅可在限額內扣抵基本稅額差額，但必須符合證明文件與扣抵上限規定。本工具不自動假設可全額扣抵。'],
  ['115年度是什麼時候申報？', '115年度就是 2026 年取得的所得，依財政部公告於 116 年（2027 年）5 月辦理綜合所得稅結算申報時適用。'],
  ['這個計算機可以直接拿來報稅嗎？', '不可以。FinKit 用於教育與情境試算，沒有涵蓋所有所得類別、列舉扣除、夫妻各類所得分開計稅、外國稅額扣抵及個案法令適用。正式申報請以財政部系統、核定資料或專業稅務意見為準。'],
];

const toolSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html#webpage`,
      url: `${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html`,
      name: '海外所得稅試算｜100萬、750萬最低稅負 AMT 計算機（115年度）',
      description: '115年度台灣海外所得與最低稅負 AMT 試算，釐清海外所得100萬門檻、750萬基本所得扣除額、20%基本稅率與可容納海外所得空間。',
      inLanguage: 'zh-TW',
      dateModified: LASTMOD,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: [
        { '@type': 'Thing', name: '海外所得' },
        { '@type': 'Thing', name: '最低稅負' },
        { '@type': 'Thing', name: '所得基本稅額' },
        { '@type': 'Thing', name: '美股稅務' },
      ],
      citation: sourceLinks.map(([, url]) => url),
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html#app`,
      name: 'FinKit 海外所得最低稅負 AMT 計算機',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: `${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html`,
      inLanguage: 'zh-TW',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
      featureList: ['115年度綜合所得稅級距', '股利兩制比較', '夫妻薪資分開計稅情境', '最低稅負反推', '海外所得100萬門檻提示'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'FinKit', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '理財工具', item: `${SITE_URL}/tools/` },
        { '@type': 'ListItem', position: 3, name: '海外所得最低稅負試算', item: `${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html` },
      ],
    },
  ],
};

const toolHtml = `<!doctype html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>海外所得稅試算｜100萬、750萬最低稅負 AMT 計算機（115年度/2026）｜FinKit</title>
  <meta name="description" content="115年度海外所得稅與最低稅負 AMT 計算機：輸入薪資、股利與其他所得，自動比較股利計稅方式，反推不增加最低稅負的海外所得參考空間，並一次搞懂100萬與750萬門檻。" />
  <meta name="keywords" content="海外所得,海外所得稅,海外所得100萬,海外所得750萬,最低稅負,AMT,基本所得額,美股稅務,海外所得免稅額,115年度所得稅" />
  <meta name="author" content="FinKit" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta name="google-adsense-account" content="${ADSENSE_CLIENT}" />
  <link rel="canonical" href="${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html" />
  <link rel="icon" href="/icon.png" />
  <link rel="alternate" type="text/plain" href="/llms.txt" title="FinKit AI index" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="zh_TW" />
  <meta property="og:site_name" content="FinKit" />
  <meta property="og:title" content="海外所得最低稅負 AMT 計算機｜115年度 FinKit" />
  <meta property="og:description" content="100萬不是免稅額、750萬也不是海外所得專屬免稅額。用115年度最新參數直接試算。" />
  <meta property="og:url" content="${SITE_URL}/tools/taiwan-overseas-income-tax-calculator.html" />
  <meta property="og:image" content="${SITE_URL}/icon.png" />
  <meta property="og:image:alt" content="FinKit 海外所得最低稅負 AMT 計算機" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="海外所得最低稅負 AMT 計算機｜115年度 FinKit" />
  <meta name="twitter:description" content="釐清海外所得100萬、750萬與20%最低稅負，並反推海外所得參考空間。" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
  <script type="application/ld+json">${JSON.stringify(toolSchema)}</script>
  <style>
    :root{color-scheme:light;--ink:#0f172a;--muted:#64748b;--line:#dbe4ef;--sky:#0369a1;--sky2:#e0f2fe;--green:#047857;--green2:#ecfdf5;--amber:#b45309;--amber2:#fffbeb;--rose:#be123c;--rose2:#fff1f2;--panel:#fff;--bg:#f6f8fb}
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;line-height:1.65}a{color:var(--sky);font-weight:700;text-decoration:none}a:hover{text-decoration:underline}.wrap{width:min(1180px,calc(100% - 32px));margin:auto}.top{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.topin{height:64px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.08rem;color:var(--ink)}.brandmark{width:34px;height:34px;border-radius:10px;background:#0f172a;color:#fff;display:grid;place-items:center}.nav{display:flex;gap:18px;font-size:.88rem}.hero{padding:52px 0 30px}.crumb{font-size:.86rem;color:var(--muted);margin-bottom:18px}.badge{display:inline-flex;align-items:center;gap:6px;border:1px solid #bae6fd;background:#f0f9ff;color:#075985;border-radius:999px;padding:6px 10px;font-size:.78rem;font-weight:800}.hero h1{font-size:clamp(2.15rem,5vw,4rem);line-height:1.08;letter-spacing:-.03em;margin:14px 0 16px;max-width:930px}.lead{font-size:1.08rem;color:#475569;max-width:900px}.answer{margin-top:24px;border:1px solid #bae6fd;background:linear-gradient(135deg,#f0f9ff,#fff);border-radius:18px;padding:22px}.answer strong{color:#075985}.answergrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.answeritem{background:#fff;border:1px solid #dbeafe;border-radius:14px;padding:15px}.answeritem b{display:block;font-size:1.25rem;margin-bottom:5px}.answeritem span{font-size:.86rem;color:var(--muted)}.layout{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(340px,.98fr);gap:22px;align-items:start;padding:14px 0 28px}.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:0 14px 34px rgba(15,23,42,.06)}.cardhd{padding:20px 22px 0}.cardhd h2{margin:0 0 6px;font-size:1.2rem}.cardhd p{margin:0;color:var(--muted);font-size:.9rem}.cardbody{padding:20px 22px 22px}.tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}.tab{border:1px solid var(--line);background:#fff;border-radius:11px;padding:10px;font-weight:800;color:#475569;cursor:pointer}.tab.active{background:#0f172a;border-color:#0f172a;color:#fff}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{display:block}.field span{display:block;font-size:.78rem;font-weight:800;color:#475569;margin:0 0 6px}.field small{display:block;color:#94a3b8;font-size:.72rem;margin-top:5px}.input,.select{width:100%;height:44px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;padding:0 12px;font-size:.95rem;color:var(--ink);outline:none}.input:focus,.select:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.14)}.sectionline{height:1px;background:#eef2f7;margin:18px 0}.checks{display:flex;flex-wrap:wrap;gap:10px}.check{display:flex;align-items:center;gap:7px;font-size:.84rem;color:#475569}.advanced{margin-top:16px;border:1px solid var(--line);border-radius:12px;background:#f8fafc}.advanced summary{cursor:pointer;padding:12px 14px;font-weight:800;font-size:.88rem}.advanced .inside{padding:4px 14px 14px}.notice{border-radius:12px;padding:12px 14px;font-size:.82rem;line-height:1.6;margin-top:14px}.notice.sky{background:#f0f9ff;color:#075985;border:1px solid #bae6fd}.notice.amber{background:var(--amber2);color:#92400e;border:1px solid #fde68a}.results{display:grid;grid-template-columns:1fr 1fr;gap:12px}.result{border:1px solid var(--line);border-radius:14px;padding:16px;background:#fff}.result .k{font-size:.75rem;color:var(--muted);font-weight:800}.result .v{font-size:1.5rem;line-height:1.2;margin-top:7px;font-weight:900;letter-spacing:-.02em}.result .d{font-size:.75rem;color:var(--muted);margin-top:7px}.result.primary{grid-column:1/-1;background:linear-gradient(135deg,#ecfdf5,#fff);border-color:#a7f3d0}.result.primary .v{font-size:2rem;color:var(--green)}.formula{margin-top:14px;background:#0f172a;color:#e2e8f0;border-radius:14px;padding:16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.78rem;overflow:auto}.formula b{color:#7dd3fc}.status{margin-top:12px;border-radius:12px;padding:12px 14px;font-size:.83rem;font-weight:700}.status.good{background:var(--green2);color:#065f46;border:1px solid #a7f3d0}.status.warn{background:var(--amber2);color:#92400e;border:1px solid #fde68a}.content{padding:18px 0 64px}.content section{margin-top:38px}.content h2{font-size:1.65rem;letter-spacing:-.02em;margin-bottom:12px}.content h3{margin:18px 0 8px}.content p,.content li{color:#475569}.twocol{display:grid;grid-template-columns:1fr 1fr;gap:16px}.infobox{background:#fff;border:1px solid var(--line);border-radius:15px;padding:18px}.faq{border-top:1px solid var(--line)}.faq details{border-bottom:1px solid var(--line);padding:14px 0}.faq summary{cursor:pointer;font-weight:850}.faq p{margin:10px 0 0}.sources li{margin:8px 0}.updated{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0 0;color:var(--muted);font-size:.8rem}.footer{border-top:1px solid var(--line);padding:28px 0 44px;color:var(--muted);font-size:.83rem}.hide{display:none!important}@media(max-width:900px){.layout{grid-template-columns:1fr}.nav{display:none}.answergrid{grid-template-columns:1fr}.results{grid-template-columns:1fr}.result.primary{grid-column:auto}.twocol,.grid2{grid-template-columns:1fr}.hero{padding-top:34px}.wrap{width:min(100% - 22px,1180px)}}
  </style>
</head>
<body>
<header class="top"><div class="wrap topin"><a class="brand" href="/"><span class="brandmark">F</span><span>FinKit</span></a><nav class="nav"><a href="/tools/">全部工具</a><a href="/learn/">理財知識</a><a href="#faq">常見問題</a><a href="#sources">官方來源</a></nav></div></header>
<main>
  <section class="hero"><div class="wrap">
    <div class="crumb"><a href="/">FinKit</a> / <a href="/tools/">理財工具</a> / 海外所得最低稅負</div>
    <span class="badge">115年度 / 2026 最新參數</span>
    <h1>海外所得稅試算：一次搞懂 100 萬、750 萬與最低稅負 AMT</h1>
    <p class="lead">這不是把「750 萬」直接當海外所得免稅額的簡化計算。FinKit 會先估一般所得稅額，再依基本所得額與 20% 基本稅率反推海外所得空間；也可以直接輸入你報稅軟體算好的「一般所得稅額」取得更精準的反推結果。</p>
    <div class="answer">
      <strong>先看答案：</strong>海外所得的 100 萬元是「是否計入基本所得額」的門檻；750 萬元是「基本所得額扣除額」。海外所得達 100 萬並不代表一定多繳稅，還要比較基本稅額與一般所得稅額。
      <div class="answergrid">
        <div class="answeritem"><b>100 萬</b><span>全戶海外所得達此金額，原則上全數計入基本所得額</span></div>
        <div class="answeritem"><b>750 萬</b><span>個人基本所得額計算基本稅額前可扣除的金額</span></div>
        <div class="answeritem"><b>20%</b><span>基本所得額超過扣除額後的基本稅率</span></div>
      </div>
    </div>
    <div class="updated"><span>內容更新：${LASTMOD}</span><span>適用：115年度所得（116年 / 2027年5月申報）</span><span>資料來源：財政部、財政部稅務入口網</span></div>
  </div></section>

  <div class="wrap layout" id="calculator">
    <section class="card">
      <div class="cardhd"><h2>輸入你的情境</h2><p>不知道一般所得稅額時用「收入自動估算」；若已有報稅試算結果，直接輸入稅額會更接近實際申報。</p></div>
      <div class="cardbody">
        <div class="tabs"><button class="tab active" data-mode="estimate">收入自動估算</button><button class="tab" data-mode="known">已知一般所得稅額</button></div>
        <div id="estimate-mode">
          <div class="grid2">
            <label class="field"><span>申報身分</span><select class="select" id="status"><option value="single">單身</option><option value="married">已婚夫妻合併申報</option></select></label>
            <label class="field"><span>列舉扣除額（選填）</span><input class="input money-input" id="itemized" inputmode="numeric" value="0" /><small>會自動與標準扣除額擇高。</small></label>
          </div>
          <div class="sectionline"></div>
          <h3>納稅義務人</h3>
          <div class="grid2">
            <label class="field"><span>薪資所得</span><input class="input money-input" id="salary-a" inputmode="numeric" value="1500000" /></label>
            <label class="field"><span>股利所得</span><input class="input money-input" id="dividend-a" inputmode="numeric" value="0" /></label>
            <label class="field"><span>其他綜合所得</span><input class="input money-input" id="other-a" inputmode="numeric" value="0" /><small>例如利息、租賃、執行業務等。</small></label>
            <label class="check"><input type="checkbox" id="age70-a" />本人年滿 70 歲</label>
          </div>
          <div id="spouse-block" class="hide">
            <div class="sectionline"></div><h3>配偶</h3>
            <div class="grid2">
              <label class="field"><span>薪資所得</span><input class="input money-input" id="salary-b" inputmode="numeric" value="0" /></label>
              <label class="field"><span>股利所得</span><input class="input money-input" id="dividend-b" inputmode="numeric" value="0" /></label>
              <label class="field"><span>其他綜合所得</span><input class="input money-input" id="other-b" inputmode="numeric" value="0" /></label>
              <label class="check"><input type="checkbox" id="age70-b" />配偶年滿 70 歲</label>
            </div>
          </div>
          <details class="advanced">
            <summary>進階設定：扶養、其他扣除與投資抵減</summary>
            <div class="inside grid2">
              <label class="field"><span>未滿70歲扶養人數</span><input class="input money-input" id="dependents" inputmode="numeric" value="0" /></label>
              <label class="field"><span>70歲以上直系尊親屬</span><input class="input money-input" id="elderly" inputmode="numeric" value="0" /></label>
              <label class="field"><span>其他特別扣除額合計</span><input class="input money-input" id="other-deduction" inputmode="numeric" value="0" /><small>可填儲蓄、身障、教育、幼兒、長照、租金與基本生活費差額等已確認金額。</small></label>
              <label class="field"><span>投資抵減稅額</span><input class="input money-input" id="investment-credit" inputmode="numeric" value="0" /><small>會降低一般所得稅額，也可能縮小海外所得空間。</small></label>
            </div>
          </details>
          <div class="notice amber">夫妻申報還可能有「各類所得分開計稅」等更多法定計算組合。本頁會比較合併計稅、夫妻薪資分開計稅及股利兩制；若你已有財政部報稅軟體算出的「一般所得稅額」，建議改用右側的已知稅額模式。</div>
        </div>

        <div id="known-mode" class="hide">
          <div class="grid2">
            <label class="field"><span>一般所得稅額</span><input class="input money-input" id="known-tax" inputmode="numeric" value="0" /><small>建議填：綜所稅應納稅額＋股利分開計稅稅額－投資抵減稅額。</small></label>
            <label class="field"><span>綜合所得淨額</span><input class="input money-input" id="known-net" inputmode="numeric" value="0" /></label>
            <label class="field"><span>分開計稅股利及盈餘</span><input class="input money-input" id="known-dividend" inputmode="numeric" value="0" /></label>
          </div>
          <div class="notice sky">這個模式不重新計算綜所稅，只使用你已經確認的一般所得稅額與基本所得組成來反推，適合夫妻申報、扣除額較複雜或已完成報稅試算的人。</div>
        </div>

        <div class="sectionline"></div>
        <div class="grid2">
          <label class="field"><span>其他基本所得</span><input class="input money-input" id="other-basic" inputmode="numeric" value="0" /><small>例如特定保險給付、應計入基本所得的證券交易所得、非現金捐贈等。</small></label>
        </div>
      </div>
    </section>

    <aside class="card">
      <div class="cardhd"><h2>試算結果</h2><p>重點不是把 750 萬直接減掉，而是先找出「你的基本所得總額上限」。</p></div>
      <div class="cardbody">
        <div class="results">
          <div class="result primary"><div class="k">不增加最低稅負的海外所得參考上限</div><div class="v" id="overseas-space">$0</div><div class="d" id="space-detail">輸入資料後自動更新</div></div>
          <div class="result"><div class="k">一般所得稅額</div><div class="v" id="general-tax">$0</div><div class="d" id="tax-method">—</div></div>
          <div class="result"><div class="k">境內基本所得</div><div class="v" id="domestic-basic">$0</div><div class="d">綜合所得淨額＋分開計稅股利＋其他基本所得</div></div>
          <div class="result"><div class="k">基本所得總額上限</div><div class="v" id="basic-ceiling">$7,500,000</div><div class="d">一般所得稅額 ÷ 20% ＋ 750萬</div></div>
          <div class="result"><div class="k">無海外所得時基本稅額</div><div class="v" id="baseline-basic-tax">$0</div><div class="d">先檢查境內項目是否已觸發 AMT</div></div>
        </div>
        <div class="formula" id="formula-box"><b>反推公式</b><br>基本所得上限 = 一般所得稅額 ÷ 20% + 7,500,000<br>海外所得空間 = 基本所得上限 − 境內基本所得</div>
        <div class="status good" id="status-box">目前資料尚未顯示最低稅負補稅壓力。</div>
      </div>
    </aside>
  </div>

  <article class="wrap content">
    <section><h2>海外所得 100 萬與 750 萬，差別在哪？</h2><div class="twocol"><div class="infobox"><h3>100 萬：計入門檻</h3><p>同一申報戶全年海外所得合計未達新臺幣 100 萬元，無須計入個人基本所得額；一旦達到 100 萬元，依規定是把海外所得全數計入，而不是只計超過 100 萬的部分。</p></div><div class="infobox"><h3>750 萬：基本所得扣除額</h3><p>115年度個人基本稅額仍以「基本所得額－750萬元」後乘上 20% 計算。750 萬是整體基本所得的扣除額，因此不能簡化成「每個人有 750 萬海外所得免稅額」。</p></div></div></section>
    <section><h2>FinKit 怎麼反推海外所得空間？</h2><p>當基本稅額剛好等於一般所得稅額時，理論上尚不會因最低稅負增加額外稅負。因此可以把公式反推成：<strong>基本所得總額上限＝一般所得稅額 ÷ 20%＋750萬元</strong>。再扣掉境內已經會進入基本所得額的部分，就得到海外所得的參考空間。</p><p>但若反推出來的空間低於 100 萬元，仍要另外考慮「海外所得未達100萬不計入」這個門檻；本頁會直接顯示「低於100萬」而不是製造一個看似精準的假數字。</p></section>
    <section><h2>115年度（2026）這個工具用了哪些參數？</h2><div class="twocol"><div class="infobox"><ul><li>一般免稅額：每人 101,000 元</li><li>70歲以上適用免稅額：151,500 元</li><li>標準扣除額：單身 136,000 元；夫妻 272,000 元</li><li>薪資所得特別扣除額：每人最高 227,000 元</li></ul></div><div class="infobox"><ul><li>綜所稅級距：61萬 / 138萬 / 277萬 / 519萬</li><li>累進稅率：5% / 12% / 20% / 30% / 40%</li><li>基本所得扣除額：7,500,000 元</li><li>基本稅率：20%</li></ul></div></div></section>
    <section><h2>海外投資人最常忽略的三件事</h2><div class="twocol"><div class="infobox"><h3>海外所得不一定在國稅局下載資料裡</h3><p>海外所得可能不在稽徵機關提供的所得查詢資料中，仍屬自行申報責任。海外券商、基金或境外帳戶有實際所得時，應保存交易、成本與所得證明。</p></div><div class="infobox"><h3>在國外繳稅不代表台灣自動歸零</h3><p>海外已納稅額是否可以扣抵、可以扣多少，有法定限額與文件要求。不要直接把國外已扣的稅全部從台灣基本稅額相減。</p></div></div></section>
    <section id="faq"><h2>海外所得與最低稅負常見問題</h2><div class="faq">${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
    <section id="sources"><h2>官方資料來源與更新依據</h2><p>FinKit 的稅務內容優先引用財政部與所屬國稅局公開資料，並在年度參數調整時更新。本頁最後更新：${LASTMOD}。</p><ul class="sources">${sourceLinks.map(([label, url]) => `<li><a href="${url}" target="_blank" rel="noreferrer noopener">${label}</a></li>`).join('')}</ul></section>
    <section class="infobox"><h2>重要提醒</h2><p>本工具屬於教育與情境試算，不是報稅軟體，也不構成稅務、法律或投資建議。夫妻各類所得分開計稅、列舉扣除、基本生活費差額、外國稅額扣抵、特定保險或證券交易所得等，都可能讓實際結果不同。正式申報請以財政部系統、核定資料或合格專業人士意見為準。</p><p><a href="/learn/taiwan-overseas-income-tax-guide.html">閱讀完整海外所得與最低稅負指南 →</a></p></section>
  </article>
</main>
<footer class="footer"><div class="wrap">© 2026 FinKit · <a href="/privacy.html">隱私權政策</a> · <a href="/terms.html">服務條款</a> · <a href="/disclaimer.html">免責聲明</a> · <a href="/contact.html">聯絡我們</a></div></footer>
<script>
(function(){
  var TAX = {
    personalExemption:101000,
    elderlyExemption:151500,
    standardSingle:136000,
    standardMarried:272000,
    salaryDeduction:227000,
    basicDeduction:7500000,
    basicRate:0.20,
    overseasThreshold:1000000,
    brackets:[
      {limit:610000,rate:0.05,correction:0},
      {limit:1380000,rate:0.12,correction:42700},
      {limit:2770000,rate:0.20,correction:153100},
      {limit:5190000,rate:0.30,correction:430100},
      {limit:Infinity,rate:0.40,correction:949100}
    ]
  };
  var mode='estimate';
  function el(id){return document.getElementById(id)}
  function num(id){var node=el(id);if(!node)return 0;var v=String(node.value||'').replace(/[^0-9.-]/g,'');var x=Number(v);return Number.isFinite(x)?Math.max(0,x):0}
  function fmt(v){return '$'+Math.round(Math.max(0,v||0)).toLocaleString('zh-TW')}
  function tax(net){net=Math.max(0,net);var b=TAX.brackets.find(function(x){return net<=x.limit})||TAX.brackets[TAX.brackets.length-1];return Math.max(0,Math.floor(net*b.rate-b.correction))}
  function exemption(age70){return age70?TAX.elderlyExemption:TAX.personalExemption}
  function salaryDed(v){return Math.min(Math.max(0,v),TAX.salaryDeduction)}
  function householdInputs(){
    var married=el('status').value==='married';
    return {
      married:married,
      sa:num('salary-a'),da:num('dividend-a'),oa:num('other-a'),ageA:el('age70-a').checked,
      sb:married?num('salary-b'):0,db:married?num('dividend-b'):0,ob:married?num('other-b'):0,ageB:married&&el('age70-b').checked,
      deps:Math.floor(num('dependents')),elderly:Math.floor(num('elderly')),itemized:num('itemized'),otherDed:num('other-deduction'),investmentCredit:num('investment-credit')
    };
  }
  function candidateTaxes(h, dividendSeparate){
    var dividends=h.da+h.db;
    var grossNoDiv=h.sa+h.sb+h.oa+h.ob;
    var generalDed=Math.max(h.itemized,h.married?TAX.standardMarried:TAX.standardSingle);
    var depEx=h.deps*TAX.personalExemption+h.elderly*TAX.elderlyExemption;
    var exA=exemption(h.ageA),exB=h.married?exemption(h.ageB):0;
    var salDedA=salaryDed(h.sa),salDedB=salaryDed(h.sb);
    var dividendGross=dividendSeparate?0:dividends;
    var jointNet=Math.max(0,grossNoDiv+dividendGross-exA-exB-depEx-generalDed-salDedA-salDedB-h.otherDed);
    var dividendCredit=dividendSeparate?0:Math.min(dividends*0.085,80000);
    var dividendTax=dividendSeparate?dividends*0.28:0;
    var candidates=[];
    var joint=Math.max(0,tax(jointNet)+dividendTax-dividendCredit-h.investmentCredit);
    candidates.push({tax:joint,label:'夫妻/本人所得合併'+(dividendSeparate?'＋股利28%分開':'＋股利8.5%抵減')});
    if(h.married&&h.sa>0){
      var sepNetA=Math.max(0,h.sa-exA-salDedA);
      var mainNetA=Math.max(0,h.sb+h.oa+h.ob+dividendGross-exB-depEx-generalDed-salDedB-h.otherDed);
      var totalA=Math.max(0,tax(sepNetA)+tax(mainNetA)+dividendTax-dividendCredit-h.investmentCredit);
      candidates.push({tax:totalA,label:'納稅義務人薪資分開＋'+(dividendSeparate?'股利28%分開':'股利合併')});
    }
    if(h.married&&h.sb>0){
      var sepNetB=Math.max(0,h.sb-exB-salDedB);
      var mainNetB=Math.max(0,h.sa+h.oa+h.ob+dividendGross-exA-depEx-generalDed-salDedA-h.otherDed);
      var totalB=Math.max(0,tax(sepNetB)+tax(mainNetB)+dividendTax-dividendCredit-h.investmentCredit);
      candidates.push({tax:totalB,label:'配偶薪資分開＋'+(dividendSeparate?'股利28%分開':'股利合併')});
    }
    candidates.sort(function(a,b){return a.tax-b.tax});
    return {best:candidates[0],jointNet:jointNet,dividends:dividends};
  }
  function estimate(){
    var h=householdInputs();
    var combined=candidateTaxes(h,false);
    var separate=candidateTaxes(h,true);
    var pick=combined.best.tax<=separate.best.tax?{mode:'combined',data:combined}:{mode:'separate',data:separate};
    return {generalTax:pick.data.best.tax,method:pick.data.best.label,net:pick.data.jointNet,separateDividends:pick.mode==='separate'?pick.data.dividends:0};
  }
  function known(){return {generalTax:num('known-tax'),method:'使用已知一般所得稅額',net:num('known-net'),separateDividends:num('known-dividend')}}
  function render(){
    var r=mode==='known'?known():estimate();
    var otherBasic=num('other-basic');
    var domesticBasic=Math.max(0,r.net+r.separateDividends+otherBasic);
    var ceiling=TAX.basicDeduction+r.generalTax/TAX.basicRate;
    var rawSpace=Math.max(0,ceiling-domesticBasic);
    var baselineBasicTax=Math.max(0,(domesticBasic-TAX.basicDeduction)*TAX.basicRate);
    var baselineGap=Math.max(0,baselineBasicTax-r.generalTax);
    var spaceText,spaceDetail,statusText,statusClass;
    if(baselineGap>0){
      spaceText='$0';
      spaceDetail='目前境內基本所得本身已高於不補稅上限，新增海外所得前就應先確認最低稅負。';
      statusText='注意：即使不加入海外所得，試算中的基本稅額也已高於一般所得稅額約 '+fmt(baselineGap)+'。';
      statusClass='warn';
    }else if(rawSpace<TAX.overseasThreshold){
      spaceText='< $1,000,000';
      spaceDetail='反推空間低於100萬，但全戶海外所得未達100萬時原則上不計入基本所得額；達100萬後會全數計入。';
      statusText='目前仍有100萬元計入門檻的緩衝，但接近門檻時應用實際所得與扣除額重新確認。';
      statusClass='warn';
    }else{
      spaceText=fmt(Math.floor(rawSpace));
      spaceDetail='在其他條件不變、且不考慮海外已納稅額扣抵下，基本稅額約不高於一般所得稅額的反推值。';
      statusText='目前試算顯示尚有海外所得空間；超過這個參考值後，基本稅額可能開始高於一般所得稅額。';
      statusClass='good';
    }
    el('overseas-space').textContent=spaceText;
    el('space-detail').textContent=spaceDetail;
    el('general-tax').textContent=fmt(r.generalTax);
    el('tax-method').textContent=r.method;
    el('domestic-basic').textContent=fmt(domesticBasic);
    el('basic-ceiling').textContent=fmt(ceiling);
    el('baseline-basic-tax').textContent=fmt(baselineBasicTax);
    el('formula-box').innerHTML='<b>反推公式</b><br>基本所得上限 = '+fmt(r.generalTax)+' ÷ 20% + $7,500,000 = '+fmt(ceiling)+'<br>境內基本所得 = '+fmt(r.net)+' + '+fmt(r.separateDividends)+' + '+fmt(otherBasic)+' = '+fmt(domesticBasic)+'<br>海外所得空間 = '+fmt(ceiling)+' − '+fmt(domesticBasic)+' = '+fmt(rawSpace);
    el('status-box').textContent=statusText;
    el('status-box').className='status '+statusClass;
  }
  function setMode(next){mode=next;document.querySelectorAll('.tab').forEach(function(btn){btn.classList.toggle('active',btn.getAttribute('data-mode')===mode)});el('estimate-mode').classList.toggle('hide',mode!=='estimate');el('known-mode').classList.toggle('hide',mode!=='known');render()}
  document.querySelectorAll('.tab').forEach(function(btn){btn.addEventListener('click',function(){setMode(btn.getAttribute('data-mode'))})});
  el('status').addEventListener('change',function(){el('spouse-block').classList.toggle('hide',el('status').value!=='married');render()});
  document.querySelectorAll('input,select').forEach(function(node){node.addEventListener('input',render);node.addEventListener('change',render)});
  render();
})();
</script>
</body>
</html>`;

const guideSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${SITE_URL}/learn/taiwan-overseas-income-tax-guide.html#article`,
      headline: '2026 海外所得稅完整指南：100萬、750萬、最低稅負與美股獲利怎麼算',
      description: '用台灣115年度規則解釋海外所得100萬門檻、750萬基本所得扣除額、20%最低稅負、美股與海外基金所得，以及一般所得稅額如何影響實際稅負。',
      inLanguage: 'zh-TW',
      dateModified: LASTMOD,
      author: { '@type': 'Organization', name: 'FinKit', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'FinKit', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
      mainEntityOfPage: `${SITE_URL}/learn/taiwan-overseas-income-tax-guide.html`,
      citation: sourceLinks.map(([, url]) => url),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
  ],
};

const guideHtml = `<!doctype html>
<html lang="zh-TW"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>2026海外所得稅完整指南｜100萬、750萬、最低稅負與美股稅務｜FinKit</title>
<meta name="description" content="2026台灣海外所得稅完整指南：海外所得100萬與750萬差別、最低稅負AMT公式、美股獲利與股息、夫妻門檻及海外已納稅額扣抵，一篇看懂。" />
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large" /><meta name="author" content="FinKit" /><meta name="google-adsense-account" content="${ADSENSE_CLIENT}" />
<link rel="canonical" href="${SITE_URL}/learn/taiwan-overseas-income-tax-guide.html" /><link rel="icon" href="/icon.png" /><link rel="alternate" type="text/plain" href="/llms.txt" />
<meta property="og:type" content="article" /><meta property="og:locale" content="zh_TW" /><meta property="og:site_name" content="FinKit" /><meta property="og:title" content="2026海外所得稅完整指南｜FinKit" /><meta property="og:description" content="100萬、750萬、20%最低稅負、美股與海外基金所得一次看懂。" /><meta property="og:url" content="${SITE_URL}/learn/taiwan-overseas-income-tax-guide.html" /><meta property="og:image" content="${SITE_URL}/icon.png" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script><script type="application/ld+json">${JSON.stringify(guideSchema)}</script>
<style>body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif;line-height:1.8}main{max-width:940px;margin:auto;padding:48px 20px}a{color:#0369a1;font-weight:700;text-decoration:none}a:hover{text-decoration:underline}.hero,.box{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:26px;box-shadow:0 12px 30px rgba(15,23,42,.05)}h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.12;margin:12px 0}h2{margin-top:38px;font-size:1.55rem}h3{margin-top:24px}p,li{color:#475569}.badge{display:inline-block;background:#e0f2fe;color:#075985;border:1px solid #bae6fd;border-radius:999px;padding:5px 10px;font-size:.8rem;font-weight:800}.answer{border-left:4px solid #0284c7;padding:14px 18px;background:#f0f9ff;margin:20px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.faq details{border-bottom:1px solid #e2e8f0;padding:13px 0}.faq summary{cursor:pointer;font-weight:850}.meta{color:#64748b;font-size:.82rem}.cta{display:inline-block;background:#0f172a;color:#fff;padding:11px 16px;border-radius:10px;margin-top:10px}.sources li{margin:8px 0}footer{margin-top:44px;border-top:1px solid #e2e8f0;padding-top:24px;color:#64748b;font-size:.85rem}@media(max-width:720px){.grid{grid-template-columns:1fr}main{padding:30px 16px}}</style>
</head><body><main>
<nav><a href="/">FinKit</a> / <a href="/learn/">理財知識中心</a></nav>
<header class="hero"><span class="badge">115年度 / 2026 稅務指南</span><h1>海外所得稅完整指南：100萬、750萬、最低稅負與美股獲利怎麼算</h1><p>搜尋「海外所得免稅額」最容易看到兩個數字：100萬和750萬，但兩者不是同一件事。先把門檻與公式拆清楚，再談你實際會不會多繳稅。</p><p class="meta">更新日期：${LASTMOD}｜主要依據：財政部與財政部所屬國稅局公開資料</p><a class="cta" href="/tools/taiwan-overseas-income-tax-calculator.html">直接開啟海外所得 AMT 計算機</a></header>
<section><h2>一句話答案：100萬是計入門檻，750萬是基本所得扣除額</h2><div class="answer"><strong>全戶海外所得未達100萬元</strong>，原則上不計入個人基本所得額；若達100萬元，海外所得全數計入。之後再把整體基本所得額扣除750萬元，超過部分乘20%計算基本稅額。</div><p>所以「海外所得750萬以下完全免稅」並不是正確的通用說法。因為基本所得額還包括綜合所得淨額、分開計稅的股利及盈餘，以及特定保險、證券交易、非現金捐贈等其他法定項目。</p></section>
<section><h2>最低稅負不是第二次把所有所得再課20%</h2><p>最低稅負制度的關鍵是「比較」。先算一般所得稅額，再算基本稅額。只有基本稅額高於一般所得稅額時，才會產生差額問題；符合規定的海外已納所得稅還可能在限額內扣抵。</p><div class="box"><p><strong>基本稅額＝（基本所得額－7,500,000）×20%</strong></p><p><strong>一般所得稅額 ≥ 基本稅額：</strong>通常不因最低稅負增加稅額。</p><p><strong>基本稅額 ＞ 一般所得稅額：</strong>再依規定計算差額與海外已納稅額扣抵。</p></div></section>
<section><h2>為什麼高所得的人，反而可能有更大的海外所得空間？</h2><p>因為一般所得稅是累進稅率，當一般所得稅額本來就比較高，最低稅負的「比較基準」也比較高。反推公式可以寫成：</p><div class="answer"><strong>基本所得總額上限＝一般所得稅額 ÷20%＋750萬元</strong><br>海外所得參考空間＝基本所得總額上限－境內基本所得</div><p>這也是為什麼只看「750萬」會失真。兩個人都有相同海外所得，如果一般所得稅額、股利、其他基本所得不同，最低稅負結果也可能完全不同。</p></section>
<section><h2>2026 年美股、海外 ETF 與境外基金要注意什麼？</h2><div class="grid"><div class="box"><h3>美股賣出獲利</h3><p>海外證券交易所得不因為是證券交易就當然免稅。台灣稅務居民仍需依海外所得與基本所得額規則判斷。</p></div><div class="box"><h3>海外股息與基金配息</h3><p>應先確認所得來源地與所得性質。若屬海外所得，會與同一申報戶其他海外所得合併判斷100萬元門檻。</p></div></div></section>
<section><h2>夫妻申報為什麼更適合直接輸入「一般所得稅額」？</h2><p>夫妻可以依規定採不同的所得分開計稅方式，股利又能選擇合併後享8.5%抵減（每戶上限8萬元）或28%分開計稅。若還有列舉扣除、扶養、租金、長照等項目，純靠幾個收入欄位很難完全重建正式報稅軟體的結果。</p><p>因此 FinKit 計算機提供兩條路：想快速估算就輸入薪資、股利與其他所得；已有財政部或會計師算出的「一般所得稅額」，就直接用已知稅額模式反推最低稅負空間。</p></section>
<section id="faq"><h2>常見問題</h2><div class="faq">${faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
<section><h2>官方來源</h2><ul class="sources">${sourceLinks.map(([label,url])=>`<li><a href="${url}" target="_blank" rel="noreferrer noopener">${label}</a></li>`).join('')}</ul></section>
<footer><p>FinKit 內容僅供教育與試算參考，不構成稅務、法律或投資建議。正式申報請以財政部系統、核定資料與專業意見為準。</p><p><a href="/tools/taiwan-overseas-income-tax-calculator.html">海外所得計算機</a> · <a href="/privacy.html">隱私權政策</a> · <a href="/disclaimer.html">免責聲明</a></p></footer>
</main></body></html>`;

await mkdir(toolsDir, { recursive: true });
await mkdir(learnDir, { recursive: true });
await writeFile(toolPath, toolHtml);
await writeFile(guidePath, guideHtml);

const learnIndexPath = join(learnDir, 'index.html');
try {
  let learnIndex = await readFile(learnIndexPath, 'utf8');
  if (!learnIndex.includes('taiwan-overseas-income-tax-guide.html')) {
    const card = `<article class="panel"><span class="badge">台灣稅務</span><h2><a href="/learn/taiwan-overseas-income-tax-guide.html">2026 海外所得稅完整指南</a></h2><p>一次釐清海外所得100萬、750萬、最低稅負、美股獲利與股息怎麼算。</p></article>`;
    learnIndex = learnIndex.replace('      <section class="grid">', `      <section class="grid">\n        ${card}`);
    await writeFile(learnIndexPath, learnIndex);
  }
} catch {
  // Learn index is generated by the content step. If it is unavailable, keep the standalone guide.
}

const toolsIndexPath = join(toolsDir, 'index.html');
try {
  let toolsIndex = await readFile(toolsIndexPath, 'utf8');
  if (!toolsIndex.includes('115年度海外所得')) {
    const featured = `<section class="card" style="margin:24px 0;border-color:#7dd3fc;background:#f0f9ff"><h2><a href="/tools/taiwan-overseas-income-tax-calculator.html">115年度海外所得最低稅負 AMT 計算機</a></h2><p>用最新2026參數一次釐清100萬門檻、750萬基本所得扣除額與20%最低稅負。</p></section>`;
    toolsIndex = toolsIndex.replace('      <section class="grid">', `${featured}\n      <section class="grid">`);
    await writeFile(toolsIndexPath, toolsIndex);
  }
} catch {
  // Tools index is generated by the SEO step.
}

const sitemapPath = join(publicDir, 'sitemap.xml');
try {
  let sitemap = await readFile(sitemapPath, 'utf8');
  const guideUrl = `${SITE_URL}/learn/taiwan-overseas-income-tax-guide.html`;
  if (!sitemap.includes(guideUrl)) {
    const entry = `  <url>\n    <loc>${guideUrl}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
  }
  sitemap = sitemap.replace(/(<loc>https:\/\/finkit\.top\/tools\/taiwan-overseas-income-tax-calculator\.html<\/loc>[\s\S]*?<priority>)0\.8(<\/priority>)/, '$10.95$2');
  await writeFile(sitemapPath, sitemap);
} catch {
  // Sitemap is generated earlier in the prebuild chain.
}

console.log('Generated 115-year overseas income AMT calculator and tax guide');
