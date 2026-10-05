/**
 * コードブロックの描画ルール（decisions.md 2026-07-31 決定5 の実装）
 *
 * ── 記法（Markdown のフェンス情報文字列） ────────────────────────────────
 *
 *   ```java                 コンパイルできる Java コード（ハイライト＋行番号＋コピーボタン）
 *   ```java error           わざとコンパイルエラーにするコード（赤枠＋「コンパイルできません」）
 *   ```text                 実行結果・コンソール出力・入力例（ハイライトしない＋「実行結果」）
 *   ```text pseudo          日本語混じりの擬似コード（破線枠＋「擬似コード」）
 *   ```java quiz            クイズの選択肢。正誤が見た目で分からないよう、エラーでも通常の枠で出す
 *
 *   追加の属性（スペース区切りでいくつでも付けられる）
 *   ```java file=Hero.java  ファイル名ラベルを付ける
 *   ```java hl=3-5          3〜5行目を強調（Prism line-highlight）。hl=2,7-9 のように複数可
 *   ```java nonum           行番号を消す
 *   ```text num             行番号を付ける（text は既定で行番号なし）
 *   ```text input           「実行結果」ではなく「入力例」ラベルにする
 *
 *   行番号は `java` のみ既定でON。実行結果・入力例・擬似コードは行を指し示す必要がなく、
 *   コンソール出力に行番号が付くと実際の出力と混同するため既定でOFF。
 *
 * ── ビルド時チェック ──────────────────────────────────────────────────
 *
 *   `java` ブロックの中に全角括弧・全角スペース・スマートクォート等が混入していると
 *   ビルド時に警告を出す（ビルドは止めない）。コメントと文字列リテラルの中身は除外する。
 *   `java error` は「全角混入そのものが学習内容」の場合があるためチェック対象外。
 *   `java quiz` も誤りの選択肢を含むためチェック対象外。
 */
const fs = require("node:fs");
const path = require("node:path");

// ---------------------------------------------------------------------------
// 1. 情報文字列のパース
// ---------------------------------------------------------------------------

const KNOWN_LANGS = ["java", "text"];

/** バッジ文言 */
const BADGE = {
  error: "コンパイルできません",
  pseudo: "擬似コード",
  output: "実行結果",
  input: "入力例",
};

/**
 * ```java file=Hero.java hl=3-5 → { lang, error, pseudo, ... }
 */
function parseInfo(info) {
  const parts = String(info || "").trim().split(/\s+/).filter(Boolean);
  const lang = (parts.shift() || "").toLowerCase();
  const opt = {
    lang,
    known: KNOWN_LANGS.includes(lang),
    error: false,
    pseudo: false,
    quiz: false,
    input: false,
    // 行番号は java だけ既定でON（実行結果に行番号が付くと実際の出力と混同する）
    lineNumbers: lang === "java",
    file: null,
    hl: null,
    unknownAttrs: [],
  };
  for (const p of parts) {
    const [rawKey, ...restVal] = p.split("=");
    const key = rawKey.toLowerCase();
    const val = restVal.join("=");
    if (key === "error") opt.error = true;
    else if (key === "pseudo") opt.pseudo = true;
    else if (key === "quiz") opt.quiz = true;
    else if (key === "input") opt.input = true;
    else if (key === "nonum") opt.lineNumbers = false;
    else if (key === "num") opt.lineNumbers = true;
    else if (key === "file" && val) opt.file = val;
    else if (key === "hl" && val) opt.hl = val;
    else opt.unknownAttrs.push(p);
  }
  return opt;
}

/** そのブロックが「Javaソースとして成立していなければならない」ものか */
function isCheckedJava(opt) {
  return opt.lang === "java" && !opt.error && !opt.pseudo && !opt.quiz;
}

// ---------------------------------------------------------------------------
// 2. 全角文字チェック
// ---------------------------------------------------------------------------

/** ASCII の記号・英数字に見えてしまう全角／特殊文字だけを対象にする。
 *  「。、・ー」など日本語として正当な文字は対象にしない。 */
const BAD_CHARS = {
  "　": "全角スペース",
  " ": "ノーブレークスペース",
  "（": "全角丸括弧 （",
  "）": "全角丸括弧 ）",
  "｛": "全角波括弧 ｛",
  "｝": "全角波括弧 ｝",
  "［": "全角角括弧 ［",
  "］": "全角角括弧 ］",
  "“": "スマートクォート “",
  "”": "スマートクォート ”",
  "‘": "スマートクォート ‘",
  "’": "スマートクォート ’",
  "＂": "全角ダブルクォート ＂",
  "＇": "全角シングルクォート ＇",
  "｀": "全角バッククォート ｀",
  "；": "全角セミコロン ；",
  "：": "全角コロン ：",
  "，": "全角カンマ ，",
  "．": "全角ピリオド ．",
  "＝": "全角イコール ＝",
  "＋": "全角プラス ＋",
  "－": "全角マイナス －",
  "−": "マイナス記号 −",
  "＊": "全角アスタリスク ＊",
  "／": "全角スラッシュ ／",
  "＼": "全角バックスラッシュ ＼",
  "＜": "全角小なり ＜",
  "＞": "全角大なり ＞",
  "！": "全角エクスクラメーション ！",
  "？": "全角クエスチョン ？",
  "＆": "全角アンパサンド ＆",
  "｜": "全角パイプ ｜",
  "％": "全角パーセント ％",
  "＃": "全角シャープ ＃",
  "＠": "全角アットマーク ＠",
  "＾": "全角ハット ＾",
  "～": "全角チルダ ～",
  "＿": "全角アンダースコア ＿",
  "＄": "全角ドル ＄",
};

function badCharName(ch) {
  if (BAD_CHARS[ch]) return BAD_CHARS[ch];
  const c = ch.codePointAt(0);
  if (c >= 0xff10 && c <= 0xff19) return `全角数字 ${ch}`;
  if (c >= 0xff21 && c <= 0xff3a) return `全角英大文字 ${ch}`;
  if (c >= 0xff41 && c <= 0xff5a) return `全角英小文字 ${ch}`;
  return null;
}

/**
 * Java のコメント（//, /* *\/）と文字列／文字リテラルの中身を半角スペースに置き換える。
 * 行・桁の位置がずれないように、改行はそのまま残す。
 * 全角クォート “” は文字列の開始とみなさないので、そのまま検出対象に残る。
 */
function maskCommentsAndStrings(code) {
  const out = code.split("");
  let i = 0;
  const n = code.length;
  const blank = (from, to) => {
    for (let k = from; k < to && k < n; k++) {
      if (out[k] !== "\n" && out[k] !== "\r") out[k] = " ";
    }
  };
  while (i < n) {
    const ch = code[i];
    const next = code[i + 1];
    if (ch === "/" && next === "/") {
      let j = i;
      while (j < n && code[j] !== "\n") j++;
      blank(i, j);
      i = j;
    } else if (ch === "/" && next === "*") {
      let j = code.indexOf("*/", i + 2);
      j = j === -1 ? n : j + 2;
      blank(i, j);
      i = j;
    } else if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < n && code[j] !== quote && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      blank(i + 1, j); // クォート自体は残す（対応が取れているか目視できるように）
      i = Math.min(j + 1, n);
    } else {
      i++;
    }
  }
  return out.join("");
}

/** マスク済みコードを走査して問題文字を拾う。offsetLine は元ファイル内の開始行(1始まり) */
function findBadChars(code, offsetLine) {
  const hits = [];
  const lines = code.split("\n");
  lines.forEach((line, li) => {
    for (let ci = 0; ci < line.length; ci++) {
      const name = badCharName(line[ci]);
      if (name) hits.push({ line: offsetLine + li, col: ci + 1, name, char: line[ci] });
    }
  });
  return hits;
}

// ---------------------------------------------------------------------------
// 3. Markdown ソースを走査してビルド時に警告する
// ---------------------------------------------------------------------------

/** ページとしてビルドされない場所は対象外にする */
const SKIP_DIRS = new Set(["downloads", "assets"]);

function listMarkdownFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && (e.name.startsWith("_") || SKIP_DIRS.has(e.name))) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listMarkdownFiles(p, out);
    else if (/\.md$/i.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * HTML コメント `<!-- ... -->` の中身を空白に置き換える（行数・行番号は保つ）。
 * 各回ページの先頭にある引き継ぎメモの中に ``` の例を書くことがあるため、
 * コメント内をチェック対象にしない。
 */
function maskHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, " "));
}

/** 1ファイル分のフェンスを取り出す（CommonMark と同じく字下げ3文字までをフェンスと見なす） */
function extractFences(text) {
  const lines = maskHtmlComments(text).split(/\r?\n/);
  const blocks = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = line.match(/^( {0,3})(`{3,}|~{3,})\s*(.*)$/);
    if (!cur && open) {
      cur = { fence: open[2][0].repeat(3), indent: open[1], info: open[3], startLine: i + 1, body: [] };
      continue;
    }
    if (cur) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === cur.fence[0]) {
        blocks.push(cur);
        cur = null;
      } else {
        cur.body.push(line);
      }
    }
  }
  if (cur) blocks.push(cur);
  return blocks;
}

function auditMarkdown(srcDir) {
  const problems = [];
  const notices = [];
  for (const file of listMarkdownFiles(srcDir)) {
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(process.cwd(), file);
    for (const b of extractFences(text)) {
      const opt = parseInfo(b.info);
      if (!opt.lang) {
        notices.push(`${rel}:${b.startLine}  言語指定なしのコードブロック → \`\`\`java か \`\`\`text を付けてください`);
        continue;
      }
      if (!opt.known) {
        notices.push(
          `${rel}:${b.startLine}  未定義の言語指定 \`${opt.lang}\` → 使えるのは ${KNOWN_LANGS.join(" / ")} だけです`
        );
      }
      for (const a of opt.unknownAttrs) {
        notices.push(
          `${rel}:${b.startLine}  未定義の属性 \`${a}\` → error / pseudo / quiz / input / nonum / num / file= / hl=`
        );
      }
      if (!isCheckedJava(opt)) continue;
      const code = b.body.join("\n");
      const hits = findBadChars(maskCommentsAndStrings(code), b.startLine + 1);
      for (const h of hits) {
        problems.push(`${rel}:${h.line}:${h.col}  ${h.name} が混入しています（半角に直してください）`);
      }
    }
  }
  return { problems, notices };
}

// ---------------------------------------------------------------------------
// 4. markdown-it の fence レンダラ差し替え
// ---------------------------------------------------------------------------

function renderFence(tokens, idx, _options, _env, _self) {
  const token = tokens[idx];
  const md = this; // bind 済み markdown-it インスタンス
  const opt = parseInfo(token.info);
  const escape = md.utils.escapeHtml;
  const code = token.content.replace(/\n$/, "");

  // ---- 種別を決める
  const isText = opt.lang !== "java";
  let kind = "code"; // code / error / pseudo / output
  if (opt.error) kind = "error";
  else if (opt.pseudo) kind = "pseudo";
  else if (isText) kind = "output";

  const badgeKey = kind === "output" && opt.input ? "input" : kind === "code" ? null : kind;
  const badge = badgeKey ? BADGE[badgeKey] : null;
  const copyable = opt.lang === "java"; // 実行結果・擬似コードにはコピーボタンを出さない

  // ---- クラス組み立て
  const figClasses = ["codeblock", `codeblock--${kind}`];
  if (kind === "error") figClasses.push("code-error");
  if (kind === "pseudo") figClasses.push("code-pseudo");
  if (kind === "output") figClasses.push("code-output");

  const codeLang = opt.lang === "java" ? "language-java" : "language-text";

  // <pre> にも language-* を付ける（Prism が動く前から暗色の枠になるように）
  const preClasses = [codeLang];
  if (opt.lineNumbers) preClasses.push("line-numbers");

  const preAttrs = [
    ` class="${preClasses.join(" ")}"`,
    opt.hl ? ` data-line="${escape(opt.hl)}"` : "",
  ].join("");

  const head =
    badge || opt.file
      ? `<figcaption class="codeblock__head">` +
        (badge ? `<span class="codeblock__badge">${escape(badge)}</span>` : "") +
        (opt.file ? `<span class="codeblock__file">${escape(opt.file)}</span>` : "") +
        `</figcaption>`
      : "";

  const copyBtn = copyable
    ? `<button class="codeblock__copy" type="button" aria-label="コードをコピー">コピー</button>`
    : "";

  return (
    `<figure class="${figClasses.join(" ")}">` +
    head +
    `<div class="codeblock__body">` +
    `<pre${preAttrs}><code class="${codeLang}">${escape(code)}\n</code></pre>` +
    copyBtn +
    `</div>` +
    `</figure>\n`
  );
}

// ---------------------------------------------------------------------------
// 5. Eleventy への組み込み
// ---------------------------------------------------------------------------

module.exports = function (eleventyConfig, options = {}) {
  const srcDir = options.srcDir || "src";

  eleventyConfig.amendLibrary("md", (md) => {
    md.renderer.rules.fence = renderFence.bind(md);
  });

  eleventyConfig.on("eleventy.before", () => {
    const { problems, notices } = auditMarkdown(srcDir);
    if (notices.length) {
      console.warn(`\n[codeblocks] コードブロックの書き方に気になる点が ${notices.length} 件あります`);
      for (const n of notices) console.warn(`  - ${n}`);
    }
    if (problems.length) {
      console.warn(`\n[codeblocks] ★全角文字の混入を ${problems.length} 件検出しました（ビルドは続行します）`);
      for (const p of problems) console.warn(`  - ${p}`);
      console.warn("");
    }
    if (!notices.length && !problems.length) {
      console.log("[codeblocks] コードブロックのチェック: 問題なし");
    }
  });
};

// テスト・再利用のために内部関数も公開する
module.exports.parseInfo = parseInfo;
module.exports.maskCommentsAndStrings = maskCommentsAndStrings;
module.exports.findBadChars = findBadChars;
module.exports.auditMarkdown = auditMarkdown;
