import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const ADSENSE_MARKER = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const MIN_AD_ARTICLE_TEXT = 1000;
const MIN_TOOL_TEXT = 650;

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

const files = await walk(publicDir);
const failures = [];
const rows = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = relative(publicDir, file).split(sep).join('/');
  const textLength = visibleText(html).length;
  const hasAds = html.includes(ADSENSE_MARKER);
  const isArticle = rel.startsWith('learn/') && rel !== 'learn/index.html';
  const isTool = rel.startsWith('tools/') && rel !== 'tools/index.html';

  if (hasAds && !isArticle) failures.push(`${rel}: AdSense code is present on a non-article screen.`);
  if (hasAds && textLength < MIN_AD_ARTICLE_TEXT) failures.push(`${rel}: AdSense article has only ${textLength} visible characters; minimum is ${MIN_AD_ARTICLE_TEXT}.`);
  if (isTool && textLength < MIN_TOOL_TEXT) failures.push(`${rel}: tool landing page is too thin (${textLength} visible characters; minimum ${MIN_TOOL_TEXT}).`);

  if (hasAds || isTool || isArticle) rows.push({ rel, textLength, hasAds });
}

for (const required of ['about.html', 'editorial-policy.html', 'methodology.html', 'privacy.html', 'contact.html', 'ads.txt']) {
  try {
    await stat(join(publicDir, required));
  } catch {
    failures.push(`Missing required trust/publisher file: ${required}`);
  }
}

const adPages = rows.filter((row) => row.hasAds);
const toolPages = rows.filter((row) => row.rel.startsWith('tools/') && row.rel !== 'tools/index.html');
const thinnestTool = [...toolPages].sort((a, b) => a.textLength - b.textLength)[0];

console.log(`Publisher quality audit: ${files.length} HTML pages checked`);
console.log(`AdSense inventory: ${adPages.length} long-form article pages`);
console.log(`Tool landing pages checked: ${toolPages.length}; thinnest=${thinnestTool?.rel || 'n/a'} (${thinnestTool?.textLength || 0} chars)`);

if (failures.length) {
  console.error('\nPublisher quality audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Publisher quality audit passed. No ads on navigation, policy, app-shell, index, or calculator-only screens.');
