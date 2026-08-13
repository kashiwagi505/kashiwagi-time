---
layout: layouts/base.njk
title: 図解部品の見本（開発用）
bodyClass: page-gallery
eleventyExcludeFromCollections: true
---

<div class="lesson__body prose">

<div class="note note--warn">
<span class="note__title">これは開発用のページです（本番公開時に外す想定）</span>
<code>src/_figure-gallery.md</code> を削除するか <code>permalink: false</code> にすれば出力されなくなります。
サイトのナビゲーションからはリンクしていません（<code>_data/site.json</code> にも登録していません）。
部品の仕様と各回の図との対応は <code>site/docs/figures.md</code> にあります。
</div>

# 図解部品の見本

`config/shortcodes.js` と `assets/css/figures.css` の全部品。
各回のページを書くときは、この見本の書き方をコピーして中身を差し替える。

## 目次

- 全体の約束（対比型／非対比型・凡例・幅）
- 1 カード `cards` ／ 2 クラス枠 `classbox` ／ 3 カプセル図 `capsule` ／ 4 付箋 `notes`
- 5 リストの列 `listrow` ／ 6 継承ツリー `tree` ／ 7 ✕バッジ `mark` ／ 8 コード↔出力 `codeout`
- 9 左右対比 `compare` ／ 10 まとめ3ステップ `steps` ／ 11 1入力→N出力 `fanout`
- 追加部品（`parallel` `flow` `box` `codeline` `fig` `chara` `ct` `arrow`）
- スマホでの畳み方の確認 ／ コードブロックとの同居の確認

---

## 全体の約束

### 対比型（`figure--hold`）と非対比型（`figure--stack`）

決定3の実装。**部品ごとに既定が決まっている**ので、ふつうは何も指定しなくてよい。

| 既定 | 部品 | 640px 以下のふるまい |
|---|---|---|
| 対比型 | `compare` `codeout` `listrow` `flow` `parallel` | 横並びを維持し、入らなければ**図の内側で横スクロール**。案内文が出る |
| 非対比型 | `cards` `classbox` `capsule` `notes` `tree` `steps` `fanout` `fig` `codeline` | **縦積み**になる |

変えたいときだけ `{ fit:"hold" }` / `{ fit:"stack" }` を渡す。
**対比型の中に入れた非対比型の部品は横並びのまま残る**（入れ子でも壊れない）。

### 凡例 `legend`

★**黄＝情報／青＝動作の色分けを使う図には必ず付ける。**
もとは口頭説明（第1回の発表者ノート）だったものなので、Web では凡例が代わりになる。

{% usage %}{% raw %}
{% legend %}                        黄＝情報 ／ 青＝動作（既定）
{% legend "info,action,x" %}        ✕バッジの説明も足す
{% legend ["private","gate"] %}     カプセル図用
{% cards [...], { legend:true } %}  図の中に埋め込む（どの部品でも使える）
{% endraw %}{% endusage %}

{% legend %}

{% legend "info,action,x,dim" %}

{% legend ["private","gate"] %}

### 幅

`{ wide:true }` を付けると、**901px 以上でだけ**本文幅（736px）より左右 48px ずつ広く出る。
900px 以下では余白が無いので広げない（ページ全体が横スクロールしないため）。

---

## 1 カード `cards`

**何の図か** — キャラ1体分のオブジェクト（名前・ステータス）。**最も広く使われる基礎部品。**
**使う回** — 1・4・5・6・7 ／ **非対比型**（640px 以下で縦積み）

{% usage %}{% raw %}
{% cards [
  { "chara":"hero", "name":"たかぎ", "role":"Human", "stats":{ "身長":"170cm", "体重":"60kg" } },
  { "chara":"wizard", "name":"れん", "role":"Human", "stats":{ "身長":"165cm", "体重":"55kg" } }
], { "caption":"設計図は1つ、実体はいくつでも作れる" } %}
{% endraw %}{% endusage %}

{% cards [
  { "chara":"hero", "name":"たかぎ", "role":"Human", "stats":{ "身長":"170cm", "体重":"60kg" } },
  { "chara":"wizard", "name":"れん", "role":"Human", "stats":{ "身長":"165cm", "体重":"55kg" } },
  { "chara":"tank", "name":"りょう", "role":"Human", "stats":{ "身長":"180cm", "体重":"75kg" } }
], { "caption":"設計図は1つ、実体はいくつでも作れる（第1回 図C・図E）" } %}

### カードのオプション

`badge` `mark` `dim` `tone` `note` `bar` `lines` `empty`。
`bar` は同じ部品で「ふつう／0でぴったり止まる／枠を突き抜ける」の3状態を作れる（第3回 図C）。

{% usage %}{% raw %}
{% cards [
  { "chara":"hero",  "name":"勇者",  "badge":"NEW!", "bar":{ "label":"HP", "value":120, "max":120 } },
  { "chara":"saint", "name":"聖女",  "bar":{ "label":"HP", "value":0, "max":120, "stop":true }, "note":"0で止まった" },
  { "chara":"tank",  "name":"タンク", "mark":"x", "dim":true, "note":"名簿から外れた" },
  { "empty":true, "name":"？" }
] %}
{% endraw %}{% endusage %}

{% cards [
  { "chara":"hero",  "name":"勇者",  "badge":"NEW!", "bar":{ "label":"HP", "value":120, "max":120 } },
  { "chara":"saint", "name":"聖女",  "bar":{ "label":"HP", "value":0, "max":120, "stop":true }, "note":"0で止まった" },
  { "chara":"wizard", "name":"魔法使い", "bar":{ "label":"HP", "value":-30, "max":120 }, "tone":"danger", "note":"0を割った" },
  { "chara":"tank",  "name":"タンク", "mark":"x", "dim":true, "note":"名簿から外れた" },
  { "empty":true }
] %}

---

## 2 クラス枠 `classbox`

**何の図か** — クラスの箱を「情報（黄）」「動作（青）」の2段に区切ったもの。
**使う回** — 1・3・5・6・7 ／ **非対比型**

{% usage %}{% raw %}
{% classbox {
  "name":"Human", "note":"設計図（クラス）",
  "fields":["name", "height", "weight"],
  "methods":["walk()", "talk()"],
  "legend":true
} %}
{% endraw %}{% endusage %}

{% classbox {
  "name":"Human", "note":"設計図（クラス）",
  "fields":["name", "height", "weight"],
  "methods":["walk()", "talk()"],
  "legend":true,
  "caption":"クラス＝情報と動作をひとまとめにした設計図（第1回 図B）"
} %}

配列を渡すと横並びになる（第5回スライド3「全員バラバラのクラスだと…」）。

{% classbox [
  { "name":"Hero", "chara":"hero", "fields":["name","hp","atk"], "methods":["attack()"], "foot":"同じ3つを何度も書いている" },
  { "name":"Wizard", "chara":"wizard", "fields":["name","hp","atk"], "methods":["attack()"], "foot":"同じ3つを何度も書いている" },
  { "name":"Tank", "chara":"tank", "fields":["name","hp","atk"], "methods":["attack()"], "foot":"同じ3つを何度も書いている" }
], { "legend":true, "wide":true, "caption":"共通部分が3か所に散っている（第5回スライド3）" } %}

---

## 3 カプセル図 `capsule`

**何の図か** — private の中身と、枠線にまたがる窓口メソッド。**第3回の中心。**
**使う回** — 3・5・7 ／ **非対比型**（640px 以下では窓口が下の枠線にまたがる形に変わる）

{% usage %}{% raw %}
{% capsule {
  "name":"Hero", "chara":"hero",
  "inside":[ { "t":"hp", "value":"120" }, { "t":"name", "value":"ゆいたろう" } ],
  "gates":[ "getHp()", "setHp(int hp)" ],
  "outside":"外のコード", "outsideChara":"assassin",
  "legend":["private","gate"]
} %}
{% endraw %}{% endusage %}

{% capsule {
  "name":"Hero", "chara":"hero",
  "inside":[ { "t":"hp", "value":"120" }, { "t":"name", "value":"ゆいたろう" } ],
  "gates":[ "getHp()", "setHp(int hp)" ],
  "outside":"外のコード", "outsideChara":"assassin",
  "legend":["private","gate"],
  "wide":true,
  "caption":"中身には直接触れない。出入りは窓口メソッドだけを通る（第3回 図A）"
} %}

`direct:true` にすると「窓口を通らずに中身をいじれてしまう」図になる（第3回 図Bの左側）。

{% capsule {
  "name":"Hero", "chara":"hero",
  "inside":[ { "t":"hp", "value":"-30", "tone":"danger" } ],
  "outside":"外のコード", "outsideChara":"assassin",
  "direct":true,
  "caption":"public だと、ありえない値でも外から書き込めてしまう"
} %}

---

## 4 付箋 `notes`

**何の図か** — 黄＝情報／青＝動作の付箋。散乱状態と整列状態の両方。
**使う回** — 1・3 ／ **非対比型**（凡例が既定でON）

{% usage %}{% raw %}
{% notes [
  { "t":"たかぎ" }, { "t":"170cm" }, { "t":"歩く", "kind":"action" }
], { "scatter":true, "caption":"…" } %}
{% endraw %}{% endusage %}

{% notes [
  { "t":"たかぎ" }, { "t":"170cm" }, { "t":"歩く", "kind":"action" }, { "t":"60kg" },
  { "t":"しゃべる", "kind":"action" }, { "t":"れん" }, { "t":"165cm" }, { "t":"走る", "kind":"action" }
], { "scatter":true, "caption":"散らばっていると「誰の情報か」が分からない（第1回 図A・左）" } %}

{% notes [
  { "t":"name" }, { "t":"height" }, { "t":"weight" },
  { "t":"walk()", "kind":"action" }, { "t":"talk()", "kind":"action" }
], { "caption":"整列すると意味が出る（第1回 図A・右）" } %}

---

## 5 リストの列 `listrow`

**何の図か** — 横一列＋インデックス番号。
**使う回** — 4・6 ／ **対比型**（添字の対応が本質なので横並びを維持し、入らなければ横スクロール）

{% usage %}{% raw %}
{% listrow {
  "type":"ArrayList<Adventurer>",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"tank", "name":"タンク" }
  ],
  "plus":true
} %}
{% endraw %}{% endusage %}

{% listrow {
  "type":"ArrayList<Adventurer>",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"tank", "name":"タンク" },
    { "chara":"saint", "name":"聖女" },
    { "chara":"archer", "name":"弓使い" }
  ],
  "plus":true,
  "wide":true,
  "caption":"親の型のリストに、子クラスの実体を並べて入れられる（第6回スライド4）"
} %}

`fixed:true` `slots:3` で「定員が決まった配列」になる。`mark` `dim` で離脱を表せる（第4回スライド6）。

{% listrow {
  "type":"Adventurer[] party = new Adventurer[3];",
  "fixed":true, "slots":3,
  "items":[ { "chara":"hero", "name":"勇者" }, { "chara":"wizard", "name":"魔法使い" } ],
  "note":"定員3名。4人目は入れられない",
  "caption":"配列は枠の数が決まっている（第4回スライド2・左）"
} %}

{% listrow {
  "type":"party.remove(1);",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"tank", "name":"タンク", "mark":"x", "dim":true },
    { "chara":"saint", "name":"聖女", "arrowNote":"1つ前へ詰まる" }
  ],
  "caption":"削除すると後ろの要素の添字が詰め直される（第4回・口頭で補っていた図）"
} %}

---

## 6 継承ツリー `tree`

**何の図か** — 親→子の線。3段以上・`implements` バッジにも対応。
**使う回** — 5・6・7 ／ **非対比型**（640px 以下では「左に幹、右に子」の形に切り替わる）

{% usage %}{% raw %}
{% tree {
  "root":{ "name":"Adventurer", "note":"親（共通部分）", "fields":["name","hp","atk"], "methods":["attack()"] },
  "children":[
    { "name":"Hero", "chara":"hero", "methods":[ { "t":"attack() @Override" } ] },
    { "name":"Wizard", "chara":"wizard", "methods":[ { "t":"attack() @Override" } ] }
  ],
  "edge":"extends"
} %}
{% endraw %}{% endusage %}

{% tree {
  "root":{ "name":"Adventurer", "note":"親（共通部分）", "fields":["name","hp","atk"], "methods":["attack()"] },
  "children":[
    { "name":"Hero", "chara":"hero", "methods":[ { "t":"attack() @Override" } ] },
    { "name":"Wizard", "chara":"wizard", "methods":[ { "t":"attack() @Override" } ] },
    { "name":"Tank", "chara":"tank", "methods":[ { "t":"attack() @Override" } ] }
  ],
  "edge":"extends",
  "legend":true, "wide":true,
  "caption":"共通部分は親に置き、違うところだけ子で上書きする（第5回スライド4）"
} %}

3段（孫クラス）と `implements`（親は1つ・装備はいくつでも）。

{% tree {
  "root":{
    "name":"Adventurer", "note":"抽象クラス", "stereotype":"abstract",
    "children":[
      { "name":"Hero", "chara":"hero", "implements":["Excalibur","Flyable","Healable","Cookable"],
        "children":[ { "name":"Arthur", "note":"孫クラス" } ] },
      { "name":"Wizard", "chara":"wizard", "children":[ { "name":"Merlin", "note":"孫クラス" } ] }
    ]
  },
  "edge":"extends",
  "wide":true,
  "caption":"extends は1本だけ、implements はいくつでも（第7回スライド9・第5回の新規図1）"
} %}

---

## 7 ✕バッジ／STOP `mark`

**何の図か** — 「できないこと」の表示。単体でも、カード・クラス枠・セルの中でも使える。
**使う回** — 1・3・5・7 ／ **行内の小物**（畳み方の対象外）

{% usage %}{% raw %}
{% mark "x" %}  {% mark "o" %}  {% mark "stop" %}  {% mark "q" %}  {% mark "new" %}
{% endraw %}{% endusage %}

行内で使うとこうなる → できない {% mark "x" %} ／ できる {% mark "o" %} ／
ここで止まる {% mark "stop" %} ／ 職業不明 {% mark "q" %} ／ 追加 {% mark "new" %}

`tone:"danger"` のパネルと組み合わせると「うまくいかない例」の枠になる。

{% compare { "vs":"→", "caption":"抽象クラスは new できないが、型としては使える（第7回 B-1）" } %}
{% panel "できない", { "tone":"danger", "mark":"x" } %}
{% box "Adventurer a = new Adventurer();", { "tone":"danger" } %}
「冒険者」そのものは概念なので、実体にはなれない。
{% endbox %}
{% endpanel %}
{% panel "できる", { "tone":"ok", "mark":"o" } %}
{% box "Adventurer a = new Hero();", { "tone":"ok" } %}
左辺（**型**）は冒険者でよい。右辺（**実体**）が勇者なら作れる。
{% endbox %}
{% endpanel %}
{% endcompare %}

---

## 8 コード↔出力の2列 `codeout`

**何の図か** — 左にコード、右に実行結果。**対比型。**
**使う回** — 2・6・7

★**中身には `java` / `text` のコードブロック（フェンス記法）をそのまま書ける**
（`codeblocks.js` の枠・行番号・コピーボタンがそのまま効く）。

{% usage %}{% raw %}
{% codeout %}
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
{% endraw %}{% endusage %}

{% codeout { "wide":true, "caption":"同じ呼び出しなのに、中身のクラスごとに違う結果になる（第6回スライド6）" } %}
{% panel "コード", { "sub":"呼び出しは1種類だけ" } %}
```java nonum
for (Adventurer a : party) {
    a.attack();
}
```
{% endpanel %}
{% panel "実行結果", { "sub":"3人ぶんの別々の出力" } %}
```text
勇者 ゆいたろうの攻撃！ 渾身の斬撃！
魔法使い ゆいの攻撃！ ファイアボール！
タンク けんの攻撃！ 盾で殴る！
```
{% endpanel %}
{% endcodeout %}

---

## 9 左右対比（Before/After）`compare`

**何の図か** — 2つを並べて見比べる図。**全7回でいちばん数が多い型。**
**使う回** — 1・2・3・4・5 ／ **対比型**（★区切りラベルは 375px でも必ず残る）

{% usage %}{% raw %}
{% compare { "vs":"VS", "caption":"…" } %}
{% panel "Before", { "sub":"配列", "tone":"danger" } %}
（中身は Markdown で書ける。他の部品を入れてもよい）
{% endpanel %}
{% panel "After", { "sub":"ArrayList", "tone":"ok" } %}
…
{% endpanel %}
{% endcompare %}
{% endraw %}{% endusage %}

{% compare { "wide":true, "caption":"枠の数が決まっている配列と、いくらでも増える ArrayList（第4回スライド2）" } %}
{% panel "配列", { "sub":"定員が決まっている", "tone":"danger" } %}
{% listrow { "fixed":true, "slots":3, "items":[ { "chara":"hero", "name":"勇者" }, { "chara":"wizard", "name":"魔法使い" }, { "chara":"saint", "name":"聖女" } ], "note":"4人目は入れられない" } %}
{% endpanel %}
{% panel "ArrayList", { "sub":"あとから増やせる", "tone":"ok" } %}
{% listrow { "items":[ { "chara":"hero", "name":"勇者" }, { "chara":"wizard", "name":"魔法使い" }, { "chara":"saint", "name":"聖女" } ], "plus":true } %}
{% endpanel %}
{% endcompare %}

### 上下対比 `axis:"v"` ＋ `cols`

**第4回スライド9（4体×2段＝8体、全7回で最も崩れる図）用。**
2段を1つのスクロール領域に入れ、`cols` で両段の列幅をそろえるので、
横スクロールしても Before と After の対応が縦にそろったまま追える。

{% usage %}{% raw %}
{% compare { "axis":"v", "cols":4, "vs":"sort() ↓" } %}
{% panel "Before" %}{% cards [ … 4枚 … ] %}{% endpanel %}
{% panel "After"  %}{% cards [ … 4枚 … ] %}{% endpanel %}
{% endcompare %}
{% endraw %}{% endusage %}

{% compare { "axis":"v", "cols":4, "vs":"sort() ↓", "wide":true, "caption":"Lv 順に並べ替える。列がそろっているので、どのカードがどこへ動いたか追える（第4回スライド9）" } %}
{% panel "Before", { "sub":"名簿に入れた順" } %}
{% cards [
  { "chara":"wizard", "name":"魔法使い", "stats":{ "Lv":"45" } },
  { "chara":"hero", "name":"勇者", "stats":{ "Lv":"12" } },
  { "chara":"saint", "name":"聖女", "stats":{ "Lv":"30" } },
  { "chara":"archer", "name":"弓使い", "stats":{ "Lv":"7" } }
] %}
{% endpanel %}
{% panel "After", { "sub":"Lv の小さい順", "tone":"ok" } %}
{% cards [
  { "chara":"archer", "name":"弓使い", "stats":{ "Lv":"7" } },
  { "chara":"hero", "name":"勇者", "stats":{ "Lv":"12" } },
  { "chara":"saint", "name":"聖女", "stats":{ "Lv":"30" } },
  { "chara":"wizard", "name":"魔法使い", "stats":{ "Lv":"45" } }
] %}
{% endpanel %}
{% endcompare %}

---

## 10 まとめ3ステップ `steps`

**何の図か** — 3段の流れ。各回の最後のまとめ。
**使う回** — 1・3・6・7 ／ **非対比型**

{% usage %}{% raw %}
{% steps [
  { "t":"散らばっている", "d":"どれが誰の情報か分からない" },
  { "t":"設計図にまとめる", "d":"情報と動作をクラスに入れる" },
  { "t":"実体をつくる", "d":"new でいくつでも作れる" }
] %}
{% endraw %}{% endusage %}

{% steps [
  { "t":"散らばっている", "d":"どれが誰の情報か分からない" },
  { "t":"設計図にまとめる", "d":"情報と動作をクラスに入れる" },
  { "t":"実体をつくる", "d":"new でいくつでも作れる", "chara":"hero" }
], { "wide":true, "caption":"第1回のまとめ（図F）" } %}

---

## 11 1入力→N出力の分岐図 `fanout`

**何の図か** — 同じ1つの呼び出しから、中身のクラスごとに違う結果が出る。
**全7回で唯一の新規の型**（第6回スライド8）／ **非対比型**（縦積みでも「1つの入口」が残るよう幹の線は残す）

{% usage %}{% raw %}
{% fanout {
  "input":{ "t":"a.attack()", "sub":"押すボタンは1つだけ" },
  "outputs":[
    { "chara":"hero", "name":"Hero", "t":"渾身の斬撃！" },
    { "chara":"wizard", "name":"Wizard", "t":"ファイアボール！" }
  ]
} %}
{% endraw %}{% endusage %}

{% fanout {
  "input":{ "t":"a.attack()", "sub":"押すボタンは1つだけ" },
  "outputs":[
    { "chara":"hero", "name":"Hero", "t":"渾身の斬撃！" },
    { "chara":"wizard", "name":"Wizard", "t":"ファイアボール！" },
    { "chara":"tank", "name":"Tank", "t":"盾で殴る！" }
  ],
  "note":"どれが動くかは「変数の型」ではなく「中身のクラス」で決まる",
  "wide":true,
  "caption":"ポリモーフィズム＝同じボタンで、それぞれの動きになる（第6回スライド8）"
} %}

---

# 追加部品

11種では表しきれない図のために足したもの。

## 12 並行配列＋添字の対応 `parallel`

**第1回 図D（この回の山場）専用。** 3列の添字対応が本質なので、**常に横並び＋横スクロール**。
縦積みにすると「同じ添字が同じ人」という対応そのものが消えるため、畳む選択肢を持たせていない。

{% usage %}{% raw %}
{% parallel {
  "rows":[
    { "label":"name[]",   "cells":["たかぎ","れん","りょう"] },
    { "label":"height[]", "cells":[ { "t":"165", "bad":true }, "170", "180" ] },
    { "label":"weight[]", "cells":["60","55","75"] }
  ],
  "colNotes":["たかぎが165cm？", "", ""]
} %}
{% endraw %}{% endusage %}

{% parallel {
  "rows":[
    { "label":"name[]",   "cells":["たかぎ","れん","りょう"] },
    { "label":"height[]", "cells":["170","165","180"] },
    { "label":"weight[]", "cells":["60","55","75"] }
  ],
  "caption":"同じ添字が同じ人を指している（第1回 図D・Before）"
} %}

{% parallel {
  "rows":[
    { "label":"name[]",   "cells":["たかぎ","れん","りょう"] },
    { "label":"height[]", "cells":[ { "t":"165", "bad":true }, { "t":"170", "bad":true }, "180" ] },
    { "label":"weight[]", "cells":["60","55","75"] }
  ],
  "colNotes":["たかぎが165cm？","れんが170cm？",""],
  "caption":"身長の列だけ並べ替えると、名前との対応が壊れる（第1回 図D・After）"
} %}

## 13 流れ・ループ `flow`

矢印でつなぐ処理の流れ。条件つきの矢印とループも書ける（第3回 図C、第4・6回のバトルループ）。
**対比型**（矢印が横向き前提なので横並びを維持する）。

{% usage %}{% raw %}
{% flow [
  { "t":"HP 20", "bar":{ "label":"HP", "value":20, "max":120 } },
  { "t":"HP = -30", "arrow":"damage(-50)", "tone":"danger", "mark":"x" }
], { "loop":"倒れたら名簿から削除して次のターンへ" } %}
{% endraw %}{% endusage %}

{% flow [
  { "chara":"hero", "t":"HP 20", "bar":{ "label":"HP", "value":20, "max":120 } },
  { "t":"HP = -30", "arrow":"damage(-50)", "tone":"danger", "mark":"x", "bar":{ "label":"HP", "value":-30, "max":120 } }
], { "wide":true, "caption":"public だと、ありえない値がそのまま入る（第3回スライド7）" } %}

{% flow [
  { "chara":"hero", "t":"HP 20", "bar":{ "label":"HP", "value":20, "max":120 } },
  { "chara":"tank", "t":"setHp() が受け取る", "arrow":"damage(-50)", "tone":"action", "d":"門番として値を検査する" },
  { "t":"HP = 0", "arrow":"if (hp < 0)", "arrowTone":"action", "tone":"ok", "bar":{ "label":"HP", "value":0, "max":120, "stop":true } },
  { "t":"敗北の処理へ", "tone":"mute" }
], { "loop":"次のターンへ", "wide":true, "caption":"setter が不正な値を止める（第3回スライド8・図C）" } %}

## 14 ラベル付きの箱 `box`

**入れ子にできる汎用の枠。** 11種に無い形（型の箱の中に実体が入る入れ子図、機械の箱、リスト枠）は
これを組み合わせて作る。**中身は Markdown。**

> **⚠ この図に概念色（`info` / `action`）を使わないこと。**
> `--c-info`（黄）は**情報＝フィールド**、`--c-action`（青）は**動作＝メソッド**として
> 全7回で予約されている（`figures.md` 3章）。型と実体の入れ子にこの2色を使うと意味が衝突し、
> `legend:true` を付けると「黄＝情報／青＝動作」という無関係な凡例が出て誤解を招く。
> **外側は tone なし、注目させたい内側だけ `gold`、legend は付けない。**

{% usage %}{% raw %}
{% box "Adventurer a", { "sub":"変数の型 ── 呼べる範囲を決める" } %}
{% box "中身は Wizard", { "sub":"実行時のクラス ── どう動くかを決める", "tone":"gold" } %}
…
{% endbox %}
{% endbox %}
{% endraw %}{% endusage %}

{% fig { "wide":true, "caption":"呼べるか＝変数の型／どう動くか＝中身のクラス（第6回の新規図1）" } %}
{% box "Adventurer a", { "sub":"変数の型 ── 呼べる範囲を決める", "note":"a.attack() は呼べる。a.heal() は「Adventurer に無い」ので呼べない" } %}
{% box "中身は Wizard", { "sub":"実行時のクラス ── どう動くかを決める", "tone":"gold", "note":"実際に動くのは Wizard の attack()" } %}
{% cards [ { "chara":"wizard", "name":"Wizard", "lines":["attack() を上書き","heal() を追加"] } ] %}
{% endbox %}
{% endbox %}
{% endfig %}

## 15 コード1行の中を指す図 `codeline` ＋ `ct`

Prism の行強調では1行の中の左右を色分けできないので、この1行だけ別枠にする（第2回 図D）。
**コードブロック（暗色）とは見た目をはっきり分けてある。**

{% usage %}{% raw %}
{% codeline { "notes":[
  { "t":"このオブジェクトが持っている name（フィールド）", "tone":"info" },
  { "t":"引数として受け取った name", "tone":"gold" }
] } %}
this.{% ct "name", "info" %} = {% ct "name", "gold" %};
{% endcodeline %}
{% endraw %}{% endusage %}

{% codeline { "notes":[
  { "t":"このオブジェクトが持っている name（フィールド）", "tone":"info" },
  { "t":"引数として受け取った name", "tone":"gold" }
], "caption":"左右で指しているものが違う（第2回 図D）" } %}
this.{% ct "name", "info" %} = {% ct "name", "gold" %};
{% endcodeline %}

## 16 一点物の外枠 `fig` ／ 立ち絵 `chara` ／ 矢印 `arrow`

`fig` は部品に当てはまらない図を組むための外枠。`caption` `legend` `wide` `fit` が使える。

{% usage %}{% raw %}
{% fig { "fit":"hold", "caption":"…" } %}
（自由なHTML・Markdown・他の部品）
{% endfig %}

{% chara "hero" %}                        立ち絵1点（既定は 4rem 角）
{% chara "excalibur", { "size":"l" } %}   アイテム。s / m / l
{% arrow { "dir":"down", "label":"super()" } %}
{% endraw %}{% endusage %}

{% fig { "caption":"立ち絵の一覧（画像がまだ無い場合は枠と alt 文字だけが出る）" } %}
<div class="fig-row fig-row--wrap">
{% chara "hero" %}{% chara "wizard" %}{% chara "tank" %}{% chara "saint" %}{% chara "archer" %}
{% chara "maou" %}{% chara "assassin" %}{% chara "priest" %}{% chara "silhouette" %}{% chara "hero-excalibur" %}
{% chara "excalibur" %}{% chara "magic-circle" %}
</div>
{% endfig %}

矢印は横向き・下向き・左向き： {% arrow { "label":"extends" } %} {% arrow { "dir":"down", "label":"super()" } %} {% arrow { "dir":"left", "tone":"danger" } %}

---

# 確認用

## 狭い幅での対比型のふるまい

下の枠は幅 340px に固定してある（375px のスマホの本文幅とほぼ同じ）。
**枠からはみ出さず、図の内側だけが横スクロールする**こと、
**区切りラベルが残っている**ことを確認する。

<div style="max-width: 340px; padding: var(--sp-2); border: 2px dashed var(--c-border-strong); border-radius: var(--radius-m); overflow: hidden;">

{% compare { "caption":"幅 340px でも横並びのまま。図の内側で横スクロールする" } %}
{% panel "Before", { "tone":"danger" } %}
{% listrow { "fixed":true, "slots":3, "items":[ { "chara":"hero", "name":"勇者" } ] } %}
{% endpanel %}
{% panel "After", { "tone":"ok" } %}
{% listrow { "items":[ { "chara":"hero", "name":"勇者" } ], "plus":true } %}
{% endpanel %}
{% endcompare %}

{% parallel { "rows":[
  { "label":"name[]", "cells":["たかぎ","れん","りょう"] },
  { "label":"height[]", "cells":["170","165","180"] }
] } %}

</div>

同じ枠に非対比型を入れると縦積みになる。

<div style="max-width: 340px; padding: var(--sp-2); border: 2px dashed var(--c-border-strong); border-radius: var(--radius-m); overflow: hidden;">

{% cards [
  { "chara":"hero", "name":"勇者", "stats":{ "Lv":"12" } },
  { "chara":"wizard", "name":"魔法使い", "stats":{ "Lv":"45" } }
] %}

</div>

## コードブロックとの同居

図解CSSは `code.css` の後に読み込まれる。**下のコードブロックが通常表示のままである**ことを確認する
（暗色の地・ハイライト・行番号・コピーボタン・「実行結果」の枠）。

```java file=Hero.java hl=4
public class Hero extends Adventurer {
    @Override
    public void attack() {
        System.out.println(getName() + "の攻撃！ 渾身の斬撃！");
    }
}
```

```text
勇者 ゆいたろうの攻撃！ 渾身の斬撃！
```

```java error
Adventurer a = new Adventurer();
```

```text pseudo
もし 手に持っているものが 聖剣 なら
    聖なる一撃 を出す
```

図の中に置いたコードブロック（`codeout` の例）でも、枠の色と余白だけが図に合わせて調整され、
**ハイライトの配色には触っていない**。

</div>
