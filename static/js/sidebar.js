// Life Link shared navigation + UI foundation
(function ensureRedesignStyles() {
    if (document.querySelector('link[data-lifelink-redesign]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/static/css/app-redesign.css?v=1';
    link.dataset.lifelinkRedesign = 'true';
    document.head.appendChild(link);
})();

function initTailbarNavigation() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const target = href.replace('/static/', '').replace('.html', '');
        if (target && currentPage.includes(target)) link.classList.add('active');
        else link.classList.remove('active');
    });
}

async function loadUserToSidebar() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) return;
        const user = await response.json();
        const greeting = document.getElementById('userGreeting');
        if (greeting) greeting.textContent = `${user.name || user.email || 'User'} · ${user.role || ''}`;
    } catch (error) {
        console.log('Could not load user info to sidebar');
    }
}

function filterSidebarByRole(role) {
    const mapping = {
        Admin: ['index.html', 'profile', 'donors', 'donor_health', 'donations', 'stock', 'requests', 'hospitals', 'reports', 'notifications'],
        Staff: ['index.html', 'profile', 'donors', 'donor_health', 'donations', 'stock', 'requests', 'reports', 'notifications'],
        Hospital: ['profile', 'requests', 'notifications']
    };
    const allowed = mapping[role] || [];
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        if (link.classList.contains('logout-link')) {
            link.style.display = '';
            return;
        }
        const href = link.getAttribute('href') || '';
        link.style.display = allowed.some(item => href.includes(item)) ? '' : 'none';
    });
}

async function setupSidebarNavigation() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) return;
        const user = await response.json();
        filterSidebarByRole(user.role);
        await loadUserToSidebar();
        initTailbarNavigation();
        loadNotificationBadge();
    } catch (error) {
        console.log('Could not setup sidebar navigation');
    }
}

async function loadNotificationBadge() {
    try {
        const response = await fetch('/notifications');
        if (!response.ok) return;
        const notes = await response.json();
        updateNotificationBadge(notes.filter(n => !n.is_read).length);
    } catch (error) {
        console.log('Could not load notification badge');
    }
}

function updateNotificationBadge(count) {
    let badge = document.getElementById('notifBadge');
    const bellLink = document.querySelector('a[href*="notifications"] .sidebar-nav-icon');
    if (!bellLink) return;
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'notifBadge';
            Object.assign(badge.style, {
                background:'#d51d3b', color:'white', borderRadius:'999px',
                fontSize:'.65rem', minWidth:'18px', height:'18px',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                marginLeft:'4px', padding:'0 4px'
            });
            bellLink.appendChild(badge);
        }
        badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) badge.remove();
}

document.addEventListener('DOMContentLoaded', setupSidebarNavigation);
