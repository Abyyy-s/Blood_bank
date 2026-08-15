const API_URL = '';
let allStock = [];
let allBanks = [];
let currentSortColumn = null;
let currentSortOrder = 'asc';

async function loadBloodBanks() {
    try {
        const response = await fetch(`${API_URL}/blood_banks`);
        if (!response.ok) throw new Error('Failed to load blood banks');
        allBanks = await response.json();
        const filterBank = document.getElementById('filterBank');
        if (!filterBank) return;
        allBanks.forEach(bank => {
            const option = document.createElement('option');
            option.value = bank.bank_id;
            option.textContent = `${bank.bank_name} — ${bank.location}`;
            filterBank.appendChild(option);
        });
    } catch (error) { console.error('Error loading blood banks:', error); }
}

async function loadStock(bloodGroup = '', bankId = '', componentType = '') {
    try {
        const params = new URLSearchParams();
        if (bloodGroup) params.append('blood_group', bloodGroup);
        if (bankId) params.append('bank_id', bankId);
        if (componentType) params.append('component_type', componentType);
        const response = await fetch(params.toString() ? `${API_URL}/stock?${params}` : `${API_URL}/stock`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error ${response.status}`);
        }
        allStock = await response.json();
        renderStockSummary(allStock);
        displayStockTable(allStock);
    } catch (error) {
        console.error('Error loading stock:', error);
        showAlert(`Error loading stock data: ${error.message}`, 'error');
        const tableBody = document.getElementById('stockTableBody');
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="6"><div class="op-empty"><i class="fas fa-triangle-exclamation"></i><strong>Could not load inventory.</strong><br>${error.message}</div></td></tr>`;
    }
}

function renderStockSummary(stock) {
    const total = stock.reduce((sum, item) => sum + (Number(item.quantity_units) || 0), 0);
    const available = stock.filter(item => item.status === 'Available').reduce((sum, item) => sum + (Number(item.quantity_units) || 0), 0);
    const low = stock.filter(item => item.status === 'Low').length;
    const empty = stock.filter(item => item.status === 'Out of Stock' || Number(item.quantity_units) === 0).length;
    const summary = document.getElementById('stockSummary');
    if (summary) {
        const values = summary.querySelectorAll('.op-metric-value');
        [total, available, low, empty].forEach((value, i) => { if (values[i]) values[i].textContent = value.toLocaleString('en-IN'); });
    }
    const health = document.querySelectorAll('#stockHealthPanel .op-badge');
    if (health.length >= 3) { health[0].textContent = `${available} units`; health[1].textContent = `${low} rows`; health[2].textContent = `${empty} rows`; }
}

function displayStockTable(stock) {
    const tableBody = document.getElementById('stockTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!stock || stock.length === 0) {
        const bloodGroup = document.getElementById('filterBloodGroup')?.value || '';
        const component = document.getElementById('filterComponent')?.value || '';
        const label = bloodGroup && component ? `No ${bloodGroup} ${component} inventory found.` : bloodGroup ? `No ${bloodGroup} inventory found.` : component ? `No ${component} inventory found.` : 'No inventory records found.';
        tableBody.innerHTML = `<tr><td colspan="6"><div class="op-empty"><i class="fas fa-box-open"></i><strong>${label}</strong><br>Try changing the filters.</div></td></tr>`;
        return;
    }
    stock.forEach(item => {
        const row = document.createElement('tr');
        const status = item.status === 'Low'
            ? '<span class="op-badge op-badge-warn"><i class="fas fa-triangle-exclamation"></i> Low</span>'
            : item.status === 'Out of Stock'
            ? '<span class="op-badge op-badge-danger"><i class="fas fa-xmark"></i> Empty</span>'
            : '<span class="op-badge op-badge-good"><i class="fas fa-check"></i> Available</span>';
        const component = item.component_type || 'Whole Blood';
        row.innerHTML = `<td><span class="op-id">#${item.stock_id}</span></td><td><span class="op-name">${item.bank_name}</span><br><span style="color:var(--op-muted);font-size:.68rem">${item.location || 'N/A'}</span></td><td><span class="op-blood">${item.blood_group}</span></td><td><span class="op-badge op-badge-blue">${component}</span></td><td><span class="op-qty">${Number(item.quantity_units).toLocaleString('en-IN')}</span> <span style="color:var(--op-muted);font-size:.68rem">units</span></td><td>${status}</td>`;
        tableBody.appendChild(row);
    });
}

function sortTable(column, order = 'asc') {
    const sorted = [...allStock].sort((a, b) => {
        let aVal = a[column], bVal = b[column];
        if (['quantity_units', 'stock_id', 'bank_id'].includes(column)) { aVal = Number(aVal) || 0; bVal = Number(bVal) || 0; }
        else { aVal = String(aVal || '').toLowerCase(); bVal = String(bVal || '').toLowerCase(); }
        return order === 'asc' ? (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) : (aVal < bVal ? 1 : aVal > bVal ? -1 : 0);
    });
    displayStockTable(sorted);
}

function initTableSorting() {
    const headers = document.querySelectorAll('.op-table thead th');
    const sortableColumns = ['stock_id', 'bank_name', 'blood_group', 'component_type', 'quantity_units', 'status'];
    headers.forEach((header, index) => {
        header.title = 'Click to sort';
        header.style.cursor = 'pointer';
        const icon = document.createElement('span');
        icon.textContent = ' ↕'; icon.style.opacity = '.45';
        header.appendChild(icon);
        header.addEventListener('click', () => {
            const column = sortableColumns[index];
            currentSortOrder = currentSortColumn === column && currentSortOrder === 'asc' ? 'desc' : 'asc';
            currentSortColumn = column;
            headers.forEach(h => { const i = h.querySelector('span'); if (i) { i.textContent = ' ↕'; i.style.opacity = '.45'; } });
            icon.textContent = currentSortOrder === 'asc' ? ' ↑' : ' ↓'; icon.style.opacity = '1';
            sortTable(column, currentSortOrder);
        });
    });
}

function getFilters() { return { bloodGroup: document.getElementById('filterBloodGroup')?.value || '', bankId: document.getElementById('filterBank')?.value || '', componentType: document.getElementById('filterComponent')?.value || '' }; }
function attachFilterListeners() { ['filterBloodGroup', 'filterBank', 'filterComponent'].forEach(id => document.getElementById(id)?.addEventListener('change', () => { const f = getFilters(); loadStock(f.bloodGroup, f.bankId, f.componentType); })); }
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div'); alertDiv.className = `alert alert-${type}`;
    Object.assign(alertDiv.style, { position:'fixed', top:'6rem', right:'2rem', zIndex:'9999', maxWidth:'380px', wordBreak:'break-word' });
    alertDiv.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span><span style="margin-left:.5rem">${message}</span>`;
    document.body.appendChild(alertDiv); setTimeout(() => { alertDiv.style.transition='opacity .3s'; alertDiv.style.opacity='0'; setTimeout(() => alertDiv.remove(),300); },4000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadBloodBanks(); loadStock(); attachFilterListeners(); setTimeout(initTableSorting, 600);
    setInterval(() => { const f = getFilters(); loadStock(f.bloodGroup, f.bankId, f.componentType); }, 30000);
});
