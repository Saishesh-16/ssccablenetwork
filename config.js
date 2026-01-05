/**
 * Application Configuration
 * Update this file for production deployment
 */

window.APP_CONFIG = {
  // API Base URL - Update this for production
  // For Netlify: Set VITE_API_URL in Netlify dashboard under Build & Deploy > Environment
  API_URL: (() => {
    // Check for Netlify environment variable first
    if (window.VITE_API_URL) {
      return window.VITE_API_URL;
    }
    
    // Check for environment variable (set in Netlify dashboard)
    if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
      return process.env.VITE_API_URL;
    }
    
    // Development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    
    // Production - Render backend URL
    return 'https://ssccablenetworkbackend.onrender.com/api';
  })(),
  
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

