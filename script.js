const API_BASE_URL = "http://localhost:5000/api";

async function fetchRealSectorData() {
    try {
        const response = await fetch(`${API_BASE_URL}/sectors`);
        if (!response.ok) return null;

        const data = await response.json();

        return data.map(item => ({
            name: item.sector,
            description: `Sector: ${item.sector}`,
            performance: item.changesPercentage,
            trend: item.changesPercentage.includes("-") ? "negative" : "positive"
        }));
    } catch (err) {
        console.error("Sector fetch error:", err);
        return null;
    }
}

async function fetchNews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        if (!response.ok) return [];

        const data = await response.json();
        return data.slice(0, 8);
    } catch (err) {
        console.error("News error:", err);
        return [];
    }
}

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

function populateNewsList(news) {
    const list = document.getElementById("news-list");
    list.innerHTML = "";

    news.forEach(article => {
        const div = document.createElement("div");
        div.className = "news-card";

        div.innerHTML = `
            <a href="${article.url}" class="news-link" target="_blank">
                <h3 class="news-title">${article.headline}</h3>
                <p class="news-source">${article.source} • ${new Date(article.datetime * 1000).toLocaleDateString()}</p>
            </a>
        `;

        list.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const sectors = await fetchRealSectorData();
    const news = await fetchNews();

    if (sectors) populateMarketList(sectors);
    populateNewsList(news);
});
