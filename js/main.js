/* =========================================================================
   ALLINDRIVE — Seitenverhalten

   Die Seite funktioniert vollständig ohne dieses Skript: alle Abschnitte
   sind sichtbar, das Menü ist aufgeklappt, jeder Link führt irgendwohin.
   Hier kommt nur Bewegung und Bequemlichkeit dazu.

   Alles Scroll-Abhängige hängt an einer einzigen rAF-Schleife. Ein eigener
   Zuhörer je Effekt ruckelt auf dem Handy sofort, weil jeder von ihnen das
   Layout neu ausmisst.

   Wer "Bewegung reduzieren" eingestellt hat, bekommt denselben Endzustand,
   nur ohne den Weg dorthin.
   ========================================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");
  var feinerZeiger = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  root.classList.add("js");

  /* ---------------------------------------------------------- Ladebildschirm

     Zählt von 000 auf 100 und verschwindet dann. Der Zähler folgt der Zeit,
     nicht dem tatsächlichen Ladefortschritt: Der lässt sich im Browser
     nicht ehrlich messen, und ein Balken, der bei 40 Prozent hängt und dann
     springt, ist schlechter als einer, der gleichmässig läuft.

     Wer die Seite mit reduzierter Bewegung öffnet, sieht ihn gar nicht. */

  var laden = document.querySelector("[data-laden]");

  function ladenWeg() {
    if (!laden) return;
    laden.classList.add("ist-weg");
    window.setTimeout(function () {
      if (laden) laden.remove();
      laden = null;
    }, 700);
  }

  if (laden) {
    if (ruhig.matches) {
      ladenWeg();
    } else {
      var zahl = laden.querySelector("[data-laden-zahl]");
      var balken = laden.querySelector("[data-laden-balken]");
      var worte = [].slice.call(laden.querySelectorAll(".laden__wort"));
      var DAUER = 2400;
      var start = null;

      // Die wechselnden Worte laufen unabhängig vom Zähler.
      var wortNr = 0;
      var wortTakt = window.setInterval(function () {
        worte[wortNr].classList.remove("ist-an");
        worte[wortNr].classList.add("ist-weg");
        wortNr = (wortNr + 1) % worte.length;
        worte[wortNr].classList.remove("ist-weg");
        worte[wortNr].classList.add("ist-an");
      }, 900);

      var lauf = function (t) {
        if (start === null) start = t;
        var p = Math.min((t - start) / DAUER, 1);
        // Zum Ende hin langsamer: ein Zähler, der gleichmässig läuft und
        // dann abrupt stoppt, wirkt abgeschnitten.
        var eased = 1 - Math.pow(1 - p, 2.2);
        var n = Math.round(eased * 100);
        if (zahl) zahl.textContent = String(n).padStart(3, "0");
        if (balken) balken.style.transform = "scaleX(" + eased.toFixed(4) + ")";
        if (p < 1) {
          requestAnimationFrame(lauf);
        } else {
          window.clearInterval(wortTakt);
          window.setTimeout(ladenWeg, 400);
        }
      };
      requestAnimationFrame(lauf);

      /* Notbremse. Der Zähler hängt an requestAnimationFrame, und das
         steht still, solange der Tab im Hintergrund liegt. Ohne diese
         Zeile findet man beim Zurückschalten eine schwarze Fläche vor —
         der Ladebildschirm deckt die ganze Seite ab und wartet auf ein
         Bild, das nie kommt.

         Eine Dekoration darf die Seite nicht unbenutzbar machen, also
         räumt eine schlichte Zeitschaltung sie notfalls ohne den Zähler
         weg. setTimeout wird im Hintergrund zwar gedrosselt, feuert aber. */
      window.setTimeout(ladenWeg, DAUER + 1600);
    }
  }

  /* ------------------------------------------------------------ Klappmenü */

  var burger = document.querySelector("[data-schalter='menue']");
  var schublade = document.getElementById("menue");

  if (burger && schublade) {
    schublade.hidden = true;
    burger.setAttribute("aria-expanded", "false");

    burger.addEventListener("click", function () {
      var offen = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!offen));
      burger.setAttribute("aria-label", offen ? "Menü öffnen" : "Menü schließen");
      schublade.hidden = offen;
    });

    // Ohne Esc sitzt man auf dem Handy im offenen Menü fest, sobald die
    // Tastatur dazwischenfunkt.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Menü öffnen");
        schublade.hidden = true;
        burger.focus();
      }
    });

    // Ein Klick daneben schliesst ebenfalls.
    document.addEventListener("click", function (e) {
      if (burger.getAttribute("aria-expanded") !== "true") return;
      if (schublade.contains(e.target) || burger.contains(e.target)) return;
      burger.setAttribute("aria-expanded", "false");
      schublade.hidden = true;
    });
  }

  /* ------------------------------------------------------------ Nachtfahrt

     Der Hintergrund ist kein Film, sondern eine gezeichnete Strasse. Das
     hat drei Gründe: Es passt zum Thema, es lädt keine Megabyte nach, und
     es holt keine Daten von einem fremden Server. Vorher lief hier ein
     Galaxie-Clip von einem Video-Dienst — hübsch, aber themenfremd, 290 KB
     Abspieler schwer und eine Adresse mehr in der Datenschutzerklärung.

     Gezeichnet wird in Zentralperspektive: Ein Punkt (x, z) auf der
     Fahrbahn — x seitlich, z nach vorn, beides in Metern — landet auf dem
     Bildschirm bei x * f / z. Alles Weitere fällt daraus heraus: Die
     Fahrbahn läuft im Fluchtpunkt zusammen, Striche werden mit der
     Entfernung kürzer und schmaler, Laternen rücken zusammen.

     Bewegung entsteht allein dadurch, dass "weg" wächst. Die Striche
     springen dabei nicht: Ihr erster liegt immer bei
     ABSTAND - (weg % ABSTAND), also wandert die ganze Reihe mit.

     Wer "Bewegung reduzieren" eingestellt hat, bekommt ein Standbild
     derselben Strasse.

     Liegt später eine echte Aufnahme vor, trägt man sie als
     data-fahrt-video="video/fahrt.mp4" an der Leinwand ein; dann tritt
     sie an deren Stelle. */

  var STRECKE = {
    HORIZONT: 0.45,   // Anteil der Bildhöhe
    KAMERA: 1.5,      // Augenhöhe über der Fahrbahn, Meter
    SPUR: 3.4,        // Spurbreite, Meter
    TEMPO: 16,        // Meter je Sekunde, rund 58 km/h
    NAH: 2.8,         // nächster gezeichneter Punkt
    FERN: 165,        // fernster
    STUFEN: 44        // Stützstellen zwischen beiden
  };

  // Fahrbahnkanten und Mittellinie, gemessen von der Kamera aus. Die Kamera
  // sitzt mittig in der rechten Spur, deshalb liegt die Mitte links.
  var RAND_R = STRECKE.SPUR / 2;
  var MITTE = -STRECKE.SPUR / 2;
  var RAND_L = -STRECKE.SPUR * 1.5;

  function nachtfahrt(leinwand) {
    var ctx = leinwand.getContext("2d", { alpha: false });
    if (!ctx) return;

    var B = 1, H = 1;
    var weg = 0;
    var laeuft = false;
    var vorher = 0;
    var versatz = 0; // Kurvenversatz direkt vor der Kamera

    /* Die meisten Verläufe hängen nur an der Fenstergrösse: Himmel, Boden,
       Fahrbahn, Spurrillen, Markierungen, Nebel, Randabdunklung. Sie bei
       jedem Bild neu zu bauen heisst neun weggeworfene Objekte je Bild,
       also über fünfhundert je Sekunde — auf einem älteren Handy merkt man
       das am Aufräumen. Sie liegen deshalb hier und werden nur beim Messen
       erneuert.

       Nicht dabei: Dunst, Laternen und Abblendlicht. Die hängen an der
       Kurve und ändern sich mit jedem Bild wirklich. */
    var vorrat = null;

    function messen() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var k = leinwand.getBoundingClientRect();
      B = Math.max(k.width, 1);
      H = Math.max(k.height, 1);
      leinwand.width = Math.round(B * dpr);
      leinwand.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      vorrat = null;
    }

    function markierung(hz, staerke) {
      var g = ctx.createLinearGradient(0, H, 0, hz);
      g.addColorStop(0, "rgba(236, 236, 240, " + (staerke * 0.42).toFixed(3) + ")");
      g.addColorStop(0.22, "rgba(240, 240, 244, " + staerke.toFixed(3) + ")");
      g.addColorStop(0.8, "rgba(236, 236, 240, " + (staerke * 0.4).toFixed(3) + ")");
      g.addColorStop(1, "rgba(236, 236, 240, 0)");
      return g;
    }

    function vorratFuellen() {
      var hz = horizont();
      var v = {};

      v.himmel = ctx.createLinearGradient(0, 0, 0, hz);
      v.himmel.addColorStop(0, "#06060a");
      v.himmel.addColorStop(0.6, "#0a0a10");
      v.himmel.addColorStop(1, "#181119");

      /* Der erste Farbstopp des Bodens ist genau die Himmelsfarbe am
         Horizont — sonst zieht sich dort eine sichtbare waagerechte Kante
         quer durchs Bild, und die verrät die Zeichnung sofort. */
      v.grund = ctx.createLinearGradient(0, hz - 2, 0, H);
      v.grund.addColorStop(0, "#181119");
      v.grund.addColorStop(0.14, "#0d0c11");
      v.grund.addColorStop(1, "#08080b");

      v.bankett = ctx.createLinearGradient(0, hz, 0, H);
      v.bankett.addColorStop(0, "#181220");
      v.bankett.addColorStop(0.3, "#0e0d12");
      v.bankett.addColorStop(1, "#16161c");

      /* Der Verlauf der Decke ersetzt einen zweiten, grossen Lichtschein:
         Nah ist sie hell, weil das eigene Licht sie trifft, fern verliert
         sie sich im Dunst. */
      v.decke = ctx.createLinearGradient(0, hz, 0, H);
      v.decke.addColorStop(0, "#221a2c");
      v.decke.addColorStop(0.22, "#20202a");
      v.decke.addColorStop(0.62, "#2b2b36");
      v.decke.addColorStop(1, "#3c3c49");

      /* Spurrillen: Wo die Räder laufen, ist die Decke blank gefahren und
         wirft mehr Licht zurück. Nimmt der Fahrbahn das Gleichmässige. */
      v.rille = ctx.createLinearGradient(0, H, 0, hz);
      v.rille.addColorStop(0, "rgba(255, 246, 232, 0.05)");
      v.rille.addColorStop(0.35, "rgba(255, 246, 232, 0.024)");
      v.rille.addColorStop(1, "rgba(255, 246, 232, 0)");

      /* Nebel: schluckt den Übergang zum Horizont. Er greift nach oben in
         den Himmel hinein, damit dort keine Kante stehen bleibt. */
      v.nebel = ctx.createLinearGradient(0, hz - H * 0.1, 0, hz + H * 0.24);
      v.nebel.addColorStop(0, "rgba(20, 15, 22, 0)");
      v.nebel.addColorStop(0.29, "rgba(20, 15, 22, 0.94)");
      v.nebel.addColorStop(0.55, "rgba(18, 14, 20, 0.52)");
      v.nebel.addColorStop(1, "rgba(16, 13, 18, 0)");

      v.rand = ctx.createRadialGradient(B / 2, H * 0.55, H * 0.22, B / 2, H * 0.55, H * 0.95);
      v.rand.addColorStop(0, "rgba(0, 0, 0, 0)");
      v.rand.addColorStop(1, "rgba(0, 0, 0, 0.46)");

      /* Die Deckkraft der Markierungen steckt im Verlauf statt in einem
         festen Wert: Unten am Bildrand rauscht die Fahrbahn vorbei und ein
         greller Strich fällt dort als Fleck auf, am Horizont verschluckt
         ihn der Dunst. Ein Verlauf erledigt beide Enden auf einmal. */
      v.randlinie = markierung(hz, 0.52);
      v.strich = markierung(hz, 0.95);

      v.hz = hz;
      vorrat = v;
      return v;
    }

    /* Die Brennweite in Pixeln. Sie bestimmt, wie weit sich die Fahrbahn
       zum unteren Bildrand hin öffnet — und zusammen mit NAH, ob sie den
       Rand überhaupt erreicht. Bei H * 0.74 endete sie zweihundert Pixel
       darüber und stand als schmaler Keil im leeren Schwarz. */
    function brenn() { return H * 1.0; }
    function horizont() { return H * STRECKE.HORIZONT; }

    /* Zwei überlagerte Wellen: eine kurze für die Biegung, die man gerade
       durchfährt, eine lange für den Verlauf dahinter. Eine allein sieht
       nach Slalom aus. */
    function kurve(z) {
      var t = weg + z;
      return Math.sin(t * 0.0122) * 12 + Math.sin(t * 0.0039) * 27;
    }

    // Waagerecht: seitliche Lage x in der Entfernung z.
    function bx(x, z) {
      return B / 2 + ((x - (kurve(z) - versatz)) * brenn()) / z;
    }
    // Senkrecht: Höhe h über der Fahrbahn in der Entfernung z.
    function by(z, h) {
      return horizont() + ((STRECKE.KAMERA - (h || 0)) * brenn()) / z;
    }

    // Stützstellen logarithmisch: Nah braucht die Fahrbahn viele Punkte,
    // fern laufen sie ohnehin auf demselben Pixel zusammen.
    function tiefe(i) {
      return STRECKE.NAH * Math.pow(STRECKE.FERN / STRECKE.NAH, i / STRECKE.STUFEN);
    }

    /* Ein Band auf der Fahrbahn: Fahrbahndecke, Randlinie, Mittelstrich.
       Die Breite steht in Metern, nicht in Pixeln — nur so wird der Strich
       nach hinten von selbst schmaler. */
    function band(xVon, xBis, zVon, zBis, schritte, farbe) {
      var i, z, p;
      ctx.beginPath();
      for (i = 0; i <= schritte; i++) {
        p = i / schritte;
        z = zVon * Math.pow(zBis / zVon, p);
        ctx[i ? "lineTo" : "moveTo"](bx(xVon, z), by(z));
      }
      for (i = schritte; i >= 0; i--) {
        p = i / schritte;
        z = zVon * Math.pow(zBis / zVon, p);
        ctx.lineTo(bx(xBis, z), by(z));
      }
      ctx.closePath();
      ctx.fillStyle = farbe; // Farbe oder Verlauf
      ctx.fill();
    }

    /* Laterne: Mast, Ausleger, Leuchte, Streulicht und der Lichtkegel auf
       der Fahrbahn. Natriumdampf ist genau das Orange der Seite — das ist
       Zufall, aber ein günstiger.

       Zwei Blenden, nicht eine: fern, weil das Licht im Dunst verschwindet,
       und nah, weil der Mast sonst als handbreiter Balken durchs Bild
       schiebt, sobald man an ihm vorbeifährt. */
    function laterne(z) {
      if (z < 4) return;
      var fern = Math.max(0, Math.min(1, (STRECKE.FERN - z) / 95));
      var nah = Math.min(1, (z - 4) / 11);
      var a = fern * nah;
      if (a < 0.02) return;

      var xMast = RAND_R + 1.5;
      var hoehe = 8.6;
      var xKopf = RAND_R - 0.4;
      var naehe = Math.min(brenn() / z, 240);

      var fussX = bx(xMast, z), fussY = by(z);
      var kopfX = bx(xMast, z), kopfY = by(z, hoehe);
      var lampX = bx(xKopf, z), lampY = by(z, hoehe);

      /* Mast: unten fast unsichtbar, oben etwas heller, wo die eigene
         Leuchte ihn streift. Nachts sieht man von einem Mast nur das, was
         beleuchtet wird — zeichnet man ihn durchgehend gleich hell, wird
         aus der Strasse eine technische Zeichnung.

         Der Ausleger ist gebogen, nicht rechtwinklig. Ein rechter Winkel
         liest sich als Diagramm. */
      var mast = ctx.createLinearGradient(fussX, fussY, kopfX, kopfY);
      mast.addColorStop(0, "rgba(24, 24, 30, " + (a * 0.22).toFixed(3) + ")");
      mast.addColorStop(0.7, "rgba(46, 43, 44, " + (a * 0.34).toFixed(3) + ")");
      mast.addColorStop(1, "rgba(96, 80, 60, " + (a * 0.5).toFixed(3) + ")");
      ctx.strokeStyle = mast;
      ctx.lineWidth = Math.max(0.7, naehe * 0.014);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fussX, fussY);
      ctx.lineTo(kopfX, kopfY);
      ctx.quadraticCurveTo(
        bx(xMast, z), by(z, hoehe + 0.9),
        lampX, lampY
      );
      ctx.stroke();

      // Streulicht um die Leuchte
      var r = Math.max(9, naehe * 0.4);
      var hof = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, r);
      hof.addColorStop(0, "rgba(255, 226, 178, 0.95)");
      hof.addColorStop(0.08, "rgba(255, 182, 88, 0.72)");
      hof.addColorStop(0.3, "rgba(255, 147, 0, 0.28)");
      hof.addColorStop(1, "rgba(255, 147, 0, 0)");
      ctx.globalAlpha = a;
      ctx.fillStyle = hof;
      ctx.beginPath();
      ctx.arc(lampX, lampY, r, 0, Math.PI * 2);
      ctx.fill();

      // Lichtkegel auf der Fahrbahn: als flachgedrückter Kreis, weil ein
      // exakt projizierter Kegel bei dieser Grösse gleich aussieht und ein
      // Vielfaches kostet.
      var pX = bx(xKopf, z), pY = by(z);
      var pB = Math.max(11, naehe * 0.32);
      var pH = Math.max(2, naehe * 0.05);
      var pfuetze = ctx.createRadialGradient(pX, pY, 0, pX, pY, pB);
      pfuetze.addColorStop(0, "rgba(255, 172, 66, 0.5)");
      pfuetze.addColorStop(0.55, "rgba(255, 147, 0, 0.16)");
      pfuetze.addColorStop(1, "rgba(255, 147, 0, 0)");
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = pfuetze;
      ctx.save();
      ctx.translate(pX, pY);
      ctx.scale(1, pH / pB);
      ctx.beginPath();
      ctx.arc(0, 0, pB, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function bild() {
      var v = vorrat || vorratFuellen();
      var hz = v.hz;

      ctx.fillStyle = v.himmel;
      ctx.fillRect(0, 0, B, hz + 1);

      ctx.fillStyle = v.grund;
      ctx.fillRect(0, hz - 2, B, H - hz + 2);

      band(RAND_L - 4.5, RAND_R + 4.5, STRECKE.NAH, STRECKE.FERN, STRECKE.STUFEN, v.bankett);
      band(RAND_L, RAND_R, STRECKE.NAH, STRECKE.FERN, STRECKE.STUFEN, v.decke);

      // Randlinien, durchgezogen
      band(RAND_L - 0.06, RAND_L + 0.06, STRECKE.NAH, STRECKE.FERN, STRECKE.STUFEN, v.randlinie);
      band(RAND_R - 0.06, RAND_R + 0.06, STRECKE.NAH, STRECKE.FERN, STRECKE.STUFEN, v.randlinie);

      band(-1.15, -0.5, STRECKE.NAH, STRECKE.FERN, STRECKE.STUFEN, v.rille);
      band(0.5, 1.15, STRECKE.NAH, STRECKE.FERN, STRECKE.STUFEN, v.rille);

      // Mittelstriche: 3 m Strich, 9 m Lücke, wie auf der Landstrasse.
      var ABSTAND = 12, STRICH = 3;
      var z0 = ABSTAND - (weg % ABSTAND);
      for (var k = 0; k < 14; k++) {
        var za = z0 + k * ABSTAND;
        if (za < STRECKE.NAH) continue;
        if (za > STRECKE.FERN) break;
        band(MITTE - 0.07, MITTE + 0.07, za, Math.min(za + STRICH, STRECKE.FERN), 3, v.strich);
      }

      // Laternen, von hinten nach vorn, damit nahe über fernen liegen.
      var LAT = 26;
      var l0 = LAT - (weg % LAT);
      for (var m = 8; m >= 0; m--) laterne(l0 + m * LAT);

      ctx.fillStyle = v.nebel;
      ctx.fillRect(0, hz - H * 0.1, B, H * 0.34);

      /* Dunst über dem Fluchtpunkt: Stadtlicht am Horizont. Liegt bewusst
         über Himmel UND Boden — läge er nur über dem Himmel, zeichnete
         sich am Horizont eine waagerechte Kante ab, weil die eine Hälfte
         orange getönt wäre und die andere nicht. Wandert mit der Kurve,
         lässt sich also nicht vorrätig halten. */
      var dunstX = bx(MITTE, STRECKE.FERN);
      var dunst = ctx.createRadialGradient(dunstX, hz, 0, dunstX, hz, H * 0.3);
      dunst.addColorStop(0, "rgba(255, 156, 30, 0.28)");
      dunst.addColorStop(0.3, "rgba(255, 147, 0, 0.08)");
      dunst.addColorStop(1, "rgba(255, 147, 0, 0)");
      ctx.fillStyle = dunst;
      ctx.fillRect(0, 0, B, H);

      /* Eigenes Abblendlicht: zwei schmale Kegel, kein breiter Schein. Der
         helle Fleck gehört auf die Fahrbahn direkt vor das Auto, sonst
         wirkt es wie Tageslicht statt wie zwei Scheinwerfer. */
      ctx.globalCompositeOperation = "lighter";
      [-1.15, 1.15].forEach(function (dx) {
        var sX = bx(dx, 9), sY = by(13);
        var r = H * 0.24;
        var kegel = ctx.createRadialGradient(sX, sY, 0, sX, sY, r);
        kegel.addColorStop(0, "rgba(158, 138, 106, 1)");
        kegel.addColorStop(0.42, "rgba(64, 56, 44, 1)");
        kegel.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = kegel;
        ctx.save();
        ctx.translate(sX, sY);
        ctx.scale(1.7, 1);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = v.rand;
      ctx.fillRect(0, 0, B, H);
    }

    function schritt(t) {
      if (!laeuft) return;
      var dt = vorher ? Math.min(t - vorher, 100) : 16.7;
      vorher = t;
      weg += (dt * STRECKE.TEMPO) / 1000;
      versatz = kurve(0);
      bild();
      requestAnimationFrame(schritt);
    }

    messen();
    versatz = kurve(0);
    bild();

    if (ruhig.matches) return;

    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        messen();
        bild();
      }).observe(leinwand);
    } else {
      window.addEventListener("resize", function () { messen(); bild(); }, { passive: true });
    }

    // Nur zeichnen, solange die Fläche im Bild ist. Zwei Vollbild-Leinwände,
    // die dauerhaft rechnen, merkt man auf einem älteren Gerät sofort.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        var drin = e[0].isIntersecting;
        if (drin === laeuft) return;
        laeuft = drin;
        vorher = 0;
        if (drin) requestAnimationFrame(schritt);
      }, { rootMargin: "120px" }).observe(leinwand);
    } else {
      laeuft = true;
      requestAnimationFrame(schritt);
    }
  }

  [].slice.call(document.querySelectorAll("[data-fahrt]")).forEach(function (l) {
    var eigen = l.dataset.fahrtVideo;
    if (eigen) {
      // Echte Aufnahme vorhanden: die tritt an die Stelle der gezeichneten.
      var v = document.createElement("video");
      v.src = eigen;
      v.autoplay = v.muted = v.loop = v.playsInline = true;
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("aria-hidden", "true");
      l.replaceWith(v);
      return;
    }
    nachtfahrt(l);
  });

  /* --------------------------------------------------- Wechselndes Rollwort

     Ein Wort in der Auftaktzeile wechselt. Das Element wird jedes Mal neu
     gesetzt, damit die Einblend-Animation erneut anläuft. */

  var rolle = document.querySelector("[data-rollen]");

  if (rolle && !ruhig.matches) {
    var rollen = rolle.dataset.rollen.split("|");
    var rNr = 0;
    window.setInterval(function () {
      rNr = (rNr + 1) % rollen.length;
      var neu = document.createElement("span");
      neu.className = "rolle__wort";
      neu.textContent = rollen[rNr];
      rolle.replaceChildren(neu);
    }, 2400);
  }

  /* ------------------------------------------------------- Abschnitte auf

     Ein einziger Ablauf für alle Abschnitte: leicht heben und aufblenden,
     sobald sie ins Bild kommen. Geschwister kommen gestaffelt, damit eine
     Reihe nicht als Block springt.

     Einmalig ist Absicht. Ein Abschnitt, der beim Zurückscrollen erneut
     einblendet, wirkt beim zweiten Mal wie ein Fehler. */

  var sichtbar = document.querySelectorAll(".auf");
  var beobachter = null;

  if ("IntersectionObserver" in window && !ruhig.matches) {
    beobachter = new IntersectionObserver(
      function (eintraege) {
        eintraege.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("ist-da");
          e.target.querySelectorAll("[data-zaehler]").forEach(zaehlenLassen);
          if (e.target.hasAttribute("data-zaehler")) zaehlenLassen(e.target);
          e.target.querySelectorAll("[data-soll]").forEach(sollFuellen);
          if (e.target.hasAttribute("data-soll")) sollFuellen(e.target);
          beobachter.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0 }
    );

    sichtbar.forEach(function (el) {
      var platz = el.parentElement
        ? Array.prototype.indexOf.call(el.parentElement.children, el)
        : 0;
      el.style.transitionDelay = Math.min(platz, 6) * 70 + "ms";
      beobachter.observe(el);
    });

    document.querySelectorAll("[data-zaehler], [data-soll]").forEach(function (el) {
      if (!el.classList.contains("auf")) beobachter.observe(el);
    });
  } else {
    sichtbar.forEach(function (el) {
      el.classList.add("ist-da");
    });
    document.querySelectorAll("[data-zaehler]").forEach(zaehlenLassen);
    document.querySelectorAll("[data-soll]").forEach(sollFuellen);
  }

  /* Zahlen laufen hoch, statt einfach dazustehen. */
  function zaehlenLassen(el) {
    if (el.dataset.gelaufen) return;
    el.dataset.gelaufen = "1";
    var ziel = parseFloat(el.dataset.zaehler);
    if (isNaN(ziel)) return;
    var nach = el.dataset.zaehlerNach || "";
    if (ruhig.matches) {
      el.textContent = ziel + nach;
      return;
    }
    var dauer = 1400;
    var start = null;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dauer, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ziel * eased) + nach;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Die Soll-Balken füllen sich erst, wenn sie im Bild sind. */
  function sollFuellen(el) {
    if (el.dataset.gefuellt) return;
    el.dataset.gefuellt = "1";
    var band = el.querySelector(".soll__band i");
    if (band) band.style.setProperty("--soll", el.dataset.soll);
  }

  /* ------------------------------------------------------------- Laufband

     Zwei gleiche Hälften nebeneinander, die erste wandert um ihre eigene
     Breite nach links und springt dann zurück. Weil die zweite Hälfte
     identisch ist, sieht man den Sprung nicht.

     Das Tempo steht in Pixeln je Sekunde, nicht in Prozent der Spur. Sonst
     hinge es daran, wie viele Worte drinstehen: ein Wort mehr, und das
     ganze Band läuft schneller. So bleibt es gleich, egal wie lang die
     Liste wird oder wie breit das Fenster ist.

     58 px/s heisst: ein Wort braucht rund fünfzehn Sekunden von rechts nach
     links. Das ist langsam genug zum Mitlesen — schneller wird es zur
     Laufschrift, die man nur noch als Flackern wahrnimmt. */

  var LAUFTEMPO = 58;

  var laufbaender = ruhig.matches
    ? []
    : [].slice.call(document.querySelectorAll("[data-laufband]"));

  laufbaender.forEach(function (spur) {
    spur.innerHTML += spur.innerHTML;
  });

  // Die halbe Spurbreite ist der Rücksprungpunkt. Erst nach dem Laden der
  // Schriften messen: vorher steht dort die Breite der Ersatzschrift.
  function laufbandMessen() {
    laufbaender.forEach(function (spur) {
      spur.dataset.halbe = String(spur.scrollWidth / 2);
    });
  }

  if (laufbaender.length) {
    laufbandMessen();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(laufbandMessen);
    }
    window.addEventListener("resize", laufbandMessen, { passive: true });
  }

  /* --------------------------------------------------------- Parallaxsäulen

     Zwei Spalten, die sich beim Scrollen unterschiedlich schnell bewegen.
     Der Wert kommt aus data-tempo; negative Werte laufen gegen die
     Scrollrichtung. */

  var saeulen = ruhig.matches
    ? []
    : [].slice.call(document.querySelectorAll("[data-tempo]"));

  /* ----------------------------------------------------------- Kopfzeile */

  var top = document.querySelector("[data-top]");

  /* ------------------------------------------------------- Scroll-Schleife */

  var marken = document.querySelectorAll(".ad");
  var letzte = window.scrollY;
  var tempo = 0;
  var geplant = false;
  var laufbandWeg = 0;
  var zuletzt = 0;

  function zeichnen(jetztMs) {
    var y = window.scrollY;
    var dt = zuletzt ? Math.min(jetztMs - zuletzt, 100) : 16.7;
    zuletzt = jetztMs;

    if (top) top.classList.toggle("ist-gescrollt", y > 40);

    // Die Fahrbahnmarkierung im Logo läuft schneller, wenn gescrollt wird.
    if (marken.length) {
      tempo = Math.min(tempo * 0.86 + Math.abs(y - letzte) * 0.05, 7);
      root.style.setProperty("--ad-speed", Math.max(0.9, 4 / (1 + tempo)).toFixed(2) + "s");
    }
    letzte = y;

    // Laufband: gleichmässige Fahrt, unabhängig vom Scrollen.
    if (laufbaender.length) {
      laufbandWeg += (dt * LAUFTEMPO) / 1000;
      for (var n = 0; n < laufbaender.length; n++) {
        var spur = laufbaender[n];
        var halbe = parseFloat(spur.dataset.halbe) || 0;
        if (!halbe) continue;
        spur.style.transform =
          "translate3d(" + (-(laufbandWeg % halbe)).toFixed(2) + "px, 0, 0)";
      }
    }

    // Parallaxsäulen
    var h = window.innerHeight;
    for (var i = 0; i < saeulen.length; i++) {
      var s = saeulen[i];
      var eltern = s.closest(".schau") || s.parentElement;
      var k = eltern.getBoundingClientRect();
      if (k.bottom < -200 || k.top > h + 200) continue;
      // 0 beim Eintreten von unten, 1 beim Verlassen nach oben
      var p = (h - k.top) / (h + k.height);
      var weg = (p - 0.5) * parseFloat(s.dataset.tempo || "0");
      s.style.transform = "translate3d(0," + weg.toFixed(1) + "px,0)";
    }
  }

  function beiBewegung() {
    if (geplant) return;
    geplant = true;
    requestAnimationFrame(function (t) {
      geplant = false;
      zeichnen(t);
    });
  }

  // Das Laufband muss auch ohne Scrollen weiterlaufen.
  if (laufbaender.length) {
    (function schleife(t) {
      zeichnen(t || performance.now());
      requestAnimationFrame(schleife);
    })();
  } else {
    window.addEventListener("scroll", beiBewegung, { passive: true });
    window.addEventListener("resize", beiBewegung, { passive: true });
    zeichnen(performance.now());
  }

  /* ---------------------------------------------------------------- Formular

     Kein Backend, keine Rückmeldung ins Leere: Solange kein Empfänger
     eingetragen ist, sagt das Formular das ehrlich, statt zu tun, als sei
     etwas abgeschickt worden. */

  document.querySelectorAll("form[data-formular]").forEach(function (form) {
    var hinweis = form.querySelector("[data-formular-hinweis]");
    form.addEventListener("submit", function (e) {
      if (!form.getAttribute("action")) {
        e.preventDefault();
        if (hinweis) {
          hinweis.hidden = false;
          hinweis.setAttribute("tabindex", "-1");
          hinweis.focus();
        }
      }
    });
  });
})();
