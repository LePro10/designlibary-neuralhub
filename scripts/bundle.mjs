// Writes dist/library.json — everything the MCP server needs in one fetch:
// registry, library sources, guidelines and the showcase page list. Runs
// after `vite build`, so the MCP always matches the deployed showcase.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readPages, root } from './pages.mjs';

const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
const sources = Object.fromEntries(Object.keys(registry.files).map((p) => [p, readFileSync(join(root, p), 'utf8')]));
for (const f of ['ui/index.ts']) sources[f] = readFileSync(join(root, f), 'utf8');

const docs = Object.fromEntries(readdirSync(join(root, 'docs')).filter((f) => f.endsWith('.md'))
  .map((f) => [f.replace(/\.md$/, ''), readFileSync(join(root, 'docs', f), 'utf8')]));

const shots = join(root, 'dist/shots');
let screenshots = [];
try { screenshots = readdirSync(shots).filter((f) => f.endsWith('.jpg')); } catch { /* none generated */ }

const lib = { agents: readFileSync(join(root, 'AGENTS.md'), 'utf8'), docs, registry, sources, pages: readPages(), screenshots };
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/library.json'), JSON.stringify(lib));
copyFileSync(join(root, 'mcp/server.mjs'), join(root, 'dist/mcp.mjs'));
console.log(`library.json: ${Object.keys(sources).length} sources, ${lib.pages.length} pages, ${screenshots.length} screenshots`);
