/**
 * ビルド後の HTML に「読み進めるための道具」を足す transform。
 *
 *   全ページ
 *     ・横にはみ出す表を、キーボードでもスクロールできる領域（.table-scroll）で包む
 *     ・コードブロックが無いページでは Prism を読み込まない
 *
 *   各回ページ（.lesson[data-lesson]）
 *     ・h2〜h4 に安定した id を付ける（目次・ページ内リンク・「続きから読む」の目印）
 *     ・目次を作って [data-lesson-toc] に流し込む
 *     ・「演習」の各問の末尾に、手順ボックス（フォルダ・コマンド・できたチェック・
 *       実行結果の例／解答へのリンク）を差し込む。中身は src/_data/exercises.js
 *     ・各問の解答（<details>）に id と「問題に戻る」リンクを付ける
 *
 *   Markdown 側には何も書かなくてよい。見出しの文言から問題のキーを取り出す:
 *     「第1問」「問1」「演習1」→ "1"  ／ 「問1・問2」→ "1","2" ／ 「発展」→ "発展"
 */
const path = require("node:path");

// ---------------------------------------------------------------------------
// 小道具
// ---------------------------------------------------------------------------
const stripTags = (html) =>
  String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 見出しの文言から id を作る。日本語はそのまま残す（HTML5 では id に使える） */
function slugify(text) {
  const s = text
    .toLowerCase()
    .replace(/[`'"“”‘’「」『』（）()［］\[\]{}<>《》【】、。，．,.!?！？:：;；・／/\\|~〜…‥*+=#&%$@^]/g, " ")
    .replace(/──|—|–/g, " ")
    .trim()
    .replace(/\s+/g, "-");
  return s || "section";
}

/** 見出し・summary の文言から問題のキーを取り出す */
function exerciseKeys(text) {
  const t = stripTags(text);
  if (/^発展/.test(t)) return ["発展"];
  if (/^チャレンジ/.test(t)) return ["チャレンジ"];
  if (!/^(第\s*\d+\s*問|問\s*\d+|演習\s*\d+)/.test(t)) return [];
  const label = t.split(/\s|──|（|\(/)[0];
  return [...label.matchAll(/\d+/g)].map((m) => m[0]);
}

// ---------------------------------------------------------------------------
// 全ページ共通
// ---------------------------------------------------------------------------

/** 表を .table-scroll で包み、キーボードで操作できる領域にする */
function wrapTables(html) {
  // 既存の <div class="table-scroll"> に属性を足す
  html = html.replace(/<div class="table-scroll">/g, '<div class="table-scroll" data-scroll-region>');
  // 囲まれていない表を包む
  let out = "";
  let last = 0;
  const re = /<table[\s>][\s\S]*?<\/table>/g;
  let m;
  while ((m = re.exec(html))) {
    const before = html.slice(Math.max(0, m.index - 80), m.index);
    const wrapped = /<div class="table-scroll" data-scroll-region>\s*$/.test(before) ||
      /class="lesson-index__scroll[^"]*"[^>]*>\s*$/.test(before);
    out += html.slice(last, m.index);
    out += wrapped ? m[0] : `<div class="table-scroll" data-scroll-region>${m[0]}</div>`;
    last = m.index + m[0].length;
  }
  out += html.slice(last);
  // 領域に名前を付ける（表の見出し行から）。tabindex は JS がはみ出しを検出したときだけ付ける
  return out.replace(
    /<div class="table-scroll" data-scroll-region>(\s*<table[\s>][\s\S]*?<\/table>)/g,
    (all, table) => {
      const head = table.match(/<thead>[\s\S]*?<\/thead>/);
      const cols = head ? [...head[0].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map((c) => stripTags(c[1])).filter(Boolean) : [];
      const label = cols.length ? `表：${cols.slice(0, 3).join("・")}` : "表";
      return `<div class="table-scroll" data-scroll-region role="region" aria-label="${escapeHtml(label)}">${table}`;
    }
  );
}

/** コードブロックの無いページから Prism を外す */
function dropUnusedPrism(html) {
  if (/class="[^"]*language-/.test(html.replace(/<head>[\s\S]*?<\/head>/, ""))) return html;
  return html
    .replace(/<link rel="stylesheet" href="[^"]*prism\.css">\s*/g, "")
    .replace(/<script src="[^"]*prism\.js"><\/script>\s*/g, "");
}

// ---------------------------------------------------------------------------
// 各回ページ
// ---------------------------------------------------------------------------

/** h2〜h4 に id を付け、見出しの一覧を返す */
function addHeadingIds(body) {
  const used = new Set([...body.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const headings = [];
  const html = body.replace(/<h([234])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g, (all, lv, attrs, inner) => {
    const text = stripTags(inner);
    let id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
    if (!id) {
      const base = slugify(text);
      id = base;
      for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
      used.add(id);
      attrs = `${attrs} id="${id}"`;
    }
    const level = Number(lv);
    const isPart = level === 2 && /class="[^"]*\bpart\b/.test(attrs);
    headings.push({ level, id, text, isPart });
    return `<h${lv}${attrs}>${inner}</h${lv}>`;
  });
  return { html, headings };
}

/** 見出しを 部 → h3 → h4 の木にする */
function buildTree(headings) {
  const parts = [];
  let part = null;
  let h3 = null;
  for (const h of headings) {
    if (h.level === 2) {
      part = { ...h, items: [] };
      parts.push(part);
      h3 = null;
    } else if (h.level === 3) {
      if (!part) parts.push((part = { text: "", items: [] }));
      h3 = { ...h, children: [] };
      part.items.push(h3);
    } else if (h.level === 4 && h3) {
      h3.children.push(h);
    }
  }
  return parts;
}

/** 目次の HTML。演習の問は常に見せ、図解の小項目は折りたたむ */
function renderToc(parts) {
  // 目次では「（目安 5分）」のような所要時間は省いて短くする
  const short = (t) => t.replace(/s*（目安[^）]*）s*$/, "");
  const li = (h) => `<li><a href="#${h.id}" data-toc-link>${escapeHtml(short(h.text))}</a></li>`;
  const groups = parts
    .map((p) => {
      const items = p.items
        .map((h3) => {
          let sub = "";
          if (h3.children.length) {
            const list = `<ol class="lesson-toc__sub">${h3.children.map(li).join("")}</ol>`;
            const isExercise = /^演習/.test(h3.text);
            sub = isExercise
              ? list
              : `<details class="lesson-toc__more"><summary>${h3.children.length}項目</summary>${list}</details>`;
          }
          return `<li><a href="#${h3.id}" data-toc-link>${escapeHtml(h3.text)}</a>${sub}</li>`;
        })
        .join("");
      const title = p.text ? `<p class="lesson-toc__part">${escapeHtml(p.text)}</p>` : "";
      return `<div class="lesson-toc__group">${title}<ol class="lesson-toc__list">${items}</ol></div>`;
    })
    .join("");
  return (
    `<nav class="lesson-toc" aria-labelledby="lesson-toc-title" data-lesson-toc>` +
    `<h2 class="lesson-toc__title" id="lesson-toc-title">この回の目次</h2>` +
    `<div class="lesson-toc__groups">${groups}</div>` +
    `</nav>`
  );
}

/** 手順ボックス */
function renderStepBox(slug, step, links) {
  const key = escapeHtml(step.key);
  const parts = [];
  parts.push(`<aside class="ex-box" aria-label="${escapeHtml(step.label)} の進め方" data-ex-box="${key}">`);
  parts.push(`<div class="ex-box__head"><span class="ex-box__label">${escapeHtml(step.label)}</span>`);
  if (step.compile) parts.push(`<span class="ex-box__title">コンパイルと実行</span>`);
  else if (step.quiz) parts.push(`<span class="ex-box__title">コードを読んで答える問題です（実行はしません）</span>`);
  else if (step.thinking) parts.push(`<span class="ex-box__title">考察問題です（コードは書きません）</span>`);
  parts.push(`</div>`);

  if (step.compile) {
    parts.push(`<ol class="ex-box__steps">`);
    parts.push(
      `<li>ZIP を展開したフォルダで、<code>${escapeHtml(step.dir)}</code> に移動します。</li>`
    );
    if (step.create) {
      parts.push(
        `<li>同じフォルダに <strong>${step.create.map((f) => `<code>${escapeHtml(f)}</code>`).join(" と ")}</strong> を新しく作ります。</li>`
      );
    }
    parts.push(`<li>必要なファイルだけを並べてコンパイルし、<code>${escapeHtml(step.run)}</code> を実行します。</li>`);
    parts.push(`</ol>`);
    const cmd = [`cd ${step.dir}`, `javac -encoding UTF-8 ${step.compile.join(" ")}`, `java ${step.run}`].join("\n");
    parts.push(
      `<figure class="codeblock codeblock--shell">` +
        `<figcaption class="codeblock__head"><span class="codeblock__badge">コマンド</span>` +
        `<span class="codeblock__file">PowerShell・コマンドプロンプト・ターミナル共通</span></figcaption>` +
        `<div class="codeblock__body"><pre class="language-none"><code class="language-none">${escapeHtml(cmd)}\n</code></pre>` +
        `<button class="codeblock__copy" type="button" aria-label="コマンドをコピー">コピー</button></div>` +
        `</figure>`
    );
    if (step.note) parts.push(`<p class="ex-box__note">${escapeHtml(step.note)}</p>`);
  }

  parts.push(`<div class="ex-box__foot">`);
  parts.push(
    `<label class="ex-check" hidden><input type="checkbox" data-ex-check="${key}"> <span>${escapeHtml(step.label)} ができた</span></label>`
  );
  const nav = [];
  if (links.result) nav.push(`<a href="#${links.result}">実行結果の例</a>`);
  if (links.answer) nav.push(`<a href="#${links.answer}" data-answer-link>解答・解説</a>`);
  if (nav.length) parts.push(`<p class="ex-box__links">${nav.join("")}</p>`);
  parts.push(`</div></aside>`);
  return parts.join("");
}

function enhanceLesson(html, { exercises, slug }) {
  const start = html.indexOf('<div class="lesson__body prose">');
  if (start < 0) return html;
  const bodyEnd = html.indexOf("<span data-lesson-body-end hidden></span>", start);
  if (bodyEnd < 0) return html;
  let body = html.slice(start, bodyEnd);

  // 1. id
  const res = addHeadingIds(body);
  body = res.html;
  const headings = res.headings;
  const tree = buildTree(headings);

  // 2. 演習・実行結果・解答の位置
  const h3s = headings.filter((h) => h.level === 3);
  const findH3 = (re) => h3s.find((h) => re.test(h.text));
  const secExercise = findH3(/^演習/);
  const secResult = findH3(/^実行結果/);
  const secAnswer = findH3(/^解答/);

  const posOf = (id) => body.indexOf(` id="${id}"`);
  const nextH3After = (pos) => {
    const r = /<h3[\s>]/g;
    r.lastIndex = pos + 1;
    const m = r.exec(body);
    return m ? m.index : body.length;
  };

  // 3. 実行結果の小見出し → キー
  const resultIds = {};
  if (secResult) {
    const from = posOf(secResult.id);
    const to = nextH3After(from);
    for (const h of headings.filter((h) => h.level === 4)) {
      const p = posOf(h.id);
      if (p > from && p < to) for (const k of exerciseKeys(h.text)) resultIds[k] = resultIds[k] || h.id;
    }
  }

  // 4. 解答の <details> に id と「問題に戻る」を付ける（後ろから書き換えて位置ずれを防ぐ）
  const answerIds = {};
  const problemIds = {};
  if (secExercise) {
    const from = posOf(secExercise.id);
    const to = nextH3After(from);
    for (const h of headings.filter((h) => h.level === 4)) {
      const p = posOf(h.id);
      if (p > from && p < to) for (const k of exerciseKeys(h.text)) problemIds[k] = problemIds[k] || h.id;
    }
  }
  if (secAnswer) {
    const from = posOf(secAnswer.id);
    const to = nextH3After(from);
    const re = /<details>(\s*<summary>([\s\S]*?)<\/summary>)/g;
    re.lastIndex = from;
    const found = [];
    let m;
    while ((m = re.exec(body)) && m.index < to) found.push({ index: m.index, summaryHtml: m[1], text: m[2] });
    for (const f of found.reverse()) {
      const keys = exerciseKeys(f.text);
      if (!keys.length) continue;
      const id = `answer-${keys.join("-")}`;
      for (const k of keys) answerIds[k] = answerIds[k] || id;
      // 対応する </details> を探す（入れ子を数える）
      const tagRe = /<\/?details[\s>]/g;
      tagRe.lastIndex = f.index + 1;
      let depth = 1;
      let t;
      let closeAt = -1;
      while ((t = tagRe.exec(body))) {
        depth += t[0].startsWith("</") ? -1 : 1;
        if (depth === 0) { closeAt = t.index; break; }
      }
      const back = keys
        .filter((k) => problemIds[k])
        .map((k) => `<a href="#${problemIds[k]}">↑ ${escapeHtml(labelFor(exercises, k))} の問題に戻る</a>`)
        .join("");
      if (closeAt > 0 && back) {
        body = body.slice(0, closeAt) + `<p class="answer-back">${back}</p>` + body.slice(closeAt);
      }
      body =
        body.slice(0, f.index) +
        `<details id="${id}" class="answer" data-answer="${escapeHtml(keys.join(" "))}">` +
        body.slice(f.index + "<details>".length);
    }
  }

  // 5. 各問の末尾に手順ボックス
  if (secExercise && exercises && exercises.length) {
    const from = posOf(secExercise.id);
    const to = nextH3After(from);
    const probs = headings
      .filter((h) => h.level === 4)
      .map((h) => ({ ...h, pos: posOf(h.id), keys: exerciseKeys(h.text) }))
      .filter((h) => h.pos > from && h.pos < to);
    // 後ろから差し込む
    for (let i = probs.length - 1; i >= 0; i--) {
      const p = probs[i];
      const step = exercises.find((s) => p.keys.includes(s.key));
      if (!step) continue;
      const end = i + 1 < probs.length ? body.lastIndexOf("<h4", probs[i + 1].pos) : to;
      const box = renderStepBox(slug, step, {
        result: resultIds[step.key] || (secResult && secResult.id),
        answer: answerIds[step.key],
      });
      body = body.slice(0, end) + box + "\n" + body.slice(end);
    }
  }

  // 演習の入口に ZIP の案内
  if (secExercise) {
    const p = posOf(secExercise.id);
    const close = body.indexOf("</h3>", p) + "</h3>".length;
    const zip =
      `<p class="ex-zip"><a class="button button--ghost" href="../downloads/${escapeHtml(slug)}.zip" download>` +
      `この回の演習ファイル一式（ZIP）</a>` +
      `<span>展開すると <code>${escapeHtml(slug)}</code> フォルダができます。各問の末尾に、そのフォルダからのコマンドがあります。</span></p>`;
    body = body.slice(0, close) + zip + body.slice(close);
  }

  html = html.slice(0, start) + body + html.slice(bodyEnd);

  // 6. 目次
  html = html.replace(/<div data-lesson-toc><\/div>/, renderToc(tree));
  return html;
}

function labelFor(exercises, key) {
  const s = (exercises || []).find((e) => e.key === key);
  return s ? s.label : key === "発展" ? "発展" : `問${key}`;
}

// ---------------------------------------------------------------------------
module.exports = function (eleventyConfig, { srcDir = "src" } = {}) {
  const exercisesPath = path.resolve(srcDir, "_data/exercises.js");

  eleventyConfig.addTransform("lessonEnhance", function (content) {
    const out = (this.page && this.page.outputPath) || "";
    if (!out.endsWith(".html")) return content;
    let html = wrapTables(content);
    html = dropUnusedPrism(html);
    const m = html.match(/<article class="lesson" data-lesson="([^"]+)"/);
    if (m) {
      delete require.cache[exercisesPath];
      const exercises = require(exercisesPath)[m[1]] || [];
      html = enhanceLesson(html, { exercises, slug: m[1] });
    }
    return html;
  });
};

module.exports._test = { slugify, exerciseKeys, stripTags };
