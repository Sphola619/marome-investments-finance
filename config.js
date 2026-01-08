// API Configuration
const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'                                    // Development (local)
    : 'https://marome-investments-finance-backend.onrender.com/api'            // Production (replace with your actual Render URL)
};

console.log('🌍 Environment:', window.location.hostname === 'localhost' ?  'Development' : 'Production');
console.log('📡 API URL:', CONFIG.API_BASE_URL);