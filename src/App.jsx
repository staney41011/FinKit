import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, TrendingUp, PieChart, Briefcase, RefreshCw, Menu, X, 
  AlertTriangle, Home, Percent, Globe, Camera, BookOpen, 
  BarChart3, Coins, Target, User, ShieldCheck,
  Building, TrendingDown, Copy, ArrowRight, Lock, RotateCcw, Download
} from 'lucide-react';

// ==========================================
// 核心 Hooks
// ==========================================
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) { return defaultValue; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }, [key, value]);
  return [value, setValue];
}

const fmt = (num) => new Intl.NumberFormat('zh-TW').format(Math.floor(num));

// ==========================================
// UI 組件
// ==========================================

const InputGroup = ({ label, value, onChange, prefix, suffix, type = "number", step = "1", placeholder, note, readOnly = false }) => (
  <div className="mb-5 no-print group">
    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">{label}</label>
    <div className="relative rounded-lg shadow-sm">
      {prefix && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-amber-600 font-medium sm:text-sm">{prefix}</span></div>}
      <input
        type={type} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`block w-full sm:text-sm rounded-lg p-3.5 
        ${readOnly ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500'}
        border transition-all font-mono tracking-wide placeholder:text-slate-400
        ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
      />
      {suffix && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="text-slate-500 sm:text-sm">{suffix}</span></div>}
    </div>
    {note && <p className="mt-1.5 text-xs text-slate-400">{note}</p>}
  </div>
);

const ResultCard = ({ title, value, subtext, highlight = false, colorClass = "text-amber-600" }) => (
  <div className={`p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group
    ${highlight ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">{title}</p>
    <p className={`text-3xl font-bold mt-2 tracking-tight font-mono ${highlight ? colorClass : 'text-slate-800'}`}>{value}</p>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

// 截圖與複製功能
const SectionHeader = ({ title, icon: Icon, description }) => {
  const handleCapture = () => {
    const element = document.getElementById('capture-area');
    if (!element || !window.html2canvas) return alert('截圖功能載入中，請稍後再試');
    
    // 顯示載入中
    const btn = document.getElementById('btn-capture');
    if(btn) btn.innerText = '處理中...';

    window.html2canvas(element, { 
        backgroundColor: '#f8fafc',
        scale: 2, // 高解析度
        logging: false
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `FinKit_${title}.png`;
      link.href = canvas.toDataURL();
      link.click();
      if(btn) btn.innerText = '存成圖片';
    }).catch(err => {
        alert('截圖失敗，請手動截圖');
        if(btn) btn.innerText = '存成圖片';
    });
  };

  return (
    <div className="mb-8 flex justify-between items-start border-b border-slate-200 pb-6 no-print">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-500 shadow-sm"><Icon size={24} /></div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl font-light">{description}</p>
      </div>
      <div className="flex gap-2">
        <button id="btn-capture" onClick={handleCapture} className="px-3 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-md">
          <Camera size={16} /> 存成圖片
        </button>
      </div>
    </div>
  );
};

// 互動式圖表 (含十字線與軸標示)
const InteractiveChart = ({ data, color="#d97706", data2, title="資產走勢" }) => {
  const [hoverVal, setHoverVal] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);
  const containerRef = useRef(null);

  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), ...(data2 ? data2.map(d => d.value) : [0]));
  const minVal = 0;
  
  const getPoints = (dataset) => dataset.map((d, i) => {
    const x = (i / (dataset.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 100;
    return `${x},${y}`;
  }).join(' ');

  const handleMouseMove = (e) => {
      if(!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const index = Math.min(Math.max(0, Math.round((x / width) * (data.length - 1))), data.length - 1);
      setHoverPos((index / (data.length - 1)) * 100);
      setHoverVal({
          label: `${index}期`,
          val1: data[index].value,
          val2: data2 ? data2[index].value : null
      });
  };

  return (
    <div className="w-full mt-6 mb-2 no-print select-none">
      <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>${fmt(maxVal)}</span>
          <span>{title}</span>
      </div>
      <div 
        ref={containerRef}
        className="relative h-48 border-l border-b border-slate-300 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {setHoverVal(null); setHoverPos(null);}}
        onTouchMove={(e) => handleMouseMove(e.touches[0])} // 手機支援
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            {/* Grid */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeWidth="0.5" />

            {/* Lines */}
            <polyline fill="none" stroke={color} strokeWidth="2" points={getPoints(data)} vectorEffect="non-scaling-stroke" />
            {data2 && <polyline fill="none" stroke="#94a3b8" strokeWidth="2" points={getPoints(data2)} vectorEffect="non-scaling-stroke" strokeDasharray="4" />}
            
            {/* Hover Line */}
            {hoverPos !== null && (
                <line x1={hoverPos} y1="0" x2={hoverPos} y2="100" stroke="#64748b" strokeWidth="1" strokeDasharray="2" vectorEffect="non-scaling-stroke" />
            )}
        </svg>

        {/* Tooltip */}
        {hoverVal && (
            <div className="absolute top-0 bg-slate-800 text-white text-xs p-2 rounded shadow-lg pointer-events-none z-10" style={{ left: `${Math.min(80, Math.max(0, hoverPos))}%`, transform: 'translate(-50%, -100%)' }}>
                <p className="font-bold mb-1 border-b border-slate-600 pb-1">{hoverVal.label}</p>
                <p className="text-amber-400">主: ${fmt(hoverVal.val1)}</p>
                {hoverVal.val2 && <p className="text-slate-300">副: ${fmt(hoverVal.val2)}</p>}
            </div>
        )}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
          <span>Start</span>
          <span>End</span>
      </div>
    </div>
  );
};

// ==========================================
// 計算機模組
// ==========================================

const StockCalculator = () => {
  const [buyPrice, setBuyPrice] = useStickyState(100, 'v4_stk_buy');
  const [sellPrice, setSellPrice] = useStickyState(110, 'v4_stk_sell');
  const [shares, setShares] = useStickyState(1000, 'v4_stk_sh');
  const [discount, setDiscount] = useStickyState(60, 'v4_stk_disc');
  const [type, setType] = useStickyState('stock', 'v4_stk_type');

  const calculate = () => {
    let taxRate = 0.003; 
    if (type === 'day') taxRate = 0.0015;
    if (type === 'etf') taxRate = 0.001;
    if (type === 'bond') taxRate = 0;

    const feeRate = 0.001425;
    const discVal = discount / 100;
    const buyVal = buyPrice * shares; const sellVal = sellPrice * shares;
    const buyFee = Math.floor(Math.max(20, buyVal * feeRate * discVal)); 
    const sellFee = Math.floor(Math.max(20, sellVal * feeRate * discVal));
    const tax = Math.floor(sellVal * taxRate);
    return { profit: sellVal - sellFee - tax - buyVal - buyFee, tax, buyFee, sellFee };
  };
  const res = calculate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="台股交易獲利" icon={BarChart3} description="支援個股、當沖、ETF (0.1%) 及債券 (0%) 稅率。" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <div className="mb-6"><label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">交易種類</label><div className="grid grid-cols-2 gap-3">{[{id:'stock', name:'個股 (0.3%)'}, {id:'day', name:'當沖 (0.15%)'}, {id:'etf', name:'ETF (0.1%)'}, {id:'bond', name:'債券ETF (0%)'}].map(t => (<button key={t.id} onClick={()=>setType(t.id)} className={`py-2.5 text-xs font-medium rounded-lg border transition-all ${type===t.id ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-white'}`}>{t.name}</button>))}</div></div>
          <InputGroup label="買入價格" value={buyPrice} onChange={setBuyPrice} prefix="$" />
          <InputGroup label="賣出價格" value={sellPrice} onChange={setSellPrice} prefix="$" />
          <InputGroup label="股數" value={shares} onChange={setShares} suffix="股" />
          
          {/* 手續費：輸入框 + 拉桿 同步 */}
          <div className="mb-5 group">
             <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">手續費折數 ({discount}折)</label>
             <div className="flex gap-4 items-center">
                 <input type="range" min="10" max="100" step="5" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/>
                 <input type="number" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} className="w-20 p-2 border border-slate-300 rounded-md text-center font-mono text-sm focus:ring-amber-500" />
             </div>
             <p className="mt-1.5 text-xs text-slate-400">10折=原價, 28折=0.28</p>
          </div>
        </div>
        <div className="space-y-4">
          <ResultCard title="預估淨損益" value={`$${fmt(res.profit)}`} highlight={true} colorClass={res.profit >= 0 ? "text-red-500" : "text-green-600"} />
          <div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><p className="text-xs text-slate-500 mb-1">總手續費</p><p className="font-bold text-slate-700 font-mono">${res.buyFee + res.sellFee}</p></div><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><p className="text-xs text-slate-500 mb-1">證交稅</p><p className="font-bold text-slate-700 font-mono">${res.tax}</p></div></div>
        </div>
      </div>
    </div>
  );
};

// FCN 重做：專業結構型商品分析
const FcnCalculator = () => {
    const [strike, setStrike] = useStickyState(100, 'v4_fcn_s'); // 履約價
    const [kiBarrier, setKiBarrier] = useStickyState(65, 'v4_fcn_ki'); // KI %
    const [koBarrier, setKoBarrier] = useStickyState(105, 'v4_fcn_ko'); // KO %
    const [yieldRate, setYieldRate] = useStickyState(8, 'v4_fcn_y'); // 年化配息
    const [days, setDays] = useStickyState(90, 'v4_fcn_d'); // 天期
    const [spot, setSpot] = useStickyState(100, 'v4_fcn_spot'); // 現價 (模擬用)

    const kiPrice = strike * (kiBarrier / 100);
    const koPrice = strike * (koBarrier / 100);
    // 損益兩平 = 履約價 * (1 - (年化 * 天數/365))
    const totalCouponPercent = (yieldRate / 100) * (days / 365);
    const breakEven = strike * (1 - totalCouponPercent);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="FCN / ELN 結構型商品" icon={PieChart} description="連結股權與固定收益的進階分析。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <InputGroup label="履約價 (Strike Price)" value={strike} onChange={setStrike} prefix="$" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="KI 保護 (Down-in)" value={kiBarrier} onChange={setKiBarrier} suffix="%" />
                        <InputGroup label="KO 提前 (Call)" value={koBarrier} onChange={setKoBarrier} suffix="%" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="產品天期 (Days)" value={days} onChange={setDays} suffix="天" />
                        <InputGroup label="年化配息率 (Yield)" value={yieldRate} onChange={setYieldRate} suffix="%" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-amber-400 font-bold tracking-wider text-xs uppercase">Scenario Analysis</span>
                            <span className="text-slate-400 text-xs">到期情境分析</span>
                        </div>
                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span className="text-slate-300">KI 觸發價</span>
                                <span className="text-red-400 font-bold">${fmt(kiPrice)}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span className="text-slate-300">KO 提前出場</span>
                                <span className="text-green-400 font-bold">${fmt(koPrice)}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                                <span className="text-amber-200">損益兩平點 (Break-even)</span>
                                <span className="text-amber-400 font-bold text-lg">${breakEven.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-relaxed">
                        <strong>邏輯解析：</strong><br/>
                        若股價跌破 <strong>${fmt(kiPrice)}</strong> (KI) 且未漲回，您將以 Strike 價格接股票。<br/>
                        您的實質持股成本為 <strong>${breakEven.toFixed(2)}</strong> (扣除配息後)。
                    </div>
                </div>
            </div>
        </div>
    );
};

// 匯率 (自動抓取 + 手動)
const ForexCalculator = () => {
    const [amount, setAmount] = useStickyState(1000, 'v4_fx_amt');
    const [rate, setRate] = useState(32.5);
    const [loading, setLoading] = useState(false);

    // 自動抓取匯率
    useEffect(() => {
        setLoading(true);
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(res => res.json())
            .then(data => {
                if(data && data.rates && data.rates.TWD) {
                    setRate(data.rates.TWD);
                }
            })
            .catch(err => console.log('匯率抓取失敗，使用預設值'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="即時匯率換算" icon={Globe} description="自動抓取網路即時匯率，亦可手動修正。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                    <InputGroup label="美金 (USD)" value={amount} onChange={setAmount} prefix="$" />
                    <InputGroup 
                        label={loading ? "匯率更新中..." : "目前匯率 (USD/TWD)"} 
                        value={rate} 
                        onChange={(e)=>setRate(e.target.value)} 
                        note="可手動修改成交匯率"
                    />
                </div>
                <div className="space-y-4">
                    <ResultCard title="約合台幣 (TWD)" value={`$${fmt(amount * rate)}`} highlight={true} />
                </div>
            </div>
        </div>
    );
};

// 其他計算機 (維持原樣但套用新UI)
const TaxCalculator = () => {
  const [mode, setMode] = useState('income'); 
  const [inputValue, setInputValue] = useStickyState(1500000, 'v4_tax_val');
  const [result, setResult] = useState({});
  const AMT_EXEMPTION = 7500000; 
  const brackets = [{ limit: 610000, rate: 0.05, correction: 0, maxTax: 30500 }, { limit: 1330000, rate: 0.12, correction: 42700, maxTax: 116900 }, { limit: 2660000, rate: 0.20, correction: 149100, maxTax: 382900 }, { limit: 4980000, rate: 0.30, correction: 415100, maxTax: 1078900 }, { limit: Infinity, rate: 0.40, correction: 913100, maxTax: Infinity }];
  const calculateIncomeFromTax = (tax) => { if (tax <= 0) return 0; let bracket = brackets.find(b => tax <= b.maxTax); if (!bracket) bracket = brackets[brackets.length - 1]; return Math.floor((tax + bracket.correction) / bracket.rate); };
  useEffect(() => {
    let regularTax = 0, netIncome = 0;
    if (mode === 'income') { netIncome = Number(inputValue); let bracket = brackets.find(b => netIncome <= b.limit) || brackets[brackets.length - 1]; regularTax = Math.max(0, Math.floor(netIncome * bracket.rate - bracket.correction)); } else { regularTax = Number(inputValue); netIncome = calculateIncomeFromTax(regularTax); }
    let quota = (regularTax / 0.2) + AMT_EXEMPTION - netIncome; setResult({ regularTax, netIncome, quota: Math.max(1000000, Math.floor(quota)) });
  }, [inputValue, mode]);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="2025 海外所得額度" icon={Calculator} description="輸入「所得淨額」或「應繳稅額」，自動反推免稅額度。" />
      <div className="flex bg-slate-100 p-1 rounded-lg w-full max-w-md mx-auto border border-slate-200 mb-6"><button onClick={() => setMode('income')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'income' ? 'bg-white text-amber-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}>輸入 所得淨額</button><button onClick={() => setMode('tax')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'tax' ? 'bg-white text-amber-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}>輸入 應繳稅額</button></div>
      <div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-transparent"></div><InputGroup label={mode === 'income' ? "國內綜合所得淨額" : "今年應繳一般所得稅額"} value={inputValue} onChange={setInputValue} prefix="$" placeholder="請輸入金額"/><div className="mb-5 group"><div className="flex justify-between items-center mb-2"><label className="text-xs uppercase tracking-wider font-bold text-slate-400">基本稅額免稅額 (2025)</label><Lock size={12} className="text-slate-400"/></div><div className="relative rounded-lg bg-slate-50 border border-slate-200 p-3.5 flex justify-between items-center"><span className="text-slate-600 font-mono pl-7">$7,500,000</span><span className="text-[10px] text-slate-500 border border-slate-200 bg-white px-2 py-0.5 rounded uppercase tracking-wider">法定固定</span><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-400 sm:text-sm">$</span></div></div></div>{mode === 'tax' && <div className="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-xs text-slate-600 flex justify-between"><span>反推綜合所得淨額：</span><span className="font-mono text-amber-600 font-bold">${fmt(result.netIncome)}</span></div>}</div><div className="space-y-4"><ResultCard title="最佳海外所得配置額度" value={`$${fmt(result.quota)}`} subtext="在此金額內的海外收入，不需補繳最低稅負 (AMT)。" highlight={true} /><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><p className="text-xs text-slate-500 mb-1">一般所得稅</p><p className="text-lg font-bold text-slate-700 font-mono">${fmt(result.regularTax)}</p></div><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><p className="text-xs text-slate-500 mb-1">基本稅額門檻</p><p className="text-lg font-bold text-slate-700 font-mono">${fmt(result.regularTax)}</p></div></div></div></div>
    </div>
  );
};
const CompoundCalculator = () => {
  const [principal, setPrincipal] = useStickyState(100000, 'v4_cmp_p'); const [rate, setRate] = useStickyState(6, 'v4_cmp_r'); const [years, setYears] = useStickyState(20, 'v4_cmp_y'); const [compareMode, setCompareMode] = useState(false); const [compareRate, setCompareRate] = useStickyState(1.7, 'v4_cmp_cr');
  const calculate = (r) => { const P = Number(principal); const rateVal = Number(r)/100; let data = []; for(let i=0; i<=years; i++) data.push({ value: P * Math.pow((1 + rateVal), i) }); return { final: data[data.length-1].value, data }; };
  const res1 = calculate(rate); const res2 = calculate(compareRate);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="單筆複利效應" icon={TrendingUp} description="時間是財富最好的朋友。" /><div className="flex justify-end no-print mb-2"><button onClick={()=>setCompareMode(!compareMode)} className={`text-xs px-4 py-1.5 rounded-full border transition-all ${compareMode ? 'bg-amber-600 text-white border-amber-600' : 'text-slate-500 border-slate-300 hover:border-amber-500 hover:text-amber-600'}`}>{compareMode ? '關閉比較' : '開啟定存 PK'}</button></div><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="本金投入" value={principal} onChange={setPrincipal} prefix="$" /><InputGroup label="投資年化報酬率" value={rate} onChange={setRate} suffix="%" /><InputGroup label="投資年限" value={years} onChange={setYears} suffix="年" />{compareMode && <div className="pt-4 border-t border-slate-100 mt-4 animate-in fade-in"><InputGroup label="比較對象 (如定存) 利率" value={compareRate} onChange={setCompareRate} suffix="%" /></div>}</div><div className="space-y-4"><ResultCard title={`${years} 年後總資產`} value={`$${fmt(res1.final)}`} highlight={true} />{compareMode && <ResultCard title="定存對照組資產" value={`$${fmt(res2.final)}`} subtext={`相差 $${fmt(res1.final - res2.final)}`} colorClass="text-slate-500" />}<div className="bg-white p-4 rounded-xl border border-slate-200 no-print"><InteractiveChart data={res1.data} data2={compareMode ? res2.data : null} title="資產成長"/></div></div></div></div>
  );
};
const DcaCalculator = () => {
    const [monthly, setMonthly] = useStickyState(10000, 'v4_dca_m'); const [rate, setRate] = useStickyState(6, 'v4_dca_r'); const [years, setYears] = useStickyState(20, 'v4_dca_y');
    const calculate = () => { const pmt = Number(monthly); const r = Number(rate)/100/12; const n = Number(years)*12; let data = []; for(let i=0; i<=Number(years); i++) { let m = i*12; data.push({ value: m===0?0:pmt*(Math.pow(1+r,m)-1)/r }); } const fv = data[data.length-1].value; return { fv, total: pmt*n, data }; }; const res = calculate();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="定期定額" icon={RefreshCw} description="長期複利。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="月投金額" value={monthly} onChange={setMonthly} prefix="$" /><InputGroup label="年化報酬" value={rate} onChange={setRate} suffix="%" /><InputGroup label="年數" value={years} onChange={setYears} suffix="年" /></div><div className="space-y-4"><ResultCard title="累積資產" value={`$${fmt(res.fv)}`} highlight={true} /><div className="bg-white p-4 rounded-xl border border-slate-200 no-print"><InteractiveChart data={res.data} title="資產累積"/></div></div></div></div>
    );
};
const LoanCalculator = () => {
    const [loanAmount, setLoanAmount] = useStickyState(10000000, 'v4_loan_amt'); const [rate, setRate] = useStickyState(2.1, 'v4_loan_rate'); const [years, setYears] = useStickyState(30, 'v4_loan_yrs'); const [gracePeriod, setGracePeriod] = useStickyState(0, 'v4_loan_grace');
    const calculate = () => { const P = Number(loanAmount); const r = Number(rate) / 100 / 12; const graceMonths = Number(gracePeriod) * 12; const remainMonths = (Number(years) * 12) - graceMonths; const gracePayment = Math.round(P * r); const normalPayment = remainMonths > 0 ? Math.round(P * r * Math.pow(1 + r, remainMonths) / (Math.pow(1 + r, remainMonths) - 1)) : 0; return { gracePayment, normalPayment }; }; const res = calculate();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="房貸試算" icon={Home} description="含寬限期。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="貸款總金額" value={loanAmount} onChange={setLoanAmount} prefix="$" /><InputGroup label="年利率" value={rate} onChange={setRate} suffix="%" step="0.01" /><InputGroup label="總期限" value={years} onChange={setYears} suffix="年" /><InputGroup label="寬限期" value={gracePeriod} onChange={setGracePeriod} suffix="年" /></div><div className="space-y-4">{gracePeriod > 0 && <ResultCard title={`前 ${gracePeriod} 年月付金`} value={`$${fmt(res.gracePayment)}`} subtext="只繳利息" />}<ResultCard title={gracePeriod > 0 ? "寬限期後月付金" : "每月應繳本息"} value={`$${fmt(res.normalPayment)}`} highlight={true} /></div></div></div>
    );
};
const IrrCalculator = () => {
    const [prin, setPrin] = useStickyState(1000000, 'v4_irr_p'); const [final, setFinal] = useStickyState(1200000, 'v4_irr_f'); const [yrs, setYrs] = useStickyState(6, 'v4_irr_y'); const irr = (Math.pow(final/prin, 1/yrs)-1)*100;
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="IRR 試算" icon={Percent} description="躉繳試算。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="投入" value={prin} onChange={setPrin} prefix="$" /><InputGroup label="領回" value={final} onChange={setFinal} prefix="$" /><InputGroup label="年數" value={yrs} onChange={setYrs} suffix="年" /></div><div className="space-y-4"><ResultCard title="IRR" value={`${irr.toFixed(2)}%`} highlight={true} /></div></div></div>
    );
};
const RentVsBuy = () => { const [h, sH] = useStickyState(15000000, 'rvb_p'); const [r, sR] = useStickyState(30000, 'rvb_r'); const [i, sI] = useStickyState(6, 'rvb_i'); const [y, sY] = useStickyState(20, 'rvb_y'); const d = h*0.2; const l = h*0.8; const rt = 0.021/12; const n = 360; const m = l*rt*Math.pow(1+rt,n)/(Math.pow(1+rt,n)-1); const be = h*Math.pow(1.02, y)-(y<30?l*0.4:0); const re = d*Math.pow(1+i/100, y)+Math.max(0, m-r)*12*y; return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="買房 vs 租房" icon={Building} description="20年後資產 PK。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="房價" value={h} onChange={sH} prefix="$" /><InputGroup label="租金" value={r} onChange={sR} prefix="$" /><InputGroup label="投資報酬率" value={i} onChange={sI} suffix="%" /></div><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><ResultCard title="買房淨資產" value={`$${fmt(be)}`} highlight={be>re} /><ResultCard title="租房淨資產" value={`$${fmt(re)}`} highlight={re>be} /></div></div></div></div>); };
const FireCalculator = () => { const [e, sE] = useStickyState(600000, 'fire_e'); const [p, sP] = useStickyState(20000, 'fire_p'); const [a, sA] = useStickyState(2000000, 'fire_a'); const fn = Math.max(0, e-p*12)*25; const prog = Math.min(100, (a/fn)*100); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="FIRE 退休" icon={Target} description="4% 法則。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="年支出" value={e} onChange={sE} prefix="$" /><InputGroup label="勞保勞退(月)" value={p} onChange={sP} prefix="$" /><InputGroup label="目前資產" value={a} onChange={sA} prefix="$" /></div><div className="space-y-4"><div className="bg-white border border-slate-200 p-6 rounded-xl relative overflow-hidden shadow-sm"><p className="text-slate-400 text-xs uppercase mb-1 font-bold">FIRE Number</p><p className="text-3xl font-bold text-amber-500 mb-4 font-mono">${fmt(fn)}</p><div className="w-full bg-slate-100 rounded-full h-2 mb-1"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${prog}%` }}></div></div><p className="text-xs text-right text-slate-400">進度 {prog.toFixed(1)}%</p></div></div></div></div>); };
const InsuranceGap = () => { const [d, sD] = useStickyState(5000000, 'ins_d'); const [f, sF] = useStickyState(5000000, 'ins_f'); const [s, sS] = useStickyState(1000000, 'ins_s'); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="保險缺口" icon={ShieldCheck} description="責任需求法。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="負債" value={d} onChange={sD} prefix="$" /><InputGroup label="家人需求" value={f} onChange={sF} prefix="$" /><InputGroup label="資產" value={s} onChange={sS} prefix="$" /></div><div className="space-y-4"><ResultCard title="保障缺口" value={`$${fmt(Math.max(0, Number(d)+Number(f)-Number(s)))}`} highlight={true} colorClass="text-red-500" /></div></div></div>); };
const InflationCalc = () => { const [a, sA] = useStickyState(1000000, 'inf_a'); const [r, sR] = useStickyState(3, 'inf_r'); const [y, sY] = useStickyState(20, 'inf_y'); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="通膨試算" icon={TrendingDown} description="購買力。" /><div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"><InputGroup label="金額" value={a} onChange={sA} prefix="$" /><InputGroup label="通膨率" value={r} onChange={sR} suffix="%" /><InputGroup label="年數" value={y} onChange={sY} suffix="年" /></div><div className="space-y-4"><ResultCard title="實質購買力" value={`$${fmt(a*Math.pow(1-r/100, y))}`} highlight={true} colorClass="text-orange-500" /></div></div></div>); };

// 品牌浮水印設定 (含預覽)
const ProfileSettings = () => {
    const [name, setName] = useStickyState('', 'v4_name');
    const [line, setLine] = useStickyState('', 'v4_line');
    const [phone, setPhone] = useStickyState('', 'v4_phone');
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="品牌浮水印設定" icon={User} description="設定您的聯絡資訊，將顯示在截圖與列印中。" />
            <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-lg">
                <InputGroup label="姓名 / 職稱" value={name} onChange={setName} placeholder="例：王小明 經理" />
                <InputGroup label="LINE ID" value={line} onChange={setLine} placeholder="ID" />
                <InputGroup label="電話" value={phone} onChange={setPhone} placeholder="0912-345-678" />
                
                {/* 浮水印預覽 */}
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-xs text-slate-400 mb-2 font-bold uppercase">浮水印預覽</p>
                    <div className="flex items-center gap-3 opacity-70">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">{name?name[0]:'F'}</div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{name || '您的姓名'}</p>
                            <p className="text-xs text-slate-500">{line ? `LINE: ${line}` : ''} {phone ? `• ${phone}` : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// 首頁
// ==========================================
const HomePage = ({ changeTab }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="relative overflow-hidden rounded-3xl bg-white text-slate-800 p-10 md:p-20 text-center shadow-xl border border-slate-100">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-[80px] animate-gold-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-100/50 rounded-full mix-blend-multiply filter blur-[80px] animate-gold-blob"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-5 bg-white rounded-2xl mb-8 border border-slate-200 shadow-md"><Briefcase size={56} className="text-amber-500" /></div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900">FinKit <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">財富工具箱</span></h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-light tracking-wide">為菁英顧問打造的極致決策系統。</p>
            <button onClick={() => changeTab('tax')} className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full transition-all shadow-lg flex items-center gap-2 group"><Calculator size={20}/>開始規劃</button>
        </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
       {[{id:'stock', name:'精準交易試算', desc:'現股、當沖、ETF 稅率全支援', icon: BarChart3}, {id:'compound', name:'複利效應 PK', desc:'獨家定存比較模式，視覺化差距', icon: TrendingUp}, {id:'loan', name:'房貸寬限規劃', desc:'買房決策與現金流最佳化', icon: Home}].map(item => (
         <div key={item.id} onClick={() => changeTab(item.id)} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform border border-slate-100"><item.icon size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">{item.name} <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500"/></h3>
            <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors">{item.desc}</p>
         </div>
       ))}
    </div>
  </div>
);

// ==========================================
// 主程式 Layout (Fix: Full-screen menu & Capture Area)
// ==========================================
const FinancialToolkit = () => {
  const [activeTab, setActiveTab] = useStickyState('home', 'v5_tab');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [name] = useStickyState('', 'v4_name');
  const [line] = useStickyState('', 'v4_line');
  const [phone] = useStickyState('', 'v4_phone');
  
  const menuCategories = [
    { title: "獲利決策", items: [{ id: 'compound', name: '複利 PK', icon: TrendingUp }, { id: 'stock', name: '交易試算', icon: BarChart3 }, { id: 'dividend', name: '配息健保', icon: Coins }, { id: 'rvb', name: '買租比較', icon: Building }] },
    { title: "稅務規劃", items: [{ id: 'tax', name: '稅務試算', icon: Calculator }, { id: 'loan', name: '房貸寬限', icon: Home }, { id: 'fire', name: 'FIRE 退休', icon: Target }, { id: 'ins', name: '保險缺口', icon: ShieldCheck }] },
    { title: "實用工具", items: [{ id: 'forex', name: '匯率換算', icon: Globe }, { id: 'fcn', name: 'FCN 試算', icon: PieChart }, { id: 'dca', name: '定期定額', icon: RefreshCw }, { id: 'irr', name: 'IRR', icon: Percent }, { id: 'inf', name: '通膨試算', icon: TrendingDown }] },
    { title: "個人", items: [{ id: 'profile', name: '品牌設定', icon: User }] }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage changeTab={setActiveTab} />;
      case 'tax': return <TaxCalculator />; case 'compound': return <CompoundCalculator />; case 'stock': return <StockCalculator />;
      case 'dividend': return <DividendCalculator />; case 'loan': return <LoanCalculator />; case 'fire': return <FireCalculator />;
      case 'rvb': return <RentVsBuy />; case 'ins': return <InsuranceGap />; case 'inf': return <InflationCalc />;
      case 'profile': return <ProfileSettings />; case 'forex': return <ForexCalculator />; case 'fcn': return <FcnCalculator />;
      case 'dca': return <DcaCalculator />; case 'irr': return <IrrCalculator />;
      default: return <HomePage changeTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row print:bg-white print:text-black selection:bg-amber-100">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 backdrop-blur-md shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 border-b border-slate-200 print:hidden">
        <div onClick={() => setActiveTab('home')} className="flex items-center gap-2 font-bold text-lg text-slate-900 cursor-pointer">
            <Briefcase className="text-amber-500" />
            <span className="tracking-wide">FinKit</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-500 hover:text-slate-900">{isMenuOpen ? <X /> : <Menu />}</button>
      </div>

      {/* Sidebar (Full screen on mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-full md:w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out print:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block overflow-y-auto custom-scrollbar`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setActiveTab('home'); setIsMenuOpen(false);}}>
                <Briefcase className="text-amber-500 group-hover:rotate-12 transition-transform" size={28}/>
                <span className="font-bold text-2xl text-slate-900 tracking-wide">FinKit</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X size={24}/></button>
        </div>
        
        {name && <div className="mx-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">{name[0]}</div>
            <div className="overflow-hidden"><p className="text-sm font-bold text-slate-800 truncate">{name}</p><p className="text-xs text-amber-600 truncate">專屬顧問</p></div>
        </div>}
        
        <nav className="p-4 space-y-8 mt-2 pb-20">
          {menuCategories.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((tab) => {
                  const IconV = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium border border-transparent
                        ${isActive 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                      <IconV size={18} className={isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'} />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content (Capture Area) */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto print:p-0 print:overflow-visible h-screen bg-slate-50">
        <div id="capture-area" className="max-w-5xl mx-auto print:max-w-none print:w-full pb-20 bg-slate-50 p-4 rounded-xl"> {/* Added capture area wrapper */}
          <div className="hidden print:flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 font-bold text-2xl text-black"><Briefcase className="text-black" size={32} /><span>FinKit 理財規劃報告</span></div>
            <div className="text-right text-sm text-slate-500"><p>Generated by FinKit</p>{name && <p className="font-bold text-black mt-1">顧問：{name}</p>}</div>
          </div>
          {renderContent()}

          {/* 浮水印與頁尾 (顯示於截圖) */}
          <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-left">
                <p>© 2026 FinKit. 用心規劃，遇見美好未來。</p>
                <p className="opacity-70">本站工具僅供試算參考，不代表投資建議。</p>
            </div>
            {name && (
                <div className="flex items-center gap-3 opacity-80 border-l border-slate-300 pl-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">{name[0]}</div>
                    <div className="text-left">
                        <p className="font-bold text-slate-700 text-sm">{name}</p>
                        <p className="text-xs text-slate-500">{line ? `LINE: ${line}` : ''} {phone ? `• ${phone}` : ''}</p>
                    </div>
                </div>
            )}
          </footer>
        </div>
      </main>
    </div>
  );
};

export default FinancialToolkit;


