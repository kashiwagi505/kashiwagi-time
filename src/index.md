---
layout: layouts/base.njk
title: トップ
bodyClass: page-home
eleventyExcludeFromCollections: true
---
<!--
  構成（2026-10 改訂。学習の順番が一目で分かることを優先）:
    1. ヒーロー     : サイト名・学ぶこと・前提知識・主ボタン（初回は「はじめに」、再訪時は「続きから」）
    2. 進み具合     : main.js がこのブラウザの記録から表示（記録が無いときは出さない）
    3. 全7回の一覧  : partials/lesson-index.njk が site.json と各回ページから自動生成する。
    4. 勇者一行     : {% cards %} で hero/wizard/tank/archer を使用（figures.md 立ち絵のキー参照）。
    5. 使い方
  世界観の線引き（CLAUDE.md 2章）: 本文の地の文は素直な説明にし、
  「勇者一行」への言及は実際の教材構成（第4回以降の共通題材）の説明として書いた。
-->
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__text">
    <p class="hero__kicker">社内勉強会 ／ Java オブジェクト指向 全{{ collections.lessons.length }}回</p>
    <h1 class="hero__title" id="hero-title">柏木タイム</h1>
    <p class="hero__lead">むずかしい言葉を覚えるより先に、<strong>図でつかんで、そのまま使ってみる。</strong><br>クラスから抽象クラス・インターフェイスまでを、ひと続きで学ぶ教材です。</p>
    <p class="hero__meta">前提知識：変数 / if / for / 配列</p>
    <div class="hero__cta">
      <a class="button button--lg" href="#" data-cta-resume hidden></a>
      <a class="button button--lg" href="{{ 'start.html' | rel }}" data-cta-start>はじめに を読む</a>
      <a class="hero__sub" href="{{ collections.lessons[0].url | rel }}" data-cta-first>第1回から読む →</a>
    </div>
  </div>
  <div class="hero__art" aria-hidden="true">
    <img class="hero__circle" src="{{ 'assets/img/items/magic-circle-320.webp' | rel }}" alt="" width="320" height="318">
    <img class="hero__chara hero__chara--wizard" src="{{ 'assets/img/chara/wizard-320.webp' | rel }}" alt="" width="271" height="320">
    <img class="hero__chara hero__chara--tank" src="{{ 'assets/img/chara/tank-320.webp' | rel }}" alt="" width="320" height="285">
    <img class="hero__chara hero__chara--hero" src="{{ 'assets/img/chara/hero-320.webp' | rel }}" alt="" width="299" height="320">
  </div>
</section>

<section class="progress-panel" aria-labelledby="progress-title" data-progress-panel hidden>
  <div class="progress-panel__head">
    <h2 class="progress-panel__title" id="progress-title">あなたの進み具合</h2>
    <button class="link-button" type="button" data-progress-reset>記録を消す</button>
  </div>
  <div class="progress-panel__stats">
    <p class="stat"><span class="stat__num" data-stat-lessons>0</span><span class="stat__unit">/ {{ collections.lessons.length }} 回 完了</span></p>
    <p class="stat"><span class="stat__num" data-stat-ex>0</span><span class="stat__unit" data-stat-ex-unit>/ 0 問 できた</span></p>
  </div>
  <span class="meter meter--lg" aria-hidden="true"><span class="meter__bar" data-stat-bar></span></span>
  <p class="progress-panel__note">記録はこのブラウザだけに保存されます。別の端末やブラウザには引き継がれません。</p>
</section>

{% include "partials/lesson-index.njk" %}

<div class="prose home-prose">

## 第4回からは「勇者一行」

前半3回は、人間と犬・ジュース屋・銀行くんといった身近な題材で、クラス・オーバーロード・カプセル化を1つずつつかみます。

第4回からは、**「勇者一行」を共通の題材にした1本のバトルゲーム**を4回かけて育てていきます。
ArrayList で名簿を作り、継承で職業ごとの違いを表し、ポリモーフィズムで呼び出し方を1つにまとめ、
最後は抽象クラスとインターフェイスで「必ず持っている」ことを型で保証する ── そこまでを、この7回で歩きます。

{% cards [
  { "chara":"hero", "name":"勇者", "lines":["名簿の先頭に立つ"] },
  { "chara":"wizard", "name":"魔法使い", "lines":["攻撃も回復もできる"] },
  { "chara":"tank", "name":"タンク", "lines":["高いHPで受け止める"] },
  { "chara":"archer", "name":"弓使い", "lines":["三連矢を放つ"] }
], { "caption":"第4回から育てていく勇者一行。職業ごとに持っているものも、できることも違う" } %}

## このサイトの使い方

各回のページは2部構成です。

- **第1部 直感的につかむ** — 図解が主役です。まずここを眺めるだけでかまいません。
- **第2部 実際に使ってみる** — 穴埋め・改造の演習です。各問の末尾にコンパイル・実行のコマンドがあり、解答は折りたたみに入っています。

問題を解いたら「できた」にチェックを、1回分を終えたらページ末尾の「この回を完了にする」を押してください。
次に開いたとき、このページから続きに戻れます。

進め方や開発環境の準備は、[はじめに]({{ 'start.html' | rel }})にまとめています。読み始める前に、まずそちらに目を通してください。

</div>
