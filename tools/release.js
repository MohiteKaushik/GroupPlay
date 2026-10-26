#!/usr/bin/env node
/* Bumps the version stamp before a deploy. Run: node tools/release.js
 * - sw.js VERSION      -> today's date plus a counter (changing sw.js is what makes phones pick up new files)
 * - js/version.js      -> window.GP_VERSION shown on the About page
 * - validates the game database first; refuses to release broken content.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname, 'validate-games.js')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(__dirname, 'validate-explainers.js')], { stdio: 'inherit' });

const swPath = path.join(root, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const m = sw.match(/const VERSION = '(\d{4}\.\d{2}\.\d{2})-(\d+)';/);
if (!m) { console.error('VERSION line not found in sw.js'); process.exit(1); }
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
const counter = m[1] === today ? parseInt(m[2], 10) + 1 : 1;
const version = `${today}-${counter}`;
fs.writeFileSync(swPath, sw.replace(m[0], `const VERSION = '${version}';`));
fs.writeFileSync(path.join(root, 'js', 'version.js'), `window.GP_VERSION = '${version}';\n`);
console.log(`Version ${version} written to sw.js and js/version.js. Deploy the whole folder.`);
