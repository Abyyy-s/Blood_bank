/* Shared sidebar helpers. Role authorization lives in app-shell/auth; this file only handles state and badges. */
function initTailbarNavigation() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        const href = link.getAttribute('href') || '';
        const pageName = href.split('/').pop().replace('.html', '');
        if (pageName && pageName === currentPage) link.classList.add('active');
        else link.classList.remove('active');
    });
}

async function loadNotificationBadge() {
    try {
        const response = await fetch('/notifications');
        if (!response.ok) return;
        const notes = await response.json();
        updateNotificationBadge(Array.isArray(notes) ? notes.filter(n => !n.is_read).length : 0);
    } catch (error) {
        console.debug('Notification badge unavailable');
    }
}

function updateNotificationBadge(count) {
    const bellIcon = document.querySelector('a[href*="notifications"] .sidebar-nav-icon');
    if (!bellIcon) return;
    let badge = document.getElementById('notifBadge');
    if (!count) { badge?.remove(); return; }
    if (!badge) {
        badge = document.createElement('span');
        badge.id = 'notifBadge';
        badge.className = 'll-notification-badge';
        bellIcon.appendChild(badge);
    }
    badge.textContent = count > 9 ? '9+' : String(count);
}

window.lifeLinkUpdateNotificationBadge = updateNotificationBadge;

document.addEventListener('DOMContentLoaded', () => {
    initTailbarNavigation();
    loadNotificationBadge();
});
