/**
 * 【問題2】このクラスを Adventurer を継承して書き直そう
 *
 * いまは Adventurer とほぼ同じ内容を全部自分で書いている状態。
 * extends を使えば、残すのは「コンストラクタ」と「attack()」だけになるはず！
 * ※ Main2 の実行結果が書き換え前と同じになれば成功
 */
public class Wizard {
    private String name;
    private int hp;
    private int atk;

    public Wizard(String name, int hp, int atk) {
        this.name = name;
        this.hp = hp;
        this.atk = atk;
    }

    public String getName() { return name; }
    public int getHp()      { return hp; }
    public int getAtk()     { return atk; }
    public void setName(String name) { this.name = name; }
    public void setHp(int hp)        { this.hp = hp; }

    // 魔法使いだけの攻撃メッセージ
    public int attack() {
        System.out.println(name + " は呪文を唱えた！");
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
