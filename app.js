// ============================================================
// INDO MANAGER — Game Logic
// ============================================================

const state = {
    money: 5000000,
    level: 1,
    reputation: 50,
    day: 1,
    income: 0,
    expense: 0,
    branches: [],
    employees: [],
    products: [],
    upgrades: [],
    logs: []
};

const PRODUCTS = [
    { id: 'aqua', name: 'Aqua 600ml', cost: 2500, price: 4000, stock: 100 },
    { id: 'indomie', name: 'Indomie Goreng', cost: 2500, price: 3500, stock: 200 },
    { id: 'taro', name: 'Taro Net', cost: 5000, price: 8000, stock: 50 },
    { id: 'chitato', name: 'Chitato Sapi', cost: 8000, price: 12000, stock: 40 },
    { id: 'susu', name: 'Ultra Milk 250ml', cost: 5000, price: 7500, stock: 80 },
    { id: 'rokok', name: 'Sampoerna Mild', cost: 25000, price: 30000, stock: 30 }
];

const EMPLOYEE_TYPES = [
    { id: 'kasir', name: 'Kasir', salary: 200000, skill: 1 },
    { id: 'pramuniaga', name: 'Pramuniaga', salary: 150000, skill: 1.2 },
    { id: 'supervisor', name: 'Supervisor', salary: 400000, skill: 1.5 }
];

const CITIES = [
    { id: 'jakarta', name: 'Jakarta', lat: -6.2088, lng: 106.8456, cost: 5000000, income: 1.5 },
    { id: 'surabaya', name: 'Surabaya', lat: -7.2575, lng: 112.7521, cost: 4000000, income: 1.3 },
    { id: 'bandung', name: 'Bandung', lat: -6.9175, lng: 107.6191, cost: 3500000, income: 1.2 },
    { id: 'medan', name: 'Medan', lat: 3.5952, lng: 98.6722, cost: 3000000, income: 1.1 },
    { id: 'makassar', name: 'Makassar', lat: -5.1477, lng: 119.4327, cost: 3000000, income: 1.1 },
    { id: 'semarang', name: 'Semarang', lat: -6.9667, lng: 110.4167, cost: 3200000, income: 1.15 },
    { id: 'palembang', name: 'Palembang', lat: -2.9761, lng: 104.7754, cost: 2800000, income: 1.05 },
    { id: 'denpasar', name: 'Denpasar', lat: -8.6705, lng: 115.2126, cost: 3500000, income: 1.2 },
    { id: 'yogyakarta', name: 'Yogyakarta', lat: -7.7956, lng: 110.3695, cost: 3000000, income: 1.1 },
    { id: 'balikpapan', name: 'Balikpapan', lat: -1.2379, lng: 116.8529, cost: 3200000, income: 1.15 }
];

const UPGRADES = [
    { id: 'rak', name: 'Rak Tambahan', desc: '+20% kapasitas stok', cost: 2000000 },
    { id: 'kasir', name: 'Kasir Cepat', desc: '+15% kecepatan layanan', cost: 3000000 },
    { id: 'ac', name: 'AC Sentral', desc: '+10% kenyamanan pelanggan', cost: 4000000 },
    { id: 'cctv', name: 'CCTV', desc: '-20% risiko kehilangan', cost: 2500000 }
];

// ============================================================
// UTILS
// ============================================================
function rupiah(n) {
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function log(msg, type = 'info') {
    state.logs.unshift({
        msg, type, day: state.day,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });
    if (state.logs.length > 50) state.logs.pop();
    renderLog();
}

function renderLog() {
    const el = document.getElementById('log');
    if (!el) return;
    if (state.logs.length === 0) {
        el.innerHTML = '<div class="empty">Belum ada aktivitas.</div>';
        return;
    }
    el.innerHTML = state.logs.map(l =>
        '<div class="log-entry"><span class="log-time">[H' + l.day + ']</span><span class="log-msg ' + l.type + '">' + l.msg + '</span></div>'
    ).join('');
}

// ============================================================
// RENDER
// ============================================================
function render() {
    const moneyEl = document.getElementById('balance-amount');
    if (moneyEl) moneyEl.textContent = rupiah(state.money);
    
    const levelEl = document.getElementById('balance-level');
    if (levelEl) levelEl.textContent = state.level;
    
    const repEl = document.getElementById('balance-rep');
    if (repEl) repEl.textContent = state.reputation;
    
    const dayEl = document.getElementById('balance-day');
    if (dayEl) dayEl.textContent = state.day;
    
    renderProducts();
    renderEmployees();
    renderUpgrades();
    renderLog();
}

function renderProducts() {
    const el = document.getElementById('products-list');
    if (!el) return;
    el.innerHTML = state.products.map(p =>
        '<div class="list-item">' +
        '<div class="list-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>' +
        '<div class="list-info">' +
        '<div class="list-title">' + p.name + '</div>' +
        '<div class="list-subtitle">Stok: ' + p.stock + ' | Beli: ' + rupiah(p.cost) + ' | Jual: ' + rupiah(p.price) + '</div>' +
        '</div>' +
        '<div class="list-action">' +
        '<button class="btn btn-sm" onclick="buyStock(\'' + p.id + '\')">+10</button>' +
        '</div></div>'
    ).join('');
}

function renderEmployees() {
    const el = document.getElementById('employees-list');
    if (!el) return;
    if (state.employees.length === 0) {
        el.innerHTML = '<div class="empty">Belum ada karyawan.</div>';
        return;
    }
    el.innerHTML = state.employees.map(e =>
        '<div class="list-item">' +
        '<div class="list-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>' +
        '<div class="list-info">' +
        '<div class="list-title">' + e.name + '</div>' +
        '<div class="list-subtitle">' + e.role + ' | Gaji: ' + rupiah(e.salary) + '/hari</div>' +
        '</div></div>'
    ).join('');
}

function renderUpgrades() {
    const el = document.getElementById('upgrades-list');
    if (!el) return;
    el.innerHTML = UPGRADES.map(u => {
        const owned = state.upgrades.includes(u.id);
        return '<div class="list-item">' +
            '<div class="list-icon yellow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none