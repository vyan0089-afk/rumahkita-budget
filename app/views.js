// RumahKita Budget — views.js: lima perender halaman + panel wawasan.
// Semua angka dihitung dari data.js + state (bulan aktif, transaksi baru,
// anggaran yang diubah, setoran tujuan). Tidak ada angka yang diketik
// dua kali: ubah satu transaksi, semua total ikut berubah.
'use strict';

const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function fmt(n) {
  return 'Rp ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function fmtPct1(x) { return x.toFixed(1).replace('.', ',') + '%'; }
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtDate(iso) {
  const y = +iso.slice(0, 4), m = +iso.slice(5, 7), d = +iso.slice(8, 10);
  return d + ' ' + ID_MONTHS[m - 1] + ' ' + y;
}
function monthLabel(id) {
  const m = MONTHS.find(x => x.id === id);
  return m ? m.label : id;
}

// ---- state helpers -------------------------------------------------------
function monthTx(state, monthId) {
  return TRANSACTIONS.filter(t => t.t.slice(0, 7) === monthId)
    .concat(state.added.filter(t => t.t.slice(0, 7) === monthId));
}
function budgetOf(state, cat) {
  return state.budgets[cat.id] != null ? state.budgets[cat.id] : cat.budget;
}
function monthTotals(state, monthId) {
  const txs = monthTx(state, monthId);
  const income = txs.filter(t => t.k === 'in').reduce((s, t) => s + t.a, 0);
  const perCat = {};
  let spent = 0;
  for (const t of txs) {
    if (t.k !== 'out' || !t.c) continue;
    perCat[t.c] = (perCat[t.c] || 0) + t.a;
    spent += t.a;
  }
  return { txs, income, spent, perCat, left: income - spent };
}
function goalSaved(state, goal) {
  return goal.saved + (state.goalAdded[goal.id] || 0);
}
function budgetStatus(spent, budget) {
  const pct = budget > 0 ? spent / budget * 100 : 0;
  if (pct > 100) return { pct, badge: 'Lewat ' + Math.round(pct - 100) + '%', cls: 'bad', note: 'lebih ' + fmt(spent - budget) };
  if (pct >= 90) return { pct, badge: 'Hampir habis', cls: 'warn', note: 'sisa ' + fmt(budget - spent) };
  return { pct, badge: 'Aman', cls: 'good', note: 'sisa ' + fmt(budget - spent) };
}

function monthSelect(state) {
  return '<label class="month-pick">Bulan <select id="month-select" aria-label="Pilih bulan">' +
    MONTHS.map(m => '<option value="' + m.id + '"' + (m.id === state.month ? ' selected' : '') + '>' + m.label + '</option>').join('') +
    '</select></label>';
}

// ---- Dashboard -----------------------------------------------------------
function renderDashboard(state) {
  const mo = MONTHS.find(m => m.id === state.month);
  const tot = monthTotals(state, state.month);
  const rate = mo.income > 0 ? mo.saved / mo.income * 100 : 0;
  const slices = CATEGORIES.map(c => ({ name: c.name, value: tot.perCat[c.id] || 0, color: c.color }));
  const kpi =
    '<section class="kpis">' +
    kpiCard('Pemasukan', fmt(tot.income), 'Gaji bulanan — ' + HOUSEHOLD.employer, '') +
    kpiCard('Belanja', fmt(tot.spent), CATEGORIES.length + ' kategori · ' + monthLabel(state.month), '') +
    kpiCard('Sisa', fmt(tot.left), 'setelah belanja, sebelum tabungan', '') +
    kpiCard('Tingkat Tabungan', fmtPct1(rate), fmt(mo.saved) + ' disisihkan bulan ini', 'accent') +
    '</section>';
  const legend = slices.map(s =>
    '<li><span class="dot" style="background:' + s.color + '"></span><span class="lg-name">' + s.name +
    '</span><span class="lg-val">' + fmt(s.value) + '</span><span class="lg-pct">' +
    (tot.spent ? Math.round(s.value / tot.spent * 100) : 0) + '%</span></li>').join('');
  return '<h1>Dasbor ' + HOUSEHOLD.name + '</h1>' +
    '<p class="sub">' + HOUSEHOLD.members + ' · ' + HOUSEHOLD.place + '</p>' +
    '<div class="page-head">' + monthSelect(state) + '</div>' +
    kpi +
    '<section class="duo">' +
    '<div class="card"><h2>Belanja per kategori</h2>' +
    donutChart(slices, fmt(tot.spent), 'total belanja') +
    '<ul class="legend">' + legend + '</ul></div>' +
    '<div class="card"><h2>Yang perlu diperhatikan</h2>' + renderInsights(state, tot, rate) + '</div>' +
    '</section>';
}
function kpiCard(label, value, note, extra) {
  return '<div class="kpi ' + extra + '"><div class="kpi-label">' + label + '</div>' +
    '<div class="kpi-value">' + value + '</div><div class="kpi-note">' + note + '</div></div>';
}

const TIPS = {
  makanan: 'Masak di rumah 2 kali seminggu lagi bisa menutup selisihnya.',
  transport: 'Coba ganti 2 perjalanan ojek online dengan bus minggu depan.',
  rumah: 'Cek langganan rumah yang bisa dijeda bulan depan.',
  listrik: 'Matikan AC satu jam lebih awal tiap malam.',
  pendidikan: 'Buku bekas kakak kelas bisa menghemat belanja alat tulis.',
  kesehatan: 'Jaga jadwal kontrol agar tidak jadi biaya darurat.',
  hiburan: 'Tukar malam bioskop dengan malam film di rumah.',
};
function renderInsights(state, tot, rate) {
  const items = [];
  let under = 0;
  for (const c of CATEGORIES) {
    const spent = tot.perCat[c.id] || 0, b = budgetOf(state, c);
    if (spent > b) {
      const over = Math.round((spent / b - 1) * 100);
      items.push({ tone: 'warn', text: '<strong>Belanja ' + c.name.toLowerCase() + ' ' + over + '% di atas anggaran</strong> bulan ini (' + fmt(spent) + ' dari ' + fmt(b) + '). ' + (TIPS[c.id] || '') });
    } else under++;
  }
  items.push({ tone: 'good', text: '<strong>' + under + ' dari ' + CATEGORIES.length + ' kategori masih di bawah anggaran</strong> bulan ini — disiplin keluarga terjaga.' });
  if (rate >= 15) items.push({ tone: 'good', text: '<strong>Tingkat tabungan ' + fmtPct1(rate) + ' dari pemasukan</strong> — di atas target keluarga 15%.' });
  else items.push({ tone: 'warn', text: '<strong>Tingkat tabungan ' + fmtPct1(rate) + '</strong> — masih di bawah target keluarga 15%.' });
  const g = GOALS[0];
  const gp = Math.round(goalSaved(state, g) / g.target * 100);
  items.push({ tone: 'good', text: '<strong>Dana darurat sudah ' + gp + '%</strong> — sesuai rencana tercapai ' + g.due + ' (' + (Math.ceil((g.target - goalSaved(state, g)) / 250000)) + ' kali setor lagi).' });
  return '<ul class="insights">' + items.map(i =>
    '<li class="' + i.tone + '"><span class="ico">' + (i.tone === 'warn' ? '!' : '✓') + '</span><span>' + i.text + '</span></li>').join('') + '</ul>';
}

// ---- Transaksi ------------------------------------------------------------
function renderTransactions(state) {
  const tot = monthTotals(state, state.month);
  const q = (state.search || '').toLowerCase();
  const rows = tot.txs
    .filter(t => !state.filterCat || t.c === state.filterCat || (state.filterCat === 'in' && t.k === 'in'))
    .filter(t => !q || t.d.toLowerCase().includes(q))
    .slice().sort((a, b) => b.t.localeCompare(a.t) || 0);
  const catOpts = CATEGORIES.map(c => '<option value="' + c.id + '"' + (state.filterCat === c.id ? ' selected' : '') + '>' + c.name + '</option>').join('');
  const list = rows.length ? rows.map(t =>
    '<tr><td>' + fmtDate(t.t) + '</td><td>' + esc(t.d) + '</td><td>' +
    (t.k === 'in' ? 'Pemasukan' : (CATEGORIES.find(c => c.id === t.c) || {}).name || '—') +
    '</td><td class="num ' + (t.k === 'in' ? 'in' : 'out') + '">' + (t.k === 'in' ? '+' : '−') + fmt(t.a) + '</td></tr>').join('')
    : '<tr><td colspan="4" class="empty">Tidak ada transaksi yang cocok. Ubah kata kunci atau kategori.</td></tr>';
  return '<h1>Transaksi</h1>' +
    '<p class="sub">Setiap rupiah tercatat — ' + monthLabel(state.month) + ' · ' + tot.txs.length + ' transaksi tampil</p>' +
    '<div class="page-head">' + monthSelect(state) + '</div>' +
    '<section class="card"><h2>Tambah transaksi</h2>' +
    '<form id="tx-form"><div class="form-grid">' +
    '<label>Tanggal<input id="tx-date" type="date" value="2026-11-26" required></label>' +
    '<label>Keterangan<input id="tx-desc" type="text" placeholder="cth. Belanja mingguan — Pasar" maxlength="80" required></label>' +
    '<label>Kategori<select id="tx-cat">' + CATEGORIES.map(c => '<option value="' + c.id + '">' + c.name + '</option>').join('') + '</select></label>' +
    '<label>Jumlah (Rp)<input id="tx-amount" type="number" min="1000" step="500" placeholder="cth. 150000" required></label>' +
    '<label>Jenis<select id="tx-type"><option value="out">Pengeluaran</option><option value="in">Pemasukan</option></select></label>' +
    '<button type="submit" class="btn-primary">Simpan transaksi</button>' +
    '</div><p class="hint">Transaksi baru langsung masuk ke daftar, total, dan grafik.</p></form></section>' +
    '<section class="card"><h2>Daftar transaksi</h2>' +
    '<div class="filters"><label>Kategori<select id="tx-filter"><option value="">Semua kategori</option>' + catOpts +
    '<option value="in"' + (state.filterCat === 'in' ? ' selected' : '') + '>Pemasukan</option></select></label>' +
    '<label>Cari<input id="tx-search" type="search" placeholder="Cari keterangan…" value="' + esc(state.search || '') + '"></label></div>' +
    '<p class="summary">Masuk ' + fmt(tot.income) + ' · Keluar ' + fmt(tot.spent) + ' · ' + rows.length + ' baris</p>' +
    '<div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th></tr></thead><tbody>' +
    list + '</tbody></table></div></section>';
}

// ---- Anggaran -------------------------------------------------------------
function renderBudgets(state) {
  const tot = monthTotals(state, state.month);
  const totalBudget = CATEGORIES.reduce((s, c) => s + budgetOf(state, c), 0);
  const cards = CATEGORIES.map(c => {
    const spent = tot.perCat[c.id] || 0, b = budgetOf(state, c), st = budgetStatus(spent, b);
    return '<article class="budget-card"><div class="bc-head"><h3>' + c.name + '</h3>' +
      '<span class="badge ' + st.cls + '">' + st.badge + '</span></div>' +
      '<p class="bc-amount"><strong>' + fmt(spent) + '</strong> dari ' +
      '<button class="budget-edit" data-cat="' + c.id + '" title="Klik untuk ubah anggaran">' + fmt(b) + '</button></p>' +
      budgetBar(st.pct) +
      '<p class="bc-note">' + Math.round(st.pct) + '% terpakai · ' + st.note + '</p></article>';
  }).join('');
  return '<h1>Anggaran</h1>' +
    '<p class="sub">Rencana belanja ' + monthLabel(state.month) + ' · total anggaran ' + fmt(totalBudget) + ' · belanja ' + fmt(tot.spent) + '</p>' +
    '<div class="page-head">' + monthSelect(state) + '</div>' +
    '<p class="hint">Klik angka anggaran (garis bawah titik-titik) untuk mengubahnya — status dan bilah ikut berubah.</p>' +
    '<section class="budget-grid">' + cards + '</section>';
}

// ---- Tujuan ---------------------------------------------------------------
function renderGoals(state) {
  const cards = GOALS.map(g => {
    const saved = goalSaved(state, g);
    const pct = Math.round(saved / g.target * 100);
    const done = saved >= g.target;
    return '<article class="goal-card"><div class="bc-head"><h3>' + g.name + '</h3>' +
      '<span class="badge ' + (done ? 'good' : (pct >= 60 ? 'warn' : 'good')) + '">' + (done ? 'Tercapai' : pct + '%') + '</span></div>' +
      '<p class="bc-amount"><strong>' + fmt(saved) + '</strong> dari ' + fmt(g.target) + '</p>' +
      budgetBar(pct) +
      '<p class="bc-note">Target ' + g.due + ' · kurang ' + fmt(Math.max(0, g.target - saved)) + '</p>' +
      '<p class="goal-note">' + g.note + '</p>' +
      (done ? '<p class="goal-done">Tujuan tercapai — selamat!</p>'
        : '<button class="btn-primary goal-add" data-goal="' + g.id + '">+ Setor Rp 250.000</button>') +
      '</article>';
  }).join('');
  const totalSaved = GOALS.reduce((s, g) => s + goalSaved(state, g), 0);
  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  return '<h1>Tujuan</h1>' +
    '<p class="sub">Tabungan keluarga — total terkumpul ' + fmt(totalSaved) + ' dari ' + fmt(totalTarget) + ' (' + Math.round(totalSaved / totalTarget * 100) + '%)</p>' +
    '<section class="budget-grid">' + cards + '</section>';
}

// ---- Laporan ---------------------------------------------------------------
function renderReport(state) {
  const rows = state.range === 3 ? TREND.slice(-3) : TREND;
  const tot = monthTotals(state, state.month);
  const prevId = state.month === '2026-11' ? '2026-10' : '2026-11';
  const prev = monthTotals(state, prevId);
  const cmp = CATEGORIES.map(c => {
    const now = tot.perCat[c.id] || 0, then = prev.perCat[c.id] || 0;
    const diff = then ? Math.round((now / then - 1) * 100) : 0;
    return '<tr><td><span class="dot" style="background:' + c.color + '"></span> ' + c.name + '</td>' +
      '<td class="num">' + fmt(now) + '</td><td class="num">' + fmt(then) + '</td>' +
      '<td class="num ' + (diff > 0 ? 'out' : 'in') + '">' + (diff > 0 ? '+' : '') + diff + '%</td></tr>';
  }).join('');
  return '<h1>Laporan</h1>' +
    '<p class="sub">Tren belanja Juni – November 2026 · pemasukan tetap ' + fmt(8500000) + ' per bulan</p>' +
    '<div class="page-head"><div class="toggle" role="group" aria-label="Rentang laporan">' +
    '<button id="range-3" class="' + (state.range === 3 ? 'on' : '') + '">3 bulan</button>' +
    '<button id="range-6" class="' + (state.range === 6 ? 'on' : '') + '">6 bulan</button></div>' + monthSelect(state) + '</div>' +
    '<section class="card"><h2>Belanja per bulan</h2>' + barChart(rows, 8500000) +
    '<p class="hint">Batang ' + (state.range === 3 ? 'September – November' : 'Juni – November') +
    ' · garis putus-putus = pemasukan Rp 8,5 jt · November tertinggi karena belanja akhir bulan dan service motor.</p></section>' +
    '<section class="card"><h2>Perbandingan kategori — ' + monthLabel(state.month) + ' vs ' + monthLabel(prevId) + '</h2>' +
    '<div class="table-wrap"><table><thead><tr><th>Kategori</th><th class="num">' + monthLabel(state.month) + '</th><th class="num">' + monthLabel(prevId) + '</th><th class="num">Selisih</th></tr></thead><tbody>' +
    cmp + '<tr class="total-row"><td><strong>Total belanja</strong></td><td class="num"><strong>' + fmt(tot.spent) + '</strong></td><td class="num"><strong>' + fmt(prev.spent) + '</strong></td><td class="num ' + (tot.spent > prev.spent ? 'out' : 'in') + '"><strong>' + (tot.spent > prev.spent ? '+' : '') + Math.round((tot.spent / prev.spent - 1) * 100) + '%</strong></td></tr>' +
    '</tbody></table></div>' +
    '<p class="hint">November naik ' + Math.round((tot.spent / prev.spent - 1) * 100) + '% dari Oktober, terutama makanan (+' + Math.round(((tot.perCat.makanan || 0) / (prev.perCat.makanan || 1) - 1) * 100) + '%) dan transportasi.</p></section>';
}

// Halaman yang dirender per rute hash.
const VIEWS = {
  dashboard: renderDashboard,
  transaksi: renderTransactions,
  anggaran: renderBudgets,
  tujuan: renderGoals,
  laporan: renderReport,
};
