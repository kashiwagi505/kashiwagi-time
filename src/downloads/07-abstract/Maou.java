/**
 * 魔王クラス（配布用・完成品／変更しない）
 *
 * 問題2で Adventurer を抽象クラスにすると、
 * 「new Adventurer(...)」で魔王を作ることができなくなる。
 * そのため魔王も、冒険者クラスを継承した1つのクラスにしてある。
 *
 * さらに、抽象メソッド specialAttack( ) を親に追加すると
 * 魔王クラスも実装を強制される（抽象メソッドは全子クラスに及ぶ！）ので、
 * あらかじめ実装してある。
 * ※ 問題2を解く前でもコンパイルが通るよう、@Override は付けていない
 */
public class Maou extends Adventurer {

    public Maou(String name, int hp, int atk) {
        super(name, hp, atk);
    }

    @Override
    public int attack() {
        System.out.println(getName() + " の禍々しい一撃！");
        return getAtk();
    }

    // 問題2で親に abstract int specialAttack(); を追加すると、
    // このメソッドがその実装（オーバーライド）になる
    public int specialAttack() {
        System.out.println(getName() + " の絶望の波動！");
        return getAtk() * 2;
    }
}
