import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

/**
 * 問題3：簡易バトルゲーム
 *
 * ArrayList に関する部分だけが空欄になっている。
 * 「▼▼【TODO①】〜【TODO⑥】」の6か所を埋めれば完成！
 * （それ以外のコードは変更しなくてよい）
 *
 * ゲームの流れ：
 *   1. パーティ全員を表示
 *   2. 攻撃するキャラを番号で選ぶ
 *   3. 選んだキャラが魔王を攻撃
 *   4. 魔王がランダムな仲間に反撃
 *   5. HPが0になった仲間は離脱（リストから削除）
 *   6. 魔王を倒すか、パーティが全滅するまで繰り返す
 */
public class Game {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        Random random = new Random();

        // 敵キャラは固定
        Adventurer maou = new Adventurer("魔王", 200, 25);

        // ================================================
        // ▼▼【TODO①】パーティ用の ArrayList「party」を作成しよう
        // ================================================



        // ================================================
        // ▼▼【TODO②】パーティに4人の仲間を追加しよう
        //   勇者（HP:100 ATK:20）
        //   魔法使い（HP:60 ATK:30）
        //   タンク（HP:150 ATK:5）
        //   弓使い（HP:80 ATK:15）
        // ================================================



        System.out.println("★ 魔王が現れた！ ★");

        // ---- バトルループ ----
        while (true) {

            // --- パーティ全員の表示 ---
            System.out.println("\n----- パーティ -----");

            // ================================================
            // ▼▼【TODO③】拡張for文でパーティ全員のステータスを
            //             「番号: ステータス」の形で表示しよう
            //   表示例）0: 勇者（HP:100 / ATK:20）
            //   ヒント）int i = 0; を用意して1人表示するたびに i++
            //           ステータスは member.status() で取れる
            // ================================================



            System.out.println("魔王（HP:" + maou.getHp() + "）");
            System.out.println("--------------------");

            // --- 攻撃するキャラを選ぶ ---
            System.out.print("攻撃するキャラの番号を入力 >> ");
            int select = scanner.nextInt();

            // ================================================
            // ▼▼【TODO④】選んだ番号(select)のキャラを
            //             リストから取り出して attacker に代入しよう
            // ================================================
            Adventurer attacker = null; // ← この行を書きかえる



            // --- 攻撃！ ---
            maou.damage(attacker.attack());

            // --- 魔王を倒したか判定 ---
            if (maou.getHp() <= 0) {
                System.out.println("\n★★ 魔王を倒した！ 世界に平和が戻った ★★");
                break;
            }

            // --- 魔王の反撃（ランダムな仲間が狙われる）---
            int targetIndex = random.nextInt(party.size());
            Adventurer target = party.get(targetIndex);
            System.out.println("\n魔王の反撃！");
            target.damage(maou.getAtk());

            // --- 倒れた仲間の離脱 ---
            if (target.getHp() <= 0) {
                System.out.println(target.getName() + " は倒れてしまった…");

                // ================================================
                // ▼▼【TODO⑤】倒れた仲間(target)をリストから削除しよう
                // ================================================



            }

            // ================================================
            // ▼▼【TODO⑥】パーティが全滅（リストが空）だったら
            //   「全滅してしまった…」と表示して break しよう
            // ================================================



        }

        scanner.close();
    }
}
