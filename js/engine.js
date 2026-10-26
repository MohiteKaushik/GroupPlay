/* Recommendation engine. Pure functions, no DOM, no storage.
 * Exposed as window.GP.engine so it can also be unit-tested in node (tools/test-engine.js).
 */
(function () {
  'use strict';

  const RANK = {
    phone: { none: 0, host: 1, pass: 2, all: 3 },
    contact: { none: 0, light: 1, close: 2 },
    energy: { chill: 0, medium: 1, high: 2 }
  };

  /** Default host configuration (also the shape persisted in storage). */
  const DEFAULT_CONFIG = Object.freeze({
    people: 8,
    phone: 'host',            // what the group has: 'host' | 'pass' | 'all'  (one phone = 'pass'; the phone is here, so 'none' is impossible)
    ages: ['teens', 'adults'],
    contact: 'light',         // maximum contact the group is comfortable with
    energy: 'any',            // 'any' | 'chill' | 'medium' | 'high'
    space: 'indoor',
    props: []                 // what the host actually has to hand
  });

  /** Mulberry32: tiny seeded PRNG so "Surprise me" and seeded role games are reproducible. */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Deterministic 32-bit hash of a string (FNV-1a). Used to turn room codes into seeds. */
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /** Fisher–Yates with an injectable random source. Returns a new array. */
  function shuffle(arr, rand) {
    rand = rand || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Why a game is excluded for this config, or null if it passes every hard filter. */
  function exclusionReason(game, cfg) {
    if (cfg.people < game.players.min) return `needs at least ${game.players.min} people`;
    if (cfg.people > game.players.max) return `works best with ${game.players.max} or fewer`;
    const missingAge = cfg.ages.find(a => !game.ages.includes(a));
    if (missingAge) return `not great for ${missingAge}`;
    if (RANK.phone[game.phone] > RANK.phone[cfg.phone]) {
      return game.phone === 'all' ? 'everyone needs a phone' : 'needs a phone to pass around';
    }
    if (RANK.contact[game.contact] > RANK.contact[cfg.contact]) return 'involves physical contact';
    const missingProp = game.props.find(p => !cfg.props.includes(p));
    if (missingProp) return `needs ${PROP_LABELS[missingProp] || missingProp}`;
    if (!game.space.includes(cfg.space)) return `${cfg.space} only`;
    return null;
  }

  const PROP_LABELS = {
    paper: 'paper & pens', balloons: 'balloons', ball: 'a ball', cups: 'cups', chairs: 'chairs',
    music: 'music / a speaker', blindfold: 'a blindfold', spoons: 'spoons', rope: 'a rope',
    coins: 'coins', cards: 'playing cards', bottle: 'a bottle', bucket: 'a bucket', bowl: 'bowls',
    cloth: 'a cloth', torch: 'a torch'
  };

  /** Soft score for a game that already passed the hard filters. */
  function score(game, cfg, ctx) {
    let s = 0;
    if (cfg.energy !== 'any') {
      const d = Math.abs(RANK.energy[game.energy] - RANK.energy[cfg.energy]);
      s += d === 0 ? 3 : d === 1 ? 1 : -2;
    }
    if (ctx.playedTonight.has(game.id)) s -= 6;
    if (ctx.bookmarked.has(game.id)) s += 1;
    if (game.phone === cfg.phone) s += 1;
    const span = game.players.max - game.players.min;
    if (span >= 4) {
      const lo = game.players.min + span * 0.2;
      const hi = game.players.max - span * 0.2;
      if (cfg.people >= lo && cfg.people <= hi) s += 1;
    }
    return s;
  }

  /**
   * Rank games for a config.
   * @param {Array} games
   * @param {Object} cfg      host configuration (see DEFAULT_CONFIG)
   * @param {Object} [ctx]    { playedTonight:Set<string>, bookmarked:Set<string>, seed:number }
   * @returns {{ matches: Array<{game, score}>, excluded: Array<{game, reason}> }}
   */
  function recommend(games, cfg, ctx) {
    ctx = Object.assign({ playedTonight: new Set(), bookmarked: new Set(), seed: Date.now() }, ctx || {});
    const matches = [];
    const excluded = [];
    for (const game of games) {
      const reason = exclusionReason(game, cfg);
      if (reason) excluded.push({ game, reason });
      else matches.push({ game, score: score(game, cfg, ctx) });
    }
    // Seeded shuffle first, then a stable sort by score: equal scores keep the shuffled order.
    const shuffled = shuffle(matches, rng(ctx.seed));
    shuffled.sort((a, b) => b.score - a.score);
    return { matches: shuffled, excluded };
  }

  /** Validate and normalise a config coming from storage or the UI. Never throws. */
  function normaliseConfig(raw) {
    const c = Object.assign({}, DEFAULT_CONFIG, raw || {});
    c.people = Math.min(99, Math.max(2, parseInt(c.people, 10) || DEFAULT_CONFIG.people));
    if (!(c.phone in RANK.phone) || c.phone === 'none') c.phone = DEFAULT_CONFIG.phone;
    c.ages = Array.isArray(c.ages) ? c.ages.filter(a => ['kids', 'teens', 'adults', 'elders'].includes(a)) : [];
    if (!c.ages.length) c.ages = DEFAULT_CONFIG.ages.slice();
    const AGE_ORDER = ['kids', 'teens', 'adults', 'elders'];
    c.ages = AGE_ORDER.filter(a => c.ages.includes(a));
    if (!(c.contact in RANK.contact)) c.contact = DEFAULT_CONFIG.contact;
    if (c.energy !== 'any' && !(c.energy in RANK.energy)) c.energy = 'any';
    if (c.space !== 'indoor' && c.space !== 'outdoor') c.space = 'indoor';
    c.props = Array.isArray(c.props) ? c.props.filter(p => p in PROP_LABELS) : [];
    return c;
  }

  window.GP = window.GP || {};
  window.GP.engine = { recommend, exclusionReason, normaliseConfig, rng, hash, shuffle, DEFAULT_CONFIG, PROP_LABELS, RANK };
})();
