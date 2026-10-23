// NeuralHub design library — MCP server. One dependency-free file, two ways to run:
//   • stdio (Node ≥18):  node mcp.mjs                 → `claude mcp add … -- node mcp.mjs`
//   • remote HTTP:       Cloudflare Worker (mcp/wrangler.toml) → `claude mcp add --transport http …`
// It reads the public showcase (library.json + screenshots), so it needs no key
// and always matches what is deployed. NEURALHUB_URL overrides the source.

const SITE = (globalThis.process?.env?.NEURALHUB_URL || 'https://ui.neuralhub.dev').replace(/\/$/, '');
const VERSION = '1.0.0';

let cache = { at: 0, lib: null };
async function library() {
  if (cache.lib && Date.now() - cache.at < 10 * 60_000) return cache.lib;
  const res = await fetch(`${SITE}/library.json`);
  if (!res.ok) throw new Error(`Could not load ${SITE}/library.json (${res.status})`);
  cache = { at: Date.now(), lib: await res.json() };
  return cache.lib;
}

const text = (t) => ({ content: [{ type: 'text', text: t }] });
const fail = (t) => ({ isError: true, content: [{ type: 'text', text: t }] });
const fence = (path, src) => `### ${path}\n\`\`\`${path.endsWith('.css') ? 'css' : 'tsx'}\n${src}\n\`\`\``;
const name = (p) => p.split('/').pop().replace(/\.[^.]+$/, '');
const pageUrl = (p) => `${SITE}/#/${p}`;

function base64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

// Resolve "Button", "button", "ui/components/Button.tsx" to registry paths.
function findFiles(lib, q) {
  const k = q.toLowerCase().replace(/\.(tsx?|css)$/, '');
  const paths = Object.keys(lib.registry.files);
  const exact = paths.filter((p) => p.toLowerCase() === q.toLowerCase() || name(p).toLowerCase() === k.split('/').pop());
  if (exact.length) return exact;
  return paths.filter((p) => lib.registry.files[p].exports.some((e) => e.toLowerCase() === k));
}

function score(hay, words) {
  const h = hay.toLowerCase();
  return words.reduce((s, w) => s + (h.includes(w) ? 1 : 0), 0);
}

const tools = [
  {
    name: 'get_guidelines',
    description: 'START HERE. The design contract (AGENTS.md): tokens, springs, rules, setup. Optionally a deep-dive: foundations, mobile, motion, prinzipien.',
    inputSchema: { type: 'object', properties: { topic: { type: 'string', description: 'Optional: foundations | mobile | motion | prinzipien' } } },
    run: async ({ topic }) => {
      const lib = await library();
      if (!topic) return text(`${lib.agents}\n\n(Deep-dives: ${Object.keys(lib.docs).join(', ')})`);
      const doc = lib.docs[topic.toLowerCase()];
      return doc ? text(doc) : fail(`Unknown topic "${topic}". Available: ${Object.keys(lib.docs).join(', ')}`);
    },
  },
  {
    name: 'search',
    description: 'Search components, hooks, tokens and showcase pages by keyword (e.g. "bottom sheet", "chat composer", "donut chart").',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    run: async ({ query }) => {
      const lib = await library();
      const words = String(query).toLowerCase().split(/\s+/).filter(Boolean);
      const files = Object.entries(lib.registry.files)
        .map(([p, e]) => ({ p, e, s: score(`${p} ${e.summary} ${e.exports.join(' ')}`, words) }))
        .filter((x) => x.s).sort((a, b) => b.s - a.s).slice(0, 12);
      const pages = lib.pages.map((p) => ({ p, s: score(`${p.title} ${p.summary} ${p.path}`, words) }))
        .filter((x) => x.s).sort((a, b) => b.s - a.s).slice(0, 8);
      if (!files.length && !pages.length) return text(`No match for "${query}". Try list_components.`);
      return text([
        files.length && `## Library files\n${files.map(({ p, e }) => `- ${p} — ${e.summary || '(no summary)'}  [exports: ${e.exports.join(', ') || '—'}]`).join('\n')}`,
        pages.length && `## Showcase pages (use get_screenshot with the path)\n${pages.map(({ p }) => `- ${p.path} — ${p.title}: ${p.summary}\n  ${pageUrl(p.path)}`).join('\n')}`,
      ].filter(Boolean).join('\n\n'));
    },
  },
  {
    name: 'list_components',
    description: 'Overview of every library file grouped by folder, plus all showcase pages.',
    inputSchema: { type: 'object', properties: {} },
    run: async () => {
      const lib = await library();
      const by = {};
      for (const [p, e] of Object.entries(lib.registry.files)) (by[p.split('/').slice(0, -1).join('/')] ??= []).push(`- ${name(p)} — ${e.summary}`);
      const files = Object.entries(by).map(([d, l]) => `## ${d}\n${l.join('\n')}`).join('\n\n');
      const pages = lib.pages.map((p) => `- ${p.path} — ${p.title}`).join('\n');
      return text(`${files}\n\n# Showcase pages\n${pages}`);
    },
  },
  {
    name: 'get_component',
    description: 'Source code of a component/file by name or path (e.g. "Button", "ui/components/ai/AgentTrace.tsx"), with its npm packages. With with_dependencies=true you also get every library file it needs — exactly what to copy into the project.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string' }, with_dependencies: { type: 'boolean', description: 'Include all files from the copy list (default false)' } },
      required: ['name'],
    },
    run: async ({ name: q, with_dependencies }) => {
      const lib = await library();
      const hits = findFiles(lib, String(q));
      if (!hits.length) return fail(`"${q}" not found. Use search or list_components.`);
      if (hits.length > 1) return text(`Several matches, pass the full path:\n${hits.map((h) => `- ${h}`).join('\n')}`);
      const p = hits[0], e = lib.registry.files[p];
      const paths = with_dependencies ? e.copy : [p];
      return text([
        `# ${p}\n${e.summary}\nExports: ${e.exports.join(', ') || '—'}\nnpm: ${e.allPackages.join(', ') || 'none'}\nCopy list: ${e.copy.join(', ')}`,
        ...paths.map((f) => fence(f, lib.sources[f] ?? '(source unavailable)')),
      ].join('\n\n'));
    },
  },
  {
    name: 'get_file',
    description: 'Raw source of any library file, e.g. "ui/styles/index.css" (tokens) or "ui/lib/motion.ts" (springs).',
    inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    run: async ({ path }) => {
      const lib = await library();
      const src = lib.sources[String(path).replace(/^\.?\//, '')];
      return src == null ? fail(`No such file. Known: ${Object.keys(lib.sources).slice(0, 60).join(', ')} …`) : text(fence(path, src));
    },
  },
  {
    name: 'get_screenshot',
    description: 'Screenshot of a showcase page so you can SEE the component. page = path from search/list_components (e.g. "components/button"). view = mobile (390px) or desktop (1280px).',
    inputSchema: {
      type: 'object',
      properties: { page: { type: 'string' }, view: { type: 'string', enum: ['mobile', 'desktop'], description: 'Default mobile' } },
      required: ['page'],
    },
    run: async ({ page, view = 'mobile' }) => {
      const lib = await library();
      const q = String(page).toLowerCase().replace(/^#?\/?/, '');
      const hit = lib.pages.find((p) => p.path === q) ?? lib.pages.find((p) => p.path.endsWith(`/${q}`) || p.title.toLowerCase() === q);
      if (!hit) return fail(`Unknown page "${page}". Pages: ${lib.pages.map((p) => p.path).join(', ')}`);
      const file = `${hit.path.replace('/', '__')}.${view === 'desktop' ? 'desktop' : 'mobile'}.jpg`;
      if (!lib.screenshots.includes(file)) return text(`No screenshot available for ${hit.path} yet. Live page: ${pageUrl(hit.path)}`);
      const res = await fetch(`${SITE}/shots/${file}`);
      if (!res.ok) return fail(`Screenshot fetch failed (${res.status}). Live page: ${pageUrl(hit.path)}`);
      return { content: [
        { type: 'text', text: `${hit.title} — ${view} — ${pageUrl(hit.path)}` },
        { type: 'image', data: base64(new Uint8Array(await res.arrayBuffer())), mimeType: 'image/jpeg' },
      ] };
    },
  },
];

const INSTRUCTIONS = 'NeuralHub design library (copy-in React + Tailwind v4). Call get_guidelines first, then search / get_component to find and copy components, get_screenshot to see them. Never use raw hex or arbitrary values — use the tokens.';

// JSON-RPC handler shared by both transports. Returns null for notifications.
export async function handle(msg) {
  const { id, method, params } = msg;
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  const err = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  if (id === undefined) return null;
  switch (method) {
    case 'initialize':
      return ok({ protocolVersion: params?.protocolVersion ?? '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'neuralhub-ui', version: VERSION }, instructions: INSTRUCTIONS });
    case 'ping': return ok({});
    case 'tools/list': return ok({ tools: tools.map(({ run, ...t }) => t) });
    case 'tools/call': {
      const tool = tools.find((t) => t.name === params?.name);
      if (!tool) return err(-32602, `Unknown tool ${params?.name}`);
      try { return ok(await tool.run(params.arguments ?? {})); } catch (e) { return ok(fail(String(e?.message ?? e))); }
    }
    default: return err(-32601, `Method not found: ${method}`);
  }
}

// ── Remote HTTP (Cloudflare Worker): stateless Streamable HTTP, JSON replies ──
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS' };
export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method === 'POST') {
      let body;
      try { body = await req.json(); } catch { return Response.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400, headers: cors }); }
      const batch = Array.isArray(body);
      const out = (await Promise.all((batch ? body : [body]).map(handle))).filter(Boolean);
      if (!out.length) return new Response(null, { status: 202, headers: cors });
      return Response.json(batch ? out : out[0], { headers: cors });
    }
    if (req.method === 'GET' && new URL(req.url).pathname === '/mcp') return new Response('SSE not supported; use POST.', { status: 405, headers: cors });
    return new Response(`NeuralHub design library MCP.\nEndpoint: POST ${new URL(req.url).origin}/mcp\nDocs: https://github.com/LePro10/designlibary-neuralhub/blob/main/docs/mcp.md\n`, { headers: cors });
  },
};

// ── stdio (Node): newline-delimited JSON-RPC ──
if (globalThis.process?.versions?.node && process.stdin && !globalThis.WebSocketPair) {
  const { createInterface } = await import('node:readline');
  createInterface({ input: process.stdin }).on('line', async (line) => {
    if (!line.trim()) return;
    try { const r = await handle(JSON.parse(line)); if (r) process.stdout.write(JSON.stringify(r) + '\n'); }
    catch (e) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: String(e) } }) + '\n'); }
  });
}
