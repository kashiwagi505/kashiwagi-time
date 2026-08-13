---
order: 6
---
<!--
  本文執筆済み（2026-08-06）。
    設計図      : 00_research/02_content/per-session/session-06.md
    決定        : 00_research/06_decisions/decisions.md 2026-07-31（決定1・5、運用細則、揃える3点）
    図解部品    : site/docs/figures.md（6章に第6回の図と部品の対応表、9章に compare の警告）

    front matter は order: だけ。タイトル「ポリモーフィズム」・呼び名「変幻の書」・
    permalink は src/_data/site.json から自動で入る。

    この回の作りの要点:
    ・決定1（第1部の補強）が全7回で最も多い回（5点）。講義スライド9枚は
      「親型リストにまとめる」「同じ呼び出しで違う結果」「メリット」の3点しか扱っておらず、
      動的束縛の定義／アップキャスト／instanceof が反ポリモーフィズムな理由／
      呼べる範囲は変数の型で決まる／ダウンキャスト の5点は演習と解答例にしかない。
      → すべて第1部の図に入れた（図E・図G・図I・図J・図K）。
    ・図J（box の入れ子）が「呼べるか＝変数の型／どう動くか＝中身のクラス」。
      per-session が「この回の最重要の欠落」としていた図。
    ・図H は fanout（全7回で唯一の新規の型）。★元 pptx の目視確認が未了なので図の形は推測。
    ・元資料の回番号は「第4回」表記（スライド1／演習md見出し）。スライド2の
      「REVIEW ─ 第2回」は第5回、解答例の「第3回の抽象クラス」は第7回。すべて読み替えた。
    ・スライド9の締め「全4回・勇者一行の旅、これにて完結！」は使えない（次に第7回がある）。
      「後半4回の目標はここで達成／第7回は設計を締める回」に書き換えた。
    ・スライド7の if 分岐は日本語混じりの擬似コード → ```text pseudo。
    ・魔王のステータスはこの回の配布ソース（PolyGame.java）の HP 250 / ATK 0 を使う。
      反撃は atk ではなく 15〜30 の乱数なので、攻撃力の数値は図に出していない。
    ・配布状態のコンパイル可否を実測: PolyGame.java だけが通らない（party 未宣言で5件）。
      他の5ファイルはそのままコンパイルできる。
    ・解答コードを javac 21.0.10 で実行し、ページ掲載の出力と文字列一致を確認済み。
-->

<h2 class="part">第1部 直感的につかむ</h2>

### この回でできるようになること

- 職業がバラバラの仲間を、親の型のリスト `ArrayList<Adventurer>` に1本でまとめられるようになる。
- `member.attack()` の1行だけで、中身のクラスごとに違う攻撃を出せるようになる。
- 「**呼べるか**は変数の型で決まり、**どう動くか**は中身のクラスで決まる」という境界が説明できるようになる。

### 勇者一行で例えると

この回は、これまでの2回が合流する地点です。

- [第4回](04-arraylist.html)で、勇者一行を **1本の名簿（`ArrayList<Adventurer>`）** に入れました。
  ただし「なぜ名簿の型が `Adventurer` なのか」はまだ説明していません。
- [第5回](05-inheritance.html)で、**`Adventurer` を継承した勇者・魔法使い・タンク** を作り、
  `attack()` をそれぞれの個性に上書きしました。

この2つを重ねると、**職業を問わない1本の名簿に全員を載せたまま、
「こうげき」コマンド1つで全員がそれぞれの技を出す** ── という形になります。
それがこの回のテーマ、<span class="term">ポリモーフィズム（多態性）</span>です。

### 図解でつかむ

#### 1. まず前回のおさらい ── 冒険者から生まれた3人

{% tree {
  "root":{ "name":"Adventurer", "note":"親クラス（冒険者）",
    "fields":["name","hp","atk"], "methods":["attack()","damage()","status()"] },
  "children":[
    { "name":"Hero", "chara":"hero", "note":"勇者", "methods":[ { "t":"attack() を上書き", "tone":"gold" } ] },
    { "name":"Wizard", "chara":"wizard", "note":"魔法使い", "methods":[ { "t":"attack() を上書き", "tone":"gold" } ] },
    { "name":"Tank", "chara":"tank", "note":"タンク", "methods":[ { "t":"attack() を上書き", "tone":"gold" } ] }
  ],
  "edge":"extends（継承）",
  "wide":true,
  "caption":"図A ── 前回作った形。3人とも「冒険者の一種」で、攻撃の中身だけが自分のものになっている"
} %}

3人の `attack()` は、それぞれ「剣で斬りつけた！」「呪文を唱えた！」「盾を構えて体当たり！」です。
**この「上書き済み」という状態が、この回のすべての土台になります。**

#### 2. ところが、クラスが違うとリストにまとめられない

ここで名簿を作ろうとして、素直に `ArrayList<Hero>` と書いてみます。

{% listrow {
  "type":"ArrayList<Hero>",
  "items":[
    { "chara":"hero", "name":"勇者", "mark":"o", "note":"Hero なので入る" },
    { "chara":"wizard", "name":"魔法使い", "mark":"x", "dim":true, "note":"Heroじゃない！" }
  ],
  "note":"型引数が Hero なので、このリストに入れるのは Hero だけ",
  "wide":true,
  "caption":"図B ── 魔法使いは Hero ではないので、この名簿には載せられない"
} %}

では、職業ごとにリストを分ければいいのでしょうか。

{% fig { "wide":true,
  "caption":"図C ── 型ごとにリストを作ると、仲間の種類が増えるたびにリストが増えていく" } %}
{% listrow { "type":"ArrayList<Hero>", "items":[ { "chara":"hero", "name":"勇者" } ], "index":false } %}
{% listrow { "type":"ArrayList<Wizard>", "items":[ { "chara":"wizard", "name":"魔法使い" } ], "index":false } %}
{% listrow { "type":"ArrayList<Tank>", "items":[ { "chara":"tank", "name":"タンク" } ], "index":false } %}
{% endfig %}

<div class="note note--warn">

リスト3本は、**全員を表示する処理も、全員に攻撃させる処理も3回書く**ということです。
弓使いを足せば4本、聖女を足せば5本。**仲間が増えるほどコードが増えていきます。**

</div>

#### 3. 親の型でリストを作ればいい

解決は1か所だけです。**リストの型引数を、子クラスではなく親クラスにします。**

{% listrow {
  "type":"ArrayList<Adventurer>",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"tank", "name":"タンク" },
    { "chara":"saint", "name":"聖女" },
    { "chara":"archer", "name":"弓使い" }
  ],
  "note":"みんな「冒険者の一種」だから、同じリストに入れる",
  "wide":true,
  "caption":"図D ── この回の最重要の図。型引数を Adventurer にすると、その子クラスは全部入る"
} %}

```java nonum
ArrayList<Adventurer> party = new ArrayList<>();
```

図Bと図Dで変わったのは、**`<Hero>` が `<Adventurer>` になった一箇所だけ**です。
それだけで、リストは1本で済むようになります。

#### 4. リストでなくても成立する ── アップキャスト

「親の型で持つ」のはリストに限りません。**ふつうの変数でも同じことができます。**

{% compare { "vs":"VS", "wide":true, "legend":["o"],
  "caption":"図E ── どちらも同じ Wizard の実体を作っている。違うのは「何型の変数で受け取るか」だけ" } %}
{% panel "子の型で受け取る", { "sub":"Wizard として持つ", "tone":"ok", "mark":"o" } %}
```java nonum
Wizard w = new Wizard("魔法使い", 60, 30);
w.attack();
```
{% endpanel %}
{% panel "親の型で受け取る", { "sub":"Adventurer として持つ（アップキャスト）", "tone":"ok", "mark":"o" } %}
```java nonum
Adventurer a = new Wizard("魔法使い", 60, 30);
a.attack();
```
{% endpanel %}
{% endcompare %}

- <span class="term">アップキャスト</span> ── 子クラスの実体を、**親の型の変数で受け取る**こと。
  `Adventurer a = new Wizard(...)` のように、そのまま代入するだけで成立します。

右の `a.attack()` で出るのは、**魔法使いの呪文**です。

```text
魔法使い は呪文を唱えた！
```

`ArrayList<Adventurer>` に子クラスを入れられるのも、まったく同じ理屈です。
**リストの1マス1マスが、親の型の変数だと思ってください。**

#### 5. 入れるのも、使うのも「冒険者」のまま

親の型でリストを作ると、入れるときも取り出すときも、型を気にしなくてよくなります。

```java nonum
party.add(hero);     // 勇者
party.add(wizard);   // 魔法使い
party.add(tank);     // タンク
```

違うクラスでも、そのまま `add` できます。取り出す側も同じです。

```java nonum
for (Adventurer member : party) {
    member.attack();
}
```

拡張for文の変数も `Adventurer` 型で受けます。取り出すのも「冒険者」としてで大丈夫です。

<div class="note">

注目してほしいのは `member.attack()` の1行です。
**誰の `attack()` なのかが、どこにも書かれていません。**
`if` もなければ、キャラの名前も出てきません。それでも大丈夫なのでしょうか。

</div>

#### 6. 実行すると ── 同じ呼び出しで、それぞれの攻撃

{% codeout { "wide":true,
  "caption":"図F ── コードは前の節とまったく同じ。それでも出るのは3人ぶんの別々の攻撃" } %}
{% panel "書いたコード", { "sub":"1行しかない" } %}
```java nonum
for (Adventurer member : party) {
    member.attack();
}
```
{% endpanel %}
{% panel "実行結果", { "tone":"ok" } %}
```text
勇者 は剣で斬りつけた！
魔法使い は呪文を唱えた！
タンク は盾を構えて体当たり！
```
{% endpanel %}
{% endcodeout %}

オーバーライドした攻撃が、**自動でそれぞれ呼ばれます。**
[第5回](05-inheritance.html)では `hero.attack()` `wizard.attack()` と3行書いていました。
今回は**1行**です。書いた行数は減ったのに、出てくる結果は同じだけ豊かなままです。

#### 7. 呼ばれる中身は、実行するときに決まる ── 動的束縛

なぜ「冒険者」として呼んだのに、勇者の攻撃が出るのでしょうか。
**呼ばれるメソッドは、変数の型ではなく `new` した中身のクラスで決まる**からです。

これを確かめるために、名簿にわざと **`Adventurer` そのもの** を1人入れてみます。
継承もオーバーライドもしていない、素の冒険者です。

{% codeout { "wide":true,
  "caption":"図G ── 見習いだけ「の攻撃！」という親そのままの文型になる。中身が親なら、出るのも親の attack()" } %}
{% panel "名簿の中身", { "sub":"1人だけ素の Adventurer" } %}
{% listrow {
  "type":"ArrayList<Adventurer>",
  "items":[
    { "chara":"hero", "name":"勇者", "note":"中身は Hero" },
    { "chara":"silhouette", "name":"見習い", "note":"中身は Adventurer" }
  ],
  "index":false
} %}
{% endpanel %}
{% panel "実行結果", { "sub":"member.attack() を呼んだだけ" } %}
```text
勇者 は剣で斬りつけた！
見習い の攻撃！
```
{% endpanel %}
{% endcodeout %}

- <span class="term">動的束縛</span> ── **どのクラスのメソッドが実行されるかが、
  コンパイルのときではなく実行するときに、中身のクラスを見て決まる**しくみ。

変数の型はどちらも `Adventurer` です。それでも結果が違うのは、中身が違うからです。
**上書きしているクラスなら上書きした側が、上書きしていないなら親のものが呼ばれます。**

#### 8. 押すのは同じ、出る技はそれぞれ

ここまでを1枚にすると、こうなります。**`attack()` は全員に共通の「同じボタン」です。**
押した結果に出る技だけが、キャラごとに違います。

{% fanout {
  "input":{ "t":"member.attack()", "sub":"押すボタンは1つだけ。誰の attack かは書いていない" },
  "outputs":[
    { "chara":"hero", "name":"中身が Hero なら", "t":"剣で斬りつけた！", "tone":"ok" },
    { "chara":"wizard", "name":"中身が Wizard なら", "t":"呪文を唱えた！", "tone":"ok" },
    { "chara":"tank", "name":"中身が Tank なら", "t":"盾を構えて体当たり！", "tone":"ok" }
  ],
  "edge":"中身のクラスごとに違う結果",
  "note":"押すのは同じ、出る技はそれぞれ",
  "wide":true,
  "caption":"図H ── ポリモーフィズムを一言でいうとこの図。呼び出しは1種類、結果はクラスの数だけある"
} %}

<div class="note note--ok">
<span class="note__title">ポリモーフィズム（多態性）とは</span>

**それぞれの型を意識せずに持ち、どの型のメソッドなのかを意識せずに扱えること。**

</div>

#### 9. なにがうれしいのか

{% cards [
  { "chara":"tank", "name":"① リストが1本で済む",
    "lines":["何種類キャラが増えても","party ひとつで全員を管理できる"] },
  { "chara":"wizard", "name":"② 誰のメソッドか意識しなくていい",
    "lines":["「●●の攻撃」といちいち","書き分けなくていい"] }
], { "wide":true, "caption":"図I ── メリットは「1本で持てる」と「型を気にしないで呼べる」の2つ" } %}

もしポリモーフィズムが無かったら、呼び出す側はこう書くしかありません。

```text pseudo
if (member が勇者なら)        勇者の attack;
else if (member が魔法使いなら) 魔法使いの attack;
else if (member がタンクなら)   タンクの attack;
…… キャラの数だけ分岐が続く
```

Java でこれを書くときに使うのが <span class="term">`instanceof`</span>
（変数の中身がそのクラスかどうかを調べる演算子）です。

<div class="note note--warn">
<span class="note__title"><code>instanceof</code> で分岐するのは、ポリモーフィズムの真逆です</span>

動くことは動きます。ただし**型を判別している**時点で、
「型を意識せずに扱える」という利点をすべて手放しています。

さらに厄介なのは、**後からクラスを足したときに壊れる**ことです。
新しいキャラを作っても、分岐に書き足すのを忘れれば、そのキャラは
どの枝にも当てはまらず**黙って何もしない**か、条件の書き方によっては
**別のキャラの枝に紛れ込みます**。しかも**コンパイルは通る**ので、
実行して初めて気づきます。[第7回](07-abstract.html)では、
この壊れ方が実際に起きる場面が出てきます。

</div>

図Fのコードには `if` が1つもありません。**キャラを何人足しても、あの2行は変わりません。**

#### 10. 呼べる範囲は「変数の型」で決まる

ここがこの回でいちばん間違えやすいところです。
「中身のクラスで決まる」のは**動き**であって、**呼べるかどうか**ではありません。

魔法使い `Wizard` は、自分だけの回復魔法 `heal()` を持っています。
その魔法使いを `Adventurer` 型の変数で受け取ると、こうなります。

{% fig { "wide":true,
  "caption":"図J ── 外側の箱（変数の型）が「呼べるメニュー」を決め、内側の箱（中身のクラス）が「どう動くか」を決める" } %}
{% box "Adventurer a", { "sub":"変数の型 ── 呼べる範囲を決める（コンパイル時）",
  "note":"a.attack() は Adventurer にあるので呼べる。a.heal() は Adventurer に無いので呼べない" } %}
{% box "中身は Wizard", { "sub":"実行時のクラス ── どう動くかを決める（実行時）", "tone":"gold",
  "note":"実際に動くのは Wizard の attack()" } %}
{% cards [
  { "chara":"wizard", "name":"Wizard", "lines":["attack() を上書きしている","heal() を追加している"] }
] %}
{% endbox %}
{% endbox %}
{% endfig %}

```java error
Adventurer m = party.get(1);   // 1番の中身は Wizard のはず
m.heal(party.get(0));          // → エラー: シンボルを見つけられません
```

中身は間違いなく `Wizard` なのに呼べません。
**コンパイラは変数の型（`Adventurer`）しか見ないから**です。
「中身はきっと `Wizard` だろう」という事情は考えてくれません。

<div class="table-scroll">

| | `attack()` | `heal()` |
|---|---|---|
| 変数の型 `Adventurer` にある？ | **ある** → 呼べる | **ない** → コンパイルエラー |
| 実行したときの動き | 中身（`Wizard`）の攻撃になる | ─ |

</div>

`attack()` が思いどおりに動くのは、**「親にも定義があるから呼べて、
中身の上書きが実行される」という2段構え**になっているからです。
`heal()` は親に定義がないので、1段目の入口で弾かれます。

<div class="note note--hint">
<span class="note__title">この回の結論はこの2行です</span>

- **呼べるか** → 変数の型で決まる（コンパイルのとき）
- **どう動くか** → 中身のクラスで決まる（実行のとき）

つまり**ポリモーフィズムで使えるのは「親が持っているメソッドだけ」**。
これがポリモーフィズムの「使用できる範囲」です。

</div>

#### 11. 型を戻せば呼べる ── ダウンキャスト

どうしても `heal()` を呼びたいときは、**変数の型のほうを `Wizard` に戻します。**

{% flow [
  { "t":"Adventurer m", "d":"heal() は呼べない", "mark":"x" },
  { "t":"m instanceof Wizard", "arrow":"確かめる",
    "d":"中身は Wizard か？", "tone":"gold" },
  { "t":"(Wizard) m", "arrow":"型を戻す", "arrowTone":"action",
    "d":"Wizard 型で持ち直す", "tone":"ok" },
  { "t":"w.heal(...)", "arrow":"呼べる", "arrowTone":"ok",
    "d":"窓口が開く", "tone":"ok", "chara":"wizard" }
], { "wide":true,
     "caption":"図K ── ダウンキャスト。親の型から子の型へ「戻す」ので、先に中身の確認が要る" } %}

- <span class="term">ダウンキャスト</span> ── 親の型で持っているものを、
  `(Wizard) m` のように**子の型に変換し直す**こと。

```java nonum
Adventurer m = party.get(1);
if (m instanceof Wizard) {      // 中身が Wizard か確認してから
    Wizard w = (Wizard) m;      // Wizard 型に変換（ダウンキャスト）
    w.heal(party.get(0));       // Wizard として扱えば heal が呼べる
}
```

<div class="note note--warn">

これは**その場しのぎ**です。`instanceof` で型を判別している時点で、
9節で見た「後から壊れる書き方」に戻っています。回復できるキャラが増えるたびに分岐も増えます。

さらに、**`instanceof` で確認せずにキャストして中身が違うと、
実行時に `ClassCastException` で落ちます。** コンパイルは通るので、動かすまで分かりません。

</div>

**もっとよい方法があります。** それは第2部の問3で考えてもらいます。

#### 12. まとめ

{% steps [
  { "t":"親の型でまとめる", "d":"ArrayList<Adventurer> なら、勇者も魔法使いも全員入る" },
  { "t":"呼び出しは同じ、動きはそれぞれ", "d":"member.attack() だけで、キャラごとの攻撃が出る" },
  { "t":"支えているのはオーバーライド", "d":"第5回で作った「上書き」が、ここで真価を発揮する" },
  { "t":"管理がラクになる", "d":"リスト1本・分岐なし。仲間が増えてもコードは変わらない", "chara":"hero" }
], { "wide":true, "caption":"図L ── 勇者一行を1本のリストで動かすという目標は、ここで達成される" } %}

### コードで見るとこうなる

図Dから図Fまでを、そのままコードにすると次のかたちです。
**行ごとに読み解く必要はありません。** 図で見たものがどこに出ているかだけ確認してください。

```java hl=1,8
ArrayList<Adventurer> party = new ArrayList<>();

party.add(hero);     // Hero の実体
party.add(wizard);   // Wizard の実体
party.add(tank);     // Tank の実体

for (Adventurer member : party) {
    member.attack();
}
```

<div class="table-scroll">

| 図の中の呼び名 | コードでの書き方 |
|---|---|
| 親の型でリストを作る（図D） | `ArrayList<Adventurer>`（強調した1行目の型引数） |
| 親の型の変数で受け取る＝アップキャスト（図E） | `add` に渡した時点で、リストの各マスが `Adventurer` として持つ |
| 同じボタン（図H） | `member.attack();`（強調した8行目） |
| 中身のクラスで動きが決まる＝動的束縛（図G） | このコードには一切書かれていない。**書かないのが正しい** |
| 呼べる範囲は変数の型（図J） | `member` は `Adventurer` 型なので、`member.heal()` とは書けない |

</div>

**新しい文法はほとんど出てきていません。** `extends` も `@Override` も `ArrayList` も既習です。
この回で新しいのは「**リストの型引数を親にする**」という書き方の選択だけで、
あとはすべて**考え方**です。

<h2 class="part">第2部 実際に使ってみる</h2>

### 演習

3問あります。**問1はコードを読むクイズ、問2はゲームの穴埋め、問3は考察**です。
1問ぶんのファイルを同じ場所に置いて、`javac` でコンパイルして進めてください。

<div class="table-scroll">

| ファイル | すること |
|---|---|
| [Adventurer.java](../downloads/06-polymorphism/Adventurer.java) | **変更しない。** 全問共通の親クラス（第4回・第5回と同じもの） |
| [Hero.java](../downloads/06-polymorphism/Hero.java) ／ [Wizard.java](../downloads/06-polymorphism/Wizard.java) ／ [Tank.java](../downloads/06-polymorphism/Tank.java) ／ [Archer.java](../downloads/06-polymorphism/Archer.java) | **変更しない。** すべて完成品。`Wizard` だけが `heal()` を持つ |
| [PolyGame.java](../downloads/06-polymorphism/PolyGame.java) | **問2で TODO①〜③の3か所を埋める。** ほかは完成済み |

</div>

<div class="table-scroll">

| クラス | `attack()` の内容 | 固有メソッド |
|---|---|---|
| `Hero` | は剣で斬りつけた！ | ─ |
| `Wizard` | は呪文を唱えた！ | **`heal()`** 回復魔法（HP+30） |
| `Tank` | は盾を構えて体当たり！ | ─ |
| `Archer` | は矢を放った！ | ─ |

</div>

<div class="note note--hint">
<span class="note__title">前回みなさんが書き直した3クラスが、そのまま今回の出発点です</span>

配布した `Hero.java` / `Wizard.java` / `Tank.java` は、
[第5回](05-inheritance.html)の問2で「約40行から約12行にダイエットさせた」あとの形です。
`Wizard` にだけ、この回のために `heal()` が1つ足してあります。
**自分で書き換えたクラスがあるなら、それを使ってもかまいません。**

</div>

<div class="note note--warn">
<span class="note__title">配布した状態では <code>PolyGame.java</code> だけがコンパイルできません（それが正常です）</span>

`PolyGame.java` は TODO① の `party` がまだ宣言されていないので、
「シンボルを見つけられません: 変数 party」というエラーが5か所に出ます。
**TODO①を埋めれば消えます。**

`Adventurer` / `Hero` / `Wizard` / `Tank` / `Archer` の5ファイルは、
**配布した状態でそのままコンパイルできます。**

</div>

#### 問1 ポリモーフィズムクイズ（目安 5分）

##### 問1-1 ポリモーフィズムと言えるのはどれ？（複数選択）

**A**

```java
ArrayList<Adventurer> party = new ArrayList<>();
party.add(new Hero("勇者", 100, 20));
party.add(new Wizard("魔法使い", 60, 30));
for (Adventurer m : party) {
    m.attack();
}
```

**B**

```java
ArrayList<Hero> heroes = new ArrayList<>();
heroes.add(new Hero("勇者A", 100, 20));
heroes.add(new Hero("勇者B", 100, 20));
for (Hero h : heroes) {
    h.attack();
}
```

**C**

```java
for (Adventurer m : party) {
    if (m instanceof Hero) {
        System.out.println("勇者の攻撃！");
    } else if (m instanceof Wizard) {
        System.out.println("魔法使いの攻撃！");
    }
}
```

**D**

```java
Adventurer a = new Wizard("魔法使い", 60, 30);
a.attack();
```

<div class="note note--hint">
<span class="note__title">ヒント</span>
「<strong>親の型で持って</strong>」「<strong>型を意識せずに呼ぶ</strong>」の2つがそろっているか？
どれもコンパイルは通ります。「動くかどうか」ではなく「ポリモーフィズムかどうか」で判定してください。
</div>

##### 問1-2 出力クイズ

次のコードを実行すると、何と表示されるでしょうか（ア〜ウから選択）。

```java
ArrayList<Adventurer> party = new ArrayList<>();
party.add(new Hero("勇者", 100, 20));
party.add(new Wizard("魔法使い", 60, 30));
party.add(new Adventurer("見習い", 50, 5));

for (Adventurer m : party) {
    m.attack();
}
```

**ア** ── 変数の型が `Adventurer` だから、全員が親の攻撃

```text
勇者 の攻撃！
魔法使い の攻撃！
見習い の攻撃！
```

**イ** ── `new` した中身のクラスで攻撃が決まる

```text
勇者 は剣で斬りつけた！
魔法使い は呪文を唱えた！
見習い の攻撃！
```

**ウ** ── 最初に入れた `Hero` に合わせて全員が剣攻撃

```text
勇者 は剣で斬りつけた！
魔法使い は剣で斬りつけた！
見習い は剣で斬りつけた！
```

#### 問2 ポリモーフィズムでバトルゲームを作ろう（目安 35分）

`PolyGame.java` の **TODO①〜③** を埋めて、魔王とのバトルゲームを完成させてください。
ゲームループ・入力処理・ダメージ生成・HP管理・勝敗判定は**すべて配布済み**です。

{% cards [
  { "chara":"maou", "name":"魔王", "stats":{ "HP":"250" },
    "lines":["反撃は 15〜30 のランダム","倒れた仲間は名簿から離脱する"] }
], { "caption":"この回の相手。HP 250 を削り切れば勝ち、こちらが全滅すれば負け" } %}

<div class="table-scroll">

| TODO | やること | ポイント |
|---|---|---|
| ① | 冒険者クラスを持つ `ArrayList` の `party` を作成する | リストの型引数は **親（`Adventurer`）** |
| ② | `Hero` / `Wizard` / `Tank` / `Archer` から**好きな3体以上**を `new` して追加する | **違うクラスなのに同じリストに入る**（＝多態的な格納） |
| ③ | `select` 番のキャラを **`Adventurer` 型**で取り出し、`attack()` のダメージを `maou.damage()` に渡す | どのクラスか意識せずに呼ぶ（＝多態的な呼び出し） |

</div>

<div class="note note--hint">
<span class="note__title">ヒント</span>
<ul>
<li>①は図Dのすぐ下のコードそのままです。</li>
<li>②で入れる顔ぶれは自由です。同じクラスを2体入れてもかまいません。</li>
<li>③は2行になります（取り出す行と、ダメージを渡す行）。1行にまとめても正解です。</li>
<li><code>attack()</code> は<strong>ダメージの数値を返す</strong>メソッドです。呼ぶだけでは魔王のHPは減りません。</li>
</ul>
</div>

**このゲームはキーボード入力を使います。** コンソール（コマンドプロンプトやターミナル）から
実行してください。番号を入力して Enter を押すと、そのキャラが攻撃します。

##### できたかの確認

<div class="note note--ok">
<ul>
<li>違うクラスのキャラが、1つのリストに入っている</li>
<li>選んだキャラの<strong>オーバーライドした攻撃</strong>が出る（コードでは <code>attack()</code> としか書いていないのに）</li>
<li>TODO③のコードは、パーティの中身を入れ替えても<strong>1文字も変えずに</strong>動く</li>
</ul>
</div>

##### チャレンジ（早く終わった人向け）

TODO②のパーティ編成を丸ごと入れ替えてみてください（例：弓使い3体、魔法使い2体＋タンク1体など）。
**TODO③以降のコードを一切変えずに**ゲームが成立することを確認してください。
これがポリモーフィズムの威力です。

#### 問3 回復魔法が使えない！？（考察問題・コードは書かない）

`Wizard` には回復魔法 `heal()` があります（配布した `Wizard.java` を見てください）。
そこでゲームに回復コマンドを足そうとして、次のコードを書いてみると……

```java error
Adventurer m = party.get(1);   // 1番の中身は Wizard のはず
m.heal(party.get(0));          // 0番の仲間を回復したい！
```

コンパイルエラーになります。実際に `PolyGame` に足して試してみてください。

```text
エラー: シンボルを見つけられません
        m.heal(party.get(0));
         ^
  シンボル:   メソッド heal(Adventurer)
  場所:      タイプAdventurerの変数 m
```

##### 考えてみよう

1. 中身は間違いなく `Wizard` なのに、なぜ `heal()` が呼べないのでしょうか。
   **自分の言葉で説明してみてください**（ヒント: `attack()` は呼べるのに `heal()` はダメ。2つの違いは？）。
2. `heal()` を使えるようにする案を考えてみてください。
   **第1部の図Kで見たダウンキャスト以外に、あと2つあります。**
   どちらも「呼び出す側」ではなく「**クラスの側**」を変える案です。

<div class="note">

この問題の答え合わせは下の解説で行います。
「**呼べるメソッドは何で決まるのか**」を自分の言葉で説明できればOKです。

</div>

### 実行結果の例

#### 問2

勇者・魔法使い・タンク・弓使いを入れて、`3`（弓使い）を選んだときの1ターン目です。

```text
★ 魔王が現れた！ ★

----- パーティ -----
0: 勇者（HP:100 / ATK:20）
1: 魔法使い（HP:60 / ATK:30）
2: タンク（HP:150 / ATK:5）
3: 弓使い（HP:80 / ATK:15）
魔王（HP:250）
--------------------
攻撃するキャラの番号を入力 >> 3
弓使い は矢を放った！
魔王 は 15 のダメージを受けた！（残りHP: 235）

魔王の反撃！
タンク は 22 のダメージを受けた！（残りHP: 128）
```

<div class="note note--hint">

**魔王の反撃は「誰に」「いくつ」が毎回変わります**（対象はランダム、ダメージは15〜30の乱数）。
上とまったく同じにはならないので、そこは気にしなくて大丈夫です。
**確認するのは、選んだキャラ自身の攻撃メッセージが出ることです。**

パーティの顔ぶれを変えれば、`0:` から始まる一覧も変わります。それが正しい状態です。

</div>

### 解答・解説

<details>
<summary>▶ 問1 の解答を見る</summary>

**問1-1 の正解：A と D**

<div class="table-scroll">

| 選択肢 | 判定 | 解説 |
|---|---|---|
| A | ○ | 親の型のリストに違う子クラスを入れ、型を意識せず `attack()` を呼んでいる。ポリモーフィズムの典型 |
| B | ✕ | 全部 `Hero`（単一の型）。継承もオーバーライドも活きていない、**ただのリスト** |
| C | ✕ | `instanceof` で**型を判別して分岐**している。「型を意識せずに扱う」の真逆で、利点を捨てている書き方 |
| D | ○ | **親の型の変数で子のオブジェクトを持ち**、`attack()` を呼ぶと `Wizard` の攻撃が出る。**リストでなくてもポリモーフィズム**（図E） |

</div>

**C がいちばん学ぶところが多い選択肢です。** C は動きます。エラーにもなりません。
それでもポリモーフィズムではないのは、**キャラが増えるたびに分岐が増える**からです。
9節の「if 分岐地獄」がそのまま起きています。
さらに、C は `attack()` を**呼んでいません**。表示しているのは分岐に書いた固定の文字列なので、
`Hero` の `attack()` をどう書き換えても、この出力は変わりません。

**問1-2 の正解：イ**

```text
勇者 は剣で斬りつけた！
魔法使い は呪文を唱えた！
見習い の攻撃！
```

- 呼ばれるメソッドは**変数の型ではなく、`new` した中身のクラス**で決まります（＝動的束縛、図G）。
- 3体目は `new Adventurer(...)` なので、オーバーライドされていない**親の `attack()`** がそのまま出ます。
- **ア**を選んだ人は、「変数の型は**入口**、動きは**中身**」と覚え直してください。
  入口が同じでも、中身が違えば出てくるものは違います。

</details>

<details>
<summary>▶ 問2 の解答を見る</summary>

```java file=PolyGame.java
// 【TODO①】親の型でリストを作る
ArrayList<Adventurer> party = new ArrayList<>();
```

```java file=PolyGame.java
// 【TODO②】違うクラスを同じリストに追加（多態的な格納）
party.add(new Hero("勇者", 100, 20));
party.add(new Wizard("魔法使い", 60, 30));
party.add(new Tank("タンク", 150, 5));
party.add(new Archer("弓使い", 80, 15));
```

```java file=PolyGame.java
// 【TODO③】多態的な呼び出し
Adventurer attacker = party.get(select);
maou.damage(attacker.attack());
```

③は1行にまとめても正解です。

```java nonum
maou.damage(party.get(select).attack());
```

**つまずきポイント**

<div class="table-scroll">

| よくある詰まり方 | 直し方 |
|---|---|
| ①を `ArrayList<Hero>` にする | ②で `Wizard` が追加できずエラーになる。**リストの型引数は親**（図B・図D） |
| ③で `Hero attacker = party.get(select);` と書く | 「`Adventurer` 型を `Hero` 型に入れられない」というエラー。**取り出しも親の型で**受ける |
| ③で `attacker.attack();` とだけ書く | ダメージを `maou.damage()` に渡し忘れている。**エラーにならないので気づきにくい。** 攻撃メッセージは出るのに魔王のHPが減らないときはこれ |

</div>

<div class="note note--ok">
<span class="note__title">チャレンジをやった人へ ── ここがこの回の結論です</span>

パーティを弓使い3体に変えても、魔法使い2体＋タンクに変えても、
**TODO③のコードは1文字も変わりません。**

変えたのは②だけです。「誰が攻撃するか」は実行時に決まるのに、
呼び出す側のコードはそれを知る必要がない ── **これがポリモーフィズムの威力です。**

</div>

</details>

<details>
<summary>▶ 問3 の解答を見る</summary>

**1. なぜ `heal()` が呼べないのか**

**呼べるメソッドは「変数の型」で決まり、動きは「中身のクラス」で決まる**からです（図J）。

<div class="table-scroll">

| | `attack()` | `heal()` |
|---|---|---|
| `Adventurer`（変数の型）にある？ | **ある** → 呼べる | **ない** → コンパイルエラー |
| 実行したときの動き | 中身（`Wizard`）の攻撃になる | ─ |

</div>

コンパイラは変数の型（`Adventurer`）しか見ません。
`attack()` が多態的に動くのは「**親にも定義があるから呼べて、中身の上書きが実行される**」
という2段構えだからで、`heal()` は親に定義がないので入口の時点で弾かれます。

**2. 使えるようにする案（3通り）**

**案1：ダウンキャスト ── その場しのぎ**（第1部の図Kで見たもの）

```java nonum
Adventurer m = party.get(1);
if (m instanceof Wizard) {
    Wizard w = (Wizard) m;
    w.heal(party.get(0));
}
```

- ○ 親クラスを変更せずに済む
- ✕ **型を意識して分岐**しており、ポリモーフィズムの利点を手放している。回復できるキャラが増えるたびに分岐も増える
- `instanceof` で確認せずにキャストして中身が違うと、実行時に `ClassCastException` で落ちる

**案2：親に入口を作る**

`Adventurer` のほうに `heal()` を定義してしまいます。

```java nonum
// Adventurer に追加
public void heal(Adventurer target) {
    System.out.println(getName() + " は回復魔法を使えない…");
}
```

こうすると `Wizard` の `heal()` は**そのままオーバーライドになります**。
呼ぶ側は `attack()` とまったく同じ形で書けます。

```java nonum
m.heal(party.get(0));   // 誰でも呼べる。Wizard なら回復、他は「使えない…」
```

- ○ 呼び出し側は型を意識しなくてよい（ポリモーフィズムの形を保てる）
- ✕ 回復と無関係なキャラにまで `heal()` が生えるのは、設計として不自然

**案3：メソッドの抽象度を上げる ── `act()` で行動を判別（推奨）**

「攻撃する」「回復する」ではなく、一段抽象的な「**行動する（act）**」を親に置き、
**何をするかは各キャラが自分で決める**形にします。

```java nonum
// Adventurer に追加
public void act(Adventurer target) {
    target.damage(attack());        // 基本の行動＝攻撃
}
```

```java nonum
// Wizard でオーバーライド：状況で行動を判別する
@Override
public void act(Adventurer target) {
    if (getHp() < 30) {             // ピンチなら回復、元気なら攻撃
        heal(this);
    } else {
        target.damage(attack());
    }
}
```

呼ぶ側は、どのキャラでも1行だけです。

```java nonum
for (Adventurer member : party) {
    member.act(maou);   // 攻撃か回復かは、キャラ自身が判断する
}
```

- ○ 呼び出し側は完全に型を意識しない。キャラの個性（行動の判断）はすべてクラス側に閉じ込められる
- ○ **メソッドの抽象度を上げるほど、ポリモーフィズムでできることが広がる**

<div class="note note--hint">

3つの案を並べると、**「分岐をどこに置くか」の話**だと分かります。
案1は呼び出し側に置き、案3はクラスの中に閉じ込めました。
**分岐を持たせる場所をクラス側に寄せるほど、呼び出し側は単純になります。**

案3で残る問題は「親の `act()` に中途半端な実装を書かなければならない」ことです。
[第7回](07-abstract.html)の**抽象メソッド**が、この最後の一手になります。

</div>

</details>

### 次の回へ

**勇者一行を1本のリストで動かす**という、後半4回の目標はこの回で達成されました。
[第7回](07-abstract.html)は、その設計をさらに締める回です。

- [第7回 抽象クラス・インターフェイス](07-abstract.html) — 問3の案2「親に入口を作る」を、
  **書き忘れられない形に強制する**のが抽象メソッドです。
  [第5回](05-inheritance.html)で `new Adventurer("魔王", 300, 30)` と書けてしまったことも、
  そこで回収されます。そして9節の「`instanceof` 分岐は後から壊れる」が、
  実際に壊れる場面として出てきます。
