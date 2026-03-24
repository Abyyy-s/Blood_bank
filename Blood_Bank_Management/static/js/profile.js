// Load and display profile based on user role
async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const profile = await response.json();
        const profileCard = document.getElementById('profileCard');

        let html = '';

        if (profile.type === 'admin') {
            html = `
                <div class="profile-header">
                    <div class="profile-avatar">👤</div>
                    <div>
                        <h2 class="profile-title">${profile.name}</h2>
                        <p class="profile-role">${profile.role}</p>
                        <span class="badge admin">${profile.role}</span>
                    </div>
                </div>

                <div class="section-title">Personal Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Full Name</div>
                        <div class="info-value">${profile.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Role</div>
                        <div class="info-value">${profile.role}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">${profile.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Contact Number</div>
                        <div class="info-value">${profile.contact_number || 'Not provided'}</div>
                    </div>
                    <div class="info-item single">
                        <div class="info-label">Last Login</div>
                        <div class="info-value">${profile.last_login}</div>
                    </div>
                </div>
            `;
        } else if (profile.type === 'staff') {
            html = `
                <div class="profile-header">
                    <div class="profile-avatar">👨‍💼</div>
                    <div>
                        <h2 class="profile-title">${profile.name}</h2>
                        <p class="profile-role">${profile.role}</p>
                        <span class="badge staff">${profile.role}</span>
                    </div>
                </div>

                <div class="section-title">Personal Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Staff Name</div>
                        <div class="info-value">${profile.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Role</div>
                        <div class="info-value">${profile.role}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">${profile.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Contact Number</div>
                        <div class="info-value">${profile.contact_number || 'Not provided'}</div>
                    </div>
                    <div class="info-item single">
                        <div class="info-label">Last Login</div>
                        <div class="info-value">${profile.last_login}</div>
                    </div>
                </div>
            `;
        } else if (profile.type === 'hospital') {
            html = `
                <div class="profile-header">
                    <div class="profile-avatar">🏥</div>
                    <div>
                        <h2 class="profile-title">${profile.hospital_name}</h2>
                        <p class="profile-role">Hospital User</p>
                        <span class="badge hospital">Hospital</span>
                    </div>
                </div>

                <div class="section-title">Hospital Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Hospital Name</div>
                        <div class="info-value">${profile.hospital_name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Registration ID</div>
                        <div class="info-value">HOSP-${String(profile.hospital_id).padStart(4, '0')}</div>
                    </div>
                    <div class="info-item single">
                        <div class="info-label">Location</div>
                        <div class="info-value">${profile.location}</div>
                    </div>
                </div>

                <div class="section-title">Contact Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Contact Person Name</div>
                        <div class="info-value">${profile.contact_person_name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">${profile.contact_email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Contact Number</div>
                        <div class="info-value">${profile.contact_number || 'Not provided'}</div>
                    </div>
                    <div class="info-item single">
                        <div class="info-label">Last Login</div>
                        <div class="info-value">${profile.last_login}</div>
                    </div>
                </div>
            `;
        }

        profileCard.innerHTML = html;
    } catch (error) {
        console.error('Error loading profile:', error);
        document.getElementById('profileCard').innerHTML = `
            <div class="profile-header">
                <p style="color: #c0392b;">Error loading profile. Please refresh the page.</p>
            </div>
        `;
    }
}

// Load profile when page loads
document.addEventListener('DOMContentLoaded', loadProfile);
