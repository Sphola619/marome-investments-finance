const API_BASE_URL = CONFIG.API_BASE_URL;

/* ===========================================================
      REAL MULTI-TIMEFRAME HEATMAP (Yahoo Finance)
   =========================================================== */

function colorCell(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) {
        return ""; // neutral cell
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
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE_URL}/forex-heatmap`);
        const data = await response.json();

        tableBody.innerHTML = "";  // Clear old rows

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
        tableBody.innerHTML = `
            <tr><td colspan="5" style="text-align:center;color:red;">
                Failed to load heatmap. 
            </td></tr>
        `;
    }
}

/* ===========================================================
      FOREX LIST (Yahoo) - NOW CLICKABLE
   =========================================================== */

async function loadForex() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex`);
        const data = await response.json();

        const container = document.getElementById("forex-list");
        container.innerHTML = "";

        data. forEach(item => {
            const div = document.createElement("div");
            div.className = "market-item forex-card";

            // 🔧 Generate page URL (e.g., EUR/USD → pair-eurusd.html)
            const pairSlug = item.pair.replace("/", "").toLowerCase(); // EURUSD → eurusd
            const pairUrl = `pair-${pairSlug}.html`;

            div.innerHTML = `
                <a href="${pairUrl}" 
                   style="text-decoration: none;color:inherit;display:flex;align-items:center;justify-content:space-between;width:100%;">
                    <div class="market-info">
                        <h3>${item.pair}</h3>
                        <p>${item.name}</p>
                    </div>
                    <div class="performance ${item.trend}">
                        ${item.change}
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
      FOREX STRENGTH METER
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
      COMMODITIES - NOW CLICKABLE
   =========================================================== */

async function loadCommodities() {
    try {
        const response = await fetch(`${API_BASE_URL}/commodities`);
        const data = await response.json();

        const container = document.getElementById("commodities-list");
        container.innerHTML = "";

        data.forEach(item => {
            const pct = parseFloat(item.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            // 🔧 Generate page URL (e.g., Gold → commodity-gold.html)
            const commoditySlug = item.name.toLowerCase().replace(/\s+/g, "-"); // "Crude Oil" → "crude-oil"
            const commodityUrl = `commodity-${commoditySlug}.html`;

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <a href="${commodityUrl}" 
                   style="text-decoration:none;color:inherit;display:flex;align-items:center;justify-content:space-between;width:100%;">
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

    } catch (err) {
        console.error("Commodities error:", err);
    }
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadHeatmapTable();   // ⭐ REAL YAHOO HEATMAP
    loadForex();
    loadStrength();
    loadCommodities();
});