const API_BASE_URL = CONFIG.API_BASE_URL;
const WS_BASE_URL = CONFIG.WS_BASE_URL;
let wsConnected = false;
let lastWsUpdate = 0;

const WS_FOREX_SYMBOL_MAP = {
    EURUSD: "EUR/USD",
    GBPUSD: "GBP/USD",
    USDJPY: "USD/JPY",
    USDZAR: "USD/ZAR",
    EURZAR: "EUR/ZAR",
    GBPZAR: "GBP/ZAR",
    AUDUSD: "AUD/USD",
    USDCHF: "USD/CHF"
};

// Store commodity data globally for sentiment calculation
let commodityData = [];

/* ===========================================================
      REAL MULTI-TIMEFRAME HEATMAP
   =========================================================== */

function colorCell(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) {
        return "";
    }
    return pct >= 0 ? "green-cell" : "red-cell";
}

function formatPct(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) {
        return "--";
    }
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
}

async function loadHeatmapTable() {
    const tableBody = document.querySelector("#heatmap-table tbody");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading... </td></tr>`;

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
        tableBody. innerHTML = `
            <tr><td colspan="5" style="text-align:center;color:red;">
                Failed to load heatmap. 
            </td></tr>
        `;
    }
}

/* ===========================================================
      FOREX LIST - CLICKABLE
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
            const pairUrl = `pair-${pairSlug}.html`;

            div.innerHTML = `
                <a href="${pairUrl}" 
                   style="text-decoration:  none;color:inherit;display: flex;align-items:center;justify-content:space-between;width:100%;">
                    <div class="market-info">
                        <h3>${item.pair}</h3>
                        <p>${item.name}</p>
                    </div>
                    <div class="performance ${item.trend}">
                        <div class="forex-price" style="font-size: 1.2em; font-weight: bold; margin-bottom: 4px;">${item.price}</div>
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
      FOREX WEBSOCKET (INSTANT UPDATES)
   =========================================================== */

function applyForexUpdate(pair, price, changePercent) {
    const card = document.querySelector(`.forex-card[data-pair="${pair}"]`);
    if (!card) return;

    const priceEl = card.querySelector(".forex-price");
    const changeEl = card.querySelector(".forex-change");
    const perfEl = card.querySelector(".performance");

    if (priceEl) priceEl.textContent = Number(price).toFixed(4);
    if (changeEl) {
        const pct = Number(changePercent) || 0;
        changeEl.textContent = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    }

    if (perfEl) {
        perfEl.classList.remove("positive", "negative");
        perfEl.classList.add(Number(changePercent) >= 0 ? "positive" : "negative");
    }
}

function connectForexSocket() {
    const socket = new WebSocket(WS_BASE_URL);

    socket.addEventListener("open", () => {
        wsConnected = true;
        console.log("✅ Forex WS connected");
    });

    socket.addEventListener("message", (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type !== "forex") return;

            const pair = msg.pair || WS_FOREX_SYMBOL_MAP[msg.symbol];
            if (!pair) return;

            applyForexUpdate(pair, msg.price, msg.changePercent);
            lastWsUpdate = Date.now();
        } catch (err) {
            console.error("Forex WS parse error:", err);
        }
    });

    socket.addEventListener("error", (err) => {
        console.error("❌ Forex WS error:", err);
        wsConnected = false;
    });

    socket.addEventListener("close", () => {
        wsConnected = false;
        console.log("⚠️ Forex WS disconnected, retrying...");
        setTimeout(connectForexSocket, 3000);
    });
}

/* ===========================================================
      FOREX STRENGTH METER (KEEP AS-IS)
   =========================================================== */

async function loadStrength() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex-strength`);
        const data = await response.json();

        const container = document.getElementById("strength-list");
        container.innerHTML = "";

        Object.entries(data).forEach(([currency, status]) => {
            const icon =
                status === "Strong" ? "🔥" :  
                status === "Weak"   ? "🔻" : 
                                      "⚪";

            const div = document. createElement("div");
            div.className = "market-item strength-card";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${currency}</h3>
                    <p>Status</p>
                </div>
                <div class="trend-info">
                    <span class="trend-badge">${icon}</span>
                    <span>${status}</span>
                </div>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Strength error:", err);
    }
}

/* ===========================================================
      COMMODITIES - CLICKABLE + SENTIMENT DATA
   =========================================================== */

async function loadCommodities() {
    try {
        const response = await fetch(`${API_BASE_URL}/commodities`);
        const data = await response.json();

        // Store for sentiment calculation
        commodityData = data;

        const container = document.getElementById("commodities-list");
        container.innerHTML = "";

        data.forEach(item => {
            const pct = parseFloat(item.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const commoditySlug = item.name. toLowerCase().replace(/\s+/g, "-");
            const commodityUrl = `commodity-${commoditySlug}.html`;

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <a href="${commodityUrl}" 
                   style="text-decoration: none;color:inherit;display: flex;align-items:center;justify-content:space-between;width:100%;">
                    <div class="market-info">
                        <h3>${item.name}</h3>
                        <p>${item.symbol}</p>
                    </div>
                    <div class="performance ${trendClass}">
                        ${item.change}
                    </div>
                </a>
            `;

            container.appendChild(div);
        });

        // ✨ Calculate and display commodity sentiment
        loadCommoditySentiment(data);

    } catch (err) {
        console.error("Commodities error:", err);
    }
}

/* ===========================================================
      COMMODITY SENTIMENT WIDGET
   =========================================================== */

function loadCommoditySentiment(data) {
    const widget = new SentimentWidget('commodity-sentiment');
    widget.calculate(data, 'Commodity', 'name');
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadHeatmapTable();
    loadForex();
    loadStrength();
    loadCommodities();
    connectForexSocket();
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
        loadStrength();
        loadCommodities();

        // Fallback: if WS hasn't updated recently, refresh forex via REST
        if (!wsConnected || (Date.now() - lastWsUpdate > 30000)) {
            loadForex();
        }
    }, 10000);
});