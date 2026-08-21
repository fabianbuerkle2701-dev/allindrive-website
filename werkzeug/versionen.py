#!/usr/bin/env python3
"""Haengt an jede Stilvorlage und jede Skriptdatei eine Kennung aus ihrem Inhalt.

    <link rel="stylesheet" href="css/style.css?v=a3f19c">
    <script src="js/main.js?v=7b21e4" defer></script>

Warum das noetig ist: Die Dateinamen bleiben ueber Jahre gleich, und beide
Auslieferungen setzen eine Verfallszeit (GitHub Pages max-age=600, Netlify
laenger). Ein Besucher, der die Seite vorher schon offen hatte, bekommt nach
einem Deploy also das neue HTML, aber das alte CSS und das alte Skript aus
seinem Zwischenspeicher.

Das ist nicht harmlos. Genau dieser Fall ist eingetreten: neues HTML mit
Geraetehuellen, aber altes CSS ohne deren Masse; neues HTML mit einer
<canvas> fuer die Nachtfahrt, aber altes Skript, das nur Videos kennt und
die Leinwand leer stehen laesst; und ein Laufband, das mit dem alten Tempo
von 753 px/s durchrast. Drei kaputte Stellen auf einmal, und keine davon
war im Quelltext zu finden.

Die Kennung sind die ersten sechs Zeichen des SHA-256 ueber den Dateiinhalt.
Aendert sich die Datei, aendert sich die Adresse, und der Zwischenspeicher
greift nicht mehr. Aendert sie sich nicht, bleibt alles wie es ist - der
Zwischenspeicher soll ja arbeiten, nur eben nicht ueber eine Aenderung
hinweg.

Sechs Zeichen sind 16 Millionen Moeglichkeiten. Fuer drei Dateien, die
sich ein paar hundert Mal im Leben aendern, reicht das weit.

    python3 werkzeug/versionen.py            # eintragen
    python3 werkzeug/versionen.py --pruefen  # nur zeigen, nichts aendern
"""

import hashlib
import re
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent

# Nur was sich mit dem HTML zusammen aendert. Schriften bleiben aussen vor:
# Eine woff2-Datei wird nie wieder angefasst, und ein Wechsel der Adresse
# wuerde sie bei jedem Deploy neu laden lassen.
DATEIEN = ["css/style.css", "js/main.js"]

VERWEIS = re.compile(
    r'((?:href|src)=")(' + "|".join(re.escape(d) for d in DATEIEN) + r')(\?v=[0-9a-f]+)?(")'
)


def kennung(pfad: Path) -> str:
    return hashlib.sha256(pfad.read_bytes()).hexdigest()[:6]


def main() -> int:
    nur_pruefen = "--pruefen" in sys.argv

    kennungen = {}
    for name in DATEIEN:
        p = WURZEL / name
        if not p.exists():
            print("  fehlt: %s" % name)
            return 1
        kennungen[name] = kennung(p)
        print("  %-16s %s" % (name, kennungen[name]))

    geaendert = 0
    for seite in sorted(WURZEL.glob("*.html")):
        text = seite.read_text(encoding="utf-8")

        def ersetzen(m):
            return "%s%s?v=%s%s" % (m.group(1), m.group(2), kennungen[m.group(2)], m.group(4))

        neu = VERWEIS.sub(ersetzen, text)
        if neu != text:
            geaendert += 1
            if not nur_pruefen:
                seite.write_text(neu, encoding="utf-8")
            print("    %s  %s" % (seite.name, "waere angepasst" if nur_pruefen else "angepasst"))

    if not geaendert:
        print("  Alle Seiten schon auf dem Stand.")
    elif nur_pruefen:
        print("  %d Seite(n) haetten sich geaendert." % geaendert)
    else:
        print("  %d Seite(n) angepasst." % geaendert)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
