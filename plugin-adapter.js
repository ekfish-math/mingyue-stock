/* =========================================================
   明月證券 v4.3.3
   Plugin Data Adapter - Google UID Account Bridge
   ========================================================= */
import { initializeApp, getApps } from "https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://cdn.jsdelivr.net/npm/firebase@12.19.0/firebase-database.js";

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
const PATHS = ["users","stocks","companies","news","ipo","portfolios","transactions","historyData","authUsers"];
const CACHE_KEYS = { users:"mingyue_user_v43", stocks:"mingyue_stocks_v43", companies:"mingyue_companies_v43", news:"mingyue_news_v43", portfolios:"mingyue_portfolio_v43", transactions:"mingyue_transactions_v43", historyData:"mingyue_history_v43" };
function validKey(key){return PATHS.includes(String(key));}
function getCurrentUid(){return window.MingyueAuth?.user?.uid || localStorage.getItem("mingyue_current_google_uid") || null;}
function getExternalPlugin(){return window.MingyueExternalPlugin||window.mingyueExternalPlugin||window.MingyuePlugin||window.mingyuePlugin||null;}
async function externalRead(key){const p=getExternalPlugin();if(!p)return undefined;try{if(typeof p.read==="function")return await p.read(key);if(typeof p.get==="function")return await p.get(key);if(typeof p.readData==="function")return await p.readData(key);if(typeof p.getData==="function")return await p.getData(key);}catch(e){console.warn("外掛讀取失敗",key,e);}return undefined;}
async function externalWrite(key,value){const p=getExternalPlugin();if(!p)return false;try{if(typeof p.write==="function"){await p.write(key,value);return true;}if(typeof p.set==="function"){await p.set(key,value);return true;}if(typeof p.writeData==="function"){await p.writeData(key,value);return true;}}catch(e){console.warn("外掛寫入失敗",key,e);}return false;}
async function externalReadAll(){const p=getExternalPlugin();if(!p)return undefined;try{if(typeof p.readAll==="function")return await p.readAll();if(typeof p.getAll==="function")return await p.getAll();}catch(e){console.warn("外掛全資料讀取失敗",e);}return undefined;}
async function externalWriteMany(data){const p=getExternalPlugin();if(!p)return false;try{if(typeof p.writeMany==="function"){await p.writeMany(data||{});return true;}}catch(e){console.warn("外掛批次寫入失敗",e);}return false;}
function filterPaths(data){const result={};for(const key of PATHS)if(Object.prototype.hasOwnProperty.call(data||{},key))result[key]=data[key];return result;}
function cacheData(data){try{const uid=getCurrentUid();for(const key of PATHS){if(!Object.prototype.hasOwnProperty.call(data||{},key))continue;const value=data[key],cacheKey=CACHE_KEYS[key];if(!cacheKey)continue;if(["users","portfolios","transactions"].includes(key)){const account=uid?value?.[uid]:null;if(account!==undefined&&account!==null)localStorage.setItem(cacheKey,JSON.stringify(account));}else localStorage.setItem(cacheKey,JSON.stringify(value));}}catch(e){console.warn("LocalStorage fallback 寫入失敗",e);}}
async function read(key){
    const path=String(key);
    const root=path.split("/")[0];
    const allowedNested=/^(users|portfolios|transactions|authUsers)\/[^/]+$/.test(path);
    if(!validKey(path)&&!allowedNested)throw new Error("不允許的資料路徑："+path);
    const external=allowedNested?undefined:await externalRead(path);
    if(external!==undefined&&external!==null)return external;
    try{const s=await get(ref(db,path));return s.exists()?s.val():null;}
    catch(e){console.warn("Firebase 讀取失敗",path,e);return null;}
}
async function write(key,value){if(!validKey(key))throw new Error("不允許的資料路徑："+key);const externalOK=await externalWrite(key,value);try{await set(ref(db,key),value);}catch(e){if(!externalOK)throw e;console.warn("Firebase 鏡像失敗",key,e);}return true;}
async function writeMany(data){const patch=filterPaths(data);if(!Object.keys(patch).length)return [];const externalOK=await externalWriteMany(patch);try{await update(ref(db),patch);}catch(e){if(!externalOK)throw e;console.warn("Firebase 批次鏡像失敗",e);}return Object.keys(patch);}
async function readAll(){const external=await externalReadAll();if(external&&typeof external==="object"&&Object.keys(external).length){cacheData(external);return external;}try{const s=await get(ref(db));const data=s.exists()?s.val():{};cacheData(data);return data;}catch(e){console.warn("Firebase 全資料讀取失敗",e);return {};}}
async function preload(){
    // 不在初始化時讀取 Firebase 根節點，避免觸發最小權限規則。
    const uid = getCurrentUid();
    if (!uid) {
        console.log("明月證券 v4.3.3：等待 Google UID 後再同步帳戶資料");
        return {};
    }
    try {
        const data = {};
        for (const key of ["users","portfolios","transactions","authUsers"]) {
            data[key] = await read(key + "/" + uid);
        }
        cacheData(data);
        console.log("明月證券 v4.3.3：帳戶資料預載入完成");
        return data;
    } catch (e) {
        console.warn("明月證券 v4.3.3：帳戶資料預載入略過", e);
        return {};
    }
}
window.MingyueDataPlugin=Object.freeze({version:"4.3.3",paths:Object.freeze([...PATHS]),read,write,writeMany,readAll,preload,getCurrentUid,isReady:true});
window.MingyueDataAdapter=window.MingyueDataPlugin;
window.MINGYUE_V433=true;
console.log("明月證券 v4.3.3 Plugin Data Adapter 已載入");
await preload();
try{await import("./google-auth.js?v=4.9.3");window.MINGYUE_V43=true;console.log("明月證券 v4.3.3 Google Account 模組已接入");}catch(e){window.MINGYUE_V43=false;console.warn("Google Account 模組載入失敗",e);}
