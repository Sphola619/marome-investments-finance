// =====================
// CONFIG
// =====================
const API_BASE_URL = "http://localhost:5000/api";

// =====================
// FETCH REAL SECTOR DATA (Polygon -> ETF)
// =====================
async function fetchRealSectorData() {
    try {
        const resp = await fetch(`${API_BASE_URL}/sectors`);
        if (!resp.ok) return null;

        const data = await resp.json();

        return data.map(item => ({
            name: item.sector,
            description: `Sector: ${item.sector}`,
            performance: item.changesPercentage,
            trend:
                item.changesPercentage.includes("-")
                    ? "negative"
                    : "positive"
        }));
    } catch (err) {
        console.error("❌ Sector fetch error:", err);
        return null;
    }
}

// =====================
// FETCH NEWS (Finnhub)
// =====================
async function fetchNews() {
    try {
        const resp = await fetch(`${API_BASE_URL}/news`);
        if (!resp.ok) return [];

        const data = await resp.json();
        return data.slice(0, 8);
    } catch (err) {
        console.error("❌ News fetch error:", err);
        return [];
    }
}

// =====================
// POPULATE SECTOR LIST
// =====================
function populateMarketList(sectors) {
    const container = document.getElementById("market-list");
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
// POPULATE NEWS CARDS
// =====================
function populateNewsList(news) {
    const container = document.getElementById("news-list");
    container.innerHTML = "";

    news.forEach(article => {
        const div = document.createElement("div");
        div.className = "news-card";

        div.innerHTML = `
            <a href="${article.url}" target="_blank" class="news-link">
                <h3 class="news-title">${article.headline}</h3>
                <p class="news-source">
                    ${article.source} • ${new Date(article.datetime * 1000).toLocaleDateString()}
                </p>
            </a>
        `;

        container.appendChild(div);
    });
}

// =====================
// INITIAL LOAD
// =====================
document.addEventListener("DOMContentLoaded", async () => {
    const sectors = await fetchRealSectorData();
    const news = await fetchNews();

    if (sectors) {
        populateMarketList(sectors);
    } else {
        document.getElementById("market-list").innerHTML =
            `<div style="text-align:center;color:#777;padding:1rem;">
                ❌ Sector data unavailable (Rate limit). Please try again.
            </div>`;
    }

    populateNewsList(news);
});

// =====================
// AUTO REFRESH (5 min)
// =====================
setInterval(async () => {
    const sectors = await fetchRealSectorData();
    if (sectors) populateMarketList(sectors);
}, 300000);
