const API_URL = '';

async function loadHospitals() {
    try {
        const response = await fetch(`${API_URL}/hospitals`);
        if (!response.ok) throw new Error('Failed to load');
        const hospitals = await response.json();
        displayHospitals(hospitals);
    } catch (error) {
        console.error('Error loading hospitals:', error);
        showAlert('Error loading hospitals', 'error');
        document.getElementById('hospitalsTableBody').innerHTML = `
            <tr><td colspan="4" style="text-align:center;padding:3rem;">
                <div style="font-size:2rem;">⚠️</div>
                <div>Could not load hospitals. Please refresh.</div>
            </td></tr>`;
    }
}

function displayHospitals(hospitals) {
    const tableBody = document.getElementById('hospitalsTableBody');
    tableBody.innerHTML = '';
    if (!hospitals || hospitals.length === 0) {
        tableBody.innerHTML = `
            <tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:3rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">🏥</div>
                <div style="font-size:1.2rem;">No hospitals registered</div>
            </td></tr>`;
        return;
    }
    hospitals.forEach(hospital => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${hospital.hospital_id}</td>
            <td style="font-weight:600;">${hospital.hospital_name}</td>
            <td>${hospital.location || 'N/A'}</td>
            <td>
                <button class="btn btn-outline"
                    style="padding:0.3rem 0.8rem;font-size:0.85rem;color:var(--danger);border-color:var(--danger);"
                    onclick="deleteHospital(${hospital.hospital_id}, '${hospital.hospital_name.replace(/'/g, "\\'")}')">
                    🗑 Delete
                </button>
            </td>`;
        tableBody.appendChild(row);
    });
}

function openAddModal() {
    document.getElementById('addModal').classList.add('active');
    document.getElementById('addHospitalForm').reset();
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('active');
}

async function addHospital(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        hospital_name: formData.get('hospital_name'),
        location:      formData.get('location'),
    };
    if (!data.hospital_name) {
        showAlert('Hospital name is required', 'error');
        return;
    }
    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Adding...';
        const response = await fetch(`${API_URL}/hospitals`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data),
        });
        const result = await response.json();
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Add Hospital';
        if (response.ok) {
            showAlert('Hospital added successfully!', 'success');
            closeAddModal();
            loadHospitals();
        } else {
            showAlert(result.error || 'Error adding hospital', 'error');
        }
    } catch (error) {
        console.error('Error adding hospital:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

async function deleteHospital(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
        const response = await fetch(`${API_URL}/hospitals/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok) {
            showAlert('Hospital deleted successfully!', 'success');
            loadHospitals();
        } else {
            showAlert(result.error || 'Error deleting hospital', 'error');
        }
    } catch (error) {
        showAlert('Error deleting hospital', 'error');
    }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    Object.assign(alertDiv.style, { position:'fixed', top:'6rem', right:'2rem', zIndex:'9999' });
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    alertDiv.innerHTML = `<span>${icon}</span><span style="margin-left:0.5rem;">${message}</span>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.3s';
        alertDiv.style.opacity    = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('addModal')) closeAddModal();
});

document.addEventListener('DOMContentLoaded', () => {
    loadHospitals();
});