/**
 * 【演習2】コンストラクタ
 *
 * モンスターを表す Monster クラス。
 * Monster を new するときに、名前・HP・攻撃力を設定できるようにしよう。
 *
 * 期待する出力（MonsterMain を実行）
 *   名前: スライム
 *   HP: 30
 *   攻撃力: 5
 */
public class Monster {

    private String name;
    private int hp;
    private int attack;

    public Monster(String name, int hp, int attack) {
        // ▼▼【TODO①】引数で受け取った値をフィールドに入れる
    }

    public void showInfo() {
        System.out.println("名前: " + name);
        System.out.println("HP: " + hp);
        System.out.println("攻撃力: " + attack);
    }
}
