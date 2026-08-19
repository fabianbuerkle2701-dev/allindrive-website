# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Statisches HTML/CSS/JS ohne Build-Schritt, selbst gehostete Schriften, Deploy auf Netlify.
Vom Nutzer im Auftrag vorgegeben; entspricht der Konvention der Schwesterprojekte
(`ari-fahrschule-website`, `fahrschule-strauch-website`) und der App selbst, die als
einzelne `index.html` ohne Build ausgeliefert wird.

## Users

**Primär: Fahrschulinhaber und selbstständige Fahrlehrer in Deutschland.** Sie sitzen den
ganzen Tag im Auto und erledigen die Verwaltung abends oder zwischen zwei Fahrstunden auf
dem Handy. Der Job, den sie erledigen wollen: den Ausbildungsstand jedes Fahrschülers
kennen, ohne Papier zu suchen, und die Bürozeit nach Feierabend loswerden.

**Sekundär: angestellte Fahrlehrer im Team.** Sie dokumentieren im Auto direkt nach der
Fahrstunde und müssen den Stand eines Schülers sehen, den sonst ein Kollege fährt.

**Dritte Gruppe: Fahrschüler.** Sie wollen ihren Fortschritt, ihre Termine und ihre
Begleitfahrten selbst sehen, statt in der Fahrschule anzurufen.

Die Kaufentscheidung trifft fast immer der Inhaber allein, oft ohne IT-Kenntnisse und ohne
Zeit für eine Einführung.

## Product Purpose

Allindrive ist eine vollständige Fahrschulverwaltung: digitale Ausbildungsdiagrammkarte,
Terminplanung, Fahrschülerakte, Fuhrpark, Prüfungsorganisation — plus eine eigene App für
Fahrschüler und eine KI-Schicht, die Routinearbeit übernimmt.

Erfolg heißt: Die Verwaltungszeit des Fahrlehrers sinkt von 8–15 Stunden pro Woche auf
unter eine Stunde, und der Ausbildungsstand jedes Schülers ist jederzeit ohne Rückfrage
sichtbar.

## Positioning

Andere Fahrschulsoftware ist ein Werkzeug, das der Fahrlehrer bedient. Allindrive ist ein
System, das selbst handelt und sich bestätigen lässt: Es erfasst Daten per KI aus Fotos und
Screenshots, schlägt aus den Fahrstunden-Mustern das nächste Trainingsziel vor, meldet
Prüfungsreife, und liefert dem Fahrlehrer morgens einen Digest statt einer Aufgabenliste.

Zweiter, kopiersicherer Unterschied: Allindrive ist nicht nur Fahrlehrer-Software. Es bringt
eine eigene Fahrschüler-App mit — als Web-App und als native App für iOS und Android — die
den größten Teil der eingehenden Anrufe überflüssig macht.

## Operating Context

- Dokumentiert wird **im Auto, auf dem Handy, oft mit einer Hand und bei schlechtem Netz**.
  Große Tippziele, wenige Schritte und Bedienbarkeit ohne stabile Verbindung sind keine
  Komfortfrage, sondern Voraussetzung.
- Der Inhaber schaut **abends** auf Auslastung, Prüfungsreife und offene Punkte.
- Fahrschulen arbeiten heute überwiegend mit **Papier-ADK im Handschuhfach** oder mit
  Software, die nur am Bürorechner läuft.
- Rechtlicher Rahmen, der Teil des Alltags ist: FahrschAusbO (Sonderfahrten, Pflicht-UE),
  §31 FahrlG (Aufbewahrungs- und Löschfristen), DSGVO, ab 2027 die geplante
  Veröffentlichung von Prüfungserfolgsquoten über die Mobilithek.
- Fachvokabular, das die Seite korrekt verwenden muss: ADK / Ausbildungsdiagrammkarte,
  Ausbildungsnachweis, UE (Unterrichtseinheit, 45 Minuten), Sonderfahrten (Überland,
  Autobahn, Dunkelheit), Grundstoff/Zusatzstoff, B197, BF17, B96, Prüfungssimulation.

## Capabilities and Constraints

**Belegt vorhanden** (Stand App-Version 1.119.2, Quelle: `Fahrschule-app/index.html`,
`netlify/functions/`, `mobile/`):

- Digitale ADK mit Ausbildungsstand, Strecken und Sonderfahrten
- Kalender, Terminbuchung durch Fahrschüler, Terminserien, Fahrzeug-Kalender
- Prüfungssimulation mit KI-gestützter Fehlerklassifikation
- Prüfungsreife-Berechnung, Quotenpilot (Erfolgsquoten nach Klasse und Zeitraum)
- KI-Datenerfassung aus Fotos und Screenshots (Schülerdaten, Termine, ADK-Karten)
- KI-Übergabe-Einschätzung beim Schülerwechsel, als PDF druckbar
- Warteliste, Interessentenverwaltung, Empfehlungsprogramm
- Fahrzeugverwaltung mit TÜV-Countdown, Kilometerstand, Fahrtenbuch
- Statistik, Tagesabschluss, Morgen-Briefing, Push-Benachrichtigungen
- Eigene Fahrschüler-App mit Fortschritt, Terminen, Begleitfahrten
- Plattformen: Web/PWA sowie native Apps für iOS und Android
  (`com.allindrive.lehrer`, `com.allindrive.schueler`)

**Bewusst ausgeklammert — darf auf der Website nicht beworben werden:**
Rechnungen, Abrechnung, Quittungen, Zahlungen, Mahnwesen, Umsatz/Finanzen,
Steuerberater-Export sowie die Theorie-Lern-App inklusive Theorie üben und Probeprüfung.
Diese Funktionen sind teils vorhanden, aber nicht fertig. Der Master-Schalter
`THEORY_UEBEN_RELEASED` ist bewusst ausgeschaltet, weil der amtliche Fragenkatalog nicht
lizenziert ist.

**Offen / vom Nutzer noch nicht entschieden:**

- Preise. Entscheidung: Die Website nennt **keine Beträge**, sondern positioniert das
  Produkt als Beta mit persönlicher Preisabsprache.
- Firmenname, Anschrift, USt-IdNr., Domain. Rechtsseiten werden als Gerüst mit deutlich
  markierten Platzhaltern gebaut.
- Kein Wettbewerber wird namentlich genannt. Vergleiche laufen gegen „Papier-ADK" und
  „klassische Fahrschulsoftware".

## Brand Commitments

- Name: **Allindrive**
- Wortmarke wird als `ALLINDRIVE.` mit Punkt gesetzt (so in beiden Strategiepapieren)
- Bildmarke: AD-Monogramm, dunkles „A" mit gestrichelter Fahrbahn, orangefarbenes „D"
  (`images/logo.png`, `images/logo-dark.png`)
- Farben aus der App: Orange `#FF9300` als Marken- und Aktionsfarbe, Tinte `#2B2117`,
  warmes Papier `#FBF3E6`, Linie `#EBDFC9`
- Schriften aus der App, aus dem App-Bundle extrahiert und selbst gehostet:
  **Baloo 2** (Auszeichnung) und **Karla** (Fließtext)
- Kein Abruf bei Google Fonts, kein Tracking, keine externen Skripte — Konvention aus den
  Schwesterprojekten, spart eine Einwilligungskategorie
- Ansprache: Du-Form, wie in der App und auf den Schwesterseiten
- Zielsystem der Haupt-Aktion: `https://allindrive.netlify.app`
  (Fahrschüler-App: `https://allindrive.netlify.app/?app=schueler`)

## Evidence on Hand

- `Allindrive-Masterplan-Autonome-Fahrschule.pdf` — Autonomie-Stufenmodell, acht Säulen,
  Kennzahlen (8–15 Std./Woche heute, Ziel unter 1 Std.)
- `Allindrive-Konzept-KI-Verwaltung.pdf` — was die App heute schon ersetzt, Fahrplan
- `Fahrschule-app/` — die laufende App als Beleg jeder Funktionsbehauptung
- Marken-Assets: Logo hell/dunkel, App-Icons, die beiden Schriften

**Nicht vorhanden, darf nicht erfunden werden:** Kundenstimmen, Referenzfahrschulen,
Nutzerzahlen, Auszeichnungen, Zertifikate, Presseerwähnungen, Preise, Testimonials.
Die eigene Fahrschule des Inhabers ist Pilotbetrieb — belastbare Zahlen daraus liegen noch
nicht vor und dürfen nicht als Ergebnis dargestellt werden.

## Product Principles

1. **Nur zeigen, was die App wirklich kann.** Jede Funktionsbehauptung ist im Code der App
   belegbar. Halbfertiges wird weggelassen, nicht in die Zukunft verlegt.
2. **Beweisen statt behaupten.** Die Seite zeigt die Oberfläche bei der Arbeit, nicht
   Adjektive über sie.
3. **Der Fahrlehrer entscheidet, die KI arbeitet zu.** Autonomie ist einstellbar und jede
   Aktion ist protokolliert und rückholbar — das ist Verkaufsargument und Rechtsposition
   zugleich.
4. **Die Fahrschüler-App ist Teil des Produkts, nicht Zubehör.** Sie ist der Grund, warum
   das Telefon still bleibt.
5. **Keine Daten Dritter.** Keine Fremdskripte, keine Fonts von Google, kein Tracking —
   auf einer Seite, die DSGVO-Kompetenz verkauft, ist das Substanz und nicht Kosmetik.

## Accessibility & Inclusion

Zielgruppe bedient das Produkt im Auto und bei Sonnenlicht, ein relevanter Teil ist über 50.
Verbindlich: Kontrast mindestens WCAG AA, Tippziele ab 44 px, vollständige Tastaturbedienung,
sichtbarer Fokus, respektiertes `prefers-reduced-motion`, und die Seite bleibt ohne
JavaScript vollständig lesbar.
