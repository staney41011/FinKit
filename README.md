# FinKit

FinKit 是為台灣使用者打造的理財輔助工具箱，提供理財健檢、預算、淨資產、緊急預備金、負債、風險屬性、資產配置、複利、定期定額、費用拖累、台股交易、配息、房貸、買租比較、FIRE、退休提領、保險缺口、通膨、匯率、海外所得與 FCN 試算。

使用者可以用簡易本機登入建立個人檔，試算資料會依暱稱/Email 分開暫存在同一台裝置的瀏覽器 localStorage。這不是雲端帳號系統，不會跨裝置同步。

## 開發

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

## 報價快取

```bash
npm run quotes:update
```

此指令會更新 `public/data/us-closes.json`，供 FCN 標的價格試算帶入常用美股與 ETF 的最新收盤價。

## 營利化基礎

- `public/ads.txt`
- `public/privacy.html`
- `public/terms.html`
- `public/disclaimer.html`
- `public/contact.html`
- `public/robots.txt`
- `public/sitemap.xml`

本站工具僅供教育與試算參考，不構成投資、稅務、保險或法律建議。
