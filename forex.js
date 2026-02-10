const API_BASE_URL = CONFIG.API_BASE_URL;
let wsConnected = false;
let lastWsUpdate = 0;

/* ===========================================================
   HELPERS
=========================================================== */

function normalizeCommoditySymbol(symbol) {
    return symbol ? symbol.toUpperCase() : "";
}

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
    if (!tableBody) return;

    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;

    try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`${API_BASE_URL}/forex-heatmap`, {
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

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
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Failed to load heatmap. Retrying...</td></tr>`;
        
        // Auto-retry after 3 seconds
        setTimeout(() => loadHeatmapTable(), 3000);
    }
}

/* ===========================================================
   FOREX (REST = INVENTORY)
=========================================================== */

async function loadForex() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex`);
        const data = await response.json();

        const container = document.getElementById("forex-list");
        if (!container) return;

        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "market-item forex-card";
            div.dataset.pair = item.pair;

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
   FOREX STRENGTH (REST – AGGREGATE)
=========================================================== */

async function loadForexStrength() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex-strength`);
        const data = await response.json();

        const container = document.getElementById("strength-list");
        if (!container) return;

        container.innerHTML = "";

        Object.entries(data).forEach(([currency, status]) => {
            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${currency}</h3>
                    <p>${status}</p>
                </div>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Forex strength error:", err);
    }
}

/* ===========================================================
   FOREX WS UPDATE
=========================================================== */

function applyForexUpdate(pair, price, changePercent) {
    const card = document.querySelector(`.forex-card[data-pair="${pair}"]`);
    if (!card) return;

    const priceEl = card.querySelector(".forex-price");
    const changeEl = card.querySelector(".forex-change");
    const perf = card.querySelector(".performance");

    if (!priceEl || !changeEl || !perf) return;

    priceEl.textContent = Number(price).toFixed(4);
    changeEl.textContent = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

    perf.classList.toggle("positive", changePercent >= 0);
    perf.classList.toggle("negative", changePercent < 0);
}

/* ===========================================================
   COMMODITY WS UPDATE (STATIC DOM)
=========================================================== */

function applyCommodityUpdate(symbol, price, changePercent) {
    const normalized = normalizeCommoditySymbol(symbol);
    const card = document.querySelector(`.market-item[data-symbol="${normalized}"]`);
    if (!card) return;

    const priceEl = card.querySelector(".commodity-price");
    const changeEl = card.querySelector(".commodity-change");
    const perf = card.querySelector(".performance");

    if (!priceEl || !changeEl || !perf) return;

    priceEl.textContent = Number(price).toFixed(2);
    changeEl.textContent = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`;

    perf.classList.toggle("positive", changePercent >= 0);
    perf.classList.toggle("negative", changePercent < 0);
}

/* ===========================================================
   COMMODITY SENTIMENT (REST – AGGREGATE + STORY) ✅
=========================================================== */

async function loadCommoditySentiment() {
    try {
        const response = await fetch(`${API_BASE_URL}/commodity-sentiment`);
        const data = await response.json();

        const container = document.getElementById("commodity-sentiment");
        if (!container) return;

        container.innerHTML = `
            <div class="sentiment-item">
                <p class="sentiment-label">${data.Sentiment ?? "Neutral －"}</p>

                <small>
                    Avg Change: ${data.Score ?? 0}% · Based on ${data.Count ?? 0} commodities
                </small>

                <p class="sentiment-story">
                    ${data.Story ?? "Commodity markets are calm today."}
                </p>
            </div>
        `;

    } catch (err) {
        console.error("Commodity sentiment error:", err);
    }
}

/* ===========================================================
   WEBSOCKET
=========================================================== */

function connectForexSocket() {
    const socket = new WebSocket(CONFIG.WS_BASE_URL);

    socket.addEventListener("open", () => {
        wsConnected = true;
        console.log("✅ Forex / Commodities WS connected");
    });

    socket.addEventListener("message", (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "forex" && msg.pair) {
            applyForexUpdate(msg.pair, msg.price, msg.changePercent);
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
    loadForexStrength();
    loadCommoditySentiment();
    connectForexSocket();

    // REST fallback ONLY for forex inventory + strength + sentiment
    setInterval(() => {
        if (!wsConnected || Date.now() - lastWsUpdate > 30000) {
            loadForex();
            loadForexStrength();
            loadCommoditySentiment();
        }
    }, 15000);
});
