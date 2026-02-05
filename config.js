// API Configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const apiBaseUrl = isLocalhost
  ? `http://${window.location.hostname}:5000/api`                 // Development (local)
  : 'https://finance-backend-5xk5.onrender.com/api';              // Production (replace with your actual Render URL)

const apiUrl = new URL(apiBaseUrl);
const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
const wsBaseUrl = `${wsProtocol}//${apiUrl.host}`;

const CONFIG = {
  API_BASE_URL: apiBaseUrl,
  WS_BASE_URL: wsBaseUrl
};

console.log('🌍 Environment:', isLocalhost ? 'Development' : 'Production');
console.log('📡 API URL:', CONFIG.API_BASE_URL);
console.log('🔌 WS URL:', CONFIG.WS_BASE_URL);