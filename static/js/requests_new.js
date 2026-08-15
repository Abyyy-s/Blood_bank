const API_URL = '';
let allRequests = [];
let currentUser = null;

async function getCurrentUser() {
    try { const resp = await fetch(`${API_URL}/api/me`); if (!resp.ok) throw new Error('Not authenticated'); currentUser = await resp.json(); return currentUser; }
    catch (e) { console.error('Failed to get user:', e); return null; }
}

async function loadHospitals() {
    try {
        const response = await fetch(`${API_URL}/hospitals`); const hospitals = await response.json();
        const select = document.querySelector('select[name="hospital_id"]'); if (!select) return;
        hospitals.forEach(hospital => { const option = document.createElement('option'); option.value = hospital.hospital_id; option.textContent = `${hospital.hospital_name} — ${hospital.location}`; select.appendChild(option); });
    } catch (error) { console.error('Error loading hospitals:', error); }
}

async function loadRequests() {
    try {
        const status = document.getElementById('filterStatus')?.value || '';
        const bloodGroup = document.getElementById('filterBloodGroup')?.value || '';
        const params = new URLSearchParams(); if (status) params.append('status', status); if (bloodGroup) params.append('blood_group', bloodGroup);
        const response = await fetch(params.toString() ? `${API_URL}/requests?${params}` : `${API_URL}/requests`);
        if (!response.ok) throw new Error('Failed to load requests');
        allRequests = await response.json();
        renderRequestSummary(allRequests); displayRequests(allRequests);
    } catch (error) { console.error('Error loading requests:', error); showAlert('Error loading requests', 'error'); }
}

function renderRequestSummary(requests) {
    const open = requests.filter(r => ['Pending', 'Approved'].includes(r.status)).length;
    const critical = requests.filter(r => r.urgency_level === 'Critical' && ['Pending', 'Approved'].includes(r.status)).length;
    const fulfilled = requests.filter(r => r.status === 'Fulfilled').length;
    const units = requests.reduce((sum, r) => sum + (Number(r.quantity_units) || 0), 0);
    const values = document.querySelectorAll('#requestSummary .op-metric-value');
    [open, critical, fulfilled, units].forEach((value, i) => { if (values[i]) values[i].textContent = value.toLocaleString('en-IN'); });
}

function displayRequests(requests) {
    const tableBody = document.getElementById('requestsTableBody'); if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!requests || requests.length === 0) {
        const message = currentUser?.role === 'Hospital' ? 'You have not made any requests yet.' : 'No requests match the current filters.';
        tableBody.innerHTML = `<tr><td colspan="8"><div class="op-empty"><i class="fas fa-clipboard-check"></i><strong>${message}</strong><br>Try another filter or create a new request.</div></td></tr>`;
        return;
    }
    const urgencyRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const ordered = [...requests].sort((a, b) => (urgencyRank[a.urgency_level] ?? 9) - (urgencyRank[b.urgency_level] ?? 9));
    ordered.forEach(req => {
        const row = document.createElement('tr');
        if (req.urgency_level === 'Critical' && req.status === 'Pending') row.classList.add('ll-row-focus');
        let actionBtn = '';
        if (currentUser?.role === 'Hospital') {
            actionBtn = req.status === 'Pending' ? `<div class="op-action-group"><button class="op-action op-action-danger" onclick="cancelRequest(${req.request_id})">Cancel</button></div>` : '<span style="color:var(--op-muted)">—</span>';
        } else if (req.status === 'Pending') {
            actionBtn = `<div class="op-action-group"><button class="op-action op-action-primary" onclick="openUpdateModal(${req.request_id}, '${req.status}')">Fulfill</button><button class="op-action op-action-danger" onclick="rejectRequest(${req.request_id})">Reject</button></div>`;
        } else {
            actionBtn = `<div class="op-action-group"><button class="op-action" onclick="openUpdateModal(${req.request_id}, '${req.status}')">Update</button></div>`;
        }
        row.innerHTML = `<td><span class="op-id">#${req.request_id}</span></td><td><span class="op-name">${req.hospital_name}</span><br><span style="color:var(--op-muted);font-size:.68rem">${req.location || 'N/A'}</span></td><td><span class="op-blood">${req.blood_group}</span><br><span class="op-badge op-badge-blue" style="margin-top:5px">${req.component_type || 'Whole Blood'}</span></td><td><span class="op-qty">${Number(req.quantity_units).toLocaleString('en-IN')}</span></td><td>${getUrgencyBadge(req.urgency_level)}</td><td>${getStatusBadge(req.status)}</td><td>${formatDate(req.request_date)}</td><td>${actionBtn}</td>`;
        tableBody.appendChild(row);
    });
}

function openCreateModal() {
    const modal = document.getElementById('createModal'); if (!modal) return;
    modal.classList.add('active'); document.getElementById('createForm')?.reset();
    const hospGroup = document.querySelector('select[name="hospital_id"]')?.closest('.form-group');
    if (hospGroup) hospGroup.style.display = currentUser?.role === 'Hospital' ? 'none' : '';
}
function closeCreateModal() { document.getElementById('createModal')?.classList.remove('active'); }

async function createRequest(event) {
    event.preventDefault(); const form = document.getElementById('createForm'); const formData = new FormData(form);
    const data = { blood_group: formData.get('blood_group'), component_type: formData.get('component_type'), quantity_units: parseInt(formData.get('quantity_units')), urgency_level: formData.get('urgency_level') };
    if (currentUser?.role !== 'Hospital') { const hospId = formData.get('hospital_id'); if (!hospId) { alert('Please select a hospital'); return; } data.hospital_id = parseInt(hospId); }
    if (!data.blood_group || !data.component_type || !data.quantity_units || !data.urgency_level) { alert('Please fill in all required fields'); return; }
    const submitBtn = form.querySelector('button[type="submit"]');
    try {
        submitBtn.disabled = true; submitBtn.textContent = 'Submitting…';
        const response = await fetch(`${API_URL}/requests`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
        const result = await response.json(); submitBtn.disabled = false; submitBtn.textContent = 'Create Request';
        if (response.ok) { closeCreateModal(); await loadRequests(); showAlert(result.warning || 'Blood request submitted successfully!', result.warning ? 'warning' : 'success'); }
        else showAlert(result.error || 'Error creating request', 'error');
    } catch (error) { console.error(error); submitBtn.disabled=false; submitBtn.textContent='Create Request'; showAlert('Network error. Please try again.','error'); }
}

async function rejectRequest(requestId) { if (!confirm('Are you sure you want to reject this request?')) return; await updateStatus(requestId, 'Rejected'); }
async function cancelRequest(requestId) {
    if (!confirm('Cancel this request?')) return;
    try { const response = await fetch(`${API_URL}/requests/${requestId}`, { method:'DELETE', headers:{'Content-Type':'application/json'} }); const result = await response.json(); if (response.ok) { showAlert('Request cancelled.','success'); loadRequests(); } else showAlert(result.error || 'Could not cancel request','error'); }
    catch (e) { showAlert('Network error','error'); }
}

function openUpdateModal(requestId, currentStatus) {
    const modal = document.getElementById('updateModal'); if (!modal) return;
    document.getElementById('updateRequestId').value = requestId; document.querySelector('#updateForm select[name="status"]').value = currentStatus; modal.classList.add('active');
}
function closeUpdateModal() { document.getElementById('updateModal')?.classList.remove('active'); }
async function updateRequestStatus(event) { event.preventDefault(); const form = document.getElementById('updateForm'); const data = new FormData(form); await updateStatus(data.get('request_id'), data.get('status')); closeUpdateModal(); }
async function updateStatus(requestId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/requests/${requestId}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:newStatus}) });
        const result = await response.json();
        if (response.ok) { await loadRequests(); showAlert(result.warning || result.message || 'Status updated', result.warning ? 'warning' : 'success'); }
        else showAlert(result.error || 'Error updating request','error');
    } catch (error) { console.error(error); showAlert('Network error. Please try again.','error'); }
}

function getUrgencyBadge(urgency) {
    const map = { Critical:'<span class="op-badge op-badge-danger"><i class="fas fa-bolt"></i> Critical</span>', High:'<span class="op-badge op-badge-warn"><i class="fas fa-arrow-up"></i> High</span>', Medium:'<span class="op-badge op-badge-blue"><i class="fas fa-minus"></i> Medium</span>', Low:'<span class="op-badge op-badge-good"><i class="fas fa-arrow-down"></i> Low</span>' };
    return map[urgency] || `<span class="op-badge">${urgency || '—'}</span>`;
}
function getStatusBadge(status) {
    const map = { Pending:'<span class="op-badge op-badge-warn"><i class="fas fa-hourglass-half"></i> Pending</span>', Fulfilled:'<span class="op-badge op-badge-good"><i class="fas fa-check"></i> Fulfilled</span>', Rejected:'<span class="op-badge op-badge-danger"><i class="fas fa-xmark"></i> Rejected</span>', Cancelled:'<span class="op-badge op-badge-danger"><i class="fas fa-xmark"></i> Cancelled</span>' };
    return map[status] || `<span class="op-badge">${status || '—'}</span>`;
}
function formatDate(dateString) { if (!dateString) return 'N/A'; return new Date(dateString).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function showAlert(message, type='info') {
    document.querySelectorAll('.toast-alert').forEach(a=>a.remove()); const alertDiv=document.createElement('div'); alertDiv.className=`alert alert-${type==='warning'?'warning':type} toast-alert`; Object.assign(alertDiv.style,{position:'fixed',top:'6rem',right:'2rem',zIndex:'9999',maxWidth:'400px',wordBreak:'break-word'}); const icon=type==='success'?'✓':type==='error'?'✗':type==='warning'?'⚠':'ℹ'; alertDiv.innerHTML=`<span style="font-size:1.1rem">${icon}</span><span style="margin-left:.5rem">${message}</span>`; document.body.appendChild(alertDiv); const duration=type==='warning'?6000:3500; setTimeout(()=>{alertDiv.style.transition='opacity .3s';alertDiv.style.opacity='0';setTimeout(()=>alertDiv.remove(),300)},duration);
}

document.addEventListener('DOMContentLoaded', async () => {
    const filterStatus=document.getElementById('filterStatus'); const filterBloodGroup=document.getElementById('filterBloodGroup');
    filterStatus?.addEventListener('change',loadRequests); filterBloodGroup?.addEventListener('change',loadRequests);
    await getCurrentUser(); if (!currentUser) { showAlert('Session expired. Please log in again.','error'); return; }
    if (currentUser.role !== 'Hospital') await loadHospitals();
    await loadRequests(); setInterval(loadRequests,10000);
});
window.addEventListener('click',event=>{ const create=document.getElementById('createModal'); const update=document.getElementById('updateModal'); if(create&&event.target===create)closeCreateModal(); if(update&&event.target===update)closeUpdateModal(); });
