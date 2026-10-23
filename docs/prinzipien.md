# Prinzipien

Warum NeuralHub so aussieht und sich so anfühlt. Wer etwas Neues baut, prüft es
gegen diese Liste. Nicht, ob es „schön“ ist, sondern ob es *dazu gehört*.

## 1. Ruhiges Dunkel

- Der Grund ist fast schwarz (`#080909`), nicht reines Schwarz. Auf OLED schmiert so nichts, und Schatten haben noch Platz nach unten.
- Die Grautöne sind leicht grün (`ink #c6c9c6`, `dim #7d847f`). Man sieht es kaum, aber es fühlt sich nach Material an statt nach Default.
- Flächen sind gestuft (`bg → card → card-2 → card-3`). Innen gibt es nur vier Weißstufen (`fill-1…4`) und zwei Haarlinien.
- Titel sind leicht (DM Sans 300) und eng gesetzt. Hierarchie entsteht durch Größe und Helligkeit, nie durch Fettdruck.

## 2. Licht ist Inhalt

Farbe tritt als **Licht** auf, nicht als Anstrich:

- Glow-Palette: ice, azure, lilac, sand, ember, mint
- Mesh-Licht hinter dem Seitenkopf
- der Lichtrand um die „Now“-Karte
- der Schein des Primärknopfs
- der Orb

**Ein Leuchten pro Screen.** Wenn zwei Dinge leuchten, leuchtet keins.

Das Licht kommt immer von oben links: Glasränder, Glanz, Avatare und die Linse
der Tab-Leiste folgen derselben Lichtquelle.

## 3. Physische Bewegung

- Alles, was ein Finger berührt, ist eine Feder: unterbrechbar, die Geschwindigkeit bleibt erhalten.
- Sieben benannte Federn statt beliebiger Zahlen (`SPRING.snap … bouncy`).
- Jede Wahl gibt Haptik (`select`), jede Raststufe ein `tick`.
- Bewegung erklärt etwas, zum Beispiel woher etwas kommt, wohin es geht oder dass gerade jemand arbeitet. Deko-Bewegung ist die Ausnahme und schläft im Ruhemodus.

## 4. Handy zuerst, Desktop gleichwertig

- Handy:
  - Daumenreichweite
  - Sheets von unten
  - Wischen
  - Long-Press
  - 44px-Ziele
  - 16px in Feldern
- Desktop:
  - Rail-Sidebar
  - Dialoge
  - Popover
  - Hover
  - Tastenkürzel
- **Beide können dasselbe.** Wer eine Funktion an einer Stelle baut, prüft die andere mit.

## 5. Zustände sind Teil des Features

- Laden, leer, Fehler, offline und live werden gestaltet.
- Skeletons haben die Form des Ergebnisses, damit nichts springt.
- Fehler behalten das Getippte und bieten den nächsten Schritt an.
- Keine Erfolgsmeldung ohne bestätigte Wirkung.
- Keine erfundenen Platzhalterzahlen.

## 6. Schnell in Ruhe

Schönheit, die den Akku leert, ist keine. Deshalb:

- Schleifen bewegen nur `transform` und `opacity`.
- Blur sitzt nie auf etwas, das sich bewegt.
- Mesh-Licht wird einmal gerendert.
- Canvas läuft im Leerlauf mit 30 fps und hält außerhalb des Bildes an.

Gemessen am Dashboard: Ein langsam driftender Verlauf kostete die halbe
GPU-Last einer ruhenden Seite. Jetzt steht er still, und niemand vermisst die
Bewegung.

## 7. Navigation führt ans Ziel

- Jeder Tap auf eine Meldung oder ein Widget führt zum konkreten Eintrag, nicht nur in den Tab.
- Neuer Inhalt beginnt oben. „Zurück“ stellt die alte Scrollposition wieder her.
- Die Zurück-Geste schließt zuerst die oberste Überlagerung und erst dann eine Ebene, nie einen Tab.
- Getipptes geht nie verloren.
