/**
 * 【問題3】動作確認用（このファイルは変更しない）
 *
 * Arthur.java と Merlin.java を作成して、
 * 問題プリントの「実行結果」と同じ出力になれば成功！
 */
public class Main3 {
    public static void main(String[] args) {

        // 孫クラスのオブジェクトを作る
        Arthur arthur = new Arthur("アーサー", 120, 25);
        Merlin merlin = new Merlin("マーリン", 70, 35);

        // 孫クラスでも、冒険者クラスの status() がそのまま使える
        System.out.println(arthur.status());
        System.out.println(merlin.status());
        System.out.println("--------------------");

        // 魔王とバトル！
        Adventurer maou = new Adventurer("魔王", 300, 30);
        maou.damage(arthur.attack());
        maou.damage(merlin.attack());
    }
}
