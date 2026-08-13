/**
 * 【第3問】成績順位表を出す
 *
 * 並べ替えの骨組みは第1問・第2問と同じ基本選択法。
 * ただし比較条件は main に書かない。
 * 「どちらが先か」は ExamResult に聞く（ranksBefore）。
 *
 * 期待する出力
 *   Rank No Name     Eng Math Jap Total Avg
 *    1  1 Fuji      90  80 100 270  90
 *    2 11 Kita      82  75  56 213  71
 *    3 12 Aoyama    70  70  73 213  71
 *    4  5 Tani      30  78  89 197  65
 *    5  3 Nishi     50  60  70 180  60
 *    6  9 Sudo      45  40  90 175  58
 *    7  2 Suzuki   100  30  20 150  50
 *
 * ※ Kita（11番）と Aoyama（12番）はどちらも213点。
 *   合計が同じときは出席番号の小さい11番が先に来る
 */
public class ExamRanking {
    public static void main(String[] args) {
        ExamResult[] results = {
            new ExamResult(11, "Kita", 82, 75, 56),
            new ExamResult(9, "Sudo", 45, 40, 90),
            new ExamResult(3, "Nishi", 50, 60, 70),
            new ExamResult(2, "Suzuki", 100, 30, 20),
            new ExamResult(5, "Tani", 30, 78, 89),
            new ExamResult(12, "Aoyama", 70, 70, 73),
            new ExamResult(1, "Fuji", 90, 80, 100)
        };

        for (int i = 0; i < results.length - 1; i++) {
            int bestIndex = i;
            for (int j = i + 1; j < results.length; j++) {

                // ================================================
                // ▼▼【TODO①】j番が bestIndex番より順位表で先に来るなら、
                //             bestIndex を j にしよう
                //   ヒント）点数を直接くらべない。
                //           results[j].ranksBefore(results[bestIndex]) と
                //           クラスに聞くだけでよい
                // ================================================

            }

            // ================================================
            // ▼▼【TODO②】i番と bestIndex番の ExamResult を交換しよう
            //   ヒント）第1問・第2問とまったく同じ形。型が変わるだけ
            // ================================================

        }

        System.out.println("Rank No Name     Eng Math Jap Total Avg");
        for (int i = 0; i < results.length; i++) {
            results[i].print(i + 1);
        }
    }
}
