/* Typografia w ruchu: maszyna do pisania i łagodne wejścia sekcji.
   Bez ruchu, gdy użytkownik ma włączone „ogranicz ruch” (brak klasy .motion). */
(function () {
  window.__cvReady = true;
  var root = document.documentElement;

  /* „Pobierz CV (PDF)” to zwykły link do gotowego pliku (assets/Lukasz-Ratajczyk-CV.pdf,
     generowany przez scripts/make-pdf.sh) — bez okna druku przeglądarki. */

  /* ── Pasek u góry: ton po przewinięciu, nazwisko gdy nagłówek zniknie ── */
  var bar = document.querySelector(".topbar");
  var name = document.querySelector(".name");
  if (bar) {
    var onScroll = function () {
      bar.classList.toggle("is-scrolled", window.scrollY > 8);
      if (name) bar.classList.toggle("show-name", name.getBoundingClientRect().bottom < 72);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Przełącznik roli: „Rekrutujesz na stanowisko…” ──
     Podświetla doświadczenie i kompetencje pasujące do roli. Bez JS — ukryty. */
  var lens = document.querySelector(".lens");
  if (lens) {
    var scope = lens.closest(".sheet") || document;
    var note = lens.querySelector(".lens__note");
    var notes = {
      produkt: "Na pierwszym planie: decyzje produktowe, backlog, priorytety i kontakt z biznesem.",
      ux: "Na pierwszym planie: badania, projektowanie doświadczeń i interfejsów.",
      analiza: "Na pierwszym planie: analiza biznesowa, wymagania i dane.",
      "": ""
    };
    lens.hidden = false;
    lens.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lens]");
      if (!btn) return;
      var hat = btn.getAttribute("data-lens");
      lens.querySelectorAll("[data-lens]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      scope.classList.toggle("is-lensed", !!hat);
      scope.querySelectorAll("[data-hat]").forEach(function (el) {
        var hit = !!hat && el.getAttribute("data-hat").split(" ").indexOf(hat) > -1;
        el.classList.toggle("is-hit", hit);
      });
      scope.querySelectorAll(".job").forEach(function (job) {
        job.classList.toggle("is-hit", !!job.querySelector(".is-hit"));
      });
      if (note) note.textContent = notes[hat] || "";
    });
  }

  if (!root.classList.contains("motion")) return;


  /* ── Maszyna do pisania ── */
  function type(el, delay) {
    var text = el.textContent;
    el.textContent = "";

    var sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = text;
    el.appendChild(sr);

    var chars = Array.from(text).map(function (c) {
      var s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.textContent = c;
      el.appendChild(s);
      // spacja jako zwykły tekst, żeby nazwisko mogło złamać się na dwie linie
      if (c === " ") { s.replaceWith(document.createTextNode(" ")); return null; }
      return s;
    }).filter(Boolean);

    var caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    el.insertBefore(caret, chars[0] || null);
    el.classList.add("typing");

    return new Promise(function (done) {
      var i = 0;
      function step() {
        if (i >= chars.length) {
          caret.classList.add("caret--idle");
          return done();
        }
        var ch = chars[i++];
        ch.classList.add("on");
        ch.after(caret);
        // nierówny rytm uderzeń w klawisze; dłuższa pauza przed nowym słowem
        var nextIsWord = ch.nextSibling && ch.nextSibling.nodeType === 3;
        var wait = 60 + Math.random() * 70 + (nextIsWord ? 160 : 0);
        setTimeout(step, wait);
      }
      setTimeout(step, delay || 0);
    });
  }

  /* ── Wejścia przy przewijaniu: nagłówek → tekst → reszta, co ~80 ms ── */
  var groups = [
    [".facts-bar", "> div"],
    [".path__text", "> *"],
    [".how", "> .h2, .how__grid > div"],
    [".work", "> .h2, .cases > li"],
    [".ai", ".ai__intro > *, .ai__list > div"],
    [".block:not(.print-only)", "> .label, .lens, .job, .job__earlier, .skills > div, .edu > .job, .langs > p, .content > p, .steps > li, .figure, .flow, .metrics > div"],
    [".close", ".close__title, .close__text, .close__actions"],
    [".cs-head", "> *"],
    [".pager", "> *"]
  ];
  var watched = [];
  groups.forEach(function (g) {
    document.querySelectorAll(g[0]).forEach(function (box) {
      var items = g[1].split(",").reduce(function (all, sel) {
        sel = sel.trim();
        return all.concat(Array.from(sel.charAt(0) === ">" ? box.querySelectorAll(":scope " + sel) : box.querySelectorAll(sel)));
      }, []);
      items.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
      items.forEach(function (el, i) {
        if (el.hasAttribute("data-reveal")) return;
        el.setAttribute("data-reveal", "");
        el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
        watched.push(el);
      });
    });
  });
  // elementy, które same uruchamiają sekwencję (przystanki drogi)
  var triggers = Array.from(document.querySelectorAll(".path__line"));

  function watch() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    watched.concat(triggers).forEach(function (el) { io.observe(el); });
  }

  /* ── Sekwencja pierwszego ekranu ── */
  var title = document.querySelector("[data-type]");
  var typed = title ? type(title, 300) : Promise.resolve();

  typed.then(function () {
    document.querySelectorAll('[data-reveal="intro"]').forEach(function (el, i) {
      el.style.setProperty("--d", i * 0.09 + "s");
      el.classList.add("in");
    });
    setTimeout(watch, 200);
  });
})();
