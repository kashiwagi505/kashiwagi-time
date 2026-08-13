/**
 * 【演習3】コンストラクタのオーバーロード
 *
 * 演習2の Monster クラスを改造し、モンスターの作り方を3種類に増やす。
 * ※ 演習2と同じプロジェクトに置くと同名クラスが2つになってしまうので、
 *    別のプロジェクト（またはこの ex3 フォルダ）で作業しよう。
 *
 * 初期値のルール
 *   Monster()                                → name = "ななしモンスター", hp = 10, attack = 1
 *   Monster(String name)                     → hp = 10, attack = 1
 *   Monster(String name, int hp, int attack)  → 引数の値をそのまま使う
 *
 * 期待する出力（MonsterMain を実行）
 *   名前: ななしモンスター
 *   HP: 10
 *   攻撃力: 1
 *
 *   名前: スライム
 *   HP: 10
 *   攻撃力: 1
 *
 *   名前: ドラゴン
 *   HP: 300
 *   攻撃力: 80
 */
public class Monster {

    private String name;
    private int hp;
    private int attack;

    public Monster() {
        // ▼▼【TODO①】ななしモンスターとして作る
    }

    public Monster(String name) {
        // ▼▼【TODO②】名前だけ受け取って作る
    }

    public Monster(String name, int hp, int attack) {
        // ▼▼【TODO③】名前、HP、攻撃力を受け取って作る
    }

    public void showInfo() {
        System.out.println("名前: " + name);
        System.out.println("HP: " + hp);
        System.out.println("攻撃力: " + attack);
        System.out.println();
    }
}
