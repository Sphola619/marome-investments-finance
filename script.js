// =====================
// CONFIGIGURATION
// =====================
const API_BASE_URL = CONFIG.API_BASE_URL;

// =====================
// ICON HELPER
// =====================
function getTypeIcon(type) {
    switch (type) {
        case "Forex": return "💱";
        case "Crypto": return "🪙";
        case "Stock": return "📈";
        case "Commodity": return "🛢";
        case "Index": return "🌍";
        default: return "🔹";
    }
}

// =====================
// FETCH GLOBAL TOP MOVERS
// =====================
async function fetchTopMovers() {
    try {
        const resp = await fetch(`${API_BASE_URL}/all-movers`);
        if (!resp.ok) return null;

        const data = await resp.json();

        return data.map(item => ({
            name: item.name,
            description: `${item.type} • ${item.symbol}`,
            performance: item.performance,
            rawChange: item.rawChange,
            trend: item.trend,
            type: item.type
        }));

    } catch (err) {
        console.error("❌ Top Movers fetch error:", err);
        return null;
    }
}

// =====================
// FETCH NEWS
// =====================
async function fetchNews() {
    try {
        const resp = await fetch(`${API_BASE_URL}/news`);
        if (!resp.ok) return [];
        return await resp.json();
    } catch (err) {
        console.error("❌ News fetch error:", err);
        return [];
    }
}

// =====================
// POPULATE GLOBAL MOVERS LIST
// =====================
function populateMoverList(movers) {
    const container = document.getElementById("movers-list");
    container.innerHTML = "";

    movers.forEach(mover => {
        const div = document.createElement("div");
        div.className = "market-item";

        div.innerHTML = `
            <div class="market-info">
                <h3>${getTypeIcon(mover.type)} ${mover.name}</h3>
                <p>${mover.description}</p>
            </div>
            <div class="performance ${mover.trend}">
                ${mover.performance}
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

    news.slice(0, 8).forEach(article => {
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
// INITIAL LOAD (ONLY ONCE)
// =====================
document.addEventListener("DOMContentLoaded", async () => {
    const movers = await fetchTopMovers();
    const news = await fetchNews();

    if (movers) {
        populateMoverList(movers);
    } else {
        document.getElementById("movers-list").innerHTML = `
            <div style="text-align:center;color:#777;padding:1rem;">
                ❌ Unable to load global movers. Please try again later.
            </div>
        `;
    }

    populateNewsList(news);
});

// =====================
// AUTO REFRESH REMOVED
// =====================
