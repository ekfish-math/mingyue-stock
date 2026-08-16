/* =========================================================
   明月證券 v4.2.1
   CLICK HOTFIX
   ---------------------------------------------------------
   目的：避免 module / inline onclick / 手機觸控互相影響。
   若原本函式已存在，優先使用原本函式；只有缺少時才提供
   最小相容實作。
   ========================================================= */
(function () {
    "use strict";

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn, { once: true });
        } else {
            fn();
        }
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function fallbackShowPage(page) {
        document.querySelectorAll(".page").forEach(function (el) {
            el.classList.toggle("active", el.id === "page-" + page);
        });

        document.querySelectorAll(".nav-item").forEach(function (el) {
            el.classList.toggle("active", el.dataset.page === page);
        });

        window.__mingyueCurrentPage = page;
    }

    function fallbackCloseModal(id) {
        var modal = byId(id);
        if (modal) modal.classList.remove("show");
    }

    function fallbackOpenModal(id) {
        var modal = byId(id);
        if (!modal) return;
        modal.classList.add("show");
        var input = modal.querySelector("input");
        if (input) setTimeout(function () { input.focus(); }, 30);
    }

    function fallbackToast(message) {
        var toast = byId("toast");
        if (!toast) return;
        toast.textContent = String(message || "");
        toast.classList.add("show");
        clearTimeout(window.__mingyueToastTimer);
        window.__mingyueToastTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 2200);
    }

    ready(function () {
        /* 只補缺少的全域函式，不覆蓋 v4.2 原功能。 */
        if (typeof window.showPage !== "function") window.showPage = fallbackShowPage;
        if (typeof window.closeModal !== "function") window.closeModal = fallbackCloseModal;
        if (typeof window.showToast !== "function") window.showToast = fallbackToast;
        if (typeof window.toast !== "function") window.toast = window.showToast;

        if (typeof window.openDepositModal !== "function") {
            window.openDepositModal = function () { fallbackOpenModal("deposit-modal"); };
        }
        if (typeof window.openDeposit !== "function") window.openDeposit = window.openDepositModal;
        if (typeof window.openCompanyModal !== "function") {
            window.openCompanyModal = function () { fallbackOpenModal("company-modal"); };
        }
        if (typeof window.openCompany !== "function") window.openCompany = window.openCompanyModal;

        /* 手機觸控保險：互動元件明確允許 pointer/touch。 */
        document.querySelectorAll("button, a, input, select, textarea, [onclick]").forEach(function (el) {
            el.style.pointerEvents = "auto";
            el.style.touchAction = "manipulation";
        });

        /* Modal 背景可關閉，但 modal-box 本身不能被背景事件誤判。 */
        document.addEventListener("click", function (event) {
            var target = event.target;
            if (target && target.classList && target.classList.contains("modal")) {
                target.classList.remove("show");
            }
        }, true);

        /* 若 inline onclick 找不到函式，避免事件直接把整個 UI 弄死。 */
        window.addEventListener("error", function (event) {
            var msg = String(event && event.message || "");
            if (/is not defined|undefined/.test(msg)) {
                console.warn("明月證券 v4.2.1 點擊相容層：", msg);
            }
        });

        console.log("明月證券 v4.2.1 click hotfix 已啟用");
    });
})();
