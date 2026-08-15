/* Contextual UX enhancements for Life Link's operational pages. */
(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function markStatusCells() {
        const map = {
            'available': 'status-available',
            'low': 'status-low',
            'critical': 'status-critical',
            'fulfilled': 'status-fulfilled',
            'pending': 'status-pending',
            'approved': 'status-approved',
            'rejected': 'status-rejected',
            'eligible': 'status-available',
            'not eligible': 'status-critical',
            'active': 'status-available',
            'inactive': 'status-muted'
        };
        document.querySelectorAll('.table tbody td, .badge, .status-badge').forEach(cell => {
            const text = cell.textContent.trim().toLowerCase();
            const key = Object.keys(map).find(k => text === k || text.includes(k));
            if (key) cell.classList.add('ll-status', map[key]);
        });
    }

    function decorateDataRows() {
        document.querySelectorAll('.table tbody tr').forEach((row, index) => {
            if (row.querySelector('.spinner')) return;
            row.style.setProperty('--row-index', index);
            row.classList.add('ll-data-row');
        });
    }

    function animateStats() {
        if (reduceMotion) return;
        document.querySelectorAll('.stat-value').forEach(el => {
            if (el.dataset.countAnimated) return;
            const raw = el.textContent.trim();
            if (!/^\d+$/.test(raw)) return;
            const target = Number(raw);
            if (target > 10000) return;
            el.dataset.countAnimated = 'true';
            el.textContent = '0';
            const start = performance.now();
            const duration = 700;
            const tick = now => {
                const p = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = String(Math.round(target * eased));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    }

    function addTableEmptyState() {
        document.querySelectorAll('.table tbody').forEach(tbody => {
            const rows = [...tbody.children];
            if (!rows.length || rows.some(row => row.querySelector('.spinner'))) return;
            if (rows.some(row => !row.textContent.trim())) return;
        });
    }

    function quickActions() {
        const modal = document.createElement('div');
        modal.className = 'll-command-palette';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="ll-command-backdrop"></div>
            <div class="ll-command-panel">
                <div class="ll-command-head">
                    <div><span class="section-kicker">Life Link</span><h2>Quick actions</h2></div>
                    <button type="button" class="modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="ll-command-list">
                    <a href="/static/donors.html"><i class="fas fa-user-plus"></i><span><strong>Register donor</strong><small>Add a new donor record</small></span><kbd>D</kbd></a>
                    <a href="/static/donations.html"><i class="fas fa-droplet"></i><span><strong>Record donation</strong><small>Add a donation to inventory</small></span><kbd>N</kbd></a>
                    <a href="/static/requests.html"><i class="fas fa-clipboard-list"></i><span><strong>Review requests</strong><small>Process hospital requests</small></span><kbd>R</kbd></a>
                    <a href="/static/stock.html"><i class="fas fa-boxes-stacked"></i><span><strong>Open inventory</strong><small>Check blood stock</small></span><kbd>S</kbd></a>
                </div>
            </div>`;
        document.body.appendChild(modal);
        const close = () => modal.remove();
        modal.querySelector('.modal-close').addEventListener('click', close);
        modal.querySelector('.ll-command-backdrop').addEventListener('click', close);
        document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
        requestAnimationFrame(() => modal.classList.add('ll-command-open'));
    }

    function bindShortcuts() {
        document.addEventListener('keydown', event => {
            const meta = event.ctrlKey || event.metaKey;
            if (meta && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                quickActions();
            }
        });
        document.addEventListener('lifelink:quick-actions', quickActions);
    }

    function watchDynamicContent() {
        const root = document.querySelector('.app-workspace') || document.body;
        const observer = new MutationObserver(() => {
            markStatusCells();
            decorateDataRows();
            animateStats();
        });
        observer.observe(root, { childList: true, subtree: true });
    }

    document.addEventListener('DOMContentLoaded', () => {
        markStatusCells();
        decorateDataRows();
        animateStats();
        addTableEmptyState();
        bindShortcuts();
        watchDynamicContent();
    });
}());
