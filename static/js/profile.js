function escapeHtml(value) {
    return String(value ?? 'Not provided').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function initials(name) {
    return String(name || 'User').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U';
}

function infoItem(label, value) {
    return `<div class="profile-info-item"><div class="profile-info-label">${escapeHtml(label)}</div><div class="profile-info-value">${escapeHtml(value)}</div></div>`;
}

function accessPanel(profile) {
    const lastLogin = profile.last_login || 'Not available';
    return `
        <div class="profile-side-stack">
            <aside class="profile-side-card">
                <span class="profile-eyebrow">ACCESS CONTEXT</span>
                <h3>Workspace access</h3>
                <div class="profile-access-row"><span class="profile-access-label">Role</span><strong class="profile-access-value">${escapeHtml(profile.role || 'Hospital User')}</strong></div>
                <div class="profile-access-row"><span class="profile-access-label">Last login</span><strong class="profile-access-value">${escapeHtml(lastLogin)}</strong></div>
                <div class="profile-secure-note">✓ Your session is protected by Life Link role-based access.</div>
            </aside>
            <aside class="profile-side-card">
                <span class="profile-eyebrow">ACCOUNT NOTE</span>
                <h3>Keep details current</h3>
                <p>Your profile reflects the identity currently associated with this operational session. Contact an administrator if account information needs to be changed.</p>
            </aside>
        </div>`;
}

function renderProfile(profile) {
    const card = document.getElementById('profileCard');
    let name = profile.name;
    let role = profile.role;
    let typeLabel = profile.type === 'hospital' ? 'Hospital account' : `${profile.type === 'staff' ? 'Staff' : 'Administrator'} account`;
    let sections = '';

    if (profile.type === 'hospital') {
        name = profile.hospital_name;
        role = 'Hospital User';
        sections = `
            <section class="profile-section"><h3>Hospital identity</h3><div class="profile-info-grid">
                ${infoItem('Hospital name', profile.hospital_name)}
                ${infoItem('Registration ID', `HOSP-${String(profile.hospital_id).padStart(4, '0')}`)}
                ${infoItem('Location', profile.location)}
            </div></section>
            <section class="profile-section"><h3>Contact details</h3><div class="profile-info-grid">
                ${infoItem('Contact person', profile.contact_person_name)}
                ${infoItem('Email address', profile.contact_email)}
                ${infoItem('Contact number', profile.contact_number)}
            </div></section>`;
    } else {
        sections = `
            <section class="profile-section"><h3>Personal information</h3><div class="profile-info-grid">
                ${infoItem('Full name', profile.name)}
                ${infoItem('Role', profile.role)}
                ${infoItem('Email address', profile.email)}
                ${infoItem('Contact number', profile.contact_number)}
            </div></section>`;
    }

    card.innerHTML = `
        <article class="profile-card-modern">
            <header class="profile-identity">
                <div class="profile-avatar-modern">${profile.type === 'hospital' ? '🏥' : escapeHtml(initials(name))}</div>
                <div>
                    <h2>${escapeHtml(name)}</h2>
                    <p>${escapeHtml(typeLabel)}</p>
                    <span class="profile-role-pill">${escapeHtml(role)}</span>
                </div>
            </header>
            ${sections}
        </article>
        ${accessPanel({...profile, role})}`;

    requestAnimationFrame(() => {
        card.querySelectorAll('.profile-card-modern,.profile-side-card').forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(12px)';
            element.style.transition = 'opacity .45s ease, transform .45s ease';
            element.style.transitionDelay = `${index * 70}ms`;
            requestAnimationFrame(() => { element.style.opacity = '1'; element.style.transform = 'none'; });
        });
    });
}

async function loadProfile() {
    const profileCard = document.getElementById('profileCard');
    try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        renderProfile(await response.json());
    } catch (error) {
        console.error('Error loading profile:', error);
        profileCard.innerHTML = `<div class="profile-loading">Unable to load your workspace. Please refresh the page.</div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);
