const API_URL = '';
let allRequests = [];
let currentUser = null;

// ── Get current user ─────────────────────────────────────────
async function getCurrentUser() {
    try {
        const resp = await fetch(`${API_URL}/api/me`);
        if (!resp.ok) throw new Error('Not authenticated');

        currentUser = await resp.json();
        console.log('Current user loaded:', currentUser);
        return currentUser;
    } catch (e) {
        console.error('Failed to get user:', e);
        return null;
    }
}

// ── Load hospitals ───────────────────────────────────────────
async function loadHospitals() {
    try {
        const response = await fetch(`${API_URL}/hospitals`);
        const hospitals = await response.json();

        const hospitalSelect = document.querySelector('select[name="hospital_id"]');
        if (!hospitalSelect) return;

        hospitalSelect.innerHTML = '<option value="">Select Hospital</option>';

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

// ── Load requests ────────────────────────────────────────────
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

// ── Display requests ─────────────────────────────────────────
function displayRequests(requests) {

    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';

    if (!requests || requests.length === 0) {
        tableBody.innerHTML = `
        <tr>
            <td colspan="10" style="text-align:center;padding:2rem;">
            No requests found
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
                <button onclick="cancelRequest(${req.request_id})">
                Cancel
                </button>`;
            }

        } else {

            if (req.status === 'Pending') {

                actionBtn = `
                <button onclick="openUpdateModal(${req.request_id}, '${req.status}')">
                Fulfill
                </button>

                <button onclick="rejectRequest(${req.request_id})">
                Reject
                </button>`;
            }
        }

        row.innerHTML = `
        <td>#${req.request_id}</td>
        <td>${req.hospital_name}</td>
        <td>${req.location || 'N/A'}</td>
        <td>${req.blood_group}</td>
        <td>${req.component_type}</td>
        <td>${req.quantity_units}</td>
        <td>${req.urgency_level}</td>
        <td>${req.status}</td>
        <td>${formatDate(req.request_date)}</td>
        <td>${actionBtn}</td>
        `;

        tableBody.appendChild(row);
    });
}

// ── Open Create Modal ────────────────────────────────────────
function openCreateModal() {

    document.getElementById('createModal').classList.add('active');
    document.getElementById('createForm').reset();

    const hospGroup = document.querySelector('select[name="hospital_id"]')?.closest('.form-group');

    if (currentUser?.role === 'Hospital') {

        if (hospGroup) hospGroup.style.display = 'none';

    } else {

        if (hospGroup) hospGroup.style.display = '';
    }
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
}

// ── Create request ───────────────────────────────────────────
async function createRequest(event) {

    event.preventDefault();

    const formData = new FormData(event.target);

    const data = {

        blood_group: formData.get('blood_group'),
        component_type: formData.get('component_type'),
        quantity_units: parseInt(formData.get('quantity_units')),
        urgency_level: formData.get('urgency_level')
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

        const response = await fetch(`${API_URL}/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {

            closeCreateModal();
            await loadRequests();

            showAlert('Request created successfully', 'success');

        } else {

            showAlert(result.error || 'Error creating request', 'error');
        }

    } catch (error) {

        console.error(error);
        showAlert('Network error', 'error');
    }
}

// ── Cancel request (Hospital) ─────────────────────────────────
async function cancelRequest(requestId) {

    await updateStatus(requestId, 'Cancelled');
}

// ── Reject request (Admin/Staff) ──────────────────────────────
async function rejectRequest(requestId) {

    await updateStatus(requestId, 'Rejected');
}

// ── Open update modal ─────────────────────────────────────────
function openUpdateModal(requestId, currentStatus) {

    document.getElementById('updateRequestId').value = requestId;

    document.querySelector('#updateForm select[name="status"]').value = currentStatus;

    document.getElementById('updateModal').classList.add('active');
}

function closeUpdateModal() {

    document.getElementById('updateModal').classList.remove('active');
}

// ── Update status ─────────────────────────────────────────────
async function updateStatus(requestId, newStatus) {

    try {

        const response = await fetch(`${API_URL}/requests/${requestId}`, {

            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (response.ok) {

            loadRequests();
            showAlert(result.message || 'Status updated', 'success');

        } else {

            showAlert(result.error || 'Error updating', 'error');
        }

    } catch (error) {

        console.error(error);
        showAlert('Network error', 'error');
    }
}

// ── Format date ───────────────────────────────────────────────
function formatDate(dateString) {

    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-IN');
}

// ── Alerts ────────────────────────────────────────────────────
function showAlert(message, type = 'info') {

    const div = document.createElement('div');

    div.innerText = message;

    div.style.position = 'fixed';
    div.style.top = '80px';
    div.style.right = '20px';
    div.style.background = '#333';
    div.style.color = '#fff';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '5px';

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 3000);
}

// ── Filters ───────────────────────────────────────────────────
document.getElementById('filterStatus')?.addEventListener('change', loadRequests);
document.getElementById('filterBloodGroup')?.addEventListener('change', loadRequests);

// ── Initialize ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

    await getCurrentUser();

    if (!currentUser) {

        showAlert('Please login again', 'error');
        return;
    }

    if (currentUser.role !== 'Hospital') {

        await loadHospitals();
    }

    await loadRequests();

    setInterval(loadRequests, 10000);
});