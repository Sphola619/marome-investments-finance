// Mock data - will be replaced with real API calls
const mockSectorData = [
  { 
      name: "Technology", 
      performance: "+2.8%", 
      description: "Average performance of AAPL, MSFT, NVDA", 
      trend: "positive" 
  },
  { 
      name: "Healthcare", 
      performance: "+1.5%", 
      description: "Average performance of JNJ, UNH, PFE", 
      trend: "positive" 
  },
  { 
      name: "Financials", 
      performance: "+0.9%", 
      description: "Average performance of JPM, BAC, WFC", 
      trend: "positive" 
  },
  { 
      name: "Energy", 
      performance: "-1.2%", 
      description: "Average performance of XOM, CVX, COP", 
      trend: "negative" 
  },
  { 
      name: "Consumer Cyclical", 
      performance: "+1.8%", 
      description: "Average performance of AMZN, TSLA, HD", 
      trend: "positive" 
  },
  { 
      name: "Consumer Defensive", 
      performance: "+0.7%", 
      description: "Average performance of WMT, PG, KO", 
      trend: "positive" 
  }
];

const mockNewsData = [
  {
      title: "Federal Reserve Holds Interest Rates Steady",
      content: "The Federal Reserve announced it will maintain current interest rates, citing stable economic growth and controlled inflation.",
      source: "Reuters",
      time: "2 hours ago"
  },
  {
      title: "Tech Giants Report Strong Quarterly Earnings",
      content: "Major technology companies exceed earnings expectations, driven by AI adoption and cloud services growth.",
      source: "Bloomberg", 
      time: "4 hours ago"
  },
  {
      title: "Global Supply Chain Improvements Boost Manufacturing",
      content: "Enhanced logistics and reduced bottlenecks are positively impacting manufacturing sectors worldwide.",
      source: "Financial Times",
      time: "6 hours ago"
  }
];

function populateMarketList() {
  const marketList = document.getElementById('marketList');
  if (!marketList) return;
  
  marketList.innerHTML = '';
  
  // Sort by performance (highest first)
  const sortedData = [...mockSectorData].sort((a, b) => {
      const aValue = parseFloat(a.performance);
      const bValue = parseFloat(b.performance);
      return bValue - aValue;
  });
  
  sortedData.forEach(sector => {
      const marketItem = document.createElement('div');
      marketItem.className = 'market-item';
      marketItem.innerHTML = `
          <div class="market-info">
              <h3>${sector.name}</h3>
              <p>${sector.description}</p>
          </div>
          <div class="performance ${sector.trend}">${sector.performance}</div>
      `;
      marketList.appendChild(marketItem);
  });
}

function populateNewsList() {
  const newsList = document.getElementById('newsList');
  if (!newsList) return;
  
  newsList.innerHTML = '';
  
  mockNewsData.forEach(news => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.innerHTML = `
          <h4>${news.title}</h4>
          <p>${news.content}</p>
          <div class="news-meta">${news.time} • ${news.source}</div>
      `;
      newsList.appendChild(newsItem);
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  populateMarketList();
  populateNewsList();
  
  // Simulate loading delay
  setTimeout(() => {
      console.log("Dashboard loaded - ready to connect to real API!");
  }, 1000);
});