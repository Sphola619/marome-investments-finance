const API_BASE_URL = CONFIG.API_BASE_URL;

/* ===========================================================
   JSE INDICES
   =========================================================== */

async function loadJSEIndices() {
    try {
        const response = await fetch(`${API_BASE_URL}/indices`);
        const data = await response.json();

        const container = document.getElementById("jse-indices-list");
        container.innerHTML = "";

        // Filter only JSE indices
        const jseIndices = data.filter(idx => 
            idx.name.includes("JSE") || idx.symbol.includes(".JO")
        );

        if (jseIndices.length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No JSE indices available</h3>
                        <p>Please check back later</p>
                    </div>
                </div>
            `;
            return;
        }

        jseIndices.forEach(index => {
            const pct = parseFloat(index.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${index.name}</h3>
                    <p>${index.symbol} • ${index.latest}</p>
                </div>
                <div class="performance ${trendClass}">
                    ${index.change}
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${jseIndices.length} JSE indices`);

    } catch (err) {
        console.error("❌ JSE indices error:", err);
        const container = document.getElementById("jse-indices-list");
        container.innerHTML = `
            <div class="market-item">
                <div class="market-info">
                    <h3>❌ Failed to load JSE indices</h3>
                    <p>Please refresh the page</p>
                </div>
            </div>
        `;
    }
}

/* ===========================================================
   JSE STOCKS
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
                        <h3>⚠️ No JSE stock data available</h3>
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
   RAND FOREX (ZAR PAIRS)
   =========================================================== */

async function loadRandForex() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex`);
        const data = await response.json();

        const container = document.getElementById("rand-forex-list");
        container.innerHTML = "";

        // Filter only ZAR pairs
        const zarPairs = data.filter(fx => fx.pair.includes("ZAR"));

        if (zarPairs.length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No Rand data available</h3>
                        <p>Please check back later</p>
                    </div>
                </div>
            `;
            return;
        }

        zarPairs.forEach(pair => {
            const pct = parseFloat(pair.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${pair.pair}</h3>
                    <p>${pair.price.toFixed(2)}</p>
                </div>
                <div class="performance ${trendClass}">
                    ${pair.change}
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${zarPairs.length} ZAR pairs`);

    } catch (err) {
        console.error("❌ Rand forex error:", err);
        const container = document.getElementById("rand-forex-list");
        container.innerHTML = `
            <div class="market-item">
                <div class="market-info">
                    <h3>❌ Failed to load Rand rates</h3>
                    <p>Please refresh the page</p>
                </div>
            </div>
        `;
    }
}

/* ===========================================================
   COMMODITIES IN ZAR
   =========================================================== */

async function loadCommoditiesZAR() {
    try {
        const [commoditiesRes, forexRes] = await Promise.all([
            fetch(`${API_BASE_URL}/commodities`),
            fetch(`${API_BASE_URL}/forex`)
        ]);

        const commodities = await commoditiesRes.json();
        const forex = await forexRes.json();

        const container = document.getElementById("commodities-zar-list");
        container.innerHTML = "";

        // Get USD/ZAR rate
        const usdZarPair = forex.find(fx => fx.pair === "USD/ZAR");
        const usdZarRate = usdZarPair ? usdZarPair.price : 18.75;

        commodities.forEach(comm => {
            const priceUSD = parseFloat(comm.price);
            const priceZAR = priceUSD * usdZarRate;
            const pct = parseFloat(comm.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            const div = document.createElement("div");
            div.className = "market-item";

            div.innerHTML = `
                <div class="market-info">
                    <h3>${comm.name}</h3>
                    <p>R ${priceZAR.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                </div>
                <div class="performance ${trendClass}">
                    ${comm.change}
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${commodities.length} commodities in ZAR`);

    } catch (err) {
        console.error("❌ Commodities ZAR error:", err);
        const container = document.getElementById("commodities-zar-list");
        container.innerHTML = `
            <div class="market-item">
                <div class="market-info">
                    <h3>❌ Failed to load commodities</h3>
                    <p>Please refresh the page</p>
                </div>
            </div>
        `;
    }
}

/* ===========================================================
   NEXT SARB EVENT
   =========================================================== */

async function loadSARBEvent() {
    try {
        const response = await fetch(`${API_BASE_URL}/sa-markets`);
        const data = await response.json();

        const container = document.getElementById("sarb-event-card");

        if (data.nextEvent) {
            container.innerHTML = `
                <div class="sarb-event-card">
                    <div class="sarb-event-icon">📅</div>
                    <div class="sarb-event-content">
                        <h3 class="sarb-event-name">${data.nextEvent.name}</h3>
                        <p class="sarb-event-date">${data.nextEvent.date}</p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `<p class="placeholder-text">No upcoming events</p>`;
        }

        console.log("✅ Loaded SARB event");

    } catch (err) {
        console.error("❌ SARB event error:", err);
        document.getElementById("sarb-event-card").innerHTML = 
            '<p class="placeholder-text">Unable to load event data</p>';
    }
}

/* ===========================================================
   SA MARKET NEWS (FILTERED)
   =========================================================== */

async function loadSANews() {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const data = await response.json();

        const newsContainer = document.getElementById("sa-news-list");
        newsContainer.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            newsContainer.innerHTML = '<p class="placeholder-text">No news available at this time.</p>';
            return;
        }

        // Filter SA-related news
        const saKeywords = ['south africa', 'jse', 'johannesburg', 'sarb', 'rand', 'zar', 
                           'cape town', 'pretoria', 'sa ', 'african'];
        
        const saNews = data.filter(article => {
            const text = (article.headline + ' ' + article.summary).toLowerCase();
            return saKeywords.some(keyword => text.includes(keyword));
        });

        const newsToShow = (saNews.length > 0 ? saNews : data).slice(0, 5);

        newsToShow.forEach(article => {
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

        console.log(`✅ Loaded ${newsToShow.length} SA news articles`);

    } catch (err) {
        console.error("❌ SA News error:", err);
        document.getElementById("sa-news-list").innerHTML = 
            '<p class="placeholder-text">Unable to load news.</p>';
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
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
}

/* ===========================================================
   PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadJSEIndices();
    loadJSEStocks();
    loadRandForex();
    loadCommoditiesZAR();
    loadSARBEvent();
    loadSANews();
});

/* ===========================================================
   RAND FOREX (ZAR PAIRS) - WITH CLICKABLE LINKS
   =========================================================== */

   async function loadRandForex() {
    try {
        const response = await fetch(`${API_BASE_URL}/forex`);
        const data = await response.json();

        const container = document.getElementById("rand-forex-list");
        container.innerHTML = "";

        // Filter only ZAR pairs
        const zarPairs = data.filter(fx => fx.pair.includes("ZAR"));

        if (zarPairs.length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No Rand data available</h3>
                        <p>Please check back later</p>
                    </div>
                </div>
            `;
            return;
        }

        zarPairs.forEach(pair => {
            const pct = parseFloat(pair.change);
            const trendClass = pct >= 0 ? "positive" : "negative";

            // Generate detail page URL (e.g., "USD/ZAR" → "pair-usdzar.html")
            const pairSlug = pair.pair.toLowerCase().replace('/', '');
            const pairUrl = `pair-${pairSlug}.html`;

            const div = document.createElement("div");
            div.className = "market-item";
            div.style.cursor = "pointer";

            // Make entire card clickable
            div.innerHTML = `
                <a href="${pairUrl}" 
                   style="text-decoration: none; color: inherit; display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div class="market-info">
                        <h3>${pair.pair}</h3>
                        <p>${pair.price.toFixed(4)}</p>
                    </div>
                    <div class="performance ${trendClass}">
                        ${pair.change}
                    </div>
                </a>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${zarPairs.length} ZAR pairs (clickable)`);

    } catch (err) {
        console.error("❌ Rand forex error:", err);
        const container = document.getElementById("rand-forex-list");
        container.innerHTML = `
            <div class="market-item">
                <div class="market-info">
                    <h3>❌ Failed to load Rand rates</h3>
                    <p>Please refresh the page</p>
                </div>
            </div>
        `;
    }
};