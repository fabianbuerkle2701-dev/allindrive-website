#!/usr/bin/env python3
"""
Erzeugt sitemap.xml aus den vorhandenen HTML-Dateien.

Von Hand gepflegte Sitemaps veralten beim ersten Umbenennen einer Datei.
Dieses Werkzeug liest den Ordner, sortiert nach Wichtigkeit und schreibt die
Datei neu:

    python3 werkzeug/sitemap.py

Ausgenommen sind 404.html, Dateien mit fuehrendem Unterstrich und alles,
was in robots.txt ausgeschlossen ist.
"""

import datetime
import os
import re

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASIS = "https://www.allindrive.de/"

# Wichtigkeit und erwartete Aenderungshaeufigkeit je Seite. Was hier nicht
# steht, bekommt die Standardwerte am Ende.
RANG = {
    "index.html": (1.0, "weekly"),
    "funktionen.html": (0.9, "monthly"),
    "digitale-adk.html": (0.9, "monthly"),
    "fahrstundenplanung.html": (0.8, "monthly"),
    "fahrschueler-app.html": (0.8, "monthly"),
    "pruefungssimulation.html": (0.8, "monthly"),
    "ki-assistenz.html": (0.8, "monthly"),
    "preise.html": (0.8, "monthly"),
    "vergleich.html": (0.7, "monthly"),
    "sicherheit.html": (0.7, "monthly"),
    "faq.html": (0.7, "monthly"),
    "kontakt.html": (0.6, "yearly"),
    "impressum.html": (0.2, "yearly"),
    "datenschutz.html": (0.3, "yearly"),
    "agb.html": (0.2, "yearly"),
}

AUS = {"404.html"}


def main():
    dateien = sorted(
        n for n in os.listdir(WURZEL)
        if n.endswith(".html") and not n.startswith("_") and n not in AUS
    )

    zeilen = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']

    for name in sorted(dateien, key=lambda n: -RANG.get(n, (0.5, ""))[0]):
        pfad = os.path.join(WURZEL, name)
        stand = datetime.date.fromtimestamp(os.path.getmtime(pfad)).isoformat()
        prio, takt = RANG.get(name, (0.5, "monthly"))
        ort = BASIS if name == "index.html" else BASIS + name
        zeilen += [
            "  <url>",
            f"    <loc>{ort}</loc>",
            f"    <lastmod>{stand}</lastmod>",
            f"    <changefreq>{takt}</changefreq>",
            f"    <priority>{prio}</priority>",
            "  </url>",
        ]

    zeilen.append("</urlset>")
    text = "\n".join(zeilen) + "\n"

    with open(os.path.join(WURZEL, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(text)

    print(f"sitemap.xml geschrieben: {len(dateien)} Seiten")
    for name in dateien:
        if name not in RANG:
            print(f"  Hinweis: {name} hat keinen Rang, Standardwerte verwendet")


if __name__ == "__main__":
    main()
