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

        // 點擊股票
        div.onclick = () => showStock(stock.id);

        const direction = stock.change >= 0 ? "up" : "down";

        const arrow = stock.change >= 0 ? "▲" : "▼";

        div.innerHTML = `
            <strong>${stock.name}</strong>
            <br>

            <small>${stock.id} ・ ${stock.industry}</small>

            <p>
                ¥${stock.price.toFixed(2)}

                <span class="${direction}">
                    ${arrow} ${Math.abs(stock.change).toFixed(2)}%
                </span>
            </p>
        `;

        list.appendChild(div);
    });
}


// 顯示股票詳細資料
function showStock(stockId) {

    const stock = stocks.find(s => s.id === stockId);

    if (!stock) {
        return;
    }

    alert(
        `${stock.name}\n` +
        `股票代號：${stock.id}\n` +
        `現價：¥${stock.price.toFixed(2)}\n` +
        `漲跌：${stock.change >= 0 ? "▲" : "▼"} ${Math.abs(stock.change).toFixed(2)}%\n` +
        `產業：${stock.industry}`
    );
}


displayStocks();
