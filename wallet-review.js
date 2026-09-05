/* =========================================================
   明月證券 v4.6 玩家金融端
   ---------------------------------------------------------
   不使用 Firebase Callable Functions / Blaze。
   儲值：建立 pending depositRequests，等待金融後台審核。
   提領：建立 pending withdrawalRequests，並在 RTDB transaction
   中將可用資金轉入 frozenBalance。
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
      const dbMod = await import("https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js");
      const apps = appMod.getApps();
      const app = apps.length ? appMod.getApp() : appMod.initializeApp(CONFIG);
      return {
        auth: authMod.getAuth(app),
        db: dbMod.getDatabase(app),
        ref: dbMod.ref,
        get: dbMod.get,
        set: dbMod.set,
        update: dbMod.update,
        remove: dbMod.remove,
        runTransaction: dbMod.runTransaction
      };
    })();
    return readyPromise;
  }

  async function requireUser() {
    const { auth } = await ready();
    if (!auth.currentUser) throw new Error("請先完成 Google 登入，再進行金融操作。");
    return auth.currentUser;
  }

  function validAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1e15) throw new Error("金額必須大於 0 且在允許範圍內。");
    return Math.round(amount * 100) / 100;
  }

  function requestId(prefix) {
    return `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  }

  window.depositMoney = async function () {
    try {
      const input = document.getElementById("deposit-amount");
      const amount = validAmount(input?.value);
      const user = await requireUser();
      const { db, ref, set } = await ready();
      const id = requestId("DEP");

      await set(ref(db, `depositRequests/${user.uid}/${id}`), {
        id,
        accountId: user.uid,
        amount,
        status: "pending",
        createdAt: Date.now()
      });

      input.value = "";
      if (typeof closeModal === "function") closeModal("deposit-modal");
      alert(`儲值申請已送出：¥${amount.toLocaleString("zh-TW")}\n申請編號：${id}\n請等待金融後台審核。`);
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
      modal.innerHTML = `<div class="modal-box"><div class="modal-header"><div><h3>↘ 提領證券資金</h3><p>提領會先凍結，必須經金融後台核准。</p></div><button class="modal-close" type="button">×</button></div><div class="form-group"><label for="withdrawal-amount">提領金額</label><input id="withdrawal-amount" type="number" min="0.01" step="0.01" placeholder="例如 10000"></div><button id="withdrawal-submit" class="primary-button full" type="button">送出提領申請</button></div>`;
      document.body.appendChild(modal);
      modal.querySelector(".modal-close").onclick = () => modal.classList.remove("active");
      modal.querySelector("#withdrawal-submit").onclick = window.withdrawMoney;
    }
    modal.classList.add("active");
  };

  window.withdrawMoney = async function () {
    try {
      const input = document.getElementById("withdrawal-amount");
      const amount = validAmount(input?.value);
      const user = await requireUser();
      const { db, ref, set, remove, runTransaction } = await ready();
      const id = requestId("WDR");
      const requestRef = ref(db, `withdrawalRequests/${user.uid}/${id}`);
      const userRef = ref(db, `users/${user.uid}`);

      // 先建立 pending 申請；規則只允許本人建立自己的 pending 申請。
      await set(requestRef, {
        id,
        accountId: user.uid,
        amount,
        status: "pending",
        createdAt: Date.now()
      });

      // 原子檢查並凍結可用資金：balance - frozenBalance >= amount。
      const result = await runTransaction(userRef, current => {
        if (!current) return;
        const balance = Number(current.balance || 0);
        const frozen = Number(current.frozenBalance || 0);
        if (!Number.isFinite(balance) || !Number.isFinite(frozen) || frozen < 0 || balance < frozen) return;
        if (balance - frozen < amount) return;
        return {
          ...current,
          frozenBalance: Math.round((frozen + amount) * 100) / 100,
          balance
        };
      });

      if (!result.committed) {
        await remove(requestRef);
        throw new Error("可用餘額不足，無法建立提領申請。");
      }

      input.value = "";
      document.getElementById("withdrawal-modal")?.classList.remove("active");
      alert(`提領申請已送出：¥${amount.toLocaleString("zh-TW")}\n申請編號：${id}\n這筆金額已進入凍結，等待金融後台審核。`);
    } catch (error) {
      console.error("建立提領申請失敗", error);
      alert(error?.message || "提領申請失敗，請稍後再試。");
    }
  };

  function addWithdrawalButton() {
    document.querySelectorAll(".asset-grid").forEach(grid => {
      if (grid.querySelector("[data-v46-withdraw]")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "primary-button";
      button.dataset.v46Withdraw = "1";
      button.textContent = "↘ 提領";
      button.onclick = window.openWithdrawalModal;
      grid.appendChild(button);
    });
  }

  function removeLegacyFinanceUI() {
    document.querySelectorAll(".wallet").forEach(el => el.remove());
    document.querySelectorAll("[id^='home-wallet']").forEach(el => el.closest(".asset-box")?.remove());
    document.querySelectorAll("#page-admin").forEach(el => el.remove());

    document.querySelectorAll("body *").forEach(el => {
      if (el.children.length !== 0) return;
      const text = el.textContent || "";
      if (/遊戲錢包/.test(text)) el.textContent = text.replaceAll("遊戲錢包", "證券資金");
      if (/錢包儲值/.test(el.textContent || "")) el.textContent = el.textContent.replaceAll("錢包儲值", "儲值申請");
    });

    document.querySelectorAll("#deposit-wallet").forEach(el => {
      el.textContent = "由金融後台審核後入帳";
    });

    const subtitle = document.querySelector("#page-home .section-subtitle");
    if (subtitle && /遊戲資金/.test(subtitle.textContent || "")) subtitle.textContent = "管理你的證券資金與投資";

    const depositText = document.querySelector("#deposit-modal p");
    if (depositText) depositText.textContent = "送出後進入待審核狀態，不會直接增加餘額。";
    const depositLabel = document.querySelector("label[for='deposit-amount']");
    if (depositLabel) depositLabel.textContent = "儲值申請金額";
  }

  function init() {
    removeLegacyFinanceUI();
    addWithdrawalButton();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
  setTimeout(init, 1200);
  setTimeout(init, 3000);
})();
