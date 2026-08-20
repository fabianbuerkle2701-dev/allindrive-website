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
      laden.remove();
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

  /* ------------------------------------------------------- Hintergrundfilm

     Der Film liegt als HLS-Strom vor. Safari spielt das von sich aus, alle
     anderen brauchen hls.js. Die Bibliothek liegt lokal, weil die
     Inhaltsrichtlinie der Seite nur eigene Dateien erlaubt.

     Klappt es nicht, bleibt der wandernde Verlauf darunter stehen. Deshalb
     wird das <video> erst sichtbar, wenn wirklich Bilder kommen. */

  var filme = [].slice.call(document.querySelectorAll("[data-film]"));

  if (filme.length && !ruhig.matches) {
    filme.forEach(function (v) {
      var quelle = v.dataset.film;
      if (!quelle) return;

      v.style.opacity = "0";
      v.style.transition = "opacity 900ms ease";

      v.addEventListener("playing", function () {
        v.style.opacity = "1";
      }, { once: true });

      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari und iOS spielen HLS ohne Hilfe.
        v.src = quelle;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ capLevelToPlayerSize: true });
        hls.loadSource(quelle);
        hls.attachMedia(v);
        hls.on(window.Hls.Events.ERROR, function (_, daten) {
          // Bei einem endgültigen Fehler still aufgeben: Der Verlauf
          // darunter trägt die Fläche auch allein.
          if (daten && daten.fatal) hls.destroy();
        });
      }
    });
  }

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
     identisch ist, sieht man den Sprung nicht. */

  var laufbaender = ruhig.matches
    ? []
    : [].slice.call(document.querySelectorAll("[data-laufband]"));

  laufbaender.forEach(function (spur) {
    spur.innerHTML += spur.innerHTML;
  });

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
      laufbandWeg = (laufbandWeg + dt * 0.022) % 50;
      laufbaender.forEach(function (spur) {
        spur.style.transform = "translate3d(-" + laufbandWeg.toFixed(3) + "%, 0, 0)";
      });
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
