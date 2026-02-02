const API_BASE_URL = CONFIG.API_BASE_URL;

/* ===========================================================
   JSE STOCKS (SOUTH AFRICA)
   =========================================================== */

async function loadJSEStocks() {
    try {
        const response = await fetch(`${API_BASE_URL}/jse-stocks`);
        const data = await response.json();

        const container = document.getElementById("jse-stocks-list");
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No JSE data available</h3>
                        <p>Please check back later</p>
                    </div>
                </div>
            `;
            return;
        }

        data.forEach(stock => {
            const pct = parseFloat(stock.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const div = document.createElement("div");
            div.className = "market-item stock-card";

            // Make clickable (for future detail pages)
            div.innerHTML = `
                <div class="market-info">
                    <h3>${stock.name}</h3>
                    <p>${stock.symbol} • ${stock.currency}</p>
                </div>
                <div class="stock-price-info">
                    <div class="stock-price">${stock.price}</div>
                    <div class="performance ${trendClass}">
                        ${stock.change}
                    </div>
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${data.length} JSE stocks`);

    } catch (err) {
        console.error("❌ JSE stocks error:", err);
        const container = document.getElementById("jse-stocks-list");
        container.innerHTML = `
            <div class="market-item">
                <div class="market-info">
                    <h3>❌ Failed to load JSE stocks</h3>
                    <p>Please refresh the page</p>
                </div>
            </div>
        `;
    }
}

/* ===========================================================
   US STOCKS
   =========================================================== */

async function loadUSStocks() {
    try {
        const response = await fetch(`${API_BASE_URL}/us-stocks`);
        const data = await response.json();

        const container = document.getElementById("us-stocks-list");
        container.innerHTML = "";

        if (data. length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No US stock data available</h3>
                        <p>Please check back later</p>
                    </div>
                </div>
            `;
            return;
        }

        data.forEach(stock => {
            const pct = parseFloat(stock.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const div = document.createElement("div");
            div.className = "market-item stock-card";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${stock.name}</h3>
                    <p>${stock.symbol} • ${stock.currency}</p>
                </div>
                <div class="stock-price-info">
                    <div class="stock-price">${stock.price}</div>
                    <div class="performance ${trendClass}">
                        ${stock.change}
                    </div>
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${data.length} US stocks`);

    } catch (err) {
        console.error("❌ US stocks error:", err);
        const container = document.getElementById("us-stocks-list");
        container.innerHTML = `
            <div class="market-item">
                <div class="market-info">
                    <h3>❌ Failed to load US stocks</h3>
                    <p>Please refresh the page</p>
                </div>
            </div>
        `;
    }
}

/* ===========================================================
   INDICES (REFERENCE)
   =========================================================== */

async function loadIndices() {
    try {
        const response = await fetch(`${API_BASE_URL}/indices`);
        const data = await response. json();

        const container = document.getElementById("indices-list");
        container.innerHTML = "";

        data.forEach(index => {
            const pct = parseFloat(index.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${index.name}</h3>
                    <p>${index.symbol}</p>
                </div>
                <div class="performance ${trendClass}">
                    ${index.change}
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${data.length} indices`);

    } catch (err) {
        console.error("❌ Indices error:", err);
    }
}

/* ===========================================================
   NEWS
   =========================================================== */

async function loadNews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();

        const newsContainer = document.getElementById("news-list");
        newsContainer.innerHTML = "";

        if (! Array.isArray(data) || data.length === 0) {
            newsContainer.innerHTML = '<p class="placeholder-text">No news available at this time.</p>';
            return;
        }

        const displayCount = 5;
        const newsToShow = data.slice(0, displayCount);

        newsToShow. forEach(article => {
            const newsCard = document.createElement("div");
            newsCard.className = "news-card";

            const date = new Date(article.datetime * 1000);
            const timeAgo = getTimeAgo(date);

            newsCard.innerHTML = `
                <a href="${article.url}" target="_blank" class="news-link">
                    <div class="news-title">${article.headline}</div>
                    <div class="news-meta">
                        <span class="news-source">${article.source}</span>
                        <span> • ${timeAgo}</span>
                    </div>
                </a>
            `;

            newsContainer.appendChild(newsCard);
        });

    } catch (err) {
        console.error("❌ News error:", err);
        document.getElementById("news-list").innerHTML = 
            '<p class="placeholder-text">Unable to load news. </p>';
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' :  ''} ago`;
        }
    }

    return 'Just now';
}

/* ===========================================================
   STOCK SENTIMENT
   =========================================================== */

async function loadStockSentiment() {
    try {
        // Combine JSE + US stocks for sentiment
        const [jseRes, usRes] = await Promise. all([
            fetch(`${API_BASE_URL}/jse-stocks`),
            fetch(`${API_BASE_URL}/us-stocks`)
        ]);

        const jseData = await jseRes. json();
        const usData = await usRes.json();

        // Combine both datasets
        const allStocks = [...jseData, ... usData];

        // Use sentiment widget
        const widget = new SentimentWidget('stock-sentiment');
        widget.calculate(allStocks, 'Stock', 'name');

    } catch (err) {
        console.error("❌ Stock sentiment error:", err);
    }
}

/* ===========================================================
   PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadJSEStocks();
    loadUSStocks();
    loadIndices();
    loadNews();
    loadStockSentiment();
});