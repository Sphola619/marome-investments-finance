// API Configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const CONFIG = {
  API_BASE_URL: isLocalhost
    ? `http://${window.location.hostname}:5000/api`                 // Development (local)
    : 'https://finance-backend-5xk5.onrender.com/api'               // Production (replace with your actual Render URL)
};

console.log('🌍 Environment:', isLocalhost ? 'Development' : 'Production');
console.log('📡 API URL:', CONFIG.API_BASE_URL);