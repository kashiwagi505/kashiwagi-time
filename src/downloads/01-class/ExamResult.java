/**
 * 【第3問】試験結果1人ぶんを表すクラス
 *
 * 英語・数学・国語の点数を持つ。
 * 「合計は何点か」「どちらが上位か」といった計算を、
 * main ではなくこのクラス自身に持たせるのがねらい。
 *
 * 埋めるのは3つのメソッドの中身。
 *   getTotal()          … 3教科の合計
 *   getAverage()        … 合計の平均（intなので小数は切り捨て）
 *   ranksBefore(other)  … 自分が other より順位表で先に来るなら true
 *                          合計点が高い方が先。同点なら出席番号が小さい方が先
 */
class ExamResult {
    private final int number;
    private final String name;
    private final int english;
    private final int math;
    private final int japanese;

    public ExamResult(
            int number, String name, int english, int math, int japanese) {
        this.number = number;
        this.name = name;
        this.english = english;
        this.math = math;
        this.japanese = japanese;
    }

    public int getTotal() {
        // ▼▼【TODO①】english + math + japanese を返す
    }

    public int getAverage() {
        // ▼▼【TODO②】合計を3で割った値を返す（getTotal() が使える）
    }

    public boolean ranksBefore(ExamResult other) {
        // ▼▼【TODO③】2段階の比較を書く
        //   1) 合計点が違うなら、自分の合計が大きい方が先（true）
        //   2) 合計点が同じなら、出席番号が小さい方が先
        //   ヒント）相手の合計は other.getTotal()、
        //           相手の番号は other.number で読める
        //           （同じクラスの中なら private でも読める）
    }

    public void print(int rank) {
        System.out.printf(
                "%2d %2d %-8s %3d %3d %3d %3d %3d%n",
                rank, number, name, english, math, japanese,
                getTotal(), getAverage());
    }
}
