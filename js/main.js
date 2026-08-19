/* =========================================================================
   ALLINDRIVE — Seitenverhalten

   Die Seite funktioniert vollstaendig ohne dieses Skript: alle Abschnitte
   sind sichtbar, das Menue ist aufgeklappt, jeder Link fuehrt irgendwohin.
   Hier kommt nur Bewegung und Bequemlichkeit dazu.

   Wer "Bewegung reduzieren" eingestellt hat, bekommt denselben Endzustand,
   nur ohne den Weg dorthin.
   ========================================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)");

  root.classList.add("js");

  /* ------------------------------------------------------------ Farbschema

     Hell oder dunkel. Die Wahl ueberlebt den Seitenwechsel, sonst springt
     das Schema bei jedem Klick zurueck. Vorbelegt wird schon im <head>,
     damit beim Laden nichts aufblitzt. */

  var SPEICHER = "allindrive-farbschema";

  function aktuell() {
    var gesetzt = root.getAttribute("data-theme");
    if (gesetzt) return gesetzt;
    // Dunkel ist der Ausgangszustand der Seite, hell die Ausnahme.
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function beschriften() {
    var dunkel = aktuell() === "dark";
    document.querySelectorAll("[data-schalter='farbschema']").forEach(function (b) {
      b.setAttribute(
        "aria-label",
        dunkel ? "Zum hellen Farbschema wechseln" : "Zum dunklen Farbschema wechseln"
      );
    });
  }

  document.querySelectorAll("[data-schalter='farbschema']").forEach(function (b) {
    b.addEventListener("click", function () {
      var neu = aktuell() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", neu);
      try {
        localStorage.setItem(SPEICHER, neu);
      } catch (e) {
        /* Privater Modus: dann gilt die Wahl nur fuer diese Seite. */
      }
      beschriften();
    });
  });

  beschriften();

  /* -------------------------------------------------------------- Klappmenue */

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

    // Ohne Esc sitzt man auf dem Handy im offenen Menue fest, sobald die
    // Tastatur dazwischenfunkt.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Menü öffnen");
        schublade.hidden = true;
        burger.focus();
      }
    });
  }

  /* --------------------------------------------------------- Abschnitte auf

     Ein einziger Ablauf fuer alle Abschnitte: leicht heben und aufblenden,
     sobald sie ins Bild kommen. Geschwister kommen gestaffelt, damit eine
     Reihe nicht als Block springt.

     `once: true` ist Absicht. Ein Abschnitt, der beim Zurueckscrollen
     erneut einblendet, wirkt beim zweiten Mal nicht mehr wie eine
     Begruessung, sondern wie ein Fehler. */

  var sichtbar = document.querySelectorAll(".auf");

  if ("IntersectionObserver" in window && !ruhig.matches) {
    var beobachter = new IntersectionObserver(
      function (eintraege) {
        eintraege.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("ist-da");
          e.target.querySelectorAll("[data-zaehler]").forEach(zaehlenLassen);
          if (e.target.hasAttribute("data-zaehler")) zaehlenLassen(e.target);
          beobachter.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -48px 0px", threshold: 0 }
    );

    document.querySelectorAll(".wisch, [data-worte], [data-zaehler]").forEach(function (el) {
      if (!el.classList.contains("auf")) beobachter.observe(el);
    });

    sichtbar.forEach(function (el) {
      // Staffelung nur innerhalb einer Reihe, nicht ueber die ganze Seite,
      // sonst wartet der letzte Eintrag sekundenlang.
      var platz = el.parentElement
        ? Array.prototype.indexOf.call(el.parentElement.children, el)
        : 0;
      el.style.transitionDelay = Math.min(platz, 5) * 55 + "ms";
      beobachter.observe(el);
    });
  } else {
    sichtbar.forEach(function (el) {
      el.classList.add("ist-da");
    });
  }



  /* -------------------------------------------------------- Scroll-Apparat

     Alles Bewegte hängt an einer einzigen rAF-Schleife. Ein eigener
     Zuhoerer je Effekt ruckelt auf dem Handy sofort, weil jeder von ihnen
     das Layout neu ausmisst.

     Wo der Browser scrollgesteuerte Animationen kennt, uebernimmt CSS die
     Arbeit (Fortschrittsbalken, Aufwischen) und laeuft ausserhalb des
     Hauptstrangs. Hier bleibt dann nur, was CSS nicht rechnen kann. */

  var kannScrollZeit = CSS && CSS.supports && CSS.supports("animation-timeline: scroll()");

  /* Ueberschriften wortweise. Der Text wird in <span> zerlegt, aber nur
     wenn das Skript laeuft: ohne JS bleibt die Ueberschrift ein Stueck
     Text, das jeder Vorleser am Stueck liest. */

  function worteZerlegen(el) {
    if (el.dataset.zerlegt) return;
    el.dataset.zerlegt = "1";
    var teile = el.textContent.split(/(\s+)/);
    el.textContent = "";
    var n = 0;
    teile.forEach(function (t) {
      if (!t.trim()) {
        el.appendChild(document.createTextNode(t));
        return;
      }
      var s = document.createElement("span");
      s.className = "wort";
      s.style.setProperty("--i", n++);
      s.textContent = t;
      el.appendChild(s);
    });
  }

  if (!ruhig.matches) {
    document.querySelectorAll("[data-worte]").forEach(worteZerlegen);
  }

  /* Parallaxe und Laufband: beide brauchen die Scrollposition Bild fuer
     Bild, also laufen sie in der Schleife mit. */

  var parallaxen = ruhig.matches
    ? []
    : [].slice.call(document.querySelectorAll(".parallaxe"));

  var band = document.querySelector(".laufband__spur");
  var bandWeg = 0;

  /* Das Geraet im Auftakt. Der Blick faehrt beim Scrollen um es herum und
     laesst es dabei leicht absacken, so wie eine Kamera, die weiterzieht.
     Gerechnet wird aus der Lage des Auftakts im Bild, nicht aus scrollY:
     dann stimmt es auch, wenn oben noch ein Banner dazukommt. */
  var buehne = document.querySelector(".buehne");

  function apparatZeichnen(delta) {
    var hoehe = window.innerHeight;

    // Parallaxe: Versatz aus der Lage im Bild, gedeckelt, damit ein Bild
    // nie aus seinem Rahmen wandert.
    for (var i = 0; i < parallaxen.length; i++) {
      var el = parallaxen[i];
      var k = el.getBoundingClientRect();
      if (k.bottom < -200 || k.top > hoehe + 200) continue;
      var mitte = (k.top + k.height / 2 - hoehe / 2) / hoehe;
      var tiefe = parseFloat(el.dataset.tiefe || "22");
      el.style.setProperty("--par", (-mitte * tiefe).toFixed(1) + "px");
    }

    // Laufband: Richtung und Tempo folgen dem Scrollen, dazu ein leiser
    // Grundlauf, damit es nicht tot wirkt, wenn niemand scrollt.
    if (band) {
      bandWeg -= delta * 0.55 + 0.35;
      var breite = band.scrollWidth / 2;
      if (breite > 0) {
        if (bandWeg <= -breite) bandWeg += breite;
        if (bandWeg > 0) bandWeg -= breite;
      }
      band.style.setProperty("--band", bandWeg.toFixed(1) + "px");
    }

    if (buehne) {
      var bk = buehne.getBoundingClientRect();
      if (bk.bottom > -100) {
        // 0 solange der Auftakt oben steht, 1 wenn er das Bild verlassen hat
        var bp = Math.min(Math.max(-bk.top / (hoehe * 0.9), 0), 1);
        buehne.style.setProperty("--auf-dreh", (-16 + bp * 26).toFixed(2) + "deg");
        buehne.style.setProperty("--auf-neig", (6 - bp * 9).toFixed(2) + "deg");
        buehne.style.setProperty("--auf-heb", (bp * 54).toFixed(1) + "px");
        buehne.style.setProperty("--auf-zoom", (1 - bp * 0.1).toFixed(3));
      }
    }

    // Fortschrittsbalken nur, wenn CSS es nicht selbst kann.
    if (!kannScrollZeit) {
      var weg = document.documentElement.scrollHeight - hoehe;
      var p = weg > 0 ? window.scrollY / weg : 0;
      root.style.setProperty("--seite-p", p.toFixed(4));
    }
  }

  /* Zahlen zaehlen hoch, sobald sie im Bild sind. */

  function zaehlenLassen(el) {
    if (el.dataset.gelaufen) return;
    el.dataset.gelaufen = "1";
    var ziel = parseFloat(el.dataset.zaehler);
    if (isNaN(ziel)) return;
    var nach = el.dataset.nach || "";
    if (ruhig.matches) {
      el.textContent = ziel + nach;
      return;
    }
    var dauer = 1100;
    var start = null;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dauer, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ziel * e) + nach;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  /* ---------------------------------------------------------- Zeigereffekte

     Magnet, Lichtkegel und Kippen haengen alle am selben Zeiger. Die
     Ereignisse schreiben nur Koordinaten weg; angefasst wird das Layout
     erst in der rAF-Schleife. Ein mousemove-Zuhoerer, der direkt Stile
     setzt, feuert bis zu tausendmal je Sekunde und laesst jede Seite
     ruckeln.

     Alles nur mit echtem Zeiger. Auf Touch bliebe jeder Zustand nach der
     Beruehrung kleben. */

  var feinerZeiger = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var zx = 0, zy = 0, zeigerNeu = false;

  var magnete = [], kegel = [], kipper = [];

  if (feinerZeiger && !ruhig.matches) {
    magnete = [].slice.call(document.querySelectorAll(".magnet"));
    kegel = [].slice.call(document.querySelectorAll(".kegel"));
    kipper = [].slice.call(document.querySelectorAll(".kippt"));

    window.addEventListener("mousemove", function (e) {
      zx = e.clientX;
      zy = e.clientY;
      zeigerNeu = true;
      beiBewegung();
    }, { passive: true });

    // Verlaesst der Zeiger ein Element, muss es zurueckfedern. Ohne das
    // bleibt der letzte Winkel stehen.
    kipper.concat(magnete).forEach(function (el) {
      el.addEventListener("mouseleave", function () {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
        el.style.setProperty("--ms", "1");
        el.style.setProperty("--kipp-x", "0deg");
        el.style.setProperty("--kipp-y", "0deg");
        el.style.setProperty("--kipp-z", "1");
      });
    });
  }

  function zeigerZeichnen() {
    if (!zeigerNeu) return;
    zeigerNeu = false;

    for (var i = 0; i < magnete.length; i++) {
      var m = magnete[i];
      var r = m.getBoundingClientRect();
      var mx = zx - (r.left + r.width / 2);
      var my = zy - (r.top + r.height / 2);
      var weite = Math.hypot(mx, my);
      var reichweite = Math.max(r.width, r.height) * 0.9;
      if (weite < reichweite) {
        var k = 1 - weite / reichweite;
        m.style.setProperty("--mx", (mx * 0.24 * k).toFixed(1) + "px");
        m.style.setProperty("--my", (my * 0.24 * k).toFixed(1) + "px");
        m.style.setProperty("--ms", (1 + 0.035 * k).toFixed(3));
      } else {
        m.style.setProperty("--mx", "0px");
        m.style.setProperty("--my", "0px");
        m.style.setProperty("--ms", "1");
      }
    }

    for (var c = 0; c < kegel.length; c++) {
      var kg = kegel[c];
      var kr = kg.getBoundingClientRect();
      if (kr.bottom < 0 || kr.top > window.innerHeight) continue;
      kg.style.setProperty("--kx", (((zx - kr.left) / kr.width) * 100).toFixed(1) + "%");
      kg.style.setProperty("--ky", (((zy - kr.top) / kr.height) * 100).toFixed(1) + "%");
    }

    for (var t = 0; t < kipper.length; t++) {
      var kp = kipper[t];
      var pr = kp.getBoundingClientRect();
      if (pr.bottom < 0 || pr.top > window.innerHeight) continue;
      var nx = (zx - (pr.left + pr.width / 2)) / (pr.width / 2);
      var ny = (zy - (pr.top + pr.height / 2)) / (pr.height / 2);
      if (Math.abs(nx) > 1.4 || Math.abs(ny) > 1.4) continue;
      kp.style.setProperty("--kipp-y", (nx * 5).toFixed(2) + "deg");
      kp.style.setProperty("--kipp-x", (-ny * 4).toFixed(2) + "deg");
      kp.style.setProperty("--kipp-z", "1.012");
    }
  }

  /* ------------------------------------------------- Kopfzeile weicht aus */

  var topY = 0, topLetzte = 0;

  function kopfzeileFuehren(jetzt) {
    if (!top || ruhig.matches) return;
    var runter = jetzt > topLetzte;
    topLetzte = jetzt;
    // Erst ab einer gewissen Tiefe ausweichen: ganz oben wirkt es wie ein
    // Fehler, wenn die Kopfzeile bei der ersten Bewegung verschwindet.
    var ziel = runter && jetzt > 420 ? -84 : 0;
    topY += (ziel - topY) * 0.18;
    top.style.setProperty("--top-y", topY.toFixed(1) + "px");
  }

  /* ------------------------------------------- Bilder ziehen beim Scrollen */

  var zieher = ruhig.matches
    ? []
    : [].slice.call(document.querySelectorAll(".heranziehen"));

  function zieherZeichnen() {
    var h = window.innerHeight;
    for (var i = 0; i < zieher.length; i++) {
      var el = zieher[i];
      var r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > h + 100) continue;
      // 0 beim Eintreten von unten, 1 wenn die Mitte erreicht ist
      var p = Math.min(Math.max(1 - (r.top + r.height / 2) / h, 0), 1);
      el.style.setProperty("--zieh", (0.94 + p * 0.06).toFixed(4));
    }
  }

  /* ------------------------------------------------------------------ Flug

     Der festgehaltene Abschnitt, in dem das Geraet stehen bleibt und der
     Bildschirm mit der Scrollposition durch die Ansichten der App wandert.

     Der Fortschritt ist eine einzige Zahl zwischen 0 und 1: wie weit der
     Abschnitt durch das Bild gelaufen ist. Daraus folgt alles andere, die
     Station, die Drehung, der Zoom. Deshalb laeuft der Flug auch rueckwaerts
     sauber, wenn jemand zurueckscrollt.

     Nur Zierde. Bei reduzierter Bewegung wird gar nichts angefasst; das
     Stylesheet loest das Festhalten dann ohnehin auf. */

  var fluege = [].slice.call(document.querySelectorAll("[data-flug]"));

  function flugAufbauen(feld) {
    var bilder = [].slice.call(feld.querySelectorAll(".flug__bild"));
    var texte = [].slice.call(feld.querySelectorAll(".flug__station"));
    var punkte = [].slice.call(feld.querySelectorAll(".flug__punkt"));
    var anzahl = Math.max(bilder.length, texte.length);
    if (!anzahl) return null;

    feld.style.setProperty("--flug-stationen", anzahl);

    // Springen ueber die Leiste: rechnet die Station in eine Scrollposition
    // zurueck, statt sie zu erraten.
    punkte.forEach(function (p, i) {
      p.addEventListener("click", function () {
        var kasten = feld.getBoundingClientRect();
        var oben = window.scrollY + kasten.top;
        var weg = feld.offsetHeight - window.innerHeight;
        var ziel = oben + (weg * (i + 0.5)) / anzahl;
        window.scrollTo({ top: ziel, behavior: ruhig.matches ? "auto" : "smooth" });
      });
    });

    return { feld: feld, bilder: bilder, texte: texte, punkte: punkte, anzahl: anzahl, station: -1 };
  }

  function flugZeichnen(f) {
    var kasten = f.feld.getBoundingClientRect();
    var weg = f.feld.offsetHeight - window.innerHeight;
    if (weg <= 0) return;

    var p = Math.min(Math.max(-kasten.top / weg, 0), 1);

    // Station: der Fortschritt auf die Anzahl verteilt.
    var station = Math.min(Math.floor(p * f.anzahl), f.anzahl - 1);

    if (station !== f.station) {
      f.station = station;
      f.bilder.forEach(function (b, i) { b.classList.toggle("ist-an", i === station); });
      f.texte.forEach(function (t, i) { t.classList.toggle("ist-an", i === station); });
      f.punkte.forEach(function (q, i) { q.classList.toggle("ist-an", i === station); });
    }

    // Der Blick faehrt einmal um das Geraet herum und am Ende hinein.
    // Sinus statt linear, damit die Bewegung an den Raendern zur Ruhe kommt
    // und nicht am Abschnittsanfang schon in voller Fahrt ist.
    var dreh = Math.sin(p * Math.PI * 2) * 15;
    var neig = Math.cos(p * Math.PI * 2) * 4;
    // Der Zoom zieht erst am Schluss an: die letzten 12 Prozent des Wegs
    // fahren in den Bildschirm hinein.
    var rein = Math.max(0, (p - 0.88) / 0.12);
    var zoom = 1 + 0.06 * Math.sin(p * Math.PI) + rein * rein * 1.4;

    f.feld.style.setProperty("--flug-dreh", dreh.toFixed(2) + "deg");
    f.feld.style.setProperty("--flug-neig", neig.toFixed(2) + "deg");
    f.feld.style.setProperty("--flug-zoom", zoom.toFixed(3));
    f.feld.style.setProperty("--flug-x", (30 + p * 40).toFixed(1) + "%");
  }

  var flugFelder = ruhig.matches
    ? []
    : fluege.map(flugAufbauen).filter(Boolean);

  /* ------------------------------------------------------ Kopfzeile absetzen

     Die Kopfzeile bekommt erst eine Trennlinie, wenn wirklich Inhalt
     darunter durchlaeuft. Am Seitenanfang schwebt sie ohne Kante. */

  var top = document.querySelector("[data-top]");

  /* --------------------------------------------------- Fahrbahn und Scrollen

     Die Fahrbahnmarkierung im Logo laeuft von sich aus ruhig weiter. Wer
     scrollt, gibt Gas: die Striche laufen kurz schneller und trudeln
     danach wieder aus. */

  var marken = document.querySelectorAll(".ad--faehrt");
  var letzte = window.scrollY;
  var tempo = 0;
  var geplant = false;

  function messen() {
    var jetzt = window.scrollY;

    if (top) top.classList.toggle("ist-gescrollt", jetzt > 8);

    for (var i = 0; i < flugFelder.length; i++) flugZeichnen(flugFelder[i]);

    if (!ruhig.matches) {
      apparatZeichnen(jetzt - letzte);
      zeigerZeichnen();
      zieherZeichnen();
      kopfzeileFuehren(jetzt);
    }

    if (marken.length && !ruhig.matches) {
      tempo = Math.min(tempo * 0.85 + Math.abs(jetzt - letzte) * 0.05, 7);
      var sekunden = Math.max(0.9, 4 / (1 + tempo));
      // Auf dem Wurzelelement, nicht auf der einzelnen Marke: die Pfade
      // liegen im <symbol> und erben nur von dort.
      root.style.setProperty("--ad-speed", sekunden.toFixed(2) + "s");
    }

    letzte = jetzt;
  }

  function beiBewegung() {
    if (geplant) return;
    geplant = true;
    // Alles Scroll-Abhaengige in einer Schleife, die nur rechnet, wenn sich
    // wirklich etwas bewegt. Ein eigener Zuhoerer je Effekt ruckelt.
    requestAnimationFrame(function () {
      geplant = false;
      messen();
    });
  }

  window.addEventListener("scroll", beiBewegung, { passive: true });
  window.addEventListener("resize", beiBewegung, { passive: true });
  messen();

  /* ---------------------------------------------------------------- Formular

     Kein Backend, keine Rueckmeldung ins Leere: Solange kein Empfaenger
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
