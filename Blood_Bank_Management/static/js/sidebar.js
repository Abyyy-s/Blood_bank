// Initialize sidebar navigation
function initTailbarNavigation() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.sidebar-nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPage.includes(href.replace('/static/', '').replace('.html', ''))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Load user info into sidebar
async function loadUserToSidebar() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) return;
        
        const user = await response.json();
        // User info is now in the top greeting area only
    } catch (error) {
        console.log('Could not load user info to sidebar');
    }
}

// Hide/show nav items based on user role
function filterSidebarByRole(role) {
    const mapping = {
        Admin: ['index.html', 'profile', 'donors', 'donor_health', 'donations', 'stock', 'requests', 'hospitals', 'reports'],
        Staff: ['index.html', 'profile', 'donors', 'donor_health', 'donations', 'stock', 'requests', 'reports'],
        Hospital: ['profile', 'requests']
    };
    
    const allowed = mapping[role] || [];
    const navLinks = document.querySelectorAll('.sidebar-nav-link');
    
    navLinks.forEach(link => {
        // Always show logout link regardless of role
        if (link.classList.contains('logout-link')) {
            link.style.display = '';
            return;
        }
        
        const href = link.getAttribute('href');
        const isAllowed = allowed.some(item => href.includes(item));
        link.style.display = isAllowed ? '' : 'none';
    });
}

// Get current user and filter navigation
async function setupSidebarNavigation() {
    try {
        const response = await fetch('/api/me');
        if (!response.ok) return;
        
        const user = await response.json();
        filterSidebarByRole(user.role);
        loadUserToSidebar();
        initTailbarNavigation();
        loadNotificationBadge(); // Load notification badge on all pages
    } catch (error) {
        console.log('Could not setup sidebar navigation');
    }
}

// Load and update notification badge
async function loadNotificationBadge() {
    try {
        const response = await fetch('/notifications');
        if (!response.ok) return;
        
        const notes = await response.json();
        const unreadCount = notes.filter(n => !n.is_read).length;
        updateNotificationBadge(unreadCount);
    } catch (error) {
        console.log('Could not load notification badge');
    }
}

function updateNotificationBadge(count) {
    // Update bell icon badge in sidebar if it exists
    let badge = document.getElementById('notifBadge');
    const bellLink = document.querySelector('a[href*="notifications"] .sidebar-nav-icon');
    if (!bellLink) return;

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'notifBadge';
            Object.assign(badge.style, {
                background:   '#C0392B',
                color:        'white',
                borderRadius: '50%',
                fontSize:     '0.7rem',
                width:        '18px',
                height:       '18px',
                display:      'inline-flex',
                alignItems:   'center',
                justifyContent: 'center',
                marginLeft:   '4px',
            });
            bellLink.appendChild(badge);
        }
        badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) {
        badge.remove();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', setupSidebarNavigation);
