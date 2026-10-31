document.addEventListener("DOMContentLoaded", () => {
  initPageState();
  initReveal();
  initHeaderState();
  initTabs();
  initButtons();
  initDeadlineImagePicker();
  initPageTransition();
  initChatWidget();
  initLightbox();
  initHomeFilmLoop();
  initEventDates();
  initNextDays();
});

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initPageState() {
  requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });
}

function initReveal() {
  const targets = document.querySelectorAll(".js-reveal");

  if (!targets.length || !("IntersectionObserver" in window)) {
    targets.forEach((node) => {
      node.classList.add("is-visible");
      const section = node.closest(".section");
      if (section) section.classList.add("is-visible");
    });
    return;
  }

  const show = (node) => {
    node.classList.add("is-visible");
    const section = node.closest(".section");
    if (section) section.classList.add("is-visible");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        showWhenImagesReady(entry.target, show);
      });
    },
    {
      // Start as soon as the top of a block comes into view, so tall sections do not sit blank
      threshold: 0,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  targets.forEach((node) => observer.observe(node));
}

// Play the reveal once the photos now on screen are ready, so the effect does not run on an
// empty box. Waits at most 1.2s; photos further down the block are not waited for.
function showWhenImagesReady(node, show) {
  const limit = window.innerHeight * 1.2;
  const pending = Array.from(node.querySelectorAll("img")).filter((img) => {
    return !img.complete && img.getBoundingClientRect().top < limit;
  });
  if (!pending.length) {
    show(node);
    return;
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    show(node);
  };
  pending.forEach((img) => {
    if (img.loading === "lazy") img.loading = "eager";
  });
  Promise.all(pending.map((img) => img.decode().catch(() => {}))).then(finish);
  setTimeout(finish, 1200);
}

function initHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initTabs() {
  const wrappers = document.querySelectorAll("[data-tabs]");

  wrappers.forEach((wrapper) => {
    const buttons = wrapper.querySelectorAll(".tab-btn");
    const panels = wrapper.querySelectorAll(".tab-panel");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const name = button.getAttribute("data-tab");

        buttons.forEach((b) => {
          b.setAttribute("aria-selected", String(b === button));
        });

        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute("data-panel") !== name;
        });
      });
    });
  });
}

function initButtons() {
  const buttons = document.querySelectorAll(".btn, .quick-list button");
  buttons.forEach((btn) => {
    btn.addEventListener("pointerdown", () => {
      btn.classList.add("is-pressed");
      setTimeout(() => btn.classList.remove("is-pressed"), 260);
    });
  });
}

function initPageTransition() {
  if (prefersReducedMotion()) return;

  const links = document.querySelectorAll("a[href$='.html']");
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      const target = link.getAttribute("target");
      const current = window.location.pathname.split("/").pop() || "index.html";

      if (!href || href.startsWith("http") || target === "_blank" || href.startsWith("#") || href === current) {
        return;
      }
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      // Fade out while the browser navigates instead of holding the click back
      document.body.classList.add("page-leave");
    });
  });

  // Pages restored with the back button must not stay faded out
  window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-leave");
  });
}

function initChatWidget() {
  const toggle = document.querySelector("[data-chat-toggle]");
  const panel = document.querySelector("[data-chat-panel][hidden]") || document.querySelector("[data-chat-panel]");

  setupAllChatPanels(getBasePath());

  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const reduce = prefersReducedMotion();
    const isHidden = panel.hasAttribute("hidden");

    if (isHidden) {
      panel.removeAttribute("hidden");
      if (!reduce) {
        requestAnimationFrame(() => panel.classList.add("is-open"));
      }
      return;
    }

    if (reduce) {
      panel.setAttribute("hidden", "");
      return;
    }

    panel.classList.remove("is-open");
    setTimeout(() => panel.setAttribute("hidden", ""), 460);
  });
}

function setupAllChatPanels(base) {
  const qa = {
    schedule: {
      text: /*d:js.faq.schedule*/"2026年秋新歓：Lesson（10/05〜12/11の平日毎日3限・休講日を除く・日本語メインでみんなで遊ぶ）、ピクニック（10/19（月）3〜4限・戸山公園の理工キャンパス側・雨天中止）、ハロウィンパーティー（10/28（水）3限・戸山キャンパス 学生会館・仮装OK）。10/19と10/28は、その日のLesson（3限）がイベントに置き換わります。事前申込は不要です。そのほかの詳細は公式LINEで案内します。"/*/d*/,
      links: [
        { label: "秋新歓の日程", href: `${base}welcome.html` },
        { label: "公式LINE", href: "https://lin.ee/WOIaKqe" },
        { label: "参加ページ", href: `${base}join.html` }
      ]
    },
    beginner: {
      text: "初心者でも参加できます。レベル別の練習メニューで開始し、初回は見学だけでも可能です。",
      links: [
        { label: "Activities一覧", href: `${base}activities.html` },
        { label: "Lesson", href: `${base}lesson.html` },
        { label: "参加ページ", href: `${base}join.html` }
      ]
    },
    frequency: {
      text: "定例活動は毎週あります。Lesson：平日毎日3限／Discussion：月・木・金 3〜5限／Debate：火曜4・5限・金曜4限／Speech：金曜5限／英会話部：水曜4・5限（戸山キャンパス または オンライン）。好きな活動に参加できます。",
      links: [
        { label: "Activities一覧", href: `${base}activities.html` },
        { label: "英会話部", href: `${base}eikaiwa.html` },
        { label: "Join", href: `${base}join.html` }
      ]
    },
    fee: {
      text: "参加費は不明/未確定の項目があります。確定後、各イベント詳細ページで案内します。",
      links: [
        { label: "Events一覧", href: `${base}events.html` },
        { label: "Winter Camp", href: `${base}winter-camp.html` },
        { label: "質問ページ", href: `${base}chat.html` }
      ]
    },
    diff: {
      text: "Lessonは日本語メインでみんなで遊ぶ活動、英会話部はLessonと競技活動の間で、英語だけでゲームをする活動です（留学を予定している人など大歓迎！）。Debateは論理競技、Speechは発表、Discussionは対話（議論）が中心の競技活動です。",
      links: [
        { label: "Activities一覧", href: `${base}activities.html` },
        { label: "英会話部", href: `${base}eikaiwa.html` },
        { label: "Debate", href: `${base}debate.html` }
      ]
    }
  };

  document.querySelectorAll("[data-chat-panel]").forEach((chatPanel) => {
    const quickButtons = chatPanel.querySelectorAll("[data-question]");
    const submit = chatPanel.querySelector("[data-chat-send]");
    const input = chatPanel.querySelector("[data-chat-input]");
    const answer = chatPanel.querySelector("[data-chat-answer]");
    const related = chatPanel.querySelector("[data-chat-related]");

    quickButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.getAttribute("data-question");
        renderAnswer(qa[key], answer, related);
      });
    });

    if (submit && input) {
      submit.addEventListener("click", () => {
        submit.classList.add("is-pressed");
        setTimeout(() => submit.classList.remove("is-pressed"), 260);
        const key = detectQuestion(input.value);
        renderAnswer(qa[key], answer, related);
      });
    }
  });
}

function detectQuestion(text) {
  const q = (text || "").toLowerCase();

  if (q.includes("日程") || q.includes("場所") || q.includes("申込")) return "schedule";
  if (q.includes("初心者")) return "beginner";
  if (q.includes("週") || q.includes("頻度")) return "frequency";
  if (q.includes("参加費") || q.includes("費用")) return "fee";

  return "diff";
}

function renderAnswer(payload, answerNode, relatedNode) {
  if (!payload || !answerNode || !relatedNode) return;

  answerNode.textContent = payload.text;
  relatedNode.innerHTML = "";

  payload.links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    if (link.href.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.textContent = link.label;
    relatedNode.appendChild(a);
  });
}

function initDeadlineImagePicker() {
  const input = document.querySelector("[data-deadline-image-input]");
  const preview = document.querySelector(".deadline-thumb");
  const note = document.querySelector("[data-deadline-image-note]");

  if (!input || !preview) return;

  let objectUrl = "";

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      if (note) {
        note.textContent = "画像ファイル（JPG / PNG / WebP）を選択してください";
      }
      input.value = "";
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = "";
    }

    objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.alt = file.name ? `${file.name} のプレビュー画像` : "選択した画像";

    if (note) {
      note.textContent = `選択中: ${file.name}`;
    }

    input.value = "";
  });

  window.addEventListener(
    "beforeunload",
    () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    { once: true }
  );
}

function initLightbox() {
  const targets = Array.from(document.querySelectorAll("main img")).filter(
    (img) =>
      !img.closest(".site-header") &&
      !img.closest(".site-footer") &&
      !img.closest(".chat-widget") &&
      !img.closest("a[href]")
  );
  if (!targets.length) return;

  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = '<img alt="preview">';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector("img");

  targets.forEach((img) => {
    img.classList.add("is-zoomable");
    img.addEventListener("click", () => {
      lbImg.src = img.getAttribute("src") || "";
      lbImg.alt = img.getAttribute("alt") || "image";
      lb.classList.add("is-open");
    });
  });

  lb.addEventListener("click", () => lb.classList.remove("is-open"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") lb.classList.remove("is-open");
  });
}

function getBasePath() {
  const path = window.location.pathname.replace(/\\/g, "/");
  if (path.includes("/activities/")) return "../";
  return "";
}

function initHomeFilmLoop() {
  if (prefersReducedMotion()) return;

  const rails = document.querySelectorAll(".film-rail");
  if (!rails.length) return;

  rails.forEach((rail) => {
    if (rail.dataset.loopReady === "true") return;

    const items = Array.from(rail.children);
    if (!items.length) return;

    items.forEach((item) => {
      rail.appendChild(item.cloneNode(true));
    });

    rail.dataset.loopReady = "true";
  });

  const start = () => {
    rails.forEach((rail, index) => {
      runFilmLoop(rail, index);
    });
  };

  // Start right away instead of waiting for every photo on the page; runFilmLoop
  // re-measures the rail as each of its photos arrives
  requestAnimationFrame(start);
}

function runFilmLoop(rail, index) {
  const speed = index % 2 === 0 ? 18 : 16;
  let offset = 0;
  let prevTs = 0;
  let frame = 0;
  // Reading scrollHeight forces layout, so measure only when the size can change
  let loopHeight = rail.scrollHeight / 2;
  const measure = () => {
    loopHeight = rail.scrollHeight / 2;
  };
  window.addEventListener("resize", measure, { passive: true });
  rail.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", measure, { once: true });
  });

  const tick = (ts) => {
    if (!prevTs) prevTs = ts;
    const dt = Math.min((ts - prevTs) / 1000, 0.1);
    prevTs = ts;

    if (loopHeight > 0) {
      offset = (offset + speed * dt) % loopHeight;
      rail.style.transform = `translateY(${-offset}px) rotateX(8deg)`;
    }

    frame = requestAnimationFrame(tick);
  };

  // Only animate while the rail is on screen
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !frame) {
      prevTs = 0;
      frame = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  observer.observe(rail.parentElement || rail);
}

// 終了したイベント（data-event-date が今日より前）に「終了」を付けて一覧の最後へ。
// 一覧の中で最初に来る開催前のイベントには「次のイベント」を付ける
function initEventDates() {
  const d = new Date();
  const today = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  document.querySelectorAll("[data-event-list]").forEach((list) => {
    const items = [...list.children].filter((el) => el.dataset.eventDate);
    const badge = (el, text, cls) => {
      const b = document.createElement("span");
      b.className = "event-badge " + cls;
      b.textContent = text;
      if (el.tagName === "TR") return;  // 表は列幅が変わるのでバッジを付けない（薄く・取り消し線で示す）
      const slot = el.querySelector("h2, h3") || el;
      slot.prepend(b);
    };
    items.filter((el) => el.dataset.eventDate < today).forEach((el) => {
      el.classList.add("is-ended");
      badge(el, "終了", "event-badge-ended");
      list.appendChild(el);
    });
    const next = items.filter((el) => el.dataset.eventDate >= today).sort((a, b) => a.dataset.eventDate.localeCompare(b.dataset.eventDate))[0];
    if (next) badge(next, next.dataset.eventDate === today ? "今日" : "次のイベント", "event-badge-next");
  });
}

// 活動ページの「次に体験できる日」。曜日・期間は活動診断と同じデータ（shindan.html の #quiz-data）を使う
function initNextDays() {
  const box = document.querySelector("[data-next-days]");
  if (!box || !window.fetch) return;
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }, JA = "日月火水木金土";
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  fetch("shindan.html")
    .then((r) => r.text())
    .then((html) => {
      const el = new DOMParser().parseFromString(html, "text/html").getElementById("quiz-data");
      const act = el && JSON.parse(el.textContent).activities.find((a) => a.key === box.dataset.nextDays);
      if (!act) return;
      const out = [], d = new Date();
      const now = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      d.setHours(0, 0, 0, 0);
      for (let i = 0; i < 120 && out.length < 3; i++, d.setDate(d.getDate() + 1)) {
        const s = iso(d);
        if (act.start && s < act.start) continue;
        if (act.end && s > act.end) break;
        if ((act.skip || []).includes(s)) continue;
        act.slots.forEach((sl) => {
          if (out.length >= 3 || !sl.weekdays.some((w) => WD[w] === d.getDay())) return;
          if (i === 0 && sl.ends && now >= sl.ends) return;
          out.push((d.getMonth() + 1) + "/" + d.getDate() + "（" + JA[d.getDay()] + "）" + sl.period);
        });
      }
      if (!out.length) return;
      box.querySelector(".next-try-days").textContent = out.join("・");
      box.hidden = false;
    })
    .catch(() => {});
}
