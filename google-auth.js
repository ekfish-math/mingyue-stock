/* =========================================================
   明月證券 v4.3.3
   Google Account / Firebase Authentication
   ---------------------------------------------------------
   1. Popup 優先
   2. Redirect 備援
   3. Firebase Auth Persistence
   4. Google 使用者同步
   5. 全域登入 / 登出函式
   6. 詳細錯誤診斷
   ========================================================= */

import { getApps } from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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

    version: "4.3.3",

    ready: false,

    user: null,


    /* =====================================================
       Google 登入
       Popup 優先
    ===================================================== */

    signIn: async function () {

        console.log(
            "明月證券 v4.3.3：開始 Google 登入"
        );


        try {

            await setPersistence(
                auth,
                browserLocalPersistence
            );


            console.log(
                "明月證券：Auth Persistence 已設定"
            );


            /* -------------------------------------------------
               第一優先：Popup
            ------------------------------------------------- */

            try {

                console.log(
                    "明月證券：嘗試 Google Popup 登入"
                );


                const result =
                    await signInWithPopup(
                        auth,
                        provider
                    );


                if (
                    result &&
                    result.user
                ) {

                    console.log(
                        "明月證券：Google Popup 登入成功"
                    );


                    await completeLogin(
                        result.user
                    );

                    return;

                }

            }

            catch (popupError) {

                console.warn(
                    "明月證券：Google Popup 登入失敗，準備使用 Redirect",
                    popupError
                );


                console.warn(
                    "Popup error code：",
                    popupError.code
                );


                /* -------------------------------------------------
                   如果是使用者主動關閉，不再自動 Redirect
                ------------------------------------------------- */

                if (
                    popupError.code ===
                    "auth/popup-closed-by-user"
                ) {

                    return;

                }

            }


            /* -------------------------------------------------
               第二優先：Redirect
            ------------------------------------------------- */

            console.log(
                "明月證券：改用 Google Redirect 登入"
            );


            await signInWithRedirect(
                auth,
                provider
            );

        }

        catch (error) {

            reportAuthError(
                "Google 登入失敗",
                error
            );

        }

    },


    /* =====================================================
       登出
    ===================================================== */

    signOut: async function () {

        try {

            await signOut(auth);


            window.MingyueAuth.user =
                null;


            console.log(
                "明月證券：Google 帳戶已登出"
            );


            publish(null);

        }

        catch (error) {

            reportAuthError(
                "Google 登出失敗",
                error
            );

        }

    },


    /* =====================================================
       取得目前使用者
    ===================================================== */

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
   4. 完成登入
========================================================= */

async function completeLogin(user) {

    if (!user) {

        console.warn(
            "明月證券：completeLogin 收到空的 user"
        );

        return;

    }


    console.log(
        "明月證券：取得 Google 使用者",
        {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        }
    );


    await syncGoogleProfile(
        user
    );


    publish(
        user
    );


    console.log(
        "明月證券 v4.3.3：Google 帳戶已登入"
    );

}


/* =========================================================
   5. 同步 Google Profile
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
   6. 發布登入狀態
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


    updateGoogleUI(
        user
    );

}


/* =========================================================
   7. Google UI
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
   8. Redirect 結果
========================================================= */

async function handleRedirectResult() {

    console.log(
        "明月證券：檢查 Google Redirect 結果"
    );


    try {

        const result =
            await getRedirectResult(
                auth
            );


        if (
            result &&
            result.user
        ) {

            console.log(
                "明月證券：Google Redirect 登入成功"
            );


            await completeLogin(
                result.user
            );


            return;

        }


        console.log(
            "明月證券：沒有 Google Redirect 登入結果"
        );


        if (auth.currentUser) {

            console.log(
                "明月證券：偵測到現有 Google 使用者"
            );


            await completeLogin(
                auth.currentUser
            );

        }

    }

    catch (error) {

        reportAuthError(
            "Google Redirect 處理失敗",
            error
        );

    }

}


/* =========================================================
   9. Auth 狀態監聽
========================================================= */

onAuthStateChanged(
    auth,
    async function (user) {

        console.log(
            "明月證券：onAuthStateChanged",
            user
                ? user.uid
                : null
        );


        if (user) {

            try {

                await completeLogin(
                    user
                );

            }

            catch (error) {

                reportAuthError(
                    "登入使用者同步失敗",
                    error
                );

            }

        }

        else {

            publish(
                null
            );


            console.log(
                "明月證券 v4.3.3：目前未登入 Google 帳戶"
            );

        }

    }
);


/* =========================================================
   10. BFCache / pageshow
========================================================= */

window.addEventListener(
    "pageshow",
    async function () {

        console.log(
            "明月證券：pageshow"
        );


        if (auth.currentUser) {

            try {

                await completeLogin(
                    auth.currentUser
                );

            }

            catch (error) {

                reportAuthError(
                    "pageshow 使用者同步失敗",
                    error
                );

            }

        }

    }
);


/* =========================================================
   11. visibilitychange
========================================================= */

document.addEventListener(
    "visibilitychange",
    async function () {

        if (
            document.visibilityState !==
            "visible"
        ) {

            return;

        }


        if (auth.currentUser) {

            try {

                await completeLogin(
                    auth.currentUser
                );

            }

            catch (error) {

                reportAuthError(
                    "visibility 使用者同步失敗",
                    error
                );

            }

        }

    }
);


/* =========================================================
   12. 錯誤診斷
========================================================= */

function reportAuthError(
    message,
    error
) {

    console.error(
        `明月證券：${message}`,
        error
    );


    if (error) {

        console.error(
            "Auth error code：",
            error.code || "unknown"
        );


        console.error(
            "Auth error message：",
            error.message || "unknown"
        );

    }


    window.dispatchEvent(
        new CustomEvent(
            "mingyue-auth-error",
            {
                detail: error
            }
        )
    );

}


/* =========================================================
   13. HTML Escape
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
   14. Auth Error UI
========================================================= */

window.addEventListener(
    "mingyue-auth-error",
    function (event) {

        const error =
            event.detail;


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
   15. 啟動 Redirect 檢查
========================================================= */

handleRedirectResult();


/* =========================================================
   16. 完成
========================================================= */

console.log(
    "明月證券 v4.3.3 Google Account 模組已載入"
);
