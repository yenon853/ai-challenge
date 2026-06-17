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

  /* ---------- כניסה ב-scroll (IntersectionObserver) ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.14 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- שנה נוכחית בפוטר ---------- */
  function initYear() {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initReveal();
    initYear();
  });
})();
