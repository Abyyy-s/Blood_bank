/* Life Link reporting workspace: uses existing operational APIs, no fake metrics. */
(function () {
    const sources = {
        dashboard: '/dashboard',
        donors: '/donors',
        donations: '/donations',
        stock: '/stock',
        hospitals: '/hospitals',
        screenings: '/donor_health',
        requests: '/requests'
    };

    const state = {};

    async function getJson(key, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${key} failed (${response.status})`);
        const data = await response.json();
        state[key] = data;
        return data;
    }

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function number(value) {
        return Number(value || 0).toLocaleString();
    }

    function buildSummary() {
        const dashboard = state.dashboard || {};
        const stock = Array.isArray(state.stock) ? state.stock : [];
        const donations = Array.isArray(state.donations) ? state.donations : [];
        const donors = Array.isArray(state.donors) ? state.donors : [];
        const hospitals = Array.isArray(state.hospitals) ? state.hospitals : [];
        const requests = Array.isArray(state.requests) ? state.requests : [];

        const stockUnits = stock.reduce((sum, row) => sum + Number(row.quantity_units || 0), 0);
        const pending = requests.filter(r => String(r.status || '').toLowerCase() === 'pending').length;

        setText('totalDonations', number(donations.length || dashboard.total_donations));
        setText('stockUnits', number(stockUnits));
        setText('activeRequests', number(pending || dashboard.pending_requests));
        setText('donorCount', number(donors.length || dashboard.total_donors));
        setText('hospitalCount', number(hospitals.length));
        setText('screeningCount', number((state.screenings || []).length));

        const byGroup = {};
        stock.forEach(row => {
            const group = row.blood_group || 'Unknown';
            byGroup[group] = (byGroup[group] || 0) + Number(row.quantity_units || 0);
        });
        const groups = Object.entries(byGroup).sort((a, b) => b[1] - a[1]);
        const list = document.getElementById('reportGroupList');
        if (list) {
            list.innerHTML = groups.length ? groups.map(([group, units], i) => `
                <div class="report-rank" style="--rank:${i + 1}">
                    <span class="report-rank-badge">${group}</span>
                    <span class="report-rank-name">${units.toLocaleString()} units</span>
                    <span class="report-rank-value">${Math.round((units / Math.max(stockUnits, 1)) * 100)}%</span>
                </div>`).join('') : '<div class="report-empty">No stock data available.</div>';
        }

        const latest = donations.slice().sort((a, b) => String(b.donation_date || '').localeCompare(String(a.donation_date || ''))).slice(0, 5);
        const timeline = document.getElementById('reportTimeline');
        if (timeline) {
            timeline.innerHTML = latest.length ? latest.map(item => `
                <div class="report-timeline-item">
                    <span class="report-timeline-dot"></span>
                    <div><strong>${item.donor_name || 'Donor'}</strong><span>${item.blood_group || '—'} · ${item.component_type || 'Whole Blood'} · ${item.quantity_units || 0} units</span></div>
                    <time>${item.donation_date || 'Date unavailable'}</time>
                </div>`).join('') : '<div class="report-empty">No donation history available.</div>';
        }
    }

    function csvEscape(value) {
        const text = value == null ? '' : String(value);
        return `"${text.replace(/"/g, '""')}"`;
    }

    function downloadCsv(filename, rows) {
        if (!rows.length) return showReportAlert('No data available for this report.', 'warning');
        const headers = Object.keys(rows[0]);
        const csv = [headers, ...rows.map(row => headers.map(h => row[h]))]
            .map(row => row.map(csvEscape).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        showReportAlert(`${filename} is ready.`, 'success');
    }

    function reportRows(kind) {
        if (kind === 'donations') return (state.donations || []).map(d => ({
            donation_id: d.donation_id, donor: d.donor_name, blood_group: d.blood_group,
            component: d.component_type, quantity_units: d.quantity_units,
            bank: d.bank_name, donation_date: d.donation_date, expiry_date: d.expiry_date
        }));
        if (kind === 'stock') return (state.stock || []).map(s => ({
            stock_id: s.stock_id, bank: s.bank_name, location: s.location,
            blood_group: s.blood_group, component: s.component_type,
            quantity_units: s.quantity_units, status: s.status
        }));
        if (kind === 'donors') return (state.donors || []).map(d => ({
            donor_id: d.donor_id, name: d.name, age: d.age, gender: d.gender,
            blood_group: d.blood_group, phone: d.phone, email: d.email, city: d.city
        }));
        return [{
            generated_at: new Date().toISOString(), donors: state.donors?.length || 0,
            donations: state.donations?.length || 0, stock_units: (state.stock || []).reduce((s, x) => s + Number(x.quantity_units || 0), 0),
            pending_requests: (state.requests || []).filter(r => String(r.status).toLowerCase() === 'pending').length,
            hospitals: state.hospitals?.length || 0, screenings: state.screenings?.length || 0
        }];
    }

    function showReportAlert(message, type) {
        if (typeof window.showAlert === 'function') return window.showAlert(message, type);
        const el = document.createElement('div');
        el.className = `alert alert-${type} report-toast`;
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    async function loadReports() {
        const status = document.getElementById('reportStatus');
        try {
            status && (status.textContent = 'Syncing live operational data…');
            await Promise.all(Object.entries(sources).map(([key, url]) => getJson(key, url).catch(() => { state[key] = []; })));
            buildSummary();
            status && (status.textContent = `Live data · refreshed ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error(error);
            status && (status.textContent = 'Some report sources could not be loaded.');
        }
    }

    window.generateDonationReport = () => downloadCsv('lifelink-donations.csv', reportRows('donations'));
    window.generateStockReport = () => downloadCsv('lifelink-stock.csv', reportRows('stock'));
    window.generateDonorReport = () => downloadCsv('lifelink-donors.csv', reportRows('donors'));
    window.generateMonthlyReport = () => downloadCsv('lifelink-summary.csv', reportRows('summary'));
    window.refreshReports = loadReports;

    document.addEventListener('DOMContentLoaded', loadReports);
}());
