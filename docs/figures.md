# 図解部品ライブラリ ── 各回ページを書く人向け

図解はこの教材の**主役**（`CLAUDE.md` 1章）。全7回の図は少数の型の組み合わせに還元できる
（`00_research/02_content/cross-session-findings.md` 1章）ので、部品化してある。

| 実装 | 場所 |
|---|---|
| ショートコード | `site/config/shortcodes.js` |
| CSS | `site/src/assets/css/figures.css` |
| **全部品の見本（実際の描画つき）** | `site/src/_figure-gallery.md` → ビルド後 `_site/figure-gallery.html` |

**まず見本ページをブラウザで開くこと。** 書き方をコピーして中身を差し替えるのが最短。
見本ページは開発用で、本番公開時は `src/_figure-gallery.md` を削除するか `permalink: false` にする
（サイトのナビゲーションからはリンクしていない）。

---

## 0. 3分で使えるようになる

```
{% cards [
  { "chara":"hero", "name":"勇者 ゆいたろう", "stats":{ "Lv":"12", "HP":"120" } },
  { "chara":"wizard", "name":"魔法使い ゆい", "stats":{ "Lv":"45", "HP":"80" } }
], { "caption":"図の説明文", "legend":true } %}
```

覚えることは3つだけ。

1. **データは JSON のように書く。キーは必ずダブルクォートで囲む**
   （`{ 身長:"170cm" }` のように日本語キーを裸で書くと Nunjucks が読めない）。
   タグの中は改行してよい。
2. **最後のオプションに `caption` `legend` `wide` を渡せる**（どの部品でも同じ）。
3. **文字列は自動でエスケープされる。** `"ArrayList<Adventurer>"` をそのまま書ける。
   HTML を入れたいときだけ `{ "html":"…<b>…</b>…" }` を渡す。

### 部品を組み合わせるとき

`compare` `panel` `box` `fig` は**中身に Markdown が書ける**（本文・箇条書き・
そして ` ```java ` のコードブロックもそのまま使える）。他の部品を中に入れてもよい。

```
{% compare { "caption":"…" } %}
{% panel "Before", { "tone":"danger" } %}
{% listrow { "fixed":true, "slots":3, "items":[ … ] } %}
{% endpanel %}
{% panel "After", { "tone":"ok" } %}
{% listrow { "items":[ … ], "plus":true } %}
{% endpanel %}
{% endcompare %}
```

**★中身を4文字以上インデントしないこと。** Markdown がコードブロックと誤解する。

---

## 1. 部品一覧

★の2つ（カードとカプセル図）が最も広く使われる基礎部品。

| # | 部品 | 何を説明する図か | 使う回 | 型 |
|---|---|---|---|---|
| 1 | ★`cards` | キャラ1体＋ステータス（オブジェクト） | 1・4・5・6・7 | 非対比 |
| 2 | `classbox` | クラスの箱を情報（黄）／動作（青）の2段に区切る | 1・3・5・6・7 | 非対比 |
| 3 | ★`capsule` | private の中身と、枠線にまたがる窓口メソッド | 3・5・7 | 非対比 |
| 4 | `notes` | 付箋。黄＝情報／青＝動作。散乱と整列 | 1・3 | 非対比 |
| 5 | `listrow` | リストの列。横一列＋インデックス番号 | 4・6 | **対比** |
| 6 | `tree` | 継承ツリー（親→子の線）。3段・implements にも対応 | 5・6・7 | 非対比 |
| 7 | `mark` | ✕／○／STOP バッジ（できないことの表示） | 1・3・5・7 | 行内 |
| 8 | `codeout` | コード↔出力の2列 | 2・6・7 | **対比** |
| 9 | `compare` | 左右対比（Before/After）。**全7回でいちばん数が多い** | 1・2・3・4・5 | **対比** |
| 10 | `steps` | まとめ3ステップ | 1・3・6・7 | 非対比 |
| 11 | `fanout` | 1入力→N出力の分岐図（全7回で唯一の新規の型） | 6 | 非対比 |
| 12 | `parallel` | 並行配列＋添字の対応（第1回 図D 専用） | 1 | **対比（固定）** |
| 13 | `flow` | 矢印でつなぐ処理の流れ・ループ | 3・4・6 | **対比** |
| 14 | `box` | ラベル付きの箱。**入れ子にできる汎用部品** | 2・6・7 | 中身しだい |
| 15 | `codeline` | コード1行の中を色分けして指す | 2・4 | 非対比 |
| 16 | `fig` | 一点物の図の外枠（caption / legend / wide だけ欲しいとき） | 全回 | 指定する |
| 17 | `legend` | 凡例。★色分けを使う図には必ず付ける | 全回 | 行内 |
| 18 | `chara` | 立ち絵1点 | 全回 | 行内 |
| 19 | `ct` | 図の中で使うコード片（色を意味に使えるトークン） | 全回 | 行内 |
| 20 | `arrow` | 矢印（右・下・左） | 全回 | 行内 |
| 21 | `usage` | 「ページ側の書き方」の枠（見本・説明用。学習ページでは使わない） | — | — |

`compare` の中で使う `panel`、`fig` `box` `codeout` `codeline` `usage` は
**開始と終了のあるタグ**（`{% panel %}` … `{% endpanel %}`）。他は1つのタグで完結する。

---

## 2. どの部品でも使える共通オプション

| オプション | 意味 |
|---|---|
| `caption` | 図の下の説明文。**原則いつも書く**（図だけで意味が伝わるように） |
| `title` | 図の上の小見出し |
| `legend` | 凡例。`true` で「黄＝情報／青＝動作」。配列や文字列で内容を選べる |
| `wide` | `true` で本文幅（736px）より左右 48px ずつ広く出す。**901px 以上でだけ効く** |
| `fit` | `"hold"`（対比型）／`"stack"`（非対比型）。部品の既定を上書きしたいときだけ |
| `class` | クラスの追加 |
| `id` | 図にリンクしたいとき |

---

## 3. 凡例の出し方（★重要）

第1回の発表者ノートに「黄色い付箋は情報、青い付箋は動作として、**この後も同じ色で
追いかけます**」とある。これは**口頭説明なので Web では消える。** 代わりに凡例を出す。

```
{% legend %}                          黄＝情報（フィールド）／青＝動作（メソッド）
{% legend "info,action,x" %}          ✕バッジの説明も足す
{% legend ["private","gate"] %}       カプセル図用
{% cards [...], { "legend":true } %}  図の中に埋め込む（どの部品でも同じ）
{% legend [{ "label":"聖剣を装備", "tone":"gold" }] %}   自分で作る
```

用意してある名前: `info` `action` `x` `o` `dim` `gate` `private` `gold` `danger` `ok`。

**★概念色の予約は絶対に崩さない。**
`--c-info`（黄）＝情報／フィールド、`--c-action`（青）＝動作／メソッド。
図の中で `--c-accent`（藍）を「意味を持つ色」として使わない（構造の色としてだけ使う）。

指定できる色（`tone`）: `plain` `info` `action` `gold` `ok` `danger` `dim` `mute` `code`。
`gold` は「ここに注目」の機能色、`ok`/`danger` は「うまくいく／いかない」。

---

## 4. スマホでの畳み方（決定3 がどう実装されているか）

> 左右対比の図は横並びを維持し、要素の幅を詰める。それでも入らない場合は図単位で横スクロール
> させる。対比ではない図は縦積みにする。区切りラベル（VS / Before / After）は常に残す。

### 仕組み

- 図のルートに **`figure--hold`（対比型）** か **`figure--stack`（非対比型）** が付く。
- 部品の中で横に並ぶ箱は**すべて `.fig-row`** に入っている。
- `figures.css` の 640px ブロックにある**たった1組のルール**が畳み方を決める。

```css
@media (max-width: 640px) {
  .figure--stack .fig-row { flex-direction: column; }   /* 非対比型は縦積み */
  .figure--hold  .fig-row { flex-direction: row; }      /* 対比型は横並び維持 */
}
```

`hold` の宣言を後に置いてあるので、**対比型の中に入れた非対比型の部品は横並びのまま残る。**
`{% compare %}` の中に `{% cards %}` を置いても、スマホでカードが縦に崩れない。

### スクロールできることの見せ方

- はみ出しは必ず `.figure__scroll` の内側で閉じる。**ページ全体は絶対に横スクロールしない。**
- 対比型の図には、端のグラデーションと影（スクロール位置で自動的に消える）＋
  640px 以下で「← 横にスクロールできます →」の案内文が出る。
- 対比型の図はキーボードでもスクロールできる（`tabindex="0"`＋`aria-label`）。

### 部品ごとの既定

| 畳まない（対比型） | 畳む（非対比型） |
|---|---|
| `compare` `codeout` `listrow` `flow` `parallel` | `cards` `classbox` `capsule` `notes` `tree` `steps` `fanout` `fig` `codeline` |

- `tree` は縦積みのとき「左に幹、右に子」の形に切り替わる（線の意味が残る）。
- `capsule` は縦積みのとき窓口が**下の枠線**にまたがる形に切り替わる。
- `parallel` は**畳む選択肢を持たせていない**（3列の添字対応が消えてしまうため）。

---

## 5. 部品ごとの引数

### 1. `cards` ── カード列

```
{% cards [ カード, カード, … ], { オプション } %}
```

| カードのキー | 意味 |
|---|---|
| `chara` | 立ち絵のキー（下の一覧参照）。無くてよい |
| `name` / `role` | 名前／その下の小さい行（職業・クラス名） |
| `stats` | `{ "Lv":"12", "HP":"120" }` → 左に項目名・右に値 |
| `lines` | `["攻撃力アップ"]` → 項目名なしの行 |
| `bar` | `{ "label":"HP", "value":20, "max":120 }`。値が負か max 超なら「突き抜けた」表示、`"stop":true` で「0でぴったり止まった」表示 |
| `badge` | 右上のバッジ（`"NEW!"` など） |
| `mark` | 左上のバッジ。`x` `o` `stop` `q` `new` `bang` |
| `dim` | `true` で灰色＋半透明（名簿から外れた状態） |
| `empty` | `true` で「？」の点線枠（まだ何も入っていない枠） |
| `tone` `note` `size` | 色／下の注記／`"s"` で小さいカード |

### 2. `classbox` ── クラス枠

```
{% classbox { "name":"Human", "fields":["name","height"], "methods":["walk()"] } %}
{% classbox [ クラス, クラス, クラス ] %}      配列を渡すと横並び
```

`name` `stereotype`（`"abstract"` など）`note` `chara` `tone` `mark` `foot`（枠の下の帯）
`fields` `methods`（項目は文字列か `{ "t":"hp", "access":"private", "mark":"x", "note":"…" }`）
`fieldsLabel` `methodsLabel`（既定は「情報（フィールド）」「動作（メソッド）」）

### 3. `capsule` ── カプセル図

```
{% capsule {
  "name":"Hero", "chara":"hero",
  "inside":[ { "t":"hp", "value":"120" } ],
  "gates":[ "getHp()", "setHp(int hp)" ],
  "outside":"外のコード", "outsideChara":"assassin"
} %}
```

`direct: true` にすると「窓口を通らず中身をいじれてしまう」図（赤い矢印が貫通）になる。
`inside` を残高・口座番号・パスワードに差し替えれば銀行くん版になる。

### 4. `notes` ── 付箋

```
{% notes [ { "t":"名前" }, { "t":"歩く", "kind":"action" } ], { "scatter":true } %}
```

`kind` は `info`（既定・黄＝情報）／`action`（青＝動作）。`scatter:true` で散乱状態
（回転量は固定の表を引いているので、ビルドしても見た目が変わらない）。凡例は既定でON。

### 5. `listrow` ── リストの列

```
{% listrow { "type":"ArrayList<Adventurer>", "items":[ カード, … ], "plus":true } %}
```

`type`（枠の上のラベル）`items`（カードと同じ書き方）`index:false`（番号を消す）
`plus:true`（末尾に「＋いくらでも増える」の点線枠）`slots:3`（枠の数を固定＝配列）
`fixed:true`（配列として枠を強調）`note` `size`。
`items` の要素に `"?"` か `{ "empty":true }` を入れると空き枠。`arrowNote` でセルの下に注記。

### 6. `tree` ── 継承ツリー

```
{% tree {
  "root":{ "name":"Adventurer", "note":"親", "fields":["name","hp"], "methods":["attack()"] },
  "children":[ { "name":"Hero", "chara":"hero" }, { "name":"Wizard", "chara":"wizard" } ],
  "edge":"extends"
} %}
```

ノードのキー: `name` `stereotype` `note` `chara` `tone` `mark` `fields` `methods`
`children`（**入れ子にすれば3段以上**）`implements`（バッジの列。親は1本・装備はいくつでも）
`edge`（そのノードから子への線のラベル）。

### 7. `mark` ── ✕バッジ／STOP

```
{% mark "x" %}   {% mark "o" %}   {% mark "stop" %}   {% mark "q" %}   {% mark "new" %}
{% mark "x", "コンパイルできない" %}      読み上げ用のラベルを変える
```

### 8. `codeout` ── コード↔出力の2列

```
{% codeout { "caption":"…" } %}
{% panel "コード" %}
```java
for (Adventurer a : party) { a.attack(); }
```
{% endpanel %}
{% panel "実行結果" %}
```text
勇者の攻撃！
```
{% endpanel %}
{% endcodeout %}
```

**実行結果は必ず ` ```text `**（` ```java ` に入れると日本語が誤ハイライトされる。`README.md` 3章）。

### 9. `compare` ── 左右対比（Before/After）

```
{% compare { "vs":"VS", "axis":"h", "cols":4 } %}
{% panel "Before", { "sub":"配列", "tone":"danger", "mark":"x" } %} … {% endpanel %}
{% panel "After",  { "sub":"ArrayList", "tone":"ok" } %} … {% endpanel %}
{% endcompare %}
```

| オプション | 意味 |
|---|---|
| `vs` | 区切りラベル。既定 `"VS"`。`"→"` `"sort() ↓"` など。`false` で消す |
| `axis` | `"h"`（既定・左右）／`"v"`（上下。**両段の列がそろう**） |
| `cols` | 両側の列幅をそろえる列数。`axis:"v"` と組み合わせて使う |

`panel` のオプション: `label`（第1引数でも渡せる）`sub` `tone` `mark` `note`。

> **⚠ 落とし穴（第1回の担当が実測で踏んだ）**
>
> **`axis:"h"`（左右）は `width: max-content` なので、中に入れた部品の `flex-wrap` が効かなくなる。**
> 付箋（`notes`）やカード列（`cards`）を横対比の中に入れると1行に伸びきり、
> 375px で図の内側が 500〜950px 横スクロールする。
>
> 対処は図の性質で決める。
>
> - **「変換」の図**（散乱→整列、設計図→実体、Before→After で中身が組み替わる）
>   → **`axis:"v"` にする。** 区切りラベルを `"作る ↓"` `"new すると ↓"` のように
>     縦向きの文言に変えれば、対比の意味は失われない
> - **左右に並んでいること自体が意味を持つ図**（添字の対応、2つの方式の同時比較）
>   → 横並びのまま。ただし**中に `notes` / `cards` を入れない**。
>     添字対応が本質の図は `compare` ではなく専用部品 `parallel` を使う
> - 「散乱 → 整列」のように**2枚の独立した図に割ったほうが読みやすい**ことも多い。
>   その場合は各図の `title` に `Before ──` / `After ──` を残して対比を示す
>
> 第1回では図A（付箋の散乱→分類）を**2枚に分割**、図C・図G・図F'（設計図→実体）を
> **`axis:"v"` に変更**した。6章の対応表もこの形で書いてある。

### 10. `steps` ── まとめ3ステップ

```
{% steps [ { "t":"見出し", "d":"1行の説明" }, … ], { "number":false } %}
```

### 11. `fanout` ── 1入力→N出力

```
{% fanout {
  "input":{ "t":"a.attack()", "sub":"押すボタンは1つだけ" },
  "outputs":[ { "chara":"hero", "name":"Hero", "t":"渾身の斬撃！" }, … ],
  "note":"…", "edge":"中身のクラスごとに違う結果"
} %}
```

### 12. `parallel` ── 並行配列＋添字の対応

```
{% parallel {
  "rows":[
    { "label":"name[]",   "cells":["たかぎ","れん","りょう"] },
    { "label":"height[]", "cells":[ { "t":"165", "bad":true }, "170", "180" ] }
  ],
  "colNotes":["たかぎが165cm？", "", ""]
} %}
```

セルは文字列か `{ "t":"165", "bad":true, "note":"…" }`。`bad` で赤＋✕。
`index:false` で添字の行を消す。`link:false` で縦の点線を消す。

### 13. `flow` ── 流れ・ループ

```
{% flow [
  { "t":"HP 20", "bar":{ "label":"HP", "value":20, "max":120 } },
  { "t":"setHp() が受け取る", "arrow":"damage(-50)", "tone":"action" },
  { "t":"HP = 0", "arrow":"if (hp < 0)", "tone":"ok" }
], { "loop":"次のターンへ" } %}
```

`arrow` は**その箱の手前の矢印**につくラベル。`loop` で下に戻りの帯が出る。

### 14. `box` ── ラベル付きの箱（入れ子可）

```
{% box "Adventurer a", { "sub":"変数の型", "tone":"action", "note":"…" } %}
（Markdown。他の部品や box をさらに入れられる）
{% endbox %}
```

### 15. `codeline` ── コード1行の中を指す

```
{% codeline { "notes":[
  { "t":"このオブジェクトが持っている name", "tone":"info" },
  { "t":"引数として受け取った name", "tone":"gold" }
] } %}
this.{% ct "name", "info" %} = {% ct "name", "gold" %};
{% endcodeline %}
```

Prism の行強調では1行の中の左右を色分けできないので、この1行だけ別枠にする。
**コードブロック（暗色）とは見た目をはっきり分けてある**（明るい地・枠線つき）。

### 16〜20. 小物

```
{% fig { "fit":"hold", "caption":"…", "wide":true } %} … {% endfig %}
{% chara "hero" %}        {% chara "excalibur", { "size":"l" } %}     size は s / m / l
{% ct "private", "info" %}
{% arrow { "dir":"down", "label":"super()", "tone":"action" } %}      dir は right / down / left
```

### 立ち絵のキー

| キー | 中身 | キー | 中身 |
|---|---|---|---|
| `hero` | 勇者（★`image/warrior.jpg` は名前に反して勇者） | `maou` | 魔王 |
| `wizard` | 魔法使い | `assassin` | 暗殺者 |
| `tank` | タンク（戦士） | `priest` | 僧侶 |
| `saint` | 聖女 | `silhouette` | 職業不明の冒険者（`unknown` でも同じ） |
| `archer` | 弓使い | `hero-excalibur` | 聖剣を持った勇者 |
| `excalibur` | 聖剣 | `holy-sword` | 聖剣（スライド版） |
| `magic-circle` | 魔法陣 | | |

- `assets/img/chara/` `items/` にあるファイル名がそのままキー。

> **⚠ `{% chara %}` は `assets/img/figures/` の画像には使えない**（第2回の担当が実測で確認）
>
> `chara` は `&lt;img src&gt;` に必ず `&lt;キー&gt;-320.webp` を入れる。`chara/` と `items/` には
> `-320.webp` があるが、**`figures/` の3点には無い**（`-700` / `-1000` / 原寸のみ）ため、
> `{% chara "figures/s02-juice-stand" %}` と書くと**壊れた `src` になる**。
>
> `figures/` の画像（第2回のジュース屋など）は、`{% fig %}` の中に**素の `&lt;img srcset&gt;`** を置く。
> `chara` は「本文や図の中に小さく置く立ち絵」専用で、幅いっぱいの挿絵には
> そもそも寸法（`s`/`m`/`l` の最大 7rem）が合わない。
>
> ```
> {% fig { "caption":"…" } %}
> &lt;a href="../assets/img/figures/s02-juice-stand.webp"&gt;
>   &lt;img srcset="…-700.webp 700w, …-1000.webp 1000w, ….webp 1672w"
>        sizes="(max-width:900px) 100vw, 832px" width="…" height="…" loading="lazy" alt="…"&gt;
> &lt;/a&gt;
> {% endfig %}
> ```
- **画像が無くても図は崩れない。** 枠の寸法は CSS で固定してあり、読み込めなければ
  代替テキストだけが出る。
- **配信するのは WebP のみ**（PNG の原本は `site/masters/` に分離され、公開されない）。
  `srcset` で `-320.webp`（320px版）と原寸を出し分け、`sizes` に実際の表示寸法を入れている。
- `loading="lazy"` を付けているので、画面に入るまで読み込まれない。

---

## 6. 各回の図 → 部品の対応（全7回）

`00_research/02_content/per-session/session-0N.md` の「図解の洗い出し」に対する割り当て。
**〈推〉が付いている図は元資料に配置の根拠が無い**（pptx の目視確認が残作業）。

### 第1回 クラスの概念（新規6点・pptx画像は0点）

| 図 | 部品の組み合わせ |
|---|---|
| 図A 付箋の散乱→分類 | `compare`（`vs:"→"`）＋左に `notes{scatter:true}`／右に `classbox` 2つ |
| 図B クラス＝設計図と用語の対応 | `codeout`＋左に `classbox`／右に ` ```java `。凡例必須 |
| 図C 設計図から実体をつくる | `compare`＋左に `classbox`／右に `cards` 3枚 |
| **図D 並行配列だと関係が壊れる** | **`parallel` 2つ**（Before／After）。詳細は7章 |
| 図E オブジェクトなら壊れない | `compare`（`vs:"並べ替え ↓"`, `axis:"v"`, `cols:3`）＋`cards` 3枚 × 2段 |
| 図F まとめの3ステップ | `steps`（`notes`→`classbox`→`cards` の縮小版なら `fig`＋3つの `box`） |
| スライド12「分かる／壊れにくい／扱いやすい」 | `steps{number:false}` か `cards` 3枚 |

### 第2回 オーバーロード・コンストラクタ（画像を貼る唯一の回）

| 図 | 部品の組み合わせ |
|---|---|
| 図A キャラ作成画面（コンストラクタの導入） | `box` の入れ子＋`ct`。もともと縦1列なので畳む問題が無い |
| 図B オブジェクト製造機（入口3つ・機械1台） | `compare`（3行）か `fig`＋`box`（機械）＋`arrow`。7章参照 |
| 図C ジュース屋（画像＋ラベル） | `fig`＋**素の `<img srcset>`**（`chara` は使えない。5章の警告参照）＋下にラベルの箇条書き。7章参照 |
| **図D `this.name = name;`** | **`codeline`＋`ct`**（この回で最もつまずく箇所） |
| 図E 呼び出しとコンストラクタの対応 | `codeout`＋`mark`（①②③は `ct` か `badge` で対応づける） |
| スライド6 `makeJuice` 2つ | `codeout`（` ```java hl= ` の行強調で足りる） |

### 第3回 カプセル化（型4種＋演習用1点）

| 図 | 部品の組み合わせ |
|---|---|
| 図A クラスのカプセル図 | **`capsule`**（この回の基幹部品。`legend:["private","gate"]`） |
| 図B 直接アクセス／窓口 の対比 | `compare`＋`capsule{direct:true}`／`capsule`（窓口あり） |
| **図C HP事故／setterが止める** | **`flow` 2つ**（`bar` の3状態を使う）。`compare{axis:"v"}` で上下に並べる |
| 図D まとめ3ステップ | `steps` |
| 図E 銀行くん実装マップ | `classbox`（`fields`／`methods`）＋`chara`。7章参照 |
| スライド10 Javaコードの提示 | ` ```java hl= ` だけで足りる（図は不要） |

### 第4回 ArrayList（**5枚すべて左右対比**）

| スライド | 部品の組み合わせ |
|---|---|
| 2 可変長という考え方 | `compare`＋`listrow{fixed,slots:3}`／`listrow{plus:true}` |
| 3 宣言のしかた | `codeline`＋`ct`、または ` ```java hl= `＋`listrow` の空き枠 |
| 4 add の2種類 | `compare{axis:"v", cols:5}`＋`listrow`（`badge:"NEW!"` と `arrowNote`） |
| 5 get / set | `listrow`（`index` の色を強調）＋`box` の吹き出し |
| 6 remove 2種類と clear | `compare`（3枚並べるなら `fig`＋`listrow` × 3）。離脱は `mark:"x"`＋`dim:true` |
| 7 人数チェックと検索 | `cards` 4枚（`stats` にメソッド／質問／戻り値） |
| 8 拡張for文 | `codeout`＋下に `listrow`（点呼の吹き出し） |
| **9 sort（最も崩れる図）** | **`compare{axis:"v", cols:4}`＋`cards` 4枚 × 2段**。詳細は7章 |
| 10 メソッド早見表 | 表（`table-scroll`）＋`steps` |
| 新規1 削除後に添字が詰め直される | `listrow`（`arrowNote:"1つ前へ詰まる"`）。見本ページに実例あり |
| 新規2 バトルループ | `flow{loop:"…"}`（第6回と共通部品） |

### 第5回 継承・オーバーライド

| スライド | 部品の組み合わせ |
|---|---|
| 2 REVIEW 第4回の名簿 | `listrow`（第4回と**同じ部品を使うことが「前回の図だ」という合図**になる） |
| 3 PROBLEM バラバラのクラス | `classbox` 3つ（配列で渡す）＋`foot` に困りごと |
| **4 INHERITANCE 共通部分は親から** | **`tree`**（この回の最重要図） |
| 5 HOW TO extends | ` ```java hl= `＋`box` の吹き出し（吹き出しはコードブロックの外側） |
| 6 BUT 攻撃はキャラごとに違う | `fanout`（同じ吹き出し3つ）か `cards` 3枚＋`lines` |
| 7 OVERRIDE 自分流に上書き | `compare`＋親の `attack()`／子の `@Override attack()` |
| 8 RESULT 原形はそのまま | `codeout` |
| 9 まとめ | `steps`（4枚なら `cards`） |
| 新規1 3段の継承ツリー | `tree`（`children` を入れ子にする）。**アーサー／マーリンの立ち絵は無い** |
| 新規2 `super()` で値が親に流れる | `fig`＋`box` 2つ＋`arrow{dir:"down"}` |
| 新規3 問題1の ✕ 4パターン | ` ```java error `＋`mark:"x"`。`compare` で正誤を並べる |

### 第6回 ポリモーフィズム

| スライド | 部品の組み合わせ |
|---|---|
| 2 REVIEW 第5回 | `tree`（第5回と同じ部品を再利用） |
| 3 PROBLEM まとめられない？ | `compare`＋`cards`（`mark:"o"`／`mark:"x"`）＋下に `listrow` 3本 |
| **4 SOLUTION 親の型でリストを作る** | **`listrow{type:"ArrayList<Adventurer>"}`**（この回の最重要図） |
| 5 HOW TO | ` ```java hl= `＋`box` の注釈 |
| 6 RUN 同じ呼び出しでそれぞれの攻撃 | `codeout`（見本ページに実例あり） |
| 7 MERIT なにがうれしいの？ | `cards` 2枚＋下に ` ```text pseudo `（if分岐地獄） |
| **8 POLYMORPHISM 同じボタン** | **`fanout`**（全7回で唯一の新規の型）。形は〈推〉 |
| 9 まとめ | `steps` |
| 新規1 呼べる範囲＝型／動き＝中身 | **`box` の入れ子**（見本ページ14番に実例あり）。この回の最重要の欠落 |
| 新規2 素の Adventurer「見習い」 | `listrow`＋`chara "silhouette"` |
| 新規3 抽象度の階段 | `fig`＋`box` 2段＋`arrow{dir:"down"}` |
| 新規4 バトルループ | `flow{loop:"…"}`（第4回と共通） |

### 第7回 抽象クラス・インターフェイス

| スライド | 部品の組み合わせ |
|---|---|
| 2 REVIEW 第5・6回 | `compare{vs:"＋"}`＋`tree`／`listrow`（**部品化が最も効く箇所**） |
| 3 PROBLEM 冒険者が作れてしまう | `cards`（`chara:"silhouette"`, `mark:"q"`）＋`box` の吹き出し3つ |
| 4 ABSTRACT CLASS 概念だけを定義する | `compare`＋` ```java `／` ```java error `＋`mark:"x"`。`dim:true` で「なれない」状態 |
| 5 ABSTRACT METHOD | `fanout`（第5回スライド7と同じ型） |
| 6 MUST IMPLEMENT | `compare{axis:"v"}`＋` ```java error `／` ```java ` |
| 7 ＋α INTERFACE 聖剣あらわる | `fig`＋`chara "excalibur", {size:"l"}`（**700px が上限**） |
| 8 IMPLEMENTS | `cards`（`chara:"hero-excalibur"` を使えば重ね合わせ済みの絵が使える） |
| **9 MULTIPLE 親は1つ、装備はいくつでも** | **`tree`＋`implements`**（見本ページ6番に実例あり。この回の最重要図） |
| 10 まとめ | `steps` |
| B-1 new できない／型としては使える | `compare`＋`box`（見本ページ7番に実例あり） |
| B-2 抽象メソッドが全子クラスに及ぶ | `tree`（`children` に `maou` を足す） |
| B-3 instanceof ＋キャスト | `compare`＋`cards`＋`mark` |
| B-4 全7回の到達点マップ | `steps` か `fig`＋`box`。**部品では足りない可能性あり（7章）** |

---

## 7. 難しい図をどう解決したか／部品で足りない図

### 解決済み

**第1回 図D（並行配列。この回の山場）** → 専用部品 `parallel`。
**列（添字）を単位に組み立てる**構造にしたので、同じ添字のセルが縦に並び、
その列を縦の点線が貫く。セルの地が不透明なので点線は隙間だけに見える。
横並びが本質なので**畳む選択肢を持たせていない**（常に対比型・横スクロール）。
実測: 幅 375px で3列なら横スクロールなしで収まる（4列以上で図の内側がスクロールする）。

**第4回スライド9（4体×2段＝8体。全7回で最も崩れる図）** → `compare{axis:"v", cols:4}`。
**Before と After の2段を1つのスクロール領域に入れ、`cols` で両段に同じ列幅を割り当てる。**
横スクロールしても2段が一緒に動き、列がそろったままなので「どのカードがどこへ動いたか」が
追える。**表形式へのフォールバックは不要と判断した**（表にすると立ち絵とLvバッジの対応が
失われ、図の役割そのものが変わってしまう）。実測: 375px で `scrollWidth 400 / clientWidth 343`。

**第3回 図C の HPバー** → `cards` / `flow` の `bar` オプション。
同じ部品で「ふつう／0でぴったり止まる（`stop`）／枠を突き抜けて赤くなる（値が負）」の
3状態を作れる。

**第7回スライド9（extends 1本＋implements 4バッジ）** → `tree` の `implements`。
子への実線と、装備への破線バッジを描き分けている。

**入れ子図（型の箱の中に実体が入る。第6回 新規1・第7回 B-1）** → `box` の入れ子。
`capsule`（内／外＋窓口）とは意味が違う図なので、汎用の `box` で受けることにした。

### 部品では足りない・要判断のまま残したもの

| 図 | 状況 |
|---|---|
| **第2回 図C ジュース屋** | 「画像の上に % 座標でラベルを重ねる」型は作っていない。絶対配置ラベルは縮小時に必ず重なるので、**画像＋その下のラベル一覧**という形を推奨する（`fig`＋`chara`＋箇条書き）。重ね方をやるなら図専用の CSS を1つ足すことになる |
| **第2回 図A キャラ作成画面** | ステップ表示・input風・%幅スライダー・決定ボタンという UI 模写。`box` の入れ子で骨組みは作れるが、スライダーの見た目は専用 CSS が必要。**この回だけの図なので部品化しなかった** |
| **第2回 図B オブジェクト製造機** | 「N入力→1処理→N出力」。`fanout` は逆向き（1→N）。`compare` の3行や `fig`＋`box`＋`arrow` で代替できるが、**専用部品にはしていない**。第5回 `super()` の図と共通化できる可能性があるので、実際に第2回を作るときに判断してほしい |
| **第3回 図E 銀行くん（中央から6方向のコールアウト）** | 放射図の部品は作っていない。`classbox` の `fields`／`methods` に落とすのが素直（スマホで確実に読める）。**元画像は文字が焼き込まれていて 1.31MB あり、そのまま貼るのは非推奨** |
| **第7回 B-4 全7回の到達点マップ** | 単一概念の図ではなくサイト全体の構成図。`steps` や `box` の組み合わせで作れるが、**専用のレイアウトを1つ書くほうがきれいになる可能性が高い** |
| **確認ポイントのチェックボックスUI**（第6・7回の演習） | 図解ではないので作っていない。本文側の `.note` か Markdown のリストで足りるはず |

### 元資料側の未確定（部品の問題ではない）

- **pptx の図形座標を取っていないため、〈推〉付きの図は並び順が推測。** 図案を確定する前の
  pptx 目視確認が残っている（`cross-session-findings.md` 6章）。
  とくに**第6回スライド8（`fanout`）は図の形そのものが未確認**。
- **不足素材**: アーサー／マーリンの立ち絵（第5回 新規1）。
  魔王・職業不明のシルエットは `assets/img/chara/` に揃っている。

---

## 8. 実装上の申し送り（次に触る人へ）

### 動作を確認した内容（実測値）

`npm run build` → `_site/` を静的サーバで配信して計測（開発サーバではなく本番ビルド）。

| 確認項目 | 結果 |
|---|---|
| 375px でページ全体が横スクロールしないか | `documentElement.scrollWidth 375 / clientWidth 375`。**発生しない** |
| 375px で「逃げ場のないはみ出し」があるか | 0件（はみ出しは全て `.figure__scroll` などの内側） |
| 対比型が 375px で横並びを維持し、図の内側でスクロールするか | 13点すべて `flex-direction: row`、案内文 `display: block`。はみ出し量 12〜639px |
| 非対比型が 375px で縦積みになるか | 16点すべて `flex-direction: column`、内側スクロール 0件 |
| 区切りラベル（VS）が 375px でも残るか | 4点すべて `content` あり（`"→"` `"VS"` `"sort() ↓"`） |
| 1280px で崩れないか | ページ横スクロールなし。継承ツリーの連結線の中心が子カードの中心と一致（429/633/836） |
| 901px（`wide` の境界）で溢れないか | `wide` の図は 27〜859px、`clientWidth 886` に対し左右 27px の余裕 |
| 641px（畳む境界の外側）| 横並び維持・案内文なし・ページ横スクロールなし |
| コードブロックへの干渉 | 図の外は `margin -16px / radius 0`（`code.css` のまま）、図の中だけ `margin 0 / radius 8px`。`pre` の背景・フォント・トークン色は同一 |
| 図の中の webp 画像 | `currentSrc = hero-320.webp`（209×224）で読み込み成功。`png` は未作成でも問題なし |
| 画像が読めないときの枠 | 差し替え前後で `64×64` のまま（**構造が崩れない**） |

### 見た目の目視確認ができていない

**スクリーンショットが取得できなかった**（検証環境の Browser ペインが非表示で
"not compositing frames" になる。`decisions.md` 2026-07-31 の申し送りと同じ症状）。
上の確認はすべて**計算スタイルと DOM 計測**によるもので、**配色や余白の印象・
図としての読みやすさは人の目で一度見る必要がある。**
`_site/figure-gallery.html` を通常のブラウザで開いて確認してほしい。

とくに見てほしい箇所:

- **カプセル図**の窓口が枠線にまたがって見えるか（幾何計算では straddle を確認済み）
- **付箋の散乱**の回転量（±8度以内）が「散らばっている」に見えるか
- **並行配列の縦の点線**が「同じ添字が同じ人」に見えるか
- **対比型の端のグラデーションと影**が「まだ続きがある」と伝わるか
- 立ち絵（4rem＝64px）が小さすぎないか

### 検証環境の落とし穴

- `loading="lazy"` の画像は、非表示のペインでは**永久に読み込まれない**
  （交差判定が走らないため）。`naturalWidth === 0` を見て「画像が壊れている」と
  判断しないこと。`loading` を外せば読み込まれることを確認済み。
- `npm start`（開発サーバ）では Prism のハイライトが消えて見える。検証は
  `npm run build` した `_site/` を静的サーバで配信して行う。
- `@media (max-width: 640px)` の中の `opacity` が効かない事例が報告されているため、
  **案内文の出し入れは `display` で書いてある。** ここを `opacity` に書き換えないこと。

### 実装で踏んだ落とし穴（同じ間違いを繰り返さないために）

1. **`.figure .figure__hint`** と書くと、入れ子の内側だけでなく**自分自身の案内文**も
   消える（案内文は figure の子なので、自分の figure が祖先として一致してしまう）。
   → `.figure .figure > .figure__hint` に限定した。
2. **カードの右上バッジを `right: -8px`** に置くと、縦積みのときカードが横いっぱいに
   伸びるので図が 6px 横スクロールする。→ 枠の内側に入れた。
3. **矢印の三角を `right: -1px`** に置くと 1px はみ出して横スクロールが出る。→ `0` にした。
4. **擬似要素は親の属性を読めない**ので `content: attr(data-vs)` は使えない。
   → `--fig-vs:'VS'` のカスタムプロパティを渡し、`content: var(--fig-vs)` で読んでいる。
5. **paired shortcode の中身は Markdown として解釈される**（`.md` では Nunjucks →
   markdown-it の順に処理されるため）。**本体の前後に空行を出すのが条件。**
   逆にデータ駆動の部品の出力に空行を入れると HTML ブロックが切れて `<p>` に包まれる。

### 既存ファイルへの変更要望（このライブラリでは触っていない）

**いずれも必須ではない。** 現状のまま動いている。

1. `src/assets/css/tokens.css` — 図の中で「意味を持つ第3の色」が必要になったら
   `--c-info` / `--c-action` に続く概念色を1つ足す余地がある（現状は `--c-gold` を
   「ここに注目」の機能色として流用している）。**予約の2色は変えないこと。**
2. `.eleventy.js` — 変更不要。`config/shortcodes.js` は自動で読み込まれている。
3. `src/_data/site.json` — 見本ページ（`figure-gallery.html`）は**意図的に未登録**。
   本番公開前に `src/_figure-gallery.md` を削除するかどうかの判断が必要。
