import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

/**
 * 問題2：ポリモーフィズムを使ったバトルゲーム
 *
 * 空欄は【TODO①】〜【TODO③】の3か所だけ。
 * ゲームループ・入力処理・ダメージ生成・HP管理・勝敗判定は
 * すべて完成しているので、変更しなくてよい。
 *
 * 配布済みのサブクラス：Hero / Wizard / Tank / Archer
 * （すべて Adventurer を継承し、attack() をオーバーライド済み）
 */
public class PolyGame {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();

        // 敵キャラは固定
        Adventurer maou = new Adventurer("魔王", 250, 0);

        // ================================================
        // ▼▼【TODO①】冒険者クラスを持つ ArrayList「party」を
        //             作成しよう
        // ================================================



        // ================================================
        // ▼▼【TODO②】冒険者クラスを親とするクラス
        //             （Hero / Wizard / Tank / Archer）から
        //             好きな 3体以上 を new して party に追加しよう
        //   例）勇者（HP:100 ATK:20）タンク（HP:150 ATK:5）など
        //   ※ 違うクラスを混ぜてOK！ それでも同じリストに入る？
        // ================================================



        System.out.println("★ 魔王が現れた！ ★");

        // ---- バトルループ（ここから下は完成済み）----
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

            // --- 攻撃するキャラを選ぶ ---
            System.out.print("攻撃するキャラの番号を入力 >> ");
            int select = scanner.nextInt();

            // ================================================
            // ▼▼【TODO③】ポリモーフィズムを使った攻撃！
            //   1) party から select 番のキャラを
            //      「Adventurer型」の変数 attacker で受け取る
            //   2) attacker.attack() を呼び、返ってきたダメージを
            //      maou.damage( ) に渡す
            //   ※ どのクラスか意識していないのに、
            //      そのキャラ自身の攻撃が出るはず！
            // ================================================



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
