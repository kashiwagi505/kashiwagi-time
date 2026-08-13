/**
 * 【演習1】メソッドのオーバーロード
 *
 * ジュース屋さんを表す JuiceShop クラス。
 * 同じ名前の makeJuice メソッドが、引数の違いで3種類ある。
 * 3つのメソッドの中身を埋めて、期待する出力になるようにしよう。
 *
 * 期待する出力（JuiceShopMain を実行）
 *   りんごジュースを作ります
 *   りんごとみかんのミックスジュースを作ります
 *   ぶどうジュースを3杯作ります
 */
public class JuiceShop {

    public void makeJuice(String fruit) {
        // ▼▼【TODO①】fruit + "ジュースを作ります" と表示する
    }

    public void makeJuice(String fruit1, String fruit2) {
        // ▼▼【TODO②】fruit1 と fruit2 のミックスジュースを作る表示にする
    }

    public void makeJuice(String fruit, int count) {
        // ▼▼【TODO③】fruit のジュースを count 杯作る表示にする
    }
}
