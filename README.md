# 柏木タイム 学習サイト

Java（オブジェクト指向）の社内勉強会「柏木タイム」全7回で使用した講義資料をもとに作った学習サイトです。

- コードを完璧に理解させることは狙わず、**図解で概念を直感的につかませてから、実際に使ってみる演習を解く**、という方針で全9ページ（トップ、はじめに、各回7ページ）を構成しています。
- **Eleventy**（Node製の静的サイトジェネレータ）で `src/` の Markdown を静的HTMLに変換し、**GitHub Pages** で公開します。
- 外部CDNは使いません。シンタックスハイライトの Prism.js はこのリポジトリに同梱しています。

## このリポジトリに入っていないもの

**講義で使った元資料（pptx・docx）はこのリポジトリに含まれていません。**

- 元資料一式は約38MBあり、静的サイトの公開物としては不要なため
- 講義スライドや演習の解答docxそのものを公開する想定ではなく、**そこから作った学習ページ（`src/lessons/*.md`）と配布Javaソース（`src/downloads/`、その回の「開始状態」のみ）だけを公開する**という方針で作られている
- 画像もロスレスの編集用マスター（`masters/`, 17MB超）は含まれず、配信用に変換した WebP（`src/assets/img/`）だけを含む

このリポジトリだけを clone しても、講義資料そのものは手に入りません。学習サイトの表示・ビルドには影響しません。

---

## 1. ビルド手順

Node.js v20 以上（開発時 v24.18.0 / npm 11.16.0）。

```
npm install          # 初回だけ
npm run build         # _site/ に静的HTMLを出力（本番と同じ内容）
npm run serve:built    # ビルド済みの _site/ を静的サーバで配信して見た目を確認する
```

| コマンド | 内容 |
|---|---|
| `npm run build` | `src/` → `_site/` にビルドし、最後に公開前チェック（`check:site`）を走らせる（本番向け。部品見本ページは出ない） |
| `npm run build:dev` | 開発向けビルド。部品見本ページ（`figure-gallery.html`）も出す |
| `npm start` / `npm run serve` | 開発サーバ（http://localhost:8080、ファイル変更を監視して自動リロード） |
| `npm run serve:dev` | 開発サーバ＋部品見本ページ |
| `npm run serve:built` | `npm run build` した `_site/` を静的サーバで配信する（**見た目の最終確認はここで行う**） |
| `npm run check` | ビルドせずにコードブロックのチェックだけ実行 |
| `npm run check:site` | ビルド済みの `_site/` を検査する（リンク切れ・#id の有無・配布 ZIP・演習データと配布ファイルの対応）。1件でも問題があれば失敗する |
| `npm run clean` | `_site/` を消す |
| `npm run vendor:prism` | `node_modules/prismjs` から `src/assets/js/prism.js` / `prism.css` を作り直す |

`_site/` と `node_modules/` は git 管理外（`.gitignore`）。
`src/assets/js/prism.js` と `prism.css` は**生成物だがコミットする**
（`node_modules` が無い環境でもビルドできるように。GitHub Actions のワークフローもこの前提で
`npm run vendor:prism` を実行せず、コミット済みのファイルをそのまま使う）。

### ★ `npm start`（開発サーバ）を見た目の確認に使ってはいけない理由

`npm start` は差分DOM更新でページを書き換えるため、**リロード後にコードのハイライトが消えて
見えることがある**（Prism.js は初回読み込み時にしか実行されないため、開発サーバが差分だけを
書き換えると再実行されない）。これは開発サーバ特有の現象で、**本番（`npm run build` → GitHub
Pages）では起きない。**

見た目を確認したいときは、必ず `npm run build` してから `npm run serve:built` で `_site/` を
確認する。手動でページを再読み込みしてもハイライトは戻るが、確実なのは本番ビルドの確認。

### 部品見本ページ（開発用）について

`src/_figure-gallery.md` は図解部品（`config/shortcodes.js`）の使い方見本ページで、
**学習者向けのページではなく開発用**。サイトのナビゲーションからリンクしておらず、
`npm run build`（本番向け）では出力されない。

- 見るには `npm run build:dev`（または `npm run serve:dev`）を使う → `_site/figure-gallery.html`
- 出し分けの実装は `src/_figure-gallery.11tydata.js`（`ELEVENTY_ENV=dev` のときだけ permalink を持つ）
- 部品の仕様と各回の図との対応は `docs/figures.md` にある

### GitHub Pages への公開

`.github/workflows/deploy.yml` が `main` ブランチへの push で自動的に
`npm ci` → `npm run build` → `_site/` を GitHub Pages にデプロイする
（公式の `actions/configure-pages` / `actions/upload-pages-artifact` / `actions/deploy-pages` を使用）。
`npm ci` を使うため `package-lock.json` をコミットしている。

---

## 2. ディレクトリ

```
site/
├── .github/workflows/deploy.yml   GitHub Pages への公開ワークフロー
├── .eleventy.js               Eleventy 設定（入力 src/ 出力 _site/）
├── config/
│   ├── codeblocks.js         コードブロックの描画ルール＋全角文字チェック
│   ├── check.js              npm run check の中身
│   ├── vendor-prism.js       Prism.js の同梱スクリプト
│   ├── shortcodes.js         図解ショートコード（部品化された図解の実装）
│   ├── lesson-enhance.js     ビルド後の HTML に目次・各問の手順ボックス・解答へのリンク・表のスクロール領域を足す
│   ├── zip-downloads.js      回ごとの配布 ZIP（_site/downloads/<slug>.zip）を作る
│   └── check-site.js         npm run check:site（公開前チェック）の中身
├── docs/                     開発時の作業記録（学習者向けページではない。3章参照）
├── src/
│   ├── _data/site.json       ★サイト名と全7回のメタ情報（唯一の情報源）
│   ├── _data/exercises.js    ★各回の演習の「フォルダ・コンパイルするファイル・実行するクラス」
│   ├── _figure-gallery.md /  部品見本ページ（開発用。上記「部品見本ページ」参照）
│   │   _figure-gallery.11tydata.js
│   ├── _includes/
│   │   ├── layouts/          base.njk（全ページ共通）/ lesson.njk（各回）
│   │   └── partials/         site-header / site-footer / lesson-nav / lesson-index
│   ├── assets/
│   │   ├── css/  tokens.css → base.css → layout.css → code.css → figures.css → reading.css
│   │   └── js/   prism.js（同梱）/ prism.css / main.js（コピー）/ reading.js（目次・進捗）
│   ├── index.md              トップ
│   ├── start.md               はじめに
│   ├── lessons/               各回7ページ（front matter は order: だけ）
│   │   └── lessons.11tydata.js  ★共通設定。title/permalink を site.json から自動生成
│   └── downloads/            配布Javaソース（そのままコピーされる。ページ化しない。
│                              置いているのは各回の「開始状態」のみで解答は含まない）
├── masters/                   画像の編集用マスター（PNG・17MB超）。★git管理外（4章）
└── tools/                    画像処理スクリプト（サイト本体とは独立。git管理外の node_modules を持つ）
```

### 決めごと

- **URLは `.html` 付きの明示的なファイル名**（`lessons/01-class.html`）。
  Eleventy 標準のディレクトリ形式にはしない。
- **参照はすべて相対パス。** `rel` フィルタを通す。
  `{{ 'assets/css/base.css' | rel }}` → `./assets/...` / `../assets/...`
  **ルート絶対パス（`/assets/...`）は使わない**（GitHub Pages のサブディレクトリ配信で壊れる）。
- **回の情報は `src/_data/site.json` が唯一の情報源。**
  トップの一覧表・各回ヘッダ・前後リンクはすべてここから自動生成される。
  タイトルや呼び名を直すときは site.json を直す。各回の `.md` は触らない。

### 第8回を追加する手順

1. `src/_data/site.json` の `lessons` に1件足す（`order: 8`, `slug`, `title`, …）
2. `src/lessons/08-xxxx.md` を作り、front matter に `order: 8` と書く

3. 配布ソースを `src/downloads/08-xxxx/` に置き、`src/_data/exercises.js` に各問の手順を足す

これだけでトップの一覧・前後リンク・目次・手順ボックス・配布 ZIP が更新される。手作業のリンク修正は無い。
`exercises.js` に書いたファイルが無い、問題の見出しが見つからない、といった食い違いは
`npm run build` の最後の公開前チェックで止まる。

### 読み進めるための道具（2026-10 追加）

Markdown 側に特別な記法は要らない。ビルド時に `config/lesson-enhance.js` が見出しの文言から組み立てる。

- **目次**：各回の h2（第1部・第2部）・h3・h4 から作る。見出しには文言から作った id が付く
  （例: `#演習`、`#問2-bankaccount-クラスを作成する`）。スクロールすると上に細いバーが出て、現在地と目次を開ける。
- **手順ボックス**：「演習」の中の h4 のうち、「第1問／問1／演習1／発展」で始まるものの末尾に差し込む。
  中身は `src/_data/exercises.js` の同じ `key` の項目。実行結果の例・解答へのリンクと「できた」チェックも付く。
- **解答のリンク**：「解答・解説」の中の `<details>` のうち、`<summary>` が「問1 の解答を見る」のように
  問題名で始まるものに `id="answer-1"` と「問題に戻る」リンクを付ける。
- **進捗**：「できた」「この回を完了にする」「続きから読む」は `assets/js/reading.js` が
  `localStorage`（キー `kashiwagi-time:progress:v1`）に保存する。サーバーには何も送らない。
  JS が無い・保存できない環境では、これらの部品は出さない（教材は普通に読める）。
- **表**：はみ出す表は `.table-scroll` で包まれ、はみ出しているときだけキーボードで操作でき、「横にスクロールできます」と出る。
  Markdown の表を `<div class="table-scroll">` で囲み忘れても、ビルド時に自動で包まれる。

---

## 3. `docs/` について（開発時の作業記録）

`docs/downloads-generations.md`（配布Javaソースの世代の対応表）・`docs/figures.md`（図解部品の
仕様書）・`docs/images.md`（画像素材の処理記録）は、実装時の作業記録として残している。
学習者向けのコンテンツではないが、実装の経緯や部品の使い方が分かるので公開リポジトリに含めた。

**画像のライセンスに関する未確認事項が `docs/images.md` 6章にある**（`src/assets/img/figures/`
の3点は生成AI／購入／自作のいずれか出自が未確認）。判断が必要な場合はそちらを参照。

---

## 4. ★コードブロックの書き方（各回ページを書く人はここだけ覚える）

**用途で言語指定を固定する。**

| 書きたいもの | こう書く | 出てくるもの |
|---|---|---|
| コンパイルできる Java コード | ` ```java ` | ハイライト＋行番号＋コピーボタン |
| **実行結果・コンソール出力** | ` ```text ` | **ハイライトしない**。「実行結果」ラベルの枠。コピーボタンなし |
| 入力例 | ` ```text input ` | 同じ枠で「入力例」ラベル |
| わざとコンパイルエラーにするコード | ` ```java error ` | 赤枠＋「コンパイルできません」バッジ |
| 日本語混じりの擬似コード | ` ```text pseudo ` | 破線の明るい枠＋「擬似コード」バッジ。等幅にしない |

**★一番やりがちな間違い**: 実行結果を ` ```java ` に入れること。
これをやると出力の日本語が Java のキーワードとして誤ハイライトされる。**実行結果は必ず ` ```text `。**

### 追加の属性（スペース区切りでいくつでも）

| 属性 | 意味 | 例 |
|---|---|---|
| `file=名前` | ファイル名ラベルを付ける | ` ```java file=Hero.java ` |
| `hl=行` | その行を金色で強調（Prism line-highlight） | ` ```java hl=3-5 ` / ` ```java hl=2,7-9 ` |
| `nonum` | 行番号を消す | ` ```java nonum ` |

組み合わせ例:

    ```java file=PolyGame2.java hl=12-18
    public class PolyGame2 {
        ...
    }
    ```

### ★ビルド時の全角文字チェック

` ```java ` ブロックの中に**全角括弧・全角スペース・スマートクォート `“”`・全角セミコロン**などが
混ざっていると、ビルド時に `ファイル:行:桁` 付きで警告が出る（**ビルドは止まらない**）。

```
[codeblocks] ★全角文字の混入を 2 件検出しました（ビルドは続行します）
  - src\lessons\02-overload.md:57:19  全角丸括弧 （ が混入しています（半角に直してください）
```

- **コメント（`//`, `/* */`）と文字列リテラル（`"..."`）の中身は対象外。**
  日本語コメントや `"勇者　ゆいたろう"` は警告されない。
- **` ```java error ` は対象外。** 全角混入そのものを見せたい箇所で使う。
- ` ```text ` / ` ```text pseudo ` も対象外（日本語が入るのが当然なので）。
- 言語指定が `java` / `text` 以外だと「未定義の言語指定」の警告が出る。

`npm run check` でビルドせずにこのチェックだけ走らせられる。

### `[emphasis]` 警告について

ビルド時に次のような警告が出ることがある。

```
[emphasis] ★強調されなかった ** が 2 件そのまま出力されています: ./_site/lessons/03-encapsulation.html
  - …演習3は**「名前: null」…**になります…
```

日本語の本文では `**強調**` が CommonMark の flanking 判定（開始/終了記号の前後に何の文字が
あるか）によって黙って強調に変換されないことがある。開始の `**` の直後が全角スペースなど、
終了の `**` の直前が `」` などの記号だと発生しやすい。**ビルドは止まらない**が、該当箇所は
画面に `**` がそのまま出てしまうので、その部分だけ `<strong>…</strong>` で書き直して直す。

---

## 5. 解答の折りたたみの書き方

`<details>` の**前後に空行**を入れると、中の Markdown が解釈される。

```html
<details>
<summary>問1 の解答を見る</summary>

ここは Markdown が使える。コードブロックも置ける。

</details>
```

- `<summary>` に長い文章を入れない（うっかりクリックで開く面積を広げないため）。
- `<summary>` の先頭は「問1」「第1問」「演習1」「発展」のように**問題名で始める**（手順ボックスからのリンクと「問題に戻る」が自動で付く）。
- 開閉の三角は CSS が描く。`▶` を手書きしない。
- 印刷すると閉じたままになる（解答を伏せて配れる）。開いて印刷したいときは先に開く。

## 6. そのほか本文で使える class

| class | 用途 |
|---|---|
| `<h2 class="part">` | 「第1部 …」「第2部 …」の大見出し |
| `<div class="note">` | 補足。`note--hint` / `note--warn` / `note--ok` のバリエーションあり |
| `<span class="term">` | 初出用語の強調（用語集は作らない方針の代わり） |
| `<div class="table-scroll">` | 横に長い表を囲む（囲み忘れてもビルド時に自動で包まれる） |

図解は `config/shortcodes.js` のショートコードを使う。使い方は `npm run build:dev` で見られる
部品見本ページ（`_site/figure-gallery.html`）と `docs/figures.md` を参照。

---

## 7. デザイン

- ライト基調＋藍色アクセント。**色はすべて `src/assets/css/tokens.css` の CSS 変数経由で使う。**
  変数名は図解CSS・各回ページとの共通の約束なので変えない（値は変えてよい）。
- **概念色は予約されている**: `--c-info`（黄＝情報／フィールド）、`--c-action`（青＝動作／メソッド）。
  全7回で用途を崩さない。サイトのアクセント色 `--c-accent`（藍紫）とは彩度をはっきり分けてある。
- **ブレークポイントは 640px / 900px の2段だけ。**
- 日本語フォントは**外部Webフォントを読み込まない**（OS標準フォントのスタック）。
- ★**世界観要素はコードブロックの外側だけ**。見出しの呼び名・ナビの文言・配色・図解には置いてよい。
  コードブロックの中・コードのハイライト配色・本文の地の文・演習の問題文には置かない。
  `assets/js/prism.css` は prism-tomorrow をそのまま同梱したもので、**改変しない**。

## 8. 同梱ライブラリ

外部CDNは使わない。Prism.js を `config/vendor-prism.js` で連結して同梱している。

| ファイル | 中身 | サイズ |
|---|---|---|
| `src/assets/js/prism.js` | core + clike + java + line-numbers + line-highlight（すべて min 版） | **17,554 B** |
| `src/assets/js/prism.css` | prism-tomorrow テーマ + 上記2プラグインのCSS | **3,291 B** |
| 合計 | | **20,845 B（20.4 KB）** |

言語は `java` のみ（`text` はハイライトしないので不要）。
コピーボタンは `copy-to-clipboard` プラグインを使わず `main.js` で自作している
（プラグインは `prism-toolbar` を要求しサイズが増えるため。
また「実行結果の枠にはコピーボタンを出さない」制御を HTML 生成側でやりたかったため）。

## 9. 画像素材（`masters/` の扱い）

- 配信するのは **WebP のみ**（`src/assets/img/`）。ロスレスの編集用マスター（PNG、`masters/`、
  17MB超）は **`.gitignore` で除外**しており、このリポジトリには含まれない。
- `masters/` は `site/tools/make-transparent.js` で**再生成できる中間物**なので、
  必要になったら次の手順で作り直せる（元になる画像素材そのものはこのリポジトリに無いため、
  再生成には元資料 `image/` 一式が別途必要）。

  ```
  cd tools
  npm install                      # sharp をローカルに入れる（初回のみ）
  node make-transparent.js         # masters/img/ に透過PNG＋WebPを出力
  node make-figures.js             # 第2回の概念イラストをWebP変換
  ```

- 詳しい処理内容・素材の対応表は `docs/images.md` を参照。
