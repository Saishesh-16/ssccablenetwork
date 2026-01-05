/**
 * Authentication Utility
 * Handles authentication checks and redirects
 */

/**
 * Check if user is authenticated
 */
function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        if (window.location.pathname !== '/Frontend/login.html' && 
            !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
    
    return isAuthenticated;
}

/**
 * Logout function
 */
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Check authentication on page load (except login page)
if (!window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuth();
    });
}

