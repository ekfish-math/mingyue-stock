// ========================================
// 明月證券 v1.4
// 動態股價 + 買賣 + 投資 + 交易紀錄
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
        industry: "金融",
        volatility: 0.004
    },

    {
        id: "KST",
        name: "京城鋼鐵",
        price: 87.20,
        change: 1.82,
        industry: "工業",
        volatility: 0.006
    },

    {
        id: "EAS",
        name: "東海航運",
        price: 63.80,
        change: -2.13,
        industry: "交通",
        volatility: 0.009
    },

    {
        id: "MTR",
        name: "明月鐵路",
        price: 142.70,
        change: 5.10,
        industry: "交通",
        volatility: 0.005
    }

];


// ========================================
// 載入股票價格
// ========================================

let stocks = JSON.parse(
    localStorage.getItem("mingyueStocks")
);


if (!stocks) {

    stocks = defaultStocks;

    localStorage.setItem(
        "mingyueStocks",
        JSON.stringify(stocks)
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


// 舊版本資料相容

if (!player.holdings) {

    player.holdings = {};

}


if (!player.transactions) {

    player.transactions = [];

}


savePlayer();


// ========================================
// 儲存玩家
// ========================================

function savePlayer() {

    localStorage.setItem(
        "mingyuePlayer",
        JSON.stringify(player)
    );

}


// ========================================
// 儲存股票
// ========================================

function saveStocks() {

    localStorage.setItem(
        "mingyueStocks",
        JSON.stringify(stocks)
    );

}


// ========================================
// 找股票
// ========================================

function getStock(stockId) {

    return stocks.find(
        stock => stock.id === stockId
    );

}


// ========================================
// 更新首頁現金
// ========================================

function updateAccountDisplay() {

    const display =
        document.getElementById(
            "cash-display"
        );


    if (!display) {

        return;

    }


    display.textContent =
        `¥ ${player.cash.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

}


// ========================================
// 隱藏所有頁面
// ========================================

function hideAllPages() {

    const home =
        document.getElementById("home-page");

    const detail =
        document.getElementById("stock-detail");

    const investment =
        document.getElementById(
            "investment-page"
        );

    const transaction =
        document.getElementById(
            "transaction-page"
        );


    if (home) {

        home.style.display = "none";

    }


    if (detail) {

        detail.style.display = "none";

    }


    if (investment) {

        investment.style.display = "none";

    }


    if (transaction) {

        transaction.style.display = "none";

    }

}


// ========================================
// 首頁
// ========================================

function showHome() {

    hideAllPages();


    const home =
        document.getElementById(
            "home-page"
        );


    if (home) {

        home.style.display = "block";

    }


    displayStocks();

    updateAccountDisplay();

}


// ========================================
// 股票列表
// ========================================

function displayStocks() {

    const list =
        document.getElementById(
            "stock-list"
        );


    if (!list) {

        return;

    }


    list.innerHTML = "";


    stocks.forEach(stock => {

        const div =
            document.createElement(
                "div"
            );


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
                ${stock.id}
                ・
                ${stock.industry}
            </small>

            <p>

                ¥${stock.price.toFixed(2)}

                <span
                    style="color:${color};"
                >

                    ${arrow}
                    ${Math.abs(
                        stock.change
                    ).toFixed(2)}%

                </span>

            </p>

        `;


        div.addEventListener(
            "click",
            function () {

                showStock(stock.id);

            }
        );


        list.appendChild(div);

    });

}


// ========================================
// 股票詳細頁
// ========================================

function showStock(stockId) {

    const stock =
        getStock(stockId);


    if (!stock) {

        return;

    }


    hideAllPages();


    const detail =
        document.getElementById(
            "stock-detail"
        );


    if (!detail) {

        return;

    }


    detail.style.display = "block";


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


    detail.innerHTML = `

        <button
            id="back-market"
            class="back-button"
        >
            ← 返回行情
        </button>


        <h2>
            ${stock.name}
        </h2>


        <div class="stock-code">

            ${stock.id}
            ・
            ${stock.industry}

        </div>


        <div class="stock-price">

            ¥${stock.price.toFixed(2)}

        </div>


        <div
            class="stock-change"
            style="color:${color};"
        >

            ${arrow}
            ${Math.abs(
                stock.change
            ).toFixed(2)}%

        </div>


        <hr>


        <p>

            今日最高
            <br>

            <strong>
                ¥${(
                    stock.price * 1.02
                ).toFixed(2)}
            </strong>

        </p>


        <p>

            今日最低
            <br>

            <strong>
                ¥${(
                    stock.price * 0.97
                ).toFixed(2)}
            </strong>

        </p>


        <p>

            我的持股
            <br>

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


    document
        .getElementById(
            "back-market"
        )
        .onclick = showHome;


    document
        .getElementById(
            "buy-button"
        )
        .onclick = function () {

            buyStock(stockId);

        };


    document
        .getElementById(
            "sell-button"
        )
        .onclick = function () {

            sellStock(stockId);

        };

}


// ========================================
// 買入股票
// ========================================

function buyStock(stockId) {

    const stock =
        getStock(stockId);


    if (!stock) {

        return;

    }


    const quantity =
        prompt(

            `買入 ${stock.name}\n\n` +

            `目前股價：¥${stock.price.toFixed(2)}\n` +

            `可用資金：¥${player.cash.toFixed(2)}\n\n` +

            `請輸入購買股數：`

        );


    if (quantity === null) {

        return;

    }


    const shares =
        Number(quantity);


    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {

        alert(
            "請輸入正整數股數。"
        );

        return;

    }


    const total =
        stock.price * shares;


    if (total > player.cash) {

        alert(

            `資金不足！\n\n` +

            `需要：¥${total.toFixed(2)}\n` +

            `可用：¥${player.cash.toFixed(2)}`

        );

        return;

    }


    // 扣除現金

    player.cash -= total;


    // 增加持股

    if (!player.holdings[stockId]) {

        player.holdings[stockId] = 0;

    }


    player.holdings[stockId] += shares;


    // 建立交易紀錄

    player.transactions.push({

        type: "買入",

        stockId: stock.id,

        stockName: stock.name,

        shares: shares,

        price: stock.price,

        total: total,

        time:
            new Date().toLocaleString(
                "zh-TW"
            )

    });


    savePlayer();

    updateAccountDisplay();


    alert(

        `買入成功！\n\n` +

        `${stock.name}\n` +

        `${shares} 股\n` +

        `成交價格：¥${stock.price.toFixed(2)}\n` +

        `成交金額：¥${total.toFixed(2)}\n\n` +

        `剩餘資金：¥${player.cash.toFixed(2)}`

    );


    showStock(stockId);

}


// ========================================
// 賣出股票
// ========================================

function sellStock(stockId) {

    const stock =
        getStock(stockId);


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


    const quantity =
        prompt(

            `賣出 ${stock.name}\n\n` +

            `目前股價：¥${stock.price.toFixed(2)}\n` +

            `目前持有：${owned} 股\n\n` +

            `請輸入賣出股數：`

        );


    if (quantity === null) {

        return;

    }


    const shares =
        Number(quantity);


    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {

        alert(
            "請輸入正整數股數。"
        );

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


    // 減少持股

    player.holdings[stockId] -= shares;


    // 增加現金

    player.cash += total;


    if (
        player.holdings[stockId] === 0
    ) {

        delete player.holdings[stockId];

    }


    // 建立交易紀錄

    player.transactions.push({

        type: "賣出",

        stockId: stock.id,

        stockName: stock.name,

        shares: shares,

        price: stock.price,

        total: total,

        time:
            new Date().toLocaleString(
                "zh-TW"
            )

    });


    savePlayer();

    updateAccountDisplay();


    alert(

        `賣出成功！\n\n` +

        `${stock.name}\n` +

        `${shares} 股\n` +

        `成交價格：¥${stock.price.toFixed(2)}\n` +

        `成交金額：¥${total.toFixed(2)}\n\n` +

        `剩餘持股：${
            player.holdings[stockId] || 0
        } 股\n\n` +

        `可用資金：¥${player.cash.toFixed(2)}`

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


        if (shares > 0) {

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
                        ${stock.id}
                        ・
                        ${stock.industry}
                    </small>


                    <p>
                        持有 ${shares} 股
                    </p>


                    <p>
                        市值
                        ¥${value.toFixed(2)}
                    </p>


                    <p
                        style="color:${color};"
                    >

                        ${arrow}
                        ${Math.abs(
                            stock.change
                        ).toFixed(2)}%

                    </p>

                </div>

            `;

        }

    });


    if (!html) {

        html =
            "<p>目前沒有持有任何股票。</p>";

    }


    const totalAssets =
        player.cash + stockValue;


    page.innerHTML = `

        <button
            id="investment-back"
            class="back-button"
        >
            ← 返回首頁
        </button>


        <h2>
            我的投資
        </h2>


        <div class="card">

            <p>
                總資產
            </p>

            <h2>
                ¥${totalAssets.toFixed(2)}
            </h2>

        </div>


        <div class="card">

            <p>
                可用現金
            </p>

            <h2>
                ¥${player.cash.toFixed(2)}
            </h2>

        </div>


        <div class="card">

            <p>
                股票市值
            </p>

            <h2>
                ¥${stockValue.toFixed(2)}
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
            id="transactions-button"
            class="transaction-button"
        >
            🧾 查看交易紀錄
        </button>

    `;


    document
        .getElementById(
            "investment-back"
        )
        .onclick = showHome;


    document
        .getElementById(
            "transactions-button"
        )
        .onclick = showTransactions;

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
        [
            ...player.transactions
        ].reverse();


    if (
        transactions.length === 0
    ) {

        html =
            "<p>目前沒有交易紀錄。</p>";

    }


    transactions.forEach(
        transaction => {

            const color =
                transaction.type === "買入"
                    ? "red"
                    : "green";


            html += `

                <div class="transaction">

                    <strong
                        style="color:${color};"
                    >
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
                        ¥${transaction.price.toFixed(2)}
                    </p>


                    <p>
                        成交金額
                        ¥${transaction.total.toFixed(2)}
                    </p>


                    <small>
                        ${transaction.time}
                    </small>

                </div>

            `;

        }
    );


    page.innerHTML = `

        <button
            id="transactions-back"
            class="back-button"
        >
            ← 返回投資
        </button>


        <h2>
            交易紀錄
        </h2>


        ${html}

    `;


    document
        .getElementById(
            "transactions-back"
        )
        .onclick = showInvestment;

}


// ========================================
// 動態股價系統
// ========================================

function updateStockPrices() {

    stocks.forEach(stock => {

        // 隨機產生漲跌
        const movement =
            (Math.random() - 0.5)
            * 2
            * stock.volatility;


        // 更新價格

        stock.price =
            stock.price *
            (1 + movement);


        // 價格最低 ¥1

        if (stock.price < 1) {

            stock.price = 1;

        }


        // 更新漲跌幅

        stock.change =
            movement * 100;

    });


    // 儲存最新股價

    saveStocks();


    // 更新首頁

    displayStocks();

    updateAccountDisplay();

}


// ========================================
// 導航
// ========================================

const homeButton =
    document.getElementById(
        "home-button"
    );

if (homeButton) {

    homeButton.onclick =
        showHome;

}


const marketButton =
    document.getElementById(
        "market-button"
    );

if (marketButton) {

    marketButton.onclick =
        showHome;

}


const investmentButton =
    document.getElementById(
        "investment-button"
    );

if (investmentButton) {

    investmentButton.onclick =
        showInvestment;

}


const newsButton =
    document.getElementById(
        "news-button"
    );

if (newsButton) {

    newsButton.onclick =
        function () {

            alert(
                "新聞系統即將推出！"
            );

        };

}


const profileButton =
    document.getElementById(
        "profile-button"
    );

if (profileButton) {

    profileButton.onclick =
        function () {

            alert(
                "個人中心即將推出！"
            );

        };

}


// ========================================
// 啟動 APP
// ========================================

displayStocks();

updateAccountDisplay();


// ========================================
// 每 30 秒更新一次股價
// ========================================

setInterval(
    updateStockPrices,
    30000
);
