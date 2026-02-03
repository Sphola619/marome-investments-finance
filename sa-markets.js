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
   JSE STOCKS FROM IRESS.CO.ZA - SECTOR ACCORDION
   =========================================================== */

let allJSEStocks = [];

function classifyStockSector(name) {
    if (!name) return 'Other';
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('etf') || nameLower.includes('exchange traded')) return 'Exchange Traded Funds';
    if (nameLower.includes('bank') || nameLower.includes('financial') || nameLower.includes('capitec') || nameLower.includes('investec') || nameLower.includes('nedbank') || nameLower.includes('standard bank') || nameLower.includes('firstrand') || nameLower.includes('absa')) return 'Banking & Finance';
    if (nameLower.includes('gold') || nameLower.includes('mining') || nameLower.includes('platinum') || nameLower.includes('coal') || nameLower.includes('anglo') || nameLower.includes('bhp') || nameLower.includes('impala') || nameLower.includes('sibanye') || nameLower.includes('harmony')) return 'Mining & Resources';
    if (nameLower.includes('property') || nameLower.includes('reit') || nameLower.includes('real estate') || nameLower.includes('growthpoint') || nameLower.includes('redefine')) return 'Real Estate & Property';
    if (nameLower.includes('retail') || nameLower.includes('shoprite') || nameLower.includes('pick n pay') || nameLower.includes('spar') || nameLower.includes('woolworths') || nameLower.includes('massmart') || nameLower.includes('mr price') || nameLower.includes('truworths') || nameLower.includes('foschini')) return 'Retail & Consumer';
    if (nameLower.includes('insurance') || nameLower.includes('sanlam') || nameLower.includes('old mutual') || nameLower.includes('santam') || nameLower.includes('discovery') || nameLower.includes('momentum')) return 'Insurance & Asset Management';
    if (nameLower.includes('telecom') || nameLower.includes('vodacom') || nameLower.includes('mtn') || nameLower.includes('telkom') || nameLower.includes('blue label')) return 'Telecommunications & Media';
    if (nameLower.includes('tech') || nameLower.includes('software') || nameLower.includes('naspers') || nameLower.includes('prosus')) return 'Technology & Internet';
    if (nameLower.includes('pharma') || nameLower.includes('health') || nameLower.includes('mediclinic') || nameLower.includes('aspen') || nameLower.includes('life healthcare') || nameLower.includes('netcare')) return 'Healthcare & Pharmaceuticals';
    if (nameLower.includes('energy') || nameLower.includes('sasol') || nameLower.includes('oil') || nameLower.includes('gas')) return 'Energy & Chemicals';
    if (nameLower.includes('industrial') || nameLower.includes('transport') || nameLower.includes('logistics') || nameLower.includes('barloworld') || nameLower.includes('imperial')) return 'Industrials & Transport';
    if (nameLower.includes('food') || nameLower.includes('tiger brands') || nameLower.includes('astral') || nameLower.includes('pioneer') || nameLower.includes('rbh')) return 'Food & Beverage';
    
    return 'Other';
}

async function loadJSEStocks() {
    try {
        const response = await fetch(`${API_BASE_URL}/jse-stocks`);
        const data = await response.json();

        const container = document.getElementById("jse-stocks-accordion");
        container.innerHTML = "";

        // Check if we have stock data
        if (!data.stocks || data.stocks.length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No JSE stock data available</h3>
                        <p>${data.stale ? "Showing cached data - API currently unavailable" : "Please check back later"}</p>
                    </div>
                </div>
            `;
            return;
        }

        // Store all stocks for search functionality
        allJSEStocks = data.stocks;

        // Group stocks by sector
        const sectors = {};
        data.stocks.forEach(stock => {
            if (!stock || !stock.name) return; // Skip invalid stocks
            const sector = classifyStockSector(stock.name);
            if (!sectors[sector]) sectors[sector] = [];
            sectors[sector].push(stock);
        });

        // Sort sectors by name (ETFs first, Other last)
        const sectorOrder = ['Exchange Traded Funds', 'Banking & Finance', 'Mining & Resources', 'Technology & Internet', 'Telecommunications & Media', 'Retail & Consumer', 'Insurance & Asset Management', 'Real Estate & Property', 'Healthcare & Pharmaceuticals', 'Energy & Chemicals', 'Industrials & Transport', 'Food & Beverage', 'Other'];
        const sortedSectors = sectorOrder.filter(s => sectors[s]);

        // Render each sector as collapsible accordion
        sortedSectors.forEach(sector => {
            const stocks = sectors[sector];
            
            // Calculate sector total change (sum of all stock changes)
            const sectorTotalChange = stocks.reduce((sum, stock) => {
                const change = parseFloat(stock.changePercent) || 0;
                return sum + change;
            }, 0);
            
            const sectorTrendClass = sectorTotalChange >= 0 ? 'positive' : 'negative';
            const sectorArrow = sectorTotalChange >= 0 ? '↑' : '↓';
            
            const sectorDiv = document.createElement('div');
            sectorDiv.className = 'sector-accordion';
            sectorDiv.style.cssText = 'margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;';

            // Sector header (clickable)
            const header = document.createElement('div');
            header.className = 'sector-header';
            header.style.cssText = 'padding: 15px; background: var(--card-bg); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;';
            header.innerHTML = `
                <div style="flex: 1;">
                    <strong style="font-size: 1.1rem;">${sector}</strong>
                    <span style="color: var(--text-muted); margin-left: 10px;">(${stocks.length} stocks)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="performance ${sectorTrendClass}" style="font-size: 1.1rem; font-weight: bold; padding: 8px 15px; border-radius: 8px;">
                        ${sectorArrow} ${Math.abs(sectorTotalChange).toFixed(2)}%
                    </div>
                    <span class="sector-toggle" style="font-size: 1.5rem;">▶</span>
                </div>
            `;

            // Sector content (stocks list)
            const content = document.createElement('div');
            content.className = 'sector-content';
            content.style.cssText = 'max-height: 0; overflow: hidden; transition: max-height 0.3s ease;';

            const stocksList = document.createElement('div');
            stocksList.style.cssText = 'padding: 10px;';

            // Sort stocks by absolute change
            stocks.sort((a, b) => Math.abs(parseFloat(b.changePercent)) - Math.abs(parseFloat(a.changePercent)));

            stocks.forEach(stock => {
                const pct = parseFloat(stock.changePercent);
                const trendClass = pct >= 0 ? 'positive' : 'negative';
                const arrow = pct >= 0 ? '↑' : '↓';
                const priceZAR = (stock.price / 100).toFixed(2);

                const stockDiv = document.createElement('div');
                stockDiv.className = 'market-item stock-card';
                stockDiv.setAttribute('data-stock-name', stock.name.toLowerCase());
                stockDiv.setAttribute('data-stock-ticker', stock.ticker.toLowerCase());
                stockDiv.style.cssText = 'margin-bottom: 8px;';

                stockDiv.innerHTML = `
                    <div class="market-info">
                        <h3 style="font-size: 0.95rem;">${stock.name}</h3>
                        <p style="font-size: 0.85rem;">${stock.ticker} • R${priceZAR}</p>
                    </div>
                    <div class="stock-price-info">
                        <div class="performance ${trendClass}">
                            ${arrow} ${Math.abs(pct)}%
                        </div>
                    </div>
                `;

                stocksList.appendChild(stockDiv);
            });

            content.appendChild(stocksList);

            // Toggle accordion on click
            header.addEventListener('click', () => {
                const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
                const toggle = header.querySelector('.sector-toggle');
                
                if (isOpen) {
                    content.style.maxHeight = '0';
                    toggle.textContent = '▶';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    toggle.textContent = '▼';
                }
            });

            sectorDiv.appendChild(header);
            sectorDiv.appendChild(content);
            container.appendChild(sectorDiv);
        });

        // Setup search functionality
        setupJSESearch();

        console.log(`✅ Loaded ${data.stocks.length} JSE stocks grouped into ${sortedSectors.length} sectors`);

    } catch (err) {
        console.error("❌ JSE stocks error:", err);
        const container = document.getElementById("jse-stocks-accordion");
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

function setupJSESearch() {
    const searchInput = document.getElementById('jse-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const allStockCards = document.querySelectorAll('.stock-card');
        const allSectors = document.querySelectorAll('.sector-accordion');

        if (query.length === 0) {
            // Show all stocks and reset accordions
            allStockCards.forEach(card => card.style.display = '');
            allSectors.forEach(sector => {
                sector.style.display = '';
                const content = sector.querySelector('.sector-content');
                content.style.maxHeight = '0';
                sector.querySelector('.sector-toggle').textContent = '▶';
            });
            return;
        }

        // Filter stocks
        allStockCards.forEach(card => {
            const name = card.getAttribute('data-stock-name');
            const ticker = card.getAttribute('data-stock-ticker');
            const matches = name.includes(query) || ticker.includes(query);
            card.style.display = matches ? '' : 'none';
        });

        // Show/hide sectors and auto-expand those with matches
        allSectors.forEach(sector => {
            const visibleStocks = sector.querySelectorAll('.stock-card[style=""], .stock-card:not([style*="display: none"])');
            const hasMatches = visibleStocks.length > 0;
            
            sector.style.display = hasMatches ? '' : 'none';
            
            if (hasMatches) {
                const content = sector.querySelector('.sector-content');
                content.style.maxHeight = content.scrollHeight + 'px';
                sector.querySelector('.sector-toggle').textContent = '▼';
            }
        });
    });
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