// API Configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocalhost
  ? `http://${window.location.hostname}:5000/api`                 // Development (local)
  : 'https://finance-backend-5xk5.onrender.com/api';              // Production (replace with your actual Render URL)

const apiUrl = new URL(API_BASE_URL);
const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_BASE_URL = `${wsProtocol}//${apiUrl.host}`;

const CONFIG = {
  API_BASE_URL,
  WS_BASE_URL
};

console.log('🌍 Environment:', isLocalhost ? 'Development' : 'Production');
console.log('📡 API URL:', CONFIG.API_BASE_URL);
console.log('🔌 WS URL:', CONFIG.WS_BASE_URL);