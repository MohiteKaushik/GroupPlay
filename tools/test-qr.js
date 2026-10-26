#!/usr/bin/env node
/* Encodes a set of strings with js/qr.js, renders PNGs, and decodes them with OpenCV (python3 + cv2).
 * Usage: node tools/test-qr.js   (needs python3 with opencv; skips decoding if unavailable) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const sandbox = { window: {}, TextEncoder };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js/qr.js'), 'utf8'), sandbox);
const qr = sandbox.window.GP.qr;
const samples = [
  'A',
  'K7PQ',
  'https://groupplay.netlify.app/#/join/ABC123',
  'https://groupplay-party-games.netlify.app/#/join/XY7K2Q?name=host-phone',
  'x'.repeat(100),
  'https://example.com/' + 'abcdefghij'.repeat(12),   // 140 chars → v8+
  'y'.repeat(200)                                       // v10
];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qr-'));
const pgm = [];
samples.forEach((text, i) => {
  const { size, grid, version } = qr.encode(text);
  const scale = 8, q = 4, px = (size + 2 * q) * scale;
  // Write a PGM (trivial format) that OpenCV can read.
  const buf = Buffer.alloc(px * px, 255);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (grid[y][x]) for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) buf[((y + q) * scale + dy) * px + (x + q) * scale + dx] = 0;
  const file = path.join(tmp, `qr${i}.pgm`);
  fs.writeFileSync(file, Buffer.concat([Buffer.from(`P5\n${px} ${px}\n255\n`), buf]));
  pgm.push({ file, text, version, size });
  console.log(`sample ${i}: ${text.length} chars → version ${version} (${size}×${size})`);
});
const py = `
import cv2, sys, json
det = cv2.QRCodeDetector()
out = []
for f in sys.argv[1:]:
    img = cv2.imread(f, cv2.IMREAD_GRAYSCALE)
    data, pts, _ = det.detectAndDecode(img)
    out.append(data)
print(json.dumps(out))
`;
let decoded;
try { decoded = JSON.parse(execFileSync('python3', ['-c', py, ...pgm.map(p => p.file)], { encoding: 'utf8' })); }
catch (e) { console.log('OpenCV not available; encoding ran without errors but was not decoded.'); process.exit(0); }
let bad = 0;
decoded.forEach((d, i) => { const ok = d === pgm[i].text; if (!ok) bad++; console.log(`  decode ${i}: ${ok ? 'OK' : 'MISMATCH → ' + JSON.stringify(d).slice(0, 60)}`); });
process.exit(bad ? 1 : 0);
