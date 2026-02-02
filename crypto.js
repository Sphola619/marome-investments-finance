const API_BASE_URL = CONFIG.API_BASE_URL;

// Store crypto data globally for sentiment calculation
let cryptoData = [];

/* ===========================================================
      CRYPTO HEATMAP
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

async function loadCryptoHeatmap() {
    const tableBody = document.querySelector("#crypto-heatmap-table tbody");
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;

    try {
        const response = await fetch(`${API_BASE_URL}/crypto-heatmap`);
        const data = await response.json();

        tableBody.innerHTML = "";

        Object.entries(data).forEach(([crypto, tf]) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${crypto}</td>
                <td class="${colorCell(tf["1h"])}">${formatPct(tf["1h"])}</td>
                <td class="${colorCell(tf["4h"])}">${formatPct(tf["4h"])}</td>
                <td class="${colorCell(tf["1d"])}">${formatPct(tf["1d"])}</td>
                <td class="${colorCell(tf["1w"])}">${formatPct(tf["1w"])}</td>
            `;

            tableBody.appendChild(row);
        });

        generateMarketCommentary(data);

    } catch (err) {
        console.error("Crypto heatmap error:", err);
        tableBody.innerHTML = `
            <tr><td colspan="5" style="text-align:center;color:red;">
                Failed to load crypto heatmap. 
            </td></tr>
        `;
    }
}

/* ===========================================================
      MARKET COMMENTARY GENERATOR
   =========================================================== */

function generateMarketCommentary(heatmapData) {
    const commentary = [];
    
    const btc = heatmapData.BTC;
    if (btc) {
        const btc1h = btc["1h"] || 0;
        const btc4h = btc["4h"] || 0;
        const btc1d = btc["1d"] || 0;
        const btc1w = btc["1w"] || 0;

        if (btc1h < 0 && btc4h < 0) {
            commentary.push("Bitcoin shows short-term weakness on the 1H and 4H charts as momentum cools near resistance.");
        } else if (btc1h > 0 && btc4h > 0) {
            commentary.push("Bitcoin demonstrates strong short-term momentum with positive performance across 1H and 4H timeframes.");
        } else if (btc1d < -2) {
            commentary.push("Bitcoin faces significant daily pressure with a decline exceeding 2%.");
        } else if (btc1w > 5) {
            commentary.push("Bitcoin maintains strong weekly bullish momentum with gains above 5%.");
        } else {
            commentary.push("Bitcoin remains range-bound with mixed signals across timeframes.");
        }
    }

    const eth = heatmapData.ETH;
    if (eth) {
        const eth1d = eth["1d"] || 0;
        const eth1w = eth["1w"] || 0;
        const btc1d = (btc && btc["1d"]) || 0;

        if (Math.abs(eth1d) < 1 && Math.abs(eth1w) < 3) {
            commentary.push("Ethereum remains more stable with stronger performance on higher timeframes.");
        } else if (eth1d > btc1d) {
            commentary.push("Ethereum outperforms Bitcoin on the daily chart, showing relative strength.");
        } else if (eth1d < -3) {
            commentary.push("Ethereum faces selling pressure with notable daily declines.");
        } else {
            commentary.push("Ethereum tracks broader market trends with moderate volatility.");
        }
    }

    const altcoins = ["SOL", "ADA", "XRP", "DOGE", "AVAX", "BNB", "LTC"];
    const altcoinData = altcoins.map(coin => heatmapData[coin]).filter(Boolean);
    
    if (altcoinData.length > 0) {
        const avg1d = altcoinData.reduce((sum, coin) => sum + (coin["1d"] || 0), 0) / altcoinData.length;
        const negativeCount = altcoinData.filter(coin => (coin["1d"] || 0) < -2).length;

        if (negativeCount >= 4) {
            commentary.push("Altcoins continue to trade with elevated volatility, with several major assets showing deeper pullbacks.");
        } else if (avg1d > 2) {
            commentary.push("Altcoins display strong momentum with broad-based gains across the board.");
        } else if (avg1d < -2) {
            commentary.push("Altcoins face widespread selling pressure as risk sentiment deteriorates.");
        } else {
            commentary.push("Altcoins show mixed performance with selective strength in certain tokens.");
        }
    }

    const allCoins = Object.values(heatmapData);
    const overall1d = allCoins.reduce((sum, coin) => sum + (coin["1d"] || 0), 0) / allCoins.length;

    if (overall1d > 3) {
        commentary.push("Overall sentiment is bullish as the broader crypto market rallies strongly.");
    } else if (overall1d < -3) {
        commentary.push("Overall sentiment remains bearish as the market faces downward pressure.");
    } else {
        commentary.push("Overall sentiment remains cautious as traders await clearer direction from broader market trends.");
    }

    const container = document.getElementById("market-commentary");
    if (container) {
        container. innerHTML = commentary.map(text => 
            `<p class="commentary-line">• ${text}</p>`
        ).join("");
    }
}

/* ===========================================================
      CRYPTO LIST - CLICKABLE + SENTIMENT DATA
   =========================================================== */

async function loadCrypto() {
    const container = document.getElementById("crypto-list");
    container.innerHTML = "<p>Loading... </p>";

    try {
        const resp = await fetch(`${API_BASE_URL}/crypto`);
        const data = await resp.json();

        // Store for sentiment calculation
        cryptoData = data;

        container.innerHTML = "";

        data.forEach(item => {
            const cryptoSlug = item.name.toLowerCase().replace(/\s+/g, "-");
            const cryptoUrl = `crypto-${cryptoSlug}.html`;

            const div = document.createElement("div");
            div.className = "market-item animate delay-1";

            div.innerHTML = `
                <a href="${cryptoUrl}" 
                   style="text-decoration:  none;color: inherit;display: flex;align-items:center;justify-content:space-between;width:100%;">
                    <div class="market-info">
                        <h3>${item.name}</h3>
                        <p>${item.symbol}</p>
                    </div>
                    <div class="performance ${item.trend}">
                        ${item.change}
                    </div>
                </a>
            `;

            container.appendChild(div);
        });

        // ✨ Calculate and display crypto sentiment
        loadCryptoSentiment(data);

    } catch (err) {
        console.error("Crypto load error:", err);
        container. innerHTML = "<p>Failed to load crypto data. </p>";
    }
}

/* ===========================================================
      CRYPTO SENTIMENT WIDGET
   =========================================================== */

function loadCryptoSentiment(data) {
    const widget = new SentimentWidget('crypto-sentiment');
    widget.calculate(data, 'Crypto', 'name');
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadCryptoHeatmap();
    loadCrypto();
});