/**
 * 【演習1】動作確認用（このファイルは変更しない）
 */
public class JuiceShopMain {
    public static void main(String[] args) {
        JuiceShop shop = new JuiceShop();

        shop.makeJuice("りんご");
        shop.makeJuice("りんご", "みかん");
        shop.makeJuice("ぶどう", 3);
    }
}
