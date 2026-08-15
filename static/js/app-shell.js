/* Life Link application shell: shared layout composition without changing APIs. */
(function () {
    const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
    const pageMeta = {
        index: { family: 'command', crumb: 'Command centre' }, donors: { family: 'directory', crumb: 'People / Donors' }, donor_health: { family: 'clinical', crumb: 'Clinical / Screening' }, donations: { family: 'clinical', crumb: 'Clinical / Donations' }, stock: { family: 'inventory', crumb: 'Inventory / Stock' }, requests: { family: 'triage', crumb: 'Operations / Requests' }, hospitals: { family: 'directory', crumb: 'Network / Hospitals' }, reports: { family: 'analysis', crumb: 'Insights / Reports' }, profile: { family: 'account', crumb: 'Account / Profile' }, notifications: { family: 'feed', crumb: 'Updates / Notifications' }, settings: { family: 'account', crumb: 'Account / Settings' }
    };
    function addClass(element, ...names) { if (element) element.classList.add(...names); }
    function iconifyBrand() { const logo = document.querySelector('.sidebar-logo'); if (!logo) return; logo.innerHTML = '<i class="fas fa-heart-pulse" aria-hidden="true"></i>'; logo.setAttribute('aria-label', 'Life Link'); }
    function organiseNavigation() {
        const nav = document.querySelector('.sidebar-nav'); if (!nav || nav.dataset.organised) return;
        nav.dataset.organised = 'true'; nav.setAttribute('aria-label', 'Primary navigation');
        const anchors = [...nav.querySelectorAll('.sidebar-nav-link:not(.logout-link)')];
        const after = { 'donors.html': 'Clinical workflow', 'stock.html': 'Operations', 'reports.html': 'System' };
        anchors.forEach(anchor => { const file = (anchor.getAttribute('href') || '').split('/').pop(); if (!after[file]) return; const label = document.createElement('li'); label.className = 'sidebar-section-label'; label.textContent = after[file]; anchor.closest('li').before(label); });
    }
    function composeTopbar(meta) {
        const topbar = document.querySelector('.sidebar-top-nav'); if (!topbar) return;
        const greeting = document.getElementById('userGreeting');
        topbar.innerHTML = '<div class="topbar-content"><div class="topbar-context"><span class="topbar-context-dot"></span><span>' + meta.crumb + '</span></div></div>';
        if (greeting) topbar.querySelector('.topbar-content').append(greeting);
    }
    function composeWorkspace(meta) {
        const container = document.querySelector('.main-content-with-sidebar > .container'); if (!container) return;
        addClass(document.body, 'app-page', 'page-' + page, 'workflow-' + meta.family); addClass(container, 'app-workspace', 'workspace-' + meta.family);
        const header = container.querySelector('.page-header');
        if (header) { addClass(header, 'workspace-header'); const title = header.querySelector('.page-title'); if (title && !header.querySelector('.page-eyebrow')) { const eyebrow = document.createElement('p'); eyebrow.className = 'page-eyebrow'; eyebrow.textContent = meta.crumb; title.before(eyebrow); } }
        const cards = [...container.children].filter(child => child.classList && child.classList.contains('card'));
        cards.forEach(card => { const hasTable = !!card.querySelector('table'); const hasControls = !!card.querySelector('select, #searchInput'); if (hasTable) addClass(card, 'workspace-data-card'); else if (hasControls) addClass(card, 'workspace-toolbar'); else addClass(card, 'workspace-panel'); const cardHeader = card.querySelector('.card-header'); if (cardHeader) addClass(cardHeader, 'workspace-card-header'); });
        container.querySelectorAll('.modal-content').forEach(modal => addClass(modal, 'll-modal-content')); container.querySelectorAll('.table-container').forEach(table => addClass(table, 'll-table-scroll'));
        const primaryButton = container.querySelector('.workspace-toolbar .btn-primary, .workspace-header .btn-primary'); if (primaryButton) addClass(primaryButton, 'workspace-primary-action');
        if (['inventory', 'triage'].includes(meta.family)) {
            const toolbar = container.querySelector('.workspace-toolbar'); const dataCard = container.querySelector('.workspace-data-card');
            if (toolbar && dataCard && !container.querySelector('.workspace-layout')) { const layout = document.createElement('div'); layout.className = 'workspace-layout'; toolbar.before(layout); layout.append(toolbar, dataCard); const note = document.createElement('p'); note.className = 'workspace-rail-note'; note.innerHTML = meta.family === 'inventory' ? '<i class="fas fa-circle-info" aria-hidden="true"></i> Filter across blood group, component, and blood bank. Select a column heading to sort the queue.' : '<i class="fas fa-circle-info" aria-hidden="true"></i> Start with urgency and status, then open the request action only when it is ready to process.'; toolbar.append(note); }
        }
        if (meta.family === 'clinical' && header && !header.querySelector('.workflow-steps')) { const steps = document.createElement('ol'); steps.className = 'workflow-steps'; steps.innerHTML = page === 'donations' ? '<li>Choose donor</li><li>Confirm screening</li><li>Record component</li>' : '<li>Select donor</li><li>Capture screening</li><li>Record outcome</li>'; header.append(steps); }
    }
    function installMobileNavigation() {
        if (document.querySelector('.ll-menu-toggle')) return; const sidebar = document.querySelector('.sidebar'); if (!sidebar) return;
        const backdrop = document.createElement('div'); backdrop.className = 'll-sidebar-backdrop'; backdrop.setAttribute('aria-hidden', 'true');
        const button = document.createElement('button'); button.className = 'll-menu-toggle'; button.type = 'button'; button.setAttribute('aria-label', 'Open navigation'); button.setAttribute('aria-expanded', 'false'); button.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
        const close = () => { sidebar.classList.remove('ll-open'); document.body.classList.remove('ll-sidebar-open'); button.setAttribute('aria-expanded', 'false'); button.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>'; };
        const open = () => { sidebar.classList.add('ll-open'); document.body.classList.add('ll-sidebar-open'); button.setAttribute('aria-expanded', 'true'); button.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>'; };
        button.addEventListener('click', () => sidebar.classList.contains('ll-open') ? close() : open()); backdrop.addEventListener('click', close); sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close)); document.body.append(backdrop, button);
    }
    function loadMotionLayer() {
        if (document.querySelector('script[data-life-link-motion]')) return;
        const script = document.createElement('script'); script.src = '/static/js/modern-motion.js?v=1'; script.dataset.lifeLinkMotion = 'true'; script.async = false; document.body.appendChild(script);
    }
    document.addEventListener('DOMContentLoaded', () => { const meta = pageMeta[page]; if (!meta) return; iconifyBrand(); organiseNavigation(); composeTopbar(meta); composeWorkspace(meta); installMobileNavigation(); loadMotionLayer(); });
}());
