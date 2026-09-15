import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://finkit.top';
const LASTMOD = process.env.SEO_LASTMOD || new Date().toISOString().slice(0, 10);
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

const sitemapPath = join(publicDir, 'sitemap.xml');
let sitemap = await readFile(sitemapPath, 'utf8');
for (const page of [
  ['/editorial-policy.html', '0.7'],
  ['/methodology.html', '0.7'],
]) {
  const [path, priority] = page;
  const url = `${SITE_URL}${path}`;
  if (!sitemap.includes(`<loc>${url}</loc>`)) {
    const entry = `  <url>\n    <loc>${url}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
  }
}
await writeFile(sitemapPath, sitemap);

const llmsPath = join(publicDir, 'llms.txt');
let llms = await readFile(llmsPath, 'utf8');
const trustBlock = `\n## Trust, methodology and corrections\n- Editorial policy: ${SITE_URL}/editorial-policy.html\n- Calculation methodology and sources: ${SITE_URL}/methodology.html\n- About FinKit: ${SITE_URL}/about.html\n- Corrections/contact: ${SITE_URL}/contact.html\n`;
if (!llms.includes('## Trust, methodology and corrections')) {
  llms += trustBlock;
  await writeFile(llmsPath, llms);
}

console.log('Site quality finalization complete: trust pages added to sitemap and AI discovery index');
