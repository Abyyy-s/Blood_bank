/* Life Link application shell + modern interaction layer. */
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

    function addClass(element, ...names) { if (element) element.classList.add(...names); }

    function loadModernUI() {
        if (document.querySelector('link[data-life-link-modern-ui]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/css/modern-ui.css?v=1';
        link.dataset.lifeLinkModernUi = 'true';
        document.head.appendChild(link);
    }

    function iconifyBrand() {
        const logo = document.querySelector('.sidebar-logo');
        if (!logo) return;
        logo.innerHTML = '<i class="fas fa-heart-pulse" aria-hidden="true"></i>';
        logo.setAttribute('aria-label', 'Life Link');
        const header = logo.closest('.sidebar-header');
        if (header && !header.querySelector('.sidebar-brand-row')) {
            const row = document.createElement('div');
            row.className = 'sidebar-brand-row';
            logo.before(row);
            row.append(logo);
            const title = header.querySelector('.sidebar-title');
            if (title) row.append(title);
            const sub = document.createElement('div');
            sub.className = 'sidebar-subtitle';
            sub.textContent = 'Blood operations';
            header.append(sub);
        }
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
        topbar.innerHTML = '<div class="topbar-content"><div class="topbar-context"><span class="topbar-context-dot"></span>' + meta.crumb + '</div></div>';
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
                    ? '<i class="fas fa-circle-info" aria-hidden="true"></i> Filter across blood group, component, and blood bank.'
                    : '<i class="fas fa-circle-info" aria-hidden="true"></i> Start with urgency and status, then process the request.';
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

    function setupMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar || document.querySelector('.ll-menu-toggle')) return;
        const button = document.createElement('button');
        button.className = 'll-menu-toggle';
        button.type = 'button';
        button.setAttribute('aria-label', 'Open navigation');
        button.innerHTML = '<i class="fas fa-bars"></i>';
        const backdrop = document.createElement('div');
        backdrop.className = 'll-sidebar-backdrop';
        document.body.append(button, backdrop);
        const close = () => { sidebar.classList.remove('ll-open'); document.body.classList.remove('ll-sidebar-open'); button.innerHTML = '<i class="fas fa-bars"></i>'; };
        button.addEventListener('click', () => {
            const open = sidebar.classList.toggle('ll-open');
            document.body.classList.toggle('ll-sidebar-open', open);
            button.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
        });
        backdrop.addEventListener('click', close);
        sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    }

    function setupRevealAnimations() {
        const container = document.querySelector('.app-workspace');
        if (!container) return;
        const candidates = container.querySelectorAll('.card, .stat-card, .page-header, .table-container, .alert, .grid > *, .stats-grid > *');
        candidates.forEach((el, i) => { if (!el.classList.contains('ll-reveal')) { el.classList.add('ll-reveal'); if (i < 4) el.style.setProperty('--ll-delay', `${i * 55}ms`); } });
        if (!('IntersectionObserver' in window)) { candidates.forEach(el => el.classList.add('ll-visible')); return; }
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('ll-visible'); obs.unobserve(entry.target); } });
        }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
        candidates.forEach(el => observer.observe(el));
    }

    function setupMicroInteractions() {
        document.querySelectorAll('.btn, .text-action, .sidebar-nav-link').forEach(el => {
            el.addEventListener('pointermove', (event) => {
                const r = el.getBoundingClientRect();
                el.style.setProperty('--mx', `${event.clientX - r.left}px`);
                el.style.setProperty('--my', `${event.clientY - r.top}px`);
            });
        });
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('pointermove', e => {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - .5;
                const y = (e.clientY - r.top) / r.height - .5;
                card.style.setProperty('transform', `translateY(-5px) perspective(900px) rotateX(${(-y * 1.2).toFixed(2)}deg) rotateY(${(x * 1.2).toFixed(2)}deg)`);
            });
            card.addEventListener('pointerleave', () => { card.style.removeProperty('transform'); });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadModernUI();
        const meta = pageMeta[page];
        if (!meta) return;
        iconifyBrand();
        organiseNavigation();
        composeTopbar(meta);
        composeWorkspace(meta);
        setupMobileSidebar();
        requestAnimationFrame(() => { setupRevealAnimations(); setupMicroInteractions(); });
    });
}());
