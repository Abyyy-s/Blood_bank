// relative origin
const API_URL = ''; 

// Load donors for dropdown
async function loadDonors() {
    try {
        const response = await fetch(`${API_URL}/donors`);
        const donors = await response.json();
        
        const donorSelect = document.querySelector('select[name="donor_id"]');
        donorSelect.innerHTML = '<option value="">Choose a donor...</option>';
        donors.forEach(donor => {
            const option = document.createElement('option');
            option.value = donor.donor_id;
            option.textContent = `${donor.name} (${donor.blood_group}) - ${donor.phone}`;
            donorSelect.appendChild(option);
        });

        // When donor changes, load their eligible screenings
        donorSelect.addEventListener('change', () => {
            const donorId = donorSelect.value;
            if (donorId) {
                loadScreeningsForDonor(donorId);
            } else {
                resetScreeningDropdown();
            }
        });

    } catch (error) {
        console.error('Error loading donors:', error);
    }
}

// Load eligible screenings for selected donor
async function loadScreeningsForDonor(donorId) {
    const screeningSelect = document.querySelector('select[name="screening_id"]');
    screeningSelect.innerHTML = '<option value="">Loading screenings...</option>';
    screeningSelect.disabled = true;

    try {
        const response = await fetch(`${API_URL}/donor_health`);
        const screenings = await response.json();

        // Filter by donor and eligibility
        const eligible = screenings.filter(s =>
            String(s.donor_id) === String(donorId) &&
            s.eligibility_status === 'Eligible'
        );

        screeningSelect.innerHTML = '<option value="">Select screening...</option>';

        if (eligible.length === 0) {
            screeningSelect.innerHTML = '<option value="">No eligible screenings found</option>';
            screeningSelect.disabled = true;
            showAlert('This donor has no eligible health screenings. Please add one first.', 'error');
            return;
        }

        eligible.forEach(s => {
            const option = document.createElement('option');
            option.value = s.health_id;
            option.textContent = `Screening #${s.health_id} — ${formatDate(s.screening_date)} (Hb: ${s.hemoglobin_level || 'N/A'} g/dL)`;
            screeningSelect.appendChild(option);
        });

        // Auto-select if only one
        if (eligible.length === 1) {
            screeningSelect.value = eligible[0].health_id;
        }

        screeningSelect.disabled = false;

    } catch (error) {
        console.error('Error loading screenings:', error);
        screeningSelect.innerHTML = '<option value="">Error loading screenings</option>';
        screeningSelect.disabled = true;
    }
}

function resetScreeningDropdown() {
    const screeningSelect = document.querySelector('select[name="screening_id"]');
    screeningSelect.innerHTML = '<option value="">Select a donor first...</option>';
    screeningSelect.disabled = true;
}

// Load blood banks for dropdown
async function loadBloodBanks() {
    try {
        const response = await fetch(`${API_URL}/blood_banks`);
        const banks = await response.json();
        
        const bankSelect = document.querySelector('select[name="bank_id"]');
        bankSelect.innerHTML = '<option value="">Choose a blood bank...</option>';
        banks.forEach(bank => {
            const option = document.createElement('option');
            option.value = bank.bank_id;
            option.textContent = `${bank.bank_name} - ${bank.location}`;
            bankSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading blood banks:', error);
    }
}

// Load all donations
async function loadDonations() {
    try {
        const response = await fetch(`${API_URL}/donations`);
        const donations = await response.json();
        displayDonations(donations);
    } catch (error) {
        console.error('Error loading donations:', error);
        showAlert('Error loading donations', 'error');
    }
}

// Display donations in table
function displayDonations(donations) {
    const tableBody = document.getElementById('donationsTableBody');
    tableBody.innerHTML = '';
    
    if (donations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">💉</div>
                    <div style="font-size: 1.2rem;">No donations recorded</div>
                </td>
            </tr>
        `;
        return;
    }
    
    donations.forEach(donation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${donation.donation_id}</td>
            <td style="font-weight: 600;">${donation.donor_name || 'N/A'}</td>
            <td><span class="blood-type blood-type-small">${donation.blood_group || 'N/A'}</span></td>
            <td>${donation.bank_name || 'N/A'}</td>
            <td>${formatDate(donation.donation_date)}</td>
            <td><span class="badge badge-info">${donation.component_type}</span></td>
            <td style="font-weight: 600; font-size: 1.1rem;">${donation.quantity_units} units</td>
            <td>${formatDate(donation.expiry_date)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// calculate expiry date given a donation date and component type
function calculateExpiry(donationDate, componentType) {
    if (!donationDate || isNaN(donationDate)) return '';
    const days = {
        'Whole Blood': 35,
        'RBC': 42,
        'Platelets': 5,
        'Plasma': 365
    }[componentType] || 35;
    const exp = new Date(donationDate);
    exp.setDate(exp.getDate() + days);
    return exp.toISOString().split('T')[0];
}

// Open record modal
function openRecordModal() {
    document.getElementById('recordForm').reset();
    resetScreeningDropdown();

    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="donation_date"]').value = today;
    // set expiry based on default component (none selected -> whole blood assumption)
    document.querySelector('input[name="expiry_date"]').value = calculateExpiry(new Date(today), 'Whole Blood');

    document.getElementById('recordModal').classList.add('active');
}

// Close record modal
function closeRecordModal() {
    document.getElementById('recordModal').classList.remove('active');
}

// Record donation
async function recordDonation(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const screeningId = formData.get('screening_id');

    // Validate screening is selected
    if (!screeningId || screeningId.trim() === '') {
        showAlert('Please select a health screening for this donor.', 'error');
        return;
    }

    const data = {
        donor_id: parseInt(formData.get('donor_id')),
        bank_id: parseInt(formData.get('bank_id')),
        screening_id: parseInt(screeningId),
        component_type: formData.get('component_type'),
        quantity_units: parseInt(formData.get('quantity_units')),
        expiry_date: formData.get('expiry_date')
    };
    
    try {
        const response = await fetch(`${API_URL}/donations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('Donation recorded and stock updated!', 'success');
            closeRecordModal();
            loadDonations();
        } else {
            showAlert(result.error || 'Error recording donation', 'error');
        }
    } catch (error) {
        console.error('Error recording donation:', error);
        showAlert('Error recording donation', 'error');
    }
}

// update expiry whenever component or donation date changes
function refreshExpiry() {
    const donationInput = document.querySelector('input[name="donation_date"]');
    const compSelect = document.querySelector('select[name="component_type"]');
    const donationDate = new Date(donationInput.value);
    const componentType = compSelect.value;
    const newExp = calculateExpiry(donationDate, componentType);
    if (newExp) document.querySelector('input[name="expiry_date"]').value = newExp;
}

// component or donation date listeners
const compEl = document.querySelector('select[name="component_type"]');
if (compEl) compEl.addEventListener('change', refreshExpiry);
const donDateEl = document.querySelector('input[name="donation_date"]');
if (donDateEl) donDateEl.addEventListener('change', refreshExpiry);

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

// Close modal on outside click
window.onclick = function(event) {
    const recordModal = document.getElementById('recordModal');
    if (event.target === recordModal) closeRecordModal();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDonors();
    loadBloodBanks();
    loadDonations();
    setInterval(loadDonations, 30000);
});