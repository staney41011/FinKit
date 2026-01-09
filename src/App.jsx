import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, TrendingUp, PieChart, Briefcase, RefreshCw, Menu, X, 
  AlertTriangle, Home, Percent, Globe, Camera, BookOpen, 
  BarChart3, Coins, Target, User, ShieldCheck,
  Building, TrendingDown, Copy, Plus, Trash2, Share2, ArrowRight, Lock, 
  Save, ArrowRightLeft, Download, Layers, Check, Info, Filter
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

const fmt = (num) => new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(num);

// ==========================================
// UI 組件
// ==========================================

const InputGroup = ({ label, value, onChange, prefix, suffix, type = "number", step = "1", placeholder, note, readOnly = false }) => (
  <div className="mb-5 no-print group w-full max-w-[240px]">
    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 ml-1">{label}</label>
    <div className="relative rounded-xl shadow-sm bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-all flex items-center h-[46px] overflow-hidden">
      {prefix && <div className="pl-3 pr-2 text-amber-600 font-bold text-sm select-none flex items-center h-full">{prefix}</div>}
      <input
        type={type} step={step} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`flex-1 h-full w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 text-sm font-mono 
        ${readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''} 
        ${prefix ? '' : 'pl-3'} ${suffix ? '' : 'pr-3'}`}
        style={{ paddingTop: 0, paddingBottom: 0 }}
      />
      {suffix && <div className="pr-3 pl-2 text-slate-400 text-xs font-medium select-none bg-slate-50 h-full flex items-center border-l border-slate-100">{suffix}</div>}
    </div>
    {note && <p className="mt-1.5 text-[10px] text-slate-400 ml-1">{note}</p>}
  </div>
);

const ResultCard = ({ title, value, subtext, highlight = false, colorClass = "text-amber-600" }) => (
  <div className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group
    ${highlight ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200 shadow-md' : 'bg-white border-slate-200 shadow-sm'}`}>
    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{title}</p>
    <p className={`text-2xl font-bold tracking-tight font-mono ${highlight ? colorClass : 'text-slate-800'}`}>{value}</p>
    {subtext && <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2 leading-relaxed">{subtext}</p>}
  </div>
);

// 截圖功能
const SectionHeader = ({ title, icon: Icon, description }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!window.html2canvas) return alert('系統載入中，請稍後再試');
    setIsCapturing(true);
    
    const sandbox = document.createElement("div");
    Object.assign(sandbox.style, {
        position: "fixed", top: "0", left: "-9999px",
        width: "1080px", 
        backgroundColor: "#f8fafc", zIndex: "-9999", padding: "40px"
    });
    
    const originalElement = document.getElementById('capture-area');
    const clone = originalElement.cloneNode(true);
    
    clone.querySelectorAll('.adsbygoogle, [id^="google_ads_"], iframe').forEach(ad => ad.style.display = 'none');
    const footer = clone.querySelector('footer');
    if(footer) { footer.style.display = 'flex'; footer.style.opacity = '1'; }

    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);
    
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        const canvas = await window.html2canvas(sandbox, { 
            scale: 2, useCORS: true, width: 1080, windowWidth: 1080,
            onclone: (doc) => doc.querySelectorAll('svg').forEach(svg => svg.setAttribute('width', '100%'))
        });

        canvas.toBlob(async (blob) => {
            const file = new File([blob], `FinKit_${title}.png`, { type: 'image/png' });
            if (navigator.share && navigator.canShare({ files: [file] })) {
                try { await navigator.share({ files: [file], title: 'FinKit 報告' }); } catch (err) {}
            } else {
                const link = document.createElement('a');
                link.download = `FinKit_${title}.png`;
                link.href = canvas.toDataURL();
                link.click();
            }
        });
    } catch (err) { console.error(err); alert('截圖失敗'); } 
    finally { document.body.removeChild(sandbox); setIsCapturing(false); }
  };

  return (
    <div className="mb-6 flex justify-between items-start border-b border-slate-200 pb-4 no-print">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-amber-500 shadow-sm"><Icon size={20} /></div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
        <p className="text-slate-500 text-xs max-w-2xl font-light">{description}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={handleCapture} disabled={isCapturing} className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50 whitespace-nowrap">
          {isCapturing ? <RefreshCw className="animate-spin" size={14}/> : <Camera size={14} />} 
          {isCapturing ? '生成中' : '存圖'}
        </button>
      </div>
    </div>
  );
};

// 互動式圖表
const InteractiveChart = ({ data, color="#d97706", data2, title="資產走勢" }) => {
  const [hoverVal, setHoverVal] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), ...(data2 ? data2.map(d => d.value) : [0]));
  const maxValSafe = maxVal || 1;

  const getPoints = (dataset) => dataset.map((d, i) => {
    const x = (i / (dataset.length - 1)) * 100;
    const y = 100 - ((d.value) / maxValSafe) * 100;
    return `${x},${y}`;
  }).join(' ');

  const handleMouseMove = (e) => {
      if(!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const width = rect.width;
      if (x < 0 || x > width) return;
      const index = Math.min(Math.max(0, Math.round((x / width) * (data.length - 1))), data.length - 1);
      const xPercent = (index / (data.length - 1)) * 100;
      const yPercent = 100 - (data[index].value / maxValSafe) * 100;
      setHoverPos({ x: xPercent, y: yPercent }); 
      setHoverVal({
          label: `第 ${index} 期`,
          val1: data[index].value,
          val2: data2 ? data2[index].value : null
      });
  };

  return (
    <div className="w-full mt-4 mb-2 select-none overflow-hidden pr-2 pl-8">
      <div className="flex justify-between text-[10px] text-slate-400 mb-1 px-1 font-mono">
          <span>${fmt(maxVal)}</span>
          <span className="font-bold text-slate-500">{title}</span>
      </div>
      <div 
        ref={containerRef}
        className="relative h-48 border-l border-b border-slate-300 bg-white cursor-crosshair touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {setHoverVal(null);}}
        onTouchMove={handleMouseMove}
      >
        <div className="absolute -left-8 top-0 text-[9px] text-slate-400 w-6 text-right -translate-y-1/2">${fmt(maxVal)}</div>
        <div className="absolute -left-8 top-1/2 text-[9px] text-slate-400 w-6 text-right -translate-y-1/2">${fmt(maxVal/2)}</div>
        <div className="absolute -left-8 bottom-0 text-[9px] text-slate-400 w-6 text-right -translate-y-1/2">$0</div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            {[0, 25, 50, 75, 100].map(p => <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="#f1f5f9" strokeWidth="0.5" />)}
            <polyline fill="none" stroke={color} strokeWidth="2" points={getPoints(data)} vectorEffect="non-scaling-stroke" />
            {data2 && <polyline fill="none" stroke="#94a3b8" strokeWidth="2" points={getPoints(data2)} vectorEffect="non-scaling-stroke" strokeDasharray="4" />}
            {hoverVal && (
                <>
                    <line x1={hoverPos.x} y1="0" x2={hoverPos.x} y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                    <circle cx={hoverPos.x} cy={hoverPos.y} r="5" fill={color} fillOpacity="0.2" stroke="none" vectorEffect="non-scaling-stroke" />
                    <circle cx={hoverPos.x} cy={hoverPos.y} r="3" fill="white" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </>
            )}
        </svg>
        {hoverVal && (
            <div className="absolute bg-slate-800/95 backdrop-blur text-white text-[10px] p-2 rounded shadow-lg z-20 pointer-events-none whitespace-nowrap border border-slate-600"
                style={{ left: `${hoverPos.x}%`, top: `${hoverPos.y}%`, transform: `translate(${hoverPos.x > 60 ? '-110%' : '10%'}, ${hoverPos.y > 50 ? '-110%' : '10%'})` }}>
                <p className="font-bold border-b border-slate-600 pb-1.5 mb-1.5 text-slate-300">{hoverVal.label}</p>
                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{background:color}}></div><span className="font-mono">${fmt(hoverVal.val1)}</span></div>
                    {hoverVal.val2 && (<div className="flex items-center gap-1.5 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div><span className="font-mono">${fmt(hoverVal.val2)}</span></div>)}
                </div>
            </div>
        )}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono px-1"><span>Start</span><span>End ({data.length-1})</span></div>
    </div>
  );
};

// ==========================================
// FCN 結構型商品 (v6.2 深度優化：情境補完 + 標的選擇)
// ==========================================
const FcnCalculator = () => {
    const [assets, setAssets] = useStickyState([{id:1, code:'2330', price:1000}], 'v6_fcn_assets');
    const [principal, setPrincipal] = useStickyState(3000000, 'v6_fcn_p');
    const [months, setMonths] = useStickyState(3, 'v6_fcn_m');
    const [yieldRate, setYieldRate] = useStickyState(8, 'v6_fcn_y');
    const [koPct, setKoPct] = useStickyState(100, 'v6_fcn_ko'); // 順序 1
    const [strikePct, setStrikePct] = useStickyState(100, 'v6_fcn_str'); // 順序 2
    const [kiPct, setKiPct] = useStickyState(65, 'v6_fcn_ki'); // 順序 3
    const [mode, setMode] = useStickyState('AKI', 'v6_fcn_mode');
    
    // 選中的標的 ID (用於情境模擬)
    const [selectedAssetId, setSelectedAssetId] = useState(null);

    // 確保有預設選中
    useEffect(() => {
        if(assets.length > 0 && !selectedAssetId) setSelectedAssetId(assets[0].id);
        if(assets.length > 0 && selectedAssetId && !assets.find(a=>a.id===selectedAssetId)) setSelectedAssetId(assets[0].id);
    }, [assets, selectedAssetId]);

    const addAsset = () => { if(assets.length >= 5) return alert('最多5檔'); setAssets([...assets, { id: Date.now(), code: '', price: '' }]); };
    const removeAsset = (id) => { if(assets.length <= 1) return; setAssets(assets.filter(a => a.id !== id)); };
    const updateAsset = (id, field, val) => { setAssets(assets.map(a => a.id === id ? { ...a, [field]: val } : a)); };

    const monthlyCoupon = Math.floor(principal * (yieldRate / 100) / 12);
    const totalCoupon = monthlyCoupon * months;
    
    // 取得當前選中的標的數據
    const currentAsset = assets.find(a => a.id === selectedAssetId) || { code: '未選擇', price: 100 };
    const refPrice = Number(currentAsset.price) || 100;
    
    const kiPrice = refPrice * (kiPct/100);
    const koPrice = refPrice * (koPct/100);
    const strikePrice = refPrice * (strikePct/100);

    // 損益兩平點 (Cost) = Strike Price
    // 實質成本 = Strike - (配息) -> 這裡顯示損益平衡股價
    // 總收益率 = (Coupon% * m/12)
    const totalYieldPct = (yieldRate/100) * (months/12);
    // BreakEven Price: 當接到股票時，股價跌到多少才算真的賠錢 (考慮已領配息)
    const breakEvenPrice = strikePrice * (1 - totalYieldPct);

    const getModeDesc = () => {
        if(mode === 'AKI') return '每日觀察 (Daily)';
        if(mode === 'EKI') return '到期觀察 (Maturity)';
        if(mode === 'NA') return '無 KI (Vanilla)';
        return '';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <SectionHeader title="FCN 多標的試算" icon={PieChart} description="連結 1~5 檔標的，自動計算 KO/KI/Strike 價位與預估配息。" />
            
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* 模式選擇 */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mb-2 max-w-[320px]">
                        {['AKI', 'EKI', 'NA'].map(m => (
                            <button key={m} onClick={()=>setMode(m)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mode===m ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 -mt-4 mb-4 pl-1 flex items-center gap-1">
                        <Info size={12}/> 觀察方式：{getModeDesc()}
                    </p>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><Target size={16} className="text-amber-500"/> 連結標的</h3>
                            <button onClick={addAsset} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors font-bold">+ 新增</button>
                        </div>
                        <div className="space-y-3">
                            {assets.map((asset, idx) => (
                                <div key={asset.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                    <div className="w-6 flex justify-center text-xs font-bold text-slate-400">{idx+1}.</div>
                                    <div className="flex-1 grid grid-cols-2 gap-2 max-w-[320px]">
                                        <div className="h-10 bg-white border border-slate-300 rounded-lg flex items-center px-2 focus-within:ring-1 focus-within:ring-amber-500">
                                            <input 
                                                type="text" placeholder="代號" value={asset.code} 
                                                onChange={(e)=>updateAsset(asset.id, 'code', e.target.value)} 
                                                className="w-full h-full text-sm font-bold uppercase text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 bg-transparent p-0"
                                            />
                                        </div>
                                        <div className="h-10 bg-white border border-slate-300 rounded-lg flex items-center px-2 focus-within:ring-1 focus-within:ring-amber-500 relative">
                                            <input 
                                                type="number" placeholder="價格" value={asset.price} 
                                                onChange={(e)=>updateAsset(asset.id, 'price', e.target.value)} 
                                                className="w-full h-full text-sm text-slate-800 placeholder:text-slate-400 border-none focus:ring-0 bg-transparent p-0 pl-3"
                                            />
                                            <span className="absolute left-2 text-slate-400 text-xs">$</span>
                                        </div>
                                    </div>
                                    <button onClick={()=>removeAsset(asset.id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <InputGroup label="本金" value={principal} onChange={setPrincipal} prefix="$" />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="天期 (月)" value={months} onChange={setMonths} suffix="月" />
                            <InputGroup label="配息率" value={yieldRate} onChange={setYieldRate} suffix="%" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {/* 順序調整：KO -> Strike -> KI */}
                            <InputGroup label="KO" value={koPct} onChange={setKoPct} suffix="%" />
                            <InputGroup label="Strike" value={strikePct} onChange={setStrikePct} suffix="%" />
                            {mode !== 'NA' && <InputGroup label="KI" value={kiPct} onChange={setKiPct} suffix="%" />}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Coins size={60} className="text-amber-500"/></div>
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-3">收益預估</p>
                        <div className="flex justify-between items-end mb-3 border-b border-slate-600 pb-3">
                            <div><p className="text-xs text-slate-400">月配息</p><p className="text-xl font-mono font-bold">${fmt(monthlyCoupon)}</p></div>
                            <div className="text-right"><p className="text-xs text-slate-400">總配息 ({months}期)</p><p className="text-xl font-mono text-amber-400">${fmt(totalCoupon)}</p></div>
                        </div>
                        
                        {/* 標的選擇器 (New) */}
                        <div className="mb-3">
                            <label className="text-[10px] text-slate-400 mb-1 block">選擇試算基準標的</label>
                            <select 
                                value={selectedAssetId} 
                                onChange={(e)=>setSelectedAssetId(Number(e.target.value))}
                                className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg p-2 focus:ring-1 focus:ring-amber-500 outline-none"
                            >
                                {assets.map(a => <option key={a.id} value={a.id}>{a.code || '未命名'} (${fmt(a.price || 0)})</option>)}
                            </select>
                        </div>

                        {/* 基準標的價位 */}
                        <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-300 border-t border-slate-600 pt-3">
                             <div className="text-center"><span className="block text-green-400 mb-1">KO (出場)</span><span className="font-mono">${fmt(koPrice)}</span></div>
                             <div className="text-center"><span className="block text-red-400 mb-1">Strike</span><span className="font-mono">${fmt(strikePrice)}</span></div>
                             {mode !== 'NA' && <div className="text-center"><span className="block text-slate-400 mb-1">KI (保護)</span><span className="font-mono">${fmt(kiPrice)}</span></div>}
                        </div>
                    </div>

                    {/* 情境分析圖表 (v6.2 升級) */}
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                        <p className="text-xs font-bold text-slate-600 border-b border-slate-100 pb-2 flex items-center gap-2">
                            <TrendingUp size={14} className="text-blue-500"/> 到期情境模擬 ({currentAsset.code})
                        </p>
                        
                        {/* 1. KO */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">🟢 觸發 KO (提前出場)</span>
                            <span className="font-mono font-bold text-slate-700">拿回 ${fmt(principal)} + 截至當期配息</span>
                        </div>
                        
                        {/* 2. 平安下庄 (無 KI/KO) */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">🔵 {mode==='NA' ? '到期 > Strike' : (mode==='EKI' ? '到期 > KI' : '期間未觸 KI 及 KO')}</span>
                            <span className="font-mono font-bold text-slate-700">拿回 ${fmt(principal)} + ${fmt(totalCoupon)}</span>
                        </div>

                        {/* 3. 驚險過關 (AKI 特有) */}
                        {mode === 'AKI' && (
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">🟡 曾觸及 KI，但到期 > Strike</span>
                                <span className="font-mono font-bold text-slate-700">拿回 ${fmt(principal)} + ${fmt(totalCoupon)}</span>
                            </div>
                        )}

                        {/* 4. 接股票 */}
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">🔴 {mode==='NA' ? '到期 < Strike' : '觸及 KI 且到期 < Strike'}</span>
                            <span className="font-mono font-bold text-red-500">接股票 (成本 ${fmt(strikePrice)}) + ${fmt(totalCoupon)}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 text-right mt-0">*(實質損益平衡點: ${fmt(breakEvenPrice)})</p>

                        {/* Payoff Chart */}
                        <div className="relative h-24 mt-4 border-l border-b border-slate-300">
                            <div className="absolute w-full border-t border-dashed border-green-400" style={{bottom: `${Math.min(100, (koPct/120)*100)}%`}}></div>
                            <span className="absolute right-0 text-[9px] text-green-500 -mt-4 bg-white px-1" style={{bottom: `${Math.min(100, (koPct/120)*100)}%`}}>KO ${fmt(koPrice)}</span>
                            
                            <div className="absolute w-full border-t border-red-400" style={{bottom: `${Math.min(100, (strikePct/120)*100)}%`}}></div>
                            <span className="absolute right-0 text-[9px] text-red-500 -mt-4 bg-white px-1" style={{bottom: `${Math.min(100, (strikePct/120)*100)}%`}}>Strike ${fmt(strikePrice)}</span>

                            {mode !== 'NA' && (
                                <>
                                <div className="absolute w-full border-t border-dashed border-slate-400" style={{bottom: `${Math.min(100, (kiPct/120)*100)}%`}}></div>
                                <span className="absolute right-0 text-[9px] text-slate-500 -mt-4 bg-white px-1" style={{bottom: `${Math.min(100, (kiPct/120)*100)}%`}}>KI ${fmt(kiPrice)}</span>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* 各標的價格試算 */}
                    <div className="space-y-3 pt-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">各標的價格試算</p>
                        {assets.map((asset) => {
                            const p = Number(asset.price) || 0;
                            return (
                                <div key={asset.id} className={`bg-white border border-slate-200 p-3 rounded-xl flex flex-col gap-2 shadow-sm ${asset.id === selectedAssetId ? 'ring-2 ring-amber-500 ring-offset-1' : ''}`}>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="font-bold text-base text-slate-800">{asset.code || '-'}</span>
                                        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">${fmt(p)}</span>
                                    </div>
                                    <div className={`grid ${mode==='NA'?'grid-cols-2':'grid-cols-3'} gap-2 text-center`}>
                                        <div className="bg-green-50 p-1.5 rounded-lg border border-green-100"><p className="text-[9px] text-green-600 font-bold">KO</p><p className="text-xs font-bold text-green-700 font-mono">${fmt(p*koPct/100)}</p></div>
                                        <div className="bg-red-50 p-1.5 rounded-lg border border-red-100"><p className="text-[9px] text-red-500 font-bold">Strike</p><p className="text-xs font-bold text-red-600 font-mono">${fmt(p*strikePct/100)}</p></div>
                                        {mode !== 'NA' && <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100"><p className="text-[9px] text-slate-500 font-bold">KI</p><p className="text-xs font-bold text-slate-700 font-mono">${fmt(p*kiPct/100)}</p></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (其他組件 Unit, Stock, Compound, Dividend, DCA, Loan, Irr, RentVsBuy, Fire, Insurance, Inflation, Forex 保持不變) ...
const UnitCalculator = () => { const [principal, setPrincipal] = useStickyState(1000000, 'v6_unit_p'); const [price, setPrice] = useStickyState(10, 'v6_unit_price'); const [dividend, setDividend] = useStickyState(0.045, 'v6_unit_div'); const [deductHealth, setDeductHealth] = useStickyState(false, 'v6_unit_health'); const units = Number(price) > 0 ? Number(principal) / Number(price) : 0; const grossIncome = units * Number(dividend); const healthFee = (deductHealth && grossIncome >= 20000) ? Math.floor(grossIncome * 0.0211) : 0; const netIncome = grossIncome - healthFee; return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="單位數與配息試算" icon={Layers} description="計算單筆投入可購買單位數，及預估配息收入。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="投入本金" value={principal} onChange={setPrincipal} prefix="$" /><InputGroup label="每單位價格 (NAV)" value={price} onChange={setPrice} prefix="$" /><div className="mb-5 group max-w-[240px]"><label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 ml-1">每單位配息</label><div className="flex gap-2 mb-2"><button onClick={() => setDividend(0.045)} className={`flex-1 py-1.5 text-xs font-mono rounded border transition-colors ${dividend === 0.045 ? 'bg-amber-100 text-amber-700 border-amber-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>0.045</button><button onClick={() => setDividend(0.095)} className={`flex-1 py-1.5 text-xs font-mono rounded border transition-colors ${dividend === 0.095 ? 'bg-amber-100 text-amber-700 border-amber-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>0.095</button></div><div className="relative rounded-xl shadow-sm bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 flex items-center h-[46px] overflow-hidden"><div className="pl-3 pr-2 text-amber-600 font-bold text-sm select-none flex items-center h-full">$</div><input type="number" step="0.001" value={dividend} onChange={(e) => setDividend(Number(e.target.value))} className="flex-1 h-full w-full bg-transparent border-none focus:ring-0 text-slate-800 text-sm font-mono pl-0" /></div></div><div className="flex items-center gap-2 mt-4 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors" onClick={() => setDeductHealth(!deductHealth)}><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${deductHealth ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`}>{deductHealth && <Check size={14} className="text-white" />}</div><span className="text-sm text-slate-600 select-none font-medium">扣除二代健保 (2.11%)</span></div></div><div className="space-y-4"><ResultCard title="總購買單位數" value={`${fmt(units)} 單位`} highlight={true} /><ResultCard title="預計配息 (單次)" value={`$${fmt(netIncome)}`} subtext={healthFee > 0 ? `已扣除健保費 $${fmt(healthFee)}` : '未達扣費門檻或未勾選'} /></div></div></div>); };
const StockCalculator = () => { const [buyPrice, setBuyPrice] = useStickyState(100, 'v5_stk_buy'); const [sellPrice, setSellPrice] = useStickyState(110, 'v5_stk_sell'); const [shares, setShares] = useStickyState(1000, 'v5_stk_sh'); const [discount, setDiscount] = useStickyState(60, 'v5_stk_disc'); const [type, setType] = useStickyState('stock', 'v5_stk_type'); const calculate = () => { let taxRate = 0.003; if (type === 'day') taxRate = 0.0015; if (type === 'etf') taxRate = 0.001; if (type === 'bond') taxRate = 0; const feeRate = 0.001425; const discVal = discount / 100; const totalShares = Number(shares); const buyVal = buyPrice * totalShares; const sellVal = sellPrice * totalShares; const buyFee = Math.floor(Math.max(20, buyVal * feeRate * discVal)); const sellFee = Math.floor(Math.max(20, sellVal * feeRate * discVal)); const tax = Math.floor(sellVal * taxRate); const profit = sellVal - sellFee - tax - buyVal - buyFee; const buySettlement = buyVal + buyFee; const sellSettlement = sellVal - sellFee - tax; return { profit, tax, buyFee, sellFee, buySettlement, sellSettlement, buyVal, sellVal }; }; const res = calculate(); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="台股交易獲利" icon={BarChart3} description="支援個股、當沖、ETF (0.1%) 及債券 (0%) 稅率。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-fit"><div className="mb-6 max-w-[240px]"><label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 ml-1">交易種類</label><div className="grid grid-cols-2 gap-2">{[{id:'stock', name:'個股 (0.3%)'}, {id:'day', name:'當沖 (0.15%)'}, {id:'etf', name:'ETF (0.1%)'}, {id:'bond', name:'債券ETF (0%)'}].map(t => (<button key={t.id} onClick={()=>setType(t.id)} className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${type===t.id ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'text-slate-500 border-slate-200 bg-slate-50 hover:bg-white'}`}>{t.name}</button>))}</div></div><InputGroup label="買入價格" value={buyPrice} onChange={setBuyPrice} prefix="$" /><InputGroup label="賣出價格" value={sellPrice} onChange={setSellPrice} prefix="$" /><InputGroup label="股數" value={shares} onChange={setShares} suffix="股" /><div className="mb-5 group max-w-[240px]"><label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5 ml-1">手續費折數 ({(discount/10).toFixed(1)}折)</label><div className="flex gap-3 items-center bg-slate-50 p-2 rounded-xl border border-slate-200"><input type="range" min="10" max="100" step="1" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"/><input type="number" value={discount} onChange={(e)=>setDiscount(Number(e.target.value))} className="w-12 p-1.5 border border-slate-300 rounded-lg text-center font-mono text-xs focus:ring-amber-500 outline-none" /></div><p className="mt-1.5 text-[10px] text-slate-400 text-right">輸入28 = 2.8折</p></div></div><div className="space-y-4"><ResultCard title="預估淨損益" value={`$${fmt(res.profit)}`} highlight={true} colorClass={res.profit >= 0 ? "text-red-500" : "text-green-600"} /><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs text-slate-600"><div className="border-b border-slate-200 pb-1 mb-2 font-bold text-slate-400 uppercase tracking-widest text-[10px]">交易明細 (Breakdown)</div><div className="flex justify-between"><span>(A) 買進價金</span><span>${fmt(res.buyVal)}</span></div><div className="flex justify-between"><span>(B) 買入手續費</span><span>${fmt(res.buyFee)}</span></div><div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1"><span>買進交割 (A+B)</span><span>${fmt(res.buySettlement)}</span></div><div className="border-b border-slate-200 my-2"></div><div className="flex justify-between"><span>(C) 賣出價金</span><span>${fmt(res.sellVal)}</span></div><div className="flex justify-between"><span>(D) 賣出手續費</span><span>${fmt(res.sellFee)}</span></div><div className="flex justify-between"><span>(E) 證交稅</span><span>${fmt(res.tax)}</span></div><div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1"><span>賣出交割 (C-D-E)</span><span>${fmt(res.sellSettlement)}</span></div></div><div className="p-2 bg-blue-50 text-blue-700 text-[10px] rounded-lg text-center font-mono">公式：獲利 = C - D - E - A - B</div></div></div></div>); };
const CompoundCalculator = () => { const [principal, setPrincipal] = useStickyState(100000, 'v4_cmp_p'); const [rate, setRate] = useStickyState(6, 'v4_cmp_r'); const [years, setYears] = useStickyState(20, 'v4_cmp_y'); const [compareMode, setCompareMode] = useState(false); const [compareRate, setCompareRate] = useStickyState(1.7, 'v4_cmp_cr'); const calculate = (r) => { const P = Number(principal); const rateVal = Number(r)/100; let data = []; for(let i=0; i<=years; i++) data.push({ value: P * Math.pow((1 + rateVal), i) }); return { final: data[data.length-1].value, data }; }; const res1 = calculate(rate); const res2 = calculate(compareRate); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="單筆複利效應" icon={TrendingUp} description="時間是財富最好的朋友，PK 模式比較投資與定存差距。" /><div className="flex justify-end no-print mb-2"><button onClick={()=>setCompareMode(!compareMode)} className={`text-xs px-3 py-1 rounded-full border transition-all ${compareMode ? 'bg-amber-600 text-white border-amber-600' : 'text-slate-500 border-slate-300 hover:border-amber-500 hover:text-amber-600'}`}>{compareMode ? '關閉比較' : '開啟定存 PK'}</button></div><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="本金投入" value={principal} onChange={setPrincipal} prefix="$" /><InputGroup label="投資年化報酬率" value={rate} onChange={setRate} suffix="%" /><InputGroup label="投資年限" value={years} onChange={setYears} suffix="年" />{compareMode && <div className="pt-3 border-t border-slate-100 mt-3 animate-in fade-in"><InputGroup label="比較對象 (如定存) 利率" value={compareRate} onChange={setCompareRate} suffix="%" /></div>}</div><div className="space-y-4"><ResultCard title={`${years} 年後總資產`} value={`$${fmt(res1.final)}`} highlight={true} />{compareMode && <ResultCard title="定存對照組資產" value={`$${fmt(res2.final)}`} subtext={`相差 $${fmt(res1.final - res2.final)}`} colorClass="text-slate-500" />}<div className="bg-white p-3 rounded-xl border border-slate-200 no-print"><InteractiveChart data={res1.data} data2={compareMode ? res2.data : null} title="資產成長"/></div></div></div></div>); };
const DividendCalculator = () => { const [shares, setShares] = useStickyState(10000, 'v4_div_sh'); const [dividend, setDividend] = useStickyState(1.5, 'v4_div_val'); const [freq, setFreq] = useStickyState(1, 'v4_div_freq'); const totalDiv = shares * dividend; const singlePayment = totalDiv / freq; const healthFee = singlePayment >= 20000 ? Math.floor(totalDiv * 0.0211) : 0; const finalIncome = totalDiv - healthFee; return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="存股配息 & 二代健保" icon={Coins} description="自動試算補充保費門檻 (單筆2萬)。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="持有股數" value={shares} onChange={setShares} suffix="股" /><InputGroup label="預估每股總配息 (年)" value={dividend} onChange={setDividend} prefix="$" /><div className="mb-4 max-w-[240px]"><label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5 ml-1">配息頻率</label><div className="flex gap-2">{[{v:1, l:'年配'}, {v:2, l:'半年'}, {v:4, l:'季配'}, {v:12, l:'月配'}].map(o => (<button key={o.v} onClick={()=>setFreq(o.v)} className={`flex-1 py-3 text-sm rounded-xl border transition-colors ${freq===o.v ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white'}`}>{o.l}</button>))}</div></div></div><div className="space-y-4"><ResultCard title="全年總股息 (稅前)" value={`$${fmt(totalDiv)}`} />{healthFee > 0 && <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-xs"><AlertTriangle size={14} className="mt-0.5 shrink-0"/><span>單次領取 ${fmt(singlePayment)} 已達 2 萬，預估扣除補充保費 <strong>${fmt(healthFee)}</strong></span></div>}<ResultCard title="實領金額 (稅後)" value={`$${fmt(finalIncome)}`} highlight={true} /></div></div></div>); };
const DcaCalculator = () => { const [monthly, setMonthly] = useStickyState(10000, 'v4_dca_m'); const [rate, setRate] = useStickyState(6, 'v4_dca_r'); const [years, setYears] = useStickyState(20, 'v4_dca_y'); const calculate = () => { const pmt = Number(monthly); const r = Number(rate)/100/12; const n = Number(years)*12; let data = []; for(let i=0; i<=Number(years); i++) { let m = i*12; data.push({ value: m===0?0:pmt*(Math.pow(1+r,m)-1)/r }); } const fv = data[data.length-1].value; return { fv, total: pmt*n, data }; }; const res = calculate(); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="定期定額試算" icon={RefreshCw} description="每月固定投入，享受時間複利與平均成本的威力。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="每月投入金額" value={monthly} onChange={setMonthly} prefix="$" /><InputGroup label="預期年化報酬率" value={rate} onChange={setRate} suffix="%" /><InputGroup label="投資期間" value={years} onChange={setYears} suffix="年" /></div><div className="space-y-4"><ResultCard title="期末總資產預估" value={`$${fmt(res.fv)}`} highlight={true} /><div className="bg-white p-3 rounded-xl border border-slate-200 no-print"><InteractiveChart data={res.data} title="資產累積"/></div></div></div></div>); };
const ForexCalculator = () => { const [amount, setAmount] = useStickyState(1000, 'v5_fx_amt'); const [fromCurr, setFromCurr] = useStickyState('USD', 'v5_fx_from'); const [toCurr, setToCurr] = useStickyState('TWD', 'v5_fx_to'); const [rates, setRates] = useState({}); const [loading, setLoading] = useState(false); const [manualRate, setManualRate] = useState(''); const currencies = [{c:'TWD',n:'台幣'}, {c:'USD',n:'美金'}, {c:'JPY',n:'日圓'}, {c:'EUR',n:'歐元'}, {c:'CNY',n:'人民幣'}, {c:'HKD',n:'港幣'}, {c:'GBP',n:'英鎊'}, {c:'AUD',n:'澳幣'}, {c:'CAD',n:'加幣'}, {c:'SGD',n:'新幣'}, {c:'CHF',n:'瑞郎'}, {c:'ZAR',n:'南非幣'}, {c:'KRW',n:'韓元'}, {c:'THB',n:'泰銖'}, {c:'VND',n:'越南盾'}]; useEffect(() => { setLoading(true); fetch('https://api.exchangerate-api.com/v4/latest/USD').then(res => res.json()).then(data => { if(data && data.rates) setRates(data.rates); }).catch(err => console.log('API Error')).finally(() => setLoading(false)); }, []); const handleSwap = () => { const temp = fromCurr; setFromCurr(toCurr); setToCurr(temp); setManualRate(''); }; const getRate = (c) => c === 'USD' ? 1 : (rates[c] || 0); const sysRate = (getRate(toCurr) / getRate(fromCurr)) || 0; const finalRate = manualRate ? Number(manualRate) : sysRate; return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="即時匯率換算" icon={Globe} description="自動抓取 15+ 國即時匯率，支援交叉換算。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 h-fit"><div className="flex items-center gap-2 mb-4 max-w-[240px]"><div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">持有</label><select value={fromCurr} onChange={(e)=>setFromCurr(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs font-bold focus:ring-amber-500">{currencies.map(c=><option key={c.c} value={c.c}>{c.c} {c.n}</option>)}</select></div><button onClick={handleSwap} className="mt-5 p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"><ArrowRightLeft size={16}/></button><div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">兌換</label><select value={toCurr} onChange={(e)=>setToCurr(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 text-xs font-bold focus:ring-amber-500">{currencies.map(c=><option key={c.c} value={c.c}>{c.c} {c.n}</option>)}</select></div></div><InputGroup label="金額" value={amount} onChange={setAmount} prefix="$" /><div className="mb-4 max-w-[240px]"><div className="flex justify-between mb-1 ml-1"><label className="text-xs font-bold text-slate-500">成交匯率</label><span className="text-[10px] text-blue-500 cursor-pointer hover:underline" onClick={()=>setManualRate('')}>重置為即時匯率</span></div><input type="number" step="0.0001" value={manualRate || (sysRate ? sysRate.toFixed(4) : '')} onChange={(e) => setManualRate(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-amber-500 outline-none"/><p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 ml-1">{loading ? <RefreshCw className="animate-spin" size={10}/> : null} {sysRate ? `1 ${fromCurr} ≈ ${sysRate.toFixed(4)} ${toCurr}` : '載入中...'}</p></div></div><div className="space-y-4"><ResultCard title={`約合 ${toCurr}`} value={`$${fmt(amount * finalRate)}`} highlight={true} /></div></div></div>); };
const TaxCalculator = () => { const [mode, setMode] = useState('income'); const [inputValue, setInputValue] = useStickyState(1500000, 'v4_tax_val'); const [result, setResult] = useState({}); const AMT_EXEMPTION = 7500000; const brackets = [{ limit: 610000, rate: 0.05, correction: 0, maxTax: 30500 }, { limit: 1330000, rate: 0.12, correction: 42700, maxTax: 116900 }, { limit: 2660000, rate: 0.20, correction: 149100, maxTax: 382900 }, { limit: 4980000, rate: 0.30, correction: 415100, maxTax: 1078900 }, { limit: Infinity, rate: 0.40, correction: 913100, maxTax: Infinity }]; const calculateIncomeFromTax = (tax) => { if (tax <= 0) return 0; let bracket = brackets.find(b => tax <= b.maxTax); if (!bracket) bracket = brackets[brackets.length - 1]; return Math.floor((tax + bracket.correction) / bracket.rate); }; useEffect(() => { let regularTax = 0, netIncome = 0; if (mode === 'income') { netIncome = Number(inputValue); let bracket = brackets.find(b => netIncome <= b.limit) || brackets[brackets.length - 1]; regularTax = Math.max(0, Math.floor(netIncome * bracket.rate - bracket.correction)); } else { regularTax = Number(inputValue); netIncome = calculateIncomeFromTax(regularTax); } let quota = (regularTax / 0.2) + AMT_EXEMPTION - netIncome; setResult({ regularTax, netIncome, quota: Math.max(1000000, Math.floor(quota)) }); }, [inputValue, mode]); return (<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="2025 海外所得額度" icon={Calculator} description="輸入「所得淨額」或「應繳稅額」，自動反推免稅額度。" /><div className="flex bg-slate-100 p-1 rounded-lg w-full max-w-[240px] border border-slate-200 mb-6"><button onClick={() => setMode('income')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === 'income' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>輸入所得</button><button onClick={() => setMode('tax')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === 'tax' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>輸入稅額</button></div><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden h-fit"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-transparent"></div><InputGroup label={mode === 'income' ? "國內綜合所得淨額" : "今年應繳一般所得稅額"} value={inputValue} onChange={setInputValue} prefix="$" placeholder="請輸入金額"/><div className="mb-5 group max-w-[240px]"><div className="flex justify-between items-center mb-2"><label className="text-xs uppercase tracking-wider font-bold text-slate-400 ml-1">基本稅額免稅額 (2025)</label><Lock size={12} className="text-slate-400"/></div><div className="relative rounded-lg bg-slate-50 border border-slate-200 p-3 flex justify-between items-center h-[42px]"><span className="text-slate-600 font-mono pl-3 text-sm">$7,500,000</span><span className="text-[10px] text-slate-500 border border-slate-200 bg-white px-2 py-0.5 rounded uppercase tracking-wider">法定固定</span><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-400 sm:text-sm">$</span></div></div></div>{mode === 'tax' && <div className="mt-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-xs text-slate-600 flex justify-between"><span>反推綜合所得淨額：</span><span className="font-mono text-amber-600 font-bold">${fmt(result.netIncome)}</span></div>}</div><div className="space-y-4"><ResultCard title="最佳海外所得配置額度" value={`$${fmt(result.quota)}`} subtext="在此金額內的海外收入，不需補繳最低稅負 (AMT)。" highlight={true} /><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><p className="text-xs text-slate-500 mb-1">一般所得稅</p><p className="text-lg font-bold text-slate-700 font-mono">${fmt(result.regularTax)}</p></div><div className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><p className="text-xs text-slate-500 mb-1">基本稅額門檻</p><p className="text-lg font-bold text-slate-700 font-mono">${fmt(result.regularTax)}</p></div></div></div></div></div>); };
const LoanCalculator = () => { const [loanAmount, setLoanAmount] = useStickyState(10000000, 'v4_loan_amt'); const [rate, setRate] = useStickyState(2.1, 'v4_loan_rate'); const [years, setYears] = useStickyState(30, 'v4_loan_yrs'); const [gracePeriod, setGracePeriod] = useStickyState(0, 'v4_loan_grace'); const calculate = () => { const P = Number(loanAmount); const r = Number(rate) / 100 / 12; const graceMonths = Number(gracePeriod) * 12; const remainMonths = (Number(years) * 12) - graceMonths; const gracePayment = Math.round(P * r); const normalPayment = remainMonths > 0 ? Math.round(P * r * Math.pow(1 + r, remainMonths) / (Math.pow(1 + r, remainMonths) - 1)) : 0; return { gracePayment, normalPayment }; }; const res = calculate(); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="房貸試算" icon={Home} description="含寬限期。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="貸款總金額" value={loanAmount} onChange={setLoanAmount} prefix="$" /><InputGroup label="年利率" value={rate} onChange={setRate} suffix="%" step="0.01" /><InputGroup label="總期限" value={years} onChange={setYears} suffix="年" /><InputGroup label="寬限期" value={gracePeriod} onChange={setGracePeriod} suffix="年" /></div><div className="space-y-4">{gracePeriod > 0 && <ResultCard title={`前 ${gracePeriod} 年月付金`} value={`$${fmt(res.gracePayment)}`} subtext="只繳利息" />}<ResultCard title={gracePeriod > 0 ? "寬限期後月付金" : "每月應繳本息"} value={`$${fmt(res.normalPayment)}`} highlight={true} /></div></div></div>); };
const IrrCalculator = () => { const [prin, setPrin] = useStickyState(1000000, 'v4_irr_p'); const [final, setFinal] = useStickyState(1200000, 'v4_irr_f'); const [yrs, setYrs] = useStickyState(6, 'v4_irr_y'); const irr = (Math.pow(final/prin, 1/yrs)-1)*100; return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="IRR 試算" icon={Percent} description="躉繳試算。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="投入" value={prin} onChange={setPrin} prefix="$" /><InputGroup label="領回" value={final} onChange={setFinal} prefix="$" /><InputGroup label="年數" value={yrs} onChange={setYrs} suffix="年" /></div><div className="space-y-4"><ResultCard title="IRR" value={`${irr.toFixed(2)}%`} highlight={true} /></div></div></div>); };
const RentVsBuy = () => { const [h, sH] = useStickyState(15000000, 'rvb_p'); const [r, sR] = useStickyState(30000, 'rvb_r'); const [i, sI] = useStickyState(6, 'rvb_i'); const [y, sY] = useStickyState(20, 'rvb_y'); const d = h*0.2; const l = h*0.8; const rt = 0.021/12; const n = 360; const m = l*rt*Math.pow(1+rt,n)/(Math.pow(1+rt,n)-1); const be = h*Math.pow(1.02, y)-(y<30?l*0.4:0); const re = d*Math.pow(1+i/100, y)+Math.max(0, m-r)*12*y; return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="買房 vs 租房" icon={Building} description="20年後資產 PK。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="房價" value={h} onChange={sH} prefix="$" /><InputGroup label="租金" value={r} onChange={sR} prefix="$" /><InputGroup label="投資報酬率" value={i} onChange={sI} suffix="%" /></div><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><ResultCard title="買房淨資產" value={`$${fmt(be)}`} highlight={be>re} /><ResultCard title="租房淨資產" value={`$${fmt(re)}`} highlight={re>be} /></div></div></div></div>); };
const FireCalculator = () => { const [e, sE] = useStickyState(600000, 'fire_e'); const [p, sP] = useStickyState(20000, 'fire_p'); const [a, sA] = useStickyState(2000000, 'fire_a'); const fn = Math.max(0, e-p*12)*25; const prog = Math.min(100, (a/fn)*100); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="FIRE 退休" icon={Target} description="4% 法則。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="年支出" value={e} onChange={sE} prefix="$" /><InputGroup label="勞保勞退(月)" value={p} onChange={sP} prefix="$" /><InputGroup label="目前資產" value={a} onChange={sA} prefix="$" /></div><div className="space-y-4"><div className="bg-white border border-slate-200 p-6 rounded-xl relative overflow-hidden shadow-sm"><p className="text-slate-400 text-xs uppercase mb-1 font-bold">FIRE Number</p><p className="text-3xl font-bold text-amber-500 mb-4 font-mono">${fmt(fn)}</p><div className="w-full bg-slate-100 rounded-full h-2 mb-1"><div className="bg-amber-500 h-2 rounded-full" style={{ width: `${prog}%` }}></div></div><p className="text-xs text-right text-slate-400">進度 {prog.toFixed(1)}%</p></div></div></div></div>); };
const InsuranceGap = () => { const [d, sD] = useStickyState(5000000, 'ins_d'); const [f, sF] = useStickyState(5000000, 'ins_f'); const [s, sS] = useStickyState(1000000, 'ins_s'); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="保險缺口" icon={ShieldCheck} description="責任需求法。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="負債" value={d} onChange={sD} prefix="$" /><InputGroup label="家人需求" value={f} onChange={sF} prefix="$" /><InputGroup label="資產" value={s} onChange={sS} prefix="$" /></div><div className="space-y-4"><ResultCard title="保障缺口" value={`$${fmt(Math.max(0, Number(d)+Number(f)-Number(s)))}`} highlight={true} colorClass="text-red-500" /></div></div></div>); };
const InflationCalc = () => { const [a, sA] = useStickyState(1000000, 'inf_a'); const [r, sR] = useStickyState(3, 'inf_r'); const [y, sY] = useStickyState(20, 'inf_y'); return (<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4"><SectionHeader title="通膨試算" icon={TrendingDown} description="購買力。" /><div className="grid md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit"><InputGroup label="金額" value={a} onChange={sA} prefix="$" /><InputGroup label="通膨率" value={r} onChange={sR} suffix="%" /><InputGroup label="年數" value={y} onChange={sY} suffix="年" /></div><div className="space-y-4"><ResultCard title="實質購買力" value={`$${fmt(a*Math.pow(1-r/100, y))}`} highlight={true} colorClass="text-orange-500" /></div></div></div>); };

// 品牌設定 (修正手機中文輸入問題)
const ProfileSettings = ({ settings, onUpdate }) => {
    // 移除內部 state，直接使用父層傳來的 props
    // 使用 defaultValue 讓使用者可以自由輸入，只有在 onBlur 時才觸發更新
    return (
        <div className="space-y-6">
            <SectionHeader title="品牌設定" icon={User} description="設定浮水印，將顯示在所有截圖與報表中。" />
            <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-lg">
                <div className="mb-5 group w-full max-w-[280px]">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 ml-1">姓名 / 職稱</label>
                    <input type="text" defaultValue={settings.name} onBlur={(e)=>onUpdate('name', e.target.value)} placeholder="例：王小明 經理" className="w-full p-3 border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-amber-500"/>
                </div>
                <div className="mb-5 group w-full max-w-[280px]">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 ml-1">LINE ID</label>
                    <input type="text" defaultValue={settings.line} onBlur={(e)=>onUpdate('line', e.target.value)} placeholder="ID" className="w-full p-3 border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-amber-500"/>
                </div>
                <div className="mb-5 group w-full max-w-[280px]">
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 ml-1">電話</label>
                    <input type="text" defaultValue={settings.phone} onBlur={(e)=>onUpdate('phone', e.target.value)} placeholder="0912-345-678" className="w-full p-3 border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-amber-500"/>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                    <ShieldCheck size={18} /> 輸入完畢點擊空白處自動儲存
                </div>
            </div>
        </div>
    );
};

// ... (HomePage, Layout 保持不變) ...

// ==========================================
// 主程式 Layout
// ==========================================
const FinancialToolkit = () => {
  const [activeTab, setActiveTab] = useStickyState('home', 'v6_tab');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [brandSettings, setBrandSettings] = useStickyState({ name: '', line: '', phone: '' }, 'v5_brand_settings');

  const updateBrandSettings = (field, value) => {
    setBrandSettings(prev => ({ ...prev, [field]: value }));
  };

  const menuCategories = [
    { title: "獲利決策", items: [{ id: 'compound', name: '複利 PK', icon: TrendingUp }, { id: 'stock', name: '交易試算', icon: BarChart3 }, { id: 'unit', name: '單位數試算', icon: Layers }, { id: 'dividend', name: '配息健保', icon: Coins }, { id: 'rvb', name: '買租比較', icon: Building }] },
    { title: "稅務規劃", items: [{ id: 'tax', name: '稅務試算', icon: Calculator }, { id: 'loan', name: '房貸寬限', icon: Home }, { id: 'fire', name: 'FIRE 退休', icon: Target }, { id: 'ins', name: '保險缺口', icon: ShieldCheck }] },
    { title: "實用工具", items: [{ id: 'forex', name: '匯率換算', icon: Globe }, { id: 'fcn', name: 'FCN 試算', icon: PieChart }, { id: 'dca', name: '定期定額', icon: RefreshCw }, { id: 'irr', name: 'IRR', icon: Percent }, { id: 'inf', name: '通膨試算', icon: TrendingDown }] },
    { title: "個人", items: [{ id: 'profile', name: '品牌設定', icon: User }] }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage changeTab={setActiveTab} />;
      case 'tax': return <TaxCalculator />; case 'compound': return <CompoundCalculator />; case 'stock': return <StockCalculator />;
      case 'unit': return <UnitCalculator />;
      case 'dividend': return <DividendCalculator />; case 'loan': return <LoanCalculator />; case 'fire': return <FireCalculator />;
      case 'rvb': return <RentVsBuy />; case 'ins': return <InsuranceGap />; case 'inf': return <InflationCalc />;
      case 'forex': return <ForexCalculator />; case 'fcn': return <FcnCalculator />;
      case 'dca': return <DcaCalculator />; case 'irr': return <IrrCalculator />;
      case 'profile': return <ProfileSettings settings={brandSettings} onUpdate={updateBrandSettings} />;
      default: return <HomePage changeTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row print:bg-white print:text-black selection:bg-amber-100 overflow-x-hidden">
      <div className="md:hidden bg-white/90 backdrop-blur-md shadow-sm p-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200 print:hidden">
        <div onClick={() => setActiveTab('home')} className="flex items-center gap-2 font-bold text-lg text-slate-900 cursor-pointer">
            <Briefcase className="text-amber-500" />
            <span className="tracking-wide">FinKit</span>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-500 hover:text-slate-900">{isMenuOpen ? <X /> : <Menu />}</button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-full md:w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out print:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block overflow-y-auto custom-scrollbar`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => {setActiveTab('home'); setIsMenuOpen(false);}}>
                <Briefcase className="text-amber-500 group-hover:rotate-12 transition-transform" size={28}/>
                <span className="font-bold text-2xl text-slate-900 tracking-wide">FinKit</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"><X size={24}/></button>
        </div>
        
        {brandSettings.name && (
            <div className="mx-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg">{brandSettings.name[0]}</div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{brandSettings.name}</p>
                    <p className="text-xs text-amber-600 truncate">專屬顧問</p>
                </div>
            </div>
        )}
        
        <nav className="p-4 space-y-8 mt-2 pb-20">{menuCategories.map((group, idx) => (<div key={idx}><h3 className="px-4 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{group.title}</h3><div className="space-y-1">{group.items.map((tab) => { const IconV = tab.icon; const isActive = activeTab === tab.id; return (<button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium border border-transparent ${isActive ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}><IconV size={18} className={isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'} />{tab.name}</button>); })}</div></div>))}</nav>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto print:p-0 print:overflow-visible h-screen bg-slate-50">
        <div id="capture-area" className="max-w-5xl mx-auto print:max-w-none print:w-full pb-20 bg-slate-50 p-4 rounded-xl">
          <div className="hidden print:flex justify-between items-end mb-8 border-b border-slate-200 pb-4"><div className="flex items-center gap-2 font-bold text-2xl text-black"><Briefcase className="text-black" size={32} /><span>FinKit 理財規劃報告</span></div><div className="text-right text-sm text-slate-500"><p>Generated by FinKit</p>{brandSettings.name && <p className="font-bold text-black mt-1">顧問：{brandSettings.name}</p>}</div></div>
          {renderContent()}
          <footer className="mt-20 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-left">
                <p>© 2026 FinKit. 用心規劃，遇見美好未來。</p>
                <p className="opacity-70">本站工具僅供試算參考，不代表投資建議。</p>
            </div>
            {brandSettings.name && (
                <div className="flex items-center gap-3 opacity-80 border-l border-slate-300 pl-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">{brandSettings.name[0]}</div>
                    <div className="text-left">
                        <p className="font-bold text-slate-700 text-sm">{brandSettings.name}</p>
                        <p className="text-xs text-slate-500">
                            {brandSettings.line ? `LINE: ${brandSettings.line}` : ''}
                            {brandSettings.phone ? ` • ${brandSettings.phone}` : ''}
                        </p>
                    </div>
                </div>
            )}
          </footer>
        </div>
      </main>
      
      {isMenuOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden print:hidden" onClick={() => setIsMenuOpen(false)} />}
    </div>
  );
};

export default FinancialToolkit;


