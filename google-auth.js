/* =========================================================
   明月證券 v4.3
   Google Account / Firebase Authentication
   ========================================================= */

import { getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

if (!getApps().length) {
    throw new Error("Firebase App 尚未初始化，請先載入 plugin-adapter.js");
}

const auth = getAuth(getApps()[0]);
const db = getDatabase(getApps()[0]);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

window.MingyueAuth = {
    version: "4.3.0",
    ready: false,
    user: null,
    signIn: async () => {
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("明月證券 Google 登入失敗：", error);
            window.dispatchEvent(new CustomEvent("mingyue-auth-error", { detail: error }));
        }
    },
    signOut: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("明月證券 Google 登出失敗：", error);
        }
    },
    getUser: () => auth.currentUser || null
};

async function syncGoogleProfile(user) {
    if (!user) return;
    const uid = user.uid;
    const node = ref(db, `authUsers/${uid}`);
    const snapshot = await get(node);
    const old = snapshot.exists() ? snapshot.val() : {};

    await update(node, {
        uid,
        provider: "google",
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: old.createdAt || Date.now(),
        lastLoginAt: Date.now()
    });
}

function publish(user) {
    window.MingyueAuth.user = user || null;
    window.MingyueAuth.ready = true;
    window.dispatchEvent(new CustomEvent("mingyue-auth-state", {
        detail: user ? {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || ""
        } : null
    }));
}

onAuthStateChanged(auth, async user => {
    try {
        if (user) await syncGoogleProfile(user);
    } catch (error) {
        console.warn("明月證券 Google 帳戶資料同步失敗：", error);
    }
    publish(user);
    console.log(user ? "明月證券 v4.3：Google 帳戶已登入" : "明月證券 v4.3：目前未登入 Google 帳戶");
});

getRedirectResult(auth).catch(error => {
    if (error) {
        console.error("明月證券 Google 登入回傳失敗：", error);
        window.dispatchEvent(new CustomEvent("mingyue-auth-error", { detail: error }));
    }
});

console.log("明月證券 v4.3 Google Account 模組已載入");
