/* Life Link application shell: shared layout composition without changing APIs. */
(function () {
    const page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index';
    const pageMeta = {
        index: { family: 'command', crumb: 'Command centre' },
        donors: { family: 'directory', crumb: 'People / Donors' },
        donor_health: { family: 'clinical', crumb: 'Clinical / Screening' },
        donations: { family: 'clinical', crumb: 'Clinical / Donations' },
        stock: { family: 'inventory', crumb: 'Inventory / Stock' },
        requests: { family: 'triage', crumb: 'Operations / Requests' },
        hospitals: { family: 'directory', crumb: 'Network / Hospitals' },
        reports: { family: 'analysis', crumb: 'Insights / Reports' },
        profile: { family: 'account', crumb: 'Account / Profile' },
        notifications: { family: 'feed', crumb: 'Updates / Notifications' },
        settings: { family: 'account', crumb: 'Account / Settings' }
    };

    function addClass(element, ...names) {
        if (element) element.classList.add(...names);
    }

    function iconifyBrand() {
        const logo = document.querySelector('.sidebar-logo');
        if (!logo) return;
        logo.innerHTML = '<i class="fas fa-heart-pulse" aria-hidden="true"></i>';
        logo.setAttribute('aria-label', 'Life Link');
    }

    function organiseNavigation() {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav || nav.dataset.organised) return;
        nav.dataset.organised = 'true';
        nav.setAttribute('aria-label', 'Primary navigation');
        const anchors = [...nav.querySelectorAll('.sidebar-nav-link:not(.logout-link)')];
        const after = { 'donors.html': 'Clinical workflow', 'stock.html': 'Operations', 'reports.html': 'System' };
        anchors.forEach((anchor) => {
            const file = (anchor.getAttribute('href') || '').split('/').pop();
            if (!after[file]) return;
            const label = document.createElement('li');
            label.className = 'sidebar-section-label';
            label.textContent = after[file];
            anchor.closest('li').before(label);
        });
    }

    function composeTopbar(meta) {
        const topbar = document.querySelector('.sidebar-top-nav');
        if (!topbar) return;
        const greeting = document.getElementById('userGreeting');
        topbar.innerHTML = '<div class="topbar-content"><p class="topbar-breadcrumb">' + meta.crumb + '</p></div>';
        if (greeting) topbar.querySelector('.topbar-content').append(greeting);
    }

    function composeWorkspace(meta) {
        const container = document.querySelector('.main-content-with-sidebar > .container');
        if (!container) return;
        addClass(document.body, 'app-page', 'page-' + page, 'workflow-' + meta.family);
        addClass(container, 'app-workspace', 'workspace-' + meta.family);

        const header = container.querySelector('.page-header');
        if (header) {
            addClass(header, 'workspace-header');
            const title = header.querySelector('.page-title');
            if (title && !header.querySelector('.page-eyebrow')) {
                const eyebrow = document.createElement('p');
                eyebrow.className = 'page-eyebrow';
                eyebrow.textContent = meta.crumb;
                title.before(eyebrow);
            }
        }

        const cards = [...container.children].filter((child) => child.classList && child.classList.contains('card'));
        cards.forEach((card) => {
            const hasTable = !!card.querySelector('table');
            const hasControls = !!card.querySelector('select, #searchInput');
            if (hasTable) addClass(card, 'workspace-data-card');
            else if (hasControls) addClass(card, 'workspace-toolbar');
            else addClass(card, 'workspace-panel');
            const cardHeader = card.querySelector('.card-header');
            if (cardHeader) addClass(cardHeader, 'workspace-card-header');
        });

        container.querySelectorAll('.modal-content').forEach((modal) => addClass(modal, 'll-modal-content'));
        container.querySelectorAll('.table-container').forEach((table) => addClass(table, 'll-table-scroll'));

        const primaryButton = container.querySelector('.workspace-toolbar .btn-primary, .workspace-header .btn-primary');
        if (primaryButton) addClass(primaryButton, 'workspace-primary-action');

        // Inventory and request triage need persistent controls beside the work queue,
        // not another full-width card above a table.
        if (['inventory', 'triage'].includes(meta.family)) {
            const toolbar = container.querySelector('.workspace-toolbar');
            const dataCard = container.querySelector('.workspace-data-card');
            if (toolbar && dataCard && !container.querySelector('.workspace-layout')) {
                const layout = document.createElement('div');
                layout.className = 'workspace-layout';
                toolbar.before(layout);
                layout.append(toolbar, dataCard);
                const note = document.createElement('p');
                note.className = 'workspace-rail-note';
                note.innerHTML = meta.family === 'inventory'
                    ? '<i class="fas fa-circle-info" aria-hidden="true"></i> Filter across blood group, component, and blood bank. Select a column heading to sort the queue.'
                    : '<i class="fas fa-circle-info" aria-hidden="true"></i> Start with urgency and status, then open the request action only when it is ready to process.';
                toolbar.append(note);
            }
        }

        if (meta.family === 'clinical' && header && !header.querySelector('.workflow-steps')) {
            const steps = document.createElement('ol');
            steps.className = 'workflow-steps';
            steps.innerHTML = page === 'donations'
                ? '<li>Choose donor</li><li>Confirm screening</li><li>Record component</li>'
                : '<li>Select donor</li><li>Capture screening</li><li>Record outcome</li>';
            header.append(steps);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const meta = pageMeta[page];
        if (!meta) return;
        iconifyBrand();
        organiseNavigation();
        composeTopbar(meta);
        composeWorkspace(meta);
    });
}());
