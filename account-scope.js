/* 明月證券 v4.3.4 - Google UID Account Scope */
import { getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const app = getApps()[0];
if (!app) throw new Error("Firebase App 尚未初始化，無法啟用 v4.3.4 帳戶隔離");

const auth = getAuth(app);
const db = getDatabase(app);
const LEGACY_ACCOUNT_ID = "MYS-000184";
const VERSION = "4.3.4";

function accountIdFor(uid) {
    return "G-" + String(uid || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
}

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
        return fallback;
    }
}

function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

async function bindAccount(user) {
    if (!user?.uid) return null;

    const uid = user.uid;
    const accountId = accountIdFor(uid);
    const snapshot = await get(ref(db));
    const root = snapshot.exists() ? (snapshot.val() || {}) : {};

    let accountUser = root.users?.[accountId] || null;
    let portfolio = root.portfolios?.[accountId] ?? null;
    let transactions = Array.isArray(root.transactions?.[accountId])
        ? root.transactions[accountId]
        : null;
    let migratedLegacy = false;

    /* 第一個 Google 帳戶一次性承接 v4.2 舊帳戶；不刪除舊資料。 */
    if (!accountUser && !root.accountMigration?.v434?.claimedByUid) {
        const legacyUser = root.users?.[LEGACY_ACCOUNT_ID] || readJSON(
            "mingyue_user_v42",
            { name: "Fisher", accountId: LEGACY_ACCOUNT_ID, balance: 1000000 }
        );
        const legacyPortfolio = root.portfolios?.[LEGACY_ACCOUNT_ID] ?? readJSON("mingyue_portfolio_v42", {});
        const legacyTransactions = Array.isArray(root.transactions?.[LEGACY_ACCOUNT_ID])
            ? root.transactions[LEGACY_ACCOUNT_ID]
            : readJSON("mingyue_transactions_v42", []);

        accountUser = {
            ...legacyUser,
            accountId,
            googleUid: uid,
            email: user.email || "",
            displayName: user.displayName || legacyUser.name || "Google 使用者",
            photoURL: user.photoURL || "",
            provider: "google",
            lastLoginAt: Date.now()
        };
        portfolio = legacyPortfolio && typeof legacyPortfolio === "object" ? legacyPortfolio : {};
        transactions = Array.isArray(legacyTransactions) ? legacyTransactions : [];
        migratedLegacy = true;
    }

    if (!accountUser) {
        accountUser = {
            name: user.displayName || "Google 使用者",
            accountId,
            googleUid: uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            balance: 1000000,
            provider: "google",
            createdAt: Date.now(),
            lastLoginAt: Date.now()
        };
    }

    accountUser.accountId = accountId;
    accountUser.googleUid = uid;
    accountUser.email = user.email || accountUser.email || "";
    accountUser.displayName = user.displayName || accountUser.displayName || accountUser.name || "Google 使用者";
    accountUser.photoURL = user.photoURL || accountUser.photoURL || "";
    accountUser.provider = "google";
    accountUser.lastLoginAt = Date.now();
    accountUser.balance = Number(accountUser.balance ?? 1000000);

    if (!portfolio || typeof portfolio !== "object" || Array.isArray(portfolio)) portfolio = {};
    if (!Array.isArray(transactions)) transactions = [];

    const patch = {
        [`users/${accountId}`]: accountUser,
        [`portfolios/${accountId}`]: portfolio,
        [`transactions/${accountId}`]: transactions,
        [`authUsers/${uid}/accountId`]: accountId,
        [`authUsers/${uid}/googleUid`]: uid,
        [`authUsers/${uid}/lastLoginAt`]: Date.now()
    };

    if (migratedLegacy) {
        patch["accountMigration/v434"] = {
            claimedByUid: uid,
            accountId,
            sourceAccountId: LEGACY_ACCOUNT_ID,
            migratedAt: Date.now()
        };
    }

    await update(ref(db), patch);

    writeJSON("mingyue_user_v42", accountUser);
    writeJSON("mingyue_portfolio_v42", portfolio);
    writeJSON("mingyue_transactions_v42", transactions);
    localStorage.setItem("mingyue_google_uid_v434", uid);
    localStorage.setItem("mingyue_account_id_v434", accountId);

    window.MingyueAccountScope = { version: VERSION, uid, accountId, migratedLegacy };

    console.log(
        migratedLegacy
            ? "明月證券 v4.3.4：Google UID 已綁定，舊 v4.2 帳戶資料已安全複製"
            : "明月證券 v4.3.4：Google UID 已綁定獨立證券帳戶"
    );

    return { uid, accountId, migratedLegacy };
}

onAuthStateChanged(auth, async user => {
    if (!user) {
        window.MingyueAccountScope = null;
        return;
    }

    try {
        const result = await bindAccount(user);
        const marker = "mingyue_v434_reloaded:" + result.uid;
        if (sessionStorage.getItem(marker) !== "1") {
            sessionStorage.setItem(marker, "1");
            console.log("明月證券 v4.3.4：帳戶隔離已準備，重新載入核心系統");
            location.reload();
        }
    } catch (error) {
        console.error("明月證券 v4.3.4：Google UID 綁定失敗", error);
    }
});

console.log("明月證券 v4.3.4 Account Scope 模組已載入");
