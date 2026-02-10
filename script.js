// =====================
// CONFIGURATION
// =====================
const API_BASE_URL = CONFIG.API_BASE_URL;

// =====================
// CENTRAL BANK RATES (HARDCODED)
// =====================
const CENTRAL_BANK_RATES = [
    { 
        currency: 'USD', 
        country: 'United States', 
        bank: 'Federal Reserve', 
        rate: 3.75,  // ✅ Accurate range format
        previousRate: 3.75,
        flag: '🇺🇸',
        nextMeeting: '2026-03-18',
        lastMeeting: '2026-01-28',
        stance: 'Neutral',
        inflation: { current: 2.7, target: 2.0 },
        unemployment: 4.4,
        gdp: 4.4,
        recentComment: 'The Federal Reserve is monitoring inflation trends closely while maintaining flexibility in policy decisions.',
        governor: 'Jerome Powell'
    },
    { 
        currency: 'EUR', 
        country: 'Eurozone', 
        bank: 'ECB', 
        rate: 2.15, 
        previousRate: 2.15,
        flag: '🇪🇺',
        nextMeeting: '2026-03-06',
        lastMeeting: '2026-01-30',
        stance: 'Neutral',
        inflation: { current: 1.9, target: 2.0 },
        unemployment: 6.2,
        gdp: 0.3,
        recentComment: 'Inflation is moving toward our target, allowing for gradual policy normalization.',
        governor: 'Christine Lagarde'
    },
    { 
        currency: 'GBP', 
        country: 'United Kingdom', 
        bank: 'Bank of England', 
        rate: 3.75, 
        previousRate: 3.75,
        flag: '🇬🇧',
        nextMeeting: '2026-03-19',
        lastMeeting: '2026-02-05',
        stance: 'Neutral',
        inflation: { current: 3.4, target: 2.0 },
        unemployment: 5.1,
        gdp: 0.1,
        recentComment: 'We remain committed to returning inflation sustainably to the 2% target.',
        governor: 'Andrew Bailey'
    },
    { 
        currency: 'JPY', 
        country: 'Japan', 
        bank: 'Bank of Japan', 
        rate: 0.75, 
        previousRate: 0.75,
        flag: '🇯🇵',
        nextMeeting: '2026-03-19',
        lastMeeting: '2026-01-23',
        stance: 'Neutral',
        inflation: { current: 2.1, target: 2.0 },
        unemployment: 2.6,
        gdp: 0.6,
        recentComment: 'We will continue to adjust the degree of monetary accommodation as economic conditions evolve.',
        governor: 'Kazuo Ueda'
    },
    { 
        currency: 'AUD', 
        country: 'Australia', 
        bank: 'RBA', 
        rate: 3.85, 
        previousRate: 3.60,
        flag: '🇦🇺',
        nextMeeting: '2026-03-17',
        lastMeeting: '2026-02-03',
        stance: 'Hawkish',
        inflation: { current: 3.8, target: '2.0 - 3.0' },
        unemployment: 4.2,
        gdp: 0.4,
        recentComment: 'The Board remains resolute in its determination to return inflation to target.',
        governor: 'Michele Bullock'
    },
    { 
        currency: 'CAD', 
        country: 'Canada', 
        bank: 'Bank of Canada', 
        rate: 2.25, 
        previousRate: 2.25,
        flag: '🇨🇦',
        nextMeeting: '2026-03-18',
        lastMeeting: '2026-01-28',
        stance: 'Neutral',
        inflation: { current: 2.4, target: 2.0 },
        unemployment: 6.8,
        gdp: 1.3,
        recentComment: 'With inflation easing, we have room to support economic growth.',
        governor: 'Tiff Macklem'
    },
    { 
        currency: 'CHF', 
        country: 'Switzerland', 
        bank: 'SNB', 
        rate: 0.00, 
        previousRate: 0.25,
        flag: '🇨🇭',
        nextMeeting: '2026-03-26',
        lastMeeting: '2025-12-12',
        stance: 'Dovish',
        inflation: { current: 0.7, target: 2.0 },
        unemployment: 2.3,
        gdp: 1.4,
        recentComment: 'The SNB is willing to intervene in the foreign exchange market to counter upward pressure on the franc.',
        governor: 'Thomas Jordan'
    },
    { 
        currency: 'NZD', 
        country: 'New Zealand', 
        bank: 'RBNZ', 
        rate: 2.25, 
        previousRate: 2.75,
        flag: '🇳🇿',
        nextMeeting: '2026-02-18',
        lastMeeting: '2025-11-26',
        stance: 'Dovish',
        inflation: { current: 3.1, target: 2.0 },
        unemployment: 5.1,
        gdp: 1.1,
        recentComment: 'Inflation is within our target range, allowing for policy easing to support growth.',
        governor: 'Adrian Orr'
    },
    { 
        currency: 'ZAR', 
        country: 'South Africa', 
        bank: 'SARB', 
        rate: 6.75, 
        previousRate: 6.75,
        flag: '🇿🇦',
        nextMeeting: '2026-03-26',
        lastMeeting: '2026-01-29',
        stance: 'Neutral',
        inflation: { current: 3.5, target: 3.0 },
        unemployment: 31.9,
        gdp: 0.5,
        recentComment: 'The MPC will continue to monitor risks to the inflation outlook and act appropriately.',
        governor: 'Lesetja Kganyago'
    }
];

// Store live economic indicators
let liveEconomicIndicators = null;

// Fetch live economic indicators from backend
async function fetchEconomicIndicators() {
    try {
        const response = await fetch(`${API_BASE_URL}/economic-indicators`);
        if (!response.ok) throw new Error('Failed to fetch economic indicators');
        const data = await response.json();
        liveEconomicIndicators = data.indicators;
        console.log('✅ Live economic indicators loaded');
    } catch (error) {
        console.error('❌ Error fetching economic indicators:', error);
    }
}

function displayCentralBankRates() {
    const container = document.getElementById('central-bank-rates');
    if (!container) return;

    container.innerHTML = CENTRAL_BANK_RATES.map((bank, index) => {
        // ✅ Handle both numbers and strings (ranges)
        const rateDisplay = typeof bank.rate === 'number' 
            ? `${bank.rate.toFixed(2)}%` 
            : bank.rate;
        
        return `
            <div class="bank-rate-card" onclick="openBankModal(${index})">
                <div class="bank-info">
                    <span class="bank-flag">${bank.flag}</span>
                    <div class="bank-details">
                        <span class="bank-currency">${bank.currency}</span>
                        <span class="bank-name">${bank.bank}</span>
                    </div>
                </div>
                <div class="rate-value">${rateDisplay}</div>
            </div>
        `;
    }).join('');
}

// =====================
// CENTRAL BANK MODAL
// =====================
function openBankModal(index) {
    const bank = CENTRAL_BANK_RATES[index];
    const modal = document.getElementById('bank-modal');
    const modalBody = document.getElementById('bank-modal-body');
    
    // Calculate days until next meeting
    const today = new Date();
    const nextMeetingDate = new Date(bank.nextMeeting);
    const daysUntil = Math.ceil((nextMeetingDate - today) / (1000 * 60 * 60 * 24));
    
    // Determine trend
    const rateChange = bank.rate - bank.previousRate;
    let trend = '→';
    let trendClass = 'neutral';
    let trendText = 'Unchanged';
    
    if (rateChange > 0) {
        trend = '↑';
        trendClass = 'hiking';
        trendText = `+${rateChange.toFixed(2)}% increase`;
    } else if (rateChange < 0) {
        trend = '↓';
        trendClass = 'cutting';
        trendText = `${rateChange.toFixed(2)}% decrease`;
    }
    
    // Stance emoji
    const stanceEmoji = bank.stance === 'Hawkish' ? '🦅' : bank.stance === 'Dovish' ? '🕊️' : '⚖️';
    
    // Get live economic data if available
    const liveData = liveEconomicIndicators ? liveEconomicIndicators[bank.currency] : null;
    
    // Use live data if available, otherwise fallback to hardcoded
    const inflationValue = liveData?.inflation?.value !== null && liveData?.inflation?.value !== undefined
        ? liveData.inflation.value.toFixed(2) 
        : bank.inflation.current.toFixed(2);
    const inflationDate = liveData?.inflation?.date || null;
    
    const unemploymentValue = liveData?.unemployment?.value !== null && liveData?.unemployment?.value !== undefined
        ? liveData.unemployment.value.toFixed(2) 
        : bank.unemployment.toFixed(2);
    const unemploymentDate = liveData?.unemployment?.date || null;
    
    const gdpValue = liveData?.gdp?.value !== null && liveData?.gdp?.value !== undefined
        ? liveData.gdp.value.toFixed(2) 
        : bank.gdp.toFixed(2);
    const gdpDate = liveData?.gdp?.date || null;
    
    modalBody.innerHTML = `
        <div class="bank-modal-header">
            <div class="bank-modal-title">
                <span class="bank-modal-flag">${bank.flag}</span>
                <div>
                    <h2>${bank.bank}</h2>
                    <p class="bank-modal-country">${bank.country} (${bank.currency})</p>
                </div>
            </div>
            <div class="bank-modal-rate">
                <div class="modal-rate-value">${bank.rate.toFixed(2)}%</div>
                <div class="modal-rate-trend ${trendClass}">${trend} ${trendText}</div>
            </div>
        </div>
        
        <div class="bank-modal-section">
            <h3>📅 Meeting Schedule</h3>
            <div class="bank-modal-grid">
                <div class="bank-modal-item">
                    <span class="item-label">Next Meeting</span>
                    <span class="item-value">${new Date(bank.nextMeeting).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span class="item-sublabel">${daysUntil} days away</span>
                </div>
                <div class="bank-modal-item">
                    <span class="item-label">Last Meeting</span>
                    <span class="item-value">${new Date(bank.lastMeeting).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div class="bank-modal-item">
                    <span class="item-label">Previous Rate</span>
                    <span class="item-value">${bank.previousRate.toFixed(2)}%</span>
                </div>
                <div class="bank-modal-item">
                    <span class="item-label">Policy Stance</span>
                    <span class="item-value">${stanceEmoji} ${bank.stance}</span>
                </div>
            </div>
        </div>
        
        <div class="bank-modal-section">
            <h3>📊 Key Economic Indicators</h3>
            <div class="bank-modal-grid">
                <div class="bank-modal-item">
                    <span class="item-label">Inflation (CPI)</span>
                    <span class="item-value">${inflationValue}%</span>
                    <span class="item-sublabel">${inflationDate ? `As of ${new Date(inflationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : `Target: ${bank.inflation.target}%`}</span>
                </div>
                <div class="bank-modal-item">
                    <span class="item-label">Unemployment</span>
                    <span class="item-value">${unemploymentValue}%</span>
                    ${unemploymentDate ? `<span class="item-sublabel">As of ${new Date(unemploymentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>` : ''}
                </div>
                <div class="bank-modal-item">
                    <span class="item-label">GDP Growth</span>
                    <span class="item-value">${gdpValue}%</span>
                    ${gdpDate ? `<span class="item-sublabel">As of ${new Date(gdpDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>` : ''}
                </div>
            </div>
        </div>
        
        <div class="bank-modal-section">
            <h3>💬 Latest Commentary</h3>
            <div class="bank-modal-comment">
                <p>"${bank.recentComment}"</p>
                <span class="comment-author">— ${bank.governor}, Governor</span>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeBankModal() {
    const modal = document.getElementById('bank-modal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bank-modal');
    if (event.target === modal) {
        closeBankModal();
    }
}

// Close button handler
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.bank-modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeBankModal;
    }
});

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
    
    // ✅ Load Economic Indicators (for central bank modals)
    fetchEconomicIndicators();
    
    // ✅ Load Central Bank Rates
    displayCentralBankRates();
    
    // ✅ Load SA Markets
    loadSAMarkets();
    
    // ✅ Auto-refresh movers and news every 10 seconds
    setInterval(async () => {
        const movers = await fetchTopMovers();
        if (movers) populateMoverList(movers);
        
        const news = await fetchNews();
        if (news) populateNewsList(news);
    }, 10000);
});