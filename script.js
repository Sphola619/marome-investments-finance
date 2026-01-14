// =====================
// CONFIGURATION
// =====================
const API_BASE_URL = CONFIG.API_BASE_URL;

// =====================
// ICON HELPER
// =====================
function getTypeIcon(type) {
    switch (type) {
        case "Forex": return "💱";
        case "Crypto":  return "🪙";
        case "Stock": return "📈";
        case "Commodity":  return "🛢";
        case "Index": return "🌍";
        default: return "🔹";
    }
}

// =====================
// GENERATE DETAIL PAGE URL
// =====================
function generateDetailUrl(mover) {
    const { type, symbol, name } = mover;
    
    // Clean up symbol/name for URL
    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const cleanName = name.toLowerCase()
        .replace(/&/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    
    switch (type) {
        case "Forex":
            // e.g., pair-eurusd. html
            return `pair-${cleanSymbol}.html`;
            
        case "Commodity":
            // e.g., commodity-gold.html
            return `commodity-${cleanName}.html`;
            
        case "Crypto":
            // e.g., crypto-btc.html or crypto-bitcoin.html
            return `crypto-${cleanName}.html`;
            
        case "Stock":
            // e. g., stock-aapl. html
            return `stock-${cleanSymbol}.html`;
            
        case "Index":
            // e.g., stock-sp-500.html (indices on stocks page)
            return `stock-${cleanName}.html`;
            
        default:
            return "#";
    }
}

// =====================
// GET TRADINGVIEW SYMBOL
// =====================
function getTradingViewSymbol(mover) {
    const { type, symbol, name } = mover;
    
    switch (type) {
        case "Forex":
            // e.g., "EUR/USD" → "FX:EURUSD"
            return `FX:${symbol.replace('/', '')}`;
            
        case "Commodity":
            // Map commodity names to TradingView symbols
            const commodityMap = {
                "Gold": "TVC:GOLD",
                "Silver": "TVC:SILVER",
                "Crude Oil": "TVC:USOIL"
            };
            return commodityMap[name] || `COMEX:${symbol}`;
            
        case "Crypto": 
            // e.g., "BTC" → "BINANCE: BTCUSDT"
            const cryptoSymbol = symbol.replace('-USD', '');
            return `BINANCE:${cryptoSymbol}USDT`;
            
        case "Stock":
            // e. g., "AAPL" → "NASDAQ:AAPL"
            return `NASDAQ:${symbol}`;
            
        case "Index":
            // Map index names to TradingView symbols
            const indexMap = {
                "S&P 500": "SP:SPX",
                "NASDAQ 100": "NASDAQ:NDX",
                "Dow Jones": "DJ:DJI",
                "JSE Top 40": "JSE:TOP40"
            };
            return indexMap[name] || `INDEX:${symbol}`;
            
        default:
            return symbol;
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
            symbol: item.symbol,
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
// POPULATE GLOBAL MOVERS LIST (WITH LINKS)
// =====================
function populateMoverList(movers) {
    const container = document. getElementById("movers-list");
    container.innerHTML = "";

    movers.forEach(mover => {
        const detailUrl = generateDetailUrl(mover);
        
        const div = document.createElement("div");
        div.className = "market-item";
        div.style.cursor = "pointer";

        div. innerHTML = `
            <a href="${detailUrl}" 
               style="text-decoration:  none; color: inherit; display:  flex; align-items: center; justify-content: space-between; width: 100%;">
                <div class="market-info">
                    <h3>${getTypeIcon(mover.type)} ${mover.name}</h3>
                    <p>${mover.description}</p>
                </div>
                <div class="performance ${mover.trend}">
                    ${mover.performance}
                </div>
            </a>
        `;

        container.appendChild(div);
        
        console.log(`🔗 ${mover.name} → ${detailUrl}`);
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

        div. innerHTML = `
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