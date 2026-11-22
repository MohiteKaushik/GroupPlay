/* Tiny UI kit: HTML escaping, a hash router, event delegation, toasts, wake lock, speech.
 * No framework. Views are functions that return an HTML string; the router mounts them into #app.
 */
(function () {
  'use strict';

  // --- Escaping / templating ---------------------------------------------
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);

  /** Marks a string as already-safe HTML so `html` does not escape it. */
  class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
  const raw = (s) => new Raw(s);

  /** Tagged template: escapes every interpolated value unless it is Raw or an array of Raw. */
  function html(strings, ...values) {
    let out = strings[0];
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      out += Array.isArray(v) ? v.map(x => x instanceof Raw ? x.s : esc(x)).join('') : v instanceof Raw ? v.s : esc(v);
      out += strings[i + 1];
    }
    return new Raw(out);
  }

  // --- Router --------------------------------------------------------------
  const routes = [];
  let currentView = null;
  let enterTimer = null;
  let lastPath = null;

  /** route('#/game/:id', fn) — fn(params, query) returns Raw/string, or an object { html, onMount, onLeave }. */
  function route(pattern, handler) {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ re, keys, handler });
  }

  function parseHash() {
    const h = location.hash || '#/';
    const [pathPart, queryPart] = h.split('?');
    const query = {};
    if (queryPart) queryPart.split('&').forEach(kv => { const [k, v] = kv.split('='); query[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { path: pathPart, query };
  }

  function render() {
    const { path, query } = parseHash();
    const app = document.getElementById('app');
    if (currentView && currentView.onLeave) { try { currentView.onLeave(); } catch (e) { console.error(e); } }
    currentView = null;
    resetActions();
    for (const r of routes) {
      const m = path.match(r.re);
      if (!m) continue;
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      let result;
      try { result = r.handler(params, query); } catch (e) { console.error(e); result = errorView(e); }
      if (result instanceof Raw || typeof result === 'string') result = { html: result };
      app.innerHTML = String(result.html);
      if (path !== lastPath) { // a new screen pops in; re-rendering the same screen (chip toggles) does not
        app.classList.add('route-enter');
        clearTimeout(enterTimer);
        enterTimer = setTimeout(() => app.classList.remove('route-enter'), 700);
        lastPath = path;
      }
      currentView = result;
      window.scrollTo(0, 0);
      document.body.dataset.route = path.split('/')[1] || 'home';
      if (result.onMount) { try { result.onMount(app); } catch (e) { console.error(e); } }
      return;
    }
    app.innerHTML = String(html`<section class="card"><h2>Page not found</h2><p><a class="btn" href="#/">Go home</a></p></section>`);
  }

  function errorView(e) {
    return html`<section class="card"><h2>Something broke</h2><p class="muted">${e && e.message}</p><p><a class="btn" href="#/">Go home</a></p></section>`;
  }

  const go = (hash) => { if (location.hash === hash) render(); else location.hash = hash; };
  const back = () => { if (history.length > 1) history.back(); else go('#/'); };

  // --- Event delegation ---------------------------------------------------
  // Elements declare data-action="name"; handlers are registered per view with on(name, fn).
  let actions = {};
  const on = (name, fn) => { actions[name] = fn; };
  const resetActions = () => { actions = {}; };

  // Every tappable thing gets a clay "pop"; primary buttons get a brighter "boop"; chips click.
  function uiSound(el) {
    const a = window.GP.audio;
    if (el.classList.contains('chip') || el.classList.contains('option')) a.click(!el.classList.contains('on'));
    else if (el.classList.contains('primary') || el.classList.contains('accent')) a.boop();
    else a.tap();
  }
  document.addEventListener('click', (ev) => {
    const tappable = ev.target.closest('.btn, .chip, .tile, .option, .game-card, .ex-dots i');
    if (tappable) { window.GP.audio.unlock(); uiSound(tappable); }
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    ev.preventDefault();
    fn(el, ev);
  });
  document.addEventListener('input', (ev) => {
    const el = ev.target.closest('[data-input]');
    if (!el) return;
    const fn = actions[el.dataset.input];
    if (fn) fn(el, ev);
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-change]');
    if (!el) return;
    const fn = actions[el.dataset.change];
    if (fn) fn(el, ev);
  });

  // --- Toast ---------------------------------------------------------------
  let toastTimer = null;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  // --- Screen wake lock (keeps the phone awake during timers / narration) -
  let wakeLock = null;
  async function keepAwake(onOff) {
    const native = window.GP.native;
    if (native && native.canKeepAwake) { native.keepAwake(onOff); return; } // Android app: a window flag, no web API
    try {
      if (onOff && 'wakeLock' in navigator && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } else if (!onOff && wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      }
    } catch (e) { wakeLock = null; }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && wakeLock === null && document.body.dataset.awake === '1') keepAwake(true); });

  // --- Speech (on-device text-to-speech, no network) -----------------------
  let currentUtterance = null; // kept referenced: Chrome garbage-collects utterances mid-speech and never fires onend
  const nativeSpeech = () => { const n = window.GP.native; return n && n.canSpeak ? n : null; }; // Android app: the web API does not exist there
  const speech = {
    available: () => !!nativeSpeech() || 'speechSynthesis' in window,
    /** speak(text, { onend, onerror }) → true if the request was accepted. Callbacks fire once, at most. */
    speak(text, cb) {
      if (!speech.available()) return false;
      cb = cb || {};
      if (nativeSpeech()) return nativeSpeech().speak(text, cb);
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-IN';
        u.rate = 0.95;
        let done = false;
        u.onend = () => { if (done) return; done = true; if (cb.onend) cb.onend(); };
        u.onerror = (e) => { if (done) return; done = true; if (cb.onerror) cb.onerror(e); };
        currentUtterance = u;
        window.speechSynthesis.speak(u);
        // Some engines stay 'paused' after a cancel(); nudge them.
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        return true;
      } catch (e) { return false; }
    },
    stop() {
      if (nativeSpeech()) { nativeSpeech().stopSpeaking(); return; }
      if (speech.available()) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
    }
  };

  // --- Misc helpers --------------------------------------------------------
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  const pad2 = (n) => String(n).padStart(2, '0');
  const fmtTime = (totalSec) => `${pad2(Math.floor(totalSec / 60))}:${pad2(totalSec % 60)}`;
  const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  window.addEventListener('hashchange', render);

  window.GP = window.GP || {};
  window.GP.ui = { esc, raw, html, route, render, go, back, on, resetActions, toast, keepAwake, speech, plural, fmtTime, titleCase, pick };
})();
