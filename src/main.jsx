import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ⚠️ 注意：我移除了 "import './index.css'" 這行
// 因為我們改用 CDN 了，不需要它，這樣就不會報錯了！

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


