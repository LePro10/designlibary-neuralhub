// Screenshots of every showcase page (phone + desktop) into dist/shots, so the
// MCP can show a component, not just describe it. Needs `dist/` built first.
//   CHROMIUM=/path/to/chromium  optional; CI installs one via playwright.
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
import { readPages, root } from './pages.mjs';

const dist = join(root, 'dist');
const out = join(dist, 'shots');
mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer((req, res) => {
  try {
    const p = new URL(req.url, 'http://x').pathname;
    const body = readFileSync(join(dist, p === '/' ? 'index.html' : p));
    res.writeHead(200, { 'content-type': types[extname(p === '/' ? 'index.html' : p)] ?? 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const views = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };
let n = 0;
for (const [view, viewport] of Object.entries(views)) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: view === 'mobile' ? 2 : 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const { path } of readPages()) {
    await page.goto(`${base}#/${path}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(out, `${path.replace('/', '__')}.${view}.jpg`), type: 'jpeg', quality: 72, fullPage: true });
    n++;
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(`${n} screenshots → dist/shots`);
