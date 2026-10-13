import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../', import.meta.url));
const site = join(repo, 'site');
let compared = 0;
const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(abs);
      continue;
    }
    if (!entry.isFile()) continue;
    const rel = relative(site, abs);
    const rootPath = join(repo, rel);
    try {
      const [source, mirror] = await Promise.all([readFile(abs), readFile(rootPath)]);
      if (!source.equals(mirror)) failures.push('Published file differs from repository-root copy: ' + rel);
      compared++;
    } catch {
      failures.push('Repository-root file missing: ' + rel);
    }
  }
}

await walk(site);
const rootIndex = await readFile(join(repo, 'index.html'), 'utf8');
const siteIndex = await readFile(join(site, 'index.html'), 'utf8');
const expected = 'finkit.top';
for (const path of ['CNAME', 'site/CNAME']) {
  const domain = (await readFile(join(repo, path), 'utf8')).trim();
  if (domain !== expected) failures.push(path + ' must be a plain-text finkit.top domain');
}
if (!rootIndex.includes('class="app-shell"') || !rootIndex.includes('class="fallback-grid"')) {
  failures.push('The root homepage is not the modern, accessible FinKit app');
}
if (/熱門理財工具[\s\S]*?2026 海外所得稅完整指南/.test(rootIndex)) {
  failures.push('The legacy SEO-only homepage appears to be in the publishing root');
}
if (rootIndex !== siteIndex) failures.push('Root and site homepages are not identical');
if (compared < 55) failures.push('Too few mirrored published files: ' + compared);

if (failures.length) {
  failures.forEach((failure) => console.error('FAIL:', failure));
  process.exit(1);
}
console.log('FinKit Pages publishing sync passed:', compared, 'files identical at root and /site.');
