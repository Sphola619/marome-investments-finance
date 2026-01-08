const API_BASE_URL = "http://localhost:5000/api";

/* ===========================================================
      FETCH ALL MARKET DATA
   =========================================================== */

async function loadAllMarketData() {
    try {
        const [indices, forex, crypto, commodities, movers] = await Promise.all([
            fetch(`${API_BASE_URL}/indices`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE_URL}/forex`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE_URL}/crypto`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE_URL}/commodities`).then(r => r.json()).catch(() => []),
            fetch(`${API_BASE_URL}/all-movers`).then(r => r.json()).catch(() => [])
        ]);

        // Generate all sections
        generateMarketSummary(indices, forex, crypto, commodities);
        displayTopMovers(movers);
        displayMarketComparison(indices, forex, crypto, commodities);
        generateTrendAnalysis(forex, commodities);
        generateVolatilityInsights(crypto, forex);

    } catch (err) {
        console.error("Error loading market data:", err);
    }
}

/* ===========================================================
      1. AUTOMATED MARKET SUMMARY
   =========================================================== */

function generateMarketSummary(indices, forex, crypto, commodities) {
    const summary = [];

    // Calculate average changes
    const indicesAvg = calculateAverage(indices);
    const forexAvg = calculateAverage(forex);
    const cryptoAvg = calculateAverage(crypto);
    const commoditiesAvg = calculateAverage(commodities);

    // Overall market sentiment
    const overallAvg = (indicesAvg + cryptoAvg + commoditiesAvg) / 3;

    if (overallAvg > 1) {
        summary.push("Markets are showing broad-based strength with positive momentum across multiple asset classes.");
    } else if (overallAvg < -1) {
        summary.push("Markets face selling pressure with widespread declines across major assets.");
    } else {
        summary.push("Markets are mixed with no clear directional bias as different sectors show diverging performance.");
    }

    // Equity analysis
    if (indicesAvg > 0.5) {
        summary.push("Equity markets are rallying, with major indices posting solid gains.");
    } else if (indicesAvg < -0.5) {
        summary.push("Equity markets are under pressure as risk appetite weakens.");
    } else {
        summary.push("Equity indices are consolidating near current levels with light trading activity.");
    }

    // Crypto analysis
    if (cryptoAvg > 2) {
        summary.push("Cryptocurrencies are surging higher, led by Bitcoin and major altcoins.");
    } else if (cryptoAvg < -2) {
        summary.push("Cryptocurrencies face sharp selling as traders de-risk positions.");
    } else {
        summary.push("Cryptocurrency markets remain range-bound with selective buying interest.");
    }

    // USD analysis (inverse of forex avg)
    if (forexAvg < -0.3) {
        summary.push("The US Dollar is strengthening against major currencies, pressuring risk assets.");
    } else if (forexAvg > 0.3) {
        summary.push("The US Dollar is weakening, providing tailwinds for commodities and emerging markets.");
    }

    // Commodities
    if (commoditiesAvg > 1) {
        summary.push("Commodity markets are rallying on strong demand and supply concerns.");
    } else if (commoditiesAvg < -1) {
        summary.push("Commodities are declining amid demand weakness and profit-taking.");
    }

    // Display
    const container = document.getElementById("market-summary");
    if (container) {
        container. innerHTML = summary.map(text => 
            `<p class="commentary-line">• ${text}</p>`
        ).join("");
    }
}

function calculateAverage(data) {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => {
        const change = parseFloat(item.change || item.rawChange || 0);
        return acc + change;
    }, 0);
    return sum / data.length;
}

/* ===========================================================
      2. TOP MOVERS (ALL MARKETS)
   =========================================================== */

function displayTopMovers(movers) {
    const container = document.getElementById("top-movers-list");
    if (!container) return;

    if (! movers || movers.length === 0) {
        container. innerHTML = '<p class="placeholder-text">No movers data available. </p>';
        return;
    }

    // Take top 8 movers
    const topMovers = movers.slice(0, 8);

    container.innerHTML = topMovers.map(mover => {
        const isPositive = mover.rawChange >= 0;
        const emoji = isPositive ? "📈" : "📉";
        const trendClass = isPositive ? "positive" : "negative";

        return `
            <div class="market-item">
                <div class="market-info">
                    <h3>${emoji} ${mover.name}</h3>
                    <p>${mover.type}</p>
                </div>
                <div class="performance ${trendClass}">
                    ${mover.performance}
                </div>
            </div>
        `;
    }).join("");
}

/* ===========================================================
      3. MULTI-MARKET PERFORMANCE COMPARISON
   =========================================================== */

function displayMarketComparison(indices, forex, crypto, commodities) {
    const container = document. getElementById("market-comparison");
    if (!container) return;

    const indicesAvg = calculateAverage(indices);
    const forexAvg = calculateAverage(forex);
    const cryptoAvg = calculateAverage(crypto);
    const commoditiesAvg = calculateAverage(commodities);

    const markets = [
        { name: "Equity Indices", avg: indicesAvg, icon: "📊" },
        { name:  "Cryptocurrencies", avg: cryptoAvg, icon: "₿" },
        { name:  "Forex Pairs", avg: forexAvg, icon: "💱" },
        { name: "Commodities", avg: commoditiesAvg, icon: "🛢️" }
    ];

    container.innerHTML = markets.map(market => {
        const isPositive = market.avg >= 0;
        const trendClass = isPositive ? "positive" : "negative";
        const arrow = isPositive ? "▲" : "▼";
        const strength = Math.abs(market.avg) > 2 ? arrow + arrow : arrow;

        return `
            <div class="market-item">
                <div class="market-info">
                    <h3>${market.icon} ${market.name}</h3>
                    <p>24-Hour Performance</p>
                </div>
                <div class="performance ${trendClass}">
                    ${isPositive ? "+" : ""}${market.avg.toFixed(2)}% ${strength}
                </div>
            </div>
        `;
    }).join("");
}

/* ===========================================================
      4. TREND ANALYSIS
   =========================================================== */

function generateTrendAnalysis(forex, commodities) {
    const container = document. getElementById("trend-analysis");
    if (!container) return;

    const trends = [];

    // Analyze forex trends
    if (forex && forex.length > 0) {
        const forexTrends = forex. slice(0, 3).map(pair => {
            const change = parseFloat(pair.change || 0);
            let trend = "Neutral";
            if (change > 0.5) trend = "Bullish ▲";
            if (change < -0.5) trend = "Bearish ▼";
            return `${pair.pair}:  ${trend}`;
        }).join(" • ");

        trends.push({
            title: "💱 Forex Trends",
            description: forexTrends
        });
    }

    // Analyze commodity trends
    if (commodities && commodities.length > 0) {
        const commodityTrends = commodities.map(commodity => {
            const change = parseFloat(commodity.change || 0);
            let trend = "Neutral";
            if (change > 1) trend = "Bullish ▲";
            if (change < -1) trend = "Bearish ▼";
            return `${commodity.name}: ${trend}`;
        }).join(" • ");

        trends.push({
            title: "🛢️ Commodity Trends",
            description: commodityTrends
        });
    }

    container.innerHTML = trends. map(trend => `
        <div class="market-item">
            <div class="market-info">
                <h3>${trend.title}</h3>
                <p>${trend.description}</p>
            </div>
        </div>
    `).join("");
}

/* ===========================================================
      5. VOLATILITY INSIGHTS
   =========================================================== */

function generateVolatilityInsights(crypto, forex) {
    const container = document.getElementById("volatility-insights");
    if (!container) return;

    const insights = [];

    // Crypto volatility
    if (crypto && crypto.length > 0) {
        const cryptoChanges = crypto.map(c => Math.abs(parseFloat(c.change || 0)));
        const avgCryptoVol = cryptoChanges.reduce((a, b) => a + b, 0) / cryptoChanges.length;

        let volLevel = "Moderate";
        if (avgCryptoVol > 3) volLevel = "High ⚠️";
        if (avgCryptoVol < 1) volLevel = "Low ✓";

        insights.push({
            title: "₿ Crypto Volatility",
            description: `${volLevel} (Avg: ${avgCryptoVol.toFixed(2)}%)`
        });
    }

    // Forex volatility
    if (forex && forex.length > 0) {
        const forexChanges = forex.map(f => Math.abs(parseFloat(f.change || 0)));
        const avgForexVol = forexChanges.reduce((a, b) => a + b, 0) / forexChanges.length;

        let volLevel = "Moderate";
        if (avgForexVol > 0.5) volLevel = "High ⚠️";
        if (avgForexVol < 0.2) volLevel = "Low ✓";

        insights.push({
            title: "💱 Forex Volatility",
            description: `${volLevel} (Avg: ${avgForexVol.toFixed(2)}%)`
        });
    }

    container.innerHTML = insights.map(insight => `
        <div class="market-item">
            <div class="market-info">
                <h3>${insight. title}</h3>
                <p>${insight.description}</p>
            </div>
        </div>
    `).join("");
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", loadAllMarketData);