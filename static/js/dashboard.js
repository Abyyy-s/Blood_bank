// use relative origin so cookies always accompany requests (localhost vs 127.0.0.1 issues)
const API_URL = '';

// Fetch and display dashboard data
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard`); // relative path
        const data = await response.json();

        // Update stats
        document.getElementById('totalDonors').textContent = data.total_donors || 0;
        document.getElementById('totalDonations').textContent = data.total_donations || 0;
        document.getElementById('pendingRequests').textContent = data.pending_requests || 0;

        // Display blood stock
        const stock = data.stock_by_group || [];
        displayBloodStock(stock);
        displayInventoryWatch(stock);

        // Load recent requests
        const requests = await loadRecentRequests();
        displayRequestActivity(requests || []);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data', 'error');
    }
}

// Display blood stock by group
function displayBloodStock(stockData) {
    const stockGrid = document.getElementById('stockGrid');
    
    // Blood groups in order
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    stockGrid.innerHTML = '';
    
    bloodGroups.forEach(group => {
        const stock = stockData.find(s => s.blood_group === group);
        const units = stock ? stock.total_units : 0;
        
        const stockCard = document.createElement('article');
        const stockState = units < 10 ? 'low' : units < 30 ? 'normal' : 'healthy';
        const stockLabel = units < 10 ? 'Low stock' : units < 30 ? 'Normal stock' : 'Good stock';
        const stockIcon = units < 10 ? 'fa-triangle-exclamation' : 'fa-check';
        stockCard.className = `stock-card stock-card-${stockState}`;
        
        stockCard.innerHTML = `
            <div class="stock-card-topline"><span class="stock-group">${group}</span><span class="stock-status"><i class="fas ${stockIcon}" aria-hidden="true"></i> ${stockLabel}</span></div>
            <div class="stock-units"><strong>${units}</strong><span>units available</span></div>
        `;
        
        stockGrid.appendChild(stockCard);
    });
}

function displayInventoryWatch(stockData) {
    const container = document.getElementById('inventoryWatch');
    if (!container) return;
    const watchGroups = stockData.filter(item => Number(item.total_units || 0) < 10)
        .sort((a, b) => Number(a.total_units || 0) - Number(b.total_units || 0));
    if (!watchGroups.length) {
        container.innerHTML = '<div class="watch-empty"><i class="fas fa-circle-check" aria-hidden="true"></i><div><strong>Inventory is stable</strong><span>No blood group is currently below the low-stock threshold.</span></div></div>';
        return;
    }
    container.innerHTML = watchGroups.slice(0, 4).map(item => `
        <div class="watch-item"><span class="watch-group">${item.blood_group}</span><div><strong>${item.total_units} units left</strong><span>Below the 10-unit attention threshold</span></div><i class="fas fa-triangle-exclamation" aria-hidden="true"></i></div>`).join('');
}

function displayRequestActivity(requests) {
    const container = document.getElementById('requestActivity');
    if (!container) return;
    const active = requests.filter(req => ['Pending', 'Approved'].includes(req.status)).slice(0, 4);
    if (!active.length) {
        container.innerHTML = '<div class="watch-empty"><i class="fas fa-inbox" aria-hidden="true"></i><div><strong>The request queue is clear</strong><span>There are no pending or approved requests to action.</span></div></div>';
        return;
    }
    container.innerHTML = active.map(req => `
        <div class="activity-item"><span class="blood-type blood-type-small">${req.blood_group}</span><div><strong>${req.hospital_name}</strong><span>${req.quantity_units} unit${req.quantity_units === 1 ? '' : 's'} · ${req.component_type}</span></div><span class="activity-status status-${String(req.urgency_level || '').toLowerCase()}">${req.urgency_level}</span></div>`).join('');
}

// Load recent requests
async function loadRecentRequests() {
    try {
        const response = await fetch(`${API_URL}/requests`);
        const requests = await response.json();
        
        const tableBody = document.getElementById('requestsTableBody');
        tableBody.innerHTML = '';
        
        if (requests.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: var(--text-muted);">
                        No requests found
                    </td>
                </tr>
            `;
            return requests;
        }
        
        // Show only first 5 requests
        requests.slice(0, 5).forEach(req => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${req.request_id}</td>
                <td>${req.hospital_name}</td>
                <td>
                    <span class="blood-type blood-type-small">${req.blood_group}</span>
                </td>
                <td>${req.component_type}</td>
                <td>${req.quantity_units} units</td>
                <td>${getUrgencyBadge(req.urgency_level)}</td>
                <td>${getStatusBadge(req.status)}</td>
                <td>${formatDate(req.request_date)}</td>
            `;
            tableBody.appendChild(row);
        });
        return requests;
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('requestsTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted);">
                    Error loading requests
                </td>
            </tr>
        `;
        return [];
    }
}

// Get urgency badge
function getUrgencyBadge(urgency) {
    const urgencyMap = {
        'Critical': '<span class="badge badge-danger">Critical</span>',
        'High': '<span class="badge badge-warning">High</span>',
        'Medium': '<span class="badge badge-info">Medium</span>',
        'Low': '<span class="badge badge-primary">Low</span>'
    };
    return urgencyMap[urgency] || '<span class="badge badge-primary">Unknown</span>';
}

// Get status badge
function getStatusBadge(status) {
    const statusMap = {
        'Pending': '<span class="badge badge-warning">Pending</span>',
        'Approved': '<span class="badge badge-success">Approved</span>',
        'Fulfilled': '<span class="badge badge-success">Fulfilled</span>',
        'Rejected': '<span class="badge badge-danger">Rejected</span>',
        'Cancelled': '<span class="badge badge-danger">Cancelled</span>'
    };
    return statusMap[status] || '<span class="badge badge-primary">' + status + '</span>';
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Refresh data every 30 seconds
    setInterval(loadDashboard, 30000);
});
