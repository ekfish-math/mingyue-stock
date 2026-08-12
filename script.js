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


function displayStocks() {

    const list = document.getElementById("stock-list");

    list.innerHTML = "";

    stocks.forEach(stock => {

        const div = document.createElement("div");

        div.className = "stock";

        // 漲紅、跌綠
        const color = stock.change >= 0 ? "red" : "green";

        const arrow = stock.change >= 0 ? "▲" : "▼";

        div.innerHTML = `
            <strong>${stock.name}</strong>
            <br>

            <small>${stock.id} ・ ${stock.industry}</small>

            <p>
                ¥${stock.price.toFixed(2)}

                <span style="color: ${color};">
                    ${arrow} ${Math.abs(stock.change).toFixed(2)}%
                </span>
            </p>
        `;

        // 點擊股票
        div.addEventListener("click", function() {
            showStock(stock.id);
        });

        list.appendChild(div);
    });
}


// 顯示股票資料
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
        <button onclick="closeStock()" style="
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

            <button class="buy-button">
                買入
            </button>

            <button class="sell-button">
                賣出
            </button>

        </div>
    `;
}

function closeStock() {

    const list = document.getElementById("stock-list");
    const detail = document.getElementById("stock-detail");

    list.style.display = "block";

    detail.style.display = "none";
}

displayStocks();
