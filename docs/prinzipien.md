# Prinzipien

Warum NeuralHub so aussieht und sich so anfühlt. Wer etwas Neues baut, prüft es
gegen diese Liste. Nicht, ob es „schön“ ist, sondern ob es *dazu gehört*.

## 1. Ruhiges Dunkel, leicht gezeichnet

- Der Grund ist fast schwarz (`#080909`), nicht reines Schwarz. Auf OLED schmiert so nichts, und Schatten haben noch Platz nach unten.
- Die Grautöne sind leicht grün (`ink #c6c9c6`, `dim #7d847f`). Man sieht es kaum, aber es fühlt sich nach Material an statt nach Default.
- Tiefe kommt aus Licht, nicht aus Linien: Flächen haben eine oben beleuchtete Kante, Felder sind Mulden, der eine Hauptknopf ist eine helle Perle. Rahmen um Kästen sehen aus wie ein Drahtmodell.
- Ecken sind kontinuierlich und konzentrisch. Haarlinien (0,5px auf Retina) gibt es nur zwischen zwei Dingen, etwa als Listentrenner.
- Die Schrift ist klein und leicht: Fließtext 14,5px, „medium“ ist Gewicht 460, fett gibt es nicht. Hierarchie entsteht durch Helligkeit und Abstand.

## 2. Eine Farbe pro Ort

Jeder Ort (Tab) hat seine Signalfarbe, zum Beispiel Plan Amber, Files Teal und Screen Koralle. Sie erscheint an genau drei Stellen:

- im Licht oben auf der Seite
- in der einen Hauptzahl
- im aktiven Tab

Nie als Fläche, nie als Verlaufstext, nie als leuchtender Knopf. So weiß man immer, wo man ist, ohne dass etwas schreit.

Das Licht kommt immer von oben links: Glasränder, Glanz, Avatare und die Linse
der Tab-Leiste folgen derselben Lichtquelle.

## 3. Minimale, perfekte Bewegung

- Alles, was ein Finger berührt, ist eine Feder: unterbrechbar, die Geschwindigkeit bleibt erhalten.
- Sieben benannte Federn statt beliebiger Zahlen (`SPRING.snap … bouncy`).
- Kurz und ohne Nachwackeln. Was erscheint, steigt 4 bis 8 px auf, was geht, ist in 120 bis 160 ms weg. Listen kommen 18 bis 30 ms versetzt.
- Jede Wahl gibt Haptik (`select`), jede Raststufe ein `tick`.
- Heroes bekommen einen einzigen orchestrierten Moment: einen Titel, der aus einer Maske steigt, oder eine rollende Zahl. Alles andere bleibt ruhig.

## 4. Handy zuerst, Desktop gleichwertig

- Handy:
  - Daumenreichweite
  - Menüs klappen direkt am Knopf auf, Auswahl öffnet sich inline in der Zeile
  - Vollbild-Panels nur für lange Aufgaben
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
- Das Licht ist ein SVG mit etwa 1 KB, ohne WebGL und ohne Korn.
- Canvas läuft im Leerlauf mit 30 fps und hält außerhalb des Bildes an.

Gemessen am Dashboard: Ein langsam driftender Verlauf kostete die halbe
GPU-Last einer ruhenden Seite. Heute ist er ein SVG und kostet praktisch nichts.

## 7. Navigation führt ans Ziel

- Jeder Tap auf eine Meldung oder ein Widget führt zum konkreten Eintrag, nicht nur in den Tab.
- Neuer Inhalt beginnt oben. „Zurück“ stellt die alte Scrollposition wieder her.
- Die Zurück-Geste schließt zuerst die oberste Überlagerung und erst dann eine Ebene, nie einen Tab.
- Getipptes geht nie verloren.
