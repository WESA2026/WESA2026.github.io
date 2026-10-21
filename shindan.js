/* =========================================================
   活動診断（CHG-SITE-021）。質問と活動の曜日は shindan.html の #quiz-data（render_extras.py が日程の正本から生成）。
   点数の合計がいちばん高い活動をおすすめし、今日以降の体験できる日を3つ出す。ライブラリなし。
   ========================================================= */
(function () {
  "use strict";
  var el = document.getElementById("quiz-data"), root = document.getElementById("quiz");
  if (!el || !root) return;
  var data = JSON.parse(el.textContent);
  var steps = root.querySelector("[data-quiz-steps]"), result = root.querySelector("[data-quiz-result]");
  var answers = [];
  var WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }, JA = "日月火水木金土";

  function iso(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function nextDays(a, n) {
    var out = [], d = new Date(), now = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 120 && out.length < n; i++, d.setDate(d.getDate() + 1)) {
      var s = iso(d);
      if (a.start && s < a.start) continue;
      if (a.end && s > a.end) break;
      if ((a.skip || []).indexOf(s) >= 0) continue;
      a.slots.forEach(function (sl) {  // 曜日で時限が違う活動（例：Debate 火曜4・5限・金曜4限）は組ごとに見る
        if (out.length >= n || sl.weekdays.map(function (w) { return WD[w]; }).indexOf(d.getDay()) < 0) return;
        if (i === 0 && sl.ends && now >= sl.ends) return;  // 今日の活動がもう終わっていれば出さない
        out.push((d.getMonth() + 1) + "/" + d.getDate() + "（" + JA[d.getDay()] + "）" + sl.period);
      });
    }
    return out;
  }
  function show() {
    var score = {};
    answers.forEach(function (s) { for (var k in s) score[k] = (score[k] || 0) + s[k]; });
    var best = data.activities.slice().sort(function (x, y) { return (score[y.key] || 0) - (score[x.key] || 0); })[0];
    var days = nextDays(best, 3);
    result.textContent = "";
    var h = document.createElement("h2"); h.textContent = "おすすめは「" + best.name + "」";
    var p = document.createElement("p"); p.textContent = best.blurb;
    var d = document.createElement("p"); d.className = "meta";
    d.textContent = days.length ? "次に体験できる日：" + days.join("・") : "活動日：毎週 " + best.slots.map(function (sl) { return sl.weekdays.map(function (w) { return JA[WD[w]]; }).join("・") + " " + sl.period; }).join("、");
    var act = document.createElement("div"); act.className = "hero-actions";
    act.innerHTML = '<a class="btn btn-secondary" href="' + best.page + '">' + best.name + 'の詳細</a><a class="btn btn-primary" href="join.html#senpai-connect">先輩とつながる</a>';
    var again = document.createElement("button"); again.type = "button"; again.className = "chip"; again.textContent = "もう一度";
    again.addEventListener("click", function () { answers = []; result.hidden = true; ask(0); });
    [h, p, d, act, again].forEach(function (x) { result.appendChild(x); });
    steps.hidden = true; result.hidden = false;
  }
  function ask(i) {
    if (i >= data.questions.length) return show();
    var q = data.questions[i];
    steps.hidden = false; steps.textContent = "";
    var li = document.createElement("li"); li.className = "quiz-step";
    var t = document.createElement("p"); t.className = "quiz-q"; t.textContent = "Q" + (i + 1) + "/" + data.questions.length + "　" + q.q;
    li.appendChild(t);
    q.a.forEach(function (a) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip quiz-a"; b.textContent = a.t;
      b.addEventListener("click", function () { answers[i] = a.s; ask(i + 1); });
      li.appendChild(b);
    });
    steps.appendChild(li);
  }
  ask(0);
})();
