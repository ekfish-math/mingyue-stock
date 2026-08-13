/* =========================================================
   明月證券 v4.3
   Google Account / Firebase Authentication
   ---------------------------------------------------------
   v4.3.1
   1. Google 登入
   2. Google 登出
   3. 登入狀態同步
   4. authUsers/{uid} 同步
   5. 全域 googleLogin()
   6. 全域 googleLogout()
   7. 手機 Redirect 登入
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

import {
    getDatabase,
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   1. Firebase App 檢查
========================================================= */

if (!getApps().length) {

    throw new Error(
        "Firebase App 尚未初始化，請先載入 plugin-adapter.js"
    );

}


/* =========================================================
   2. Firebase 初始化
========================================================= */

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
   3. MingyueAuth API
========================================================= */

window.MingyueAuth = {

    version: "4.3.1",

    ready: false,

    user: null,


    /* -----------------------------------------------------
       Google 登入
    ----------------------------------------------------- */

    signIn: async function () {

        try {

            console.log(
                "明月證券：正在開啟 Google 登入..."
            );

            await signInWithRedirect(
                auth,
                provider
            );

        }

        catch (error) {

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


    /* -----------------------------------------------------
       Google 登出
    ----------------------------------------------------- */

    signOut: async function () {

        try {

            await signOut(auth);

            console.log(
                "明月證券：Google 帳戶已登出"
            );

        }

        catch (error) {

            console.error(
                "明月證券 Google 登出失敗：",
                error
            );

        }

    },


    /* -----------------------------------------------------
       取得目前使用者
    ----------------------------------------------------- */

    getUser: function () {

        return auth.currentUser || null;

    }

};


/* =========================================================
   4. 全域函式
   ---------------------------------------------------------
   給 HTML：

   onclick="googleLogin()"
   onclick="googleLogout()"
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
   5. 同步 Google 使用者資料
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


    const data = {

        uid: uid,

        provider: "google",

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

    };


    await update(
        node,
        data
    );


    console.log(
        "明月證券：Google 帳戶資料已同步",
        uid
    );

}


/* =========================================================
   6. 發布登入狀態
========================================================= */

function publishAuthState(user) {

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
                detail: detail
            }
        )

    );


    /* -----------------------------------------------------
       同時嘗試更新頁面上的 Google 帳戶 UI
    ----------------------------------------------------- */

    updateGoogleUI(user);

}


/* =========================================================
   7. 更新 Google UI
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
                        ${escapeHTML(
                            user.displayName ||
                            "Google 使用者"
                        )}
                    </div>

                    <div class="google-profile-email">
                        ${escapeHTML(
                            user.email || ""
                        )}
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
   8. 基本 HTML Escape
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
   9. Firebase Authentication 狀態監聽
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

        }

        catch (error) {

            console.warn(
                "明月證券 Google 帳戶資料同步失敗：",
                error
            );

        }


        publishAuthState(
            user
        );


        if (user) {

            console.log(
                "明月證券 v4.3.1：Google 帳戶已登入"
            );

        }

        else {

            console.log(
                "明月證券 v4.3.1：目前未登入 Google 帳戶"
            );

        }

    }
);


/* =========================================================
   10. Redirect 登入結果
========================================================= */

getRedirectResult(auth)

    .then(function (result) {

        if (!result) {

            return;

        }


        console.log(
            "明月證券：Google Redirect 登入成功"
        );

    })

    .catch(function (error) {

        console.error(
            "明月證券 Google 登入回傳失敗：",
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

    });


/* =========================================================
   11. 錯誤事件
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
   12. 模組載入完成
========================================================= */

console.log(
    "明月證券 v4.3.1 Google Account 模組已載入"
);
