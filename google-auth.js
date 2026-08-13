/* =========================================================
   明月證券 v4.3.2
   Google Account / Firebase Authentication
   ---------------------------------------------------------
   v4.3.2
   1. Google 登入
   2. Google 登出
   3. Redirect 登入結果處理
   4. Local Persistence
   5. BFCache / pageshow 處理
   6. authUsers/{uid} 同步
   7. 全域 googleLogin()
   8. 全域 googleLogout()
   ========================================================= */

import { getApps } from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    update
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   1. Firebase App
========================================================= */

if (!getApps().length) {

    throw new Error(
        "Firebase App 尚未初始化，請先載入 plugin-adapter.js"
    );

}


const app =
    getApps()[0];

const auth =
    getAuth(app);

const db =
    getDatabase(app);

const provider =
    new GoogleAuthProvider();


provider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   2. MingyueAuth
========================================================= */

window.MingyueAuth = {

    version: "4.3.2",

    ready: false,

    user: null,

    signIn: async function () {

        try {

            console.log(
                "明月證券：準備 Google 登入"
            );

            await setPersistence(
                auth,
                browserLocalPersistence
            );

            await signInWithRedirect(
                auth,
                provider
            );

        } catch (error) {

            console.error(
                "明月證券 Google 登入失敗：",
                error
            );

            window.dispatchEvent(
                new CustomEvent(
                    "mingyue-auth-error",
                    {
                        detail: error
                    }
                )
            );

        }

    },

    signOut: async function () {

        try {

            await signOut(auth);

            window.MingyueAuth.user =
                null;

            console.log(
                "明月證券：Google 帳戶已登出"
            );

            publish(null);

        } catch (error) {

            console.error(
                "明月證券 Google 登出失敗：",
                error
            );

        }

    },

    getUser: function () {

        return auth.currentUser || null;

    }

};


/* =========================================================
   3. HTML 全域函式
========================================================= */

window.googleLogin =
    function () {

        return window.MingyueAuth.signIn();

    };


window.googleLogout =
    function () {

        return window.MingyueAuth.signOut();

    };


/* =========================================================
   4. Firebase 使用者資料同步
========================================================= */

async function syncGoogleProfile(user) {

    if (!user) {

        return;

    }

    const uid =
        user.uid;

    const node =
        ref(
            db,
            `authUsers/${uid}`
        );

    const snapshot =
        await get(node);

    const old =
        snapshot.exists()
            ? snapshot.val()
            : {};

    await update(
        node,
        {

            uid,

            provider:
                "google",

            email:
                user.email || "",

            displayName:
                user.displayName || "",

            photoURL:
                user.photoURL || "",

            createdAt:
                old.createdAt ||
                Date.now(),

            lastLoginAt:
                Date.now()

        }
    );

    console.log(
        "明月證券：Google 帳戶資料已同步"
    );

}


/* =========================================================
   5. 發布登入狀態
========================================================= */

function publish(user) {

    window.MingyueAuth.user =
        user || null;

    window.MingyueAuth.ready =
        true;

    const detail =
        user
            ? {

                uid:
                    user.uid,

                email:
                    user.email || "",

                displayName:
                    user.displayName || "",

                photoURL:
                    user.photoURL || ""

            }
            : null;


    window.dispatchEvent(
        new CustomEvent(
            "mingyue-auth-state",
            {
                detail
            }
        )
    );


    updateGoogleUI(user);

}


/* =========================================================
   6. Google UI
========================================================= */

function updateGoogleUI(user) {

    const status =
        document.getElementById(
            "google-status"
        );

    if (!status) {

        return;

    }


    if (!user) {

        status.innerHTML = `

            <div class="google-auth-status">

                <div class="google-auth-title">
                    尚未登入
                </div>

                <div class="google-auth-subtitle">
                    使用 Google 帳戶登入明月證券
                </div>

                <button
                    class="primary-button full"
                    type="button"
                    onclick="googleLogin()"
                >
                    🔐 使用 Google 登入
                </button>

            </div>

        `;

        return;

    }


    const name =
        escapeHTML(
            user.displayName ||
            "Google 使用者"
        );

    const email =
        escapeHTML(
            user.email || ""
        );

    const photo =
        user.photoURL || "";


    const avatar =
        photo
            ? `
                <img
                    src="${escapeHTML(photo)}"
                    alt="Google 頭像"
                    class="google-avatar"
                >
              `
            : `
                <div class="google-avatar-fallback">
                    👤
                </div>
              `;


    status.innerHTML = `

        <div class="google-auth-status">

            <div class="google-profile">

                ${avatar}

                <div class="google-profile-info">

                    <div class="google-profile-name">
                        ${name}
                    </div>

                    <div class="google-profile-email">
                        ${email}
                    </div>

                </div>

            </div>

            <div class="google-profile-uid">

                UID：
                ${escapeHTML(user.uid)}

            </div>

            <button
                class="secondary-button full"
                type="button"
                onclick="googleLogout()"
            >
                登出 Google 帳戶
            </button>

        </div>

    `;

}


/* =========================================================
   7. HTML Escape
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   8. Auth 狀態監聽
========================================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        try {

            if (user) {

                await syncGoogleProfile(
                    user
                );

            }

        } catch (error) {

            console.warn(
                "明月證券 Google 帳戶資料同步失敗：",
                error
            );

        }


        publish(user);


        console.log(
            user
                ? "明月證券 v4.3.2：Google 帳戶已登入"
                : "明月證券 v4.3.2：目前未登入 Google 帳戶"
        );

    }
);


/* =========================================================
   9. Redirect Result
========================================================= */

async function handleRedirectResult() {

    try {

        const result =
            await getRedirectResult(auth);


        if (result && result.user) {

            console.log(
                "明月證券：Google Redirect 登入成功"
            );

            await syncGoogleProfile(
                result.user
            );

            publish(
                result.user
            );

            return;

        }


        const currentUser =
            auth.currentUser;


        if (currentUser) {

            console.log(
                "明月證券：偵測到現有 Google 登入狀態"
            );

            await syncGoogleProfile(
                currentUser
            );

            publish(
                currentUser
            );

        }

    } catch (error) {

        console.error(
            "明月證券 Google Redirect 處理失敗：",
            error
        );

        window.dispatchEvent(
            new CustomEvent(
                "mingyue-auth-error",
                {
                    detail: error
                }
            )
        );

    }

}


/* =========================================================
   10. 頁面 BFCache
========================================================= */

window.addEventListener(
    "pageshow",
    function () {

        if (auth.currentUser) {

            console.log(
                "明月證券：pageshow 偵測到 Google 使用者"
            );

            publish(
                auth.currentUser
            );

        }

    }
);


/* =========================================================
   11. visibilitychange
========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            const user =
                auth.currentUser;

            if (user) {

                publish(user);

            }

        }

    }
);


/* =========================================================
   12. 執行 Redirect 檢查
========================================================= */

handleRedirectResult();


/* =========================================================
   13. Auth Error
========================================================= */

window.addEventListener(
    "mingyue-auth-error",
    function (event) {

        const error =
            event.detail;

        console.error(
            "明月證券 Auth Error：",
            error
        );

        if (
            typeof window.showToast ===
            "function"
        ) {

            window.showToast(
                "Google 登入失敗，請稍後再試"
            );

        }

    }
);


/* =========================================================
   14. 完成
========================================================= */

console.log(
    "明月證券 v4.3.2 Google Account 模組已載入"
);
