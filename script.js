// =====================
// CONFIG
// =====================
const API_BASE_URL = "http://localhost:5000/api";

// =====================
// FETCH REAL SECTOR DATA
// =====================
async function fetchRealSectorData() {
    try {
        console.log("📊 Fetching sector performance...");

        const response = await fetch(`${API_BASE_URL}/sectors`);
        if (!response.ok) throw new Error(`Sector API error: ${response.status}`);

        const data = await response.json();

        // Convert backend → frontend format
        return data.map(item => {
            const pct = item.changesPercentage || "0.00%";

            let trend = "neutral";
            if (pct.startsWith("+")) trend = "positive";
            else if (pct.startsWith("-")) trend = "negative";

            return {
                name: item.sector,
                description: `Sector: ${item.sector}`,
                performance: pct,
                trend
            };
        });

    } catch (err) {
        console.error("❌ Sector fetch error:", err);
        return null;
    }
}

// =====================
// FETCH MARKET NEWS
// =====================
async function fetchNews() {
    try {
        console.log("📰 Fetching news...");

        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) throw new Error(`News API error: ${response.status}`);

        const data = await response.json();

        // Limit to 8 articles
        return Array.isArray(data) ? data.slice(0, 8) : [];

    } catch (err) {
        console.error("❌ News fetch error:", err);
        return [];
    }
}

// =====================
// POPULATE SECTORS LIST
// =====================
function populateMarketList(sectors) {
    const container = document.getElementById("market-list");
    if (!container) return;

    container.innerHTML = "";

    sectors.forEach(sector => {
        const div = document.createElement("div");
        div.className = "market-item";

        div.innerHTML = `
            <div class="market-info">
                <h3>${sector.name}</h3>
                <p>${sector.description}</p>
            </div>
            <div class="performance ${sector.trend}">
                ${sector.performance}
            </div>
        `;

        container.appendChild(div);
    });
}

// =====================
// POPULATE NEWS LIST
// =====================
function populateNewsList(news) {
    const list = document.getElementById("news-list");
    if (!list) return;

    list.innerHTML = "";

    news.forEach(article => {
        const dateStr = article.datetime
            ? new Date(article.datetime * 1000).toLocaleDateString()
            : "Today";

        const div = document.createElement("div");
        div.className = "news-card";

        div.innerHTML = `
            <a href="${article.url || "#"}" target="_blank" class="news-link">
                <h3 class="news-title">${article.headline || "Market Update"}</h3>
                <p class="news-source">${article.source || ""} • ${dateStr}</p>
            </a>
        `;

        list.appendChild(div);
    });
}

// =====================
// INITIAL PAGE LOAD
// =====================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Loading dashboard...");

    const sectors = await fetchRealSectorData();
    const news = await fetchNews();

    if (sectors) populateMarketList(sectors);
    populateNewsList(news);
});

// =====================
// AUTO-REFRESH every 5 minutes
// =====================
setInterval(async () => {
    console.log("🔄 Auto-refreshing sector data...");
    const sectors = await fetchRealSectorData();
    if (sectors) populateMarketList(sectors);
}, 300000);
