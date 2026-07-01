import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://finkit.top';
const LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const learnDir = join(publicDir, 'learn');

const guides = [
  {
    slug: 'personal-finance-roadmap',
    title: '新手理財順序：先現金流，再預備金、保險、投資與退休',
    description: '用一套可執行的順序整理個人理財：現金流、緊急預備金、負債、保障、定期定額、資產配置與退休提領。',
    category: '理財基礎',
    summary: '理財不是先找最高報酬，而是先把錯誤成本降下來。FinKit 建議用現金流、預備金、負債、保障、投資、退休的順序建立系統。',
    sections: [
      {
        heading: '第一步先確認現金流是否為正',
        paragraphs: [
          '如果每月收入扣除支出後沒有穩定剩餘，後面的投資工具都會變得很脆弱。正現金流代表你能持續補預備金、還債、投入資產，也比較不會在市場下跌時被迫賣出。',
          '建議先用預算與現金流工具，把固定支出、生活支出、保險、投資與安全緩衝分開看。這樣比單純記帳更接近決策，因為你會知道下一筆收入應該優先去哪裡。',
        ],
      },
      {
        heading: '第二步建立緊急預備金',
        paragraphs: [
          '預備金的目的不是追求報酬，而是讓你遇到失業、醫療、家庭支出或臨時修繕時，不必賣掉長期投資或借高利負債。一般工作穩定者可先抓 3 到 6 個月必要支出，收入波動者可提高到 9 到 12 個月。',
          '預備金應放在低波動、可快速動用的位置。它不需要打敗通膨，它的價值是降低決策被迫中斷的機率。',
        ],
      },
      {
        heading: '第三步處理高利負債與保障缺口',
        paragraphs: [
          '信用卡循環、信貸、分期付款等高利負債，常常會吃掉投資報酬。若負債利率高於你合理可期待的投資報酬率，優先還債通常比追逐投資更有效。',
          '同時也要檢查家庭責任與保障缺口。若家庭依賴你的收入，壽險、醫療或失能保障不足，資產累積計畫可能會因單一事件被打斷。',
        ],
      },
      {
        heading: '第四步才進入投資與退休規劃',
        paragraphs: [
          '當現金流、預備金、負債與保障都可控後，再開始定期定額、資產配置與退休提領壓力測試。這時投資不是單次猜方向，而是把投入規則、費用、風險與時間放進同一套系統。',
          'FinKit 的各項工具適合用來做初步估算。實際投資、保險、稅務與貸款決策，仍應搭配正式文件與專業建議。',
        ],
      },
    ],
    checklist: ['每月現金流是否為正', '是否有 3-6 個月必要支出預備金', '高利負債是否有清償順序', '保障缺口是否可承受', '投資是否有固定投入與再平衡規則'],
    related: [
      ['理財健檢工具', '/tools/financial-health-check.html'],
      ['預算與現金流規劃工具', '/tools/budget-planner.html'],
      ['緊急預備金計算機', '/tools/emergency-fund-calculator.html'],
    ],
  },
  {
    slug: 'dca-investing-guide',
    title: '定期定額怎麼比較：投入金額、報酬率、年限與資產配置',
    description: '說明定期定額試算與比較時應注意的投入金額、投資年限、年化報酬率、費用與資產配置，避免只看期末金額。',
    category: '投資規劃',
    summary: '定期定額的重點不是保證賺錢，而是建立可持續的投入規則。比較方案時要同時看本金、收益、年限、費用與風險承受度。',
    sections: [
      {
        heading: '不要只比較期末金額',
        paragraphs: [
          '很多人在做定期定額比較時，只看最後累積多少錢。這會忽略一件事：期末金額同時受到投入本金、投資期間、假設報酬率與費用影響。高期末金額不一定代表策略比較好，也可能只是投入更多或承擔更高風險。',
          '比較方案時，應拆成三個欄位：累積本金、投資收益、期末資產。這樣可以看出你的成果有多少來自紀律投入，有多少來自市場報酬。',
        ],
      },
      {
        heading: '報酬率要用情境，不要用單一答案',
        paragraphs: [
          '定期定額 ETF、基金或投資組合時，年化報酬率不應只填一個樂觀數字。建議至少比較保守、中性、樂觀三種情境，並確認在保守情境下仍然能接受結果。',
          '如果某個方案只有在很高報酬率下才達標，代表目標可能需要調整：增加每月投入、延長時間、降低目標金額，或重新檢查風險承受度。',
        ],
      },
      {
        heading: '費用會慢慢吃掉複利',
        paragraphs: [
          '長期定期定額最容易被低估的是費用。內扣費用、申購費、交易成本看起來每年只差一點，但時間拉長後會降低每年的可複利本金。',
          '比較 ETF、基金或其他商品時，不應只看短期績效，也要看費用率、追蹤誤差、稅務和流動性。FinKit 的費用拖累工具可以把費用差距量化。',
        ],
      },
      {
        heading: '定期定額仍需要資產配置',
        paragraphs: [
          '定期定額分散的是進場時點，不等於分散資產風險。如果所有資金都投入同一個產業、同一市場或同一高波動標的，市場下跌時仍可能超過自己的承受範圍。',
          '較成熟的做法是先決定股票、債券、現金與海外資產比例，再把每月投入金額分配到各類資產，並定期再平衡。',
        ],
      },
    ],
    checklist: ['至少比較三種報酬率情境', '分開看本金與收益', '檢查商品費用率與交易成本', '確認每月投入金額能長期維持', '搭配資產配置與再平衡'],
    related: [
      ['定期定額試算與比較工具', '/tools/dca-calculator.html'],
      ['投資費用拖累計算機', '/tools/investment-fee-calculator.html'],
      ['資產配置與再平衡工具', '/tools/asset-allocation-calculator.html'],
    ],
  },
  {
    slug: 'emergency-fund-guide',
    title: '緊急預備金怎麼準備：3 個月、6 個月還是 12 個月',
    description: '說明緊急預備金的用途、月數判斷、存放位置與常見錯誤，協助建立投資前的安全現金墊。',
    category: '風險管理',
    summary: '緊急預備金不是投資績效的一部分，而是防止生活事件破壞財務計畫的保護層。',
    sections: [
      {
        heading: '先用必要支出計算，不是用總支出',
        paragraphs: [
          '預備金月數應以必要支出為基準，例如房租或房貸、基本生活費、保費、交通、家庭照顧與必要醫療。娛樂、旅遊、非必要訂閱不應全部算進最低需求。',
          '這樣計算可以避免目標過大而無法開始，也能在緊急事件發生時清楚知道哪些支出可以暫停。',
        ],
      },
      {
        heading: '收入穩定度決定月數',
        paragraphs: [
          '固定薪資、單身、家庭責任低的人，可以先以 3 到 6 個月為目標。自由工作者、業務收入、創業者、有房貸或扶養責任者，通常需要更高月數。',
          '預備金不是一次到位，可以先補到 1 個月，再補到 3 個月，最後依風險提高到 6 或 12 個月。',
        ],
      },
      {
        heading: '放錯地方會失去功能',
        paragraphs: [
          '預備金不適合放在高波動投資，因為真正需要用錢時，市場可能剛好下跌。也不適合全部鎖在長天期商品中，否則流動性不足。',
          '較合理的位置是活存、貨幣型工具、短期定存或其他低波動且可快速動用的帳戶。報酬率不是主要目標，安全與流動性才是。',
        ],
      },
      {
        heading: '預備金足夠後才提高投資比例',
        paragraphs: [
          '沒有預備金就投資，容易在突發支出時賣掉長期資產。這會讓原本的投資計畫變成短期現金周轉，風險完全不同。',
          '當預備金達標後，才適合把新增現金流投入定期定額、退休或資產配置計畫。',
        ],
      },
    ],
    checklist: ['用必要支出計算月數', '依收入穩定度調整到 3-12 個月', '放在低波動且可快速動用的位置', '不要把預備金拿去追求高報酬', '達標後再提高投資比例'],
    related: [
      ['緊急預備金計算機', '/tools/emergency-fund-calculator.html'],
      ['預算與現金流規劃工具', '/tools/budget-planner.html'],
      ['理財健檢工具', '/tools/financial-health-check.html'],
    ],
  },
  {
    slug: 'debt-payoff-guide',
    title: '負債清償順序：雪球法、雪崩法與高利負債優先原則',
    description: '比較雪球法與雪崩法，說明高利負債、月付壓力、預備金與投資之間的優先順序。',
    category: '負債管理',
    summary: '負債不是只有金額問題，還包含利率、月付壓力與心理負擔。還款策略要同時兼顧利息成本與可持續性。',
    sections: [
      {
        heading: '先列出利率、餘額與月付',
        paragraphs: [
          '整理負債時，不要只看總額。應把每一筆負債的餘額、利率、最低月付、剩餘期數與是否可提前清償列出來。',
          '這張表會讓你看見真正昂貴的負債。信用卡循環、信貸或高利分期，通常比房貸更應優先處理。',
        ],
      },
      {
        heading: '雪崩法通常省利息',
        paragraphs: [
          '雪崩法是先還利率最高的負債，因此在數學上通常能節省最多利息。適合能穩定執行計畫、且希望最小化總成本的人。',
          '缺點是如果最高利率負債金額很大，短期成就感較低，容易半途放棄。',
        ],
      },
      {
        heading: '雪球法重視行為持續性',
        paragraphs: [
          '雪球法先還餘額最小的負債，快速消除一筆債務後，把釋放出來的月付轉去下一筆。它不一定最省利息，但對需要成就感的人更容易持續。',
          '理想做法是先用工具比較兩種策略，再選一個自己能持續 6 到 12 個月的方案。',
        ],
      },
      {
        heading: '不要為了還債把預備金歸零',
        paragraphs: [
          '如果把所有現金都拿去還債，遇到突發支出時可能又借回更高利率的錢。較穩健的做法是保留至少 1 個月必要支出，再加速處理高利負債。',
          '當高利負債清掉後，再把原本月付款轉到預備金、投資或退休目標，財務改善速度會明顯提高。',
        ],
      },
    ],
    checklist: ['列出每筆負債利率與餘額', '高利負債優先處理', '比較雪球法與雪崩法', '至少保留基本預備金', '還清後把月付款轉入投資或預備金'],
    related: [
      ['負債清償計算機', '/tools/debt-payoff-calculator.html'],
      ['緊急預備金計算機', '/tools/emergency-fund-calculator.html'],
      ['財務目標倒推工具', '/tools/financial-goal-calculator.html'],
    ],
  },
  {
    slug: 'mortgage-affordability-guide',
    title: '房貸負擔怎麼評估：月付金、寬限期與買房現金流',
    description: '用月付金、寬限期、利率、房價、自備款與收入比例評估買房負擔，避免只看可貸金額。',
    category: '房貸與生活',
    summary: '銀行願意貸多少，不代表你的生活可以承受多少。買房前要同時看寬限期後月付、維修成本、稅費與投資機會成本。',
    sections: [
      {
        heading: '月付金要用寬限期後的數字',
        paragraphs: [
          '寬限期只繳利息，看起來月付較低，但本金沒有正常下降。寬限期結束後，本息攤還月付可能明顯增加。',
          '買房前應先用寬限後月付測試現金流，並保留利率上升、收入變動與家庭支出的緩衝。',
        ],
      },
      {
        heading: '不要只看房貸，還要看持有成本',
        paragraphs: [
          '持有房屋會產生管理費、修繕、稅費、保險與家具設備成本。這些不一定每月固定，但長期會影響實際負擔。',
          '如果每月房貸加持有成本過高，會壓縮預備金、保險與投資，讓整體財務彈性下降。',
        ],
      },
      {
        heading: '買房與租房要比較機會成本',
        paragraphs: [
          '自備款投入房屋後，就不能同時拿去投資。租房方案雖然沒有累積房屋淨值，但可能保留更多可投資資產。',
          '買房或租房沒有絕對答案，應用持有年限、房價成長、租金、貸款利率與投資報酬率做情境比較。',
        ],
      },
      {
        heading: '先確保買房後仍能維持基本理財順序',
        paragraphs: [
          '理想情況下，買房後仍應保留緊急預備金、保障與固定投資能力。若買房讓所有現金流都被房貸吸走，風險會集中在單一資產上。',
          '買房試算不是要阻止買房，而是幫你找出不會破壞生活品質與長期目標的價格範圍。',
        ],
      },
    ],
    checklist: ['用寬限期後月付測試', '加入管理費與修繕成本', '保留利率上升緩衝', '比較買房與租房投資機會成本', '買房後仍維持預備金與投資能力'],
    related: [
      ['房貸試算工具', '/tools/mortgage-calculator.html'],
      ['買房 vs 租房試算工具', '/tools/rent-vs-buy-calculator.html'],
      ['預算與現金流規劃工具', '/tools/budget-planner.html'],
    ],
  },
  {
    slug: 'retirement-withdrawal-guide',
    title: '退休提領規劃：安全提領率、通膨與被動收入壓力測試',
    description: '說明退休提領試算時應納入的資產壽命、年支出、通膨、報酬率、被動收入與安全提領率。',
    category: '退休規劃',
    summary: '退休不是只累積一個大數字，而是確認資產是否能支撐每年支出、通膨與市場波動。',
    sections: [
      {
        heading: '先估每年必要支出',
        paragraphs: [
          '退休提領的起點是年支出，不是資產金額。必要支出包含居住、飲食、醫療、保險、交通與家庭責任，非必要支出則可另外做彈性調整。',
          '把支出分成必要與彈性兩類後，遇到市場不好時才知道哪些支出可以暫緩，降低資產被迫賣出的壓力。',
        ],
      },
      {
        heading: '通膨會慢慢提高需求',
        paragraphs: [
          '今天的年支出不等於 20 年後的年支出。即使通膨率看起來不高，時間拉長後也會明顯改變購買力。',
          '退休試算應把通膨納入，並用保守報酬率測試資產是否可能提前耗盡。',
        ],
      },
      {
        heading: '安全提領率不是保證值',
        paragraphs: [
          '常見的安全提領率只是歷史情境下的參考，不是保證。實際結果會受到市場順序風險、費用、稅務與個人壽命影響。',
          '較穩健的做法是用多組提領率比較，例如 3%、3.5%、4%，並搭配被動收入與現金部位降低壓力。',
        ],
      },
      {
        heading: '退休後仍需要資產配置',
        paragraphs: [
          '退休不代表全部轉成現金。過高現金比例可能被通膨侵蝕，過高股票比例則可能在短期下跌時影響提領。',
          '退休配置應平衡成長、穩定與流動性，並定期檢查提領率是否仍在可承受範圍。',
        ],
      },
    ],
    checklist: ['估算必要年支出', '納入通膨假設', '比較多組安全提領率', '考慮被動收入', '保留現金與再平衡規則'],
    related: [
      ['退休提領壓力測試', '/tools/retirement-withdrawal-calculator.html'],
      ['FIRE 退休數字計算機', '/tools/fire-calculator.html'],
      ['通膨購買力計算機', '/tools/inflation-calculator.html'],
    ],
  },
  {
    slug: 'asset-allocation-guide',
    title: '資產配置與再平衡：股票、債券、現金與海外部位怎麼分配',
    description: '說明資產配置、再平衡、風險承受度與投資期限的關係，幫助建立可持續的投資組合。',
    category: '投資規劃',
    summary: '資產配置的目的不是預測哪個市場會漲，而是讓投資組合在不同環境下仍能被持有。',
    sections: [
      {
        heading: '配置先於選股',
        paragraphs: [
          '很多投資人先挑標的，最後才發現整體風險過度集中。較好的順序是先決定股票、債券、現金與海外部位比例，再挑選工具。',
          '配置比例應根據投資期限、收入穩定度、最大回撤承受度與目標彈性設定，而不是只看短期報酬。',
        ],
      },
      {
        heading: '現金不是落後資產',
        paragraphs: [
          '現金的角色是流動性與穩定性，不是追求最高報酬。當市場下跌、收入中斷或需要再平衡時，現金能提供選擇權。',
          '現金比例太高會拖累長期成長，太低則會讓投資計畫缺乏安全墊。比例應和預備金及短期目標一起看。',
        ],
      },
      {
        heading: '再平衡是紀律，不是預測',
        paragraphs: [
          '再平衡是把偏離目標比例的資產調回原本設定。它能避免上漲資產占比過高，也能在下跌資產符合策略時有紀律地補回。',
          '常見方式是每季、每半年或當偏離目標比例超過門檻時再平衡。頻率太高會增加成本，太低可能讓風險失控。',
        ],
      },
      {
        heading: '配置要能讓你睡得著',
        paragraphs: [
          '最好的配置不是回測報酬最高的配置，而是你在市場下跌時仍能照計畫持有的配置。',
          '如果一次下跌 20% 就會讓你停扣或賣出，代表股票比例可能太高，應回頭調整風險屬性與資產配置。',
        ],
      },
    ],
    checklist: ['先決定配置再選商品', '現金比例連同預備金一起看', '設定再平衡頻率或偏離門檻', '檢查最大回撤承受度', '定期更新但避免頻繁交易'],
    related: [
      ['資產配置與再平衡工具', '/tools/asset-allocation-calculator.html'],
      ['風險屬性與配置建議', '/tools/risk-profile-calculator.html'],
      ['投資費用拖累計算機', '/tools/investment-fee-calculator.html'],
    ],
  },
  {
    slug: 'fcn-risk-guide',
    title: 'FCN 風險檢查：KO、Strike、KI、接股與最差情境',
    description: '說明 FCN 結構型商品常見條款、KO、Strike、KI、配息、接股與最差情境，協助投資前做風險檢查。',
    category: '投資風險',
    summary: 'FCN 的票息看起來直覺，但真正要看的不是配息率，而是標的下跌時的接股、損失與流動性限制。',
    sections: [
      {
        heading: '先看最差情境，不要先看票息',
        paragraphs: [
          'FCN 常用高票息吸引注意，但票息通常是承擔標的下跌風險的補償。投資前應先問：如果最弱標的大跌並低於 Strike 或 KI，我是否能承受接股或本金損失。',
          '若你不願意長期持有該標的，或無法承受單一股票大幅下跌，FCN 的票息不應被視為穩定收入。',
        ],
      },
      {
        heading: 'KO、Strike、KI 是不同風險點',
        paragraphs: [
          'KO 通常代表提前贖回條件，Strike 和 KI 則關係到到期損益與是否接股。不同商品條款差異很大，不能只看表面百分比。',
          '試算時應把參考價、KO、Strike、KI 與到期情境放在同一張表，確認標的下跌時的損益兩平與可能損失。',
        ],
      },
      {
        heading: '多標的 FCN 要看最弱標的',
        paragraphs: [
          '許多 FCN 是多標的結構，結果往往取決於表現最差的標的。即使其他標的上漲，最弱標的大跌也可能影響接股或損益。',
          '因此多標的 FCN 不只是分散，某些條款下反而增加觸發風險。投資前應逐一檢查每個標的的波動與基本面。',
        ],
      },
      {
        heading: '流動性與提前出場成本也要列入',
        paragraphs: [
          'FCN 通常不是像 ETF 一樣可低成本自由進出。若中途需要資金，提前解約或次級市場價格可能不利。',
          '投資前應確認資金期限、流動性需求、商品說明書、費用、發行機構風險與稅務處理。',
        ],
      },
    ],
    checklist: ['先看最差情境', '確認 KO、Strike、KI 條款', '多標的看最弱標的', '確認能否承受接股', '檢查流動性與提前出場成本'],
    related: [
      ['FCN 結構型商品試算工具', '/tools/fcn-calculator.html'],
      ['風險屬性與配置建議', '/tools/risk-profile-calculator.html'],
      ['投資費用拖累計算機', '/tools/investment-fee-calculator.html'],
    ],
  },
];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const guideJsonLd = (guide) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${SITE_URL}/learn/${guide.slug}.html#article`,
      headline: guide.title,
      description: guide.description,
      inLanguage: 'zh-TW',
      author: { '@type': 'Organization', name: 'FinKit' },
      publisher: { '@type': 'Organization', name: 'FinKit', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
      mainEntityOfPage: `${SITE_URL}/learn/${guide.slug}.html`,
      dateModified: LASTMOD,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'FinKit', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '理財知識中心', item: `${SITE_URL}/learn/` },
        { '@type': 'ListItem', position: 3, name: guide.title, item: `${SITE_URL}/learn/${guide.slug}.html` },
      ],
    },
  ],
});

const baseStyle = `
      body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.8}
      main{max-width:940px;margin:0 auto;padding:48px 20px}
      a{color:#0369a1;font-weight:700;text-decoration:none}
      nav{margin-bottom:28px;color:#64748b}
      .hero{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:32px;box-shadow:0 18px 45px rgba(15,23,42,.08)}
      h1{font-size:clamp(2rem,5vw,3.15rem);line-height:1.15;margin:0 0 16px}
      h2{margin-top:36px;font-size:1.45rem}
      p{font-size:1rem}
      .badge{display:inline-flex;border:1px solid #bae6fd;background:#f0f9ff;border-radius:999px;padding:5px 10px;font-size:.86rem;font-weight:700;color:#075985}
      .panel{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:22px;margin-top:18px}
      .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:20px}
      li{margin:8px 0}
      footer{margin-top:44px;color:#64748b;font-size:.9rem}
`;

const renderGuidePage = (guide) => `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(guide.title)}｜FinKit</title>
    <meta name="description" content="${escapeHtml(guide.description)}" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-4463068342710380" />
    <meta name="google-site-verification" content="co9Bg-sw-BxH6ESZXHdmf15CtnQi0KkmzIxcRsrg7GI" />
    <link rel="canonical" href="${SITE_URL}/learn/${guide.slug}.html" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="zh_TW" />
    <meta property="og:site_name" content="FinKit" />
    <meta property="og:title" content="${escapeHtml(guide.title)}｜FinKit" />
    <meta property="og:description" content="${escapeHtml(guide.description)}" />
    <meta property="og:url" content="${SITE_URL}/learn/${guide.slug}.html" />
    <meta property="og:image" content="${SITE_URL}/icon.png" />
    <script type="application/ld+json">${JSON.stringify(guideJsonLd(guide))}</script>
    <style>${baseStyle}</style>
  </head>
  <body>
    <main>
      <nav><a href="/">FinKit</a> / <a href="/learn/">理財知識中心</a></nav>
      <section class="hero">
        <span class="badge">${escapeHtml(guide.category)}</span>
        <h1>${escapeHtml(guide.title)}</h1>
        <p>${escapeHtml(guide.summary)}</p>
      </section>
      ${guide.sections
        .map(
          (section) => `<section>
        <h2>${escapeHtml(section.heading)}</h2>
        ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ')}
      </section>`,
        )
        .join('\n')}
      <section class="panel">
        <h2>檢查清單</h2>
        <ul>${guide.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
      <section>
        <h2>相關工具</h2>
        <div class="grid">${guide.related.map(([label, href]) => `<a class="panel" href="${href}">${escapeHtml(label)}</a>`).join('')}</div>
      </section>
      <footer>
        <p>FinKit 內容僅供教育與試算參考，不構成投資、稅務、保險或法律建議。</p>
        <p><a href="/privacy.html">隱私權政策</a> · <a href="/terms.html">服務條款</a> · <a href="/disclaimer.html">免責聲明</a> · <a href="/contact.html">聯絡我們</a></p>
      </footer>
    </main>
  </body>
</html>
`;

const renderLearnIndex = () => `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinKit 理財知識中心｜預算、投資、房貸、退休與風險管理</title>
    <meta name="description" content="FinKit 理財知識中心整理現金流、預備金、負債、定期定額、資產配置、房貸、退休與 FCN 風險等主題，搭配工具做實際試算。" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-4463068342710380" />
    <meta name="google-site-verification" content="co9Bg-sw-BxH6ESZXHdmf15CtnQi0KkmzIxcRsrg7GI" />
    <link rel="canonical" href="${SITE_URL}/learn/" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <style>${baseStyle}</style>
  </head>
  <body>
    <main>
      <nav><a href="/">FinKit</a></nav>
      <section class="hero">
        <span class="badge">理財知識中心</span>
        <h1>把理財工具背後的判斷邏輯說清楚</h1>
        <p>這裡整理 FinKit 各項試算工具的使用情境、常見錯誤與判讀方式。先讀觀念，再進工具試算，能降低只看單一數字造成的誤判。</p>
      </section>
      <section class="grid">
        ${guides.map((guide) => `<article class="panel"><span class="badge">${escapeHtml(guide.category)}</span><h2><a href="/learn/${guide.slug}.html">${escapeHtml(guide.title)}</a></h2><p>${escapeHtml(guide.description)}</p></article>`).join('')}
      </section>
      <footer>
        <p><a href="/tools/">查看全部理財工具</a> · <a href="/about.html">關於 FinKit</a> · <a href="/contact.html">聯絡我們</a></p>
      </footer>
    </main>
  </body>
</html>
`;

const guideSitemap = () => `
  <url>
    <loc>${SITE_URL}/learn/</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${guides
  .map(
    (guide) => `  <url>
    <loc>${SITE_URL}/learn/${guide.slug}.html</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`,
  )
  .join('\n')}`;

const enrichToolsIndex = async () => {
  const path = join(publicDir, 'tools', 'index.html');
  const html = await readFile(path, 'utf8');
  if (html.includes('理財知識中心')) return;
  const insert = `
      <section>
        <h2>理財知識中心</h2>
        <p class="intro">工具可以算出數字，文章負責說明判斷邏輯。先理解現金流、預備金、負債、定期定額、資產配置與退休提領，再回到工具做自己的情境。</p>
        <p><a href="/learn/">閱讀全部理財文章</a></p>
      </section>`;
  await writeFile(path, html.replace('      <footer>', `${insert}\n      <footer>`));
};

const updateSitemap = async () => {
  const path = join(publicDir, 'sitemap.xml');
  const sitemap = await readFile(path, 'utf8');
  const withoutOldGuides = sitemap.replace(/\n  <url>\n    <loc>https:\/\/finkit\.top\/learn\/[\s\S]*?(?=<\/urlset>)/, '\n');
  await writeFile(path, withoutOldGuides.replace('</urlset>', `${guideSitemap()}\n</urlset>`));
};

await mkdir(learnDir, { recursive: true });
for (const guide of guides) {
  await writeFile(join(learnDir, `${guide.slug}.html`), renderGuidePage(guide));
}
await writeFile(join(learnDir, 'index.html'), renderLearnIndex());
await enrichToolsIndex();
await updateSitemap();

console.log(`Generated ${guides.length} learning articles, learn index, and sitemap entries`);
