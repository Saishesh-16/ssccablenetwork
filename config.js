/**
 * Application Configuration
 * Update this file for production deployment
 */

window.APP_CONFIG = {
  // API Base URL - Update this for production
  // For Netlify: Uses Netlify Function proxy to bypass CORS
  API_URL: (() => {
    // Development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    
    // Production - Use Netlify Function proxy
    return '/.netlify/functions/proxy';
  })(),
  
  // Actual backend URL (used in the Netlify function)
  BACKEND_URL: 'https://ssccablenetworkbackend.onrender.com/api',
  
  // App Name
  APP_NAME: 'SSC Bethigal Cable Network',
  
  // Version
  VERSION: '1.0.0',
  
  // Environment
  ENV: window.location.hostname === 'localhost' ? 'development' : 'production',
  
  // Frontend URL (used for CORS configuration on backend)
  FRONTEND_URL: window.location.origin
};

// Log configuration (only in development)
if (window.APP_CONFIG.ENV === 'development') {
  console.log('📱 App Configuration:', window.APP_CONFIG);
}

