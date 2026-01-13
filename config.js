/**
 * Application Configuration
 * Update this file for production deployment
 */

window.APP_CONFIG = {
  // ✅ API Base URL
  API_URL: (() => {
    // Development (localhost)
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:3000/api";
    }

    // ✅ Production - Direct Render backend
    return "https://ssccablenetworkbackend.onrender.com/api";
  })(),

  // Backend URL (same as API_URL now)
  BACKEND_URL: "https://ssccablenetworkbackend.onrender.com/api",

  APP_NAME: "SSC Bethigal Cable Network",
  VERSION: "1.0.0",

  ENV:
    window.location.hostname === "localhost"
      ? "development"
      : "production",

  FRONTEND_URL: window.location.origin
};

// Log configuration (only in development)
if (window.APP_CONFIG.ENV === "development") {
  console.log("📱 App Configuration:", window.APP_CONFIG);
}
