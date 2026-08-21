# Allindrive Website

Marketing-Website für Allindrive, die Fahrschul-Verwaltungssoftware.
Reines HTML, CSS und JavaScript. Kein Build-Schritt: Was im Ordner liegt, ist
genau das, was ausgeliefert wird.

## Aufbau

```
index.html            Startseite
funktionen.html       Funktionsübersicht, verlinkt in die Detailseiten
digitale-adk.html     Digitale Ausbildungsdiagrammkarte
fahrstundenplanung.html
fahrschueler-app.html
pruefungssimulation.html
ki-assistenz.html
sicherheit.html       Datenschutz und Datensicherheit
preise.html           Beta-Zugang, bewusst ohne Beträge
vergleich.html        Gegen Papier und klassische Software
faq.html
kontakt.html
impressum.html        Gerüst, muss ausgefüllt werden
datenschutz.html      Gerüst, muss ausgefüllt werden
agb.html              Gerüst, muss ausgefüllt werden
404.html

css/fonts.css         Zwei Schriften, lokal
css/style.css         Das gesamte Designsystem
js/main.js            Menü, Einblendungen, Laufband, Nachtfahrt
fonts/inter-*.woff2   Fließtext, nach Zeichenbereich geteilt
fonts/instrument-serif-italic.woff2   Kursive Auszeichnung in Überschriften
images/               Marke, Symbole
images/app/           Bildschirmfotos aus der laufenden App
images/iphone/        Aufnahmen für die Gerätehüllen, siehe unten
werkzeug/             Kleine Skripte, siehe unten
```

## Grundentscheidungen

**Zwei Schriften, beide lokal.** Inter für Fließtext und Überschriften,
Instrument Serif kursiv für die hervorgehobenen Worte darin. Kein Abruf bei
Google, also keine IP-Adresse der Besucher an Dritte und eine
Einwilligungskategorie weniger. Inter ist nach Zeichenbereich geteilt, damit
deutsche Seiten die Datei mit den osteuropäischen Zeichen gar nicht erst
anfragen.

**Keine fremden Skripte, keine fremden Adressen.** Die Seite lädt
ausschließlich eigene Dateien. Kein Tracking, keine Cookies, kein Eintrag im
lokalen Speicher — auf dem Gerät des Besuchers bleibt nichts zurück. Die
Inhaltssicherheitsrichtlinie in `netlify.toml` erlaubt deshalb nur `'self'`.

**Der bewegte Hintergrund ist gezeichnet, kein Video.** Auftakt und Schluss
zeigen eine nächtliche Landstraße, die `js/main.js` in eine `<canvas>` malt:
Fahrbahn, Markierungen und Laternen in Zentralperspektive, dazu ein langsam
wandernder Kurvenverlauf. Vorher lief dort ein eingebetteter Videostrom eines
Video-Dienstes — der kostete 296 KB Abspieler, lud bei jedem Aufruf von einem
fremden Server und brauchte einen eigenen Absatz in der Datenschutzerklärung.
Die Zeichnung kostet nichts davon und passt zum Thema.

Wer stattdessen eine echte Aufnahme zeigen will, legt sie unter `video/` ab
und ergänzt an der Leinwand in `index.html`:

```html
<canvas data-fahrt data-fahrt-video="video/fahrt.mp4" aria-hidden="true"></canvas>
```

Dann tritt der Film an die Stelle der Zeichnung. `media-src` in
`netlify.toml` deckt eigene Dateien bereits ab.

**Echte Bildschirmfotos.** Die Bilder unter `images/app/` sind Aufnahmen aus der
laufenden App, nicht nachgebaute Attrappen. Alle Personennamen darin sind vor
der Aufnahme durch erfundene ersetzt worden; es sind keine Daten realer
Fahrschüler abgebildet. Von jeder Aufnahme gibt es einen Zuschnitt für schmale
Bildschirme (`*-mobil.webp`), weil eine Desktop-Aufnahme auf einem Handy
unlesbar wird. Ausgeliefert wird über `<picture>`.

**Ohne JavaScript vollständig lesbar.** Das Skript bringt nur Bewegung und
Bequemlichkeit. Fällt es aus, sind alle Abschnitte sichtbar und das Menü
aufgeklappt.

## Werkzeuge

Die Website braucht sie nicht, um zu laufen. Sie halten nur wiederkehrende
Bestandteile über alle Seiten hinweg gleich.

```bash
python3 werkzeug/bausteine.py    # Bildmarke, Symbole und Fußzeile einsetzen
python3 werkzeug/sitemap.py      # sitemap.xml neu erzeugen
python3 werkzeug/angaben.py      # Firmendaten in alle Rechtstexte eintragen
python3 werkzeug/iphone.py       # Bildschirmfotos in die Gerätehüllen bringen
```

### Die offenen Angaben

Impressum, Datenschutzerklärung und AGB stehen als vollständige Gerüste da,
aber an 82 Stellen fehlen deine Angaben. Sie sind auf den Seiten gelb
markiert, damit man sie nicht übersieht:

```html
<span class="offen">Telefonnummer</span>
```

Der Text darin ist zugleich der Schlüssel. Trag deine Angaben in
`werkzeug/angaben.json` ein und lass `angaben.py` laufen — es ersetzt jede
Lücke, für die ein Wert dasteht, und lässt alle anderen stehen. Es lässt sich
beliebig oft laufen, du kannst also in Etappen arbeiten.

`--pruefen` zeigt nur an, ohne zu ändern. Am Ende listet das Skript, was noch
fehlt, und trennt dabei zwei Sorten:

- **Angaben**, die du nachschlagen kannst: Anschrift, Registernummer, Hoster.
- **Entscheidungen**, die keine Angabe sind: Haftungshöchstbetrag, Kündigungsfrist,
  Aufbewahrungsdauer, Gerichtsstand. Die stehen bewusst nicht in
  `angaben.json` — sie gehören vor der Veröffentlichung geprüft, und ein
  Formularfeld dafür würde das Gegenteil nahelegen.

**Die Domain steht ebenfalls dort.** Solange sie leer ist, zeigen alle
`<link rel="canonical">` auf `https://www.allindrive.de/`. Das ist keine
Kleinigkeit: Suchmaschinen folgen dieser Adresse und nehmen dann die falsche
Seite in den Index auf.

### Die fehlenden Bildschirmfotos

In der Galerie und im Bento-Raster stecken elf Gerätehüllen, die noch auf
Aufnahmen warten — sichtbar an der gestreiften Fläche mit dem Dateinamen
darin. Leg die Aufnahmen unter `images/iphone/roh/` ab (die Datei dort sagt,
welche gebraucht werden) und lass `iphone.py` laufen: Es schneidet die
Statusleiste ab, skaliert auf 780 px und schreibt WebP.

Nimm sie aus einem Testkonto auf. Auf den Aufnahmen dürfen keine Namen
echter Fahrschüler stehen.

`bausteine.py` ersetzt die Marker `<!--SPRITE-->` und `<!--FOOTER-->` in allen
HTML-Dateien durch den Inhalt aus `werkzeug/bausteine/`. Es lässt sich beliebig
oft laufen: beim zweiten Lauf tauscht es den Inhalt zwischen den Marken aus,
statt ein zweites Mal einzufügen. Wer Kopf- oder Fußzeile ändern will, ändert
die Vorlage in `werkzeug/bausteine/` und lässt das Werkzeug erneut laufen.

`sitemap.py` nach jedem Hinzufügen oder Umbenennen einer Seite laufen lassen.

## Was noch fehlt

Diese Angaben sind auf den Seiten mit einem gelb markierten
`<span class="offen">` versehen und müssen vor der Veröffentlichung ersetzt
werden. Ein Suchlauf findet sie alle:

```bash
grep -rn 'class="offen"' *.html
```

Im Einzelnen:

- **Domain.** Überall ist `https://www.allindrive.de/` eingetragen, in
  `canonical`, `og:url`, im JSON-LD, in `robots.txt` und in `sitemap.xml`.
  Stimmt die Domain nicht, muss sie in allen Dateien ersetzt werden.
- **Impressum, Datenschutzerklärung und AGB.** Die drei Seiten sind
  vollständig gegliederte Gerüste. Firmenname, Anschrift,
  Vertretungsberechtigte, Registereintrag, Umsatzsteuer-Identifikationsnummer
  und Kontaktdaten fehlen. Vor der Veröffentlichung anwaltlich prüfen lassen.
- **Kontaktwege.** E-Mail-Adresse und Telefonnummer auf `kontakt.html`.
- **Formularempfänger.** Die Formulare auf `kontakt.html` und `preise.html`
  haben bewusst kein `action`-Attribut und melden das dem Besucher ehrlich.
  Für Netlify genügt `data-netlify="true"` und ein `action` auf eine
  Dankeseite; ohne das kommt keine Nachricht an.
- **Angaben zur Datenhaltung** auf `sicherheit.html`: Serverstandort,
  Auftragsverarbeitungsvertrag, Zertifikate. Nur eintragen, was belegbar ist.

## Sprachregeln

Auf allen Seiten bewusst vermieden, weil sie rechtlich angreifbar sind:
„rechtssicher", „prüfungssicher", „DSGVO-konform" als pauschale Zusage,
„ersetzt die Bürokraft", Superlative, erfundene Zahlen, erfundene
Kundenstimmen, Namen von Wettbewerbern und konkrete Preise.

Ebenfalls durchgehend ausgespart: Rechnungen, Abrechnung, Mahnwesen und die
Theorie-Lern-App. Diese Bereiche sind im Produkt noch nicht fertig und werden
deshalb nicht beworben.

## Örtlich ansehen

```bash
npx http-server . -p 8877 -c-1
```
