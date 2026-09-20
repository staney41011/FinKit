import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const fail = (message) => {
  throw new Error(`Built-site smoke test failed: ${message}`);
};

const indexPath = join(root, 'index.html');
const index = await readFile(indexPath, 'utf8');

if (index.includes('/src/main.jsx')) {
  fail('dist/index.html still references the Vite source entry instead of a built asset');
}

const assetRefs = [
  ...index.matchAll(/(?:src|href)=["'](\/assets\/[^"'?#]+)["']/g),
].map((match) => match[1]);

if (!assetRefs.some((path) => path.endsWith('.js'))) fail('no built JavaScript bundle referenced by index.html');
if (!assetRefs.some((path) => path.endsWith('.css'))) fail('no built stylesheet referenced by index.html');

for (const ref of new Set(assetRefs)) {
  await access(join(root, ref.replace(/^\//, '')));
}

for (const required of ['finkit-enhancements.js', 'finkit-tax-redirect.js', 'CNAME']) {
  await access(join(root, required));
}

const cname = (await readFile(join(root, 'CNAME'), 'utf8')).trim();
if (cname !== 'finkit.top') {
  fail(`dist/CNAME must be finkit.top, got "${cname}"`);
}

console.log(`Built-site smoke test passed: ${assetRefs.length} asset references resolved; CNAME=${cname}`);
