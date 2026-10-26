/* Persistence. Everything lives in localStorage under the "gp." prefix.
 * Every read is defensive: a corrupt or blocked localStorage must never break the app.
 */
(function () {
  'use strict';

  const PREFIX = 'gp.';
  const TONIGHT_MS = 12 * 60 * 60 * 1000; // "played tonight" expires after 12 hours

  const memory = {}; // fallback when localStorage is unavailable (private mode on some phones)

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return key in memory ? memory[key] : fallback;
    }
  }

  function write(key, value) {
    memory[key] = value;
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* quota or private mode: in-memory only */ }
  }

  function remove(key) {
    delete memory[key];
    try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
  }

  // --- Config -------------------------------------------------------------
  const getConfig = () => window.GP.engine.normaliseConfig(read('config', null));
  const setConfig = (cfg) => write('config', window.GP.engine.normaliseConfig(cfg));

  // --- Bookmarks ----------------------------------------------------------
  const getBookmarks = () => new Set(read('bookmarks', []));
  function toggleBookmark(id) {
    const set = getBookmarks();
    if (set.has(id)) set.delete(id); else set.add(id);
    write('bookmarks', Array.from(set));
    return set.has(id);
  }

  // --- Played tonight -----------------------------------------------------
  function getPlayed() {
    const all = read('played', {});
    const now = Date.now();
    const fresh = {};
    for (const [id, ts] of Object.entries(all)) if (now - ts < TONIGHT_MS) fresh[id] = ts;
    if (Object.keys(fresh).length !== Object.keys(all).length) write('played', fresh);
    return fresh;
  }
  const getPlayedSet = () => new Set(Object.keys(getPlayed()));
  function togglePlayed(id) {
    const played = getPlayed();
    if (played[id]) delete played[id]; else played[id] = Date.now();
    write('played', played);
    return !!played[id];
  }
  const clearPlayed = () => remove('played');

  // --- Generic tool state (scoreboard, mafia game in progress, etc.) ------
  const getState = (name, fallback) => read('state.' + name, fallback);
  const setState = (name, value) => write('state.' + name, value);
  const clearState = (name) => remove('state.' + name);

  window.GP = window.GP || {};
  window.GP.store = {
    getConfig, setConfig,
    getBookmarks, toggleBookmark,
    getPlayed, getPlayedSet, togglePlayed, clearPlayed,
    getState, setState, clearState
  };
})();
