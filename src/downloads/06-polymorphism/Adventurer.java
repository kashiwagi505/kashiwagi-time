/**
 * 冒険者クラス（配布用・全問共通で使用）
 * 名前（役職名）・HP・攻撃力・攻撃メソッドを持つ
 */
public class Adventurer {
    private String name; // 役職名（勇者、魔法使い など）
    private int hp;      // 体力
    private int atk;     // 攻撃力

    public Adventurer(String name, int hp, int atk) {
        this.name = name;
        this.hp = hp;
        this.atk = atk;
    }

    // ---- getter / setter ----
    public String getName() { return name; }
    public int getHp()      { return hp; }
    public int getAtk()     { return atk; }
    public void setName(String name) { this.name = name; }
    public void setHp(int hp)        { this.hp = hp; }

    // ---- 攻撃用メソッド：与えるダメージ(atk)を返す ----
    public int attack() {
        System.out.println(name + " の攻撃！");
        return atk;
    }

    // ---- ダメージを受ける ----
    public void damage(int d) {
        hp -= d;
        if (hp < 0) hp = 0;
        System.out.println(name + " は " + d + " のダメージを受けた！（残りHP: " + hp + "）");
    }

    // ---- ステータス表示用 ----
    public String status() {
        return name + "（HP:" + hp + " / ATK:" + atk + "）";
    }
}
