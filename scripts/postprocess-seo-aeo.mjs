import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://finkit.top';
const ADSENSE_CLIENT = 'ca-pub-4463068342710380';
const LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

const adsenseScript = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;
const aiDiscovery = '<link rel="alternate" type="text/plain" href="/llms.txt" title="FinKit AI index" />';
const globalSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'FinKit',
      alternateName: 'FinKit 財富工具箱',
      inLanguage: 'zh-TW',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'FinKit',
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
  ],
};

const escapeJsonForHtml = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...(await walk(full)));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
};

const getMeta = (html, name, property = false) => {
  const attr = property ? 'property' : 'name';
  const match = html.match(new RegExp(`<meta[^>]+${attr}=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'));
  return match?.[1] || '';
};

const getCanonical = (html) => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1] || '';
const getTitle = (html) => html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || 'FinKit';

const addBeforeHeadEnd = (html, snippet) => html.includes(snippet) ? html : html.replace('</head>', `  ${snippet}\n</head>`);

const toolApplicationSchema = (html, canonical) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${canonical}#software`,
  name: getTitle(html).replace(/｜FinKit$/,'').trim(),
  description: getMeta(html, 'description'),
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  url: canonical,
  inLanguage: 'zh-TW',
  isAccessibleForFree: true,
  publisher: { '@id': `${SITE_URL}/#organization` },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'TWD' },
});

const files = await walk(publicDir);
let touched = 0;
for (const file of files) {
  let html = await readFile(file, 'utf8');
  const rel = relative(publicDir, file).split(sep).join('/');
  const canonical = getCanonical(html) || `${SITE_URL}/${rel === 'index.html' ? '' : rel}`;
  const original = html;

  if (!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
    html = addBeforeHeadEnd(html, adsenseScript);
  }
  if (!html.includes('href="/llms.txt"')) html = addBeforeHeadEnd(html, aiDiscovery);
  if (!/<meta[^>]+name=["']application-name["']/i.test(html)) html = addBeforeHeadEnd(html, '<meta name="application-name" content="FinKit" />');
  if (!/<meta[^>]+name=["']author["']/i.test(html)) html = addBeforeHeadEnd(html, '<meta name="author" content="FinKit" />');
  if (!/<meta[^>]+name=["']referrer["']/i.test(html)) html = addBeforeHeadEnd(html, '<meta name="referrer" content="strict-origin-when-cross-origin" />');
  if (!/<meta[^>]+property=["']og:image:alt["']/i.test(html) && html.includes('property="og:image"')) {
    html = addBeforeHeadEnd(html, '<meta property="og:image:alt" content="FinKit 台灣理財工具與知識內容" />');
  }
  if (!html.includes(`${SITE_URL}/#website`)) {
    html = addBeforeHeadEnd(html, `<script type="application/ld+json">${escapeJsonForHtml(globalSchema)}</script>`);
  }

  if (rel.startsWith('tools/') && rel !== 'tools/index.html' && !html.includes('"SoftwareApplication"')) {
    html = addBeforeHeadEnd(html, `<script type="application/ld+json">${escapeJsonForHtml(toolApplicationSchema(html, canonical))}</script>`);
  }

  if (rel.startsWith('learn/') && rel !== 'learn/index.html' && !html.includes('article:modified_time')) {
    html = addBeforeHeadEnd(html, `<meta property="article:modified_time" content="${LASTMOD}" />`);
  }

  if (html !== original) {
    await writeFile(file, html);
    touched += 1;
  }
}

console.log(`SEO/AEO post-process complete: ${touched} HTML files enriched with discovery metadata, structured data, and AdSense code`);
