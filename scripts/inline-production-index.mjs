import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const indexPath = join(dist, 'index.html');
let html = await readFile(indexPath, 'utf8');

const appMatch = html.match(/<script\b[^>]*type=["']module["'][^>]*src=["'](\/assets\/[^"']+\.js)["'][^>]*><\/script>/i);
const cssMatch = html.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\/assets\/[^"']+\.css)["'][^>]*>/i);

if (!appMatch) throw new Error('Could not find built app module script in dist/index.html');
if (!cssMatch) throw new Error('Could not find built stylesheet in dist/index.html');

const appJs = await readFile(join(dist, appMatch[1].replace(/^\//, '')), 'utf8');
const appCss = await readFile(join(dist, cssMatch[1].replace(/^\//, '')), 'utf8');
const enhancements = await readFile(join(dist, 'finkit-enhancements.js'), 'utf8');
const taxRedirect = await readFile(join(dist, 'finkit-tax-redirect.js'), 'utf8');

const safeScript = (value) => value.replace(/<\/script/gi, '<\\/script');
const safeStyle = (value) => value.replace(/<\/style/gi, '<\\/style');
const literalReplace = (source, search, replacement) => source.replace(search, () => replacement);

html = literalReplace(
  html,
  cssMatch[0],
  `<style data-finkit-inline="style">\n${safeStyle(appCss)}\n</style>`,
);

html = literalReplace(
  html,
  appMatch[0],
  `<script type="module" data-finkit-inline="app">\n${safeScript(appJs)}\n</script>`,
);

html = html.replace(
  /<script\b[^>]*defer[^>]*src=["']\/finkit-enhancements\.js["'][^>]*><\/script>/i,
  () => `<script data-finkit-inline="enhancements">\n${safeScript(enhancements)}\n</script>`,
);

html = html.replace(
  /<script\b[^>]*defer[^>]*src=["']\/finkit-tax-redirect\.js["'][^>]*><\/script>/i,
  () => `<script data-finkit-inline="tax-redirect">\n${safeScript(taxRedirect)}\n</script>`,
);

await writeFile(indexPath, html);
console.log(`Production index inlined: app ${appJs.length} bytes, CSS ${appCss.length} bytes, helper scripts included`);
