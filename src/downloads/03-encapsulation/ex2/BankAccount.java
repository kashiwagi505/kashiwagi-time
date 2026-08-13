/**
 * 【問2】BankAccountクラスを作成する
 *
 * 残高やパスワードを直接変更・参照させず、
 * 必要な操作だけを public メソッドとして公開する。
 *
 * コンストラクタの形（動作確認用 Main.java が呼び出す形）：
 *   BankAccount(String accountNumber, String ownerName, String password, int balance)
 *
 * 作るフィールド（すべて private）
 *   accountNumber : String → getAccountNumber() で見せる
 *   ownerName     : String → getOwnerName()     で見せる
 *   balance       : int    → getBalance()       で見せる
 *   password      : String → getterなし（＝外からは見せない）
 *
 * 作るメソッド
 *   deposit(int amount)  : void    → amountが1以上なら残高を増やす
 *   withdraw(int amount) : boolean → 出金できたらtrue。
 *                                    金額が不正、または残高不足ならfalse
 */
public class BankAccount {

    // ▼▼【TODO①】ここにフィールドを書く

    // ▼▼【TODO②】ここにコンストラクタを書く

    // ▼▼【TODO③】ここにgetterを書く

    // ▼▼【TODO④】ここにdepositメソッドを書く

    // ▼▼【TODO⑤】ここにwithdrawメソッドを書く

}
