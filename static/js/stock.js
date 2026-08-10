// relative origin — works for both local dev and production
const API_URL = '';

let allStock = [];
let allBanks = [];
let currentSortColumn = null;
let currentSortOrder  = 'asc';

// ── Load blood banks for the filter dropdown ──────────────────────────────────
async function loadBloodBanks() {
    try {
        const response = await fetch(`${API_URL}/blood_banks`);
        if (!response.ok) throw new Error('Failed to load blood banks');
        allBanks = await response.json();

        const filterBank = document.getElementById('filterBank');
        if (!filterBank) return;

        allBanks.forEach(bank => {
            const option = document.createElement('option');
            option.value       = bank.bank_id;
            option.textContent = `${bank.bank_name} - ${bank.location}`;
            filterBank.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading blood banks:', error);
    }
}

// ── Load stock from backend with optional filters ─────────────────────────────
async function loadStock(bloodGroup = '', bankId = '', componentType = '') {
    try {
        const params = new URLSearchParams();
        if (bloodGroup)     params.append('blood_group',    bloodGroup);
        if (bankId)         params.append('bank_id',        bankId);
        if (componentType)  params.append('component_type', componentType);

        const url = params.toString()
            ? `${API_URL}/stock?${params.toString()}`
            : `${API_URL}/stock`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error ${response.status}`);
        }

        allStock = await response.json();
        displayStockTable(allStock);

    } catch (error) {
        console.error('Error loading stock:', error);
        showAlert(`Error loading stock data: ${error.message}`, 'error');
        // Show empty state in table rather than leaving spinner
        const tableBody = document.getElementById('stockTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; color:var(--text-muted); padding:3rem;">
                        <div style="font-size:2rem; margin-bottom:0.5rem;">⚠️</div>
                        <div>Could not load stock data. Please try again.</div>
                        <div style="font-size:0.85rem; margin-top:0.5rem; opacity:0.7;">${error.message}</div>
                    </td>
                </tr>`;
        }
    }
}

// ── Render the stock table ────────────────────────────────────────────────────
function displayStockTable(stock) {
    const tableBody = document.getElementById('stockTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!stock || stock.length === 0) {
        // Check what filters are active to give a helpful empty message
        const bloodGroup    = document.getElementById('filterBloodGroup')?.value || '';
        const component     = document.getElementById('filterComponent')?.value  || '';

        let emptyMsg = 'No stock records found';
        if (bloodGroup && component) {
            emptyMsg = `No ${bloodGroup} ${component} in stock across any blood bank.`;
        } else if (bloodGroup) {
            emptyMsg = `No ${bloodGroup} blood in stock. Try a different blood group or check component filters.`;
        } else if (component) {
            emptyMsg = `No ${component} in stock. Try a different component type.`;
        }

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:var(--text-muted); padding:3rem;">
                    <div style="font-size:3rem; margin-bottom:1rem;">📦</div>
                    <div style="font-size:1.1rem; font-weight:600;">${emptyMsg}</div>
                </td>
            </tr>`;
        return;
    }

    stock.forEach(item => {
        const row = document.createElement('tr');

        let statusBadge;
        if (item.status === 'Low') {
            statusBadge = '<span class="badge badge-warning">⚠ Low</span>';
        } else if (item.status === 'Out of Stock') {
            statusBadge = '<span class="badge badge-danger">✗ Out of Stock</span>';
        } else {
            statusBadge = '<span class="badge badge-success">✓ Available</span>';
        }

        // Component badge coloring
        const componentColors = {
            'Whole Blood': '#C0392B',
            'RBC':         '#922B21',
            'Platelets':   '#E67E22',
            'Plasma':      '#2980B9',
        };
        const compColor = componentColors[item.component_type] || '#555';
        const componentBadge = `<span style="
            background:${compColor}18; color:${compColor};
            border:1px solid ${compColor}44;
            border-radius:4px; padding:2px 8px;
            font-size:0.82rem; font-weight:600;">
            ${item.component_type || 'Whole Blood'}
        </span>`;

        row.innerHTML = `
            <td>#${item.stock_id}</td>
            <td style="font-weight:600;">${item.bank_name}</td>
            <td>${item.location || 'N/A'}</td>
            <td><span class="blood-type blood-type-small">${item.blood_group}</span></td>
            <td>${componentBadge}</td>
            <td style="font-weight:600; font-size:1.1rem;">${item.quantity_units} units</td>
            <td>${statusBadge}</td>`;

        tableBody.appendChild(row);
    });
}

// ── Sort table ────────────────────────────────────────────────────────────────
function sortTable(column, order = 'asc') {
    const sorted = [...allStock].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        if (['quantity_units', 'stock_id', 'bank_id'].includes(column)) {
            aVal = Number(aVal) || 0;
            bVal = Number(bVal) || 0;
        } else {
            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
        }
        if (order === 'asc') return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    });
    displayStockTable(sorted);
}

// ── Wire up column header sorting ─────────────────────────────────────────────
function initTableSorting() {
    const headers = document.querySelectorAll('.table thead th');
    // 7 columns now: stock_id, bank_name, location, blood_group, component_type, quantity_units, status
    const sortableColumns = ['stock_id', 'bank_name', 'location', 'blood_group', 'component_type', 'quantity_units', 'status'];

    headers.forEach((header, index) => {
        if (index >= sortableColumns.length) return;
        header.style.cursor     = 'pointer';
        header.style.userSelect = 'none';
        header.title            = 'Click to sort';

        const sortIcon = document.createElement('span');
        sortIcon.style.marginLeft = '0.4rem';
        sortIcon.style.opacity    = '0.5';
        sortIcon.textContent      = '↕';
        header.appendChild(sortIcon);

        header.addEventListener('click', () => {
            const column = sortableColumns[index];
            if (currentSortColumn === column) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortColumn = column;
                currentSortOrder  = 'asc';
            }
            // Reset all icons
            headers.forEach(h => {
                const icon = h.querySelector('span');
                if (icon) { icon.textContent = '↕'; icon.style.opacity = '0.5'; }
            });
            sortIcon.textContent = currentSortOrder === 'asc' ? '↑' : '↓';
            sortIcon.style.opacity = '1';
            sortTable(column, currentSortOrder);
        });
    });
}

// ── Read all active filter values ─────────────────────────────────────────────
function getFilters() {
    return {
        bloodGroup:    document.getElementById('filterBloodGroup')?.value  || '',
        bankId:        document.getElementById('filterBank')?.value         || '',
        componentType: document.getElementById('filterComponent')?.value   || '',
    };
}

// ── Filter change handlers ────────────────────────────────────────────────────
function attachFilterListeners() {
    ['filterBloodGroup', 'filterBank', 'filterComponent'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            const { bloodGroup, bankId, componentType } = getFilters();
            loadStock(bloodGroup, bankId, componentType);
        });
    });
}

// ── Toast alert ───────────────────────────────────────────────────────────────
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    Object.assign(alertDiv.style, {
        position: 'fixed', top: '6rem', right: '2rem', zIndex: '9999',
        maxWidth: '380px', wordBreak: 'break-word',
    });
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    alertDiv.innerHTML = `<span>${icon}</span><span style="margin-left:0.5rem;">${message}</span>`;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.3s';
        alertDiv.style.opacity    = '0';
        setTimeout(() => alertDiv.remove(), 300);
    }, 4000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadBloodBanks();
    loadStock();
    attachFilterListeners();

    // Init sorting after first data load (small delay for DOM)
    setTimeout(initTableSorting, 600);

    // Auto-refresh every 30 seconds so stock stays live
    setInterval(() => {
        const { bloodGroup, bankId, componentType } = getFilters();
        loadStock(bloodGroup, bankId, componentType);
    }, 30000);
});