/* ========================================
   明月證券 v2.0
   script.js
======================================== */


/* ========================================
   預設股票
======================================== */

const DEFAULT_STOCKS = [

  {
    id: "MTR",
    name: "明月鐵路",
    company: "明月鐵路",
    industry: "交通",
    type: "既有企業",
    price: 142.70,
    previous: 135.77,
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
    previous: 84.95,
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
    previous: 54.12,
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
    previous: 72.10,
    volume: 6240,
    capital: 80000000,
    shares: 8000000
  }

];


/* ========================================
   LocalStorage
======================================== */

function loadData(key, fallback) {

  const data = localStorage.getItem(key);

  if (!data) {
    return fallback;
  }

  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }

}


function saveData(key, data) {

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

}


/* ========================================
   資料
======================================== */

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


let news = loadData(
  "mingyue_news_v2",
  [

    {
      id: 1,
      companyCode: "MTR",
      companyName: "明月鐵路",
      category: "company",
      title: "明月鐵路今日維持正常營運",
      content:
        "明月鐵路今日各主要路線維持正常營運。",
      time: "今天 08:00"
    },

    {
      id: 2,
      companyCode: "KMB",
      companyName: "國立京城大學附設生醫",
      category: "company",
      title: "附設生醫公布最新研究進度",
      content:
        "國立京城大學附設生醫股份有限公司公布最新研究計畫進度。",
      time: "今天 07:40"
    },

    {
      id: 3,
      companyCode: "HZI",
      companyName: "鎬子餐飲",
      category: "company",
      title: "鎬子餐飲公布新門市計畫",
      content:
        "鎬子餐飲股份有限公司宣布規劃新的餐飲據點。",
      time: "昨天 18:20"
    }

  ]
);


let historyData = loadData(
  "mingyue_history_v2",
  {}
);


/* ========================================
   建立歷史資料
======================================== */

function generateHistory(stock) {

  if (historyData[stock.id]) {
    return;
  }

  const result = [];

  let current = stock.previous;

  for (let i = 0; i < 30; i++) {

    const open = current;

    const movement =
      (Math.random() - 0.48) *
      current *
      0.035;

    const close =
      Math.max(
        1,
        open + movement
      );

    const high =
      Math.max(open, close) *
      (1 + Math.random() * 0.018);

    const low =
      Math.min(open, close) *
      (1 - Math.random() * 0.018);

    const volume =
      Math.floor(
        3000 +
        Math.random() * 20000
      );

    result.push({

      time:
        `08/${String(i + 1).padStart(2, "0")}`,

      open:
        Number(open.toFixed(2)),

      high:
        Number(high.toFixed(2)),

      low:
        Number(low.toFixed(2)),

      close:
        Number(close.toFixed(2)),

      volume

    });

    current = close;
  }

  historyData[stock.id] = result;

}


stocks.forEach(generateHistory);

saveData(
  "mingyue_history_v2",
  historyData
);


/* ========================================
   頁面切換
======================================== */

function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(element => {

      element.classList.remove("active");

    });


  const target =
    document.getElementById(
      `page-${page}`
    );


  if (target) {
    target.classList.add("active");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.remove("active");

      if (
        item.dataset.page === page
      ) {

        item.classList.add("active");

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


/* ========================================
   金額
======================================== */

function money(value) {

  return "¥" +
    Number(value).toLocaleString(
      "zh-TW",
      {
        maximumFractionDigits: 2
      }
    );

}


/* ========================================
   漲跌
======================================== */

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
    change >= 0 ? "▲" : "▼";

  const sign =
    change >= 0 ? "+" : "";

  return `${symbol} ${sign}${change.toFixed(2)}%`;

}


/* ========================================
   首頁
======================================== */

function renderHome() {

  const average =
    stocks.reduce(
      (sum, stock) =>
        sum + stock.price,
      0
    ) / stocks.length;


  const index =
    12500 +
    average * 1.7;


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


  const assets =
    document.getElementById(
      "home-assets"
    );


  if (assets) {
    assets.textContent =
      money(user.balance);
  }


  const wallet =
    document.getElementById(
      "home-wallet"
    );


  if (wallet) {
    wallet.textContent =
      money(user.wallet);
  }


  const topBalance =
    document.getElementById(
      "top-balance"
    );


  if (topBalance) {
    topBalance.textContent =
      money(user.balance);
  }


  const hot =
    [...stocks]
      .sort(
        (a, b) =>
          Math.abs(getChange(b)) -
          Math.abs(getChange(a))
      )
      .slice(0, 4);


  const container =
    document.getElementById(
      "home-hot-stocks"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    hot.map(stock => {

      const change =
        getChange(stock);

      const direction =
        change >= 0
          ? "up"
          : "down";


      return `

        <div
          class="stock-card"
          onclick="openStock('${stock.id}')"
        >

          <div>

            <div class="stock-name">
              ${stock.name}
            </div>

            <div class="stock-meta">
              ${stock.id} · ${stock.industry}
            </div>

          </div>


          <div class="stock-price">
            ${money(stock.price)}
          </div>


          <div class="stock-change ${direction}">
            ${changeText(stock)}
          </div>

        </div>

      `;

    }).join("");


  updateStats();

}


/* ========================================
   市場統計
======================================== */

function updateStats() {

  let up = 0;
  let down = 0;
  let volume = 0;


  stocks.forEach(stock => {

    if (
      stock.price >=
      stock.previous
    ) {

      up++;

    } else {

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
    upElement.textContent = up;
  }


  const downElement =
    document.getElementById(
      "stat-down"
    );


  if (downElement) {
    downElement.textContent = down;
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


/* ========================================
   行情
======================================== */

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
    button.classList.add("active");
  }


  renderMarket();

}


function renderMarket() {

  let list = [...stocks];


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


  if (list.length === 0) {

    container.innerHTML = `
      <div class="empty-state">
        沒有符合條件的股票
      </div>
    `;

    return;
  }


  container.innerHTML =
    list.map(stock => {

      const change =
        getChange(stock);

      const direction =
        change >= 0
          ? "up"
          : "down";


      return `

        <div
          class="stock-card"
          onclick="openStock('${stock.id}')"
        >

          <div>

            <div class="stock-name">
              ${stock.name}
            </div>

            <div class="stock-meta">
              ${stock.id} · ${stock.industry}
            </div>

          </div>


          <div class="stock-price">
            ${money(stock.price)}
          </div>


          <div class="stock-change ${direction}">
            ${changeText(stock)}
          </div>

        </div>

      `;

    }).join("");

}


/* ========================================
   股票詳細
======================================== */

let currentStockId = null;

let currentChart = null;

let currentChartType = "line";


function openStock(id) {

  currentStockId = id;


  const stock =
    stocks.find(
      item => item.id === id
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


  if (!data ||
      data.length === 0) {

    return {

      open: stock.price,
      high: stock.price,
      low: stock.price,
      close: stock.price

    };

  }


  return data[data.length - 1];

}


/* ========================================
   股票詳細頁
======================================== */

function renderStockDetail(stock) {

  const change =
    getChange(stock);

  const latest =
    getLatest(stock);


  const direction =
    change >= 0
      ? "up"
      : "down";


  const container =
    document.getElementById(
      "stock-detail"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `

    <div class="stock-detail-card">

      <div class="stock-detail-header">

        <div>

          <div class="stock-detail-company">
            ${stock.company}
          </div>

          <div class="stock-detail-title">
            ${stock.name}
          </div>

          <div class="stock-meta">
            ${stock.id} · ${stock.industry}
          </div>

        </div>


        <div>

          <div class="stock-detail-price">
            ${money(stock.price)}
          </div>

          <div
            class="stock-detail-change ${direction}"
          >
            ${changeText(stock)}
          </div>

        </div>

      </div>


      <div class="stock-info-grid">

        <div class="stock-info">
          <span>開盤</span>
          <strong>${money(latest.open)}</strong>
        </div>

        <div class="stock-info">
          <span>最高</span>
          <strong>${money(latest.high)}</strong>
        </div>

        <div class="stock-info">
          <span>最低</span>
          <strong>${money(latest.low)}</strong>
        </div>

        <div class="stock-info">
          <span>成交量</span>
          <strong>${stock.volume.toLocaleString()}</strong>
        </div>

      </div>


      <div class="chart-section">

        <div class="chart-header">

          <strong>
            ${stock.name} 股價走勢
          </strong>

          <div class="chart-buttons">

            <button
              class="chart-btn ${currentChartType === "line" ? "active" : ""}"
              onclick="switchChart('line')"
            >
              折線圖
            </button>

            <button
              class="chart-btn ${currentChartType === "candle" ? "active" : ""}"
              onclick="switchChart('candle')"
            >
              K線圖
            </button>

          </div>

        </div>


        <div class="chart-container">

          <canvas id="stock-chart"></canvas>

        </div>

      </div>


      <div class="trade-buttons">

        <button
          class="buy-btn"
          onclick="buyStock('${stock.id}')"
        >
          買入
        </button>

        <button
          class="sell-btn"
          onclick="sellStock('${stock.id}')"
        >
          賣出
        </button>

      </div>

    </div>

  `;


  drawChart(stock);

}


/* ========================================
   圖表
======================================== */

function switchChart(type) {

  currentChartType = type;


  const stock =
    stocks.find(
      item => item.id === currentStockId
    );


  if (!stock) {
    return;
  }


  renderStockDetail(stock);

}


function drawChart(stock) {

  if (
    typeof Chart === "undefined"
  ) {

    console.error(
      "Chart.js 尚未載入"
    );

    return;
  }


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
    historyData[stock.id] || [];


  const labels =
    data.map(
      item => item.time
    );


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

                label: stock.id,

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
    K線 Demo

    目前先將：
    最高
    收盤
    最低

    分開畫出來。

    之後可以再換成真正
    OHLC / Candlestick library。
  */

  currentChart =
    new Chart(
      canvas,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label: "最高",

              data:
                data.map(
                  item =>
                    item.high
                ),

              borderWidth: 1,

              pointRadius: 0

            },

            {

              label: "收盤",

              data:
                data.map(
                  item =>
                    item.close
                ),

              borderWidth: 2,

              pointRadius: 0

            },

            {

              label: "最低",

              data:
                data.map(
                  item =>
                    item.low
                ),

              borderWidth: 1,

              pointRadius: 0

            }

          ]

        },

        options: {

          responsive: true,

          maintainAspectRatio: false

        }

      }
    );

}


/* ========================================
   買入
======================================== */

function buyStock(id) {

  const stock =
    stocks.find(
      item => item.id === id
    );


  if (!stock) {
    return;
  }


  const amount =
    prompt(
      `目前股價 ${money(stock.price)}\n\n請輸入購買股數：`
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
    shares * stock.price;


  if (
    cost > user.balance
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
      oldShares * oldAverage +
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
      new Date().toLocaleString(
        "zh-TW"
      )

  });


  saveAll();


  showToast(
    `已買入 ${shares.toLocaleString()} 股 ${id}`
  );


  renderStockDetail(stock);

}


/* ========================================
   賣出
======================================== */

function sellStock(id) {

  const stock =
    stocks.find(
      item => item.id === id
    );


  if (!portfolio[id]) {

    showToast(
      "你目前沒有持有這支股票"
    );

    return;

  }


  const amount =
    prompt(
      `目前持有 ${portfolio[id].shares.toLocaleString()} 股\n\n請輸入賣出股數：`
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
    shares * stock.price;


  user.balance += revenue;


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
      new Date().toLocaleString(
        "zh-TW"
      )

  });


  saveAll();


  showToast(
    `已賣出 ${shares.toLocaleString()} 股 ${id}`
  );


  renderStockDetail(stock);

}


/* ========================================
   投資頁
======================================== */

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

  } else {

    list.innerHTML =
      entries.map(
        ([id, data]) => {

          const stock =
            stocks.find(
              item => item.id === id
            );


          if (!stock) {
            return "";
          }


          const value =
            data.shares *
            stock.price;


          return `

            <div class="list-row">

              <div>

                <div class="list-main">
                  ${stock.name} ${id}
                </div>

                <div class="list-sub">
                  ${data.shares.toLocaleString()} 股
                  · 成本 ${money(data.average)}
                </div>

              </div>


              <div class="list-value">
                ${money(value)}
              </div>

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

          <div class="list-row">

            <div>

              <div class="list-main">
                ${transaction.type}
                ${transaction.code}
              </div>

              <div class="list-sub">
                ${transaction.time}
                · ${transaction.shares.toLocaleString()} 股
              </div>

            </div>

            <div class="list-value">
              ${money(transaction.amount)}
            </div>

          </div>

        `
      )
      .join("");

}


/* ========================================
   儲值
======================================== */

function openDepositModal() {

  const modal =
    document.getElementById(
      "deposit-modal"
    );


  if (modal) {
    modal.classList.add("show");
  }

}


function depositMoney() {

  const input =
    document.getElementById(
      "deposit-amount"
    );


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
    amount > user.wallet
  ) {

    showToast(
      "遊戲錢包餘額不足"
    );

    return;

  }


  user.wallet -= amount;

  user.balance += amount;


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


/* ========================================
   Google Login Demo
======================================== */

function googleLogin() {

  showToast(
    "Google 實名認證將在正式後端版本接入"
  );

}


/* ========================================
   公司
======================================== */

function openCompanyModal() {

  const modal =
    document.getElementById(
      "company-modal"
    );


  if (modal) {
    modal.classList.add("show");
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
    )
    .value
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
      new Date().toLocaleDateString(
        "zh-TW"
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


/* ========================================
   我的公司
======================================== */

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

      <h1>🏢 我的公司</h1>

      <div class="empty-state">

        你目前還沒有註冊公司。

        <br><br>

        <button
          class="primary-btn"
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
      company => `

        <div class="company-card">

          <div class="company-status">
            ${company.status}
          </div>


          <div class="company-name">
            ${company.name}
          </div>


          <div class="company-code">
            ${company.code}
            ·
            ${company.industry}
          </div>


          <div class="company-info">

            <div class="company-info-item">

              <span>
                註冊資本
              </span>

              <strong>
                ${money(company.capital)}
              </strong>

            </div>


            <div class="company-info-item">

              <span>
                公司狀態
              </span>

              <strong>
                ${company.listed
                  ? "上市"
                  : "未上市"}
              </strong>

            </div>


            <div class="company-info-item">

              <span>
                成立日期
              </span>

              <strong>
                ${company.createdAt}
              </strong>

            </div>


            <div class="company-info-item">

              <span>
                公司代號
              </span>

              <strong>
                ${company.code}
              </strong>

            </div>

          </div>


          <div class="company-actions">

            <button
              class="company-action"
              onclick="publishCompanyNews('${company.code}')"
            >
              📰 發布新聞
            </button>


            <button
              class="company-action"
              onclick="companyIPO('${company.code}')"
            >
              📈 IPO / 上市
            </button>


            <button
              class="company-action"
              onclick="companyShareholders('${company.code}')"
            >
              👥 股東
            </button>


            <button
              class="company-action"
              onclick="companyFinance('${company.code}')"
            >
              💰 財務
            </button>

          </div>

        </div>

      `
    ).join("");

}


/* ========================================
   公司新聞
======================================== */

function publishCompanyNews(
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


  news.unshift({

    id: Date.now(),

    companyCode:
      company.code,

    companyName:
      company.name,

    category:
      "company",

    title,

    content,

    time:
      "剛剛"

  });


  saveData(
    "mingyue_news_v2",
    news
  );


  showToast(
    "新聞已發布"
  );

}


/* ========================================
   公司功能 Demo
======================================== */

function companyIPO(code) {

  const company =
    companies.find(
      item =>
        item.code === code
    );


  if (!company) {
    return;
  }


  showToast(
    `「${company.name}」IPO 功能準備中`
  );

}


function companyShareholders(code) {

  showToast(
    "股東系統準備中"
  );

}


function companyFinance(code) {

  showToast(
    "公司財務系統準備中"
  );

}


/* ========================================
   新聞
======================================== */

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


  if (list.length === 0) {

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

            ${item.companyName}

            ${
              item.companyCode
                ? " · " +
                  item.companyCode
                : ""
            }

          </div>


          <div class="news-title">
            ${item.title}
          </div>


          <div class="news-content">
            ${item.content}
          </div>


          <div class="news-time">
            ${item.time}
          </div>

        </article>

      `
    ).join("");

}


function openNews(id) {

  const item =
    news.find(
      newsItem =>
        String(newsItem.id) ===
        String(id)
    );


  if (!item) {
    return;
  }


  alert(
    `${item.title}\n\n${item.content}\n\n${item.time}`
  );

}


/* ========================================
   個人
======================================== */

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

}


/* ========================================
   儲存全部
======================================== */

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
    "mingyue_history_v2",
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


/* ========================================
   Toast
======================================== */

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


/* ========================================
   Modal 背景關閉
======================================== */

document
  .querySelectorAll(
    ".modal"
  )
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


/* ========================================
   關閉 Modal
======================================== */

function closeModal(id) {

  const modal =
    document.getElementById(id);


  if (modal) {

    modal.classList.remove(
      "show"
    );

  }

}


/* ========================================
   模擬市場波動
======================================== */

function updateMarket() {

  stocks.forEach(
    stock => {

      const oldPrice =
        stock.price;


      /*
        獨立波動模型

        不再使用固定倍數：
        price * 1.05

        每次產生獨立變動。
      */

      const volatility =
        0.008 +
        Math.random() *
        0.018;


      const direction =
        Math.random() > 0.5
          ? 1
          : -1;


      const movement =
        oldPrice *
        volatility *
        direction;


      const newPrice =
        Math.max(
          1,
          oldPrice +
          movement
        );


      stock.previous =
        oldPrice;


      stock.price =
        Number(
          newPrice.toFixed(2)
        );


      stock.volume +=
        Math.floor(
          Math.random() *
          1000
        );


      if (
        !historyData[stock.id]
      ) {

        historyData[stock.id] =
          [];

      }


      const open =
        oldPrice;


      const close =
        stock.price;


      const high =
        Math.max(
          open,
          close
        ) *
        (
          1 +
          Math.random() *
          0.012
        );


      const low =
        Math.min(
          open,
          close
        ) *
        (
          1 -
          Math.random() *
          0.012
        );


      historyData[
        stock.id
      ].push({

        time:
          new Date()
            .toLocaleTimeString(
              "zh-TW",
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            ),

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
            2000
          )

      });


      if (
        historyData[
          stock.id
        ].length > 50
      ) {

        historyData[
          stock.id
        ].shift();

      }

    }
  );


  saveAll();


  renderHome();


  const marketPage =
    document.getElementById(
      "page-market"
    );


  if (
    marketPage &&
    marketPage.classList.contains(
      "active"
    )
  ) {

    renderMarket();

  }


  const stockPage =
    document.getElementById(
      "page-stock"
    );


  if (
    stockPage &&
    stockPage.classList.contains(
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


/* ========================================
   啟動
======================================== */

renderHome();

renderMarket();

renderPortfolio();

renderNews();

renderProfile();


/*
  Demo 市場每 15 秒更新一次
*/

setInterval(
  updateMarket,
  15000
);
