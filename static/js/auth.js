// create global loader element
function createGlobalLoader() {
    if (document.getElementById('globalLoader')) return;
    const div = document.createElement('div');
    div.id = 'globalLoader';
    div.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(div);
}

function showLoader() {
    const el = document.getElementById('globalLoader');
    if (el) el.style.display = 'flex';
}
function hideLoader() {
    const el = document.getElementById('globalLoader');
    if (el) el.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', createGlobalLoader);

// global fetch interceptor to redirect on 401 and show loader
const _origFetch = window.fetch;
window.fetch = async (...args) => {
    // ensure cookies/session are sent with each request
    if (args.length >= 2) {
        args[1].credentials = args[1].credentials || 'same-origin';
    } else {
        args[1] = { credentials: 'same-origin' };
    }
    showLoader();
    try {
        const resp = await _origFetch(...args);
        if (resp.status === 401) {
            window.location.href = '/login';
        }
        return resp;
    } finally {
        hideLoader();
    }
};

async function checkAuth(requiredRoles) {
    try {
        const res = await fetch('/api/me');
        if (!res.ok) {
            window.location.href = '/login';
            return null;
        }
        const user = await res.json();
        // greet user
        const greetEl = document.getElementById('userGreeting');
        if (greetEl) greetEl.textContent = `Hello, ${user.name}`;
        adjustNav(user.role);
        if (requiredRoles && !requiredRoles.includes(user.role)) {
            // redirect user to their own dashboard if they hit wrong page
            window.location.href = `/${user.role.toLowerCase()}-dashboard`;
            return null;
        }
        return user;
    } catch (err) {
        window.location.href = '/login';
    }
}

function adjustNav(role) {
    const mapping = {
        Admin: ['/static/index.html', '/static/profile.html', '/static/donors.html', '/static/donor_health.html', '/static/donations.html', '/static/stock.html', '/static/requests.html', '/static/hospitals.html', '/static/reports.html'],
        Staff: ['/static/index.html', '/static/profile.html', '/static/donors.html', '/static/donor_health.html', '/static/donations.html', '/static/stock.html', '/static/requests.html', '/static/reports.html'],
        Hospital: ['/static/profile.html', '/static/requests.html']
    };
    const allowed = mapping[role] || [];
    // hide/show links for both top nav and sidebar
    document.querySelectorAll('.nav-link, .sidebar-nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (!allowed.some(a => href.endsWith(a.split('/').pop()))) {
            link.style.display = 'none';
        } else {
            link.style.display = '';
        }
    });
}
