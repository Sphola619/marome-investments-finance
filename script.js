// =====================
// CONFIGURATION
// =====================
const API_BASE_URL = CONFIG.API_BASE_URL;

// =====================
// CENTRAL BANK RATES (HARDCODED)
// =====================
const CENTRAL_BANK_RATES = [
    { currency: 'USD', country: 'United States', bank: 'Federal Reserve', rate: 3.75, flag: '🇺🇸' },
    { currency: 'EUR', country: 'Eurozone', bank: 'ECB', rate: 2.15, flag: '🇪🇺' },
    { currency: 'GBP', country: 'United Kingdom', bank: 'Bank of England', rate: 3.75, flag: '🇬🇧' },
    { currency: 'JPY', country: 'Japan', bank: 'Bank of Japan', rate: 0.75, flag: '🇯🇵' },
    { currency: 'AUD', country: 'Australia', bank: 'RBA', rate: 3.85, flag: '🇦🇺' },
    { currency: 'CAD', country: 'Canada', bank: 'Bank of Canada', rate: 2.25, flag: '🇨🇦' },
    { currency: 'CHF', country: 'Switzerland', bank: 'SNB', rate: 0.00, flag: '🇨🇭' },
    { currency: 'NZD', country: 'New Zealand', bank: 'RBNZ', rate: 2.25, flag: '🇳🇿' },
    { currency: 'ZAR', country: 'South Africa', bank: 'SARB', rate: 6.75, flag: '🇿🇦' }
];

function displayCentralBankRates() {
    const container = document.getElementById('central-bank-rates');
    if (!container) return;

    container.innerHTML = CENTRAL_BANK_RATES.map(bank => `
        <div class="bank-rate-card">
            <div class="bank-info">
                <span class="bank-flag">${bank.flag}</span>
                <div class="bank-details">
                    <span class="bank-currency">${bank.currency}</span>
                    <span class="bank-name">${bank.bank}</span>
                </div>
            </div>
            <div class="rate-value">${bank.rate.toFixed(2)}%</div>
        </div>
    `).join('');
}

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

// =====================
// FETCH SA MARKETS DATA
// =====================
async function fetchSAMarkets() {
    try {
        const resp = await fetch(`${API_BASE_URL}/sa-markets`);
        if (!resp.ok) return null;
        return await resp.json();
    } catch (err) {
        console.error("❌ SA Markets fetch error:", err);
        return null;
    }
}

// =====================
// POPULATE SA INDICES
// =====================
function populateSAIndices(indices) {
    const container = document.getElementById("sa-indices-list");
    container.innerHTML = "";

    indices.forEach(index => {
        const div = document.createElement("div");
        div.className = "sa-data-item";
        
        const trendClass = index.rawChange >= 0 ? "positive" : "negative";
        
        div.innerHTML = `
            <span class="sa-label">${index.name}</span>
            <span class="sa-value">
                <span class="sa-price">${index.latest}</span>
                <span class="sa-change ${trendClass}">${index.change}</span>
            </span>
        `;
        
        container.appendChild(div);
    });
}

// =====================
// POPULATE SA FOREX
// =====================
function populateSAForex(forex) {
    const container = document.getElementById("sa-forex-list");
    container.innerHTML = "";

    forex.forEach(pair => {
        const div = document.createElement("div");
        div.className = "sa-data-item";
        
        const trendClass = pair.rawChange >= 0 ? "positive" :  "negative";
        
        div.innerHTML = `
            <span class="sa-label">${pair.pair}</span>
            <span class="sa-value">
                <span class="sa-price">${pair.price. toFixed(2)}</span>
                <span class="sa-change ${trendClass}">${pair.change}</span>
            </span>
        `;
        
        container.appendChild(div);
    });
}

// =====================
// POPULATE SA COMMODITIES
// =====================
function populateSACommodities(commodities) {
    const container = document.getElementById("sa-commodities-list");
    container.innerHTML = "";

    commodities.forEach(commodity => {
        const div = document.createElement("div");
        div.className = "sa-data-item";
        
        const trendClass = commodity.rawChange >= 0 ? "positive" : "negative";
        
        div.innerHTML = `
            <span class="sa-label">${commodity.name}</span>
            <span class="sa-value">
                <span class="sa-price">${commodity.priceZAR}</span>
                <span class="sa-change ${trendClass}">${commodity.change}</span>
            </span>
        `;
        
        container.appendChild(div);
    });
}

// =====================
// POPULATE NEXT SARB EVENT
// =====================
function populateNextEvent(event) {
    const container = document.getElementById("sa-next-event");
    
    if (event) {
        container.innerHTML = `
            <p class="sa-event-name">${event.name}</p>
            <p class="sa-event-date">${event.date}</p>
        `;
    } else {
        container.innerHTML = `<p class="sa-event-text">No upcoming events</p>`;
    }
}

// =====================
// LOAD SA MARKETS
// =====================
async function loadSAMarkets() {
    const saData = await fetchSAMarkets();
    
    if (saData) {
        populateSAIndices(saData.indices);
        populateSAForex(saData.forex);
        populateSACommodities(saData.commodities);
        populateNextEvent(saData.nextEvent);
    } else {
        document.querySelector(".sa-markets-section").innerHTML = `
            <h2 class="section-title">🇿🇦 South African Markets</h2>
            <div style="text-align:center;color:#777;padding:2rem;">
                ❌ Unable to load SA market data. Please try again later. 
            </div>
        `;
    }
}

// =====================
// UPDATE INITIAL LOAD
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
    
    // ✅ Load Central Bank Rates
    displayCentralBankRates();
    
    // ✅ Load SA Markets
    loadSAMarkets();
});