const API_BASE_URL = CONFIG.API_BASE_URL;
let wsConnected = false;
let lastWsUpdate = 0;

/* ===========================================================
      SYMBOL NORMALIZATION (CLEAN & CANONICAL)
   =========================================================== */

function normalizeCommoditySymbol(symbol) {
    return symbol ? symbol.toUpperCase() : "";
}

/* ===========================================================
      SYMBOL MAPS
   =========================================================== */

const WS_FOREX_SYMBOL_MAP = {
    EURUSD: "EUR/USD",
    GBPUSD: "GBP/USD",
    USDJPY: "USD/JPY",
    USDZAR: "USD/ZAR",
    EURZAR: "EUR/ZAR",
    GBPZAR: "GBP/ZAR",
    AUDUSD: "AUD/USD",
    USDCHF: "USD/CHF",
    XAUUSD: "XAU/USD", // Gold spot
    XAGUSD: "XAG/USD", // Silver spot
    XPTUSD: "XPT/USD"  // Platinum spot
};

/* ===========================================================
      HEATMAP
   =========================================================== */

function colorCell(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return "";
    return pct >= 0 ? "green-cell" : "red-cell";
}

function formatPct(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return "--";
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

async function loadHeatmapTable() {
    const tableBody = document.querySelector("#heatmap-table tbody");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE_URL}/forex-heatmap`);
        const data = await response.json();

        tableBody.innerHTML = "";

        Object.entries(data).forEach(([symbol, tf]) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${symbol}</td>
                <td class="${colorCell(tf["1h"])}">${formatPct(tf["1h"])}</td>
                <td class="${colorCell(tf["4h"])}">${formatPct(tf["4h"])}</td>
                <td class="${colorCell(tf["1d"])}">${formatPct(tf["1d"])}</td>
                <td class="${colorCell(tf["1w"])}">${formatPct(tf["1w"])}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Heatmap error:", err);
    }
}

/* ===========================================================
      FOREX LIST (REST)
   =========================================================== */

async function loadForex() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex`);
        const data = await response.json();

        const container = document.getElementById("forex-list");
        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "market-item forex-card";
            div.setAttribute("data-pair", item.pair);

            const pairSlug = item.pair.replace("/", "").toLowerCase();

            div.innerHTML = `
                <a href="pair-${pairSlug}.html"
                   style="text-decoration:none;color:inherit;display:flex;justify-content:space-between;width:100%;">
                    <div class="market-info">
                        <h3>${item.pair}</h3>
                        <p>${item.name}</p>
                    </div>
                    <div class="performance ${item.trend}">
                        <div class="forex-price">${item.price}</div>
                        <div class="forex-change">${item.change}</div>
                    </div>
                </a>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Forex error:", err);
    }
}

/* ===========================================================
      FOREX WEBSOCKET UPDATE
   =========================================================== */

function applyForexUpdate(pair, price, changePercent) {
    const card = document.querySelector(`.forex-card[data-pair="${pair}"]`);
    if (!card) return;

    card.querySelector(".forex-price").textContent = Number(price).toFixed(4);
    card.querySelector(".forex-change").textContent =
        `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

    const perf = card.querySelector(".performance");
    perf.classList.toggle("positive", changePercent >= 0);
    perf.classList.toggle("negative", changePercent < 0);
}

/* ===========================================================
      COMMODITIES (REST = INVENTORY)
   =========================================================== */

async function loadCommodities() {
    try {
        const response = await fetch(`${API_BASE_URL}/commodities`);
        const data = await response.json();

        const container = document.getElementById("commodities-list");
        container.innerHTML = "";

        data.forEach(item => {
            const symbol = normalizeCommoditySymbol(item.symbol);
            const pct = parseFloat(item.change) || 0;

            const div = document.createElement("div");
            div.className = "market-item";
            div.setAttribute("data-symbol", symbol);

            div.innerHTML = `
                <a href="commodity-${symbol.toLowerCase()}.html"
                   style="text-decoration:none;color:inherit;display:flex;justify-content:space-between;width:100%;">
                    <div class="market-info">
                        <h3>${item.name}</h3>
                        <p class="commodity-symbol">${symbol}</p>
                    </div>
                    <div class="performance ${pct >= 0 ? "positive" : "negative"}">
                        <span class="commodity-price">${item.price}</span>
                        <span class="commodity-change">${item.change}</span>
                    </div>
                </a>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Commodities error:", err);
    }
}

/* ===========================================================
      COMMODITY WEBSOCKET UPDATE
   =========================================================== */

function applyCommodityUpdate(symbol, price, changePercent) {
    const normalized = normalizeCommoditySymbol(symbol);
    const card = document.querySelector(`.market-item[data-symbol="${normalized}"]`);
    if (!card) return;

    card.querySelector(".commodity-price").textContent = Number(price).toFixed(2);
    card.querySelector(".commodity-change").textContent =
        `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

    const perf = card.querySelector(".performance");
    perf.classList.toggle("positive", changePercent >= 0);
    perf.classList.toggle("negative", changePercent < 0);
}

/* ===========================================================
      WEBSOCKET CONNECTION
   =========================================================== */

function connectForexSocket() {
    const socket = new WebSocket(CONFIG.WS_BASE_URL);

    socket.addEventListener("open", () => {
        wsConnected = true;
        console.log("✅ Forex / Commodities WS connected");
    });

    socket.addEventListener("message", (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "forex") {
            const pair = msg.pair || WS_FOREX_SYMBOL_MAP[msg.symbol];
            if (pair) applyForexUpdate(pair, msg.price, msg.changePercent);
            lastWsUpdate = Date.now();
        }

        if (msg.type === "commodity") {
            applyCommodityUpdate(msg.symbol, msg.price, msg.changePercent);
        }
    });

    socket.addEventListener("close", () => {
        wsConnected = false;
        setTimeout(connectForexSocket, 3000);
    });
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadHeatmapTable();
    loadForex();
    loadCommodities();
    connectForexSocket();

    setInterval(() => {
        if (!wsConnected || Date.now() - lastWsUpdate > 30000) {
            loadForex();
            loadCommodities();
        }
    }, 10000);
});
