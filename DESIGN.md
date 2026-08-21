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

Definiert als CSS-Variablen auf `:root` in `css/style.css`. Die Seite ist
durchgehend dunkel, ohne Umschalter. Vorher gab es beides und eine gespeicherte
Wahl; mit dem Umbau auf den nächtlichen Auftakt war ein heller Modus keine
Variante mehr, sondern ein zweites Design.

Die Grundwerte stehen als HSL-Anteile ohne `hsl()` drumherum:

```css
--bg: 0 0% 4%;   --surface: 0 0% 8%;   --text: 0 0% 96%;
--muted: 0 0% 53%;   --stroke: 0 0% 12%;
```

So lässt sich jede davon mit beliebiger Deckkraft weiterverwenden —
`hsl(var(--bg) / 0.82)` für einen Schleier — ohne einen zweiten Wert dafür zu
pflegen. Die fertigen Farben liegen daneben als `--c-bg`, `--c-text` und so
weiter.

| Rolle | Wert |
|---|---|
| Grund | `hsl(0 0% 4%)` |
| Fläche (Karten, Bänder) | `hsl(0 0% 8%)` |
| Text | `hsl(0 0% 96%)` |
| Text, zurückgenommen | `hsl(0 0% 53%)` |
| Linie | `hsl(0 0% 12%)` |
| Akzent | `#ff9300` |
| Akzent, hell | `#ffb04d` |

Das Orange `#ff9300` ist die Marken- und Aktionsfarbe der App. Auf der Seite
trägt es die Hauptaktion, den Ring um die Bildmarke, kleine Markierungen — und
die Laternen im gezeichneten Hintergrund, wo Natriumdampflicht zufällig genau
diesen Ton hat.

`--verlauf` läuft von `#ffb04d` nach `#ff9300`. Ein Ring oder Balken bekommt
dadurch eine Richtung statt nur eine Farbe.

## Schrift

Zwei Schriften, beide lokal unter `fonts/`.

**Inter** trägt alles: Überschriften, Fließtext, Bedienelemente. Die Datei ist
nach Zeichenbereich geteilt (`inter-latin.woff2`, `inter-latin-ext.woff2`), damit
eine deutsche Seite den osteuropäischen Teil gar nicht erst anfragt.

**Instrument Serif kursiv** setzt einzelne Worte in Überschriften ab — „läuft
*auf dem Handy*". Es ist die einzige Stelle, an der eine zweite Schrift
vorkommt, und sie steht nie für einen ganzen Satz. Der Wechsel innerhalb einer
Zeile trägt genau, weil er selten ist.

| Ebene | Größe | Zeilenhöhe | Gewicht | Laufweite |
|---|---|---|---|---|
| h1 | `clamp(2.75rem, 7.5vw, 6rem)` | 0.94 | 500 | `-0.045em` |
| h2 | `clamp(1.9rem, 4.2vw, 3.4rem)` | erbt | 500 | `-0.035em` |
| h3 | `1.25rem` | 1.3 | 500 | `-0.02em` |
| Fließtext | `1rem` | 1.65 | 400 | normal |
| Vorspann (`.lede`) | `clamp(0.9375rem, 1.4vw, 1.0625rem)` | 1.65 | 400 | normal |

Die Zeilenhöhe 0.94 in der h1 ist kein Versehen: Bei dieser Größe fallen zwei
Zeilen sonst auseinander. `max-width: 56ch` auf dem Vorspann hält die
Zeilenlänge lesbar, unabhängig davon, wie breit der Bildschirm wird.

Überschriften haben `hyphens: auto`. Das ist im Deutschen keine Feinheit,
sondern Voraussetzung: „Fahrschulverwaltungssoftware" ist breiter als ein
Handybildschirm und schiebt ohne Trennung die ganze Seite zur Seite.

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

Fünf Kurven für fünf Aufgaben. Eine einzige Kurve für alles lässt jede Bewegung
gleich wirken, egal ob etwas hereinkommt, sich bewegt oder nur die Farbe
wechselt.

```css
--ease-out:    cubic-bezier(0.25, 0.1, 0.25, 1);   /* allgemein */
--ease-stark:  cubic-bezier(0.16, 1, 0.3, 1);      /* Einfahrten, Balken */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* Wege mit Anfang und Ende */
--ease-sanft:  cubic-bezier(0.4, 0, 0.2, 1);       /* Farbe, Deckkraft */
--ease-druck:  cubic-bezier(0.2, 0, 0.13, 1);      /* Tastendruck */
```

- Abschnitte fahren beim Erreichen einmal auf: anheben und aufblenden,
  Geschwister versetzt. Einmalig, nicht beim Zurückscrollen.
- Knöpfe gehen beim Drücken auf `scale(0.97)`. Ohne diese Rückmeldung wirkt ein
  Knopf tot.
- Die Kopfzeile bekommt ihre Trennlinie erst, wenn wirklich gescrollt wurde.
- Die Fahrbahn im Logo läuft dauerhaft und wird beim Scrollen kurz schneller.
- Das Laufband läuft mit **58 px/s**, nicht mit einem Prozentsatz seiner Breite.
  Prozent hieße: ein Wort mehr in der Liste, und das ganze Band läuft schneller.
- Die Gerätespalten in der Galerie laufen beim Scrollen gegeneinander
  (`data-tempo`, negativ heißt gegen die Scrollrichtung).

Alles Scroll-Abhängige hängt an **einer** rAF-Schleife in `js/main.js`. Ein
eigener Zuhörer je Effekt ruckelt auf dem Handy sofort, weil jeder von ihnen
das Layout neu ausmisst.

Alle Bewegung hängt hinter `@media (prefers-reduced-motion: reduce)` und hinter
der Klasse `js` am `<html>`. Ohne JavaScript ist alles sofort sichtbar.

**Hover-Effekte stehen in `@media (hover: hover) and (pointer: fine)`.** Sonst
bleibt auf Touchgeräten nach jeder Berührung der Hover-Zustand kleben.

## Der gezeichnete Hintergrund

Auftakt und Schluss zeigen eine nächtliche Landstraße in einer `<canvas>`, kein
Video. Gezeichnet wird in Zentralperspektive: Ein Punkt `(x, z)` auf der Fahrbahn
— `x` seitlich, `z` nach vorn, beides in Metern — landet bei `x · f / z` auf dem
Bild. Alles Weitere fällt daraus heraus, ohne dass man es einzeln bauen müsste:
Die Fahrbahn läuft im Fluchtpunkt zusammen, Striche werden mit der Entfernung
kürzer und schmaler, Laternen rücken zusammen.

Bewegung entsteht allein dadurch, dass `weg` wächst. Die Striche springen dabei
nicht, weil der erste immer bei `ABSTAND − (weg % ABSTAND)` liegt.

Drei Entscheidungen, die man dem Bild ansieht:

- **Der Nebel am Horizont liegt über Himmel *und* Boden.** Läge er nur über dem
  Himmel, zeichnete sich dort eine messerscharfe waagerechte Kante ab, weil die
  eine Hälfte orange getönt wäre und die andere nicht. Diese eine Kante verrät
  die Zeichnung sofort als Zeichnung.
- **Die Masten sind unten fast unsichtbar.** Nachts sieht man von einem Mast nur
  das, was beleuchtet wird. Durchgehend gleich hell wird aus der Straße eine
  technische Zeichnung. Der Ausleger ist gebogen, nicht rechtwinklig — ein
  rechter Winkel liest sich als Diagramm.
- **Die Deckkraft der Markierungen steckt in einem senkrechten Verlauf**, nicht
  in einem festen Wert. Unten am Bildrand rauscht die Fahrbahn vorbei und ein
  greller Strich fällt dort als Fleck auf, am Horizont verschluckt ihn der
  Dunst. Ein Verlauf erledigt beide Enden auf einmal.

Bei reduzierter Bewegung wird ein Standbild derselben Straße gezeichnet. Die
Schleife läuft nur, solange die Fläche im Bild ist — zwei Vollbild-Leinwände,
die dauerhaft rechnen, merkt man auf einem älteren Gerät sofort.

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
