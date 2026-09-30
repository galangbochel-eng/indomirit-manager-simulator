// ============================================================
// INDO MANAGER — Game Logic (Lengkap)
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

function log(msg, type) {
    type = type || 'info';
    state.logs.unshift({
        msg: msg, type: type, day: state.day,
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
    el.innerHTML = state.logs.map(function(l) {
        return '<div class="log-entry"><span class="log-time">[H' + l.day + ']</span><span class="log-msg ' + l.type + '">' + l.msg + '</span></div>';
    }).join('');
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
    renderMap();
}

function renderProducts() {
    const el = document.getElementById('products-list');
    if (!el) return;
    el.innerHTML = state.products.map(function(p) {
        return '<div class="list-item">' +
            '<div class="list-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></div>' +
            '<div class="list-info">' +
            '<div class="list-title">' + p.name + '</div>' +
            '<div class="list-subtitle">Stok: ' + p.stock + ' | Beli: ' + rupiah(p.cost) + ' | Jual: ' + rupiah(p.price) + '</div>' +
            '</div>' +
            '<div class="list-action">' +
            '<button class="btn btn-sm" onclick="buyStock(\'' + p.id + '\')">+10</button>' +
            '</div></div>';
    }).join('');
}

function renderEmployees() {
    const el = document.getElementById('employees-list');
    if (!el) return;
    if (state.employees.length === 0) {
        el.innerHTML = '<div class="empty">Belum ada karyawan.</div>';
        return;
    }
    el.innerHTML = state.employees.map(function(e) {
        return '<div class="list-item">' +
            '<div class="list-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>' +
            '<div class="list-info">' +
            '<div class="list-title">' + e.name + '</div>' +
            '<div class="list-subtitle">' + e.role + ' | Gaji: ' + rupiah(e.salary) + '/hari</div>' +
            '</div></div>';
    }).join('');
}

function renderUpgrades() {
    const el = document.getElementById('upgrades-list');
    if (!el) return;
    el.innerHTML = UPGRADES.map(function(u) {
        const owned = state.upgrades.indexOf(u.id) !== -1;
        return '<div class="list-item">' +
            '<div class="list-icon yellow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg></div>' +
            '<div class="list-info">' +
            '<div class="list-title">' + u.name + '</div>' +
            '<div class="list-subtitle">' + u.desc + ' | ' + rupiah(u.cost) + '</div>' +
            '</div>' +
            '<div class="list-action">' +
            (owned 
                ? '<button class="btn btn-sm" disabled>Tersedia</button>' 
                : '<button class="btn btn-sm" onclick="buyUpgrade(\'' + u.id + '\')">Beli</button>') +
            '</div></div>';
    }).join('');
}

// ============================================================
// ACTIONS
// ============================================================
function buyStock(id) {
    const p = state.products.find(function(x) { return x.id === id; });
    if (!p) return;
    const qty = 10;
    const cost = p.cost * qty;
    if (state.money < cost) { log('Uang tidak cukup.', 'bad'); return; }
    state.money -= cost;
    p.stock += qty;
    log('Beli ' + qty + ' ' + p.name + ' — ' + rupiah(cost), 'info');
    render();
}

function hireEmployee() {
    const t = EMPLOYEE_TYPES[Math.floor(Math.random() * EMPLOYEE_TYPES.length)];
    const names = ['Budi', 'Siti', 'Andi', 'Rina', 'Dedi', 'Maya', 'Joko', 'Lina'];
    const name = names[Math.floor(Math.random() * names.length)];
    state.employees.push({ name: name, role: t.name, salary: t.salary, skill: t.skill });
    log('Rekrut ' + name + ' sebagai ' + t.name, 'good');
    render();
}

function buyUpgrade(id) {
    const u = UPGRADES.find(function(x) { return x.id === id; });
    if (!u) return;
    if (state.upgrades.indexOf(id) !== -1) return;
    if (state.money < u.cost) { log('Uang tidak cukup.', 'bad'); return; }
    state.money -= u.cost;
    state.upgrades.push(id);
    log('Upgrade: ' + u.name, 'good');
    render();
}

function openBranch(cityId) {
    const city = CITIES.find(function(c) { return c.id === cityId; });
    if (!city) return;
    if (state.branches.indexOf(cityId) !== -1) {
        log('Cabang ' + city.name + ' sudah ada.', 'info');
        return;
    }
    if (state.money < city.cost) {
        log('Uang tidak cukup untuk buka cabang ' + city.name + '. Butuh ' + rupiah(city.cost), 'bad');
        return;
    }
    state.money -= city.cost;
    state.branches.push(cityId);
    log('Buka cabang baru di ' + city.name + ' — ' + rupiah(city.cost), 'good');
    render();
}

function nextDay() {
    state.day++;
    state.income = 0;
    state.expense = 0;
    
    let totalIncome = 0;
    state.branches.forEach(function(bId) {
        const city = CITIES.find(function(c) { return c.id === bId; });
        if (city) totalIncome += 200000 * city.income;
    });
    
    if (state.upgrades.indexOf('kasir') !== -1) totalIncome *= 1.15;
    if (state.upgrades.indexOf('ac') !== -1) totalIncome *= 1.1;
    
    state.income = totalIncome;
    state.money += totalIncome;
    
    const totalSalary = state.employees.reduce(function(sum, e) { return sum + e.salary; }, 0);
    state.expense = totalSalary;
    state.money -= totalSalary;
    
    log('Penjualan: ' + rupiah(totalIncome), 'good');
    if (totalSalary > 0) log('Gaji karyawan: ' + rupiah(totalSalary), 'bad');
    
    if (Math.random() < 0.3) {
        const events = [
            { msg: 'Pelanggan ramai. Penjualan naik 20%.', type: 'good', effect: function() { state.money += state.income * 0.2; } },
            { msg: 'Cuaca buruk. Penjualan turun 15%.', type: 'bad', effect: function() { state.money -= state.income * 0.15; } },
            { msg: 'Ada barang expired. Rugi ' + rupiah(500000), type: 'bad', effect: function() { state.money -= 500000; } },
            { msg: 'Promo berhasil. Reputasi naik.', type: 'good', effect: function() { state.reputation = Math.min(100, state.reputation + 3); } },
            { msg: 'Kompetitor buka di sebelah. Reputasi turun.', type: 'bad', effect: function() { state.reputation = Math.max(0, state.reputation - 2); } }
        ];
        const e = events[Math.floor(Math.random() * events.length)];
        e.effect();
        log('EVENT: ' + e.msg, e.type);
    }
    
    if (state.money > state.level * 10000000) {
        state.level++;
        log('Level up! Sekarang level ' + state.level, 'good');
    }
    
    if (state.money < 0) {
        log('BANGKRUT! Uang habis.', 'bad');
    }
    
    render();
}

// ============================================================
// TABS
// ============================================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(function(el) {
        el.classList.remove('active');
    });
    document.querySelectorAll('.bottom-nav-item').forEach(function(el) {
        el.classList.remove('active');
    });
    
    const content = document.getElementById('tab-' + tabName);
    if (content) content.classList.add('active');
    
    const navBtn = document.querySelector('.bottom-nav-item[data-tab="' + tabName + '"]');
    if (navBtn) navBtn.classList.add('active');
    
    if (tabName === 'peta' && map) {
        setTimeout(function() { map.invalidateSize(); }, 100);
    }
}

// ============================================================
// MAP
// ============================================================
let map = null;
const markers = {};

function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;
    
    map = L.map('map').setView([-2.5, 118.0], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
    }).addTo(map);
    
    CITIES.forEach(function(city) {
        const owned = state.branches.indexOf(city.id) !== -1;
        const color = owned ? '#00B14F' : '#E63946';
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="width:16px;height:16px;border-radius:50%;background:' + color + ';border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        const marker = L.marker([city.lat, city.lng], { icon: icon }).addTo(map);
        
        const popupContent = 
            '<div style="font-family:Inter,sans-serif;font-size:13px;color:#1A1A1A;min-width:150px">' +
            '<strong style="font-size:14px">' + city.name + '</strong><br>' +
            '<span style="color:#8A8A8A;font-size:11px">' + (owned ? 'Cabang aktif' : 'Biaya: ' + rupiah(city.cost)) + '</span>' +
            (owned ? '' : '<br><button onclick="openBranch(\'' + city.id + '\')" style="margin-top:8px;padding:6px 12px;background:#00B14F;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;width:100%">Buka Cabang</button>') +
            '</div>';
        
        marker.bindPopup(popupContent);
        markers[city.id] = marker;
    });
}

function renderMap() {
    if (!map) return;
    CITIES.forEach(function(city) {
        const owned = state.branches.indexOf(city.id) !== -1;
        const color = owned ? '#00B14F' : '#E63946';
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="width:16px;height:16px;border-radius:50%;background:' + color + ';border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });
        
        if (markers[city.id]) {
            markers[city.id].setIcon(icon);
            const popupContent = 
                '<div style="font-family:Inter,sans-serif;font-size:13px;color:#1A1A1A;min-width:150px">' +
                '<strong style="font-size:14px">' + city.name + '</strong><br>' +
                '<span style="color:#8A8A8A;font-size:11px">' + (owned ? 'Cabang aktif' : 'Biaya: ' + rupiah(city.cost)) + '</span>' +
                (owned ? '' : '<br><button onclick="openBranch(\'' + city.id + '\')" style="margin-top:8px;padding:6px 12px;background:#00B14F;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;width:100%">Buka Cabang</button>') +
                '</div>';
            markers[city.id].setPopupContent(popupContent);
        }
    });
}

// ============================================================
// MODAL
// ============================================================
function openModal(title, body, onConfirm) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('modal').classList.add('active');
    
    const confirmBtn = document.getElementById('modal-confirm');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener('click', function() {
        if (onConfirm) onConfirm();
        closeModal();
    });
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// ============================================================
// INIT
// ============================================================
function init() {
    // Load state
    const saved = localStorage.getItem('indomanager');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
            log('Game dimuat dari save.', 'info');
        } catch (e) {
            state.products = PRODUCTS.map(function(p) { return Object.assign({}, p); });
            log('Selamat datang di IndoManager!', 'info');
        }
    } else {
        state.products = PRODUCTS.map(function(p) { return Object.assign({}, p); });
        log('Selamat datang di IndoManager!', 'info');
    }
    
    // Event listeners
    const hireBtn = document.getElementById('btn-hire');
    if (hireBtn) hireBtn.addEventListener('click', hireEmployee);
    
    document.querySelectorAll('.bottom-nav-item').forEach(function(btn) {
        btn.addEventListener('click', function() {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Save tiap 10 detik
    setInterval(function() {
        localStorage.setItem('indomanager', JSON.stringify(state));
    }, 10000);
    
    // Init map
    setTimeout(initMap, 200);
    
    render();
}

// Start game
document.addEventListener('DOMContentLoaded', init);