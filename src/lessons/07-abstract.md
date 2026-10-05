---
order: 7
---
<!--
  本文執筆済み（2026-08-06）。**全7回の最終回。**
    設計図      : 00_research/02_content/per-session/session-07.md
    決定        : 00_research/06_decisions/decisions.md 2026-07-31（決定1・5、運用細則、揃える3点、
                  「配布ソース整備の実施結果」補足2・補足5）
    図解部品    : site/docs/figures.md（6章に第7回の対応表、5章 chara の警告、9章 compare の警告）

    front matter は order: だけ。タイトル「抽象クラス・インターフェイス」・呼び名「契約の書」・
    permalink は src/_data/site.json から自動で入る。

    この回の作りの要点:
    ・決定1（第1部の補強）: 講義スライドは宣言の書き方までしか扱っておらず、
      ①抽象クラスは型としては使える ②抽象メソッドは全子クラスに及ぶ
      ③インターフェイス型へのキャスト ④インターフェイスはクラスの系譜と無関係
      の4点が演習・解答例側にしか無い。→ すべて第1部の図（図E・図H・図K・図L）に入れた。
    ・元資料の回番号は5か所ズレている（スライド1「第3回」／スライド2「REVIEW 第1・2回」／
      演習見出し「第3回」／解答例「第4回ポリモーフィズム」／PolyGame2.java のコメント「第3回」）。
      ページ上はすべて実施回に読み替えた。PolyGame2.java は配布ファイルなので原本のまま＋注記で処理。
    ・スライド10の「次回：ポリモーフィズム」は成立しない（最終回）。
      → 「全7回の締めくくり」を新規に書いた。**元資料に対応する文章は存在せず、全文が新規。**
    ・不整合の扱い: 講義の void specialSkill() ではなく演習・配布ソース側の int specialAttack() に統一。
      Wizard は「自分のHPを30回復」（講義の「全体回復魔法」ではなく配布 Wizard.heal の実挙動）。
    ・チャレンジの矛盾（Archer に Excalibur を付けると三連矢が出ない）は
      decisions.md 補足5 のとおり修正せず教材として活かした（第6回の instanceof の話の回収）。
    ・Excalibur.java / Flyable.java は配布しない（補足2）。ページに「意図的」と明記した。
    ・聖剣は holy-sword（実際にスライドで使われた版）を使用。
    ・javac 21.0.10 で全手順を実機再現済み。ページに載せたコンパイルエラー文・実行結果はすべて実測値。
      魔王の反撃は乱数なので、反撃行はページに載せていない（あるいは「毎回変わる」と明記した）。
-->

<h2 class="part">第1部 直感的につかむ</h2>

### この回でできるようになること

- `abstract` を付けて「概念だけのクラス」を作り、**中途半端な実体が生まれないようにできる**ようになる。
- 中身を書かないメソッド（抽象メソッド）で、**子クラス全員に実装を強制**できるようになる。
- インターフェイス（`implements`）で「できることの約束」を、**血筋とは別枠でいくつでも**付けられるようになる。

### 勇者一行で例えると

ここまでの2回で、勇者一行はこういう形になりました。

{% tree {
  "root":{ "name":"Adventurer", "note":"親クラス（冒険者）",
    "fields":["name","hp","atk"], "methods":["attack()","damage()","status()"] },
  "children":[
    { "name":"Hero", "chara":"hero", "note":"勇者" },
    { "name":"Wizard", "chara":"wizard", "note":"魔法使い" },
    { "name":"Tank", "chara":"tank", "note":"タンク" },
    { "name":"Archer", "chara":"archer", "note":"弓使い" }
  ],
  "edge":"extends",
  "wide":true,
  "caption":"図A ── 第5回でつくった継承の形。共通部分は親に置き、attack() だけを子で上書きしている"
} %}

{% listrow {
  "type":"ArrayList<Adventurer>",
  "items":[
    { "chara":"hero", "name":"勇者" },
    { "chara":"wizard", "name":"魔法使い" },
    { "chara":"tank", "name":"タンク" },
    { "chara":"archer", "name":"弓使い" }
  ],
  "note":"親の型でまとめて持てるので、attacker.attack() の1行で全員ぶんの攻撃が書けた",
  "wide":true,
  "caption":"図B ── 第6回でつくった名簿。ここまでは順調に見える"
} %}

ところが、この土台になっている `Adventurer` には落とし穴があります。
**「冒険者」そのもののオブジェクトが、作れてしまう**のです。

### 図解でつかむ

#### 1. 「冒険者」のオブジェクトが作れてしまう

`Adventurer` はふつうのクラスなので、こう書けば1行で実体ができます。

```java nonum
Adventurer ren = new Adventurer("れん", 80, 10);
```

{% fig { "wide":true, "legend":[{ "label":"職業が決まっていない", "tone":"dim" }],
  "caption":"図C ── 名前もHPも攻撃力も持っているのに、勇者なのか魔法使いなのかが決まっていない実体ができてしまう" } %}
{% cards [
  { "chara":"silhouette", "name":"れん", "role":"Adventurer", "mark":"q",
    "stats":{ "HP":"80", "ATK":"10" }, "note":"職業が決まっていない" }
] %}
{% box "え、キミ何者？", { "tone":"mute" } %}
{% endbox %}
{% box "職業は？勇者？", { "tone":"mute" } %}
{% endbox %}
{% box "魔法使い？？", { "tone":"mute" } %}
{% endbox %}
{% endfig %}

「冒険者」は、勇者・魔法使い・タンク・弓使いを**まとめるための概念**として作ったものでした。
その概念そのものを実体にしてしまうと、**職業のわからない冒険者**が生まれます。

<div class="note">

[第5回](05-inheritance.html)の `Main3.java` は、魔王を `new Adventurer("魔王", 300, 30)` と作っていました。
あれもまさに「冒険者そのもののオブジェクト」です。
**あのとき「これがあとで問題になる」と書いたのが、この話です。**

</div>

<div class="note note--hint">

「れん」という名前は[第1回](01-class.html)にも出てきました。あちらは `Human` クラスの正しい実体で、
こちらは `Adventurer` の作ってはいけない実体です。**同じ人かどうかは資料からは分かりません。**

</div>

#### 2. `abstract` ── 概念だけを定義する

クラス宣言に <span class="term">`abstract`</span> を1語足すと、そのクラスは
<span class="term">抽象クラス</span>になります。

```java nonum
public abstract class Adventurer {
    // name / hp / atk / attack() はそのまま。中身は今までどおり使える
}
```

**変わるのは1点だけです。`new` できなくなります。**

```java error
// 抽象クラスは実体にできない
Adventurer ren = new Adventurer("れん", 80, 10);
// error: Adventurer is abstract; cannot be instantiated
```

{% compare { "axis":"v", "vs":"継承して職業を名乗れば ↓", "cols":3, "wide":true, "legend":["x","o"],
  "caption":"図D ── 「冒険者」は概念なので実体になれない。職業を名乗った子クラスなら実体になれる" } %}
{% panel "Adventurer そのもの", { "sub":"概念", "tone":"danger", "mark":"x" } %}
{% cards [
  { "chara":"silhouette", "name":"れん", "role":"Adventurer", "dim":true, "mark":"x",
    "note":"オブジェクトにはなれない" }
] %}
{% endpanel %}
{% panel "継承した子クラス", { "sub":"職業", "tone":"ok", "mark":"o" } %}
{% cards [
  { "chara":"hero", "name":"勇者", "role":"Hero" },
  { "chara":"wizard", "name":"魔法使い", "role":"Wizard" },
  { "chara":"tank", "name":"タンク", "role":"Tank" }
], { "size":"s" } %}
{% endpanel %}
{% endcompare %}

謎の冒険者「れん」は、もう生まれません。

#### 3. 「`new` できない」と「型に使えない」は別のこと

ここがこの回でいちばん取り違えられるところです。
**`new` できないのは右辺だけ**で、**左辺（変数の型）としてはこれまでどおり使えます。**

{% fig { "wide":true, "legend":["x","o"],
  "caption":"図E ── 禁止されたのは「実体を作ること」だけ。左辺の型として書くことは禁止されていない" } %}
{% box "Adventurer a = new Adventurer(...);", { "sub":"右辺が抽象クラス", "tone":"danger", "mark":"x" } %}
右辺が「冒険者そのもの」。**概念は実体になれない。**
{% endbox %}
{% box "Adventurer a = new Hero(...);", { "sub":"右辺は子クラス", "tone":"ok", "mark":"o" } %}
左辺（**型**）は冒険者のままでよい。右辺（**実体**）が勇者なら作れる。
{% endbox %}
{% endfig %}

**この性質があるから、図Bの名簿はそのまま使い続けられます。**
`ArrayList<Adventurer>` の `Adventurer` は「型として書いているだけ」で、
実際に入っているのは `Hero` や `Wizard` の実体だからです。
抽象クラスにしても、[第6回](06-polymorphism.html)でやったことは1つも壊れません。

#### 4. 抽象メソッド ── 中身を決めないメソッド

全員に「スペシャルアタック」を持っていてほしい。でも中身はそれぞれで決めたい。
そういうときに使うのが <span class="term">抽象メソッド</span>です。

```java nonum
// 中身は書かない。{} すら書かず ; で終わる
public abstract int specialAttack();
```

{% fanout {
  "input":{ "t":"attacker.specialAttack()", "sub":"親が「持っていること」だけを約束する" },
  "outputs":[
    { "chara":"hero", "name":"Hero", "t":"渾身の斬撃！", "sub":"攻撃力の2倍" },
    { "chara":"wizard", "name":"Wizard", "t":"回復魔法！", "sub":"自分のHPを30回復" },
    { "chara":"tank", "name":"Tank", "t":"盾を強化！", "sub":"自分のHPを20増やす" },
    { "chara":"archer", "name":"Archer", "t":"三連矢！", "sub":"攻撃力の3倍" }
  ],
  "edge":"中身は子クラスごとに決める",
  "note":"親に書いてあるのは「specialAttack() を持つこと」だけ。何をするかは1文字も書いていない",
  "wide":true,
  "caption":"図F ── 中身は書かずに、「持っていること」だけを親で約束する"
} %}

<div class="note">

戻り値が `int` なのは、**与えたダメージを数値で返してもらう**ためです。
ゲーム側は `maou.damage(attacker.specialAttack())` と書くので、
技の中身が何であれ「いくらのダメージか」だけは返ってくる必要があります。
回復や盾の強化のようにダメージを与えない技は `0` を返します。

</div>

#### 5. 実装の強制 ── 書き忘れるとコンパイルできない

抽象メソッドを親に置くと、**子クラスは実装しなければならなくなります。**

{% compare { "axis":"v", "vs":"実装すると ↓", "wide":true, "legend":["x","o"],
  "caption":"図G ── 書き忘れは実行してから気づくのではなく、コンパイルの時点で止まる" } %}
{% panel "書き忘れた場合", { "sub":"コンパイルできない", "tone":"danger", "mark":"x" } %}
```java error
public class Hero extends Adventurer {
    // specialAttack() を書き忘れ…
}
```
{% endpanel %}
{% panel "実装した場合", { "sub":"通る", "tone":"ok", "mark":"o" } %}
```java nonum
@Override
public int specialAttack() {
    System.out.println(getName() + " は渾身の斬撃を放った！");
    return getAtk() * 2;
}
```
{% endpanel %}
{% endcompare %}

書き忘れたときに出るのは、このメッセージです。

```text
Hero.java:1: error: Hero is not abstract and does not override
abstract method specialAttack() in Adventurer
```

**エラーメッセージ自体が、抽象クラスのルールの説明になっています。**
「Hero は抽象クラスではないのに、`Adventurer` の抽象メソッド `specialAttack()` を実装していない」。

これが <span class="term">実装の強制</span>です。全員が必ず持っていることが保証されるので、
呼び出す側は **`attacker.specialAttack()` と書くだけ**で済みます。
「このキャラは `specialAttack()` を持っていないかもしれない」という心配をしなくてよくなります。
（ただし保証されるのは「メソッドがある」ことまでで、中身が正しいかどうかは書いた人しだいです。）

#### 6. 抽象メソッドは、すべての子クラスに及ぶ

強制されるのは勇者たち4人だけではありません。**`Adventurer` を継承しているクラス全部**です。
このゲームには、もう1つ継承しているクラスがあります ── 魔王です。

{% tree {
  "root":{ "name":"Adventurer", "stereotype":"abstract", "note":"抽象クラス",
    "methods":[ { "t":"specialAttack()  ← 抽象メソッド", "tone":"gold" } ] },
  "children":[
    { "name":"Hero", "chara":"hero", "methods":[ { "t":"実装が必要", "tone":"gold" } ] },
    { "name":"Wizard", "chara":"wizard", "methods":[ { "t":"実装が必要", "tone":"gold" } ] },
    { "name":"Tank", "chara":"tank", "methods":[ { "t":"実装が必要", "tone":"gold" } ] },
    { "name":"Archer", "chara":"archer", "methods":[ { "t":"実装が必要", "tone":"gold" } ] },
    { "name":"Maou", "chara":"maou", "note":"魔王もこの下にいる",
      "methods":[ { "t":"実装が必要", "tone":"gold" } ] }
  ],
  "edge":"extends",
  "wide":true,
  "caption":"図H ── 親に抽象メソッドを1つ足すと、その義務は子クラス全員に降ってくる。味方かどうかは関係ない"
} %}

配布する `Maou.java` は、この理由であらかじめ `specialAttack()` を実装した状態になっています。
そして**魔王がクラスになっていること自体**が、抽象クラス化の結果です ──
第5回・第6回では魔王を `new Adventurer("魔王", ...)` で直接作っていましたが、
それが書けなくなるので、魔王も継承した1つのクラスにする必要があったわけです。

#### 7. 聖剣エクスカリバー ── 「できること」の約束リスト

ここからは追加の話題です。**エクスカリバーを持つ者だけが「聖なる一撃」を使える。**
そういう“装備”は、<span class="term">インターフェイス</span>で作れます。

{% fig { "wide":true, "caption":"図I ── 聖剣エクスカリバー。血筋とは無関係に、持っているかどうかだけで能力が決まる" } %}
{% chara "holy-sword", { "size":"l" } %}
{% endfig %}

```java nonum
public interface Excalibur {
    int holyStrike();   // 聖なる一撃。中身は書かない
}
```

- <span class="term">インターフェイス</span> ── 「これができます」というメソッドの約束リスト。`class` ではなく `interface` と書く。
- **中に書くメソッドは自動的に抽象**になります。`abstract` を付ける必要はありません。

#### 8. `implements` ── 装備したら、実装は義務

インターフェイスを付けるときは `implements` と書きます。
親の `extends` とは別枠なので、**両方を同時に書けます。**

```java nonum
public class Hero extends Adventurer implements Excalibur {

    @Override
    public int holyStrike() {
        System.out.println(getName() + " は聖なる一撃を放った！");
        return getAtk() * 3;
    }
}
```

{% cards [
  { "chara":"hero-excalibur", "name":"勇者", "role":"Hero",
    "badge":"聖剣", "lines":["extends Adventurer","implements Excalibur"],
    "note":"holyStrike() の実装は義務" }
], { "wide":true, "caption":"図J ── implements したら実装は義務。「持つ者は必ず使える」という最低保障になる" } %}

実装を書かずに `implements` だけ付けると、抽象メソッドのときと同じように止まります。

```text
Hero.java:1: error: Hero is not abstract and does not override
abstract method holyStrike() in Excalibur
```

#### 9. インターフェイスは、血筋とは無関係に付けられる

継承には「勇者は冒険者の一種だ」という筋の通った関係が必要でした。
**インターフェイスにはそれが要りません。** 付けたいクラスに付けるだけです。

{% tree {
  "root":{ "name":"Adventurer", "stereotype":"abstract", "note":"血筋（1本）" },
  "children":[
    { "name":"Hero", "chara":"hero", "implements":["Excalibur"], "note":"勇者" },
    { "name":"Wizard", "chara":"wizard", "mark":"new", "implements":[ { "t":"Excalibur", "tone":"ok" } ],
      "note":"あとから付けてもよい" },
    { "name":"Tank", "chara":"tank", "note":"付けなくてもよい" },
    { "name":"Archer", "chara":"archer", "note":"付けなくてもよい" }
  ],
  "edge":"extends",
  "wide":true,
  "caption":"図K ── 継承の線は縦（親→子）にしか引けないが、インターフェイスはその線と無関係に横から足せる"
} %}

`Wizard` に `implements Excalibur` を付ければ、魔法使いも聖なる一撃を使えるようになります。
継承との一番の違いはここです ── **「勇者だから使える」のではなく、「持っているから使える」。**

#### 10. 持っているかどうかで判別する ── `instanceof` とキャスト

「聖剣を持っている人だけ聖なる一撃、それ以外は通常のスペシャルアタック」を書くと、こうなります。

```java nonum
if (attacker instanceof Excalibur) {          // 聖剣の持ち主か判別して
    Excalibur wielder = (Excalibur) attacker; // インターフェイス型にキャストすると
    maou.damage(wielder.holyStrike());        // 聖なる一撃が使える
} else {
    maou.damage(attacker.specialAttack());
}
```

{% compare { "axis":"v", "vs":"instanceof Excalibur で判別 ↓", "cols":4, "wide":true, "legend":["o","x"],
  "caption":"図L ── 判別しているのは「どのクラスか」ではなく「聖剣を持っているか」。判別の軸がクラスから装備に変わっている" } %}
{% panel "名簿の中身", { "sub":"型はどれも Adventurer" } %}
{% cards [
  { "chara":"hero", "name":"勇者", "badge":"聖剣" },
  { "chara":"wizard", "name":"魔法使い" },
  { "chara":"tank", "name":"タンク" },
  { "chara":"archer", "name":"弓使い" }
], { "size":"s" } %}
{% endpanel %}
{% panel "判別の結果", { "sub":"true なら聖なる一撃" } %}
{% cards [
  { "chara":"hero", "name":"true", "mark":"o", "tone":"ok", "note":"聖なる一撃" },
  { "chara":"wizard", "name":"false", "mark":"x", "note":"回復魔法" },
  { "chara":"tank", "name":"false", "mark":"x", "note":"盾を強化" },
  { "chara":"archer", "name":"false", "mark":"x", "note":"三連矢" }
], { "size":"s" } %}
{% endpanel %}
{% endcompare %}

- <span class="term">`instanceof`</span> ── 「この実体は、その型のなかまか？」を `true` / `false` で返す。
- <span class="term">キャスト</span> ── `(Excalibur) attacker` と書いて、`Excalibur` として扱えるようにすること。
  `Adventurer` 型のままでは `holyStrike()` を呼べない（`Adventurer` にそんなメソッドは無い）ため必要になります。

[第6回](06-polymorphism.html)でもダウンキャストを扱いましたが、あのときの判別対象は
**クラスそのもの**（この人は `Wizard` か？）でした。ここでは**装備を持っているか**に変わっています。

<div class="note note--warn">
<span class="note__title">ただし、この <code>if</code> には第6回で習った弱点があります</span>

第6回で「`instanceof` で分岐するのは、あとからクラスを足したときに壊れやすい」と扱いました。
**この分岐もその弱点をそのまま持っています。**
第2部のチャレンジ課題で、実際に壊れるところを見てもらいます。

</div>

#### 11. 親は1つだけ。でも装備はいくつでも

`extends` は1つしか書けませんが、`implements` は**カンマ区切りでいくつでも**書けます。

{% tree {
  "root":{ "name":"Adventurer", "note":"血筋 ── extends は1本だけ" },
  "children":[
    { "name":"Hero", "chara":"hero", "note":"勇者",
      "implements":[
        { "t":"Excalibur ／ 聖なる一撃" },
        { "t":"Flyable ／ 空を飛ぶ" },
        { "t":"Healable ／ 回復できる" },
        { "t":"Cookable ／ 料理できる" }
      ] }
  ],
  "edge":"extends（1つだけ）",
  "wide":true,
  "caption":"図M ── 血筋は1つ、装備は複数。機能を後から足していくのに向いている"
} %}

[第5回](05-inheritance.html)で「親は1つだけ」という制限を見ました。
**その窮屈さを埋めるのがインターフェイスです。**
「冒険者であること」は1本の血筋で決まり、「何ができるか」は装備の数だけ足せます。

#### 12. まとめ

{% steps [
  { "t":"抽象クラス（abstract）", "d":"概念だけを定義する。new できないので、中途半端な実体が生まれない" },
  { "t":"抽象メソッド", "d":"中身は決めず「持っていること」だけを親で約束する" },
  { "t":"実装の強制", "d":"子クラスが書き忘れるとコンパイルエラー。全員が持っている保証になる" },
  { "t":"インターフェイス（implements）", "d":"「できること」の約束リスト。装備のようにいくつでも持てる", "chara":"hero-excalibur" }
], { "wide":true, "caption":"図N ── 抽象クラスは「型としての約束」、インターフェイスは「能力としての約束」" } %}

### コードで見るとこうなる

図Dから図Mまでを、実際のコードで並べるとこうなります。
**行ごとに読み解く必要はありません。** 図で見たものがどこに出ているかだけ確認してください。

```java file=Adventurer.java hl=1,7
public abstract class Adventurer {
    private String name;
    private int hp;
    private int atk;

    // 中身を書かないメソッド。子クラス全員に実装が強制される
    public abstract int specialAttack();
}
```

```java file=Excalibur.java hl=1
public interface Excalibur {
    int holyStrike();
}
```

```java file=Hero.java hl=1,4,10
public class Hero extends Adventurer implements Excalibur {

    @Override
    public int specialAttack() {
        System.out.println(getName() + " は渾身の斬撃を放った！");
        return getAtk() * 2;
    }

    @Override
    public int holyStrike() {
        System.out.println(getName() + " は聖なる一撃を放った！");
        return getAtk() * 3;
    }
}
```

<div class="table-scroll">

| 図の中の呼び名 | コードでの書き方 |
|---|---|
| 概念だけを定義する（図D） | `abstract class Adventurer`（`Adventurer.java` の1行目） |
| 中身を決めないメソッド（図F） | `public abstract int specialAttack();`（`Adventurer.java` の7行目） |
| 実装の強制（図G） | `Hero` 側の `@Override public int specialAttack()`（`Hero.java` の4行目） |
| できることの約束リスト（図I） | `interface Excalibur`（`Excalibur.java` の1行目） |
| 装備する（図J） | `implements Excalibur`（`Hero.java` の1行目・`extends` と並べて書く） |
| 装備したら実装は義務（図J） | `@Override public int holyStrike()`（`Hero.java` の10行目） |

</div>

**`Hero` の1行目に `extends` と `implements` が並んでいる**ところがこの回の到達点です。
血筋を1つ受け継ぎ、装備を1つ身につけた状態が、そのまま1行に書かれています。

<h2 class="part">第2部 実際に使ってみる</h2>

### 演習

3問あります。**問1はコードを読むクイズ、問2と問3は1本のゲームを2段階で育てていく改造**です。
1問ぶんのファイルを同じ場所に置いて、`javac` でコンパイルして進めてください。

配布するのは **[第6回](06-polymorphism.html)を終えた状態のソース一式**です。

<div class="table-scroll">

| ファイル | すること |
|---|---|
| [Adventurer.java](../downloads/07-abstract/Adventurer.java) | **問2で書き換える。** `abstract` を付けて抽象メソッドを足す |
| [Hero.java](../downloads/07-abstract/Hero.java) | **問2・問3で書き換える。** `specialAttack()` と `implements Excalibur` と `holyStrike()` |
| [Wizard.java](../downloads/07-abstract/Wizard.java) ／ [Tank.java](../downloads/07-abstract/Tank.java) ／ [Archer.java](../downloads/07-abstract/Archer.java) | **問2で書き換える。** `specialAttack()` を足す |
| [Maou.java](../downloads/07-abstract/Maou.java) | **変更しない。** 魔王クラス。`specialAttack()` は実装済み |
| [PolyGame2.java](../downloads/07-abstract/PolyGame2.java) | **1か所だけ変更する。** 問3の最後に【★】のコメントを解除する |

</div>

<div class="note note--warn">
<span class="note__title">配布した状態では <code>PolyGame2.java</code> だけがコンパイルできません（それが正常です）</span>

`PolyGame2.java` は、これから作る `specialAttack()` を呼んでいます。
問2を終えるまでは、この1行でエラーになります。

```text
PolyGame2.java:75: error: cannot find symbol
  symbol:   method specialAttack()
  location: variable attacker of type Adventurer
```

`Adventurer` / `Hero` / `Wizard` / `Tank` / `Archer` / `Maou` の**6ファイルは、配布した状態でそのまま
コンパイルできます。** 動いているものを書き換えるところから始められます。

</div>

<div class="note note--hint">
<span class="note__title"><code>Excalibur.java</code> と <code>Flyable.java</code> は、わざと配ってありません</span>

問3とチャレンジは「**インターフェイスを自分で書く**」ことが中身なので、
配布物に入れると演習が消えてしまいます。探しても見つからないのは意図したものです。

</div>

<div class="note">

`PolyGame2.java` の先頭コメントに「**第3回**」と書いてありますが、これは資料を作った当時の
通し番号がそのまま残っているものです。**この回（第7回）のファイルで合っています。**
配布ファイルは原本のまま配っているので、書き換えずにそのまま使ってください。
コメント中の「問題3」のほうは、下の問3のことで正しい番号です。

</div>

#### 問1 抽象クラスをちゃんと使えているのはどれ？（目安 5分）

A〜E のうち、**正しく使えているもの**をすべて選んでください。

**A**

```java quiz
public abstract class Adventurer {
    public abstract int specialAttack();
}
```

**B**

```java quiz
Adventurer ren = new Adventurer("れん", 80, 10);
```

**C**

```java quiz
public abstract class Adventurer {
    public abstract int specialAttack() {
        System.out.println("スペシャルアタック！");
        return 10;
    }
}
```

**D**

```java quiz
// Adventurer は abstract int specialAttack(); を持つ抽象クラス
public class Hero extends Adventurer {
    public Hero(String name, int hp, int atk) {
        super(name, hp, atk);
    }
    // specialAttack は書いていない
}
```

**E**

```java quiz
// Adventurer は抽象クラス、Hero はそれを継承した普通のクラス
Adventurer a = new Hero("勇者", 100, 20);
```

<div class="note note--hint">
<span class="note__title">ヒント</span>
B は <code>new</code> する相手、C は抽象メソッドの「中身」、D は実装の強制、
E は「<code>new</code> しているのはどっちのクラス？」に注目。
</div>

#### 問2 冒険者クラスを抽象クラスにしよう（目安 20分）

**2-1.** `Adventurer.java` のクラス宣言に `abstract` を付ける。

```java nonum
// 変更前
public class Adventurer {
// 変更後
public abstract class Adventurer {
```

**2-2.** `Adventurer.java` に抽象メソッド `specialAttack` を足す。

```java nonum
// 中身は書かない！ {} の代わりに ; で終わる
public abstract int specialAttack();
```

<div class="note note--warn">
<span class="note__title">2-3. ここで一度コンパイルしてください（飛ばさないこと）</span>

まだ何も実装していない状態で `javac` を走らせます。
**`Hero` / `Wizard` / `Tank` / `Archer` の4つが、まとめてコンパイルエラーになるはずです。**

これが「実装の強制」です。**エラーになること自体がこの問題の中身**なので、
先に進む前にエラーメッセージを読んでください。

</div>

**2-4.** 4クラスそれぞれに `specialAttack` を実装する（**`@Override` を付けること**）。

<div class="table-scroll">

| クラス | 表示するメッセージ | 戻り値 |
|---|---|---|
| `Hero` | `勇者 は渾身の斬撃を放った！` | 攻撃力の **2倍** |
| `Wizard` | 回復魔法で**自分のHPを30回復**（[第6回](06-polymorphism.html)で作った `heal(this)` を呼べばOK） | **0** |
| `Tank` | `タンク は盾を強化した！（HP +20）` | **自分のHPを20増やして** **0** |
| `Archer` | `弓使い は三連矢を放った！` | 攻撃力の **3倍** |

</div>

<div class="note note--hint">
<span class="note__title"><code>heal</code> を忘れていたら</span>

`heal` は第6回で `Wizard` に足した固有メソッドです。配布した `Wizard.java` にそのまま入っています。

```java nonum
public void heal(Adventurer target) {
    target.setHp(target.getHp() + 30);
    System.out.println(getName() + " は回復魔法を唱えた！ "
            + target.getName() + " のHPが 30 回復（HP: " + target.getHp() + "）");
}
```

`heal(this)` の `this` は「自分自身」です。回復の相手として自分を渡しています。

</div>

**2-5.** `PolyGame2` を実行する。行動選択で「2」を選んで、キャラごとの技が出れば成功です。

<div class="note note--ok">
<span class="note__title">できたかの確認</span>
<ul>
<li><code>new Adventurer(...)</code> と書くとコンパイルエラーになる（謎の冒険者はもう作れない）</li>
<li><code>specialAttack</code> を1つでも消すと、そのクラスだけがコンパイルエラーになる</li>
<li>ゲーム側は <code>attacker.specialAttack()</code> の<strong>1行だけ</strong>なのに、キャラごとの技が出る</li>
</ul>
</div>

#### 問3 聖剣エクスカリバーをインターフェイスで作ろう（目安 20分）

**3-1.** `Excalibur.java` を**新規作成**し、次のメソッドを1つ持つ**インターフェイス**にする。

<div class="table-scroll">

| メソッド | 内容（実装するときの指定） |
|---|---|
| `int holyStrike();` | `勇者 は聖なる一撃を放った！` と表示し、攻撃力の **3倍** を返す |

</div>

```java nonum
// インターフェイスの骨組み
public interface インターフェイス名 {
    戻り値の型 メソッド名();   // 中身は書かない
}
```

**3-2.** `Hero.java` に `implements Excalibur` を足して装備させる。

```java nonum
public class Hero extends Adventurer implements Excalibur {
```

<div class="note note--warn">
<span class="note__title">ここでもう一度コンパイルしてください</span>

`holyStrike` をまだ書いていないので、**`Hero` がコンパイルエラーになるはずです。**
2-3 と同じ「実装の義務」が、今度はインターフェイス側から来ています。

</div>

**3-3.** `Hero` に `holyStrike` を実装する（表の指定どおり・`@Override` を付ける）。

**3-4.** `PolyGame2.java` の【★】のコメントを解除する。**解除したら、すぐ下の1行を削除します。**

いま配布されているのは、この形です。**金色の9行が作業する範囲**です。

```java hl=7-15
            if (action == 2) {

                // ============================================================
                // 【★】問題3が終わったら、下の /* と */ の行を消して
                //      コメントを解除しよう（解除したら、その下の1行は削除！）
                // ============================================================
                /*
                if (attacker instanceof Excalibur) {              // 聖剣の持ち主か判別して
                    Excalibur wielder = (Excalibur) attacker;     // キャストすると…
                    maou.damage(wielder.holyStrike());            // 聖なる一撃が使える！
                } else {
                    maou.damage(attacker.specialAttack());
                }
                */
                maou.damage(attacker.specialAttack()); // ←【★】を解除したらこの行は削除

            } else {
                maou.damage(attacker.attack());
            }
```

<div class="note note--warn">
<span class="note__title">消すのは3行です</span>

`/*` の行、`*/` の行、そして**その下の `maou.damage(attacker.specialAttack());` の行**。
最後の1行を消し忘れると、勇者のスペシャルアタックで**聖なる一撃と渾身の斬撃が両方出ます。**
出力がおかしいときは、まずここを疑ってください。

</div>

**3-5.** 実行する。**勇者**でスペシャルアタックを選ぶと聖なる一撃、**他のキャラ**はいままでどおりの
スペシャルアタックが出れば成功です。

<div class="note note--ok">
<span class="note__title">できたかの確認</span>
<ul>
<li><code>Hero</code> は <code>extends</code>（親は1つ）と <code>implements</code>（装備）を<strong>同時に</strong>持っている</li>
<li><code>instanceof Excalibur</code> は、聖剣を持たないキャラでは <code>false</code> になる</li>
<li><code>Wizard</code> にも <code>implements Excalibur</code> を付ければ、魔法使いも聖なる一撃が使える（試してみよう）</li>
</ul>
</div>

#### チャレンジ（早く終わった人向け）

新しいインターフェイス `Flyable`（`void fly();` を持つ）を作り、`Archer` に
**`Excalibur` と `Flyable` の両方**を `implements` してみてください。

```java nonum
public class Archer extends Adventurer implements Excalibur, Flyable {
```

親は1つしか持てないのに、インターフェイスは**カンマ区切りでいくつでも**装備できます。

<div class="note note--warn">
<span class="note__title">そして、弓使いでスペシャルアタックを選んでみてください</span>

**「三連矢」が出なくなります。** なぜでしょうか。
問3で書いた `if` を読み返しながら考えてみてください。答えは折りたたみの中にあります。

</div>

### 実行結果の例

`PolyGame2` は入力を受け取って進むゲームです。`>>` のうしろが入力した数字です。

<div class="note">

**魔王の反撃は、ランダムな1人にランダムなダメージ（15〜30）で当たります。**
反撃の相手とダメージは実行するたびに変わるので、そこは下の例と一致しません。
**一致するのは魔王のHPの減り方**です。

</div>

#### 問2 ── 勇者のスペシャルアタック

```text
★ 魔王が現れた！ ★

----- パーティ -----
0: 勇者（HP:100 / ATK:20）
1: 魔法使い（HP:60 / ATK:30）
2: タンク（HP:150 / ATK:5）
3: 弓使い（HP:80 / ATK:15）
魔王（HP:250）
--------------------
キャラの番号を入力 >> 0
行動を選択（1:こうげき 2:スペシャルアタック）>> 2
勇者 は渾身の斬撃を放った！
魔王 は 40 のダメージを受けた！（残りHP: 210）
```

攻撃力 20 の2倍で 40。魔王の 250 から引いて 210 です。

#### 問3 ── 勇者は聖なる一撃、他のキャラはそのまま

```text
キャラの番号を入力 >> 0
行動を選択（1:こうげき 2:スペシャルアタック）>> 2
勇者 は聖なる一撃を放った！
魔王 は 60 のダメージを受けた！（残りHP: 190）
```

```text
キャラの番号を入力 >> 3
行動を選択（1:こうげき 2:スペシャルアタック）>> 2
弓使い は三連矢を放った！
魔王 は 45 のダメージを受けた！（残りHP: 205）
```

勇者は 20 の3倍で 60、弓使いは 15 の3倍で 45。
**残りHPは「そこまでに魔王が受けた合計」で決まる**ので、どの順で攻撃したかによって変わります。

回復と盾の強化はダメージが 0 なので、魔王のHPは減りません。

```text
キャラの番号を入力 >> 1
行動を選択（1:こうげき 2:スペシャルアタック）>> 2
魔法使い は回復魔法を唱えた！ 魔法使い のHPが 30 回復（HP: 90）
魔王 は 0 のダメージを受けた！（残りHP: 250）
```

### 解答・解説

<details>
<summary>問1 の解答を見る</summary>

**正解：A と E**

<div class="table-scroll">

| 選択肢 | 判定 | 解説 |
|---|---|---|
| A | ○ | 抽象クラスの正しい宣言。抽象メソッドは中身なし・`;` で終わる |
| B | ✕ | 抽象クラスは **`new` できない**。`error: Adventurer is abstract; cannot be instantiated` |
| C | ✕ | 抽象メソッドなのに**中身 `{ }` を書いている**。`error: abstract methods cannot have a body`。中身を書くなら `abstract` を外す |
| D | ✕ | **実装の強制**に違反している。`specialAttack` を実装しないなら、`Hero` 自身も `abstract` にするしかない |
| E | ○ | **これがいちばんの引っかけ。** `new` しているのは `Hero`（普通のクラス）なのでOK |

</div>

**E を ✕ にした人は、図Eをもう一度見てください。**
「抽象クラスは `new` できない」と「抽象クラスは型に使えない」は別の話です。
`new` が禁止されたのは右辺だけで、左辺の型としてはそのまま使えます。

そして、**これができるからこそ `ArrayList<Adventurer>` に全員を入れられます。**
第6回でやったことが、抽象クラスにしても1つも壊れない理由がここにあります。

</details>

<details>
<summary>問2 の解答を見る</summary>

**`Adventurer.java` の変更は2か所だけです。**

```java file=Adventurer.java hl=1,6
public abstract class Adventurer {

    // …フィールド・コンストラクタ・既存メソッドはそのまま…

    // 抽象メソッドを追加（中身なし）
    public abstract int specialAttack();
}
```

**4クラスへの実装**

```java file=Hero.java
@Override
public int specialAttack() {
    System.out.println(getName() + " は渾身の斬撃を放った！");
    return getAtk() * 2;
}
```

```java file=Wizard.java
@Override
public int specialAttack() {
    heal(this);
    return 0;
}
```

```java file=Tank.java
@Override
public int specialAttack() {
    setHp(getHp() + 20);
    System.out.println(getName() + " は盾を強化した！（HP +20）");
    return 0;
}
```

```java file=Archer.java
@Override
public int specialAttack() {
    System.out.println(getName() + " は三連矢を放った！");
    return getAtk() * 3;
}
```

**2-3 で出るエラー（実際の出力）**

4クラスぶん、まとめて出ます。

```text
Archer.java:5: error: Archer is not abstract and does not override abstract method specialAttack() in Adventurer
public class Archer extends Adventurer {
       ^
Hero.java:1: error: Hero is not abstract and does not override abstract method specialAttack() in Adventurer
public class Hero extends Adventurer {
       ^
Tank.java:1: error: Tank is not abstract and does not override abstract method specialAttack() in Adventurer
public class Tank extends Adventurer {
       ^
Wizard.java:6: error: Wizard is not abstract and does not override abstract method specialAttack() in Adventurer
public class Wizard extends Adventurer {
       ^
4 errors
```

日本語環境では、こう表示されることもあります。

```text
Hero.java:1: エラー: Heroはabstractでなく、Adventurer内のabstractメソッドspecialAttack()をオーバーライドしません
```

**`Maou` がこの4つに入っていないことに気づきましたか。**
魔王は `specialAttack()` を先に実装してあるのでエラーになりません。
配布した `Maou.java` を開くと、そこに理由が書いてあります ── 抽象メソッドは全子クラスに及ぶので
（図H）、魔王も実装しないと動かなくなるからです。

**つまずきポイント**

<div class="table-scroll">

| よくある詰まり方 | 直し方 |
|---|---|
| 抽象メソッドに `{}` を書いてしまう／`;` を忘れる | 問1の C と同じ。中身を書くなら `abstract` を外す |
| 4クラスのうち1つだけ実装を忘れる | エラーメッセージにクラス名が出る。2-3 を体験していれば自力で気づける |
| `Wizard` の `heal(this)` の `this` に戸惑う | 「自分自身を回復対象として渡している」。相手を変えれば仲間も回復できる |
| 戻り値を返し忘れる | 回復や盾の強化は `return 0;`。ダメージを与えないという意味 |

</div>

**この問題のいちばんの見どころは、ゲーム側を1文字も書き換えていないことです。**
`PolyGame2` に書いてあるのは `maou.damage(attacker.specialAttack());` の1行だけ。
それでも4人が違う技を出します。

- **抽象メソッド**が「全員が `specialAttack()` を持っている」ことを保証し、
- **ポリモーフィズム**（第6回）が「実際に動くのは中身のクラスのもの」を保証する。

この2つが揃って初めて、`if` の分岐なしで書けるようになります。

</details>

<details>
<summary>問3 の解答を見る</summary>

**`Excalibur.java`（新規作成）**

```java file=Excalibur.java
public interface Excalibur {
    int holyStrike();   // 中身は書かない（インターフェイスのメソッドは自動的に抽象）
}
```

**`Hero.java` の変更**

```java file=Hero.java hl=1,6
public class Hero extends Adventurer implements Excalibur {

    // …コンストラクタ・attack・specialAttack はそのまま…

    @Override
    public int holyStrike() {
        System.out.println(getName() + " は聖なる一撃を放った！");
        return getAtk() * 3;
    }
}
```

**`PolyGame2.java`（コメント解除したあとの形）**

```java file=PolyGame2.java hl=3-8
            if (action == 2) {

                if (attacker instanceof Excalibur) {              // 聖剣の持ち主か判別して
                    Excalibur wielder = (Excalibur) attacker;     // キャストすると…
                    maou.damage(wielder.holyStrike());            // 聖なる一撃が使える！
                } else {
                    maou.damage(attacker.specialAttack());
                }

            } else {
                maou.damage(attacker.attack());
            }
```

**つまずきポイント**

<div class="table-scroll">

| よくある詰まり方 | 直し方 |
|---|---|
| `interface` と書くべきところを `class` と書く | インターフェイスは `public interface Excalibur {` |
| `implements` と `extends` を逆にする | 血筋が `extends`、装備が `implements`。**順番も `extends` が先** |
| 解除したのに下の1行を消し忘れる | 勇者のスペシャルで技が2回出る（下に実際の出力あり） |

</div>

**1行を消し忘れたときの出力（実際に動かしたもの）**

```text
勇者 は聖なる一撃を放った！
魔王 は 60 のダメージを受けた！（残りHP: 190）
勇者 は渾身の斬撃を放った！
魔王 は 40 のダメージを受けた！（残りHP: 150）
```

聖なる一撃で 60、そのすぐあとに残していた行が渾身の斬撃で 40。合計 100 も減っています。

**確認ポイント3つ目「`Wizard` にも装備してみる」の結果**

`Wizard` に `implements Excalibur` を足して `holyStrike()` を実装すると、こうなります。

```text
キャラの番号を入力 >> 1
行動を選択（1:こうげき 2:スペシャルアタック）>> 2
魔法使い は聖なる一撃を放った！
魔王 は 90 のダメージを受けた！（残りHP: 160）
```

**魔法使いが聖なる一撃を使いました。** 攻撃力 30 の3倍で 90 なので、勇者より強くなっています。

`Wizard` は `Hero` とは何の血縁関係もありません。それでも装備できます。
これが図Kの「インターフェイスは血筋と無関係に付けられる」ということです。

</details>

<details>
<summary>チャレンジの答えを見る ── なぜ三連矢が出ないのか</summary>

**`Flyable.java`（新規作成）**

```java file=Flyable.java
public interface Flyable {
    void fly();
}
```

**`Archer.java` の変更**

```java file=Archer.java hl=1
public class Archer extends Adventurer implements Excalibur, Flyable {

    // specialAttack はそのまま。これに加えて2つ実装する

    @Override
    public void fly() {
        System.out.println(getName() + " は空へ舞い上がった！");
    }

    @Override
    public int holyStrike() {
        System.out.println(getName() + " は聖なる一撃を放った！");
        return getAtk() * 3;
    }
}
```

`extends` は1つ、`implements` はカンマ区切りでいくつでも ── これは狙いどおりです。

なお `implements` を足しただけの時点でコンパイルすると、こう出ます。

```text
Archer.java:5: error: Archer is not abstract and does not override abstract method holyStrike() in Excalibur
```

**`Flyable` の `fly()` ではなく `holyStrike()` が先に指摘されます。**
javac は足りない抽象メソッドを1つずつ報告するので、`holyStrike()` を書くと今度は `fly()` が出ます。

**そして、弓使いでスペシャルアタックを選ぶと**

```text
キャラの番号を入力 >> 3
行動を選択（1:こうげき 2:スペシャルアタック）>> 2
弓使い は聖なる一撃を放った！
魔王 は 45 のダメージを受けた！（残りHP: 205）
```

**「三連矢」ではなく「聖なる一撃」が出ました。** 三連矢は二度と出てきません。

理由は問3で解除した `if` にあります。

```java nonum
if (attacker instanceof Excalibur) {          // ← 弓使いも true になってしまった
    Excalibur wielder = (Excalibur) attacker;
    maou.damage(wielder.holyStrike());        // ← こちらに入る
} else {
    maou.damage(attacker.specialAttack());    // ← 三連矢はここにいる。もう通らない
}
```

`Archer` に `Excalibur` を付けた瞬間、`instanceof Excalibur` が `true` を返すようになりました。
**`Archer.specialAttack()` のコードは1文字も変えていないのに、呼ばれなくなった**わけです。

<div class="note note--warn">
<span class="note__title">これは <code>if</code> で分岐しているから起きた事故です</span>

[第6回](06-polymorphism.html)で、**`instanceof` で分岐するコードは、あとからクラスや機能を足したときに
壊れやすい**という話が出てきました。**それが実際に起きたのがこれです。**

- 弓使いのコードは正しい。聖剣のコードも正しい。
- 壊れたのは、その2つを **`if` でつないでいる `PolyGame2` 側**。
- しかも**エラーは1つも出ません。** 静かに、出る技だけが変わります。

問2の `maou.damage(attacker.specialAttack());` は分岐が無いので、
キャラを何人足しても壊れません。**分岐が1つ増えるたびに、壊れる場所が1つ増える**ということです。

</div>

**直すとしたら**

「聖剣を持っている人はスペシャルアタックの中身を聖なる一撃にする」と決めれば、
`Archer` の `specialAttack()` の中で `holyStrike()` を呼ぶだけで済みます。
そうすればゲーム側の `if` は要らなくなり、`maou.damage(attacker.specialAttack());` の1行に戻せます。

**どちらが良いかは設計の判断です。** ここで覚えてほしいのは、
「分岐で場合分けする書き方は、機能を足すたびに見直しが要る」ということだけです。

</details>

### 全7回をふりかえる

**これで全7回が終わりです。** 最後に、ここまでに手に入れたものを確認します。

前半の3回でやったのは、**1つのクラスをきちんと作ること**でした。

{% steps [
  { "t":"第1回 クラスの概念", "d":"関係のある情報と動作をひとまとめにする。設計図（クラス）と実体（オブジェクト）を分ける" },
  { "t":"第2回 オーバーロード・コンストラクタ", "d":"作った瞬間に中身を決める。同じ名前のメソッドで受け取るものを変える" },
  { "t":"第3回 カプセル化", "d":"中身を private で閉じ、窓口メソッドだけを外に出す。ありえない値が入らなくなる" }
], { "wide":true, "caption":"図O-1 ── 前半3回。ここまでで「クラスを1つ、正しく作る」ことができるようになった" } %}

後半の4回でやったのは、**たくさんのクラスをまとめて扱うこと**でした。勇者一行のプロジェクトです。

{% steps [
  { "t":"第4回 ArrayList", "d":"勇者一行の名簿。増やす・減らす・並べ替えるが自由にできる入れ物", "chara":"saint" },
  { "t":"第5回 継承・オーバーライド", "d":"共通部分は親に、違いは子に。同じものを何度も書かなくてよくなる", "chara":"tank" },
  { "t":"第6回 ポリモーフィズム", "d":"親の型でまとめて受け取り、動くのは中身のクラスのメソッド。呼び出し側から分岐が消える", "chara":"wizard" },
  { "t":"第7回 抽象クラス・インターフェイス", "d":"「必ず持っている」ことを型で保証する。だから安心して1行で呼べる", "chara":"hero-excalibur" }
], { "wide":true, "caption":"図O-2 ── 後半4回。1本のバトルゲームを4回かけて育て、この回で完成した" } %}

#### 7回ぶんが、1つのコードに全部入っている

いま完成した `PolyGame2` の中心部分です。**7回ぶんの内容が、この十数行に同居しています。**

```java nonum
ArrayList<Adventurer> party = new ArrayList<>();
party.add(new Hero("勇者", 100, 20));
party.add(new Wizard("魔法使い", 60, 30));

for (Adventurer member : party) {
    System.out.println(i + ": " + member.status());
}

Adventurer attacker = party.get(select);

if (attacker instanceof Excalibur) {
    Excalibur wielder = (Excalibur) attacker;
    maou.damage(wielder.holyStrike());
} else {
    maou.damage(attacker.specialAttack());
}
```

<div class="table-scroll">

| どの回のものか | どこに出ているか |
|---|---|
| 第1回 クラスとオブジェクト | `new Hero(...)` ── 設計図から実体を作っている |
| 第2回 コンストラクタ | `("勇者", 100, 20)` ── 作った瞬間に中身が決まる |
| 第3回 カプセル化 | `member.status()` ── `name` や `hp` を直接読まず、窓口を通している |
| 第4回 ArrayList | `ArrayList<Adventurer> party` と拡張for文 |
| 第5回 継承・オーバーライド | `Hero` / `Wizard` が `Adventurer` を継承していること |
| 第6回 ポリモーフィズム | `Adventurer attacker` ── 親の型で受け取り、動くのは中身のクラスのもの |
| 第7回 抽象クラス | `attacker.specialAttack()` ── 全員が持っている保証があるから1行で書ける |
| 第7回 インターフェイス | `instanceof Excalibur` とキャスト |

</div>

#### なぜ、あんなに短く書けたのか

第6回で `attacker.attack()` の1行を書いたとき、なぜ安心して書けたのでしょうか。
**この回の答えは、必ず実装されていることが保証されていたからです。**

- **抽象クラス**が「これは冒険者の一種だ」という型の約束を作り、
- **抽象メソッド**が「全員が必ず持っている」という中身の約束を作り、
- **インターフェイス**が「持っている者は必ず使える」という能力の約束を作る。

オブジェクト指向でやっていたのは、突きつめると**約束を型で表現すること**です。
約束があるから、呼び出す側は相手が誰かを気にせずに済み、
`if` で場合分けしなくてよくなり、あとからクラスを足しても壊れなくなります。

チャレンジ課題で見たのは、その逆です。**約束ではなく `if` で場合分けしたところだけが壊れました。**
これから自分でコードを書くときも、「ここは `if` で分けるべきか、型の約束にできないか」と
一度考えてみてください。それがこの7回でいちばん持ち帰ってほしいことです。

#### もう一度読み返すなら

- [第1回 クラスの概念](01-class.html) ／ [第2回 オーバーロード・コンストラクタ](02-overload.html) ／ [第3回 カプセル化](03-encapsulation.html)
- [第4回 ArrayList](04-arraylist.html) ／ [第5回 継承・オーバーライド](05-inheritance.html) ／ [第6回 ポリモーフィズム](06-polymorphism.html)

おつかれさまでした。
