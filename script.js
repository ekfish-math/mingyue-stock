/* =========================================================
   明月證券 v4.6
   Mingyue Securities
   ---------------------------------------------------------
   Firebase 全同步版
   股票交易 + 公司 + IPO + 新聞 + K線 + 折線圖
   ---------------------------------------------------------
   v4.6
   1. Firebase 正式同步
   2. 使用者證券帳戶同步
   3. 股票、公司、新聞、交易與歷史行情同步
   4. 證券帳戶資金系統，不使用遊戲錢包
   5. 儲值／提領採金融申請制
   6. 儲值／提領由 Firebase Callable Functions 處理
   7. 提領先凍結，必須經金融後台審核
   8. 金融操作寫入 fundTransactions 與 adminAudit
   9. 管理員功能獨立於玩家端金融操作
   10. 保留 IPO、公司新聞、折線圖與 K 線圖
   11. 手機 Canvas 相容
   ---------------------------------------------------------
   注意：玩家端不得直接修改 balance / frozenBalance。
   ========================================================= */


/* =========================================================
   1. Firebase
   ========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


const firebaseConfig = {

    apiKey:
        "AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",

    authDomain:
        "mingyue-stock.firebaseapp.com",

    databaseURL:
        "https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "mingyue-stock",

    storageBucket:
        "mingyue-stock.firebasestorage.app",

    messagingSenderId:
        "774198660845",

    appId:
        "1:774198660845:web:93f4a725b6303aae9f86e4",

    measurementId:
        "G-Z7F6N0ZJYJ"

};
