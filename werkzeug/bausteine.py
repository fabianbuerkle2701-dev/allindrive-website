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
    <!--KOPF-->          Kopfzeile und Klappmenue
    <!--FOOTER-->        die Fusszeile
    <!--GALERIE-->       die Galerie der iPhone-Aufnahmen
    <!--FLUG-->          der scrollgesteuerte Flug durch die App
    <!--REISE-->         das mitwandernde Geraet, das die ganze Seite begleitet

Jeder eingesetzte Baustein bleibt in seine Marken eingefasst
(<!--SPRITE-->...<!--/SPRITE-->). Deshalb laesst sich das Werkzeug beliebig
oft laufen: Es tauscht beim zweiten Lauf den Inhalt zwischen den Marken aus,
statt ein zweites Mal einzufuegen.
"""

import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.dirname(HIER)
BAUSTEINE = os.path.join(HIER, "bausteine")

sys.path.insert(0, HIER)


def lade(name):
    with open(os.path.join(BAUSTEINE, name), encoding="utf-8") as f:
        return f.read().strip()


def sprite():
    """Sprite mit eingesetzter Bildmarke."""
    s = lade("sprite.html")
    logo = lade("logo.html")
    return s.replace("<!--LOGO-->", logo)


# Die Galerie der Geraeteaufnahmen. Reihenfolge und Beschriftung stehen
# hier; ob eine Aufnahme schon existiert, entscheidet der Dateibestand.
# Fehlt eine, steht ein deutlich sichtbarer Platzhalter an ihrer Stelle,
# damit die Luecke niemandem entgeht.
GALERIE = [
    ("schuelerliste", "Alle Fahrschüler", "Wer wie weit ist, auf einen Blick"),
    ("startseite", "Der Morgen", "Termine, Hinweise und offene Anfragen"),
    ("adk", "Digitale ADK", "Alle Abschnitte mit Fortschritt"),
    ("adk-uebungen", "Übung für Übung", "Abhaken, bewerten, Notiz dazu"),
    ("kalender-woche", "Die Woche", "Sechs Tagesspalten, Konflikte markiert"),
    ("kalender-tag", "Der Tag", "Fahrlehrer, Fahrschüler und Fahrzeug"),
    ("fahrstunde-karte", "Gefahrene Strecke", "Per GPS mitgeschrieben"),
    ("pruefungssimulation", "Prüfungssimulation", "Fahraufgaben und Kompetenzbereiche"),
    ("fahrzeuge", "Fuhrpark", "Kilometerstand und HU-Countdown"),
    ("tagesabschluss", "Tagesabschluss", "Was heute lief, was morgen ansteht"),
    ("schueler-app", "Fahrschüler-App", "Fortschritt und nächster Termin"),
    ("buchung", "Selbst buchen", "Freie Zeiten, ohne Anruf"),
]


def galerie():
    """Die Geraetereihe, aus dem Bestand in images/iphone/ gebaut."""
    ordner = os.path.join(WURZEL, "images", "iphone")
    teile = []
    fehlend = []
    for name, titel, unter in GALERIE:
        rel = f"images/iphone/{name}.webp"
        if os.path.exists(os.path.join(WURZEL, rel)):
            inhalt = (
                f'<img src="{rel}" width="780" height="1601" loading="lazy" '
                f'alt="Allindrive auf dem iPhone: {titel}. {unter}.">'
            )
        else:
            fehlend.append(name)
            inhalt = (
                '<span class="phone__leer">Aufnahme folgt'
                f'<br>{name}.webp</span>'
            )
        teile.append(
            '<figure class="phone auf">'
            '<span class="phone__insel"></span>'
            f'<span class="phone__glas">{inhalt}</span>'
            f'<figcaption class="phone__titel">{titel}'
            f'<span class="phone__unter">{unter}</span></figcaption>'
            "</figure>"
        )
    if fehlend:
        print(f"  ! Galerie: {len(fehlend)} Aufnahmen fehlen noch "
              f"({', '.join(fehlend[:4])}{' ...' if len(fehlend) > 4 else ''})")
    return ('<div class="galerie__reihe">\n' + "\n".join(teile) + "\n</div>")


def flug():
    """Der scrollgesteuerte Flug: ein Geraet, zwoelf Ansichten, ein Text je
    Station. Aufgebaut aus demselben Bestand wie die Galerie, damit beide
    dieselben Aufnahmen zeigen."""
    bilder, texte, punkte = [], [], []
    fehlend = []
    for i, (name, titel, unter) in enumerate(GALERIE):
        rel = f"images/iphone/{name}.webp"
        if os.path.exists(os.path.join(WURZEL, rel)):
            bilder.append(
                f'<img class="flug__bild{" ist-an" if i == 0 else ""}" src="{rel}" '
                f'width="780" height="1601" loading="lazy" '
                f'alt="Allindrive auf dem iPhone: {titel}. {unter}.">'
            )
        else:
            fehlend.append(name)
            bilder.append(
                f'<span class="flug__bild phone__leer{" ist-an" if i == 0 else ""}">'
                f'Aufnahme folgt<br>{name}.webp</span>'
            )
        texte.append(
            f'<div class="flug__station{" ist-an" if i == 0 else ""}">'
            f'<p class="flug__nummer">{i + 1:02d} / {len(GALERIE):02d}</p>'
            f"<h3>{titel}</h3><p>{unter}.</p></div>"
        )
        punkte.append(
            f'<button class="flug__punkt{" ist-an" if i == 0 else ""}" type="button" '
            f'aria-label="Zu Station {i + 1}: {titel}"></button>'
        )

    if fehlend:
        print(f"  ! Flug: {len(fehlend)} Aufnahmen fehlen noch "
              f"({', '.join(fehlend[:4])}{' ...' if len(fehlend) > 4 else ''})")

    return (
        '<section class="flug" data-flug aria-label="Allindrive auf dem iPhone">\n'
        '<div class="flug__buehne">\n'
        '<span class="flug__schein" aria-hidden="true"></span>\n'
        '<div class="flug__innen">\n'
        '<div class="flug__text">\n' + "\n".join(texte) + "\n</div>\n"
        '<div class="flug__geraet">\n'
        '<figure class="phone"><span class="phone__glas">\n'
        + "\n".join(bilder) +
        "\n</span></figure>\n</div>\n</div>\n"
        '<div class="flug__leiste" role="group" aria-label="Stationen">\n'
        + "\n".join(punkte) +
        "\n</div>\n</div>\n</section>"
    )


def reise():
    """Das eine Geraet, das die ganze Seite begleitet. Enthaelt alle
    Ansichten uebereinander; welche zu sehen ist, entscheidet js/main.js
    aus dem Abschnitt, der gerade im Bild steht."""
    bilder, fehlend = [], []
    for i, (name, titel, unter) in enumerate(GALERIE):
        rel = f"images/iphone/{name}.webp"
        if os.path.exists(os.path.join(WURZEL, rel)):
            an = " ist-an" if i == 0 else ""
            faul = "" if i == 0 else 'loading="lazy" '
            bilder.append(
                f'<img class="reise__bild{an}" data-ansicht="{name}" src="{rel}" '
                f'width="780" height="1601" {faul}'
                f'alt="Allindrive auf dem iPhone: {titel}. {unter}.">'
            )
        else:
            fehlend.append(name)
            bilder.append(
                f'<span class="reise__bild phone__leer{" ist-an" if i == 0 else ""}" '
                f'data-ansicht="{name}">Aufnahme folgt<br>{name}.webp</span>'
            )
    if fehlend:
        print(f"  ! Reise: {len(fehlend)} Aufnahmen fehlen noch "
              f"({', '.join(fehlend[:4])}{' ...' if len(fehlend) > 4 else ''})")

    return (
        '<div class="reise" data-reise aria-hidden="true">\n'
        '<span class="reise__schein"></span>\n'
        '<figure class="phone reise__phone">\n'
        '<span class="phone__insel"></span>\n'
        '<span class="phone__glas">\n' + "\n".join(bilder) + "\n</span>\n"
        '<span class="phone__rueck">'
        '<span class="phone__kamera"></span>'
        '<span class="phone__blitz"></span>'
        '<svg class="ad" viewBox="0 0 100 68.2" aria-hidden="true" focusable="false">'
        '<use href="#ad"></use></svg>'
        "</span>\n"
        '<figcaption class="reise__schild"></figcaption>\n'
        "</figure>\n</div>"
    )


def einsetzen(html, marke, inhalt):
    """Setzt einen Baustein ein - beim ersten Lauf und bei jedem weiteren."""
    auf, zu = f"<!--{marke}-->", f"<!--/{marke}-->"
    block = auf + "\n" + inhalt + "\n" + zu
    schon = re.compile(re.escape(auf) + r".*?" + re.escape(zu), re.S)
    if schon.search(html):
        return schon.sub(lambda _: block, html)
    return html.replace(auf, block)


def main():
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
        if "<!--KOPF-->" in html:
            html = einsetzen(html, "KOPF", lade("kopf.html"))
        html = einsetzen(html, "FOOTER", ft)
        if "<!--GALERIE-->" in html:
            html = einsetzen(html, "GALERIE", galerie())
        if "<!--FLUG-->" in html:
            html = einsetzen(html, "FLUG", flug())
        if "<!--REISE-->" in html:
            html = einsetzen(html, "REISE", reise())

        if html != vorher:
            with open(pfad, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"  + {seite}  ({len(html):,} Bytes)")
        else:
            print(f"    {seite}  unveraendert")


if __name__ == "__main__":
    main()
