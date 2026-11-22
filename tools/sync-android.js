#!/usr/bin/env node
/* Copies the website into the Android project so the app ships with every file inside it.
 *   node tools/sync-android.js
 * Target: android/app/src/main/assets/www (generated; not committed to git).
 * Run automatically by tools/release.js and by the GitHub build. Safe to run any number of times.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'www');
const FILES = ['index.html', 'privacy.html', 'manifest.webmanifest'];
const DIRS = ['css', 'js', 'icons'];

if (!fs.existsSync(path.join(root, 'android', 'app'))) { console.error('android/app not found; nothing to sync.'); process.exit(1); }

// The app talks to the public site for join links; refuse to build an app that would print dead QR codes.
const config = fs.readFileSync(path.join(root, 'js', 'config.js'), 'utf8');
const m = config.match(/joinBase:\s*'(https:\/\/[^'\/]+)\/?'/);
if (!m) { console.error("js/config.js: joinBase must be the public https address of the website, e.g. 'https://example.netlify.app'"); process.exit(1); }

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
let count = 0, bytes = 0;
const copy = (rel) => {
  const from = path.join(root, rel), to = path.join(dest, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  count++; bytes += fs.statSync(from).size;
};
FILES.forEach(copy);
const walk = (rel) => {
  for (const e of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
    const r = rel + '/' + e.name;
    if (e.isDirectory()) walk(r); else if (e.isFile()) copy(r);
  }
};
DIRS.forEach(walk);
console.log(`Android assets: ${count} files, ${(bytes / 1024).toFixed(0)} KB → android/app/src/main/assets/www (site: ${m[1]})`);
