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
  fail('dist/index.html still references the Vite source entry instead of production code');
}

for (const marker of [
  'data-finkit-inline="app"',
  'data-finkit-inline="style"',
  'data-finkit-inline="enhancements"',
  'data-finkit-inline="tax-redirect"',
]) {
  if (!index.includes(marker)) fail(`missing production inline marker: ${marker}`);
}

const app = index.match(/<script type="module" data-finkit-inline="app">([\s\S]*?)<\/script>/i)?.[1] || '';
const css = index.match(/<style data-finkit-inline="style">([\s\S]*?)<\/style>/i)?.[1] || '';

if (app.length < 100000) fail(`inlined app bundle is unexpectedly small (${app.length} bytes)`);
if (css.length < 10000) fail(`inlined stylesheet is unexpectedly small (${css.length} bytes)`);
if (/src=["']\/assets\/[^"']+\.js["']/i.test(index)) fail('critical app JavaScript is still external');
if (/href=["']\/assets\/[^"']+\.css["']/i.test(index)) fail('critical app stylesheet is still external');

for (const required of ['finkit-enhancements.js', 'finkit-tax-redirect.js', 'CNAME']) {
  await access(join(root, required));
}

const cname = (await readFile(join(root, 'CNAME'), 'utf8')).trim();
if (cname !== 'finkit.top') {
  fail(`dist/CNAME must be finkit.top, got "${cname}"`);
}

console.log(`Built-site smoke test passed: app and CSS are self-contained in index.html; CNAME=${cname}`);
