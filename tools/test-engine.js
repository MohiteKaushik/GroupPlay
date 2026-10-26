#!/usr/bin/env node
/* Engine checks: run with `node tools/test-engine.js`. No test framework needed. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['js/games.js', 'js/decks.js', 'js/engine.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
const E = sandbox.window.GP.engine;
const GAMES = sandbox.window.GP_GAMES;
let n = 0;
const test = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

test('normaliseConfig repairs garbage', () => {
  const c = E.normaliseConfig({ people: 'abc', phone: 'none', ages: ['x'], contact: 'nope', energy: 'zzz', space: 'moon', props: ['laser'] });
  assert.strictEqual(c.people, 8); assert.strictEqual(c.phone, 'host'); assert.strictEqual(JSON.stringify(c.ages), '["teens","adults"]');
  assert.strictEqual(c.contact, 'light'); assert.strictEqual(c.energy, 'any'); assert.strictEqual(c.space, 'indoor'); assert.strictEqual(c.props.length, 0);
});

test('hard filters: people range', () => {
  const g = GAMES.find(x => x.id === 'mafia');
  assert.ok(E.exclusionReason(g, E.normaliseConfig({ people: 5, phone: 'pass', ages: ['adults'] })));
  assert.strictEqual(E.exclusionReason(g, E.normaliseConfig({ people: 8, phone: 'pass', ages: ['adults'] })), null);
});

test('hard filters: age bands must all be covered', () => {
  const g = GAMES.find(x => x.id === 'mafia'); // teens + adults only
  assert.ok(/kids/.test(E.exclusionReason(g, E.normaliseConfig({ people: 8, phone: 'pass', ages: ['kids', 'adults'] }))));
});

test('hard filters: phone rank', () => {
  const g = GAMES.find(x => x.id === 'mafia'); // needs pass
  assert.ok(E.exclusionReason(g, E.normaliseConfig({ people: 8, phone: 'host', ages: ['adults'] })));
  assert.strictEqual(E.exclusionReason(g, E.normaliseConfig({ people: 8, phone: 'all', ages: ['adults'] })), null);
});

test('hard filters: contact + props + space', () => {
  const knot = GAMES.find(x => x.id === 'human-knot');
  assert.ok(E.exclusionReason(knot, E.normaliseConfig({ people: 8, phone: 'pass', ages: ['adults'], contact: 'light' })));
  const parcel = GAMES.find(x => x.id === 'pass-the-parcel');
  assert.ok(/music|paper/.test(E.exclusionReason(parcel, E.normaliseConfig({ people: 8, phone: 'pass', ages: ['adults'], props: ['paper'] }))));
  assert.strictEqual(E.exclusionReason(parcel, E.normaliseConfig({ people: 8, phone: 'pass', ages: ['adults'], props: ['paper', 'music'] })), null);
});

test('recommend returns matches + excluded covering every game', () => {
  const cfg = E.normaliseConfig({ people: 8, phone: 'pass', ages: ['teens', 'adults'], contact: 'light', energy: 'any', space: 'indoor', props: [] });
  const r = E.recommend(GAMES, cfg, { seed: 1 });
  assert.strictEqual(r.matches.length + r.excluded.length, GAMES.length);
  assert.ok(r.matches.length >= 15, 'a typical indoor group of 8 should get plenty of games, got ' + r.matches.length);
});

test('energy preference changes ordering', () => {
  const base = { people: 8, phone: 'pass', ages: ['teens', 'adults'], contact: 'close', space: 'outdoor', props: ['ball', 'chairs', 'music', 'paper'] };
  const chill = E.recommend(GAMES, E.normaliseConfig(Object.assign({}, base, { energy: 'chill' })), { seed: 7 }).matches;
  const high = E.recommend(GAMES, E.normaliseConfig(Object.assign({}, base, { energy: 'high' })), { seed: 7 }).matches;
  assert.strictEqual(chill[0].game.energy, 'chill');
  assert.strictEqual(high[0].game.energy, 'high');
});

test('played tonight sinks to the bottom', () => {
  const cfg = E.normaliseConfig({ people: 8, phone: 'pass', ages: ['adults'], props: [] });
  const first = E.recommend(GAMES, cfg, { seed: 3 }).matches[0].game.id;
  const again = E.recommend(GAMES, cfg, { seed: 3, playedTonight: new Set([first]) }).matches;
  assert.notStrictEqual(again[0].game.id, first);
  assert.ok(again.findIndex(m => m.game.id === first) > again.length / 2);
});

test('seeded shuffle is deterministic and the hash is stable', () => {
  const a = E.shuffle([1, 2, 3, 4, 5, 6, 7, 8], E.rng(42));
  const b = E.shuffle([1, 2, 3, 4, 5, 6, 7, 8], E.rng(42));
  assert.strictEqual(JSON.stringify(a), JSON.stringify(b));
  assert.strictEqual(E.hash('K7PQ|8|1|imposter'), E.hash('K7PQ|8|1|imposter'));
  assert.notStrictEqual(E.hash('K7PQ|8|1|imposter'), E.hash('K7PQ|8|2|imposter'));
});

test('every realistic config yields at least one game', () => {
  let worst = Infinity, worstCfg = null;
  for (const people of [2, 3, 4, 6, 8, 12, 20, 30])
    for (const ages of [['kids'], ['elders'], ['kids', 'elders'], ['teens', 'adults'], ['kids', 'teens', 'adults', 'elders']])
      for (const contact of ['none', 'close'])
        for (const space of ['indoor', 'outdoor']) {
          const cfg = E.normaliseConfig({ people, ages, contact, space, phone: 'pass', props: [] });
          const m = E.recommend(GAMES, cfg, { seed: 1 }).matches.length;
          if (m < worst) { worst = m; worstCfg = cfg; }
        }
  console.log(`    (thinnest realistic config has ${worst} games: ${JSON.stringify(worstCfg)})`);
  assert.ok(worst >= 1, 'some realistic config has zero games: ' + JSON.stringify(worstCfg));
});

console.log(`${n} engine tests passed`);
