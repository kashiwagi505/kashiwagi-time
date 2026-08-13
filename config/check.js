/**
 * `npm run check` — Eleventy のビルドをせずに、コードブロックのチェックだけ走らせる。
 * 各回ページを書いている途中に手早く確認するため。
 */
const { auditMarkdown } = require("./codeblocks.js");
const { problems, notices } = auditMarkdown("src");

if (notices.length) {
  console.log(`\n書き方に気になる点 ${notices.length} 件`);
  for (const n of notices) console.log(`  - ${n}`);
}
if (problems.length) {
  console.log(`\n★全角文字の混入 ${problems.length} 件`);
  for (const p of problems) console.log(`  - ${p}`);
}
if (!notices.length && !problems.length) console.log("問題なし");
