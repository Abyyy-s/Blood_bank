const API_URL = '';
let allDonors = [];

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

function donorInitials(name = '') {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
}

function displayDonors(donors) {
    const grid = document.getElementById('donorsTableBody');
    if (!grid) return;
    const count = document.getElementById('donorCount');
    if (count) count.textContent = `${donors.length} donor${donors.length === 1 ? '' : 's'}`;
    grid.innerHTML = '';
    if (!donors.length) {
        grid.innerHTML = '<div class="donor-empty"><div class="donor-empty-icon"><i class="fas fa-user-slash"></i></div><h3>No donors found</h3><p>Try a different search or blood-group filter.</p></div>';
        return;
    }
    donors.forEach((donor, index) => {
        const card = document.createElement('article');
        card.className = 'donor-person-card ll-reveal ll-visible';
        card.style.setProperty('--donor-delay', `${Math.min(index, 8) * 45}ms`);
        card.innerHTML = `<div class="donor-card-head"><div class="donor-avatar"><span>${donorInitials(donor.name)}</span><i class="fas fa-droplet"></i></div><span class="donor-blood">${donor.blood_group}</span></div><div class="donor-identity"><h3>${donor.name}</h3><span>#${donor.donor_id} · ${donor.city || 'Location not set'}</span></div><div class="donor-facts"><span><i class="fas fa-user"></i>${donor.age} yrs</span><span><i class="fas fa-venus-mars"></i>${donor.gender}</span></div><div class="donor-contact"><span><i class="fas fa-phone"></i>${donor.phone || 'No phone'}</span><span><i class="fas fa-envelope"></i>${donor.email || 'No email'}</span></div><div class="donor-card-actions"><button class="donor-action-primary" onclick="openEditModal(${donor.donor_id})"><i class="fas fa-pen"></i> Edit record</button><button class="donor-action-more" onclick="deleteDonor(${donor.donor_id})" aria-label="Delete ${donor.name}"><i class="fas fa-trash"></i></button></div>`;
        grid.appendChild(card);
    });
}

document.getElementById('searchInput')?.addEventListener('input', e => applyFilters(e.target.value));
document.getElementById('filterBloodGroup')?.addEventListener('change', () => applyFilters(document.getElementById('searchInput')?.value || ''));
document.addEventListener('keydown', event => { if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') { event.preventDefault(); document.getElementById('searchInput')?.focus(); } });
function applyFilters(searchValue) {
    const term = searchValue.toLowerCase().trim();
    const group = document.getElementById('filterBloodGroup')?.value || '';
    const filtered = allDonors.filter(donor => (!group || donor.blood_group === group) && (!term || donor.name.toLowerCase().includes(term) || (donor.email || '').toLowerCase().includes(term) || (donor.phone || '').includes(term)));
    displayDonors(filtered);
}

function openRegisterModal() { document.getElementById('registerModal').classList.add('active'); document.getElementById('registerForm').reset(); }
function closeRegisterModal() { document.getElementById('registerModal').classList.remove('active'); }

async function registerDonor(event) {
    event.preventDefault(); const formData = new FormData(event.target);
    const data = {name:formData.get('name'),age:formData.get('age'),gender:formData.get('gender'),blood_group:formData.get('blood_group'),phone:formData.get('contact') || '',email:formData.get('email') || '',address:formData.get('address') || '',city:formData.get('city') || ''};
    try { const response = await fetch(`${API_URL}/donors`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); const result = await response.json(); if(response.ok){showAlert('Donor registered successfully!','success');closeRegisterModal();loadDonors();}else showAlert(result.error || 'Error registering donor','error'); } catch(error){console.error(error);showAlert('Error registering donor','error');}
}

async function openEditModal(donorId) {
    try { const response=await fetch(`${API_URL}/donors/${donorId}`); const donor=await response.json(); if(!response.ok){showAlert('Error loading donor details','error');return;} document.getElementById('editDonorId').value=donor.donor_id;document.getElementById('editName').value=donor.name;document.getElementById('editAge').value=donor.age;document.getElementById('editGender').value=donor.gender;document.getElementById('editBloodGroup').value=donor.blood_group;document.getElementById('editContact').value=donor.phone||'';document.getElementById('editEmail').value=donor.email||'';document.getElementById('editCity').value=donor.city||'';document.getElementById('editModal').classList.add('active'); } catch(error){console.error(error);showAlert('Error loading donor details','error');}
}
function closeEditModal(){document.getElementById('editModal').classList.remove('active');}
async function updateDonor(event){event.preventDefault();const f=new FormData(event.target);const id=f.get('donor_id');const data={name:f.get('name'),age:f.get('age'),gender:f.get('gender'),blood_group:f.get('blood_group'),phone:f.get('contact')||'',email:f.get('email')||'',address:'',city:f.get('city')||''};try{const r=await fetch(`${API_URL}/donors/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(r.ok){showAlert('Donor updated successfully!','success');closeEditModal();loadDonors();}else showAlert(result.error||'Error updating donor','error');}catch(error){console.error(error);showAlert('Error updating donor','error');}}
async function deleteDonor(donorId){if(!confirm('Are you sure you want to delete this donor?'))return;try{const r=await fetch(`${API_URL}/donors/${donorId}`,{method:'DELETE'});const result=await r.json();if(r.ok){showAlert('Donor deleted successfully!','success');loadDonors();}else showAlert(result.error||'Error deleting donor','error');}catch(error){showAlert('Error deleting donor','error');}}
function showAlert(message,type='info'){const alertDiv=document.createElement('div');alertDiv.className=`alert alert-${type}`;alertDiv.style.cssText='position:fixed;top:6rem;right:2rem;z-index:9999';alertDiv.innerHTML=`<span>${type==='success'?'✓':type==='error'?'✗':'ℹ'}</span><span>${message}</span>`;document.body.appendChild(alertDiv);setTimeout(()=>{alertDiv.style.opacity='0';setTimeout(()=>alertDiv.remove(),300)},3000);}
window.addEventListener('click',event=>{const a=document.getElementById('registerModal'),b=document.getElementById('editModal');if(event.target===a)closeRegisterModal();if(event.target===b)closeEditModal();});
document.addEventListener('DOMContentLoaded',loadDonors);