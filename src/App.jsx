import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, PieChart, Briefcase, RefreshCw, Menu, X, 
  AlertTriangle, Home, Percent, Globe, Printer, BookOpen, 
  BarChart3, Coins, Sun, Moon, Target, User, ShieldCheck,
  Building, TrendingDown, Copy, Heart, Sparkles, ArrowRight
} from 'lucide-react';

// ==========================================
// 核心 Hooks
// ==========================================

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) {}
  }, [key, value]);
  return [value, setValue];
}

const fmt = (num) => new Intl.NumberFormat('zh-TW').format(Math.floor(num));

// ==========================================
// UI 組件 (原版藍白風格)
// ==========================================

const InputGroup = ({ label, value, onChange, prefix, suffix, type = "number", step = "1", placeholder, note }) => (
  <div className="mb-4 print:hidden group">
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 dark:text-slate-400 sm:text-sm">{prefix}</span>
        </div>
      )}
      <input
        type={type} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full sm:text-sm rounded-md p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 
        text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all 
        ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-500 dark:text-slate-400 sm:text-sm">{suffix}</span>
        </div>
      )}
    </div>
    {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
  </div>
);

const ResultCard = ({ title, value, subtext, highlight = false, colorClass = "text-blue-700 dark:text-blue-400" }) => (
  <div className={`p-4 rounded-xl border transition-all duration-300 
    ${highlight 
      ? 'bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-blue-900 shadow-md' 
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    } print:border-slate-300 print:bg-white`}>
    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium print:text-slate-600">{title}</p>
    <p className={`text-2xl font-bold mt-1 tracking-tight ${highlight ? colorClass : 'text-slate-800 dark:text-white print:text-black'}`}>
      {value}
    </p>
    {subtext && <p className="text-xs text-slate-400 mt-1 print:text-slate-500">{subtext}</p>}
  </div>
);

const SectionHeader = ({ title, icon: Icon, description }) => {
  const handleCopy = () => {
    const url = window.location.href;
    const text = `FinKit 財富工具箱 - ${title}\n${url}`;
    navigator.clipboard.writeText(text).then(() => alert("已複製連結"));
  };

  return (
    <div className="mb-6 flex justify-between items-start border-b border-slate-100 dark:border-slate-700 pb-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 print:hidden shadow-sm">
            <Icon size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white print:text-2xl tracking-tight">{title}</h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm print:text-slate-600 max-w-2xl">{description}</p>
      </div>
      <div className="flex gap-2 print:hidden">
        <button onClick={handleCopy} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="複製連結">
          <Copy size={20} />
        </button>
        <button onClick={() => window.print()} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="列印/存圖">
          <Printer size={20} />
        </button>
      </div>
    </div>
  );
};

const ContentBlock = ({ title, children }) => (
  <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm no-print">
    <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-4 text-base">
      <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
      {title}
    </h3>
    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
      {children}
    </div>
  </div>
);

const SimpleLineChart = ({ data, color="#3b82f6", data2 }) => {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), ...(data2 ? data2.map(d => d.value) : [0]));
  const minVal = 0;
  
  const getPoints = (dataset) => dataset.map((d, i) => {
    const x = (i / (dataset.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / (maxVal - minVal)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full mt-6 mb-2 no-print h-48 relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
        <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" />
        
        {/* Line 1 */}
        <polyline fill="none" stroke={color} strokeWidth="2" points={getPoints(data)} vectorEffect="non-scaling-stroke" />
        <polygon fill={color} fillOpacity="0.1" points={`0,100 ${getPoints(data)} 100,100`} />
        
        {/* Line 2 (Comparison) */}
        {data2 && <polyline fill="none" stroke="#ef4444" strokeWidth="2" points={getPoints(data2)} vectorEffect="non-scaling-stroke" strokeDasharray="4" />}
      </svg>
      <div className="absolute top-0 right-0 text-xs font-bold text-blue-600 dark:text-blue-400 -translate-y-full pb-1">${fmt(maxVal)}</div>
    </div>
  );
};

// ==========================================
// 計算機模組
// ==========================================

const TaxCalculator = () => {
  const [income, setIncome] = useStickyState(1500000, 'v3_tax_inc');
  // 這裡我幫您保留了鎖定 750 萬的邏輯，但樣式是原本的
  const [amtExemption] = useState(7500000); 
  const [result, setResult] = useState({});

  const taxBrackets = [
    { limit: 610000, rate: 0.05, progressiveCorrection: 0 },
    { limit: 1330000, rate: 0.12, progressiveCorrection: 42700 },
    { limit: 2660000, rate: 0.20, progressiveCorrection: 149100 },
    { limit: 4980000, rate: 0.30, progressiveCorrection: 415100 },
    { limit: Infinity, rate: 0.40, progressiveCorrection: 913100 },
  ];

  useEffect(() => {
    const bracket = taxBrackets.find(b => income <= b.limit) || taxBrackets[taxBrackets.length - 1];
    const regularTax = Math.max(0, Math.floor(income * bracket.rate - bracket.progressiveCorrection));
    let quota = (regularTax / 0.2) + amtExemption - income;
    setResult({ regularTax, quota: Math.max(1000000, quota) });
  }, [income, amtExemption]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="2025 海外所得額度試算" icon={Calculator} description="計算在不增加最低稅負的前提下，最高可配置的海外投資額度。" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <InputGroup label="國內綜合所得淨額" value={income} onChange={setIncome} prefix="$" />
          <div className="mb-4 group">
             <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">基本稅額免稅額 (2025)</label>
             <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 font-mono">
                $7,500,000 (法定固定)
             </div>
          </div>
        </div>
        <div className="space-y-4">
          <ResultCard title="目前應繳一般所得稅" value={`$${fmt(result.regularTax)}`} />
          <ResultCard title="建議海外所得配置上限" value={`$${fmt(result.quota)}`} subtext="此金額內免補繳基本稅額" highlight={true} />
        </div>
      </div>
    </div>
  );
};

const CompoundCalculator = () => {
  const [principal, setPrincipal] = useStickyState(100000, 'v3_cmp_p');
  const [rate, setRate] = useStickyState(6, 'v3_cmp_r');
  const [years, setYears] = useStickyState(20, 'v3_cmp_y');
  const [compareMode, setCompareMode] = useState(false);
  const [compareRate, setCompareRate] = useStickyState(1.7, 'v3_cmp_cr');

  const calculate = (r) => {
    const P = Number(principal);
    const rateVal = Number(r) / 100;
    let data = [];
    for(let i=0; i<=years; i++) data.push({ value: P * Math.pow((1 + rateVal), i) });
    return { final: data[data.length-1].value, data };
  };

  const res1 = calculate(rate);
  const res2 = calculate(compareRate);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="單筆複利效應 (含PK模式)" icon={TrendingUp} description="比較投資與定存的長期差距。" />
      <div className="flex justify-end no-print mb-2">
         <button onClick={()=>setCompareMode(!compareMode)} className={`text-xs px-3 py-1 rounded-full border ${compareMode ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 border-slate-300'}`}>
            {compareMode ? '關閉比較' : '開啟定存比較'}
         </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <InputGroup label="本金投入" value={principal} onChange={setPrincipal} prefix="$" />
          <InputGroup label="投資年化報酬率" value={rate} onChange={setRate} suffix="%" />
          <InputGroup label="投資年限" value={years} onChange={setYears} suffix="年" />
          {compareMode && (
             <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4 animate-in fade-in">
                <InputGroup label="比較對象 (如定存) 利率" value={compareRate} onChange={setCompareRate} suffix="%" />
             </div>
          )}
        </div>
        <div className="space-y-4">
          <ResultCard title={`${years} 年後總資產`} value={`$${fmt(res1.final)}`} highlight={true} />
          {compareMode && (
             <ResultCard title="定存對照組資產" value={`$${fmt(res2.final)}`} subtext={`相差 $${fmt(res1.final - res2.final)}`} colorClass="text-red-500" />
          )}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 no-print">
             <SimpleLineChart data={res1.data} data2={compareMode ? res2.data : null} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StockCalculator = () => {
  const [buyPrice, setBuyPrice] = useStickyState(100, 'v3_stk_buy');
  const [sellPrice, setSellPrice] = useStickyState(110, 'v3_stk_sell');
  const [shares, setShares] = useStickyState(1000, 'v3_stk_sh');
  const [discount, setDiscount] = useStickyState(60, 'v3_stk_disc');
  const [type, setType] = useStickyState('stock', 'v3_stk_type');

  const calculate = () => {
    let taxRate = 0.003; 
    if (type === 'day') taxRate = 0.0015;
    if (type === 'etf') taxRate = 0.001;
    if (type === 'bond') taxRate = 0;

    const feeRate = 0.001425;
    const discVal = discount / 100;
    const totalShares = Number(shares);
    const buyVal = buyPrice * totalShares;
    const sellVal = sellPrice * totalShares;
    
    const buyFee = Math.floor(Math.max(20, buyVal * feeRate * discVal));
    const sellFee = Math.floor(Math.max(20, sellVal * feeRate * discVal));
    const tax = Math.floor(sellVal * taxRate);
    
    const profit = sellVal - sellFee - tax - buyVal - buyFee;
    return { profit, tax, buyFee, sellFee };
  };
  const res = calculate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <SectionHeader title="台股精準獲利試算" icon={BarChart3} description="支援現股、當沖、ETF (0.1%) 及債券 (0%) 稅率。" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="mb-4">
             <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">交易種類</label>
             <div className="grid grid-cols-2 gap-2">
               {[
                 {id:'stock', name:'個股 (0.3%)'}, {id:'day', name:'當沖 (0.15%)'},
                 {id:'etf', name:'ETF (0.1%)'}, {id:'bond', name:'債券ETF (0%)'}
               ].map(t => (
                 <button key={t.id} onClick={()=>setType(t.id)} className={`py-2 text-sm rounded-lg border transition-colors ${type===t.id ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-500 border-slate-200 dark:border-slate-600'}`}>
                   {t.name}
                 </button>
               ))}
             </div>
          </div>
          <InputGroup label="買入價格" value={buyPrice} onChange={setBuyPrice} prefix="$" />
          <InputGroup label="賣出價格" value={sellPrice} onChange={setSellPrice} prefix="$" />
          <InputGroup label="股數" value={shares} onChange={setShares} suffix="股" />
          <InputGroup label={`手續費折數 (${discount}折)`} value={discount} onChange={setDiscount} type="range" />
        </div>
        <div className="space-y-4">
          <ResultCard title="預估淨損益" value={`$${fmt(res.profit)}`} highlight={true} colorClass={res.profit >= 0 ? "text-red-500" : "text-green-500"} />
          <div className="grid grid-cols-2 gap-4">
             <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">總手續費</p><p className="font-bold dark:text-white">${res.buyFee + res.sellFee}</p></div>
             <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"><p className="text-xs text-slate-500 dark:text-slate-400">證交稅</p><p className="font-bold dark:text-white">${res.tax}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DividendCalculator = () => {
    const [shares, setShares] = useStickyState(10000, 'v3_div_sh');
    const [dividend, setDividend] = useStickyState(1.5, 'v3_div_val');
    const [freq, setFreq] = useStickyState(1, 'v3_div_freq');

    const totalDiv = shares * dividend;
    const singlePayment = totalDiv / freq;
    const healthFee = singlePayment >= 20000 ? Math.floor(totalDiv * 0.0211) : 0;
    const finalIncome = totalDiv - healthFee;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="存股配息 & 二代健保" icon={Coins} description="自動試算補充保費門檻 (單筆2萬)。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="持有股數" value={shares} onChange={setShares} suffix="股" />
                    <InputGroup label="預估每股總配息 (年)" value={dividend} onChange={setDividend} prefix="$" />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">配息頻率</label>
                        <div className="flex gap-2">
                            {[{v:1, l:'年配'}, {v:2, l:'半年'}, {v:4, l:'季配'}, {v:12, l:'月配'}].map(o => (
                                <button key={o.v} onClick={()=>setFreq(o.v)} className={`flex-1 py-2 text-sm rounded-lg border ${freq===o.v ? 'bg-blue-600 text-white' : 'border-slate-200 dark:border-slate-600'}`}>{o.l}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <ResultCard title="全年總股息 (稅前)" value={`$${fmt(totalDiv)}`} />
                    {healthFee > 0 && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-lg flex items-start gap-2 text-red-700 dark:text-red-400 text-sm">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0"/>
                            <span>單次領取 ${fmt(singlePayment)} 已達 2 萬門檻，預估扣除補充保費 <strong>${fmt(healthFee)}</strong></span>
                        </div>
                    )}
                    <ResultCard title="實領金額 (稅後)" value={`$${fmt(finalIncome)}`} highlight={true} />
                </div>
            </div>
        </div>
    );
};

const LoanCalculator = () => {
    const [loanAmount, setLoanAmount] = useStickyState(10000000, 'v3_loan_amt');
    const [rate, setRate] = useStickyState(2.1, 'v3_loan_rate');
    const [years, setYears] = useStickyState(30, 'v3_loan_yrs');
    const [gracePeriod, setGracePeriod] = useStickyState(0, 'v3_loan_grace');

    const calculate = () => {
        const P = Number(loanAmount);
        const r = Number(rate) / 100 / 12;
        const totalMonths = Number(years) * 12;
        const graceMonths = Number(gracePeriod) * 12;
        
        const gracePayment = Math.round(P * r);
        const remainMonths = totalMonths - graceMonths;
        const normalPayment = remainMonths > 0 ? Math.round(P * r * Math.pow(1 + r, remainMonths) / (Math.pow(1 + r, remainMonths) - 1)) : 0;
        
        return { gracePayment, normalPayment };
    };
    const res = calculate();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="房貸試算 (含寬限期)" icon={Home} description="計算寬限期前後的月付金差異。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="貸款總金額" value={loanAmount} onChange={setLoanAmount} prefix="$" />
                    <InputGroup label="年利率" value={rate} onChange={setRate} suffix="%" step="0.01" />
                    <InputGroup label="總期限" value={years} onChange={setYears} suffix="年" />
                    <InputGroup label="寬限期 (只繳息)" value={gracePeriod} onChange={setGracePeriod} suffix="年" note="寬限期後月付金會增加" />
                </div>
                <div className="space-y-4">
                    {gracePeriod > 0 && (
                        <ResultCard title={`前 ${gracePeriod} 年月付金 (寬限期)`} value={`$${fmt(res.gracePayment)}`} subtext="只繳利息" />
                    )}
                    <ResultCard title={gracePeriod > 0 ? "寬限期後月付金" : "每月應繳本息"} value={`$${fmt(res.normalPayment)}`} highlight={true} subtext={gracePeriod > 0 ? "本金 + 利息" : ""} />
                </div>
            </div>
        </div>
    );
};

const RentVsBuy = () => {
    const [homePrice, setHomePrice] = useStickyState(15000000, 'v3_rvb_price');
    const [rent, setRent] = useStickyState(30000, 'v3_rvb_rent');
    const [years, setYears] = useStickyState(20, 'v3_rvb_yrs');
    const [investReturn, setInvestReturn] = useStickyState(6, 'v3_rvb_roi');
    const [homeApprec, setHomeApprec] = useStickyState(2, 'v3_rvb_apprec');

    const calculate = () => {
        const downPayment = homePrice * 0.2;
        const loan = homePrice * 0.8;
        const rate = 2.1 / 100 / 12;
        const n = 30 * 12;
        const monthlyMortgage = loan * rate * Math.pow(1+rate,n) / (Math.pow(1+rate,n)-1);
        
        const finalHomeValue = homePrice * Math.pow(1 + homeApprec/100, years);
        const remainingLoan = years >= 30 ? 0 : loan * 0.4;
        const buyNetWorth = finalHomeValue - remainingLoan;

        const monthlyDiff = Math.max(0, monthlyMortgage - rent);
        let investAssets = downPayment * Math.pow(1 + investReturn/100, years);
        const r = investReturn/100/12;
        const diffFV = monthlyDiff * (Math.pow(1+r, years*12) - 1) / r;
        const rentNetWorth = investAssets + diffFV;

        return { buyNetWorth, rentNetWorth, monthlyMortgage };
    };
    const res = calculate();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="買房 vs 租房 終極PK" icon={Building} description="如果把頭期款拿去投資，20年後誰比較有錢？" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="目標房價" value={homePrice} onChange={setHomePrice} prefix="$" />
                    <InputGroup label="同級房租金 (月)" value={rent} onChange={setRent} prefix="$" />
                    <InputGroup label="房價年漲幅" value={homeApprec} onChange={setHomeApprec} suffix="%" />
                    <InputGroup label="投資年報酬率" value={investReturn} onChange={setInvestReturn} suffix="%" />
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                        <p>若買房，月繳房貸約 <strong>${fmt(res.monthlyMortgage)}</strong></p>
                        <p className="mt-1">租房每月可多存 <strong>${fmt(Math.max(0, res.monthlyMortgage - rent))}</strong> 進行投資</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <ResultCard title="買房組淨資產" value={`$${fmt(res.buyNetWorth)}`} highlight={res.buyNetWorth > res.rentNetWorth} />
                        <ResultCard title="租房組淨資產" value={`$${fmt(res.rentNetWorth)}`} highlight={res.rentNetWorth > res.buyNetWorth} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FireCalculator = () => {
    const [annualExpense, setAnnualExpense] = useStickyState(600000, 'v3_fire_exp');
    const [pension, setPension] = useStickyState(20000, 'v3_fire_pen');
    const [assets, setAssets] = useStickyState(2000000, 'v3_fire_assets');
    
    const gapYearly = Math.max(0, annualExpense - (pension * 12));
    const fireNumber = gapYearly * 25;
    const progress = Math.min(100, (assets / fireNumber) * 100);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="FIRE 退休 (含勞保勞退)" icon={Target} description="4% 法則 + 政府退休金，算出精確缺口。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="退休後預估年支出" value={annualExpense} onChange={setAnnualExpense} prefix="$" />
                    <InputGroup label="預估勞保+勞退 (月領)" value={pension} onChange={setPension} prefix="$" note="依勞保局試算填入保守值" />
                    <InputGroup label="目前已累積資產" value={assets} onChange={setAssets} prefix="$" />
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg">
                         <p className="text-slate-400 text-sm mb-1">您的 FIRE 自由數字</p>
                         <p className="text-3xl font-bold mb-4">${fmt(fireNumber)}</p>
                         <div className="w-full bg-slate-700 rounded-full h-2.5 mb-1">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                         </div>
                         <p className="text-xs text-right text-slate-400">已達成 {progress.toFixed(1)}%</p>
                    </div>
                    <ContentBlock title="為什麼扣掉勞保差這麼多？">
                        <p>勞保與勞退是「現金流」，每個月領 2 萬，相當於您少存了 <strong>600 萬</strong> (2萬x12個月x25倍) 的本金壓力！</p>
                    </ContentBlock>
                </div>
            </div>
        </div>
    );
};

const InsuranceGap = () => {
    const [debt, setDebt] = useStickyState(5000000, 'v3_ins_debt');
    const [family, setFamily] = useStickyState(500000, 'v3_ins_fam');
    const [years, setYears] = useStickyState(10, 'v3_ins_yrs');
    const [savings, setSavings] = useStickyState(1000000, 'v3_ins_sav');
    
    const needs = Number(debt) + (Number(family) * Number(years));
    const gap = Math.max(0, needs - savings);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="身故保障缺口試算" icon={ShieldCheck} description="利用責任需求法，計算您需要多少壽險額度。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="房貸與負債餘額" value={debt} onChange={setDebt} prefix="$" />
                    <InputGroup label="家人所需生活費 (年)" value={family} onChange={setFamily} prefix="$" />
                    <InputGroup label="需照顧年期" value={years} onChange={setYears} suffix="年" />
                    <InputGroup label="目前存款與投資" value={savings} onChange={setSavings} prefix="$" />
                </div>
                <div className="space-y-4">
                    <ResultCard title="家庭總責任額" value={`$${fmt(needs)}`} />
                    <ResultCard title="保障缺口 (建議壽險額度)" value={`$${fmt(gap)}`} highlight={true} colorClass="text-red-500" />
                </div>
            </div>
        </div>
    );
};

const InflationCalc = () => {
    const [amount, setAmount] = useStickyState(1000000, 'v3_inf_amt');
    const [rate, setRate] = useStickyState(3, 'v3_inf_rate');
    const [years, setYears] = useStickyState(20, 'v3_inf_yrs');
    const futureValue = amount * Math.pow(1 - (rate/100), years);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="通膨購買力縮水試算" icon={TrendingDown} description="今天的 100 萬，20 年後還剩多少購買力？" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="現在金額" value={amount} onChange={setAmount} prefix="$" />
                    <InputGroup label="預估通膨率" value={rate} onChange={setRate} suffix="%" />
                    <InputGroup label="經過年數" value={years} onChange={setYears} suffix="年" />
                </div>
                <div className="space-y-4">
                    <ResultCard title={`${years} 年後實質購買力`} value={`$${fmt(futureValue)}`} highlight={true} colorClass="text-orange-500" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">資產縮水幅度：{((1 - futureValue/amount)*100).toFixed(1)}%</p>
                </div>
            </div>
        </div>
    );
};

const ProfileSettings = () => {
    const [name, setName] = useStickyState('', 'v3_prof_name');
    const [line, setLine] = useStickyState('', 'v3_prof_line');
    const [phone, setPhone] = useStickyState('', 'v3_prof_phone');

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="個人品牌設定" icon={User} description="設定您的姓名與聯絡方式，將顯示在列印與截圖中。" />
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-lg">
                <InputGroup label="您的姓名 / 稱呼" value={name} onChange={setName} placeholder="例：理財顧問 小明" />
                <InputGroup label="LINE ID" value={line} onChange={setLine} type="text" placeholder="例：ming123" />
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                    <p>設定完成後，您可以試著按右上角的「列印」按鈕，您的資訊會自動出現在報表頁尾喔！</p>
                </div>
            </div>
        </div>
    );
};

const ForexCalculator = () => {
    const [amount, setAmount] = useStickyState(1000, 'v3_fx_amt');
    const [fromCurr, setFromCurr] = useStickyState('USD', 'v3_fx_from');
    const [toCurr, setToCurr] = useStickyState('TWD', 'v3_fx_to');
    const [customRate, setCustomRate] = useState(null);

    const baseRates = { 'TWD': 1, 'USD': 32.5, 'JPY': 0.22, 'EUR': 35.2, 'CNY': 4.5, 'AUD': 21.5, 'KRW': 0.024 };
    const calculatedRate = baseRates[fromCurr] / baseRates[toCurr];
    const currentRate = customRate !== null ? customRate : calculatedRate;

    useEffect(() => { setCustomRate(null); }, [fromCurr, toCurr]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="雙向匯率換算" icon={Globe} description="支援多國交叉匯率，可自訂成交價。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">持有 (From)</label><select value={fromCurr} onChange={(e)=>setFromCurr(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50">{Object.keys(baseRates).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">兌換 (To)</label><select value={toCurr} onChange={(e)=>setToCurr(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50">{Object.keys(baseRates).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <InputGroup label="金額" value={amount} onChange={setAmount} prefix="$" />
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-600 mb-1">成交匯率</label>
                        <input type="number" step="0.0001" value={currentRate.toFixed(4)} onChange={(e) => setCustomRate(parseFloat(e.target.value))} className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-3 bg-white border"/>
                    </div>
                </div>
                <div className="space-y-4">
                    <ResultCard title={`約合 ${toCurr}`} value={`${new Intl.NumberFormat().format((amount * currentRate).toFixed(2))}`} highlight={true} />
                    <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 no-print"><div className="text-center text-sm text-slate-500">1 {fromCurr} ≈ {currentRate.toFixed(4)} {toCurr}</div></div>
                </div>
            </div>
        </div>
    );
};

const FcnCalculator = () => {
    const [strike, setStrike] = useStickyState(100, 'v3_fcn_stk');
    const [couponRate, setCouponRate] = useStickyState(8, 'v3_fcn_cp');
    const [kiBarrier, setKiBarrier] = useStickyState(65, 'v3_fcn_ki');
    const [investment, setInvestment] = useStickyState(100000, 'v3_fcn_inv');
    const kiPrice = strike * (kiBarrier / 100);
    const breakEvenPrice = strike * (1 - (couponRate / 100));
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="FCN / ELN 結構型商品" icon={PieChart} description="快速計算 KI/KO 點位與損益平衡點。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="投資名目本金" value={investment} onChange={setInvestment} prefix="$" />
                    <InputGroup label="履約價 (Strike)" value={strike} onChange={setStrike} prefix="$" />
                    <InputGroup label="年化配息率" value={couponRate} onChange={setCouponRate} suffix="%" />
                    <InputGroup label="下檔保護 (KI Barrier)" value={kiBarrier} onChange={setKiBarrier} suffix="%" />
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-800 text-white p-6 rounded-xl"><p className="text-slate-400 text-sm mb-1">關鍵安全防線 (KI Price)</p><p className="text-3xl font-bold mb-4">${kiPrice.toFixed(2)}</p><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${kiBarrier}%` }}></div></div><p className="text-xs text-slate-400 mt-2">股價跌破此價位將面臨虧損風險</p></div>
                    <ResultCard title="損益兩平股價" value={`$${breakEvenPrice.toFixed(2)}`} subtext={`下跌 ${(100 - (breakEvenPrice/strike)*100).toFixed(1)}% 內不賠錢`} highlight={true} />
                </div>
            </div>
        </div>
    );
};

const DcaCalculator = () => {
    const [monthly, setMonthly] = useStickyState(10000, 'v3_dca_m');
    const [rate, setRate] = useStickyState(6, 'v3_dca_r');
    const [years, setYears] = useStickyState(20, 'v3_dca_y');
    const calculate = () => {
        const pmt = Number(monthly); const r = Number(rate)/100/12; const n = Number(years)*12; let data = [];
        for(let i=0; i<=Number(years); i++) { let m = i*12; data.push({ value: m===0?0:pmt*(Math.pow(1+r,m)-1)/r }); }
        const fv = data[data.length-1].value; const total = pmt*n;
        return { fv, total, profit: fv-total, data };
    };
    const res = calculate();
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="定期定額試算" icon={RefreshCw} description="每月固定投入，享受時間複利與平均成本的威力。" />
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <InputGroup label="每月投入金額" value={monthly} onChange={setMonthly} prefix="$" />
                    <InputGroup label="預期年化報酬率" value={rate} onChange={setRate} suffix="%" />
                    <InputGroup label="投資期間" value={years} onChange={setYears} suffix="年" />
                </div>
                <div className="space-y-4">
                    <ResultCard title="期末總資產預估" value={`$${fmt(res.fv)}`} highlight={true} />
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 no-print"><SimpleLineChart data={res.data} /></div>
                    <div className="grid grid-cols-2 gap-4"><ResultCard title="總投入成本" value={`$${fmt(res.total)}`} /><ResultCard title="投資獲利" value={`$${fmt(res.profit)}`} colorClass="text-green-600" /></div>
                </div>
            </div>
        </div>
    );
};

const IrrCalculator = () => {
    const [mode, setMode] = useStickyState('single', 'v3_irr_mode');
    const [sPrincipal, setSPrincipal] = useStickyState(1000000, 'v3_irr_sp');
    const [sFinal, setSFinal] = useStickyState(1200000, 'v3_irr_sf');
    const [sYears, setSYears] = useStickyState(6, 'v3_irr_sy');
    const [rAnnual, setRAnnual] = useStickyState(100000, 'v3_irr_ra');
    const [rPayYears, setRPayYears] = useStickyState(6, 'v3_irr_rpy');
    const [rWaitYears, setRWaitYears] = useStickyState(10, 'v3_irr_rwy');
    const [rFinal, setRFinal] = useStickyState(700000, 'v3_irr_rf');
    const calcSingleIRR = () => { if (sPrincipal <= 0 || sFinal <= 0 || sYears <= 0) return 0; return ((Math.pow(sFinal / sPrincipal, 1 / sYears) - 1) * 100).toFixed(2); };
    const calcRegularIRR = () => {
        let low = -0.99, high = 1.0, guess = 0;
        for (let i = 0; i < 50; i++) { guess = (low + high) / 2; let npv = 0; for (let t = 0; t < rPayYears; t++) npv -= rAnnual / Math.pow(1 + guess, t); npv += rFinal / Math.pow(1 + guess, rWaitYears); if (Math.abs(npv) < 1) break; if (npv > 0) low = guess; else high = guess; }
        return (guess * 100).toFixed(2);
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="IRR 真實年化報酬率" icon={Percent} description="破解儲蓄險話術，計算真實回報。" />
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6 w-full max-w-sm mx-auto no-print"><button onClick={() => setMode('single')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>躉繳 (單筆)</button><button onClick={() => setMode('regular')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === 'regular' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>期繳 (分期)</button></div>
            {mode === 'single' ? (
                <div className="grid md:grid-cols-2 gap-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"><InputGroup label="投入本金" value={sPrincipal} onChange={setSPrincipal} prefix="$" /><InputGroup label="期末領回金額" value={sFinal} onChange={setSFinal} prefix="$" /><InputGroup label="經過年數" value={sYears} onChange={setSYears} suffix="年" /></div><div className="space-y-4"><ResultCard title="IRR (年化)" value={`${calcSingleIRR()}%`} highlight={true} /><ResultCard title="總損益" value={`$${fmt(sFinal - sPrincipal)}`} /></div></div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6"><div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"><InputGroup label="年繳金額" value={rAnnual} onChange={setRAnnual} prefix="$" /><InputGroup label="繳費年期" value={rPayYears} onChange={setRPayYears} suffix="年" /><InputGroup label="領回/解約年" value={rWaitYears} onChange={setRWaitYears} suffix="年" /><InputGroup label="領回總額" value={rFinal} onChange={setRFinal} prefix="$" /></div><div className="space-y-4"><ResultCard title="IRR (年化)" value={`${calcRegularIRR()}%`} highlight={true} /><ResultCard title="總損益" value={`$${fmt(rFinal - (rAnnual * rPayYears))}`} /></div></div>
            )}
        </div>
    );
};

// ==========================================
// 首頁 (Clean Style)
// ==========================================
const HomePage = ({ changeTab }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white p-10 md:p-16 text-center shadow-lg border border-slate-100 dark:border-slate-700">
        <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-6 shadow-sm">
                <Briefcase size={48} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                FinKit <span className="text-blue-600 dark:text-blue-400">財富工具箱</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                理財顧問的隨身軍火庫。<br/>
                專業、精準、且完全免費。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => changeTab('tax')} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2">
                    <Calculator size={18} />
                    立即試算
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
         {[{id:'stock',name:'台股交易',icon:BarChart3}, {id:'compound',name:'複利試算',icon:TrendingUp}, {id:'loan',name:'房貸寬限',icon:Home}].map(item => (
            <div key={item.id} onClick={() => changeTab(item.id)} className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400"><item.icon size={20}/></div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
            </div>
         ))}
      </div>
    </div>
  );
};

// ==========================================
// 主程式 Layout
// ==========================================
const FinancialToolkit = () => {
  const [activeTab, setActiveTab] = useStickyState('home', 'v3_tab');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useStickyState(false, 'v3_dark');
  const [name] = useStickyState('', 'v3_prof_name');
  const [line] = useStickyState('', 'v3_prof_line');

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const menuCategories = [
    { title: "投資獲利", items: [{ id: 'compound', name: '複利 PK', icon: TrendingUp }, { id: 'stock', name: '台股交易', icon: BarChart3 }, { id: 'dividend', name: '配息/健保', icon: Coins }, { id: 'rvb', name: '買房 vs 租房', icon: Building }] },
    { title: "規劃與稅務", items: [{ id: 'tax', name: '稅務試算', icon: Calculator }, { id: 'loan', name: '房貸寬限期', icon: Home }, { id: 'fire', name: 'FIRE 退休', icon: Target }, { id: 'ins', name: '保險缺口', icon: ShieldCheck }, { id: 'inf', name: '通膨試算', icon: TrendingDown }] },
    { title: "其他工具", items: [{ id: 'forex', name: '雙向匯率', icon: Globe }, { id: 'fcn', name: 'FCN/ELN', icon: PieChart }, { id: 'dca', name: '定期定額', icon: RefreshCw }, { id: 'irr', name: 'IRR', icon: Percent }] },
    { title: "個人設定", items: [{ id: 'profile', name: '品牌浮水印', icon: User }] }
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col md:flex-row print:bg-white print:text-black">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 print:hidden">
        <div onClick={() => setActiveTab('home')} className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white cursor-pointer">
            <Briefcase className="text-blue-600" />
            <span>FinKit</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={()=>setDarkMode(!darkMode)} className="p-2 text-slate-500">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out print:hidden md:translate-x-0 md:static md:block overflow-y-auto ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
            <div className="flex items-center gap-2 font-bold text-2xl text-slate-800 dark:text-white cursor-pointer" onClick={() => {setActiveTab('home'); setIsMenuOpen(false);}}>
                <Briefcase className="text-blue-600" size={28}/><span>FinKit</span>
            </div>
            <button onClick={()=>setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors hidden md:block">{darkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-800"><X size={24}/></button>
        </div>
        
        {name && <div className="mx-4 mt-4 p-3 bg-blue-50 dark:bg-slate-700/50 rounded-lg border border-blue-100 dark:border-slate-600 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">{name[0]}</div>
            <div className="overflow-hidden"><p className="text-sm font-bold truncate">{name}</p><p className="text-xs text-slate-500 truncate">{line}</p></div>
        </div>}

        <nav className="p-4 space-y-8 pb-20">
          {menuCategories.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((tab) => {
                  const IconV = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium 
                        ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      <IconV size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />{tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto print:max-w-none print:w-full pb-20">
          
          <div className="hidden print:flex justify-between items-end mb-8 border-b pb-4">
            <div className="flex items-center gap-2 font-bold text-2xl text-slate-800"><Briefcase className="text-blue-600" size={32} /><span>FinKit 理財規劃報告</span></div>
            <div className="text-right text-sm text-slate-500"><p>Generated by FinKit</p>{name && <p className="font-bold text-slate-800 mt-1">顧問：{name}</p>}</div>
          </div>
          
          {/* Top Ad */}
          <div className="w-full h-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-xl mb-8 flex items-center justify-center text-sm text-slate-400 no-print shadow-sm">
             Google AdSense (Responsive)
          </div>

          {renderContent()}

          <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-slate-400 text-sm print:mt-8 print:flex print:justify-between">
            <div className="text-left">
                <p>© 2026 FinKit. 用心規劃，遇見美好未來。</p>
                <p className="mt-2 text-xs opacity-70 print:hidden">免責聲明：本站工具僅供試算參考，不代表投資建議。</p>
            </div>
            {name && <div className="hidden print:block text-right"><p className="font-bold text-base text-slate-800">{name}</p><p className="text-xs">{line && `LINE: ${line}`}</p></div>}
          </footer>
        </div>
      </main>
      {isMenuOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-0 md:hidden no-print" onClick={() => setIsMenuOpen(false)} />}
    </div>
  );
};

export default FinancialToolkit;


