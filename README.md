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

css/fonts.css         Eine Schrift, lokal
css/style.css         Das gesamte Designsystem
js/main.js            Farbschema, Menü, Einblenden beim Scrollen
fonts/karla.woff2     Aus dem App-Bundle gelöst, 24 KB
images/               Marke, Symbole
images/app/           Bildschirmfotos aus der laufenden App
werkzeug/             Kleine Skripte, siehe unten
```

## Grundentscheidungen

**Eine Schrift.** Karla, in einer variablen Datei von 24 KB, für Überschriften
und Fließtext. Sie stammt aus dem Bundle der App selbst und liegt lokal.
Kein Abruf bei Google, also keine IP-Adresse der Besucher an Dritte und eine
Einwilligungskategorie weniger.

**Keine fremden Skripte.** Die Seite lädt ausschließlich eigene Dateien. Kein
Tracking, keine Cookies. Gespeichert wird einzig die Wahl zwischen hellem und
dunklem Farbschema, im lokalen Speicher des Browsers. Die
Inhaltssicherheitsrichtlinie in `netlify.toml` ist deshalb eng gefasst.

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
```

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
