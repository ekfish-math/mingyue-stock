/* =========================================================
   明月證券 v4.3.4 - Google Authentication
   Google UID → Securities Account
   ========================================================= */
import { getApps } from "https://unpkg.com/firebase@12.19.0/firebase-app.js";
import {
    getAuth,
    initializeAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from "https://unpkg.com/firebase@12.19.0/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://unpkg.com/firebase@12.19.0/firebase-database.js";

if (!getApps().length) throw new Error("Firebase App 尚未初始化，請先載入 plugin-adapter.js");

const app = getApps()[0];
let auth;
try { auth = getAuth(app); } catch (_) { auth = initializeAuth(app, { persistence: browserLocalPersistence }); }
const db = getDatabase(getApps()[0]);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

let authResolved = false;
let authBusy = false;

try {
    await setPersistence(auth, browserLocalPersistence);
} catch (e) {
    console.warn("Firebase Auth 持久化設定失敗", e);
}

window.MingyueAuth = {
    version: "4.3.4",
    ready: false,
    user: null,
    resolved: false,

    signIn: async () => {
        if (authBusy) return;
        authBusy = true;

        try {
            await setPersistence(auth, browserLocalPersistence);

            try {
                const result = await signInWithPopup(auth, provider);
                if (result?.user) console.log("Google OAuth 驗證成功", result.user.uid);
            } catch (e) {
                if (e?.code === "auth/popup-closed-by-user") return;

                if (
                    e?.code !== "auth/popup-blocked" &&
                    e?.code !== "auth/operation-not-supported-in-this-environment"
                ) {
                    reportAuthError("Google 登入失敗", e);
                    return;
                }

                await signInWithRedirect(auth, provider);
            }
        } catch (e) {
            reportAuthError("Google 登入失敗", e);
        } finally {
            authBusy = false;
        }
    },

    signOut: async () => {
        try {
            await signOut(auth);
            publish(null, null);
        } catch (e) {
            reportAuthError("Google 登出失敗", e);
        }
    },

    getUser: () => auth.currentUser || null,
    isResolved: () => authResolved
};

window.googleLogin = () => window.MingyueAuth.signIn();
window.googleLogout = () => window.MingyueAuth.signOut();
window.toggleGoogleLogin = () =>
    window.MingyueAuth.user ? window.MingyueAuth.signOut() : window.MingyueAuth.signIn();

async function completeLogin(user) {
    if (!user) return;

    try {
        const account = await ensureSecuritiesAccount(user);
        publish(user, account);
        console.log("明月證券登入完成", {
            uid: user.uid,
            accountId: account.accountId
        });
    } catch (e) {
        // Firebase Auth 已經成功；如果只是 Realtime Database Rules 尚未部署，
        // 不要把「資料庫權限」誤報成「Google 登入失敗」。
        if (isDatabasePermissionError(e)) {
            const fallbackAccount = {
                accountId: user.uid,
                googleUid: user.uid,
                name: user.displayName || "Google 使用者",
                email: user.email || "",
                photoURL: user.photoURL || ""
            };

            publish(user, fallbackAccount);
            console.warn("Google OAuth 已成功，但證券帳戶資料暫時無法同步：Realtime Database 權限尚未就緒。");

            if (typeof window.showToast === "function") {
                window.showToast("Google 登入成功；證券帳戶資料同步尚未完成");
            }
            return;
        }

        reportAuthError("登入後帳戶同步失敗", e);
    }
}

async function ensureSecuritiesAccount(user) {
    const uid = String(user.uid);

    const [userSnap, portfolioSnap, transactionSnap, authSnap] = await Promise.all([
        get(ref(db, `users/${uid}`)),
        get(ref(db, `portfolios/${uid}`)),
        get(ref(db, `transactions/${uid}`)),
        get(ref(db, `authUsers/${uid}`))
    ]);

    const isNewAccount = !userSnap.exists() && !authSnap.exists();
    const oldUser = userSnap.exists() ? userSnap.val() : {};
    const oldAuth = authSnap.exists() ? authSnap.val() : {};

    const oldBalance = Number(oldUser.balance);
    const oldFrozenBalance = Number(oldUser.frozenBalance);

    const createdAt =
        Number.isFinite(Number(oldUser.createdAt))
            ? Number(oldUser.createdAt)
            : Number.isFinite(Number(oldAuth.createdAt))
                ? Number(oldAuth.createdAt)
                : Date.now();

    const account = {
        ...oldUser,
        accountId: uid,
        googleUid: uid,
        name: oldUser.name || user.displayName || "Google 使用者",
        email: oldUser.email || user.email || "",
        photoURL: oldUser.photoURL || user.photoURL || "",
        balance: isNewAccount ? 0 : (Number.isFinite(oldBalance) ? oldBalance : 0),
        frozenBalance: isNewAccount ? 0 : (Number.isFinite(oldFrozenBalance) ? oldFrozenBalance : 0),
        createdAt,
        lastLoginAt: Date.now()
    };

    const authProfile = {
        ...oldAuth,
        uid,
        accountId: uid,
        provider: "google",
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt,
        lastLoginAt: Date.now()
    };

    const patch = {
        [`users/${uid}`]: account,
        [`authUsers/${uid}`]: authProfile
    };

    if (!portfolioSnap.exists()) patch[`portfolios/${uid}`] = {};
    if (!transactionSnap.exists()) patch[`transactions/${uid}`] = [];

    await update(ref(db), patch);

    try {
        localStorage.setItem("mingyue_current_google_uid", uid);
        localStorage.setItem("mingyue_user_v43", JSON.stringify(account));
    } catch (e) {
        console.warn("帳號快取失敗", e);
    }

    return account;
}

function isDatabasePermissionError(error) {
    const code = String(error?.code || "").toLowerCase();
    const message = String(error?.message || error || "").toLowerCase();
    return (
        code === "permission_denied" ||
        code === "database/permission-denied" ||
        message.includes("permission denied") ||
        message.includes("permission_denied")
    );
}

function publish(user, account) {
    window.MingyueAuth.user = user || null;
    window.MingyueAuth.ready = true;

    const detail = user
        ? {
            uid: user.uid,
            accountId: account?.accountId || user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || ""
        }
        : null;

    window.dispatchEvent(new CustomEvent("mingyue-auth-state", { detail }));
    updateGoogleUI(user, account);
    updateProfileUI(user, account);
}

function updateGoogleUI(user, account) {
    const status = document.getElementById("google-status");
    if (!status) return;

    status.textContent = user
        ? `已登入 · ${user.email || user.displayName || "Google 帳戶"}`
        : "尚未登入 · 點擊登入";
}

function updateProfileUI(user, account) {
    const name = document.getElementById("profile-name");
    const id = document.getElementById("profile-account");
    const avatar = document.getElementById("profile-avatar");

    if (!name || !id) return;

    if (!user) {
        name.textContent = "尚未登入";
        id.textContent = "未建立證券帳號";
        if (avatar) avatar.textContent = "?";
        return;
    }

    name.textContent = user.displayName || user.email || "Google 使用者";
    id.textContent = `證券帳號：${account?.accountId || user.uid}`;

    if (avatar) {
        avatar.textContent = (user.displayName || user.email || "G")
            .trim()
            .charAt(0)
            .toUpperCase();
    }
}

async function handleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) console.log("Google Redirect OAuth 驗證成功", result.user.uid);
    } catch (e) {
        reportAuthError("Google Redirect 處理失敗", e);
    }
}

onAuthStateChanged(auth, async user => {
    try {
        if (user) await completeLogin(user);
        else publish(null, null);
    } catch (e) {
        reportAuthError("登入使用者同步失敗", e);
    } finally {
        authResolved = true;
        window.MingyueAuth.resolved = true;
        window.dispatchEvent(
            new CustomEvent("mingyue-auth-ready", {
                detail: { user: auth.currentUser }
            })
        );
    }
});

window.addEventListener("pageshow", async () => {
    if (auth.currentUser && !authBusy) await completeLogin(auth.currentUser);
});

document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && auth.currentUser && !authBusy) {
        await completeLogin(auth.currentUser);
    }
});

function reportAuthError(message, error) {
    const code = error?.code || "unknown";
    const detail = error?.message || String(error || "");
    console.error(`明月證券：${message}`, { code, message: detail, error });

    window.dispatchEvent(
        new CustomEvent("mingyue-auth-error", {
            detail: { code, message: detail, error }
        })
    );
}

window.addEventListener("mingyue-auth-error", event => {
    const code = event.detail?.code;
    const text =
        code === "PERMISSION_DENIED"
            ? "Google 已登入，但帳戶資料權限不足。"
            : `Google 登入失敗：${code}${event.detail?.message ? `｜${event.detail.message}` : ""}`;

    if (typeof window.showToast === "function") window.showToast(text);
});

handleRedirectResult();
console.log("明月證券 v4.3.4 Google Authentication 已載入");
