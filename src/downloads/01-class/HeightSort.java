/**
 * 【第1問】改造のもとになるコード ── クラスを使わない版
 *
 * 名前・身長などを「3本の並行配列」で持ち、身長の高い順に並べ替えている。
 * 動くけれども、次の2つがつらい。
 *   ・「同じ添字が同じ生徒」であることを、プログラムを書く人が守らないといけない
 *   ・並べ替えの交換処理を、配列の本数だけ（ここでは3回）書かないといけない
 *
 * このファイルは変更しない。読んで、
 * HeightSortWithClass.java と見比べるために使う。
 */
public class HeightSort {
    public static void main(String[] args) {

        // 3本の並行配列。同じ添字が同じ生徒を表す
        int[] numbers    = { 1, 2, 12, 4, 7 };
        String[] names   = { "Matsuura", "Matsumoto", "Kawauchi", "Tanaka", "Sato" };
        double[] heights = { 168.5, 167.5, 165.0, 172.3, 160.8 };

        // 基本選択法で、身長の高い順（降順）に並べ替える
        for (int i = 0; i < heights.length - 1; i++) {
            int maxIndex = i;
            for (int j = i + 1; j < heights.length; j++) {
                if (heights[j] > heights[maxIndex]) {
                    maxIndex = j;
                }
            }

            // ここが問題。1人を動かすために、配列ごとに交換が必要になる
            int tempNumber = numbers[i];
            numbers[i] = numbers[maxIndex];
            numbers[maxIndex] = tempNumber;

            String tempName = names[i];
            names[i] = names[maxIndex];
            names[maxIndex] = tempName;

            double tempHeight = heights[i];
            heights[i] = heights[maxIndex];
            heights[maxIndex] = tempHeight;
        }

        System.out.println("Height order");
        System.out.println("No Name       Height");
        for (int i = 0; i < heights.length; i++) {
            System.out.printf("%2d %-10s %5.1f%n", numbers[i], names[i], heights[i]);
        }
    }
}
