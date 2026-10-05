/**
 * 各回の演習で「どのフォルダで・どのファイルを・どうコンパイルして・何を実行するか」。
 *
 *   partials/exercise-run.njk が、各回ページの「演習」の冒頭でこれを手順ボックスにする。
 *   回ごとの ZIP（downloads/<slug>.zip）は config/zip-downloads.js がビルド時に作る。
 *
 * ★書き方
 *   key     : 進捗記録と「問題 → 実行結果 → 解答」のリンクに使う問題キー（"1", "2", "発展" など）。
 *             config/lesson-enhance.js が見出しから取り出すキーと一致させる。
 *   dir     : ZIP を展開したフォルダからの相対パス（cd する先）
 *   compile : javac に渡すファイル。未完成の別の問題のファイルを混ぜないよう、必要なものだけ並べる
 *   run     : java で実行するクラス名（main を持つクラス）
 *   create  : 自分で新しく作るファイル（配布物には入っていない）
 *   note    : 補足（任意）
 */
module.exports = {
  "01-class": [
    {
      key: "1", label: "第1問", dir: "01-class",
      compile: ["Student.java", "HeightSortWithClass.java"], run: "HeightSortWithClass",
      note: "見比べ用の HeightSort.java は単独で動きます（javac -encoding UTF-8 HeightSort.java → java HeightSort）。",
    },
    {
      key: "2", label: "第2問", dir: "01-class",
      compile: ["Runner.java", "RunnerSort.java"], run: "RunnerSort",
      note: "実行するとキーボードからの入力待ちになります。入力例は「実行結果の例」を見てください。",
    },
    {
      key: "3", label: "第3問", dir: "01-class",
      compile: ["ExamResult.java", "ExamRanking.java"], run: "ExamRanking",
    },
  ],
  "02-overload": [
    { key: "1", label: "演習1", dir: "02-overload/ex1", compile: ["JuiceShop.java", "JuiceShopMain.java"], run: "JuiceShopMain" },
    { key: "2", label: "演習2", dir: "02-overload/ex2", compile: ["Monster.java", "MonsterMain.java"], run: "MonsterMain" },
    { key: "3", label: "演習3", dir: "02-overload/ex3", compile: ["Monster.java", "MonsterMain.java"], run: "MonsterMain" },
    {
      key: "発展", label: "発展", dir: "02-overload/ex3",
      compile: ["Monster.java", "MonsterMain.java"], run: "MonsterMain",
      note: "演習3のフォルダをそのまま使います。",
    },
  ],
  "03-encapsulation": [
    { key: "1", label: "問1", dir: "03-encapsulation/ex1", compile: ["Student.java", "Main.java"], run: "Main" },
    { key: "2", label: "問2", dir: "03-encapsulation/ex2", compile: ["BankAccount.java", "Main.java"], run: "Main" },
    { key: "3", label: "問3", dir: "03-encapsulation/ex3", compile: ["Player.java", "Main.java"], run: "Main" },
  ],
  "04-arraylist": [
    { key: "1", label: "問1", dir: "04-arraylist", compile: ["Adventurer.java", "Main.java"], run: "Main" },
    {
      key: "2", label: "問2", dir: "04-arraylist", compile: ["Adventurer.java", "Main.java"], run: "Main",
      note: "問1と同じ Main.java の続きです。",
    },
    {
      key: "3", label: "問3", dir: "04-arraylist", compile: ["Adventurer.java", "Game.java"], run: "Game",
      note: "Main.java を混ぜずにコンパイルすれば、問1・問2が途中でも問3に取りかかれます。",
    },
  ],
  "05-inheritance": [
    { key: "1", label: "問1", quiz: true },
    {
      key: "2", label: "問2", dir: "05-inheritance",
      compile: ["Adventurer.java", "Hero.java", "Wizard.java", "Tank.java", "Main2.java"], run: "Main2",
      note: "書き換える前に一度実行して、出力を控えておきます。",
    },
    {
      key: "3", label: "問3", dir: "05-inheritance",
      create: ["Arthur.java", "Merlin.java"],
      compile: ["Adventurer.java", "Hero.java", "Wizard.java", "Tank.java", "Arthur.java", "Merlin.java", "Main3.java"],
      run: "Main3",
    },
  ],
  "06-polymorphism": [
    { key: "1", label: "問1", quiz: true },
    {
      key: "2", label: "問2", dir: "06-polymorphism",
      compile: ["Adventurer.java", "Hero.java", "Wizard.java", "Tank.java", "Archer.java", "PolyGame.java"],
      run: "PolyGame",
    },
    { key: "3", label: "問3", thinking: true },
  ],
  "07-abstract": [
    { key: "1", label: "問1", quiz: true },
    {
      key: "2", label: "問2", dir: "07-abstract",
      compile: ["Adventurer.java", "Hero.java", "Wizard.java", "Tank.java", "Archer.java", "Maou.java", "PolyGame2.java"],
      run: "PolyGame2",
    },
    {
      key: "3", label: "問3", dir: "07-abstract",
      create: ["Excalibur.java"],
      compile: ["Excalibur.java", "Adventurer.java", "Hero.java", "Wizard.java", "Tank.java", "Archer.java", "Maou.java", "PolyGame2.java"],
      run: "PolyGame2",
    },
  ],
};
