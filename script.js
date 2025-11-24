// =====================
// CONFIG
// =====================
const API_BASE_URL = "http://localhost:5000/api";

// =====================
// FETCH REAL SECTOR DATA
// =====================
async function fetchRealSectorData() {
    try {
        console.log("🔄 Fetching real sector data…");

        const response = await fetch(`${API_BASE_URL}/sectors`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const data = await response.json();

        // Ensure data is an array
        if (!Array.isArray(data)) {
            console.error("❌ Unexpected sector API response:", data);
            return null;
        }

        // Convert Finnhub format to your UI format
        return data.map(item => ({
            name: item.sector,
            description: `Sector: ${item.sector}`,
            performance: item.changesPercentage,           // already like "+1.23%"
            trend: item.changesPercentage.startsWith("+") ? "positive" : "negative"
        }));
    } catch (err) {
        console.error("❌ Failed to load real sector data:", err);
        return null;
    }
}

// =====================
// FETCH MARKET NEWS
// =====================
async function fetchNews() {
    try {
        console.log("📰 Fetching news…");
        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        
        const news = await response.json();
        return news.slice(0, 8);
    } catch (err) {
        console.error("❌ Failed to load news:", err);
        return [];
    }
}

// =====================
// POPULATE SECTORS LIST
// =====================
function populateMarketList(sectors, isRealData = true) {
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

    if (!isRealData) {
        const msg = document.createElement("div");
        msg.style.cssText = "text-align:center;margin-top:1rem;color:#777;font-size:0.9rem;";
        msg.innerHTML = "⚠ Using mock data (backend unavailable)";
        marketList.appendChild(msg);
    }
}

// =====================
// POPULATE NEWS PANEL
// =====================
function populateNewsList(newsData) {
    const newsList = document.getElementById("news-list");
    if (!newsList) return;

    newsList.innerHTML = "";

    newsData.forEach(article => {
        const li = document.createElement("li");
        li.className = "news-item";

        li.innerHTML = `
            <a href="${article.url}" target="_blank">${article.headline}</a>
            <span class="news-source">${article.source}</span>
        `;

        newsList.appendChild(li);
    });
}

// =====================
// DEFAULT MOCK DATA
// =====================
function getMockSectorData() {
    return [
        { name: "Technology", description: "Tech sector", performance: "+1.24%", trend: "positive" },
        { name: "Healthcare", description: "Healthcare sector", performance: "-0.42%", trend: "negative" },
        { name: "Energy", description: "Energy sector", performance: "+0.93%", trend: "positive" }
    ];
}

// =====================
// INITIAL LOAD
// =====================
window.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Loading dashboard…");

    const realData = await fetchRealSectorData();
    const news = await fetchNews();

    if (realData) {
        populateMarketList(realData, true);
    } else {
        populateMarketList(getMockSectorData(), false);
    }

    populateNewsList(news);
});

// =====================
// AUTO REFRESH
// =====================
setInterval(async () => {
    console.log("🔄 Auto-refreshing sectors…");
    const realData = await fetchRealSectorData();
    if (realData) populateMarketList(realData, true);
}, 300000);
