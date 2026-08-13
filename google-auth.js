/* =========================================================
   明月證券 v4.3.3 - Google Authentication
   Google UID → Securities Account
   ========================================================= */
import { getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

if (!getApps().length) throw new Error("Firebase App 尚未初始化，請先載入 plugin-adapter.js");
const auth = getAuth(getApps()[0]);
const db = getDatabase(getApps()[0]);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

window.MingyueAuth = {
    version: "4.3.3",
    ready: false,
    user: null,
    signIn: async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            try {
                const result = await signInWithPopup(auth, provider);
                if (result?.user) await completeLogin(result.user);
                return;
            } catch (e) {
                console.warn("Google Popup 失敗，改用 Redirect", e);
                if (e.code === "auth/popup-closed-by-user") return;
            }
            await signInWithRedirect(auth, provider);
        } catch (e) { reportAuthError("Google 登入失敗", e); }
    },
    signOut: async () => {
        try { await signOut(auth); publish(null, null); }
        catch (e) { reportAuthError("Google 登出失敗", e); }
    },
    getUser: () => auth.currentUser || null
};
window.googleLogin = () => window.MingyueAuth.signIn();
window.googleLogout = () => window.MingyueAuth.signOut();

async function completeLogin(user) {
    if (!user) return;
    const account = await ensureSecuritiesAccount(user);
    publish(user, account);
    console.log("明月證券登入完成", { uid: user.uid, accountId: account.accountId });
}

async function ensureSecuritiesAccount(user) {
    const uid = String(user.uid);
    const [userSnap, portfolioSnap, transactionSnap, authSnap] = await Promise.all([
        get(ref(db, `users/${uid}`)),
        get(ref(db, `portfolios/${uid}`)),
        get(ref(db, `transactions/${uid}`)),
        get(ref(db, `authUsers/${uid}`))
    ]);
    const oldUser = userSnap.exists() ? userSnap.val() : {};
    const oldAuth = authSnap.exists() ? authSnap.val() : {};
    const createdAt = oldUser.createdAt || oldAuth.createdAt || Date.now();
    const account = {
        ...oldUser,
        accountId: uid,
        googleUid: uid,
        name: oldUser.name || user.displayName || "Google 使用者",
        email: oldUser.email || user.email || "",
        photoURL: oldUser.photoURL || user.photoURL || "",
        balance: Number.isFinite(Number(oldUser.balance)) ? Number(oldUser.balance) : 1000000,
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
    } catch (e) { console.warn("帳號快取失敗", e); }
    return account;
}

function publish(user, account) {
    window.MingyueAuth.user = user || null;
    window.MingyueAuth.ready = true;
    const detail = user ? { uid: user.uid, accountId: account?.accountId || user.uid, email: user.email || "", displayName: user.displayName || "", photoURL: user.photoURL || "" } : null;
    window.dispatchEvent(new CustomEvent("mingyue-auth-state", { detail }));
    updateGoogleUI(user, account);
}

function updateGoogleUI(user, account) {
    const status = document.getElementById("google-status");
    if (!status) return;
    if (!user) {
        status.innerHTML = `<div class="google-auth-status"><div class="google-auth-title">尚未登入</div><div class="google-auth-subtitle">使用 Google 帳戶登入明月證券</div><button class="primary-button full" type="button" onclick="googleLogin()">🔐 使用 Google 登入</button></div>`;
        return;
    }
    const name = escapeHTML(user.displayName || "Google 使用者");
    const email = escapeHTML(user.email || "");
    const photo = user.photoURL || "";
    const avatar = photo ? `<img src="${escapeHTML(photo)}" alt="Google 頭像" class="google-avatar">` : `<div class="google-avatar-fallback">👤</div>`;
    status.innerHTML = `<div class="google-auth-status"><div class="google-profile">${avatar}<div class="google-profile-info"><div class="google-profile-name">${name}</div><div class="google-profile-email">${email}</div></div></div><div class="google-profile-uid">證券帳號：${escapeHTML(account?.accountId || user.uid)}</div><div class="google-profile-uid">Google UID：${escapeHTML(user.uid)}</div><button class="secondary-button full" type="button" onclick="googleLogout()">登出 Google 帳戶</button></div>`;
}

async function handleRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result?.user) await completeLogin(result.user);
        else if (auth.currentUser) await completeLogin(auth.currentUser);
    } catch (e) { reportAuthError("Google Redirect 處理失敗", e); }
}

onAuthStateChanged(auth, async user => {
    try {
        if (user) await completeLogin(user);
        else publish(null, null);
    } catch (e) { reportAuthError("登入使用者同步失敗", e); }
});

window.addEventListener("pageshow", async () => {
    if (auth.currentUser) try { await completeLogin(auth.currentUser); } catch (e) { reportAuthError("pageshow 同步失敗", e); }
});
document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && auth.currentUser) {
        try { await completeLogin(auth.currentUser); } catch (e) { reportAuthError("visibility 同步失敗", e); }
    }
});

function reportAuthError(message, error) {
    console.error(`明月證券：${message}`, error);
    window.dispatchEvent(new CustomEvent("mingyue-auth-error", { detail: error }));
}
function escapeHTML(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
window.addEventListener("mingyue-auth-error", () => {
    if (typeof window.showToast === "function") window.showToast("Google 登入失敗，請稍後再試");
});
handleRedirectResult();
console.log("明月證券 v4.3.3 Google Authentication 已載入");
