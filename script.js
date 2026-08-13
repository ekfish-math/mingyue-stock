/* =========================================================
   明月證券 v2.1
   市場系統 / K線 / 折線圖 / 公司 / 新聞 / 儲值
   ========================================================= */


/* =========================================================
   1. 初始股票資料
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
   2. LocalStorage
   ========================================================= */

function loadData(key, fallback) {

    const data = localStorage.getItem(key);

    if (!data) {
        return fallback;
    }

    try {
        return JSON.parse(data);
    }

    catch {
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
   3. 資料初始化
   ========================================================= */

let stocks = loadData(
    "mingyue_stocks_v2",
    DEFAULT_STOCKS
);


let user = loadData(
    "mingyue_user_v2",
    {
        name: "Fisher",
        accountId: "MYS-000184",
        balance: 1000000,
        wallet: 500000
    }
);


let portfolio = loadData(
    "mingyue_portfolio_v2",
    {}
);


let transactions = loadData(
    "mingyue_transactions_v2",
    []
);


let companies = loadData(
    "mingyue_companies_v2",
    []
);


/* =========================================================
   4. 初始新聞
   ========================================================= */

let news = loadData(
    "mingyue_news_v2",
    [
        {
            id: 1,
            companyCode: "MTR",
            companyName: "明月鐵路",
            category: "company",
            title: "明月鐵路今日維持正常營運",
            content: "明月鐵路今日各主要路線維持正常營運。",
            time: "2026/08/13 08:00"
        },

        {
            id: 2,
            companyCode: "KMB",
            companyName: "國立京城大學附設生醫",
            category: "company",
            title: "附設生醫公布最新研究進度",
            content: "國立京城大學附設生醫股份有限公司公布最新研究計畫進度。",
            time: "2026/08/13 07:40"
        },

        {
            id: 3,
            companyCode: "HZI",
            companyName: "鎬子餐飲",
            category: "company",
            title: "鎬子餐飲公布新門市計畫",
            content: "鎬子餐飲股份有限公司宣布規劃新的餐飲據點。",
            time: "2026/08/12 18:20"
        }
    ]
);


/* =========================================================
   5. 歷史市場資料
   ========================================================= */

let historyData = loadData(
    "mingyue_history_v3",
    {}
);


/* =========================================================
   6. 日期工具
   ========================================================= */

function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}/${month}/${day}`;
}


function formatDateTime(date) {

    const dateText = formatDate(date);

    const timeText = date.toLocaleTimeString(
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
   7. 交易日判斷
   ========================================================= */

function isTradingDay(date) {

    const day = date.getDay();

    return day !== 0 && day !== 6;

}


/* =========================================================
   8. 找上一個交易日
   ========================================================= */

function previousTradingDay(date) {

    const result = new Date(date);

    do {

        result.setDate(
            result.getDate() - 1
        );

    }

    while (!isTradingDay(result));

    return result;

}


/* =========================================================
   9. 產生歷史 K 線
   ========================================================= */

function generateHistory(stock) {

    if (
        historyData[stock.id] &&
        historyData[stock.id].length >= 30
    ) {
        return;
    }


    const result = [];

    const today = new Date();

    let date = new Date(today);

    date.setDate(
        date.getDate() - 45
    );


    let current = stock.price * (
        0.90 + Math.random() * 0.08
    );


    while (result.length < 30) {

        if (!isTradingDay(date)) {

            date.setDate(
                date.getDate() + 1
            );

            continue;

        }


        const open = current;


        /*
         * 每日波動率
         *
         * 不再使用固定倍數。
         * 每一天都有自己的隨機波動。
         */

        const volatility =
            0.006 +
            Math.random() * 0.025;


        const direction =
            Math.random() > 0.5
                ? 1
                : -1;


        const close = Math.max(
            1,
            open +
            open *
            volatility *
            direction
        );


        const high = Math.max(
            open,
            close
        ) * (
            1 +
            Math.random() * 0.015
        );


        const low = Math.min(
            open,
            close
        ) * (
            1 -
            Math.random() * 0.015
        );


        const volume = Math.floor(
            5000 +
            Math.random() * 25000
        );


        result.push({

            date: formatDate(date),

            open: Number(
                open.toFixed(2)
            ),

            high: Number(
                high.toFixed(2)
            ),

            low: Number(
                low.toFixed(2)
            ),

            close: Number(
                close.toFixed(2)
            ),

            volume

        });


        current = close;


        date.setDate(
            date.getDate() + 1
        );

    }


    /*
     * 最後一天校正成目前股價附近
     */

    const latest =
        result[result.length - 1];


    latest.close = stock.price;

    latest.high = Math.max(
        latest.open,
        latest.close
    );

    latest.low = Math.min(
        latest.open,
        latest.close
    );


    historyData[stock.id] = result;

}


/* =========================================================
   10. 初始化所有歷史資料
   ========================================================= */

stocks.forEach(
    generateHistory
);


saveData(
    "mingyue_history_v3",
    historyData
);


/* =========================================================
   11. 頁面切換
   ========================================================= */

function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(element => {

            element.classList.remove(
                "active"
            );

        });


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
        .forEach(item => {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.page === page
            ) {

                item.classList.add(
                    "active"
                );

            }

        });


    if (page === "home") {
        renderHome();
    }

    if (page === "market") {
        renderMarket();
    }

    if (page === "portfolio") {
        renderPortfolio();
    }

    if (page === "news") {
        renderNews();
    }

    if (page === "profile") {
        renderProfile();
    }

}


/* =========================================================
   12. 金額格式
   ========================================================= */

function money(value) {

    return "¥" +
        Number(value).toLocaleString(
            "zh-TW",
            {
                maximumFractionDigits: 2
            }
        );

}


/* =========================================================
   13. 漲跌計算
   ========================================================= */

function getChange(stock) {

    return (
        (stock.price - stock.previous) /
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


    return `${symbol} ${sign}${change.toFixed(2)}%`;

}


/* =========================================================
   14. 首頁
   ========================================================= */

function renderHome() {

    const average =
        stocks.reduce(
            (sum, stock) =>
                sum + stock.price,
            0
        ) / stocks.length;


    /*
     * 指數不直接等於股價倍數。
     *
     * 使用加權概念：
     * 各公司市值 → 市場總值 → 指數
     */

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
        marketValue / 100000;


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
            money(user.balance);

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
            hot.map(stock => {

                return `

                <div class="stock-card"
                     onclick="openStock('${stock.id}')">

                    <div>
                        <strong>
                            ${stock.name}
                        </strong>

                        <small>
                            ${stock.id} ·
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

                `;

            }).join("");

    }


    updateStats();

}


/* =========================================================
   15. 市場統計
   ========================================================= */

function updateStats() {

    let up = 0;

    let down = 0;

    let volume = 0;


    stocks.forEach(stock => {

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


        volume += stock.volume;

    });


    const companiesElement =
        document.getElementById(
            "stat-companies"
        );


    if (companiesElement) {

        companiesElement.textContent =
            stocks.length +
            companies.length;

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
   16. 行情
   ========================================================= */

let marketFilter = "all";


function filterMarket(
    filter,
    button
) {

    marketFilter = filter;


    document
        .querySelectorAll(
            ".market-tab"
        )
        .forEach(element => {

            element.classList.remove(
                "active"
            );

        });


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


    if (marketFilter === "up") {

        list =
            list.filter(
                stock =>
                    getChange(stock) > 0
            );

    }


    if (marketFilter === "down") {

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
        list.map(stock => {

            return `

            <div class="market-row"
                 onclick="openStock('${stock.id}')">

                <div>

                    <strong>
                        ${stock.name}
                    </strong>

                    <small>
                        ${stock.id} ·
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

                    ${stock.volume.toLocaleString()}

                </div>

            </div>

            `;

        }).join("");

}


/* =========================================================
   17. 股票詳細
   ========================================================= */

let currentStockId = null;

let currentChart = null;

let currentChartType = "line";


function openStock(id) {

    currentStockId = id;


    const stock =
        stocks.find(
            item =>
                item.id === id
        );


    if (!stock) {
        return;
    }


    showPage("stock");

    renderStockDetail(stock);

}


function getLatest(stock) {

    const data =
        historyData[stock.id];


    if (!data || data.length === 0) {

        return {

            date: formatDate(
                new Date()
            ),

            open: stock.price,

            high: stock.price,

            low: stock.price,

            close: stock.price,

            volume: stock.volume

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

                <span>日期</span>

                <strong>
                    ${latest.date}
                </strong>

            </div>


            <div>

                <span>開盤</span>

                <strong>
                    ${money(latest.open)}
                </strong>

            </div>


            <div>

                <span>最高</span>

                <strong>
                    ${money(latest.high)}
                </strong>

            </div>


            <div>

                <span>最低</span>

                <strong>
                    ${money(latest.low)}
                </strong>

            </div>


            <div>

                <span>收盤</span>

                <strong>
                    ${money(latest.close)}
                </strong>

            </div>


            <div>

                <span>成交量</span>

                <strong>
                    ${latest.volume.toLocaleString()}
                </strong>

            </div>

        </div>


        <h3>
            ${stock.name} 股價走勢
        </h3>


        <div class="chart-tabs">

            <button
                onclick="switchChart('line')"
                class="${currentChartType === "line" ? "active" : ""}">
                折線圖
            </button>


            <button
                onclick="switchChart('candle')"
                class="${currentChartType === "candle" ? "active" : ""}">
                K線圖
            </button>

        </div>


        <div class="chart-container">

            <canvas id="stock-chart"></canvas>

        </div>


        <div class="stock-actions">

            <button
                onclick="buyStock('${stock.id}')">
                買入
            </button>


            <button
                onclick="sellStock('${stock.id}')">
                賣出
            </button>

        </div>

    `;


    drawChart(stock);

}


/* =========================================================
   18. 圖表切換
   ========================================================= */

function switchChart(type) {

    currentChartType = type;


    const stock =
        stocks.find(
            item =>
                item.id === currentStockId
        );


    if (!stock) {
        return;
    }


    renderStockDetail(stock);

}


/* =========================================================
   19. 畫圖
   ========================================================= */

function drawChart(stock) {

    if (currentChart) {

        currentChart.destroy();

        currentChart = null;

    }


    const canvas =
        document.getElementById(
            "stock-chart"
        );


    if (!canvas) {
        return;
    }


    const data =
        historyData[stock.id];


    if (!data || data.length === 0) {
        return;
    }


    const labels =
        data.map(
            item =>
                item.date
        );


    /*
     * 折線圖
     */

    if (
        currentChartType === "line"
    ) {

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
                                display: false
                            }

                        },

                        scales: {

                            x: {

                                ticks: {

                                    maxTicksLimit: 8

                                },

                                grid: {

                                    display: false

                                }

                            }

                        }

                    }

                }
            );

        return;

    }


    /*
     * K線圖
     *
     * Chart.js 沒有內建 Candlestick。
     *
     * 所以這裡使用 HTML Canvas
     * 自己畫真正的 OHLC K 線。
     */

    drawCandlestick(canvas, data);

}


/* =========================================================
   20. 真正 K 線 Canvas
   ========================================================= */

function drawCandlestick(
    canvas,
    data
) {

    const ctx =
        canvas.getContext("2d");


    const rect =
        canvas.getBoundingClientRect();


    const width =
        canvas.width =
            rect.width *
            window.devicePixelRatio;


    const height =
        canvas.height =
            rect.height *
            window.devicePixelRatio;


    ctx.scale(
        window.devicePixelRatio,
        window.devicePixelRatio
    );


    const w =
        rect.width;

    const h =
        rect.height;


    ctx.clearRect(
        0,
        0,
        w,
        h
    );


    const prices =
        data.flatMap(
            item => [
                item.high,
                item.low
            ]
        );


    const maxPrice =
        Math.max(...prices);


    const minPrice =
        Math.min(...prices);


    const padding =
        35;


    const chartHeight =
        h - padding * 2;


    function y(price) {

        return padding +
            (
                maxPrice -
                price
            ) /
            (
                maxPrice -
                minPrice || 1
            ) *
            chartHeight;

    }


    /*
     * 網格
     */

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
            w,
            gy
        );

    }


    ctx.strokeStyle =
        "rgba(128,128,128,0.15)";


    ctx.stroke();


    /*
     * K線
     */

    const spacing =
        w / data.length;


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


            /*
             * 台股習慣：
             *
             * 上漲 = 紅
             * 下跌 = 綠
             */

            ctx.strokeStyle =
                rising
                    ? "#ef4444"
                    : "#22c55e";


            ctx.fillStyle =
                rising
                    ? "#ef4444"
                    : "#22c55e";


            /*
             * 上下影線
             */

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


            /*
             * 實體
             */

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


    /*
     * 價格文字
     */

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
   21. 買入
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


    user.balance -= cost;


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

        id: Date.now(),

        type: "買入",

        code: id,

        shares,

        price: stock.price,

        amount: cost,

        time:
            formatDateTime(
                new Date()
            )

    });


    saveAll();


    showToast(
        `已買入 ${shares.toLocaleString()} 股 ${id}`
    );


    renderStockDetail(stock);

}


/* =========================================================
   22. 賣出
   ========================================================= */

function sellStock(id) {

    const stock =
        stocks.find(
            item =>
                item.id === id
        );


    if (!portfolio[id]) {

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
        portfolio[id].shares === 0
    ) {

        delete portfolio[id];

    }


    transactions.unshift({

        id: Date.now(),

        type: "賣出",

        code: id,

        shares,

        price: stock.price,

        amount: revenue,

        time:
            formatDateTime(
                new Date()
            )

    });


    saveAll();


    showToast(
        `已賣出 ${shares.toLocaleString()} 股 ${id}`
    );


    renderStockDetail(stock);

}


/* =========================================================
   23. 投資頁
   ========================================================= */

function renderPortfolio() {

    const balance =
        document.getElementById(
            "portfolio-balance"
        );


    if (balance) {

        balance.textContent =
            money(user.balance);

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
                            ${money(transaction.amount)}
                        </small>

                    </div>

                </div>

                `
            )
            .join("");

}


/* =========================================================
   24. 儲值
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
        Number(input.value);


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


    input.value = "";


    showToast(
        `成功儲值 ${money(amount)}`
    );


    renderHome();

    renderPortfolio();

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   25. Google 登入 Demo
   ========================================================= */

function googleLogin() {

    showToast(
        "Google OAuth 將在正式後端版本接入"
    );

}


/* =========================================================
   26. 公司
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


function registerCompany() {

    const name =
        document.getElementById(
            "company-name"
        ).value.trim();


    const shortName =
        document.getElementById(
            "company-short"
        ).value.trim();


    const code =
        document.getElementById(
            "company-code"
        ).value
            .trim()
            .toUpperCase();


    const industry =
        document.getElementById(
            "company-industry"
        ).value;


    const capital =
        Number(
            document.getElementById(
                "company-capital"
            ).value
        );


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
        stocks.some(
            stock =>
                stock.id === code
        ) ||
        companies.some(
            company =>
                company.code === code
        )
    ) {

        showToast(
            "股票代號已經存在"
        );

        return;

    }


    const company = {

        id: Date.now(),

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

        createdAt:
            formatDate(
                new Date()
            )

    };


    companies.push(
        company
    );


    saveData(
        "mingyue_companies_v2",
        companies
    );


    closeModal(
        "company-modal"
    );


    document.getElementById(
        "company-name"
    ).value = "";


    document.getElementById(
        "company-short"
    ).value = "";


    document.getElementById(
        "company-code"
    ).value = "";


    document.getElementById(
        "company-capital"
    ).value = "";


    showToast(
        `公司「${name}」註冊成功`
    );


    openMyCompany();

}


/* =========================================================
   27. 我的公司
   ========================================================= */

function openMyCompany() {

    showPage(
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
                    onclick="openCompanyModal()">
                    註冊公司
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        mine.map(
            company => `

            <div class="company-card">

                <span>
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


                <div>

                    <small>
                        註冊資本
                    </small>

                    <strong>
                        ${money(company.capital)}
                    </strong>

                </div>


                <div>

                    <small>
                        公司狀態
                    </small>

                    <strong>
                        ${company.listed
                            ? "上市"
                            : "未上市"}
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


                <div class="company-actions">

                    <button
                        onclick="publishCompanyNews('${company.code}')">
                        📰 發布新聞
                    </button>


                    <button>
                        📈 IPO / 上市
                    </button>


                    <button>
                        👥 股東
                    </button>


                    <button>
                        💰 財務
                    </button>

                </div>

            </div>

            `
        ).join("");

}


/* =========================================================
   28. 公司新聞
   ========================================================= */

function publishCompanyNews(code) {

    const title =
        prompt(
            "請輸入新聞標題："
        );


    if (!title) {
        return;
    }


    const content =
        prompt(
            "請輸入新聞內容："
        );


    if (!content) {
        return;
    }


    const company =
        companies.find(
            item =>
                item.code === code
        );


    if (!company) {
        return;
    }


    news.unshift({

        id: Date.now(),

        companyCode:
            code,

        companyName:
            company.name,

        category:
            "company",

        title,

        content,

        time:
            formatDateTime(
                new Date()
            )

    });


    saveData(
        "mingyue_news_v2",
        news
    );


    showToast(
        "新聞已發布"
    );

}


/* =========================================================
   29. 新聞
   ========================================================= */

let newsFilter = "all";


function filterNews(
    filter,
    button
) {

    newsFilter = filter;


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
        newsFilter !== "all"
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


    container.innerHTML =
        list.map(
            item => `

            <article
                class="news-card"
                onclick="openNews(${item.id})">

                <div>

                    ${item.companyName}

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
   30. 個人
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

}


/* =========================================================
   31. 全部儲存
   ========================================================= */

function saveAll() {

    saveData(
        "mingyue_user_v2",
        user
    );


    saveData(
        "mingyue_portfolio_v2",
        portfolio
    );


    saveData(
        "mingyue_transactions_v2",
        transactions
    );


    saveData(
        "mingyue_stocks_v2",
        stocks
    );


    saveData(
        "mingyue_history_v3",
        historyData
    );


    saveData(
        "mingyue_companies_v2",
        companies
    );


    saveData(
        "mingyue_news_v2",
        news
    );

}


/* =========================================================
   32. Toast
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
   33. Modal 背景關閉
   ========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   34. 市場即時波動
   ========================================================= */

function updateMarket() {

    const now =
        new Date();


    /*
     * 週末不交易
     */

    if (
        !isTradingDay(now)
    ) {

        return;

    }


    stocks.forEach(
        stock => {

            const oldPrice =
                stock.price;


            /*
             * 開盤價
             *
             * 使用上一價格作為基準。
             */

            const open =
                oldPrice;


            /*
             * 真正的市場波動模型
             *
             * 小幅波動 + 偶爾較大波動
             */

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


            /*
             * 最高最低
             */

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


            /*
             * 更新股票
             */

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


            /*
             * 今天的 K 線
             */

            if (
                !historyData[stock.id]
            ) {

                historyData[stock.id] =
                    [];

            }


            const data =
                historyData[stock.id];


            const today =
                formatDate(now);


            let todayCandle =
                data.find(
                    item =>
                        item.date ===
                        today
                );


            if (!todayCandle) {

                todayCandle = {

                    date: today,

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


            /*
             * 只保留最近 60 個交易日
             */

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
            .contains("active")
    ) {

        renderMarket();

    }


    if (
        document
            .getElementById(
                "page-stock"
            )
            ?.classList
            .contains("active")
        &&
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
   35. 啟動
   ========================================================= */

renderHome();

renderMarket();

renderPortfolio();

renderNews();

renderProfile();


/*
 * Demo：
 * 每 15 秒更新一次市場
 */

setInterval(
    updateMarket,
    15000
);


/* =========================================================
   36. 視窗大小改變時重畫 K 線
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
