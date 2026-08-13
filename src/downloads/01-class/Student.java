/**
 * 【第1問】生徒1人ぶんを表すクラス（このファイルは変更しない）
 *
 * HeightSort.java では 3本の配列にバラバラに置かれていた
 * 「番号・名前・身長」が、このクラスでは1つにまとまっている。
 *
 * フィールドは private なので、外から直接は読み書きできない。
 * 身長を知りたいときは getHeight()、表示したいときは print() を使う。
 * （private・コンストラクタ・getter は第2回・第3回でくわしく扱う。
 *   ここでは「もう用意されているもの」として使ってよい）
 */
class Student {
    private final int number;
    private final String name;
    private final double height;

    public Student(int number, String name, double height) {
        this.number = number;
        this.name = name;
        this.height = height;
    }

    public double getHeight() {
        return height;
    }

    public void print() {
        System.out.printf("%2d %-10s %5.1f%n", number, name, height);
    }
}
