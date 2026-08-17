/* 明月證券 v4.3.4
   Wallet deposit request / review bridge
   Firebase path: depositRequests
*/
(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",
    authDomain: "mingyue-stock.firebaseapp.com",
    databaseURL: "https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mingyue-stock",
    storageBucket: "mingyue-stock.firebasestorage.app",
    messagingSenderId: "774198660845",
    appId: "1:774198660845:web:93f4a725b6303aae9f86e4"
  };

  let appPromise;
  async function getFirebase() {
    if (!appPromise) {
      appPromise = Promise.all([
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js")
      ]).then(([fa, fau, fdb]) => {
        const app = fa.getApps().length ? fa.getApps()[0] : fa.initializeApp(firebaseConfig);
        return { auth: fau.getAuth(app), db: fdb.getDatabase(app), ref: fdb.ref, get: fdb.get, push: fdb.push, set: fdb.set, update: fdb.update };
      });
    }
    return appPromise;
  }

  function uid() {
    return window.MingyueAuthBridge?.getUid?.() || window.MINGYUE_CURRENT_UID || null;
  }

  function accountId() {
    return window.MingyueAuthBridge?.getAccountId?.() || window.MINGYUE_ACCOUNT_ID || uid();
  }

  async function submitDeposit() {
    const amountEl = document.getElementById("deposit-amount");
    const amount = Number(amountEl?.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.showToast?.("請輸入有效儲值金額");
      return;
    }

    const userUid = uid();
    if (!userUid) {
      window.showToast?.("請先完成 Google 實名認證");
      return;
    }

    const fb = await getFirebase();
    const currentUser = fb.auth.currentUser || window.MingyueAuthBridge?.getUser?.();
    const requestRef = fb.push(fb.ref(fb.db, "depositRequests"));
    const request = {
      uid: String(userUid),
      accountId: String(accountId() || userUid),
      email: currentUser?.email || "",
      displayName: currentUser?.displayName || "",
      amount: Number(amount),
      source: "wallet",
      status: "pending",
      createdAt: Date.now()
    };

    await fb.set(requestRef, request);
    amountEl.value = "";
    window.closeModal?.("deposit-modal");
    window.showToast?.("儲值申請已送出，等待管理員審核");
    window.dispatchEvent(new CustomEvent("mingyue-deposit-submitted", { detail: request }));
  }

  window.MingyueWalletReview = Object.freeze({ submitDeposit });
  window.depositMoney = submitDeposit;
  window.confirmDeposit = submitDeposit;
  console.log("明月證券 v4.3.4 Wallet Review Bridge 已載入");
})();
