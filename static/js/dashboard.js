// use relative origin so cookies always accompany requests (localhost vs 127.0.0.1 issues)
const API_URL = '';

// Blood group colors
const bloodGroupColors = {
    'A+': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'A-': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'B+': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'B-': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'AB+': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'AB-': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'O+': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'O-': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
};

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
        displayBloodStock(data.stock_by_group || []);

        // Load recent requests
        await loadRecentRequests();
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
        
        const stockCard = document.createElement('div');
        stockCard.className = 'card';
        stockCard.style.background = bloodGroupColors[group] || 'var(--bg-card)';
        stockCard.style.color = 'white';
        stockCard.style.padding = '1.5rem';
        stockCard.style.textAlign = 'center';
        
        stockCard.innerHTML = `
            <div style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">${group}</div>
            <div style="font-size: 1.5rem; font-weight: 600;">${units} Units</div>
            <div style="opacity: 0.9; font-size: 0.9rem; margin-top: 0.5rem;">
                ${units < 10 ? '⚠️ Low Stock' : units < 30 ? '✓ Normal' : '✓ Good Stock'}
            </div>
        `;
        
        stockGrid.appendChild(stockCard);
    });
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
            return;
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
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('requestsTableBody').innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted);">
                    Error loading requests
                </td>
            </tr>
        `;
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
