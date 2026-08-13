/**
 * 【問題2】動作確認用（このファイルは変更しない）
 *
 * Hero / Wizard / Tank を書き換える「前」と「後」で、
 * 実行結果がまったく同じになればリファクタリング成功！
 */
public class Main2 {
    public static void main(String[] args) {
        Hero hero = new Hero("勇者", 100, 20);
        Wizard wizard = new Wizard("魔法使い", 60, 30);
        Tank tank = new Tank("タンク", 150, 5);

        hero.attack();
        wizard.attack();
        tank.attack();

        System.out.println(hero.status());
        System.out.println(wizard.status());
        System.out.println(tank.status());
    }
}
