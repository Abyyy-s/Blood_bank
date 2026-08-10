// use empty string so fetch uses same origin (avoids cookie issues)
const API_URL = ''; 
let allDonors = [];

// Load all donors
async function loadDonors() {
    try {
        const response = await fetch(`${API_URL}/donors`);
        allDonors = await response.json();
        displayDonors(allDonors);
    } catch (error) {
        console.error('Error loading donors:', error);
        showAlert('Error loading donors', 'error');
    }
}

// Display donors in table
function displayDonors(donors) {
    const tableBody = document.getElementById('donorsTableBody');
    tableBody.innerHTML = '';

    if (donors.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
                    <div style="font-size: 1.2rem;">No donors found</div>
                </td>
            </tr>
        `;
        return;
    }

    donors.forEach(donor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${donor.donor_id}</td>
            <td style="font-weight: 600;">${donor.name}</td>
            <td><span class="blood-type blood-type-small">${donor.blood_group}</span></td>
            <td>${donor.age}</td>
            <td>${donor.gender}</td>
            <td>${donor.phone || 'N/A'}</td>
            <td>${donor.city || 'N/A'}</td>
            <td>
                <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="openEditModal(${donor.donor_id})">
                    Edit
                </button>
                <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem; margin-left: 0.5rem;" onclick="deleteDonor(${donor.donor_id})">
                    Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Search donors
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allDonors.filter(donor =>
        donor.name.toLowerCase().includes(searchTerm) ||
        (donor.email && donor.email.toLowerCase().includes(searchTerm)) ||
        (donor.phone && donor.phone.includes(searchTerm))
    );
    displayDonors(filtered);
});

// Filter by blood group
document.getElementById('filterBloodGroup')?.addEventListener('change', (e) => {
    const bloodGroup = e.target.value;
    if (bloodGroup) {
        const filtered = allDonors.filter(d => d.blood_group === bloodGroup);
        displayDonors(filtered);
    } else {
        displayDonors(allDonors);
    }
});

// Open register modal
function openRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
    document.getElementById('registerForm').reset();
}

// Close register modal
function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
}

// Register donor
async function registerDonor(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        blood_group: formData.get('blood_group'),
        phone: formData.get('contact') || formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('address') || '',
        city: formData.get('city') || ''
    };

    try {
        const response = await fetch(`${API_URL}/donors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            showAlert('Donor registered successfully!', 'success');
            closeRegisterModal();
            loadDonors();
        } else {
            showAlert(result.error || 'Error registering donor', 'error');
        }
    } catch (error) {
        console.error('Error registering donor:', error);
        showAlert('Error registering donor', 'error');
    }
}

// Open edit modal - fetch donor by ID
async function openEditModal(donorId) {
    try {
        const response = await fetch(`${API_URL}/donors/${donorId}`);
        const donor = await response.json();

        if (response.ok) {
            document.getElementById('editDonorId').value = donor.donor_id;
            document.getElementById('editName').value = donor.name;
            document.getElementById('editAge').value = donor.age;
            document.getElementById('editGender').value = donor.gender;
            document.getElementById('editBloodGroup').value = donor.blood_group;
            document.getElementById('editContact').value = donor.phone || '';
            document.getElementById('editEmail').value = donor.email || '';
            document.getElementById('editCity').value = donor.city || '';
            document.getElementById('editModal').classList.add('active');
        } else {
            showAlert('Error loading donor details', 'error');
        }
    } catch (error) {
        console.error('Error loading donor:', error);
        showAlert('Error loading donor details', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Update donor
async function updateDonor(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const donorId = formData.get('donor_id');
    const data = {
        name: formData.get('name'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        blood_group: formData.get('blood_group'),
        phone: formData.get('contact') || formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('address') || '',
        city: formData.get('city') || ''
    };

    try {
        const response = await fetch(`${API_URL}/donors/${donorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            showAlert('Donor updated successfully!', 'success');
            closeEditModal();
            loadDonors();
        } else {
            showAlert(result.error || 'Error updating donor', 'error');
        }
    } catch (error) {
        console.error('Error updating donor:', error);
        showAlert('Error updating donor', 'error');
    }
}

// Delete donor
async function deleteDonor(donorId) {
    if (!confirm('Are you sure you want to delete this donor?')) return;
    try {
        const response = await fetch(`${API_URL}/donors/${donorId}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok) {
            showAlert('Donor deleted successfully!', 'success');
            loadDonors();
        } else {
            showAlert(result.error || 'Error deleting donor', 'error');
        }
    } catch (error) {
        showAlert('Error deleting donor', 'error');
    }
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '6rem';
    alertDiv.style.right = '2rem';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Close modals on outside click
window.onclick = function(event) {
    const registerModal = document.getElementById('registerModal');
    const editModal = document.getElementById('editModal');
    if (event.target === registerModal) closeRegisterModal();
    if (event.target === editModal) closeEditModal();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDonors);