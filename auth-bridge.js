/* Mingyue Securities v4.3.3 - Google UID auth bridge */
(function () {
    "use strict";
    const UID_KEY = "mingyue_current_google_uid";
    const ACCOUNT_KEY = "mingyue_active_account_id";

    function apply(user, accountId) {
        if (!user || !user.uid) return;
        const uid = String(user.uid);
        const account = String(accountId || uid);
        localStorage.setItem(UID_KEY, uid);
        localStorage.setItem(ACCOUNT_KEY, account);
        window.MINGYUE_CURRENT_UID = uid;
        window.MINGYUE_ACCOUNT_ID = account;
        window.MingyueCurrentUser = user;
        window.MingyueCurrentAccount = account;
        window.dispatchEvent(new CustomEvent("mingyue-user-ready", {
            detail: { uid, accountId: account, user }
        }));
        console.log("明月證券 Auth Bridge：帳號已同步", account);
    }

    function clear() {
        localStorage.removeItem(UID_KEY);
        localStorage.removeItem(ACCOUNT_KEY);
        localStorage.removeItem("mingyue_user_v43");
        window.MINGYUE_CURRENT_UID = null;
        window.MINGYUE_ACCOUNT_ID = null;
        window.MingyueCurrentUser = null;
        window.MingyueCurrentAccount = null;
        window.dispatchEvent(new CustomEvent("mingyue-user-logout"));
    }

    window.MingyueAuthBridge = Object.freeze({
        version: "4.3.3",
        getUid: () => window.MINGYUE_CURRENT_UID || localStorage.getItem(UID_KEY) || null,
        getAccountId: () => window.MINGYUE_ACCOUNT_ID || localStorage.getItem(ACCOUNT_KEY) || window.MINGYUE_CURRENT_UID || null,
        getUser: () => window.MingyueCurrentUser || window.MingyueAuth?.user || null,
        isSignedIn: () => Boolean(window.MINGYUE_CURRENT_UID || localStorage.getItem(UID_KEY))
    });

    function bind() {
        const auth = window.MingyueAuth;
        if (!auth) return false;
        window.addEventListener("mingyue-auth-state", event => {
            const d = event.detail;
            if (d?.uid) apply(auth.user || d, d.accountId || d.uid);
            else clear();
        });
        window.addEventListener("mingyue-user-logout", clear);
        if (auth.user) apply(auth.user, auth.user.uid);
        return true;
    }

    if (!bind()) {
        let n = 0;
        const timer = setInterval(() => {
            if (bind() || ++n >= 40) clearInterval(timer);
        }, 250);
    }

    console.log("明月證券 v4.3.3 Auth Bridge 已載入");
})();
