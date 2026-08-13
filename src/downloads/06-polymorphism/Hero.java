public class Hero extends Adventurer {
    public Hero(String name, int hp, int atk) {
        super(name, hp, atk);
    }
    @Override
    public int attack() {
        System.out.println(getName() + " は剣で斬りつけた！");
        return getAtk();
    }
}
