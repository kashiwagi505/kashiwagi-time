/**
 * 魔法使いクラス（配布用・完成品）
 * 冒険者クラスを継承し、attack() をオーバーライドしている。
 * さらに魔法使いだけの固有メソッド「heal（回復魔法）」を持つ。
 */
public class Wizard extends Adventurer {

    public Wizard(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は呪文を唱えた！");
        return getAtk();
    }

    // 魔法使いだけの固有メソッド：回復魔法
    public void heal(Adventurer target) {
        target.setHp(target.getHp() + 30);
        System.out.println(getName() + " は回復魔法を唱えた！ "
                + target.getName() + " のHPが 30 回復（HP: " + target.getHp() + "）");
    }
}
