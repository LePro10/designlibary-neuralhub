# Hosting auf Cloudflare (Showcase + /mcp)

Einmalig, ca. 10 Minuten. Alles kostenlos.

1. **Cloudflare-Account** anlegen → *Add a domain* → `neuralhub.dev` (Free Plan).
   Cloudflare importiert die vorhandenen DNS-Einträge und zeigt zwei Nameserver.
2. **name.com** → Domain `neuralhub.dev` → *Nameservers* → die beiden Cloudflare-Nameserver eintragen
   (die alten ersetzen). Danach den alten CNAME `ui → lepro10.github.io` bei Cloudflare **löschen**
   (Cloudflare legt `ui.neuralhub.dev` beim Deploy selbst an). Andere Einträge der Domain
   (Mail, www, …) unverändert lassen. Warten, bis Cloudflare "Active" zeigt.
3. **GitHub** → Settings → Pages → Custom domain leeren / Pages deaktivieren.
4. **API-Token**: Cloudflare → My Profile → API Tokens → *Create Token* → Vorlage
   *Edit Cloudflare Workers*. Dazu die **Account ID** (Workers & Pages, rechte Spalte).
5. **GitHub** → Settings → Secrets and variables → Actions → neue Secrets
   `CLOUDFLARE_API_TOKEN` und `CLOUDFLARE_ACCOUNT_ID`.
6. Branch nach `main` mergen → der Workflow baut und deployt. Danach:
   `https://ui.neuralhub.dev/` (Showcase) und `https://ui.neuralhub.dev/mcp` (MCP).
