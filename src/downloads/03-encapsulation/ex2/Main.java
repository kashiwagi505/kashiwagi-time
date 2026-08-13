/**
 * 【問2】動作確認用（このファイルは変更しない）
 */
public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("A001", "山田太郎", "pass1234", 1000);

        System.out.println("口座番号: " + account.getAccountNumber());
        System.out.println("口座名義: " + account.getOwnerName());
        System.out.println("残高: " + account.getBalance() + "円");

        account.deposit(500);
        System.out.println("入金後: " + account.getBalance() + "円");

        if (account.withdraw(300)) {
            System.out.println("出金できました");
        } else {
            System.out.println("出金できませんでした");
        }
        System.out.println("出金後: " + account.getBalance() + "円");

        if (account.withdraw(5000)) {
            System.out.println("出金できました");
        } else {
            System.out.println("残高不足です");
        }
        System.out.println("最終残高: " + account.getBalance() + "円");
    }
}
