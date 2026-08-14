/* =========================================================
   明月證券 v4.2 市場同步橋接
   ---------------------------------------------------------
   目的：
   1. 相容 Firebase companies/stocks 的 object 與 array 格式
   2. 所有已上市公司自動擁有一支對應股票
   3. 後台建立／設定價格的股票會進入前台行情
   4. 同步成 script.js 可以直接使用的 array 格式
   5. 不重複建立股票
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getDatabase,
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const config = {
    apiKey: "AIzaSyDWDaEZoZPwBe7wZX0aiDAGqs4b_EAkfgM",
    authDomain: "mingyue-stock.firebaseapp.com",
    databaseURL: "https://mingyue-stock-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mingyue-stock",
    storageBucket: "mingyue-stock.firebasestorage.app",
    messagingSenderId: "774198660845",
    appId: "1:774198660845:web:93f4a725b6303aae9f86e4"
};

const app = initializeApp(config, "market-sync-bridge");
const db = getDatabase(app);

const STOCK_KEY = "mingyue_stocks_v42";
const COMPANY_KEY = "mingyue_companies_v42";

function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value || typeof value !== "object") return [];
    return Object.entries(value).map(([key, item]) => {
        if (!item || typeof item !== "object") return null;
        return {
            ...item,
            id: item.id || item.code || key,
            code: item.code || item.id || key
        };
    }).filter(Boolean);
}

function makeStock(company, existing) {
    const code = String(company.code || company.id || "").trim().toUpperCase();
    if (!code) return null;

    const capital = Number(company.capital || 0);
    const shares = Math.max(
        1000000,
        Math.floor((capital > 0 ? capital : 10000000) / 10)
    );

    const fallbackPrice = Number(
        ((capital > 0 ? capital : 10000000) / shares).toFixed(2)
    );

    const currentPrice = Number(
        existing?.price ?? company.price ?? fallbackPrice
    );

    return {
        ...(existing || {}),
        id: code,
        code,
        name: existing?.name || company.shortName || company.name || code,
        company: company.name || existing?.company || code,
        companyCode: code,
        companyId: company.id || existing?.companyId || code,
        industry: company.industry || existing?.industry || "其他",
        type: existing?.type || "上市公司",
        price: Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : fallbackPrice,
        previous: Number(existing?.previous ?? currentPrice ?? fallbackPrice),
        volume: Number(existing?.volume || 0),
        capital: capital || Number(existing?.capital || 0),
        shares: Number(existing?.shares || shares),
        listed: true
    };
}

async function syncListedStocks() {
    try {
        const snapshot = await get(ref(db));
        const data = snapshot.exists() ? snapshot.val() || {} : {};

        const companies = asArray(data.companies);
        const currentStocks = asArray(data.stocks);
        const byCode = new Map(
            currentStocks
                .filter(stock => stock.id || stock.code)
                .map(stock => [
                    String(stock.id || stock.code).toUpperCase(),
                    stock
                ])
        );

        let stocks = [...currentStocks];
        let changed = false;

        for (const company of companies) {
            const listed =
                company.listed === true ||
                company.ipoStatus === "已上市" ||
                company.status === "上市公司";

            if (!listed) continue;

            const code = String(
                company.code || company.id || ""
            ).trim().toUpperCase();

            if (!code) continue;

            const existing = byCode.get(code);
            const stock = makeStock(company, existing);

            if (!stock) continue;

            if (!existing) {
                stocks.push(stock);
                byCode.set(code, stock);
                changed = true;
            } else {
                const index = stocks.findIndex(
                    item => String(item.id || item.code).toUpperCase() === code
                );
                if (index >= 0) {
                    stocks[index] = stock;
                    changed = true;
                }
            }
        }

        localStorage.setItem(STOCK_KEY, JSON.stringify(stocks));
        localStorage.setItem(COMPANY_KEY, JSON.stringify(companies));

        if (changed || !Array.isArray(data.stocks)) {
            await update(ref(db), {
                stocks
            });
        }

        console.log(
            `明月證券市場同步完成：${companies.filter(c => c.listed === true || c.ipoStatus === "已上市" || c.status === "上市公司").length} 家上市公司 / ${stocks.length} 支股票`
        );
    } catch (error) {
        console.error("市場股票同步失敗：", error);
    }
}

await syncListedStocks();
