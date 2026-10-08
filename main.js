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

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        const section = entry.target.closest(".section");
        if (section) section.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  targets.forEach((node) => observer.observe(node));
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
      text: "最新の日時・場所はEventsページで確認してください。未確定項目は『予定』と明記しています。",
      links: [
        { label: "Events一覧", href: `${base}events.html` },
        { label: "新歓詳細", href: `${base}welcome.html` },
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
      text: "活動頻度は週2回程度が目安です。時期により増減するため、最新情報は日程ページで確認してください。",
      links: [
        { label: "新歓日程", href: `${base}events.html` },
        { label: "Events一覧", href: `${base}events.html` },
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
      text: "Debateは論理競技、Speechは発表、Discussionは対話、Lessonは基礎練習が中心です。",
      links: [
        { label: "Activities一覧", href: `${base}activities.html` },
        { label: "Debate", href: `${base}debate.html` },
        { label: "Speech", href: `${base}speech.html` }
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

  if (document.readyState === "complete") {
    requestAnimationFrame(start);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(start), { once: true });
  }
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
