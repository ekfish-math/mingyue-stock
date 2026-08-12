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
// 玩家帳戶
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
// 保存玩家資料
// =========================

function savePlayer() {

    localStorage.setItem(
        "mingyuePlayer",
        JSON.stringify(player)
    );
}


// =========================
// 顯示股票
// =========================

function displayStocks() {

    const list = document.getElementById("stock-list");

    list.innerHTML = "";

    stocks.forEach(stock => {

        const div = document.createElement("div");

        div.className = "stock";

        const color = stock.change >= 0 ? "red" : "green";
        const arrow = stock.change >= 0 ? "▲" : "▼";

        div.innerHTML = `
            <strong>${stock.name}</strong>
            <br>

            <small>${stock.id} ・ ${stock.industry}</small>

            <p>
                ¥${stock.price.toFixed(2)}

                <span style="color:${color};">
                    ${arrow} ${Math.abs(stock.change).toFixed(2)}%
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

    const stock = stocks.find(s => s.id === stockId);

    if (!stock) {
        return;
    }

    const list = document.getElementById("stock-list");
    const detail = document.getElementById("stock-detail");

    list.style.display = "none";
    detail.style.display = "block";

    const color = stock.change >= 0 ? "red" : "green";
    const arrow = stock.change >= 0 ? "▲" : "▼";

    detail.innerHTML = `
        <button id="back-button" style="
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

        <div class="stock-change" style="color:${color};">
            ${arrow} ${Math.abs(stock.change).toFixed(2)}%
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

            <button id="buy-button" class="buy-button">
                買入
            </button>

            <button id="sell-button" class="sell-button">
                賣出
            </button>

        </div>
    `;


    document
        .getElementById("back-button")
        .addEventListener("click", function () {

            closeStock();

        });


    document
        .getElementById("buy-button")
        .addEventListener("click", function () {

            buyStock(stock.id);

        });


    document
        .getElementById("sell-button")
        .addEventListener("click", function () {

            alert("賣出功能即將推出！");

        });
}


// =========================
// 返回行情
// =========================

function closeStock() {

    const list = document.getElementById("stock-list");
    const detail = document.getElementById("stock-detail");

    list.style.display = "block";
    detail.style.display = "none";
}


// =========================
// 買入股票
// =========================

function buyStock(stockId) {

    const stock = stocks.find(s => s.id === stockId);

    if (!stock) {
        return;
    }

    const quantity = prompt(
        `買入 ${stock.name}\n\n` +
        `目前股價：¥${stock.price.toFixed(2)}\n\n` +
        `請輸入購買股數：`
    );


    if (quantity === null) {
        return;
    }


    const shares = Number(quantity);


    if (!Number.isInteger(shares) || shares <= 0) {

        alert("請輸入正整數股數。");

        return;
    }


    const total = stock.price * shares;


    if (total > player.cash) {

        alert(
            `資金不足！\n\n` +
            `需要：¥${total.toFixed(2)}\n` +
            `可用：¥${player.cash.toFixed(2)}`
        );

        return;
    }


    // 扣錢
    player.cash -= total;


    // 增加持股
    if (!player.holdings[stockId]) {

        player.holdings[stockId] = 0;

    }


    player.holdings[stockId] += shares;


    // 保存
    savePlayer();


    alert(
        `買入成功！\n\n` +
        `${stock.name}\n` +
        `${shares} 股\n` +
        `成交金額：¥${total.toFixed(2)}\n\n` +
        `剩餘資金：¥${player.cash.toFixed(2)}`
    );
}


// =========================
// 啟動 APP
// =========================

displayStocks();
