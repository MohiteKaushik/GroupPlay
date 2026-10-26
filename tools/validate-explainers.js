#!/usr/bin/env node
/* Validates js/explainers.js against EXPLAINERS.md. Usage: node tools/validate-explainers.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: { matchMedia: () => ({ matches: false }), GP: {} }, document: { createElementNS: () => ({ setAttribute() {}, appendChild() {} }) }, localStorage: { getItem: () => null }, performance: { now: () => 0 }, requestAnimationFrame: () => 0 };
vm.createContext(sandbox);
for (const f of ['js/games.js', 'js/explain.js', 'js/explainers.js']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.error(`missing ${f}`); process.exit(1); }
  vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: f });
}
const EX = sandbox.window.GP_EXPLAINERS;
const games = new Set(sandbox.window.GP_GAMES.map(g => g.id));
const PROPS = sandbox.window.GP.explain.PROPS, FX = sandbox.window.GP.explain.FX;
const LAYOUTS = ['circle', 'row', 'teams', 'scatter', 'pair', 'chairs'];
const STATES = ['normal', 'it', 'out', 'blind', 'sleep', 'happy', 'sad', 'shout', 'hands', 'sit', 'mafia', 'host'];
const ANCHOR = /^(p\d+(\.(hand|head))?|c\d+|center|left|right|top|bottom|corner|corner2|mid:\d+,\d+)$/;
const errors = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);

if (!EX || typeof EX !== 'object') { console.error('window.GP_EXPLAINERS missing'); process.exit(1); }
for (const [id, steps] of Object.entries(EX)) {
  if (!games.has(id)) err(id, 'no game with this id');
  if (!Array.isArray(steps) || steps.length < 3 || steps.length > 6) { err(id, 'needs 3..6 steps'); continue; }
  let n = 0, layout = null;
  steps.forEach((s, i) => {
    const at = `${id}[${i}]`;
    if (typeof s.say !== 'string' || s.say.length < 8 || s.say.length > 90) err(at, 'say must be 8..90 chars');
    if (s.people != null) { if (!Number.isInteger(s.people) || s.people < 1 || s.people > 16) err(at, 'people must be 1..16'); else n = s.people; }
    if (s.layout != null) { if (!LAYOUTS.includes(s.layout)) err(at, `bad layout ${s.layout}`); else layout = s.layout; }
    if (i === 0 && (!s.people || !s.layout)) err(at, 'first step must set people and layout');
    if (s.chairs != null && layout !== 'chairs') err(at, 'chairs only with layout chairs');
    const checkIdx = (k, what) => { if (!/^\d+$/.test(k) || +k >= n) err(at, `${what} index ${k} out of range (people=${n})`); };
    for (const k in (s.states || {})) { checkIdx(k, 'states'); if (!STATES.includes(s.states[k])) err(at, `bad state ${s.states[k]}`); }
    for (const k in (s.labels || {})) { checkIdx(k, 'labels'); if (String(s.labels[k]).length > 10) err(at, 'label too long'); }
    for (const k in (s.bubbles || {})) { checkIdx(k, 'bubbles'); if (String(s.bubbles[k]).length > 14) err(at, 'bubble too long'); }
    for (const k in (s.point || {})) { checkIdx(k, 'point'); checkIdx(String(s.point[k]), 'point target'); }
    const ids = new Set();
    const anchorOk = (a) => a && (typeof a === 'object' ? Number.isFinite(a.x) && Number.isFinite(a.y) : ANCHOR.test(a));
    const anchorIdx = (a) => { const m = typeof a === 'string' && a.match(/^p(\d+)/); if (m && +m[1] >= n) err(at, `anchor ${a} out of range`); const c = typeof a === 'string' && a.match(/^c(\d+)/); if (c && layout !== 'chairs') err(at, `anchor ${a} needs chairs layout`); };
    (s.props || []).forEach(p => {
      if (!p.id || ids.has(p.id)) err(at, `prop needs a unique id (${p.id})`); ids.add(p.id);
      if (!PROPS.includes(p.type)) err(at, `bad prop type ${p.type}`);
      if (!anchorOk(p.at)) err(at, `bad anchor ${JSON.stringify(p.at)} on ${p.id}`); else anchorIdx(p.at);
      if (p.type === 'text' && (!p.text || p.text.length > 12)) err(at, 'text prop needs text ≤ 12');
      if (p.size != null && (p.size < 0.6 || p.size > 1.6)) err(at, 'size 0.6..1.6');
    });
    (s.moves || []).forEach(m => {
      if (!m.id) return err(at, 'move needs id');
      if (/^p\d+$/.test(m.id)) { if (+m.id.slice(1) >= n) err(at, `move target ${m.id} out of range`); }
      else if (!ids.has(m.id)) err(at, `move targets unknown prop ${m.id}`);
      const verbs = ['to', 'orbit', 'bounce', 'shake', 'spin', 'pop', 'fall', 'grow', 'shrink', 'path'].filter(v => m[v] != null);
      if (!verbs.length) err(at, `move ${m.id} has no verb`);
      if (m.to != null && !anchorOk(m.to)) err(at, `bad move anchor ${JSON.stringify(m.to)}`); else if (m.to) anchorIdx(m.to);
      if (m.orbit && (!Array.isArray(m.orbit) || m.orbit.length !== 2 || m.orbit.some(x => !Number.isInteger(x) || x >= n))) err(at, 'orbit must be [from,to] within people');
      if (m.orbit && layout !== 'circle' && layout !== 'chairs') err(at, 'orbit only in circle/chairs layout');
      if (m.path && (!Array.isArray(m.path) || m.path.length < 2 || !m.path.every(anchorOk))) err(at, 'path needs 2+ anchors');
      if (m.dur != null && (m.dur < 0.3 || m.dur > 8)) err(at, 'dur 0.3..8');
    });
    (s.fx || []).forEach(f => { if (!FX.includes(f)) err(at, `bad fx ${f}`); });
    if (s.hold != null && (s.hold < 1.5 || s.hold > 8)) err(at, 'hold 1.5..8');
    const allowed = ['say', 'people', 'layout', 'chairs', 'states', 'labels', 'bubbles', 'point', 'props', 'moves', 'fx', 'hold'];
    Object.keys(s).forEach(k => { if (!allowed.includes(k)) err(at, `unknown field ${k}`); });
  });
}
const covered = Object.keys(EX).length;
console.log(`${covered} explainers for ${games.size} games; missing: ${[...games].filter(g => !EX[g]).join(', ') || 'none'}`);
if (errors.length) { console.error(`\n${errors.length} error(s):`); errors.forEach(e => console.error('  ' + e)); process.exit(1); }
console.log('OK');
