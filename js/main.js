/* main.js — vanilla, progressive enhancement. Page works with JS off. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var progressBar = document.getElementById("scroll-progress");
  function updateProgress() {
    var doc = document.documentElement;
    var top = doc.scrollTop || document.body.scrollTop;
    var h = doc.scrollHeight - doc.clientHeight;
    var pct = h > 0 ? (top / h) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

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

  /* ---------- research-waves horizontal track ---------- */
  var track = document.getElementById("wave-track");
  if (track) {
    var panels = Array.prototype.slice.call(track.querySelectorAll(".wave-panel"));
    var prevBtn = document.getElementById("wave-prev");
    var nextBtn = document.getElementById("wave-next");
    var counter = document.getElementById("wave-counter");
    var total = panels.length;

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    /* geometry-derived index — used only to resync after organic (trackpad/
       touch/drag) scrolling, never as the source of truth for a click that's
       still mid-animation (that would race the in-flight smooth scroll).
       Picks the panel with the greatest visible overlap with the track's own
       viewport, rather than the panel closest to the left edge — the latter
       misjudges the last panel when there isn't enough trailing space to
       scroll it perfectly flush (browsers clamp scrollLeft to the max). */
    function nearestIndex() {
      if (!panels.length) return 0;
      var trackRect = track.getBoundingClientRect();
      var best = 0;
      var bestOverlap = -Infinity;
      panels.forEach(function (panel, i) {
        var r = panel.getBoundingClientRect();
        var overlap = Math.min(r.right, trackRect.right) - Math.max(r.left, trackRect.left);
        if (overlap > bestOverlap) { bestOverlap = overlap; best = i; }
      });
      return best;
    }

    var activeIndex = nearestIndex();

    function render() {
      if (counter) counter.textContent = pad(activeIndex + 1) + " / " + pad(total);
      if (prevBtn) prevBtn.disabled = activeIndex <= 0;
      if (nextBtn) nextBtn.disabled = activeIndex >= total - 1;
    }

    function goTo(idx) {
      idx = Math.max(0, Math.min(total - 1, idx));
      var panel = panels[idx];
      if (!panel) return;
      activeIndex = idx;
      render();
      /* the last panel may not have enough trailing space to snap fully
         flush to the start — go to the true max scroll instead so it ends
         up as visible as the layout allows. */
      var targetLeft = (idx === total - 1)
        ? (track.scrollWidth - track.clientWidth)
        : (panel.offsetLeft - track.offsetLeft);
      track.scrollTo({ left: targetLeft, behavior: reduceMotion ? "auto" : "smooth" });
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(activeIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(activeIndex + 1); });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(activeIndex + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(activeIndex - 1); }
    });

    /* resync from real scroll position after organic scrolling settles
       (trackpad, touch swipe, or dragging the scrollbar) */
    var scrollTimer = null;
    track.addEventListener("scroll", function () {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(function () {
        activeIndex = nearestIndex();
        render();
      }, 120);
    }, { passive: true });

    window.addEventListener("resize", function () {
      activeIndex = nearestIndex();
      render();
    });
    render();
  }

  /* ---------- tabbed ledger ("the record") — progressive enhancement ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (container) {
    var tabs = Array.prototype.slice.call(container.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    });

    function activate(index, focusTab) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].hidden = !selected;
      });
      if (focusTab) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        else return;
        e.preventDefault();
        activate(next, true);
      });
    });

    /* only hide non-active panels once JS has actually run */
    activate(0, false);
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
