# FinKit

FinKit 是為台灣使用者打造的理財輔助工具箱，提供理財健檢、預算、淨資產、緊急預備金、負債、風險屬性、資產配置、複利、定期定額、費用拖累、台股交易、配息、房貸、買租比較、FIRE、退休提領、保險缺口、通膨、匯率、海外所得與 FCN 試算。

使用者可以用簡易本機登入建立個人檔，試算資料會依暱稱/Email 分開暫存在同一台裝置的瀏覽器 localStorage。這不是雲端帳號系統，不會自動跨裝置同步。

## 海外所得與最低稅負

FinKit 提供獨立的 115 年度（2026 年所得、2027 年 5 月申報）海外所得／最低稅負 AMT 專頁：

- `/tools/taiwan-overseas-income-tax-calculator.html`
- `/learn/taiwan-overseas-income-tax-guide.html`

計算器會區分「海外所得 100 萬元計入門檻」與「基本所得額 750 萬元扣除額」，並依一般所得稅額反推不增加最低稅負的海外所得參考空間。收入自動估算模式支援單身／夫妻、薪資、股利、其他所得、扶養與扣除額；若已有正式報稅試算的一般所得稅額，也可直接使用已知稅額模式反推。

舊 SPA 側欄的「海外所得」入口會導向新版旗艦頁，避免繼續使用舊年度混合參數。

## SEO / AEO 與內容品質

建置流程會自動產生搜尋與 AI 可理解的靜態內容，並在部署前做 publisher-content 品質檢查：

- 每個主要工具都有獨立 canonical URL、title、description 與 sitemap entry
- 24 個工具 landing pages 都必須通過最低可見內容量檢查
- 23 個一般工具頁額外加入人工策劃的使用順序、案例、判讀與常見誤區
- 8 篇核心理財文章加入額外決策與壓力測試內容
- 工具頁加入 `SoftwareApplication` structured data
- 內容頁使用 `Article`、FAQ 與 Breadcrumb structured data
- 海外所得頁加入官方財政部來源、FAQ、更新日期與直接答案區塊
- `public/llms.txt` 提供 FinKit 的 AI discovery / 重要頁面索引
- `public/editorial-policy.html` 說明內容審閱、資料來源與更正原則
- `public/methodology.html` 說明主要公式、資料來源與限制
- build 若偵測到 AdSense 被放到導航、政策、首頁 app shell、工具目錄或內容過薄頁面，會直接失敗

相關建置指令：

```bash
npm run seo:generate
npm run content:generate
npm run tax:generate
npm run quality:articles
npm run quality:article-depth
npm run quality:enrich
npm run seo:postprocess
npm run quality:finalize
npm run quality:audit
```

`npm run build` 會在 Vite 建置前自動依序執行上述流程。

## Google AdSense

FinKit 採「內容先於廣告」的廣告庫存政策，避免 Google 廣告出現在沒有 publisher content 或主要用途是導航、警示、操作的畫面。

- Publisher：`ca-pub-4463068342710380`
- `public/ads.txt` 使用對應的 `pub-4463068342710380`
- 首頁 SPA、互動計算器、工具目錄、知識中心目錄、About、Privacy、Terms、Disclaimer、Contact 一律不載入 AdSense ad-serving script
- AdSense site code 只會出現在通過可見內容門檻的獨立長文 article pages
- `quality:audit` 會檢查每個帶 AdSense 的頁面必須屬於文章內容頁且內容量達標
- Privacy / Terms / Disclaimer / Contact 等必要信任頁面持續保留，但不作為廣告庫存

網站端程式碼完成後，仍需在 Google AdSense 後台重新要求審查。審核通過後可使用 Auto ads，但目前程式端已把可出現廣告的 URL 範圍限制在內容充足的文章頁。

## 快速工作台

FinKit v5 新增一層不影響既有計算公式的使用體驗工具：

- `Ctrl/Cmd + K` 快速搜尋側欄工具
- 收藏常用工具
- 自動記錄最近使用工具
- 一鍵下載 FinKit 本機資料 JSON 備份
- 從備份檔還原到其他瀏覽器或裝置

備份檔可能包含本機個人檔與試算內容，請由使用者自行妥善保存。FinKit 不會因為使用備份功能而把資料上傳到外部伺服器。

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

Pull Request 會自動執行 build 檢查；只有合併或直接 push 到 `main` 後才會執行 GitHub Pages 部署。

## 報價快取

```bash
npm run quotes:update
```

此指令會更新 `public/data/us-closes.json`，供 FCN 標的價格試算帶入常用美股與 ETF 的最新收盤價。

## 營利化與索引檔案

- `public/ads.txt`
- `public/llms.txt`
- `public/about.html`
- `public/editorial-policy.html`
- `public/methodology.html`
- `public/privacy.html`
- `public/terms.html`
- `public/disclaimer.html`
- `public/contact.html`
- `public/robots.txt`
- `public/sitemap.xml`

本站工具僅供教育與試算參考，不構成投資、稅務、保險或法律建議。
