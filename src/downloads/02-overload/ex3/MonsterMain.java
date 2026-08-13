/**
 * 【演習3】動作確認用（このファイルは変更しない）
 */
public class MonsterMain {
    public static void main(String[] args) {
        Monster m1 = new Monster();
        Monster m2 = new Monster("スライム");
        Monster m3 = new Monster("ドラゴン", 300, 80);

        m1.showInfo();
        m2.showInfo();
        m3.showInfo();
    }
}
