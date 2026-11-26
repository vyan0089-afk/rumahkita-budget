// RumahKita Budget — charts.js: grafik SVG murni (donat, batang, bilah anggaran).
// Tanpa pustaka, tanpa gambar luar: semua digambar dari angka di data.js.
'use strict';

function polar(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
    ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2);
}

// Donat "belanja per kategori". slices: [{name, value, color}].
// centerLabel: teks besar di tengah, centerSub: teks kecil di bawahnya.
function donutChart(slices, centerLabel, centerSub) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = 110, cy = 110, rOuter = 96, rInner = 62;
  let html = '<svg viewBox="0 0 220 220" role="img" aria-label="Donat belanja per kategori" class="donut">';
  let angle = 0;
  for (const s of slices) {
    if (s.value <= 0) continue;
    const frac = s.value / total;
    const a0 = angle, a1 = angle + frac * 360;
    angle = a1;
    if (frac >= 0.999) {
      html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + ((rOuter + rInner) / 2) + '" fill="none" stroke="' + s.color + '" stroke-width="' + (rOuter - rInner) + '"/>';
    } else {
      const gap = 1.2; // celah tipis antar irisan
      html += '<path d="' + arcPath(cx, cy, (rOuter + rInner) / 2, a0 + gap / 2, a1 - gap / 2) + '" fill="none" stroke="' + s.color + '" stroke-width="' + (rOuter - rInner) + '" stroke-linecap="butt"/>';
    }
  }
  html += '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="donut-total">' + centerLabel + '</text>';
  html += '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" class="donut-sub">' + centerSub + '</text>';
  html += '</svg>';
  return html;
}

// Grafik batang tren bulanan: batang belanja + garis pemasukan.
// rows: [{m, label, spent}], income: garis pemasukan (Rp).
function barChart(rows, income) {
  const W = 640, H = 260, padL = 58, padB = 30, padT = 18;
  const maxV = Math.max(income, ...rows.map(r => r.spent)) * 1.08;
  const plotW = W - padL - 14, plotH = H - padT - padB;
  const y = v => padT + plotH * (1 - v / maxV);
  const slot = plotW / rows.length, bw = Math.min(64, slot * 0.52);
  let html = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang tren bulanan" class="bars">';
  for (let i = 0; i <= 4; i++) {
    const v = maxV / 1.08 * i / 4, yy = y(v);
    html += '<line x1="' + padL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - 14) + '" y2="' + yy.toFixed(1) + '" class="grid"/>';
    html += '<text x="' + (padL - 8) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" class="axis">' + shortRp(v) + '</text>';
  }
  const iy = y(income);
  html += '<line x1="' + padL + '" y1="' + iy.toFixed(1) + '" x2="' + (W - 14) + '" y2="' + iy.toFixed(1) + '" class="income-line"/>';
  html += '<text x="' + (W - 14) + '" y="' + (iy - 6).toFixed(1) + '" text-anchor="end" class="income-label">Pemasukan Rp 8,5 jt</text>';
  rows.forEach((r, i) => {
    const x = padL + slot * i + (slot - bw) / 2;
    const over = r.spent > income;
    html += '<rect x="' + x.toFixed(1) + '" y="' + y(r.spent).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (y(0) - y(r.spent)).toFixed(1) + '" rx="4" class="' + (i === rows.length - 1 ? 'bar-now' : 'bar') + '"/>';
    html += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (y(r.spent) - 6).toFixed(1) + '" text-anchor="middle" class="bar-value">' + shortRp(r.spent) + '</text>';
    html += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" class="axis">' + r.m + '</text>';
  });
  html += '</svg>';
  return html;
}

// Bilah progres anggaran: persen dibatasi 100 untuk lebar, warna merah bila lewat.
function budgetBar(pct) {
  const w = Math.min(100, pct);
  const cls = pct > 100 ? 'over' : (pct >= 90 ? 'near' : 'ok');
  return '<div class="bar-track"><div class="bar-fill ' + cls + '" style="width:' + w + '%"></div></div>';
}

// Rp 6.598.000 -> "Rp 6,6 jt"; dipakai untuk label sumbu grafik.
function shortRp(v) {
  if (v >= 1000000) return 'Rp ' + (v / 1000000).toFixed(1).replace('.', ',').replace(',0', '') + ' jt';
  if (v >= 1000) return 'Rp ' + Math.round(v / 1000) + ' rb';
  return 'Rp ' + v;
}
