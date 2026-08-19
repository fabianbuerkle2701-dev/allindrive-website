#!/usr/bin/env python3
"""
Setzt die wiederkehrenden Bausteine in die Seiten ein.

Die Website ist bewusst reines HTML ohne Bauschritt: Was im Ordner liegt,
ist genau das, was ausgeliefert wird. Trotzdem waeren Kopfzeile, Fusszeile,
Bildmarke und die Rundinstrumente auf 16 Seiten von Hand nicht sauber
gleichzuhalten. Dieses Werkzeug setzt sie einmal ein und schreibt das
Ergebnis fest in die Dateien.

    python3 werkzeug/bausteine.py

Es ist nach dem Einsetzen nicht mehr noetig - die Seiten funktionieren
allein. Wer spaeter Kopf- oder Fusszeile aendert, aendert die Vorlage in
werkzeug/bausteine/ und laesst das Werkzeug noch einmal laufen.

Ersetzt wird:
    <!--SPRITE-->        Bildmarke und alle Piktogramme
    <!--FOOTER-->        die Fusszeile
    <!--DIAL:name-->     ein Rundinstrument aus instrumente.json

Jeder eingesetzte Baustein bleibt in seine Marken eingefasst
(<!--SPRITE-->...<!--/SPRITE-->). Deshalb laesst sich das Werkzeug beliebig
oft laufen: Es tauscht beim zweiten Lauf den Inhalt zwischen den Marken aus,
statt ein zweites Mal einzufuegen.
"""

import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.dirname(HIER)
BAUSTEINE = os.path.join(HIER, "bausteine")

sys.path.insert(0, HIER)
from instrumente import dial  # noqa: E402


def lade(name):
    with open(os.path.join(BAUSTEINE, name), encoding="utf-8") as f:
        return f.read().strip()


def sprite():
    """Sprite mit eingesetzter Bildmarke."""
    s = lade("sprite.html")
    logo = lade("logo.html")
    return s.replace("<!--LOGO-->", logo)


def instrumente_fuer(seite, specs):
    """Alle Rundinstrumente einer Seite, nach Platzhalternamen."""
    aus = {}
    for name, spec in specs.get(seite, {}).items():
        spec = dict(spec)
        aus[name] = dial(
            spec.pop("size_class", ""),
            spec.pop("aria", name),
            **spec,
        )
    return aus


def einsetzen(html, marke, inhalt):
    """Setzt einen Baustein ein - beim ersten Lauf und bei jedem weiteren."""
    auf, zu = f"<!--{marke}-->", f"<!--/{marke}-->"
    block = auf + "\n" + inhalt + "\n" + zu
    schon = re.compile(re.escape(auf) + r".*?" + re.escape(zu), re.S)
    if schon.search(html):
        return schon.sub(lambda _: block, html)
    return html.replace(auf, block)


def main():
    with open(os.path.join(BAUSTEINE, "instrumente.json"), encoding="utf-8") as f:
        specs = json.load(f)

    sp = sprite()
    ft = lade("footer.html")

    seiten = sorted(
        n for n in os.listdir(WURZEL)
        if n.endswith(".html") and not n.startswith("_")
    )

    for seite in seiten:
        pfad = os.path.join(WURZEL, seite)
        with open(pfad, encoding="utf-8") as f:
            html = f.read()
        vorher = html

        html = einsetzen(html, "SPRITE", sp)
        html = einsetzen(html, "FOOTER", ft)

        dials = instrumente_fuer(seite, specs)
        for name in set(re.findall(r"<!--DIAL:([a-z0-9_-]+)(?:-->|\s)", html)):
            if name not in dials:
                print(f"  ! {seite}: kein Instrument '{name}' in instrumente.json")
                continue
            html = einsetzen(html, "DIAL:" + name, dials[name])

        if html != vorher:
            with open(pfad, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  + {seite}  ({len(html):,} Bytes)")
        else:
            print(f"    {seite}  unveraendert")


if __name__ == "__main__":
    main()
