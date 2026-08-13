---
order: 4
---
<!--
  本文執筆済み（2026-08-05）。
    設計図      : 00_research/02_content/per-session/session-04.md
    決定        : 00_research/06_decisions/decisions.md 2026-07-31（決定1・3・5／運用細則／図解決定3）
    図解部品    : site/docs/figures.md（6章に第4回の図と部品の対応表、9章に compare の警告）

    front matter は order: だけ。タイトル「ArrayList」・呼び名「名簿の書」・
    permalink は src/_data/site.json から自動で入る。

    この回の作りの要点:
    ・元資料の pptx に「図」は0点（画像7点はすべてキャラ立ち絵の素材）。図はすべて新規に組んだ。
      発表者ノートも無いため、解説文の一次情報は 01_KashiwagiTime/アレイリスト.md（準備メモ）。
    ・★元資料の回番号は「第1回」表記（準備メモの4回構成の番号）。ページでは第4回として書く。
    ・★左右対比の5枚の畳み方（運用細則）:
        スライド2（配列vsArrayList） → axis:"v" + cols:4（同じ3人の「持ち替え」＝変換の図）
        スライド4（add 2種）         → axis:"v" + cols:4（元スライドも上下2段だった）
        スライド6（remove 3種）      → 3枚の独立した図に分割＋直後に比較表（3方式の並列で対比ではない）
        スライド8（for 2種）         → axis:"v"（コードブロックに全幅が必要）
        スライド9（sort・8体）       → axis:"v" + cols:4（決定3のとおり。表フォールバックは作らない）
      cols を付けると .fig-list__frame / .fig-cards が grid(minmax(0,1fr)) になり、
      375px でも図の内側が横スクロールしない。
    ・★不整合の扱い: スライド9の sort 例は Adventurer::getLevel だが、配布 Adventurer.java に
      level / getLevel() が無い。演習側（getAtk）に統一した。図の Lv バッジも ATK に置き換えた。
    ・新規図1（削除後にインデックスが詰め直される）は解答例の口頭補足のみで、スライドに無い。
      javac 実機で IndexOutOfBoundsException を再現して裏を取ってから書いた。
-->

<h2 class="part">第1部 直感的につかむ</h2>

### この回でできるようになること

- 普通の配列との違いを言えて、「何人になるか分からない」場面で <span class="term">ArrayList</span> を選べる。
- やりたいことから使うメソッドを引ける（追加・取得・更新・削除・人数確認・検索・並び替え）。
- 拡張for文でリスト全体をめぐり、取り出した**オブジェクトのメソッド**を呼べる。

### 勇者一行で例えると

この回から、勇者一行が題材の本体になります。ArrayList は **勇者一行の名簿**です。
旅の途中で仲間が増えたり抜けたりする、順番のある一列 ── それがそのまま ArrayList の姿です。

{% listrow {
  "type":"ArrayList<Adventurer> heroList",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"saint", "name":"聖女" }
  ],
  "plus":true,
  "wide":true,
  "note":"仲間が増えても、名簿の側を作り直さなくてよい",
  "caption":"名簿は順番のある一列。先頭は0番から数える。人数を最初に決めていないので、あとから何人でも足せる"
} %}

旅の仲間が最終的に何人になるかは、旅立つ時点では分かりません。
**分からないものを最初に決めなくていい**、というのがこの回の中心です。

<div class="note note--hint">
<span class="note__title">ここから第7回までは、ひとつづきのプロジェクトです</span>

第4回から第7回は「勇者一行のチャレンジプロジェクト」として、**同じコードを育てていきます。**

- **第4回（この回）** 勇者一行の**名簿**を作る ── ArrayList
- **第5回** 職業ごとの違いを**親子関係**で表す ── 継承・オーバーライド
- **第6回** 全員をまとめて**同じ命令**で動かす ── ポリモーフィズム
- **第7回** 「実装したくないクラス」と**装備**を扱う ── 抽象クラス・インターフェイス

この回で作る `ArrayList<Adventurer>` は、そのまま第6回の主題になります。

</div>

[第1回](01-class.html)の第2問を覚えているでしょうか。走者を `Runner[] runners = new Runner[10]`
という**長さ10の配列**で受け取り、実際に入力された件数は `count` という別の変数で管理していました。
入れ物の大きさと中身の件数が別々になっていて、10人を超える入力は受け付けられません。
**この不便を丸ごと引き受けてくれるのが ArrayList です。**

名簿に入れるのは、[第3回](03-encapsulation.html)でやったカプセル化そのままの形のクラスです。
この回で使う `Adventurer` は、`name` / `hp` / `atk` を `private` で持ち、getter / setter で出し入れします。

<div class="table-scroll">

| ArrayList の言葉 | 勇者一行での言い方 |
|---|---|
| 要素 | 仲間（冒険者） |
| インデックス | 隊列の並び順（先頭は0番） |
| `add` | 仲間が加わる／位置を指定すれば隊列への割り込み |
| `remove` | 離脱・戦闘不能 |
| `clear` | 全滅 |
| `size` / `isEmpty` | いま何人／全滅したか |
| `contains` / `indexOf` | 生存確認／どこにいるか |
| `sort` | 隊列を組み直す |
| 拡張for文 | 全員に順番に名前を呼ばせる（点呼） |

</div>

### 図解でつかむ

#### 1. 配列との違いは「長さを最初に決めるかどうか」だけ

同じ3人を持つとしても、配列と ArrayList では**枠の性質**が違います。
配列は最初に長さを決め、あとから増やせません。

{% compare { "axis":"v", "cols":4, "vs":"同じ3人を ArrayList で持つと ↓", "wide":true, "legend":["danger","ok"], "caption":"図A ── 3人を持てている点は同じ。違うのは「4人目を入れられるか」だけ。列がそろっているので、右端の枠の有無だけが差だと分かる" } %}
{% panel "普通の配列", { "sub":"定員3名 ── 最初に長さを決める", "tone":"danger", "mark":"x" } %}
{% listrow {
  "type":"Adventurer[] party = new Adventurer[3];",
  "fixed":true, "slots":3,
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"saint", "name":"聖女" }
  ],
  "note":"あとから仲間を増やせない…"
} %}
{% endpanel %}
{% panel "ArrayList", { "sub":"人数の指定なし ── 自由に増減OK", "tone":"ok", "mark":"o" } %}
{% listrow {
  "type":"ArrayList<Adventurer> heroList = new ArrayList<>();",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"saint", "name":"聖女" }
  ],
  "plus":true,
  "note":"旅の仲間が何人になるかは分からない！"
} %}
{% endpanel %}
{% endcompare %}

覚えることはこの1点です。**配列は枠の数が固定、ArrayList は固定しない。**

#### 2. 宣言のしかた ── 3つの部分に分かれている

宣言の1行は、意味のかたまりが3つ並んでいるだけです。

{% codeline { "notes":[
  { "t":"中身の型 ── この名簿に入れられるクラス", "tone":"info" },
  { "t":"リストの名前 ── 以降この名前で呼ぶ", "tone":"gold" },
  { "t":"空のリストを新しく作る", "tone":"action" }
], "wide":true, "caption":"図B ── 型・名前・作る、の3つ。< > の中が「入れる型」で、ここが第6回の要になる" } %}
ArrayList{% ct "<Adventurer>", "info" %} {% ct "heroList", "gold" %} = {% ct "new ArrayList<>()", "action" %};
{% endcodeline %}

できたての名簿は、まだ誰も入っていない状態です。

{% listrow {
  "type":"heroList",
  "items":[],
  "plus":true,
  "note":"できたてのリストはまだ0人（空っぽ）",
  "caption":"図B' ── 配列と違い、最初は枠すら無い。add した回数だけ長くなる"
} %}

#### 3. 仲間を加える ── add は2種類ある

`add` は引数の書き方で意味が変わります。**位置を指定すると、そこへ割り込みます。**

{% compare { "axis":"v", "cols":4, "vs":"heroList.add(1, tank); すると ↓", "wide":true, "caption":"図C ── 上は末尾に足す形、下は1番へ割り込む形。列がそろっているので、魔法使いが1番から2番へずれたことが縦に追える" } %}
{% panel "add(x) ── 後ろに追加", { "sub":"いちばんよく使う形" } %}
{% listrow {
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い", "badge":"NEW!" }
  ]
} %}
{% endpanel %}
{% panel "add(1, x) ── 位置を指定して割り込み", { "sub":"以降の全員が1つ後ろへずれる", "tone":"ok" } %}
{% listrow {
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"tank", "name":"タンク", "badge":"NEW!", "arrowNote":"割り込み!" },
    { "chara":"wizard", "name":"魔法使い", "arrowNote":"1つ後ろへ" }
  ]
} %}
{% endpanel %}
{% endcompare %}

別のパーティを丸ごと合流させたいときは `addAll` もあります（この回では使いません）。

```java nonum
heroList.addAll(otherList);
```

#### 4. 取得と更新 ── 番号で呼び出してから、その人に用事を言う

`get(番号)` で名簿から1人を取り出します。**取り出せるのは冒険者そのもの**なので、
名前を知りたいならその冒険者に聞き、名前を変えたいならその冒険者に頼みます。

{% codeline { "notes":[
  { "t":"① 名簿の0番から Adventurer を1人取り出す", "tone":"action" },
  { "t":"② 取り出した Adventurer に名前を聞く", "tone":"info" }
], "wide":true, "caption":"図D ── 2段構えになっている。名簿そのものは名前を知らないので、ここを1段で書くことはできない" } %}
heroList.{% ct "get(0)", "action" %}.{% ct "getName()", "info" %}
{% endcodeline %}

更新も同じ2段構えです。取り出してから、その冒険者の setter を呼びます。

{% listrow {
  "type":"heroList.get(0).setName(\"勇太\");",
  "items":[
    { "chara":"hero", "name":"勇太", "badge":"改名", "note":"0番の中身が変わった" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"saint", "name":"聖女" }
  ],
  "wide":true,
  "note":"番号（インデックス）は0から数える！",
  "caption":"図D' ── 名簿の並びは変わらない。変わったのは0番に入っている冒険者の中身だけ"
} %}

<div class="note note--warn">
<span class="note__title">名簿に名前を聞いてはいけません</span>

`heroList.setName("勇太")` とは書けません。**名簿は名前を持っていない**からです。
まず `get()` で1人取り出す ── これがこの回でいちばん多いつまずきです。

</div>

#### 5. 仲間との別れ ── remove は2種類、clear は全消去

削除は「何番目か」で指定する方法と「本人」で指定する方法があります。

{% listrow {
  "type":"heroList.remove(1);",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い", "mark":"x", "dim":true, "arrowNote":"1番が離脱" }
  ],
  "wide":true,
  "title":"① 番号で指定 ── remove(int index)",
  "caption":"図E-1 ── 「1番の人」を消す。誰がそこに居るかは見ていない"
} %}

{% listrow {
  "type":"heroList.remove(tank);",
  "items":[
    { "chara":"tank", "name":"タンク", "mark":"x", "dim":true, "arrowNote":"オブジェクトで探して離脱" },
    { "chara":"saint", "name":"聖女" }
  ],
  "wide":true,
  "title":"② 本人で指定 ── remove(Object o)",
  "caption":"図E-2 ── 「このタンク」を名簿から探して消す。何番目にいるかを知らなくてよい"
} %}

{% listrow {
  "type":"heroList.clear();",
  "items":[
    { "chara":"hero", "name":"勇者", "mark":"x", "dim":true },
    { "chara":"wizard", "name":"魔法使い", "mark":"x", "dim":true },
    { "chara":"saint", "name":"聖女", "mark":"x", "dim":true }
  ],
  "wide":true,
  "title":"③ 全消去 ── clear()",
  "note":"リストが空になる（全滅…）",
  "caption":"図E-3 ── 名簿そのものは残り、中身が0人になる"
} %}

2つの `remove` の違いは、次の1点に集約されます。

<div class="table-scroll">

| 書き方 | 何を渡すか | 向いている場面 |
|---|---|---|
| `remove(1)` | **番号**（`int`） | 一覧を表示して「何番を消す」と選ばせるとき |
| `remove(tank)` | **本人**（オブジェクト） | 変数で持っている相手を消すとき（倒れた仲間など） |

</div>

#### 6. 削除すると、後ろの番号が詰め直される

ここが後で必ず引っかかるところです。**名簿から1人抜けると、その後ろにいた全員の番号が1つ前に詰まります。**

{% compare { "axis":"v", "cols":4, "vs":"heroList.remove(1); すると ↓", "wide":true, "caption":"図F ── 抜けた場所は空席にならない。聖女は2番から1番へ、弓使いは3番から2番へ動く。番号は「いま何番目か」でしかない" } %}
{% panel "削除する前", { "sub":"4人。聖女は2番、弓使いは3番" } %}
{% listrow {
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い", "mark":"x" },
    { "chara":"saint", "name":"聖女" },
    { "chara":"archer", "name":"弓使い" }
  ]
} %}
{% endpanel %}
{% panel "削除した後", { "sub":"3人。聖女が1番、弓使いが2番になった", "tone":"ok" } %}
{% listrow {
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"saint", "name":"聖女", "arrowNote":"2番 → 1番" },
    { "chara":"archer", "name":"弓使い", "arrowNote":"3番 → 2番" }
  ]
} %}
{% endpanel %}
{% endcompare %}

3番はもう存在しません。人数が減ったあとに「3番」を指すと、その場でエラーになって止まります。
第2部の問3で、まさにこれが起きます。

#### 7. 人数チェックと仲間さがし

4人パーティ（勇者・魔法使い・聖女・弓使い）を例にすると、それぞれの答えはこうなります。

{% cards [
  { "chara":"hero", "name":"size()", "lines":["いま何人？"], "stats":{ "戻り値":"4" }, "note":"int が返る" },
  { "chara":"saint", "name":"isEmpty()", "lines":["全滅した？"], "stats":{ "戻り値":"false" }, "note":"boolean が返る" },
  { "chara":"hero", "name":"contains(hero)", "lines":["勇者は生きてる？"], "stats":{ "戻り値":"true" }, "note":"boolean が返る" },
  { "chara":"wizard", "name":"indexOf(wizard)", "lines":["魔法使いはどこ？"], "stats":{ "戻り値":"1" }, "note":"int が返る" }
], { "wide":true, "caption":"図G ── 聞きたいことと、返ってくる型の対応。人数と位置は int、生きているかどうかは boolean" } %}

<div class="note note--warn">
<span class="note__title"><code>indexOf</code> に名前の文字列を渡すと <code>-1</code> になります</span>

名簿に入っているのは `Adventurer` オブジェクトであって、名前の文字列ではありません。
下のコードは**コンパイルは通りますが**、探しているものが名簿に無いので `-1` が返ります。

```java
// コンパイルは通る。でも中身は Adventurer なので、文字列は見つからない → -1
System.out.println(heroList.indexOf("魔法使い"));
```

`indexOf` は「見つからなかったら `-1`」という約束になっています。

</div>

#### 8. 拡張for文 ── 全員を順番にめぐる

名簿を全員分めぐる書き方は2つあります。やっていることは同じですが、長さが違います。

{% compare { "axis":"v", "vs":"拡張for文で書くと ↓", "wide":true, "caption":"図H ── 上は「番号を自分で回して、番号で取り出す」。下は「1人ずつ受け取る」。番号を使わない用事なら下で足りる" } %}
{% panel "普通の for 文", { "sub":"番号を数える変数が必要", "tone":"danger" } %}
```java nonum
for (int i = 0; i < heroList.size(); i++) {
    System.out.println(heroList.get(i).getName());
}
```
{% endpanel %}
{% panel "拡張 for 文", { "sub":"スッキリ！ 全員を順番にめぐる", "tone":"ok" } %}
```java nonum
for (Adventurer member : heroList) {
    System.out.println(member.getName());
}
```
{% endpanel %}
{% endcompare %}

`Adventurer member` の部分が「1人ずつ受け取る箱」です。ここに入るのは名簿の中身と同じ型です。
上のどちらを実行しても、点呼の結果は同じです。

```text
勇者
魔法使い
聖女
弓使い
```

#### 9. 並び替え ── 何を基準にするかを渡す

`sort` には「どの値で比べるか」を渡します。ここでは攻撃力（`atk`）を基準にしました。

{% compare { "axis":"v", "cols":4, "vs":"sort() ↓", "wide":true, "caption":"図I ── 動くのはカードごと。名前とATKが常に一緒に移動する（第1回の図Eと同じ話）。列がそろっているので、誰がどこへ動いたか追える" } %}
{% panel "Before", { "sub":"名簿に入れた順" } %}
{% cards [
  { "chara":"wizard", "name":"魔法使い", "stats":{ "ATK":"30" } },
  { "chara":"hero", "name":"勇者", "stats":{ "ATK":"20" } },
  { "chara":"saint", "name":"聖女", "stats":{ "ATK":"10" } },
  { "chara":"archer", "name":"弓使い", "stats":{ "ATK":"15" } }
] %}
{% endpanel %}
{% panel "After ── 攻撃力の低い順", { "sub":"名簿の並びそのものが変わる", "tone":"ok" } %}
{% cards [
  { "chara":"saint", "name":"聖女", "stats":{ "ATK":"10" } },
  { "chara":"archer", "name":"弓使い", "stats":{ "ATK":"15" } },
  { "chara":"hero", "name":"勇者", "stats":{ "ATK":"20" } },
  { "chara":"wizard", "name":"魔法使い", "stats":{ "ATK":"30" } }
] %}
{% endpanel %}
{% endcompare %}

```java nonum
heroList.sort(Comparator.comparingInt(Adventurer::getAtk));
```

<div class="note">
<span class="note__title">この1行の中身は今回は追いません</span>

`Comparator.comparingInt(Adventurer::getAtk)` は「`getAtk()` の値で比べてね」という指示書です。
**指示書を作って渡す**という形だけ分かれば十分で、仕組みはこの回の範囲外です。
`Adventurer::getAtk` を `Adventurer::getHp` に変えれば、HPの低い順になります。

</div>

#### 10. この回のまとめ

{% steps [
  { "t":"長さを決めずに持つ", "d":"ArrayList は枠の数が固定されていない。何人になるか分からないものを入れられる" },
  { "t":"番号で出し入れする", "d":"add / get / remove はすべて「何番目か」が軸。削除すると後ろが詰まる" },
  { "t":"取り出してから用事を言う", "d":"get(0).getName() の2段構え。名簿は中身のことを知らない", "chara":"hero" }
], { "wide":true, "caption":"図J ── ArrayList＝自由に増減できる勇者一行" } %}

やりたいことから引く早見表です。

<div class="table-scroll">

| やりたいこと | メソッド | 返るもの |
|---|---|---|
| 仲間を末尾に加える | `add(冒険者)` | — |
| 指定の位置に割り込ませる | `add(番号, 冒険者)` | — |
| 番号で1人取り出す | `get(番号)` | `Adventurer` |
| 名前を書きかえる | `get(番号).setName(名前)` | — |
| 番号で消す | `remove(番号)` | — |
| 本人で消す | `remove(冒険者)` | — |
| 全員消す | `clear()` | — |
| 人数を知る | `size()` | `int` |
| 空かどうか | `isEmpty()` | `boolean` |
| いるかどうか | `contains(冒険者)` | `boolean` |
| どこにいるか | `indexOf(冒険者)` | `int`（無ければ `-1`） |
| 並び替える | `sort(比べ方)` | — |

</div>

### コードで見るとこうなる

名簿に入れる `Adventurer` は、[第3回](03-encapsulation.html)のカプセル化そのままの形です。
`private` なフィールドと、外から使う getter / setter を持っています。

```java file=Adventurer.java
public class Adventurer {
    private String name; // 役職名（勇者、魔法使い など）
    private int hp;      // 体力
    private int atk;     // 攻撃力

    public Adventurer(String name, int hp, int atk) {
        this.name = name;
        this.hp = hp;
        this.atk = atk;
    }

    public String getName() { return name; }
    public int getHp()      { return hp; }
    public int getAtk()     { return atk; }
    public void setName(String name) { this.name = name; }
    public void setHp(int hp)        { this.hp = hp; }

    public String status() {
        return name + "（HP:" + hp + " / ATK:" + atk + "）";
    }
}
```

このクラスを名簿に並べると、ここまでの図がそのままコードになります。

```java hl=1-2
import java.util.ArrayList;
import java.util.Comparator;

public class Sample {
    public static void main(String[] args) {
        // 図A・図B ── 空の名簿を作る
        ArrayList<Adventurer> heroList = new ArrayList<>();

        // 図C ── 末尾に追加、位置を指定して割り込み
        heroList.add(new Adventurer("勇者", 100, 20));
        heroList.add(new Adventurer("聖女", 70, 10));
        heroList.add(1, new Adventurer("魔法使い", 60, 30));

        // 図D ── 取り出してから、その冒険者に用事を言う
        System.out.println(heroList.get(0).getName());
        heroList.get(0).setName("勇太");

        // 図G ── 人数と位置
        System.out.println(heroList.size());

        // 図H ── 全員をめぐる
        for (Adventurer member : heroList) {
            System.out.println(member.status());
        }

        // 図I ── 攻撃力の低い順に並べ替える
        heroList.sort(Comparator.comparingInt(Adventurer::getAtk));
    }
}
```

図とコードの対応はこれだけです。

<div class="table-scroll">

| 図の中の呼び名 | コードでの書き方 |
|---|---|
| 名簿（可変長の列） | `ArrayList<Adventurer> heroList = new ArrayList<>();` |
| 名簿に入れられる型 | `<Adventurer>` の部分 |
| 仲間が加わる | `heroList.add(...)` / `heroList.add(1, ...)` |
| 番号で1人取り出す | `heroList.get(0)` |
| 取り出した人に用事を言う | `heroList.get(0).getName()` / `.setName("勇太")` |
| 点呼（全員をめぐる） | `for (Adventurer member : heroList)` |
| 隊列を組み直す | `heroList.sort(...)` |

</div>

<div class="note">
<span class="note__title">import を忘れないでください</span>

`ArrayList` と `Comparator` は、ファイルの先頭で読み込む宣言が必要です（強調した1・2行目）。
これを書き忘れると「シンボルを見つけられません」というエラーになります。

</div>

<h2 class="part">第2部 実際に使ってみる</h2>

### 演習

3問あります。**すべて穴埋め**で、白紙から書く問題はありません。
配布ファイルの `▼▼` コメントの下を、上から順に埋めていってください。

<div class="table-scroll">

| 演習 | 内容 | 目安 | 埋めるファイル |
|---|---|---|---|
| 問1 | 名簿を作って3人入れる | 10分 | [Main.java](../downloads/04-arraylist/Main.java) |
| 問2 | 名簿のメソッドを使ってみる | 10分 | 同じ `Main.java` の続き |
| 問3 | 魔王とのバトルゲームを完成させる | 30分 | [Game.java](../downloads/04-arraylist/Game.java) |

</div>

全問共通で [Adventurer.java](../downloads/04-arraylist/Adventurer.java) を使います。
**このファイルは完成しているので、変更しません。**
3ファイルを同じ場所に置いて `javac` でコンパイルしてください。

<div class="note note--warn">
<span class="note__title">配布した状態では <code>Game.java</code> のコンパイルが通りません</span>

`Game.java` には、これから作る `party` を参照している行がすでに入っているためです。
**これは壊れているのではなく、穴が埋まっていないだけ**です。
また javac は最初に見つけたエラーで報告を打ち切るので、**1つ直すと次のエラーが現れます。**
穴が6か所あるので、この繰り返しになります。エラーが減っていれば前に進んでいます。

`Main.java`（問1・問2）のほうは、中身が空なので配布状態でもコンパイルは通ります。
穴は9か所あり、こちらは**実行しても何も表示されない**ところから始まります。

</div>

`Adventurer` が持っているものは次のとおりです。演習中はここを見れば足ります。

<div class="table-scroll">

| メンバ | 内容 |
|---|---|
| `getName()` / `setName(String)` | 名前（役職名）の取得・変更 |
| `getHp()` / `setHp(int)` | 体力の取得・変更 |
| `getAtk()` | 攻撃力の取得 |
| `attack()` | 「〜の攻撃！」と表示し、`atk` の値を返す |
| `damage(int d)` | ダメージを受けてHPが減る（0未満にはならない） |
| `status()` | `勇者（HP:100 / ATK:20）` の形の文字列を返す |

</div>

#### 問1 名簿を作って仲間を入れる（目安 10分）

`Main.java` の【問1-1】〜【問1-3】を埋めます。

- **問1-1** `Adventurer` を入れられる ArrayList `heroList` を作る。

```java nonum
// 書き方の型
ArrayList<クラス名> 変数名 = new ArrayList<>();
```

- **問1-2** 次の3人を**順番に**追加する。

<div class="table-scroll">

| 順番 | 名前 | HP | ATK |
|---|---|---|---|
| 1人目 | 勇者 | 100 | 20 |
| 2人目 | 魔法使い | 60 | 30 |
| 3人目 | 聖女 | 70 | 10 |

</div>

```java nonum
// ヒント：new で冒険者を作りながら追加できる
heroList.add(new Adventurer("名前", HP, ATK));
```

- **問1-3** 「現在の人数」と「先頭（0番）の名前」を表示する。

#### 問2 名簿のメソッドを使ってみる（目安 10分）

問1で作った `heroList` の続きに書いていきます。

- **問2-1** **1番の位置**にタンク（HP:150 / ATK:5）を追加する。
  並びは「勇者・タンク・魔法使い・聖女」になります。
- **問2-2** 先頭（0番）の名前を「勇太」に変更する（図Dの2段構えです）。
- **問2-3** 魔法使いがいる場所（インデックス）を表示する。
  問2-1で作った変数か、`get()` で取り出したものを `indexOf()` に渡します。
- **問2-4** 聖女が旅立ってしまいました。**3番**の仲間をリストから消す。
- **問2-5** **拡張for文**で全員のステータスを表示する。

```java nonum
// 拡張for文の型
for (Adventurer member : heroList) {
    // member を使った処理
}
```

- **問2-6 ＜チャレンジ＞** 攻撃力の**低い順**に並び替えてから、もう一度全員を表示する。

```java nonum
// ヒント
heroList.sort(Comparator.comparingInt(Adventurer::getAtk));
```

<div class="note note--hint">
<span class="note__title">問2-3 は「何が返れば正しいのか」を先に考えてください</span>

`indexOf()` に渡すのは **`Adventurer` オブジェクト**です。名前の文字列を渡すと `-1` が返ります
（第1部の図Gの注意書き）。並びは「勇太・タンク・魔法使い・聖女」なので、答えは `2` になります。

</div>

#### 問3 簡易バトルゲームを作る（目安 30分）

`Game.java` の【TODO①】〜【TODO⑥】を埋めます。
**ArrayList に関する部分だけ**が空欄で、それ以外は完成しています。

ゲームは次の流れで回ります。

{% flow [
  { "t":"全員を表示", "d":"TODO③" },
  { "t":"選んだ仲間が攻撃", "arrow":"番号を入力", "tone":"action", "d":"TODO④" },
  { "chara":"maou", "t":"魔王の反撃", "arrow":"attack()", "tone":"danger", "mark":"x", "d":"倒れたら離脱 TODO⑤" },
  { "t":"全滅なら終了", "arrow":"isEmpty()", "d":"TODO⑥" }
], { "loop":"魔王を倒すか全滅するまで繰り返す", "wide":true, "caption":"図K ── バトル1ターンの流れ。ArrayList を触るのは TODO の付いた4か所だけで、残りは配布ファイルに書いてある" } %}

<div class="table-scroll">

| TODO | やること | 使うもの |
|---|---|---|
| ① | パーティ用の ArrayList `party` を作る | `new ArrayList<>()` |
| ② | 勇者(100/20)・魔法使い(60/30)・タンク(150/5)・弓使い(80/15) を追加 | `add()` |
| ③ | 拡張for文で「番号: ステータス」の形で全員表示 | 拡張for文＋`status()` |
| ④ | 入力された番号のキャラを取り出す | `get()` |
| ⑤ | 倒れた仲間をリストから削除 | `remove()`（オブジェクト指定） |
| ⑥ | 全滅（リストが空）なら「全滅してしまった…」と表示して `break` | `isEmpty()` |

</div>

<div class="note note--hint">
<span class="note__title">TODO③ がこの回で一番考えるところです</span>

拡張for文は番号を持っていません。表示に番号を出したいので、**自分でカウンタ変数を用意します。**
`int i = 0;` をループの前に置き、1人表示するたびに `i++` します。
（普通の for 文で書いても正解です。）

</div>

<div class="note note--warn">
<span class="note__title">TODO④ は既存の行を書きかえます</span>

`Adventurer attacker = null;` という行がすでに入っています。**この行を書きかえてください。**
下に別の行を足すと `attacker` が `null` のまま進み、実行した瞬間にエラーになります。

</div>

`Game.java` はキーボードから番号を入力する対話型のプログラムです。
**手元で `java Game` として実行してください。**

### 実行結果の例

#### 問1・問2

`Main.java` を実行して、この出力になれば正解です（問1で2行、問2で7行）。

```text
人数: 3
先頭: 勇者
魔法使いの場所: 2
勇太（HP:100 / ATK:20）
タンク（HP:150 / ATK:5）
魔法使い（HP:60 / ATK:30）
タンク（HP:150 / ATK:5）
勇太（HP:100 / ATK:20）
魔法使い（HP:60 / ATK:30）
```

- 4行目からの3行が問2-5（並び替える前）、7行目からの3行が問2-6（攻撃力の低い順）です。
- 聖女は問2-4で消えているので、どちらにも出てきません。
- 1行目の「人数: 3」は**タンクを割り込ませる前**の人数です。

#### 問3

魔王の反撃はランダムな1人に当たるので、**反撃の相手は実行するたびに変わります。**

```text
★ 魔王が現れた！ ★

----- パーティ -----
0: 勇者（HP:100 / ATK:20）
1: 魔法使い（HP:60 / ATK:30）
2: タンク（HP:150 / ATK:5）
3: 弓使い（HP:80 / ATK:15）
魔王（HP:200）
--------------------
攻撃するキャラの番号を入力 >> 1
魔法使い の攻撃！
魔王 は 30 のダメージを受けた！（残りHP: 170）

魔王の反撃！
弓使い は 25 のダメージを受けた！（残りHP: 55）
```

### 解答・解説

書き方は一つではありません。**名簿の操作が ArrayList のメソッドで書けていて、
実行結果が一致していれば正解**です。

<details>
<summary>▶ 問1・問2 の解答を見る</summary>

```java file=Main.java
import java.util.ArrayList;
import java.util.Comparator;

public class Main {
    public static void main(String[] args) {

        // 【問1-1】ArrayListの生成
        ArrayList<Adventurer> heroList = new ArrayList<>();

        // 【問1-2】3人の仲間を追加
        heroList.add(new Adventurer("勇者", 100, 20));
        heroList.add(new Adventurer("魔法使い", 60, 30));
        heroList.add(new Adventurer("聖女", 70, 10));

        // 【問1-3】人数と先頭の名前を表示
        System.out.println("人数: " + heroList.size());
        System.out.println("先頭: " + heroList.get(0).getName());

        // 【問2-1】1番の位置にタンクを割り込み追加
        Adventurer tank = new Adventurer("タンク", 150, 5);
        heroList.add(1, tank);

        // 【問2-2】先頭の名前を「勇太」に変更
        heroList.get(0).setName("勇太");

        // 【問2-3】魔法使いの場所を表示
        Adventurer wizard = heroList.get(2);
        System.out.println("魔法使いの場所: " + heroList.indexOf(wizard));

        // 【問2-4】3番（聖女）を削除
        heroList.remove(3);

        // 【問2-5】拡張for文で全員表示
        for (Adventurer member : heroList) {
            System.out.println(member.status());
        }

        // 【問2-6】攻撃力の低い順に並び替えて再表示
        heroList.sort(Comparator.comparingInt(Adventurer::getAtk));
        for (Adventurer member : heroList) {
            System.out.println(member.status());
        }
    }
}
```

**解説**

- 問2-1 で `tank` を変数に取っているのは、あとで `remove(tank)` のように**本人指定で使えるように**
  するためです。`heroList.add(1, new Adventurer("タンク", 150, 5));` と1行で書いても動きます。
- 問2-2 は `heroList.get(0)` で勇者を取り出し、**その勇者の** `setName()` を呼んでいます。
  `heroList.setName(...)` とは書けません（図D）。
- 問2-3 で渡しているのは `Adventurer` オブジェクトです。並びは「勇太・タンク・魔法使い・聖女」なので `2` が返ります。
- 問2-4 の `remove(3)` は**番号指定**です。聖女がちょうど3番にいるので消えます。

**よくある間違い**

<div class="table-scroll">

| 間違い | 何が起きるか |
|---|---|
| `new ArrayList()` と `<Adventurer>` を書かない | 取り出したものが `Adventurer` として扱えず、`getName()` が呼べない |
| `new ArrayList<>` と `()` を忘れる | コンパイルエラー |
| `heroList.setName("勇太")` と書く | 名簿は名前を持っていないのでコンパイルエラー |
| `heroList.indexOf("魔法使い")` と書く | **コンパイルは通る**が `-1` が返る |
| `import java.util.ArrayList;` を書かない | 「シンボルを見つけられません」 |

</div>

</details>

<details>
<summary>▶ 問3 の解答を見る</summary>

埋める6か所だけを抜き出したものです。

```java file=Game.java
// 【TODO①】パーティ用のArrayListを作成
ArrayList<Adventurer> party = new ArrayList<>();

// 【TODO②】4人の仲間を追加
party.add(new Adventurer("勇者", 100, 20));
party.add(new Adventurer("魔法使い", 60, 30));
party.add(new Adventurer("タンク", 150, 5));
party.add(new Adventurer("弓使い", 80, 15));
```

```java file=Game.java
// 【TODO③】番号付きで全員表示
int i = 0;
for (Adventurer member : party) {
    System.out.println(i + ": " + member.status());
    i++;
}
```

```java file=Game.java
// 【TODO④】選んだ番号のキャラを取り出す
Adventurer attacker = party.get(select);
```

```java file=Game.java
// 【TODO⑤】倒れた仲間を削除（オブジェクト指定）
party.remove(target);
```

```java file=Game.java
// 【TODO⑥】全滅判定
if (party.isEmpty()) {
    System.out.println("\n全滅してしまった…");
    break;
}
```

**解説**

- **TODO③** 拡張for文には番号がないので、`int i = 0;` を自分で用意して `i++` します。
  `for (int i = 0; i < party.size(); i++)` と普通の for 文で書いても正解です。
- **TODO⑤** は `remove(target)` の**オブジェクト指定**です。すぐ上の行で
  `party.get(targetIndex)` から取り出した本人が `target` に入っているので、
  「何番目か」をもう一度考えなくてよいのが利点です。`remove(targetIndex)` と**番号指定**にしても動きます。
- **TODO⑥** の判定は、削除したあとに置くことが大事です。削除の前に `isEmpty()` を聞いても、
  まだ1人残っているので `false` になります。

**実際に起きるエラーで、図Fを確かめられます**

仲間が離脱すると番号が詰め直されるので、**同じ番号を選び続けると存在しない番号になります。**
下は「毎回2番を選ぶ」で実行したときの記録です。魔法使い（1番）が離脱したあと、
タンクが1番、弓使いが2番に詰まっているのが分かります。

```text
魔王の反撃！
魔法使い は 25 のダメージを受けた！（残りHP: 0）
魔法使い は倒れてしまった…

----- パーティ -----
0: 勇者（HP:50 / ATK:20）
1: タンク（HP:50 / ATK:5）
2: 弓使い（HP:5 / ATK:15）
魔王（HP:140）
--------------------
```

さらに人数が2人まで減ると、2番はもう存在しません。

```text
----- パーティ -----
0: 勇者（HP:25 / ATK:20）
1: タンク（HP:50 / ATK:5）
魔王（HP:110）
--------------------
攻撃するキャラの番号を入力 >> 2
Exception in thread "main" java.lang.IndexOutOfBoundsException: Index 2 out of bounds for length 2
```

**バグではなく、ArrayList の仕様どおりの動き**です。
番号は「いま何番目か」であって、その人に付いた名札ではありません。

</details>

<details>
<summary>▶ 早く終わった人向けの発展課題</summary>

いずれも `Game.java` に手を入れます。

1. **魔王の攻撃力をランダムにする**（例：15〜35）。`random.nextInt(21) + 15` で作れます。
   魔王の攻撃力は `maou.getAtk()` で取っているので、そこを置きかえます。
2. **不正な番号の入力を弾く**。上の `IndexOutOfBoundsException` を出さないようにします。
   `select` が `0` 以上 `party.size()` 未満かを確認してから `get()` を呼びます。
3. **戦闘開始前に隊列を組み直す**。`sort()` でHPの高い順に並べてから始めます。
   `Comparator.comparingInt(Adventurer::getHp)` は低い順なので、高い順にするには一工夫が必要です。

</details>

### 次の回へ

- [第5回 継承・オーバーライド](05-inheritance.html) — この回で作った名簿はそのまま使います。
  「全員を冒険者としてまとめて名簿に入れた」状態から、**職業ごとの違い**を親子関係で表す回です。
- [第6回 ポリモーフィズム](06-polymorphism.html) — 図Bで見た `<Adventurer>` の部分が主題になります。
  **親の型で名簿を作れば、職業の違うクラスを1つの列にまとめられる**という話です。
