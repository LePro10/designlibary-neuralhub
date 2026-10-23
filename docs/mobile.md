# Layout und Mobile

## Ein Umbruch: 900px

- Darunter:
  - Tab-Leiste (vier feste Ziele plus „More“)
  - Sheets von unten
  - Menüs als Sheet
  - Aktionen oben rechts in Daumenreichweite
  - Long-Press für Kontextmenüs
- Darüber:
  - Rail-Sidebar, die über dem Inhalt aufklappt
  - Dialoge mittig
  - Popover-Menüs
  - Rechtsklick
  - ⌘K und ⌘1–9

**Neu gegenüber dem Dashboard:** Der Modus kommt aus der Breite der `AppShell`
selbst, nicht aus dem Viewport. Ein Handy-Layout in einem schmalen Bereich oder
in einer Vorschau verhält sich dadurch wie ein Handy. Innerhalb von Seiten
gelten Container-Queries (`@min-[700px]:`).

## Ein Besitzer pro Abstand

| Ebene | besitzt | besitzt nicht |
|---|---|---|
| `AppShell` | volle Höhe, Navigation, `--tabbar-space` | Inhaltsabstände |
| `Page` | Safe-Area + 44px oben, 16/32px seitlich, Maximalbreite, unten Tab-Leiste + 24px | — |
| Inhalt | nur sich selbst | Abstand zum Rand, Höhe der Tab-Leiste |

Verboten:

- negative Ränder, die fremde Polsterung ausgleichen
- `calc(100vh − …)`
- geschätzte `pb-[88px]`
- `vh` statt `dvh`
- `env()` in Komponenten

Woher die Regel kommt: Am 23.08. polsterten zwei Ebenen gleichzeitig. Auf dem
Handy lagen die letzten 72px jeder Seite unerreichbar unter der Tab-Leiste. Ein
Typecheck findet so etwas nicht.

## Touch

- Alles Tippbare ist mindestens 44×44. Kleine Optik vergrößert die Trefferfläche per Pseudo-Element.
- Felder haben 16px Text auf dem Handy, damit der Browser nicht zoomt. Höhe: 48px auf dem Handy, 44px auf dem Desktop.
- Hover-Zustände gibt es nur bei feinem Zeiger (`.hoverable`).
- Kein `<select>`, auch nicht in Sheets.

## Gesten

- Wischen startet überall, nur nicht in den 24px am Rand (dort liegt die Android-Zurück-Geste).
- Nach 10px wird die Achse gesperrt: Vertikal gewinnt das Scrollen, horizontal der Pager bzw. die Swipe-Zeile.
- Eigene horizontale Drags (Rails, Slider, Swipe-Zeilen, Scrub-Charts) setzen `data-no-swipe`.
- Long-Press löst nie zusätzlich den Tap aus.

## Tastatur

Geht die Bildschirmtastatur auf (der Visual Viewport schrumpft um mehr als 20 %):

- Die Tab-Leiste gleitet weg.
- Sheets füllen genau den sichtbaren Bereich.
- Der Composer verliert den Abstand zur Tab-Leiste.

`useKeyboardOpen()` meldet das.

## Überlagerungen

- `useLayer`: Escape schließt nur die oberste Überlagerung, die Zurück-Geste ebenfalls.
- `useFocusTrap`: Tab bleibt im Fenster, beim Schließen kehrt der Fokus zum Auslöser zurück.
- Portal über `usePortalTarget()`.
- Das Dokument scrollt nie, nur die `.scroller`. Deshalb braucht es keinen Body-Scroll-Lock.

## Prüfen

Statische Checks sehen kein Layout. Jede Änderung braucht diese Prüfung:

1. Bei 390px und auf dem Desktop ansehen.
2. Bis ans Ende scrollen: Nichts darf unter der Tab-Leiste liegen.
3. Jede Überlagerung per Tastatur öffnen und mit Tab, Escape und Zurück bedienen.
