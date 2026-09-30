/* ===================== IndoManager — app.js ===================== */
/* Vanilla JS, ES5-compatible. No frameworks. */

/* ---------- STATIC DATA ---------- */

var CITIES = [
  { id: 'jakarta',    name: 'Jakarta',    lat: -6.2088,  lng: 106.8456, cost: 5000000, income: 1.5  },
  { id: 'surabaya',   name: 'Surabaya',   lat: -7.2575,  lng: 112.7521, cost: 4000000, income: 1.3  },
  { id: 'bandung',    name: 'Bandung',    lat: -6.9175,  lng: 107.6191, cost: 3500000, income: 1.2  },
  { id: 'medan',      name: 'Medan',      lat: 3.5952,   lng: 98.6722,  cost: 3000000, income: 1.1  },
  { id: 'makassar',   name: 'Makassar',   lat: -5.1477,  lng: 119.4327, cost: 3000000, income: 1.1  },
  { id: 'semarang',   name: 'Semarang',   lat: -6.9667,  lng: 110.4167, cost: 3200000, income: 1.15 },
  { id: 'palembang',  name: 'Palembang',  lat: -2.9761,  lng: 104.7754, cost: 2800000, income: 1.05 },
  { id: 'denpasar',   name: 'Denpasar',   lat: -8.6705,  lng: 115.2126, cost: 3500000, income: 1.2  },
  { id: 'yogyakarta', name: 'Yogyakarta', lat: -7.7956,  lng: 110.3695, cost: 3000000, income: 1.1  },
  { id: 'balikpapan', name: 'Balikpapan', lat: -1.2379,  lng: 116.8529, cost: 3200000, income: 1.15 }
];

var PRODUCT_DEFS = [
  { id: 'aqua',     name: 'Aqua 600ml',        cost: 2500,  price: 4000,  stock: 100 },
  { id: 'indomie',  name: 'Indomie Goreng',    cost: 2500,  price: 3500,  stock: 200 },
  { id: 'taro',     name: 'Taro Net',          cost: 5000,  price: 8000,  stock: 50  },
  { id: 'chitato',  name: 'Chitato Sapi',      cost: 8000,  price: 12000, stock: 40  },
  { id: 'ultramilk',name: 'Ultra Milk 250ml',  cost: 5000,  price: 7500,  stock: 80  },
  { id: 'sampoerna',name: 'Sampoerna Mild',    cost: 25000, price: 30000, stock: 30  }
];

var EMPLOYEE_TYPES = [
  { role: 'Kasir',       salary: 200000 },
  { role: 'Pramuniaga',  salary: 150000 },
  { role: 'Supervisor',  salary: 400000 }
];

var EMPLOYEE_NAMES = ['Budi', 'Siti', 'Andi', 'Rina', 'Dedi', 'Maya', 'Joko', 'Lina'];

var UPGRADE_DEFS = [
  { id: 'rak',   name: 'Rak Tambahan', desc: '+20% kapasitas stok', cost: 2000000 },
  { id: 'kasir', name: 'Kasir Cepat',  desc: '+15% kecepatan layanan (income)', cost: 3000000 },
  { id: 'ac',    name: 'AC Sentral',   desc: '+10% kenyamanan pelanggan (income)', cost: 4000000 },
  { id: 'cctv',  name: 'CCTV',         desc: '-20% risiko kehilangan', cost: 2500000 }
];

var RANDOM_EVENTS = [
  { text: 'Pelanggan ramai. Penjualan naik 20%.', type: 'good', effect: 'sales_up' },
  { text: 'Cuaca buruk. Penjualan turun 15%.', type: 'bad', effect: 'sales_down' },
  { text: 'Barang expired. Rugi Rp 500.000.', type: 'bad', effect: 'expired' },
  { text: 'Promo berhasil. Reputasi +3.', type: 'good', effect: 'reputasi_up' },
  { text: 'Kompetitor buka. Reputasi -2.', type: 'bad', effect: 'reputasi_down' }
];

var SAVE_KEY = 'indomanager_save_v1';

/* ---------- STATE ---------- */

var state = null;
var map = null;
var markers = {};
var activeTab = 'home';

function defaultState(){
  var produk = [];
  for (var i = 0; i < PRODUCT_DEFS.length; i++){
    produk.push({
      id: PRODUCT_DEFS[i].id,
      name: PRODUCT_DEFS[i].name,
      cost: PRODUCT_DEFS[i].cost,
      price: PRODUCT_DEFS[i].price,
      stock: PRODUCT_DEFS[i].stock
    });
  }
  var cabang = {};
  for (var j = 0; j < CITIES.length; j++){
    cabang[CITIES[j].id] = false;
  }
  var upgrades = {};
  for (var k = 0; k < UPGRADE_DEFS.length; k++){
    upgrades[UPGRADE_DEFS[k].id] = false;
  }
  return {
    saldo: 5000000,
    level: 1,
    reputasi: 50,
    hari: 1,
    cabang: cabang,
    produk: produk,
    karyawan: [],
    upgrades: upgrades,
    log: [
      { text: 'Selamat datang di IndoManager! Toko pertama Anda siap beroperasi.', type: 'neutral', hari: 1 }
    ]
  };
}

/* ---------- UTIL ---------- */

function formatRupiah(n){
  var neg = n < 0;
  n = Math.round(Math.abs(n));
  var s = String(n);
  var out = '';
  var count = 0;
  for (var i = s.length - 1; i >= 0; i--){
    out = s.charAt(i) + out;
    count++;
    if (count % 3 === 0 && i !== 0){
      out = '.' + out;
    }
  }
  return (neg ? '-Rp ' : 'Rp ') + out;
}

function pickRandom(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

function el(id){
  return document.getElementById(id);
}

function addLog(text, type){
  state.log.unshift({ text: text, type: type || 'neutral', hari: state.hari });
  if (state.log.length > 50){
    state.log = state.log.slice(0, 50);
  }
}

function showToast(msg){
  var toast = el('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(function(){
    toast.classList.add('hidden');
  }, 2200);
}

/* ---------- SAVE / LOAD ---------- */

function saveGame(){
  try{
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch(e){
    /* storage unavailable, ignore silently */
  }
}

function loadGame(){
  try{
    var raw = window.localStorage.getItem(SAVE_KEY);
    if (raw){
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object'){
        state = parsed;
        return true;
      }
    }
  } catch(e){
    /* corrupted save, fall through to default */
  }
  state = defaultState();
  return false;
}

/* ---------- BUSINESS LOGIC ---------- */

function jumlahCabang(){
  var count = 0;
  for (var key in state.cabang){
    if (state.cabang.hasOwnProperty(key) && state.cabang[key]){
      count++;
    }
  }
  return count;
}

function buyStock(productId){
  var produk = null;
  for (var i = 0; i < state.produk.length; i++){
    if (state.produk[i].id === productId){ produk = state.produk[i]; break; }
  }
  if (!produk) return;

  var qty = 10;
  var totalCost = produk.cost * qty;

  if (state.saldo < totalCost){
    showToast('Saldo tidak cukup untuk restock ' + produk.name);
    return;
  }

  var capMultiplier = state.upgrades.rak ? 1.2 : 1.0;
  var maxStock = Math.round(300 * capMultiplier);
  if (produk.stock + qty > maxStock){
    showToast('Kapasitas rak untuk ' + produk.name + ' sudah penuh');
    return;
  }

  state.saldo -= totalCost;
  produk.stock += qty;
  addLog('Restock ' + qty + 'x ' + produk.name + ' (-' + formatRupiah(totalCost) + ')', 'neutral');

  render();
  saveGame();
}

function rekrutKaryawan(){
  var tipe = pickRandom(EMPLOYEE_TYPES);
  var nama = pickRandom(EMPLOYEE_NAMES);
  var biayaRekrut = 500000;

  if (state.saldo < biayaRekrut){
    showToast('Saldo tidak cukup untuk merekrut karyawan');
    return;
  }

  state.saldo -= biayaRekrut;
  state.karyawan.push({
    id: 'emp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    nama: nama,
    role: tipe.role,
    gaji: tipe.salary
  });

  addLog(nama + ' bergabung sebagai ' + tipe.role + ' (-' + formatRupiah(biayaRekrut) + ' biaya rekrutmen)', 'neutral');

  render();
  saveGame();
}

function pecatKaryawan(empId){
  var idx = -1;
  for (var i = 0; i < state.karyawan.length; i++){
    if (state.karyawan[i].id === empId){ idx = i; break; }
  }
  if (idx === -1) return;
  var emp = state.karyawan[idx];
  state.karyawan.splice(idx, 1);
  addLog(emp.nama + ' (' + emp.role + ') telah diberhentikan', 'neutral');
  render();
  saveGame();
}

function bukaCabang(cityId){
  var city = null;
  for (var i = 0; i < CITIES.length; i++){
    if (CITIES[i].id === cityId){ city = CITIES[i]; break; }
  }
  if (!city) return;

  if (state.cabang[cityId]){
    showToast('Cabang di ' + city.name + ' sudah dibuka');
    return;
  }

  if (state.saldo < city.cost){
    showToast('Saldo tidak cukup untuk membuka cabang di ' + city.name);
    return;
  }

  state.saldo -= city.cost;
  state.cabang[cityId] = true;
  addLog('Cabang baru dibuka di ' + city.name + ' (-' + formatRupiah(city.cost) + ')', 'good');

  render();
  saveGame();
}

function beliUpgrade(upgradeId){
  var def = null;
  for (var i = 0; i < UPGRADE_DEFS.length; i++){
    if (UPGRADE_DEFS[i].id === upgradeId){ def = UPGRADE_DEFS[i]; break; }
  }
  if (!def) return;

  if (state.upgrades[upgradeId]){
    showToast(def.name + ' sudah dimiliki');
    return;
  }

  if (state.saldo < def.cost){
    showToast('Saldo tidak cukup untuk membeli ' + def.name);
    return;
  }

  state.saldo -= def.cost;
  state.upgrades[upgradeId] = true;
  addLog('Upgrade dibeli: ' + def.name + ' (-' + formatRupiah(def.cost) + ')', 'good');

  render();
  saveGame();
}

function totalGajiHarian(){
  var total = 0;
  for (var i = 0; i < state.karyawan.length; i++){
    total += state.karyawan[i].gaji;
  }
  return total;
}

function nextDay(){
  state.hari += 1;

  var cabangCount = jumlahCabang();
  var incomeMultTotal = 0;
  for (var key in state.cabang){
    if (state.cabang.hasOwnProperty(key) && state.cabang[key]){
      var city = null;
      for (var i = 0; i < CITIES.length; i++){
        if (CITIES[i].id === key){ city = CITIES[i]; break; }
      }
      if (city) incomeMultTotal += city.income;
    }
  }

  var baseIncomePerCabang = 200000;
  var income = incomeMultTotal * baseIncomePerCabang;

  if (state.upgrades.kasir) income *= 1.15;
  if (state.upgrades.ac) income *= 1.10;

  var expense = totalGajiHarian();

  var eventTriggered = null;
  if (Math.random() < 0.30){
    eventTriggered = pickRandom(RANDOM_EVENTS);
    if (eventTriggered.effect === 'sales_up'){
      income *= 1.20;
    } else if (eventTriggered.effect === 'sales_down'){
      income *= 0.85;
    } else if (eventTriggered.effect === 'expired'){
      state.saldo -= 500000;
    } else if (eventTriggered.effect === 'reputasi_up'){
      state.reputasi = Math.min(100, state.reputasi + 3);
    } else if (eventTriggered.effect === 'reputasi_down'){
      state.reputasi = Math.max(0, state.reputasi - 2);
    }
  }

  state.saldo += income - expense;

  addLog('Hari ' + state.hari + ': pendapatan ' + formatRupiah(income) + ', gaji karyawan -' + formatRupiah(expense), income >= expense ? 'good' : 'bad');

  if (eventTriggered){
    addLog(eventTriggered.text, eventTriggered.type);
  }

  var levelThreshold = state.level * 10000000;
  if (state.saldo > levelThreshold){
    state.level += 1;
    addLog('Level naik! Sekarang Level ' + state.level, 'good');
  }

  if (state.saldo < 0){
    addLog('BANGKRUT! Saldo Anda minus. Segera cari pemasukan tambahan.', 'bad');
  }

  render();
  saveGame();
}

/* ---------- RENDER: HOME ---------- */

function renderHome(){
  el('stat-saldo').textContent = formatRupiah(state.saldo);
  el('stat-hari').textContent = 'Hari ' + state.hari;
  el('stat-level').textContent = String(state.level);
  el('stat-reputasi').textContent = String(state.reputasi);
  el('stat-cabang').textContent = String(jumlahCabang());

  var logWrap = el('activity-log');
  logWrap.innerHTML = '';

  if (state.log.length === 0){
    var empty = document.createElement('div');
    empty.className = 'log-empty';
    empty.textContent = 'Belum ada aktivitas.';
    logWrap.appendChild(empty);
    return;
  }

  for (var i = 0; i < state.log.length; i++){
    var item = state.log[i];
    var row = document.createElement('div');
    row.className = 'log-item';

    var dot = document.createElement('span');
    dot.className = 'log-dot ' + item.type;

    var text = document.createElement('span');
    text.className = 'log-text';
    text.textContent = item.text;

    var day = document.createElement('span');
    day.className = 'log-day';
    day.textContent = 'H' + item.hari;

    row.appendChild(dot);
    row.appendChild(text);
    row.appendChild(day);
    logWrap.appendChild(row);
  }
}

/* ---------- RENDER: TOKO ---------- */

function renderToko(){
  var wrap = el('produk-list');
  wrap.innerHTML = '';

  var capMultiplier = state.upgrades.rak ? 1.2 : 1.0;
  var maxStock = Math.round(300 * capMultiplier);

  el('toko-summary').textContent = state.produk.length + ' produk';

  for (var i = 0; i < state.produk.length; i++){
    var p = state.produk[i];
    var pct = Math.min(100, Math.round((p.stock / maxStock) * 100));

    var card = document.createElement('div');
    card.className = 'list-card';

    var icon = document.createElement('div');
    icon.className = 'list-icon';
    icon.style.background = '#E8F7EE';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#00B14F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path><path d="M2 7h20v5H2z"></path><path d="M12 22V7"></path></svg>';

    var body = document.createElement('div');
    body.className = 'list-body';

    var title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = p.name;

    var sub = document.createElement('div');
    sub.className = 'list-sub';
    sub.textContent = 'Stok: ' + p.stock + ' unit · Beli ' + formatRupiah(p.cost) + ' · Jual ' + formatRupiah(p.price);

    var barTrack = document.createElement('div');
    barTrack.className = 'stock-bar-track';
    var barFill = document.createElement('div');
    barFill.className = 'stock-bar-fill';
    barFill.style.width = pct + '%';
    if (pct < 20) barFill.style.background = 'var(--red)';
    else if (pct < 50) barFill.style.background = 'var(--yellow)';
    barTrack.appendChild(barFill);

    body.appendChild(title);
    body.appendChild(sub);
    body.appendChild(barTrack);

    var meta = document.createElement('div');
    meta.className = 'list-meta';

    var margin = document.createElement('div');
    margin.className = 'list-price green';
    margin.textContent = '+' + formatRupiah(p.price - p.cost);

    var btn = document.createElement('button');
    btn.className = 'btn-small';
    btn.textContent = '+10';
    (function(productId){
      btn.addEventListener('click', function(){ buyStock(productId); });
    })(p.id);

    meta.appendChild(margin);
    meta.appendChild(btn);

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(meta);
    wrap.appendChild(card);
  }
}

/* ---------- RENDER: KARYAWAN ---------- */

function renderKaryawan(){
  var wrap = el('karyawan-list');
  wrap.innerHTML = '';

  el('karyawan-summary').textContent = state.karyawan.length + ' karyawan · gaji/hari ' + formatRupiah(totalGajiHarian());

  if (state.karyawan.length === 0){
    var empty = document.createElement('div');
    empty.className = 'log-empty';
    empty.textContent = 'Belum ada karyawan. Rekrut karyawan pertama Anda.';
    wrap.appendChild(empty);
    return;
  }

  for (var i = 0; i < state.karyawan.length; i++){
    var emp = state.karyawan[i];

    var card = document.createElement('div');
    card.className = 'list-card';

    var icon = document.createElement('div');
    icon.className = 'list-icon';
    icon.style.background = '#EAF3FC';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 4-6 8-6s8 2 8 6"></path></svg>';

    var body = document.createElement('div');
    body.className = 'list-body';

    var title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = emp.nama;

    var sub = document.createElement('div');
    sub.className = 'list-sub';
    sub.textContent = emp.role + ' · gaji ' + formatRupiah(emp.gaji) + '/hari';

    body.appendChild(title);
    body.appendChild(sub);

    var meta = document.createElement('div');
    meta.className = 'list-meta';

    var btn = document.createElement('button');
    btn.className = 'btn-small';
    btn.style.background = '#FCEAEC';
    btn.style.color = 'var(--red)';
    btn.textContent = 'Pecat';
    (function(empId){
      btn.addEventListener('click', function(){ pecatKaryawan(empId); });
    })(emp.id);

    meta.appendChild(btn);

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(meta);
    wrap.appendChild(card);
  }
}

/* ---------- RENDER: UPGRADE ---------- */

function renderUpgrade(){
  var wrap = el('upgrade-list');
  wrap.innerHTML = '';

  for (var i = 0; i < UPGRADE_DEFS.length; i++){
    var u = UPGRADE_DEFS[i];
    var owned = !!state.upgrades[u.id];

    var card = document.createElement('div');
    card.className = 'list-card';

    var icon = document.createElement('div');
    icon.className = 'list-icon';
    icon.style.background = owned ? '#E8F7EE' : '#F5F5F5';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="' + (owned ? '#00B14F' : '#8A8A8A') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    var body = document.createElement('div');
    body.className = 'list-body';

    var title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = u.name;

    var sub = document.createElement('div');
    sub.className = 'list-sub';
    sub.textContent = u.desc + ' · ' + formatRupiah(u.cost);

    body.appendChild(title);
    body.appendChild(sub);

    var meta = document.createElement('div');
    meta.className = 'list-meta';

    var btn = document.createElement('button');
    btn.className = 'btn-small';
    if (owned){
      btn.textContent = 'Tersedia';
      btn.disabled = true;
    } else {
      btn.textContent = 'Beli';
      (function(upgradeId){
        btn.addEventListener('click', function(){ beliUpgrade(upgradeId); });
      })(u.id);
    }

    meta.appendChild(btn);

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(meta);
    wrap.appendChild(card);
  }
}

/* ---------- RENDER: PETA ---------- */

function renderPetaList(){
  var wrap = el('kota-list');
  wrap.innerHTML = '';

  el('peta-summary').textContent = jumlahCabang() + ' / ' + CITIES.length + ' kota';

  for (var i = 0; i < CITIES.length; i++){
    var city = CITIES[i];
    var opened = !!state.cabang[city.id];

    var card = document.createElement('div');
    card.className = 'list-card';

    var icon = document.createElement('div');
    icon.className = 'list-icon';
    icon.style.background = opened ? '#E8F7EE' : '#FCEAEC';
    icon.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="' + (opened ? '#00B14F' : '#E63946') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

    var body = document.createElement('div');
    body.className = 'list-body';

    var title = document.createElement('div');
    title.className = 'list-title';
    title.textContent = city.name;

    var sub = document.createElement('div');
    sub.className = 'list-sub';
    sub.textContent = opened ? 'Cabang aktif · income x' + city.income : 'Biaya buka ' + formatRupiah(city.cost) + ' · income x' + city.income;

    body.appendChild(title);
    body.appendChild(sub);

    var meta = document.createElement('div');
    meta.className = 'list-meta';

    if (opened){
      var badge = document.createElement('span');
      badge.className = 'badge open';
      badge.textContent = 'DIBUKA';
      meta.appendChild(badge);
    } else {
      var btn = document.createElement('button');
      btn.className = 'btn-small';
      btn.textContent = 'Buka Cabang';
      (function(cityId){
        btn.addEventListener('click', function(){
          bukaCabang(cityId);
          updateMapMarkers();
        });
      })(city.id);
      meta.appendChild(btn);
    }

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(meta);
    wrap.appendChild(card);
  }
}

function initMap(){
  if (map) return;
  map = L.map('map', { scrollWheelZoom: false }).setView([-2.5, 118.0], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  for (var i = 0; i < CITIES.length; i++){
    (function(city){
      var opened = !!state.cabang[city.id];
      var color = opened ? '#00B14F' : '#E63946';

      var marker = L.circleMarker([city.lat, city.lng], {
        radius: 9,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(buildPopupHtml(city));
      marker.on('popupopen', function(){ bindPopupButton(city.id); });

      markers[city.id] = marker;
    })(CITIES[i]);
  }
}

function buildPopupHtml(city){
  var opened = !!state.cabang[city.id];
  var html = '';
  html += '<div class="popup-title">' + city.name + '</div>';
  html += '<div class="popup-row">Biaya buka: ' + formatRupiah(city.cost) + '</div>';
  html += '<div class="popup-row">Income multiplier: x' + city.income + '</div>';
  if (opened){
    html += '<button class="popup-btn" disabled>Sudah Dibuka</button>';
  } else {
    html += '<button class="popup-btn" id="popup-btn-' + city.id + '">Buka Cabang</button>';
  }
  return html;
}

function bindPopupButton(cityId){
  var btn = el('popup-btn-' + cityId);
  if (!btn) return;
  btn.addEventListener('click', function(){
    bukaCabang(cityId);
    updateMapMarkers();
    if (map) map.closePopup();
  });
}

function updateMapMarkers(){
  if (!map) return;
  for (var i = 0; i < CITIES.length; i++){
    var city = CITIES[i];
    var opened = !!state.cabang[city.id];
    var color = opened ? '#00B14F' : '#E63946';
    var marker = markers[city.id];
    if (marker){
      marker.setStyle({ fillColor: color });
      marker.setPopupContent(buildPopupHtml(city));
    }
  }
}

function renderPeta(){
  renderPetaList();
  if (!map){
    initMap();
  } else {
    updateMapMarkers();
    window.setTimeout(function(){ map.invalidateSize(); }, 50);
  }
}

/* ---------- TAB SWITCH ---------- */

function switchTab(tab){
  activeTab = tab;

  var pages = document.querySelectorAll('.tab-page');
  for (var i = 0; i < pages.length; i++){
    pages[i].classList.add('hidden');
  }
  el('tab-' + tab).classList.remove('hidden');

  var navItems = document.querySelectorAll('.nav-item');
  for (var j = 0; j < navItems.length; j++){
    if (navItems[j].getAttribute('data-tab') === tab){
      navItems[j].classList.add('active');
    } else {
      navItems[j].classList.remove('active');
    }
  }

  if (tab === 'peta'){
    window.setTimeout(function(){
      renderPeta();
    }, 0);
  }
}

/* ---------- MASTER RENDER ---------- */

function render(){
  renderHome();
  renderToko();
  renderKaryawan();
  renderUpgrade();
  if (activeTab === 'peta'){
    renderPetaList();
    updateMapMarkers();
  } else if (map){
    updateMapMarkers();
  }
}

/* ---------- EVENT WIRING ---------- */

function wireEvents(){
  el('btn-next-day').addEventListener('click', function(){
    nextDay();
  });

  el('btn-rekrut').addEventListener('click', function(){
    rekrutKaryawan();
  });

  var quickActions = document.querySelectorAll('.quick-action');
  for (var i = 0; i < quickActions.length; i++){
    quickActions[i].addEventListener('click', function(){
      switchTab(this.getAttribute('data-tab'));
    });
  }

  var navItems = document.querySelectorAll('.nav-item');
  for (var j = 0; j < navItems.length; j++){
    navItems[j].addEventListener('click', function(){
      switchTab(this.getAttribute('data-tab'));
    });
  }
}

/* ---------- INIT ---------- */

function init(){
  loadGame();
  wireEvents();
  switchTab('home');
  render();

  window.setInterval(function(){
    saveGame();
  }, 10000);
}

document.addEventListener('DOMContentLoaded', init);
