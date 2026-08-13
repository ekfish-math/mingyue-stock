/* =========================================================
   明月證券 v4.2.1
   Plugin Data Adapter - Active Bridge
   ---------------------------------------------------------
   v4.3 addition: Firebase Google Authentication is loaded
   after the adapter preload and before the legacy v4.2 app.
   ========================================================= */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

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

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getDatabase(app);

const PATHS = [
    "users", "stocks", "companies", "news", "ipo",
    "portfolios", "transactions", "historyData"
];

const CACHE_KEYS = {
    users: "mingyue_user_v42",
    stocks: "mingyue_stocks_v42",
    companies: "mingyue_companies_v42",
    news: "mingyue_news_v42",
    portfolios: "mingyue_portfolio_v42",
    transactions: "mingyue_transactions_v42",
    historyData: "mingyue_history_v42"
};

function validKey(key) {
    return PATHS.includes(String(key));
}

function getExternalPlugin() {
    return window.MingyueExternalPlugin || window.mingyueExternalPlugin ||
           window.MingyuePlugin || window.mingyuePlugin || null;
}

async function externalRead(key) {
    const plugin = getExternalPlugin();
    if (!plugin) return undefined;
    try {
        if (typeof plugin.read === "function") return await plugin.read(key);
        if (typeof plugin.get === "function") return await plugin.get(key);
        if (typeof plugin.readData === "function") return await plugin.readData(key);
        if (typeof plugin.getData === "function") return await plugin.getData(key);
    } catch (error) {
        console.warn("4.2.1 外部外掛讀取失敗：", key, error);
    }
    return undefined;
}

async function externalWrite(key, value) {
    const plugin = getExternalPlugin();
    if (!plugin) return false;
    try {
        if (typeof plugin.write === "function") { await plugin.write(key, value); return true; }
        if (typeof plugin.set === "function") { await plugin.set(key, value); return true; }
        if (typeof plugin.writeData === "function") { await plugin.writeData(key, value); return true; }
    } catch (error) {
        console.warn("4.2.1 外部外掛寫入失敗：", key, error);
    }
    return false;
}

async function externalReadAll() {
    const plugin = getExternalPlugin();
    if (!plugin) return undefined;
    try {
        if (typeof plugin.readAll === "function") return await plugin.readAll();
        if (typeof plugin.getAll === "function") return await plugin.getAll();
    } catch (error) {
        console.warn("4.2.1 外部外掛全資料讀取失敗：", error);
    }
    return undefined;
}

async function externalWriteMany(data) {
    const plugin = getExternalPlugin();
    if (!plugin) return false;
    try {
        if (typeof plugin.writeMany === "function") { await plugin.writeMany(data || {}); return true; }
    } catch (error) {
        console.warn("4.2.1 外部外掛批次寫入失敗：", error);
    }
    return false;
}

function filterPaths(data) {
    const result = {};
    for (const key of PATHS) {
        if (Object.prototype.hasOwnProperty.call(data || {}, key)) result[key] = data[key];
    }
    return result;
}

function cacheData(data) {
    try {
        for (const key of PATHS) {
            if (!Object.prototype.hasOwnProperty.call(data || {}, key)) continue;
            const value = data[key];
            const cacheKey = CACHE_KEYS[key];
            if (!cacheKey) continue;
            if (key === "users" || key === "portfolios") {
                const account = value?.["MYS-000184"];
                if (account) localStorage.setItem(cacheKey, JSON.stringify(account));
            } else if (key === "transactions") {
                const account = value?.["MYS-000184"];
                if (Array.isArray(account)) localStorage.setItem(cacheKey, JSON.stringify(account));
            } else {
                localStorage.setItem(cacheKey, JSON.stringify(value));
            }
        }
    } catch (error) {
        console.warn("4.2.1 LocalStorage fallback 寫入失敗：", error);
    }
}

async function firebaseReadAll() {
    const snapshot = await get(ref(db));
    return snapshot.exists() ? snapshot.val() : {};
}

async function mirrorToFirebase(data) {
    const patch = filterPaths(data);
    if (!Object.keys(patch).length) return false;
    try {
        await update(ref(db), patch);
        return true;
    } catch (error) {
        console.warn("4.2.1 外掛資料鏡像 Firebase 失敗：", error);
        return false;
    }
}

async function read(key) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    const external = await externalRead(key);
    if (external !== undefined && external !== null) return external;
    try {
        const snapshot = await get(ref(db, key));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.warn("4.2.1 Firebase 讀取失敗：", key, error);
        return null;
    }
}

async function write(key, value) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    const externalOK = await externalWrite(key, value);
    try {
        await set(ref(db, key), value);
    } catch (error) {
        if (!externalOK) throw error;
        console.warn("4.2.1 外掛寫入後 Firebase 鏡像失敗：", key, error);
    }
    return true;
}

async function writeMany(data) {
    const patch = filterPaths(data);
    if (!Object.keys(patch).length) return [];
    const externalOK = await externalWriteMany(patch);
    try {
        await update(ref(db), patch);
    } catch (error) {
        if (!externalOK) throw error;
        console.warn("4.2.1 Firebase 批次鏡像失敗：", error);
    }
    return Object.keys(patch);
}

async function readAll() {
    const external = await externalReadAll();
    if (external && typeof external === "object" && Object.keys(external).length) {
        cacheData(external);
        return external;
    }
    try {
        const firebase = await firebaseReadAll();
        cacheData(firebase);
        return firebase;
    } catch (error) {
        console.warn("4.2.1 Firebase 全資料讀取失敗：", error);
        return {};
    }
}

async function preload() {
    const external = getExternalPlugin();
    const data = await readAll();
    if (external && data && typeof data === "object" && Object.keys(data).length) {
        cacheData(data);
        const mirrored = await mirrorToFirebase(data);
        console.log(mirrored
            ? "明月證券 v4.2.1：外掛資料已預載入並同步至 Firebase"
            : "明月證券 v4.2.1：外掛資料已預載入，Firebase 鏡像失敗");
    } else if (data && typeof data === "object" && Object.keys(data).length) {
        console.log("明月證券 v4.2.1：Firebase 資料已預載入");
    } else {
        console.log("明月證券 v4.2.1：沒有遠端資料，交由 v4.2 fallback");
    }
    return data;
}

window.MingyueDataPlugin = Object.freeze({
    version: "4.2.1",
    paths: Object.freeze([...PATHS]),
    read, write, writeMany, readAll, preload,
    isReady: true
});
window.MingyueDataAdapter = window.MingyueDataPlugin;
window.MINGYUE_V421 = true;

console.log("明月證券 v4.2.1 Plugin Data Adapter 已載入");
await preload();

/* v4.3：Firebase Google 帳戶模組 */
try {
    await import("./google-auth.js");
    window.MINGYUE_V43 = true;
    console.log("明月證券 v4.3 Google Account 模組已接入");
} catch (error) {
    window.MINGYUE_V43 = false;
    console.warn("明月證券 v4.3 Google Account 模組載入失敗，股票系統不受影響：", error);
}
