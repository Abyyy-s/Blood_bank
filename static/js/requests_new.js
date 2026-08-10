const API_URL = '';
let allRequests = [];
let currentUser = null;

// Get current user
async function getCurrentUser() {
    try {
        const resp = await fetch(`${API_URL}/api/me`);
        if (!resp.ok) throw new Error('Not authenticated');
        currentUser = await resp.json();
        console.log('Current user:', currentUser);
        return currentUser;
    } catch (e) {
        console.error('Failed to get user:', e);
        return null;
    }
}

// Load hospitals for dropdown
async function loadHospitals() {
    try {
        const response = await fetch(`${API_URL}/hospitals`);
        const hospitals = await response.json();
        const hospitalSelect = document.querySelector('select[name="hospital_id"]');
        if (!hospitalSelect) return;
        
        hospitals.forEach(hospital => {
            const option = document.createElement('option');
            option.value = hospital.hospital_id;
            option.textContent = `${hospital.hospital_name} - ${hospital.location}`;
            hospitalSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading hospitals:', error);
    }
}

// Load requests
async function loadRequests() {
    try {
        const status = document.getElementById('filterStatus')?.value || '';
        const bloodGroup = document.getElementById('filterBloodGroup')?.value || '';

        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (bloodGroup) params.append('blood_group', bloodGroup);

        const url = params.toString()
            ? `${API_URL}/requests?${params.toString()}`
            : `${API_URL}/requests`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load requests');

        allRequests = await response.json();
        displayRequests(allRequests);
    } catch (error) {
        console.error('Error loading requests:', error);
        showAlert('Error loading requests', 'error');
    }
}

// Display requests
function displayRequests(requests) {
    const tableBody = document.getElementById('requestsTableBody');
    if (!tableBody) {
        console.error('requestsTableBody not found!');
        return;
    }
    
    tableBody.innerHTML = '';

    if (!requests || requests.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center; color:var(--text-muted); padding:3rem;">
                    <div style="font-size:3rem; margin-bottom:1rem;">📋</div>
                    <div style="font-size:1.1rem;">
                        ${currentUser?.role === 'Hospital'
                            ? 'You have not made any requests yet. Click "New Request" to get started.'
                            : 'No requests found'}
                    </div>
                </td>
            </tr>`;
        return;
    }

    requests.forEach(req => {
        const row = document.createElement('tr');

        let actionBtn = '';
        if (currentUser?.role === 'Hospital') {
            if (req.status === 'Pending') {
                actionBtn = `
                    <button class="btn btn-outline" 
                        style="padding:0.4rem 0.8rem; font-size:0.82rem; color:#C0392B; border-color:#C0392B;"
                        onclick="cancelRequest(${req.request_id})">
                        Cancel
                    </button>`;
            } else {
                actionBtn = `<span style="color:var(--text-muted); font-size:0.85rem;">—</span>`;
            }
        } else {
            if (req.status === 'Pending') {
                actionBtn = `
                    <button class="btn btn-success"
                        style="padding:0.4rem 0.8rem; font-size:0.82rem;"
                        onclick="openUpdateModal(${req.request_id}, '${req.status}')">
                        Fulfill
                    </button>
                    <button class="btn btn-outline"
                        style="padding:0.4rem 0.8rem; font-size:0.82rem; margin-left:0.3rem; color:#C0392B; border-color:#C0392B;"
                        onclick="rejectRequest(${req.request_id})">
                        Reject
                    </button>`;
            } else {
                actionBtn = `
                    <button class="btn btn-outline"
                        style="padding:0.4rem 0.8rem; font-size:0.82rem;"
                        onclick="openUpdateModal(${req.request_id}, '${req.status}')">
                        Update
                    </button>`;
            }
        }

        const rowStyle = req.status === 'Rejected'
            ? 'background: #fff5f5;'
            : req.status === 'Fulfilled'
            ? 'background: #f0fff4;'
            : '';

        row.style.cssText = rowStyle;
        row.innerHTML = `
            <td>#${req.request_id}</td>
            <td style="font-weight:600;">${req.hospital_name}</td>
            <td>${req.location || 'N/A'}</td>
            <td><span class="blood-type blood-type-small">${req.blood_group}</span></td>
            <td>${getComponentBadge(req.component_type)}</td>
            <td style="font-weight:600;">${req.quantity_units} units</td>
            <td>${getUrgencyBadge(req.urgency_level)}</td>
            <td>${getStatusBadge(req.status)}</td>
            <td>${formatDate(req.request_date)}</td>
            <td style="display:flex; gap:0.3rem; flex-wrap:wrap;">${actionBtn}</td>`;

        tableBody.appendChild(row);
    });
}

// Open/close modals
function openCreateModal() {
    console.log('Opening create modal');
    const modal = document.getElementById('createModal');
    if (!modal) {
        console.error('createModal not found!');
        return;
    }
    modal.classList.add('active');
    document.getElementById('createForm').reset();

    const hospGroup = document.querySelector('select[name="hospital_id"]')?.closest('.form-group');
    if (currentUser?.role === 'Hospital') {
        if (hospGroup) hospGroup.style.display = 'none';
    } else {
        if (hospGroup) hospGroup.style.display = '';
    }
}

function closeCreateModal() {
    const modal = document.getElementById('createModal');
    if (modal) modal.classList.remove('active');
}

// Create request
async function createRequest(event) {
    console.log('Create request handler called');
    event.preventDefault();

    const form = document.getElementById('createForm');
    const formData = new FormData(form);

    const data = {
        blood_group: formData.get('blood_group'),
        component_type: formData.get('component_type'),
        quantity_units: parseInt(formData.get('quantity_units')),
        urgency_level: formData.get('urgency_level'),
    };

    if (currentUser?.role !== 'Hospital') {
        const hospId = formData.get('hospital_id');
        if (!hospId) {
            alert('Please select a hospital');
            return;
        }
        data.hospital_id = parseInt(hospId);
    }

    if (!data.blood_group || !data.component_type || !data.quantity_units || !data.urgency_level) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Request';

        const result = await response.json();

        if (response.ok) {
            closeCreateModal();
            await loadRequests();
            if (result.warning) {
                showAlert(result.warning, 'warning');
            } else {
                showAlert('Blood request submitted successfully!', 'success');
            }
        } else {
            showAlert(result.error || 'Error creating request', 'error');
        }
    } catch (error) {
        console.error('Error creating request:', error);
        showAlert('Network error. Please try again.', 'error');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Request';
    }
}

// Reject request
async function rejectRequest(requestId) {
    if (!confirm('Are you sure you want to reject this request?')) return;
    await updateStatus(requestId, 'Rejected');
}

// Cancel request
async function cancelRequest(requestId) {
    if (!confirm('Cancel this request?')) return;
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (response.ok) {
            showAlert('Request cancelled.', 'success');
            loadRequests();
        } else {
            showAlert(result.error || 'Could not cancel request', 'error');
        }
    } catch (e) {
        showAlert('Network error', 'error');
    }
}

// Open update modal
function openUpdateModal(requestId, currentStatus) {
    const modal = document.getElementById('updateModal');
    if (!modal) {
        console.error('updateModal not found!');
        return;
    }
    document.getElementById('updateRequestId').value = requestId;
    document.querySelector('#updateForm select[name="status"]').value = currentStatus;
    modal.classList.add('active');
}

function closeUpdateModal() {
    const modal = document.getElementById('updateModal');
    if (modal) modal.classList.remove('active');
}

// Update request status
async function updateRequestStatus(event) {
    event.preventDefault();
    const form = document.getElementById('updateForm');
    const formData = new FormData(form);
    const requestId = formData.get('request_id');
    const newStatus = formData.get('status');

    await updateStatus(requestId, newStatus);
    closeUpdateModal();
}

async function updateStatus(requestId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();

        if (response.ok) {
            loadRequests();
            if (result.warning) {
                showAlert(result.warning, 'warning');
            } else {
                showAlert(result.message || 'Status updated', 'success');
            }
        } else {
            showAlert(result.error || 'Error updating request', 'error');
        }
    } catch (error) {
        console.error('Error updating request:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Filters
document.addEventListener('DOMContentLoaded', () => {
    const filterStatus = document.getElementById('filterStatus');
    const filterBloodGroup = document.getElementById('filterBloodGroup');
    
    if (filterStatus) filterStatus.addEventListener('change', loadRequests);
    if (filterBloodGroup) filterBloodGroup.addEventListener('change', loadRequests);
});

// Badge helpers
function getComponentBadge(component) {
    const colors = {
        'Whole Blood': '#C0392B',
        'RBC': '#922B21',
        'Platelets': '#E67E22',
        'Plasma': '#2980B9',
    };
    const c = colors[component] || '#555';
    return `<span style="
        background:${c}18; color:${c};
        border:1px solid ${c}44;
        border-radius:4px; padding:2px 8px;
        font-size:0.82rem; font-weight:600;">${component || '—'}</span>`;
}

function getUrgencyBadge(urgency) {
    const map = {
        'Critical': '<span class="badge badge-danger">🔴 Critical</span>',
        'High': '<span class="badge badge-warning">🟠 High</span>',
        'Medium': '<span class="badge badge-info">🟡 Medium</span>',
        'Low': '<span class="badge badge-primary">🟢 Low</span>',
    };
    return map[urgency] || `<span class="badge">${urgency || '—'}</span>`;
}

function getStatusBadge(status) {
    const map = {
        'Pending': '<span class="badge badge-warning">⏳ Pending</span>',
        'Fulfilled': '<span class="badge badge-success">✓ Fulfilled</span>',
        'Rejected': '<span class="badge badge-danger">✗ Rejected</span>',
        'Cancelled': '<span class="badge badge-danger">✗ Cancelled</span>',
    };
    return map[status] || `<span class="badge">${status}</span>`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

// Alert toast
function showAlert(message, type = 'info') {
    document.querySelectorAll('.toast-alert').forEach(a => a.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'warning' ? 'warning' : type} toast-alert`;
    Object.assign(alertDiv.style, {
        position: 'fixed',
        top: '6rem',
        right: '2rem',
        zIndex: '9999',
        maxWidth: '400px',
        wordBreak: 'break-word',
    });
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ';
    alertDiv.innerHTML = `
        <span style="font-size:1.1rem;">${icon}</span>
        <span style="margin-left:0.5rem;">${message}</span>`;
    document.body.appendChild(alertDiv);

    const duration = type === 'warning' ? 6000 : 3500;
    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.3s';
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, duration);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing requests page');
    
    await getCurrentUser();

    if (!currentUser) {
        showAlert('Session expired. Please log in again.', 'error');
        return;
    }

    console.log('User authenticated:', currentUser.role);

    if (currentUser.role !== 'Hospital') {
        await loadHospitals();
    }

    await loadRequests();

    // Auto-refresh every 10 seconds
    setInterval(loadRequests, 10000);
});

// Close modals on outside click
window.addEventListener('click', (event) => {
    const createModal = document.getElementById('createModal');
    const updateModal = document.getElementById('updateModal');
    
    if (createModal && event.target === createModal) closeCreateModal();
    if (updateModal && event.target === updateModal) closeUpdateModal();
});
