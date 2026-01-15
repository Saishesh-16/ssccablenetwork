/**
 * Reports Page Logic
 * Handles monthly report generation and PDF export
 */

const MONTHLY_PLAN_COST = 300; // Monthly plan cost in rupees
const HALF_YEARLY_PLAN_COST = 1700; // Half-Yearly plan cost in rupees
const YEARLY_PLAN_COST = 3400; // Yearly plan cost in rupees

// Set current month as default
document.addEventListener('DOMContentLoaded', () => {
    // Set user initial and display username
    const username = localStorage.getItem('username') || 'Admin';
    const userInitial = document.getElementById('userInitial');
    if (userInitial) {
        userInitial.textContent = username.charAt(0).toUpperCase();
    }
    
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
    
    // Set current month as default
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    document.getElementById('reportMonth').value = `${year}-${month}`;
});

/**
 * Generate monthly report
 */
async function generateReport() {
    const monthInput = document.getElementById('reportMonth').value;
    
    if (!monthInput) {
        alert('Please select a month');
        return;
    }
    
    const [year, month] = monthInput.split('-');
    const monthName = new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    // Show loading
    document.getElementById('reportLoading').classList.remove('hidden');
    document.getElementById('reportEmpty').classList.add('hidden');
    document.getElementById('reportResults').classList.add('hidden');
    document.getElementById('exportPDFBtn').classList.add('hidden');
    
    try {
        // Get all customers
        const response = await CustomerAPI.getAll();
        
        if (response.success) {
            const customers = response.data;
            const reportData = calculateMonthlyReport(customers, year, month);
            
            // Display report
            displayReport(reportData, monthName);
            
            // Store report data for PDF export
            window.currentReportData = reportData;
            window.currentMonthName = monthName;
            
            // Show export button
            document.getElementById('exportPDFBtn').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert(`Error generating report: ${error.message}`);
        document.getElementById('reportLoading').classList.add('hidden');
        document.getElementById('reportEmpty').classList.remove('hidden');
    }
}

/**
 * Calculate monthly report statistics
 */
function calculateMonthlyReport(customers, year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    let paidCustomers = [];
    let dueCustomers = [];
    let totalRevenue = 0;
    
    customers.forEach(customer => {
        const lastPaidDate = customer.lastPaidDate ? new Date(customer.lastPaidDate) : null;
        const nextDueDate = customer.nextDueDate ? new Date(customer.nextDueDate) : null;
        
        // Check if customer paid in this month
        // IMPORTANT: Only count customers whose current status is actually "Paid"
        // This keeps the "Paid Customers" count in Reports in sync with the Dashboard.
        if (customer.status === 'Paid' && lastPaidDate && lastPaidDate >= startDate && lastPaidDate <= endDate) {
            paidCustomers.push(customer);
            // Calculate revenue based on payment plan
            if (customer.paymentPlan === 'Monthly') {
                totalRevenue += MONTHLY_PLAN_COST;
            } else if (customer.paymentPlan === 'Half-Yearly') {
                totalRevenue += HALF_YEARLY_PLAN_COST;
            } else if (customer.paymentPlan === 'Yearly') {
                totalRevenue += YEARLY_PLAN_COST;
            }
        }
        
        // Check if customer was due in this month
        if (nextDueDate && nextDueDate >= startDate && nextDueDate <= endDate) {
            if (customer.status !== 'Paid' || !lastPaidDate || lastPaidDate < startDate) {
                dueCustomers.push(customer);
            }
        }
    });
    
    return {
        month: month,
        year: year,
        totalCustomers: customers.length,
        paidCustomers: paidCustomers,
        dueCustomers: dueCustomers,
        paidCount: paidCustomers.length,
        dueCount: dueCustomers.length,
        totalRevenue: totalRevenue
    };
}

/**
 * Display report results
 */
function displayReport(reportData, monthName) {
    // Hide loading, show results
    document.getElementById('reportLoading').classList.add('hidden');
    document.getElementById('reportResults').classList.remove('hidden');
    
    // Update summary cards
    document.getElementById('reportTotalCustomers').textContent = reportData.totalCustomers;
    document.getElementById('reportPaidCustomers').textContent = reportData.paidCount;
    document.getElementById('reportDueCustomers').textContent = reportData.dueCount;
    document.getElementById('reportTotalRevenue').textContent = `₹${reportData.totalRevenue.toLocaleString('en-IN')}`;
    
    // Display detailed report
    const detailsContainer = document.getElementById('reportDetails');
    
    let html = `
        <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Report for ${monthName}</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600 mb-1">Monthly Plan Cost</p>
                    <p class="text-2xl font-bold text-blue-600">₹${MONTHLY_PLAN_COST}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-600 mb-1">Expected Revenue (All Paid)</p>
                    <p class="text-2xl font-bold text-green-600">₹${(reportData.totalCustomers * MONTHLY_PLAN_COST).toLocaleString('en-IN')}</p>
                </div>
            </div>
        </div>
    `;
    
    // Paid Customers Section
    html += `
        <div class="mb-6">
            <h5 class="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <i class="fas fa-check-circle text-green-600 mr-2"></i>
                Paid Customers (${reportData.paidCount})
            </h5>
            ${reportData.paidCustomers.length > 0 ? `
                <div class="space-y-2">
                    ${reportData.paidCustomers.map(customer => `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <p class="font-medium text-gray-900">${customer.name}</p>
                                <p class="text-xs text-gray-600">Paid on: ${formatDate(customer.lastPaidDate)}</p>
                            </div>
                            <span class="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                ${customer.paymentPlan}
                            </span>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-gray-500 text-sm">No customers paid in this month</p>'}
        </div>
    `;
    
    // Due Customers Section
    html += `
        <div>
            <h5 class="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <i class="fas fa-clock text-yellow-600 mr-2"></i>
                Due Customers (${reportData.dueCount})
            </h5>
            ${reportData.dueCustomers.length > 0 ? `
                <div class="space-y-2">
                    ${reportData.dueCustomers.map(customer => `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                                <p class="font-medium text-gray-900">${customer.name}</p>
                                <p class="text-xs text-gray-600">Due Date: ${formatDate(customer.nextDueDate)}</p>
                            </div>
                            <span class="px-2 py-1 bg-yellow-600 text-white text-xs font-semibold rounded">
                                ${customer.status}
                            </span>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-gray-500 text-sm">No customers due in this month</p>'}
        </div>
    `;
    
    detailsContainer.innerHTML = html;
    
    // Scroll to results
    document.getElementById('reportResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Export report to PDF
 */
function exportToPDF() {
    if (!window.currentReportData || !window.currentMonthName) {
        alert('Please generate a report first');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const reportData = window.currentReportData;
    const monthName = window.currentMonthName;
    
    // Set font
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.text('SSC BETHIGAL CABLE NETWORK', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Monthly Report', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(monthName, 105, 38, { align: 'center' });
    
    let yPos = 50;
    
    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Customers: ${reportData.totalCustomers}`, 14, yPos);
    yPos += 7;
    doc.text(`Paid Customers: ${reportData.paidCount}`, 14, yPos);
    yPos += 7;
    doc.text(`Due Customers: ${reportData.dueCount}`, 14, yPos);
    yPos += 7;
    doc.text(`Total Revenue: ₹${reportData.totalRevenue.toLocaleString('en-IN')}`, 14, yPos);
    yPos += 7;
    doc.text(`Monthly Plan Cost: ₹${MONTHLY_PLAN_COST}`, 14, yPos);
    yPos += 15;
    
    // Paid Customers Section
    if (reportData.paidCustomers.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Paid Customers (${reportData.paidCount})`, 14, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        reportData.paidCustomers.forEach((customer, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`${index + 1}. ${customer.name} - ${customer.paymentPlan} - Paid: ${formatDate(customer.lastPaidDate)}`, 14, yPos);
            yPos += 6;
        });
        yPos += 5;
    }
    
    // Due Customers Section
    if (reportData.dueCustomers.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`Due Customers (${reportData.dueCount})`, 14, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        reportData.dueCustomers.forEach((customer, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`${index + 1}. ${customer.name} - Due: ${formatDate(customer.nextDueDate)} - Status: ${customer.status}`, 14, yPos);
            yPos += 6;
        });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 105, 290, { align: 'center' });
    }
    
    // Save PDF
    const fileName = `Monthly_Report_${monthName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

