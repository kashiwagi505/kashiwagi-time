---
order: 1
---
<!--
  本文執筆済み（2026-08-04）。
    設計図      : 00_research/02_content/per-session/session-01.md
    決定        : 00_research/06_decisions/decisions.md 2026-07-31 決定1・5・6
    図解部品    : site/docs/figures.md（6章に第1回の図と部品の対応表）

    front matter は order: だけ。タイトル「クラスの概念」・呼び名「設計図の書」・
    permalink は src/_data/site.json から自動で入る。

    この回の作りの要点:
    ・元資料の pptx に画像は0件。図はすべて新規に組んだ（10点）。
    ・決定1（第1部の補強）: 講義に出てこない new／コンストラクタ／private／getter を
      第1部の図（図G・図H）として追加した。演習側では初出扱いにしない。
    ・決定6（世界観は折衷）: 概念図の本体は元資料のまま（Human / Dog、たかぎ・れん・りょう）。
      勇者一行を出すのは「勇者一行で例えると」と、まとめの「同じ設計図から複数の実体」の図だけ。
    ・付箋の黄＝情報／青＝動作は13枚を貫く一貫ルール。元は口頭説明なので凡例で置き換えている。
    ・図D（並行配列）は横並びが本質なので parallel（常に横維持）を使う。
-->

<h2 class="part">第1部 直感的につかむ</h2>

### この回でできるようになること

- 関係のある「情報」と「動作」をひとまとめにする、という考え方が説明できる。
- <span class="term">クラス</span>＝設計図、<span class="term">オブジェクト（実体）</span>＝設計図から作った1つ分、という関係が図で言える。
- バラバラの配列で持つとデータの対応が壊れること、オブジェクトごと扱えば壊れないことが、並べ替えの例で分かる。

### 勇者一行で例えると

第4回からは「勇者一行」を共通の題材にして、1本のプログラムを育てていきます。
勇者・魔法使い・タンクは、それぞれ **名前・HP・攻撃力を持っていて（情報）**、**攻撃をします（動作）**。

{% cards [
  { "chara":"hero", "name":"勇者", "stats":{ "HP":"120", "攻撃力":"25" }, "lines":["攻撃する"] },
  { "chara":"wizard", "name":"魔法使い", "stats":{ "HP":"80", "攻撃力":"40" }, "lines":["攻撃する"] },
  { "chara":"tank", "name":"タンク", "stats":{ "HP":"200", "攻撃力":"15" }, "lines":["攻撃する"] }
], { "caption":"3人とも「持っているもの」と「できること」の組み合わせでできている" } %}

この「持っているもの」と「できること」をひとまとめにして名前をつけたものが、**クラス**です。
勇者一行に入る前に、この回ではもっと身近な題材 ―― **人間と犬** ―― で、その考え方だけをつかみます。

### 図解でつかむ

図の中の色には、この回のあいだずっと同じ意味を持たせています。

{% legend %}

#### 1. まとめないと、誰の情報か分からない

人間と犬の情報や動作が、1枚ずつのメモとして散らばっている状態を想像してください。

{% notes [
  { "t":"名前" }, { "t":"身長" }, { "t":"歩く", "kind":"action" }, { "t":"毛色" },
  { "t":"話す", "kind":"action" }, { "t":"体重" }, { "t":"鳴く", "kind":"action" }, { "t":"名前" }
], { "scatter":true, "legend":false, "title":"Before ── まとめない場合。このメモ、誰のもの？",
     "caption":"図A-1 ── 1枚1枚は正しいのに、どれが人間のもので、どれが犬のものか判断できない" } %}

同じメモを **Human** と **Dog** という枠に仕分けると、こうなります。

{% classbox [
  { "name":"Human", "fields":["名前","身長","体重"], "methods":["歩く","話す"] },
  { "name":"Dog", "fields":["名前","毛色"], "methods":["鳴く"] }
], { "title":"After ── まとめた場合。意味が見える",
     "caption":"図A-2 ── 関係のある情報と動作を同じ枠に入れると、何についての内容かが一目で分かる" } %}

「名前」というメモは、人間のものにも犬のものにもなります。散らばっている状態では、
1枚1枚が正しくても**どれが誰のものか判断できません**。
関係のあるものを同じ枠に入れると、それだけで意味が出ます。
そして **Human と Dog は別のクラス**、というのがこの図のもう一つの読み方です。

#### 2. クラスは設計図 ── 情報はメンバ変数（フィールド）、動作はメソッド

{% codeout { "wide":true, "legend":true, "caption":"図B ── 黄色の付箋が変数に、青の付箋がメソッドになる。枠がそのまま class の { } に対応する" } %}
{% panel "クラスの枠", { "sub":"情報と動作の2段" } %}
{% classbox { "name":"Human", "note":"設計図", "fields":["name","height"], "methods":["walk()","talk()"] } %}
{% endpanel %}
{% panel "Java で書くと", { "sub":"枠がそのままコードになる" } %}
```java nonum
class Human {
    String name;
    int height;

    void walk() { }
    void talk() { }
}
```
{% endpanel %}
{% endcodeout %}

- <span class="term">メンバ変数（フィールド）</span> ── クラスにまとめた「情報」の呼び名。上の `name` `height` がこれ。**どちらの呼び方もします。**
- <span class="term">メソッド</span> ── クラスにまとめた「動作」の呼び名。上の `walk()` `talk()` がこれ。

ここでは構文を覚えるより、**黄色の付箋が変数、青の付箋がメソッドになった**ことだけ確認できれば十分です。

#### 3. 設計図から実体をつくる

{% compare { "vs":"作る ↓", "axis":"v", "cols":3, "wide":true, "caption":"図C ── クラスは1つ。そこから作る実体は何人分でも作れる" } %}
{% panel "クラス", { "sub":"設計図。これ自体は「一人の人間」ではない" } %}
{% classbox { "name":"Human", "fields":["name","height","weight"], "methods":["walk()","talk()"] } %}
{% endpanel %}
{% panel "オブジェクト（実体）", { "sub":"設計図から作った1人分", "tone":"ok" } %}
{% cards [
  { "name":"たかぎ", "role":"Human", "stats":{ "身長":"170cm", "体重":"60kg" } },
  { "name":"れん", "role":"Human", "stats":{ "身長":"165cm", "体重":"55kg" } },
  { "name":"りょう", "role":"Human", "stats":{ "身長":"180cm", "体重":"75kg" } }
], { "size":"s" } %}
{% endpanel %}
{% endcompare %}

`Human` クラスそのものは一人の人間ではありません。設計図をもとに作られた
たかぎ・れん・りょうの一人ひとりが <span class="term">オブジェクト（実体）</span> です。
**同じ設計図から、何人でも別々の実体を作れます。**

（ちなみに第7回にも「れん」という名前が出てきます。同じ人かどうかは、資料からは分かりません。）

#### 4. 実体を作るときに値を渡す ── new とコンストラクタ

作った瞬間に「この人は身長170cm」と決められないと、実体は空っぽのまま生まれてきます。
そこで設計図に**作るときの入口**をつけておき、`new` で呼び出します。

{% compare { "vs":"new すると ↓", "axis":"v", "cols":3, "wide":true, "caption":"図G ── new を1回呼ぶと、実体が1つできる。入口（コンストラクタ）で渡した値がそのまま中身になる" } %}
{% panel "書くコード", { "sub":"作るときに値を受け取る入口をつける" } %}
```java nonum
class Human {
    String name;
    int height;
    int weight;

    // 作るときに値を受け取る入口（コンストラクタ）
    Human(String name, int height, int weight) {
        this.name = name;
        this.height = height;
        this.weight = weight;
    }
}
```

```java nonum
Human takagi = new Human("たかぎ", 170, 60);
Human ren    = new Human("れん", 165, 55);
Human ryo    = new Human("りょう", 180, 75);
```
{% endpanel %}
{% panel "できる実体", { "sub":"new の回数だけ増える", "tone":"ok" } %}
{% cards [
  { "name":"たかぎ", "role":"Human", "stats":{ "height":"170", "weight":"60" } },
  { "name":"れん", "role":"Human", "stats":{ "height":"165", "weight":"55" } },
  { "name":"りょう", "role":"Human", "stats":{ "height":"180", "weight":"75" } }
], { "size":"s" } %}
{% endpanel %}
{% endcompare %}

- <span class="term">new</span> ── 設計図から実体を1つ作る書き方。`new クラス名(渡す値)` の形。
- <span class="term">コンストラクタ</span> ── 作るときに値を受け取ってフィールドに入れる、クラス名と同じ名前の入口。

<div class="note note--hint">
<span class="note__title">この2つは第2回でくわしく扱います</span>
ここでは「実体を作るときには <code>new</code> を書く」「値は作るときに渡せる」という形だけ見ておいてください。
第2部の演習では、コンストラクタは書けた状態で配ってあります。
</div>

#### 5. 配列でバラバラに持つと、対応が壊れる

名前・身長・体重を**別々の配列**で持つ方法でもデータは持てます。
ただしその場合、**「同じ添字の要素どうしが同じ人」という約束を、プログラムを書く人が守らなければなりません。**

{% parallel {
  "rows":[
    { "label":"name[]",   "cells":["たかぎ","れん","りょう"] },
    { "label":"height[]", "cells":["170","165","180"] },
    { "label":"weight[]", "cells":["60","55","75"] }
  ],
  "title":"Before ── 同じ列（添字）が同じ人を指している",
  "caption":"図D-1 ── 縦の点線でつながっている3つが1人分。この対応はコードのどこにも書かれておらず、人の注意だけで保たれている"
} %}

ここで**身長の配列だけ**を並べ替えると、どうなるでしょうか。

{% parallel {
  "rows":[
    { "label":"name[]",   "cells":["たかぎ","れん","りょう"] },
    { "label":"height[]", "cells":[ { "t":"165", "bad":true }, { "t":"170", "bad":true }, "180" ] },
    { "label":"weight[]", "cells":["60","55","75"] }
  ],
  "colNotes":["たかぎが165cm？","れんが170cm？",""],
  "title":"After ── height[] だけを並べ替えた",
  "caption":"図D-2 ── 数値は1つも間違っていない。それでも「たかぎが165cm」という誤った情報になっている"
} %}

**データはある。でも関係が間違っている。** これが、配列を並べて持つやり方の弱いところです。

#### 6. オブジェクトごと動かせば壊れない

1人分を1つのオブジェクトにしておけば、名前・身長・体重は最初からひとまとまりです。
並べ替えるのは**値ではなくカードごと**なので、対応が崩れません。

{% compare { "axis":"v", "cols":3, "vs":"身長順に並べ替え ↓", "wide":true, "caption":"図E ── 動くのはカード全体。名前・身長・体重が常に一緒に移動する" } %}
{% panel "入れ替え前", { "sub":"作った順" } %}
{% cards [
  { "name":"たかぎ", "role":"Human", "stats":{ "身長":"170cm", "体重":"60kg" } },
  { "name":"れん", "role":"Human", "stats":{ "身長":"165cm", "体重":"55kg" } },
  { "name":"りょう", "role":"Human", "stats":{ "身長":"180cm", "体重":"75kg" } }
], { "size":"s" } %}
{% endpanel %}
{% panel "身長の高い順", { "sub":"中身の対応は無傷", "tone":"ok" } %}
{% cards [
  { "name":"りょう", "role":"Human", "stats":{ "身長":"180cm", "体重":"75kg" } },
  { "name":"たかぎ", "role":"Human", "stats":{ "身長":"170cm", "体重":"60kg" } },
  { "name":"れん", "role":"Human", "stats":{ "身長":"165cm", "体重":"55kg" } }
], { "size":"s" } %}
{% endpanel %}
{% endcompare %}

同じ「身長順に並べ替える」を、配列で持った場合とオブジェクトで持った場合で比べると、
違いは次の4点に出ます。

<div class="table-scroll">

| 観点 | 配列でバラバラに持つ | オブジェクトにまとめる |
|---|---|---|
| 1人分の情報 | 複数の配列の、同じ添字 | 1つのオブジェクト |
| 並べ替えの交換 | 配列の本数だけ（3回） | 参照を1回入れ替えるだけ |
| 項目を1つ増やす | 配列と交換処理を追加する | 主にクラスへ追加する |
| 対応関係 | 添字を人が守る | オブジェクトがまとめて持っている |

</div>

クラスを使うのは、コードを長くするためではありません。次の3つのためです。

- **分かる** ── 何に関する情報・動作なのかが、枠を見るだけで分かる。
- **壊れにくい** ── 関係のあるデータがずれない。
- **扱いやすい** ── 同じ設計図から複数の実体を作れるので、まとめて管理できる。

#### 7. まとめ ── 散らばる → 設計図にまとめる → 実体をつくる

{% steps [
  { "t":"散らばる", "d":"情報と動作が1枚ずつバラバラ。どれが誰のものか分からない" },
  { "t":"設計図にまとめる", "d":"関係のあるものを1つのクラスに入れる。情報はメンバ変数、動作はメソッド" },
  { "t":"実体をつくる", "d":"設計図から new でいくつでも作る。1つ分がひとまとまりで動く" }
], { "wide":true, "caption":"図F ── クラスの本質は「関係のあるものを、ひとまとまりに」" } %}

そして「同じ設計図から複数の実体を作る」形は、第4回から作る勇者一行そのものです。

{% compare { "vs":"作る ↓", "axis":"v", "cols":3, "wide":true, "caption":"図F' ── 冒険者の設計図が1つあれば、勇者も魔法使いもタンクもそこから作れる（第4回以降で実際に作ります）" } %}
{% panel "設計図（クラス）", { "sub":"冒険者に共通の情報と動作" } %}
{% classbox { "name":"Adventurer", "fields":["name","hp","atk"], "methods":["attack()"] } %}
{% endpanel %}
{% panel "実体（オブジェクト）", { "sub":"何人でも作れる", "tone":"ok" } %}
{% cards [
  { "chara":"hero", "name":"勇者", "stats":{ "hp":"120", "atk":"25" }, "size":"s" },
  { "chara":"wizard", "name":"魔法使い", "stats":{ "hp":"80", "atk":"40" }, "size":"s" },
  { "chara":"tank", "name":"タンク", "stats":{ "hp":"200", "atk":"15" }, "size":"s" }
], { "size":"s" } %}
{% endpanel %}
{% endcompare %}

### コードで見るとこうなる

第2部の演習で使う `Student` クラスを1回だけ通して見ます。**行ごとに読み解く必要はありません。**
図で見た「情報」「動作」「作るときの入口」が、コードのどの形になっているかだけ確認してください。

このクラスにはもう一つ、図には出ていない仕掛けがあります。
フィールドが `private` になっていて、**外から直接は読み書きできない**という点です。

{% capsule {
  "name":"Student",
  "inside":[ { "t":"number", "value":"1" }, { "t":"name", "value":"Matsuura" }, { "t":"height", "value":"168.5" } ],
  "gates":[ "getHeight()", "print()" ],
  "outside":"並べ替えをするコード",
  "legend":["private","gate"],
  "wide":true,
  "caption":"図H ── 中身は private なので外から直接は触れない。身長を知りたいときは窓口の getHeight() を通る"
} %}

```java file=Student.java
class Student {
    private final int number;
    private final String name;
    private final double height;

    public Student(int number, String name, double height) {
        this.number = number;
        this.name = name;
        this.height = height;
    }

    public double getHeight() {
        return height;
    }

    public void print() {
        System.out.printf("%2d %-10s %5.1f%n", number, name, height);
    }
}
```

<div class="table-scroll">

| 図で見たもの | コードでの形 |
|---|---|
| 設計図（クラスの枠） | `class Student { … }` |
| 黄色の付箋＝情報 | フィールド（メンバ変数）`private final double height;` |
| 青の付箋＝動作 | メソッド `public double getHeight()` / `public void print()` |
| 作るときに値を渡す入口 | コンストラクタ `public Student(int number, String name, double height)` |
| 実体を1つ作る | `new Student(1, "Matsuura", 168.5)` |
| 中身に直接触らせない窓口 | `private` ＋ `getHeight()` |

</div>

<div class="note note--hint">
<span class="note__title">private と getter は第3回、コンストラクタは第2回でくわしく扱います</span>
この回では「もう用意されているもの」として使ってかまいません。
演習でも、コンストラクタと <code>getHeight()</code> のあるクラスは最初から配ってあります。
</div>

<h2 class="part">第2部 実際に使ってみる</h2>

### 演習

3問あります。**3問すべてが「基本選択法で並べ替える」という同じ骨組み**で、
ライブラリのソートを使いません。そのおかげで「オブジェクトを交換する」感触がそのまま体験できます。

配布ソースをダウンロードして、ファイルの中の `▼▼【TODO○】` を埋めてください。
**埋めるのは比較条件と交換処理**が中心です。クラスの枠・コンストラクタ・表示処理は与えてあります。

<div class="note note--warn">
<span class="note__title">第2問・第3問は、配布したままではコンパイルできません（それが正常です）</span>
中身が空のメソッドが入っているので、ダウンロード直後は <code>javac</code> がエラーを出します。
（第1問はそのままでもコンパイル・実行できますが、TODO を埋めるまでは並べ替わりません。）
また <code>javac</code> は、ある誤りのせいで先を読めなくなると、その先のエラーをまだ報告しません。
そのため<strong>1か所直すと、別のエラーが新しく現れることがあります。</strong>「直したのにまだエラーが出る」のは失敗ではありません。
TODO をすべて埋めるまで、この繰り返しになります。
</div>

#### 第1問 身長ソートをクラス化する（目安 25分）

3本の並行配列で身長の高い順に並べ替えているコードを、`Student[]`（1要素＝1人分）に置きかえます。
**図Dから図Eへの移動を、自分の手でやる問題です。**

<div class="table-scroll">

| ファイル | すること |
|---|---|
| [HeightSort.java](../downloads/01-class/HeightSort.java) | **読むだけ。変更しない。** 改造のもとになる「クラスを使わない版」 |
| [Student.java](../downloads/01-class/Student.java) | **変更しない。** 完成した `Student` クラス |
| [HeightSortWithClass.java](../downloads/01-class/HeightSortWithClass.java) | **TODO①②を埋める** |

</div>

- **TODO①** ── `j` 番の生徒の身長が `maxIndex` 番より高ければ、`maxIndex` を `j` にする。
  身長は `students[j].getHeight()` で取ります（`height` は `private` なので直接は読めません）。
- **TODO②** ── `i` 番と `maxIndex` 番の**生徒そのもの**を交換する。
  一時変数の型は `double` ではなく `Student` です。

`HeightSort.java` と**まったく同じ出力**になれば成功です。
`HeightSort.java` の交換処理が3回に分かれていることと、自分が書いた交換処理を見比べてみてください。

#### 第2問 走者記録をタイム順に並べる（目安 35分）

キーボードから走者の記録を読み込み、タイムの速い順に並べ替えます。
第1問との違いは **降順ではなく昇順**（タイムは小さいほど速い）という点です。

<div class="table-scroll">

| ファイル | すること |
|---|---|
| [Runner.java](../downloads/01-class/Runner.java) | **TODO①②を埋める**（コンストラクタと `getTime()`） |
| [RunnerSort.java](../downloads/01-class/RunnerSort.java) | **TODO①②を埋める**（並べ替えの2か所） |

</div>

- `Runner.java` の **TODO①** ── 受け取った `number` / `name` / `time` をフィールドに入れる。
  `Student.java` のコンストラクタが手本になります。
- `Runner.java` の **TODO②** ── `time` を返す。
- `RunnerSort.java` の **TODO①②** ── 第1問と同じ形。ただし選ぶのは**最小値**なので `minIndex` です。

`Scanner` での読み取りループは完成させてあります。**並べ替える範囲が `runners.length`（10）ではなく
`count`（入力された件数）である**ところに注目してください。この「入れ物の大きさと中身の件数が
別々」という不便が、第4回の `ArrayList` の出発点になります。

#### 第3問 成績順位表（目安 45分）

英語・数学・国語の点数を持つ `ExamResult` を作り、**合計点の降順、同点なら出席番号の昇順**で
順位表を出します。

<div class="table-scroll">

| ファイル | すること |
|---|---|
| [ExamResult.java](../downloads/01-class/ExamResult.java) | **TODO①②③を埋める**（`getTotal` / `getAverage` / `ranksBefore`） |
| [ExamRanking.java](../downloads/01-class/ExamRanking.java) | **TODO①②を埋める** |

</div>

この問題のねらいは、**「どちらが順位表で先か」の判断をクラス側に持たせる**ことです。
`ExamRanking` は各教科の点数を知りません。`ranksBefore()` を呼んで
**クラスに聞くだけ**です。

<div class="note note--hint">
<span class="note__title">早く終わった人向け</span>
<ol>
<li>平均点に応じて A・B・C を返す <code>getGrade()</code> を追加する。</li>
<li>並び順を「合計点順」と「英語点順」から選べるようにする。</li>
<li>同点の人を同じ順位で表示するようにする。</li>
</ol>
</div>

### 実行結果の例

#### 第1問

`HeightSort.java`（改造前）と `HeightSortWithClass.java`（改造後）で、**出力は完全に同じ**になります。

```text
Height order
No Name       Height
 4 Tanaka     172.3
 1 Matsuura   168.5
 2 Matsumoto  167.5
12 Kawauchi   165.0
 7 Sato       160.8
```

#### 第2問

入力は「ゼッケン番号 名前 タイム」を1人1行。ゼッケン番号に `0` を入れると入力終了です。

```text input
4 Aoki 13.05
1 Mori 12.75
9 Kato 14.10
2 Sato 12.98
7 Ito 13.42
0
```

```text
Time order
No Name       Time
 1 Mori       12.75
 2 Sato       12.98
 4 Aoki       13.05
 7 Ito        13.42
 9 Kato       14.10
```

#### 第3問

Kita（11番）と Aoyama（12番）はどちらも 213点です。合計が同じときは出席番号の小さい11番が先に来ます。

```text
Rank No Name     Eng Math Jap Total Avg
 1  1 Fuji      90  80 100 270  90
 2 11 Kita      82  75  56 213  71
 3 12 Aoyama    70  70  73 213  71
 4  5 Tani      30  78  89 197  65
 5  3 Nishi     50  60  70 180  60
 6  9 Sudo      45  40  90 175  58
 7  2 Suzuki   100  30  20 150  50
```

### 解答・解説

<details>
<summary>第1問の解答を見る</summary>

`HeightSortWithClass.java` の並べ替え部分。金色の行が埋めたところです。

```java hl=4,9-11
for (int i = 0; i < students.length - 1; i++) {
    int maxIndex = i;
    for (int j = i + 1; j < students.length; j++) {
        if (students[j].getHeight() > students[maxIndex].getHeight()) {
            maxIndex = j;
        }
    }

    Student temp = students[i];
    students[i] = students[maxIndex];
    students[maxIndex] = temp;
}
```

**解説**

- 3本の並行配列を `Student[]` に置きかえ、1要素が1人分のデータを表すようにした。
- 比較には `getHeight()` を使い、`private` な `height` へ直接アクセスしていない。
- 交換処理は `Student` 型の一時変数を1つ使うだけ。**番号・名前・身長が一緒に移動する**（図E）。
- `print()` を `Student` 側に置いたので、1人分の表示形式もクラスにまとまっている。

**よくある誤り**

1. 身長だけを交換して、`Student` オブジェクトを交換していない（図Dと同じ壊れ方をします）。
2. `private` フィールドを `main` から直接参照してコンパイルエラーになる（`students[j].height` と書いてしまう）。
3. コンストラクタの代入で `this.height = height;` を書き忘れる。

</details>

<details>
<summary>第2問の解答を見る</summary>

`Runner.java`

```java
public Runner(int number, String name, double time) {
    this.number = number;
    this.name = name;
    this.time = time;
}

public double getTime() {
    return time;
}
```

`RunnerSort.java` の並べ替え部分。

```java hl=4,9-11
for (int i = 0; i < count - 1; i++) {
    int minIndex = i;
    for (int j = i + 1; j < count; j++) {
        if (runners[j].getTime() < runners[minIndex].getTime()) {
            minIndex = j;
        }
    }

    Runner temp = runners[i];
    runners[i] = runners[minIndex];
    runners[minIndex] = temp;
}
```

**解説**

- `Runner[]` の長さは10だが、入力済みの件数は `count` で管理する。並べ替えの範囲を `count` 未満に
  することで、まだ何も入っていない要素を比べずに済む。
- ゼッケン番号 `0` は終了の印であり、`Runner` オブジェクトとして配列へ追加しない。
- タイムは小さいほど速いので、選ぶ添字は `maxIndex` ではなく `minIndex`。
- 交換対象は `Runner` 型なので、番号・名前・タイムが一括で移動する。

**できたかの確認**

<div class="table-scroll">

| 観点 | 確認内容 |
|---|---|
| クラス設計 | `private` フィールド、コンストラクタ、`getTime()`、`print()` がそろっている |
| 入力 | `0` での終了と、最大10件を正しく扱えている |
| 並べ替え | `count` 件だけをタイムの昇順に並べている |
| オブジェクト操作 | `Runner` 全体を交換している |
| 出力 | 上の実行結果と同じ順序・同じ対応になっている |

</div>

</details>

<details>
<summary>第3問の解答を見る</summary>

`ExamResult.java`

```java
public int getTotal() {
    return english + math + japanese;
}

public int getAverage() {
    return getTotal() / 3;
}

public boolean ranksBefore(ExamResult other) {
    if (getTotal() != other.getTotal()) {
        return getTotal() > other.getTotal();
    }
    return number < other.number;
}
```

`ExamRanking.java` の並べ替え部分。

```java hl=4,9-11
for (int i = 0; i < results.length - 1; i++) {
    int bestIndex = i;
    for (int j = i + 1; j < results.length; j++) {
        if (results[j].ranksBefore(results[bestIndex])) {
            bestIndex = j;
        }
    }

    ExamResult temp = results[i];
    results[i] = results[bestIndex];
    results[bestIndex] = temp;
}
```

**解説**

- `getTotal()` と `getAverage()` を `ExamResult` に置き、成績に関する計算をクラスの責務にした。
- `ranksBefore(other)` が「合計点の降順」＋「同点なら出席番号の昇順」という2段階の比較条件を表している。
- `main` は各教科の値を知らない。**どちらが先かを `ExamResult` に問い合わせるだけ**でよい。
- 合計点を別の配列に保存しないので、点数と計算結果の食い違いが起きにくい。
  これは図Dの「並行配列だと対応が壊れる」と同じ話です。

</details>

### 次の回へ

第2回は、この回で「もう用意されているもの」として使った **コンストラクタ** を自分で書く回です。
同じ名前のメソッドで受け取るものを変える **オーバーロード** とあわせて、
「実体を作るときに何を渡すか」を自由に決められるようになります。
