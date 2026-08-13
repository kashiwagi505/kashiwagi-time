/* ===========================================================================
   main.js — 最小限のJS
   ---------------------------------------------------------------------------
   ・コードブロックのコピーボタン
     （Prism の copy-to-clipboard プラグインは prism-toolbar が必要で
       同梱サイズが増えるため、ボタン自体は config/codeblocks.js が
       HTML として出力し、ここでクリックだけ受ける）
   ・外部ライブラリ・fetch・CDN は使わない
   =========================================================================== */
(function () {
  "use strict";

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // file:// や http:// で clipboard API が使えない場合のフォールバック
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest(".codeblock__copy");
    if (!btn) return;

    var body = btn.closest(".codeblock__body");
    var code = body && body.querySelector("pre > code");
    if (!code) return;

    // 行番号プラグインが挿入する .line-numbers-rows を含めないようにする
    var clone = code.cloneNode(true);
    var rows = clone.querySelector(".line-numbers-rows");
    if (rows) rows.remove();
    var text = clone.textContent.replace(/\n+$/, "\n");

    var original = btn.getAttribute("data-original") || btn.textContent;
    btn.setAttribute("data-original", original);

    copyText(text).then(
      function () {
        btn.textContent = "コピーしました";
        btn.classList.add("is-done");
      },
      function () {
        btn.textContent = "コピーできません";
      }
    );
    window.setTimeout(function () {
      btn.textContent = original;
      btn.classList.remove("is-done");
    }, 1600);
  });
})();
