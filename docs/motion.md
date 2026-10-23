# Bewegung und Performance

## Federn (`ui/lib/motion.ts`)

| Name | stiffness/damping | wofür |
|---|---|---|
| `snap` | 520/44 | Indikatoren, die einer Wahl folgen (Segment, Linse, aktive Zeile) |
| `toggle` | 700/30 | kleine, schnelle Teile (Switch-Daumen) |
| `sheet` | 420/42 | Panels, Sheets, Aufklapper, Stapel, ohne Überschwingen |
| `pop` | 420/32 | Dinge, die mit etwas Leben erscheinen (Bubbles, Karten, Menüs) |
| `soft` | 300/30 | gestaffelte Listen und Kacheln |
| `grow` | 220/26 | Daten (Balken, Ringe), langsamer, damit das Auge folgt |
| `bouncy` | 260/22 | ein Hero-Auftritt pro Screen |

Das Dashboard hatte 14 handgetippte Paare. Sie lassen sich alle auf diese
sieben abbilden.

## Grammatik

- **Erscheinen:** 4 bis 8 px aufsteigen und einblenden (0,3 bis 0,6 s, ease-out-soft), oder als Feder aus dem Auslöser heraus.
- **Verschwinden:** 120 bis 160 ms, ohne Überschwingen.
- **Listen:** 18 bis 30 ms Versatz, höchstens acht Einträge gestaffelt.
- **Titel:** steigen einmal aus einer Maske (`RevealText`, Page macht das selbst).
- **Zahlen:** rollen Ziffer für Ziffer (`Odometer`).
- **„Arbeitet“:** das Logo selbst (`LogoLoader`) statt eines leuchtenden Orbs.
- **Reduzierte Bewegung:** `AppShell` setzt `MotionConfig reducedMotion="user"`.

## Easings

- `ease-out-soft` (Standard für alles, was ankommt)
- `ease-in-out-draw` (Striche zeichnen, Vorhang)
- `ease-pf` (große Seitenbewegungen)
- `ease-bounce-land` (Hüpfen, Fallen)

## Regeln

1. Schleifen animieren nur `transform` und `opacity`.
2. Blur nie auf einem bewegten Element. Statt dessen wird eine statische Innenebene geblurt.
3. Deko-Schleifen bekommen `.deko`. Sie pausieren in diesen Fällen:
   - im Ruhemodus (`html.rest`)
   - auf verdeckten Seiten (`[inert]`)
   - bei „weniger Bewegung“
4. JS-Animationen fragen `prefersReducedMotion()` und springen ans Ende. Die CSS-Regel erreicht Federn nicht.
5. Übergänge, die nicht ruckeln dürfen, während React rendert (Sheet, Stapel), laufen auf dem Compositor: `springPoints()` → Web Animations mit linearem Easing.
6. Canvas und WebGL:
   - laufen im Leerlauf mit 30 fps
   - halten außerhalb des Bildes an (IntersectionObserver)
   - halten in Hintergrund-Tabs an
   - teilen sich einen gemeinsamen WebGL-Kontext
7. Unsichtbare Backdrop-Blurs kosten trotzdem jeden Frame. Deshalb werden sie nur eingehängt, solange sie sichtbar sind.
8. Streaming-Text blendet Wörter über die Farbe ein, nicht über Blur. Ein Blur macht jedes Wort zu einer eigenen Ebene, das kostete auf dem Handy etwa ⅔ des Streamings.
9. Scrollen rendert nie React. Motion-Values steuern die Ansicht, nur ein Boolean („gescrollt“) geht in den State.

## Gemessen

Am Dashboard (Handy-Viewport, 4× CPU-Drosselung):

- Driftender Mesh-Verlauf: etwa ½ der GPU-Last einer ruhenden Seite. Heute ist er ein statisches SVG.
- 32px-Orb im Composer unter einem Glas-Blur: etwa ⅔ der Leerlauf-GPU. Er ruht jetzt und dreht sich nur bei Hover.
- Sheet-Federn in JS: Sie ruckelten, wenn Daten ankamen. Jetzt laufen sie auf dem Compositor.
