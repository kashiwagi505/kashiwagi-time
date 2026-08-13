/**
 * 【第1問】身長ソートをクラス化する
 *
 * HeightSort.java の「3本の並行配列」を、Student[]（1要素＝1人）に
 * 置きかえたもの。並べ替えの骨組みは基本選択法のままで、
 * 変わるのは「何を比べるか」と「何を交換するか」の2か所だけ。
 *
 * 2つの TODO を埋めて、HeightSort.java と同じ出力になれば成功！
 *
 * 期待する出力
 *   Height order
 *   No Name       Height
 *    4 Tanaka     172.3
 *    1 Matsuura   168.5
 *    2 Matsumoto  167.5
 *   12 Kawauchi   165.0
 *    7 Sato       160.8
 */
public class HeightSortWithClass {
    public static void main(String[] args) {

        // 1要素が1人ぶん。番号・名前・身長がセットで入っている
        Student[] students = {
            new Student(1, "Matsuura", 168.5),
            new Student(2, "Matsumoto", 167.5),
            new Student(12, "Kawauchi", 165.0),
            new Student(4, "Tanaka", 172.3),
            new Student(7, "Sato", 160.8)
        };

        // 基本選択法で、身長の高い順（降順）に並べ替える
        for (int i = 0; i < students.length - 1; i++) {
            int maxIndex = i;
            for (int j = i + 1; j < students.length; j++) {

                // ================================================
                // ▼▼【TODO①】j番の生徒の身長が maxIndex番の生徒より
                //             高ければ、maxIndex を j にしよう
                //   ヒント）身長は students[j].getHeight() で取れる
                //           （height は private なので直接は読めない）
                // ================================================

            }

            // ================================================
            // ▼▼【TODO②】i番と maxIndex番の「生徒そのもの」を交換しよう
            //   ヒント）一時変数の型は double ではなく Student。
            //           配列ごとに3回ではなく、これ1回で
            //           番号・名前・身長がまとめて移動する
            // ================================================

        }

        System.out.println("Height order");
        System.out.println("No Name       Height");
        for (Student student : students) {
            student.print();
        }
    }
}
