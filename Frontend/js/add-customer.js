/**
 * Add Customer Page Logic
 * Handles adding new customers
 */

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
    
    const form = document.getElementById('addCustomerForm');
    if (form) {
        form.addEventListener('submit', handleAddCustomer);
    }
});

/**
 * Handle add customer form submission
 */
async function handleAddCustomer(event) {
    event.preventDefault();
    
    const name = document.getElementById('customerName').value.trim();
    const paymentPlan = document.getElementById('paymentPlan').value;
    const notes = document.getElementById('customerNotes')?.value.trim() || '';
    
    const messageDiv = document.getElementById('message');
    messageDiv.className = '';
    messageDiv.innerHTML = '';
    messageDiv.style.display = 'none';
    
    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalHTML = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';
    submitButton.disabled = true;
    
    try {
        const response = await CustomerAPI.add({
            name,
            paymentPlan,
            notes
        });
        
        if (response.success) {
            // Show success message
            messageDiv.className = 'p-4 bg-green-50 border border-green-200 rounded-lg';
            messageDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-check-circle text-green-600 mr-2"></i>
                    <p class="text-green-800 font-medium">Customer "${name}" added successfully!</p>
                </div>
            `;
            messageDiv.style.display = 'block';
            
            // Reset form
            event.target.reset();
            
            // Scroll to message
            messageDiv.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error adding customer:', error);
        messageDiv.className = 'p-4 bg-red-50 border border-red-200 rounded-lg';
        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-600 mr-2"></i>
                <p class="text-red-800 font-medium">Error: ${error.message}</p>
            </div>
        `;
        messageDiv.style.display = 'block';
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    } finally {
        submitButton.innerHTML = originalHTML;
        submitButton.disabled = false;
    }
}
