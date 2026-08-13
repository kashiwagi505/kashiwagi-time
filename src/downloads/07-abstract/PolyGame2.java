import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

/**
 * 第3回：スペシャルアタック対応バトルゲーム（配布用・完成品）
 *
 * 前回の PolyGame に「行動選択」を追加したもの。
 *   1: こうげき        → attack() を多態的に呼ぶ
 *   2: スペシャルアタック → specialAttack() を多態的に呼ぶ
 *
 * このファイル自体は完成している。書き換えるのは1か所だけ：
 *   問題3が終わったら、下の【★】のコメントブロックを解除する。
 *
 * ※ 注意：このゲームは specialAttack( ) を使うため、
 *   問題2（冒険者クラスへの追加と各クラスの実装）が終わるまでは
 *   コンパイルできない。問題2を完成させてから実行しよう。
 *
 * 使用するクラス（前回からの引継ぎ＋今回配布のMaou）：
 *   Adventurer / Hero / Wizard / Tank / Archer / Maou
 */
public class PolyGame2 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();

        // 敵キャラは固定（Adventurerを抽象化してもnewできるよう、Maouクラスにしてある）
        Maou maou = new Maou("魔王", 250, 20);

        // パーティ（前回のTODO①②の解答済み）
        ArrayList<Adventurer> party = new ArrayList<>();
        party.add(new Hero("勇者", 100, 20));
        party.add(new Wizard("魔法使い", 60, 30));
        party.add(new Tank("タンク", 150, 5));
        party.add(new Archer("弓使い", 80, 15));

        System.out.println("★ 魔王が現れた！ ★");

        // ---- バトルループ ----
        while (true) {

            // --- パーティ全員の表示 ---
            System.out.println("\n----- パーティ -----");
            int i = 0;
            for (Adventurer member : party) {
                System.out.println(i + ": " + member.status());
                i++;
            }
            System.out.println("魔王（HP:" + maou.getHp() + "）");
            System.out.println("--------------------");

            // --- キャラと行動を選ぶ ---
            System.out.print("キャラの番号を入力 >> ");
            int select = scanner.nextInt();
            System.out.print("行動を選択（1:こうげき 2:スペシャルアタック）>> ");
            int action = scanner.nextInt();

            // --- ポリモーフィズムを使った行動（前回のTODO③の発展形）---
            Adventurer attacker = party.get(select);

            if (action == 2) {

                // ============================================================
                // 【★】問題3が終わったら、下の /* と */ の行を消して
                //      コメントを解除しよう（解除したら、その下の1行は削除！）
                // ============================================================
                /*
                if (attacker instanceof Excalibur) {              // 聖剣の持ち主か判別して
                    Excalibur wielder = (Excalibur) attacker;     // キャストすると…
                    maou.damage(wielder.holyStrike());            // 聖なる一撃が使える！
                } else {
                    maou.damage(attacker.specialAttack());
                }
                */
                maou.damage(attacker.specialAttack()); // ←【★】を解除したらこの行は削除

            } else {
                maou.damage(attacker.attack());
            }

            // --- 魔王を倒したか判定 ---
            if (maou.getHp() <= 0) {
                System.out.println("\n★★ 魔王を倒した！ 世界に平和が戻った ★★");
                break;
            }

            // --- 魔王の反撃（ランダムな仲間に、ランダムなダメージ）---
            int targetIndex = random.nextInt(party.size());
            Adventurer target = party.get(targetIndex);
            int dmg = random.nextInt(16) + 15; // 15〜30 のランダム
            System.out.println("\n魔王の反撃！");
            target.damage(dmg);

            // --- 倒れた仲間の離脱 ---
            if (target.getHp() <= 0) {
                System.out.println(target.getName() + " は倒れてしまった…");
                party.remove(target);
            }

            // --- 全滅判定 ---
            if (party.isEmpty()) {
                System.out.println("\n全滅してしまった…");
                break;
            }
        }

        scanner.close();
    }
}
