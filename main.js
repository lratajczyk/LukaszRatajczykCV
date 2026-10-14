/* Typografia w ruchu: maszyna do pisania + łagodne pojawianie się.
   Bez ruchu, gdy użytkownik ma włączone „ogranicz ruch”. */
(function () {
  window.__cvReady = true;
  var root = document.documentElement;
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
      return s;
    });

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
        // nierówny rytm uderzeń w klawisze; dłuższa pauza po spacji
        var wait = 55 + Math.random() * 70 + (ch.textContent === " " ? 120 : 0);
        setTimeout(step, wait);
      }
      setTimeout(step, delay || 0);
    });
  }

  /* ── Pojawianie się przy przewijaniu ── */
  var targets = document.querySelectorAll(
    ".block, .job, .cases > li, .skills > div, .facts > div, .metrics > div, .figure, .steps > li, .colophon, .pager"
  );
  targets.forEach(function (el) {
    if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", "");
    // kolejne elementy w tej samej grupie wchodzą z lekkim opóźnieniem
    var idx = Array.prototype.indexOf.call(el.parentElement.children, el);
    if (idx > 0 && !el.classList.contains("block")) el.style.setProperty("--d", Math.min(idx, 5) * 0.08 + "s");
  });

  function watch() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll('[data-reveal=""]').forEach(function (el) { io.observe(el); });
  }

  /* ── Sekwencja nagłówka ── */
  root.classList.add("drawing");
  var title = document.querySelector("[data-type]");
  var typed = title ? type(title, 350) : Promise.resolve();

  typed.then(function () {
    root.classList.add("stamped");
    document.querySelectorAll('[data-reveal="intro"]').forEach(function (el, i) {
      el.style.setProperty("--d", i * 0.15 + "s");
      el.classList.add("in");
    });
    setTimeout(watch, 250);
  });
})();
