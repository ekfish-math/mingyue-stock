/* =========================================================
   明月證券 v4.2.1
   Plugin Data Adapter
   ---------------------------------------------------------
   作用：在 v4.2 script.js 啟動前取得外部資料。
   優先順序：
   1. window.MingyueExternalPlugin
   2. Firebase Realtime Database
   3. v4.2 LocalStorage fallback
   ---------------------------------------------------------
   這個檔案必須在 script.js 之前載入。
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

const PATHS = ["users", "stocks", "companies", "news", "ipo", "portfolios", "transactions", "historyData"];

function validKey(key) {
    return PATHS.includes(String(key));
}

function getExternalPlugin() {
    return window.MingyueExternalPlugin || window.mingyueExternalPlugin || null;
}

async function readFromExternal(key) {
    const plugin = getExternalPlugin();
    if (!plugin) return undefined;
    try {
        if (typeof plugin.read === "function") return await plugin.read(key);
        if (typeof plugin.get === "function") return await plugin.get(key);
        if (typeof plugin.readData === "function") return await plugin.readData(key);
        if (typeof plugin.getData === "function") return await plugin.getData(key);
    } catch (error) {
        console.warn("外部資料外掛讀取失敗：", key, error);
    }
    return undefined;
}

async function readFirebase(key) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    try {
        const snapshot = await get(ref(db, key));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.warn("Firebase Adapter 讀取失敗：", key, error);
        return null;
    }
}

async function read(key) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    const external = await readFromExternal(key);
    if (external !== undefined && external !== null) return external;
    return readFirebase(key);
}

async function write(key, value) {
    if (!validKey(key)) throw new Error("不允許的資料路徑：" + key);
    const plugin = getExternalPlugin();
    if (plugin) {
        try {
            if (typeof plugin.write === "function") {
                await plugin.write(key, value);
                return true;
            }
            if (typeof plugin.set === "function") {
                await plugin.set(key, value);
                return true;
            }
            if (typeof plugin.writeData === "function") {
                await plugin.writeData(key, value);
                return true;
            }
        } catch (error) {
            console.warn("外部資料外掛寫入失敗，改用 Firebase：", key, error);
        }
    }
    await set(ref(db, key), value);
    return true;
}

async function writeMany(data) {
    const plugin = getExternalPlugin();
    if (plugin) {
        try {
            if (typeof plugin.writeMany === "function") {
                await plugin.writeMany(data || {});
                return Object.keys(data || {}).filter(validKey);
            }
        } catch (error) {
            console.warn("外部資料外掛批次寫入失敗，改用 Firebase：", error);
        }
    }
    const patch = {};
    for (const [key, value] of Object.entries(data || {})) {
        if (validKey(key)) patch[key] = value;
    }
    if (Object.keys(patch).length) await update(ref(db), patch);
    return Object.keys(patch);
}

async function readAll() {
    const plugin = getExternalPlugin();
    if (plugin) {
        try {
            if (typeof plugin.readAll === "function") {
                const value = await plugin.readAll();
                if (value && typeof value === "object") return value;
            }
            if (typeof plugin.getAll === "function") {
                const value = await plugin.getAll();
                if (value && typeof value === "object") return value;
            }
        } catch (error) {
            console.warn("外部資料外掛全部讀取失敗，改用 Firebase：", error);
        }
    }
    try {
        const snapshot = await get(ref(db));
        return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
        console.warn("Firebase Adapter 全資料讀取失敗：", error);
        return {};
    }
}

function saveV42Cache(data) {
    try {
        const userId = "MYS-000184";
        const userData = data?.users?.[userId];
        const portfolioData = data?.portfolios?.[userId];
        const transactionData = data?.transactions?.[userId];
        if (userData) localStorage.setItem("mingyue_user_v42", JSON.stringify(userData));
        if (Array.isArray(data?.stocks)) localStorage.setItem("mingyue_stocks_v42", JSON.stringify(data.stocks));
        if (portfolioData && typeof portfolioData === "object") localStorage.setItem("mingyue_portfolio_v42", JSON.stringify(portfolioData));
        if (Array.isArray(transactionData)) localStorage.setItem("mingyue_transactions_v42", JSON.stringify(transactionData));
        if (Array.isArray(data?.companies)) localStorage.setItem("mingyue_companies_v42", JSON.stringify(data.companies));
        if (Array.isArray(data?.news)) localStorage.setItem("mingyue_news_v42", JSON.stringify(data.news));
        if (data?.history && typeof data.history === "object") localStorage.setItem("mingyue_history_v42", JSON.stringify(data.history));
    } catch (error) {
        console.warn("v4.2.1 LocalStorage cache 建立失敗：", error);
    }
}

async function preload() {
    const data = await readAll();
    if (data && typeof data === "object" && Object.keys(data).length) {
        saveV42Cache(data);
        console.log("明月證券 v4.2.1：外掛資料已預載入");
        return data;
    }
    console.log("明月證券 v4.2.1：沒有外部資料，交由 v4.2 fallback");
    return data;
}

window.MingyueDataPlugin = Object.freeze({
    version: "4.2.1",
    paths: Object.freeze([...PATHS]),
    read,
    write,
    writeMany,
    readAll,
    preload,
    isReady: true
});

window.MingyueDataAdapter = window.MingyueDataPlugin;

preload().catch(error => console.warn("明月證券 v4.2.1 Adapter preload 失敗：", error));

console.log("明月證券 v4.2.1 Plugin Data Adapter 已載入");
