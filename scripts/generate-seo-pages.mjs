import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://finkit.top';
const LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

const tools = [
  {
    slug: 'financial-health-check',
    tab: 'health',
    title: '理財健檢工具｜現金流、負債、預備金與保障一次檢查',
    description: 'FinKit 理財健檢工具整合現金流、緊急預備金、負債收入比、投資率與保障缺口，產生可執行的理財優先改善順序。',
    h1: '理財健檢工具',
    intro: '用一份報告快速確認目前財務體質，適合第一次整理個人財務、年度檢查或開始投資前使用。',
    keywords: ['理財健檢', '財務健檢', '現金流檢查', '負債收入比', '緊急預備金'],
    features: ['健檢分數與優先改善順序', '儲蓄率、預備金月數、債務收入比', '保障缺口與投資習慣檢查'],
    faq: [
      ['理財健檢分數代表信用評分嗎？', '不是。它是行為與風險檢查指標，用來協助排序改善順序。'],
      ['資料會上傳到伺服器嗎？', '不會。FinKit 的試算資料儲存在同一台裝置的瀏覽器 localStorage。'],
    ],
  },
  {
    slug: 'budget-planner',
    tab: 'budget',
    title: '預算規劃工具｜月收入、支出、投資與安全緩衝配置',
    description: '用 FinKit 預算規劃工具拆解月收入、固定支出、生活支出、保險、投資與安全緩衝，快速建立可執行的現金流配置。',
    h1: '預算與現金流規劃工具',
    intro: '把每月收入拆成清楚的桶子，避免只記帳但沒有行動方案。',
    keywords: ['預算規劃', '現金流', '月支出', '儲蓄率', '收入配置'],
    features: ['月收入與支出配置', '剩餘現金與支出占比', '固定支出、投資儲蓄、安全緩衝視覺化'],
    faq: [
      ['預算工具適合誰？', '適合想建立現金流紀律、降低固定支出或提高投資率的使用者。'],
      ['需要每天記帳嗎？', '不一定。這個工具重點是建立月度配置，不取代明細記帳 App。'],
    ],
  },
  {
    slug: 'net-worth-calculator',
    tab: 'networth',
    title: '淨資產計算機｜資產、負債與財務位置盤點',
    description: 'FinKit 淨資產計算機協助整理現金、投資、房產、退休金、房貸與消費性負債，快速知道真正的財務位置。',
    h1: '淨資產計算機',
    intro: '淨資產是理財決策的起點，比單看收入或存款更能反映財務狀態。',
    keywords: ['淨資產', '資產負債表', '財務盤點', '房貸', '投資資產'],
    features: ['資產與負債同表盤點', '資產總額、負債總額、淨資產', '現金、股票、房產、退休金分類'],
    faq: [
      ['淨資產包含自住房嗎？', '可以包含，但若要評估退休現金流，建議另外看可投資資產。'],
      ['多久盤點一次？', '一般建議每月或每季更新一次，重大負債或投資變動後也應更新。'],
    ],
  },
  {
    slug: 'emergency-fund-calculator',
    tab: 'emergency',
    title: '緊急預備金計算機｜3 到 12 個月安全墊試算',
    description: '用每月必要支出推算緊急預備金目標、缺口與補足時間，協助建立投資前的安全現金墊。',
    h1: '緊急預備金計算機',
    intro: '先建立安全墊，避免突發事件迫使你賣出長期投資或借高利負債。',
    keywords: ['緊急預備金', '安全墊', '預備金月數', '現金管理'],
    features: ['目標月數與金額', '目前進度與缺口', '每月補強後的達標時間'],
    faq: [
      ['緊急預備金要準備幾個月？', '一般可抓 3-6 個月必要支出，收入波動者可提高到 9-12 個月。'],
      ['預備金可以拿去投資嗎？', '不建議承擔高波動風險，因為用途是短期流動性。'],
    ],
  },
  {
    slug: 'financial-goal-calculator',
    tab: 'goal',
    title: '財務目標倒推工具｜買房、退休與存款目標每月投入試算',
    description: 'FinKit 財務目標倒推工具用目標金額、目前資金、期限與報酬假設，倒推出每月需要投入多少，適合買房頭期款、教育金與退休目標規劃。',
    h1: '財務目標倒推工具',
    intro: '先輸入目標，再倒推每月需要投入多少，讓買房、退休、教育金或第一桶金變成可執行的月計畫。',
    keywords: ['財務目標', '目標倒推', '存錢目標', '每月投入試算', '買房頭期款', '退休目標'],
    features: ['目標金額與期限倒推', '目前資金與預期報酬納入估算', '每月需要投入金額'],
    faq: [
      ['財務目標倒推適合哪些情境？', '適合買房頭期款、教育金、退休金、旅遊基金或任何有期限與目標金額的規劃。'],
      ['報酬率要怎麼設定？', '保守目標可先用低報酬率或零報酬試算，再用較高報酬率做情境比較。'],
    ],
  },
  {
    slug: 'debt-payoff-calculator',
    tab: 'debt',
    title: '負債清償計算機｜雪球法、雪崩法與加速還款試算',
    description: 'FinKit 負債清償計算機估算總負債、利率、月還款與額外還款後的還清時間與利息成本，協助比較雪球法與雪崩法還款策略。',
    h1: '負債清償計算機',
    intro: '把信用貸款、卡債、車貸或其他負債整理成可執行還款計畫，先看時間、利息與每月現金流壓力。',
    keywords: ['負債清償', '還款試算', '雪球法', '雪崩法', '卡債整理', '加速還款'],
    features: ['本金、利率與月還款估算', '還清時間與總利息', '額外還款加速效果'],
    faq: [
      ['雪球法和雪崩法差在哪？', '雪球法先還小額負債，重視成就感；雪崩法先還高利率負債，通常更省利息。'],
      ['額外還款一定划算嗎？', '高利率負債通常優先處理，但仍要保留基本緊急預備金，避免再借更高利率的錢。'],
    ],
  },
  {
    slug: 'compound-interest-calculator',
    tab: 'compound',
    title: '複利計算機｜單筆投資長期報酬試算',
    description: 'FinKit 複利計算機比較投資報酬率與保守利率，估算單筆資金長期成長與複利差距。',
    h1: '複利計算機',
    intro: '用不同年化報酬假設比較長期資產累積差異，理解時間和報酬率的影響。',
    keywords: ['複利計算機', '投資報酬率', '年化報酬', '長期投資'],
    features: ['單筆投入未來值', '保守利率與投資報酬比較', '長期複利差距視覺化'],
    faq: [
      ['複利試算能保證報酬嗎？', '不能。它只用假設報酬率估算可能結果，實際市場會波動。'],
      ['年化報酬率怎麼設定？', '可依資產類別歷史報酬與個人保守程度設定多組情境。'],
    ],
  },
  {
    slug: 'dca-calculator',
    tab: 'dca',
    title: '定期定額試算與比較｜ETF、基金與每月投入長期資產累積',
    description: '用 FinKit 定期定額試算每月投入、年化報酬與投資年限，快速比較不同投入金額、報酬率與年限下的本金、收益與期末資產。',
    h1: '定期定額試算與比較工具',
    intro: '將固定月投入轉成長期資產累積估算，適合 ETF 定期定額、基金定期定額、退休投資與不同投入方案比較。',
    keywords: ['定期定額', '定期定額試算', '定期定額比較', 'ETF 定期定額', '基金定期定額', '每月投入試算', '退休投資'],
    features: ['每月投入、年化報酬與投資年限', '期末資產、投入本金與投資收益', '不同定期定額方案比較'],
    faq: [
      ['定期定額適合所有市場嗎？', '定期定額能分散進場時點，但仍需搭配資產配置、風險承受度與投資標的品質。'],
      ['可以比較不同定期定額方案嗎？', '可以。調整每月投入、年化報酬與投資年限，就能比較不同方案的本金、收益與期末資產。'],
    ],
  },
  {
    slug: 'mortgage-calculator',
    tab: 'loan',
    title: '房貸試算工具｜寬限期、本息攤還與月付跳升',
    description: 'FinKit 房貸試算工具估算貸款金額、利率、年限與寬限期下的月付金、寬限後月付與月付跳升。',
    h1: '房貸試算工具',
    intro: '買房前先估算月付壓力，特別是寬限期結束後的現金流變化。',
    keywords: ['房貸試算', '寬限期', '本息攤還', '月付金', '台灣房貸'],
    features: ['寬限期只繳息估算', '寬限後本息攤還月付', '月付跳升與總期數'],
    faq: [
      ['寬限期月付比較低代表比較划算嗎？', '不一定。寬限期只延後還本金，應檢查寬限後月付是否可承受。'],
      ['房貸利率變動會影響結果嗎？', '會。實際月付應以銀行核貸條件和最新利率為準。'],
    ],
  },
  {
    slug: 'rent-vs-buy-calculator',
    tab: 'rentbuy',
    title: '買房 vs 租房試算｜自備款、房貸、租金與投資機會成本比較',
    description: 'FinKit 買房租房比較工具用房價、自備款、房貸、租金、報酬率與持有年限，估算買房累積淨值與租房投資資產差異。',
    h1: '買房 vs 租房試算工具',
    intro: '買房不只是月付金，租房也不只是租金。把自備款、房貸、房屋持有成本與租房投資機會成本放在同一張表比較。',
    keywords: ['買房租房比較', '買房試算', '租房投資', '自備款', '房貸成本', '機會成本'],
    features: ['買房累積淨值估算', '租房投資資產估算', '房貸、租金與報酬率情境比較'],
    faq: [
      ['買房一定比租房好嗎？', '不一定。結果取決於房價、貸款條件、租金、持有年限、投資報酬與交易成本。'],
      ['這個工具能取代實價登錄分析嗎？', '不能。它是決策框架與粗估模型，實際買房仍需搭配區域行情、稅費與維修成本。'],
    ],
  },
  {
    slug: 'retirement-withdrawal-calculator',
    tab: 'retirement',
    title: '退休提領試算｜資產壽命、通膨與被動收入壓力測試',
    description: 'FinKit 退休提領試算估算退休資產、年支出、被動收入、通膨與報酬率下，資產是否可能耗盡。',
    h1: '退休提領壓力測試',
    intro: '退休不是只看目標資產，也要看每年提領、通膨、報酬率與被動收入。',
    keywords: ['退休提領', '退休試算', '安全提領率', '資產壽命', 'FIRE'],
    features: ['初始提領率', '資產耗盡年份', '年度支出、收入與年底資產表'],
    faq: [
      ['安全提領率固定是 4% 嗎？', '不是。4% 是常見參考值，實際應依市場、年限、稅費與支出彈性調整。'],
      ['被動收入會跟通膨調整嗎？', '工具以同樣通膨率調整，被動收入實際成長仍需看收入來源。'],
    ],
  },
  {
    slug: 'risk-profile-calculator',
    tab: 'risk',
    title: '風險屬性測驗｜投資期限、回撤承受度與配置建議',
    description: 'FinKit 風險屬性工具用期限、最大回撤承受度、收入穩定度、經驗與目標，估算適合的資產配置起點。',
    h1: '風險屬性與配置建議',
    intro: '投資前先確認能承受的波動，避免在市場下跌時被迫退出原本的長期計畫。',
    keywords: ['風險屬性', '風險承受度', '資產配置', '投資配置'],
    features: ['風險分數與屬性判斷', '股票、債券、現金配置起點', '期限與收入穩定度納入評估'],
    faq: [
      ['風險屬性會改變嗎？', '會。收入、家庭責任、年齡、投資經驗和目標都會改變風險屬性。'],
      ['配置建議可以直接照做嗎？', '它是起點，仍應搭配個人稅務、現金流與商品風險。'],
    ],
  },
  {
    slug: 'asset-allocation-calculator',
    tab: 'allocation',
    title: '資產配置工具｜股票、債券、現金與海外部位再平衡',
    description: 'FinKit 資產配置工具把目標比例轉成金額，快速知道股票、債券、現金與海外部位需要加碼或減碼。',
    h1: '資產配置與再平衡工具',
    intro: '用比例管理投資風險，讓投資決策不只看單一標的漲跌。',
    keywords: ['資產配置', '再平衡', '股票比例', '債券比例', 'ETF 配置'],
    features: ['目標比例轉金額', '目前部位與目標差距', '加碼或減碼金額建議'],
    faq: [
      ['多久再平衡一次？', '常見做法是每季、每半年或偏離目標比例超過一定門檻時再平衡。'],
      ['現金比例越低越好嗎？', '不一定。現金承擔流動性功能，比例應配合預備金與短期目標。'],
    ],
  },
  {
    slug: 'life-insurance-gap-calculator',
    tab: 'insurance',
    title: '保障缺口試算｜壽險、家庭責任與保險需求粗估',
    description: 'FinKit 保障缺口試算用家庭責任、負債、教育金、生活費與既有保障，粗估壽險保障缺口，檢查家庭風險承擔是否過度集中。',
    h1: '保障缺口試算工具',
    intro: '保險不是買越多越好，而是先確認家庭責任、負債與未來支出，再看現有保障是否足夠。',
    keywords: ['保障缺口', '壽險試算', '保險需求', '家庭責任', '責任需求法', '保額試算'],
    features: ['家庭責任與負債整理', '既有保障與缺口比較', '初步壽險保額需求估算'],
    faq: [
      ['保障缺口試算是正式保險建議嗎？', '不是。它是教育用途的初步估算，實際投保仍需依家庭狀況、健康條件與保單條款確認。'],
      ['保障缺口越大就一定要立刻買保險嗎？', '不一定。可先處理高風險缺口，再比較定期壽險、醫療、失能與預算限制。'],
    ],
  },
  {
    slug: 'investment-fee-calculator',
    tab: 'fees',
    title: '投資費用拖累計算機｜ETF、基金與高費用商品長期差距',
    description: '比較低費用 ETF 或基金與高費用商品在同樣報酬假設下的長期複利差距，量化內扣費用對資產的拖累。',
    h1: '投資費用拖累計算機',
    intro: '費用率看起來很小，但會逐年侵蝕複利成果，長期差距可能非常明顯。',
    keywords: ['費用率', 'ETF 費用', '基金內扣費用', '投資成本', '複利拖累'],
    features: ['低費用與高費用期末值比較', '費用成本估算', '費用差距占投入比例'],
    faq: [
      ['費用率差 1% 真的重要嗎？', '長期投資下很重要，因為費用會降低每年的可複利本金。'],
      ['工具包含交易稅與手續費嗎？', '此工具聚焦年度內扣費用，不含交易稅、申購費或平台費。'],
    ],
  },
  {
    slug: 'stock-trading-calculator',
    tab: 'stock',
    title: '台股交易獲利計算機｜股票、ETF、當沖與交易成本',
    description: 'FinKit 台股交易獲利計算機支援股票、ETF、當沖與債券 ETF 常見交易稅率，估算手續費、交易稅與淨損益。',
    h1: '台股交易獲利計算機',
    intro: '交易前先扣除稅費與手續費，避免只看價差而高估實際獲利。',
    keywords: ['台股交易計算', '股票手續費', '證交稅', 'ETF 交易成本', '當沖'],
    features: ['買賣價格與股數', '手續費折扣與最低手續費', '稅費後淨損益'],
    faq: [
      ['ETF 和股票稅率一樣嗎？', '不同商品稅率可能不同，工具提供常見類型估算。'],
      ['實際成交成本會完全一樣嗎？', '不一定，仍需以券商、交易所與商品規則為準。'],
    ],
  },
  {
    slug: 'dividend-health-premium-calculator',
    tab: 'dividend',
    title: '配息與二代健保補充保費試算｜股息、ETF 配息與單次門檻',
    description: '估算全年股息、單次配息與二代健保補充保費影響，協助存股與 ETF 配息族理解現金流。',
    h1: '配息與二代健保補充保費試算',
    intro: '配息不是只看殖利率，還要看單次給付門檻與補充保費影響。',
    keywords: ['配息試算', '二代健保', '補充保費', '股息', 'ETF 配息'],
    features: ['股數、每股配息與配息頻率', '全年股息與單次配息', '補充保費估算'],
    faq: [
      ['補充保費門檻是多少？', '工具以單次給付達 2 萬元門檻與 2.11% 估算，實際規定請以官方公告為準。'],
      ['配息越高越好嗎？', '不一定。需同時看總報酬、費用、稅費與資本利得。'],
    ],
  },
  {
    slug: 'unit-dividend-calculator',
    tab: 'unit',
    title: '單位數與配息試算｜ETF、基金、保單帳戶單位數與配息估算',
    description: 'FinKit 單位數與配息試算工具適用 ETF、基金或保單帳戶型商品，估算投入金額、單位淨值、持有單位數與配息現金流。',
    h1: '單位數與配息試算工具',
    intro: '把投入金額、單位淨值與配息假設轉成可理解的單位數與現金流，適合基金、ETF 與帳戶型商品初步估算。',
    keywords: ['單位數試算', '配息試算', '基金單位數', 'ETF 配息', '保單帳戶', '單位淨值'],
    features: ['投入金額與單位淨值', '持有單位數估算', '配息金額與現金流試算'],
    faq: [
      ['單位數試算適合哪些商品？', '適合用單位淨值或每單位配息計算的 ETF、基金、境外基金或部分帳戶型商品。'],
      ['配息等於投資收益嗎？', '不一定。配息可能來自收益或本金，仍應同時看總報酬與淨值變化。'],
    ],
  },
  {
    slug: 'irr-calculator',
    tab: 'irr',
    title: 'IRR 年化報酬率試算｜躉繳、領回金額與持有期間換算',
    description: 'FinKit IRR 試算工具把投入金額、領回金額與持有年數換算成等效年化報酬率，適合比較躉繳商品、保單、基金或投資方案。',
    h1: 'IRR 年化報酬率試算工具',
    intro: '不要只看總共領回多少，把時間一起算進去，才能比較不同投資方案的等效年化報酬率。',
    keywords: ['IRR 試算', '年化報酬率', '躉繳試算', '投資報酬率', '保單報酬率', '基金報酬率'],
    features: ['投入與領回金額', '持有年數換算', '等效年化報酬率估算'],
    faq: [
      ['IRR 和總報酬率差在哪？', '總報酬率只看賺多少，IRR 會把持有時間納入，較適合比較不同年期方案。'],
      ['IRR 越高就一定越好嗎？', '不一定。仍要看流動性、風險、費用、稅務與商品條款。'],
    ],
  },
  {
    slug: 'fcn-calculator',
    tab: 'fcn',
    title: 'FCN 試算工具｜KO、Strike、KI 與標的價格情境分析',
    description: 'FinKit FCN 試算工具估算 FCN 常見 KO、Strike、KI 價位、配息、損益兩平與標的到期情境損益。',
    h1: 'FCN 結構型商品試算工具',
    intro: 'FCN 風險高且條款複雜，使用前應先量化接股、下跌與提前出場情境。',
    keywords: ['FCN 試算', '結構型商品', 'KO', 'Strike', 'KI', '標的價格'],
    features: ['KO、Strike、KI 價位', '總配息與損益兩平', '多標的價格與到期情境損益'],
    faq: [
      ['FCN 是保本商品嗎？', '多數 FCN 並非保本，若標的下跌可能承擔接股或本金損失。'],
      ['工具能取代商品說明書嗎？', '不能。實際條件、觀察日與風險仍需以商品說明書為準。'],
    ],
  },
  {
    slug: 'fire-calculator',
    tab: 'fire',
    title: 'FIRE 退休數字計算機｜財務自由目標資產試算',
    description: '用年支出、被動收入、目前投資資產與安全提領率，估算 FIRE 財務自由目標資產與達成進度。',
    h1: 'FIRE 退休數字計算機',
    intro: '先估算財務自由需要的投資資產，再回推儲蓄率與投資計畫。',
    keywords: ['FIRE', '財務自由', '退休數字', '安全提領率', '被動收入'],
    features: ['FIRE Number', '達成進度', '距離目標缺口'],
    faq: [
      ['FIRE Number 怎麼算？', '常見方式是以年支出扣除被動收入後，再除以安全提領率。'],
      ['FIRE 只需要投資資產嗎？', '還需要考量保險、稅務、住房、醫療與支出彈性。'],
    ],
  },
  {
    slug: 'inflation-calculator',
    tab: 'inflation',
    title: '通膨購買力計算機｜未來生活費與實質價值試算',
    description: 'FinKit 通膨計算機估算同一筆錢在未來的實質購買力，以及維持同樣生活水準需要的未來金額。',
    h1: '通膨購買力計算機',
    intro: '長期理財不能只看名目金額，還要看通膨後的實質購買力。',
    keywords: ['通膨計算機', '購買力', '實質價值', '未來生活費'],
    features: ['目前金額實質價值', '未來成本估算', '通膨率與年限調整'],
    faq: [
      ['通膨率要怎麼設定？', '可用長期平均、個人生活支出漲幅或保守情境設定。'],
      ['投資報酬要扣掉通膨嗎？', '若評估實質購買力，應看扣除通膨後的實質報酬。'],
    ],
  },
  {
    slug: 'foreign-exchange-calculator',
    tab: 'forex',
    title: '匯率換算工具｜美元、台幣、日圓與多幣別試算',
    description: 'FinKit 匯率換算工具抓取公開匯率 API，並可輸入手動成交匯率，方便比對銀行牌告與實際換匯成本。',
    h1: '匯率換算工具',
    intro: '海外投資、旅遊換匯與外幣資產盤點前，先用匯率工具快速估算。',
    keywords: ['匯率換算', '美元台幣', '日圓匯率', '外幣投資', '換匯'],
    features: ['多幣別換算', '即時參考匯率', '手動成交匯率覆寫'],
    faq: [
      ['匯率是即時成交價嗎？', '不是。工具使用公開參考匯率，實際成交仍以銀行或券商牌告為準。'],
      ['可以用來估海外投資資產嗎？', '可以作為初步換算，正式報表仍應依實際匯率與稅務規則處理。'],
    ],
  },
  {
    slug: 'taiwan-overseas-income-tax-calculator',
    tab: 'tax',
    title: '海外所得與最低稅負試算｜台灣投資人稅務估算工具',
    description: 'FinKit 海外所得與最低稅負試算工具用所得淨額或一般所得稅額，初步估算海外所得配置額度。',
    h1: '海外所得與最低稅負試算',
    intro: '海外投資需留意最低稅負與基本所得額，先用工具做初步情境估算。',
    keywords: ['海外所得', '最低稅負', '基本所得額', '台灣稅務', '海外投資'],
    features: ['輸入所得或稅額模式', '一般所得稅估算', '海外所得配置額度'],
    faq: [
      ['這能當作報稅依據嗎？', '不能。稅務結果應以財政部公告與專業稅務意見為準。'],
      ['海外所得一定會課稅嗎？', '需依基本所得額、免稅額與個人情況判斷。'],
    ],
  },
];

const basePages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/about.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/privacy.html', priority: '0.7', changefreq: 'monthly' },
  { url: '/terms.html', priority: '0.6', changefreq: 'monthly' },
  { url: '/disclaimer.html', priority: '0.6', changefreq: 'monthly' },
  { url: '/contact.html', priority: '0.6', changefreq: 'monthly' },
];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const jsonLd = (tool) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/tools/${tool.slug}.html#webpage`,
      url: `${SITE_URL}/tools/${tool.slug}.html`,
      name: tool.title,
      description: tool.description,
      inLanguage: 'zh-TW',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: tool.keywords.map((name) => ({ '@type': 'Thing', name })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'FinKit', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '理財工具', item: `${SITE_URL}/tools/${tool.slug}.html` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: tool.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
});

const renderToolPage = (tool) => `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(tool.title)}｜FinKit</title>
    <meta name="description" content="${escapeHtml(tool.description)}" />
    <meta name="keywords" content="${escapeHtml(['FinKit', ...tool.keywords].join(', '))}" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-4463068342710380" />
    <link rel="canonical" href="${SITE_URL}/tools/${tool.slug}.html" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_TW" />
    <meta property="og:site_name" content="FinKit" />
    <meta property="og:title" content="${escapeHtml(tool.title)}｜FinKit" />
    <meta property="og:description" content="${escapeHtml(tool.description)}" />
    <meta property="og:url" content="${SITE_URL}/tools/${tool.slug}.html" />
    <meta property="og:image" content="${SITE_URL}/icon.png" />
    <meta name="twitter:card" content="summary" />
    <script type="application/ld+json">${JSON.stringify(jsonLd(tool))}</script>
    <style>
      body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.7}
      main{max-width:960px;margin:0 auto;padding:48px 20px}
      a{color:#0369a1;font-weight:700}
      .hero{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:32px;box-shadow:0 18px 45px rgba(15,23,42,.08)}
      h1{font-size:clamp(2rem,5vw,3.25rem);line-height:1.15;margin:0 0 16px}
      h2{margin-top:32px}
      .chips{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}
      .chip{border:1px solid #bae6fd;background:#f0f9ff;border-radius:8px;padding:6px 10px;font-size:.9rem;font-weight:700;color:#075985}
      .cta{display:inline-flex;margin-top:20px;border-radius:8px;background:#0f172a;color:#fff;padding:12px 18px;text-decoration:none}
      .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
      .panel{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px}
      footer{margin-top:40px;color:#64748b;font-size:.9rem}
    </style>
  </head>
  <body>
    <main>
      <nav><a href="/">FinKit</a> / 理財工具</nav>
      <section class="hero">
        <h1>${escapeHtml(tool.h1)}</h1>
        <p>${escapeHtml(tool.intro)}</p>
        <div class="chips">${tool.keywords.map((keyword) => `<span class="chip">${escapeHtml(keyword)}</span>`).join('')}</div>
        <a class="cta" href="/?tool=${encodeURIComponent(tool.tab)}">開啟互動試算工具</a>
      </section>
      <section>
        <h2>可以用來做什麼</h2>
        <div class="grid">
          ${tool.features.map((feature) => `<div class="panel">${escapeHtml(feature)}</div>`).join('')}
        </div>
      </section>
      <section>
        <h2>常見問題</h2>
        ${tool.faq.map(([question, answer]) => `<div class="panel"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></div>`).join('')}
      </section>
      <footer>
        <p>FinKit 工具僅供教育與試算參考，不構成投資、稅務、保險或法律建議。</p>
        <p><a href="/privacy.html">隱私權政策</a> · <a href="/terms.html">服務條款</a> · <a href="/disclaimer.html">免責聲明</a></p>
      </footer>
    </main>
  </body>
</html>
`;

const renderSitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${basePages
  .map(
    (page) => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join('\n')}
  <url>
    <loc>${SITE_URL}/tools/</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${tools
  .map(
    (tool) => `  <url>
    <loc>${SITE_URL}/tools/${tool.slug}.html</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const renderToolsIndex = () => `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FinKit 理財工具目錄｜台灣理財試算、投資、房貸與退休工具</title>
    <meta name="description" content="瀏覽 FinKit 全部理財工具：理財健檢、預算、淨資產、複利、定期定額、房貸、退休提領、FCN、稅務與匯率試算。" />
    <meta name="robots" content="index, follow" />
    <meta name="google-adsense-account" content="ca-pub-4463068342710380" />
    <link rel="canonical" href="${SITE_URL}/tools/" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'FinKit 理財工具目錄',
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.h1,
        url: `${SITE_URL}/tools/${tool.slug}.html`,
      })),
    })}</script>
    <style>
      body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.7}
      main{max-width:1100px;margin:0 auto;padding:48px 20px}
      a{color:#0369a1;font-weight:700;text-decoration:none}
      h1{font-size:clamp(2rem,5vw,3.25rem);line-height:1.15;margin:0 0 16px}
      .intro{max-width:760px;color:#475569}
      .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-top:28px}
      .card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;box-shadow:0 12px 30px rgba(15,23,42,.06)}
      .card p{color:#64748b}
      footer{margin-top:40px;color:#64748b;font-size:.9rem}
    </style>
  </head>
  <body>
    <main>
      <nav><a href="/">FinKit</a></nav>
      <h1>FinKit 理財工具目錄</h1>
      <p class="intro">從理財健檢、現金流、投資成本、房貸到退休提領，這裡整理 FinKit 的主要試算工具與使用情境。每個工具都有獨立說明頁與互動試算入口。</p>
      <section class="grid">
        ${tools.map((tool) => `<article class="card"><h2><a href="/tools/${tool.slug}.html">${escapeHtml(tool.h1)}</a></h2><p>${escapeHtml(tool.description)}</p></article>`).join('')}
      </section>
      <footer>
        <p>FinKit 工具僅供教育與試算參考，不構成投資、稅務、保險或法律建議。</p>
      </footer>
    </main>
  </body>
</html>
`;

await mkdir(join(publicDir, 'tools'), { recursive: true });
for (const tool of tools) {
  await writeFile(join(publicDir, 'tools', `${tool.slug}.html`), renderToolPage(tool));
}
await writeFile(join(publicDir, 'tools', 'index.html'), renderToolsIndex());
await writeFile(join(publicDir, 'sitemap.xml'), renderSitemap());

console.log(`Generated ${tools.length} SEO landing pages, tools index, and sitemap.xml`);
