/**
 * 【問3】動作確認用（このファイルは変更しない）
 */
public class Main {
    public static void main(String[] args) {
        Player player = new Player("勇者", 30, 5);

        System.out.println(player.getName() + "のHP: " + player.getHp());

        player.damage(3);
        System.out.println("3ダメージ後: " + player.getHp());

        player.damage(12);
        System.out.println("12ダメージ後: " + player.getHp());

        player.heal(4);
        System.out.println("4回復後: " + player.getHp());

        player.damage(100);
        System.out.println("100ダメージ後: " + player.getHp());
        System.out.println("敗北しているか: " + player.isDefeated());

        player.heal(10);
        System.out.println("敗北後に10回復: " + player.getHp());
    }
}
