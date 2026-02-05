const API_BASE_URL = CONFIG.API_BASE_URL;
const WS_BASE_URL = CONFIG.WS_BASE_URL;

/* ===========================================================
   JSE STOCKS (SOUTH AFRICA) - FROM IRESS.CO.ZA
   =========================================================== */

let allJSEStocksPage = [];

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
        if (!container) {
            console.error("❌ jse-stocks-accordion container not found");
            return;
        }
        container.innerHTML = "";

        // Check if we have stock data
        if (!data.stocks || data.stocks.length === 0) {
            container.innerHTML = `
                <div class="market-item">
                    <div class="market-info">
                        <h3>⚠️ No JSE data available</h3>
                        <p>${data.stale ? "Showing cached data - API currently unavailable" : "Please check back later"}</p>
                    </div>
                </div>
            `;
            return;
        }

        // Store all stocks for search
        allJSEStocksPage = data.stocks;

        // Group stocks by sector
        const sectors = {};
        data.stocks.forEach(stock => {
            if (!stock || !stock.name) return; // Skip invalid stocks
            const sector = classifyStockSector(stock.name);
            if (!sectors[sector]) sectors[sector] = [];
            sectors[sector].push(stock);
        });

        // Sort sectors
        const sectorOrder = ['Exchange Traded Funds', 'Banking & Finance', 'Mining & Resources', 'Technology & Internet', 'Telecommunications & Media', 'Retail & Consumer', 'Insurance & Asset Management', 'Real Estate & Property', 'Healthcare & Pharmaceuticals', 'Energy & Chemicals', 'Industrials & Transport', 'Food & Beverage', 'Other'];
        const sortedSectors = sectorOrder.filter(s => sectors[s]);

        // Render each sector
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

            const content = document.createElement('div');
            content.className = 'sector-content';
            content.style.cssText = 'max-height: 0; overflow: hidden; transition: max-height 0.3s ease;';

            const stocksList = document.createElement('div');
            stocksList.style.cssText = 'padding: 10px;';

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

        setupJSESearchStocks();

        console.log(`✅ Loaded ${data.stocks.length} JSE stocks grouped into ${sortedSectors.length} sectors`);

    } catch (err) {
        console.error("❌ JSE stocks error:", err);
        const container = document.getElementById("jse-stocks-accordion");
        if (container) {
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
}

function setupJSESearchStocks() {
    const searchInput = document.getElementById('jse-search-stocks');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const allStockCards = document.querySelectorAll('#jse-stocks-accordion .stock-card');
        const allSectors = document.querySelectorAll('#jse-stocks-accordion .sector-accordion');

        if (query.length === 0) {
            allStockCards.forEach(card => card.style.display = '');
            allSectors.forEach(sector => {
                sector.style.display = '';
                const content = sector.querySelector('.sector-content');
                content.style.maxHeight = '0';
                sector.querySelector('.sector-toggle').textContent = '▶';
            });
            return;
        }

        allStockCards.forEach(card => {
            const name = card.getAttribute('data-stock-name');
            const ticker = card.getAttribute('data-stock-ticker');
            const matches = name.includes(query) || ticker.includes(query);
            card.style.display = matches ? '' : 'none';
        });

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
   US STOCKS
   =========================================================== */

async function loadUSStocks() {
    try {
        const response = await fetch(`${API_BASE_URL}/us-stocks`);
        const data = await response.json();

        const container = document.getElementById("us-stocks-list");
        container.innerHTML = "";

        if (data.length === 0) {
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
            div.setAttribute("data-symbol", stock.symbol);

            div.innerHTML = `
                <div class="market-info">
                    <h3>${stock.name}</h3>
                    <p>${stock.symbol} • ${stock.currency}</p>
                </div>
                <div class="stock-price-info">
                    <div class="stock-price us-stock-price">${stock.price}</div>
                    <div class="performance ${trendClass}">
                        <span class="us-stock-change">${stock.change}</span>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });

        console.log(`✅ Loaded ${data.length} US stocks`);
        
        // Display US sentiment widget
        displayUSSentiment(data);

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

function displayUSSentiment(usStocks) {
    const container = document.getElementById('us-stock-sentiment');
    if (!container || !usStocks || usStocks.length === 0) return;

    // Calculate sentiment based on positive vs negative stocks
    const positiveStocks = usStocks.filter(stock => {
        const change = parseFloat(stock.change);
        return !isNaN(change) && change > 0;
    }).length;
    
    const totalStocks = usStocks.length;
    const sentimentScore = Math.round((positiveStocks / totalStocks) * 100);
    
    // Determine sentiment level
    let sentiment;
    if (sentimentScore >= 80) {
        sentiment = { label: 'VERY BULLISH', emoji: '🚀', class: 'very-bullish' };
    } else if (sentimentScore >= 60) {
        sentiment = { label: 'BULLISH', emoji: '😃', class: 'bullish' };
    } else if (sentimentScore >= 40) {
        sentiment = { label: 'NEUTRAL', emoji: '😐', class: 'neutral' };
    } else if (sentimentScore >= 20) {
        sentiment = { label: 'BEARISH', emoji: '😟', class: 'bearish' };
    } else {
        sentiment = { label: 'VERY BEARISH', emoji: '💀', class: 'very-bearish' };
    }
    
    // Get top performers
    const topPerformers = [...usStocks]
        .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
        .slice(0, 3);
    
    // Get worst performers
    const worstPerformers = [...usStocks]
        .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
        .slice(0, 3);
    
    // Generate interpretation
    let interpretation;
    if (sentimentScore === 100) {
        interpretation = `All US stocks are rising today. Strong across-the-board buying pressure with ${topPerformers[0].name} leading at ${topPerformers[0].change}.`;
    } else if (sentimentScore === 0) {
        interpretation = `All US stocks are declining. Broad market sell-off with ${worstPerformers[0].name} down ${worstPerformers[0].change}.`;
    } else if (sentimentScore >= 60) {
        interpretation = `${positiveStocks} of ${totalStocks} US stocks are gaining. Bullish momentum with ${topPerformers[0].name} up ${topPerformers[0].change}.`;
    } else if (sentimentScore >= 40) {
        interpretation = `Mixed US market with ${positiveStocks} of ${totalStocks} stocks positive. Investors showing caution.`;
    } else {
        interpretation = `${totalStocks - positiveStocks} of ${totalStocks} US stocks are declining. Bearish pressure with ${worstPerformers[0].name} down ${worstPerformers[0].change}.`;
    }
    
    // Render widget
    container.innerHTML = `
        <div class="sentiment-widget ${sentiment.class}">
            <div class="sentiment-header">
                <span class="sentiment-emoji">${sentiment.emoji}</span>
                <span class="sentiment-label">${sentiment.label}</span>
            </div>
            
            <div class="sentiment-score">
                <div class="progress-bar">
                    <div class="progress-fill ${sentiment.class}" style="width: ${sentimentScore}%"></div>
                </div>
                <div class="score-text">${sentimentScore}/100</div>
            </div>

            <div class="sentiment-stats">
                ${positiveStocks} out of ${totalStocks} US stocks are rising
            </div>

            ${topPerformers.length > 0 ? `
                <div class="sentiment-performers">
                    <div class="performers-label">📈 Top Performers:</div>
                    <div class="performers-list">
                        ${topPerformers.map(stock => `
                            <span class="performer-item positive">
                                ${stock.name} <strong>${stock.change}</strong>
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${worstPerformers.length > 0 ? `
                <div class="sentiment-laggards">
                    <div class="laggards-label">📉 Laggards:</div>
                    <div class="laggards-list">
                        ${worstPerformers.map(stock => `
                            <span class="laggard-item negative">
                                ${stock.name} <strong>${stock.change}</strong>
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="sentiment-interpretation">
                💡 ${interpretation}
            </div>

            <div class="sentiment-updated">
                🕐 Updated: ${new Date().toLocaleTimeString()}
            </div>
        </div>
    `;
}

/* ===========================================================
   US STOCKS WEBSOCKET (INSTANT UPDATES)
   =========================================================== */

function applyUSStockUpdate(symbol, price, changePercent) {
    const card = document.querySelector(`.stock-card[data-symbol="${symbol}"]`);
    if (!card) return;

    const priceEl = card.querySelector(".us-stock-price");
    const changeEl = card.querySelector(".us-stock-change");
    const perfEl = card.querySelector(".performance");

    if (priceEl) priceEl.textContent = `$${Number(price).toFixed(2)}`;
    if (changeEl) {
        const pct = Number(changePercent) || 0;
        changeEl.textContent = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    }

    if (perfEl) {
        perfEl.classList.remove("positive", "negative");
        perfEl.classList.add(Number(changePercent) >= 0 ? "positive" : "negative");
    }
}

function connectUSStocksSocket() {
    const socket = new WebSocket(WS_BASE_URL);

    socket.addEventListener("message", (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type !== "us-stock") return;
            applyUSStockUpdate(msg.symbol, msg.price, msg.changePercent);
        } catch (err) {
            console.error("US Stocks WS parse error:", err);
        }
    });

    socket.addEventListener("close", () => {
        setTimeout(connectUSStocksSocket, 3000);
    });
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
        const response = await fetch(`${API_BASE_URL}/stock-news`);
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
        const [jseRes, usRes] = await Promise.all([
            fetch(`${API_BASE_URL}/jse-stocks`),
            fetch(`${API_BASE_URL}/us-stocks`)
        ]);

        const jseData = await jseRes.json();
        const usData = await usRes.json();

        // Extract stocks from new JSE format {stocks: [...], count: ...}
        const jseStocks = jseData.stocks || [];
        
        // Transform JSE stocks to match sentiment format (with 'change' property as string)
        const jseFormatted = jseStocks.map(stock => ({
            name: stock.name,
            change: `${stock.changePercent}%`,
            ticker: stock.ticker
        }));

        // Combine both datasets
        const allStocks = [...jseFormatted, ...usData];

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
    connectUSStocksSocket();
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
        loadJSEStocks();
        loadIndices();
        loadNews();
    }, 10000);
});