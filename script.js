// =====================
// CONFIG
// =====================
const API_BASE_URL = "http://localhost:5000/api";

// =====================
// FETCH REAL SECTOR DATA (from backend -> Polygon ETF method)
// =====================
async function fetchRealSectorData() {
    try {
        console.log("🔄 Fetching sector data from backend...");
        const response = await fetch(`${API_BASE_URL}/sectors`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error("❌ Unexpected sector API response:", data);
            return null;
        }

        // Map backend format -> UI format expected by populateMarketList
        return data.map(item => ({
            name: item.sector,
            description: `Sector: ${item.sector}`,
            performance: item.changesPercentage,
            trend: item.changesPercentage.startsWith("-") ? "negative" : "positive"
        }));
    } catch (err) {
        console.error("❌ Failed to load real sector data:", err);
        return null;
    }
}

// =====================
// FETCH MARKET NEWS (from backend Finnhub)
 // =====================
async function fetchNews() {
    try {
        console.log("📰 Fetching news...");
        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const news = await response.json();
        // Finnhub returns an array — limit to 8
        return Array.isArray(news) ? news.slice(0, 8) : [];
    } catch (err) {
        console.error("❌ Failed to load news:", err);
        return [];
    }
}

// =====================
// POPULATE SECTORS LIST
// =====================
function populateMarketList(sectors) {
    const marketList = document.getElementById("market-list");
    if (!marketList) {
        console.error("❌ Element with id 'market-list' not found in HTML.");
        return;
    }

    marketList.innerHTML = "";

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

        marketList.appendChild(div);
    });
}

// =====================
// POPULATE NEWS CARDS (styled as cards in CSS)
// =====================
function populateNewsList(newsData) {
    const newsList = document.getElementById("news-list");
    if (!newsList) return;

    newsList.innerHTML = "";

    newsData.forEach(article => {
        const div = document.createElement("div");
        div.className = "news-card";

        // Some Finnhub articles may not have url/headline exactly the same fields; handle gracefully
        const url = article.url || article.link || "#";
        const headline = article.headline || article.title || "Market news";
        const source = article.source || article.source_id || "";

        // epoch seconds -> readable date
        let dateStr = "";
        try {
            dateStr = article.datetime ? new Date(article.datetime * 1000).toLocaleDateString() : "";
        } catch (e) {
            dateStr = "";
        }

        div.innerHTML = `
            <a href="${url}" target="_blank" rel="noopener" class="news-link">
                <h3 class="news-title">${headline}</h3>
                <p class="news-source">${source} • ${dateStr}</p>
            </a>
        `;

        newsList.appendChild(div);
    });
}

// =====================
// INITIAL LOAD
// =====================
window.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Loading dashboard...");

    const realSectors = await fetchRealSectorData();
    const news = await fetchNews();

    if (realSectors && realSectors.length > 0) {
        populateMarketList(realSectors);
    } else {
        console.error("⚠ No sector data returned from backend.");
        // Optionally show a message in UI instead of mock data
        const marketList = document.getElementById("market-list");
        if (marketList) {
            marketList.innerHTML = `<div style="text-align:center;color:#777;padding:1rem;">⚠ Sector data unavailable. Try again later.</div>`;
        }
    }

    populateNewsList(news);
});

// =====================
// AUTO REFRESH (5 minutes)
// =====================
setInterval(async () => {
    console.log("🔄 Auto-refreshing...");
    const realSectors = await fetchRealSectorData();
    if (realSectors && realSectors.length > 0) {
        populateMarketList(realSectors);
    }
}, 300000);
