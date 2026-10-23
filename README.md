# NeuralHub Design

**Quiet dark. Light as content.** · v3: Tiefe aus Licht statt Linien, kontinuierliche Ecken, Navigation aus einer Liste von Orten.

Die Designsprache von NeuralHub als wiederverwendbare Bibliothek: Tokens,
Effekte, Animationen, Mobile-Regeln und React-Komponenten. Aus dem Dashboard
extrahiert, vereinheitlicht und um Varianten, Themes und eine AI-&-Chat-Familie
erweitert.

**Showcase:** https://ui.neuralhub.dev/. Jede Komponente
ist dort live, mit Reglern, Handy- und Desktop-Vorschau und kopierbarem Code.

---

## Wofür

Für jedes künftige React-Projekt. Gib Claude den Link zu diesem Repo und sag,
was du bauen willst. [`AGENTS.md`](AGENTS.md) enthält alles, was eine KI dafür
braucht:

- Setup
- harte Regeln
- welche Komponente für welchen Zweck
- Checkliste
- Prüfung

Beispiel-Prompt:

```
Nutze die Design-Library https://github.com/LePro10/designlibary-neuralhub für dieses Projekt.
Lies zuerst ihre AGENTS.md und halte dich daran. Bau: <dein Screen / deine App>.
```

## Aufbau

| Ordner | Inhalt |
|---|---|
| `ui/styles/` | `tokens.css` (Farben, Signalfarben pro Ort, Schrift, Radien, Haarlinien, Schatten, Easing, Themes) · `base.css` · `effects.css` (card, glass, rim, shimmer, orb, light border, Logo-Loader …) |
| `ui/lib/` | Motion-Vokabular (`SPRING`), Haptik, Overlay-Stapel (`useLayer`), Fokusfalle, `Surface` (Handy/Desktop nach eigener Breite), Hooks, JS-Tokens |
| `ui/components/core/` | Button, IconButton, Segmented, Switch, Check, Slider, Chips, Pill, Field, List/Row, States, Stat, Avatar |
| `ui/components/layout/` | AppShell, Page, Liquid-Glass-TabBar, Sidebar |
| `ui/components/overlays/` | Sheet, Menu, ContextMenu, Toast, SwipeRow, Stack, CommandPalette |
| `ui/components/effects/` | Ambient-Licht als SVG, RevealText, LogoLoader, Shimmer, Logo, Light Border, Spotlight, Orbs, Glass, Magnetic, Odometer … |
| `ui/components/data/` | Ring, Meter, BarChart, Sparkline/LineChart, Heatmap, Donut |
| `ui/components/ai/` | Composer, Nachrichten, Streaming, Agent-Trace, Tool-Karten, Quellen, Voice … |
| `site/` | Showcase (nutzt die Library selbst) |
| `docs/` | Prinzipien und Begründungen (Deutsch) |
| `registry.json` | Pro Datei: Exporte, benötigte Dateien und npm-Pakete (generiert) |

## Lokal

```bash
pnpm install
pnpm dev          # Showcase auf http://localhost:5173
pnpm build        # Typecheck + Build nach dist/
pnpm registry     # registry.json neu erzeugen
```

## In ein Projekt übernehmen

```bash
pnpm add motion lucide-react @fontsource-variable/dm-sans @fontsource/ibm-plex-mono
pnpm add -D tailwindcss @tailwindcss/vite
cp -r designlibary-neuralhub/ui ./src/ui
```

```css
@import "tailwindcss";
@import "./ui/styles/index.css";
```

Details stehen in [`AGENTS.md`](AGENTS.md) § 2.

## GitHub Pages

Der Workflow `.github/workflows/pages.yml` baut den Showcase bei jedem Push.
Veröffentlicht wird vom Default-Branch. Einmalig nötig:
**Settings → Pages → Source: „GitHub Actions“**.
