#!/usr/bin/env python3
"""
Bereitet iPhone-Bildschirmfotos fuer die Website auf.

Legt die Aufnahmen aus images/iphone/roh/ auf einheitliche Groesse, schneidet
die Statusleiste des Geraets ab, wandelt nach WebP und legt sie in
images/iphone/ ab. Die Gehaeusehuelle kommt auf der Website per CSS drum
herum, deshalb wird hier nichts gerahmt.

    python3 werkzeug/iphone.py

Erkennt HEIC nur, wenn pillow-heif installiert ist. Ohne das wandelt der
Aufruf HEIC vorher mit sips um, das auf macOS immer vorhanden ist.
"""

import os
import subprocess
import sys
import unicodedata

from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.dirname(HIER)
ROH = os.path.join(WURZEL, "images", "iphone", "roh")
ZIEL = os.path.join(WURZEL, "images", "iphone")

# Zielbreite: 780 px reicht fuer die Darstellung bei doppelter Punktdichte,
# die Galerie zeigt die Geraete rund 300 px breit.
BREITE = 780

# Die Statusleiste bleibt drauf. Sie macht die Aufnahme als echtes
# Geraetefoto erkennbar, und in ihrer Mitte sitzt die Luecke fuer die
# Dynamic Island, die eine nachgezeichnete Huelle nie richtig trifft.
STATUSLEISTE = 0.0

BEKANNT = [
    "startseite", "schuelerliste", "adk", "adk-uebungen", "kalender-woche",
    "kalender-tag", "pruefungssimulation", "fahrstunde-karte", "fahrzeuge",
    "tagesabschluss", "schueler-app", "buchung",
]


def entschaerfen(name):
    """Dateiname auf Kleinbuchstaben, Bindestriche, ohne Umlaute."""
    n = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    n = n.lower().replace("_", "-").replace(" ", "-")
    return "".join(c for c in n if c.isalnum() or c == "-").strip("-")


def oeffnen(pfad):
    """Oeffnet auch HEIC, notfalls ueber sips."""
    try:
        return Image.open(pfad).convert("RGB")
    except Exception:
        um = pfad + ".png"
        subprocess.run(
            ["sips", "-s", "format", "png", pfad, "--out", um],
            check=True, capture_output=True,
        )
        bild = Image.open(um).convert("RGB")
        os.remove(um)
        return bild


def main():
    if not os.path.isdir(ROH):
        print(f"Ordner fehlt: {ROH}")
        return 1

    dateien = [
        f for f in sorted(os.listdir(ROH))
        if not f.startswith(".") and os.path.splitext(f)[1].lower()
        in (".png", ".jpg", ".jpeg", ".heic", ".heif", ".webp")
    ]
    if not dateien:
        print(f"Nichts gefunden in {ROH}")
        print("Lege die Aufnahmen dort ab, siehe BITTE-HIER-ABLEGEN.md")
        return 1

    unbekannt = []
    for f in dateien:
        roh_name = entschaerfen(os.path.splitext(f)[0])
        treffer = next((b for b in BEKANNT if b in roh_name or roh_name in b), None)
        name = treffer or roh_name
        if not treffer:
            unbekannt.append(f)

        bild = oeffnen(os.path.join(ROH, f))
        b, h = bild.size

        # Statusleiste oben abschneiden
        bild = bild.crop((0, int(h * STATUSLEISTE), b, h))

        # Auf Zielbreite bringen
        if bild.width != BREITE:
            neu_h = round(bild.height * BREITE / bild.width)
            bild = bild.resize((BREITE, neu_h), Image.LANCZOS)

        aus = os.path.join(ZIEL, name + ".webp")
        bild.save(aus, "WEBP", quality=86, method=6)
        kb = os.path.getsize(aus) / 1024
        print(f"  {f:38s} -> {name}.webp  {bild.width}x{bild.height}  {kb:5.0f} KB")

    print(f"\n{len(dateien)} Aufnahmen aufbereitet in images/iphone/")
    if unbekannt:
        print("\nDiese Namen kannte ich nicht, sie wurden unveraendert uebernommen:")
        for f in unbekannt:
            print(f"  {f}")
        print("Traegst du sie in der Galerie selbst ein, oder benennst sie um.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
