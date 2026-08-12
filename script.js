// ========================================
// 明月證券 v1.4
// ========================================

// ========================================
// 股票資料
// ========================================

const defaultStocks = [
    {
        id: "MBC",
        name: "明月銀行",
        price: 125.40,
        change: 3.21,
        industry: "金融"
    },
    {
        id: "KST",
        name: "京城鋼鐵",
        price: 87.20,
        change: 1.82,
        industry: "工業"
    },
    {
        id: "EAS",
        name: "東海航運",
        price: 63.80,
        change: -2.13,
        industry: "交通"
    },
    {
        id: "MTR",
        name: "明月鐵路",
        price: 142.70,
        change: 5.10,
        industry: "交通"
    }
];


// ========================================
// 股票資料
// ========================================

let stocks = JSON.parse(
    localStorage.getItem("mingyueStocks")
);

if (!Array.isArray(stocks) || stocks.length === 0) {
    stocks = JSON.parse(
        JSON.stringify(defaultStocks)
    );
}


// ========================================
// 玩家資料
// ========================================

let player = JSON.parse(
    localStorage.getItem("mingyuePlayer")
);

if (!player) {
    player = {
        cash: 1000000,
        holdings: {},
        transactions: []
    };
}

if (!player.holdings) {
    player.holdings = {};
}

if (!player.transactions) {
    player.transactions = [];
}


// ========================================
// 新聞資料
// ========================================

const news = [
    {
        id: 1,
        title: "明月銀行公布季度財報",
        time: "今日 09:30",
        content:
            "明月銀行公布最新季度財報，營收表現優於市場預期，市場對金融類股信心有所提升。",
        stockId: "MBC",
        impact: 5.0
    },

    {
        id: 2,
        title: "京城鋼鐵擴大生產規模",
        time: "今日 10:15",
        content:
            "京城鋼鐵宣布擴大鋼鐵生產規模，預計提高未來產能。",
        stockId: "KST",
        impact: 3.0
    },

    {
        id: 3,
        title: "東海航運受到國際市場影響",
        time: "今日 11:20",
        content:
            "國際航運市場近期需求下降，東海航運受到市場關注。",
        stockId: "EAS",
        impact: -4.0
    },

    {
        id: 4,
        title: "明月鐵路宣布新路線計畫",
        time: "今日 13:00",
        content:
            "明月鐵路公布新的鐵路建設計畫，市場預期長期營運收入可能增加。",
        stockId: "MTR",
        impact: 6.0
    }
];


// ========================================
// 儲存
// ========================================

function savePlayer() {
    localStorage.setItem(
        "mingyuePlayer",
        JSON.stringify(player)
    );
}

function saveStocks() {
    localStorage.setItem(
        "mingyueStocks",
        JSON.stringify(stocks)
    );
}

savePlayer();
saveStocks();


// ========================================
// 工具
// ========================================

function getStock(stockId) {
    return stocks.find(
        stock => stock.id === stockId
    );
}

function money(value) {
    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


// ========================================
// 頁面控制
// ========================================

function hideAllPages() {

    const pages = [
        "home-page",
        "stock-detail",
        "investment-page",
        "transaction-page",
        "news-page"
    ];

    pages.forEach(id => {

        const page =
            document.getElementById(id);

        if (page) {
            page.style.display = "none";
        }

    });
}


// ========================================
// 首頁
// ========================================

function showHome() {

    hideAllPages();

    const page =
        document.getElementById("home-page");

    if (!page) {
        return;
    }

    page.style.display = "block";

    displayStocks();
    updateAccountDisplay();
}


// ========================================
// 更新首頁資產
// ========================================

function updateAccountDisplay() {

    const display =
        document.getElementById("cash-display");

    if (!display) {
        return;
    }

    display.textContent =
        `¥ ${money(player.cash)}`;
}


// ========================================
// 行情
// ========================================

function showMarket() {
    showHome();
}


// ========================================
// 顯示股票
// ========================================

function displayStocks() {

    const list =
        document.getElementById("stock-list");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    stocks.forEach(stock => {

        const div =
            document.createElement("div");

        div.className = "stock";

        const color =
            stock.change >= 0
                ? "red"
                : "green";

        const arrow =
            stock.change >= 0
                ? "▲"
                : "▼";

        div.innerHTML = `
            <strong>
                ${stock.name}
            </strong>

            <br>

            <small>
                ${stock.id} ・ ${stock.industry}
            </small>

            <p>
                ¥${stock.price.toFixed(2)}

                <span style="color:${color};">
                    ${arrow}
                    ${Math.abs(stock.change).toFixed(2)}%
                </span>
            </p>
        `;

        div.onclick = function () {
            showStock(stock.id);
        };

        list.appendChild(div);

    });
}


// ========================================
// 股票詳細頁
// ========================================

function showStock(stockId) {

    const stock = getStock(stockId);

    if (!stock) {
        return;
    }

    hideAllPages();

    const page =
        document.getElementById("stock-detail");

    if (!page) {
        return;
    }

    page.style.display = "block";

    const color =
        stock.change >= 0
            ? "red"
            : "green";

    const arrow =
        stock.change >= 0
            ? "▲"
            : "▼";

    const owned =
        player.holdings[stockId] || 0;

    page.innerHTML = `

        <button
            class="back-button"
            id="back-market"
        >
            ← 返回行情
        </button>

        <h2>
            ${stock.name}
        </h2>

        <div class="stock-code">
            ${stock.id} ・ ${stock.industry}
        </div>

        <div class="stock-price">
            ¥${stock.price.toFixed(2)}
        </div>

        <div
            class="stock-change"
            style="color:${color};"
        >
            ${arrow}
            ${Math.abs(stock.change).toFixed(2)}%
        </div>

        <hr>

        <p>
            今日最高<br>
            <strong>
                ¥${(stock.price * 1.02).toFixed(2)}
            </strong>
        </p>

        <p>
            今日最低<br>
            <strong>
                ¥${(stock.price * 0.97).toFixed(2)}
            </strong>
        </p>

        <p>
            我的持股<br>
            <strong>
                ${owned} 股
            </strong>
        </p>

        <div class="stock-buttons">

            <button
                id="buy-button"
                class="buy-button"
            >
                買入
            </button>

            <button
                id="sell-button"
                class="sell-button"
            >
                賣出
            </button>

        </div>
    `;

    document.getElementById(
        "back-market"
    ).onclick = showMarket;

    document.getElementById(
        "buy-button"
    ).onclick = function () {
        buyStock(stockId);
    };

    document.getElementById(
        "sell-button"
    ).onclick = function () {
        sellStock(stockId);
    };
}


// ========================================
// 買入
// ========================================

function buyStock(stockId) {

    const stock = getStock(stockId);

    if (!stock) {
        return;
    }

    const quantity = prompt(
        `買入 ${stock.name}\n\n` +
        `股價：¥${stock.price.toFixed(2)}\n` +
        `可用資金：¥${money(player.cash)}\n\n` +
        `請輸入購買股數：`
    );

    if (quantity === null) {
        return;
    }

    const shares = Number(quantity);

    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {
        alert("請輸入正常股數。");
        return;
    }

    const total =
        stock.price * shares;

    if (total > player.cash) {

        alert(
            `資金不足！\n\n` +
            `需要：¥${money(total)}\n` +
            `可用：¥${money(player.cash)}`
        );

        return;
    }

    player.cash -= total;

    if (!player.holdings[stockId]) {
        player.holdings[stockId] = 0;
    }

    player.holdings[stockId] += shares;

    player.transactions.push({
        type: "買入",
        stockId: stock.id,
        stockName: stock.name,
        shares: shares,
        price: stock.price,
        total: total,
        time: new Date().toLocaleString("zh-TW")
    });

    savePlayer();

    updateAccountDisplay();

    alert(
        `買入成功！\n\n` +
        `${stock.name}\n` +
        `${shares} 股\n` +
        `成交價格：¥${stock.price.toFixed(2)}\n` +
        `成交金額：¥${money(total)}\n\n` +
        `剩餘資金：¥${money(player.cash)}`
    );

    showStock(stockId);
}


// ========================================
// 賣出
// ========================================

function sellStock(stockId) {

    const stock = getStock(stockId);

    if (!stock) {
        return;
    }

    const owned =
        player.holdings[stockId] || 0;

    if (owned <= 0) {

        alert(
            `你沒有持有 ${stock.name}。`
        );

        return;
    }

    const quantity = prompt(
        `賣出 ${stock.name}\n\n` +
        `股價：¥${stock.price.toFixed(2)}\n` +
        `目前持有：${owned} 股\n\n` +
        `請輸入賣出股數：`
    );

    if (quantity === null) {
        return;
    }

    const shares = Number(quantity);

    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {

        alert("請輸入正常股數。");
        return;
    }

    if (shares > owned) {

        alert(
            `持股不足！\n\n` +
            `目前持有：${owned} 股`
        );

        return;
    }

    const total =
        stock.price * shares;

    player.holdings[stockId] -= shares;

    player.cash += total;

    if (player.holdings[stockId] === 0) {
        delete player.holdings[stockId];
    }

    player.transactions.push({
        type: "賣出",
        stockId: stock.id,
        stockName: stock.name,
        shares: shares,
        price: stock.price,
        total: total,
        time: new Date().toLocaleString("zh-TW")
    });

    savePlayer();

    updateAccountDisplay();

    alert(
        `賣出成功！\n\n` +
        `${stock.name}\n` +
        `${shares} 股\n` +
        `成交價格：¥${stock.price.toFixed(2)}\n` +
        `成交金額：¥${money(total)}\n\n` +
        `剩餘持股：${player.holdings[stockId] || 0} 股\n` +
        `可用資金：¥${money(player.cash)}`
    );

    showStock(stockId);
}


// ========================================
// 我的投資
// ========================================

function showInvestment() {

    hideAllPages();

    const page =
        document.getElementById(
            "investment-page"
        );

    if (!page) {
        return;
    }

    page.style.display = "block";

    let stockValue = 0;
    let html = "";

    stocks.forEach(stock => {

        const shares =
            player.holdings[stock.id] || 0;

        if (shares <= 0) {
            return;
        }

        const value =
            stock.price * shares;

        stockValue += value;

        const color =
            stock.change >= 0
                ? "red"
                : "green";

        const arrow =
            stock.change >= 0
                ? "▲"
                : "▼";

        html += `
            <div class="holding">

                <strong>
                    ${stock.name}
                </strong>

                <br>

                <small>
                    ${stock.id} ・ ${stock.industry}
                </small>

                <p>
                    持有 ${shares} 股
                </p>

                <p>
                    市值 ¥${money(value)}
                </p>

                <p style="color:${color};">
                    ${arrow}
                    ${Math.abs(stock.change).toFixed(2)}%
                </p>

            </div>
        `;
    });

    if (!html) {
        html = `
            <p>
                目前沒有持有任何股票。
            </p>
        `;
    }

    const totalAssets =
        player.cash + stockValue;

    page.innerHTML = `

        <button
            class="back-button"
            id="investment-back"
        >
            ← 返回首頁
        </button>

        <h2>
            💼 我的投資
        </h2>

        <div class="card">
            <p>總資產</p>

            <h2>
                ¥${money(totalAssets)}
            </h2>
        </div>

        <div class="card">
            <p>可用現金</p>

            <h2>
                ¥${money(player.cash)}
            </h2>
        </div>

        <div class="card">
            <p>股票市值</p>

            <h2>
                ¥${money(stockValue)}
            </h2>
        </div>

        <h2>
            持有股票
        </h2>

        ${html}

        <h2>
            交易紀錄
        </h2>

        <button
            class="transaction-button"
            id="transactions-button"
        >
            🧾 查看交易紀錄
        </button>
    `;

    document.getElementById(
        "investment-back"
    ).onclick = showHome;

    document.getElementById(
        "transactions-button"
    ).onclick = showTransactions;
}


// ========================================
// 交易紀錄
// ========================================

function showTransactions() {

    hideAllPages();

    const page =
        document.getElementById(
            "transaction-page"
        );

    if (!page) {
        return;
    }

    page.style.display = "block";

    let html = "";

    const transactions =
        [...player.transactions].reverse();

    if (transactions.length === 0) {

        html = `
            <p>
                目前沒有交易紀錄。
            </p>
        `;

    } else {

        transactions.forEach(transaction => {

            const color =
                transaction.type === "買入"
                    ? "red"
                    : "green";

            html += `
                <div class="transaction">

                    <strong style="color:${color};">
                        ${transaction.type}
                    </strong>

                    <h3>
                        ${transaction.stockName}
                    </h3>

                    <small>
                        ${transaction.stockId}
                    </small>

                    <p>
                        ${transaction.shares} 股
                    </p>

                    <p>
                        成交價
                        ¥${Number(transaction.price).toFixed(2)}
                    </p>

                    <p>
                        成交金額
                        ¥${money(transaction.total)}
                    </p>

                    <small>
                        ${transaction.time}
                    </small>

                </div>
            `;
        });
    }

    page.innerHTML = `

        <button
            class="back-button"
            id="transactions-back"
        >
            ← 返回投資
        </button>

        <h2>
            🧾 交易紀錄
        </h2>

        ${html}
    `;

    document.getElementById(
        "transactions-back"
    ).onclick = showInvestment;
}


// ========================================
// 新聞列表
// ========================================

function showNews() {

    hideAllPages();

    const page =
        document.getElementById(
            "news-page"
        );

    if (!page) {
        alert("找不到 news-page，請確認 HTML 有新聞頁面。");
        return;
    }

    page.style.display = "block";

    let html = "";

    news.forEach(item => {

        const stock =
            getStock(item.stockId);

        if (!stock) {
            return;
        }

        const color =
            item.impact >= 0
                ? "red"
                : "green";

        const arrow =
            item.impact >= 0
                ? "▲"
                : "▼";

        html += `
            <div
                class="card news-card"
                data-news-id="${item.id}"
            >

                <small>
                    ${item.time}
                </small>

                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${stock.name}

                    <span style="color:${color};">
                        ${arrow}
                        ${Math.abs(item.impact).toFixed(1)}%
                    </span>
                </p>

            </div>
        `;
    });

    if (html === "") {
        html = `
            <p>
                目前沒有市場新聞。
            </p>
        `;
    }

    page.innerHTML = `

        <button
            class="back-button"
            id="news-back"
        >
            ← 返回首頁
        </button>

        <h2>
            📰 市場新聞
        </h2>

        ${html}
    `;

    document.getElementById(
        "news-back"
    ).onclick = showHome;

    document.querySelectorAll(
        ".news-card"
    ).forEach(card => {

        card.onclick = function () {

            showNewsDetail(
                Number(
                    card.dataset.newsId
                )
            );

        };

    });
}


// ========================================
// 新聞詳細
// ========================================

function showNewsDetail(newsId) {

    const item =
        news.find(
            n => n.id === newsId
        );

    if (!item) {
        return;
    }

    const stock =
        getStock(item.stockId);

    if (!stock) {
        return;
    }

    const page =
        document.getElementById(
            "news-page"
        );

    if (!page) {
        return;
    }

    hideAllPages();

    page.style.display = "block";

    const color =
        item.impact >= 0
            ? "red"
            : "green";

    const arrow =
        item.impact >= 0
            ? "▲"
            : "▼";

    page.innerHTML = `

        <button
            class="back-button"
            id="news-detail-back"
        >
            ← 返回新聞
        </button>

        <small>
            ${item.time}
        </small>

        <h2>
            ${item.title}
        </h2>

        <p>
            ${item.content}
        </p>

        <hr>

        <p>
            相關股票
        </p>

        <h3>
            ${stock.name}
        </h3>

        <p>
            ${stock.id} ・ ${stock.industry}
        </p>

        <div style="color:${color};">
            ${arrow}
            ${Math.abs(item.impact).toFixed(1)}%
        </div>
    `;

    document.getElementById(
        "news-detail-back"
    ).onclick = showNews;
}


// ========================================
// 股價自動變動
// ========================================

function updateStockPrices() {

    stocks.forEach(stock => {

        const movement =
            (Math.random() * 4 - 2) / 100;

        stock.price *=
            1 + movement;

        if (stock.price < 1) {
            stock.price = 1;
        }

        stock.change =
            movement * 100;
    });

    saveStocks();

    displayStocks();
    updateAccountDisplay();
}


// ========================================
// 導航
// ========================================

function setupNavigation() {

    const homeButton =
        document.getElementById(
            "home-button"
        );

    const marketButton =
        document.getElementById(
            "market-button"
        );

    const investmentButton =
        document.getElementById(
            "investment-button"
        );

    const newsButton =
        document.getElementById(
            "news-button"
        );

    const profileButton =
        document.getElementById(
            "profile-button"
        );


    if (homeButton) {
        homeButton.onclick = showHome;
    }


    if (marketButton) {
        marketButton.onclick = showMarket;
    }


    if (investmentButton) {
        investmentButton.onclick =
            showInvestment;
    }


    if (newsButton) {
        newsButton.onclick =
            showNews;
    }


    if (profileButton) {

        profileButton.onclick =
            function () {

                alert(
                    "個人中心即將推出！"
                );

            };
    }
}


// ========================================
// 啟動
// ========================================

function startApp() {

    setupNavigation();

    showHome();

    setInterval(
        updateStockPrices,
        30000
    );
}

startApp();
