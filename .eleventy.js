/**
 * 柏木タイム 学習サイト — Eleventy 設定
 *
 *   入力: src/      出力: _site/
 *   URL : lessons/01-class.html のように .html 拡張子付きの明示的なファイル名
 *   参照: すべて相対パス（GitHub Pages のサブディレクトリ配信でも壊れないように）
 *
 * 詳しい方針は 00_research/03_requirements/site-map.md 4章・6章を参照。
 */
const fs = require("node:fs");
const path = require("node:path");

module.exports = function (eleventyConfig) {
  // -------------------------------------------------------------------------
  // 静的ファイルのコピー
  // -------------------------------------------------------------------------
  // assets は README.md（担当者の作業記録）を除いてコピーする。
  // 作業記録は学習者向けの成果物ではないので公開しない。置き場は site/docs/。
  eleventyConfig.addPassthroughCopy(
    { "src/assets": "assets" },
    { filter: (p) => !/(^|[\\/])README\.md$/i.test(p) }
  );
  // 配布ソースは別の担当が用意する。存在するときだけコピーする。
  if (fs.existsSync(path.join(__dirname, "src/downloads"))) {
    eleventyConfig.addPassthroughCopy({ "src/downloads": "downloads" });
  }
  // src/downloads/ は「そのままコピーする置き場」。中の .md をページとして
  // ビルドしない（配布ソースの管理メモが勝手にページ化されるのを防ぐ）。
  eleventyConfig.ignores.add("src/downloads/**");
  // 安全網: src/ 配下の README.md は担当者の作業記録なので、ページ化しない。
  // （公開したい文書は README.md 以外の名前を付けるか site/docs/ に置く）
  eleventyConfig.ignores.add("src/**/README.md");

  // -------------------------------------------------------------------------
  // 相対パスフィルタ ── ルート絶対パス (/assets/...) は使わない
  //   {{ 'assets/css/base.css' | rel }}  →  ./assets/... / ../assets/...
  //   {{ item.url | rel }}               →  ./index.html / ../lessons/02-....html
  // -------------------------------------------------------------------------
  eleventyConfig.addFilter("rel", function (target) {
    const url = (this.page && this.page.url) || "/";
    // "/index.html" → depth 0 / "/lessons/01-class.html" → depth 1
    const depth = Math.max(0, url.split("/").length - 2);
    const prefix = depth > 0 ? "../".repeat(depth) : "./";
    return prefix + String(target == null ? "" : target).replace(/^\/+/, "");
  });

  // -------------------------------------------------------------------------
  // コレクション ── 全7回。order 昇順。
  //   トップの一覧表と各回の前後リンクはこれ1つから自動生成する。
  //   第8回を足したいときは src/lessons/08-xxx.md と site.json への追記だけで済む。
  // -------------------------------------------------------------------------
  eleventyConfig.addCollection("lessons", (collectionApi) =>
    collectionApi
      .getFilteredByTag("lessons")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0))
  );

  // -------------------------------------------------------------------------
  // 小さなフィルタ
  // -------------------------------------------------------------------------
  /** 全角数字にしない前提の回番号表示: 1 → 第1回 */
  eleventyConfig.addFilter("kaiLabel", (order) => `第${order}回`);

  /** 「チャレンジプロジェクト」の回だけ（true）／それ以外だけ（false）を取り出す */
  eleventyConfig.addFilter("byProject", (lessons, flag) =>
    (lessons || []).filter((l) => Boolean(l.data.lesson && l.data.lesson.project) === flag)
  );

  /** コレクション内の前後を取り出す（無ければ null） */
  eleventyConfig.addFilter("neighbors", (lessons, order) => {
    const list = lessons || [];
    const i = list.findIndex((l) => (l.data.order || 0) === order);
    return {
      prev: i > 0 ? list[i - 1] : null,
      next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
      index: i,
      total: list.length,
    };
  });

  // -------------------------------------------------------------------------
  // コードブロック（decisions.md 決定5）
  // -------------------------------------------------------------------------
  require("./config/codeblocks.js")(eleventyConfig, { srcDir: "src" });

  // -------------------------------------------------------------------------
  // 読み進めるための道具（目次・各問の手順ボックス・表のスクロール領域）と
  // 回ごとの配布 ZIP
  // -------------------------------------------------------------------------
  require("./config/lesson-enhance.js")(eleventyConfig, { srcDir: "src" });
  require("./config/zip-downloads.js")(eleventyConfig, { srcDir: "src" });

  // -------------------------------------------------------------------------
  // 図解ショートコード ── 別の担当が作る。まだ無い場合は読み込まない。
  // -------------------------------------------------------------------------
  const shortcodesPath = path.join(__dirname, "config", "shortcodes.js");
  if (fs.existsSync(shortcodesPath)) {
    require(shortcodesPath)(eleventyConfig);
  } else {
    console.log("[eleventy] config/shortcodes.js が無いのでスキップしました（図解ショートコード担当が作成予定）");
  }

  // -------------------------------------------------------------------------
  // Markdown の設定
  // -------------------------------------------------------------------------
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ html: true, breaks: false, linkify: false });
  });

  // -------------------------------------------------------------------------
  // 出力HTMLから作業用コメントを取り除く
  //   各回の .md の先頭には「この回の設計図はどれか」「どこが創作か」といった
  //   担当者向けのメモを HTML コメントで書いている。可視テキストには出ないが、
  //   ソースを見れば読めてしまうので、公開物には残さない。
  //   （`<!--` を含む文字列は Prism がエスケープするのでコードブロックは壊れない）
  // -------------------------------------------------------------------------
  eleventyConfig.addTransform("stripComments", function (content) {
    if (!(this.page && this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
  });

  // -------------------------------------------------------------------------
  // 強調記法の取りこぼしを検出する
  //
  //   日本語の本文では `**強調**` が黙って失敗することがある。CommonMark の
  //   flanking 判定では、開始の `**` が「日本語の文字＋記号」に挟まれていると
  //   開始と見なされず、終了の `**` が「記号＋日本語の文字」に挟まれていると
  //   終了と見なされない。実際に踏んだ例:
  //     …演習3は**`名前: null`…**になります   ← 直後が ` なので開始できない
  //     つまり**「冒険者」…作れている**わけです ← 直前が 」 なので終了できない
  //   強調されないうえに `**` がそのまま画面に出る。目視では気づきにくい。
  //   確実に直すには、その箇所だけ <strong> で書く。
  // -------------------------------------------------------------------------
  eleventyConfig.addTransform("checkEmphasis", function (content) {
    const out = (this.page && this.page.outputPath) || "";
    if (!out.endsWith(".html")) return content;
    // コードブロック・インラインコードの中は対象外（javadoc の /** が引っかかるため）
    const stripped = content
      .replace(/<pre[\s\S]*?<\/pre>/g, "")
      .replace(/<code[\s\S]*?<\/code>/g, "");
    const hits = [...stripped.matchAll(/\*\*/g)];
    if (hits.length) {
      console.warn(
        `\n[emphasis] ★強調されなかった ** が ${hits.length} 件そのまま出力されています: ${out}`
      );
      for (const m of hits.slice(0, 10)) {
        const near = stripped
          .slice(Math.max(0, m.index - 40), m.index + 40)
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ");
        console.warn(`  - …${near}…`);
      }
      console.warn(`  → その箇所を <strong>…</strong> で書き直してください。\n`);
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // permalink を書かないページも .html で出す（トップ・はじめに）
    // ※ 個別の permalink は各ページ／ディレクトリデータファイルで指定する
  };
};
