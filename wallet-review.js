/* =========================================================
   明月證券 v4.6 玩家金融端
   ---------------------------------------------------------
   不直接寫 users.balance / frozenBalance / fundTransactions。
   所有儲值、提領都經 Firebase Callable Functions。
   ========================================================= */
(() => {
  const CONFIG = {
    apiKey: "AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",
    authDomain: "mingyue-stock.firebaseapp.com",
    databaseURL: "https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mingyue-stock",
    storageBucket: "mingyue-stock.firebasestorage.app",
    messagingSenderId: "774198660845",
    appId: "1:774198660845:web:93f4a725b6303aae9f86e4"
  };

  let readyPromise;

  async function ready() {
    if (readyPromise) return readyPromise;
    readyPromise = (async () => {
      const appMod = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js");
      const authMod = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js");
      const functionsMod = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-functions.js");
      const apps = appMod.getApps();
      const app = apps.length ? appMod.getApp() : appMod.initializeApp(CONFIG);
      const auth = authMod.getAuth(app);
      const functions = functionsMod.getFunctions(app, "asia-southeast1");
      return { auth, functions, httpsCallable: functionsMod.httpsCallable };
    })();
    return readyPromise;
  }

  function amountInput() {
    return document.getElementById("deposit-amount");
  }

  async function requireUser() {
    const { auth } = await ready();
    if (!auth.currentUser) {
      throw new Error("請先完成 Google 登入，再進行金融操作。");
    }
    return auth.currentUser;
  }

  window.depositMoney = async function () {
    try {
      const input = amountInput();
      const amount = Number(input?.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        alert("請輸入大於 0 的儲值金額。");
        return;
      }
      await requireUser();
      const { functions, httpsCallable } = await ready();
      const call = httpsCallable(functions, "createDepositRequest");
      const result = await call({ amount });
      input.value = "";
      if (typeof closeModal === "function") closeModal("deposit-modal");
      alert(`儲值申請已送出：¥${Number(amount).toLocaleString("zh-TW")}\n申請編號：${result.data.id}\n請等待金融後台審核。`);
    } catch (error) {
      console.error("建立儲值申請失敗", error);
      alert(error?.message || "儲值申請失敗，請稍後再試。");
    }
  };

  window.openWithdrawalModal = function () {
    let modal = document.getElementById("withdrawal-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "modal";
      modal.id = "withdrawal-modal";
      modal.innerHTML = `<div class="modal-box"><div class="modal-header"><div><h3>↘ 提領證券資金</h3><p>提領後會先凍結，必須經金融後台核准。</p></div><button class="modal-close" type="button">×</button></div><div class="form-group"><label for="withdrawal-amount">提領金額</label><input id="withdrawal-amount" type="number" min="0.01" step="0.01" placeholder="例如 10000"></div><button id="withdrawal-submit" class="primary-button full" type="button">送出提領申請</button></div>`;
      document.body.appendChild(modal);
      modal.querySelector(".modal-close").onclick = () => modal.classList.remove("active");
      modal.querySelector("#withdrawal-submit").onclick = window.withdrawMoney;
    }
    modal.classList.add("active");
  };

  window.withdrawMoney = async function () {
    try {
      const input = document.getElementById("withdrawal-amount");
      const amount = Number(input?.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        alert("請輸入大於 0 的提領金額。");
        return;
      }
      await requireUser();
      const { functions, httpsCallable } = await ready();
      const call = httpsCallable(functions, "createWithdrawal");
      const result = await call({ amount });
      input.value = "";
      document.getElementById("withdrawal-modal")?.classList.remove("active");
      alert(`提領申請已送出：¥${Number(amount).toLocaleString("zh-TW")}\n申請編號：${result.data.id}\n這筆金額已進入凍結，等待金融後台審核。`);
    } catch (error) {
      console.error("建立提領申請失敗", error);
      alert(error?.message || "提領申請失敗，請稍後再試。");
    }
  };

  function addWithdrawalButton() {
    const grids = document.querySelectorAll(".asset-grid");
    grids.forEach(grid => {
      if (grid.querySelector("[data-v46-withdraw]") ) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "primary-button";
      button.dataset.v46Withdraw = "1";
      button.textContent = "↘ 提領";
      button.onclick = window.openWithdrawalModal;
      grid.appendChild(button);
    });
  }

  function removeWalletUI() {
    document.querySelectorAll(".wallet").forEach(el => el.remove());
    document.querySelectorAll("[id^='home-wallet'],[id^='deposit-wallet']").forEach(el => {
      if (el.closest(".wallet") || el.id === "deposit-wallet") el.textContent = "證券帳戶資金";
    });
    document.querySelectorAll("body *").forEach(el => {
      if (el.children.length === 0 && /遊戲錢包/.test(el.textContent || "")) {
        el.textContent = (el.textContent || "").replaceAll("遊戲錢包", "證券資金");
      }
    });
  }

  function init() {
    removeWalletUI();
    addWithdrawalButton();
    const modal = document.getElementById("deposit-modal");
    if (modal) {
      const text = modal.querySelector("p");
      if (text) text.textContent = "送出後進入待審核狀態，不會直接增加餘額。";
      const label = modal.querySelector("label[for='deposit-amount']");
      if (label) label.textContent = "儲值申請金額";
      const wallet = document.getElementById("deposit-wallet");
      if (wallet) wallet.textContent = "由金融後台審核後入帳";
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  setTimeout(init, 1200);
})();
