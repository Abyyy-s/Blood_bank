const API_URL = '';

// Load user profile data on page load
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/api/profile`);
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data = await response.json();
        document.getElementById('email').value = data.email || '';
        document.getElementById('fullName').value = data.name || data.contact_person_name || '';
        document.getElementById('contact').value = data.contact_number || '';
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Failed to load profile data', 'error');
    }
}

// Update account information
async function updateAccount() {
    const fullName = document.getElementById('fullName').value.trim();
    const contact = document.getElementById('contact').value.trim();

    if (!fullName || !contact) {
        showAlert('Please fill in all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/profile/update`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fullName,
                contact_number: contact
            })
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Account settings saved successfully!', 'success');
        } else {
            showAlert(result.error || 'Failed to update account', 'error');
        }
    } catch (error) {
        console.error('Error updating account:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Change password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('New password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/profile/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Password changed successfully!', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showAlert(result.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Update notification preferences
async function updateNotifications() {
    const emailNotif = document.getElementById('emailNotif').checked;
    const systemAlerts = document.getElementById('systemAlerts').checked;
    const stockAlerts = document.getElementById('stockAlerts').checked;

    try {
        const response = await fetch(`${API_URL}/api/profile/notification-preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email_notifications: emailNotif,
                system_alerts: systemAlerts,
                stock_alerts: stockAlerts
            })
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Notification preferences updated successfully!', 'success');
        } else {
            showAlert(result.error || 'Failed to update preferences', 'error');
        }
    } catch (error) {
        console.error('Error updating preferences:', error);
        showAlert('Network error. Please try again.', 'error');
    }
}

// Show alert toast
function showAlert(message, type = 'info') {
    document.querySelectorAll('.toast-alert').forEach(a => a.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'warning' ? 'warning' : type} toast-alert`;
    Object.assign(alertDiv.style, {
        position: 'fixed',
        top: '6rem',
        right: '2rem',
        zIndex: '9999',
        maxWidth: '400px',
        wordBreak: 'break-word',
    });
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ';
    alertDiv.innerHTML = `
        <span style="font-size:1.1rem;">${icon}</span>
        <span style="margin-left:0.5rem;">${message}</span>`;
    document.body.appendChild(alertDiv);

    const duration = type === 'warning' ? 6000 : 3500;
    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.3s';
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, duration);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadUserProfile);
