---
layout: layouts/base.njk
title: はじめに
bodyClass: page-start
permalink: start.html
eleventyExcludeFromCollections: true
---
<!--
  本文執筆済み（2026-08-13）。
    決定      : 00_research/06_decisions/decisions.md 2026-07-30 決定7
                （前提知識は「変数・if・for・配列は既知」／開発環境は簡潔に・環境非依存）
    決定      : 2026-07-31「全7回のページで揃える3点」決定1（開発環境はEclipse前提にしない）
    参考      : 00_research/03_requirements/requirements.md
    このページの要点:
    ・前提知識の4項目は決定7のまま。第1回の演習が基本選択法とprintfの書式に依存する点
      （session-01.md「前提となる回 / 次につながる回」）は、第1回限定のヒントとして注記に留めた。
      「既知として扱えるか要確認」との申し送りに対する暫定対応で、全回共通の前提には昇格させていない。
    ・開発環境は「JDKとjavac/javaコマンドが使えること」だけを前提にし、IDE名を出していない。
      各回ページの「1問ぶんのファイルを同じ場所に置いてjavacでコンパイルする」という書き方に揃えた。
    ・配布ソースは回ごとの ZIP（ビルド時に config/zip-downloads.js が作る）と個別ファイルの両方。
      各問の末尾の手順ボックス（src/_data/exercises.js から生成）にコマンドがあることをここで案内する。
      穴埋め状態のため配布直後はコンパイルが通らない回があることは、回ごとの詳細に踏み込まずに書いた。
-->
<div class="lesson__header">
<p class="lesson__kicker"><span class="lesson__no">はじめに</span></p>
<h1 class="lesson__title">はじめに</h1>
<p class="lesson__summary">読みはじめる前に、これだけ確認してください。</p>
</div>

<div class="lesson__body prose">

## 前提としている知識

このサイトは、Java の次の内容を**すでに知っている**前提で書いています。

- 変数と型（`int` / `String` など）
- `if` による条件分岐
- `for` による繰り返し
- 配列

逆に、**クラスやオブジェクト指向はまったく知らなくてかまいません。** そこから始めます。

<div class="note note--hint">
<span class="note__title">第1回だけ、もう少し前提があります</span>
第1回の演習は、配列を使った基本選択法（二重ループで最大値・最小値の添字を探し、交換して並べ替える方法）と、
<code>System.out.printf</code> の書式指定を使います。図とコードを見れば追える形にしていますが、
どちらも初めてだと感じたら、先に第1回の配布ソース <code>HeightSort.java</code>（変更しないファイル）を
眺めておくと読みやすくなります。
</div>

## 進め方

各回のページは2部構成です。

<h3 class="part">第1部 直感的につかむ</h3>

図解が主役です。文章は図の補足として読んでください。
コードは「概念がコードのどの形になるか」を1回だけ見せます。1行ずつ読み解く必要はありません。

<h3 class="part">第2部 実際に使ってみる</h3>

配布ソースをダウンロードして、穴埋め・改造をします。
解答は折りたたみに入っているので、自分で試したあとに開いてください。

<details>
<summary>折りたたみはこう開きます（クリック）</summary>

このように中身が出てきます。解答はすべてこの形で入っています。

</details>

## 配布ソースの扱い

各回のページの冒頭と第2部の「演習」に、<strong>その回の演習ファイル一式（ZIP）</strong>があります。
展開すると回の名前のフォルダ（例: <code>03-encapsulation</code>）ができ、中に <code>README.txt</code> として手順もまとめてあります。
個別の <code>.java</code> ファイルも、演習の表からダウンロードできます。
フォルダに入っているのは<strong>その回の「開始状態」</strong>で、前の回を終えたところから続きます。

各問の末尾には、次のような<strong>手順ボックス</strong>があります。移動するフォルダ・コンパイルするファイル・実行するクラスが書いてあるので、
コピーしてそのままターミナルに貼り付けられます。

<div class="note">
<span class="note__title">手順ボックスのコマンドの例（第3回 問1）</span>
<code>cd 03-encapsulation/ex1</code> → <code>javac -encoding UTF-8 Student.java Main.java</code> → <code>java Main</code>
</div>

<div class="note note--warn">
<span class="note__title">配布したままではコンパイルが通らないことがあります（それが正常です）</span>
穴埋め状態のファイルが含まれているため、ダウンロード直後は <code>javac</code> がエラーを出す回があります。
<code>javac</code> はエラーをまとめて報告することもありますが、構文の誤りなどがあるとそこで先に進めず、<strong>1か所直すと別のエラーが新しく現れる</strong>こともあります。
どの回でどこまで動くかは、各回のページに書いてあります。
</div>

## 開発環境の準備

必要なのは、**JDK（Java Development Kit）がインストールされていて、`javac` と `java` コマンドが使えること**だけです。
特定のIDE（Eclipseなど）は前提にしていません。

1. JDKをまだ入れていなければインストールします（このサイトの動作確認は21系で行っていますが、17以降であれば動くはずです）。
2. ターミナル（コマンドプロンプトや PowerShell）で `javac -version` と `java -version` を実行し、バージョンが表示されることを確認します。
3. 使うエディタは自由です。VSCode・Eclipse・IntelliJ IDEA・メモ帳、どれでもかまいません。

各回のページでは、<strong>「1問ぶんのファイルを同じフォルダに置いて、<code>javac</code> でコンパイルし、<code>java</code> で実行する」</strong>という、
コマンドライン中心の説明で統一しています。IDEでプロジェクトを作る場合も、この単位（ファイルを混在させない）を守れば同じように進められます。

<div class="note note--hint">
<span class="note__title">複数のファイルを混在させない</span>
回によっては同じクラス名のファイルが複数あります（例: 第2回・第3回の <code>Monster.java</code> や <code>Main.java</code>）。
フォルダの中の <code>ex1</code> <code>ex2</code> のような分け方は、この衝突を避けるためのものです。
1問ぶんのファイルだけを1つのフォルダにまとめてください。
</div>

<div class="note">
<span class="note__title">なぜ <code>-encoding UTF-8</code> を付けるのか</span>
配布ファイルは UTF-8 で保存してあります。JDK 17 以前の日本語版 Windows では、<code>javac</code> が別の文字コード（MS932）で読もうとするため、
日本語のコメントや文字列で、文字コードのエラーや文字化けが起きることがあります。
<code>-encoding UTF-8</code> を付けておけば、どの環境でも同じように読み込まれます（JDK 18 以降では付けなくても動きます）。
</div>

## 進み具合の記録

問題を解いたら、手順ボックスの<strong>「できた」</strong>にチェックを入れてください。
1回分を読み終えたら、ページの末尾にある<strong>「この回を完了にする」</strong>を押します。
トップページに、完了した回の数と、最後に読んでいた場所へ戻る<strong>「続きから読む」</strong>ボタンが出るようになります。

記録はこのブラウザの中だけに保存されます（サーバーには送られません）。
別のパソコンやブラウザには引き継がれないので、いつも同じブラウザで開くと便利です。
記録を消したいときは、トップページの「記録を消す」を押してください。

</div>
