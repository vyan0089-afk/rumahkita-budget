# RumahKita Budget

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/vyan0089-afk/rumahkita-budget/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/vyan0089-afk/rumahkita-budget/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

Situs anggaran rumah tangga untuk **Keluarga Wijaya** (Cibinong, Kabupaten
Bogor): dasbor, transaksi, anggaran, tujuan menabung, dan laporan bulanan —
dengan angka nyata November 2026, semua kontrol berfungsi, dan tanpa satu
pun permintaan jaringan.

## Jalankan

```sh
node serve.ts
# buka http://localhost:8080
```

## Isi

- `app/index.html` — kerangka + navigasi (5 halaman lewat hash)
- `app/style.css` — sistem visual + tata letak ponsel
- `app/data.js` — dataset: 7 kategori, 51 transaksi, tren 6 bulan, 4 tujuan
- `app/charts.js` — grafik SVG (donat, batang, bilah anggaran)
- `app/views.js` — 5 perender halaman + panel wawasan
- `app/main.js` — router hash + state + semua pengendali

## Angka kunci (November 2026)

- Pemasukan Rp 8.500.000 · Belanja Rp 6.598.000 · Sisa Rp 1.902.000
- Tingkat tabungan 17,6% (target keluarga 15%)
- Dana darurat Rp 7.400.000 dari Rp 12.000.000 (62%, target Maret 2027)

## Lisensi

MIT — lihat `LICENSE`.
