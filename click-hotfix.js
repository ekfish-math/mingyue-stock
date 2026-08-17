/* =========================================================
   明月證券 v4.5
   CLICK HOTFIX + WALLET REMOVAL
   ---------------------------------------------------------
   目的：修復手機點擊相容性、統一版本號、徹底移除遊戲錢包 UI。
   ========================================================= */
(function () {
    "use strict";

    const VERSION = "4.5";

    /* 將舊版 console 版本號統一成 v4.5。 */
    const originalLog = console.log.bind(console);
    console.log = function () {
        const args = Array.prototype.slice.call(arguments).map(function (value) {
            return typeof value === "string"
                ? value.replaceAll("v4.2", "v4.5").replaceAll("v4.2.1", "v4.5")
                : value;
        });
        originalLog.apply(console, args);
    };

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

    function removeWalletUI() {
        /* 儲值按鈕 */
        document.querySelectorAll('[onclick*="openDepositModal"], [onclick*="depositMoney"]').forEach(function (el) {
            el.remove();
        });

        /* 遊戲錢包資產卡 */
        document.querySelectorAll(".wallet, #home-wallet, #deposit-wallet").forEach(function (el) {
            var box = el.closest(".asset-box, .form-group");
            (box || el).remove();
        });

        /* 儲值 Modal */
        var depositModal = byId("deposit-modal");
        if (depositModal) depositModal.remove();

        /* 後台錢包審核區塊 */
        var depositList = byId("admin-deposit-list");
        if (depositList) {
            var group = depositList.closest(".form-group");
            if (group) group.remove();
            else depositList.remove();
        }

        var adminPage = byId("page-admin");
        if (adminPage) {
            adminPage.querySelectorAll("p, h2, .page-title-row").forEach(function (el) {
                el.textContent = el.textContent
                    .replaceAll("／錢包儲值審核", "")
                    .replaceAll("與錢包儲值審核", "")
                    .replaceAll("錢包儲值", "");
            });
        }
    }

    ready(function () {
        if (typeof window.showPage !== "function") window.showPage = fallbackShowPage;
        if (typeof window.closeModal !== "function") window.closeModal = fallbackCloseModal;
        if (typeof window.showToast !== "function") window.showToast = fallbackToast;
        if (typeof window.toast !== "function") window.toast = window.showToast;

        /* v4.5 已完全取消遊戲錢包。 */
        window.openDepositModal = function () {
            window.showToast?.("v4.5 已取消遊戲錢包系統");
        };
        window.depositMoney = function () {
            window.showToast?.("v4.5 已取消遊戲錢包系統");
        };
        window.openDeposit = window.openDepositModal;

        if (typeof window.openCompanyModal !== "function") {
            window.openCompanyModal = function () { fallbackOpenModal("company-modal"); };
        }
        if (typeof window.openCompany !== "function") window.openCompany = window.openCompanyModal;

        document.querySelectorAll("button, a, input, select, textarea, [onclick]").forEach(function (el) {
            el.style.pointerEvents = "auto";
            el.style.touchAction = "manipulation";
        });

        document.addEventListener("click", function (event) {
            var target = event.target;
            if (target && target.classList && target.classList.contains("modal")) {
                target.classList.remove("show");
            }
        }, true);

        removeWalletUI();

        window.addEventListener("error", function (event) {
            var msg = String(event && event.message || "");
            if (/is not defined|undefined/.test(msg)) {
                console.warn("明月證券 v" + VERSION + " 點擊相容層：", msg);
            }
        });

        console.log("明月證券 v" + VERSION + " click hotfix 已啟用；遊戲錢包已移除");
    });
})();
