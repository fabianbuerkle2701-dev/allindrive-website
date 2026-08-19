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
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
          beobachter.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -48px 0px", threshold: 0 }
    );

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
