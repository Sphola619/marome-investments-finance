const API_URL = "http://localhost:5000/api/indices";  
// Change this to your Render URL when deployed

// ===============================
// Load Indices & Render to Page
// ===============================
async function loadIndices() {
    const container = document.getElementById("indices-list");
    const summaryBox = document.getElementById("news-list");

    container.innerHTML = "";
    summaryBox.innerHTML = "Loading summary...";

    try {
        const response = await fetch(API_URL);
        const indices = await response.json();

        // Render index cards
        indices.forEach(item => {
            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${item.name}</h3>
                    <p>${item.symbol}</p>
                </div>
                <div class="performance ${item.trend}">
                    ${item.change}
                </div>
            `;

            container.appendChild(div);
        });

        // Generate + Display Summary
        const summary = generateMarketSummary(indices);
        summaryBox.innerHTML = `<p class="summary-text">${summary}</p>`;

    } catch (err) {
        console.error("Error loading indices:", err);
        summaryBox.innerHTML = `<p class="summary-text">Failed to load market data.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadIndices);


// ===============================
// Global Market Summary Generator
// ===============================
function generateMarketSummary(indices) {
    if (!indices || indices.length === 0) {
        return "Market data unavailable at the moment.";
    }

    const find = name => indices.find(i => i.name === name);

    const sp500 = find("S&P 500");
    const nasdaq = find("NASDAQ 100");
    const dow = find("Dow Jones");
    const russell = find("Russell 2000");
    const vix = find("VIX Volatility Index");

    let summary = "Global markets update: ";

    // Collect US directional signals
    const usIndices = [sp500, nasdaq, dow].filter(Boolean);

    let upCount = usIndices.filter(i => i.trend === "positive").length;
    let downCount = usIndices.filter(i => i.trend === "negative").length;

    // Determine US market mood
    if (upCount === usIndices.length) {
        summary += `US markets are broadly higher today. `;
    } 
    else if (downCount === usIndices.length) {
        summary += `US markets are trading lower across the board. `;
    } 
    else {
        summary += `US markets are showing a mixed performance. `;
    }

    // Add percentage details
    if (sp500 && nasdaq && dow) {
        summary += `S&P 500 ${sp500.change}, NASDAQ ${nasdaq.change}, Dow Jones ${dow.change}. `;
    }

    // Small-cap performance
    if (russell) {
        if (russell.trend === "positive") {
            summary += `Small caps (Russell 2000) are gaining at ${russell.change}. `;
        } else {
            summary += `Small caps (Russell 2000) are under pressure at ${russell.change}. `;
        }
    }

    // Volatility mood
    if (vix) {
        const volText =
            vix.trend === "positive"
                ? "rising volatility, indicating more uncertainty"
                : "lower volatility, indicating stable market conditions";

        summary += `VIX is at ${vix.change}, suggesting ${volText}.`;
    }

    return summary;
}

