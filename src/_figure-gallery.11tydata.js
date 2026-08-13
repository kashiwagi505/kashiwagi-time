/**
 * _figure-gallery.md 専用のテンプレートデータファイル。
 *
 * 部品見本ページは開発用（README.md 参照）。本番ビルドの出力には含めない。
 * ELEVENTY_ENV=dev のときだけ実際に permalink を持たせて出力する。
 * 既定（本番 `npm run build`）では permalink: false でページ自体を出力しない。
 *
 * ファイルは削除せず残す方針（決定は CLAUDE.md 側の指示）。
 */
module.exports = {
  permalink: process.env.ELEVENTY_ENV === "dev" ? "figure-gallery.html" : false,
};
