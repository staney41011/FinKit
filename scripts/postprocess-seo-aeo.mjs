import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://finkit.top';
const ADSENSE_CLIENT = 'ca-pub-4463068342710380';
const LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

const adsenseScript = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>`;
const aiDiscovery = '<link rel="alternate" type="text/plain" href="/llms.txt" title="FinKit AI index" />';
const trustLinks = '<p class="finkit-trust-links"><a href="/about.html">關於 FinKit</a> · <a href="/editorial-policy.html">編輯與內容政策</a> · <a href="/methodology.html">計算方法與資料來源</a> · <a href="/contact.html">勘誤與聯絡</a></p>';

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
      publishingPrinciples: `${SITE_URL}/editorial-policy.html`,
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
const removeAdsense = (html) => html.replace(/\s*<script\b[^>]*pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^>]*><\/script>/gi, '');

const visibleText = (html) => html
  .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/\s+/g, ' ')
  .trim();

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
let adEligible = 0;
for (const file of files) {
  let html = await readFile(file, 'utf8');
  const rel = relative(publicDir, file).split(sep).join('/');
  const canonical = getCanonical(html) || `${SITE_URL}/${rel === 'index.html' ? '' : rel}`;
  const original = html;

  // Start from a policy-safe baseline. Ads are never inherited by navigation,
  // policy, contact, index, app-shell or calculator-only screens.
  html = removeAdsense(html);

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

  const editorialPage = (rel.startsWith('learn/') && rel !== 'learn/index.html') || (rel.startsWith('tools/') && rel !== 'tools/index.html');
  if (editorialPage && !html.includes('name="content-review"')) {
    html = addBeforeHeadEnd(html, `<meta name="content-review" content="FinKit editorial review; updated ${LASTMOD}" />`);
  }

  if (html.includes('</footer>') && !html.includes('/editorial-policy.html')) {
    html = html.replace('</footer>', `${trustLinks}\n      </footer>`);
  }

  // Google Publisher Policies prohibit ads on low-value, navigation or no-content screens.
  // During approval, FinKit monetizes only substantial long-form articles that pass a
  // visible-content threshold. Interactive calculators and legal/navigation pages stay ad-free.
  const article = rel.startsWith('learn/') && rel !== 'learn/index.html';
  const substantial = visibleText(html).length >= 1000;
  if (article && substantial) {
    html = addBeforeHeadEnd(html, adsenseScript);
    adEligible += 1;
  }

  if (html !== original) {
    await writeFile(file, html);
    touched += 1;
  }
}

console.log(`SEO/AEO post-process complete: ${touched} HTML files enriched; AdSense enabled on ${adEligible} substantial editorial articles only`);
