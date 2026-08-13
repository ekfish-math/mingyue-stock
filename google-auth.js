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
window.toggleGoogleLogin = () => window.MingyueAuth.user ? window.MingyueAuth.signOut() : window.MingyueAuth.signIn();

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
    const isNewAccount = !userSnap.exists() && !authSnap.exists();
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
        balance: isNewAccount ? 0 : (Number.isFinite(Number(oldUser.balance)) ? Number(oldUser.balance) : 0),
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
    updateProfileUI(user, account);
}

function updateGoogleUI(user, account) {
    const status = document.getElementById("google-status");
    if (!status) return;
    if (!user) { status.textContent = "尚未登入 · 點擊登入"; return; }
    status.textContent = `已登入 · ${user.email || user.displayName || "Google 帳戶"}`;
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
    if (avatar) avatar.textContent = (user.displayName || user.email || "G").trim().charAt(0).toUpperCase();
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
window.addEventListener("mingyue-auth-error", () => {
    if (typeof window.showToast === "function") window.showToast("Google 登入失敗，請稍後再試");
});
handleRedirectResult();
console.log("明月證券 v4.3.3 Google Authentication 已載入");
