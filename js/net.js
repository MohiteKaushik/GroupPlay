/* Live rooms over plain HTTP. Speaks the Firebase Realtime Database REST protocol (GET/PUT/PATCH/DELETE on
 * <path>.json, and Server-Sent Events streaming), so the same code works against Firebase or tools/relay.js.
 * No SDK. The whole room is one small JSON tree that every device streams; each device writes only its own
 * part (the host writes meta/state/priv, every player writes players/<me> and acts/<me>), so writes never
 * conflict and the host's phone is the single source of truth for game logic.
 */
(function () {
  'use strict';

  const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I: read aloud or typed on a phone without mistakes
  const HEARTBEAT_MS = 25000;
  const STALE_MS = 75000;

  const base = () => String((window.GP_CONFIG && window.GP_CONFIG.relayUrl) || '').replace(/\/+$/, '');
  const configured = () => !!base();

  function newCode() {
    const buf = new Uint8Array(6);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(buf) : buf.forEach((_, i) => { buf[i] = Math.random() * 256; });
    return Array.from(buf, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  }
  const normaliseCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6);
  const validCode = (s) => /^[A-Z2-9]{6}$/.test(s);

  /** A stable id for this browser so a refresh lands back in the same seat. */
  function playerId() {
    let id = null;
    try { id = localStorage.getItem('gp.pid'); } catch (e) { /* ignore */ }
    if (!id) {
      id = 'p' + newCode().toLowerCase() + Math.floor(Math.random() * 1e6).toString(36);
      try { localStorage.setItem('gp.pid', id); } catch (e) { /* ignore */ }
    }
    return id;
  }

  const SERVER_TIME = { '.sv': 'timestamp' };

  /** Join-URL for a code: the site itself plus #/join/CODE. */
  function joinUrl(code) {
    const jb = (window.GP_CONFIG && window.GP_CONFIG.joinBase) || (location.origin + location.pathname);
    return jb.replace(/#.*$/, '').replace(/\/?$/, '/').replace(/\/index\.html\/$/, '/') + '#/join/' + code;
  }

  // --- tiny tree helpers ----------------------------------------------------
  const segs = (p) => String(p || '').split('/').filter(Boolean);
  function getAt(obj, path) { let cur = obj; for (const s of segs(path)) { if (cur == null || typeof cur !== 'object') return null; cur = cur[s]; } return cur === undefined ? null : cur; }
  function setAt(root, path, value) {
    const ss = segs(path);
    if (!ss.length) return value === null ? {} : value;
    let cur = root;
    for (let i = 0; i < ss.length - 1; i++) { if (cur[ss[i]] == null || typeof cur[ss[i]] !== 'object') cur[ss[i]] = {}; cur = cur[ss[i]]; }
    if (value === null || value === undefined) delete cur[ss[ss.length - 1]]; else cur[ss[ss.length - 1]] = value;
    return root;
  }

  /** One live room. Emits 'change' (whole tree), 'status' ('connecting'|'live'|'offline'|'ended'), 'error'. */
  class Room {
    constructor(code) {
      this.code = code;
      this.me = playerId();
      this.data = {};
      this.status = 'connecting';
      this.listeners = { change: [], status: [], error: [] };
      this.queue = [];
      this.sending = false;
      this.es = null;
      this.closed = false;
      this.serverOffset = 0; // serverTime - Date.now(), learnt from our own heartbeat echo
      this._hb = null;
      this._gotFirstPut = false;
      this._onVis = () => { if (document.visibilityState === 'visible' && !this.closed) this._ensureStream(); };
      document.addEventListener('visibilitychange', this._onVis);
    }
    on(ev, fn) { this.listeners[ev].push(fn); return () => { this.listeners[ev] = this.listeners[ev].filter(f => f !== fn); }; }
    emit(ev, arg) { this.listeners[ev].forEach(fn => { try { fn(arg); } catch (e) { console.error(e); } }); }
    setStatus(s) { if (this.status !== s) { this.status = s; this.emit('status', s); } }
    url(path, query) { return `${base()}/rooms/${this.code}${segs(path).length ? '/' + segs(path).join('/') : ''}.json${query ? '?' + query : ''}`; }

    /** Start streaming. Resolves after the first full snapshot arrives (or rejects on a hard error). */
    connect() {
      return new Promise((resolve, reject) => {
        this._firstPut = { resolve, reject };
        this._ensureStream();
      });
    }

    _ensureStream() {
      if (this.closed) return;
      if (this.es && this.es.readyState !== 2 /* CLOSED */) return;
      if (this.es) { try { this.es.close(); } catch (e) { /* ignore */ } }
      this.setStatus('connecting');
      const es = new EventSource(this.url(''));
      this.es = es;
      es.onopen = () => { /* status becomes live after the first put */ };
      es.onerror = () => {
        if (this.closed) return;
        this.setStatus('offline');
        // EventSource retries by itself while readyState is CONNECTING. If it gave up (CLOSED), retry with backoff.
        if (es.readyState === 2) setTimeout(() => this._ensureStream(), 2000 + Math.random() * 2000);
      };
      const apply = (kind) => (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        const path = msg.path || '/';
        if (kind === 'put') {
          if (segs(path).length === 0) this.data = msg.data == null ? {} : msg.data;
          else setAt(this.data, path, msg.data);
        } else { // patch: each key is a relative path under msg.path
          for (const k of Object.keys(msg.data || {})) setAt(this.data, segs(path).concat(segs(k)).join('/'), msg.data[k]);
        }
        this.setStatus('live');
        if (this._firstPut) { const f = this._firstPut; this._firstPut = null; f.resolve(this.data); }
        if (segs(path).length === 0 && msg.data == null && this._gotFirstPut) { this.setStatus('ended'); }
        this._gotFirstPut = true;
        this._learnClock();
        this.emit('change', this.data);
      };
      es.addEventListener('put', apply('put'));
      es.addEventListener('patch', apply('patch'));
      es.addEventListener('cancel', () => { this.emit('error', 'Permission denied by the database rules'); this.close(); });
      es.addEventListener('auth_revoked', () => this._ensureStream());
    }

    _learnClock() {
      const seen = getAt(this.data, `players/${this.me}/seen`);
      if (typeof seen === 'number' && this._hbSentAt && seen > (this._hbSeenMax || 0)) {
        this._hbSeenMax = seen;
        this.serverOffset = seen - this._hbSentAt;
      }
    }
    /** Best estimate of the relay's clock (ms). Good enough for countdowns shown on every phone. */
    now() { return Date.now() + this.serverOffset; }

    // --- writes: queued, retried with backoff, coalesced by key ---------------
    _enqueue(method, path, body, key) {
      if (key) this.queue = this.queue.filter(q => q.key !== key);
      const promise = new Promise((resolve, reject) => {
        this.queue.push({ method, path, body, key, resolve, reject, tries: 0 });
        this._drain();
      });
      promise.catch(() => {}); // callers may ignore the result; a rejected write on close must not be an unhandled rejection
      return promise;
    }
    async _drain() {
      if (this.sending || this.closed) return;
      this.sending = true;
      while (this.queue.length && !this.closed) {
        const job = this.queue[0];
        try {
          const res = await fetch(this.url(job.path, 'print=silent'), { method: job.method, headers: { 'Content-Type': 'application/json' }, body: job.method === 'DELETE' ? undefined : JSON.stringify(job.body), cache: 'no-store' });
          if (res.status === 401 || res.status === 403) { this.queue.shift(); job.reject(new Error('Permission denied')); this.emit('error', 'Permission denied by the database rules'); continue; }
          if (!res.ok && res.status !== 204) throw new Error('HTTP ' + res.status);
          this.queue.shift();
          job.resolve();
        } catch (e) {
          job.tries++;
          this.setStatus('offline');
          const wait = Math.min(30000, 1000 * Math.pow(2, Math.min(5, job.tries - 1))) * (0.8 + Math.random() * 0.4);
          await new Promise(r => setTimeout(r, wait));
        }
      }
      this.sending = false;
    }
    /** Replace the value at path (null deletes). `key` coalesces pending writes to the same thing. */
    set(path, value, key) { return this._enqueue('PUT', path, value === undefined ? null : value, key); }
    /** Merge several paths at once: update({ 'state/phase': 'day', 'acts': null }). */
    update(patch, key) { return this._enqueue('PATCH', '', patch, key); }
    remove(path) { return this._enqueue('DELETE', path, null); }
    get(path) { return getAt(this.data, path); }

    // --- presence --------------------------------------------------------------
    startHeartbeat() {
      const beat = () => { if (this.closed) return; this._hbSentAt = Date.now(); this.set(`players/${this.me}/seen`, SERVER_TIME, 'hb'); };
      beat();
      clearInterval(this._hb);
      this._hb = setInterval(beat, HEARTBEAT_MS);
    }
    isActive(pid) { const p = getAt(this.data, `players/${pid}`); return !!p && typeof p.seen === 'number' && (this.now() - p.seen) < STALE_MS; }

    close() {
      this.closed = true;
      clearInterval(this._hb);
      document.removeEventListener('visibilitychange', this._onVis);
      if (this.es) { try { this.es.close(); } catch (e) { /* ignore */ } this.es = null; }
      this.queue.forEach(j => j.reject(new Error('closed')));
      this.queue = [];
    }
  }

  /** Host: create a fresh room and return it connected. */
  async function createRoom(hostName) {
    const code = newCode();
    const room = new Room(code);
    const me = room.me;
    await fetch(room.url('', 'print=silent'), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meta: { host: me, game: 'lobby', created: SERVER_TIME, v: 1 }, players: { [me]: { name: hostName, joined: SERVER_TIME, seen: SERVER_TIME } } }) }).then(r => { if (!r.ok) throw new Error('Could not create room (HTTP ' + r.status + ')'); });
    await room.connect();
    room.startHeartbeat();
    return room;
  }

  /** Player: join (or rejoin) an existing room. Rejects with a readable message if the code is unknown. */
  async function joinRoom(code, name) {
    code = normaliseCode(code);
    if (!validCode(code)) throw new Error('A room code is 6 letters or numbers');
    const room = new Room(code);
    const snap = await room.connect();
    if (!snap || !snap.meta) { room.close(); throw new Error('No room with that code. Check it with the host.'); }
    const existing = getAt(snap, `players/${room.me}`);
    if (!existing) await room.set(`players/${room.me}`, { name, joined: SERVER_TIME, seen: SERVER_TIME });
    else if (name && existing.name !== name) await room.set(`players/${room.me}/name`, name);
    room.startHeartbeat();
    return room;
  }

  /** Quick reachability check for the settings screen. */
  async function ping() {
    if (!configured()) return { ok: false, reason: 'not configured' };
    try {
      const t = Date.now();
      const r = await fetch(`${base()}/rooms/PING00.json`, { cache: 'no-store' });
      return { ok: r.ok, ms: Date.now() - t, status: r.status };
    } catch (e) { return { ok: false, reason: e.message }; }
  }

  window.GP = window.GP || {};
  window.GP.net = { configured, createRoom, joinRoom, joinUrl, newCode, normaliseCode, validCode, playerId, ping, SERVER_TIME, getAt, STALE_MS };
})();
