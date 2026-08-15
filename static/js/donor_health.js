const API_URL = '';
let allScreenings = [];

async function loadDonors() {
    try {
        const response = await fetch(`${API_URL}/donors`);
        if (!response.ok) throw new Error('Failed to fetch donors');
        const donors = await response.json();
        const donorSelect = document.querySelector('select[name="donor_id"]');
        if (!donorSelect) return;
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

async function loadScreenings() {
    try {
        const response = await fetch(`${API_URL}/donor_health`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
        }
        allScreenings = await response.json();
        updateOverview(allScreenings);
        displayScreenings(allScreenings);
    } catch (error) {
        console.error('Error loading screenings:', error);
        showAlert('Error loading screening records', 'error');
    }
}

function updateOverview(screenings) {
    const total = screenings.length;
    const eligible = screenings.filter(s => s.eligibility_status === 'Eligible').length;
    const review = total - eligible;
    const totalEl = document.getElementById('screeningTotal');
    const eligibleEl = document.getElementById('screeningEligible');
    const reviewEl = document.getElementById('screeningReview');
    if (totalEl) totalEl.textContent = total;
    if (eligibleEl) eligibleEl.textContent = eligible;
    if (reviewEl) reviewEl.textContent = review;
}

function displayScreenings(screenings) {
    const container = document.getElementById('screeningsTableBody');
    if (!container) return;
    container.innerHTML = '';

    if (!screenings || screenings.length === 0) {
        container.innerHTML = `
            <div class="screening-empty">
                <div class="screening-empty-icon"><i class="fas fa-heartbeat"></i></div>
                <div>No health screening records found</div>
            </div>`;
        return;
    }

    screenings.forEach((screening, index) => {
        const eligible = screening.eligibility_status === 'Eligible';
        const row = document.createElement('article');
        row.className = 'screening-record';
        row.style.animationDelay = `${Math.min(index * 45, 360)}ms`;
        row.innerHTML = `
            <div class="screening-record-index">#${screening.health_id}</div>
            <div>
                <p class="screening-donor-name">${escapeHtml(screening.name || 'Unknown donor')}</p>
                <div class="screening-record-meta">
                    <span><i class="fas fa-calendar-day"></i> ${formatDate(screening.screening_date)}</span>
                    <span><i class="fas fa-user"></i> ${escapeHtml(String(screening.age || 'N/A'))} yrs</span>
                    <span><i class="fas fa-notes-medical"></i> ${escapeHtml(screening.disease_detected || 'No disease noted')}</span>
                </div>
            </div>
            <div class="screening-vitals">
                <div class="screening-vital"><strong>${screening.hemoglobin_level ? `${escapeHtml(String(screening.hemoglobin_level))} g/dL` : 'N/A'}</strong><span>Hemoglobin</span></div>
                <div class="screening-vital"><strong>${escapeHtml(screening.bp || 'N/A')}</strong><span>Blood pressure</span></div>
                <div class="screening-vital"><strong>${screening.weight ? `${escapeHtml(String(screening.weight))} kg` : 'N/A'}</strong><span>Weight</span></div>
            </div>
            <span class="screening-status ${eligible ? 'eligible' : 'ineligible'}">${eligible ? '✓ Eligible' : '✕ Not eligible'}</span>
        `;
        container.appendChild(row);
    });
}

async function recordScreening(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        donor_id: parseInt(formData.get('donor_id')),
        hemoglobin_level: formData.get('hemoglobin_level') ? parseFloat(formData.get('hemoglobin_level')) : null,
        bp: formData.get('bp') || null,
        weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
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
            throw new Error(result.error || 'Error recording screening');
        }
    } catch (error) {
        console.error('Error recording screening:', error);
        showAlert(error.message, 'error');
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
}

function openScreeningModal() {
    document.getElementById('screeningForm').reset();
    document.getElementById('screeningModal').classList.add('active');
    loadDonors();
}

function closeScreeningModal() {
    document.getElementById('screeningModal').classList.remove('active');
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '6rem';
    alertDiv.style.right = '2rem';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span><span>${escapeHtml(message)}</span>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

window.onclick = function(event) {
    const modal = document.getElementById('screeningModal');
    if (event.target === modal) closeScreeningModal();
};

document.addEventListener('DOMContentLoaded', () => {
    loadDonors();
    loadScreenings();
});
