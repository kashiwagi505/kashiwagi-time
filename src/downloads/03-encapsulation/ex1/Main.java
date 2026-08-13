/**
 * 【問1】動作確認用（このファイルは変更しない）
 */
public class Main {
    public static void main(String[] args) {
        Student student = new Student();

        student.setName("田中");
        student.setScore(85);

        System.out.println("名前: " + student.getName());
        System.out.println("点数: " + student.getScore());
    }
}
