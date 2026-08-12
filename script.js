const stocks = [
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


// =========================
// 玩家資料
// =========================

let player = JSON.parse(
    localStorage.getItem("mingyuePlayer")
);

if (!player) {

    player = {
        cash: 1000000,
        holdings: {}
    };

    savePlayer();
}


// =========================
// 保存資料
// =========================

function savePlayer() {

    localStorage.setItem(
        "mingyuePlayer",
        JSON.stringify(player)
    );
}


// =========================
// 更新首頁資產
// =========================

function updateAccountDisplay() {

    const cashDisplay =
        document.getElementById("cash-display");

    if (cashDisplay) {

        cashDisplay.textContent =
            `¥ ${player.cash.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            })}`;

    }
}


// =========================
// 股票列表
// =========================

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
            <strong>${stock.name}</strong>
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

        div.addEventListener("click", function () {

            showStock(stock.id);

        });

        list.appendChild(div);
    });
}


// =========================
// 股票詳細頁
// =========================

function showStock(stockId) {

    const stock =
        stocks.find(s => s.id === stockId);

    if (!stock) {
        return;
    }

    const list =
        document.getElementById("stock-list");

    const detail =
        document.getElementById("stock-detail");

    const investment =
        document.getElementById("investment-page");


    list.style.display = "none";

    detail.style.display = "block";

    investment.style.display = "none";


    const color =
        stock.change >= 0
            ? "red"
            : "green";

    const arrow =
        stock.change >= 0
            ? "▲"
            : "▼";


    detail.innerHTML = `

        <button id="back-button"
            style="
                border:none;
                background:none;
                font-size:18px;
                margin-bottom:15px;
            ">
            ← 返回行情
        </button>

        <h2>${stock.name}</h2>

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
            今日最高
            <br>
            ¥${(stock.price * 1.02).toFixed(2)}
        </p>

        <p>
            今日最低
            <br>
            ¥${(stock.price * 0.97).toFixed(2)}
        </p>

        <div class="stock-buttons">

            <button
                id="buy-button"
                class="buy-button">
                買入
            </button>

            <button
                id="sell-button"
                class="sell-button">
                賣出
            </button>

        </div>
    `;


    document
        .getElementById("back-button")
        .addEventListener("click", closeStock);


    document
        .getElementById("buy-button")
        .addEventListener("click", function () {

            buyStock(stock.id);
// =========================
// 賣出股票
// =========================

function sellStock(stockId) {

    const stock =
        stocks.find(s => s.id === stockId);

    if (!stock) {
        return;
    }


    // 查詢目前持股

    const ownedShares =
        player.holdings[stockId] || 0;


    // 沒有股票

    if (ownedShares <= 0) {

        alert(
            `你沒有持有 ${stock.name}。`
        );

        return;
    }


    // 輸入賣出股數

    const quantity = prompt(

        `賣出 ${stock.name}\n\n` +

        `目前股價：¥${stock.price.toFixed(2)}\n` +

        `目前持有：${ownedShares} 股\n\n` +

        `請輸入賣出股數：`

    );


    // 取消

    if (quantity === null) {
        return;
    }


    const shares =
        Number(quantity);


    // 檢查輸入

    if (
        !Number.isInteger(shares) ||
        shares <= 0
    ) {

        alert(
            "請輸入正整數股數。"
        );

        return;
    }


    // 檢查是否超過持股

    if (shares > ownedShares) {

        alert(

            `持股不足！\n\n` +

            `目前持有：${ownedShares} 股\n` +

            `你想賣出：${shares} 股`

        );

        return;
    }


    // 計算成交金額

    const total =
        stock.price * shares;


    // 減少持股

    player.holdings[stockId] -= shares;


    // 增加現金

    player.cash += total;


    // 如果已經全部賣掉

    if (player.holdings[stockId] === 0) {

        delete player.holdings[stockId];

    }


    // 保存

    savePlayer();


    // 更新首頁資產

    updateAccountDisplay();


    // 顯示結果

    alert(

        `賣出成功！\n\n` +

        `${stock.name}\n` +

        `${shares} 股\n` +

        `成交價格：¥${stock.price.toFixed(2)}\n` +

        `成交金額：¥${total.toFixed(2)}\n\n` +

        `剩餘持股：` +

        `${player.holdings[stockId] || 0} 股\n\n` +

        `可用資金：¥${player.cash.toFixed(2)}`

    );
}
        });


document
    .getElementById("sell-button")
    .addEventListener("click", function () {

        sellStock(stock.id);

    });
}


// =========================
// 返回行情
// =========================

function closeStock() {

    document.getElementById("stock-list")
        .style.display = "block";

    document.getElementById("stock-detail")
        .style.display = "none";

    document.getElementById("investment-page")
        .style.display = "none";
}


// =========================
// 買入
// =========================

function buyStock(stockId) {

    const stock =
        stocks.find(s => s.id === stockId);

    if (!stock) {
        return;
    }


    const quantity = prompt(
        `買入 ${stock.name}\n\n` +
        `目前股價：¥${stock.price.toFixed(2)}\n\n` +
        `可用資金：¥${player.cash.toFixed(2)}\n\n` +
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

        alert("請輸入正整數股數。");

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


    player.cash -= total;


    if (!player.holdings[stockId]) {

        player.holdings[stockId] = 0;

    }


    player.holdings[stockId] += shares;


    savePlayer();

    updateAccountDisplay();


    alert(
        `買入成功！\n\n` +
        `${stock.name}\n` +
        `${shares} 股\n` +
        `成交金額：¥${total.toFixed(2)}\n\n` +
        `剩餘資金：¥${player.cash.toFixed(2)}`
    );
}


// =========================
// 我的投資
// =========================

function showInvestment() {

    const list =
        document.getElementById("stock-list");

    const detail =
        document.getElementById("stock-detail");

    const page =
        document.getElementById("investment-page");


    list.style.display = "none";

    detail.style.display = "none";

    page.style.display = "block";


    let stockValue = 0;

    let holdingsHTML = "";


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


            holdingsHTML += `

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
                        市值
                        ¥${value.toFixed(2)}
                    </p>

                    <p style="color:${color};">
                        ${arrow}
                        ${Math.abs(stock.change).toFixed(2)}%
                    </p>

                </div>

            `;
        }
    });


    if (holdingsHTML === "") {

        holdingsHTML = `
            <p>目前沒有持有任何股票。</p>
        `;

    }


    const totalAssets =
        player.cash + stockValue;


    page.innerHTML = `

        <button id="investment-back"
            style="
                border:none;
                background:none;
                font-size:18px;
                margin-bottom:15px;
            ">
            ← 返回首頁
        </button>

        <h2>我的投資</h2>


        <div class="investment-card">

            <p>總資產</p>

            <div class="investment-value">
                ¥${totalAssets.toFixed(2)}
            </div>

        </div>


        <div class="investment-card">

            <p>可用現金</p>

            <h2>
                ¥${player.cash.toFixed(2)}
            </h2>

        </div>


        <div class="investment-card">

            <p>股票市值</p>

            <h2>
                ¥${stockValue.toFixed(2)}
            </h2>

        </div>


        <h2>持有股票</h2>


        <div class="investment-card">

            ${holdingsHTML}

        </div>
    `;


    document
        .getElementById("investment-back")
        .addEventListener("click", function () {

            page.style.display = "none";

            list.style.display = "block";

        });
}


// =========================
// 啟動 APP
// =========================

displayStocks();

updateAccountDisplay();


const investmentButton =
    document.getElementById("investment-button");


if (investmentButton) {

    investmentButton.addEventListener(
        "click",
        showInvestment
    );

}
