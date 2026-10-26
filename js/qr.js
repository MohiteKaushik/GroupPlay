/* Minimal QR code encoder: byte mode, error-correction level M, versions 1–10 (up to 213 bytes).
 * No dependencies; ~3 KB gzipped. Output is a boolean matrix, rendered as an SVG by qrSvg().
 * Verified against OpenCV's decoder (tools/test-qr.js).
 */
(function () {
  'use strict';

  // Per version (1..10), level M: [total codewords, EC codewords per block, [blocks, data codewords] per group]
  const VERSIONS = [
    null,
    [26, 10, [[1, 16]]],
    [44, 16, [[1, 28]]],
    [70, 26, [[1, 44]]],
    [100, 18, [[2, 32]]],
    [134, 24, [[2, 43]]],
    [172, 16, [[4, 27]]],
    [196, 18, [[4, 31]]],
    [242, 22, [[2, 38], [2, 39]]],
    [292, 22, [[3, 36], [2, 37]]],
    [346, 26, [[4, 43], [1, 44]]]
  ];
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

  // --- GF(256) arithmetic for Reed–Solomon -------------------------------
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () { let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; })();
  const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;

  function rsGenerator(n) {
    let g = [1];
    for (let i = 0; i < n; i++) {
      const next = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) { next[j] ^= g[j]; next[j + 1] ^= mul(g[j], EXP[i]); }
      g = next;
    }
    return g;
  }
  function rsEncode(data, n) {
    const gen = rsGenerator(n);
    const res = new Array(n).fill(0);
    for (const d of data) {
      const f = d ^ res.shift();
      res.push(0);
      if (f) for (let j = 0; j < n; j++) res[j] ^= mul(gen[j + 1], f);
    }
    return res;
  }

  // --- Bit stream ---------------------------------------------------------
  function bits(bytes, version) {
    const out = [];
    const push = (val, len) => { for (let i = len - 1; i >= 0; i--) out.push((val >> i) & 1); };
    push(4, 4);                         // byte mode
    push(bytes.length, version < 10 ? 8 : 16);
    bytes.forEach(b => push(b, 8));
    const [total, ec, groups] = VERSIONS[version];
    const dataCw = groups.reduce((s, [n, d]) => s + n * d, 0);
    const cap = dataCw * 8;
    if (out.length > cap) return null;
    push(0, Math.min(4, cap - out.length));
    while (out.length % 8) out.push(0);
    const pads = [0xec, 0x11];
    for (let i = 0; out.length < cap; i++) push(pads[i & 1], 8);
    const cw = [];
    for (let i = 0; i < out.length; i += 8) cw.push(parseInt(out.slice(i, i + 8).join(''), 2));
    // Split into blocks, compute EC, interleave.
    const blocks = [], ecs = [];
    let p = 0;
    groups.forEach(([n, d]) => { for (let i = 0; i < n; i++) { const blk = cw.slice(p, p + d); p += d; blocks.push(blk); ecs.push(rsEncode(blk, ec)); } });
    const maxD = Math.max(...blocks.map(b => b.length));
    const seq = [];
    for (let i = 0; i < maxD; i++) blocks.forEach(b => { if (i < b.length) seq.push(b[i]); });
    for (let i = 0; i < ec; i++) ecs.forEach(e => seq.push(e[i]));
    if (seq.length !== total) throw new Error('codeword count mismatch');
    const res = [];
    seq.forEach(b => { for (let i = 7; i >= 0; i--) res.push((b >> i) & 1); });
    return res;
  }

  // --- Matrix -------------------------------------------------------------
  function matrix(version, dataBits) {
    const size = version * 4 + 17;
    const m = Array.from({ length: size }, () => new Array(size).fill(null)); // null = free for data
    const set = (x, y, v) => { m[y][x] = v ? 1 : 0; };
    const finder = (x0, y0) => { for (let y = -1; y <= 7; y++) for (let x = -1; x <= 7; x++) { const xx = x0 + x, yy = y0 + y; if (xx < 0 || yy < 0 || xx >= size || yy >= size) continue; const on = (x >= 0 && x <= 6 && y >= 0 && y <= 6) && (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)); set(xx, yy, on); } };
    finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
    const al = ALIGN[version];
    for (const cy of al) for (const cx of al) {
      if ((cx <= 8 && cy <= 8) || (cx <= 8 && cy >= size - 9) || (cx >= size - 9 && cy <= 8)) continue;
      for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) set(cx + x, cy + y, Math.max(Math.abs(x), Math.abs(y)) !== 1);
    }
    for (let i = 8; i < size - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); }
    set(8, size - 8, 1); // dark module
    // Reserve format areas (filled later)
    for (let i = 0; i < 9; i++) { if (m[8][i] === null) m[8][i] = 0; if (m[i][8] === null) m[i][8] = 0; }
    for (let i = size - 8; i < size; i++) { if (m[8][i] === null) m[8][i] = 0; if (m[i][8] === null) m[i][8] = 0; }
    if (version >= 7) {
      // Version information (18 bits, BCH 18,6)
      let v = version << 12, g = 0x1f25;
      for (let i = 17; i >= 12; i--) if (v & (1 << i)) v ^= g << (i - 12);
      const info = (version << 12) | v;
      for (let i = 0; i < 18; i++) { const bit = (info >> i) & 1; const a = Math.floor(i / 3), b = i % 3; set(a, size - 11 + b, bit); set(size - 11 + b, a, bit); }
    }
    // Data placement: zigzag from bottom-right, skipping the timing column.
    let bi = 0, up = true;
    for (let x = size - 1; x > 0; x -= 2) {
      if (x === 6) x--;
      for (let k = 0; k < size; k++) {
        const y = up ? size - 1 - k : k;
        for (let dx = 0; dx < 2; dx++) {
          const xx = x - dx;
          if (m[y][xx] !== null) continue;
          m[y][xx] = bi < dataBits.length ? dataBits[bi] : 0;
          m[y][xx] = { d: m[y][xx] }; // mark as data so masking knows
          bi++;
        }
      }
      up = !up;
    }
    return { m, size };
  }

  const MASKS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x, y) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  ];

  function formatBits(mask) {
    const data = (0 << 3) | mask; // level M = 00
    let v = data << 10;
    for (let i = 14; i >= 10; i--) if (v & (1 << i)) v ^= 0x537 << (i - 10);
    return ((data << 10) | v) ^ 0x5412;
  }

  function applyMask(base, mask) {
    const { m, size } = base;
    const out = m.map((row, y) => row.map((c, x) => (c !== null && typeof c === 'object') ? (c.d ^ (MASKS[mask](x, y) ? 1 : 0)) : c));
    const f = formatBits(mask);
    const bit = (i) => (f >> i) & 1;
    // out[y][x]. First copy around the top-left finder (column 8 going down, then row 8 going left).
    for (let i = 0; i < 6; i++) out[i][8] = bit(i);
    out[7][8] = bit(6); out[8][8] = bit(7); out[8][7] = bit(8);
    for (let i = 9; i < 15; i++) out[8][14 - i] = bit(i);
    // Second copy: row 8 under the top-right finder, column 8 beside the bottom-left finder.
    for (let i = 0; i < 8; i++) out[8][size - 1 - i] = bit(i);
    for (let i = 8; i < 15; i++) out[size - 15 + i][8] = bit(i);
    return out;
  }

  function penalty(g) {
    const n = g.length;
    let score = 0;
    // Rule 1: runs of 5+ same colour in rows/cols
    for (let i = 0; i < n; i++) {
      let runR = 1, runC = 1;
      for (let j = 1; j < n; j++) {
        if (g[i][j] === g[i][j - 1]) { runR++; if (runR === 5) score += 3; else if (runR > 5) score++; } else runR = 1;
        if (g[j][i] === g[j - 1][i]) { runC++; if (runC === 5) score += 3; else if (runC > 5) score++; } else runC = 1;
      }
    }
    // Rule 2: 2x2 blocks
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) { const v = g[y][x]; if (v === g[y][x + 1] && v === g[y + 1][x] && v === g[y + 1][x + 1]) score += 3; }
    // Rule 3: finder-like patterns 1011101 with 4 light modules on a side
    const pat = [1, 0, 1, 1, 1, 0, 1];
    const check = (get) => { for (let i = 0; i < n - 6; i++) { let ok = true; for (let k = 0; k < 7; k++) if (get(i + k) !== pat[k]) { ok = false; break; } if (!ok) continue; const before = i >= 4 && [1, 2, 3, 4].every(k => get(i - k) === 0); const after = i + 10 < n && [7, 8, 9, 10].every(k => get(i + k) === 0); if (before || after) score += 40; } };
    for (let i = 0; i < n; i++) { check(j => g[i][j]); check(j => g[j][i]); }
    // Rule 4: dark proportion
    let dark = 0; for (const row of g) for (const c of row) dark += c;
    const pct = (dark * 100) / (n * n);
    score += Math.floor(Math.abs(pct - 50) / 5) * 10;
    return score;
  }

  /** encode(text) → { size, grid } where grid[y][x] is 1 for dark. Throws if text is too long (>213 bytes). */
  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    for (let v = 1; v <= 10; v++) {
      const data = bits(bytes, v);
      if (!data) continue;
      const base = matrix(v, data);
      let best = null, bestScore = Infinity;
      for (let mask = 0; mask < 8; mask++) {
        const g = applyMask(base, mask);
        const sc = penalty(g);
        if (sc < bestScore) { bestScore = sc; best = g; }
      }
      return { size: base.size, grid: best, version: v };
    }
    throw new Error('Text too long for a QR code (max 213 bytes)');
  }

  /** SVG markup for a QR (with a 4-module quiet zone). Dark colour defaults to near-black. */
  function svg(text, opts) {
    opts = opts || {};
    const { size, grid } = encode(text);
    const q = 4, total = size + q * 2;
    let d = '';
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (grid[y][x]) d += `M${x + q},${y + q}h1v1h-1z`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="${(opts.label || 'QR code').replace(/"/g, '&quot;')}"><rect width="${total}" height="${total}" fill="${opts.light || '#fff'}"/><path d="${d}" fill="${opts.dark || '#1a1a1a'}"/></svg>`;
  }

  window.GP = window.GP || {};
  window.GP.qr = { encode, svg };
})();
