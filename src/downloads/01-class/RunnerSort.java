import java.util.Scanner;

/**
 * 【第2問】走者記録をタイムの速い順に並べる
 *
 * キーボードから入力を読み取る部分と、表示する部分はできている。
 * 並べ替えの2か所を埋めよう。
 * 第1問との違いは「降順ではなく昇順」＝タイムは小さいほど速い、という点。
 *
 * 入力の形式（1人ぶんを「番号 名前 タイム」の順に、最大10人）
 *   ゼッケン番号に 0 を入力すると入力終了。
 *
 * 入力例）
 *   4 Aoki 13.05
 *   1 Mori 12.75
 *   9 Kato 14.10
 *   2 Sato 12.98
 *   7 Ito 13.42
 *   0
 *
 * 上の入力に対して期待する出力
 *   Time order
 *   No Name       Time
 *    1 Mori       12.75
 *    2 Sato       12.98
 *    4 Aoki       13.05
 *    7 Ito        13.42
 *    9 Kato       14.10
 */
public class RunnerSort {
    public static void main(String[] args) {
        final int max = 10;
        Runner[] runners = new Runner[max];
        int count = 0;   // 入力された件数。配列の長さ(10)とは別

        // ---- 入力の読み取り（ここは完成済み）----
        try (Scanner scanner = new Scanner(System.in)) {
            while (count < max) {
                int number = scanner.nextInt();
                if (number == 0) {
                    break;
                }

                String name = scanner.next();
                double time = scanner.nextDouble();
                runners[count] = new Runner(number, name, time);
                count++;
            }
        }

        // ---- 基本選択法で、タイムの速い順（昇順）に並べ替える ----
        // ※ 並べ替える範囲は runners.length ではなく count まで。
        //    そうしないと、まだ何も入っていない要素を比べてしまう
        for (int i = 0; i < count - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < count; j++) {

                // ================================================
                // ▼▼【TODO①】j番の走者のタイムが minIndex番より
                //             小さければ、minIndex を j にしよう
                //   ヒント）タイムは runners[j].getTime() で取れる
                // ================================================

            }

            // ================================================
            // ▼▼【TODO②】i番と minIndex番の「走者そのもの」を交換しよう
            //   ヒント）一時変数の型は Runner
            // ================================================

        }

        System.out.println("Time order");
        System.out.println("No Name       Time");
        for (int i = 0; i < count; i++) {
            runners[i].print();
        }
    }
}
