#!/usr/bin/env python3
"""Traegt die Angaben aus angaben.json in alle HTML-Seiten ein.

Die Rechtstexte stehen mit gelb markierten Luecken auf den Seiten:

    <span class="offen">Telefonnummer</span>

Der Text in der Luecke ist zugleich ihr Schluessel. Steht in angaben.json
unter diesem Schluessel ein Wert, ersetzt das Skript die ganze Luecke durch
den Wert. Steht dort nichts, bleibt die Luecke stehen.

Warum kein Platzhalter wie {{telefon}}: Die Luecken muessen auch dann noch
lesbar sein, wenn sie nie gefuellt werden. Eine Seite mit "{{telefon}}" im
Impressum ist kaputt, eine Seite mit einer sichtbar markierten Luecke
"Telefonnummer" sagt einem Leser wenigstens, was fehlt - und einem selbst
beim Durchsehen, woran noch zu arbeiten ist.

Das Skript laesst sich beliebig oft laufen: Was schon eingetragen ist, hat
keine Luecke mehr und wird nicht angefasst.

    python3 werkzeug/angaben.py            # eintragen
    python3 werkzeug/angaben.py --pruefen  # nur zeigen, nichts aendern
"""

import html
import json
import re
import sys
from pathlib import Path

WURZEL = Path(__file__).resolve().parent.parent
QUELLE = Path(__file__).resolve().parent / "angaben.json"

LUECKE = re.compile(r'<span class="offen">(.*?)</span>', re.S)


def werte_lesen():
    """Zieht alle nicht leeren Werte aus der verschachtelten Datei flach."""
    daten = json.loads(QUELLE.read_text(encoding="utf-8"))
    flach = {}
    for schluessel, wert in daten.items():
        if schluessel.startswith("_"):
            continue
        if isinstance(wert, dict):
            for k, v in wert.items():
                if isinstance(v, str) and v.strip():
                    flach[k] = v.strip()
        elif isinstance(wert, str) and wert.strip():
            flach[schluessel] = wert.strip()
    return daten, flach


def domain_setzen(text, domain):
    """Tauscht die Beispiel-Domain in Kanonisch-Adressen und Auszeichnungen.

    Die Adresse steht in <link rel=canonical>, in den og:-Angaben und im
    JSON-LD. Eine falsche Kanonisch-Adresse ist kein Schoenheitsfehler:
    Suchmaschinen folgen ihr und indexieren dann die falsche Seite.
    """
    alt = "https://www.allindrive.de/"
    neu = domain if domain.endswith("/") else domain + "/"
    return text.replace(alt, neu)


def main():
    nur_pruefen = "--pruefen" in sys.argv
    daten, werte = werte_lesen()
    domain = daten.get("domain", "").strip()

    gefuellt = 0
    offen = {}
    seiten = sorted(WURZEL.glob("*.html"))

    for seite in seiten:
        text = original = seite.read_text(encoding="utf-8")

        def ersetzen(treffer):
            nonlocal gefuellt
            schluessel = re.sub(r"\s+", " ", treffer.group(1)).strip()
            if schluessel in werte:
                gefuellt += 1
                return html.escape(werte[schluessel], quote=False)
            offen.setdefault(schluessel, []).append(seite.name)
            return treffer.group(0)

        text = LUECKE.sub(ersetzen, text)
        if domain:
            text = domain_setzen(text, domain)

        if text != original and not nur_pruefen:
            seite.write_text(text, encoding="utf-8")
            print(f"    {seite.name}  angepasst")

    print()
    if nur_pruefen:
        print(f"{gefuellt} Luecken koennten gefuellt werden, {len(offen)} blieben offen.")
    else:
        print(f"{gefuellt} Luecken gefuellt.")
    if domain:
        print(f"Domain gesetzt: {domain}")
    else:
        print("Domain nicht gesetzt - die Kanonisch-Adressen zeigen weiter auf")
        print("https://www.allindrive.de/. Suchmaschinen folgen dieser Adresse.")

    if not offen:
        print("\nKeine Luecken mehr offen.")
        return

    print(f"\nNoch offen ({sum(len(v) for v in offen.values())} Stellen):\n")
    fuellbar = [k for k in offen if k in daten_schluessel(daten)]
    entscheidungen = [k for k in offen if k not in daten_schluessel(daten)]

    if fuellbar:
        print("  In angaben.json vorgesehen, aber noch leer:")
        for k in sorted(fuellbar):
            print(f"    {k}")
        print()
    if entscheidungen:
        print("  Entscheidungen, nicht blosse Angaben - gehoeren geprueft,")
        print("  bevor sie auf einer Website stehen:")
        for k in sorted(entscheidungen):
            orte = ", ".join(sorted(set(offen[k])))
            print(f"    {k}  ({orte})")


def daten_schluessel(daten):
    """Alle in angaben.json vorgesehenen Schluessel, gefuellt oder nicht."""
    raus = set()
    for schluessel, wert in daten.items():
        if schluessel.startswith("_"):
            continue
        if isinstance(wert, dict):
            raus.update(wert.keys())
        else:
            raus.add(schluessel)
    return raus


if __name__ == "__main__":
    main()
