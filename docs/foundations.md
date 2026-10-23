# Foundations

Quelle der Wahrheit ist `ui/styles/tokens.css`; die JS-Seite liegt in
`ui/lib/tokens.ts`. Tailwind v4 erzeugt aus den Tokens Klassen:
`bg-card`, `text-body`, `rounded-field`, `shadow-float`, `ease-out-soft`.

## Farbe

| Gruppe | Tokens | Verwendung |
|---|---|---|
| Grund und Flächen | `bg` `chrome` `raised` `sheet` `card` `popover` `card-2` `card-3` | gestuft, dunkelste zuerst |
| Füllungen | `fill-1` 3 % · `fill-2` 5 % · `fill-3` 8 % · `fill-4` 12 % | Feld in Ruhe · Hover · Icon-Knopf · Switch aus |
| Haarlinien | `line` 7 % · `line-2` 12 % | Trennlinien, Ränder |
| Schrift | `bright` `ink` `dim` `faint` | Titel · Text · sekundär · Hinweis |
| Glow | `ice` `azure` `lilac` `sand` `ember` `mint` | als Licht, nie als Fläche über 15 % |
| Status | `live` `danger` `warning` | live · zerstörerisch · Vorsicht |
| Akzent | `accent` `accent-deep` | folgt dem Theme (`data-accent`) |
| Daten | `series-1…4` | Diagramm-Reihen |

**Feste Bedeutungen:**

- ember = Badge, „jetzt“, über dem Limit
- mint = Erfolg
- live = gerade live
- danger = zerstörerisch

Alles, was „der Akzent der App“ meint, nimmt `accent`.

## Schrift

- DM Sans Variable und IBM Plex Mono (400/500).
- Die Skala hat 15 Stufen: `micro 9.5` · `tiny 10.5` · `meta 12` · `detail 12.5` · `small 13` · `chip 13.5` · `button 14.5` · `body 15` · `input 16` · `lead 17` · `title 20` · `headline 26` · `display 32` · `display-lg 52` · `hero 64`.
- Für Titel gibt es die Klasse `.display` (300, −0.045em, Zeilenhöhe 1.02).
- Labels nehmen `.eyebrow` (Mono, 9.5px, .18em, Großbuchstaben).
- Zahlen, die sich ändern, bekommen `.tabular`.

## Form

- Radien sind nach Rolle benannt: `chip 8` · `tile 10` · `field 14` · `stat 18` · `list 22` · `card 24` · `dialog 28` · `sheet 30` · `full`.
- Verschachtelte Ecken: innerer Radius = äußerer Radius − Abstand.
- Schatten: `rim` (innere Oberkante) · `float` · `fab` · `sheet` · `dialog` · `glow` (Akzent).
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
  - Primär-Glow
- **Glas:** `data-glass="subtle | default | strong | clear"`.
- Beides geht auf `<html>` oder auf jedem Teilbaum. Zur Laufzeit: `setTheme({ accent, glass })`.
- Ein helles Theme gibt es bewusst nicht. Die Tiefe des Systems entsteht aus Licht auf Dunkel.

## Z-Ebenen

Kopf 30 · Sidebar 40 · Tab-Leiste 50 · Sheet 80/81 · Kontextmenü 85 · Suche 88 ·
Grain 90 · Toast 95 · Popover 120 · Intro 200. Erfinde keine weiteren.
