/* ===========================================================================
   reading.js — 読み進めるための道具
   ---------------------------------------------------------------------------
   ・横にはみ出す表：はみ出しているときだけキーボードで操作できる領域にする
   ・各回ページ：目次の現在地／上に出る細いバー／問ごとの「できた」／回の完了／
     最後に読んでいた位置の記録／解答へのリンクで折りたたみを開く
   ・トップ：進み具合・「続きから読む」・各回の状態
   ・記録は localStorage（このブラウザだけ）。使えない環境でも教材は普通に読める
   ・外部ライブラリ・fetch・CDN は使わない
   =========================================================================== */
(function () {
  "use strict";

  // -------------------------------------------------------------------------
  // 記録
  // -------------------------------------------------------------------------
  var KEY = "kashiwagi-time:progress:v1";
  var storageOk = true;

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (data && typeof data === "object" && data.lessons) return data;
    } catch (e) {
      storageOk = false;
    }
    return { v: 1, lessons: {}, last: null };
  }
  function save(data) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      storageOk = false;
      return false;
    }
  }
  function lessonRec(data, slug) {
    if (!data.lessons[slug]) data.lessons[slug] = { done: false, ex: {} };
    if (!data.lessons[slug].ex) data.lessons[slug].ex = {};
    return data.lessons[slug];
  }
  function countEx(rec, keys) {
    var n = 0;
    for (var i = 0; i < keys.length; i++) if (rec && rec.ex && rec.ex[keys[i]]) n++;
    return n;
  }
  function showStorageError() {
    var els = document.querySelectorAll("[data-storage-error]");
    for (var i = 0; i < els.length; i++) els[i].hidden = false;
  }
  function idOf(link) {
    try {
      return decodeURIComponent(link.getAttribute("href").slice(1));
    } catch (e) {
      return link.getAttribute("href").slice(1);
    }
  }

  // -------------------------------------------------------------------------
  // 横にはみ出す表
  // -------------------------------------------------------------------------
  function setupScrollRegions() {
    var regions = document.querySelectorAll("[data-scroll-region]");
    if (!regions.length) return;
    function update() {
      for (var i = 0; i < regions.length; i++) {
        var r = regions[i];
        var over = r.scrollWidth > r.clientWidth + 1;
        r.classList.toggle("is-overflowing", over);
        if (over) r.setAttribute("tabindex", "0");
        else r.removeAttribute("tabindex");
        // はみ出しているときだけ、表の上に案内を出す
        var hint = r.previousElementSibling;
        var hasHint = hint && hint.classList.contains("scroll-hint");
        if (over && !hasHint) {
          hint = document.createElement("p");
          hint.className = "scroll-hint";
          hint.setAttribute("aria-hidden", "true");
          hint.textContent = "横にスクロールできます";
          r.parentNode.insertBefore(hint, r);
        } else if (!over && hasHint) {
          hint.parentNode.removeChild(hint);
        }
        r.classList.toggle("is-scrolled", r.scrollLeft > 2);
        r.classList.toggle("is-scrolled-end", r.scrollLeft + r.clientWidth >= r.scrollWidth - 2);
      }
    }
    for (var i = 0; i < regions.length; i++) {
      regions[i].addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", update);
    update();
  }

  // -------------------------------------------------------------------------
  // 各回ページ
  // -------------------------------------------------------------------------
  function setupLesson(article) {
    var slug = article.getAttribute("data-lesson");
    var order = article.getAttribute("data-lesson-order");
    var title = article.getAttribute("data-lesson-title");
    var keys = (article.getAttribute("data-ex-keys") || "").split(" ").filter(Boolean);
    var data = load();
    var rec = lessonRec(data, slug);
    rec.seen = Date.now();
    // 開いた時点で「続きから読む」の行き先をこの回にする（見出しまで読み進めたら、その見出しに更新する）
    if (!data.last || data.last.slug !== slug) {
      data.last = { slug: slug, order: Number(order), title: title, id: "", section: "", ts: Date.now() };
    }
    save(data);
    if (!storageOk) showStorageError();

    // ---- 問ごとの「できた」と、回の進み具合
    var checks = article.querySelectorAll("[data-ex-check]");
    var progress = article.querySelector("[data-lesson-progress]");
    var progressBar = article.querySelector("[data-lesson-progress-bar]");
    var progressText = article.querySelector("[data-lesson-progress-text]");
    var complete = article.querySelector("[data-lesson-complete]");
    var completeBtn = article.querySelector("[data-lesson-complete-toggle]");
    var completeSummary = article.querySelector("[data-lesson-complete-summary]");
    var doneBadge = article.querySelector("[data-lesson-done-badge]");

    function render() {
      var n = countEx(rec, keys);
      if (progress) {
        progress.hidden = false;
        progressBar.style.width = keys.length ? (100 * n) / keys.length + "%" : "0";
        progressText.textContent = "演習 " + n + " / " + keys.length + " 問できた";
      }
      for (var i = 0; i < checks.length; i++) {
        var k = checks[i].getAttribute("data-ex-check");
        checks[i].checked = !!rec.ex[k];
        var box = checks[i].closest(".ex-box");
        if (box) box.classList.toggle("is-done", !!rec.ex[k]);
      }
      if (complete) {
        complete.hidden = false;
        complete.classList.toggle("is-done", !!rec.done);
        completeBtn.setAttribute("aria-pressed", rec.done ? "true" : "false");
        completeBtn.textContent = rec.done ? "完了を取り消す" : "この回を完了にする";
        if (rec.done) {
          completeSummary.textContent = "おつかれさまでした。第" + order + "回は完了として記録されています。";
        } else if (keys.length) {
          completeSummary.textContent =
            "演習は " + keys.length + " 問中 " + n + " 問できています。" +
            (n < keys.length ? "残りの問題は、あとから戻って解いてもかまいません。" : "全問できました！");
        } else {
          completeSummary.textContent = "読み終えたら、完了にしておきましょう。";
        }
      }
      if (doneBadge) doneBadge.hidden = !rec.done;
    }
    function onCheck(ev) {
      var k = ev.target.getAttribute("data-ex-check");
      data = load();
      rec = lessonRec(data, slug);
      if (ev.target.checked) rec.ex[k] = true;
      else delete rec.ex[k];
      if (!save(data)) showStorageError();
      render();
    }
    for (var i = 0; i < checks.length; i++) {
      var label = checks[i].closest(".ex-check");
      if (label) label.hidden = false;
      checks[i].addEventListener("change", onCheck);
    }
    if (completeBtn) {
      completeBtn.addEventListener("click", function () {
        data = load();
        rec = lessonRec(data, slug);
        rec.done = !rec.done;
        if (!save(data)) showStorageError();
        render();
      });
    }
    render();

    // ---- 解答へのリンク：折りたたみを開いてから移動する
    function openTarget(hash) {
      if (!hash || hash.length < 2) return;
      var el;
      try {
        el = document.getElementById(decodeURIComponent(hash.slice(1)));
      } catch (e) {
        return;
      }
      if (!el) return;
      var d = el.tagName === "DETAILS" ? el : el.closest("details");
      if (d && !d.open) d.open = true;
      if (el.classList.contains("answer")) {
        el.classList.remove("is-flash");
        void el.offsetWidth; // アニメーションをやり直させる
        el.classList.add("is-flash");
      }
    }
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (a) openTarget(a.getAttribute("href"));
    });
    window.addEventListener("hashchange", function () { openTarget(location.hash); });
    openTarget(location.hash);

    // ---- 目次の現在地・上に出るバー・最後に読んでいた位置
    var toc = article.querySelector("[data-lesson-toc]");
    var bar = article.querySelector("[data-lesson-bar]");
    if (!toc) return;
    var links = toc.querySelectorAll("[data-toc-link]");
    var targets = [];
    for (var j = 0; j < links.length; j++) {
      var id = idOf(links[j]);
      var h = document.getElementById(id);
      if (h) targets.push({ id: id, el: h, text: links[j].textContent, level: h.tagName });
    }

    var panel = bar && bar.querySelector("[data-lesson-bar-panel]");
    var toggle = bar && bar.querySelector("[data-lesson-bar-toggle]");
    var nowEl = bar && bar.querySelector("[data-lesson-bar-now]");
    var readEl = bar && bar.querySelector("[data-lesson-bar-read]");
    var panelLinks = [];
    function setOpen(open) {
      if (!panel) return;
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      bar.classList.toggle("is-open", open);
      if (open) {
        var cur = panel.querySelector('[aria-current="location"]');
        if (cur) {
          panel.scrollTop = 0;
          var top = cur.offsetTop - panel.clientHeight / 2;
          if (top > 0) panel.scrollTop = top;
        }
      }
    }
    if (panel) {
      // 目次の中身をパネルにも入れる（小項目の折りたたみは開いた状態で）
      var groups = toc.querySelector(".lesson-toc__groups").cloneNode(true);
      var more = groups.querySelectorAll("details");
      for (var m = 0; m < more.length; m++) {
        var list = more[m].querySelector("ol");
        more[m].parentNode.replaceChild(list, more[m]);
      }
      panel.appendChild(groups);
      panelLinks = panel.querySelectorAll("[data-toc-link]");
      bar.hidden = false;

      toggle.addEventListener("click", function () { setOpen(panel.hidden); });
      panel.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) setOpen(false);
      });
      document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape" && !panel.hidden) {
          setOpen(false);
          toggle.focus();
        }
      });
      document.addEventListener("click", function (ev) {
        if (!panel.hidden && !bar.contains(ev.target)) setOpen(false);
      });
    }

    var current;
    function markCurrent(t) {
      if (current === t) return;
      current = t;
      var lists = [links, panelLinks];
      for (var a = 0; a < lists.length; a++) {
        for (var b = 0; b < lists[a].length; b++) {
          var on = !!t && idOf(lists[a][b]) === t.id;
          if (on) lists[a][b].setAttribute("aria-current", "location");
          else lists[a][b].removeAttribute("aria-current");
        }
      }
      if (nowEl) {
        var parent = null;
        if (t && t.level === "H4") {
          for (var c = targets.indexOf(t); c >= 0; c--) {
            if (targets[c].level === "H3") { parent = targets[c]; break; }
          }
        }
        nowEl.textContent = t ? (parent ? parent.text + " › " : "") + t.text : title;
      }
    }

    var header = article.querySelector(".lesson__header");
    var ticking = false;
    var lastSaved = 0;
    function onScroll() {
      ticking = false;
      var found = null;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.getBoundingClientRect().top - 120 <= 0) found = targets[i];
        else break;
      }
      markCurrent(found);
      if (bar) {
        var past = header.getBoundingClientRect().bottom < 0;
        bar.classList.toggle("is-visible", past);
        if (!past && panel && !panel.hidden) setOpen(false);
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        if (readEl) readEl.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
      }
      // 「続きから読む」の目印（2秒に1回だけ書く）
      var now = Date.now();
      if (found && now - lastSaved > 2000) {
        lastSaved = now;
        var d = load();
        d.last = { slug: slug, order: Number(order), title: title, id: found.id, section: found.text, ts: now };
        save(d);
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(onScroll);
      }
    }, { passive: true });
    onScroll();
  }

  // -------------------------------------------------------------------------
  // トップ
  // -------------------------------------------------------------------------
  function setupHome() {
    var cards = document.querySelectorAll("[data-lesson-card]");
    if (!cards.length) return;
    var data = load();
    var anything = !!data.last || Object.keys(data.lessons).length > 0;

    var doneLessons = 0;
    var exDone = 0;
    var exTotal = 0;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var slug = card.getAttribute("data-lesson-card");
      var total = Number(card.getAttribute("data-ex-total")) || 0;
      var rec = data.lessons[slug];
      var n = rec && rec.ex ? Object.keys(rec.ex).length : 0;
      if (n > total) n = total;
      exTotal += total;
      exDone += n;
      var status = card.querySelector("[data-lesson-status]");
      var meter = card.querySelector("[data-lesson-meter]");
      card.classList.remove("is-done", "is-doing");
      if (rec && rec.done) {
        doneLessons++;
        card.classList.add("is-done");
        status.className = "status status--done";
        status.textContent = "完了";
      } else if (rec) {
        card.classList.add("is-doing");
        status.className = "status status--doing";
        status.textContent = total ? "学習中 " + n + " / " + total + " 問" : "学習中";
      } else {
        status.className = "status status--todo";
        status.textContent = total ? "演習 " + total + "問" : "未着手";
      }
      if (meter) {
        meter.hidden = !rec || rec.done || !total;
        meter.firstElementChild.style.width = total ? (100 * n) / total + "%" : "0";
      }
    }

    var panel = document.querySelector("[data-progress-panel]");
    if (panel) {
      panel.hidden = !anything;
      panel.querySelector("[data-stat-lessons]").textContent = doneLessons;
      panel.querySelector("[data-stat-ex]").textContent = exDone;
      panel.querySelector("[data-stat-ex-unit]").textContent = "/ " + exTotal + " 問 できた";
      panel.querySelector("[data-stat-bar]").style.width = (100 * doneLessons) / cards.length + "%";
      panel.querySelector("[data-progress-reset]").onclick = function () {
        if (!window.confirm("このブラウザに保存した進み具合（完了・できた・続きの位置）をすべて消します。よろしいですか？")) return;
        try { window.localStorage.removeItem(KEY); } catch (e) { /* 消せない環境では何もしない */ }
        setupHome();
      };
    }

    // 「続きから読む」
    var last = data.last;
    var resume = document.querySelector("[data-cta-resume]");
    var startBtn = document.querySelector("[data-cta-start]");
    var link = null;
    if (last && last.slug) {
      for (var c = 0; c < cards.length; c++) {
        if (cards[c].getAttribute("data-lesson-card") === last.slug) link = cards[c].querySelector("a");
      }
    }
    if (resume) {
      if (link) {
        resume.href = link.getAttribute("href") + (last.id ? "#" + encodeURIComponent(last.id) : "");
        resume.textContent = "";
        var t1 = document.createElement("span");
        t1.className = "button__main";
        t1.textContent = "続きから読む";
        var t2 = document.createElement("span");
        t2.className = "button__sub";
        t2.textContent = "第" + last.order + "回 " + last.title + (last.section ? "「" + last.section + "」" : "");
        resume.appendChild(t1);
        resume.appendChild(t2);
      }
      resume.hidden = !link;
      if (startBtn) startBtn.classList.toggle("button--secondary", !!link);
    }
  }

  // -------------------------------------------------------------------------
  setupScrollRegions();
  var article = document.querySelector("article.lesson[data-lesson]");
  if (article) setupLesson(article);
  setupHome();
})();
