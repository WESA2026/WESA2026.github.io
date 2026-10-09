/* =========================================================
   WESA opening — CHG-SITE-006 v1
   Short logo opening for the home page (about 1.9s).
   - First view in a browser session only (sessionStorage). If storage
     cannot be read or written, the opening is skipped.
   - Not shown with prefers-reduced-motion: reduce.
   - Tap, click, key or wheel skips it.
   - All page content is in the HTML from the start. Without JS this file
     does nothing; if it fails, the CSS cover fades by itself at 3.2s.
   Loaded in <head> without defer so the cover is up before first paint.
   ========================================================= */
(function () {
  var root = document.documentElement;
  var KEY = "wesa-opening";
  var play = false;

  try {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && !window.sessionStorage.getItem(KEY)) {
      window.sessionStorage.setItem(KEY, "1");
      play = window.sessionStorage.getItem(KEY) === "1";
    }
  } catch (e) {
    play = false;
  }
  if (!play) return;

  root.classList.add("op-on");

  var overlay = null;
  var timers = [];
  var done = false;
  var leaving = false;
  var failsafe = setTimeout(cleanup, 4000);

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function cleanup() {
    if (done) return;
    done = true;
    clearTimeout(failsafe);
    timers.forEach(clearTimeout);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (type) {
      window.removeEventListener(type, skip, true);
    });
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    root.classList.remove("op-on");
  }

  function skip() {
    if (done || !overlay) return;
    leaving = true;
    overlay.classList.add("is-skipping");
    later(cleanup, 280);
  }

  function leave() {
    if (done || leaving) return;
    leaving = true;
    var mark = overlay.querySelector(".op__mark");
    var target = document.querySelector(".site-header .logo-icon");
    if (mark && target) {
      var a = mark.getBoundingClientRect();
      var b = target.getBoundingClientRect();
      if (a.width && b.width) {
        var dx = b.left + b.width / 2 - (a.left + a.width / 2);
        var dy = b.top + b.height / 2 - (a.top + a.height / 2);
        var s = b.width / a.width;
        mark.style.transform = "translate(-50%, -58%) translate(" + dx + "px, " + dy + "px) scale(" + s + ")";
      }
    }
    overlay.classList.add("is-leaving");
    later(cleanup, 760);
  }

  function build() {
    if (done) return;
    // A slow start would make the opening feel like a delay: skip it instead.
    if (window.performance && performance.now() > 2500) {
      cleanup();
      return;
    }

    overlay = document.createElement("div");
    overlay.className = "op";
    overlay.setAttribute("aria-hidden", "true");

    var word = "創立70年以上";
    var letters = "";
    for (var i = 0; i < word.length; i++) {
      letters += '<span style="--i:' + i + '">' + word.charAt(i) + "</span>";
    }

    overlay.innerHTML =
      '<div class="op__panel op__panel--top"></div>' +
      '<div class="op__panel op__panel--bottom"></div>' +
      '<div class="op__seam"></div>' +
      '<div class="op__mark">' +
      '<span class="op__ring"></span>' +
      '<img class="op__logo" src="WESA_icon.png" alt="">' +
      '<p class="op__word">' + letters + "</p>" +
      "</div>";

    document.body.appendChild(overlay);
    root.classList.remove("op-on");

    ["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (type) {
      window.addEventListener(type, skip, { capture: true, passive: true });
    });

    later(leave, 1150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build, { once: true });
  } else {
    build();
  }
})();
