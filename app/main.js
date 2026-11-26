// RumahKita Budget — main.js: router hash + state + semua pengendali.
// Rute: #/ dasbor, #/transaksi, #/anggaran, #/tujuan, #/laporan.
// State hidup di memori selama halaman dibuka (tanpa cookie, tanpa
// penyimpanan lokal): bulan aktif, transaksi tambahan, anggaran yang
// diubah, dan setoran tujuan.
'use strict';

const ROUTES = [
  { hash: '#/',          page: 'dashboard', label: 'Dasbor' },
  { hash: '#/transaksi', page: 'transaksi', label: 'Transaksi' },
  { hash: '#/anggaran',  page: 'anggaran',  label: 'Anggaran' },
  { hash: '#/tujuan',    page: 'tujuan',    label: 'Tujuan' },
  { hash: '#/laporan',   page: 'laporan',   label: 'Laporan' },
];

const state = {
  month: '2026-11',
  added: [],        // transaksi baru dari formulir
  budgets: {},      // anggaran yang diubah: {kategoriId: jumlah}
  goalAdded: {},    // setoran tujuan: {tujuanId: jumlah}
  search: '',
  filterCat: '',
  range: 6,         // laporan: 3 atau 6 bulan
};

function currentRoute() {
  const h = location.hash || '#/';
  return ROUTES.find(r => r.hash === h) || ROUTES[0];
}

function render() {
  const route = currentRoute();
  document.querySelectorAll('#nav a').forEach(a => {
    const on = a.getAttribute('href') === route.hash;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.getElementById('page').innerHTML = VIEWS[route.page](state);
  bindControls();
}

function bindControls() {
  const monthSel = document.getElementById('month-select');
  if (monthSel) monthSel.addEventListener('change', () => { state.month = monthSel.value; render(); });

  const form = document.getElementById('tx-form');
  if (form) form.addEventListener('submit', ev => {
    ev.preventDefault();
    const date = document.getElementById('tx-date').value;
    const desc = document.getElementById('tx-desc').value.trim();
    const cat = document.getElementById('tx-cat').value;
    const amount = Math.round(+document.getElementById('tx-amount').value);
    const type = document.getElementById('tx-type').value;
    if (!date || !desc || !(amount > 0)) return;
    state.added.push({ t: date, d: desc, c: type === 'in' ? null : cat, a: amount, k: type });
    if (date.slice(0, 7) !== state.month) state.month = date.slice(0, 7);
    state.search = ''; state.filterCat = '';
    render();
    const note = document.querySelector('#tx-form .hint');
    if (note) note.textContent = 'Tersimpan: ' + desc + ' — ' + fmt(amount) + '. Daftar, total, dan grafik sudah diperbarui.';
  });

  const search = document.getElementById('tx-search');
  if (search) search.addEventListener('input', () => { state.search = search.value; render(); keepFocus('tx-search'); });
  const filter = document.getElementById('tx-filter');
  if (filter) filter.addEventListener('change', () => { state.filterCat = filter.value; render(); });

  document.querySelectorAll('.budget-edit').forEach(btn => {
    btn.addEventListener('click', () => editBudget(btn));
  });

  document.querySelectorAll('.goal-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-goal');
      state.goalAdded[id] = (state.goalAdded[id] || 0) + 250000;
      render();
    });
  });

  const r3 = document.getElementById('range-3');
  const r6 = document.getElementById('range-6');
  if (r3) r3.addEventListener('click', () => { state.range = 3; render(); });
  if (r6) r6.addEventListener('click', () => { state.range = 6; render(); });
}

// Jaga fokus kotak cari saat daftar dirender ulang tiap ketikan.
function keepFocus(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  const v = el.value;
  el.setSelectionRange(v.length, v.length);
}

// Ubah anggaran sebaris: klik angka -> kolom angka -> Enter/klik luar menyimpan.
function editBudget(btn) {
  const catId = btn.getAttribute('data-cat');
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;
  const current = budgetOf(state, cat);
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.step = '10000';
  input.value = String(current);
  input.className = 'budget-input';
  input.setAttribute('aria-label', 'Ubah anggaran ' + cat.name);
  btn.replaceWith(input);
  input.focus();
  input.select();
  let done = false;
  const save = () => {
    if (done) return;
    done = true;
    const v = Math.round(+input.value);
    if (v > 0 && v !== current) state.budgets[catId] = v;
    render();
  };
  input.addEventListener('keydown', ev => { if (ev.key === 'Enter') save(); if (ev.key === 'Escape') render(); });
  input.addEventListener('blur', save);
}

window.addEventListener('hashchange', render);
render();
