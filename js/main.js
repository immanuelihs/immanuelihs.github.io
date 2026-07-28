/* main.js — vanilla, progressive enhancement. Page works with JS off. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var progressBar = document.getElementById("scroll-progress");
  var railProgress = document.getElementById("rail-progress");
  function updateProgress() {
    var doc = document.documentElement;
    var top = doc.scrollTop || document.body.scrollTop;
    var h = doc.scrollHeight - doc.clientHeight;
    var pct = h > 0 ? (top / h) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
    if (railProgress) railProgress.style.height = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  var navToggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("top-nav-list");
  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navList.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navList.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        history.pushState(null, "", "#" + id);
      }
    });
  });

  var revealEls = document.querySelectorAll(".reveal, .reveal-up, .reveal-clip");
  if ("IntersectionObserver" in window && revealEls.length) {
    var groups = {};
    revealEls.forEach(function (el) {
      var key = (el.closest("section") || document.body).id || "d";
      groups[key] = groups[key] || 0;
      el.style.setProperty("--stagger", groups[key]);
      groups[key] += 1;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -10px 0px" });
    revealEls.forEach(function (el) { obs.observe(el); });
    /* safety net: guarantee visibility even if an observer edge case misses an element */
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }, 4000);
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.querySelectorAll(".hero .reveal-clip, .hero .reveal-up").forEach(function (el, i) {
    el.style.setProperty("--stagger", i);
    setTimeout(function () { el.classList.add("is-visible"); }, 40);
  });

  var copyBtn = document.getElementById("copy-email-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { announce(copyBtn); })
          .catch(function () { fallbackCopy(email, copyBtn); });
      } else {
        fallbackCopy(email, copyBtn);
      }
    });
  }
  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    announce(btn);
  }
  function announce(btn) {
    var original = btn.textContent;
    btn.setAttribute("data-copied", "true");
    btn.textContent = "Copied";
    setTimeout(function () {
      btn.removeAttribute("data-copied");
      btn.textContent = original;
    }, 1800);
  }
})();
