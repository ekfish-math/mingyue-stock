/* =========================================================
   明月證券 v4.4
   上市公司新增股票 + Firebase 即時同步
   ---------------------------------------------------------
   不覆蓋 v4.2 script.js
   透過 plugin-adapter 載入
   ========================================================= */

import {
    getApps,
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
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


const app =
    getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig);

const db =
    getDatabase(app);


const STOCK_CACHE = "mingyue_stocks_v42";
const COMPANY_CACHE = "mingyue_companies_v42";


function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const value = JSON.parse(raw);
        return value ?? fallback;
    } catch (error) {
        console.warn("股票同步讀取快取失敗", key, error);
        return fallback;
    }
}


function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error("股票同步寫入快取失敗", key, error);
        return false;
    }
}


function normalizeStocks(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value && typeof value === "object") {
        return Object.values(value).filter(Boolean);
    }
    return [];
}


function getCompanies() {
    const companies = readJSON(COMPANY_CACHE, []);
    return Array.isArray(companies) ? companies : [];
}


function getStocks() {
    return normalizeStocks(
        readJSON(STOCK_CACHE, [])
    );
}


function isListed(company) {
    return Boolean(
        company &&
        (
            company.listed === true ||
            company.ipoStatus === "已上市" ||
            company.status === "上市公司"
        )
    );
}


function currentAccountId() {
    try {
        const user =
            readJSON("mingyue_user_v42", null);

        return String(
            user?.accountId ||
            localStorage.getItem("mingyue_active_account_id") ||
            ""
        );
    } catch (_) {
        return "";
    }
}


async function saveListedStock(stock) {

    const stocks = getStocks();

    const exists =
        stocks.some(
            item => item.id === stock.id
        );

    if (exists) {
        throw new Error(
            `股票代號 ${stock.id} 已存在`
        );
    }

    stocks.push(stock);

    writeJSON(
        STOCK_CACHE,
        stocks
    );

    await set(
        ref(db, `stocks/${stock.id}`),
        stock
    );

    return stock;
}


async function addCompanyStock(companyCode) {

    const companies = getCompanies();

    const company =
        companies.find(
            item =>
                String(item.code).toUpperCase() ===
                String(companyCode).toUpperCase()
        );

    if (!company) {
        alert("找不到這間公司");
        return;
    }

    if (!isListed(company)) {
        alert("只有上市公司可以新增股票");
        return;
    }

    const accountId = currentAccountId();

    if (
        company.owner &&
        accountId &&
        String(company.owner) !== accountId
    ) {
        alert("你不是這間公司的管理者");
        return;
    }

    const codeInput =
        prompt(
            `【${company.shortName || company.name}】\n\n請輸入新股票代號：`
        );

    if (!codeInput) return;

    const code =
        codeInput
            .trim()
            .toUpperCase();

    if (!/^[A-Z0-9]{1,8}$/.test(code)) {
        alert("股票代號只能使用 1～8 個英數字");
        return;
    }

    if (
        getStocks().some(
            stock =>
                String(stock.id).toUpperCase() === code
        )
    ) {
        alert(`股票代號 ${code} 已存在`);
        return;
    }

    const nameInput =
        prompt(
            "請輸入股票名稱：",
            company.shortName || company.name
        );

    if (!nameInput?.trim()) return;

    const priceInput =
        prompt(
            "請輸入上市價格：",
            "100"
        );

    if (priceInput === null) return;

    const price =
        Number(priceInput);

    if (!Number.isFinite(price) || price <= 0) {
        alert("上市價格必須大於 0");
        return;
    }

    const sharesInput =
        prompt(
            "請輸入發行股數：",
            "1000000"
        );

    if (sharesInput === null) return;

    const shares =
        Number(sharesInput);

    if (!Number.isInteger(shares) || shares <= 0) {
        alert("發行股數必須是正整數");
        return;
    }

    const now =
        new Date().toLocaleString("zh-TW");

    const stock = {
        id: code,
        name: nameInput.trim(),
        company: company.name,
        companyCode: company.code,
        companyId: company.id || `${company.code}-COMPANY`,
        industry: company.industry || "其他",
        type: "上市公司",
        price: Number(price.toFixed(2)),
        previous: Number(price.toFixed(2)),
        volume: 0,
        capital: Number((price * shares).toFixed(2)),
        shares,
        listed: true,
        listedAt: now,
        createdAt: Date.now()
    };

    try {
        await saveListedStock(stock);

        if (typeof window.showToast === "function") {
            window.showToast(
                `📈 ${code} 已新增並寫入 Firebase`
            );
        }

        /*
         * v4.2 的 stocks 是 script.js 內部變數，
         * 外掛無法直接修改，因此重新載入讓 v4.2
         * 從 LocalStorage/Firebase 重新建立行情。
         */
        setTimeout(() => {
            window.location.reload();
        }, 450);

    } catch (error) {
        console.error("新增股票失敗", error);
        alert(
            "新增股票失敗：\n" +
            (error?.message || error)
        );
    }
}


window.addCompanyStock =
    addCompanyStock;

window.MingyueStockSync = Object.freeze({
    version: "4.4",
    addCompanyStock,
    saveListedStock
});


/* =========================================================
   上市公司卡片自動加入「新增股票」按鈕
   ========================================================= */

function extractCompanyCode(card) {

    const buttons =
        card.querySelectorAll("button");

    for (const button of buttons) {
        const onclick =
            button.getAttribute("onclick") || "";

        const match =
            onclick.match(
                /(?:publishCompanyNews|applyIPO|approveIPO)\s*\(\s*['\"]([^'\"]+)['\"]/
            );

        if (match?.[1]) {
            return match[1];
        }
    }

    return null;
}


function injectButtons() {

    const container =
        document.getElementById("company-page");

    if (!container) return;

    const companies = getCompanies();

    container
        .querySelectorAll(":scope > *")
        .forEach(card => {

            if (
                card.querySelector(
                    ".mingyue-add-stock-button"
                )
            ) return;

            const code =
                extractCompanyCode(card);

            if (!code) return;

            const company =
                companies.find(
                    item =>
                        String(item.code).toUpperCase() ===
                        String(code).toUpperCase()
                );

            if (!isListed(company)) return;

            const button =
                document.createElement("button");

            button.type = "button";
            button.className =
                "primary-button mingyue-add-stock-button";
            button.textContent = "📈 新增股票";
            button.style.marginTop = "8px";
            button.addEventListener(
                "click",
                () => addCompanyStock(code)
            );

            const actions =
                card.querySelector(
                    ".company-actions"
                ) || card;

            actions.appendChild(button);
        });
}


function startButtonObserver() {

    const observer =
        new MutationObserver(
            () => injectButtons()
        );

    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );

    injectButtons();
}


/* =========================================================
   Firebase 即時股票同步
   ========================================================= */

function startRealtimeStockSync() {

    onValue(
        ref(db, "stocks"),
        snapshot => {

            const remote =
                normalizeStocks(
                    snapshot.val()
                );

            if (!remote.length) return;

            const local =
                getStocks();

            const localIds =
                new Set(
                    local.map(
                        stock => String(stock.id)
                    )
                );

            let hasNewStock = false;

            remote.forEach(stock => {
                if (
                    stock?.id &&
                    !localIds.has(String(stock.id))
                ) {
                    hasNewStock = true;
                }
            });

            writeJSON(
                STOCK_CACHE,
                remote
            );

            if (hasNewStock) {
                console.log(
                    "Firebase 發現新股票，重新載入行情"
                );

                if (
                    !sessionStorage.getItem(
                        "mingyue_stock_sync_reload"
                    )
                ) {
                    sessionStorage.setItem(
                        "mingyue_stock_sync_reload",
                        "1"
                    );

                    setTimeout(
                        () =>
                            window.location.reload(),
                        500
                    );
                }
            }
        },
        error => {
            console.error(
                "Firebase 股票即時同步失敗",
                error
            );
        }
    );
}


window.addEventListener(
    "load",
    () => {
        sessionStorage.removeItem(
            "mingyue_stock_sync_reload"
        );

        startButtonObserver();
        startRealtimeStockSync();

        console.log(
            "明月證券 v4.4 上市股票同步模組已啟動"
        );
    }
);
