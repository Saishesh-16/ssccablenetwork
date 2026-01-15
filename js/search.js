/**
 * Search Page Logic
 * Handles customer search functionality
 */

// Load all customers on page load
document.addEventListener('DOMContentLoaded', () => {
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
    
    const customerId = sessionStorage.getItem('viewCustomerId');
    if (customerId) {
        sessionStorage.removeItem('viewCustomerId');
        loadCustomerById(customerId);
    } else {
        // Load all customers by default
        loadAllCustomers();
    }
    
    // Search on Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCustomers();
            }
        });
        
        // Real-time search as user types (debounced)
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    searchCustomers();
                }, 500); // Wait 500ms after user stops typing
            } else if (query.length === 0) {
                // Show all customers when search is cleared
                loadAllCustomers();
            }
        });
    }
});

/**
 * Load all customers
 */
async function loadAllCustomers() {
    const resultsContainer = document.getElementById('searchResults');
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
            <p class="text-gray-500">Loading customers...</p>
        </div>
    `;
    
    try {
        const response = await CustomerAPI.getAll();
        
        if (response.success) {
            if (response.data.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-inbox text-gray-400 text-4xl mb-3"></i>
                        <p class="text-gray-600 font-medium">No customers found</p>
                        <p class="text-gray-500 text-sm mt-1">Add your first customer to get started</p>
                    </div>
                `;
            } else {
                displaySearchResults(response.data);
            }
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        resultsContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                <p class="text-red-600 font-medium">Error loading customers</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Search customers by name
 */
async function searchCustomers() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    const resultsContainer = document.getElementById('searchResults');
    
    // Get filter values
    const filters = {
        name: query || undefined,
        status: document.getElementById('filterStatus')?.value || 'all',
        paymentPlan: document.getElementById('filterPaymentPlan')?.value || 'all',
        startDate: document.getElementById('filterStartDate')?.value || undefined,
        endDate: document.getElementById('filterEndDate')?.value || undefined
    };
    
    // Remove 'all' values
    if (filters.status === 'all') delete filters.status;
    if (filters.paymentPlan === 'all') delete filters.paymentPlan;
    if (!filters.name) delete filters.name;
    
    // Show loading state
    resultsContainer.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
            <p class="text-gray-500">Searching...</p>
        </div>
    `;
    
    try {
        const response = await CustomerAPI.search(filters);
        
        if (response.success) {
            if (response.data.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fas fa-search text-gray-400 text-4xl mb-3"></i>
                        <p class="text-gray-600 font-medium">No customers found</p>
                        <p class="text-gray-500 text-sm mt-1">Try a different search term or adjust filters</p>
                    </div>
                `;
            } else {
                displaySearchResults(response.data);
            }
            updateActiveFilters();
        }
    } catch (error) {
        console.error('Error searching customers:', error);
        resultsContainer.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                <p class="text-red-600 font-medium">Error searching</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Display search results
 */
function displaySearchResults(customers) {
    const container = document.getElementById('searchResults');
    
    container.innerHTML = customers.map(customer => {
        const statusColors = {
            'Paid': 'bg-green-100 text-green-800 border-green-200',
            'Due but Active': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Overdue': 'bg-red-100 text-red-800 border-red-200'
        };
        const statusColor = statusColors[customer.status] || 'bg-gray-100 text-gray-800 border-gray-200';
        
        return `
            <div class="customer-card-pro p-5">
                <div class="flex items-start gap-3 mb-4">
                    <div class="flex-shrink-0 pt-1">
                        <input 
                            type="checkbox" 
                            class="customer-checkbox w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            data-customer-id="${customer._id}"
                            onchange="updateBulkActions()"
                        >
                    </div>
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
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
                    </div>
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
                ${customer.notes ? `
                    <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div class="flex items-start">
                            <i class="fas fa-sticky-note text-yellow-600 mr-2 mt-0.5"></i>
                            <p class="text-sm text-gray-700 flex-1">${customer.notes}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="flex flex-col sm:flex-row gap-2">
                    <button 
                        onclick="markPayment('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-check mr-2"></i>Mark Paid
                    </button>
                    <button 
                        onclick="markDueActive('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 active:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-clock mr-2"></i>Mark Due
                    </button>
                    <button 
                        onclick="viewPaymentHistory('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-history mr-2"></i>History
                    </button>
                    <button 
                        onclick="editNotes('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-sticky-note mr-2"></i>Notes
                    </button>
                    <button 
                        onclick="viewCustomerDetails('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-eye mr-2"></i>View Details
                    </button>
                    <button 
                        onclick="editCustomer('${customer._id}')" 
                        class="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors touch-manipulation"
                    >
                        <i class="fas fa-edit mr-2"></i>Edit
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Load customer by ID
 */
async function loadCustomerById(id) {
    try {
        const response = await CustomerAPI.getById(id);
        
        if (response.success) {
            displaySearchResults([response.data]);
            // Scroll to results
            document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error loading customer:', error);
    }
}

/**
 * Mark customer as paid
 */
async function markPayment(customerId) {
    const today = new Date().toISOString().split('T')[0];
    
    if (confirm('Mark this customer as paid today?')) {
        try {
            // First get customer to know their payment plan
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
                // Refresh search results
                const searchInput = document.getElementById('searchInput');
                if (searchInput.value.trim()) {
                    searchCustomers();
                } else {
                    // Reload all customers
                    loadAllCustomers();
                }
            }
        } catch (error) {
            console.error('Error marking payment:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

/**
 * Mark customer as due but active
 */
async function markDueActive(customerId) {
    if (confirm('Mark this customer as Due but Active?')) {
        try {
            const paymentData = {
                status: 'Due but Active'
            };
            
            const response = await CustomerAPI.updatePayment(customerId, paymentData);
            
            if (response.success) {
                alert('Status updated successfully!');
                // Refresh search results
                const searchInput = document.getElementById('searchInput');
                if (searchInput.value.trim()) {
                    searchCustomers();
                } else {
                    // Reload all customers
                    loadAllCustomers();
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

/**
 * Edit customer (opens modal)
 */
async function editCustomer(customerId) {
    try {
        const response = await CustomerAPI.getById(customerId);
        
        if (response.success) {
            const customer = response.data;
            openEditModal(customer);
        }
    } catch (error) {
        console.error('Error loading customer for edit:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Open edit customer modal
 */
function openEditModal(customer) {
    // Create modal HTML
    const modalHTML = `
        <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" id="editModal" onclick="if(event.target === this) closeEditModal()">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-900">Edit Customer</h3>
                    <button class="text-gray-400 hover:text-gray-600 text-2xl font-bold" onclick="closeEditModal()">&times;</button>
                </div>
                <form id="editCustomerForm" onsubmit="saveCustomerEdit(event, '${customer._id}')" class="space-y-4">
                    <div>
                        <label for="editName" class="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                        <input type="text" id="editName" value="${customer.name}" required 
                            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    </div>
                    <div>
                        <label for="editPlan" class="block text-sm font-medium text-gray-700 mb-2">Payment Plan</label>
                        <select id="editPlan" 
                            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm">
                            <option value="Monthly" ${customer.paymentPlan === 'Monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="Half-Yearly" ${customer.paymentPlan === 'Half-Yearly' ? 'selected' : ''}>Half-Yearly</option>
                            <option value="Yearly" ${customer.paymentPlan === 'Yearly' ? 'selected' : ''}>Yearly</option>
                        </select>
                    </div>
                    <div>
                        <label for="editPaymentDate" class="block text-sm font-medium text-gray-700 mb-2">Last Paid Date</label>
                        <input type="date" id="editPaymentDate" value="${formatDateForInput(customer.lastPaidDate)}" 
                            class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm">
                    </div>
                    <div class="pt-4">
                        <button type="submit" 
                            class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <i class="fas fa-save mr-2"></i>Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Close edit modal
 */
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Save customer edit
 */
async function saveCustomerEdit(event, customerId) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('editName').value;
        const paymentPlan = document.getElementById('editPlan').value;
        const paymentDate = document.getElementById('editPaymentDate').value;
        
        // Update customer details
        await CustomerAPI.update(customerId, {
            name,
            paymentPlan
        });
        
        // Update payment if date is provided
        if (paymentDate) {
            await CustomerAPI.updatePayment(customerId, {
                paymentDate,
                paymentPlan
            });
        }
        
        alert('Customer updated successfully!');
        closeEditModal();
        
        // Refresh search results
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value.trim()) {
            searchCustomers();
        } else {
            // Reload all customers
            loadAllCustomers();
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Clear search results and show all customers
 */
function clearResults() {
    loadAllCustomers();
}

/**
 * Toggle select all customers
 */
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const checkboxes = document.querySelectorAll('.customer-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActions();
}

/**
 * Update bulk actions bar based on selected customers
 */
function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.customer-checkbox:checked');
    const selectedCount = checkboxes.length;
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    
    // Update select all checkbox state
    const allCheckboxes = document.querySelectorAll('.customer-checkbox');
    if (allCheckboxes.length > 0) {
        selectAllCheckbox.checked = selectedCount === allCheckboxes.length;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < allCheckboxes.length;
    }
    
    if (selectedCount > 0) {
        document.getElementById('selectedCount').textContent = `${selectedCount} customer${selectedCount > 1 ? 's' : ''} selected`;
        bulkActionsBar.classList.remove('hidden');
    } else {
        bulkActionsBar.classList.add('hidden');
    }
}

/**
 * Clear all selections
 */
function clearSelection() {
    const checkboxes = document.querySelectorAll('.customer-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
    updateBulkActions();
}

/**
 * Bulk mark selected customers as paid
 */
async function bulkMarkPaid() {
    const checkboxes = document.querySelectorAll('.customer-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.customerId);
    
    if (selectedIds.length === 0) {
        alert('Please select at least one customer');
        return;
    }
    
    const count = selectedIds.length;
    if (!confirm(`Mark ${count} customer${count > 1 ? 's' : ''} as paid today?`)) {
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    let successCount = 0;
    let errorCount = 0;
    
    // Show loading
    const bulkBar = document.getElementById('bulkActionsBar');
    const originalContent = bulkBar.innerHTML;
    bulkBar.innerHTML = `
        <div class="flex items-center space-x-2 text-white">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Processing ${count} customer${count > 1 ? 's' : ''}...</span>
        </div>
    `;
    
    // Process each customer
    for (const customerId of selectedIds) {
        try {
            // Get customer to know their payment plan
            const customerResponse = await CustomerAPI.getById(customerId);
            if (!customerResponse.success) {
                errorCount++;
                continue;
            }
            
            const customer = customerResponse.data;
            const paymentData = {
                paymentDate: today,
                status: 'Paid',
                paymentPlan: customer.paymentPlan
            };
            
            const response = await CustomerAPI.updatePayment(customerId, paymentData);
            if (response.success) {
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            console.error(`Error updating customer ${customerId}:`, error);
            errorCount++;
        }
    }
    
    // Restore bulk bar
    bulkBar.innerHTML = originalContent;
    
    // Show result
    if (errorCount === 0) {
        alert(`✅ Successfully marked ${successCount} customer${successCount > 1 ? 's' : ''} as paid!`);
    } else {
        alert(`✅ ${successCount} customer${successCount > 1 ? 's' : ''} marked as paid.\n❌ ${errorCount} customer${errorCount > 1 ? 's' : ''} failed.`);
    }
    
    // Clear selection and refresh
    clearSelection();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        searchCustomers();
    } else {
        loadAllCustomers();
    }
}

/**
 * Bulk mark selected customers as due
 */
async function bulkMarkDue() {
    const checkboxes = document.querySelectorAll('.customer-checkbox:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.customerId);
    
    if (selectedIds.length === 0) {
        alert('Please select at least one customer');
        return;
    }
    
    const count = selectedIds.length;
    if (!confirm(`Mark ${count} customer${count > 1 ? 's' : ''} as Due but Active?`)) {
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Show loading
    const bulkBar = document.getElementById('bulkActionsBar');
    const originalContent = bulkBar.innerHTML;
    bulkBar.innerHTML = `
        <div class="flex items-center space-x-2 text-white">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Processing ${count} customer${count > 1 ? 's' : ''}...</span>
        </div>
    `;
    
    // Process each customer
    for (const customerId of selectedIds) {
        try {
            const paymentData = {
                status: 'Due but Active'
            };
            
            const response = await CustomerAPI.updatePayment(customerId, paymentData);
            if (response.success) {
                successCount++;
            } else {
                errorCount++;
            }
        } catch (error) {
            console.error(`Error updating customer ${customerId}:`, error);
            errorCount++;
        }
    }
    
    // Restore bulk bar
    bulkBar.innerHTML = originalContent;
    
    // Show result
    if (errorCount === 0) {
        alert(`✅ Successfully marked ${successCount} customer${successCount > 1 ? 's' : ''} as due!`);
    } else {
        alert(`✅ ${successCount} customer${successCount > 1 ? 's' : ''} updated.\n❌ ${errorCount} customer${errorCount > 1 ? 's' : ''} failed.`);
    }
    
    // Clear selection and refresh
    clearSelection();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        searchCustomers();
    } else {
        loadAllCustomers();
    }
}

/**
 * Toggle filters panel
 */
function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    const icon = document.getElementById('filterIcon');
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        panel.classList.add('hidden');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

/**
 * Apply filters
 */
function applyFilters() {
    searchCustomers();
}

/**
 * Update active filters display
 */
function updateActiveFilters() {
    const activeFilters = document.getElementById('activeFilters');
    const filters = [];
    
    const status = document.getElementById('filterStatus')?.value;
    if (status && status !== 'all') {
        filters.push({ label: `Status: ${status}`, type: 'status' });
    }
    
    const plan = document.getElementById('filterPaymentPlan')?.value;
    if (plan && plan !== 'all') {
        filters.push({ label: `Plan: ${plan}`, type: 'plan' });
    }
    
    const startDate = document.getElementById('filterStartDate')?.value;
    if (startDate) {
        filters.push({ label: `From: ${formatDate(startDate)}`, type: 'startDate' });
    }
    
    const endDate = document.getElementById('filterEndDate')?.value;
    if (endDate) {
        filters.push({ label: `To: ${formatDate(endDate)}`, type: 'endDate' });
    }
    
    if (filters.length === 0) {
        activeFilters.innerHTML = '';
        return;
    }
    
    activeFilters.innerHTML = filters.map(filter => `
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ${filter.label}
            <button 
                onclick="removeFilter('${filter.type}')" 
                class="ml-2 text-blue-600 hover:text-blue-800"
            >
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

/**
 * Remove a filter
 */
function removeFilter(filterType) {
    switch(filterType) {
        case 'status':
            document.getElementById('filterStatus').value = 'all';
            break;
        case 'plan':
            document.getElementById('filterPaymentPlan').value = 'all';
            break;
        case 'startDate':
            document.getElementById('filterStartDate').value = '';
            break;
        case 'endDate':
            document.getElementById('filterEndDate').value = '';
            break;
    }
    applyFilters();
}

/**
 * View payment history for a customer
 */
let currentCustomerId = null;

async function viewPaymentHistory(customerId) {
    currentCustomerId = customerId;
    const modal = document.getElementById('paymentHistoryModal');
    const content = document.getElementById('paymentHistoryContent');
    const clearBtn = document.getElementById('clearHistoryBtn');
    const clearLastPaidBtn = document.getElementById('clearLastPaidDateBtn');
    
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
            <p class="text-gray-500">Loading payment history...</p>
        </div>
    `;
    clearBtn.style.display = 'none';
    if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'none';
    
    try {
        const response = await PaymentAPI.getHistory(customerId);
        
        if (response.success) {
            if (response.data.length === 0) {
                content.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-history text-gray-400 text-3xl mb-3"></i>
                        <p class="text-gray-600 font-medium">No payment history</p>
                        <p class="text-gray-500 text-sm mt-1">Payment records will appear here</p>
                    </div>
                `;
                clearBtn.style.display = 'none';
                // For legacy records where history was cleared earlier, allow clearing last paid date
                if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'block';
            } else {
                content.innerHTML = response.data.map(payment => {
                    const amount = payment.amount || (payment.paymentPlan === 'Monthly' ? 300 : 
                                                   payment.paymentPlan === 'Half-Yearly' ? 1700 : 3400);
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex-1">
                                    <p class="font-semibold text-gray-900">₹${amount}</p>
                                    <p class="text-sm text-gray-600 mt-1">
                                        <i class="fas fa-calendar-alt mr-1"></i>
                                        ${formatDate(payment.paymentDate)}
                                    </p>
                                </div>
                                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                                    payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }">
                                    ${payment.status}
                                </span>
                            </div>
                            <div class="mt-2 text-sm text-gray-600">
                                <i class="fas fa-calendar-check mr-1"></i>
                                ${payment.paymentPlan}
                            </div>
                            ${payment.notes ? `
                                <div class="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                    <i class="fas fa-sticky-note mr-1"></i>
                                    ${payment.notes}
                                </div>
                            ` : ''}
                            ${payment.status === 'Due but Active' ? `
                                <div class="mt-3 pt-3 border-t border-gray-200">
                                    <button 
                                        onclick="markPaymentHistoryAsPaid('${payment._id}')" 
                                        class="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    >
                                        <i class="fas fa-check mr-2"></i>Mark as Paid
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
                clearBtn.style.display = 'block';
                if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'none';
            }
        } else {
            // If backend returns success:false but still 200, show message
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-circle text-yellow-500 text-3xl mb-3"></i>
                    <p class="text-yellow-700 font-medium">Unable to load payment history</p>
                    <p class="text-gray-500 text-sm mt-1">${response.message || 'Please try again'}</p>
                </div>
            `;
            clearBtn.style.display = 'none';
            if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading payment history:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
                <p class="text-red-600 font-medium">Error loading history</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>
        `;
        clearBtn.style.display = 'none';
        if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'none';
    }
}

/**
 * Close payment history modal
 */
function closePaymentHistoryModal() {
    document.getElementById('paymentHistoryModal').classList.add('hidden');
    currentCustomerId = null;
    const clearLastPaidBtn = document.getElementById('clearLastPaidDateBtn');
    if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'none';
}

/**
 * Clear payment history for current customer
 */
async function clearPaymentHistory() {
    if (!currentCustomerId) {
        alert('No customer selected');
        return;
    }
    
    if (!confirm('Are you sure you want to clear all payment history for this customer? This action cannot be undone.')) {
        return;
    }
    
    const content = document.getElementById('paymentHistoryContent');
    const clearBtn = document.getElementById('clearHistoryBtn');
    
    // Show loading state
    content.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
            <p class="text-gray-500">Clearing payment history...</p>
        </div>
    `;
    clearBtn.style.display = 'none';
    
    try {
        const response = await PaymentAPI.clearHistory(currentCustomerId);
        
        if (response.success) {
            // Also clear the lastPaidDate from customer record (some backends ignore null, so we verify)
            try {
                await clearCustomerLastPaidDate(currentCustomerId);
            } catch (updateError) {
                console.error('Error clearing lastPaidDate:', updateError);
                // Continue even if this fails
            }
            
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-check-circle text-green-500 text-3xl mb-3"></i>
                    <p class="text-gray-600 font-medium">Payment history cleared successfully</p>
                    <p class="text-gray-500 text-sm mt-1">${response.deletedCount} payment record(s) deleted</p>
                    <p class="text-gray-500 text-sm mt-1">Last paid date has been cleared</p>
                </div>
            `;
            
            // Refresh the customer list to reflect changes
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    searchCustomers();
                } else {
                    loadAllCustomers();
                }
            }, 1500);
        } else {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-circle text-yellow-500 text-3xl mb-3"></i>
                    <p class="text-yellow-700 font-medium">Could not clear payment history</p>
                    <p class="text-gray-500 text-sm mt-1">${response.message || 'Please try again'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error clearing payment history:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
                <p class="text-red-600 font-medium">Error clearing history</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Clear last paid date for current customer (legacy fix)
 */
async function clearLastPaidDate() {
    if (!currentCustomerId) {
        alert('No customer selected');
        return;
    }

    if (!confirm('Clear Last Paid Date for this customer? (Use this if payment history was cleared earlier.)')) {
        return;
    }

    const content = document.getElementById('paymentHistoryContent');
    const clearLastPaidBtn = document.getElementById('clearLastPaidDateBtn');

    // Show loading state
    content.innerHTML = `
        <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-gray-400 text-2xl mb-2"></i>
            <p class="text-gray-500">Clearing last paid date...</p>
        </div>
    `;
    if (clearLastPaidBtn) clearLastPaidBtn.style.display = 'none';

    try {
        const cleared = await clearCustomerLastPaidDate(currentCustomerId);

        if (cleared) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-check-circle text-green-500 text-3xl mb-3"></i>
                    <p class="text-gray-600 font-medium">Last paid date cleared</p>
                    <p class="text-gray-500 text-sm mt-1">This customer will no longer show a last paid date.</p>
                </div>
            `;

            // Refresh the customer list to reflect changes
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    searchCustomers();
                } else {
                    loadAllCustomers();
                }
            }, 800);
        } else {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-exclamation-circle text-yellow-500 text-3xl mb-3"></i>
                    <p class="text-yellow-700 font-medium">Backend did not clear last paid date</p>
                    <p class="text-gray-500 text-sm mt-1">This requires a backend change (API must allow unsetting lastPaidDate).</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error clearing last paid date:', error);
        content.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
                <p class="text-red-600 font-medium">Error clearing last paid date</p>
                <p class="text-gray-500 text-sm mt-1">${error.message}</p>
            </div>
        `;
    }
}

/**
 * Clear lastPaidDate for a customer and verify by reloading the record.
 * Some backends ignore null updates; this attempts null first, then empty string.
 */
async function clearCustomerLastPaidDate(customerId) {
    // Attempt 1: null
    const r1 = await CustomerAPI.update(customerId, {
        lastPaidDate: null,
        status: 'Due but Active'
    });
    if (!r1 || !r1.success) return false;

    let refreshed = await CustomerAPI.getById(customerId);
    if (refreshed && refreshed.success && !refreshed.data?.lastPaidDate) return true;

    // Attempt 2: empty string
    const r2 = await CustomerAPI.update(customerId, {
        lastPaidDate: '',
        status: 'Due but Active'
    });
    if (!r2 || !r2.success) return false;

    refreshed = await CustomerAPI.getById(customerId);
    return !!(refreshed && refreshed.success && !refreshed.data?.lastPaidDate);
}

/**
 * Mark a specific payment in history as paid
 */
async function markPaymentHistoryAsPaid(paymentId) {
    if (!confirm('Mark this payment as paid?')) {
        return;
    }
    
    try {
        const response = await PaymentAPI.markAsPaid(paymentId);
        
        if (response.success) {
            // Reload the payment history to show updated status
            if (currentCustomerId) {
                await viewPaymentHistory(currentCustomerId);
            }
            
            // Refresh the customer list to reflect changes
            setTimeout(() => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim()) {
                    searchCustomers();
                } else {
                    loadAllCustomers();
                }
            }, 500);
        }
    } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Edit notes for a customer
 */
async function editNotes(customerId) {
    currentCustomerId = customerId;
    const modal = document.getElementById('notesModal');
    const textarea = document.getElementById('notesTextarea');
    
    try {
        const response = await CustomerAPI.getById(customerId);
        if (response.success) {
            textarea.value = response.data.notes || '';
            modal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading customer:', error);
        alert('Error loading customer details');
    }
}

/**
 * Save notes
 */
async function saveNotes() {
    if (!currentCustomerId) return;
    
    const textarea = document.getElementById('notesTextarea');
    const notes = textarea.value.trim();
    
    try {
        const response = await CustomerAPI.update(currentCustomerId, { notes });
        
        if (response.success) {
            alert('Notes saved successfully!');
            closeNotesModal();
            // Refresh search results
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                searchCustomers();
            } else {
                loadAllCustomers();
            }
        }
    } catch (error) {
        console.error('Error saving notes:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Close notes modal
 */
function closeNotesModal() {
    document.getElementById('notesModal').classList.add('hidden');
    document.getElementById('notesTextarea').value = '';
    currentCustomerId = null;
}

/**
 * View customer details (opens modal)
 */
async function viewCustomerDetails(customerId) {
    try {
        const response = await CustomerAPI.getById(customerId);
        
        if (response.success) {
            const customer = response.data;
            openViewDetailsModal(customer);
        }
    } catch (error) {
        console.error('Error loading customer details:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Open view details modal
 */
function openViewDetailsModal(customer) {
    const modal = document.getElementById('viewDetailsModal');
    const content = document.getElementById('viewDetailsContent');
    
    const statusColors = {
        'Paid': 'bg-green-100 text-green-800 border-green-200',
        'Due but Active': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Overdue': 'bg-red-100 text-red-800 border-red-200'
    };
    const statusColor = statusColors[customer.status] || 'bg-gray-100 text-gray-800 border-gray-200';
    
    // Format date helper
    const formatDateDisplay = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Customer Name and Status -->
            <div class="border-b border-gray-200 pb-4">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">${customer.name || 'N/A'}</h2>
                <span class="inline-block px-4 py-1 rounded-full text-sm font-semibold border ${statusColor}">
                    ${customer.status || 'N/A'}
                </span>
            </div>
            
            <!-- Payment Information -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-money-bill-wave text-blue-600 mr-2"></i>
                    Payment Information
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">Payment Plan</p>
                        <p class="text-sm font-semibold text-gray-900">${customer.paymentPlan || 'N/A'}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">Last Paid Date</p>
                        <p class="text-sm font-semibold text-gray-900">${formatDateDisplay(customer.lastPaidDate)}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">Next Due Date</p>
                        <p class="text-sm font-semibold text-gray-900">${formatDateDisplay(customer.nextDueDate)}</p>
                    </div>
                    ${customer.daysOverdue > 0 ? `
                    <div class="bg-red-50 p-4 rounded-lg">
                        <p class="text-xs text-red-600 mb-1">Days Overdue</p>
                        <p class="text-sm font-semibold text-red-900">${customer.daysOverdue} days</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Customer Details -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-user text-blue-600 mr-2"></i>
                    Customer Details
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${customer.accountNumber ? `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">Account Number</p>
                        <p class="text-sm font-semibold text-gray-900">${customer.accountNumber}</p>
                    </div>
                    ` : ''}
                    ${customer.mobileNumber ? `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">Mobile Number</p>
                        <p class="text-sm font-semibold text-gray-900">
                            <a href="tel:${customer.mobileNumber}" class="text-blue-600 hover:underline">
                                ${customer.mobileNumber}
                            </a>
                        </p>
                    </div>
                    ` : ''}
                    ${customer.caf ? `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">CAF Number</p>
                        <p class="text-sm font-semibold text-gray-900">${customer.caf}</p>
                    </div>
                    ` : ''}
                    ${customer.vcNumber ? `
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <p class="text-xs text-gray-500 mb-1">VC Number</p>
                        <p class="text-sm font-semibold text-gray-900">${customer.vcNumber}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Address Information -->
            ${(customer.address || customer.city || customer.pinCode) ? `
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-map-marker-alt text-blue-600 mr-2"></i>
                    Address Information
                </h3>
                <div class="bg-gray-50 p-4 rounded-lg">
                    ${customer.address ? `<p class="text-sm text-gray-900 mb-1">${customer.address}</p>` : ''}
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${customer.city ? `<span class="text-xs text-gray-600">${customer.city}</span>` : ''}
                        ${customer.pinCode ? `<span class="text-xs text-gray-600">${customer.pinCode}</span>` : ''}
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Notes -->
            ${customer.notes ? `
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-sticky-note text-blue-600 mr-2"></i>
                    Notes
                </h3>
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">${customer.notes}</p>
                </div>
            </div>
            ` : ''}
            
            <!-- Serial Number -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-xs text-gray-500 mb-1">Serial Number</p>
                <p class="text-sm font-semibold text-gray-900">${customer.serialNumber || 'N/A'}</p>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

/**
 * Close view details modal
 */
function closeViewDetailsModal() {
    document.getElementById('viewDetailsModal').classList.add('hidden');
}
