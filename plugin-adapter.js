/* =========================================================
   明月證券 v4.2.1
   Plugin Data Adapter
   ---------------------------------------------------------
   用途：讓外部資料外掛提供／同步明月證券資料。
   注意：此檔不取代 v4.2 的 script.js；它是獨立資料橋接層。
   ========================================================= */

import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",
    authDomain: "mingyue-stock.firebaseapp.com",
    databaseURL: "https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mingyue-stock",
    storageBucket: "mingyue-stock.firebasestorage.app",
    messagingSenderId: "774198660845",
    appId: "1:774198660845:web:93f4a725b6303aae9f86e4",
    measurementId: "G-Z7F6N0ZJYJ"
};

const app = getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig);

const db = getDatabase(app);

const PATHS = [
    "users",
    "stocks",
    "companies",
    "news",
    "ipo",
    "portfolios",
    "transactions",
    "historyData"
];

function validKey(key) {
    return PATHS.includes(String(key));
}

async function read(key) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    const snapshot = await get(ref(db, key));
    return snapshot.exists() ? snapshot.val() : null;
}

async function write(key, value) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    await set(ref(db, key), value);
    return true;
}

async function writeMany(data) {
    const patch = {};
    for (const [key, value] of Object.entries(data || {})) {
        if (!validKey(key)) continue;
        patch[key] = value;
    }
    if (Object.keys(patch).length) await update(ref(db), patch);
    return Object.keys(patch);
}

async function readAll() {
    const snapshot = await get(ref(db));
    return snapshot.exists() ? snapshot.val() : {};
}

/* 外掛可以透過這個 API 取得／送入市場資料。 */
window.MingyueDataPlugin = Object.freeze({
    version: "4.2.1",
    paths: Object.freeze([...PATHS]),
    read,
    write,
    writeMany,
    readAll,
    isReady: true
});

console.log("明月證券 v4.2.1 Plugin Data Adapter 已載入");
