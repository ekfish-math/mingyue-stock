/* =========================================================
   明月證券 v3.0
   Mingyue Securities
   ---------------------------------------------------------
   市場 / 股票 / K線 / 投資 / 公司 / 新聞 / 個人
   ========================================================= */


/* =========================================================
   1. 系統版本
   ========================================================= */

const SYSTEM_VERSION = "3.0";


/* =========================================================
   2. 預設股票資料
   ---------------------------------------------------------
   注意：
   只有「已上市／已登錄」企業才會放在 stocks。
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
   3. LocalStorage 工具
   ========================================================= */

function loadData(key, fallback) {

    const data = localStorage.getItem(key);

    if (!data) {
        return fallback;
    }

    try {

        return JSON.parse(data);

    } catch (error) {

        console.warn(
            `無法讀取 ${key}`,
            error
        );

        return fallback;

    }

}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


/* =========================================================
   4. 使用者資料
   ========================================================= */

let user = loadData(
    "mingyue_user_v3",
    {

        name: "Fisher",

        accountId: "MYS-000184",

        balance: 1000000,

        wallet: 500000

    }
);


/* =========================================================
   5. 股票資料
   ========================================================= */

let stocks = loadData(
    "mingyue_stocks_v3",
    DEFAULT_STOCKS
);


/* =========================================================
   6. 持股
   ========================================================= */

let portfolio = loadData(
    "mingyue_portfolio_v3",
    {}
);


/* =========================================================
   7. 交易紀錄
   ========================================================= */

let transactions = loadData(
    "mingyue_transactions_v3",
    []
);


/* =========================================================
   8. 公司資料
   ========================================================= */

/* =========================================================
   4. 公司資料
   ========================================================= */

const DEFAULT_COMPANIES = [
    {
        id: "MTR-COMPANY",
        name: "明月鐵路",
        shortName: "明月鐵路",
        code: "MTR",
        industry: "交通",
        capital: 120000000,
        owner: "GOV-MINGYUE",
        ownerName: "明月帝國政府",
        status: "國營企業",
        listed: true,
        createdAt: "2026/01/01",
        official: true
    },

    {
        id: "KMB-COMPANY",
        name: "國立京城大學附設生醫股份有限公司",
        shortName: "國立京城大學附設生醫",
        code: "KMB",
        industry: "醫療",
        capital: 60000000,
        owner: "NCKU-MED",
        ownerName: "國立京城大學",
        status: "大學附設企業",
        listed: true,
        createdAt: "2026/01/01",
        official: true
    },

    {
        id: "HZI-COMPANY",
        name: "鎬子餐飲股份有限公司",
        shortName: "鎬子餐飲",
        code: "HZI",
        industry: "餐飲",
        capital: 35000000,
        owner: "HZI-OWNER",
        ownerName: "鎬子餐飲經營者",
        status: "民營企業",
        listed: true,
        createdAt: "2026/01/01",
        official: true
    },

    {
        id: "USF-COMPANY",
        name: "國營上杉林業股份有限公司",
        shortName: "國營上杉林業",
        code: "USF",
        industry: "農林",
        capital: 80000000,
        owner: "GOV-MINGYUE",
        ownerName: "明月帝國政府",
        status: "國營企業",
        listed: true,
        createdAt: "2026/01/01",
        official: true
    }
];


/*
 * 讀取公司資料
 *
 * 如果以前已經有 Fisher 自己註冊的公司，
 * 會保留下來。
 *
 * 同時自動補入四間既有企業。
 */

let companies = loadData(
    "mingyue_companies_v2",
    []
);


/*
 * 補入既有企業
 */

DEFAULT_COMPANIES.forEach(defaultCompany => {

    const exists = companies.some(
        company =>
            company.code === defaultCompany.code
    );

    if (!exists) {

        companies.push(
            defaultCompany
        );

    }

});


/*
 * 儲存公司資料
 */

saveData(
    "mingyue_companies_v2",
    companies
);
/* =========================================================
   9. 新聞資料
   ========================================================= */

let news = loadData(
    "mingyue_news_v3",
    [

        {
            id: 1,

            companyCode: "MTR",

            companyName: "明月鐵路",

            category: "company",

            title: "明月鐵路今日維持正常營運",

            content:
                "明月鐵路今日各主要路線維持正常營運。",

            time: "2026/08/13 08:00"

        },


        {
            id: 2,

            companyCode: "KMB",

            companyName:
                "國立京城大學附設生醫",

            category: "company",

            title:
                "附設生醫公布最新研究進度",

            content:
                "國立京城大學附設生醫股份有限公司公布最新研究計畫進度。",

            time: "2026/08/13 07:40"

        },


        {
            id: 3,

            companyCode: "HZI",

            companyName:
                "鎬子餐飲",

            category: "company",

            title:
                "鎬子餐飲公布新門市計畫",

            content:
                "鎬子餐飲股份有限公司宣布規劃新的餐飲據點。",

            time: "2026/08/12 18:20"

        }

    ]
);


/* =========================================================
   10. 歷史股價資料
   ========================================================= */

let historyData = loadData(
    "mingyue_history_v3",
    {}
);


/* =========================================================
   11. 日期工具
   ========================================================= */

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}/${month}/${day}`;

}


function formatDateTime(date) {

    const dateText =
        formatDate(date);

    const timeText =
        date.toLocaleTimeString(
            "zh-TW",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    return `${dateText} ${timeText}`;

}


/* =========================================================
   12. 交易日
   ========================================================= */

function isTradingDay(date) {

    const day =
        date.getDay();

    return (
        day !== 0 &&
        day !== 6
    );

}


/* =========================================================
   13. 找上一個交易日
   ========================================================= */

function previousTradingDay(date) {

    const result =
        new Date(date);

    do {

        result.setDate(
            result.getDate() - 1
        );

    } while (
        !isTradingDay(result)
    );

    return result;

}


/* =========================================================
   14. 產生歷史資料
   ========================================================= */

function generateHistory(stock) {

    if (
        historyData[stock.id] &&
        historyData[stock.id].length >= 30
    ) {

        return;

    }


    const result = [];

    const today =
        new Date();

    let date =
        new Date(today);


    date.setDate(
        date.getDate() - 50
    );


    let current =
        stock.price *
        (
            0.90 +
            Math.random() * 0.08
        );


    while (
        result.length < 30
    ) {

        if (
            !isTradingDay(date)
        ) {

            date.setDate(
                date.getDate() + 1
            );

            continue;

        }


        const open =
            current;


        const volatility =
            0.006 +
            Math.random() * 0.025;


        const direction =
            Math.random() > 0.5
                ? 1
                : -1;


        const close =
            Math.max(
                1,
                open +
                open *
                volatility *
                direction
            );


        const high =
            Math.max(
                open,
                close
            ) *
            (
                1 +
                Math.random() * 0.015
            );


        const low =
            Math.min(
                open,
                close
            ) *
            (
                1 -
                Math.random() * 0.015
            );


        const volume =
            Math.floor(
                5000 +
                Math.random() * 25000
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

            volume

        });


        current =
            close;


        date.setDate(
            date.getDate() + 1
        );

    }


    const latest =
        result[
            result.length - 1
        ];


    latest.close =
        stock.price;


    latest.high =
        Math.max(
            latest.open,
            latest.close
        );


    latest.low =
        Math.min(
            latest.open,
            latest.close
        );


    historyData[
        stock.id
    ] = result;

}


stocks.forEach(
    generateHistory
);


saveData(
    "mingyue_history_v3",
    historyData
);


/* =========================================================
   15. 頁面切換
   ========================================================= */

function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            element => {

                element.classList.remove(
                    "active"
                );

            }
        );


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );


                if (
                    item.dataset.page ===
                    page
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );


    if (
        page === "home"
    ) {

        renderHome();

    }


    if (
        page === "market"
    ) {

        renderMarket();

    }


    if (
        page === "portfolio"
    ) {

        renderPortfolio();

    }


    if (
        page === "news"
    ) {

        renderNews();

    }


    if (
        page === "profile"
    ) {

        renderProfile();

    }


    if (
        page === "company"
    ) {

        openMyCompany();

    }

}


/* =========================================================
   16. 金額
   ========================================================= */

function money(value) {

    return (
        "¥" +
        Number(value).toLocaleString(
            "zh-TW",
            {
                maximumFractionDigits: 2
            }
        )
    );

}


/* =========================================================
   17. 股票漲跌
   ========================================================= */

function getChange(stock) {

    if (
        !stock.previous
    ) {

        return 0;

    }


    return (
        (
            stock.price -
            stock.previous
        ) /
        stock.previous
    ) * 100;

}


function changeText(stock) {

    const change =
        getChange(stock);


    const symbol =
        change >= 0
            ? "▲"
            : "▼";


    const sign =
        change >= 0
            ? "+"
            : "";


    return (
        `${symbol} ` +
        `${sign}` +
        `${change.toFixed(2)}%`
    );

}


/* =========================================================
   18. 首頁
   ========================================================= */

function renderHome() {

    if (
        stocks.length === 0
    ) {

        return;

    }


    const marketValue =
        stocks.reduce(
            (sum, stock) =>
                sum +
                stock.price *
                stock.shares,
            0
        );


    const index =
        10000 +
        marketValue /
        100000;


    const indexElement =
        document.getElementById(
            "index-value"
        );


    if (indexElement) {

        indexElement.textContent =
            index.toLocaleString(
                "zh-TW",
                {
                    minimumFractionDigits: 2,

                    maximumFractionDigits: 2
                }
            );

    }


    const assetElement =
        document.getElementById(
            "home-assets"
        );


    if (assetElement) {

        assetElement.textContent =
            money(
                user.balance
            );

    }


    const hot =
        [...stocks]
            .sort(
                (a, b) =>
                    Math.abs(
                        getChange(b)
                    ) -
                    Math.abs(
                        getChange(a)
                    )
            )
            .slice(0, 4);


    const hotElement =
        document.getElementById(
            "home-hot-stocks"
        );


    if (hotElement) {

        hotElement.innerHTML =
            hot.map(
                stock => `

                <div
                    class="stock-card"
                    onclick="openStock('${stock.id}')"
                >

                    <div>

                        <strong>
                            ${stock.name}
                        </strong>

                        <small>
                            ${stock.id}
                            ·
                            ${stock.industry}
                        </small>

                    </div>


                    <div>

                        <strong>
                            ${money(stock.price)}
                        </strong>

                        <small>
                            ${changeText(stock)}
                        </small>

                    </div>

                </div>

                `
            ).join("");

    }


    updateStats();

}


/* =========================================================
   19. 市場統計
   ========================================================= */

function updateStats() {

    let up = 0;

    let down = 0;

    let volume = 0;


    stocks.forEach(
        stock => {

            if (
                stock.price >
                stock.previous
            ) {

                up++;

            }

            else if (
                stock.price <
                stock.previous
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


    if (companiesElement) {

        companiesElement.textContent =
            stocks.length;

    }


    const upElement =
        document.getElementById(
            "stat-up"
        );


    if (upElement) {

        upElement.textContent =
            up;

    }


    const downElement =
        document.getElementById(
            "stat-down"
        );


    if (downElement) {

        downElement.textContent =
            down;

    }


    const volumeElement =
        document.getElementById(
            "stat-volume"
        );


    if (volumeElement) {

        volumeElement.textContent =
            volume.toLocaleString();

    }

}


/* =========================================================
   20. 行情
   ========================================================= */

let marketFilter =
    "all";


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
            element =>
                element.classList.remove(
                    "active"
                )
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    renderMarket();

}


function renderMarket() {

    let list =
        [...stocks];


    if (
        marketFilter === "up"
    ) {

        list =
            list.filter(
                stock =>
                    getChange(stock) > 0
            );

    }


    if (
        marketFilter === "down"
    ) {

        list =
            list.filter(
                stock =>
                    getChange(stock) < 0
            );

    }


    const container =
        document.getElementById(
            "market-list"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        list.map(
            stock => `

            <div
                class="market-row"
                onclick="openStock('${stock.id}')"
            >

                <div>

                    <strong>
                        ${stock.name}
                    </strong>

                    <small>
                        ${stock.id}
                        ·
                        ${stock.industry}
                    </small>

                </div>


                <div>

                    <strong>
                        ${money(stock.price)}
                    </strong>

                    <small>
                        ${changeText(stock)}
                    </small>

                </div>


                <div>

                    ${Number(
                        stock.volume
                    ).toLocaleString()}

                </div>

            </div>

            `
        ).join("");

}


/* =========================================================
   21. 股票詳細
   ========================================================= */

let currentStockId =
    null;


let currentChart =
    null;


let currentChartType =
    "line";


function openStock(id) {

    currentStockId =
        id;


    const stock =
        stocks.find(
            item =>
                item.id === id
        );


    if (!stock) {

        return;

    }


    showPage(
        "stock"
    );


    renderStockDetail(
        stock
    );

}


function getLatest(stock) {

    const data =
        historyData[
            stock.id
        ];


    if (
        !data ||
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
                stock.volume

        };

    }


    return data[
        data.length - 1
    ];

}


function renderStockDetail(stock) {

    const latest =
        getLatest(stock);


    const detail =
        document.getElementById(
            "stock-detail"
        );


    if (!detail) {

        return;

    }


    detail.innerHTML = `

        <div class="stock-detail-header">

            <div>

                <h2>
                    ${stock.company}
                </h2>

                <p>
                    ${stock.id}
                    ·
                    ${stock.industry}
                </p>

            </div>


            <div>

                <strong>
                    ${money(stock.price)}
                </strong>

                <span>
                    ${changeText(stock)}
                </span>

            </div>

        </div>


        <div class="stock-stat-grid">

            <div>

                <span>
                    日期
                </span>

                <strong>
                    ${latest.date}
                </strong>

            </div>


            <div>

                <span>
                    開盤
                </span>

                <strong>
                    ${money(latest.open)}
                </strong>

            </div>


            <div>

                <span>
                    最高
                </span>

                <strong>
                    ${money(latest.high)}
                </strong>

            </div>


            <div>

                <span>
                    最低
                </span>

                <strong>
                    ${money(latest.low)}
                </strong>

            </div>


            <div>

                <span>
                    收盤
                </span>

                <strong>
                    ${money(latest.close)}
                </strong>

            </div>


            <div>

                <span>
                    成交量
                </span>

                <strong>
                    ${Number(
                        latest.volume
                    ).toLocaleString()}
                </strong>

            </div>

        </div>


        <h3>
            ${stock.name}
            股價走勢
        </h3>


        <div class="chart-tabs">

            <button
                onclick="switchChart('line')"
                class="${
                    currentChartType === "line"
                        ? "active"
                        : ""
                }"
            >
                折線圖
            </button>


            <button
                onclick="switchChart('candle')"
                class="${
                    currentChartType === "candle"
                        ? "active"
                        : ""
                }"
            >
                K線圖
            </button>

        </div>


        <div class="chart-container">

            <canvas
                id="stock-chart"
            ></canvas>

        </div>


        <div class="stock-actions">

            <button
                onclick="buyStock('${stock.id}')"
            >
                買入
            </button>


            <button
                onclick="sellStock('${stock.id}')"
            >
                賣出
            </button>

        </div>

    `;


    drawChart(
        stock
    );

}


/* =========================================================
   22. 圖表切換
   ========================================================= */

function switchChart(type) {

    currentChartType =
        type;


    const stock =
        stocks.find(
            item =>
                item.id ===
                currentStockId
        );


    if (!stock) {

        return;

    }


    renderStockDetail(
        stock
    );

}


/* =========================================================
   23. 圖表
   ========================================================= */

function drawChart(stock) {

    if (currentChart) {

        currentChart.destroy();

        currentChart =
            null;

    }


    const canvas =
        document.getElementById(
            "stock-chart"
        );


    if (!canvas) {

        return;

    }


    const data =
        historyData[
            stock.id
        ];


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    if (
        currentChartType ===
        "line"
    ) {

        const labels =
            data.map(
                item =>
                    item.date
            );


        currentChart =
            new Chart(
                canvas,
                {

                    type: "line",

                    data: {

                        labels,

                        datasets: [

                            {

                                label:
                                    stock.id,

                                data:
                                    data.map(
                                        item =>
                                            item.close
                                    ),

                                borderWidth: 2,

                                pointRadius: 0,

                                tension: 0.25

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {

                                display:
                                    false

                            }

                        },

                        scales: {

                            x: {

                                ticks: {

                                    maxTicksLimit:
                                        8

                                },

                                grid: {

                                    display:
                                        false

                                }

                            }

                        }

                    }

                }
            );


        return;

    }


    drawCandlestick(
        canvas,
        data
    );

}


/* =========================================================
   24. K線
   ========================================================= */

function drawCandlestick(
    canvas,
    data
) {

    const ctx =
        canvas.getContext(
            "2d"
        );


    const rect =
        canvas.getBoundingClientRect();


    if (
        rect.width <= 0 ||
        rect.height <= 0
    ) {

        return;

    }


    const ratio =
        window.devicePixelRatio ||
        1;


    canvas.width =
        rect.width *
        ratio;


    canvas.height =
        rect.height *
        ratio;


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    const width =
        rect.width;


    const height =
        rect.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const prices =
        data.flatMap(
            item => [
                item.high,
                item.low
            ]
        );


    const maxPrice =
        Math.max(
            ...prices
        );


    const minPrice =
        Math.min(
            ...prices
        );


    const padding =
        35;


    const chartHeight =
        height -
        padding * 2;


    function y(price) {

        return (
            padding +
            (
                maxPrice -
                price
            ) /
            (
                maxPrice -
                minPrice ||
                1
            ) *
            chartHeight
        );

    }


    ctx.beginPath();


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const gy =
            padding +
            chartHeight *
            i /
            4;


        ctx.moveTo(
            0,
            gy
        );


        ctx.lineTo(
            width,
            gy
        );

    }


    ctx.strokeStyle =
        "rgba(128,128,128,0.15)";


    ctx.stroke();


    const spacing =
        width /
        data.length;


    const candleWidth =
        Math.max(
            3,
            spacing * 0.55
        );


    data.forEach(
        (item, index) => {

            const x =
                spacing *
                index +
                spacing / 2;


            const openY =
                y(item.open);


            const closeY =
                y(item.close);


            const highY =
                y(item.high);


            const lowY =
                y(item.low);


            const rising =
                item.close >=
                item.open;


            ctx.strokeStyle =
                rising
                    ? "#ef4444"
                    : "#22c55e";


            ctx.fillStyle =
                rising
                    ? "#ef4444"
                    : "#22c55e";


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


            const bodyHeight =
                Math.max(
                    1,
                    Math.abs(
                        closeY -
                        openY
                    )
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


    ctx.fillStyle =
        "#666";


    ctx.font =
        "12px sans-serif";


    for (
        let i = 0;
        i <= 4;
        i++
    ) {

        const price =
            maxPrice -
            (
                maxPrice -
                minPrice
            ) *
            i /
            4;


        const py =
            padding +
            chartHeight *
            i /
            4;


        ctx.fillText(
            price.toFixed(2),
            5,
            py - 4
        );

    }

}


/* =========================================================
   25. 買入
   ========================================================= */

function buyStock(id) {

    const stock =
        stocks.find(
            item =>
                item.id === id
        );


    if (!stock) {

        return;

    }


    const amount =
        prompt(
            `目前股價 ${money(stock.price)}

請輸入購買股數：`
        );


    const shares =
        Number(amount);


    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {

        showToast(
            "請輸入有效股數"
        );

        return;

    }


    const cost =
        shares *
        stock.price;


    if (
        cost >
        user.balance
    ) {

        showToast(
            "證券餘額不足"
        );

        return;

    }


    user.balance -=
        cost;


    if (!portfolio[id]) {

        portfolio[id] = {

            shares: 0,

            average: 0

        };

    }


    const oldShares =
        portfolio[id].shares;


    const oldAverage =
        portfolio[id].average;


    portfolio[id].shares +=
        shares;


    portfolio[id].average =
        (
            oldShares *
            oldAverage +
            cost
        ) /
        portfolio[id].shares;


    transactions.unshift({

        id:
            Date.now(),

        type:
            "買入",

        code:
            id,

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


    renderStockDetail(
        stock
    );

}


/* =========================================================
   26. 賣出
   ========================================================= */

function sellStock(id) {

    const stock =
        stocks.find(
            item =>
                item.id === id
        );


    if (
        !portfolio[id]
    ) {

        showToast(
            "你目前沒有持有這支股票"
        );

        return;

    }


    const amount =
        prompt(
            `目前持有 ${portfolio[id].shares.toLocaleString()} 股

請輸入賣出股數：`
        );


    const shares =
        Number(amount);


    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {

        showToast(
            "請輸入有效股數"
        );

        return;

    }


    if (
        shares >
        portfolio[id].shares
    ) {

        showToast(
            "持股不足"
        );

        return;

    }


    const revenue =
        shares *
        stock.price;


    user.balance +=
        revenue;


    portfolio[id].shares -=
        shares;


    if (
        portfolio[id].shares ===
        0
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


    renderStockDetail(
        stock
    );

}


/* =========================================================
   27. 投資頁
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

    }

    else {

        list.innerHTML =
            entries.map(
                ([id, data]) => {

                    const stock =
                        stocks.find(
                            item =>
                                item.id === id
                        );


                    if (!stock) {

                        return "";

                    }


                    const value =
                        data.shares *
                        stock.price;


                    return `

                        <div class="portfolio-row">

                            <div>

                                <strong>
                                    ${stock.name}
                                </strong>

                                <small>
                                    ${id}
                                    ·
                                    ${data.shares.toLocaleString()}
                                    股
                                </small>

                            </div>


                            <strong>
                                ${money(value)}
                            </strong>

                        </div>

                    `;

                }
            ).join("");

    }


    const transactionList =
        document.getElementById(
            "transaction-list"
        );


    if (!transactionList) {

        return;

    }


    if (
        transactions.length === 0
    ) {

        transactionList.innerHTML = `

            <div class="empty-state">
                尚無交易紀錄
            </div>

        `;

        return;

    }


    transactionList.innerHTML =
        transactions
            .slice(0, 20)
            .map(
                transaction => `

                    <div class="transaction-row">

                        <div>

                            <strong>
                                ${transaction.type}
                                ${transaction.code}
                            </strong>

                            <small>
                                ${transaction.time}
                            </small>

                        </div>


                        <div>

                            <strong>
                                ${transaction.shares.toLocaleString()}
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
   28. 儲值
   ========================================================= */

function openDepositModal() {

    const modal =
        document.getElementById(
            "deposit-modal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function depositMoney() {

    const input =
        document.getElementById(
            "deposit-amount"
        );


    if (!input) {

        return;

    }


    const amount =
        Number(
            input.value
        );


    if (
        !amount ||
        amount <= 0
    ) {

        showToast(
            "請輸入有效金額"
        );

        return;

    }


    if (
        amount >
        user.wallet
    ) {

        showToast(
            "遊戲錢包餘額不足"
        );

        return;

    }


    user.wallet -=
        amount;


    user.balance +=
        amount;


    saveAll();


    closeModal(
        "deposit-modal"
    );


    input.value =
        "";


    showToast(
        `成功儲值 ${money(amount)}`
    );


    renderHome();

    renderPortfolio();

}


/* =========================================================
   29. 關閉 Modal
   ========================================================= */

function closeModal(id) {

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
   30. Google 登入 Demo
   ========================================================= */

function googleLogin() {

    showToast(
        "Google OAuth 將在正式後端版本接入"
    );

}


/* =========================================================
   31. 公司註冊
   ========================================================= */

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


/* ---------------------------------------------------------
   公司註冊費
   --------------------------------------------------------- */

const COMPANY_REGISTRATION_FEE =
    10000;


/* =========================================================
   32. 註冊公司
   ========================================================= */

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


    /* -----------------------------------------------------
       基本檢查
       ----------------------------------------------------- */

    if (
        !name ||
        !shortName ||
        !code ||
        !capital
    ) {

        showToast(
            "請完整填寫公司資料"
        );

        return;

    }


    if (
        capital <= 0
    ) {

        showToast(
            "註冊資本必須大於 0"
        );

        return;

    }


    /* -----------------------------------------------------
       公司代號格式
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       檢查名稱
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       檢查代號
       ----------------------------------------------------- */

    if (
        stocks.some(
            stock =>
                stock.id === code
        )
    ) {

        showToast(
            "股票代號已經存在"
        );

        return;

    }


    if (
        companies.some(
            company =>
                company.code === code
        )
    ) {

        showToast(
            "公司代號已經存在"
        );

        return;

    }


    /* -----------------------------------------------------
       檢查遊戲錢包
       ----------------------------------------------------- */

    if (
        user.wallet <
        COMPANY_REGISTRATION_FEE
    ) {

        showToast(
            `遊戲錢包不足，註冊公司需要 ${money(COMPANY_REGISTRATION_FEE)}`
        );

        return;

    }


    /* -----------------------------------------------------
       建立公司
       ----------------------------------------------------- */

    const company = {

        id:
            Date.now(),

        name,

        shortName,

        code,

        industry,

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


    /* -----------------------------------------------------
       扣除註冊費
       ----------------------------------------------------- */

    user.wallet -=
        COMPANY_REGISTRATION_FEE;


    companies.push(
        company
    );


    saveAll();


    /* -----------------------------------------------------
       清空表單
       ----------------------------------------------------- */

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


    openMyCompany();

}


/* =========================================================
   33. 我的公司
   ========================================================= */

function openMyCompany() {

    showPageWithoutLoop(
        "company"
    );


    const mine =
        companies.filter(
            company =>
                company.owner ===
                user.accountId
        );


    const container =
        document.getElementById(
            "company-page"
        );


    if (!container) {

        return;

    }


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
                    onclick="openCompanyModal()"
                >
                    註冊公司
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        mine.map(
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
                            ${company.status}
                        </span>


                        <h2>
                            ${company.name}
                        </h2>


                        <p>
                            ${company.code}
                            ·
                            ${company.industry}
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
                                    IPO狀態
                                </small>

                                <strong>
                                    ${ipoText}
                                </strong>

                            </div>


                            <div>

                                <small>
                                    成立日期
                                </small>

                                <strong>
                                    ${company.createdAt}
                                </strong>

                            </div>

                        </div>


                        <div class="company-actions">

                            <button
                                onclick="publishCompanyNews('${company.code}')/* =========================================================
   IPO / 上市系統 v3
   ========================================================= */

function applyIPO(code) {

    const company = companies.find(
        item => item.code === code
    );

    if (!company) {
        showToast("找不到這間公司");
        return;
    }


    /* 必須是公司負責人 */

    if (
        company.owner !== user.accountId
    ) {

        showToast(
            "你不是這間公司的負責人"
        );

        return;

    }


    /* 已經上市 */

    if (company.listed) {

        showToast(
            "這間公司已經上市"
        );

        return;

    }


    /* 已經申請 */

    if (
        company.ipoStatus === "審核中"
    ) {

        showToast(
            "IPO 申請正在審核中"
        );

        return;

    }


    /*
     * 基本條件
     *
     * 先採用 Demo 規則：
     *
     * 註冊資本 ≥ ¥10,000,000
     */

    if (
        Number(company.capital) <
        10000000
    ) {

        showToast(
            "註冊資本不足 ¥10,000,000，暫時無法申請上市"
        );

        return;

    }


    const confirmIPO =
        confirm(
            `確定要申請「${company.name}」上市嗎？\n\n` +
            `股票代號：${company.code}\n` +
            `註冊資本：${money(company.capital)}\n\n` +
            `送出後將進入上市審核。`
        );


    if (!confirmIPO) {
        return;
    }


    /*
     * IPO 狀態
     */

    company.ipoStatus =
        "審核中";

    company.ipoAppliedAt =
        formatDateTime(
            new Date()
        );


    saveData(
        "mingyue_companies_v2",
        companies
    );


    showToast(
        "IPO 申請已送出"
    );


    openMyCompany();

}"
/* =========================================================
   IPO 審核
   ========================================================= */

function approveIPO(code) {

    const company = companies.find(
        item => item.code === code
    );

    if (!company) {
        showToast("找不到公司");
        return;
    }


    if (
        company.ipoStatus !== "審核中"
    ) {

        showToast(
            "這間公司目前沒有 IPO 審核"
        );

        return;

    }


    /*
     * Demo：
     * 審核通過
     */

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


    /*
     * 建立股票
     */

    const stockExists =
        stocks.some(
            stock =>
                stock.id === company.code
        );


    if (!stockExists) {

        /*
         * 初始股價
         *
         * 以註冊資本與股數計算
         */

        const shares =
            Math.max(
                1000000,
                Math.floor(
                    company.capital /
                    10
                )
            );


        const initialPrice =
            Number(
                (
                    company.capital /
                    shares
                ).toFixed(2)
            );


        const newStock = {

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
                company.capital,

            shares:
                shares

        };


        stocks.push(
            newStock
        );


        generateHistory(
            newStock
        );

    }


    saveAll();


    showToast(
        `🎉 ${company.shortName} 已正式上市`
    );


    openMyCompany();

}
                            >
                                📰 發布新聞
                            </button>


                            <button
    onclick="applyIPO('${company.code}')">
    📈 IPO / 上市
</button>


                            <button
                                onclick="showToast('股東系統將在下一版本加入')"
                            >
                                👥 股東
                            </button>


                            <button
                                onclick="showToast('公司財務系統將在下一版本加入')"
                            >
                                💰 財務
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   34. 避免 showPage / openMyCompany 無限遞迴
   ========================================================= */

function showPageWithoutLoop(page) {

    document
        .querySelectorAll(".page")
        .forEach(
            element =>
                element.classList.remove(
                    "active"
                )
        );


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );


                if (
                    item.dataset.page ===
                    page
                ) {

                    item.classList.add(
                        "active"
                    );

                }

            }
        );

}


/* =========================================================
   35. IPO 申請
   ---------------------------------------------------------
   v3 先建立申請狀態。
   真正上市流程下一階段處理。
   ========================================================= */

function applyIPO(code) {

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


    const confirmed =
        confirm(
            `確定要申請「${company.name}」IPO 嗎？\n\n目前公司狀態：私人公司`
        );


    if (!confirmed) {

        return;

    }


    company.ipoStatus =
        "審核中";


    saveAll();


    showToast(
        "IPO 申請已送出，目前等待審核"
    );


    openMyCompany();

}


/* =========================================================
   36. 公司發布新聞
   ========================================================= */

/* =========================================================
   公司發布新聞 v3
   ========================================================= */

function publishCompanyNews(code) {

    const company = companies.find(
        item => item.code === code
    );

    if (!company) {
        showToast("找不到這間公司");
        return;
    }


    /* 確認是否為公司負責人 */

    if (
        company.owner !== user.accountId
    ) {

        showToast(
            "你不是這間公司的管理者"
        );

        return;

    }


    /* 新聞標題 */

    const title = prompt(
        `【${company.shortName}】

請輸入新聞標題：`
    );


    if (!title || !title.trim()) {
        return;
    }


    /* 新聞內容 */

    const content = prompt(
        `【${company.shortName}】

請輸入新聞內容：`
    );


    if (!content || !content.trim()) {
        return;
    }


    /*
     * 建立新聞
     */

    const newNews = {

        id: Date.now(),

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

    };


    /*
     * 放到新聞最前面
     */

    news.unshift(
        newNews
    );


    /*
     * 儲存新聞
     */

    saveData(
        "mingyue_news_v2",
        news
    );


    /*
     * 更新新聞頁
     */

    renderNews();


    /*
     * 成功提示
     */

    showToast(
        `「${company.shortName}」新聞已發布`
    );

}

/* =========================================================
   37. 新聞
   ========================================================= */

let newsFilter =
    "all";


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
            element =>
                element.classList.remove(
                    "active"
                )
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    renderNews();

}


function renderNews() {

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


    const container =
        document.getElementById(
            "news-list"
        );


    if (!container) {

        return;

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
        list.map(
            item => `

                <article
                    class="news-card"
                    onclick="openNews(${item.id})"
                >

                    <div class="news-source">

                        ${
                            item.companyName ||
                            "明月證券"
                        }

                        ${
                            item.companyCode
                                ? " · " +
                                  item.companyCode
                                : ""
                        }

                    </div>


                    <h3>
                        ${item.title}
                    </h3>


                    <p>
                        ${item.content}
                    </p>


                    <small>
                        ${item.time}
                    </small>

                </article>

            `
        ).join("");

}


function openNews(id) {

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
   38. 個人
   ========================================================= */

function renderProfile() {

    const name =
        document.getElementById(
            "profile-name"
        );


    if (name) {

        name.textContent =
            user.name;

    }


    const account =
        document.getElementById(
            "profile-account"
        );


    if (account) {

        account.textContent =
            user.accountId;

    }


    const wallet =
        document.getElementById(
            "profile-wallet"
        );


    if (wallet) {

        wallet.textContent =
            money(
                user.wallet
            );

    }

}


/* =========================================================
   39. 全部儲存
   ========================================================= */

function saveAll() {

    saveData(
        "mingyue_user_v3",
        user
    );


    saveData(
        "mingyue_stocks_v3",
        stocks
    );


    saveData(
        "mingyue_portfolio_v3",
        portfolio
    );


    saveData(
        "mingyue_transactions_v3",
        transactions
    );


    saveData(
        "mingyue_companies_v3",
        companies
    );


    saveData(
        "mingyue_news_v3",
        news
    );


    saveData(
        "mingyue_history_v3",
        historyData
    );

}


/* =========================================================
   40. Toast
   ========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

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
   41. Modal 背景關閉
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const modal =
            event.target.closest(
                ".modal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            modal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   42. 市場波動
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
                stock.price;


            const open =
                oldPrice;


            const randomShock =
                (
                    Math.random() -
                    0.5
                ) * 2;


            const volatility =
                0.002 +
                Math.random() *
                0.012;


            const movement =
                oldPrice *
                volatility *
                randomShock;


            const close =
                Math.max(
                    1,
                    oldPrice +
                    movement
                );


            const high =
                Math.max(
                    open,
                    close
                ) *
                (
                    1 +
                    Math.random() *
                    0.006
                );


            const low =
                Math.min(
                    open,
                    close
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
                    close.toFixed(2)
                );


            stock.volume +=
                Math.floor(
                    300 +
                    Math.random() *
                    2500
                );


            if (
                !historyData[stock.id]
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


            let todayCandle =
                data.find(
                    item =>
                        item.date ===
                        today
                );


            if (
                !todayCandle
            ) {

                todayCandle = {

                    date:
                        today,

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
                            500 +
                            Math.random() *
                            3000
                        )

                };


                data.push(
                    todayCandle
                );

            }

            else {

                todayCandle.high =
                    Math.max(
                        todayCandle.high,
                        high,
                        close
                    );


                todayCandle.low =
                    Math.min(
                        todayCandle.low,
                        low,
                        close
                    );


                todayCandle.close =
                    Number(
                        close.toFixed(2)
                    );


                todayCandle.volume +=
                    Math.floor(
                        300 +
                        Math.random() *
                        2000
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


    renderHome();


    if (
        document
            .getElementById(
                "page-market"
            )
            ?.classList
            .contains(
                "active"
            )
    ) {

        renderMarket();

    }


    if (
        document
            .getElementById(
                "page-stock"
            )
            ?.classList
            .contains(
                "active"
            ) &&
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
   43. 啟動
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderHome();

        renderMarket();

        renderPortfolio();

        renderNews();

        renderProfile();

    }
);


/* =========================================================
   44. 市場自動更新
   ========================================================= */

setInterval(
    updateMarket,
    15000
);


/* =========================================================
   45. 視窗大小改變
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            currentChartType ===
                "candle" &&
            currentStockId
        ) {

            const stock =
                stocks.find(
                    item =>
                        item.id ===
                        currentStockId
                );


            if (stock) {

                drawChart(
                    stock
                );

            }

        }

    }
);


/* =========================================================
   明月證券 v3.0 END
   ========================================================= */
