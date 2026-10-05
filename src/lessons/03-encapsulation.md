---
order: 3
---

<h2 class="part">第1部 直感的につかむ</h2>

### この回でできるようになること

- `public` にしたフィールドが、クラスの外から自由に見られて書き換えられてしまうことが分かる
- 見せたくない値を `private` で隠し、必要な操作だけを `public` な getter / setter として出す形が書ける
- 値の変更を setter に集めると、「HP がマイナスになる」ような不正な状態を入口で止められると分かる

### 勇者一行で例えると

勇者のステータスを、こんなクラスで持っていたとします。HP は `hp` というフィールド1つ。
攻撃を受けたら、外のコードが `hp` から直接ダメージ分を引く ── ひとまず、これでも動きます。

ところが HP 20 の勇者に 50 ダメージが入ると、こうなります。

{% cards [
  { "chara":"hero", "name":"勇者 ゆいたろう", "mark":"x", "stats":{ "最大HP":"120" },
    "bar":{ "label":"HP", "value":-30, "max":120 },
    "note":"外のコードから hp を直接 50 引いた結果" }
], { "caption":"HP がマイナス。ゲームとしてはありえない状態が、コードの上では作れてしまう" } %}

本来なら HP が 0 になった時点で敗北の処理をしたいのに、外から直接引き算されたので
その処理をまったく通っていません。**値そのものは合っているのに、状態が壊れている**わけです。

この回のテーマである <span class="term">カプセル化</span>は、この事故を「入口を1つに決める」ことで防ぎます。
勇者が単体で出てくるのはこの回が最初で、[第4回](04-arraylist.html)からは勇者一行の全員が
共通の題材になります。ここで作る「中身を守る形」が、そのまま名簿や継承の土台になります。

<div class="note note--hint">
<span class="note__title">たとえは2本あります</span>

この回では「隠せてうれしい」例として**銀行口座**、「ルールを守らせてうれしい」例として
**勇者のHP**を使います。銀行口座は身近なたとえ、勇者のHPは実際のコードの話、という役割分担です。

</div>

### 図解でつかむ

#### `public` と `private` ── 外から触れるかどうか

<span class="term">`public`</span> はクラスの外からアクセスできる、
<span class="term">`private`</span> はそのクラスの外からは直接アクセスできない、という指定です。
同じ銀行口座のクラスでも、どちらを付けるかで見え方がまるで変わります。

{% compare { "vs":"VS", "wide":true, "legend":true, "caption":"同じ BankAccount でも、public のままなら中身が丸見え。private にして窓口を用意すると、外から使えるのは窓口だけになる" } %}
{% panel "全部 public", { "sub":"便利だけど、危ない", "tone":"danger", "mark":"x" } %}
{% classbox {
  "name":"BankAccount",
  "fields":[
    { "t":"balance", "access":"public", "note":"外から書き換えられる" },
    { "t":"accountNumber", "access":"public" },
    { "t":"password", "access":"public", "mark":"bang", "note":"パスワードまで見えてしまう" }
  ],
  "foot":"外のコードが直接 balance を書き換えられる"
} %}
{% endpanel %}
{% panel "private ＋ public な窓口", { "sub":"決めた入口だけ", "tone":"ok", "mark":"o" } %}
{% classbox {
  "name":"BankAccount",
  "fields":[
    { "t":"balance", "access":"private" },
    { "t":"accountNumber", "access":"private" },
    { "t":"password", "access":"private", "note":"窓口を作らない" }
  ],
  "methods":[
    { "t":"getBalance()", "access":"public" },
    { "t":"deposit(int amount)", "access":"public" },
    { "t":"withdraw(int amount)", "access":"public" }
  ],
  "foot":"外のコードが使えるのは、この3つの窓口だけ"
} %}
{% endpanel %}
{% endcompare %}

#### メリット1 ── 見せたくない部分を隠せる

`private` にした値は、必要なら **getter**（値を取り出す窓口）や
**setter**（値を変更する窓口）を通して使います。
大事なのは、外から変数を直接触るのではなく、決めた入口を通すことです。

{% capsule {
  "name":"BankAccount", "note":"銀行口座",
  "inside":[
    { "t":"残高", "value":"1,000円" },
    { "t":"口座番号", "value":"A001" },
    { "t":"パスワード", "value":"非公開" }
  ],
  "gates":[ "残高確認 getBalance()", "入金 deposit()", "引き出し withdraw()" ],
  "outside":"外のコード",
  "legend":["private","gate"],
  "wide":true,
  "caption":"見られたら困る値は中に隠し、外に出すのは操作だけ。パスワードには窓口を作っていないので、外から見る方法が一切ない"
} %}

窓口を作るかどうかは、値ごとに選べます。**残高は「見せるが、書き換えは入金／出金だけ」、
パスワードは「そもそも見せない」**。この作り分けが情報隠蔽の考え方です。

#### メリット2 ── 変更を決めた操作に限定できる

勇者の `hp` に戻ります。`hp` を `private` にすると、外のコードは `setHp()` を通るしかありません。

{% capsule {
  "name":"Hero", "chara":"hero",
  "inside":[ { "t":"hp", "value":"20" }, { "t":"name", "value":"ゆいたろう" } ],
  "gates":[ "getHp()", "setHp(int hp)" ],
  "outside":"外のコード", "outsideChara":"assassin",
  "legend":["private","gate"],
  "wide":true,
  "caption":"中身には直接触れない。出入りは窓口メソッドだけを通る"
} %}

入口が1つに決まると、その入口に**ルールを書けます**。
「0 未満になったら HP を 0 にして、敗北の処理へ回す」を必ず通せる、ということです。

{% compare { "axis":"v", "vs":"setHp() を通すと ↓", "wide":true, "legend":["danger","ok"], "caption":"上は直接引き算した場合、下は setter を通した場合。同じ「20 に 50 ダメージ」でも、通る道が違えば結果が違う" } %}
{% panel "直接 hp を書き換えると", { "tone":"danger", "mark":"x" } %}
{% flow [
  { "chara":"hero", "t":"HP 20", "bar":{ "label":"HP", "value":20, "max":120 } },
  { "t":"HP = -30", "arrow":"hp -= 50", "tone":"danger", "mark":"x",
    "bar":{ "label":"HP", "value":-30, "max":120 }, "d":"敗北の処理を通らないまま、ありえない値になる" }
] %}
{% endpanel %}
{% panel "setHp() を通すと", { "tone":"ok", "mark":"o" } %}
{% flow [
  { "chara":"hero", "t":"HP 20", "bar":{ "label":"HP", "value":20, "max":120 } },
  { "chara":"tank", "t":"setHp() が受け取る", "arrow":"setHp(20 - 50)", "tone":"action", "d":"門番として値を検査する" },
  { "t":"HP = 0", "arrow":"if (hp < 0)", "arrowTone":"action", "tone":"ok",
    "bar":{ "label":"HP", "value":0, "max":120, "stop":true } },
  { "t":"敗北の処理へ", "tone":"mute" }
] %}
{% endpanel %}
{% endcompare %}

カプセル化の強いところは、値を隠すだけでなく**正しい使い方に誘導できる**ことです。

#### この回のまとめ

{% steps [
  { "t":"private で隠す", "d":"フィールドはクラスの外から直接触らせない" },
  { "t":"public な窓口を作る", "d":"必要な操作だけを getter / setter として出す" },
  { "t":"不正な変更を止める", "d":"setter の中でチェックすれば、ありえない値は入口で弾ける", "chara":"hero" }
], { "wide":true, "caption":"中身は守り、窓口から使う" } %}

### コードで見るとこうなる

Java では、メンバ変数に `private` を付け、外から必要なときだけ `public` な getter / setter を用意します。

```java file=Hero.java hl=9
public class Hero {
    private int hp;

    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        if (hp < 0) hp = 0;
        this.hp = hp;
    }
}
```

図とコードの対応はこの3か所だけです。

<div class="table-scroll">

| 図の中の呼び名 | コードでの書き方 |
|---|---|
| 中身（外からは触れない） | `private int hp;` |
| 窓口（外から呼べる） | `public int getHp()` / `public void setHp(int hp)` |
| 入口でのチェック | `if (hp < 0) hp = 0;`（強調した行） |

</div>

`hp` が `private` になったので、外のコードからの直接アクセスはコンパイルの時点で止まります。

```java error
// hp は private なので、外のコードからは代入できない
hero.hp = -30;
```

「窓口を作らない」ことにも意味があります。getter を用意しなければ、
その値は外から**読むことすらできません**。

```java error
// getPassword() を作っていないので、呼ぶこともできない
account.getPassword();
```

<div class="note">
<span class="note__title">setter の <code>this.</code></span>

`setHp(int hp)` のように引数名とフィールド名が同じとき、`this.hp = hp;` と書いて
「このオブジェクトの `hp`」と「受け取った引数の `hp`」を区別します。
[第2回](02-overload.html)のコンストラクタと同じ書き方です。

</div>

<h2 class="part">第2部 実際に使ってみる</h2>

### 演習

3問あります。**問1は改造、問2・問3は穴埋め**です。白紙から書く問題はありません。
`Main.java` は完成した状態で入っているので、**変更せずそのまま動作確認に使ってください**。
どう動けば正解なのかは `Main.java` と「実行結果の例」が教えてくれます。

<div class="table-scroll">

| 演習 | 作るクラス | ダウンロード |
|---|---|---|
| 問1 | `Student` | [Student.java](../downloads/03-encapsulation/ex1/Student.java) ／ [Main.java](../downloads/03-encapsulation/ex1/Main.java) |
| 問2 | `BankAccount` | [BankAccount.java](../downloads/03-encapsulation/ex2/BankAccount.java) ／ [Main.java](../downloads/03-encapsulation/ex2/Main.java) |
| 問3 | `Player` | [Player.java](../downloads/03-encapsulation/ex3/Player.java) ／ [Main.java](../downloads/03-encapsulation/ex3/Main.java) |

</div>

**`Main.java` が3つとも同じクラス名なので、問ごとに別のフォルダ（`ex1` / `ex2` / `ex3`）に分けてあります。**
同じフォルダに混ぜるとコンパイルできません。1問ぶんの2ファイルを同じ場所に置いて進めてください。

<div class="note note--warn">
<span class="note__title">配布した状態ではコンパイルが通りません</span>

`Main.java` が、これから作る getter / setter を呼んでいるためです。**これは壊れているのではなく、
穴が埋まっていないだけ**です。また javac は最初に見つけたエラーで報告を打ち切るので、
**1つ直すと次のエラーが現れます**。エラーが減っていれば前に進んでいます。

</div>

#### 問1 `Student` クラスをカプセル化する

配布した `Student.java` は、フィールドが `public` のままの状態です。

```java file=ex1/Student.java
public class Student {

    // ▼▼【TODO①】nameとscoreをprivateにする
    public String name;
    public int score;

    // ▼▼【TODO②】setName / getName / setScore / getScoreを作る

}
```

- **TODO①** `name` と `score` を `private` にする
- **TODO②** `setName` / `getName` / `setScore` / `getScore` を作る
- 点数の範囲チェックは今回は不要

`Main.java`（変更しない）はこう呼び出します。ここで使われているメソッド名が、そのまま作るものの一覧です。

```java file=ex1/Main.java
public class Main {
    public static void main(String[] args) {
        Student student = new Student();

        student.setName("田中");
        student.setScore(85);

        System.out.println("名前: " + student.getName());
        System.out.println("点数: " + student.getScore());
    }
}
```

<div class="note">

[第1回](01-class.html)にも `Student` が出てきますが、**別のクラスです。**
第1回のものは番号・名前・身長を持つ完成済みのクラス、こちらは `name` と `score` だけを持つ、
`public` のままの未完成の状態です。

</div>

#### 問2 `BankAccount` クラスを作成する

残高やパスワードを直接変更・参照させず、必要な操作だけを `public` メソッドとして公開します。
作るものの全体像はこれです。

{% classbox {
  "name":"BankAccount",
  "note":"問2で作るクラス",
  "fields":[
    { "t":"accountNumber : String", "access":"private", "note":"getAccountNumber() で見せる" },
    { "t":"ownerName : String", "access":"private", "note":"getOwnerName() で見せる" },
    { "t":"balance : int", "access":"private", "note":"getBalance() で見せる" },
    { "t":"password : String", "access":"private", "mark":"x", "markLabel":"窓口を作らない", "note":"getter なし＝外から見る方法がない" }
  ],
  "methods":[
    { "t":"getAccountNumber()", "access":"public", "note":"口座番号を返す" },
    { "t":"getOwnerName()", "access":"public", "note":"口座名義を返す" },
    { "t":"getBalance()", "access":"public", "note":"残高を返す" },
    { "t":"deposit(int amount)", "access":"public", "note":"amount が1以上なら残高を増やす" },
    { "t":"withdraw(int amount)", "access":"public", "note":"出金できたら true。金額が不正、または残高不足なら false" }
  ],
  "legend":["private","gate",{ "mark":"x", "label":"窓口を作らない" }],
  "wide":true,
  "caption":"銀行くんが持っている情報（黄）と、外から使える機能（青）。パスワードだけ窓口がない"
} %}

コンストラクタは、`Main.java` が呼び出すこの形に合わせます。

```java nonum
BankAccount account = new BankAccount("A001", "山田太郎", "pass1234", 1000);
```

埋める場所は5つです。

```java file=ex2/BankAccount.java
public class BankAccount {

    // ▼▼【TODO①】ここにフィールドを書く

    // ▼▼【TODO②】ここにコンストラクタを書く

    // ▼▼【TODO③】ここにgetterを書く

    // ▼▼【TODO④】ここにdepositメソッドを書く

    // ▼▼【TODO⑤】ここにwithdrawメソッドを書く

}
```

<div class="note note--hint">
<span class="note__title">コンストラクタは第2回の内容です</span>

`private` なフィールドに最初の値を入れるのはコンストラクタの仕事です（[第2回](02-overload.html)）。
**初期化のときも入口でルールを守らせられる**ので、残高がマイナスで渡されたら 0 にする、といったチェックも書けます。

</div>

#### 問3 `Player` クラスを作成する（発展）

時間外に復習したい人向けです。HP・最大HP・防御力・敗北状態を、クラスの内部で管理します。
第1部の「setter の中でルールを守らせる」を、そのまま自分で書く問題です。

<div class="table-scroll">

| フィールド（すべて private） | 型 | 説明 |
|---|---|---|
| `name` | `String` | プレイヤー名 |
| `maxHp` | `int` | 最大HP |
| `hp` | `int` | 現在のHP |
| `defense` | `int` | 防御力 |
| `defeated` | `boolean` | 敗北しているか |

</div>

<div class="table-scroll">

| メソッド | 戻り値 | 説明 |
|---|---|---|
| `getName()` / `getMaxHp()` / `getHp()` / `getDefense()` | `String` / `int` | それぞれの値を返す |
| `isDefeated()` | `boolean` | 敗北しているかを返す |
| `damage(int amount)` | `void` | 防御力を考えてHPを減らす |
| `heal(int amount)` | `void` | 最大HPを超えないように回復する |

</div>

コンストラクタは名前・最大HP・防御力の3つを受け取ります。

```java nonum
public Player(String name, int maxHp, int defense) {
    // ここでフィールドを初期化する
}
```

ルールは次のとおりです。

- `maxHp` が1未満なら1にする。`defense` が0未満なら0にする
- `damage` では `amount - defense` の分だけHPを減らす。
  **引いた結果が0以下ならHPは減らない**（防御力以下の攻撃は通らない）
- HPが0より小さくなったら「敗北」と表示し、HPを0、`defeated` を `true` にする
- 敗北後は `damage` と `heal` でHPが変わらない

<div class="note">
<span class="note__title"><code>isDefeated()</code> という名前</span>

`boolean` を返す getter は、`get〜` ではなく **`is〜`** と名づけるのが Java の慣習です。
`if (player.isDefeated())` と書いたときに英語の文として読めます。

</div>

```java file=ex3/Player.java
public class Player {

    // ▼▼【TODO①】ここにフィールドを書く

    // ▼▼【TODO②】ここにコンストラクタを書く

    // ▼▼【TODO③】ここにgetterを書く

    // ▼▼【TODO④】ここにdamageメソッドを書く

    // ▼▼【TODO⑤】ここにhealメソッドを書く

}
```

### 実行結果の例

`Main.java` をそのまま実行して、この出力になれば正解です。

**問1**

```text
名前: 田中
点数: 85
```

**問2**

```text
口座番号: A001
口座名義: 山田太郎
残高: 1000円
入金後: 1500円
出金できました
出金後: 1200円
残高不足です
最終残高: 1200円
```

**問3**（`Player("勇者", 30, 5)` ＝ 最大HP 30・防御力 5 で開始）

```text
勇者のHP: 30
3ダメージ後: 30
12ダメージ後: 23
4回復後: 27
敗北
100ダメージ後: 0
敗北しているか: true
敗北後に10回復: 0
```

<div class="note note--hint">

問3の2行目に注目してください。**3ダメージなのにHPが減っていません。**
防御力5に対して3のダメージなので、通らなかったということです。

</div>

### 解答・解説

書き方は一つではありません。**`private` なフィールドが守られていて、`Main` から必要なメソッドだけを
使う形になっていれば正解**です。

<details>
<summary>問1 の解答を見る</summary>

```java file=Student.java
public class Student {
    private String name;
    private int score;

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getScore() {
        return score;
    }
}
```

`public` を `private` に変えた瞬間に `Main.java` がコンパイルできなくなり、
getter / setter を足すと通るようになります。**この往復が「窓口を通す」という形そのもの**です。

</details>

<details>
<summary>問2 の解答を見る</summary>

```java file=BankAccount.java hl=7-17
public class BankAccount {
    private String accountNumber;
    private String ownerName;
    private String password;
    private int balance;

    public BankAccount(String accountNumber, String ownerName, String password, int balance) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.password = password;

        if (balance < 0) {
            this.balance = 0;
        } else {
            this.balance = balance;
        }
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public int getBalance() {
        return balance;
    }

    public void deposit(int amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public boolean withdraw(int amount) {
        if (amount <= 0) {
            return false;
        }

        if (amount > balance) {
            return false;
        }

        balance -= amount;
        return true;
    }
}
```

- `password` は `private` なフィールドとして持ちますが、**`getPassword()` は作りません。**
  外に見せたくない情報は、getter を用意しないことで隠せます。
- 強調したコンストラクタが、**入口でのチェックの1つめ**です（マイナスの残高で作らせない）。
- `deposit` は `amount > 0` のときだけ足し、`withdraw` は金額が不正か残高不足なら `false` を返して
  残高を変えません。**「残高を減らす」という操作を外に開放していない**ので、
  この2つのルールを回避する方法が存在しません。

</details>

<details>
<summary>問3 の解答を見る</summary>

```java file=Player.java hl=47-64
public class Player {
    private String name;
    private int maxHp;
    private int hp;
    private int defense;
    private boolean defeated;

    public Player(String name, int maxHp, int defense) {
        this.name = name;

        if (maxHp < 1) {
            this.maxHp = 1;
        } else {
            this.maxHp = maxHp;
        }

        if (defense < 0) {
            this.defense = 0;
        } else {
            this.defense = defense;
        }

        this.hp = this.maxHp;
        this.defeated = false;
    }

    public String getName() {
        return name;
    }

    public int getMaxHp() {
        return maxHp;
    }

    public int getHp() {
        return hp;
    }

    public int getDefense() {
        return defense;
    }

    public boolean isDefeated() {
        return defeated;
    }

    public void damage(int amount) {
        if (defeated || amount <= 0) {
            return;
        }

        int actualDamage = amount - defense;
        if (actualDamage <= 0) {
            return;
        }

        hp -= actualDamage;

        if (hp < 0) {
            System.out.println("敗北");
            hp = 0;
            defeated = true;
        }
    }

    public void heal(int amount) {
        if (defeated || amount <= 0) {
            return;
        }

        hp += amount;

        if (hp > maxHp) {
            hp = maxHp;
        }
    }
}
```

`damage` と `heal` の中に4種類のルールが同居しています。

<div class="table-scroll">

| ルール | コード | 実行結果に出るところ |
|---|---|---|
| 敗北後は何も起きない | `if (defeated ...) return;` | `敗北後に10回復: 0` |
| 防御力以下の攻撃は通らない | `if (actualDamage <= 0) return;` | `3ダメージ後: 30` |
| HPは0より下にならない | `if (hp < 0) { ... hp = 0; }` | `100ダメージ後: 0` |
| 回復は最大HPを超えない | `if (hp > maxHp) { hp = maxHp; }` | `4回復後: 27`（23 + 4 = 27 で上限内） |

</div>

**この4つは全部「外から呼べる2つのメソッドの中」にあります。** これが第1部の
「変更を決めた操作に限定する」の完成形です。`hp` が `public` だったら、
どのルールも簡単に回避できてしまいます。

なお、この教材では敗北の条件を **「HPが0より小さくなったら」**（`hp < 0`）としています。
ちょうど0で止まったときは敗北になりません。ゲームとして「0で敗北」にしたい場合は
`if (hp <= 0)` に変えるだけで済む ── というのも、判定が1か所に集まっているおかげです。

</details>

### この先どうつながるか

- [第4回 ArrayList](04-arraylist.html) — 勇者一行の名簿を作ります。名簿に入れる自作クラスが
  `private` ＋ getter で作られている前提で進みます
- [第5回 継承・オーバーライド](05-inheritance.html) — `private` は**子クラスからも触れません。**
  「そのクラスの外は、子であっても外」という話が出てきます
- [第7回 抽象クラス・インターフェイス](07-abstract.html) — 「実装を隠して操作だけ見せる」という、
  この回の発想をクラスの外側まで広げた形が登場します
