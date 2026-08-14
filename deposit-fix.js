/* =========================================================
   明月證券 v4.4
   Deposit Fix - Firebase 儲值申請
   ========================================================= */

const DEPOSIT_CONFIG = {
    min: 1,
    max: 1000000000
};

function getDepositDb() {
    return window.MingyueDataPlugin || window.MingyueDataAdapter || null;
}

function getDepositUid() {
    return window.MINGYUE_CURRENT_UID ||
        window.MINGYUE_ACCOUNT_ID ||
        localStorage.getItem("mingyue_active_account_id") ||
        localStorage.getItem("mingyue_current_google_uid") ||
        null;
}

async function submitDepositRequest() {

    const plugin = getDepositDb();
    const uid = getDepositUid();

    if (!plugin || !plugin.read || !plugin.write) {
        showToast("Firebase 資料模組尚未完成載入");
        return false;
    }

    if (!uid) {
        showToast("請先登入帳號");
        return false;
    }

    const raw = prompt("請輸入儲值金額：", "10000");
    if (raw === null) return false;

    const amount = Number(String(raw).replace(/,/g, "").trim());

    if (!Number.isFinite(amount) || amount < DEPOSIT_CONFIG.min || amount > DEPOSIT_CONFIG.max) {
        showToast("儲值金額無效");
        return false;
    }

    const requestId = "dep_" + uid + "_" + Date.now();

    const request = {
        id: requestId,
        uid: String(uid),
        accountId: String(uid),
        amount: Number(amount),
        status: "pending",
        createdAt: Date.now(),
        createdAtText: new Date().toLocaleString("zh-TW", { hour12: false })
    };

    try {
        const current = await plugin.read("depositRequests");
        const requests = current && typeof current === "object" && !Array.isArray(current)
            ? current
            : {};

        requests[requestId] = request;

        await plugin.write("depositRequests", requests);

        showToast(`儲值申請 ¥${amount.toLocaleString()} 已送出，等待管理員核准`);
        console.log("Firebase 儲值申請已儲存", request);
        return true;

    } catch (error) {
        console.error("Firebase 儲值申請寫入失敗", error);
        showToast("儲值申請儲存失敗，請稍後再試");
        return false;
    }
}

window.openDepositModal = submitDepositRequest;
window.openDeposit = submitDepositRequest;
window.depositMoney = submitDepositRequest;
window.confirmDeposit = submitDepositRequest;
window.submitDepositRequest = submitDepositRequest;

console.log("明月證券 v4.4 儲值 Firebase 修復模組已載入");
