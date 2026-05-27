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

const toStooqSymbol = (symbol) => `${symbol.toLowerCase()}.us`;
const fromStooqSymbol = (symbol) => symbol.replace(/\.US$/i, '').toUpperCase();
const chunk = (items, size) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));

const numberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const readRows = (csv) =>
  csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(','))
    .filter((cells) => cells.length >= 8);

const quotes = {};
const errors = [];

for (const group of chunk(symbols, 30)) {
  const stooqSymbols = group.map(toStooqSymbol).join('+');
  const response = await fetch(`https://stooq.com/q/l/?s=${stooqSymbols}&f=sd2t2ohlcv&h&e=csv`);
  if (!response.ok) throw new Error(`Stooq returned ${response.status} for ${stooqSymbols}`);
  const rows = readRows(await response.text());

  for (const cells of rows) {
    const [stooqSymbol, date, time, open, high, low, close, volume] = cells;
    const symbol = fromStooqSymbol(stooqSymbol);
    const closeNumber = numberOrNull(close);
    if (!symbol || !date || closeNumber === null) {
      errors.push(stooqSymbol || group.join(','));
      continue;
    }
    quotes[symbol] = {
      symbol,
      stooqSymbol,
      date,
      time,
      open: numberOrNull(open),
      high: numberOrNull(high),
      low: numberOrNull(low),
      close: closeNumber,
      volume: numberOrNull(volume),
    };
  }
}

if (!Object.keys(quotes).length) {
  throw new Error('No quote data was fetched.');
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      source: 'Stooq latest US close',
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
