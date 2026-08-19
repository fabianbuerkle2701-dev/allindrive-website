# Bildschirmfotos vom iPhone hier ablegen

Lege die Aufnahmen aus dem Testaccount in diesen Ordner. Format egal:
PNG, JPG oder HEIC, direkt vom iPhone. Auch die Ordnung ist egal, den Rest
macht `python3 werkzeug/iphone.py`.

## Welche Ansichten

Benenne die Dateien so, dann landen sie automatisch an der richtigen Stelle.
Wenn ein Name nicht passt, nimm irgendeinen: das Werkzeug listet dann auf,
was es nicht zuordnen konnte.

| Dateiname            | Ansicht                                            |
|----------------------|----------------------------------------------------|
| `startseite`         | Startseite mit Begrüßung, Kennzahlen, Tagesterminen |
| `schuelerliste`      | Meine Schüler mit den Fortschrittsringen            |
| `adk`                | Ausbildungsdiagrammkarte, Abschnitte sichtbar       |
| `adk-uebungen`       | ADK, ein Abschnitt aufgeklappt mit Häkchen          |
| `kalender-woche`     | Kalender, Wochenansicht                             |
| `kalender-tag`       | Kalender, Tagesansicht                              |
| `pruefungssimulation`| Prüfungssimulation, laufend oder Auswertung         |
| `fahrstunde-karte`   | Fahrstunde mit aufgezeichneter Strecke auf der Karte |
| `fahrzeuge`          | Fuhrpark mit HU-Countdown                           |
| `tagesabschluss`     | Tagesabschluss am Abend                             |
| `schueler-app`       | Fahrschüler-App: Fortschritt und nächster Termin    |
| `buchung`            | Fahrschüler-App: freie Termine buchen               |

Zehn bis zwölf Stück sind genug. Reihenfolge und Vollständigkeit sind nicht
kritisch; die Galerie richtet sich nach dem, was da ist.

## Worauf es ankommt

- **Testaccount.** Es dürfen keine echten Fahrschülernamen drauf sein.
- **Heller Modus.** Die Website zeigt die App hell; dunkle Aufnahmen fallen
  aus der Reihe.
- **Voller Bildschirm**, ohne Hochformat-Beschnitt. Die Statusleiste oben
  darf drauf bleiben, das Werkzeug schneidet sie weg.
- Ein Gerät für alle Aufnahmen, damit alle dieselben Maße haben.

## Danach

```bash
python3 werkzeug/iphone.py
```

Das Werkzeug schneidet die Statusleiste ab, bringt alle Bilder auf dieselbe
Größe, wandelt sie nach WebP und legt sie in `images/iphone/` ab. Danach
stehen sie auf der Website in der Gerätehülle.
