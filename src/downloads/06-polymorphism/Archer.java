/**
 * 弓使いクラス（配布用・完成品）
 * 冒険者クラスを継承し、attack() をオーバーライドしている。
 */
public class Archer extends Adventurer {

    public Archer(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " は矢を放った！");
        return getAtk();
    }
}
