/**
 * 【第2問】走者1人ぶんを表すクラス
 *
 * Student と同じ形のクラス。番号・名前・タイムを1つにまとめる。
 * 枠（フィールドとメソッドの並び）はできているので、
 * コンストラクタと getTime() の中身を埋めよう。
 */
class Runner {
    private final int number;
    private final String name;
    private final double time;

    public Runner(int number, String name, double time) {
        // ▼▼【TODO①】受け取った number / name / time をフィールドに入れる
        //             （Student.java のコンストラクタが手本になる）
    }

    public double getTime() {
        // ▼▼【TODO②】time を返す
    }

    public void print() {
        System.out.printf("%2d %-10s %5.2f%n", number, name, time);
    }
}
