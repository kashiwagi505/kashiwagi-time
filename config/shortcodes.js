/**
 * config/shortcodes.js — 図解の部品ライブラリ（Eleventy ショートコード）
 * ============================================================================
 *
 * 教材方針（CLAUDE.md 1章）「図解で概念を直感的につかませる」を実装する部品群。
 * 全7回の図は少数の型の組み合わせに還元できる（cross-session-findings.md 1章）ので、
 * ここで部品化しておき、各回ページは組み合わせるだけにする。
 *
 * ── 使い方の要点（詳細は site/docs/figures.md）──────────────────────────
 *
 *   {% cards [ {chara:"hero", name:"たかぎ", stats:{身長:"170cm"}} ] %}
 *   {% compare %}{% panel "Before" %} … {% endpanel %}{% panel "After" %} … {% endpanel %}{% endcompare %}
 *   {% legend %}                      黄=情報／青=動作 の凡例（★色分けを使う図には必ず付ける）
 *
 * ── 守っている約束 ─────────────────────────────────────────────────────
 *
 *   1. 色は必ず tokens.css の CSS 変数経由。生の16進数は書かない
 *   2. 概念色の予約: --c-info（黄）＝情報／フィールド、--c-action（青）＝動作／メソッド
 *      図の中でアクセント色（藍）を「意味を持つ色」として使わない
 *   3. 決定3（図のスマホ対応）:
 *        対比型  … 横並びを維持し、入らなければ図単位で横スクロール（figure--hold）
 *        非対比型… 640px 以下で縦積み（figure--stack）
 *      → 各部品は横に並ぶ箱を必ず .fig-row に入れる。畳むかどうかは
 *        ルートの figure--hold / figure--stack が決める（figures.css の1組のルール）
 *   4. はみ出しは必ず .figure__scroll の内側で閉じる（ページ全体を横スクロールさせない）
 *   5. 画像（キャラ立ち絵）が存在しなくても図の構造が崩れない
 *      → 画像の枠は CSS で寸法を固定し、img は中に流し込むだけ
 *   6. 参照はすべて相対パス（.eleventy.js の rel フィルタと同じ計算をする）
 *
 * ── 実装メモ ───────────────────────────────────────────────────────────
 *
 *   * データ駆動の部品（cards / tree など）は出力に空行を作らない。
 *     Markdown のあとに markdown-it が通るので、空行を入れると HTML ブロックが
 *     途切れて <p> に包まれてしまう。
 *   * 逆にコンテナ系（fig / compare / panel / box / codeout）は本体の前後に
 *     わざと空行を出す。こうすると中身が Markdown として解釈され、
 *     ```java フェンス（codeblocks.js の枠）や箇条書きをそのまま書ける。
 *   * 文字列は既定でエスケープする（`ArrayList<Adventurer>` をそのまま書けるように）。
 *     HTML を入れたいときは {html:"…"} を渡す。
 */

"use strict";

/* ===========================================================================
   1. 小さなヘルパ
   =========================================================================== */

/** HTML エスケープ。{html:"…"} を渡したときだけ素通しする */
function esc(v) {
  if (v == null || v === false) return "";
  if (typeof v === "object" && typeof v.html === "string") return v.html;
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 属性用（値のみ） */
function attrEsc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/**
 * .eleventy.js の rel フィルタと同じ計算。
 * ルート絶対パス（/assets/...）は GitHub Pages のサブディレクトリ配信で壊れるので使わない。
 */
function relPath(ctx, target) {
  const url = (ctx && ctx.page && ctx.page.url) || "/";
  const depth = Math.max(0, url.split("/").length - 2);
  const prefix = depth > 0 ? "../".repeat(depth) : "./";
  return prefix + String(target == null ? "" : target).replace(/^\/+/, "");
}

/**
 * ショートコードの引数を「データ」と「オプション」に分ける。
 *   {% cards items %}                      → [items, {}]
 *   {% cards items, {caption:"…"} %}       → [items, {caption:…}]
 *   {% cards items, caption="…" %}         → [items, {caption:…}]   （Nunjucks の kwargs）
 *   {% tree {root:…, caption:"…"} %}       → [{root:…}, {caption:…}]（単一オブジェクトは兼用）
 */
function splitArgs(args, opt = {}) {
  const list = Array.prototype.slice.call(args);
  let options = {};
  const last = list[list.length - 1];
  if (isPlainObject(last) && (last.__keywords || list.length > 1)) {
    options = Object.assign({}, last);
    delete options.__keywords;
    list.pop();
  }
  let data = list.length > 1 ? list : list[0];
  // 単一オブジェクトの部品は、データとオプションを同じオブジェクトに混ぜて書ける
  if (opt.merge && isPlainObject(data)) options = Object.assign({}, data, options);
  return [data, options];
}

/** 配列に正規化（文字列 1件・undefined も受ける） */
function asArray(v) {
  if (v == null || v === "") return [];
  if (Array.isArray(v)) return v;
  if (isPlainObject(v) && Array.isArray(v.items)) return v.items;
  if (typeof v === "string") return v.split(/\s*[,、]\s*/).filter(Boolean);
  return [v];
}

/** 文字列アイテムを {t:"…"} に正規化 */
function asItem(v, key = "t") {
  if (isPlainObject(v)) return v;
  return { [key]: v };
}

function classList(...xs) {
  return xs.filter(Boolean).join(" ");
}

/** data-tone 属性。tokens.css の概念色にひもづく（figures.css の [data-tone] を見る） */
const TONES = [
  "plain", "info", "action", "gold", "ok", "danger", "dim", "mute", "code",
];
function tone(t) {
  return t && TONES.includes(String(t)) ? ` data-tone="${t}"` : "";
}

/* ===========================================================================
   2. 画像（キャラ立ち絵・アイテム）
   ---------------------------------------------------------------------------
   ★画像が読み込めなくても図が崩れないように、枠の寸法は CSS で固定し
     img はその中に流し込むだけにする（読み込めなければ alt だけが出る）。
     配信するのは WebP のみ。
   =========================================================================== */

/** キー → assets/img/ 以下のベース名（拡張子・サイズ違いは付けて解決する） */
const ART = {
  // 立ち絵（chara/）
  hero: ["chara/hero", "勇者"],
  wizard: ["chara/wizard", "魔法使い"],
  tank: ["chara/tank", "タンク（戦士）"],
  saint: ["chara/saint", "聖女"],
  archer: ["chara/archer", "弓使い"],
  maou: ["chara/maou", "魔王"],
  assassin: ["chara/assassin", "暗殺者"],
  priest: ["chara/priest", "僧侶"],
  "hero-excalibur": ["chara/hero-excalibur", "聖剣を持った勇者"],
  silhouette: ["chara/silhouette-adventurer", "職業不明の冒険者"],
  "silhouette-adventurer": ["chara/silhouette-adventurer", "職業不明の冒険者"],
  unknown: ["chara/silhouette-adventurer", "職業不明の冒険者"],
  // アイテム（items/）
  excalibur: ["items/excalibur", "聖剣エクスカリバー"],
  "holy-sword": ["items/holy-sword-slide", "聖剣"],
  "magic-circle": ["items/magic-circle", "魔法陣"],
};

const CHARA_SIZES = { s: "s", m: "m", l: "l" };
/* 実際の表示寸法。srcset の選択に使う（figures.css の --fig-chara-* と合わせる） */
const SIZE_REM = { s: "2.5rem", m: "4rem", l: "7rem" };

/**
 * 立ち絵・アイテムの <img> を組む。
 *   - 配信は WebP のみ（PNG の原本は site/masters/ に分離され、公開されない）。
 *     srcset で 320px 版と原寸を出し分ける。
 *   - key に "/" が入っていれば assets/img/ 以下のパスとして直接扱う。
 */
function artHtml(ctx, key, o = {}) {
  const raw = String(key || "");
  let base = raw;
  let alt = o.alt != null ? o.alt : "";
  if (ART[raw]) {
    base = ART[raw][0];
    if (o.alt == null) alt = ART[raw][1];
  }
  if (!base) return "";
  const size = CHARA_SIZES[o.size] || "m";
  const small = relPath(ctx, `assets/img/${base}-320.webp`);
  const full = relPath(ctx, `assets/img/${base}.webp`);
  // 配信するのは WebP だけ（PNG の原本は site/masters/ に分離されている）。
  // srcset で 320px 版と原寸を出し分ける。sizes は実際の表示寸法。
  return (
    `<span class="fig-chara fig-chara--${size}"${o.dim ? ' data-dim="true"' : ""}>` +
    `<img src="${attrEsc(small)}" srcset="${attrEsc(small)} 320w, ${attrEsc(full)} 700w"` +
    ` sizes="${SIZE_REM[size]}" alt="${attrEsc(alt)}" loading="lazy" decoding="async">` +
    `</span>`
  );
}

/* ===========================================================================
   3. figure のラッパ（決定3 の対比型／非対比型はここで決まる）
   =========================================================================== */

/**
 * @param {string} inner   図の中身
 * @param {object} o       共通オプション
 *        caption  図の下の説明文
 *        title    図の上の小見出し
 *        legend   凡例（true / "info,action" / 配列）
 *        wide     本文幅より広く出す（901px 以上でだけ左右にはみ出す）
 *        fit      "hold"（対比型・横並び維持）/ "stack"（非対比型・640px以下で縦積み）
 *        class    追加クラス
 */
function figureWrap(inner, o = {}, defaultFit = "stack") {
  const fit = o.fit === "hold" || o.fit === "stack" ? o.fit : defaultFit;
  const hold = fit === "hold";
  const cls = classList(
    "figure",
    `figure--${fit}`,
    o.wide ? "figure--wide" : null,
    o.class || o.cls
  );
  const out = [];
  out.push(`<figure class="${cls}"${o.id ? ` id="${attrEsc(o.id)}"` : ""}>`);
  if (o.title) out.push(`<p class="figure__title">${esc(o.title)}</p>`);
  if (o.legend) out.push(legendHtml(o.legend));
  // 対比型はキーボードでもスクロールできるようにフォーカスを受ける
  out.push(
    hold
      ? `<div class="figure__scroll" tabindex="0" role="group" aria-label="図（横にスクロールできます）">`
      : `<div class="figure__scroll">`
  );
  out.push(inner);
  out.push(`</div>`);
  if (hold) {
    out.push(
      `<p class="figure__hint" aria-hidden="true">← 横にスクロールできます →</p>`
    );
  }
  if (o.caption) out.push(`<figcaption class="figure__caption">${esc(o.caption)}</figcaption>`);
  out.push(`</figure>`);
  return out.join("");
}

/* ===========================================================================
   4. 凡例（★色分けを使う図には必ず出す）
   ---------------------------------------------------------------------------
   第1回の発表者ノート「黄色い付箋は情報、青い付箋は動作として、この後も同じ色で
   追いかけます」は口頭説明。Web版ではこの一文が消えるので凡例で置き換える。
   =========================================================================== */

const LEGEND_PRESET = {
  info: { tone: "info", label: "情報（フィールド）" },
  action: { tone: "action", label: "動作（メソッド）" },
  x: { mark: "x", label: "できないこと" },
  o: { mark: "o", label: "できること" },
  dim: { tone: "dim", label: "外れた・使えない状態" },
  gate: { tone: "action", label: "窓口メソッド（外から呼べる）" },
  private: { tone: "info", label: "private（外から直接触れない）" },
  gold: { tone: "gold", label: "ここに注目" },
  danger: { tone: "danger", label: "うまくいかない例" },
  ok: { tone: "ok", label: "うまくいく例" },
};

function legendHtml(spec) {
  let items = spec === true || spec == null || spec === "" ? ["info", "action"] : spec;
  items = asArray(items).map((it) => {
    if (typeof it === "string") return LEGEND_PRESET[it] || { label: it };
    if (isPlainObject(it) && it.preset)
      return Object.assign({}, LEGEND_PRESET[it.preset], it);
    return it;
  });
  const body = items
    .map((it) => {
      const swatch = it.mark
        ? markHtml(it.mark)
        : `<span class="fig-legend__swatch"${tone(it.tone)}></span>`;
      return `<li class="fig-legend__item">${swatch}<span>${esc(it.label)}</span></li>`;
    })
    .join("");
  return `<ul class="fig-legend" aria-label="図の凡例">${body}</ul>`;
}

/* ===========================================================================
   5. ✕バッジ／STOP・矢印・コード片
   =========================================================================== */

const MARKS = {
  x: ["✕", "できない"],
  o: ["○", "できる"],
  stop: ["STOP", "ここで止まる"],
  q: ["？", "不明"],
  new: ["NEW!", "新しく入った"],
  bang: ["！", "注目"],
};

function markHtml(kind, label) {
  const key = String(kind || "x").toLowerCase();
  const m = MARKS[key] || [String(kind), label || ""];
  const text = m[0];
  const aria = label != null ? label : m[1];
  return (
    `<span class="fig-mark fig-mark--${attrEsc(key)}" role="img" aria-label="${attrEsc(aria)}">` +
    `${esc(text)}</span>`
  );
}

function arrowHtml(o = {}) {
  const dir = ["right", "down", "left"].includes(o.dir) ? o.dir : "right";
  return (
    `<span class="fig-arrow fig-arrow--${dir}"${tone(o.tone)}>` +
    (o.label ? `<span class="fig-arrow__label">${esc(o.label)}</span>` : "") +
    `<span class="fig-arrow__line" aria-hidden="true"></span>` +
    `</span>`
  );
}

/* ===========================================================================
   6. カード（キャラ1体＋ステータス）── 最も広く使われる基礎部品
   =========================================================================== */

/**
 * 1枚分。
 *   { chara:"hero", name:"たかぎ", role:"勇者", stats:{身長:"170cm"}, lines:["Lv 12"],
 *     bar:{label:"HP", value:20, max:100}, badge:"NEW!", mark:"x", dim:true,
 *     tone:"info", note:"…" }
 */
function cardHtml(ctx, item, o = {}) {
  const it = asItem(item, "name");
  const size = it.size || o.size || "m";
  const cls = classList(
    "fig-card",
    `fig-card--${size}`,
    it.dim ? "is-dim" : null,
    it.empty ? "is-empty" : null
  );
  const out = [];
  out.push(`<div class="${cls}"${tone(it.tone)}>`);
  if (it.badge) out.push(`<span class="fig-card__badge">${esc(it.badge)}</span>`);
  if (it.mark) out.push(`<span class="fig-card__mark">${markHtml(it.mark, it.markLabel)}</span>`);
  if (it.chara) out.push(artHtml(ctx, it.chara, { size: size === "s" ? "s" : "m", dim: it.dim, alt: it.charaAlt }));
  if (it.empty && !it.chara) out.push(`<span class="fig-card__hole">？</span>`);
  if (it.name != null && it.name !== "")
    out.push(`<p class="fig-card__name">${esc(it.name)}</p>`);
  if (it.role) out.push(`<p class="fig-card__role">${esc(it.role)}</p>`);

  const rows = [];
  if (isPlainObject(it.stats)) {
    for (const k of Object.keys(it.stats)) {
      rows.push(
        `<div class="fig-card__stat"><span class="fig-card__k">${esc(k)}</span>` +
          `<span class="fig-card__v">${esc(it.stats[k])}</span></div>`
      );
    }
  }
  for (const line of asArray(it.lines)) {
    rows.push(`<div class="fig-card__stat"><span class="fig-card__v">${esc(line)}</span></div>`);
  }
  if (rows.length) out.push(`<div class="fig-card__stats">${rows.join("")}</div>`);
  if (it.bar) out.push(barHtml(it.bar));
  if (it.note) out.push(`<p class="fig-card__note">${esc(it.note)}</p>`);
  out.push(`</div>`);
  return out.join("");
}

/**
 * 値のバー（第3回図C のHPバー。同じ部品の2状態を作れるようにしてある）
 *   {label:"HP", value:20, max:100}         ふつう
 *   {label:"HP", value:-30, max:100}        0を割った（枠を突き抜けて赤くなる）
 *   {label:"HP", value:0, max:100, stop:true}  0でぴったり止まった
 */
function barHtml(spec) {
  const b = isPlainObject(spec) ? spec : { value: spec };
  const max = Number(b.max != null ? b.max : 100) || 100;
  const value = Number(b.value != null ? b.value : 0);
  const over = b.over != null ? !!b.over : value < 0 || value > max;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const state = over ? "over" : b.stop ? "stop" : "normal";
  return (
    `<div class="fig-bar" data-state="${state}">` +
    (b.label || b.value != null
      ? `<div class="fig-bar__head"><span>${esc(b.label || "")}</span>` +
        `<span class="fig-bar__num">${esc(b.text != null ? b.text : value)}</span></div>`
      : "") +
    `<div class="fig-bar__track"><div class="fig-bar__fill" style="width:${over ? 100 : pct.toFixed(1)}%"></div>` +
    (over ? `<span class="fig-bar__over" aria-hidden="true">◀</span>` : "") +
    `</div></div>`
  );
}

/* ===========================================================================
   7. クラス枠（箱＋情報の段／動作の段）
   =========================================================================== */

/**
 * { name:"Human", note:"設計図", chara:"hero",
 *   fields:["name","height"], methods:["walk()"],
 *   fieldsLabel:"情報", methodsLabel:"動作", tone:"plain", mark:"x" }
 * 配列を渡すと横並びになる。
 */
function classBoxOne(ctx, spec) {
  const c = asItem(spec, "name");
  const out = [];
  out.push(`<div class="fig-class"${tone(c.tone)}>`);
  out.push(
    `<div class="fig-class__head">` +
      (c.stereotype ? `<span class="fig-class__stereo">${esc(c.stereotype)}</span>` : "") +
      `<span class="fig-class__name">${esc(c.name)}</span>` +
      (c.mark ? markHtml(c.mark, c.markLabel) : "") +
      (c.note ? `<span class="fig-class__note">${esc(c.note)}</span>` : "") +
      `</div>`
  );
  if (c.chara) out.push(`<div class="fig-class__chara">${artHtml(ctx, c.chara, { size: "m" })}</div>`);
  const section = (kind, label, items) => {
    const list = asArray(items);
    if (!list.length) return "";
    const li = list
      .map((raw) => {
        const it = asItem(raw);
        return (
          `<li class="fig-class__item"${tone(it.tone || kind)}>` +
          (it.access ? `<span class="fig-class__access">${esc(it.access)}</span>` : "") +
          `<span class="fig-class__text">${esc(it.t)}</span>` +
          (it.mark ? markHtml(it.mark, it.markLabel) : "") +
          (it.note ? `<span class="fig-class__inote">${esc(it.note)}</span>` : "") +
          `</li>`
        );
      })
      .join("");
    return (
      `<div class="fig-class__sec"${tone(kind)}>` +
      `<p class="fig-class__sec-label">${esc(label)}</p>` +
      `<ul class="fig-class__list">${li}</ul></div>`
    );
  };
  out.push(section("info", c.fieldsLabel || "情報（フィールド）", c.fields));
  out.push(section("action", c.methodsLabel || "動作（メソッド）", c.methods));
  if (c.foot) out.push(`<p class="fig-class__foot">${esc(c.foot)}</p>`);
  out.push(`</div>`);
  return out.join("");
}

/* ===========================================================================
   8. カプセル図（枠線にまたがる窓口）── 第3回の中心
   =========================================================================== */

/**
 * { name:"Hero",
 *   inside:[{t:"hp", value:"120"}, "name"],       中身（private）
 *   gates:["getHp()", "setHp(int)"],              枠線にまたがる窓口
 *   outside:"外のコード", outsideChara:"assassin",
 *   direct:true      → 窓口を通らず中身に届いてしまう（できてしまう図）
 *   chara:"hero" }
 */
function capsuleHtml(ctx, spec) {
  const c = isPlainObject(spec) ? spec : { name: spec };
  const inside = asArray(c.inside).map((raw) => {
    const it = asItem(raw);
    return (
      `<li class="fig-capsule__field"${tone(it.tone || "info")}>` +
      `<span class="fig-capsule__lock" aria-hidden="true">🔒</span>` +
      `<span class="fig-capsule__fname">${esc(it.t)}</span>` +
      (it.value != null ? `<span class="fig-capsule__fval">${esc(it.value)}</span>` : "") +
      `</li>`
    );
  });
  const gates = asArray(c.gates).map((raw) => {
    const it = asItem(raw);
    return (
      `<li class="fig-capsule__gate"${tone(it.tone || "action")}>${esc(it.t)}` +
      (it.mark ? markHtml(it.mark, it.markLabel) : "") +
      `</li>`
    );
  });

  const out = [];
  out.push(`<div class="fig-capsule fig-row">`);
  if (c.outside || c.outsideChara) {
    out.push(
      `<div class="fig-capsule__outside">` +
        (c.outsideChara ? artHtml(ctx, c.outsideChara, { size: "m" }) : "") +
        (c.outside ? `<p class="fig-capsule__olabel">${esc(c.outside)}</p>` : "") +
        `</div>`
    );
    out.push(
      arrowHtml({
        dir: "right",
        tone: c.direct ? "danger" : "action",
        label: c.arrowLabel || (c.direct ? "直接いじれてしまう" : "窓口を通す"),
      })
    );
  }
  // fig-row を付けるのは、窓口を「殻の右の枠線」にまたがらせるため（横並び）。
  // 640px 以下では fig-row の縦積みで窓口が下の枠線にまたがる形に切り替わる。
  out.push(`<div class="fig-capsule__unit fig-row${c.direct ? " is-direct" : ""}">`);
  out.push(`<div class="fig-capsule__shell"${tone(c.tone)}>`);
  out.push(
    `<p class="fig-capsule__name">${esc(c.name)}` +
      (c.note ? `<span class="fig-capsule__note">${esc(c.note)}</span>` : "") +
      `</p>`
  );
  if (inside.length)
    out.push(
      `<p class="fig-capsule__ilabel">中身（private）</p>` +
        `<ul class="fig-capsule__inside">${inside.join("")}</ul>`
    );
  if (c.chara) out.push(`<div class="fig-capsule__chara">${artHtml(ctx, c.chara, { size: "m" })}</div>`);
  if (c.bar) out.push(barHtml(c.bar));
  out.push(`</div>`);
  if (gates.length)
    out.push(
      `<div class="fig-capsule__gatewrap">` +
        `<p class="fig-capsule__glabel">窓口（public）</p>` +
        `<ul class="fig-capsule__gates">${gates.join("")}</ul></div>`
    );
  out.push(`</div>`);
  out.push(`</div>`);
  return out.join("");
}

/* ===========================================================================
   9. 付箋（黄＝情報／青＝動作）。散乱と整列の両方
   =========================================================================== */

/* rotate は毎回同じ見た目にしたいので固定の表を引く（乱数にしない） */
const SCATTER = [-6, 4, -3, 7, -8, 2, 5, -4, 8, -2, 3, -7];

function notesHtml(items, o = {}) {
  const scatter = !!o.scatter;
  const li = asArray(items)
    .map((raw, i) => {
      const it = asItem(raw);
      const kind = it.kind || it.tone || "info";
      const style = scatter
        ? ` style="--rot:${SCATTER[i % SCATTER.length]}deg;--dx:${(i % 3) - 1}"`
        : "";
      return (
        `<li class="fig-note"${tone(kind)}${style}>` +
        `<span class="fig-note__text">${esc(it.t)}</span>` +
        (it.sub ? `<span class="fig-note__sub">${esc(it.sub)}</span>` : "") +
        (it.mark ? markHtml(it.mark, it.markLabel) : "") +
        `</li>`
      );
    })
    .join("");
  return `<ul class="fig-notes${scatter ? " fig-notes--scatter" : ""}">${li}</ul>`;
}

/* ===========================================================================
   10. リストの列（横一列＋インデックス番号）
   =========================================================================== */

/**
 * { type:"ArrayList<Adventurer>", items:[…カードの指定…],
 *   index:true, plus:true, slots:3, fixed:true, note:"定員3名" }
 */
function listRowHtml(ctx, spec) {
  const c = isPlainObject(spec) && !Array.isArray(spec) ? spec : { items: spec };
  const items = asArray(c.items);
  const slots = Number(c.slots || 0);
  const cells = [];
  const total = Math.max(items.length, slots);
  for (let i = 0; i < total; i++) {
    const raw = items[i];
    const it = raw == null || raw === "?" ? { empty: true } : asItem(raw, "name");
    cells.push(
      `<div class="fig-list__cell${it.empty ? " is-empty" : ""}">` +
        (c.index === false ? "" : `<span class="fig-list__idx">${i}</span>`) +
        cardHtml(ctx, Object.assign({ size: c.size || "s" }, it)) +
        (it.arrowNote ? `<span class="fig-list__cnote">${esc(it.arrowNote)}</span>` : "") +
        `</div>`
    );
  }
  if (c.plus) {
    cells.push(
      `<div class="fig-list__cell fig-list__cell--plus">` +
        (c.index === false ? "" : `<span class="fig-list__idx">${total}</span>`) +
        `<div class="fig-list__plus">＋<span>いくらでも増える</span></div></div>`
    );
  }
  return (
    `<div class="fig-list"${c.fixed ? ' data-fixed="true"' : ""}>` +
    (c.type ? `<p class="fig-list__type">${esc(c.type)}</p>` : "") +
    `<div class="fig-list__frame">${cells.join("")}</div>` +
    (c.note ? `<p class="fig-list__note">${esc(c.note)}</p>` : "") +
    `</div>`
  );
}

/* ===========================================================================
   11. 分岐グリッド（継承ツリー／1入力→N出力 の共通土台）
   ---------------------------------------------------------------------------
   親の下に子を並べ、線でつなぐ。線は「横棒＋縦棒」を子ごとのセルに分けて描くので
   子の数や幅がどうであれズレない。640px 以下では左に縦の幹を出す形に切り替える。
   =========================================================================== */

function branchGrid(children, renderChild, o = {}) {
  const n = children.length;
  if (!n) return "";
  const conns = children
    .map((_, i) => {
      const pos = n === 1 ? "only" : i === 0 ? "first" : i === n - 1 ? "last" : "mid";
      return `<span class="fig-branch__conn" data-pos="${pos}" aria-hidden="true"></span>`;
    })
    .join("");
  const cells = children.map((c, i) => `<div class="fig-branch__child">${renderChild(c, i)}</div>`).join("");
  return (
    `<div class="fig-branch" style="--n:${n}"${o.dashed ? ' data-edge="dashed"' : ""}>` +
    (o.label ? `<p class="fig-branch__label">${esc(o.label)}</p>` : "") +
    `<span class="fig-branch__stem" aria-hidden="true"></span>` +
    `<div class="fig-branch__conns">${conns}</div>` +
    `<div class="fig-branch__row fig-row">${cells}</div>` +
    `</div>`
  );
}

/* ---- 継承ツリー ---------------------------------------------------------- */

/**
 * { root:{…node…}, children:[{…node…}], edge:"extends" }
 * node: { name, note, chara, tone, fields:[], methods:[], implements:[], mark, children:[] }
 * 子に children を書けば3段以上になる（第5回の孫クラス）。
 */
function treeNode(ctx, node, edgeLabel) {
  const n = asItem(node, "name");
  const kids = asArray(n.children);
  const impls = asArray(n.implements);
  const body = [];
  body.push(`<div class="fig-tree__node"${tone(n.tone)}>`);
  body.push(
    `<p class="fig-tree__name">${esc(n.name)}` +
      (n.mark ? markHtml(n.mark, n.markLabel) : "") +
      `</p>`
  );
  if (n.note) body.push(`<p class="fig-tree__note">${esc(n.note)}</p>`);
  if (n.chara) body.push(artHtml(ctx, n.chara, { size: "m" }));
  const list = (kind, items) => {
    const arr = asArray(items);
    if (!arr.length) return "";
    return (
      `<ul class="fig-tree__members"${tone(kind)}>` +
      arr
        .map((raw) => {
          const it = asItem(raw);
          return `<li${tone(it.tone || kind)}>${esc(it.t)}${it.mark ? markHtml(it.mark, it.markLabel) : ""}</li>`;
        })
        .join("") +
      `</ul>`
    );
  };
  body.push(list("info", n.fields));
  body.push(list("action", n.methods));
  body.push(`</div>`);

  const out = [`<div class="fig-tree__branchwrap">`, body.join("")];
  if (impls.length) {
    out.push(
      `<div class="fig-tree__impl">` +
        `<p class="fig-tree__impl-label">${esc(n.implementsLabel || "implements（いくつでも）")}</p>` +
        `<ul class="fig-row fig-row--wrap">` +
        impls
          .map((raw) => {
            const it = asItem(raw);
            return `<li class="fig-tree__badge"${tone(it.tone || "gold")}>${esc(it.t)}</li>`;
          })
          .join("") +
        `</ul></div>`
    );
  }
  if (kids.length) {
    out.push(
      branchGrid(kids, (c) => treeNode(ctx, c, edgeLabel), {
        label: n.edge != null ? n.edge : edgeLabel,
      })
    );
  }
  out.push(`</div>`);
  return out.join("");
}

function treeHtml(ctx, spec) {
  const c = isPlainObject(spec) ? spec : {};
  const edge = c.edge != null ? c.edge : "extends";
  const root = c.root
    ? Object.assign({}, c.root, { children: c.root.children || c.children })
    : Object.assign({}, c, { children: c.children });
  return `<div class="fig-tree">${treeNode(ctx, root, edge)}</div>`;
}

/* ---- 1入力→N出力の分岐図（第6回スライド8。全7回で唯一の新規の型） -------- */

/**
 * { input:{t:"attack()", sub:"同じ1つの呼び出し"},
 *   outputs:[{chara:"hero", t:"渾身の斬撃！"}, …], note:"…" }
 */
function fanoutHtml(ctx, spec) {
  const c = isPlainObject(spec) ? spec : {};
  const input = asItem(c.input || {});
  const outs = asArray(c.outputs);
  const inner =
    `<div class="fig-fanout__in"${tone(input.tone || "action")}>` +
    `<span class="fig-fanout__btn">${esc(input.t)}</span>` +
    (input.sub ? `<span class="fig-fanout__sub">${esc(input.sub)}</span>` : "") +
    `</div>` +
    branchGrid(
      outs,
      (raw) => {
        const it = asItem(raw);
        return (
          `<div class="fig-fanout__out"${tone(it.tone)}>` +
          (it.chara ? artHtml(ctx, it.chara, { size: "m" }) : "") +
          `<p class="fig-fanout__name">${esc(it.name || "")}</p>` +
          `<p class="fig-fanout__msg">${esc(it.t)}</p>` +
          (it.sub ? `<p class="fig-fanout__osub">${esc(it.sub)}</p>` : "") +
          `</div>`
        );
      },
      { label: c.edge != null ? c.edge : "中身のクラスごとに違う結果" }
    );
  return (
    `<div class="fig-fanout">${inner}` +
    (c.note ? `<p class="fig-fanout__note">${esc(c.note)}</p>` : "") +
    `</div>`
  );
}

/* ===========================================================================
   12. まとめ3ステップ／矢印でつなぐ流れ
   =========================================================================== */

function stepsHtml(ctx, items, o = {}) {
  const li = asArray(items)
    .map((raw, i) => {
      const it = asItem(raw);
      return (
        `<li class="fig-step"${tone(it.tone)}>` +
        `<span class="fig-step__no">${o.number === false ? "" : i + 1}</span>` +
        `<div class="fig-step__body">` +
        `<p class="fig-step__t">${esc(it.t)}${it.mark ? markHtml(it.mark, it.markLabel) : ""}</p>` +
        (it.d ? `<p class="fig-step__d">${esc(it.d)}</p>` : "") +
        (it.chara ? artHtml(ctx, it.chara, { size: "s" }) : "") +
        `</div></li>`
      );
    })
    .join("");
  return `<ol class="fig-steps fig-row">${li}</ol>`;
}

/**
 * 矢印でつながる流れ。条件つきの分岐・ループも書ける（第3回図C、バトルループ）。
 *   {% flow [ {t:"HP 20"}, {t:"-50 される", arrow:"attack()"}, {t:"HP -30", tone:"danger", mark:"x"} ],
 *           { loop:"倒れたら名簿から削除して次のターンへ" } %}
 */
function flowHtml(ctx, items, o = {}) {
  const list = asArray(items);
  const parts = [];
  list.forEach((raw, i) => {
    const it = asItem(raw);
    if (i > 0) parts.push(arrowHtml({ dir: "right", label: it.arrow, tone: it.arrowTone }));
    parts.push(
      `<div class="fig-flow__item"${tone(it.tone)}>` +
        (it.chara ? artHtml(ctx, it.chara, { size: "s" }) : "") +
        `<p class="fig-flow__t">${esc(it.t)}${it.mark ? markHtml(it.mark, it.markLabel) : ""}</p>` +
        (it.d ? `<p class="fig-flow__d">${esc(it.d)}</p>` : "") +
        (it.bar ? barHtml(it.bar) : "") +
        `</div>`
    );
  });
  return (
    `<div class="fig-flow${o.loop ? " fig-flow--loop" : ""}">` +
    `<div class="fig-flow__line fig-row">${parts.join("")}</div>` +
    (o.loop
      ? `<p class="fig-flow__loop"><span aria-hidden="true">↩</span> ${esc(o.loop)}</p>`
      : "") +
    `</div>`
  );
}

/* ===========================================================================
   13. 並行配列＋添字の対応（第1回 図D。この回の山場）
   ---------------------------------------------------------------------------
   列（添字）を単位に組む。こうすると「同じ添字が同じ人」を縦の点線で結べる。
   横並びが本質なので、この部品は常に対比型（横スクロール）で出す。
   =========================================================================== */

/**
 * { rows:[{label:"name[]", cells:["たかぎ", …]}, …],
 *   index:true, link:true, colNotes:["…"] }
 * セルは文字列か {t:"165", bad:true, note:"ズレた"}。
 */
function parallelHtml(spec) {
  const c = isPlainObject(spec) ? spec : { rows: spec };
  const rows = asArray(c.rows).map((r) => asItem(r, "label"));
  const n = rows.reduce((m, r) => Math.max(m, asArray(r.cells).length), 0);
  const showIdx = c.index !== false;

  const labels =
    `<div class="fig-parallel__labels">` +
    (showIdx ? `<span class="fig-parallel__lh">添字</span>` : "") +
    rows.map((r) => `<span class="fig-parallel__label">${esc(r.label)}</span>`).join("") +
    `</div>`;

  const cols = [];
  for (let i = 0; i < n; i++) {
    const cells = rows
      .map((r) => {
        const raw = asArray(r.cells)[i];
        const it = raw == null ? { t: "" } : asItem(raw);
        return (
          `<span class="fig-parallel__cell${it.bad ? " is-bad" : ""}"${tone(it.tone)}>` +
          `${esc(it.t)}${it.bad ? markHtml("x", it.note || "対応が壊れている") : ""}</span>`
        );
      })
      .join("");
    const note = asArray(c.colNotes)[i];
    cols.push(
      `<div class="fig-parallel__col">` +
        (showIdx ? `<span class="fig-parallel__idx">${i}</span>` : "") +
        cells +
        (note ? `<span class="fig-parallel__cnote">${esc(note)}</span>` : "") +
        `</div>`
    );
  }
  return (
    `<div class="fig-parallel${c.link === false ? "" : " fig-parallel--link"}" ` +
    `style="--rows:${rows.length}">${labels}` +
    `<div class="fig-parallel__cols">${cols.join("")}</div></div>`
  );
}

/* ===========================================================================
   14. コード1行の中を指す図（第2回 図D「this.name = name;」）
   ---------------------------------------------------------------------------
   Prism の行強調では1行の中の左右を色分けできないので、この1行だけ別枠にする。
   （コードブロックの配色と混ざらないよう codeblock とは別のクラスにしてある）
   =========================================================================== */

function codelineHtml(body, o = {}) {
  const notes = asArray(o.notes)
    .map((raw) => {
      const it = asItem(raw);
      return (
        `<li class="fig-codeline__note"${tone(it.tone)}>` +
        `<span class="fig-codeline__swatch"${tone(it.tone)}></span>${esc(it.t)}</li>`
      );
    })
    .join("");
  return (
    `<div class="fig-codeline">` +
    `<p class="fig-codeline__line">${body}</p>` +
    (notes ? `<ul class="fig-codeline__notes">${notes}</ul>` : "") +
    `</div>`
  );
}

/* ===========================================================================
   15. 登録
   =========================================================================== */

module.exports = function (eleventyConfig) {
  const add = (name, fn) => eleventyConfig.addShortcode(name, fn);
  const addPaired = (name, fn) => eleventyConfig.addPairedShortcode(name, fn);

  /* ---- 小物（1行） ---------------------------------------------------- */

  /** {% legend %} / {% legend "info,action,x" %} 凡例 */
  add("legend", function (...args) {
    const [data] = splitArgs(args);
    return legendHtml(data == null ? true : data);
  });

  /** {% mark "x" %} ✕バッジ（o / stop / q / new も） */
  add("mark", function (kind, label) {
    return markHtml(kind, label);
  });

  /** {% arrow %} / {% arrow { dir:"down", label:"…" } %} */
  add("arrow", function (...args) {
    const [, o] = splitArgs(args, { merge: true });
    return arrowHtml(o);
  });

  /** {% ct "name", "info" %} 図の中で使うコード片（色を意味に使えるトークン） */
  add("ct", function (text, t) {
    return `<span class="fig-ct"${tone(t)}>${esc(text)}</span>`;
  });

  /** {% chara "hero" %} / {% chara "hero", { size:"l", alt:"…" } %} 立ち絵1点 */
  add("chara", function (...args) {
    const [key, o] = splitArgs(args);
    return artHtml(this, key, o);
  });

  /* ---- データ駆動の部品 ------------------------------------------------ */

  /** {% cards [ {chara:"hero", name:"たかぎ", stats:{…}} ] %} カード列（非対比） */
  add("cards", function (...args) {
    const [data, o] = splitArgs(args);
    const items = asArray(data);
    const inner = `<div class="fig-cards fig-row">${items
      .map((it) => cardHtml(this, it, o))
      .join("")}</div>`;
    return figureWrap(inner, o, "stack");
  });

  /** {% classbox { name:"Human", fields:[…], methods:[…] } %} クラス枠（非対比） */
  add("classbox", function (...args) {
    const [data, o] = splitArgs(args, { merge: true });
    const list = Array.isArray(data) ? data : [data];
    const inner = `<div class="fig-classes fig-row">${list
      .map((c) => classBoxOne(this, c))
      .join("")}</div>`;
    return figureWrap(inner, o, "stack");
  });

  /** {% capsule { name:"Hero", inside:[…], gates:[…] } %} カプセル図（非対比） */
  add("capsule", function (...args) {
    const [data, o] = splitArgs(args, { merge: true });
    const list = Array.isArray(data) ? data : [data];
    const inner = list.map((c) => capsuleHtml(this, c)).join("");
    return figureWrap(inner, o, "stack");
  });

  /** {% notes [ {t:"名前"}, {t:"歩く", kind:"action"} ], { scatter:true } %} 付箋 */
  add("notes", function (...args) {
    const [data, o] = splitArgs(args);
    return figureWrap(notesHtml(data, o), Object.assign({ legend: true }, o), "stack");
  });

  /** {% listrow { type:"ArrayList<Adventurer>", items:[…] } %} リストの列（対比＝横維持） */
  add("listrow", function (...args) {
    const [data, o] = splitArgs(args, { merge: true });
    return figureWrap(listRowHtml(this, data), o, "hold");
  });

  /** {% tree { root:{…}, children:[…] } %} 継承ツリー（非対比＝640px以下で縦の幹に） */
  add("tree", function (...args) {
    const [data, o] = splitArgs(args, { merge: true });
    return figureWrap(treeHtml(this, data), o, "stack");
  });

  /** {% fanout { input:{…}, outputs:[…] } %} 1入力→N出力の分岐図 */
  add("fanout", function (...args) {
    const [data, o] = splitArgs(args, { merge: true });
    return figureWrap(fanoutHtml(this, data), o, "stack");
  });

  /** {% steps [ {t:"…", d:"…"} ] %} まとめ3ステップ（非対比） */
  add("steps", function (...args) {
    const [data, o] = splitArgs(args);
    return figureWrap(stepsHtml(this, data, o), o, "stack");
  });

  /** {% flow [ {t:"…"}, {t:"…", arrow:"…"} ], { loop:"…" } %} 流れ・ループ（対比＝横維持） */
  add("flow", function (...args) {
    const [data, o] = splitArgs(args);
    return figureWrap(flowHtml(this, data, o), o, "hold");
  });

  /** {% parallel { rows:[…] } %} 並行配列＋添字の対応（常に横維持） */
  add("parallel", function (...args) {
    const [data, o] = splitArgs(args, { merge: true });
    return figureWrap(parallelHtml(data), Object.assign({ wide: true }, o), "hold");
  });

  /* ---- コンテナ（中身に Markdown・コードブロックを書ける） ------------- */
  /* 本体の前後に空行を出すのが要点。こうすると markdown-it が中身を
     Markdown として処理するので ```java フェンスがそのまま使える。 */

  const body = (s) => `\n\n${String(s == null ? "" : s).trim()}\n\n`;

  /** {% fig { caption:"…" } %} … {% endfig %} 一点物の図の外枠 */
  addPaired("fig", function (content, ...args) {
    const [, o] = splitArgs(args, { merge: true });
    return figureWrap(body(content), o, o.fit || "stack");
  });

  /** {% box "型（入口）" %} … {% endbox %} ラベル付きの箱。入れ子にできる */
  addPaired("box", function (content, ...args) {
    const [label, o] = splitArgs(args, { merge: true });
    const lab = o.label != null ? o.label : typeof label === "string" ? label : null;
    return (
      `<div class="fig-box"${tone(o.tone)}>` +
      (lab ? `<p class="fig-box__label">${esc(lab)}${o.mark ? markHtml(o.mark) : ""}</p>` : "") +
      (o.sub ? `<p class="fig-box__sub">${esc(o.sub)}</p>` : "") +
      `<div class="fig-box__body">${body(content)}</div>` +
      (o.note ? `<p class="fig-box__note">${esc(o.note)}</p>` : "") +
      `</div>`
    );
  });

  /**
   * {% compare %} … {% endcompare %} 左右対比（Before/After）。★対比型
   *   axis:"h"（既定・左右） / "v"（上下。列が縦にそろうので8体の図に向く）
   *   vs:"VS"（既定。false で消す）  cols:4（両側の列幅をそろえる）
   */
  addPaired("compare", function (content, ...args) {
    const [, o] = splitArgs(args, { merge: true });
    const axis = o.axis === "v" ? "v" : "h";
    const vs = o.vs === false ? null : o.vs || "VS";
    // 区切りラベルは CSS の content から使うので、文字列としてカスタムプロパティに渡す
    const styles = [];
    if (o.cols) styles.push(`--fig-cols:${Number(o.cols)}`);
    if (vs) styles.push(`--fig-vs:'${String(vs).replace(/['\\]/g, "")}'`);
    const inner =
      `<div class="fig-compare fig-compare--${axis}${vs ? "" : " is-novs"}${
        axis === "h" ? " fig-row" : ""
      }" style="${attrEsc(styles.join(";"))}"${vs ? ` data-vs="${attrEsc(vs)}"` : ""}>` +
      body(content) +
      `</div>`;
    return figureWrap(inner, o, "hold");
  });

  /** {% panel "Before" %} … {% endpanel %} compare の片側 */
  addPaired("panel", function (content, ...args) {
    const [label, o] = splitArgs(args, { merge: true });
    const lab = o.label != null ? o.label : typeof label === "string" ? label : null;
    return (
      `<div class="fig-panel"${tone(o.tone)}>` +
      (lab
        ? `<p class="fig-panel__label">${esc(lab)}${o.mark ? markHtml(o.mark, o.markLabel) : ""}` +
          (o.sub ? `<span class="fig-panel__sub">${esc(o.sub)}</span>` : "") +
          `</p>`
        : "") +
      `<div class="fig-panel__body">${body(content)}</div>` +
      (o.note ? `<p class="fig-panel__note">${esc(o.note)}</p>` : "") +
      `</div>`
    );
  });

  /** {% codeout %}{% panel "コード" %}…{% endpanel %}{% panel "実行結果" %}…{% endpanel %}{% endcodeout %} */
  addPaired("codeout", function (content, ...args) {
    const [, o] = splitArgs(args, { merge: true });
    const inner =
      `<div class="fig-compare fig-compare--h fig-compare--codeout is-novs fig-row"` +
      ` data-vs="">${body(content)}</div>`;
    return figureWrap(inner, o, "hold");
  });

  /** {% codeline { notes:[…] } %} this.{% ct "name","info" %} = … {% endcodeline %} */
  addPaired("codeline", function (content, ...args) {
    const [, o] = splitArgs(args, { merge: true });
    const inner = codelineHtml(String(content == null ? "" : content).trim(), o);
    return o.bare ? inner : figureWrap(inner, o, "stack");
  });

  /**
   * {% usage %}{% raw %} … {% endraw %}{% endusage %}
   * 「ページ側ではこう書く」を見せるための枠（見本ページ・説明用）。
   * codeblocks.js の言語指定は java / text の2つに固定されているので、
   * ショートコードの書き方を見せる用途はこちらで受ける。
   */
  addPaired("usage", function (content) {
    const src = String(content == null ? "" : content)
      .replace(/\r/g, "")
      .replace(/\n{2,}/g, "\n") // 空行を残すと markdown-it が HTML ブロックを切ってしまう
      .trim();
    return `<div class="fig-usage"><p class="fig-usage__label">ページ側の書き方</p><pre class="fig-usage__code">${esc(
      src
    )}</pre></div>`;
  });

  /* ---- 引き継ぎ用のメタ情報（docs/figures.md と対応） ------------------ */
  eleventyConfig.addGlobalData("figureParts", {
    hold: ["compare", "codeout", "listrow", "flow", "parallel"],
    stack: ["cards", "classbox", "capsule", "notes", "tree", "steps", "fanout", "fig", "codeline"],
  });
};

/* テスト・確認用に内部関数も出しておく（サイト本体は使わない） */
module.exports._internal = { esc, relPath, splitArgs, asArray, figureWrap, ART };
