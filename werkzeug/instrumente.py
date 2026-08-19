#!/usr/bin/env python3
"""
Erzeugt die Rundinstrumente als SVG.

Von Hand gesetzte Skalenstriche sitzen nie exakt; deshalb wird die
Geometrie gerechnet. Der Nullpunkt liegt oben, der Zeigerausschlag laeuft
symmetrisch nach links und rechts - so wie bei einem Drehzahlmesser.
"""

import math

C = 100.0          # Mittelpunkt
SWEEP = 122.0      # Ausschlag je Seite in Grad


def pol(angle_deg, radius):
    a = math.radians(angle_deg)
    return C + radius * math.sin(a), C - radius * math.cos(a)


def angle_for(value, lo, hi):
    t = 0.0 if hi == lo else (value - lo) / (hi - lo)
    return -SWEEP + t * 2 * SWEEP


def arc(lo_v, hi_v, lo, hi, radius):
    a0, a1 = angle_for(lo_v, lo, hi), angle_for(hi_v, lo, hi)
    x0, y0 = pol(a0, radius)
    x1, y1 = pol(a1, radius)
    large = 1 if abs(a1 - a0) > 180 else 0
    return f"M{x0:.2f} {y0:.2f}A{radius} {radius} 0 {large} 1 {x1:.2f} {y1:.2f}"


def gauge(
    caption,          # Beschriftung unter dem Ablesewert
    unit,             # Einheit auf dem Zifferblatt
    lo, hi,           # Skalenbereich
    value,            # Messwert
    readout,          # grosse Zahl in der Mitte
    majors=6,         # Anzahl beschrifteter Hauptstriche
    minors=4,         # Zwischenstriche je Abschnitt
    zone=None,        # (von, bis, "good"|"red") als farbiger Skalenbogen
    figures=True,     # Skalenziffern anzeigen
    scroll=False,     # Zeiger wird beim Scrollen gefuehrt
):
    out = []
    r_tick = 78.0
    r_fig = 60.0

    if zone:
        z0, z1, kind = zone
        out.append(
            f'<path class="dial__arc dial__arc--{kind}" d="{arc(z0, z1, lo, hi, 86.0)}"/>'
        )

    steps = majors * minors
    for i in range(steps + 1):
        v = lo + (hi - lo) * i / steps
        a = angle_for(v, lo, hi)
        major = i % minors == 0
        length = 12.0 if major else 6.0
        x0, y0 = pol(a, r_tick)
        x1, y1 = pol(a, r_tick - length)
        cls = "dial__tick dial__tick--major" if major else "dial__tick"
        out.append(f'<line class="{cls}" x1="{x0:.2f}" y1="{y0:.2f}" x2="{x1:.2f}" y2="{y1:.2f}"/>')
        if major and figures:
            fx, fy = pol(a, r_fig)
            txt = f"{v:g}"
            out.append(f'<text class="dial__figure" x="{fx:.2f}" y="{fy:.2f}">{txt}</text>')

    if unit:
        out.append(f'<text class="dial__unit" x="{C}" y="{C - 34:.0f}">{unit}</text>')

    # Zeiger: langer Arm nach oben, kurzes Gegengewicht nach unten.
    a_val = angle_for(value, lo, hi)
    needle = (
        '<g class="dial__needle"'
        + (f' data-von="{-SWEEP}" data-bis="{a_val:.2f}"' if scroll else "")
        + f' style="--rest:{-SWEEP - 4:.0f}deg;--full:{SWEEP + 4:.0f}deg;'
        + f'--deflect:{a_val:.2f}deg">'
        + '<path class="dial__needle-body" d="M95.9 106 L98.6 33 A1.6 1.6 0 0 1 101.4 33 L104.1 106 Z"/>'
        + '<path class="dial__needle-tip" d="M98.3 40 L98.9 24 A1.15 1.15 0 0 1 101.1 24 L101.7 40 Z"/>'
        + '<path class="dial__needle-body" d="M97.6 100 L102.4 100 L101.8 116 L98.2 116 Z"/>'
        + "</g>"
    )
    out.append(needle)
    out.append(f'<circle class="dial__hub" cx="{C}" cy="{C}" r="9"/>')
    out.append(f'<circle class="dial__hub-cap" cx="{C}" cy="{C}" r="4.5"/>')

    # Anzeigefeld unter der Nabe. Liegt ueber dem Zeiger, damit der Wert
    # immer lesbar bleibt - im Auto ist das genauso geloest.
    out.append(
        f'<rect class="dial__window" x="{C - 34}" y="{C + 16}" width="68" height="34" rx="5"/>'
    )
    out.append(f'<text class="dial__readout" x="{C}" y="{C + 38:.0f}">{readout}</text>')
    out.append(f'<text class="dial__caption" x="{C}" y="{C + 55:.0f}">{caption}</text>')

    return "\n".join(out)


def dial(size_class, aria, **kw):
    """Fertiges Instrument samt Blende, Zifferblatt und Glas."""
    body = gauge(**kw)
    cls = "dial" + (f" {size_class}" if size_class else "")
    return (
        f'<figure class="{cls}" role="img" aria-label="{aria}">'
        f'<span class="dial__bezel"></span>'
        f'<span class="dial__face"></span>'
        f'<svg class="dial__svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
        f"{body}</svg>"
        f'<span class="dial__glass"></span>'
        f"</figure>"
    )


if __name__ == "__main__":
    import sys, json

    specs = json.load(open(sys.argv[1]))
    for name, spec in specs.items():
        print(f"<!-- {name} -->")
        print(dial(spec.pop("size_class", ""), spec.pop("aria", name), **spec))
        print()
