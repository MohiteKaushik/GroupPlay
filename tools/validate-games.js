#!/usr/bin/env node
/* Validates js/games.js and js/decks.js against SCHEMA.md.
 * Usage: node tools/validate-games.js   (exit code 1 on any error)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['js/games.js', 'js/decks.js']) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) { console.error(`missing ${f}`); process.exit(1); }
  vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox, { filename: f });
}
const games = sandbox.window.GP_GAMES;
const decks = sandbox.window.GP_DECKS;

const V = {
  category: ['physical', 'word', 'social', 'music', 'drawing', 'trivia', 'relay', 'icebreaker', 'kids', 'brain'],
  energy: ['chill', 'medium', 'high'],
  contact: ['none', 'light', 'close'],
  phone: ['none', 'host', 'pass', 'all'],
  space: ['indoor', 'outdoor'],
  ages: ['kids', 'teens', 'adults', 'elders'],
  props: ['paper', 'balloons', 'ball', 'cups', 'chairs', 'music', 'blindfold', 'spoons', 'rope', 'coins', 'cards', 'bottle', 'bucket', 'bowl', 'cloth', 'torch'],
  tags: ['indian', 'classic', 'bollywood', 'festival', 'icebreaker', 'quiet', 'loud', 'no-prep', 'long', 'quick', 'competitive', 'cooperative'],
  tool: ['timer', 'scoreboard', 'teams', 'buzzer', 'picker', 'random-stop', 'mafia', 'imposter', 'headsup']
};

const errors = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);

if (!Array.isArray(games)) { console.error('window.GP_GAMES is not an array'); process.exit(1); }
if (!decks || typeof decks !== 'object') { console.error('window.GP_DECKS is not an object'); process.exit(1); }

const ids = new Set();
for (const g of games) {
  const id = g.id || '(no id)';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) err(id, 'id must be lowercase kebab-case');
  if (ids.has(id)) err(id, 'duplicate id');
  ids.add(id);

  const str = (k, max) => {
    if (typeof g[k] !== 'string' || !g[k].trim()) err(id, `${k} must be a non-empty string`);
    else if (max && g[k].length > max) err(id, `${k} longer than ${max} chars`);
  };
  str('name', 40); str('tagline', 90); str('setup', 400);
  if (g.tips !== undefined) str('tips', 220);

  const inVocab = (k, val) => { if (!V[k].includes(val)) err(id, `${k} "${val}" not in vocab`); };
  const listVocab = (k, arr, min) => {
    if (!Array.isArray(arr)) return err(id, `${k} must be an array`);
    if (min && arr.length < min) err(id, `${k} needs at least ${min} entries`);
    if (new Set(arr).size !== arr.length) err(id, `${k} has duplicates`);
    arr.forEach(v => inVocab(k, v));
  };
  inVocab('category', g.category);
  inVocab('energy', g.energy);
  inVocab('contact', g.contact);
  inVocab('phone', g.phone);
  listVocab('ages', g.ages, 1);
  listVocab('space', g.space, 1);
  listVocab('props', g.props || null, 0);
  if (g.tags !== undefined) listVocab('tags', g.tags, 0);

  if (!g.players || !Number.isInteger(g.players.min) || !Number.isInteger(g.players.max)) err(id, 'players.min/max must be integers');
  else if (g.players.min < 2 || g.players.max < g.players.min) err(id, 'players range invalid');
  if (!Number.isInteger(g.minutes) || g.minutes < 2 || g.minutes > 180) err(id, 'minutes must be 2..180');
  if (typeof g.teams !== 'boolean') err(id, 'teams must be boolean');

  if (!Array.isArray(g.rules) || g.rules.length < 3 || g.rules.length > 8) err(id, 'rules must have 3..8 steps');
  else g.rules.forEach((r, i) => { if (typeof r !== 'string' || r.length < 15 || r.length > 260) err(id, `rules[${i}] length out of range`); });
  if (g.variations !== undefined) {
    if (!Array.isArray(g.variations) || g.variations.length > 4) err(id, 'variations must be an array of 0..4');
    else g.variations.forEach((r, i) => { if (typeof r !== 'string' || r.length < 10) err(id, `variations[${i}] too short`); });
  }

  if (g.tool !== undefined) {
    if (g.tool.startsWith('prompts:')) {
      const deck = g.tool.slice(8);
      if (!decks[deck]) err(id, `tool references unknown deck "${deck}"`);
    } else if (!V.tool.includes(g.tool)) err(id, `tool "${g.tool}" not in vocab`);
  }
  // Consistency checks that catch real content mistakes.
  if (g.phone === 'none' && g.tool && !g.tool.startsWith('prompts:')) err(id, 'phone "none" but a phone tool is linked; use phone "host"');
  if ((g.tool === 'mafia' || g.tool === 'imposter' || g.tool === 'headsup') && g.phone === 'host') err(id, 'this tool needs phone "pass" or "all"');
  if (g.energy === 'high' && g.ages.includes('elders')) err(id, 'high-energy game listed as good for elders; double-check');
  if (g.contact === 'close' && g.ages.includes('elders')) err(id, 'close-contact game listed for elders; double-check');
  const allowed = new Set(['id', 'name', 'tagline', 'category', 'players', 'ages', 'energy', 'contact', 'props', 'phone', 'space', 'minutes', 'teams', 'tool', 'tags', 'setup', 'rules', 'variations', 'tips']);
  Object.keys(g).forEach(k => { if (!allowed.has(k)) err(id, `unknown field "${k}"`); });
}

for (const [name, deck] of Object.entries(decks)) {
  if (!deck || typeof deck.title !== 'string' || !Array.isArray(deck.items)) { err(`deck:${name}`, 'needs {title, items[]}'); continue; }
  if (deck.items.length < 20) err(`deck:${name}`, `only ${deck.items.length} items; need 20+`);
  const seen = new Set();
  deck.items.forEach((it, i) => {
    const key = typeof it === 'string' ? it : it && it.word;
    if (!key || typeof key !== 'string') err(`deck:${name}`, `items[${i}] invalid`);
    else if (seen.has(key.toLowerCase())) err(`deck:${name}`, `duplicate "${key}"`);
    seen.add((key || '').toLowerCase());
  });
}

// Coverage report: makes gaps in the catalogue visible.
const count = (fn) => games.filter(fn).length;
console.log(`${games.length} games, ${Object.keys(decks).length} decks`);
console.log(`  2-3 players: ${count(g => g.players.min <= 3)}  | 20+ players: ${count(g => g.players.max >= 20)}`);
console.log(`  no props: ${count(g => g.props.length === 0)}  | no phone: ${count(g => g.phone === 'none')}  | contact none: ${count(g => g.contact === 'none')}`);
console.log(`  good for elders: ${count(g => g.ages.includes('elders'))}  | good for kids: ${count(g => g.ages.includes('kids'))}`);
console.log(`  chill/medium/high: ${count(g => g.energy === 'chill')}/${count(g => g.energy === 'medium')}/${count(g => g.energy === 'high')}`);
console.log(`  indian-tagged: ${count(g => (g.tags || []).includes('indian'))}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
}
console.log('OK');
