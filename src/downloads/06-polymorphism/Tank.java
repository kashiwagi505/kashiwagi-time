public class Tank extends Adventurer {
    public Tank(String name, int hp, int atk) {
        super(name, hp, atk);
    }
    @Override
    public int attack() {
        System.out.println(getName() + " は盾を構えて体当たり！");
        return getAtk();
    }
}
