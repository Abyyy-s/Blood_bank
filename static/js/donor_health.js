// relative origin
const API_URL = ''; 

let allScreenings = [];

// ===============================
// LOAD DONORS FOR DROPDOWN
// ===============================
async function loadDonors() {
    try {
        const response = await fetch(`${API_URL}/donors`);
        if (!response.ok) throw new Error("Failed to fetch donors");

        const donors = await response.json();

        const donorSelect = document.querySelector('select[name="donor_id"]');
        donorSelect.innerHTML = '<option value="">Choose a donor...</option>';

        donors.forEach(donor => {
            const option = document.createElement('option');
            option.value = donor.donor_id;
            option.textContent = `${donor.name} (${donor.blood_group}) - Age: ${donor.age}`;
            donorSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading donors:', error);
        showAlert('Error loading donors', 'error');
    }
}

// ===============================
// LOAD ALL SCREENINGS
// ===============================
async function loadScreenings() {
    try {
        const response = await fetch(`${API_URL}/donor_health`);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Server error");
        }

        const data = await response.json();
        allScreenings = data;
        displayScreenings(allScreenings);

    } catch (error) {
        console.error('Error loading screenings:', error);
        showAlert('Error loading screening records', 'error');
    }
}

// ===============================
// DISPLAY SCREENINGS TABLE
// ===============================
function displayScreenings(screenings) {
    const tableBody = document.getElementById('screeningsTableBody');
    tableBody.innerHTML = '';

    if (!screenings || screenings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏥</div>
                    <div style="font-size: 1.2rem;">No health screening records found</div>
                </td>
            </tr>
        `;
        return;
    }

    screenings.forEach(screening => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${screening.health_id}</strong></td>
            <td style="font-weight: 600;">${screening.name || 'Unknown'}</td>
            <td>${screening.age || 'N/A'}</td>
            <td>${formatDate(screening.screening_date)}</td>
            <td>${screening.hemoglobin_level ? screening.hemoglobin_level + ' g/dL' : 'N/A'}</td>
            <td>${screening.bp || 'N/A'}</td>
            <td>${screening.weight ? screening.weight + ' kg' : 'N/A'}</td>
            <td>${screening.disease_detected || 'None'}</td>
            <td>${getEligibilityBadge(screening.eligibility_status)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// ===============================
// RECORD NEW SCREENING
// ===============================
async function recordScreening(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = {
        donor_id: parseInt(formData.get('donor_id')),
        hemoglobin_level: formData.get('hemoglobin_level')
            ? parseFloat(formData.get('hemoglobin_level'))
            : null,
        bp: formData.get('bp') || null,
        weight: formData.get('weight')
            ? parseFloat(formData.get('weight'))
            : null,
        disease_detected: formData.get('disease_detected') || null,
        eligibility_status: formData.get('eligibility_status')
    };

    try {
        const response = await fetch(`${API_URL}/donor_health`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Health screening recorded successfully!', 'success');
            closeScreeningModal();
            loadScreenings();
        } else {
            throw new Error(result.error || "Error recording screening");
        }

    } catch (error) {
        console.error('Error recording screening:', error);
        showAlert(error.message, 'error');
    }
}

// ===============================
// BADGE FOR ELIGIBILITY
// ===============================
function getEligibilityBadge(status) {
    if (status === 'Eligible') {
        return '<span class="badge badge-success">✅ Eligible</span>';
    } else {
        return '<span class="badge badge-danger">❌ Not Eligible</span>';
    }
}

// ===============================
// FORMAT DATE
// ===============================
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

// ===============================
// MODAL CONTROLS
// ===============================
function openScreeningModal() {
    document.getElementById('screeningForm').reset();
    document.getElementById('screeningModal').classList.add('active');
    loadDonors();
}

function closeScreeningModal() {
    document.getElementById('screeningModal').classList.remove('active');
}

// ===============================
// ALERT SYSTEM
// ===============================
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
    }, 4000);
}

// ===============================
// CLOSE MODAL ON OUTSIDE CLICK
// ===============================
window.onclick = function(event) {
    const modal = document.getElementById('screeningModal');
    if (event.target === modal) closeScreeningModal();
};

// ===============================
// INITIALIZE
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadDonors();
    loadScreenings();
});