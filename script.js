/* =========================================================
   明月證券 v4.0
   Mingyue Securities
   ---------------------------------------------------------
   Firebase + 股票交易 + 公司 + IPO + 新聞 + K線 + 折線圖
   ========================================================= */


/* =========================================================
   1. Firebase
   ========================================================= */

import {
    initializeApp
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    onValue
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


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


const firebaseApp =
    initializeApp(firebaseConfig);


const db =
    getDatabase(firebaseApp);


console.log(
    "Firebase Realtime Database 已連線"
);


/* =========================================================
   2. 系統
   ========================================================= */

const SYSTEM_VERSION =
    "4.0";


/* =========================================================
   3. 預設股票
   ========================================================= */

const DEFAULT_STOCKS = [

    {
        id: "MTR",
        name: "明月鐵路",
        company: "明月鐵路",
        industry: "交通",
        type: "既有企業",

        price: 142.70,
        previous: 140.76,

        volume: 24580,

        capital: 120000000,
        shares: 10000000
    },

    {
        id: "KMB",
        name: "國立京城大學附設生醫",
        company: "國立京城大學附設生醫股份有限公司",
        industry: "醫療",
        type: "大學附設企業",

        price: 86.40,
        previous: 85.12,

        volume: 8320,

        capital: 60000000,
        shares: 6000000
    },

    {
        id: "HZI",
        name: "鎬子餐飲",
        company: "鎬子餐飲股份有限公司",
        industry: "餐飲",
        type: "民營企業",

        price: 52.80,
        previous: 53.46,

        volume: 11540,

        capital: 35000000,
        shares: 3500000
    },

    {
        id: "USF",
        name: "國營上杉林業",
        company: "國營上杉林業股份有限公司",
        industry: "農林",
        type: "國營企業",

        price: 73.60,
        previous: 72.82,

        volume: 6240,

        capital: 80000000,
        shares: 8000000
    }

];


/* =========================================================
   4. 預設公司
   ========================================================= */

const DEFAULT_COMPANIES = [

    {
        id: "MTR-COMPANY",

        name:
            "明月鐵路",

        shortName:
            "明月鐵路",

        code:
            "MTR",

        industry:
            "交通",

        capital:
            120000000,

        owner:
            "GOV-MINGYUE",

        ownerName:
            "明月帝國政府",

        status:
            "國營企業",

        listed:
            true,

        ipoStatus:
            "已上市",

        createdAt:
            "2026/01/01",

        official:
            true
    },

    {
        id:
            "KMB-COMPANY",

        name:
            "國立京城大學附設生醫股份有限公司",

        shortName:
            "國立京城大學附設生醫",

        code:
            "KMB",

        industry:
            "醫療",

        capital:
            60000000,

        owner:
            "NCKU-MED",

        ownerName:
            "國立京城大學",

        status:
            "大學附設企業",

        listed:
            true,

        ipoStatus:
            "已上市",

        createdAt:
            "2026/01/01",

        official:
            true
    },

    {
        id:
            "HZI-COMPANY",

        name:
            "鎬子餐飲股份有限公司",

        shortName:
            "鎬子餐飲",

        code:
            "HZI",

        industry:
            "餐飲",

        capital:
            35000000,

        owner:
            "HZI-OWNER",

        ownerName:
            "鎬子餐飲經營者",

        status:
            "民營企業",

        listed:
            true,

        ipoStatus:
            "已上市",

        createdAt:
            "2026/01/01",

        official:
            true
    },

    {
        id:
            "USF-COMPANY",

        name:
            "國營上杉林業股份有限公司",

        shortName:
            "國營上杉林業",

        code:
            "USF",

        industry:
            "農林",

        capital:
            80000000,

        owner:
            "GOV-MINGYUE",

        ownerName:
            "明月帝國政府",

        status:
            "國營企業",

        listed:
            true,

        ipoStatus:
            "已上市",

        createdAt:
            "2026/01/01",

        official:
            true
    }

];


/* =========================================================
   5. LocalStorage
   ========================================================= */

function loadData(
    key,
    fallback
) {

    try {

        const raw =
            localStorage.getItem(key);

        if (!raw) {

            return fallback;

        }

        return JSON.parse(raw);

    }

    catch (error) {

        console.warn(
            "LocalStorage 讀取失敗：",
            key,
            error
        );

        return fallback;

    }

}


function saveData(
    key,
    value
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

    catch (error) {

        console.error(
            "LocalStorage 儲存失敗：",
            key,
            error
        );

    }

}


/* =========================================================
   6. 使用者
   ========================================================= */

let user =
    loadData(
        "mingyue_user_v4",
        {
            name:
                "Fisher",

            accountId:
                "MYS-000184",

            balance:
                1000000,

            wallet:
                500000
        }
    );


if (
    !user ||
    typeof user !== "object"
) {

    user = {

        name:
            "Fisher",

        accountId:
            "MYS-000184",

        balance:
            1000000,

        wallet:
            500000

    };

}


/* =========================================================
   7. 股票
   ========================================================= */

let stocks =
    loadData(
        "mingyue_stocks_v4",
        DEFAULT_STOCKS
    );


if (!Array.isArray(stocks)) {

    stocks =
        [...DEFAULT_STOCKS];

}


/* =========================================================
   8. 持股
   ========================================================= */

let portfolio =
    loadData(
        "mingyue_portfolio_v4",
        {}
    );


if (
    !portfolio ||
    typeof portfolio !== "object" ||
    Array.isArray(portfolio)
) {

    portfolio = {};

}


/* =========================================================
   9. 交易
   ========================================================= */

let transactions =
    loadData(
        "mingyue_transactions_v4",
        []
    );


if (!Array.isArray(transactions)) {

    transactions = [];

}


/* =========================================================
   10. 公司
   ========================================================= */

let companies =
    loadData(
        "mingyue_companies_v4",
        []
    );


if (!Array.isArray(companies)) {

    companies = [];

}


DEFAULT_COMPANIES.forEach(
    defaultCompany => {

        const exists =
            companies.some(
                company =>
                    company.code ===
                    defaultCompany.code
            );

        if (!exists) {

            companies.push(
                {
                    ...defaultCompany
                }
            );

        }

    }
);


/* =========================================================
   11. 新聞
   ========================================================= */

let news =
    loadData(
        "mingyue_news_v4",
        [
            {
                id:
                    1,

                companyCode:
                    "MTR",

                companyName:
                    "明月鐵路",

                category:
                    "company",

                title:
                    "明月鐵路今日維持正常營運",

                content:
                    "明月鐵路今日各主要路線維持正常營運。",

                time:
                    "2026/08/13 08:00"
            },

            {
                id:
                    2,

                companyCode:
                    "KMB",

                companyName:
                    "國立京城大學附設生醫",

                category:
                    "company",

                title:
                    "附設生醫公布最新研究進度",

                content:
                    "國立京城大學附設生醫股份有限公司公布最新研究計畫進度。",

                time:
                    "2026/08/13 07:40"
            },

            {
                id:
                    3,

                companyCode:
                    "HZI",

                companyName:
                    "鎬子餐飲",

                category:
                    "company",

                title:
                    "鎬子餐飲公布新門市計畫",

                content:
                    "鎬子餐飲股份有限公司宣布規劃新的餐飲據點。",

                time:
                    "2026/08/12 18:20"
            }
        ]
    );


if (!Array.isArray(news)) {

    news = [];

}


/* =========================================================
   12. 歷史資料
   ========================================================= */

let historyData =
    loadData(
        "mingyue_history_v4",
        {}
    );


if (
    !historyData ||
    typeof historyData !== "object" ||
    Array.isArray(historyData)
) {

    historyData = {};

}


/* =========================================================
   13. 狀態
   ========================================================= */

let currentPage =
    "home";


let currentStockId =
    null;


let currentChartType =
    "line";


let marketFilter =
    "all";


let newsFilter =
    "all";


let toastTimer =
    null;


/* =========================================================
   14. 基本工具
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


function money(
    value
) {

    const number =
        Number(value || 0);

    return (
        "¥" +
        number.toLocaleString(
            "zh-TW",
            {
                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2
            }
        )
    );

}


function formatDate(
    date
) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return (
        year +
        "/" +
        month +
        "/" +
        day
    );

}


function formatDateTime(
    date
) {

    return (
        formatDate(date) +
        " " +
        date.toLocaleTimeString(
            "zh-TW",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }
        )
    );

}


function isTradingDay(
    date
) {

    const day =
        date.getDay();

    return (
        day !== 0 &&
        day !== 6
    );

}


/* =========================================================
   15. 漲跌
   ========================================================= */

function getChange(
    stock
) {

    const price =
        Number(stock.price);

    const previous =
        Number(stock.previous);

    if (
        !Number.isFinite(price) ||
        !Number.isFinite(previous) ||
        previous === 0
    ) {

        return 0;

    }

    return (
        (
            price -
            previous
        ) /
        previous
    ) *
    100;

}


function changeText(
    stock
) {

    const change =
        getChange(stock);

    if (change >= 0) {

        return (
            "▲ +" +
            change.toFixed(2) +
            "%"
        );

    }

    return (
        "▼ " +
        change.toFixed(2) +
        "%"
    );

}


/* =========================================================
   16. 歷史資料
   ========================================================= */

function generateHistory(
    stock
) {

    if (
        Array.isArray(
            historyData[stock.id]
        ) &&
        historyData[stock.id].length >= 30
    ) {

        return;

    }

    const result =
        [];

    let date =
        new Date();

    date.setDate(
        date.getDate() - 55
    );

    let current =
        Number(stock.price) *
        (
            0.92 +
            Math.random() * 0.06
        );

    while (
        result.length < 30
    ) {

        if (!isTradingDay(date)) {

            date.setDate(
                date.getDate() + 1
            );

            continue;

        }

        const open =
            current;

        const movement =
            (
                Math.random() -
                0.5
            ) *
            0.045;

        const close =
            Math.max(
                1,
                open *
                (
                    1 +
                    movement
                )
            );

        const high =
            Math.max(
                open,
                close
            ) *
            (
                1 +
                Math.random() * 0.012
            );

        const low =
            Math.min(
                open,
                close
            ) *
            (
                1 -
                Math.random() * 0.012
            );

        result.push({

            date:
                formatDate(date),

            open:
                Number(
                    open.toFixed(2)
                ),

            high:
                Number(
                    high.toFixed(2)
                ),

            low:
                Number(
                    low.toFixed(2)
                ),

            close:
                Number(
                    close.toFixed(2)
                ),

            volume:
                Math.floor(
                    5000 +
                    Math.random() * 20000
                )

        });

        current =
            close;

        date.setDate(
            date.getDate() + 1
        );

    }

    const last =
        result[
            result.length - 1
        ];

    if (last) {

        last.close =
            Number(stock.price);

        last.high =
            Math.max(
                last.open,
                last.close
            );

        last.low =
            Math.min(
                last.open,
                last.close
            );

    }

    historyData[stock.id] =
        result;

}


/* =========================================================
   17. 儲存
   ========================================================= */

function saveAll() {

    saveData(
        "mingyue_user_v4",
        user
    );

    saveData(
        "mingyue_stocks_v4",
        stocks
    );

    saveData(
        "mingyue_portfolio_v4",
        portfolio
    );

    saveData(
        "mingyue_transactions_v4",
        transactions
    );

    saveData(
        "mingyue_companies_v4",
        companies
    );

    saveData(
        "mingyue_news_v4",
        news
    );

    saveData(
        "mingyue_history_v4",
        historyData
    );

}


/* =========================================================
   18. Firebase 同步
   ========================================================= */

async function saveFirebase(
    path,
    value
) {

    try {

        await set(
            ref(
                db,
                path
            ),
            value
        );

    }

    catch (error) {

        console.error(
            "Firebase 儲存失敗：",
            path,
            error
        );

    }

}


async function loadFirebase(
    path
) {

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    path
                )
            );

        if (
            snapshot.exists()
        ) {

            return snapshot.val();

        }

    }

    catch (error) {

        console.error(
            "Firebase 讀取失敗：",
            path,
            error
        );

    }

    return null;

}


/* =========================================================
   19. Toast
   ========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {

        alert(message);

        return;

    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   20. 頁面
   ========================================================= */

function showPage(
    page
) {

    const target =
        document.getElementById(
            "page-" + page
        );

    if (!target) {

        console.warn(
            "找不到頁面：",
            page
        );

        return;

    }

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "active"
                );

            }
        );

    target.classList.add(
        "active"
    );

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );

            }
        );

    currentPage =
        page;

    if (
        page === "home"
    ) {

        renderHome();

    }

    else if (
        page === "market"
    ) {

        renderMarket();

    }

    else if (
        page === "portfolio"
    ) {

        renderPortfolio();

    }

    else if (
        page === "news"
    ) {

        renderNews();

    }

    else if (
        page === "profile"
    ) {

        renderProfile();

    }

    else if (
        page === "company"
    ) {

        renderCompanies();

    }

    else if (
        page === "stock"
    ) {

        if (currentStockId) {

            const stock =
                stocks.find(
                    item =>
                        item.id ===
                        currentStockId
                );

            if (stock) {

                renderStockDetail(
                    stock
                );

            }

        }

    }

}


/* =========================================================
   21. 首頁
   ========================================================= */

function renderHome() {

    updateTopBalance();

    updateHomeAssets();

    updateStats();

    updateIndex();

    renderHotStocks();

}


/* =========================================================
   22. 餘額
   ========================================================= */

function updateTopBalance() {

    const element =
        document.getElementById(
            "top-balance"
        );

    if (element) {

        element.textContent =
            money(
                user.balance
            );

    }

}


function updateHomeAssets() {

    const balance =
        document.getElementById(
            "home-balance"
        );

    const wallet =
        document.getElementById(
            "home-wallet"
        );

    const depositWallet =
        document.getElementById(
            "deposit-wallet"
        );

    if (balance) {

        balance.textContent =
            money(
                user.balance
            );

    }

    if (wallet) {

        wallet.textContent =
            money(
                user.wallet
            );

    }

    if (depositWallet) {

        depositWallet.textContent =
            money(
                user.wallet
            );

    }

}


/* =========================================================
   23. 市場統計
   ========================================================= */

function updateStats() {

    let up =
        0;

    let down =
        0;

    let volume =
        0;

    stocks.forEach(
        stock => {

            const change =
                getChange(stock);

            if (
                change > 0
            ) {

                up++;

            }

            else if (
                change < 0
            ) {

                down++;

            }

            volume +=
                Number(
                    stock.volume || 0
                );

        }
    );

    const companiesElement =
        document.getElementById(
            "stat-companies"
        );

    const upElement =
        document.getElementById(
            "stat-up"
        );

    const downElement =
        document.getElementById(
            "stat-down"
        );

    const volumeElement =
        document.getElementById(
            "stat-volume"
        );

    if (
        companiesElement
    ) {

        companiesElement.textContent =
            stocks.length;

    }

    if (
        upElement
    ) {

        upElement.textContent =
            up;

    }

    if (
        downElement
    ) {

        downElement.textContent =
            down;

    }

    if (
        volumeElement
    ) {

        volumeElement.textContent =
            volume.toLocaleString(
                "zh-TW"
            );

    }

}


/* =========================================================
   24. 綜合指數
   ========================================================= */

function updateIndex() {

    if (
        stocks.length === 0
    ) {

        return;

    }

    let totalNow =
        0;

    let totalPrevious =
        0;

    stocks.forEach(
        stock => {

            totalNow +=
                Number(
                    stock.price
                );

            totalPrevious +=
                Number(
                    stock.previous
                );

        }
    );

    const index =
        10000 +
        totalNow * 50;

    const previousIndex =
        10000 +
        totalPrevious * 50;

    const change =
        previousIndex === 0
            ? 0
            :
                (
                    (
                        index -
                        previousIndex
                    ) /
                    previousIndex
                ) *
                100;

    const valueElement =
        document.getElementById(
            "index-value"
        );

    const changeElement =
        document.getElementById(
            "index-change"
        );

    if (
        valueElement
    ) {

        valueElement.textContent =
            index.toLocaleString(
                "zh-TW",
                {
                    minimumFractionDigits:
                        2,

                    maximumFractionDigits:
                        2
                }
            );

    }

    if (
        changeElement
    ) {

        changeElement.textContent =
            change >= 0
                ? "▲ +" +
                  change.toFixed(2) +
                  "%"

                : "▼ " +
                  change.toFixed(2) +
                  "%";

    }

}


/* =========================================================
   25. 熱門股票
   ========================================================= */

function renderHotStocks() {

    const container =
        document.getElementById(
            "home-hot-stocks"
        );

    if (!container) {

        return;

    }

    const list =
        [...stocks]
            .sort(
                (
                    a,
                    b
                ) =>
                    Math.abs(
                        getChange(b)
                    ) -
                    Math.abs(
                        getChange(a)
                    )
            )
            .slice(
                0,
                4
            );

    container.innerHTML =
        list
            .map(
                stock => `

                    <button
                        class="stock-card"
                        onclick="openStock('${escapeHTML(stock.id)}')"
                        type="button"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    stock.name
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    stock.id
                                )}
                                ·
                                ${escapeHTML(
                                    stock.industry
                                )}
                            </small>

                        </div>

                        <div>

                            <strong>
                                ${money(
                                    stock.price
                                )}
                            </strong>

                            <small>
                                ${changeText(
                                    stock
                                )}
                            </small>

                        </div>

                    </button>

                `
            )
            .join("");

}


/* =========================================================
   26. 行情
   ========================================================= */

function filterMarket(
    filter,
    button
) {

    marketFilter =
        filter;

    document
        .querySelectorAll(
            ".market-tab"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );

    if (button) {

        button.classList.add(
            "active"
        );

    }

    renderMarket();

}


function renderMarket() {

    const container =
        document.getElementById(
            "market-list"
        );

    if (!container) {

        return;

    }

    let list =
        [...stocks];

    if (
        marketFilter ===
        "up"
    ) {

        list =
            list.filter(
                stock =>
                    getChange(stock) > 0
            );

    }

    else if (
        marketFilter ===
        "down"
    ) {

        list =
            list.filter(
                stock =>
                    getChange(stock) < 0
            );

    }

    if (
        list.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                目前沒有符合條件的股票
            </div>

        `;

        return;

    }

    container.innerHTML =
        list
            .map(
                stock => `

                    <button
                        class="market-row"
                        onclick="openStock('${escapeHTML(stock.id)}')"
                        type="button"
                    >

                        <div>

                            <strong>
                                ${escapeHTML(
                                    stock.name
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    stock.id
                                )}
                                ·
                                ${escapeHTML(
                                    stock.industry
                                )}
                            </small>

                        </div>

                        <div>

                            <strong>
                                ${money(
                                    stock.price
                                )}
                            </strong>

                            <small>
                                ${changeText(
                                    stock
                                )}
                            </small>

                        </div>

                        <div>

                            ${Number(
                                stock.volume || 0
                            ).toLocaleString(
                                "zh-TW"
                            )}

                        </div>

                    </button>

                `
            )
            .join("");

}


/* =========================================================
   27. 股票詳細
   ========================================================= */

function openStock(
    id
) {

    const stock =
        stocks.find(
            item =>
                item.id === id
        );

    if (!stock) {

        showToast(
            "找不到這支股票"
        );

        return;

    }

    currentStockId =
        id;

    showPage(
        "stock"
    );

}


/* =========================================================
   28. 最新資料
   ========================================================= */

function getLatest(
    stock
) {

    const data =
        historyData[
            stock.id
        ];

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        return {

            date:
                formatDate(
                    new Date()
                ),

            open:
                stock.price,

            high:
                stock.price,

            low:
                stock.price,

            close:
                stock.price,

            volume:
                stock.volume || 0

        };

    }

    return data[
        data.length - 1
    ];

}


/* =========================================================
   29. 股票詳細頁
   ========================================================= */

function renderStockDetail(
    stock
) {

    const detail =
        document.getElementById(
            "stock-detail"
        );

    if (!detail) {

        return;

    }

    const latest =
        getLatest(stock);

    detail.innerHTML = `

        <div class="stock-detail-header">

            <div>

                <h2>
                    ${escapeHTML(
                        stock.company
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        stock.id
                    )}
                    ·
                    ${escapeHTML(
                        stock.industry
                    )}
                </p>

            </div>

            <div>

                <strong>
                    ${money(
                        stock.price
                    )}
                </strong>

                <span>
                    ${changeText(
                        stock
                    )}
                </span>

            </div>

        </div>


        <div class="stock-stat-grid">

            <div>
                <span>日期</span>
                <strong>
                    ${escapeHTML(
                        latest.date
                    )}
                </strong>
            </div>

            <div>
                <span>開盤</span>
                <strong>
                    ${money(
                        latest.open
                    )}
                </strong>
            </div>

            <div>
                <span>最高</span>
                <strong>
                    ${money(
                        latest.high
                    )}
                </strong>
            </div>

            <div>
                <span>最低</span>
                <strong>
                    ${money(
                        latest.low
                    )}
                </strong>
            </div>

            <div>
                <span>收盤</span>
                <strong>
                    ${money(
                        latest.close
                    )}
                </strong>
            </div>

            <div>
                <span>成交量</span>
                <strong>
                    ${Number(
                        latest.volume || 0
                    ).toLocaleString(
                        "zh-TW"
                    )}
                </strong>
            </div>

        </div>


        <h3>
            ${escapeHTML(
                stock.name
            )}
            股價走勢
        </h3>


        <div class="chart-tabs">

            <button
                type="button"
                class="${
                    currentChartType === "line"
                        ? "active"
                        : ""
                }"
                onclick="switchChart('line')"
            >
                折線圖
            </button>

            <button
                type="button"
                class="${
                    currentChartType === "candle"
                        ? "active"
                        : ""
                }"
                onclick="switchChart('candle')"
            >
                K線圖
            </button>

        </div>


        <div
            class="chart-container"
            id="chart-container"
        >

            <canvas
                id="stock-line-chart"
                class="stock-chart-canvas"
            ></canvas>

            <canvas
                id="stock-candle-chart"
                class="stock-chart-canvas"
            ></canvas>

        </div>


        <div class="stock-actions">

            <button
                type="button"
                class="trade-button buy-button"
                data-action="buy"
                data-stock="${escapeHTML(
                    stock.id
                )}"
            >
                買入
            </button>

            <button
                type="button"
                class="trade-button sell-button"
                data-action="sell"
                data-stock="${escapeHTML(
                    stock.id
                )}"
            >
                賣出
            </button>

        </div>

    `;


    updateChartCanvasVisibility();


    detail
        .querySelectorAll(
            ".trade-button"
        )
        .forEach(
            button => {

                button.style.touchAction =
                    "manipulation";

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        const id =
                            button.dataset.stock;

                        const action =
                            button.dataset.action;

                        if (
                            action === "buy"
                        ) {

                            buyStock(id);

                        }

                        else if (
                            action === "sell"
                        ) {

                            sellStock(id);

                        }

                    }
                );

            }
        );


    requestAnimationFrame(
        () => {

            drawChart(
                stock
            );

        }
    );

}


/* =========================================================
   30. 圖表切換
   ========================================================= */

function switchChart(
    type
) {

    if (
        type !== "line" &&
        type !== "candle"
    ) {

        return;

    }

    currentChartType =
        type;

    if (!currentStockId) {

        return;

    }

    const stock =
        stocks.find(
            item =>
                item.id ===
                currentStockId
        );

    if (!stock) {

        return;

    }

    updateChartCanvasVisibility();

    requestAnimationFrame(
        () => {

            drawChart(
                stock
            );

        }
    );

}


/* =========================================================
   31. 圖表 Canvas 顯示狀態
   ========================================================= */

function updateChartCanvasVisibility() {

    const lineCanvas =
        document.getElementById(
            "stock-line-chart"
        );

    const candleCanvas =
        document.getElementById(
            "stock-candle-chart"
        );

    if (
        !lineCanvas ||
        !candleCanvas
    ) {

        return;

    }

    const lineVisible =
        currentChartType ===
        "line";

    lineCanvas.style.display =
        lineVisible
            ? "block"
            : "none";

    candleCanvas.style.display =
        lineVisible
            ? "none"
            : "block";

}


/* =========================================================
   32. 圖表尺寸
   ========================================================= */

function setupCanvas(
    canvas,
    width,
    height
) {

    if (!canvas) {

        return null;

    }

    const dpr =
        window.devicePixelRatio || 1;

    canvas.width =
        Math.floor(
            width * dpr
        );

    canvas.height =
        Math.floor(
            height * dpr
        );

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

    const ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) {

        return null;

    }

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    return ctx;

}


/* =========================================================
   33. 圖表座標
   ========================================================= */

function getChartLayout(
    width,
    height
) {

    const left =
        width < 500
            ? 62
            : 76;

    const right =
        width < 500
            ? 18
            : 24;

    const top =
        20;

    const bottom =
        width < 500
            ? 52
            : 48;

    const chartWidth =
        Math.max(
            1,
            width -
            left -
            right
        );

    const chartHeight =
        Math.max(
            1,
            height -
            top -
            bottom
        );

    return {

        left,
        right,
        top,
        bottom,

        chartWidth,
        chartHeight

    };

}


/* =========================================================
   34. 價格範圍
   ========================================================= */

function getPriceRange(
    data
) {

    const prices =
        [];

    data.forEach(
        item => {

            const high =
                Number(
                    item.high
                );

            const low =
                Number(
                    item.low
                );

            if (
                Number.isFinite(
                    high
                )
            ) {

                prices.push(
                    high
                );

            }

            if (
                Number.isFinite(
                    low
                )
            ) {

                prices.push(
                    low
                );

            }

        }
    );

    if (
        prices.length === 0
    ) {

        return {

            min:
                0,

            max:
                100

        };

    }

    let max =
        Math.max(
            ...prices
        );

    let min =
        Math.min(
            ...prices
        );

    let range =
        max - min;

    if (
        !Number.isFinite(
            range
        ) ||
        range <= 0
    ) {

        range =
            Math.max(
                1,
                Math.abs(max) * 0.05
            );

    }

    const padding =
        range * 0.10;

    min -=
        padding;

    max +=
        padding;

    return {

        min,
        max

    };

}


/* =========================================================
   35. Y 軸
   ========================================================= */

function drawYAxis(
    ctx,
    layout,
    width,
    height,
    range
) {

    const {
        left,
        right,
        top,
        chartHeight
    } =
        layout;

    ctx.strokeStyle =
        "rgba(120,120,120,0.16)";

    ctx.lineWidth =
        1;

    ctx.fillStyle =
        "#777";

    ctx.font =
        "11px sans-serif";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";

    for (
        let i = 0;
        i <= 5;
        i++
    ) {

        const ratio =
            i / 5;

        const y =
            top +
            chartHeight *
            ratio;

        ctx.beginPath();

        ctx.moveTo(
            left,
            y
        );

        ctx.lineTo(
            width - right,
            y
        );

        ctx.stroke();

        const price =
            range.max -
            (
                range.max -
                range.min
            ) *
            ratio;

        ctx.fillText(
            "¥" +
            price.toFixed(2),
            left - 8,
            y
        );

    }

    ctx.strokeStyle =
        "rgba(80,80,80,0.45)";

    ctx.beginPath();

    ctx.moveTo(
        left,
        top
    );

    ctx.lineTo(
        left,
        top + chartHeight
    );

    ctx.stroke();

}


/* =========================================================
   36. X 軸
   ========================================================= */

function drawXAxis(
    ctx,
    layout,
    width,
    height,
    data,
    getX
) {

    const {
        left,
        right,
        top,
        chartHeight
    } =
        layout;

    const axisY =
        top +
        chartHeight;

    ctx.strokeStyle =
        "rgba(80,80,80,0.45)";

    ctx.beginPath();

    ctx.moveTo(
        left,
        axisY
    );

    ctx.lineTo(
        width - right,
        axisY
    );

    ctx.stroke();

    ctx.fillStyle =
        "#777";

    ctx.font =
        "10px sans-serif";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "top";

    const count =
        Math.min(
            6,
            data.length
        );

    if (
        count <= 0
    ) {

        return;

    }

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const index =
            count === 1
                ? 0
                :
                    Math.round(
                        i *
                        (
                            data.length - 1
                        ) /
                        (
                            count - 1
                        )
                    );

        const x =
            getX(index);

        ctx.strokeStyle =
            "rgba(80,80,80,0.35)";

        ctx.beginPath();

        ctx.moveTo(
            x,
            axisY
        );

        ctx.lineTo(
            x,
            axisY + 5
        );

        ctx.stroke();

        ctx.fillStyle =
            "#777";

        ctx.fillText(
            data[index].date,
            x,
            axisY + 8
        );

    }

}


/* =========================================================
   37. 折線圖
   ========================================================= */

function drawLineChart(
    ctx,
    width,
    height,
    data
) {

    const layout =
        getChartLayout(
            width,
            height
        );

    const range =
        getPriceRange(
            data
        );

    const {
        left,
        chartWidth,
        chartHeight
    } =
        layout;

    function priceToY(
        price
    ) {

        return (
            layout.top +
            (
                range.max -
                Number(price)
            ) /
            (
                range.max -
                range.min
            ) *
            chartHeight
        );

    }

    drawYAxis(
        ctx,
        layout,
        width,
        height,
        range
    );

    const getX =
        index => {

            if (
                data.length <= 1
            ) {

                return (
                    left +
                    chartWidth / 2
                );

            }

            return (
                left +
                chartWidth *
                index /
                (
                    data.length - 1
                )
            );

        };

    ctx.beginPath();

    data.forEach(
        (
            item,
            index
        ) => {

            const x =
                getX(index);

            const y =
                priceToY(
                    item.close
                );

            if (
                index === 0
            ) {

                ctx.moveTo(
                    x,
                    y
                );

            }

            else {

                ctx.lineTo(
                    x,
                    y
                );

            }

        }
    );

    ctx.strokeStyle =
        "#2563eb";

    ctx.lineWidth =
        2.5;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.stroke();

    const lastIndex =
        data.length - 1;

    const last =
        data[lastIndex];

    const lastX =
        getX(
            lastIndex
        );

    const lastY =
        priceToY(
            last.close
        );

    ctx.beginPath();

    ctx.arc(
        lastX,
        lastY,
        4,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#2563eb";

    ctx.fill();

    ctx.font =
        "11px sans-serif";

    ctx.textAlign =
        "left";

    ctx.textBaseline =
        "middle";

    ctx.fillStyle =
        "#2563eb";

    const labelX =
        Math.min(
            lastX + 8,
            width - 58
        );

    ctx.fillText(
        "¥" +
        Number(
            last.close
        ).toFixed(2),
        labelX,
        lastY
    );

    drawXAxis(
        ctx,
        layout,
        width,
        height,
        data,
        getX
    );

}


/* =========================================================
   38. K線圖
   ========================================================= */

function drawCandlestickChart(
    ctx,
    width,
    height,
    data
) {

    const layout =
        getChartLayout(
            width,
            height
        );

    const range =
        getPriceRange(
            data
        );

    const {
        left,
        chartWidth,
        chartHeight
    } =
        layout;

    function priceToY(
        price
    ) {

        return (
            layout.top +
            (
                range.max -
                Number(price)
            ) /
            (
                range.max -
                range.min
            ) *
            chartHeight
        );

    }

    drawYAxis(
        ctx,
        layout,
        width,
        height,
        range
    );

    const getX =
        index => {

            if (
                data.length <= 1
            ) {

                return (
                    left +
                    chartWidth / 2
                );

            }

            return (
                left +
                chartWidth *
                index /
                (
                    data.length - 1
                )
            );

        };

    const spacing =
        data.length <= 1
            ? chartWidth
            :
                chartWidth /
                (
                    data.length - 1
                );

    const candleWidth =
        Math.max(
            3,
            Math.min(
                width < 500
                    ? 10
                    : 14,
                spacing * 0.55
            )
        );

    data.forEach(
        (
            item,
            index
        ) => {

            const x =
                getX(index);

            const open =
                Number(
                    item.open
                );

            const close =
                Number(
                    item.close
                );

            const high =
                Number(
                    item.high
                );

            const low =
                Number(
                    item.low
                );

            if (
                !Number.isFinite(open) ||
                !Number.isFinite(close) ||
                !Number.isFinite(high) ||
                !Number.isFinite(low)
            ) {

                return;

            }

            const openY =
                priceToY(
                    open
                );

            const closeY =
                priceToY(
                    close
                );

            const highY =
                priceToY(
                    high
                );

            const lowY =
                priceToY(
                    low
                );

            const rising =
                close >= open;

            const color =
                rising
                    ? "#ef4444"
                    : "#22c55e";

            ctx.strokeStyle =
                color;

            ctx.fillStyle =
                color;

            ctx.lineWidth =
                1;

            ctx.beginPath();

            ctx.moveTo(
                x,
                highY
            );

            ctx.lineTo(
                x,
                lowY
            );

            ctx.stroke();

            const bodyTop =
                Math.min(
                    openY,
                    closeY
                );

            const bodyBottom =
                Math.max(
                    openY,
                    closeY
                );

            const bodyHeight =
                Math.max(
                    1,
                    bodyBottom -
                    bodyTop
                );

            ctx.fillRect(
                x -
                candleWidth / 2,

                bodyTop,

                candleWidth,

                bodyHeight
            );

        }
    );

    drawXAxis(
        ctx,
        layout,
        width,
        height,
        data,
        getX
    );

}


/* =========================================================
   39. 圖表主程式
   ========================================================= */

function drawChart(
    stock
) {

    const container =
        document.getElementById(
            "chart-container"
        );

    if (!container) {

        return;

    }

    const data =
        historyData[
            stock.id
        ];

    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        return;

    }

    const lineCanvas =
        document.getElementById(
            "stock-line-chart"
        );

    const candleCanvas =
        document.getElementById(
            "stock-candle-chart"
        );

    if (
        !lineCanvas ||
        !candleCanvas
    ) {

        return;

    }

    updateChartCanvasVisibility();

    const rect =
        container.getBoundingClientRect();

    const width =
        Math.max(
            280,
            Math.floor(
                rect.width
            )
        );

    const height =
        Math.max(
            320,
            Math.floor(
                container.clientHeight ||
                320
            )
        );

    const lineCtx =
        setupCanvas(
            lineCanvas,
            width,
            height
        );

    const candleCtx =
        setupCanvas(
            candleCanvas,
            width,
            height
        );

    if (
        currentChartType ===
        "line"
    ) {

        if (!lineCtx) {

            return;

        }

        drawLineChart(
            lineCtx,
            width,
            height,
            data
        );

    }

    else {

        if (!candleCtx) {

            return;

        }

        drawCandlestickChart(
            candleCtx,
            width,
            height,
            data
        );

    }

}


/* =========================================================
   40. 買入
   ========================================================= */

function buyStock(
    id
) {

    const stock =
        stocks.find(
            item =>
                item.id === id
        );

    if (!stock) {

        showToast(
            "找不到股票"
        );

        return;

    }

    const input =
        prompt(
            `目前股價 ${money(
                stock.price
            )}

請輸入購買股數：`
        );

    if (
        input === null
    ) {

        return;

    }

    const shares =
        Number(
            input
        );

    if (
        !Number.isInteger(
            shares
        ) ||
        shares <= 0
    ) {

        showToast(
            "請輸入有效股數"
        );

        return;

    }

    const cost =
        shares *
        Number(
            stock.price
        );

    if (
        cost >
        Number(
            user.balance
        )
    ) {

        showToast(
            "證券餘額不足"
        );

        return;

    }

    if (
        !portfolio[id]
    ) {

        portfolio[id] = {

            shares:
                0,

            average:
                0

        };

    }

    const oldShares =
        Number(
            portfolio[id].shares
        );

    const oldAverage =
        Number(
            portfolio[id].average
        );

    portfolio[id].shares =
        oldShares +
        shares;

    portfolio[id].average =
        (
            oldShares *
            oldAverage +
            cost
        ) /
        portfolio[id].shares;

    user.balance -=
        cost;

    transactions.unshift({

        id:
            Date.now(),

        type:
            "買入",

        code:
            id,

        shares:
            shares,

        price:
            stock.price,

        amount:
            cost,

        time:
            formatDateTime(
                new Date()
            )

    });

    saveAll();

    showToast(
        `已買入 ${shares.toLocaleString()} 股 ${id}`
    );

    updateAllVisible();

}


/* =========================================================
   41. 賣出
   ========================================================= */

function sellStock(
    id
) {

    const stock =
        stocks.find(
            item =>
                item.id === id
        );

    if (!stock) {

        return;

    }

    if (
        !portfolio[id]
    ) {

        showToast(
            "你目前沒有持有這支股票"
        );

        return;

    }

    const owned =
        Number(
            portfolio[id].shares
        );

    const input =
        prompt(
            `目前持有 ${owned.toLocaleString()} 股

請輸入賣出股數：`
        );

    if (
        input === null
    ) {

        return;

    }

    const shares =
        Number(
            input
        );

    if (
        !Number.isInteger(
            shares
        ) ||
        shares <= 0
    ) {

        showToast(
            "請輸入有效股數"
        );

        return;

    }

    if (
        shares >
        owned
    ) {

        showToast(
            "持股不足"
        );

        return;

    }

    const revenue =
        shares *
        Number(
            stock.price
        );

    user.balance +=
        revenue;

    portfolio[id].shares -=
        shares;

    if (
        portfolio[id].shares <= 0
    ) {

        delete portfolio[id];

    }

    transactions.unshift({

        id:
            Date.now(),

        type:
            "賣出",

        code:
            id,

        shares:
            shares,

        price:
            stock.price,

        amount:
            revenue,

        time:
            formatDateTime(
                new Date()
            )

    });

    saveAll();

    showToast(
        `已賣出 ${shares.toLocaleString()} 股 ${id}`
    );

    updateAllVisible();

}


/* =========================================================
   42. 投資頁
   ========================================================= */

function renderPortfolio() {

    const balance =
        document.getElementById(
            "portfolio-balance"
        );

    if (balance) {

        balance.textContent =
            money(
                user.balance
            );

    }

    const list =
        document.getElementById(
            "portfolio-list"
        );

    if (!list) {

        return;

    }

    const entries =
        Object.entries(
            portfolio
        );

    if (
        entries.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-state">
                目前沒有持股
            </div>

        `;

        renderTransactions();

        return;

    }

    list.innerHTML =
        entries
            .map(
                (
                    [id, data]
                ) => {

                    const stock =
                        stocks.find(
                            item =>
                                item.id === id
                        );

                    if (!stock) {

                        return "";

                    }

                    const shares =
                        Number(
                            data.shares
                        );

                    const average =
                        Number(
                            data.average
                        );

                    const value =
                        shares *
                        Number(
                            stock.price
                        );

                    const profit =
                        (
                            Number(
                                stock.price
                            ) -
                            average
                        ) *
                        shares;

                    return `

                        <div class="portfolio-row">

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        stock.name
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        id
                                    )}
                                    ·
                                    ${shares.toLocaleString()}
                                    股
                                </small>

                            </div>

                            <div>

                                <strong>
                                    ${money(
                                        value
                                    )}
                                </strong>

                                <small>
                                    損益
                                    ${money(
                                        profit
                                    )}
                                </small>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

    renderTransactions();

}


/* =========================================================
   43. 交易紀錄
   ========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "transaction-list"
        );

    if (!container) {

        return;

    }

    if (
        transactions.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                尚無交易紀錄
            </div>

        `;

        return;

    }

    container.innerHTML =
        transactions
            .slice(
                0,
                30
            )
            .map(
                transaction => `

                    <div class="transaction-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    transaction.type
                                )}
                                ${escapeHTML(
                                    transaction.code
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    transaction.time
                                )}
                            </small>

                        </div>

                        <div>

                            <strong>
                                ${Number(
                                    transaction.shares
                                ).toLocaleString()}
                                股
                            </strong>

                            <small>
                                ${money(
                                    transaction.amount
                                )}
                            </small>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   44. Modal
   ========================================================= */

function closeModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   45. 儲值 Modal
   ========================================================= */

function openDepositModal() {

    const modal =
        document.getElementById(
            "deposit-modal"
        );

    if (!modal) {

        showToast(
            "找不到儲值視窗"
        );

        return;

    }

    updateHomeAssets();

    modal.classList.add(
        "show"
    );

}


function confirmDeposit() {

    const input =
        prompt(
            "請輸入儲值金額："
        );

    if (
        input === null
    ) {

        return;

    }

    const amount =
        Number(
            input
        );

    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        showToast(
            "請輸入有效金額"
        );

        return;

    }

    user.wallet +=
        amount;

    saveAll();

    closeModal(
        "deposit-modal"
    );

    updateAllVisible();

    showToast(
        `儲值成功：${money(amount)}`
    );

}


/* =========================================================
   46. Google Demo
   ========================================================= */

function googleLogin() {

    showToast(
        "Google OAuth 將在正式後端版本接入"
    );

}


/* =========================================================
   47. 公司註冊
   ========================================================= */

const COMPANY_REGISTRATION_FEE =
    10000;


function openCompanyModal() {

    const modal =
        document.getElementById(
            "company-modal"
        );

    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function registerCompany() {

    const nameInput =
        document.getElementById(
            "company-name"
        );

    const shortInput =
        document.getElementById(
            "company-short"
        );

    const codeInput =
        document.getElementById(
            "company-code"
        );

    const industryInput =
        document.getElementById(
            "company-industry"
        );

    const capitalInput =
        document.getElementById(
            "company-capital"
        );

    if (
        !nameInput ||
        !shortInput ||
        !codeInput ||
        !industryInput ||
        !capitalInput
    ) {

        showToast(
            "公司註冊表單不存在"
        );

        return;

    }

    const name =
        nameInput.value.trim();

    const shortName =
        shortInput.value.trim();

    const code =
        codeInput.value
            .trim()
            .toUpperCase();

    const industry =
        industryInput.value;

    const capital =
        Number(
            capitalInput.value
        );

    if (
        !name ||
        !shortName ||
        !code ||
        !Number.isFinite(
            capital
        ) ||
        capital <= 0
    ) {

        showToast(
            "請完整填寫公司資料"
        );

        return;

    }

    if (
        !/^[A-Z0-9]{2,6}$/.test(
            code
        )
    ) {

        showToast(
            "公司代號必須為 2～6 位英數字"
        );

        return;

    }

    if (
        companies.some(
            company =>
                company.name === name
        )
    ) {

        showToast(
            "公司名稱已經存在"
        );

        return;

    }

    if (
        companies.some(
            company =>
                company.code === code
        ) ||
        stocks.some(
            stock =>
                stock.id === code
        )
    ) {

        showToast(
            "公司代號已經存在"
        );

        return;

    }

    if (
        Number(
            user.wallet
        ) <
        COMPANY_REGISTRATION_FEE
    ) {

        showToast(
            `遊戲錢包不足，需要 ${money(
                COMPANY_REGISTRATION_FEE
            )}`
        );

        return;

    }

    const company = {

        id:
            Date.now(),

        name:
            name,

        shortName:
            shortName,

        code:
            code,

        industry:
            industry,

        capital:
            capital,

        owner:
            user.accountId,

        ownerName:
            user.name,

        status:
            "私人公司",

        listed:
            false,

        ipoStatus:
            "未申請",

        createdAt:
            formatDate(
                new Date()
            ),

        registrationFee:
            COMPANY_REGISTRATION_FEE

    };

    user.wallet -=
        COMPANY_REGISTRATION_FEE;

    companies.push(
        company
    );

    saveAll();

    nameInput.value =
        "";

    shortInput.value =
        "";

    codeInput.value =
        "";

    capitalInput.value =
        "";

    closeModal(
        "company-modal"
    );

    showToast(
        `公司「${name}」註冊成功`
    );

    renderCompanies();

}


/* =========================================================
   48. 我的公司
   ========================================================= */

function openMyCompany() {

    showPage(
        "company"
    );

}


/* =========================================================
   49. 公司列表
   ========================================================= */

function renderCompanies() {

    const container =
        document.getElementById(
            "company-page"
        );

    if (!container) {

        return;

    }

    const mine =
        companies.filter(
            company =>
                company.owner ===
                user.accountId
        );

    if (
        mine.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <h2>
                    🏢 我的公司
                </h2>

                <p>
                    你目前還沒有註冊公司。
                </p>

                <button
                    class="primary-button"
                    onclick="openCompanyModal()"
                    type="button"
                >
                    註冊公司
                </button>

            </div>

        `;

        return;

    }

    container.innerHTML =
        mine
            .map(
                company => {

                    const listedText =
                        company.listed
                            ? "上市"
                            : "未上市";

                    const ipoText =
                        company.ipoStatus ||
                        "未申請";

                    return `

                        <div class="company-card">

                            <span class="company-status">
                                ${escapeHTML(
                                    company.status
                                )}
                            </span>

                            <h2>
                                ${escapeHTML(
                                    company.name
                                )}
                            </h2>

                            <p>
                                ${escapeHTML(
                                    company.code
                                )}
                                ·
                                ${escapeHTML(
                                    company.industry
                                )}
                            </p>

                            <div class="company-info-grid">

                                <div>

                                    <small>
                                        註冊資本
                                    </small>

                                    <strong>
                                        ${money(
                                            company.capital
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <small>
                                        公司狀態
                                    </small>

                                    <strong>
                                        ${listedText}
                                    </strong>

                                </div>

                                <div>

                                    <small>
                                        IPO 狀態
                                    </small>

                                    <strong>
                                        ${escapeHTML(
                                            ipoText
                                        )}
                                    </strong>

                                </div>

                                <div>

                                    <small>
                                        成立日期
                                    </small>

                                    <strong>
                                        ${escapeHTML(
                                            company.createdAt
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <div class="company-actions">

                                <button
                                    type="button"
                                    onclick="publishCompanyNews('${escapeHTML(company.code)}')"
                                >
                                    📰 發布新聞
                                </button>

                                ${
                                    company.listed

                                        ? `

                                            <button
                                                type="button"
                                                onclick="showToast('這家公司已經上市')"
                                            >
                                                📈 已上市
                                            </button>

                                        `

                                        : `

                                            <button
                                                type="button"
                                                onclick="applyIPO('${escapeHTML(company.code)}')"
                                            >
                                                📈 IPO / 上市
                                            </button>

                                        `
                                }

                                <button
                                    type="button"
                                    onclick="showToast('股東系統將在下一版本加入')"
                                >
                                    👥 股東
                                </button>

                                <button
                                    type="button"
                                    onclick="showToast('公司財務系統將在下一版本加入')"
                                >
                                    💰 財務
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   50. IPO
   ========================================================= */

function applyIPO(
    code
) {

    const company =
        companies.find(
            item =>
                item.code === code &&
                item.owner ===
                    user.accountId
        );

    if (!company) {

        showToast(
            "找不到這家公司"
        );

        return;

    }

    if (
        company.listed
    ) {

        showToast(
            "這家公司已經上市"
        );

        return;

    }

    if (
        company.ipoStatus ===
        "審核中"
    ) {

        showToast(
            "IPO 已經在審核中"
        );

        return;

    }

    if (
        Number(
            company.capital
        ) <
        10000000
    ) {

        showToast(
            "註冊資本不足 ¥10,000,000"
        );

        return;

    }

    const confirmed =
        confirm(
            `確定要申請「${company.name}」IPO 嗎？

股票代號：${company.code}
註冊資本：${money(company.capital)}

送出後將進入上市審核。`
        );

    if (!confirmed) {

        return;

    }

    company.ipoStatus =
        "審核中";

    company.ipoAppliedAt =
        formatDateTime(
            new Date()
        );

    saveAll();

    showToast(
        "IPO 申請已送出，目前等待審核"
    );

    renderCompanies();

}


/* =========================================================
   51. IPO 審核
   ========================================================= */

function approveIPO(
    code
) {

    const company =
        companies.find(
            item =>
                item.code === code
        );

    if (!company) {

        return;

    }

    if (
        company.ipoStatus !==
        "審核中"
    ) {

        showToast(
            "這間公司目前沒有 IPO 審核"
        );

        return;

    }

    company.ipoStatus =
        "已上市";

    company.listed =
        true;

    company.status =
        "上市公司";

    company.listedAt =
        formatDateTime(
            new Date()
        );

    const exists =
        stocks.some(
            stock =>
                stock.id ===
                company.code
        );

    if (!exists) {

        const shares =
            Math.max(
                1000000,
                Math.floor(
                    Number(
                        company.capital
                    ) / 10
                )
            );

        const initialPrice =
            Number(
                (
                    Number(
                        company.capital
                    ) /
                    shares
                ).toFixed(2)
            );

        const stock = {

            id:
                company.code,

            name:
                company.shortName,

            company:
                company.name,

            industry:
                company.industry,

            type:
                "上市公司",

            price:
                initialPrice,

            previous:
                initialPrice,

            volume:
                0,

            capital:
                Number(
                    company.capital
                ),

            shares:
                shares

        };

        stocks.push(
            stock
        );

        generateHistory(
            stock
        );

    }

    saveAll();

    showToast(
        `🎉 ${company.shortName} 已正式上市`
    );

    renderCompanies();

}


/* =========================================================
   52. 公司新聞
   ========================================================= */

function publishCompanyNews(
    code
) {

    const company =
        companies.find(
            item =>
                item.code === code
        );

    if (!company) {

        showToast(
            "找不到這間公司"
        );

        return;

    }

    if (
        company.owner !==
        user.accountId
    ) {

        showToast(
            "你不是這間公司的管理者"
        );

        return;

    }

    const title =
        prompt(
            `【${company.shortName}】

請輸入新聞標題：`
        );

    if (
        !title ||
        !title.trim()
    ) {

        return;

    }

    const content =
        prompt(
            `【${company.shortName}】

請輸入新聞內容：`
        );

    if (
        !content ||
        !content.trim()
    ) {

        return;

    }

    news.unshift({

        id:
            Date.now(),

        companyCode:
            company.code,

        companyName:
            company.shortName,

        companyFullName:
            company.name,

        category:
            "company",

        title:
            title.trim(),

        content:
            content.trim(),

        time:
            formatDateTime(
                new Date()
            ),

        author:
            company.shortName,

        authorType:
            "company"

    });

    saveAll();

    renderNews();

    showToast(
        `「${company.shortName}」新聞已發布`
    );

}


/* =========================================================
   53. 新聞篩選
   ========================================================= */

function filterNews(
    filter,
    button
) {

    newsFilter =
        filter;

    document
        .querySelectorAll(
            ".news-tab"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );

    if (button) {

        button.classList.add(
            "active"
        );

    }

    renderNews();

}


/* =========================================================
   54. 新聞
   ========================================================= */

function renderNews() {

    const container =
        document.getElementById(
            "news-list"
        );

    if (!container) {

        return;

    }

    let list =
        [...news];

    if (
        newsFilter !==
        "all"
    ) {

        list =
            list.filter(
                item =>
                    item.category ===
                    newsFilter
            );

    }

    if (
        list.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">
                目前沒有新聞
            </div>

        `;

        return;

    }

    container.innerHTML =
        list
            .map(
                item => `

                    <article
                        class="news-card"
                        onclick="openNews(${Number(item.id)})"
                    >

                        <div class="news-source">

                            ${escapeHTML(
                                item.companyName ||
                                "明月證券"
                            )}

                            ${
                                item.companyCode
                                    ? " · " +
                                      escapeHTML(
                                          item.companyCode
                                      )
                                    : ""
                            }

                        </div>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.content
                            )}
                        </p>

                        <small>
                            ${escapeHTML(
                                item.time
                            )}
                        </small>

                    </article>

                `
            )
            .join("");

}


function openNews(
    id
) {

    const item =
        news.find(
            newsItem =>
                String(
                    newsItem.id
                ) ===
                String(id)
        );

    if (!item) {

        return;

    }

    alert(
        `${item.title}

${item.content}

${item.time}`
    );

}


/* =========================================================
   55. 個人
   ========================================================= */

function renderProfile() {

    const name =
        document.getElementById(
            "profile-name"
        );

    const account =
        document.getElementById(
            "profile-account"
        );

    const avatar =
        document.getElementById(
            "profile-avatar"
        );

    if (name) {

        name.textContent =
            user.name;

    }

    if (account) {

        account.textContent =
            user.accountId;

    }

    if (avatar) {

        avatar.textContent =
            String(
                user.name ||
                "F"
            )
                .charAt(0)
                .toUpperCase();

    }

    updateTopBalance();

}


/* =========================================================
   56. 市場更新
   ========================================================= */

function updateMarket() {

    const now =
        new Date();

    if (
        !isTradingDay(now)
    ) {

        return;

    }

    stocks.forEach(
        stock => {

            const oldPrice =
                Number(
                    stock.price
                );

            const movement =
                (
                    Math.random() -
                    0.5
                ) *
                0.024;

            const newPrice =
                Math.max(
                    1,
                    oldPrice *
                    (
                        1 +
                        movement
                    )
                );

            const high =
                Math.max(
                    oldPrice,
                    newPrice
                ) *
                (
                    1 +
                    Math.random() *
                    0.006
                );

            const low =
                Math.min(
                    oldPrice,
                    newPrice
                ) *
                (
                    1 -
                    Math.random() *
                    0.006
                );

            stock.previous =
                oldPrice;

            stock.price =
                Number(
                    newPrice.toFixed(2)
                );

            stock.volume =
                Number(
                    stock.volume || 0
                ) +
                Math.floor(
                    300 +
                    Math.random() *
                    2500
                );

            if (
                !Array.isArray(
                    historyData[
                        stock.id
                    ]
                )
            ) {

                historyData[
                    stock.id
                ] = [];

            }

            const data =
                historyData[
                    stock.id
                ];

            const today =
                formatDate(
                    now
                );

            let candle =
                data.find(
                    item =>
                        item.date ===
                        today
                );

            if (!candle) {

                candle = {

                    date:
                        today,

                    open:
                        Number(
                            oldPrice.toFixed(2)
                        ),

                    high:
                        Number(
                            high.toFixed(2)
                        ),

                    low:
                        Number(
                            low.toFixed(2)
                        ),

                    close:
                        Number(
                            newPrice.toFixed(2)
                        ),

                    volume:
                        Math.floor(
                            500 +
                            Math.random() *
                            2000
                        )

                };

                data.push(
                    candle
                );

            }

            else {

                candle.high =
                    Math.max(
                        Number(
                            candle.high
                        ),
                        high,
                        newPrice
                    );

                candle.low =
                    Math.min(
                        Number(
                            candle.low
                        ),
                        low,
                        newPrice
                    );

                candle.close =
                    Number(
                        newPrice.toFixed(2)
                    );

                candle.volume +=
                    Math.floor(
                        300 +
                        Math.random() *
                        1500
                    );

            }

            if (
                data.length > 60
            ) {

                data.splice(
                    0,
                    data.length - 60
                );

            }

        }
    );

    saveAll();

    updateAllVisible();

}


/* =========================================================
   57. 更新畫面
   ========================================================= */

function updateAllVisible() {

    updateTopBalance();

    updateHomeAssets();

    updateStats();

    updateIndex();

    if (
        currentPage ===
        "home"
    ) {

        renderHotStocks();

    }

    if (
        currentPage ===
        "market"
    ) {

        renderMarket();

    }

    if (
        currentPage ===
        "portfolio"
    ) {

        renderPortfolio();

    }

    if (
        currentPage ===
        "news"
    ) {

        renderNews();

    }

    if (
        currentPage ===
        "profile"
    ) {

        renderProfile();

    }

    if (
        currentPage ===
        "company"
    ) {

        renderCompanies();

    }

    if (
        currentPage ===
        "stock" &&
        currentStockId
    ) {

        const stock =
            stocks.find(
                item =>
                    item.id ===
                    currentStockId
            );

        if (stock) {

            renderStockDetail(
                stock
            );

        }

    }

}


/* =========================================================
   58. 初始化
   ========================================================= */

function initMingyue() {

    console.log(
        `明月證券 v${SYSTEM_VERSION} 啟動`
    );

    stocks.forEach(
        generateHistory
    );

    saveAll();

    showPage(
        "home"
    );

    renderMarket();

    renderPortfolio();

    renderNews();

    renderProfile();

    updateChartCanvasVisibility();

}


/* =========================================================
   59. Modal 背景關閉
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target &&
            event.target.classList &&
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   60. DOM Ready
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initMingyue
    );

}

else {

    initMingyue();

}


/* =========================================================
   61. 市場自動更新
   ========================================================= */

setInterval(
    updateMarket,
    15000
);


/* =========================================================
   62. 視窗縮放
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            currentPage ===
            "stock" &&
            currentStockId
        ) {

            const stock =
                stocks.find(
                    item =>
                        item.id ===
                        currentStockId
                );

            if (stock) {

                requestAnimationFrame(
                    () => {

                        drawChart(
                            stock
                        );

                    }
                );

            }

        }

    }
);


/* =========================================================
   63. HTML onclick 函式暴露
   ========================================================= */

window.showPage =
    showPage;

window.openStock =
    openStock;

window.switchChart =
    switchChart;

window.filterMarket =
    filterMarket;

window.filterNews =
    filterNews;

window.openNews =
    openNews;

window.buyStock =
    buyStock;

window.sellStock =
    sellStock;

window.closeModal =
    closeModal;

window.openDepositModal =
    openDepositModal;

window.confirmDeposit =
    confirmDeposit;

window.googleLogin =
    googleLogin;

window.openCompanyModal =
    openCompanyModal;

window.registerCompany =
    registerCompany;

window.openMyCompany =
    openMyCompany;

window.applyIPO =
    applyIPO;

window.approveIPO =
    approveIPO;

window.publishCompanyNews =
    publishCompanyNews;

window.showToast =
    showToast;


/* =========================================================
   64. 完成
   ========================================================= */

console.log(
    "明月證券 v4.0 script.js 載入完成"
);
