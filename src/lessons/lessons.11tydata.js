/**
 * src/lessons/ 配下の全ページに共通する設定。
 *
 * ★各回の .md に書くのは front matter の `order:` だけでよい。
 *   タイトル・slug・permalink・世界観上の呼び名は src/_data/site.json から引いてくる。
 *   （同じ情報を2か所に書かないため。site.json を直せばナビも一覧表も同時に直る）
 */
const site = require("../_data/site.json");

/** order から site.json の該当エントリを引く */
function lessonOf(data) {
  return site.lessons.find((l) => l.order === Number(data.order)) || null;
}

module.exports = {
  layout: "layouts/lesson.njk",
  tags: ["lessons"],
  eleventyComputed: {
    /** その回のメタ情報まるごと。テンプレートからは {{ lesson.title }} などで参照する */
    lesson: (data) => lessonOf(data),

    title: (data) => {
      const l = lessonOf(data);
      return l ? l.title : data.title;
    },

    slug: (data) => {
      const l = lessonOf(data);
      return l ? l.slug : data.slug;
    },

    /** 決定: ディレクトリ形式ではなく .html 拡張子付きの明示的ファイル名 */
    permalink: (data) => {
      const l = lessonOf(data);
      if (!l) {
        throw new Error(
          `src/lessons の front matter の order: ${data.order} が site.json の lessons に見つかりません`
        );
      }
      return `lessons/${l.slug}.html`;
    },
  },
};
