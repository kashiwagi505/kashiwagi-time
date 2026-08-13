---
order: 5
---
<!--
  本文執筆済み（2026-08-05）。
    設計図      : 00_research/02_content/per-session/session-05.md
    決定        : 00_research/06_decisions/decisions.md 2026-07-31（決定1・5、運用細則、揃える3点）
    図解部品    : site/docs/figures.md（6章に第5回の図と部品の対応表、9章に compare の警告）

    front matter は order: だけ。タイトル「継承・オーバーライド」・呼び名「血脈の書」・
    permalink は src/_data/site.json から自動で入る。

    この回の作りの要点:
    ・決定1（第1部の補強）: 講義スライドは extends / super() / @Override の3点しか扱っておらず、
      多重継承の禁止・has-a と is-a・オーバーロードとの違い・super.メソッド()・
      親の private に子から触れない の5点は演習側にしか無い。→ すべて第1部の図に入れた。
    ・元資料の回番号は「第2回」表記（スライド／REVIEW／演習見出し／解答例の4か所）。第5回に読み替えた。
      スライド2の「REVIEW ─ 第1回」は第4回 ArrayList を指す。
    ・スライド9の「次回：抽象クラス・インターフェイス」は実施順と食い違う。
      次は第6回ポリモーフィズム。元資料の予告は持ち込んでいない。
    ・アーサー／マーリンの立ち絵は存在しないので、3段ツリーは立ち絵なしで組んだ
      （tree の note ＋ NEW! バッジで「新しく作る孫」を示す）。
    ・問題1の B・C・E はコンパイルエラーになること自体が学習内容 → ```java error を使う。
    ・Main2＝リグレッションテスト／Main3＝受け入れテスト、という性質を演習冒頭で説明した。
      Main3 が配布状態でコンパイルできない理由も注記した（decisions.md 補足3）。
    ・解答コードは javac 21.0.10 で実行し、ページの実行結果と文字列一致を確認済み
      （問2は書き換え前後の出力が完全一致、問3・チャレンジ1・2も元資料の期待出力と一致）。
-->

<h2 class="part">第1部 直感的につかむ</h2>

### この回でできるようになること

- 共通の中身（`name` / `hp` / `atk`）を何度も書かずに、`extends` と `super(...)` で親クラスから引き継げるようになる。
- 引き継いだメソッドを `@Override` で子クラスの個性に書き換えられるようになる。
- 「継承している」と「持っている」の違い、親は1つだけであること、親の `private` に子からは触れないことが説明できるようになる。

### 勇者一行で例えると

[第4回](04-arraylist.html)では、勇者一行の全員を **1本の名簿** に入れました。

{% listrow {
  "type":"ArrayList<Adventurer>",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"tank", "name":"タンク" },
    { "chara":"saint", "name":"聖女" }
  ],
  "note":"全員を「冒険者（Adventurer）」として1本のリストに並べた",
  "wide":true,
  "caption":"前回の名簿。4人が同じ ArrayList に入っている"
} %}

でも、よく考えると不思議です。**勇者と魔法使いは中身がちょっと違います。**
剣で斬る人と呪文を唱える人を、どうやって同じ「冒険者」として扱えているのでしょうか。

この回のテーマである <span class="term">継承</span>が、その答えです。
**「冒険者」という土台をひとつ作り、勇者・魔法使い・タンクはそこから生まれる** ── という形にします。

### 図解でつかむ

#### 1. バラバラのクラスで作ると、同じ中身を3回書くことになる

まず、継承を使わずに3人ぶんのクラスを作った場合を見ます。

{% classbox [
  { "name":"Hero", "note":"勇者", "chara":"hero",
    "fields":["name","hp","atk"], "methods":["attack()","damage()","status()"],
    "foot":"つるぎで攻撃する" },
  { "name":"Wizard", "note":"魔法使い", "chara":"wizard",
    "fields":["name","hp","atk"], "methods":["attack()","damage()","status()"],
    "foot":"じゅもんで攻撃する" },
  { "name":"Tank", "note":"タンク", "chara":"tank",
    "fields":["name","hp","atk"], "methods":["attack()","damage()","status()"],
    "foot":"たてで攻撃する" }
], { "legend":true, "wide":true,
     "caption":"図A ── 違うのは攻撃の中身だけ。それ以外の name / hp / atk と damage() / status() は3回まるごと書いている" } %}

3枚を見比べると、**違っているのは攻撃の中身だけ**です。それ以外は同じものを3回書いています。
これは書く手間の問題だけではありません。

<div class="note note--warn">
<span class="note__title">同じものを3回書くと、こうなります</span>
<ul>
<li><strong>仕様が変わったら全クラスを直す羽目になる。</strong> 「HP は 0 未満にならない」という決まりを直したくなったら、3か所とも直さなければなりません。1つ忘れたらそこだけ挙動が違います。</li>
<li><strong>別々のクラスなので、同じリストにまとめられない。</strong> <code>Hero</code> と <code>Wizard</code> に血縁関係がないので、両方を入れられる型が存在しません。前回の名簿が作れなくなります。</li>
</ul>
</div>

#### 2. 共通部分は親から引き継ぐ ── `extends`

そこで、共通の中身だけを持つクラスを**1つ上に置きます**。それが `Adventurer`（冒険者）です。

{% tree {
  "root":{ "name":"Adventurer", "note":"親クラス（冒険者）",
    "fields":["name","hp","atk"], "methods":["attack()","damage()","status()"] },
  "children":[
    { "name":"Hero", "note":"書かなくても持っている！", "chara":"hero" },
    { "name":"Wizard", "note":"書かなくても持っている！", "chara":"wizard" },
    { "name":"Tank", "note":"書かなくても持っている！", "chara":"tank" }
  ],
  "edge":"extends（継承）",
  "legend":true,
  "wide":true,
  "caption":"図B ── この回の中心の図。子クラスには name / hp / atk も damage() / status() も書いていない。それでも持っている"
} %}

- <span class="term">親クラス（スーパークラス）</span> ── 共通部分を持っている側。ここでは `Adventurer`。
- <span class="term">子クラス（サブクラス）</span> ── 親から引き継ぐ側。ここでは `Hero` / `Wizard` / `Tank`。
- <span class="term">`extends`</span> ── 「このクラスの能力を受け継ぐ」という宣言。`class 子 extends 親` と書く。

大事なのは、**子クラスのコードには `name` も `hp` も `atk` も1文字も書かれていない**という点です。
それでも子は全部持っています。だから **1か所直せば、全員に反映されます。**

#### 3. `super(...)` ── 作るときの値は親に渡す

引き継いだ `name` / `hp` / `atk` に最初の値を入れるのは、**親のコンストラクタの仕事**です。
子は受け取った値を親に横流しします。その受け渡しに使うのが <span class="term">`super(...)`</span> です。

{% flow [
  { "t":"new Hero(名前, HP, 攻撃力)", "tone":"action", "d":"外のコードが3つの値を渡す" },
  { "t":"Hero のコンストラクタ", "arrow":"受け取る", "chara":"hero",
    "d":"自分ではフィールドに入れない（そもそも持っていない）" },
  { "t":"Adventurer のコンストラクタ", "arrow":"super(name, hp, atk)", "arrowTone":"action",
    "tone":"info", "d":"name / hp / atk に値を入れるのは親の仕事" }
], { "wide":true, "caption":"図C ── new に渡した値は、子を通り抜けて親まで流れる。継承したらまず super、と覚える" } %}

<div class="note note--warn">
<span class="note__title">この回で最も多いつまずき</span>

`super(...)` を書き忘れると、コンパイルの時点で止まります。
Java は `super(...)` が書かれていないとき、**引数なしの `super()` を自動で呼ぼうとします**。
ところが `Adventurer` には引数なしのコンストラクタがないので、呼ぶ相手が見つかりません。

</div>

```java error
public class Hero extends Adventurer {
    public Hero(String name, int hp, int atk) {
        // super(...) を書かなかった
        // → 「Adventurer のコンストラクタは指定された型に適用できません」
        //    期待値: String, int, int / 検出値: 引数がありません
    }
}
```

`super` にはもう1つの使い方があります。**親のメソッドの中身をそのまま呼ぶ** `super.メソッド()` です。
上書きした子のメソッドの中から、上書きされる前の処理を呼び出せます。

{% codeout { "wide":true, "caption":"図D ── super.attack() で親の処理を先に走らせてから、自分の処理を続けている。2行出るのがその証拠" } %}
{% panel "子クラスの attack() の中で" %}
```java nonum
@Override
public int attack() {
    super.attack();
    System.out.println(getName() + " は呪文を唱えた！");
    return getAtk();
}
```
{% endpanel %}
{% panel "実行結果" %}
```text
魔法使い の攻撃！
魔法使い は呪文を唱えた！
```
{% endpanel %}
{% endcodeout %}

<div class="note">

`super(...)`（丸括弧）は**コンストラクタの呼び出し**で、コンストラクタの先頭にしか書けません。
`super.attack()`（ドット）は**メソッドの呼び出し**で、どこにでも書けます。
形が似ているだけで、別のものです。

</div>

#### 4. 「継承している」と「持っている」は違う ── is-a と has-a

継承と間違えやすいのが、**フィールドとして親を持つ**書き方です。見た目は似ていますが、まったく別です。

{% compare { "axis":"v", "vs":"こちらは継承ではない ↓", "wide":true, "legend":["o","x"],
  "caption":"図E ── 上は「勇者は冒険者の一種」（is-a）。下は「聖女は冒険者を1人持っている」（has-a）。持っているだけでは、その能力は自分のものにならない" } %}
{% panel "is-a ── 勇者は冒険者の一種", { "sub":"これが継承", "tone":"ok", "mark":"o" } %}
{% tree {
  "root":{ "name":"Adventurer", "note":"親", "methods":["status()"] },
  "children":[ { "name":"Hero", "chara":"hero", "note":"status() をそのまま使える" } ],
  "edge":"extends"
} %}
{% endpanel %}
{% panel "has-a ── 聖女は冒険者を1人持っている", { "sub":"これは継承ではない", "tone":"danger", "mark":"x" } %}
{% classbox {
  "name":"Saint", "note":"聖女",
  "fields":[ { "t":"base : Adventurer", "note":"フィールドとして1人持っているだけ" } ],
  "foot":"Saint 自身は status() を持っていない。base.status() と書くしかない"
} %}
{% endpanel %}
{% endcompare %}

- <span class="term">is-a</span> ── 「A は B の一種である」という関係。これが継承にあたる。勇者は冒険者の一種。
- <span class="term">has-a</span> ── 「A は B を持っている」という関係。継承ではない。

**判断のしかたは日本語にして読むだけです。** 「勇者は冒険者だ」は成り立つので継承にできます。
「聖女は冒険者を持っている」は「〜だ」の形にならないので、継承ではありません。

#### 5. 親は1つだけ ── 多重継承はできない

`extends` のうしろに書けるクラスは、**1つだけ**です。カンマで2つ並べることはできません。

{% fig { "legend":["o","x"], "wide":true,
  "caption":"図F ── 親は1つだけ。これを多重継承の禁止という" } %}
{% box "class Hero extends Adventurer", { "sub":"親は1つ", "tone":"ok", "mark":"o" } %}
冒険者の能力を受け継ぐ。継承の正しい形。
{% endbox %}
{% box "class Tank extends Adventurer, Hero", { "sub":"親が2つ", "tone":"danger", "mark":"x" } %}
Java は <span class="term">多重継承</span>を許していない。
2つの親が同じ名前のものを持っていたとき、どちらを引き継ぐのか決められなくなるため。
{% endbox %}
{% endfig %}

```java error
// extends のうしろにカンマは書けない
public class Tank extends Adventurer, Hero {
}
```

<div class="note note--hint">

「親は1つ」という制限は、実は窮屈ではありません。
[第7回](07-abstract.html)で出てくる**インターフェイス**は、親とは別枠でいくつでも付けられます。
「血筋は1つ、装備はいくつでも」というイメージです。

</div>

#### 6. でも、攻撃はキャラごとに違う

ここまでで共通部分は片づきました。ところが `attack()` も親から引き継いでいるので、
**このままでは3人とも親の攻撃をします。**

{% fanout {
  "input":{ "t":"attack()", "sub":"親の attack() をそのまま使うと" },
  "outputs":[
    { "chara":"hero", "name":"Hero", "t":"勇者 の攻撃！", "sub":"剣で斬りたいのに…" },
    { "chara":"wizard", "name":"Wizard", "t":"魔法使い の攻撃！", "sub":"呪文を唱えたいのに…" },
    { "chara":"tank", "name":"Tank", "t":"タンク の攻撃！", "sub":"盾で守りたいのに…" }
  ],
  "edge":"中身は親のまま",
  "note":"名前は入れ替わるが、文型は3人とも同じ。剣も呪文も盾も出てこない",
  "wide":true,
  "caption":"図G ── 引き継いだままだと、全員おなじ攻撃になる"
} %}

#### 7. オーバーライド ── 自分流に上書きする

**親と同じ名前・同じ形のメソッドを子クラスに書くと、中身が置き換わります。**
これが <span class="term">オーバーライド</span>で、`@Override` を付けて書きます。

{% compare { "axis":"v", "vs":"同じ形で子クラスに書くと ↓", "wide":true,
  "caption":"図H ── メソッドの名前・引数・戻り値の型がそろっていることが条件。そろっていれば、呼ばれるのは子の側になる" } %}
{% panel "親 Adventurer の attack()", { "sub":"引き継がれるもとの中身" } %}
```java nonum
public int attack() {
    System.out.println(name + " の攻撃！");
    return atk;
}
```
{% endpanel %}
{% panel "子 Hero の attack()", { "sub":"中身が置き換わる", "tone":"ok" } %}
```java nonum
@Override
public int attack() {
    System.out.println(getName() + " は剣で斬りつけた！");
    return getAtk();
}
```
{% endpanel %}
{% endcompare %}

- <span class="term">`@Override`</span> ── 「これは親のメソッドの上書きです」という宣言。
  付けなくても上書きは成立しますが、**付けておくと上書きに失敗したときコンパイラが教えてくれます。**

3人それぞれが `attack()` を上書きすると、図Gがこう変わります。

{% fanout {
  "input":{ "t":"attack()", "sub":"子クラスで @Override すると" },
  "outputs":[
    { "chara":"hero", "name":"Hero", "t":"勇者 は剣で斬りつけた！", "tone":"ok" },
    { "chara":"wizard", "name":"Wizard", "t":"魔法使い は呪文を唱えた！", "tone":"ok" },
    { "chara":"tank", "name":"Tank", "t":"タンク は盾を構えて体当たり！", "tone":"ok" }
  ],
  "edge":"子クラスごとに違う結果",
  "note":"呼び出しているのは、どれも同じ attack() のまま",
  "wide":true,
  "caption":"図I ── 図Gと見比べてください。変えたのは attack() の中身だけ。呼び出し側は1文字も変えていない"
} %}

#### 8. オーバーライドとオーバーロードは別のもの

名前が似ていますが、別の話です。**引数の形がそろっているかどうか**で決まります。

{% compare { "vs":"VS", "wide":true, "legend":["o","x"],
  "caption":"図J ── 左は親と同じ形なので上書きになる。右は引数が増えているので「別のメソッド」として追加されるだけ" } %}
{% panel "オーバーライド（上書き）", { "sub":"親と同じ形", "tone":"ok", "mark":"o" } %}
```java nonum
// 引数なし・int を返す ← 親と同じ
@Override
public int attack() {
    return getAtk();
}
```
{% endpanel %}
{% panel "オーバーロード（別のメソッド）", { "sub":"引数が違う", "tone":"danger", "mark":"x" } %}
```java error
// 引数が1つある ← 親に同じ形が無い
@Override
public int attack(int power) {
    return power;
}
```
{% endpanel %}
{% endcompare %}

同じ名前で受け取るものを変えるのは [第2回](02-overload.html)の**オーバーロード**です。
上のコードは Java として間違いではなく、`attack(int)` という**新しいメソッドが増えるだけ**です。
上書きにはなりません。

<div class="note note--hint">
<span class="note__title">これが <code>@Override</code> を付ける理由です</span>

`@Override` を付けておくと、上のコードは「上書きするメソッドが親に見つからない」という
コンパイルエラーになります。**上書きし損なったことを、実行する前に教えてもらえる**わけです。
`@Override` を書かなければ静かに通ってしまい、「上書きしたつもりなのに親の攻撃が出る」という
原因の分かりにくい不具合になります。

</div>

#### 9. 親の `private` は、子からも直接触れない

図Hの子クラスが `name` ではなく `getName()` を使っていたのに気づいたでしょうか。
`Adventurer` の `name` / `hp` / `atk` は `private` です。
**`private` は「そのクラスの外からは触れない」なので、子クラスからも触れません。**

{% capsule {
  "name":"Adventurer", "note":"親クラス",
  "inside":[
    { "t":"name", "value":"勇者" },
    { "t":"hp", "value":"100" },
    { "t":"atk", "value":"20" }
  ],
  "gates":[ "getName()", "getHp()", "getAtk()", "setHp(int hp)" ],
  "outside":"子クラス Hero", "outsideChara":"hero",
  "arrowLabel":"窓口を通す",
  "legend":["private","gate"],
  "wide":true,
  "caption":"図K ── 子クラスであっても、親の中身に直接手は入らない。使えるのは窓口メソッドだけ" } %}

```java error
// name は Adventurer の private。子の Hero からでも直接は読めない
System.out.println(name + " は剣で斬りつけた！");
```

```java nonum
// 窓口メソッドを通す
System.out.println(getName() + " は剣で斬りつけた！");
```

HP を減らしたいときも同じです。`hp -= 10;` とは書けないので、**取り出して計算し、入れ直します。**

```java nonum
setHp(getHp() - 10);
```

<div class="note">

[第3回](03-encapsulation.html)の「そのクラスの外は、子であっても外」がここに出てきました。
不便に見えますが、**親が決めたルール（`setHp()` の中のチェックなど）を子も必ず通る**ということです。

</div>

#### 10. まとめ ── 原形はそのまま、中身は個性に

{% codeout { "wide":true, "caption":"図L ── 呼び出し方は3行とも同じ形。それでも結果はキャラごとに変わる" } %}
{% panel "呼び出し方は全員同じ" %}
```java nonum
hero.attack();
wizard.attack();
tank.attack();
```
{% endpanel %}
{% panel "結果はキャラごとに変わる" %}
```text
勇者 は剣で斬りつけた！
魔法使い は呪文を唱えた！
タンク は盾を構えて体当たり！
```
{% endpanel %}
{% endcodeout %}

{% steps [
  { "t":"継承（extends）", "d":"共通部分（name / hp / atk）を親からそのまま引き継ぐ" },
  { "t":"super(...)", "d":"親のコンストラクタに初期値を渡す。継承したらまずこれ" },
  { "t":"オーバーライド（@Override）", "d":"親のメソッドを自分の個性に合わせて上書きする" },
  { "t":"原形はそのまま", "d":"呼び出し方は同じ、中身だけキャラごとに変わる", "chara":"hero" }
], { "wide":true, "caption":"図M ── 継承 ＋ オーバーライド ＝ 原形をとどめたまま、別のオブジェクトを作れる" } %}

### コードで見るとこうなる

図Bから図Iまでを、`Hero` クラス1本にまとめると次のかたちです。
**行ごとに読み解く必要はありません。** 図で見たものがコードのどこに出ているかだけ確認してください。

```java file=Hero.java hl=1,4,7
public class Hero extends Adventurer {

    public Hero(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は剣で斬りつけた！");
        return getAtk();
    }
}
```

<div class="table-scroll">

| 図の中の呼び名 | コードでの書き方 |
|---|---|
| 親から引き継ぐ（図B） | `extends Adventurer`（強調した1行目） |
| 作るときの値を親に渡す（図C） | `super(name, hp, atk);`（強調した4行目） |
| 自分流に上書きする（図H） | `@Override`（強調した7行目）＋ 親と同じ形の `attack()` |
| 親の `private` には触れない（図K） | `getName()` / `getAtk()` を通している |
| 書いていないのに持っているもの | `name` / `hp` / `atk` / `damage()` / `status()` |

</div>

**このクラスに `name` も `hp` も `atk` も書かれていません。** それでも
`hero.status()` は動きます ── 親が持っているからです。

<h2 class="part">第2部 実際に使ってみる</h2>

### 演習

3問あります。**問1はコードを読むクイズ、問2は改造、問3は新規作成**です。
1問ぶんのファイルを同じ場所に置いて、`javac` でコンパイルして進めてください。

<div class="table-scroll">

| ファイル | すること |
|---|---|
| [Adventurer.java](../downloads/05-inheritance/Adventurer.java) | **変更しない。** 全問共通の親クラス（第4回と同じもの） |
| [Hero.java](../downloads/05-inheritance/Hero.java) ／ [Wizard.java](../downloads/05-inheritance/Wizard.java) ／ [Tank.java](../downloads/05-inheritance/Tank.java) | **問2で書き直す。** いまは継承を使っていない状態 |
| [Main2.java](../downloads/05-inheritance/Main2.java) | **変更しない。** 問2の動作確認 |
| [Main3.java](../downloads/05-inheritance/Main3.java) | **変更しない。** 問3の動作確認 |

</div>

<div class="note note--hint">
<span class="note__title">Main2 と Main3 は、書き換えてはいけない「テスト」です</span>
<ul>
<li><strong><code>Main2.java</code> は問2の答え合わせ役。</strong> 書き換える<strong>前に一度実行して出力を控えておき</strong>、書き換えた後の出力と1文字も違わないことを確認します。<strong>Main が固定されているから「同じ結果」が保証の意味を持ちます。</strong></li>
<li><strong><code>Main3.java</code> は問3の仕様書。</strong> 下の「実行結果の例」と一致することが、<code>Arthur</code> / <code>Merlin</code> の合格条件です。</li>
<li>番号が 2 から始まるのは、問1がコードを読むクイズで実行を伴わないためです（<code>Main1.java</code> は存在しません）。</li>
</ul>
</div>

<div class="note note--warn">
<span class="note__title">配布した状態では <code>Main3.java</code> だけがコンパイルできません（それが正常です）</span>

`Main3.java` は、これから作る `Arthur` / `Merlin` を使っています。**まだ存在しないクラスを
呼んでいるだけで、壊れているわけではありません。** 問3に着手するまではそのままで問題ありません。

`Adventurer` / `Hero` / `Wizard` / `Tank` / `Main2` の5ファイルは**配布した状態でそのまま
コンパイル・実行できます。** 問2は「動いているものを書き換える」ところから始められます。

</div>

#### 問1 継承できているのはどれ？（目安 5分）

A〜E のうち、**正しく継承（オーバーライド）できているもの**をすべて選んでください。
`extends` の使い方だけに注目します。**コンストラクタなどは省略してあります。**

**A**

```java
public class Hero extends Adventurer {
}
```

**B**

```java error
public class Wizard extend Adventurer {
}
```

**C**

```java error
public class Tank extends Adventurer, Hero {
}
```

**D**

```java
public class Saint {
    Adventurer base = new Adventurer("聖女", 70, 10);
}
```

**E**

```java error
public class Archer extends Adventurer {
    @Override
    public int attack(int power) {
        return power;
    }
}
```

<div class="note note--hint">
<span class="note__title">ヒント</span>
B はスペル、C は親の数、D は「持っている」だけ？、E はメソッドの形（引数）に注目。
</div>

#### 問2 継承でコードをダイエットさせよう（目安 15分）

配布した `Hero.java` / `Wizard.java` / `Tank.java` は、**継承を使わずに** `Adventurer` と
ほぼ同じ内容を3回書いてしまっています。1クラス約40行です。

```java file=Hero.java hl=9-11,19-23,31-35,37-39
/**
 * 【問題2】このクラスを Adventurer を継承して書き直そう
 *
 * いまは Adventurer とほぼ同じ内容を全部自分で書いている状態。
 * extends を使えば、残すのは「コンストラクタ」と「attack()」だけになるはず！
 * ※ Main2 の実行結果が書き換え前と同じになれば成功
 */
public class Hero {
    private String name;
    private int hp;
    private int atk;

    public Hero(String name, int hp, int atk) {
        this.name = name;
        this.hp = hp;
        this.atk = atk;
    }

    public String getName() { return name; }
    public int getHp()      { return hp; }
    public int getAtk()     { return atk; }
    public void setName(String name) { this.name = name; }
    public void setHp(int hp)        { this.hp = hp; }

    // 勇者だけの攻撃メッセージ
    public int attack() {
        System.out.println(name + " は剣で斬りつけた！");
        return atk;
    }

    public void damage(int d) {
        hp -= d;
        if (hp < 0) hp = 0;
        System.out.println(name + " は " + d + " のダメージを受けた！（残りHP: " + hp + "）");
    }

    public String status() {
        return name + "（HP:" + hp + " / ATK:" + atk + "）";
    }
}
```

**金色の行はすべて `Adventurer` にあるものです。** この3クラスを `extends Adventurer` で
書き直して、金色の行を消してください。

ルールは3つです。

1. `Main2.java` の実行結果が、書き換える**前とまったく同じ**になること
2. 各クラスに残ってよいのは「**コンストラクタ**」と「**`attack()`**」だけ
3. `attack()` には **`@Override`** を付けること

骨組みはこの形です。

```java nonum
// 骨組みはこの形（残るのは10行くらいのはず！）
public class Hero extends Adventurer {

    public Hero(String name, int hp, int atk) {
        // ▼▼ ここで親に初期値を渡す（super）
    }

    // ▼▼ ここに @Override を付けて attack() を書く
    //    name は親の private なので getName() を使う
    //    戻り値は getAtk() を返す
}
```

`Wizard` と `Tank` も同じ形です。**違うのは `attack()` のメッセージだけ**で、
それぞれ「`は呪文を唱えた！`」「`は盾を構えて体当たり！`」になります。

**確認:** 書き換え前後で行数を数えてみてください。約40行 → 約12行になれば大成功です。

#### 問3 伝説の勇者アーサーと大魔法使いマーリン（目安 25分）

継承は**さらに継承**できます。子クラスをさらに継承したものを <span class="term">孫クラス</span>と呼びます。

{% tree {
  "root":{ "name":"Adventurer", "note":"親", "methods":["attack()","damage()","status()"] },
  "children":[
    { "name":"Hero", "chara":"hero", "note":"勇者",
      "children":[ { "name":"Arthur", "mark":"new", "note":"アーサー／新しく作る",
        "methods":[ { "t":"attack() を上書き", "tone":"gold" } ] } ] },
    { "name":"Wizard", "chara":"wizard", "note":"魔法使い",
      "children":[ { "name":"Merlin", "mark":"new", "note":"マーリン／新しく作る",
        "methods":[ { "t":"attack() を上書き", "tone":"gold" } ] } ] },
    { "name":"Tank", "chara":"tank", "note":"タンク" }
  ],
  "edge":"extends",
  "wide":true,
  "caption":"図N ── 3段の継承。アーサーは Hero を継承し、Adventurer から見れば孫にあたる。継承元を間違えて Adventurer にしないよう、この図で確認してください"
} %}

`Arthur.java` と `Merlin.java` を**新規作成**してください。動作確認は `Main3.java` で行います。

<div class="table-scroll">

| `Arthur` クラス | 内容 |
|---|---|
| 継承元 | **`Hero`（勇者クラス）** |
| コンストラクタ | 名前・HP・ATK を受け取り、親に渡す |
| `attack()` | オーバーライドする。「`アーサー は聖剣エクスカリバーを振るった！`」と表示し、**`atk` の2倍**のダメージを返す |

</div>

<div class="table-scroll">

| `Merlin` クラス | 内容 |
|---|---|
| 継承元 | **`Wizard`（魔法使いクラス）** |
| コンストラクタ | 名前・HP・ATK を受け取り、親に渡す |
| `attack()` | オーバーライドする。「`マーリン は古代魔法を唱えた！`」と表示し、反動で**自分のHPが10減り**「`（反動で HP が 10 減った 残りHP: 60）`」と表示、**`atk` の3倍**のダメージを返す |

</div>

<div class="note note--hint">
<span class="note__title">ヒント</span>
<ul>
<li><code>atk</code> や <code>hp</code> は親の <code>private</code> なので、<code>getAtk()</code> / <code>getHp()</code> / <code>setHp()</code> を使います（図K）。</li>
<li>HP を10減らす書き方は <code>setHp(getHp() - 10);</code> です。</li>
<li>表示の全角記号・全角スペースが1文字違うだけで「結果が一致しない」ことになります。<strong>メッセージは上の表からコピーするのが確実です。</strong></li>
</ul>
</div>

**注目してほしいところ:** `status()` は一度も書いていないのに、孫のアーサーでも使えます。
`Adventurer` から**2段階受け継いでいる**からです。

#### チャレンジ（早く終わった人向け）

1. `Arthur` の `attack()` の**最初**に `super.attack();` を追加すると何が起きるでしょうか。
   実行して確かめてください（図D の形です）。
2. [第4回](04-arraylist.html)の名簿に、孫クラスを入れてみてください。

```java nonum
ArrayList<Adventurer> heroList = new ArrayList<>();
heroList.add(arthur);   // 入る？
heroList.add(merlin);   // 入る？
for (Adventurer member : heroList) {
    member.attack();    // 誰の攻撃が出る？
}
```

### 実行結果の例

#### 問2

`Main2.java` の出力です。**書き換える前と後で、これが完全に同じになれば成功**です。

```text
勇者 は剣で斬りつけた！
魔法使い は呪文を唱えた！
タンク は盾を構えて体当たり！
勇者（HP:100 / ATK:20）
魔法使い（HP:60 / ATK:30）
タンク（HP:150 / ATK:5）
```

#### 問3

`Main3.java` を実行して、こうなれば成功です。

```text
アーサー（HP:120 / ATK:25）
マーリン（HP:70 / ATK:35）
--------------------
アーサー は聖剣エクスカリバーを振るった！
魔王 は 50 のダメージを受けた！（残りHP: 250）
マーリン は古代魔法を唱えた！
（反動で HP が 10 減った 残りHP: 60）
魔王 は 105 のダメージを受けた！（残りHP: 145）
```

<div class="note note--hint">

数字は検算できます。魔王の HP は 300。アーサーは 25 × 2 = 50 なので残り 250。
マーリンは 35 × 3 = 105 なので 250 − 105 = 145 です。

</div>

### 解答・解説

<details>
<summary>▶ 問1 の解答を見る</summary>

**正解：A のみ**

<div class="table-scroll">

| 選択肢 | 判定 | 解説 |
|---|---|---|
| A | ○ | `extends 親クラス名` の正しい形 |
| B | ✕ | `extend`（s が無い）→ コンパイルエラー |
| C | ✕ | Java は**多重継承できない**（親は1つだけ） |
| D | ✕ | `Adventurer` を**持っている**だけで継承ではない。`Saint` 自身は `status()` を使えない |
| E | ✕ | 引数が違うのでオーバーライドにならない（別メソッド＝オーバーロード）。`@Override` を付けているため**コンパイルエラーになる** |

</div>

**E がいちばん学ぶところが多い選択肢です。** `@Override` を外せばこのコードは通ります。
ただし通ったところで、それは `attack(int)` という別のメソッドが増えただけで、
`attack()` を呼んだときに出るのは親の攻撃のままです。
**`@Override` を付けておいたおかげで、上書きし損なったことに気づけた**わけです。

なお A は「`extends` の使い方」としては正解ですが、**このまま書くとコンパイルは通りません。**
コンストラクタを省略しているためです。`Adventurer` に引数なしのコンストラクタが無いので、
実際には `super(...)` を呼ぶコンストラクタが必要です（図C）。

</details>

<details>
<summary>▶ 問2 の解答を見る</summary>

3クラスとも同じ形です。`attack()` のメッセージだけが違います。

```java file=Hero.java
public class Hero extends Adventurer {

    public Hero(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は剣で斬りつけた！");
        return getAtk();
    }
}
```

```java file=Wizard.java
public class Wizard extends Adventurer {

    public Wizard(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は呪文を唱えた！");
        return getAtk();
    }
}
```

```java file=Tank.java
public class Tank extends Adventurer {

    public Tank(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は盾を構えて体当たり！");
        return getAtk();
    }
}
```

40行 → 12行になりました。3クラスで約120行が約36行です。

**つまずきポイント**

<div class="table-scroll">

| よくある詰まり方 | 直し方 |
|---|---|
| `super(name, hp, atk);` を書かない | 「`Adventurer` のコンストラクタは指定された型に適用できません」というエラーになる。**継承したらまず `super`**（図C） |
| `attack()` の中で `name` をそのまま使う | 親の `private` なのでエラー。**`getName()` を使う**（図K） |
| フィールド（`name` / `hp` / `atk`）を子クラスにも残してしまう | コンパイルは通るが二重持ちになる。親のものと子のものが別々に存在し、`status()` の表示と食い違う。**「残すのはコンストラクタと `attack()` だけ」** のルールで防ぐ |

</div>

**この問題の本当のねらいは、出力が変わらないことです。** 見た目の動きは1文字も変えずに、
中身だけを整える ── これをリファクタリングと呼びます。
`Main2.java` を書き換えないというルールがあるから、「同じ結果になった」ことが保証の意味を持ちます。

</details>

<details>
<summary>▶ 問3 の解答を見る</summary>

```java file=Arthur.java hl=1
public class Arthur extends Hero {

    public Arthur(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は聖剣エクスカリバーを振るった！");
        return getAtk() * 2;
    }
}
```

```java file=Merlin.java hl=1,10
public class Merlin extends Wizard {

    public Merlin(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は古代魔法を唱えた！");
        setHp(getHp() - 10);
        System.out.println("（反動で HP が 10 減った 残りHP: " + getHp() + "）");
        return getAtk() * 3;
    }
}
```

**つまずきポイント**

<div class="table-scroll">

| よくある詰まり方 | 直し方 |
|---|---|
| `extends Adventurer` にしてしまう | 動くが仕様と違う。「勇者を継承した孫」なので `extends Hero`（図N で確認） |
| `Merlin` の HP 減少を `hp -= 10;` と書く | 親の `private` なのでエラー。**`setHp(getHp() - 10)`** |
| 表示の全角記号・全角スペースが違う | 出力が一致しない。メッセージは問題文からコピーする |

</div>

**書いていないメソッドが動くことに注目してください。** `Arthur` に書いてあるのは
コンストラクタと `attack()` だけです。それでも `Main3.java` の `arthur.status()` は動き、
`maou.damage(...)` も動きます。`status()` と `damage()` は2段上の `Adventurer` にあるものです。

<div class="note">

`Main3.java` は魔王を `new Adventurer("魔王", 300, 30)` と作っています。
つまり<strong>「冒険者」そのもののオブジェクトが作れている</strong>わけです。
[第7回](07-abstract.html)では、これが「作れてしまうのが困る」という話として出てきます。
そのときこのコードを思い出してください。

</div>

</details>

<details>
<summary>▶ チャレンジの答えを見る</summary>

**1. `super.attack();` を追加すると**

親（＝勇者）の攻撃が**先に**表示されます。

```text
アーサー は剣で斬りつけた！
アーサー は聖剣エクスカリバーを振るった！
```

`super.メソッド()` で、上書きされる前の親の処理を呼び出せます（図D）。
**上書きは「消す」ことではなく「置き換える」ことなので、元の処理はちゃんと残っています。**

**2. 孫クラスを `ArrayList<Adventurer>` に入れると**

どちらも入ります。孫クラスも「冒険者の一種」（is-a）だからです。
拡張for文で `member.attack()` を呼ぶと、**それぞれがオーバーライドした攻撃**が出ます。

```text
アーサー は聖剣エクスカリバーを振るった！
マーリン は古代魔法を唱えた！
（反動で HP が 10 減った 残りHP: 60）
```

`member` の型は `Adventurer` です。**`Adventurer` として受け取っているのに、動くのは
アーサーとマーリンの `attack()`。** これが次の回のテーマそのものです。

</details>

### 次の回へ

[第6回 ポリモーフィズム](06-polymorphism.html)は、チャレンジ2で起きたことを正面から扱う回です。
**親の型（`Adventurer`）でまとめて受け取っておきながら、動くのは中身のクラスのメソッド** ──
この仕組みに名前を付け、`if` の分岐だらけにならないプログラムの書き方につなげます。

- [第6回 ポリモーフィズム](06-polymorphism.html) — この回で作った `Hero` / `Wizard` / `Tank` が、そのまま出発点になります
- [第7回 抽象クラス・インターフェイス](07-abstract.html) — 「親は1つだけ」の制限を、インターフェイスがどう補うか。
  そして `new Adventurer("魔王", 300, 30)` ができてしまうことが、なぜ問題なのか
