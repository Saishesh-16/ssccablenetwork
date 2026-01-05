/**
 * Dashboard Page Logic
 * Loads and displays dashboard statistics
 */

/**
 * Open subscription website in new tab
 */
function openSubscriptionWebsite() {
    // Open subscription website in new tab
    window.open('https://sms.sscbpl.com/', '_blank', 'noopener,noreferrer');
}

// Load dashboard data when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Set user initial and display username
    const username = localStorage.getItem('username') || 'Admin';
    const userInitial = document.getElementById('userInitial');
    if (userInitial) {
        userInitial.textContent = username.charAt(0).toUpperCase();
    }
    
    // Display username in header if element exists
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
    
    await loadDashboard();
});

/**
 * Load dashboard statistics
 */
async function loadDashboard() {
    try {
        const response = await DashboardAPI.getStats();
        
        if (response.success) {
            const stats = response.data;
            
            // Update statistics
            document.getElementById('totalCustomers').textContent = stats.totalCustomers;
            document.getElementById('paidCustomers').textContent = stats.paidCustomers;
            document.getElementById('dueCustomers').textContent = stats.dueCustomers;
            document.getElementById('overdueCustomers').textContent = stats.overdueCustomers;
            
            // Display upcoming due list
            displayUpcomingDue(stats.upcomingDue);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('upcomingDueList').innerHTML = 
            `<div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                <p class="text-red-600 font-medium">Error loading dashboard</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>`;
    }
}

/**
 * Display upcoming due customers
 */
function displayUpcomingDue(customers) {
    const container = document.getElementById('upcomingDueList');
    
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-check-circle text-green-500 text-4xl mb-3"></i>
                <p class="text-gray-600 font-medium">No upcoming due payments</p>
                <p class="text-gray-500 text-sm mt-1">All customers are up to date for the next 7 days</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = customers.map(customer => {
        const statusColors = {
            'Paid': 'bg-green-100 text-green-800 border-green-200',
            'Due but Active': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Overdue': 'bg-red-100 text-red-800 border-red-200'
        };
        const statusColor = statusColors[customer.status] || 'bg-gray-100 text-gray-800 border-gray-200';
        
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-900 mb-1">${customer.name}</h4>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}">
                        ${customer.status}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Next Due Date</p>
                        <p class="text-sm font-medium text-gray-900">
                            <i class="fas fa-calendar text-blue-500 mr-2"></i>
                            ${formatDate(customer.nextDueDate)}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Payment Plan</p>
                        <p class="text-sm font-medium text-gray-900">
                            <i class="fas fa-clock text-blue-500 mr-2"></i>
                            ${customer.paymentPlan}
                        </p>
                    </div>
                </div>
                <button 
                    onclick="viewCustomer('${customer.id}')" 
                    class="w-full px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation"
                >
                    <i class="fas fa-eye mr-2"></i>View Details
                </button>
            </div>
        `;
    }).join('');
}

/**
 * View customer details (redirects to search page)
 */
function viewCustomer(id) {
    // Store customer ID in sessionStorage and redirect
    sessionStorage.setItem('viewCustomerId', id);
    window.location.href = 'search.html';
}

/**
 * View customers by status
 */
async function viewCustomersByStatus(status) {
    try {
        // Show filtered section
        const filteredSection = document.getElementById('filteredCustomersSection');
        const filteredTitle = document.getElementById('filteredStatusText');
        const filteredList = document.getElementById('filteredCustomersList');
        
        filteredSection.classList.remove('hidden');
        
        // Set title based on status
        let title = 'All Customers';
        if (status === 'Paid') {
            title = 'Paid Customers';
        } else if (status === 'Due but Active') {
            title = 'Due Customers';
        } else if (status === 'Overdue') {
            title = 'Overdue Customers';
        }
        filteredTitle.textContent = title;
        
        // Show loading
        filteredList.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
                <p class="text-gray-500">Loading customers...</p>
            </div>
        `;
        
        // Scroll to filtered section
        filteredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Fetch all customers
        const response = await CustomerAPI.getAll();
        
        if (response.success) {
            let customers = response.data;
            
            // Filter by status
            if (status !== 'all') {
                customers = customers.filter(customer => customer.status === status);
            }
            
            // Display customers
            if (customers.length === 0) {
                filteredList.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-inbox text-gray-400 text-4xl mb-3"></i>
                        <p class="text-gray-600 font-medium">No customers found</p>
                        <p class="text-gray-500 text-sm mt-1">No customers match this status</p>
                    </div>
                `;
            } else {
                displayFilteredCustomers(customers);
            }
        }
    } catch (error) {
        console.error('Error loading filtered customers:', error);
        document.getElementById('filteredCustomersList').innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                <p class="text-red-600 font-medium">Error loading customers</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Display filtered customers
 */
function displayFilteredCustomers(customers) {
    const container = document.getElementById('filteredCustomersList');
    
    container.innerHTML = customers.map(customer => {
        const statusColors = {
            'Paid': 'bg-green-100 text-green-800 border-green-200',
            'Due but Active': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Overdue': 'bg-red-100 text-red-800 border-red-200'
        };
        const statusColor = statusColors[customer.status] || 'bg-gray-100 text-gray-800 border-gray-200';
        
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h4 class="text-lg font-semibold text-gray-900 mb-1">${customer.name}</h4>
                        ${customer.daysOverdue > 0 ? `
                            <p class="text-xs text-red-600 mt-1">
                                <i class="fas fa-exclamation-circle mr-1"></i>
                                ${formatOverdueDuration(customer.daysOverdue)}
                            </p>
                        ` : ''}
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}">
                        ${customer.status}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Payment Plan</p>
                        <p class="text-sm font-medium text-gray-900">
                            <i class="fas fa-calendar-alt text-blue-500 mr-2"></i>
                            ${customer.paymentPlan}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Last Paid Date</p>
                        <p class="text-sm font-medium text-gray-900">
                            <i class="fas fa-check-circle text-green-500 mr-2"></i>
                            ${formatDate(customer.lastPaidDate)}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Next Due Date</p>
                        <p class="text-sm font-medium text-gray-900">
                            <i class="fas fa-calendar text-blue-500 mr-2"></i>
                            ${formatDate(customer.nextDueDate)}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2">
                    <button 
                        onclick="markPaymentFromDashboard('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-check mr-2"></i>Mark Paid
                    </button>
                    <button 
                        onclick="markDueActiveFromDashboard('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 active:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-clock mr-2"></i>Mark Due
                    </button>
                    <button 
                        onclick="viewCustomer('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-eye mr-2"></i>View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Close filtered view
 */
function closeFilteredView() {
    document.getElementById('filteredCustomersSection').classList.add('hidden');
}

/**
 * Mark payment from dashboard
 */
async function markPaymentFromDashboard(customerId) {
    const today = new Date().toISOString().split('T')[0];
    
    if (confirm('Mark this customer as paid today?')) {
        try {
            const customerResponse = await CustomerAPI.getById(customerId);
            if (!customerResponse.success) {
                throw new Error('Failed to load customer details');
            }
            
            const customer = customerResponse.data;
            const paymentData = {
                paymentDate: today,
                status: 'Paid',
                paymentPlan: customer.paymentPlan
            };
            
            const response = await CustomerAPI.updatePayment(customerId, paymentData);
            
            if (response.success) {
                alert('Payment marked successfully!');
                // Reload dashboard
                await loadDashboard();
                // Reload filtered view if open
                const filteredSection = document.getElementById('filteredCustomersSection');
                if (!filteredSection.classList.contains('hidden')) {
                    const filteredTitle = document.getElementById('filteredStatusText').textContent;
                    if (filteredTitle.includes('Paid')) {
                        await viewCustomersByStatus('Paid');
                    } else if (filteredTitle.includes('Due')) {
                        await viewCustomersByStatus('Due but Active');
                    } else if (filteredTitle.includes('Overdue')) {
                        await viewCustomersByStatus('Overdue');
                    } else {
                        await viewCustomersByStatus('all');
                    }
                }
            }
        } catch (error) {
            console.error('Error marking payment:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

/**
 * Mark due active from dashboard
 */
async function markDueActiveFromDashboard(customerId) {
    if (confirm('Mark this customer as Due but Active?')) {
        try {
            const paymentData = {
                status: 'Due but Active'
            };
            
            const response = await CustomerAPI.updatePayment(customerId, paymentData);
            
            if (response.success) {
                alert('Status updated successfully!');
                // Reload dashboard
                await loadDashboard();
                // Reload filtered view if open
                const filteredSection = document.getElementById('filteredCustomersSection');
                if (!filteredSection.classList.contains('hidden')) {
                    const filteredTitle = document.getElementById('filteredStatusText').textContent;
                    if (filteredTitle.includes('Paid')) {
                        await viewCustomersByStatus('Paid');
                    } else if (filteredTitle.includes('Due')) {
                        await viewCustomersByStatus('Due but Active');
                    } else if (filteredTitle.includes('Overdue')) {
                        await viewCustomersByStatus('Overdue');
                    } else {
                        await viewCustomersByStatus('all');
                    }
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Error: ${error.message}`);
        }
    }
}
