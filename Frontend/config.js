/**
 * Application Configuration
 * Update this file for production deployment
 */

window.APP_CONFIG = {
  // API Base URL - Update this for production
  API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `${window.location.protocol}//${window.location.hostname}:3000/api`,
  
  // App Name
  APP_NAME: 'SSC Bethigal Cable Network',
  
  // Version
  VERSION: '1.0.0',
  
  // Environment
  ENV: window.location.hostname === 'localhost' ? 'development' : 'production'
};

// Log configuration (only in development)
if (window.APP_CONFIG.ENV === 'development') {
  console.log('📱 App Configuration:', window.APP_CONFIG);
}

