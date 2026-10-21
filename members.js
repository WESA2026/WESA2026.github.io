/* 先輩紹介の学部の絞り込み（CHG-SITE-021）。カードは render_extras.py が生成する。 */
(function () {
  "use strict";
  var chips = document.querySelectorAll(".member-filters [data-filter]");
  var cards = document.querySelectorAll(".member-card");
  Array.prototype.forEach.call(chips, function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-filter");
      Array.prototype.forEach.call(chips, function (x) { x.classList.toggle("is-on", x === c); });
      Array.prototype.forEach.call(cards, function (card) { card.hidden = !!f && card.getAttribute("data-faculty") !== f; });
    });
  });
})();
