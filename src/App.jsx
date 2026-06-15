import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  BookOpen,
  Briefcase,
  Building,
  Calculator,
  Camera,
  Check,
  Coins,
  Compass,
  CreditCard,
  Download,
  FileText,
  Globe,
  Home,
  Info,
  Landmark,
  Layers,
  Mail,
  Menu,
  Percent,
  PieChart,
  PiggyBank,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';

const ADSENSE_CLIENT = 'ca-pub-4463068342710380';
const SITE_URL = 'https://finkit.top';
const AUTH_PROFILES_KEY = 'finkit:auth:profiles';
const AUTH_CURRENT_KEY = 'finkit:auth:current';

const AuthContext = createContext({
  profile: null,
  profiles: [],
  login: () => ({ ok: false, message: '尚未初始化' }),
  logout: () => {},
  switchProfile: () => {},
  removeProfile: () => {},
});

const readJson = (key, fallback) => {
  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can be unavailable in private browsing.
  }
};

const profileIdFrom = (identifier) =>
  identifier
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@\u4e00-\u9fa5._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const pinHash = (pin) => {
  let hash = 2166136261;
  for (const char of `finkit:${pin}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

function AuthProvider({ children }) {
  const [profiles, setProfiles] = useState(() => readJson(AUTH_PROFILES_KEY, []));
  const [currentId, setCurrentId] = useState(() => {
    try {
      return window.localStorage.getItem(AUTH_CURRENT_KEY) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    writeJson(AUTH_PROFILES_KEY, profiles);
  }, [profiles]);

  useEffect(() => {
    try {
      if (currentId) window.localStorage.setItem(AUTH_CURRENT_KEY, currentId);
      else window.localStorage.removeItem(AUTH_CURRENT_KEY);
    } catch {
      // Ignore storage errors.
    }
  }, [currentId]);

  const profile = profiles.find((item) => item.id === currentId) || null;

  const login = (identifier, pin) => {
    const id = profileIdFrom(identifier);
    const cleanName = identifier.trim();
    if (!id || cleanName.length < 2) return { ok: false, message: '請輸入至少 2 個字的暱稱或 Email。' };
    if (!pin || pin.length < 4) return { ok: false, message: 'PIN 至少需要 4 碼。' };

    const existing = profiles.find((item) => item.id === id);
    const hashed = pinHash(pin);
    if (existing && existing.pinHash !== hashed) return { ok: false, message: 'PIN 不正確。' };

    const now = new Date().toISOString();
    if (existing) {
      setProfiles((items) => items.map((item) => (item.id === id ? { ...item, lastLoginAt: now } : item)));
    } else {
      setProfiles((items) => [...items, { id, name: cleanName, pinHash: hashed, createdAt: now, lastLoginAt: now }]);
    }
    setCurrentId(id);
    return { ok: true, message: existing ? '已登入，暫存資料已切換。' : '已建立本機個人檔。' };
  };

  const logout = () => setCurrentId('');
  const switchProfile = (id) => setCurrentId(id);
  const removeProfile = (id) => {
    try {
      const prefix = `finkit:${id}:`;
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith(prefix)) window.localStorage.removeItem(key);
      });
    } catch {
      // Ignore storage errors.
    }
    setProfiles((items) => items.filter((item) => item.id !== id));
    if (currentId === id) setCurrentId('');
  };

  const value = useMemo(() => ({ profile, profiles, login, logout, switchProfile, removeProfile }), [profile, profiles]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => useContext(AuthContext);

function useStickyState(defaultValue, key) {
  const { profile } = useAuth();
  const scopedKey = `finkit:${profile?.id || 'guest'}:${key}`;
  const scopedKeyRef = useRef(scopedKey);
  const [value, setValue] = useState(() => {
    return readJson(scopedKey, defaultValue);
  });

  useEffect(() => {
    setValue(readJson(scopedKey, defaultValue));
  }, [scopedKey]);

  useEffect(() => {
    if (scopedKeyRef.current !== scopedKey) {
      scopedKeyRef.current = scopedKey;
      return;
    }
    writeJson(scopedKey, value);
  }, [scopedKey, value]);

  return [value, setValue];
}

function LocalLoginPanel() {
  const auth = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const result = auth.login(identifier, pin);
    setMessage(result.message);
    if (result.ok) setPin('');
  };

  if (auth.profile) {
    return (
      <div className="mx-4 mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 font-black text-white">
            {auth.profile.name[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">{auth.profile.name}</p>
            <p className="text-xs text-emerald-700">本機暫存已啟用</p>
          </div>
        </div>
        {auth.profiles.length > 1 ? (
          <select
            value={auth.profile.id}
            onChange={(event) => auth.switchProfile(event.target.value)}
            className="mb-2 h-9 w-full rounded-lg border border-emerald-200 bg-white px-2 text-xs font-bold text-slate-700"
          >
            {auth.profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={auth.logout} className="focus-ring rounded-lg border border-emerald-200 bg-white px-2 py-2 text-xs font-bold text-emerald-700">
            登出
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要移除此本機個人檔與暫存資料嗎？')) auth.removeProfile(auth.profile.id);
            }}
            className="focus-ring rounded-lg border border-rose-200 bg-white px-2 py-2 text-xs font-bold text-rose-700"
          >
            移除
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-emerald-700">資料保存在這台裝置，不會跨瀏覽器同步。</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-4 mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3">
      <p className="mb-2 text-sm font-black text-slate-900">簡易登入暫存</p>
      <label className="mb-2 block">
        <span className="mb-1 block text-xs font-bold text-slate-500">暱稱 / Email</span>
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          className="h-9 w-full rounded-lg border border-sky-200 bg-white px-2 text-sm outline-none focus:border-sky-500"
          placeholder="例：staney"
        />
      </label>
      <label className="mb-2 block">
        <span className="mb-1 block text-xs font-bold text-slate-500">PIN</span>
        <input
          type="password"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          className="h-9 w-full rounded-lg border border-sky-200 bg-white px-2 text-sm outline-none focus:border-sky-500"
          placeholder="至少 4 碼"
        />
      </label>
      <button type="submit" className="focus-ring w-full rounded-lg bg-sky-700 px-3 py-2 text-xs font-bold text-white hover:bg-sky-800">
        登入 / 建立本機檔案
      </button>
      {message ? <p className="mt-2 text-xs leading-relaxed text-sky-800">{message}</p> : null}
      <p className="mt-2 text-xs leading-relaxed text-slate-500">適合暫存試算內容；不是雲端帳號。</p>
    </form>
  );
}

const n = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const fmt = (value, digits = 0) => new Intl.NumberFormat('zh-TW', { maximumFractionDigits: digits }).format(n(value));
const money = (value, digits = 0) => `$${fmt(value, digits)}`;
const pct = (value, digits = 1) => `${fmt(value, digits)}%`;

const toneMap = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    fill: 'bg-amber-500',
    line: '#d97706',
  },
  sky: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    icon: 'text-sky-600',
    fill: 'bg-sky-500',
    line: '#0284c7',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    fill: 'bg-emerald-500',
    line: '#059669',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    fill: 'bg-rose-500',
    line: '#e11d48',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    icon: 'text-indigo-600',
    fill: 'bg-indigo-500',
    line: '#4f46e5',
  },
};

function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = '1',
  min,
  max,
  type = 'number',
  placeholder,
  note,
}) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="flex h-11 items-center overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
        {prefix ? <span className="px-3 text-sm font-bold text-slate-500">{prefix}</span> : null}
        <input
          type={type}
          value={value}
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mono h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-900 outline-none"
        />
        {suffix ? <span className="border-l border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-500">{suffix}</span> : null}
      </span>
      {note ? <span className="mt-1.5 block text-xs leading-relaxed text-slate-400">{note}</span> : null}
    </label>
  );
}

function SelectField({ label, value, onChange, options, note }) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {note ? <span className="mt-1.5 block text-xs leading-relaxed text-slate-400">{note}</span> : null}
    </label>
  );
}

function ResultCard({ title, value, detail, tone = 'amber', icon: Icon = Info }) {
  const colors = toneMap[tone] || toneMap.amber;
  return (
    <div className={`tool-card p-4 ${colors.border}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg} ${colors.icon}`}>
          <Icon size={17} />
        </span>
      </div>
      <p className={`mono break-words text-2xl font-bold tracking-tight ${colors.text}`}>{value}</p>
      {detail ? <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">{detail}</p> : null}
    </div>
  );
}

function SectionHeader({ title, icon: Icon, description, source }) {
  const [capturing, setCapturing] = useState(false);

  const capture = async () => {
    const target = document.getElementById('capture-area');
    if (!target || capturing) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(target, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        ignoreElements: (element) => element.classList?.contains('no-capture') || element.classList?.contains('adsbygoogle'),
      });
      const link = document.createElement('a');
      link.download = `FinKit-${title}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      window.alert('圖片產生失敗，請稍後再試。');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <header className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sky-600 shadow-sm">
            <Icon size={21} />
          </span>
          <h1 className="text-2xl font-black tracking-normal text-slate-950">{title}</h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-500">{description}</p>
        {source ? <p className="mt-2 text-xs text-slate-400">資料假設：{source}</p> : null}
      </div>
      <button
        type="button"
        onClick={capture}
        disabled={capturing}
        className="focus-ring no-print inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-60"
        title="下載此工具畫面"
      >
        {capturing ? <RefreshCw className="animate-spin" size={16} /> : <Camera size={16} />}
        {capturing ? '產生中' : '存圖'}
      </button>
    </header>
  );
}

function Sparkline({ data, color = '#0284c7', secondary }) {
  const values = data.map((item) => n(item.value));
  const secondaryValues = secondary?.map((item) => n(item.value)) || [];
  const all = [...values, ...secondaryValues, 0];
  const max = Math.max(...all);
  const min = Math.min(...all);
  const span = max - min || 1;
  const points = (list) =>
    list
      .map((value, index) => {
        const x = list.length === 1 ? 0 : (index / (list.length - 1)) * 100;
        const y = 100 - ((value - min) / span) * 100;
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <div className="tool-card p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span className="mono">{money(max)}</span>
        <span className="font-bold uppercase tracking-wider">趨勢</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-44 w-full overflow-visible rounded bg-white">
        {[0, 25, 50, 75, 100].map((line) => (
          <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="#e2e8f0" strokeWidth="0.45" vectorEffect="non-scaling-stroke" />
        ))}
        {secondaryValues.length ? (
          <polyline fill="none" points={points(secondaryValues)} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        ) : null}
        <polyline fill="none" points={points(values)} stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

function AdvisoryNote({ children }) {
  return (
    <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-sky-800">
      <Info className="mt-0.5 shrink-0" size={18} />
      <p>{children}</p>
    </div>
  );
}

function ProgressBar({ value, tone = 'sky' }) {
  const colors = toneMap[tone] || toneMap.sky;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${colors.fill}`} style={{ width: `${clamp(value, 0, 100)}%` }} />
    </div>
  );
}

function HomePage({ changeTab }) {
  const [income, setIncome] = useStickyState(90000, 'home_income');
  const [expense, setExpense] = useStickyState(56000, 'home_expense');
  const [assets, setAssets] = useStickyState(1800000, 'home_assets');
  const [debt, setDebt] = useStickyState(420000, 'home_debt');
  const [invest, setInvest] = useStickyState(18000, 'home_invest');
  const [emergency, setEmergency] = useStickyState(210000, 'home_emergency');

  const monthlyIncome = n(income);
  const monthlyExpense = n(expense);
  const netWorth = n(assets) - n(debt);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
  const investRate = monthlyIncome > 0 ? (n(invest) / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpense > 0 ? n(emergency) / monthlyExpense : 0;
  const debtRatio = n(assets) > 0 ? (n(debt) / n(assets)) * 100 : 0;
  const score = clamp(
    Math.round(30 + savingsRate * 0.8 + investRate * 0.7 + Math.min(emergencyMonths, 12) * 2.5 - Math.max(0, debtRatio - 25) * 0.55),
    0,
    100,
  );

  const quickTools = [
    { id: 'health', title: '完整健檢', desc: '一次檢查現金流、預備金、負債、投資與保障。', icon: Check, tone: 'emerald' },
    { id: 'budget', title: '先看現金流', desc: '把收入拆成必需、生活、投資與安全墊。', icon: Wallet, tone: 'sky' },
    { id: 'debt', title: '消滅負債', desc: '比較雪球與雪崩還款速度。', icon: CreditCard, tone: 'rose' },
    { id: 'allocation', title: '資產配置', desc: '檢查股票、債券、現金比例是否跑偏。', icon: Scale, tone: 'indigo' },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="FinKit 理財總覽"
        icon={Compass}
        description="先用一頁掌握現金流、淨資產、緊急預備金、投資率與負債壓力，再跳到相對應的試算工具。"
        source="本頁分數是行為檢查指標，不代表投資建議或信用評分。"
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="tool-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">個人理財快照</p>
              <p className="text-xs text-slate-500">資料只存在你的瀏覽器 localStorage。</p>
            </div>
            <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-bold text-white">Score {score}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="月收入" value={income} onChange={setIncome} prefix="$" />
            <NumberField label="月支出" value={expense} onChange={setExpense} prefix="$" />
            <NumberField label="總資產" value={assets} onChange={setAssets} prefix="$" />
            <NumberField label="總負債" value={debt} onChange={setDebt} prefix="$" />
            <NumberField label="每月投資" value={invest} onChange={setInvest} prefix="$" />
            <NumberField label="緊急預備金" value={emergency} onChange={setEmergency} prefix="$" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="淨資產" value={money(netWorth)} detail="資產扣除負債後的目前位置。" icon={Wallet} tone={netWorth >= 0 ? 'emerald' : 'rose'} />
          <ResultCard title="儲蓄率" value={pct(savingsRate)} detail="建議先朝 20% 以上前進。" icon={PiggyBank} tone={savingsRate >= 20 ? 'emerald' : 'amber'} />
          <ResultCard title="投資率" value={pct(investRate)} detail="長期目標可逐步提高到 15%-30%。" icon={TrendingUp} tone="sky" />
          <ResultCard title="預備金月數" value={`${fmt(emergencyMonths, 1)} 個月`} detail="一般建議 3-6 個月，收入波動者可抓 9-12 個月。" icon={ShieldCheck} tone={emergencyMonths >= 6 ? 'emerald' : 'rose'} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickTools.map((tool) => {
          const Icon = tool.icon;
          const colors = toneMap[tool.tone];
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => changeTab(tool.id)}
              className={`focus-ring tool-card group p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft ${colors.border}`}
            >
              <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} ${colors.icon}`}>
                <Icon size={20} />
              </span>
              <span className="block text-base font-bold text-slate-900">{tool.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-slate-500">{tool.desc}</span>
            </button>
          );
        })}
      </section>

      <AdvisoryNote>
        FinKit 的定位是「輔助你做出更好的理財決策」，不是保證獲利工具。每個結果都應搭配個人風險承受度、稅務狀況與正式文件再判斷。
      </AdvisoryNote>
    </div>
  );
}

function FinancialHealthAudit() {
  const [income, setIncome] = useStickyState(90000, 'health_income');
  const [expense, setExpense] = useStickyState(56000, 'health_expense');
  const [emergency, setEmergency] = useStickyState(210000, 'health_emergency');
  const [invest, setInvest] = useStickyState(18000, 'health_invest');
  const [assets, setAssets] = useStickyState(1800000, 'health_assets');
  const [debt, setDebt] = useStickyState(420000, 'health_debt');
  const [debtPay, setDebtPay] = useStickyState(12000, 'health_debt_pay');
  const [coverage, setCoverage] = useStickyState(6000000, 'health_coverage');
  const [need, setNeed] = useStickyState(8000000, 'health_need');

  const monthlyIncome = n(income);
  const monthlyExpense = n(expense);
  const savingsRate = monthlyIncome ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
  const investRate = monthlyIncome ? (n(invest) / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpense ? n(emergency) / monthlyExpense : 0;
  const dti = monthlyIncome ? (n(debtPay) / monthlyIncome) * 100 : 0;
  const debtAssetRatio = n(assets) ? (n(debt) / n(assets)) * 100 : 0;
  const coverageRatio = n(need) ? (n(coverage) / n(need)) * 100 : 100;

  const checks = [
    {
      name: '現金流',
      value: pct(savingsRate),
      target: '儲蓄率至少 10%，成熟目標 20%+',
      score: savingsRate >= 20 ? 100 : savingsRate >= 10 ? 75 : savingsRate > 0 ? 45 : 10,
      action: savingsRate < 10 ? '先把固定支出與訂閱項目降到可控範圍。' : '維持正現金流，優先分配到投資與預備金。',
    },
    {
      name: '緊急預備金',
      value: `${fmt(emergencyMonths, 1)} 個月`,
      target: '一般 3-6 個月，收入波動者 9-12 個月',
      score: emergencyMonths >= 6 ? 100 : emergencyMonths >= 3 ? 75 : emergencyMonths >= 1 ? 40 : 10,
      action: emergencyMonths < 3 ? '先補到 3 個月支出，再提高投資部位。' : '預備金足夠後，避免現金比例過高拖累長期報酬。',
    },
    {
      name: '負債壓力',
      value: `${pct(dti)} / 資產比 ${pct(debtAssetRatio)}`,
      target: '月付債務收入比低於 35%',
      score: dti <= 20 ? 100 : dti <= 35 ? 75 : dti <= 50 ? 35 : 10,
      action: dti > 35 ? '高利負債先用雪崩法處理，避免投資報酬被利息抵銷。' : '負債壓力可控，仍需追蹤利率與提前清償效益。',
    },
    {
      name: '投資習慣',
      value: pct(investRate),
      target: '長期投資率至少 10%-15%',
      score: investRate >= 15 ? 100 : investRate >= 10 ? 75 : investRate >= 5 ? 45 : 15,
      action: investRate < 10 ? '建立固定投入規則，先從收入 5%-10% 自動化。' : '投資率足夠，下一步檢查費用與資產配置。',
    },
    {
      name: '保障缺口',
      value: `${pct(coverageRatio)} 已覆蓋`,
      target: '家庭責任期間至少覆蓋主要缺口',
      score: coverageRatio >= 100 ? 100 : coverageRatio >= 70 ? 70 : coverageRatio >= 40 ? 40 : 10,
      action: coverageRatio < 70 ? '先補足低成本保障，再處理高風險投資或槓桿。' : '保障接近需求，定期依家庭責任更新。',
    },
  ];

  const totalScore = Math.round(checks.reduce((sum, item) => sum + item.score, 0) / checks.length);
  const priority = [...checks].sort((a, b) => a.score - b.score).slice(0, 3);
  const scoreTone = totalScore >= 80 ? 'emerald' : totalScore >= 60 ? 'amber' : 'rose';

  return (
    <div className="space-y-6">
      <SectionHeader
        title="理財健檢報告"
        icon={Check}
        description="把成熟理財網站常見的現金流、預備金、負債、投資與保障檢查整合成一份可執行報告。"
        source="此分數是行為與風險檢查，不是投資建議或信用評分。"
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="月收入" value={income} onChange={setIncome} prefix="$" />
          <NumberField label="月支出" value={expense} onChange={setExpense} prefix="$" />
          <NumberField label="緊急預備金" value={emergency} onChange={setEmergency} prefix="$" />
          <NumberField label="每月投資" value={invest} onChange={setInvest} prefix="$" />
          <NumberField label="總資產" value={assets} onChange={setAssets} prefix="$" />
          <NumberField label="總負債" value={debt} onChange={setDebt} prefix="$" />
          <NumberField label="每月債務支出" value={debtPay} onChange={setDebtPay} prefix="$" />
          <NumberField label="保障需求" value={need} onChange={setNeed} prefix="$" />
          <NumberField label="現有保障" value={coverage} onChange={setCoverage} prefix="$" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="健檢分數" value={`${totalScore}/100`} icon={Check} tone={scoreTone} detail="低於 60 代表應先處理基礎風險。" />
          <ResultCard title="儲蓄率" value={pct(savingsRate)} icon={PiggyBank} tone={savingsRate >= 20 ? 'emerald' : 'amber'} />
          <ResultCard title="預備金" value={`${fmt(emergencyMonths, 1)} 個月`} icon={ShieldCheck} tone={emergencyMonths >= 6 ? 'emerald' : 'rose'} />
          <ResultCard title="債務收入比" value={pct(dti)} icon={CreditCard} tone={dti <= 35 ? 'emerald' : 'rose'} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="tool-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">項目</th>
                  <th className="px-4 py-3">目前</th>
                  <th className="px-4 py-3">目標</th>
                  <th className="px-4 py-3">分數</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {checks.map((item) => (
                  <tr key={item.name}>
                    <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                    <td className="mono px-4 py-3 text-slate-700">{item.value}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-slate-500">{item.target}</td>
                    <td className="px-4 py-3">
                      <div className="w-28">
                        <ProgressBar value={item.score} tone={item.score >= 75 ? 'emerald' : item.score >= 45 ? 'amber' : 'rose'} />
                        <p className="mt-1 mono text-xs text-slate-500">{item.score}/100</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="tool-card p-5">
          <h3 className="mb-4 text-base font-black text-slate-900">優先改善順序</h3>
          <div className="space-y-3">
            {priority.map((item, index) => (
              <div key={item.name} className="border-l-4 border-slate-200 py-2 pl-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">Priority {index + 1}</p>
                <p className="mt-1 font-black text-slate-900">{item.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetPlanner() {
  const [income, setIncome] = useStickyState(90000, 'budget_income');
  const [fixed, setFixed] = useStickyState(32000, 'budget_fixed');
  const [living, setLiving] = useStickyState(18000, 'budget_living');
  const [insurance, setInsurance] = useStickyState(6000, 'budget_insurance');
  const [invest, setInvest] = useStickyState(18000, 'budget_invest');
  const [buffer, setBuffer] = useStickyState(6000, 'budget_buffer');
  const total = n(fixed) + n(living) + n(insurance) + n(invest) + n(buffer);
  const left = n(income) - total;
  const rows = [
    ['固定支出', n(fixed), 50, 'sky'],
    ['生活彈性', n(living), 30, 'amber'],
    ['保險保障', n(insurance), 10, 'indigo'],
    ['投資儲蓄', n(invest), 20, 'emerald'],
    ['安全緩衝', n(buffer), 10, 'rose'],
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="預算與現金流" icon={Wallet} description="把每月收入拆成清楚的桶子，立刻看出剩餘現金與配置比例。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
          <NumberField label="月收入" value={income} onChange={setIncome} prefix="$" />
          <NumberField label="固定支出" value={fixed} onChange={setFixed} prefix="$" />
          <NumberField label="生活彈性支出" value={living} onChange={setLiving} prefix="$" />
          <NumberField label="保險保障" value={insurance} onChange={setInsurance} prefix="$" />
          <NumberField label="投資儲蓄" value={invest} onChange={setInvest} prefix="$" />
          <NumberField label="安全緩衝" value={buffer} onChange={setBuffer} prefix="$" />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="剩餘現金" value={money(left)} detail={left >= 0 ? '可投入目標、預備金或加速還款。' : '支出已超過收入，先調整固定支出或生活彈性項。'} icon={Coins} tone={left >= 0 ? 'emerald' : 'rose'} />
            <ResultCard title="支出占比" value={pct((total / Math.max(n(income), 1)) * 100)} detail="支出加投資與緩衝合計占收入比例。" icon={PieChart} tone="sky" />
          </div>
          <div className="tool-card p-5">
            <p className="mb-4 text-sm font-bold text-slate-900">配置結構</p>
            <div className="space-y-4">
              {rows.map(([label, value, benchmark, tone]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{label}</span>
                    <span className="mono text-slate-500">{money(value)} / {pct((value / Math.max(n(income), 1)) * 100)}</span>
                  </div>
                  <ProgressBar value={(value / Math.max(n(income), 1)) * 100} tone={tone} />
                  <p className="mt-1 text-xs text-slate-400">參考上限約 {benchmark}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyFund() {
  const [expense, setExpense] = useStickyState(56000, 'emergency_expense');
  const [current, setCurrent] = useStickyState(210000, 'emergency_current');
  const [targetMonths, setTargetMonths] = useStickyState(6, 'emergency_months');
  const [monthlySave, setMonthlySave] = useStickyState(10000, 'emergency_save');
  const target = n(expense) * n(targetMonths);
  const gap = Math.max(0, target - n(current));
  const months = n(monthlySave) > 0 ? Math.ceil(gap / n(monthlySave)) : Infinity;

  return (
    <div className="space-y-6">
      <SectionHeader title="緊急預備金" icon={ShieldCheck} description="用月支出倒推安全墊，避免投資計畫被突發事件打斷。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="每月必要支出" value={expense} onChange={setExpense} prefix="$" />
          <NumberField label="目前預備金" value={current} onChange={setCurrent} prefix="$" />
          <NumberField label="目標月數" value={targetMonths} onChange={setTargetMonths} suffix="月" />
          <NumberField label="每月補強" value={monthlySave} onChange={setMonthlySave} prefix="$" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="目標金額" value={money(target)} detail={`${targetMonths} 個月必要支出的安全墊。`} icon={Target} tone="sky" />
          <ResultCard title="目前進度" value={pct((n(current) / Math.max(target, 1)) * 100)} detail={gap === 0 ? '已達標，可以轉向投資或保險檢查。' : `尚差 ${money(gap)}。`} icon={PiggyBank} tone={gap === 0 ? 'emerald' : 'amber'} />
          <ResultCard title="補足時間" value={Number.isFinite(months) ? `${months} 個月` : '無法估算'} detail="以目前每月補強金額估算。" icon={RefreshCw} tone="indigo" />
          <ResultCard title="現有月數" value={`${fmt(n(current) / Math.max(n(expense), 1), 1)} 個月`} detail="低於 3 個月時，建議優先補強流動性。" icon={ShieldCheck} tone={n(current) >= target ? 'emerald' : 'rose'} />
        </div>
      </div>
    </div>
  );
}

function DebtPayoff() {
  const [balance, setBalance] = useStickyState(360000, 'debt_balance');
  const [rate, setRate] = useStickyState(12, 'debt_rate');
  const [payment, setPayment] = useStickyState(18000, 'debt_payment');
  const [extra, setExtra] = useStickyState(5000, 'debt_extra');
  const totalPayment = n(payment) + n(extra);
  const monthlyRate = n(rate) / 100 / 12;
  let months = 0;
  let remaining = n(balance);
  let interest = 0;
  const trend = [{ value: remaining }];

  while (remaining > 0 && months < 600) {
    const charged = remaining * monthlyRate;
    interest += charged;
    remaining = Math.max(0, remaining + charged - totalPayment);
    months += 1;
    if (months % 3 === 0 || remaining === 0) trend.push({ value: remaining });
    if (totalPayment <= charged) {
      months = Infinity;
      break;
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="負債清償計畫" icon={CreditCard} description="用總負債、利率與月還款估算還清時間，評估加速還款的效果。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
          <NumberField label="目前負債" value={balance} onChange={setBalance} prefix="$" />
          <NumberField label="年利率" value={rate} onChange={setRate} suffix="%" step="0.01" />
          <NumberField label="原本月還款" value={payment} onChange={setPayment} prefix="$" />
          <NumberField label="額外月還款" value={extra} onChange={setExtra} prefix="$" />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultCard title="月還款合計" value={money(totalPayment)} icon={Coins} tone="sky" />
            <ResultCard title="還清時間" value={Number.isFinite(months) ? `${months} 個月` : '月付不足'} icon={CalendarIcon} tone={Number.isFinite(months) ? 'emerald' : 'rose'} detail={Number.isFinite(months) ? `約 ${fmt(months / 12, 1)} 年。` : '月付金低於利息，負債會愈滾愈大。'} />
            <ResultCard title="總利息" value={Number.isFinite(months) ? money(interest) : '無法估算'} icon={Percent} tone="amber" />
          </div>
          {Number.isFinite(months) ? <Sparkline data={trend} color="#e11d48" /> : <AdvisoryNote>請提高月還款或降低利率，讓月付金至少大於每月利息。</AdvisoryNote>}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props) {
  return <RefreshCw {...props} />;
}

function GoalPlanner() {
  const [goal, setGoal] = useStickyState(3000000, 'goal_goal');
  const [current, setCurrent] = useStickyState(500000, 'goal_current');
  const [years, setYears] = useStickyState(8, 'goal_years');
  const [rate, setRate] = useStickyState(5, 'goal_rate');
  const monthlyRate = n(rate) / 100 / 12;
  const periods = Math.max(1, n(years) * 12);
  const currentFuture = n(current) * Math.pow(1 + monthlyRate, periods);
  const gap = Math.max(0, n(goal) - currentFuture);
  const monthly = monthlyRate === 0 ? gap / periods : gap * monthlyRate / (Math.pow(1 + monthlyRate, periods) - 1);
  const data = Array.from({ length: Math.floor(n(years)) + 1 }, (_, year) => ({
    value: n(current) * Math.pow(1 + monthlyRate, year * 12) + monthly * ((Math.pow(1 + monthlyRate, year * 12) - 1) / (monthlyRate || 1)),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="財務目標倒推" icon={Target} description="輸入目標金額與期限，自動倒推出每月需要投入多少。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
          <NumberField label="目標金額" value={goal} onChange={setGoal} prefix="$" />
          <NumberField label="目前已準備" value={current} onChange={setCurrent} prefix="$" />
          <NumberField label="期限" value={years} onChange={setYears} suffix="年" />
          <NumberField label="預期年化報酬" value={rate} onChange={setRate} suffix="%" step="0.1" />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="每月需投入" value={money(monthly)} detail="這是達成目標所需的估算月投入。" icon={Coins} tone="emerald" />
            <ResultCard title="目前資金未來值" value={money(currentFuture)} detail={`以 ${pct(rate)} 年化報酬估算。`} icon={TrendingUp} tone="sky" />
          </div>
          <Sparkline data={data} color="#059669" />
        </div>
      </div>
    </div>
  );
}

function AllocationPlanner() {
  const [total, setTotal] = useStickyState(2500000, 'alloc_total');
  const [stock, setStock] = useStickyState(55, 'alloc_stock');
  const [bond, setBond] = useStickyState(25, 'alloc_bond');
  const [cash, setCash] = useStickyState(10, 'alloc_cash');
  const [intl, setIntl] = useStickyState(10, 'alloc_intl');
  const [curStock, setCurStock] = useStickyState(1500000, 'alloc_cur_stock');
  const [curBond, setCurBond] = useStickyState(450000, 'alloc_cur_bond');
  const [curCash, setCurCash] = useStickyState(300000, 'alloc_cur_cash');
  const [curIntl, setCurIntl] = useStickyState(250000, 'alloc_cur_intl');
  const targets = [
    ['台股/股票', n(stock), n(curStock), 'sky'],
    ['債券/穩定收益', n(bond), n(curBond), 'indigo'],
    ['現金/貨幣', n(cash), n(curCash), 'emerald'],
    ['海外/其他', n(intl), n(curIntl), 'amber'],
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="資產配置與再平衡" icon={Scale} description="把目標比例轉成金額，快速知道哪個部位需要加碼或減碼。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card space-y-5 p-5">
          <NumberField label="投資總資產" value={total} onChange={setTotal} prefix="$" />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="股票目標" value={stock} onChange={setStock} suffix="%" />
            <NumberField label="債券目標" value={bond} onChange={setBond} suffix="%" />
            <NumberField label="現金目標" value={cash} onChange={setCash} suffix="%" />
            <NumberField label="海外目標" value={intl} onChange={setIntl} suffix="%" />
            <NumberField label="目前股票" value={curStock} onChange={setCurStock} prefix="$" />
            <NumberField label="目前債券" value={curBond} onChange={setCurBond} prefix="$" />
            <NumberField label="目前現金" value={curCash} onChange={setCurCash} prefix="$" />
            <NumberField label="目前海外" value={curIntl} onChange={setCurIntl} prefix="$" />
          </div>
        </div>
        <div className="tool-card p-5">
          <p className="mb-4 text-sm font-bold text-slate-900">再平衡建議</p>
          <div className="space-y-4">
            {targets.map(([label, targetPct, currentValue, tone]) => {
              const targetValue = n(total) * targetPct / 100;
              const diff = targetValue - currentValue;
              return (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-800">{label}</span>
                    <span className={`mono text-sm font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{diff >= 0 ? '加碼' : '減碼'} {money(Math.abs(diff))}</span>
                  </div>
                  <ProgressBar value={targetPct} tone={tone} />
                  <p className="mt-2 text-xs text-slate-500">目標 {pct(targetPct)} = {money(targetValue)}，目前 {money(currentValue)}。</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskProfilePlanner() {
  const [horizon, setHorizon] = useStickyState('3', 'risk_horizon');
  const [drawdown, setDrawdown] = useStickyState('2', 'risk_drawdown');
  const [income, setIncome] = useStickyState('3', 'risk_income');
  const [knowledge, setKnowledge] = useStickyState('2', 'risk_knowledge');
  const [objective, setObjective] = useStickyState('3', 'risk_objective');
  const score = n(horizon) + n(drawdown) + n(income) + n(knowledge) + n(objective);
  const profile =
    score <= 8
      ? { name: '保守型', stock: 30, bond: 50, cash: 20, tone: 'sky', note: '重點是本金波動控制，適合短中期或承受度較低的資金。' }
      : score <= 13
        ? { name: '穩健型', stock: 55, bond: 30, cash: 15, tone: 'emerald', note: '兼顧成長與波動控制，適合多數中長期目標。' }
        : score <= 18
          ? { name: '成長型', stock: 75, bond: 15, cash: 10, tone: 'amber', note: '追求長期成長，但需要能承受較大年度波動。' }
          : { name: '積極型', stock: 90, bond: 5, cash: 5, tone: 'rose', note: '適合期限長且能承受大幅回撤的資金，不適合短期必要支出。' };
  const rows = [
    ['股票/ETF/成長資產', profile.stock, 'sky'],
    ['債券/收益資產', profile.bond, 'indigo'],
    ['現金/貨幣型資產', profile.cash, 'emerald'],
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="風險屬性與配置建議"
        icon={Scale}
        description="用投資期限、最大回撤承受度、收入穩定度與經驗，建立比直覺更一致的資產配置起點。"
        source="風險屬性會隨年齡、收入、目標與市場經驗改變，需定期重測。"
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <SelectField
            label="投資期限"
            value={horizon}
            onChange={setHorizon}
            options={[
              { value: '1', label: '3 年內' },
              { value: '2', label: '3-5 年' },
              { value: '3', label: '5-10 年' },
              { value: '4', label: '10 年以上' },
            ]}
          />
          <SelectField
            label="最大回撤承受"
            value={drawdown}
            onChange={setDrawdown}
            options={[
              { value: '1', label: '虧損 5% 就會停損' },
              { value: '2', label: '可承受 10%-15%' },
              { value: '3', label: '可承受 20%-30%' },
              { value: '4', label: '可承受 30% 以上' },
            ]}
          />
          <SelectField
            label="收入穩定度"
            value={income}
            onChange={setIncome}
            options={[
              { value: '1', label: '不穩定或接案型' },
              { value: '2', label: '一般穩定' },
              { value: '3', label: '穩定且有預備金' },
              { value: '4', label: '多收入來源' },
            ]}
          />
          <SelectField
            label="投資經驗"
            value={knowledge}
            onChange={setKnowledge}
            options={[
              { value: '1', label: '剛開始' },
              { value: '2', label: '了解基本 ETF/基金' },
              { value: '3', label: '熟悉配置與再平衡' },
              { value: '4', label: '能管理波動與槓桿風險' },
            ]}
          />
          <SelectField
            label="資金目標"
            value={objective}
            onChange={setObjective}
            options={[
              { value: '1', label: '短期支出或購屋頭期' },
              { value: '2', label: '保值與穩定現金流' },
              { value: '3', label: '退休或長期增值' },
              { value: '4', label: '積極累積資產' },
            ]}
          />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="風險分數" value={`${score}/20`} icon={Scale} tone={profile.tone} detail={profile.note} />
            <ResultCard title="屬性判斷" value={profile.name} icon={Target} tone={profile.tone} detail="可作為配置起點，不是固定答案。" />
          </div>
          <div className="tool-card p-5">
            <p className="mb-4 text-sm font-bold text-slate-900">建議配置起點</p>
            <div className="space-y-4">
              {rows.map(([label, value, tone]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-800">{label}</span>
                    <span className="mono text-sm font-bold text-slate-600">{pct(value)}</span>
                  </div>
                  <ProgressBar value={value} tone={tone} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AdvisoryNote>
        配置比例的重點是讓投資行為可以長期執行。若一遇到下跌就賣出，理論上較高的預期報酬不會轉化成實際成果。
      </AdvisoryNote>
    </div>
  );
}

function NetWorthTracker() {
  const [cash, setCash] = useStickyState(300000, 'nw_cash');
  const [stocks, setStocks] = useStickyState(1200000, 'nw_stocks');
  const [property, setProperty] = useStickyState(12000000, 'nw_property');
  const [retirement, setRetirement] = useStickyState(600000, 'nw_retirement');
  const [mortgage, setMortgage] = useStickyState(7800000, 'nw_mortgage');
  const [consumer, setConsumer] = useStickyState(180000, 'nw_consumer');
  const assetTotal = n(cash) + n(stocks) + n(property) + n(retirement);
  const debtTotal = n(mortgage) + n(consumer);
  const net = assetTotal - debtTotal;

  return (
    <div className="space-y-6">
      <SectionHeader title="淨資產盤點" icon={Landmark} description="把資產與負債放在同一張表，知道自己真正的財務位置。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="現金/存款" value={cash} onChange={setCash} prefix="$" />
          <NumberField label="股票/基金" value={stocks} onChange={setStocks} prefix="$" />
          <NumberField label="房產估值" value={property} onChange={setProperty} prefix="$" />
          <NumberField label="退休金/保單價值" value={retirement} onChange={setRetirement} prefix="$" />
          <NumberField label="房貸餘額" value={mortgage} onChange={setMortgage} prefix="$" />
          <NumberField label="信貸/卡債" value={consumer} onChange={setConsumer} prefix="$" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ResultCard title="總資產" value={money(assetTotal)} icon={Wallet} tone="sky" />
          <ResultCard title="總負債" value={money(debtTotal)} icon={CreditCard} tone="rose" />
          <ResultCard title="淨資產" value={money(net)} icon={Landmark} tone={net >= 0 ? 'emerald' : 'rose'} />
          <div className="tool-card p-5 sm:col-span-3">
            <p className="mb-4 text-sm font-bold text-slate-900">結構檢查</p>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>負債占資產</span><span className="mono">{pct((debtTotal / Math.max(assetTotal, 1)) * 100)}</span></div>
                <ProgressBar value={(debtTotal / Math.max(assetTotal, 1)) * 100} tone="rose" />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm"><span>流動資產占比</span><span className="mono">{pct(((n(cash) + n(stocks)) / Math.max(assetTotal, 1)) * 100)}</span></div>
                <ProgressBar value={((n(cash) + n(stocks)) / Math.max(assetTotal, 1)) * 100} tone="emerald" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompoundCalculator() {
  const [principal, setPrincipal] = useStickyState(100000, 'cmp_principal');
  const [rate, setRate] = useStickyState(6, 'cmp_rate');
  const [years, setYears] = useStickyState(20, 'cmp_years');
  const [compareRate, setCompareRate] = useStickyState(1.7, 'cmp_compare');
  const calc = (r) => Array.from({ length: n(years) + 1 }, (_, year) => ({ value: n(principal) * Math.pow(1 + n(r) / 100, year) }));
  const data = calc(rate);
  const compare = calc(compareRate);
  const final = data[data.length - 1]?.value || 0;
  const compareFinal = compare[compare.length - 1]?.value || 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="單筆複利 PK" icon={TrendingUp} description="比較投資報酬率與保守利率之間的長期差距。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
          <NumberField label="本金投入" value={principal} onChange={setPrincipal} prefix="$" />
          <NumberField label="投資年化報酬率" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <NumberField label="比較利率" value={compareRate} onChange={setCompareRate} suffix="%" step="0.1" />
          <NumberField label="投資年限" value={years} onChange={setYears} suffix="年" />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title={`${years} 年後資產`} value={money(final)} icon={TrendingUp} tone="emerald" />
            <ResultCard title="差距" value={money(final - compareFinal)} detail={`比較組約 ${money(compareFinal)}。`} icon={BarChart3} tone="sky" />
          </div>
          <Sparkline data={data} secondary={compare} color="#059669" />
        </div>
      </div>
    </div>
  );
}

function DcaCalculator() {
  const [monthly, setMonthly] = useStickyState(10000, 'dca_monthly');
  const [rate, setRate] = useStickyState(6, 'dca_rate');
  const [years, setYears] = useStickyState(20, 'dca_years');
  const monthlyRate = n(rate) / 100 / 12;
  const months = n(years) * 12;
  const final = monthlyRate === 0 ? n(monthly) * months : n(monthly) * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const cost = n(monthly) * months;
  const data = Array.from({ length: n(years) + 1 }, (_, year) => {
    const period = year * 12;
    return { value: monthlyRate === 0 ? n(monthly) * period : n(monthly) * ((Math.pow(1 + monthlyRate, period) - 1) / monthlyRate) };
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="定期定額試算" icon={RefreshCw} description="用固定月投入估算長期資產累積與投資收益。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
          <NumberField label="每月投入" value={monthly} onChange={setMonthly} prefix="$" />
          <NumberField label="預期年化報酬" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <NumberField label="投資期間" value={years} onChange={setYears} suffix="年" />
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard title="期末資產" value={money(final)} icon={TrendingUp} tone="emerald" />
            <ResultCard title="投資收益" value={money(final - cost)} detail={`總投入 ${money(cost)}。`} icon={Coins} tone="amber" />
          </div>
          <Sparkline data={data} color="#0284c7" />
        </div>
      </div>
    </div>
  );
}

function StockCalculator() {
  const [buyPrice, setBuyPrice] = useStickyState(100, 'stock_buy');
  const [sellPrice, setSellPrice] = useStickyState(110, 'stock_sell');
  const [shares, setShares] = useStickyState(1000, 'stock_shares');
  const [discount, setDiscount] = useStickyState(60, 'stock_discount');
  const [type, setType] = useStickyState('stock', 'stock_type');
  const taxRates = { stock: 0.003, day: 0.0015, etf: 0.001, bond: 0 };
  const feeRate = 0.001425;
  const buyValue = n(buyPrice) * n(shares);
  const sellValue = n(sellPrice) * n(shares);
  const buyFee = Math.floor(Math.max(20, buyValue * feeRate * (n(discount) / 100)));
  const sellFee = Math.floor(Math.max(20, sellValue * feeRate * (n(discount) / 100)));
  const tax = Math.floor(sellValue * (taxRates[type] ?? taxRates.stock));
  const profit = sellValue - sellFee - tax - buyValue - buyFee;

  return (
    <div className="space-y-6">
      <SectionHeader title="台股交易獲利" icon={BarChart3} description="支援個股、當沖、ETF 與債券 ETF 常見交易稅率試算。" source="手續費率以 0.1425% 為預設，最低手續費以 20 元估算。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['stock', '個股 0.3%'],
              ['day', '當沖 0.15%'],
              ['etf', 'ETF 0.1%'],
              ['bond', '債券 ETF 0%'],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setType(id)} className={`focus-ring rounded-lg border px-3 py-2 text-xs font-bold ${type === id ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="買進價格" value={buyPrice} onChange={setBuyPrice} prefix="$" />
            <NumberField label="賣出價格" value={sellPrice} onChange={setSellPrice} prefix="$" />
            <NumberField label="股數" value={shares} onChange={setShares} suffix="股" />
            <NumberField label="手續費折數" value={discount} onChange={setDiscount} suffix="%" note="輸入 28 代表 2.8 折。" />
          </div>
        </div>
        <div className="space-y-4">
          <ResultCard title="預估淨損益" value={money(profit)} icon={Coins} tone={profit >= 0 ? 'emerald' : 'rose'} />
          <div className="tool-card p-5">
            <p className="mb-4 text-sm font-bold text-slate-900">交易明細</p>
            {[
              ['買進價金', buyValue],
              ['買進手續費', buyFee],
              ['賣出價金', sellValue],
              ['賣出手續費', sellFee],
              ['證交稅', tax],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-2 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="mono font-semibold text-slate-800">{money(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DividendCalculator() {
  const [shares, setShares] = useStickyState(10000, 'div_shares');
  const [dividend, setDividend] = useStickyState(1.5, 'div_dividend');
  const [freq, setFreq] = useStickyState(4, 'div_freq');
  const total = n(shares) * n(dividend);
  const single = total / Math.max(n(freq), 1);
  const healthFee = single >= 20000 ? Math.floor(total * 0.0211) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="存股配息與補充保費" icon={Coins} description="估算全年股息、單次配息與二代健保補充保費影響。" source="補充保費以 2.11% 且單次給付達 2 萬元門檻估算。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card space-y-4 p-5">
          <NumberField label="持有股數" value={shares} onChange={setShares} suffix="股" />
          <NumberField label="預估每股年配息" value={dividend} onChange={setDividend} prefix="$" step="0.01" />
          <div className="grid grid-cols-4 gap-2">
            {[
              [1, '年配'],
              [2, '半年'],
              [4, '季配'],
              [12, '月配'],
            ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFreq(value)} className={`focus-ring rounded-lg border px-2 py-2 text-sm font-bold ${n(freq) === value ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="全年股息" value={money(total)} icon={Coins} tone="emerald" />
          <ResultCard title="單次配息" value={money(single)} icon={RefreshCw} tone="sky" />
          <ResultCard title="補充保費" value={money(healthFee)} detail={healthFee > 0 ? '單次配息達補充保費門檻。' : '未達單次 2 萬元門檻。'} icon={ShieldCheck} tone={healthFee > 0 ? 'rose' : 'emerald'} />
          <ResultCard title="預估實領" value={money(total - healthFee)} icon={Wallet} tone="amber" />
        </div>
      </div>
    </div>
  );
}

function UnitCalculator() {
  const [principal, setPrincipal] = useStickyState(1000000, 'unit_principal');
  const [price, setPrice] = useStickyState(10, 'unit_price');
  const [distribution, setDistribution] = useStickyState(0.045, 'unit_distribution');
  const units = n(price) > 0 ? n(principal) / n(price) : 0;
  const income = units * n(distribution);

  return (
    <div className="space-y-6">
      <SectionHeader title="單位數與配息" icon={Layers} description="適用基金、ETF 或保單帳戶型商品的單位數與配息估算。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="投入本金" value={principal} onChange={setPrincipal} prefix="$" />
          <NumberField label="每單位價格" value={price} onChange={setPrice} prefix="$" step="0.001" />
          <NumberField label="每單位配息" value={distribution} onChange={setDistribution} prefix="$" step="0.001" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="可購買單位" value={`${fmt(units, 2)} 單位`} icon={Layers} tone="sky" />
          <ResultCard title="單次配息" value={money(income)} icon={Coins} tone="emerald" />
        </div>
      </div>
    </div>
  );
}

function ForexCalculator() {
  const [amount, setAmount] = useStickyState(1000, 'fx_amount');
  const [from, setFrom] = useStickyState('USD', 'fx_from');
  const [to, setTo] = useStickyState('TWD', 'fx_to');
  const [manual, setManual] = useStickyState('', 'fx_manual');
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const currencies = ['TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'GBP', 'AUD', 'CAD', 'SGD', 'CHF', 'KRW', 'THB', 'VND'];

  useEffect(() => {
    setLoading(true);
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then((res) => res.json())
      .then((data) => setRates(data?.rates || {}))
      .catch(() => setRates({}))
      .finally(() => setLoading(false));
  }, []);

  const getRate = (currency) => (currency === 'USD' ? 1 : n(rates[currency]));
  const liveRate = getRate(from) ? getRate(to) / getRate(from) : 0;
  const finalRate = manual === '' ? liveRate : n(manual);

  return (
    <div className="space-y-6">
      <SectionHeader title="匯率換算" icon={Globe} description="抓取公開匯率 API，並保留手動成交匯率欄位方便與銀行牌告比對。" source="匯率來自 exchangerate-api.com 免費端點，僅供參考。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card space-y-4 p-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <label>
              <span className="mb-2 block text-xs font-bold text-slate-500">持有</span>
              <select value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold">
                {currencies.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </label>
            <button type="button" className="focus-ring mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500" onClick={() => { setFrom(to); setTo(from); setManual(''); }}>
              <ArrowRightLeft size={18} />
            </button>
            <label>
              <span className="mb-2 block text-xs font-bold text-slate-500">兌換</span>
              <select value={to} onChange={(event) => setTo(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold">
                {currencies.map((currency) => <option key={currency}>{currency}</option>)}
              </select>
            </label>
          </div>
          <NumberField label="金額" value={amount} onChange={setAmount} prefix="$" />
          <NumberField label="成交匯率" value={manual === '' ? (liveRate ? liveRate.toFixed(4) : '') : manual} onChange={setManual} step="0.0001" note={loading ? '即時匯率載入中...' : `即時參考：1 ${from} ≈ ${fmt(liveRate, 4)} ${to}`} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title={`約合 ${to}`} value={money(n(amount) * finalRate, 2)} icon={Globe} tone="sky" />
          <ResultCard title="使用匯率" value={fmt(finalRate, 4)} icon={Percent} tone={manual === '' ? 'emerald' : 'amber'} detail={manual === '' ? '目前使用即時參考匯率。' : '目前使用手動成交匯率。'} />
        </div>
      </div>
    </div>
  );
}

function TaxCalculator() {
  const [mode, setMode] = useStickyState('income', 'tax_mode');
  const [value, setValue] = useStickyState(1500000, 'tax_value');
  const brackets = [
    { limit: 610000, rate: 0.05, correction: 0, maxTax: 30500 },
    { limit: 1330000, rate: 0.12, correction: 42700, maxTax: 116900 },
    { limit: 2660000, rate: 0.2, correction: 149100, maxTax: 382900 },
    { limit: 4980000, rate: 0.3, correction: 415100, maxTax: 1078900 },
    { limit: Infinity, rate: 0.4, correction: 913100, maxTax: Infinity },
  ];
  const exemption = 7500000;
  const income = mode === 'income' ? n(value) : (() => {
    const bracket = brackets.find((item) => n(value) <= item.maxTax) || brackets[brackets.length - 1];
    return Math.floor((n(value) + bracket.correction) / bracket.rate);
  })();
  const bracket = brackets.find((item) => income <= item.limit) || brackets[brackets.length - 1];
  const tax = mode === 'income' ? Math.max(0, Math.floor(income * bracket.rate - bracket.correction)) : n(value);
  const overseasQuota = Math.max(0, Math.floor(tax / 0.2 + exemption - income));

  return (
    <div className="space-y-6">
      <SectionHeader title="海外所得與最低稅負" icon={Calculator} description="用所得淨額或一般所得稅額反推海外所得配置額度。" source="以 2025 年常用級距與基本所得額免稅額 750 萬元估算，實際申報請以財政部公告為準。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode('income')} className={`focus-ring rounded-lg border px-3 py-2 text-sm font-bold ${mode === 'income' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>輸入所得</button>
            <button type="button" onClick={() => setMode('tax')} className={`focus-ring rounded-lg border px-3 py-2 text-sm font-bold ${mode === 'tax' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>輸入稅額</button>
          </div>
          <NumberField label={mode === 'income' ? '國內綜合所得淨額' : '今年一般所得稅額'} value={value} onChange={setValue} prefix="$" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="一般所得稅" value={money(tax)} icon={FileText} tone="sky" />
          <ResultCard title="反推所得淨額" value={money(income)} icon={Calculator} tone="indigo" />
          <ResultCard title="海外所得參考額度" value={money(overseasQuota)} icon={Globe} tone="emerald" detail="低於此額度通常較不易觸發最低稅負補稅，但仍需完整申報。" />
          <ResultCard title="基本所得免稅額" value={money(exemption)} icon={ShieldCheck} tone="amber" />
        </div>
      </div>
    </div>
  );
}

function monthlyPayment(principal, annualRate, years) {
  const r = n(annualRate) / 100 / 12;
  const months = n(years) * 12;
  if (!r) return n(principal) / Math.max(months, 1);
  return n(principal) * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

function LoanCalculator() {
  const [amount, setAmount] = useStickyState(10000000, 'loan_amount');
  const [rate, setRate] = useStickyState(2.1, 'loan_rate');
  const [years, setYears] = useStickyState(30, 'loan_years');
  const [grace, setGrace] = useStickyState(0, 'loan_grace');
  const interestOnly = n(amount) * n(rate) / 100 / 12;
  const normal = monthlyPayment(amount, rate, Math.max(n(years) - n(grace), 1));

  return (
    <div className="space-y-6">
      <SectionHeader title="房貸與寬限期" icon={Home} description="估算寬限期只繳息與寬限後本息攤還的月付金差異。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="貸款總金額" value={amount} onChange={setAmount} prefix="$" />
          <NumberField label="年利率" value={rate} onChange={setRate} suffix="%" step="0.01" />
          <NumberField label="總年限" value={years} onChange={setYears} suffix="年" />
          <NumberField label="寬限期" value={grace} onChange={setGrace} suffix="年" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="寬限期月付" value={money(interestOnly)} detail="只繳利息，不還本金。" icon={Percent} tone="amber" />
          <ResultCard title="寬限後月付" value={money(normal)} detail="以剩餘期間本息平均攤還估算。" icon={Home} tone="sky" />
          <ResultCard title="月付跳升" value={money(normal - interestOnly)} icon={TrendingUp} tone="rose" />
          <ResultCard title="總貸款月數" value={`${fmt(n(years) * 12)} 期`} icon={RefreshCw} tone="indigo" />
        </div>
      </div>
    </div>
  );
}

function IrrCalculator() {
  const [principal, setPrincipal] = useStickyState(1000000, 'irr_principal');
  const [final, setFinal] = useStickyState(1200000, 'irr_final');
  const [years, setYears] = useStickyState(6, 'irr_years');
  const irr = n(principal) > 0 && n(years) > 0 ? (Math.pow(n(final) / n(principal), 1 / n(years)) - 1) * 100 : 0;
  return (
    <div className="space-y-6">
      <SectionHeader title="IRR 躉繳試算" icon={Percent} description="把投入、領回與年期轉成等效年化報酬率。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="投入金額" value={principal} onChange={setPrincipal} prefix="$" />
          <NumberField label="領回金額" value={final} onChange={setFinal} prefix="$" />
          <NumberField label="持有年數" value={years} onChange={setYears} suffix="年" />
        </div>
        <ResultCard title="等效年化 IRR" value={pct(irr, 2)} icon={Percent} tone={irr >= 0 ? 'emerald' : 'rose'} detail={`總報酬約 ${pct(((n(final) - n(principal)) / Math.max(n(principal), 1)) * 100, 1)}。`} />
      </div>
    </div>
  );
}

function futureValueWithExpense(initial, monthly, grossReturn, expenseRatio, years) {
  const months = Math.max(0, Math.round(n(years) * 12));
  const monthlyReturn = (n(grossReturn) - n(expenseRatio)) / 100 / 12;
  if (months === 0) return n(initial);
  if (Math.abs(monthlyReturn) < 0.000001) return n(initial) + n(monthly) * months;
  const growth = Math.pow(1 + monthlyReturn, months);
  return n(initial) * growth + n(monthly) * ((growth - 1) / monthlyReturn);
}

function FeeDragCalculator() {
  const [initial, setInitial] = useStickyState(1000000, 'fee_initial');
  const [monthly, setMonthly] = useStickyState(20000, 'fee_monthly');
  const [returnRate, setReturnRate] = useStickyState(6, 'fee_return');
  const [lowFee, setLowFee] = useStickyState(0.15, 'fee_low');
  const [highFee, setHighFee] = useStickyState(1.5, 'fee_high');
  const [years, setYears] = useStickyState(20, 'fee_years');
  const lowValue = futureValueWithExpense(initial, monthly, returnRate, lowFee, years);
  const highValue = futureValueWithExpense(initial, monthly, returnRate, highFee, years);
  const noFeeValue = futureValueWithExpense(initial, monthly, returnRate, 0, years);
  const drag = lowValue - highValue;
  const highFeeCost = noFeeValue - highValue;
  const lowFeeCost = noFeeValue - lowValue;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="投資費用拖累"
        icon={Scale}
        description="比較同樣報酬假設下，不同內扣費用率對長期資產的影響。"
        source="費用率會逐年侵蝕複利成果，實際成本仍需查閱基金或保單公開說明。"
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="初始投入" value={initial} onChange={setInitial} prefix="$" />
          <NumberField label="每月投入" value={monthly} onChange={setMonthly} prefix="$" />
          <NumberField label="年化報酬假設" value={returnRate} onChange={setReturnRate} suffix="%" step="0.1" />
          <NumberField label="低費用率" value={lowFee} onChange={setLowFee} suffix="%" step="0.01" />
          <NumberField label="高費用率" value={highFee} onChange={setHighFee} suffix="%" step="0.01" />
          <NumberField label="投資年限" value={years} onChange={setYears} suffix="年" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="低費用期末值" value={money(lowValue)} icon={TrendingUp} tone="emerald" detail={`費用成本約 ${money(lowFeeCost)}。`} />
          <ResultCard title="高費用期末值" value={money(highValue)} icon={TrendingDown} tone="rose" detail={`費用成本約 ${money(highFeeCost)}。`} />
          <ResultCard title="費用差距" value={money(drag)} icon={Scale} tone="amber" detail="同樣市場報酬下，被費用吃掉的差額。" />
          <ResultCard title="差距占投入" value={pct(drag / Math.max(n(initial) + n(monthly) * n(years) * 12, 1) * 100, 2)} icon={Percent} tone="indigo" />
        </div>
      </div>
      <div className="tool-card p-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-bold text-slate-700">高費用商品保留的資產比例</span>
          <span className="mono">{pct((highValue / Math.max(lowValue, 1)) * 100, 1)}</span>
        </div>
        <ProgressBar value={(highValue / Math.max(lowValue, 1)) * 100} tone="rose" />
      </div>
    </div>
  );
}

function RentVsBuy() {
  const [homePrice, setHomePrice] = useStickyState(15000000, 'rvb_home');
  const [rent, setRent] = useStickyState(30000, 'rvb_rent');
  const [returnRate, setReturnRate] = useStickyState(5, 'rvb_return');
  const [years, setYears] = useStickyState(20, 'rvb_years');
  const [homeGrowth, setHomeGrowth] = useStickyState(2, 'rvb_growth');
  const downPayment = n(homePrice) * 0.2;
  const loan = n(homePrice) * 0.8;
  const mortgagePay = monthlyPayment(loan, 2.1, 30);
  const buyEquity = n(homePrice) * Math.pow(1 + n(homeGrowth) / 100, n(years)) - Math.max(0, loan - (mortgagePay * 12 * n(years) * 0.55));
  const rentInvest = downPayment * Math.pow(1 + n(returnRate) / 100, n(years)) + Math.max(0, mortgagePay - n(rent)) * 12 * n(years);

  return (
    <div className="space-y-6">
      <SectionHeader title="買房 vs 租房" icon={Building} description="用簡化模型比較買房累積淨值與租房投資差異。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="房價" value={homePrice} onChange={setHomePrice} prefix="$" />
          <NumberField label="月租金" value={rent} onChange={setRent} prefix="$" />
          <NumberField label="租房投資報酬" value={returnRate} onChange={setReturnRate} suffix="%" />
          <NumberField label="房價年增率" value={homeGrowth} onChange={setHomeGrowth} suffix="%" />
          <NumberField label="比較年限" value={years} onChange={setYears} suffix="年" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="買房淨值" value={money(buyEquity)} icon={Home} tone={buyEquity >= rentInvest ? 'emerald' : 'sky'} />
          <ResultCard title="租房投資資產" value={money(rentInvest)} icon={TrendingUp} tone={rentInvest > buyEquity ? 'emerald' : 'amber'} />
          <ResultCard title="房貸月付估算" value={money(mortgagePay)} icon={Calculator} tone="indigo" />
          <ResultCard title="差距" value={money(Math.abs(buyEquity - rentInvest))} icon={Scale} tone="sky" detail={buyEquity >= rentInvest ? '模型下買房較高。' : '模型下租房投資較高。'} />
        </div>
      </div>
    </div>
  );
}

function FireCalculator() {
  const [annualExpense, setAnnualExpense] = useStickyState(720000, 'fire_expense');
  const [passive, setPassive] = useStickyState(240000, 'fire_passive');
  const [assets, setAssets] = useStickyState(2500000, 'fire_assets');
  const [withdrawal, setWithdrawal] = useStickyState(4, 'fire_withdrawal');
  const fireNumber = Math.max(0, (n(annualExpense) - n(passive)) / (n(withdrawal) / 100));
  const progress = (n(assets) / Math.max(fireNumber, 1)) * 100;
  return (
    <div className="space-y-6">
      <SectionHeader title="FIRE 退休數字" icon={Target} description="用年支出、被動收入與提領率估算財務自由目標資產。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="年支出" value={annualExpense} onChange={setAnnualExpense} prefix="$" />
          <NumberField label="年被動收入/年金" value={passive} onChange={setPassive} prefix="$" />
          <NumberField label="目前投資資產" value={assets} onChange={setAssets} prefix="$" />
          <NumberField label="安全提領率" value={withdrawal} onChange={setWithdrawal} suffix="%" step="0.1" />
        </div>
        <div className="space-y-4">
          <ResultCard title="FIRE Number" value={money(fireNumber)} icon={Target} tone="emerald" />
          <div className="tool-card p-5">
            <div className="mb-2 flex justify-between text-sm"><span className="font-bold text-slate-700">達成進度</span><span className="mono">{pct(progress)}</span></div>
            <ProgressBar value={progress} tone="emerald" />
            <p className="mt-3 text-sm text-slate-500">還差 {money(Math.max(0, fireNumber - n(assets)))}。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RetirementWithdrawalPlanner() {
  const [assets, setAssets] = useStickyState(12000000, 'retire_assets');
  const [annualSpend, setAnnualSpend] = useStickyState(720000, 'retire_spend');
  const [passive, setPassive] = useStickyState(240000, 'retire_passive');
  const [returnRate, setReturnRate] = useStickyState(4.5, 'retire_return');
  const [inflation, setInflation] = useStickyState(2, 'retire_inflation');
  const [years, setYears] = useStickyState(30, 'retire_years');
  let balance = n(assets);
  let depletedYear = null;
  const rows = [];

  for (let year = 1; year <= n(years); year += 1) {
    const spend = n(annualSpend) * Math.pow(1 + n(inflation) / 100, year - 1);
    const income = n(passive) * Math.pow(1 + n(inflation) / 100, year - 1);
    const withdrawal = Math.max(0, spend - income);
    balance = balance * (1 + n(returnRate) / 100) - withdrawal;
    if ((year <= 5 || year === n(years) || year % 5 === 0) && depletedYear === null) {
      rows.push({ year, spend, income, withdrawal, balance: Math.max(0, balance) });
    }
    if (balance <= 0 && depletedYear === null) {
      depletedYear = year;
      balance = 0;
    }
  }

  const firstWithdrawal = Math.max(0, n(annualSpend) - n(passive));
  const withdrawalRate = n(assets) ? (firstWithdrawal / n(assets)) * 100 : 0;
  const resultTone = depletedYear ? 'rose' : withdrawalRate <= 4 ? 'emerald' : 'amber';

  return (
    <div className="space-y-6">
      <SectionHeader
        title="退休提領壓力測試"
        icon={PiggyBank}
        description="估算退休後每年支出、被動收入、報酬率與通膨對資產壽命的影響。"
        source="模型未納入市場報酬順序風險、稅費與醫療長照支出，僅作壓力測試。"
      />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="退休投資資產" value={assets} onChange={setAssets} prefix="$" />
          <NumberField label="目前年支出" value={annualSpend} onChange={setAnnualSpend} prefix="$" />
          <NumberField label="年被動收入/年金" value={passive} onChange={setPassive} prefix="$" />
          <NumberField label="退休後年化報酬" value={returnRate} onChange={setReturnRate} suffix="%" step="0.1" />
          <NumberField label="通膨率" value={inflation} onChange={setInflation} suffix="%" step="0.1" />
          <NumberField label="測試年限" value={years} onChange={setYears} suffix="年" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="初始提領率" value={pct(withdrawalRate, 2)} icon={Percent} tone={resultTone} detail="第一年需由資產支付的支出比例。" />
          <ResultCard title="資產耗盡" value={depletedYear ? `第 ${depletedYear} 年` : '未耗盡'} icon={AlertTriangle} tone={depletedYear ? 'rose' : 'emerald'} />
          <ResultCard title="期末資產" value={money(balance)} icon={Wallet} tone={balance > n(assets) ? 'emerald' : 'amber'} />
          <ResultCard title="第一年提領" value={money(firstWithdrawal)} icon={Download} tone="sky" />
        </div>
      </div>
      <div className="tool-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">年</th>
                <th className="px-4 py-3">支出</th>
                <th className="px-4 py-3">被動收入</th>
                <th className="px-4 py-3">資產提領</th>
                <th className="px-4 py-3">年底資產</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={row.year}>
                  <td className="mono px-4 py-3 font-bold text-slate-800">{row.year}</td>
                  <td className="mono px-4 py-3 text-slate-700">{money(row.spend)}</td>
                  <td className="mono px-4 py-3 text-emerald-700">{money(row.income)}</td>
                  <td className="mono px-4 py-3 text-rose-700">{money(row.withdrawal)}</td>
                  <td className="mono px-4 py-3 text-sky-700">{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InsuranceGap() {
  const [debt, setDebt] = useStickyState(5000000, 'ins_debt');
  const [family, setFamily] = useStickyState(6000000, 'ins_family');
  const [education, setEducation] = useStickyState(2000000, 'ins_education');
  const [assets, setAssets] = useStickyState(1800000, 'ins_assets');
  const need = n(debt) + n(family) + n(education);
  const gap = Math.max(0, need - n(assets));
  return (
    <div className="space-y-6">
      <SectionHeader title="保障缺口" icon={ShieldCheck} description="用責任需求法粗估壽險保障缺口，協助檢查風險承擔是否集中在家人身上。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="未清償負債" value={debt} onChange={setDebt} prefix="$" />
          <NumberField label="家庭生活需求" value={family} onChange={setFamily} prefix="$" />
          <NumberField label="教育/照護需求" value={education} onChange={setEducation} prefix="$" />
          <NumberField label="可動用資產" value={assets} onChange={setAssets} prefix="$" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="責任需求" value={money(need)} icon={ShieldCheck} tone="sky" />
          <ResultCard title="保障缺口" value={money(gap)} icon={AlertTriangle} tone={gap > 0 ? 'rose' : 'emerald'} />
        </div>
      </div>
    </div>
  );
}

function InflationCalc() {
  const [amount, setAmount] = useStickyState(1000000, 'inf_amount');
  const [rate, setRate] = useStickyState(3, 'inf_rate');
  const [years, setYears] = useStickyState(20, 'inf_years');
  const real = n(amount) / Math.pow(1 + n(rate) / 100, n(years));
  const futureCost = n(amount) * Math.pow(1 + n(rate) / 100, n(years));
  return (
    <div className="space-y-6">
      <SectionHeader title="通膨購買力" icon={TrendingDown} description="估算未來同一筆錢的實質購買力，或同樣生活水準需要多少錢。" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="今日金額" value={amount} onChange={setAmount} prefix="$" />
          <NumberField label="年通膨率" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <NumberField label="年數" value={years} onChange={setYears} suffix="年" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="未來購買力" value={money(real)} icon={TrendingDown} tone="rose" />
          <ResultCard title="未來等值成本" value={money(futureCost)} icon={TrendingUp} tone="amber" />
        </div>
      </div>
    </div>
  );
}

function FcnCalculator() {
  const [principal, setPrincipal] = useStickyState(3000000, 'fcn_principal');
  const [months, setMonths] = useStickyState(3, 'fcn_months');
  const [yieldRate, setYieldRate] = useStickyState(8, 'fcn_yield');
  const [ko, setKo] = useStickyState(100, 'fcn_ko');
  const [strike, setStrike] = useStickyState(100, 'fcn_strike');
  const [ki, setKi] = useStickyState(65, 'fcn_ki');
  const defaultFcnAssets = [
    { id: 'asset-aapl', symbol: 'AAPL', price: 308.33, scenario: 85, sourceDate: '' },
    { id: 'asset-nvda', symbol: 'NVDA', price: 214.86, scenario: 85, sourceDate: '' },
  ];
  const [assets, setAssets] = useStickyState(defaultFcnAssets, 'fcn_assets');
  const [quoteCache, setQuoteCache] = useState(null);
  const [quoteCacheError, setQuoteCacheError] = useState('');
  const [quoteStatus, setQuoteStatus] = useState({});

  const getAssetBase = (items = assets) => (Array.isArray(items) && items.length ? items : defaultFcnAssets);
  const fcnAssets = getAssetBase().map((asset, index) => ({
    id: asset.id || `asset-${index}`,
    symbol: asset.symbol ?? '',
    price: asset.price ?? '',
    scenario: asset.scenario ?? 85,
    sourceDate: asset.sourceDate ?? '',
    source: asset.source ?? '',
  }));

  useEffect(() => {
    if (Array.isArray(assets) && assets.some((asset) => !asset.id)) {
      setAssets((items) =>
        getAssetBase(items).map((asset, index) => ({ ...asset, id: asset.id || `asset-${Date.now()}-${index}` })),
      );
    }
  }, [assets, setAssets]);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/us-closes.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('quote cache unavailable');
        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setQuoteCache(data);
          setQuoteCacheError('');
        }
      })
      .catch(() => {
        if (!cancelled) setQuoteCacheError('收盤價資料暫時無法載入，可先手動輸入。');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setSafeAssets = (updater) => {
    setAssets((items) => {
      const base = getAssetBase(items);
      return typeof updater === 'function' ? updater(base) : updater;
    });
  };

  const normalizeSymbol = (symbol) => symbol.trim().toUpperCase().replace(/\s+/g, '');

  const loadQuoteCache = async () => {
    if (quoteCache) return quoteCache;
    const response = await fetch('/data/us-closes.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('收盤價資料暫時無法載入');
    const data = await response.json();
    setQuoteCache(data);
    setQuoteCacheError('');
    return data;
  };

  const updateAsset = (assetId, patch) => {
    setSafeAssets((items) =>
      items.map((item, index) => ((item.id || `asset-${index}`) === assetId ? { ...item, ...patch } : item)),
    );
  };

  const addAsset = () => {
    setSafeAssets((items) => [
      ...items,
      { id: `asset-${Date.now()}`, symbol: '', price: '', scenario: 85, sourceDate: '', source: '' },
    ]);
  };

  const removeAsset = (assetId) => {
    setSafeAssets((items) => (items.length > 1 ? items.filter((item, index) => (item.id || `asset-${index}`) !== assetId) : items));
  };

  const applyLatestClose = async (assetId) => {
    const asset = fcnAssets.find((item) => item.id === assetId);
    const symbol = normalizeSymbol(asset?.symbol || '');
    if (!symbol) {
      setQuoteStatus((items) => ({ ...items, [assetId]: { state: 'error', message: '請先輸入美股代號。' } }));
      return;
    }
    setQuoteStatus((items) => ({ ...items, [assetId]: { state: 'loading', message: '讀取最新收盤價...' } }));
    try {
      const data = await loadQuoteCache();
      const quote = data?.quotes?.[symbol];
      const close = n(quote?.close, NaN);
      if (!quote || !Number.isFinite(close)) throw new Error(`${symbol} 尚未在每日資料庫中。`);
      updateAsset(assetId, {
        symbol,
        price: close.toFixed(2),
        sourceDate: quote.date,
        source: data.source || 'US latest close',
      });
      setQuoteStatus((items) => ({
        ...items,
        [assetId]: { state: 'ok', message: `${symbol} 已帶入 ${quote.date} 收盤價 ${money(close, 2)}` },
      }));
    } catch (error) {
      setQuoteStatus((items) => ({
        ...items,
        [assetId]: { state: 'error', message: error.message || '無法帶入收盤價，請手動輸入。' },
      }));
    }
  };

  const coupon = n(principal) * n(yieldRate) / 100 / 12 * n(months);
  const couponRate = n(principal) ? coupon / n(principal) : 0;
  const assetCalcs = fcnAssets.map((asset) => {
    const ref = n(asset.price);
    const scenarioPct = n(asset.scenario, 100);
    const koPrice = ref * n(ko) / 100;
    const strikePrice = ref * n(strike) / 100;
    const kiPrice = ref * n(ki) / 100;
    const breakEven = strikePrice * (1 - couponRate);
    const scenarioPrice = ref * scenarioPct / 100;
    const allocatedUnits = strikePrice ? n(principal) / strikePrice : 0;
    const stockValue = allocatedUnits * scenarioPrice;
    const scenarioPnl = scenarioPrice < strikePrice ? coupon + stockValue - n(principal) : coupon;
    const scenarioPnlPct = n(principal) ? scenarioPnl / n(principal) * 100 : 0;
    const status =
      scenarioPrice >= koPrice
        ? '可能提前出場'
        : scenarioPrice <= kiPrice
          ? '落入 KI 風險區'
          : scenarioPrice < strikePrice
            ? '低於 Strike'
            : '收息返本';
    return { ...asset, ref, scenarioPct, koPrice, strikePrice, kiPrice, breakEven, scenarioPrice, scenarioPnl, scenarioPnlPct, status };
  });
  const primary = assetCalcs[0] || {};
  const quoteUpdatedAt = quoteCache?.updatedAt
    ? new Date(quoteCache.updatedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    : '載入中';

  return (
    <div className="space-y-6">
      <SectionHeader title="FCN 結構型商品" icon={PieChart} description="估算 FCN 常見 KO、Strike、KI 價位、收息與標的情境損益。" source="結構型商品風險高，實際條件以商品說明書為準。" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <NumberField label="本金" value={principal} onChange={setPrincipal} prefix="$" />
          <NumberField label="天期" value={months} onChange={setMonths} suffix="月" />
          <NumberField label="年化配息率" value={yieldRate} onChange={setYieldRate} suffix="%" step="0.1" />
          <NumberField label="KO" value={ko} onChange={setKo} suffix="%" />
          <NumberField label="Strike" value={strike} onChange={setStrike} suffix="%" />
          <NumberField label="KI" value={ki} onChange={setKi} suffix="%" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResultCard title="總配息" value={money(coupon)} icon={Coins} tone="emerald" />
          <ResultCard title="KO 價" value={money(primary.koPrice, 2)} icon={TrendingUp} tone="sky" detail="依第一個標的顯示。" />
          <ResultCard title="Strike 價" value={money(primary.strikePrice, 2)} icon={Target} tone="amber" detail="依第一個標的顯示。" />
          <ResultCard title="KI 價" value={money(primary.kiPrice, 2)} icon={TrendingDown} tone="rose" detail="依第一個標的顯示。" />
          <ResultCard title="配息後兩平" value={money(primary.breakEven, 2)} icon={Scale} tone="indigo" detail="不含交易成本、匯率與提前出場影響。" />
        </div>
      </div>
      <div className="tool-card p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">標的價格試算</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              每日快取更新時間：{quoteUpdatedAt}。{quoteCacheError || '常用美股與 ETF 可一鍵帶入最新收盤價。'}
            </p>
          </div>
          <button
            type="button"
            onClick={addAsset}
            title="新增標的"
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-700 hover:bg-sky-100"
          >
            <Plus size={16} />
            新增標的
          </button>
        </div>
        <div className="space-y-4">
          {fcnAssets.map((asset) => {
            const status = quoteStatus[asset.id];
            return (
              <div key={asset.id} className="grid gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
                <NumberField
                  label="美股代號"
                  type="text"
                  value={asset.symbol}
                  onChange={(value) => updateAsset(asset.id, { symbol: value.toUpperCase(), sourceDate: '', source: '' })}
                  placeholder="AAPL"
                />
                <NumberField
                  label="參考價"
                  value={asset.price}
                  onChange={(value) => updateAsset(asset.id, { price: value, sourceDate: '', source: '' })}
                  prefix="$"
                  step="0.01"
                  note={asset.sourceDate ? `${asset.sourceDate} 收盤價` : ''}
                />
                <NumberField
                  label="到期情境"
                  value={asset.scenario}
                  onChange={(value) => updateAsset(asset.id, { scenario: value })}
                  suffix="%"
                  step="0.1"
                  note="以參考價百分比估算"
                />
                <button
                  type="button"
                  onClick={() => applyLatestClose(asset.id)}
                  disabled={status?.state === 'loading'}
                  title="帶入最新美股收盤價"
                  className="focus-ring inline-flex h-11 items-center justify-center gap-2 self-end rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:border-sky-300 hover:text-sky-700 disabled:cursor-wait disabled:opacity-70"
                >
                  <Download size={16} />
                  <span>帶入昨收</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeAsset(asset.id)}
                  disabled={fcnAssets.length === 1}
                  title="移除標的"
                  className="focus-ring inline-flex h-11 w-11 items-center justify-center self-end rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </button>
                {status?.message ? (
                  <p className={`lg:col-span-5 text-xs ${status.state === 'error' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {status.state === 'loading' ? '讀取中...' : status.message}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="tool-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">標的</th>
                <th className="px-4 py-3">參考價</th>
                <th className="px-4 py-3">KO</th>
                <th className="px-4 py-3">Strike</th>
                <th className="px-4 py-3">KI</th>
                <th className="px-4 py-3">損益兩平</th>
                <th className="px-4 py-3">情境價</th>
                <th className="px-4 py-3">情境損益</th>
                <th className="px-4 py-3">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {assetCalcs.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-4 py-3 font-black text-slate-900">{normalizeSymbol(asset.symbol) || '-'}</td>
                  <td className="mono px-4 py-3 text-slate-700">{money(asset.ref, 2)}</td>
                  <td className="mono px-4 py-3 text-sky-700">{money(asset.koPrice, 2)}</td>
                  <td className="mono px-4 py-3 text-amber-700">{money(asset.strikePrice, 2)}</td>
                  <td className="mono px-4 py-3 text-rose-700">{money(asset.kiPrice, 2)}</td>
                  <td className="mono px-4 py-3 text-indigo-700">{money(asset.breakEven, 2)}</td>
                  <td className="mono px-4 py-3 text-slate-700">{money(asset.scenarioPrice, 2)}</td>
                  <td className={`mono px-4 py-3 font-bold ${asset.scenarioPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {money(asset.scenarioPnl, 0)} / {pct(asset.scenarioPnlPct, 2)}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-600">{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-500">
          情境損益以到期低於 Strike 時可能接股估算；是否觸發 KI、提前贖回、票息支付日與保護條款仍需以商品說明書為準。
        </p>
      </div>
    </div>
  );
}

function StaticPage({ title, icon: Icon, children }) {
  return (
    <article className="space-y-6">
      <SectionHeader title={title} icon={Icon} description="這些資訊協助使用者理解 FinKit 的資料使用、限制與聯絡方式。" />
      <div className="tool-card prose prose-slate max-w-none p-6 leading-relaxed">
        {children}
      </div>
    </article>
  );
}

function PolicyPage({ type }) {
  const updated = '2026-05-26';
  if (type === 'privacy') {
    return (
      <StaticPage title="隱私權政策" icon={ShieldCheck}>
        <p>FinKit 目前提供簡易本機登入。暱稱/Email、PIN 的簡易雜湊值與試算資料會儲存在本機瀏覽器 localStorage，用於同一台裝置下次開啟時保留欄位，不會由 FinKit 伺服器保存，也不會跨裝置同步。</p>
        <p>本站使用 Google AdSense。第三方供應商，包括 Google，可能使用 Cookie 依據使用者過去造訪本站或其他網站的紀錄投放廣告。使用者可以前往 Google 廣告設定停用個人化廣告。</p>
        <p>匯率工具會向 exchangerate-api.com 讀取公開匯率資料。本站不會主動將你的試算金額傳送到自有後端。</p>
        <p>最後更新：{updated}</p>
      </StaticPage>
    );
  }
  if (type === 'terms') {
    return (
      <StaticPage title="服務條款" icon={FileText}>
        <p>FinKit 提供理財試算、教育與規劃輔助資訊。使用本站即表示你理解所有結果僅供參考，實際投資、稅務、保險或貸款決策仍應查閱正式文件並諮詢合格專業人士。</p>
        <p>本站會盡力維持資訊正確，但不保證所有資料、公式、法規或匯率在任何時間皆完整、即時或適用於你的個別情境。</p>
        <p>最後更新：{updated}</p>
      </StaticPage>
    );
  }
  if (type === 'disclaimer') {
    return (
      <StaticPage title="免責聲明" icon={AlertTriangle}>
        <p>FinKit 不是投資顧問、保險顧問、稅務代理人或金融商品銷售平台。本站不提供買賣建議，也不承諾任何報酬。</p>
        <p>任何試算結果都取決於你輸入的假設。市場價格、利率、稅制、費用與個人條件改變時，結果可能明顯不同。</p>
        <p>最後更新：{updated}</p>
      </StaticPage>
    );
  }
  if (type === 'contact') {
    return (
      <StaticPage title="聯絡我們" icon={Mail}>
        <p>如需回報公式錯誤、資料更新、功能建議或廣告相關問題，請至 GitHub repo 提交 issue：</p>
        <p><a className="font-bold text-sky-700 underline" href="https://github.com/staney41011/FinKit/issues" target="_blank" rel="noreferrer">github.com/staney41011/FinKit/issues</a></p>
        <p>最後更新：{updated}</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage title="關於 FinKit" icon={BookOpen}>
      <p>FinKit 的目標是成為台灣使用者每天都會打開的理財輔助工具：先幫你看清現金流，再把投資、負債、房貸、稅務、退休、保險與風險集中到同一個工作台。</p>
      <p>未來可繼續加入帳戶同步、匿名化趨勢紀錄、更多台灣稅制資料、ETF 資訊、文章教學與個人化提醒。</p>
    </StaticPage>
  );
}

function ProfileSettings({ settings, onUpdate }) {
  return (
    <div className="space-y-6">
      <SectionHeader title="品牌設定" icon={User} description="給理財顧問或內容創作者使用。設定會顯示在匯出圖片與頁尾。" />
      <div className="tool-card max-w-xl space-y-4 p-5">
        <NumberField label="姓名/品牌" value={settings.name} onChange={(value) => onUpdate('name', value)} type="text" placeholder="例：FinKit 顧問" />
        <NumberField label="LINE ID" value={settings.line} onChange={(value) => onUpdate('line', value)} type="text" placeholder="@finkit" />
        <NumberField label="電話" value={settings.phone} onChange={(value) => onUpdate('phone', value)} type="text" placeholder="0912-345-678" />
        <AdvisoryNote>品牌資料只存在你的瀏覽器，不會送出到 FinKit 伺服器。</AdvisoryNote>
      </div>
    </div>
  );
}

const menuGroups = [
  {
    title: '總覽',
    items: [
      { id: 'home', name: '理財總覽', icon: Compass },
      { id: 'health', name: '理財健檢', icon: Check },
      { id: 'budget', name: '預算現金流', icon: Wallet },
      { id: 'networth', name: '淨資產', icon: Landmark },
      { id: 'emergency', name: '預備金', icon: ShieldCheck },
    ],
  },
  {
    title: '目標與風險',
    items: [
      { id: 'goal', name: '目標倒推', icon: Target },
      { id: 'debt', name: '負債清償', icon: CreditCard },
      { id: 'risk', name: '風險屬性', icon: Scale },
      { id: 'allocation', name: '資產配置', icon: Scale },
      { id: 'insurance', name: '保障缺口', icon: ShieldCheck },
    ],
  },
  {
    title: '投資工具',
    items: [
      { id: 'compound', name: '複利 PK', icon: TrendingUp },
      { id: 'dca', name: '定期定額', icon: RefreshCw },
      { id: 'stock', name: '台股交易', icon: BarChart3 },
      { id: 'dividend', name: '配息健保', icon: Coins },
      { id: 'unit', name: '單位配息', icon: Layers },
      { id: 'irr', name: 'IRR', icon: Percent },
      { id: 'fees', name: '費用拖累', icon: Scale },
      { id: 'fcn', name: 'FCN', icon: PieChart },
    ],
  },
  {
    title: '生活與稅務',
    items: [
      { id: 'loan', name: '房貸', icon: Home },
      { id: 'rentbuy', name: '買租比較', icon: Building },
      { id: 'fire', name: 'FIRE', icon: Target },
      { id: 'retirement', name: '退休提領', icon: PiggyBank },
      { id: 'inflation', name: '通膨', icon: TrendingDown },
      { id: 'forex', name: '匯率', icon: Globe },
      { id: 'tax', name: '海外所得', icon: Calculator },
    ],
  },
  {
    title: '站務',
    items: [
      { id: 'about', name: '關於', icon: BookOpen },
      { id: 'privacy', name: '隱私', icon: ShieldCheck },
      { id: 'terms', name: '條款', icon: FileText },
      { id: 'disclaimer', name: '免責', icon: AlertTriangle },
      { id: 'contact', name: '聯絡', icon: Mail },
      { id: 'profile', name: '品牌設定', icon: User },
    ],
  },
];

function AdSenseNotice() {
  return (
    <div className="no-capture no-print mt-8 rounded-lg border border-slate-200 bg-white p-4 text-center text-xs text-slate-400">
      廣告區域會在 Google AdSense 審核通過並有可投放需求時顯示；廣告不會放在導覽或操作按鈕內。
    </div>
  );
}

function FinancialToolkit() {
  const [activeTab, setActiveTab] = useStickyState('home', 'active_tab');
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandSettings, setBrandSettings] = useStickyState({ name: '', line: '', phone: '' }, 'brand_settings');
  const mainRef = useRef(null);

  useEffect(() => {
    const titleMap = Object.fromEntries(menuGroups.flatMap((group) => group.items.map((item) => [item.id, item.name])));
    document.title = activeTab === 'home' ? 'FinKit 財富工具箱 | 台灣理財試算與規劃工具' : `${titleMap[activeTab] || 'FinKit'} | FinKit`;
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const updateBrand = (field, value) => setBrandSettings((prev) => ({ ...prev, [field]: value }));

  const content = useMemo(() => {
    switch (activeTab) {
      case 'health': return <FinancialHealthAudit />;
      case 'budget': return <BudgetPlanner />;
      case 'networth': return <NetWorthTracker />;
      case 'emergency': return <EmergencyFund />;
      case 'goal': return <GoalPlanner />;
      case 'debt': return <DebtPayoff />;
      case 'risk': return <RiskProfilePlanner />;
      case 'allocation': return <AllocationPlanner />;
      case 'insurance': return <InsuranceGap />;
      case 'compound': return <CompoundCalculator />;
      case 'dca': return <DcaCalculator />;
      case 'stock': return <StockCalculator />;
      case 'dividend': return <DividendCalculator />;
      case 'unit': return <UnitCalculator />;
      case 'irr': return <IrrCalculator />;
      case 'fees': return <FeeDragCalculator />;
      case 'fcn': return <FcnCalculator />;
      case 'loan': return <LoanCalculator />;
      case 'rentbuy': return <RentVsBuy />;
      case 'fire': return <FireCalculator />;
      case 'retirement': return <RetirementWithdrawalPlanner />;
      case 'inflation': return <InflationCalc />;
      case 'forex': return <ForexCalculator />;
      case 'tax': return <TaxCalculator />;
      case 'privacy': return <PolicyPage type="privacy" />;
      case 'terms': return <PolicyPage type="terms" />;
      case 'disclaimer': return <PolicyPage type="disclaimer" />;
      case 'contact': return <PolicyPage type="contact" />;
      case 'about': return <PolicyPage type="about" />;
      case 'profile': return <ProfileSettings settings={brandSettings} onUpdate={updateBrand} />;
      default: return <HomePage changeTab={setActiveTab} />;
    }
  }, [activeTab, brandSettings]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <div className="no-print fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur md:hidden">
        <button type="button" onClick={() => setActiveTab('home')} className="flex items-center gap-2 text-lg font-black text-slate-950">
          <Briefcase className="text-sky-600" size={24} />
          FinKit
        </button>
        <button type="button" onClick={() => setMenuOpen(true)} className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200">
          <Menu size={21} />
        </button>
      </div>

      <aside className={`no-print fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-xl transition md:static md:z-auto md:block md:h-screen md:translate-x-0 md:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
            <button type="button" onClick={() => { setActiveTab('home'); setMenuOpen(false); }} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Briefcase size={24} />
              </span>
              <span className="text-2xl font-black tracking-normal">FinKit</span>
            </button>
            <button type="button" onClick={() => setMenuOpen(false)} className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 md:hidden">
              <X size={18} />
            </button>
          </div>

          {brandSettings.name ? (
            <div className="mx-4 mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3">
              <p className="text-sm font-bold text-slate-900">{brandSettings.name}</p>
              <p className="text-xs text-sky-700">專屬理財工作台</p>
            </div>
          ) : null}

          <LocalLoginPanel />

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-7">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">{group.title}</h2>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                          className={`focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${active ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
                        >
                          <Icon size={18} className={active ? 'text-sky-600' : 'text-slate-400'} />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {menuOpen ? <button type="button" aria-label="Close menu" className="no-print fixed inset-0 z-40 bg-slate-900/30 md:hidden" onClick={() => setMenuOpen(false)} /> : null}

      <main ref={mainRef} className="h-screen flex-1 overflow-y-auto px-4 pb-12 pt-20 md:px-8 md:pt-8 lg:px-10">
        <div id="capture-area" className="mx-auto max-w-6xl">
          <div className="hidden print:mb-8 print:flex print:items-end print:justify-between print:border-b print:border-slate-200 print:pb-4">
            <div className="flex items-center gap-3 text-2xl font-black">
              <Briefcase size={30} />
              FinKit 理財規劃報告
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Generated by FinKit</p>
              {brandSettings.name ? <p className="font-bold text-slate-900">顧問：{brandSettings.name}</p> : null}
            </div>
          </div>

          {content}
          <AdSenseNotice />

          <footer className="mt-14 flex flex-col gap-4 border-t border-slate-200 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-700">© 2026 FinKit. 用心規劃，理性決策。</p>
              <p className="mt-1">本站工具僅供試算與教育參考，不構成投資、稅務、保險或法律建議。</p>
              {brandSettings.name ? <p className="mt-1">顧問：{brandSettings.name} {brandSettings.line ? ` / LINE: ${brandSettings.line}` : ''} {brandSettings.phone ? ` / ${brandSettings.phone}` : ''}</p> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                ['about', '關於'],
                ['privacy', '隱私'],
                ['terms', '條款'],
                ['disclaimer', '免責'],
                ['contact', '聯絡'],
              ].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setActiveTab(id)} className="font-bold text-slate-500 underline-offset-4 hover:text-sky-700 hover:underline">
                  {label}
                </button>
              ))}
              <a className="font-bold text-slate-500 underline-offset-4 hover:text-sky-700 hover:underline" href={`${SITE_URL}/privacy.html`}>Privacy HTML</a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinancialToolkit />
    </AuthProvider>
  );
}
