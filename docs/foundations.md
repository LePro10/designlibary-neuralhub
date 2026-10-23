# Foundations

Quelle der Wahrheit ist `ui/styles/tokens.css`; die JS-Seite liegt in
`ui/lib/tokens.ts`. Tailwind v4 erzeugt aus den Tokens Klassen:
`bg-card`, `text-body`, `rounded-field`, `shadow-float`, `ease-out-soft`.

## Farbe

| Gruppe | Tokens | Verwendung |
|---|---|---|
| Grund und Flächen | `bg` `chrome` `raised` `sheet` `card` `popover` `card-2` `card-3` | gestuft, dunkelste zuerst |
| Füllungen | `fill-1` 2,5 % · `fill-2` 4 % · `fill-3` 6,5 % · `fill-4` 10 % | Karte · Hover · Icon-Knopf, Suche · Switch aus |
| Haarlinien | `line` 8 % · `line-2` 13 %, Breite `--hair` (0,5px auf Retina) | Trennlinien, Karten- und Listenkanten |
| Orte | `signal-*` (12 Stück) → `--color-tab` | Farbe des aktuellen Ortes: `text-tab`, `bg-tab` |
| Schrift | `bright` `ink` `dim` `faint` | Titel · Text · sekundär · Hinweis |
| Glow | `ice` `azure` `lilac` `sand` `ember` `mint` | als Licht, nie als Fläche über 15 % |
| Status | `live` `danger` `warning` | live · zerstörerisch · Vorsicht |
| Akzent | `accent` `accent-deep` | folgt dem Theme (`data-accent`) |
| Daten | `series-1…4` | Diagramm-Reihen |

**Orte:** `<Page place="plan">` oder `data-signal="amber"` setzen die Ortsfarbe.
Die Zuordnung für NeuralHub steht in `PLACES` in `ui/lib/tokens.ts`.

**Feste Bedeutungen:**

- ember = Badge, „jetzt“, über dem Limit
- mint = Erfolg
- live = gerade live
- danger = zerstörerisch

Alles, was „der Akzent der App“ meint, nimmt `accent`.

## Schrift

- DM Sans Variable und IBM Plex Mono (400/500).
- Die Skala hat 15 Stufen: `micro 9` · `tiny 10` · `meta 11.5` · `detail 12` · `small 12.5` · `chip 13` · `button 13.5` · `body 14.5` · `input 16` · `lead 16` · `title 18` · `headline 22` · `display 28` · `display-lg 42` · `hero 52`.
- Gewichte: 300 für Titel, 400 für Text, 460 als „medium“. Kein `semibold`, kein `bold`.
- Für Titel gibt es die Klasse `.display` (300, −0.035em).
- Abschnitts-Labels nehmen `.eyebrow` (Mono, 9px, .14em, Großbuchstaben); Feld-Labels sind ruhige Sans-Schrift.
- Zahlen, die sich ändern, bekommen `.tabular`.

## Form

- Radien sind nach Rolle benannt: `chip 6` · `tile 8` · `field 10` · `menu 13` · `stat 14` · `list 16` · `card 18` · `dialog 20` · `sheet 22` · `full`.
- Verschachtelte Ecken: innerer Radius = äußerer Radius − Abstand.
- Schatten haben nur schwebende Dinge: `menu` · `float` · `fab` · `sheet` · `dialog`.
- Drei Flächen-Rezepte:
  - `.card` (liegt)
  - `.glass` (schwebt)
  - `.rim` (ungleichmäßige Glaskante, oben hell)

## Themes

- **Akzent:** `data-accent="ice | mint | ember | lilac | sand | graphite"` färbt diese Teile mit:
  - Akzent und Akzent-tief
  - Fokusring
  - Switch
  - Orb
  - Lichtrand
- **Glas:** `data-glass="subtle | default | strong | clear"`.
- Beides geht auf `<html>` oder auf jedem Teilbaum. Zur Laufzeit: `setTheme({ accent, glass })`.
- Ein helles Theme gibt es bewusst nicht. Die Tiefe des Systems entsteht aus Licht auf Dunkel.

## Z-Ebenen

Kopf 30 · Sidebar 40 · Tab-Leiste 50 · Sheet 80/81 · Kontextmenü 85 · Suche 88 ·
Toast 95 · Popover 120 · Intro 200. Erfinde keine weiteren.
