---
layout: layouts/base.njk
title: トップ
bodyClass: page-home
eleventyExcludeFromCollections: true
---
<!--
  本文執筆済み（2026-08-13）。
    構成      : 00_research/03_requirements/site-map.md 1章「トップ（勇者一行のあらすじ＋全7回の一覧表）」
    一覧表    : partials/lesson-index.njk が site.json と各回ページから自動生成する。
                本ページでは手書きの表を作っていない。回を足しても手作業の修正は不要。
    立ち絵    : {% cards %} で hero/wizard/tank/archer を使用（figures.md 立ち絵のキー参照）。
    世界観の線引き（CLAUDE.md 2章）: 本文の地の文は素直な説明にし、
                「勇者一行」への言及は実際の教材構成（第4回以降の共通題材）の説明として書いた。
-->
<div class="hero">
<h1 class="hero__title">柏木タイム</h1>
<p class="hero__lead">Java のオブジェクト指向を、全7回で。<br>むずかしい言葉を覚えるより先に、<strong>図でつかんで、そのまま使ってみる</strong>ための教材です。</p>
<p class="hero__meta">前提知識：変数 / if / for / 配列 は既知として書いています。</p>
<p class="hero__cta"><a class="button" href="{{ 'start.html' | rel }}">はじめに を読む</a></p>
</div>

<div class="prose" style="max-width: var(--w-content); margin: var(--sp-6) auto 0;">

## 勇者一行のあらすじ

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

</div>

{% include "partials/lesson-index.njk" %}

<div class="prose" style="max-width: var(--w-content); margin: var(--sp-7) auto 0;">

## このサイトの使い方

各回のページは2部構成です。

- **第1部 直感的につかむ** — 図解が主役です。まずここを眺めるだけでかまいません。
- **第2部 実際に使ってみる** — 穴埋め・改造の演習です。解答は折りたたみに入っています。

進め方や開発環境の準備は、[はじめに]({{ 'start.html' | rel }})にまとめています。読み始める前に、まずそちらに目を通してください。

</div>
