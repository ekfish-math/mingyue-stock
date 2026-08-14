/* =========================================================
   明月證券 v4.4
   上市公司狀態 Firebase 即時同步
   ========================================================= */

import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig={apiKey:"AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",authDomain:"mingyue-stock.firebaseapp.com",databaseURL:"https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"mingyue-stock",storageBucket:"mingyue-stock.firebasestorage.app",messagingSenderId:"774198660845",appId:"1:774198660845:web:93f4a725b6303aae9f86e4",measurementId:"G-Z7F6N0ZJYJ"};
const app=getApps().length?getApps()[0]:initializeApp(firebaseConfig);
const db=getDatabase(app);
const CACHE_KEY="mingyue_companies_v42";
let firstSnapshot=true;

function normalize(value){
    if(Array.isArray(value)) return value.filter(Boolean);
    if(value&&typeof value==="object") return Object.values(value).filter(Boolean);
    return [];
}

function saveCache(companies){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(companies));return true}
    catch(e){console.warn("公司狀態快取寫入失敗",e);return false}
}

function signature(value){
    return JSON.stringify(normalize(value).map(c=>({
        id:c?.id,code:c?.code,listed:c?.listed,ipoStatus:c?.ipoStatus,status:c?.status,listedAt:c?.listedAt
    })).sort((a,b)=>String(a.code||a.id).localeCompare(String(b.code||b.id))));
}

onValue(ref(db,"companies"),snapshot=>{
    const remote=normalize(snapshot.val());
    const previous=localStorage.getItem(CACHE_KEY)||"";
    const next=JSON.stringify(remote);
    saveCache(remote);

    if(firstSnapshot){
        firstSnapshot=false;
        return;
    }

    const oldParsed=(()=>{try{return JSON.parse(previous||"[]")}catch(_){return[]}})();
    if(signature(oldParsed)===signature(remote)) return;

    console.log("Firebase 公司上市狀態已更新，重新載入公司資料");

    if(!sessionStorage.getItem("mingyue_company_status_reload")){
        sessionStorage.setItem("mingyue_company_status_reload","1");
        setTimeout(()=>window.location.reload(),300);
    }
});

window.addEventListener("load",()=>{
    setTimeout(()=>sessionStorage.removeItem("mingyue_company_status_reload"),1200);
});

console.log("明月證券 v4.4 公司上市狀態同步模組已載入");
