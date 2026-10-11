/* =========================================================
   Join: campus -> faculty -> gender, then open the official LINE
   with the message "先輩とつながる：<学部>・<性別>" filled in.
   The text must match the LINE keyword exactly (full-width colon and middle dot).
   No libraries, no images. Without JS the card shows a plain instruction.
   ========================================================= */
(function () {
  "use strict";
  var CAMPUSES = [
    { name: "早稲田", faculties: ["政治経済学部", "法学部", "教育学部", "商学部", "社会科学部", "国際教養学部"] },
    { name: "戸山", faculties: ["文化構想学部", "文学部"] },
    { name: "西早稲田", faculties: ["基幹理工学部", "創造理工学部", "先進理工学部"] },
    { name: "所沢", faculties: ["人間科学部", "スポーツ科学部"] }
  ];
  var GENDERS = ["男性", "女性", "答えない"];
  var LINE_MESSAGE = "https://line.me/R/oaMessage/@980zymub/?";

  var root = document.getElementById("senpai-connect");
  if (!root) return;
  var form = root.querySelector(".lc-form");
  var campusBox = root.querySelector("[data-lc=campus]");
  var facultyBox = root.querySelector("[data-lc=faculty]");
  var genderBox = root.querySelector("[data-lc=gender]");
  var preview = root.querySelector(".lc-preview");
  var send = root.querySelector(".lc-send");
  var state = { campus: null, faculty: null, gender: null };

  function chips(box, name, values, onPick) {
    box.textContent = "";
    values.forEach(function (v) {
      var label = document.createElement("label");
      label.className = "lc-chip";
      var input = document.createElement("input");
      input.type = "radio"; input.name = name; input.value = v;
      input.addEventListener("change", function () { onPick(v); });
      var span = document.createElement("span");
      span.textContent = v;
      label.appendChild(input); label.appendChild(span);
      box.appendChild(label);
    });
  }

  function update() {
    var ready = state.faculty && state.gender;
    if (ready) {
      var text = "先輩とつながる：" + state.faculty + "・" + state.gender;
      preview.textContent = "送る内容：" + text;
      send.href = LINE_MESSAGE + encodeURIComponent(text);
      send.removeAttribute("aria-disabled");
    } else {
      preview.textContent = "キャンパス・学部・性別を選ぶと、送る内容が表示されます";
      send.removeAttribute("href");
      send.setAttribute("aria-disabled", "true");
    }
  }

  chips(campusBox, "lc-campus", CAMPUSES.map(function (c) { return c.name; }), function (name) {
    state.campus = name; state.faculty = null;
    var c = CAMPUSES.filter(function (x) { return x.name === name; })[0];
    chips(facultyBox, "lc-faculty", c.faculties, function (f) { state.faculty = f; update(); });
    update();
  });
  chips(genderBox, "lc-gender", GENDERS, function (g) { state.gender = g; update(); });
  send.addEventListener("click", function (e) { if (!send.href) e.preventDefault(); });
  form.hidden = false;
  root.querySelector(".lc-fallback").hidden = true;
  update();
})();
