// RumahKita Budget — dataset: keluarga Wijaya, Cibinong.
// Semua angka konsisten: jumlah transaksi per kategori sama dengan
// total kategori, dan total belanja sama dengan jumlah ketujuh kategori.
'use strict';

const CATEGORIES = [
  { id: 'rumah',       name: 'Rumah',                 color: '#1f4d3a', budget: 2200000 },
  { id: 'makanan',     name: 'Makanan',               color: '#c65a2e', budget: 1800000 },
  { id: 'transport',   name: 'Transportasi',          color: '#d9a441', budget: 600000 },
  { id: 'listrik',     name: 'Listrik, Air & Internet', color: '#4a7d8c', budget: 500000 },
  { id: 'pendidikan',  name: 'Pendidikan',            color: '#7a5fa0', budget: 700000 },
  { id: 'kesehatan',   name: 'Kesehatan',             color: '#c25e7a', budget: 400000 },
  { id: 'hiburan',     name: 'Hiburan',               color: '#6a8f4f', budget: 300000 },
];

// t: tanggal (YYYY-MM-DD), d: keterangan, c: kategori, a: jumlah (Rp),
// k: 'out' pengeluaran | 'in' pemasukan.
const TRANSACTIONS = [
  // ---- November 2026: 26 pengeluaran + 1 pemasukan = 27 baris ----
  { t: '2026-11-01', d: 'Gaji bulanan — PT Nusantara Jaya', c: null, a: 8500000, k: 'in' },
  { t: '2026-11-01', d: 'Cicilan KPR — Bank Griya', c: 'rumah', a: 1500000, k: 'out' },
  { t: '2026-11-02', d: 'Belanja mingguan — Pasar Cibinong', c: 'makanan', a: 210000, k: 'out' },
  { t: '2026-11-02', d: 'SPP Nadia & Bimo', c: 'pendidikan', a: 600000, k: 'out' },
  { t: '2026-11-03', d: 'Iuran keamanan & kebersihan', c: 'rumah', a: 150000, k: 'out' },
  { t: '2026-11-03', d: 'Bensin motor — SPBU Cibinong', c: 'transport', a: 50000, k: 'out' },
  { t: '2026-11-04', d: 'Belanja bulanan — Supermarket', c: 'makanan', a: 480000, k: 'out' },
  { t: '2026-11-05', d: 'Listrik PLN', c: 'listrik', a: 220000, k: 'out' },
  { t: '2026-11-05', d: 'Air PDAM', c: 'listrik', a: 110000, k: 'out' },
  { t: '2026-11-07', d: 'Vitamin & obat — Apotek Sehat', c: 'kesehatan', a: 120000, k: 'out' },
  { t: '2026-11-09', d: 'Perbaikan kran & service AC', c: 'rumah', a: 300000, k: 'out' },
  { t: '2026-11-09', d: 'Ojek online & parkir', c: 'transport', a: 140000, k: 'out' },
  { t: '2026-11-10', d: 'Belanja mingguan — Pasar Cibinong', c: 'makanan', a: 185000, k: 'out' },
  { t: '2026-11-10', d: 'Internet rumah', c: 'listrik', a: 150000, k: 'out' },
  { t: '2026-11-12', d: 'Ayam & ikan — Pasar Cibinong', c: 'makanan', a: 140000, k: 'out' },
  { t: '2026-11-13', d: 'Bensin mobil — SPBU Cibinong', c: 'transport', a: 200000, k: 'out' },
  { t: '2026-11-14', d: 'Bioskop & langganan streaming', c: 'hiburan', a: 204000, k: 'out' },
  { t: '2026-11-15', d: 'Beras 10 kg & minyak — Toko Sembako', c: 'makanan', a: 175000, k: 'out' },
  { t: '2026-11-15', d: 'Buku & alat tulis', c: 'pendidikan', a: 50000, k: 'out' },
  { t: '2026-11-17', d: 'Belanja mingguan — Pasar Cibinong', c: 'makanan', a: 195000, k: 'out' },
  { t: '2026-11-18', d: 'Perabot & lampu — Toko Bangunan', c: 'rumah', a: 220000, k: 'out' },
  { t: '2026-11-20', d: 'Service motor — Bengkel Jaya', c: 'transport', a: 175000, k: 'out' },
  { t: '2026-11-21', d: 'Makan malam — RM Padang Sederhana', c: 'makanan', a: 120000, k: 'out' },
  { t: '2026-11-21', d: 'Periksa gigi — Klinik Sehat', c: 'kesehatan', a: 200000, k: 'out' },
  { t: '2026-11-23', d: 'Belanja mingguan — Pasar Cibinong', c: 'makanan', a: 110000, k: 'out' },
  { t: '2026-11-25', d: 'Ojek online', c: 'transport', a: 85000, k: 'out' },
  { t: '2026-11-28', d: 'Belanja akhir bulan — Supermarket', c: 'makanan', a: 509000, k: 'out' },
  // ---- Oktober 2026: 23 pengeluaran + 1 pemasukan = 24 baris ----
  { t: '2026-10-01', d: 'Gaji bulanan — PT Nusantara Jaya', c: null, a: 8500000, k: 'in' },
  { t: '2026-10-01', d: 'Cicilan KPR — Bank Griya', c: 'rumah', a: 1500000, k: 'out' },
  { t: '2026-10-02', d: 'Belanja mingguan — Pasar Cibinong', c: 'makanan', a: 205000, k: 'out' },
  { t: '2026-10-02', d: 'SPP Nadia & Bimo', c: 'pendidikan', a: 570000, k: 'out' },
  { t: '2026-10-03', d: 'Iuran keamanan & kebersihan', c: 'rumah', a: 150000, k: 'out' },
  { t: '2026-10-04', d: 'Bensin motor & ojek online', c: 'transport', a: 45000, k: 'out' },
  { t: '2026-10-05', d: 'Belanja bulanan — Supermarket', c: 'makanan', a: 470000, k: 'out' },
  { t: '2026-10-05', d: 'Listrik PLN', c: 'listrik', a: 215000, k: 'out' },
  { t: '2026-10-05', d: 'Air PDAM', c: 'listrik', a: 105000, k: 'out' },
  { t: '2026-10-08', d: 'Periksa kesehatan — Puskesmas', c: 'kesehatan', a: 210000, k: 'out' },
  { t: '2026-10-09', d: 'Belanja mingguan — Pasar Cibinong', c: 'makanan', a: 180000, k: 'out' },
  { t: '2026-10-10', d: 'Internet rumah', c: 'listrik', a: 150000, k: 'out' },
  { t: '2026-10-11', d: 'Bensin mobil — SPBU Cibinong', c: 'transport', a: 190000, k: 'out' },
  { t: '2026-10-12', d: 'Perbaikan genteng bocor', c: 'rumah', a: 280000, k: 'out' },
  { t: '2026-10-13', d: 'Sayur, telur & tempe — Tukang Sayur', c: 'makanan', a: 165000, k: 'out' },
  { t: '2026-10-14', d: 'Buku & alat tulis', c: 'pendidikan', a: 50000, k: 'out' },
  { t: '2026-10-15', d: 'Piknik keluarga — Kebun Raya Bogor', c: 'hiburan', a: 190000, k: 'out' },
  { t: '2026-10-16', d: 'Ayam & ikan — Pasar Cibinong', c: 'makanan', a: 190000, k: 'out' },
  { t: '2026-10-18', d: 'Ojek online & parkir', c: 'transport', a: 160000, k: 'out' },
  { t: '2026-10-20', d: 'Beras 10 kg & minyak — Toko Sembako', c: 'makanan', a: 135000, k: 'out' },
  { t: '2026-10-20', d: 'Perabot dapur — Toko Bangunan', c: 'rumah', a: 170000, k: 'out' },
  { t: '2026-10-24', d: 'Makan malam — RM Padang Sederhana', c: 'makanan', a: 175000, k: 'out' },
  { t: '2026-10-26', d: 'Service motor — Bengkel Jaya', c: 'transport', a: 185000, k: 'out' },
  { t: '2026-10-29', d: 'Belanja akhir bulan — Supermarket', c: 'makanan', a: 430000, k: 'out' },
];

// Tren bulanan: total belanja per bulan (Rp). Pemasukan tetap Rp 8.500.000.
const TREND = [
  { m: 'Jun', label: 'Juni 2026',     spent: 5980000 },
  { m: 'Jul', label: 'Juli 2026',     spent: 6240000 },
  { m: 'Agu', label: 'Agustus 2026',  spent: 6050000 },
  { m: 'Sep', label: 'September 2026', spent: 6410000 },
  { m: 'Okt', label: 'Oktober 2026',  spent: 6120000 },
  { m: 'Nov', label: 'November 2026', spent: 6598000 },
];

const MONTHS = [
  { id: '2026-11', label: 'November 2026', income: 8500000, saved: 1500000 },
  { id: '2026-10', label: 'Oktober 2026',  income: 8500000, saved: 1800000 },
];

// Tujuan menabung keluarga. saved/target dalam Rp.
const GOALS = [
  { id: 'darurat',  name: 'Dana Darurat',              saved: 7400000, target: 12000000, due: 'Maret 2027',     note: '6x gaji pokok — bantalan kalau ada hal tak terduga.' },
  { id: 'liburan',  name: 'Liburan Keluarga — Pantai Anyer', saved: 2250000, target: 5000000,  due: 'Juni 2027',      note: '3 hari 2 malam: penginapan, bensin, dan makan bersama.' },
  { id: 'laptop',   name: 'Laptop untuk Nadia',        saved: 1800000, target: 4500000,  due: 'Agustus 2027',   note: 'Untuk tugas sekolah dan belajar coding dasar.' },
  { id: 'dapur',    name: 'Renovasi Dapur',            saved: 3100000, target: 8000000,  due: 'Desember 2027',  note: 'Ganti kompor, wastafel, dan cat ulang dinding.' },
];

const HOUSEHOLD = {
  name: 'Keluarga Wijaya',
  members: 'Andi (ayah) · Sari (ibu) · Nadia (11) · Bimo (7)',
  place: 'Cibinong, Kabupaten Bogor',
  employer: 'PT Nusantara Jaya',
};
