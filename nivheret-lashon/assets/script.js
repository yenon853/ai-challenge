/* ============================================================
   נבחרת AI בלשון — לוגיקת צד-לקוח (vanilla JS)
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- מצב כהה/בהיר + שמירה ב-localStorage ---------- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(!isDark));
      var lbl = btn.querySelector("[data-theme-label]");
      if (lbl) lbl.textContent = isDark ? "מצב בהיר" : "מצב כהה";
    });
  }
  var saved = null;
  try { saved = localStorage.getItem("nbl-theme"); } catch (e) {}
  applyTheme(saved === "light" ? "light" : "dark"); // ברירת מחדל: כהה

  window.toggleTheme = function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("nbl-theme", next); } catch (e) {}
  };

  /* ---------- תפריט המבורגר במובייל ---------- */
  function initMenu() {
    var btn = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("hidden") === false;
      btn.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- כניסה ב-scroll + מספרים מתגלגלים (IO + גיבוי גלילה) ---------- */
  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    return r.top < h - (margin || 0) && r.bottom > 0;
  }
  function activate(el) {
    if (el.hasAttribute("data-count")) countUp(el);
    else el.classList.add("is-visible");
  }
  function initInViewEffects() {
    var els = Array.prototype.slice.call(
      document.querySelectorAll(".reveal, [data-count]")
    );
    // ללא אנימציה — הצג הכל מיד
    if (reduceMotion) { els.forEach(activate); return; }

    // אמצעי ראשי: IntersectionObserver (מדויק)
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { activate(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.15 });
      els.forEach(function (el) { io.observe(el); });
    }

    // גיבוי: סריקה מבוססת-rect — מבטיחה שתוכן לעולם לא יישאר נסתר
    // גם אם ה-IO לא נורה (דפדפנים ישנים / סביבות מיוחדות).
    function sweep() {
      els = els.filter(function (el) {
        if (inView(el, 40)) { activate(el); return false; }
        return true;
      });
    }
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    window.addEventListener("load", sweep, { passive: true });
    setTimeout(sweep, 60);   // צביעה ראשונית של מה שכבר במסך
    setTimeout(sweep, 700);  // ביטחון נוסף אחרי טעינת גופנים
  }

  /* ---------- מספרים מתגלגלים (count-up) ---------- */
  function countUp(el) {
    if (el.__counted) return; // הגנה מהפעלה כפולה (IO + sweep)
    el.__counted = true;
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400, done = false;
    function finish() { if (!done) { done = true; el.textContent = target + suffix; } }
    function step(ts) {
      if (done) return;
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step); else done = true;
    }
    requestAnimationFrame(step);
    setTimeout(finish, dur + 600); // ביטחון: אם rAF לא רץ, ודא שהערך הסופי מוצג
  }

  /* ---------- מאגר הכלים: סינון + חיפוש חי ---------- */
  function initTools() {
    var grid = document.getElementById("toolsGrid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".tool-card"));
    var search = document.getElementById("toolSearch");
    var empty = document.getElementById("toolsEmpty");
    var state = { tag: "all", aud: "all", q: "" };

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var tags = card.getAttribute("data-tags") || "";
        var aud = card.getAttribute("data-aud") || "";
        var hay = ((card.getAttribute("data-name") || "") + " " +
                   (card.getAttribute("data-desc") || "")).toLowerCase();
        var ok = (state.tag === "all" || tags.indexOf(state.tag) !== -1) &&
                 (state.aud === "all" || aud === state.aud) &&
                 (state.q === "" || hay.indexOf(state.q) !== -1);
        card.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle("hidden", shown !== 0);
    }

    function wireGroup(attr, key) {
      var btns = document.querySelectorAll("[" + attr + "]");
      btns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          btns.forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          state[key] = btn.getAttribute(attr);
          apply();
        });
      });
    }
    wireGroup("data-filter-tag", "tag");
    wireGroup("data-filter-aud", "aud");
    if (search) {
      search.addEventListener("input", function () {
        state.q = search.value.trim().toLowerCase();
        apply();
      });
    }
  }

  /* ---------- שנה נוכחית בפוטר ---------- */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initInViewEffects();
    initTools();
    initYear();
  });
})();
