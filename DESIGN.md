# Design

Beschreibt das gebaute System, nicht die Absicht. Wer etwas ergänzt, hält
sich daran, sonst fällt die neue Stelle sofort auf.

## Haltung

Die Seite verkauft ein Produkt, dessen Oberfläche selbst schon Farbe und Form
hat. Also legt die Seite nichts Eigenes darüber. Viel Weißraum, eine Schrift,
eine Akzentfarbe, Linien statt Kästen. Was auffallen soll, sind die
Bildschirmfotos aus der App.

Konkret heißt das: keine Icon-Kachel-Raster, keine Verläufe, keine
Glaseffekte, keine farbigen Ränder an Karten, keine kleinen
Großbuchstabenzeilen über Überschriften.

## Farben

Definiert als CSS-Variablen auf `:root` in `css/style.css`. Hell ist der
Ausgangszustand, weil Fahrlehrer bei Tageslicht arbeiten und die App selbst
hell ist. Dunkel folgt der Systemeinstellung und lässt sich umschalten; die
Wahl liegt unter `allindrive-farbschema` im lokalen Speicher.

| Rolle | Hell | Dunkel |
|---|---|---|
| Grund | `#ffffff` | `#100e0b` |
| Ruhiger Grund (Bänder) | `#fbf9f6` | `#17140f` |
| Text | `#16130e` | `#f7f3ec` |
| Text, zweite Ebene | `#4e4840` | `#c4bcae` |
| Text, zurückgenommen | `#857e73` | `#8d8578` |
| Linie | `#e9e5de` | `#262220` |
| Akzent (Fläche) | `#ff9300` | `#ff9300` |
| Akzent (Text) | `#96520a` | `#ffab3d` |

Das Orange `#ff9300` ist die Marken- und Aktionsfarbe der App. Auf der Seite
trägt es ausschließlich die Hauptaktion, die Häkchen und kleine Markierungen.
**Als Textfarbe wird es nie direkt verwendet**: auf Weiß erreicht es den
Kontrastwert nicht. Dafür gibt es `--accent-ink`.

Bänder wechseln zwischen Grund und ruhigem Grund. Es gibt keinen Abschnitt,
der ins jeweils andere Farbschema kippt.

## Schrift

Karla, eine variable Datei von 24 KB, lokal unter `fonts/karla.woff2`. Für
Überschriften und Fließtext dieselbe Schrift: Überschriften trennen sich über
Größe, Gewicht 700 und negative Laufweite deutlich genug ab. Eine zweite
Schrift wäre hier Dekoration.

| Ebene | Größe | Gewicht | Laufweite |
|---|---|---|---|
| h1 | `clamp(2rem, 4.4vw, 3.5rem)` | 700 | `-0.038em` |
| h2 | `clamp(1.7rem, 3.4vw, 2.55rem)` | 700 | `-0.032em` |
| h3 | `1.125rem` | 700 | `-0.018em` |
| Fließtext | `1.0625rem`, Zeilenhöhe 1.7 | 400 | normal |
| Vorspann (`.lede`) | `clamp(1.0625rem, 1.5vw, 1.2rem)` | 400 | normal |

Überschriften haben `hyphens: auto`. Das ist im Deutschen keine Feinheit,
sondern Voraussetzung: „Fahrschulverwaltungssoftware" ist breiter als ein
Handybildschirm und schiebt ohne Trennung die ganze Seite zur Seite.

Fließtext läuft auf höchstens 68 Zeichen, Vorspann auf 58.

## Maße

Ein Radiensystem, überall durchgehalten: `8px` für Bedienelemente und
Eingabefelder, `12px` für Hinweisflächen, `18px` für Bildrahmen, `999px` für
Pillen. Gemischte Radien fallen sofort auf.

Innenbreite 1120 px, für Abschnitte mit großen Bildern 1320 px, für Fließtext
720 px. Seitenrand `clamp(20px, 5vw, 48px)`.

Bandabstand `clamp(72px, 9vw, 132px)`. Über einer Überschrift steht immer mehr
Luft als darunter.

## Bausteine

- `.schirm` — Rahmen um ein Bildschirmfoto: eine feine Linie, ein weicher
  Schatten, `18px` Radius. Kein Browserfenster-Dekor, keine Perspektive.
- `.zug` / `.zug--gedreht` — Text neben Bild, Seiten wechselnd. **Höchstens
  zwei hintereinander**, danach muss eine andere Familie kommen.
- `.liste` / `.liste--zwei` — Aufzählung über Linien, nicht über Kacheln.
- `.haken` — Merkmalsliste mit Häkchen im Akzentton.
- `.fragen` — `<details>`-Block, Zeichen dreht sich beim Öffnen um 45 Grad.
- `.pille` — kleiner Zustandshinweis, gefüllt statt umrandet.
- `.offen` — gelb markierte Stelle, an der noch eine echte Angabe fehlt.
  Bewusst auffällig, damit sie niemand versehentlich veröffentlicht.

## Bewegung

Kurz, `ease-out`, und nur wo sie etwas erklärt.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
```

- Abschnitte fahren beim Erreichen einmal auf: 14 px anheben und aufblenden,
  620 ms, Geschwister um 55 ms versetzt. Einmalig, nicht beim Zurückscrollen.
- Knöpfe gehen beim Drücken auf `scale(0.97)` in 160 ms. Ohne diese Rückmeldung
  wirkt ein Knopf tot.
- Pfeillinks vergrößern beim Überfahren den Abstand zum Pfeil von 7 auf 11 px.
- Die Kopfzeile bekommt ihre Trennlinie erst, wenn wirklich gescrollt wurde.
- Die Fahrbahn im Logo läuft dauerhaft. Sie ist die einzige Endlosbewegung
  und gehört der Marke. Beim Scrollen läuft sie kurz schneller.

Alle Bewegung hängt hinter `@media (prefers-reduced-motion: reduce)` und hinter
der Klasse `js` am `<html>`. Ohne JavaScript ist alles sofort sichtbar.

**Hover-Effekte stehen in `@media (hover: hover) and (pointer: fine)`.** Sonst
bleibt auf Touchgeräten nach jeder Berührung der Hover-Zustand kleben.

## Die Bildmarke

Aus `images/logo.png` in Vektoren nachgezeichnet, nicht neu gezeichnet: das A
dunkel, das D im Akzentton, dazwischen die Fahrbahn mit vier Strichen. Die
Striche stehen in Ruhe exakt an den Stellen der Vorlage und laufen in der
Bewegung dieselbe Fahrbahn entlang, dabei drehen sie mit der Kurve und werden
größer, wie es die Perspektive der Vorlage vorgibt.

Sie liegt als `<symbol id="ad">` inline in jeder Seite, nicht als externe
Datei. Grund: Bei einem externen `<use>` erreicht das Stylesheet die Striche
nicht mehr, und die Fahrbahn stünde still.

**Fallstrick, der schon einmal zugeschlagen hat:** Ein Selektor wie
`.ad--faehrt .ad__dash` greift nicht. Die Kopien im Schattenbaum des `<use>`
sind für Dokument-Selektoren unerreichbar; wirksam ist nur der errechnete Stil
der Originale im `<symbol>`. Deshalb steht kein Vorfahre vor `.ad__dash`, und
deshalb setzt `js/main.js` das Tempo `--ad-speed` auf dem Wurzelelement.

## Bildschirmfotos

Die vier Aufnahmen unter `images/app/` stammen aus der laufenden App. Vor der
Aufnahme wurden alle Personennamen im Browser durch erfundene ersetzt; es sind
keine Daten realer Fahrschüler abgebildet. Ebenfalls entfernt: das Profilfoto
und alles zur Abrechnung, weil dieser Bereich auf der Website nicht beworben
wird.

Von jeder Aufnahme gibt es einen Zuschnitt `*-mobil.webp`. Eine
Desktop-Aufnahme auf 375 px geschrumpft ist unlesbar; der Zuschnitt zeigt
stattdessen den Bereich, auf den es ankommt. Ausgeliefert wird über
`<picture>` mit `media="(max-width: 700px)"`.

Jeder Bildtext sagt, dass die Namen erfunden und die Oberfläche echt ist.

## Barrierefreiheit

Verbindlich, weil ein erheblicher Teil der Zielgruppe über 50 ist und das
Produkt bei Sonnenlicht bedient:

- Fließtext mindestens 4,5:1 Kontrast, große Schrift mindestens 3:1.
- Tippziele mindestens 44 px, Knöpfe 48 px hoch.
- Sichtbarer Fokusring, 2 px im dunklen Akzentton, 3 px Abstand.
- Sprungmarke „Zum Inhalt springen" als erstes Element im `<body>`.
- Jedes Piktogramm `aria-hidden`, jeder Knopf ohne Beschriftung mit
  `aria-label`.
- Genau ein `<h1>` je Seite, Überschriften ohne Sprünge in der Ebene.
- Keine Seite läuft bei 375 px horizontal über.
