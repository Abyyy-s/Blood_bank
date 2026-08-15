const API_URL = '';
let allHospitals = [];

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

async function loadHospitals() {
    try {
        const response = await fetch(`${API_URL}/hospitals`);
        if (!response.ok) throw new Error('Failed to load');
        allHospitals = await response.json();
        filterHospitals();
    } catch (error) {
        console.error('Error loading hospitals:', error);
        showAlert('Error loading hospitals', 'error');
        document.getElementById('hospitalsGrid').innerHTML = `<div class="hospital-empty"><i class="fas fa-triangle-exclamation"></i><strong>Could not load hospitals</strong><span>Please refresh and try again.</span></div>`;
    }
}

function displayHospitals(hospitals) {
    const grid = document.getElementById('hospitalsGrid');
    document.getElementById('hospitalCount').textContent = hospitals.length;
    grid.innerHTML = '';

    if (!hospitals.length) {
        grid.innerHTML = `<div class="hospital-empty"><i class="fas fa-hospital"></i><strong>No hospitals found</strong><span>Try a different search or add a new care partner.</span></div>`;
        return;
    }

    hospitals.forEach((hospital, index) => {
        const card = document.createElement('article');
        card.className = 'hospital-card';
        card.style.animationDelay = `${Math.min(index * 55, 330)}ms`;
        card.innerHTML = `
            <div class="hospital-card-top">
                <div class="hospital-icon"><i class="fas fa-hospital"></i></div>
                <span class="hospital-id">#${escapeHtml(hospital.hospital_id)}</span>
            </div>
            <h3>${escapeHtml(hospital.hospital_name)}</h3>
            <div class="hospital-location"><i class="fas fa-location-dot"></i><span>${escapeHtml(hospital.location || 'Location not provided')}</span></div>
            <div class="hospital-card-actions">
                <span class="hospital-status">● Connected</span>
                <button class="hospital-delete" type="button" aria-label="Delete ${escapeHtml(hospital.hospital_name)}"><i class="fas fa-trash-can"></i> Remove</button>
            </div>`;
        card.querySelector('.hospital-delete').addEventListener('click', () => deleteHospital(hospital.hospital_id, hospital.hospital_name));
        grid.appendChild(card);
    });
}

function filterHospitals() {
    const query = (document.getElementById('hospitalSearch')?.value || '').trim().toLowerCase();
    const filtered = allHospitals.filter(hospital => `${hospital.hospital_name || ''} ${hospital.location || ''}`.toLowerCase().includes(query));
    displayHospitals(filtered);
}

function openAddModal() {
    document.getElementById('addModal').classList.add('active');
    document.getElementById('addHospitalForm').reset();
    setTimeout(() => document.getElementById('hospitalName')?.focus(), 80);
}

function closeAddModal() { document.getElementById('addModal').classList.remove('active'); }

async function addHospital(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = { hospital_name: formData.get('hospital_name'), location: formData.get('location') };
    if (!data.hospital_name) { showAlert('Hospital name is required', 'error'); return; }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding…';
        const response = await fetch(`${API_URL}/hospitals`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        const result = await response.json();
        if (response.ok) { showAlert('Hospital added successfully!', 'success'); closeAddModal(); loadHospitals(); }
        else showAlert(result.error || 'Error adding hospital', 'error');
    } catch (error) {
        console.error('Error adding hospital:', error);
        showAlert('Network error. Please try again.', 'error');
    } finally { submitBtn.disabled = false; submitBtn.textContent = 'Add hospital'; }
}

async function deleteHospital(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
        const response = await fetch(`${API_URL}/hospitals/${id}`, { method:'DELETE' });
        const result = await response.json();
        if (response.ok) { showAlert('Hospital removed successfully!', 'success'); loadHospitals(); }
        else showAlert(result.error || 'Error deleting hospital', 'error');
    } catch (error) { showAlert('Error deleting hospital', 'error'); }
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    Object.assign(alertDiv.style, { position:'fixed', top:'6rem', right:'2rem', zIndex:'9999' });
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    alertDiv.innerHTML = `<span>${icon}</span><span style="margin-left:.5rem;">${escapeHtml(message)}</span>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => { alertDiv.style.transition='opacity .3s'; alertDiv.style.opacity='0'; setTimeout(()=>alertDiv.remove(),300); }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadHospitals();
    document.getElementById('hospitalSearch')?.addEventListener('input', filterHospitals);
    document.addEventListener('keydown', event => {
        if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            event.preventDefault(); document.getElementById('hospitalSearch')?.focus();
        }
        if (event.key === 'Escape') closeAddModal();
    });
});
window.addEventListener('click', event => { if (event.target === document.getElementById('addModal')) closeAddModal(); });
