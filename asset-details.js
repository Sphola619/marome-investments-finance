const API_BASE_URL = CONFIG.API_BASE_URL;

/* ===========================================================
      ASSET CONFIGURATION - FIXED TRADINGVIEW SYMBOLS
   =========================================================== */

const ASSET_CONFIG = {
    // Forex Pairs
    "eurusd": { 
        name: "EUR/USD", 
        description: "Euro vs US Dollar", 
        tvSymbol: "OANDA:EURUSD",
        keywords: ["EUR", "USD", "Euro", "Dollar", "Federal Reserve", "ECB"],
        type: "forex"
    },
    "gbpusd": { 
        name: "GBP/USD", 
        description: "British Pound vs US Dollar", 
        tvSymbol: "OANDA:GBPUSD",
        keywords: ["GBP", "USD", "Pound", "Dollar", "Bank of England"],
        type: "forex"
    },
    "usdjpy": { 
        name: "USD/JPY", 
        description: "US Dollar vs Japanese Yen", 
        tvSymbol: "OANDA: USDJPY",
        keywords:  ["USD", "JPY", "Yen", "Dollar", "Bank of Japan"],
        type: "forex"
    },
    "usdzar": { 
        name: "USD/ZAR", 
        description: "US Dollar vs South African Rand", 
        tvSymbol: "OANDA:USDZAR",
        keywords: ["USD", "ZAR", "Rand", "South Africa"],
        type: "forex"
    },
    "audusd": { 
        name: "AUD/USD", 
        description: "Australian Dollar vs US Dollar", 
        tvSymbol: "OANDA: AUDUSD",
        keywords:  ["AUD", "USD", "Australia", "Dollar"],
        type: "forex"
    },
    "usdchf": { 
        name:  "USD/CHF", 
        description: "US Dollar vs Swiss Franc", 
        tvSymbol: "OANDA: USDCHF",
        keywords: ["USD", "CHF", "Franc", "Switzerland"],
        type: "forex"
    },

    // Commodities
    "gold": { 
        name:  "Gold", 
        description: "Gold Futures (XAU/USD)", 
        tvSymbol: "OANDA:XAUUSD",
        keywords:  ["Gold", "XAU", "precious metals", "safe haven"],
        type: "commodity"
    },
    "silver": { 
        name: "Silver", 
        description: "Silver Futures (XAG/USD)", 
        tvSymbol: "OANDA:XAGUSD",
        keywords: ["Silver", "XAG", "precious metals"],
        type: "commodity"
    },
    "crude-oil": { 
        name:  "Crude Oil", 
        description: "WTI Crude Oil Futures", 
        tvSymbol: "TVC:USOIL",
        keywords: ["Oil", "WTI", "Crude", "energy", "petroleum"],
        type: "commodity"
    },

    // Stock Indices
    "sp-500": { 
        name:  "S&P 500", 
        description: "S&P 500 Index tracked via SPY ETF", 
        tvSymbol: "AMEX:SPY",
        keywords: ["S&P", "SPX", "SPY", "stocks", "equity", "US market"],
        type: "stock"
    },
    "nasdaq-100": { 
        name:  "NASDAQ 100", 
        description: "NASDAQ 100 Index tracked via QQQ ETF", 
        tvSymbol: "NASDAQ:QQQ",
        keywords: ["NASDAQ", "NDX", "QQQ", "tech", "technology", "stocks"],
        type: "stock"
    },
    "dow-jones": { 
        name: "Dow Jones", 
        description: "Dow Jones Industrial Average tracked via DIA ETF", 
        tvSymbol: "AMEX:DIA",
        keywords: ["Dow", "DJI", "DJIA", "DIA", "industrials", "stocks"],
        type: "stock"
    },
    "jse-top-40": { 
        name: "JSE Top 40", 
        description: "JSE Top 40 Index - South African Blue Chips", 
        tvSymbol:  "JSE:TOP40",
        keywords: ["JSE", "South Africa", "J200", "Top 40"],
        type: "stock"
    },

    // Cryptocurrencies
    "btc": {
        name: "BTC",
        description: "Bitcoin (BTC/USD) - Digital Gold", 
        tvSymbol: "BINANCE:BTCUSD",
        keywords: ["Bitcoin", "BTC", "crypto", "cryptocurrency", "digital currency"],
        type: "crypto"
    },
    "eth":  {
        name: "ETH",
        description: "Ethereum (ETH/USD) - Smart Contract Platform", 
        tvSymbol: "BINANCE: ETHUSD",
        keywords:  ["Ethereum", "ETH", "crypto", "smart contracts", "DeFi"],
        type: "crypto"
    },
    "xrp": { 
        name: "XRP",
        description: "Ripple (XRP/USD) - Digital Payment Protocol", 
        tvSymbol:  "BINANCE:XRPUSD",
        keywords:  ["XRP", "Ripple", "crypto", "payments"],
        type: "crypto"
    },
    "ada": {
        name: "ADA",
        description: "Cardano (ADA/USD) - Proof-of-Stake Blockchain", 
        tvSymbol: "BINANCE:ADAUSD",
        keywords: ["Cardano", "ADA", "crypto", "proof of stake"],
        type: "crypto"
    },
    "sol": {
        name: "SOL",
        description: "Solana (SOL/USD) - High-Speed Blockchain", 
        tvSymbol: "BINANCE: SOLUSD",
        keywords: ["Solana", "SOL", "crypto", "blockchain"],
        type: "crypto"
    },
    "doge": {
        name: "DOGE",
        description:  "Dogecoin (DOGE/USD) - Meme Cryptocurrency", 
        tvSymbol: "BINANCE: DOGEUSD",
        keywords: ["Dogecoin", "DOGE", "crypto", "meme coin"],
        type: "crypto"
    },
    "avax": {
        name: "AVAX",
        description: "Avalanche (AVAX/USD) - High-Speed Smart Contract Platform",
        tvSymbol: "BINANCE:AVAXUSD",
        keywords: ["Avalanche", "AVAX", "crypto", "DeFi"],
        type: "crypto"
    },
    "bnb": {
        name: "BNB",
        description: "Binance Coin (BNB/USD) - Exchange Token",
        tvSymbol: "BINANCE: BNBUSD",
        keywords:  ["Binance", "BNB", "crypto", "exchange"],
        type: "crypto"
    },
    "ltc": {
        name:  "LTC",
        description:  "Litecoin (LTC/USD) - Silver to Bitcoin's Gold", 
        tvSymbol: "BINANCE:LTCUSD",
        keywords: ["Litecoin", "LTC", "crypto", "digital silver"],
        type: "crypto"
    }
};

/* ===========================================================
      DETECT CURRENT ASSET FROM URL
   =========================================================== */

function getCurrentAsset() {
    const path = window.location.pathname;
    const filename = path.split("/").pop();
    
    console.log("📄 Current filename:", filename);
    
    const match = filename.match(/^(pair|commodity|stock|crypto)-(.+)\.html$/);
    if (match) {
        const slug = match[2];
        console.log("✅ Detected asset slug:", slug);
        return slug;
    }
    
    console.error("❌ Could not extract asset slug from:", filename);
    return null;
}

/* ===========================================================
      LOAD ASSET PAGE
   =========================================================== */

async function loadAssetPage() {
    const assetSlug = getCurrentAsset();
    
    console.log("🔍 Looking for config for:", assetSlug);
    console.log("📋 Available configs:", Object.keys(ASSET_CONFIG));
    
    if (!assetSlug || ! ASSET_CONFIG[assetSlug]) {
        console.error("❌ Asset not found in config:", assetSlug);
        console.error("💡 Make sure the filename matches one of these:", Object.keys(ASSET_CONFIG));
        document.getElementById("asset-title").textContent = "Asset Not Found";
        document.getElementById("asset-description").textContent = "This asset page does not exist.";
        return;
    }

    const asset = ASSET_CONFIG[assetSlug];
    
    console.log("✅ Asset config loaded:", asset);

    // Update page title and header
    document.getElementById("page-title").textContent = `${asset.name} - Marome Investments`;
    
    // Update icon based on type
    const icon = asset.type === "forex" ? "💱" :  
                 asset.type === "commodity" ?  "🛢️" : 
                 asset.type === "crypto" ? "₿" : 
                 "📊";
    
    document. getElementById("asset-title").textContent = `${icon} ${asset.name}`;
    document.getElementById("asset-description").textContent = asset.description;

    // ✅ REMOVED:  Back button modification - it already uses window.history.back()
    console.log("✅ Back button using smart navigation (window.history.back())");

    // Load TradingView chart
    console.log("📊 Loading chart for:", asset.tvSymbol);
    loadChart(asset.tvSymbol);

    // Load current price
    loadCurrentPrice(assetSlug, asset);

    // Load news
    loadAssetNews(asset. keywords);
}

/* ===========================================================
      LOAD TRADINGVIEW CHART
   =========================================================== */

function loadChart(tvSymbol) {
    const container = document.querySelector(".chart-wrapper");
    
    if (!container) {
        console.error("❌ Chart container not found!");
        return;
    }
    
    // Clear existing content
    container.innerHTML = "";
    
    // Create new TradingView widget script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = function() {
        new TradingView.widget({
            "autosize": true,
            "symbol": tvSymbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "container_id": "tradingview_chart_container"
        });
    };
    
    // Create container div for widget
    const widgetContainer = document.createElement("div");
    widgetContainer.id = "tradingview_chart_container";
    widgetContainer. style.height = "500px";
    widgetContainer. style.width = "100%";
    
    container.appendChild(widgetContainer);
    container.appendChild(script);
    
    console.log("✅ Chart widget initialized for:", tvSymbol);
}

/* ===========================================================
      LOAD CURRENT PRICE
   =========================================================== */

async function loadCurrentPrice(assetSlug, asset) {
    try {
        let apiEndpoint = "";
        let findAsset = null;

        if (asset.type === "commodity") {
            apiEndpoint = "/commodities";
            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`);
            const data = await response.json();
            console.log("📦 Commodities data:", data);
            findAsset = data.find(item => item.name === asset.name);
            
        } else if (asset. type === "forex") {
            apiEndpoint = "/forex";
            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`);
            const data = await response. json();
            console.log("💱 Forex data:", data);
            findAsset = data. find(item => item.pair === asset.name);
            
        } else if (asset.type === "stock") {
            apiEndpoint = "/indices";
            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`);
            const data = await response.json();
            console.log("📊 Indices data:", data);
            findAsset = data.find(item => item.name === asset.name);
            
        } else if (asset.type === "crypto") {
            apiEndpoint = "/crypto";
            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`);
            const data = await response.json();
            console.log("₿ Crypto data:", data);
            findAsset = data.find(item => item.name === asset.name);
        }

        console.log("🔍 Found asset data:", findAsset);

        if (findAsset) {
            const price = findAsset.price || findAsset.latest || "--";
            const change = findAsset.change || "--";
            const isPositive = parseFloat(change) >= 0;

            document.getElementById("price-value").textContent = price;
            document.getElementById("price-change").textContent = change;
            document.getElementById("price-change").className = `price-change ${isPositive ?  "positive" : "negative"}`;
            
            console.log("✅ Price loaded:", price, change);
        } else {
            console.warn("⚠️ Asset data not found in API response");
        }

    } catch (err) {
        console.error("❌ Error loading price:", err);
    }
}

/* ===========================================================
      LOAD NEWS
   =========================================================== */

async function loadAssetNews(keywords) {
    try {
        const response = await fetch(`${API_BASE_URL}/news`);
        const allNews = await response.json();

        console.log("📰 Total news articles:", allNews.length);
        console.log("🔍 Filtering by keywords:", keywords);

        const filteredNews = allNews.filter(article => {
            const title = (article.headline || "").toLowerCase();
            const summary = (article.summary || "").toLowerCase();
            return keywords.some(keyword => 
                title.includes(keyword. toLowerCase()) || summary.includes(keyword.toLowerCase())
            );
        }).slice(0, 5);

        console.log("✅ Filtered news count:", filteredNews.length);

        const newsContainer = document.getElementById("asset-news");

        if (! newsContainer) {
            console. error("❌ News container not found!");
            return;
        }

        if (filteredNews.length === 0) {
            newsContainer. innerHTML = '<p class="placeholder-text">No recent news available for this asset. </p>';
            return;
        }

        newsContainer.innerHTML = filteredNews.map(article => `
            <div class="news-card">
                <a href="${article.url}" target="_blank" class="news-link">
                    <h3 class="news-title">${article.headline}</h3>
                    <p class="news-source">${article.source} • ${new Date(article.datetime * 1000).toLocaleDateString()}</p>
                </a>
            </div>
        `).join("");

    } catch (err) {
        console.error("❌ Error loading news:", err);
        const newsContainer = document.getElementById("asset-news");
        if (newsContainer) {
            newsContainer.innerHTML = '<p class="placeholder-text">Failed to load news. </p>';
        }
    }
}

/* ===========================================================
      PAGE LOAD
   =========================================================== */

document.addEventListener("DOMContentLoaded", loadAssetPage);