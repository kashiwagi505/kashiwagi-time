/**
 * 【問3・発展問題】Playerクラスを作成する
 *
 * HP、最大HP、防御力、敗北状態をクラス内部で管理する。
 * 時間外に復習したい人向け。
 *
 * コンストラクタの形： Player(String name, int maxHp, int defense)
 *   ・maxHpが1未満なら1にする
 *   ・defenseが0未満なら0にする
 *
 * 作るフィールド（すべて private）
 *   name     : String  プレイヤー名
 *   maxHp    : int     最大HP
 *   hp       : int     現在のHP
 *   defense  : int     防御力
 *   defeated : boolean 敗北しているか
 *
 * 作るメソッド
 *   getName() / getMaxHp() / getHp() / getDefense() / isDefeated()
 *   damage(int amount) : void → 防御力を考えてHPを減らす
 *   heal(int amount)   : void → 最大HPを超えないように回復する
 *
 * damage / heal のルール
 *   ・damageでは amount - defense の分だけHPを減らす
 *   ・amount - defense が0以下のときはHPを減らさない
 *     （防御力以下の攻撃は通らない。実行結果の「3ダメージなのにHPが減らない」がこれ）
 *   ・HPが0より小さくなったら「敗北」と表示し、HPを0、defeatedをtrueにする
 *   ・敗北後はdamageとhealでHPが変わらない
 */
public class Player {

    // ▼▼【TODO①】ここにフィールドを書く

    // ▼▼【TODO②】ここにコンストラクタを書く

    // ▼▼【TODO③】ここにgetterを書く

    // ▼▼【TODO④】ここにdamageメソッドを書く

    // ▼▼【TODO⑤】ここにhealメソッドを書く

}
