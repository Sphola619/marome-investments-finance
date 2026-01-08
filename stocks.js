const API_BASE_URL = "http://localhost:5000/api";

/* ===========================================================
      LOAD INDICES - NOW CLICKABLE
   =========================================================== */

async function loadIndices() {
    const container = document.getElementById("indices-list");
    const summaryBox = document.getElementById("news-list");

    container.innerHTML = "";
    summaryBox.innerHTML = "Loading summary...";

    try {
        const response = await fetch(`${API_BASE_URL}/indices`);
        const indices = await response.json();

        // Render index cards - NOW CLICKABLE
        indices.forEach(item => {
            const pct = parseFloat(item.change);
            const trendClass = pct >= 0 ?  "positive" : "negative";

            // 🔧 Generate page URL (e.g., "S&P 500" → stock-sp-500.html)
            const stockSlug = item.name
                .toLowerCase()
                .replace(/&/g, "")           // Remove &
                .replace(/\s+/g, "-")        // Spaces to dashes
                .replace(/[^a-z0-9-]/g, ""); // Remove special chars
            
            const stockUrl = `stock-${stockSlug}.html`;

            console.log(`📊 ${item.name} → ${stockUrl}`); // Debug log

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <a href="${stockUrl}" 
                   style="text-decoration: none;color:inherit;display:flex;align-items:center;justify-content:space-between;width:100%;">
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

        // Generate + Display Summary
        const summary = generateMarketSummary(indices);
        summaryBox.innerHTML = `<p class="summary-text">${summary}</p>`;

    } catch (err) {
        console.error("Error loading indices:", err);
        container.innerHTML = `<p class="summary-text">Failed to load market data.</p>`;
        summaryBox.innerHTML = `<p class="summary-text">Failed to load market data.</p>`;
    }
}

/* ===========================================================
      GLOBAL MARKET SUMMARY GENERATOR
   =========================================================== */

function generateMarketSummary(indices) {
    if (! indices || indices.length === 0) {
        return "Market data unavailable at the moment.";
    }

    const find = name => indices.find(i => i.name === name);

    const sp500 = find("S&P 500");
    const nasdaq = find("NASDAQ 100");
    const dow = find("Dow Jones");
    const jse = find("JSE Top 40");

    let summary = "Global markets update:  ";

    // Collect US directional signals
    const usIndices = [sp500, nasdaq, dow]. filter(Boolean);

    let upCount = usIndices.filter(i => parseFloat(i.change) >= 0).length;
    let downCount = usIndices.filter(i => parseFloat(i. change) < 0).length;

    // Determine US market mood
    if (upCount === usIndices.length) {
        summary += `US markets are broadly higher today.  `;
    } 
    else if (downCount === usIndices.length) {
        summary += `US markets are trading lower across the board. `;
    } 
    else {
        summary += `US markets are showing a mixed performance. `;
    }

    // Add percentage details
    if (sp500 && nasdaq && dow) {
        summary += `S&P 500 ${sp500.change}, NASDAQ ${nasdaq.change}, Dow Jones ${dow.change}.  `;
    }

    // JSE Top 40 performance
    if (jse) {
        const jPct = parseFloat(jse. change);
        if (jPct >= 0) {
            summary += `South African markets (JSE Top 40) are gaining at ${jse.change}.  `;
        } else {
            summary += `South African markets (JSE Top 40) are under pressure at ${jse.change}. `;
        }
    }

    return summary;
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", loadIndices);