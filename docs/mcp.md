# NeuralHub Design Library als MCP

Ein MCP-Server, mit dem Claude Code (oder jeder andere MCP-Client) die Library
**durchsuchen, den Quellcode holen und Screenshots ansehen** kann. Kein API-Key,
kein Login — die Library ist öffentlich.

Der Server liest nur die öffentliche Showcase (`https://ui.neuralhub.dev/library.json`
und `/shots/*.jpg`) und ist damit immer auf dem Stand des Deployments.

## Tools

| Tool | Zweck |
| --- | --- |
| `get_guidelines` | **Zuerst aufrufen.** Design-Vertrag (AGENTS.md); optional `topic`: `foundations`, `mobile`, `motion`, `prinzipien` |
| `search` | Stichwortsuche über Komponenten, Hooks, Tokens und Showcase-Seiten |
| `list_components` | Alle Dateien nach Ordner + alle Showcase-Seiten |
| `get_component` | Quellcode per Name/Pfad; `with_dependencies: true` liefert alles, was kopiert werden muss, inkl. npm-Pakete |
| `get_file` | Beliebige Library-Datei, z. B. `ui/styles/index.css` (Tokens) |
| `get_screenshot` | Bild einer Showcase-Seite, `view`: `mobile` (390px) oder `desktop` (1280px) |

## Einbinden

### A) Lokal per stdio (funktioniert sofort, Node ≥ 18)

```bash
curl -o ~/neuralhub-mcp.mjs https://ui.neuralhub.dev/mcp.mjs
claude mcp add neuralhub-ui -- node ~/neuralhub-mcp.mjs
```

Für ein Team ins Projekt (`.mcp.json` im Repo-Root):

```json
{
  "mcpServers": {
    "neuralhub-ui": { "command": "node", "args": ["neuralhub-mcp.mjs"] }
  }
}
```

Cursor, Windsurf, Claude Desktop & Co.: derselbe `command`/`args`-Eintrag in
deren MCP-Konfiguration.

### B) Remote per HTTP (kein Download, eine URL für alle)

```bash
claude mcp add --transport http neuralhub-ui https://mcp.neuralhub.dev/mcp
```

```json
{ "mcpServers": { "neuralhub-ui": { "type": "http", "url": "https://mcp.neuralhub.dev/mcp" } } }
```

Der Endpoint ist ein Cloudflare Worker (`mcp/server.mjs`, gleiche Datei wie bei A).
Einmalig einrichten:

1. `cd mcp && npx wrangler login && npx wrangler deploy` → ergibt `https://neuralhub-ui-mcp.<account>.workers.dev/mcp`
2. Im Cloudflare-Dashboard unter *Workers → neuralhub-ui-mcp → Settings → Domains & Routes* die Custom Domain `mcp.neuralhub.dev` hinzufügen.
3. Optional Auto-Deploy: Repo-Secrets `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID` setzen, dann deployt `.github/workflows/mcp.yml` bei Änderungen in `mcp/`.

## Testen

```bash
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node mcp/server.mjs
# gegen einen lokalen Build:  NEURALHUB_URL=http://localhost:8123 node mcp/server.mjs
```

## Wie die Daten entstehen

`pnpm build` → `pnpm shots` (Playwright, 2 Ansichten pro Seite) → `pnpm bundle`
schreibt `dist/library.json` und `dist/mcp.mjs`. Das passiert im Pages-Workflow
automatisch bei jedem Push auf `main`.
