import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const learnDir = join(fileURLToPath(new URL('../public', import.meta.url)), 'learn');
const depth = {
  'personal-finance-roadmap': '一個簡單的判斷方式是：如果今天市場完全休市一年，你的財務系統還能正常運作嗎？如果答案是否定的，代表問題可能不在投資標的，而在現金流、負債或安全墊。先把不依賴市場上漲也能成立的部分做好，長期投資才有空間承受波動。',
  'dca-investing-guide': '定期定額也可以搭配「投入上限」與「再平衡規則」。例如每月固定投入，但單一資產達到總投資資產某個上限後，就把新增資金轉向其他低配資產。這能避免熱門資產連續上漲時，投資組合不知不覺變成過度集中。',
  'emergency-fund-guide': '判斷預備金是否足夠時，不妨模擬一個最實際的問題：如果明天收入中斷，哪些支出能立刻停止、哪些不能？把房租房貸、保費、飲食、交通、照護等無法快速取消的項目加總，比直接拿平常總支出乘六個月更接近真正需要的安全墊。',
  'debt-payoff-guide': '還款過程也應追蹤「每月利息支出是否下降」。只看本金餘額有時感受不明顯，但利息逐月減少代表現金流正在被釋放。等高利負債清掉後，把原本還款金額直接自動轉成預備金或投資，能避免生活支出立刻把這筆空間吃掉。',
  'mortgage-affordability-guide': '除了利率，房屋持有年限也是重要變數。若幾年內可能因工作、家庭或學區搬遷，買賣交易成本與資金綁定會更重要；如果預計長期居住，短期價格波動的重要性則相對下降。把「最可能住多久」納入試算，通常比猜明年房價更有決策價值。',
  'retirement-withdrawal-guide': '退休後的支出也不一定每年以相同速度增加。旅遊與娛樂可能在退休初期較高，醫療與照護可能在後期提高。若只用一條固定通膨曲線，模型會忽略支出結構變化。規劃時可把必要生活、彈性消費與醫療照護分成不同桶，分別做壓力測試。',
  'asset-allocation-guide': '如果不知道該從什麼比例開始，可以先反推最大可接受損失。例如一個人最多能接受整體資產短期回撤 15%，就不應直接照搬高股票比例的範例配置。配置不是追求理論最高報酬，而是把市場波動限制在自己還能繼續執行計畫的範圍。',
  'fcn-risk-guide': '最後還要比較「不用 FCN 時會怎麼做」。如果原本就願意在某個價格買進該股票，FCN 的 Strike 可能具有明確比較基準；但如果只是因為票息高才接受一個原本不會持有的標的，風險來源其實是被票息改變了決策標準，而不是多得到免費收益。',
};

const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let count = 0;
for (const [slug, paragraph] of Object.entries(depth)) {
  const path = join(learnDir, `${slug}.html`);
  let html = await readFile(path, 'utf8');
  if (html.includes('data-finkit-depth="reviewed"')) continue;
  const marker = '      <section class="panel">\n        <h2>檢查清單</h2>';
  if (!html.includes(marker)) throw new Error(`Missing checklist marker for ${slug}`);
  html = html.replace(marker, `      <section data-finkit-depth="reviewed"><h2>再多做一個壓力測試</h2><p>${esc(paragraph)}</p></section>\n${marker}`);
  await writeFile(path, html);
  count += 1;
}
console.log(`Article depth enrichment complete: ${count} articles received an additional reviewed stress-test section`);
