import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SYMBOLS = [
  'AAPL',
  'MSFT',
  'NVDA',
  'AMZN',
  'GOOGL',
  'GOOG',
  'META',
  'TSLA',
  'AVGO',
  'AMD',
  'NFLX',
  'COST',
  'LLY',
  'JPM',
  'V',
  'MA',
  'UNH',
  'XOM',
  'WMT',
  'HD',
  'PG',
  'JNJ',
  'ABBV',
  'BAC',
  'KO',
  'PEP',
  'MCD',
  'DIS',
  'NKE',
  'SBUX',
  'CRM',
  'ORCL',
  'ADBE',
  'QCOM',
  'TXN',
  'AMAT',
  'INTU',
  'NOW',
  'CSCO',
  'IBM',
  'GE',
  'CVX',
  'MRK',
  'CAT',
  'DE',
  'GS',
  'MS',
  'UBER',
  'PLTR',
  'MU',
  'SMCI',
  'PYPL',
  'BA',
  'TSM',
  'ASML',
  'BABA',
  'NVO',
  'SHOP',
  'PDD',
  'ARM',
  'SPY',
  'QQQ',
  'DIA',
  'IWM',
  'VOO',
  'VTI',
  'TQQQ',
  'SOXX',
  'SMH',
  'XLK',
  'XLF',
  'XLE',
  'GLD',
  'SLV',
  'TLT',
  'HYG',
  'LQD',
];

const symbols = [...new Set((process.env.US_QUOTE_SYMBOLS || DEFAULT_SYMBOLS.join(',')).split(/[,\s]+/).map((item) => item.trim().toUpperCase()).filter(Boolean))];
const outputPath = fileURLToPath(new URL('../public/data/us-closes.json', import.meta.url));

const chunk = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));

const numberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const quotes = {};
const errors = [];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findLastCloseIndex = (closes) => {
  for (let index = closes.length - 1; index >= 0; index -= 1) {
    if (numberOrNull(closes[index]) !== null) return index;
  }
  return -1;
};

const fetchYahooQuote = async (symbol) => {
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=7d&interval=1d`, {
    headers: { 'User-Agent': 'Mozilla/5.0 FinKit quote cache updater' },
  });
  if (!response.ok) throw new Error(`Yahoo returned ${response.status}`);
  const data = await response.json();
  const result = data?.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp || [];
  const closes = quote?.close || [];
  const index = findLastCloseIndex(closes);
  if (index === -1) throw new Error('No close price in response');
  return {
    symbol,
    sourceSymbol: result?.meta?.symbol || symbol,
    date: new Date(timestamps[index] * 1000).toISOString().slice(0, 10),
    time: 'regular close',
    currency: result?.meta?.currency || 'USD',
    exchange: result?.meta?.exchangeName || '',
    open: numberOrNull(quote?.open?.[index]),
    high: numberOrNull(quote?.high?.[index]),
    low: numberOrNull(quote?.low?.[index]),
    close: numberOrNull(closes[index]),
    volume: numberOrNull(quote?.volume?.[index]),
  };
};

for (const group of chunk(symbols, 8)) {
  const results = await Promise.allSettled(group.map((symbol) => fetchYahooQuote(symbol)));
  results.forEach((result, index) => {
    const symbol = group[index];
    if (result.status === 'fulfilled') {
      quotes[symbol] = result.value;
    } else {
      errors.push(`${symbol}: ${result.reason?.message || 'quote fetch failed'}`);
    }
  });
  await delay(250);
}

if (!Object.keys(quotes).length) {
  throw new Error('No quote data was fetched.');
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      source: 'Yahoo Finance chart API latest close',
      market: 'US',
      updatedAt: new Date().toISOString(),
      symbols,
      quoteCount: Object.keys(quotes).length,
      skippedSymbols: errors,
      quotes,
    },
    null,
    2,
  )}\n`,
);

console.log(`Updated ${Object.keys(quotes).length} US closing prices at ${outputPath}`);
if (errors.length) console.warn(`Skipped symbols: ${errors.join(', ')}`);
