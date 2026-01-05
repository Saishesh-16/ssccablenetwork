/**
 * API Utility Functions
 * Handles all API calls to the backend
 */

// Get API URL from configuration
// Make sure config.js is loaded before this file
let API_BASE_URL = 'https://ssccablenetworkbackend.onrender.com/api'; // Default production URL

// Try to get from APP_CONFIG if available
if (window.APP_CONFIG && window.APP_CONFIG.API_URL) {
    API_BASE_URL = window.APP_CONFIG.API_URL;
} else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development environment
    API_BASE_URL = 'http://localhost:3000/api';
}

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
    try {
        let url = `${API_BASE_URL}${endpoint}`;
        
        // For Netlify Function proxy, add path as query parameter
        if (API_BASE_URL.includes('/.netlify/functions/proxy')) {
            url = `${API_BASE_URL}?path=${encodeURIComponent(endpoint)}`;
        }
        
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            mode: 'cors',
            credentials: 'include',
            ...options
        });

        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Customer API functions
 */
const CustomerAPI = {
    // Get all customers
    getAll: async () => {
        return await apiRequest('/customers');
    },

    // Search customers by name with filters
    search: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.name) params.append('name', filters.name);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.paymentPlan && filters.paymentPlan !== 'all') params.append('paymentPlan', filters.paymentPlan);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        return await apiRequest(`/customers/search?${params.toString()}`);
    },

    // Get customer by ID
    getById: async (id) => {
        return await apiRequest(`/customers/${id}`);
    },

    // Add new customer
    add: async (customerData) => {
        return await apiRequest('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    },

    // Update customer payment
    updatePayment: async (id, paymentData) => {
        return await apiRequest(`/customers/${id}/payment`, {
            method: 'PUT',
            body: JSON.stringify(paymentData)
        });
    },

    // Update customer details
    update: async (id, customerData) => {
        return await apiRequest(`/customers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    },

    // Delete customer
    delete: async (id) => {
        return await apiRequest(`/customers/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Reset all payment data (for fresh deployment)
    resetAllPaymentData: async (clearHistory = false) => {
        return await apiRequest(`/customers/reset-payment-data?clearHistory=${clearHistory}`, {
            method: 'POST'
        });
    }
};

/**
 * Dashboard API functions
 */
const DashboardAPI = {
    // Get dashboard statistics
    getStats: async () => {
        return await apiRequest('/dashboard');
    }
};

/**
 * Payment API functions
 */
const PaymentAPI = {
    // Get payment history for a customer
    getHistory: async (customerId, limit = 50) => {
        return await apiRequest(`/payments/customer/${customerId}?limit=${limit}`);
    },
    
    // Get all payments
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.limit) params.append('limit', filters.limit);
        return await apiRequest(`/payments?${params.toString()}`);
    },
    
    // Clear payment history for a customer
    clearHistory: async (customerId) => {
        return await apiRequest(`/payments/customer/${customerId}`, {
            method: 'DELETE'
        });
    },
    
    // Mark a specific payment as paid
    markAsPaid: async (paymentId) => {
        return await apiRequest(`/payments/${paymentId}/mark-paid`, {
            method: 'PUT'
        });
    }
};

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Calculate days overdue
 */
function calculateDaysOverdue(nextDueDate) {
    if (!nextDueDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = today - dueDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

/**
 * Format overdue duration
 */
function formatOverdueDuration(days) {
    if (days === 0) return '';
    if (days < 30) {
        return `${days} day${days > 1 ? 's' : ''} overdue`;
    } else {
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        if (remainingDays === 0) {
            return `${months} month${months > 1 ? 's' : ''} overdue`;
        } else {
            return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''} overdue`;
        }
    }
}

/**
 * Format date for input (YYYY-MM-DD)
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Get status class name
 */
function getStatusClass(status) {
    switch (status) {
        case 'Paid':
            return 'status-paid';
        case 'Due but Active':
            return 'status-due';
        case 'Overdue':
            return 'status-overdue';
        default:
            return 'status-due';
    }
}

/**
 * Get card class name based on status
 */
function getCardClass(status) {
    switch (status) {
        case 'Paid':
            return 'paid';
        case 'Due but Active':
            return 'due';
        case 'Overdue':
            return 'overdue';
        default:
            return 'due';
    }
}

