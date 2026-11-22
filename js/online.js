/* Play together online: lobby with code + QR, and four games that run across every phone in the room.
 * The host's phone is the authority: it runs each game's logic (hostTick) and writes meta/state/priv;
 * every player writes only players/<me> and acts/<me>. Everything is derived from the room data, so a
 * refresh on any phone (including the host's) just resumes.
 */
(function () {
  'use strict';
  const { html, raw, route, go, on, toast, plural } = window.GP.ui;
  const net = window.GP.net;
  const store = window.GP.store;
  const audio = window.GP.audio;
  const DECKS = window.GP_DECKS;
  const SV = net.SERVER_TIME;

  const myName = () => store.getState('online.name', '');
  const setMyName = (n) => store.setState('online.name', n.trim().slice(0, 20));
  const saveRoomRef = (code) => store.setState('online.room', code ? { code, at: Date.now() } : null);

  let room = null;            // the live Room while on #/room/:code
  let pendingKey = null;      // host transition in flight (prevents double writes before the echo arrives)
  let deferRender = false;    // true while an input is focused
  let shown = false;          // my own role/word card is open (local only: no round trip to reveal or hide)
  let rerender = () => {};    // set by the room view

  // ---------------------------------------------------------------- shared helpers
  const players = (d) => Object.entries(d.players || {}).map(([pid, p]) => Object.assign({ pid }, p)).sort((a, b) => (a.joined || 0) - (b.joined || 0) || a.pid.localeCompare(b.pid));
  const nameOf = (d, pid) => (d.players && d.players[pid] && d.players[pid].name) || 'someone';
  const amHost = (d) => !!(d.meta && d.meta.host === room.me);
  const act = (d, pid) => (d.acts && d.acts[pid]) || {};
  const myPriv = (d) => (d.priv && d.priv[room.me]) || {};
  const dot = (pid) => html`<i class="dot ${room.isActive(pid) ? 'on' : ''}" title="${room.isActive(pid) ? 'online' : 'not seen recently'}"></i>`;
  const STATUS_LABEL = { connecting: 'Connecting…', live: 'Live', offline: 'Reconnecting…', ended: 'Room closed' };
  const topBar = (d, title) => html`
    <div class="row between online-top">
      <div><b>${title}</b> <span class="muted small">· room <kbd class="code sm">${room.code}</kbd></span></div>
      <div class="row"><span class="pill st-${room.status}">${STATUS_LABEL[room.status] || room.status}</span><a class="btn sm" href="#/online" data-action="leave">Leave</a></div>
    </div>`;
  const hostBar = (d, extra) => amHost(d) ? html`<div class="row" style="margin-top:.8rem">${extra || ''}<button type="button" class="btn sm" data-action="lobby">← Lobby</button><button type="button" class="btn sm danger" data-action="endroom">End room</button></div>` : '';
  const playerChips = (d, opts) => {
    opts = opts || {};
    return html`<div class="chips">${players(d).map(p => html`<span class="chip sm ${opts.mark && opts.mark(p.pid) ? 'on' : ''} ${opts.dim && opts.dim(p.pid) ? 'dim' : ''}">${dot(p.pid)}${p.name}${opts.suffix ? raw(opts.suffix(p.pid)) : ''}</span>`)}</div>`;
  };
  const pickGrid = (d, action, opts) => {
    opts = opts || {};
    return html`<div class="pick-grid">${players(d).filter(p => !opts.exclude || !opts.exclude(p.pid)).map(p => html`<button type="button" class="btn ${opts.chosen === p.pid ? 'primary' : ''}" data-action="${action}" data-pid="${p.pid}">${p.name}</button>`)}</div>`;
  };
  const inviteCard = (d, open) => html`
    <details class="card flat invite" ${open ? 'open' : ''}>
      <summary><b>Invite others</b> <span class="muted small">— code <kbd class="code sm">${room.code}</kbd></span></summary>
      <div class="center" style="margin-top:.6rem">
        <div class="qr">${raw(window.GP.qr.svg(net.joinUrl(room.code), { label: 'QR code to join room ' + room.code }))}</div>
        <p class="muted small">Scan, or open the site and enter the code.</p>
        <p class="muted small" style="word-break:break-all">${net.joinUrl(room.code)}</p>
        <button type="button" class="btn sm" data-action="share">Share link</button>
      </div>
    </details>`;

  // ---------------------------------------------------------------- GAMES
  const GAMES = {};

  // ===== IMPOSTER ==============================================================
  GAMES.imposter = {
    title: 'Imposter', min: 3, blurb: 'Everyone gets the secret word on their own phone. One does not.',
    setup: (d, cfg) => html`
      <label class="field">Word deck</label>
      <div class="chips">${['imposter', 'places', 'bollywood', 'twenty'].map(k => html`<button type="button" class="chip sm ${cfg.deck === k ? 'on' : ''}" data-action="cfg" data-k="deck" data-v="${k}">${DECKS[k].title}</button>`)}</div>
      <label class="field" style="margin-top:.6rem">Imposters</label>
      <div class="chips">${[1, 2].map(n => html`<button type="button" class="chip sm ${cfg.k === n ? 'on' : ''}" data-action="cfg" data-k="k" data-v="${n}">${n}</button>`)}</div>`,
    defaults: (d) => ({ deck: 'imposter', k: players(d).length >= 8 ? 2 : 1 }),
    start(d, cfg) {
      const ps = players(d);
      const k = Math.min(cfg.k, Math.floor((ps.length - 1) / 2)) || 1;
      const deck = DECKS[cfg.deck] ? cfg.deck : 'imposter';
      const it = window.GP.ui.pick(DECKS[deck].items);
      const item = typeof it === 'string' ? { word: it, category: DECKS[deck].title } : it;
      const order = window.GP.engine.shuffle(ps.map(p => p.pid));
      const imps = new Set(order.slice(0, k));
      const priv = {};
      ps.forEach(p => { priv[p.pid] = imps.has(p.pid) ? { role: 'imposter', category: item.category } : { role: 'crew', word: item.word, category: item.category }; });
      const prev = (d.state && d.state.scores) || {};
      return { 'meta/game': 'imposter', state: { deal: Date.now(), phase: 'reveal', round: ((d.state && d.state.round) || 0) + 1, category: item.category, word: null, k, deck, starter: window.GP.ui.pick(ps).pid, scores: prev, cfg }, priv, acts: null };
    },
    hostTick(d) {
      const s = d.state, ps = players(d);
      if (s.phase === 'vote') {
        const voted = ps.filter(p => act(d, p.pid).vote && act(d, p.pid).vote.round === s.round);
        if (voted.length >= ps.length) return GAMES.imposter.resolve(d);
      }
      return null;
    },
    resolve(d) {
      const s = d.state, ps = players(d);
      const tally = {};
      ps.forEach(p => { const v = act(d, p.pid).vote; if (v && v.round === s.round && v.pick) tally[v.pick] = (tally[v.pick] || 0) + 1; });
      const max = Math.max(0, ...Object.values(tally));
      const top = Object.keys(tally).filter(k => tally[k] === max);
      const accused = top.length === 1 ? top[0] : null;
      const imps = ps.filter(p => d.priv && d.priv[p.pid] && d.priv[p.pid].role === 'imposter').map(p => p.pid);
      const word = ps.map(p => d.priv && d.priv[p.pid] && d.priv[p.pid].word).find(Boolean) || '';
      return { 'state/phase': 'result', 'state/tally': tally, 'state/accused': accused, 'state/imposters': imps, 'state/word': word, 'state/caught': accused ? imps.includes(accused) : false, 'state/guess': null };
    },
    score(d, imposterWon) {
      const s = d.state, scores = Object.assign({}, s.scores || {});
      players(d).forEach(p => { const isImp = (s.imposters || []).includes(p.pid); if (imposterWon ? isImp : !isImp) scores[p.pid] = (scores[p.pid] || 0) + (imposterWon ? 2 : 1); });
      return { 'state/scores': scores, 'state/phase': 'done', 'state/imposterWon': imposterWon };
    },
    view(d) {
      const s = d.state, me = myPriv(d), host = amHost(d), ps = players(d);
      const seen = ps.filter(p => act(d, p.pid).seen === s.round);
      const voted = ps.filter(p => act(d, p.pid).vote && act(d, p.pid).vote.round === s.round);
      const mine = act(d, room.me);
      let body;
      if (s.phase === 'reveal') {
        body = html`
          ${shown ? (me.role === 'imposter'
            ? html`<div class="reveal imposter" style="min-height:40vh"><div class="role">IMPOSTER</div><p>You don't know the word. Category: <b>${s.category}</b>. Listen, blend in, work it out.</p><button type="button" class="btn big" data-action="hide">Hide</button></div>`
            : html`<div class="reveal word" style="min-height:40vh"><p class="muted">The secret word is</p><div class="role">${me.word}</div><p class="muted">Category: ${s.category}</p><button type="button" class="btn big" data-action="hide">Hide</button></div>`)
            : html`<div class="reveal hidden-role" style="min-height:40vh"><p class="muted">Round ${s.round}</p><div class="role">Your word is ready</div><button type="button" class="btn primary big" data-action="show">Tap to see it</button><p class="muted small">Keep the screen to yourself.</p></div>`}
          <p class="muted small center" style="margin-top:.6rem">${seen.length} of ${ps.length} have looked.</p>
          ${host ? html`<button type="button" class="btn primary big" data-action="phase" data-v="discuss">Start discussion →</button>` : ''}`;
      } else if (s.phase === 'discuss') {
        body = html`
          <section class="card center"><p class="muted">Category</p><h2>${s.category}</h2><p><b>${nameOf(d, s.starter)}</b> starts. One clue word each, go round the circle twice.</p>
          ${me.role === 'imposter' ? html`<p class="callout">You are the imposter. Bluff.</p>` : html`<p class="muted small">Your word: tap to peek</p><button type="button" class="btn sm" data-action="peek">${shown ? me.word : 'Show my word'}</button>`}</section>
          ${host ? html`<button type="button" class="btn primary big" data-action="phase" data-v="vote">Start voting →</button>` : ''}`;
      } else if (s.phase === 'vote') {
        body = html`
          <section class="card"><h3>Who is the imposter?</h3>${pickGrid(d, 'vote', { exclude: pid => pid === room.me, chosen: mine.vote && mine.vote.round === s.round ? mine.vote.pick : null })}
          <p class="muted small" style="margin-top:.6rem">${voted.length} of ${ps.length} voted.</p></section>
          ${host ? html`<button type="button" class="btn big" data-action="closeVote">Close voting now</button>` : ''}`;
      } else if (s.phase === 'result') {
        const bars = ps.map(p => ({ p, n: (s.tally || {})[p.pid] || 0 })).sort((a, b) => b.n - a.n);
        body = html`
          <section class="card">
            ${s.accused ? html`<h2>${nameOf(d, s.accused)} was accused${s.caught ? ' — and IS the imposter!' : ' — but is innocent.'}</h2>` : html`<h2>No majority.</h2>`}
            <div class="bars">${bars.map(b => html`<div class="bar-row"><span>${b.p.name}</span><div class="bar"><i style="width:${Math.round(100 * b.n / Math.max(1, ps.length))}%"></i></div><b>${b.n}</b></div>`)}</div>
            <p style="margin-top:.6rem">Imposter${(s.imposters || []).length > 1 ? 's' : ''}: <b>${(s.imposters || []).map(pid => nameOf(d, pid)).join(', ')}</b>. The word was <b>${s.word}</b>.</p>
            ${s.caught ? html`<p class="callout">Imposter: say your guess for the word out loud.</p>` : ''}
          </section>
          ${host ? (s.caught
            ? html`<div class="grid-2"><button type="button" class="btn ok big" data-action="guess" data-v="1">Guess was right</button><button type="button" class="btn danger big" data-action="guess" data-v="0">Guess was wrong</button></div>`
            : s.accused ? html`<button type="button" class="btn primary big" data-action="guess" data-v="1">Imposter wins this round →</button>`
            : html`<div class="grid-2"><button type="button" class="btn big" data-action="revote">Vote again</button><button type="button" class="btn primary big" data-action="guess" data-v="1">Imposter wins →</button></div>`) : ''}`;
      } else { // done
        const sc = players(d).map(p => ({ p, n: (s.scores || {})[p.pid] || 0 })).sort((a, b) => b.n - a.n);
        body = html`
          <section class="card center"><h2>${s.imposterWon ? 'Imposter wins' : 'Crew wins'}</h2><p class="muted">The word was <b>${s.word}</b>.</p></section>
          <section class="card"><h3>Scores</h3>${sc.map(x => html`<div class="score-row"><span class="name">${x.p.name}</span><span class="val">${x.n}</span></div>`)}</section>
          ${host ? html`<button type="button" class="btn primary big" data-action="again">Next round →</button>` : ''}`;
      }
      return body;
    },
    actions(d) {
      const s = d.state;
      on('show', () => { shown = true; rerender(); if (act(d, room.me).seen !== s.round) room.set(`acts/${room.me}/seen`, s.round); });
      on('hide', () => { shown = false; rerender(); });
      on('peek', () => { shown = !shown; rerender(); });
      on('vote', (el) => { room.set(`acts/${room.me}/vote`, { round: s.round, pick: el.dataset.pid }); audio.ding(); });
      on('phase', (el) => hostWrite({ 'state/phase': el.dataset.v }));
      on('closeVote', () => hostWrite(GAMES.imposter.resolve(d)));
      on('guess', (el) => hostWrite(GAMES.imposter.score(d, el.dataset.v === '1')));
      on('revote', () => { const patch = { 'state/phase': 'vote', 'state/tally': null, 'state/accused': null }; players(d).forEach(p => { patch[`acts/${p.pid}/vote`] = null; }); hostWrite(patch); });
      on('again', () => hostWrite(GAMES.imposter.start(d, s.cfg || GAMES.imposter.defaults(d))));
    }
  };

  // ===== MAFIA (silent night) ====================================================
  const ROLE_TEXT = {
    mafia: ['MAFIA', 'Each night, pick someone to eliminate. By day, act innocent.'],
    doctor: ['DOCTOR', 'Each night, pick someone to protect. You may protect yourself.'],
    detective: ['DETECTIVE', 'Each night, check one person: your phone tells you if they are Mafia.'],
    villager: ['VILLAGER', 'No powers. Watch, listen, and vote out the Mafia by day.']
  };
  GAMES.mafia = {
    title: 'Mafia', min: 5, blurb: 'Roles on each phone. Nights are silent: Mafia, Doctor and Detective tap, nobody closes their eyes.',
    defaults: (d) => { const n = players(d).length; return { mafia: Math.max(1, Math.floor(n / 4)), doctor: n >= 5, detective: n >= 6 }; },
    setup: (d, cfg) => html`
      <div class="row between"><span>Mafia</span><div class="row"><button type="button" class="btn sm" data-action="cfg" data-k="mafia" data-v="${Math.max(1, cfg.mafia - 1)}">−</button><b style="min-width:2ch;text-align:center">${cfg.mafia}</b><button type="button" class="btn sm" data-action="cfg" data-k="mafia" data-v="${Math.min(Math.floor((players(d).length - 1) / 2), cfg.mafia + 1)}">+</button></div></div>
      <div class="row between" style="margin-top:.4rem"><span>Doctor</span><button type="button" class="chip sm ${cfg.doctor ? 'on' : ''}" data-action="cfg" data-k="doctor" data-v="${cfg.doctor ? '' : '1'}">${cfg.doctor ? 'Yes' : 'No'}</button></div>
      <div class="row between" style="margin-top:.4rem"><span>Detective</span><button type="button" class="chip sm ${cfg.detective ? 'on' : ''}" data-action="cfg" data-k="detective" data-v="${cfg.detective ? '' : '1'}">${cfg.detective ? 'Yes' : 'No'}</button></div>`,
    start(d, cfg) {
      const ps = players(d);
      const roles = [];
      for (let i = 0; i < Math.max(1, Math.min(cfg.mafia, Math.floor((ps.length - 1) / 2))); i++) roles.push('mafia');
      if (cfg.doctor) roles.push('doctor');
      if (cfg.detective) roles.push('detective');
      while (roles.length < ps.length) roles.push('villager');
      const dealt = window.GP.engine.shuffle(roles);
      const priv = {}, alive = {};
      ps.forEach((p, i) => { priv[p.pid] = { role: dealt[i] }; alive[p.pid] = true; });
      const mates = ps.filter((p, i) => dealt[i] === 'mafia').map(p => p.pid);
      mates.forEach(pid => { priv[pid].mates = mates.filter(m => m !== pid); });
      return { 'meta/game': 'mafia', state: { deal: Date.now(), phase: 'reveal', night: 0, alive, log: [], cfg, order: ps.map(p => p.pid) }, priv, acts: null };
    },
    roleOf: (d, pid) => (d.priv && d.priv[pid] && d.priv[pid].role) || 'villager',
    livingWith: (d, role) => players(d).filter(p => d.state.alive[p.pid] && GAMES.mafia.roleOf(d, p.pid) === role),
    winner(d) {
      const alive = players(d).filter(p => d.state.alive[p.pid]);
      const m = alive.filter(p => GAMES.mafia.roleOf(d, p.pid) === 'mafia').length;
      if (m === 0) return 'village';
      if (m >= alive.length - m) return 'mafia';
      return null;
    },
    hostTick(d) {
      const s = d.state, M = GAMES.mafia;
      const alive = players(d).filter(p => s.alive[p.pid]);
      if (s.phase === 'night') {
        const done = alive.every(p => { const a = act(d, p.pid).night; return a && a.n === s.night; });
        if (done) return M.resolveNight(d);
      } else if (s.phase === 'vote') {
        const done = alive.every(p => { const a = act(d, p.pid).vote; return a && a.n === s.night; });
        if (done) return M.resolveVote(d);
      }
      return null;
    },
    resolveNight(d) {
      const s = d.state, M = GAMES.mafia;
      const lead = M.livingWith(d, 'mafia')[0];
      const pick = lead ? (act(d, lead.pid).night || {}).pick || null : null;
      const doc = M.livingWith(d, 'doctor')[0];
      const save = doc ? (act(d, doc.pid).night || {}).pick || null : null;
      const det = M.livingWith(d, 'detective')[0];
      const died = pick && pick !== save && s.alive[pick] ? pick : null;
      const patch = { 'state/phase': 'day', 'state/lastNight': { n: s.night, died } };
      if (died) patch[`state/alive/${died}`] = false;
      patch[`state/log/${s.log ? s.log.length : 0}`] = `Night ${s.night}: ${died ? nameOf(d, died) + ' was killed' : 'nobody died'}`;
      if (det) { const t = (act(d, det.pid).night || {}).pick; if (t) patch[`priv/${det.pid}/checks/${s.night}`] = { target: t, mafia: M.roleOf(d, t) === 'mafia' }; }
      const after = JSON.parse(JSON.stringify(d)); if (died) after.state.alive[died] = false;
      const w = M.winner(after); if (w) { patch['state/phase'] = 'over'; patch['state/winner'] = w; }
      return patch;
    },
    resolveVote(d) {
      const s = d.state, M = GAMES.mafia;
      const alive = players(d).filter(p => s.alive[p.pid]);
      const tally = {};
      alive.forEach(p => { const v = act(d, p.pid).vote; if (v && v.n === s.night && v.pick && v.pick !== 'skip') tally[v.pick] = (tally[v.pick] || 0) + 1; });
      const max = Math.max(0, ...Object.values(tally));
      const top = Object.keys(tally).filter(k => tally[k] === max);
      const out = top.length === 1 && max > 0 ? top[0] : null;
      const patch = { 'state/phase': 'verdict', 'state/verdict': { n: s.night, out, role: out ? M.roleOf(d, out) : null, tally } };
      if (out) patch[`state/alive/${out}`] = false;
      patch[`state/log/${s.log ? s.log.length : 0}`] = `Day ${s.night}: ${out ? nameOf(d, out) + ' voted out (' + M.roleOf(d, out) + ')' : 'no one voted out'}`;
      const after = JSON.parse(JSON.stringify(d)); if (out) after.state.alive[out] = false;
      const w = M.winner(after); if (w) { patch['state/winner'] = w; }
      return patch;
    },
    view(d) {
      const s = d.state, M = GAMES.mafia, me = myPriv(d), host = amHost(d), ps = players(d);
      const role = me.role || 'villager';
      s.alive = s.alive || {};
      const alive = ps.filter(p => s.alive[p.pid]);
      const iAmAlive = !!s.alive[room.me];
      const mine = act(d, room.me);
      const status = html`<p class="muted small">Alive ${alive.length} of ${ps.length} · ${s.phase === 'reveal' ? 'Dealing roles' : (s.phase === 'night' ? 'Night' : 'Day') + ' ' + s.night}</p>`;
      const roleCard = html`<div class="reveal ${role === 'mafia' ? 'mafia' : role === 'villager' ? 'village' : 'special'}" style="min-height:36vh"><p class="muted">You are</p><div class="role">${ROLE_TEXT[role][0]}</div><p>${ROLE_TEXT[role][1]}</p>${role === 'mafia' && me.mates && me.mates.length ? html`<p class="small">Other Mafia: ${me.mates.map(pid => nameOf(d, pid)).join(', ')}</p>` : ''}<button type="button" class="btn big" data-action="hide">Hide</button></div>`;
      let body;
      if (s.phase === 'reveal') {
        const seen = ps.filter(p => act(d, p.pid).seen === 'r');
        body = html`${shown ? roleCard : html`<div class="reveal hidden-role" style="min-height:36vh"><div class="role">Your role is ready</div><button type="button" class="btn primary big" data-action="show">Tap to see it</button></div>`}
          <p class="muted small center" style="margin-top:.6rem">${seen.length} of ${ps.length} have looked.</p>
          ${host ? html`<button type="button" class="btn primary big" data-action="night">Night 1 begins →</button>` : ''}`;
      } else if (s.phase === 'night') {
        const myNight = mine.night && mine.night.n === s.night ? mine.night : null;
        const chosen = myNight ? myNight.pick : null;
        const waiting = alive.filter(p => !(act(d, p.pid).night && act(d, p.pid).night.n === s.night));
        let task;
        if (!iAmAlive) task = html`<section class="card center"><p class="muted">You are dead. Watch quietly.</p></section>`;
        else if (role === 'mafia') {
          const mates = M.livingWith(d, 'mafia');
          const lead = mates[0];
          task = html`<section class="card"><h3>Mafia: choose your victim</h3>${pickGrid(d, 'night', { exclude: pid => !s.alive[pid] || M.roleOf(d, pid) === 'mafia', chosen })}
            ${mates.length > 1 ? html`<p class="muted small" style="margin-top:.5rem">${mates.map(m => `${m.name}: ${(act(d, m.pid).night && act(d, m.pid).night.n === s.night) ? nameOf(d, act(d, m.pid).night.pick) : '…'}`).join(' · ')}. If you disagree, <b>${lead.name}</b>'s choice counts.</p>` : ''}</section>`;
        } else if (role === 'doctor') task = html`<section class="card"><h3>Doctor: who do you protect?</h3>${pickGrid(d, 'night', { exclude: pid => !s.alive[pid], chosen })}</section>`;
        else if (role === 'detective') task = html`<section class="card"><h3>Detective: who do you check?</h3>${pickGrid(d, 'night', { exclude: pid => !s.alive[pid] || pid === room.me, chosen })}</section>`;
        else task = html`<section class="card"><h3>Who do you suspect?</h3><p class="muted small">Everyone taps at night, so nobody can tell who the special roles are.</p>${pickGrid(d, 'night', { exclude: pid => !s.alive[pid] || pid === room.me, chosen })}</section>`;
        body = html`<section class="card center flat night"><h2>🌙 Night ${s.night}</h2><p class="muted">Silence. Look only at your own phone.</p></section>${task}
          <p class="muted small center">Waiting for ${waiting.length ? waiting.map(p => p.name).join(', ') : 'nobody'}.</p>
          ${host && waiting.length ? html`<button type="button" class="btn sm block" data-action="forceNight">End the night without them</button>` : ''}`;
      } else if (s.phase === 'day' || s.phase === 'vote' || s.phase === 'verdict') {
        const ln = s.lastNight || {};
        const check = me.checks && me.checks[s.night];
        const dayCard = html`<section class="card center"><h2>☀️ Day ${s.night}</h2><p>${ln.died ? html`<b>${nameOf(d, ln.died)}</b> was killed in the night.` : html`Nobody died. The doctor did their job.`}</p>
          ${check ? html`<p class="callout">Detective: <b>${nameOf(d, check.target)}</b> is ${check.mafia ? html`<b style="color:var(--danger)">MAFIA</b>` : 'not Mafia'}.</p>` : ''}</section>`;
        if (s.phase === 'day') body = html`${dayCard}<section class="card"><p>Discuss. Accuse. Defend.</p>${playerChips(d, { dim: pid => !s.alive[pid] })}</section>${host ? html`<button type="button" class="btn primary big" data-action="vote-start">Open the vote →</button>` : ''}`;
        else if (s.phase === 'vote') {
          const myVote = mine.vote && mine.vote.n === s.night ? mine.vote.pick : null;
          const voted = alive.filter(p => act(d, p.pid).vote && act(d, p.pid).vote.n === s.night);
          body = html`${dayCard}${iAmAlive ? html`<section class="card"><h3>Vote someone out</h3>${pickGrid(d, 'vote', { exclude: pid => !s.alive[pid] || pid === room.me, chosen: myVote })}<button type="button" class="btn sm block ${myVote === 'skip' ? 'primary' : ''}" data-action="vote" data-pid="skip" style="margin-top:.5rem">Skip (vote for no one)</button></section>` : html`<section class="card center"><p class="muted">You are dead; the living vote.</p></section>`}
            <p class="muted small center">${voted.length} of ${alive.length} voted.</p>${host ? html`<button type="button" class="btn sm block" data-action="closeVote">Close the vote now</button>` : ''}`;
        } else {
          const v = s.verdict || {};
          body = html`<section class="card center">${v.out ? html`<h2>${nameOf(d, v.out)} was voted out.</h2><p>They were <b>${ROLE_TEXT[v.role][0]}</b>.</p>` : html`<h2>No one was voted out.</h2>`}</section>
            ${s.winner ? html`<div class="reveal ${s.winner === 'mafia' ? 'mafia' : 'village'}" style="min-height:30vh"><div class="role">${s.winner === 'mafia' ? 'MAFIA WIN' : 'VILLAGE WINS'}</div><p class="small">${ps.map(p => `${p.name}: ${M.roleOf(d, p.pid)}`).join(' · ')}</p></div>${host ? html`<button type="button" class="btn primary big" data-action="again">Play again →</button>` : ''}`
              : (host ? html`<button type="button" class="btn primary big" data-action="night">Night ${s.night + 1} →</button>` : '')}`;
        }
      } else if (s.phase === 'over') {
        body = html`<div class="reveal ${s.winner === 'mafia' ? 'mafia' : 'village'}"><div class="role">${s.winner === 'mafia' ? 'MAFIA WIN' : 'VILLAGE WINS'}</div><p class="small">${ps.map(p => `${p.name}: ${M.roleOf(d, p.pid)}`).join(' · ')}</p></div>${host ? html`<button type="button" class="btn primary big" data-action="again">Play again →</button>` : ''}`;
      }
      return html`${status}${body}${s.phase !== 'reveal' && iAmAlive ? html`<p class="center" style="margin-top:.6rem"><button type="button" class="btn sm" data-action="peekrole">${shown ? 'Hide my role' : 'Show my role'}</button></p>${shown ? roleCard : ''}` : ''}
        ${s.log && s.log.length ? html`<details class="card flat"><summary class="muted">Game log</summary><ul class="plain">${s.log.map(l => html`<li>${l}</li>`)}</ul></details>` : ''}`;
    },
    actions(d) {
      const s = d.state, M = GAMES.mafia;
      on('show', () => { shown = true; rerender(); if (act(d, room.me).seen !== 'r') room.set(`acts/${room.me}/seen`, 'r'); });
      on('hide', () => { shown = false; rerender(); });
      on('peekrole', () => { shown = !shown; rerender(); });
      on('vote-start', () => hostWrite({ 'state/phase': 'vote' }));
      on('closeVote', () => hostWrite(M.resolveVote(d)));
      on('forceNight', () => hostWrite(M.resolveNight(d)));
      on('again', () => hostWrite(M.start(d, s.cfg || M.defaults(d))));
      on('vote', (el) => { room.set(`acts/${room.me}/vote`, { n: s.night, pick: el.dataset.pid }); audio.tick(); });
      // "night" is both the host's "Night N begins" button (no pid) and a player's night pick (with pid)
      on('night', (el) => { if (el && el.dataset.pid) { room.set(`acts/${room.me}/night`, { n: s.night, pick: el.dataset.pid }); audio.tick(); } else hostWrite({ 'state/phase': 'night', 'state/night': s.night + 1, 'state/verdict': null }); });
    }
  };

  // ===== QUICK VOTE =============================================================
  GAMES.vote = {
    title: 'Quick Vote', min: 2, blurb: 'Would-you-rather and "most likely to" — everyone votes, results pop up instantly.',
    defaults: () => ({ deck: 'wouldyourather' }),
    setup: (d, cfg) => html`<label class="field">Questions</label><div class="chips">${[['wouldyourather', 'Would You Rather'], ['mostlikely', 'Most Likely To'], ['custom', 'My own question']].map(([k, t]) => html`<button type="button" class="chip sm ${cfg.deck === k ? 'on' : ''}" data-action="cfg" data-k="deck" data-v="${k}">${t}</button>`)}</div>`,
    start(d, cfg) {
      const q = GAMES.vote.nextQuestion(d, cfg);
      return { 'meta/game': 'vote', state: Object.assign({ qid: 1, cfg }, q), acts: null };
    },
    nextQuestion(d, cfg, custom) {
      if (cfg.deck === 'mostlikely') return { mode: 'people', q: window.GP.ui.pick(DECKS.mostlikely.items), options: null };
      if (cfg.deck === 'custom') return { mode: 'ab', q: custom || 'Type a question', options: ['Yes', 'No'] };
      const raw = window.GP.ui.pick(DECKS.wouldyourather.items);
      const m = raw.match(/^Would you rather (.+?) or (.+?)\??$/i);
      return { mode: 'ab', q: raw, options: m ? [m[1], m[2]] : ['A', 'B'] };
    },
    hostTick() { return null; },
    view(d) {
      const s = d.state, host = amHost(d), ps = players(d);
      const mine = act(d, room.me);
      const my = mine.vote && mine.vote.qid === s.qid ? mine.vote.choice : null;
      const votes = ps.map(p => act(d, p.pid).vote).filter(v => v && v.qid === s.qid);
      const tally = {}; votes.forEach(v => { tally[v.choice] = (tally[v.choice] || 0) + 1; });
      const opts = s.mode === 'people' ? ps.map(p => ({ key: p.pid, label: p.name })) : s.options.map((o, i) => ({ key: String(i), label: o }));
      return html`
        <section class="card center"><p class="muted">Question ${s.qid}</p><h2 class="q">${s.q}</h2></section>
        <section class="card">
          <div class="pick-grid">${opts.map(o => html`<button type="button" class="btn ${my === o.key ? 'primary' : ''}" data-action="vote" data-v="${o.key}">${o.label}</button>`)}</div>
          <div class="bars" style="margin-top:.8rem">${opts.map(o => html`<div class="bar-row"><span>${o.label}</span><div class="bar"><i style="width:${Math.round(100 * (tally[o.key] || 0) / Math.max(1, votes.length))}%"></i></div><b>${tally[o.key] || 0}</b></div>`)}</div>
          <p class="muted small center" style="margin-top:.4rem">${votes.length} of ${ps.length} voted</p>
        </section>
        ${host ? html`${s.cfg.deck === 'custom' ? html`<input class="text" id="customq" placeholder="Next question…" style="margin-bottom:.6rem">` : ''}<button type="button" class="btn primary big" data-action="next">Next question →</button>` : ''}`;
    },
    actions(d) {
      const s = d.state;
      on('vote', (el) => { room.set(`acts/${room.me}/vote`, { qid: s.qid, choice: el.dataset.v }); audio.tick(); });
      on('next', () => { const inp = document.getElementById('customq'); const q = GAMES.vote.nextQuestion(d, s.cfg, inp && inp.value.trim()); hostWrite(Object.assign({ 'state/qid': s.qid + 1 }, Object.fromEntries(Object.entries(q).map(([k, v]) => ['state/' + k, v])), { acts: null })); });
    }
  };

  // ===== BUZZER ================================================================
  GAMES.buzz = {
    title: 'Buzzer', min: 2, blurb: 'The host asks questions out loud. Fastest finger buzzes in. Server-timed, so it is fair.',
    defaults: () => ({}),
    setup: () => html`<p class="muted">Ask questions aloud, or read from any quiz. Points are kept here.</p>`,
    start(d) { return { 'meta/game': 'buzz', state: { round: 1, scores: (d.state && d.state.scores) || {}, locked: {} }, acts: null }; },
    hostTick() { return null; },
    order(d) {
      const s = d.state;
      return players(d).map(p => ({ p, b: act(d, p.pid).buzz })).filter(x => x.b && x.b.round === s.round && typeof x.b.t === 'number' && !(s.locked && s.locked[x.p.pid])).sort((a, b) => a.b.t - b.b.t);
    },
    view(d) {
      const s = d.state, host = amHost(d);
      const order = GAMES.buzz.order(d);
      const first = order[0];
      const mine = act(d, room.me).buzz;
      const iBuzzed = mine && mine.round === s.round;
      const lockedMe = s.locked && s.locked[room.me];
      const myPos = order.findIndex(x => x.p.pid === room.me);
      const sc = players(d).map(p => ({ p, n: (s.scores || {})[p.pid] || 0 })).sort((a, b) => b.n - a.n);
      return html`
        <section class="card center">
          <p class="muted">Round ${s.round}</p>
          ${first ? html`<h2 class="buzz-first">${first.p.name} buzzed first!</h2>${order.length > 1 ? html`<p class="muted small">then ${order.slice(1).map((x, i) => `${x.p.name} (+${x.b.t - first.b.t} ms)`).join(', ')}</p>` : ''}` : html`<h2 class="muted">Waiting for a buzz…</h2>`}
        </section>
        ${lockedMe ? html`<button type="button" class="btn big" disabled>Locked out this round</button>`
          : iBuzzed ? html`<button type="button" class="btn big ${myPos === 0 ? 'ok' : ''}" disabled>${myPos === 0 ? 'You are first!' : 'You are #' + (myPos + 1)}</button>`
          : html`<button type="button" class="btn primary big buzz-btn" data-action="buzz">BUZZ</button>`}
        ${host ? html`<div class="grid-3" style="margin-top:.8rem"><button type="button" class="btn ok" data-action="correct" ${first ? '' : 'disabled'}>Correct +1</button><button type="button" class="btn danger" data-action="wrong" ${first ? '' : 'disabled'}>Wrong</button><button type="button" class="btn" data-action="reset">New round</button></div>` : ''}
        <section class="card" style="margin-top:.8rem"><h3>Scores</h3>${sc.map(x => html`<div class="score-row"><span class="name">${x.p.name}</span>${host ? html`<button type="button" class="btn" data-action="minus" data-pid="${x.p.pid}">−</button>` : ''}<span class="val">${x.n}</span>${host ? html`<button type="button" class="btn" data-action="plus" data-pid="${x.p.pid}">+</button>` : ''}</div>`)}</section>`;
    },
    actions(d) {
      const s = d.state;
      on('buzz', () => { room.set(`acts/${room.me}/buzz`, { round: s.round, t: SV }, 'buzz'); audio.boop(); });
      on('correct', () => { const f = GAMES.buzz.order(d)[0]; if (!f) return; hostWrite({ [`state/scores/${f.p.pid}`]: ((s.scores || {})[f.p.pid] || 0) + 1, 'state/round': s.round + 1, 'state/locked': null, acts: null }); audio.ding(); });
      on('wrong', () => { const f = GAMES.buzz.order(d)[0]; if (!f) return; hostWrite({ [`state/locked/${f.p.pid}`]: true }); audio.buzzer(); });
      on('reset', () => hostWrite({ 'state/round': s.round + 1, 'state/locked': null, acts: null }));
      on('plus', (el) => hostWrite({ [`state/scores/${el.dataset.pid}`]: ((s.scores || {})[el.dataset.pid] || 0) + 1 }));
      on('minus', (el) => hostWrite({ [`state/scores/${el.dataset.pid}`]: ((s.scores || {})[el.dataset.pid] || 0) - 1 }));
    }
  };

  // ---------------------------------------------------------------- host authority
  function hostWrite(patch) {
    if (!patch) return;
    pendingKey = JSON.stringify(patch).slice(0, 120);
    room.update(patch).catch(e => toast(e.message));
  }
  function hostLoop(d) {
    if (!amHost(d) || !d.meta || !d.state) return;
    const g = GAMES[d.meta.game];
    if (!g || !g.hostTick) return;
    const patch = g.hostTick(d);
    if (!patch) { pendingKey = null; return; }
    const key = JSON.stringify(patch).slice(0, 120);
    if (key === pendingKey) return; // already sent, waiting for the echo
    hostWrite(patch);
  }

  // ---------------------------------------------------------------- views
  route('#/online', (params, query) => {
    const saved = store.getState('online.room', null);
    const ok = net.configured();
    return {
      html: html`
        <h2>Play together</h2>
        ${ok ? html`
          <section class="card">
            <label class="field" for="nm">Your name</label>
            <input class="text" id="nm" maxlength="20" value="${myName()}" placeholder="e.g. Ravi" autocomplete="nickname">
            <div class="grid-2" style="margin-top:.8rem">
              <button type="button" class="btn primary big" data-action="host">Host a room</button>
              <button type="button" class="btn big" data-action="joinOpen">Join with code</button>
            </div>
            <div id="joinbox" class="${query.join ? '' : 'hidden'}" style="margin-top:.8rem">
              <input class="text" id="code" maxlength="6" autocapitalize="characters" autocomplete="off" placeholder="6-letter code" value="${query.join || ''}" style="font-size:1.4rem;letter-spacing:.2em;text-transform:uppercase">
              <button type="button" class="btn primary block" data-action="join" style="margin-top:.5rem">Join</button>
            </div>
            ${saved && saved.code ? html`<p class="muted small" style="margin-top:.8rem">Last room: <a href="#/room/${saved.code}">${saved.code}</a></p>` : ''}
            <p class="muted small" style="margin-top:.6rem" id="netinfo"></p>
          </section>
          <section class="card flat"><h3>How it works</h3><p class="muted small">One phone hosts and shows a code or QR. Everyone else opens this site and joins. Each game runs on all phones at once: secret roles land on the right phone, votes and buzzes count instantly. Uses a few kilobytes per minute, so it works on a weak signal.</p>
            <div class="tags">${Object.entries(GAMES).map(([k, g]) => html`<span class="tag">${g.title} · ${g.min}+ players</span>`)}</div></section>`
          : html`<section class="card"><h3>Not switched on yet</h3><p>Playing together needs a tiny live server so phones can see each other. Set <code>relayUrl</code> in <code>js/config.js</code> — MULTIPLAYER.md has the five-minute setup for a free Firebase database, or run <code>node tools/relay.js</code> on a laptop hotspot for a no-internet game night.</p></section>`}`,
      onMount() {
        const nm = () => { const v = (document.getElementById('nm').value || '').trim(); if (!v) { toast('Type your name first'); document.getElementById('nm').focus(); return null; } setMyName(v); return v.slice(0, 20); };
        on('host', async (el) => {
          const name = nm(); if (!name) return;
          el.disabled = true; el.textContent = 'Creating…';
          try { const r = await net.createRoom(name); r.close(); saveRoomRef(r.code); go('#/room/' + r.code); }
          catch (e) { toast(e.message); el.disabled = false; el.textContent = 'Host a room'; }
        });
        on('joinOpen', () => { document.getElementById('joinbox').classList.remove('hidden'); document.getElementById('code').focus(); });
        on('join', async (el) => {
          const name = nm(); if (!name) return;
          const code = net.normaliseCode(document.getElementById('code').value);
          if (!net.validCode(code)) { toast('Codes are 6 letters or numbers'); return; }
          el.disabled = true; el.textContent = 'Joining…';
          try { const r = await net.joinRoom(code, name); r.close(); saveRoomRef(code); go('#/room/' + code); }
          catch (e) { toast(e.message); el.disabled = false; el.textContent = 'Join'; }
        });
        if (ok) net.ping().then(p => { const el = document.getElementById('netinfo'); if (el) el.textContent = p.ok ? `Server reachable (${p.ms} ms)` : 'Server not reachable right now: ' + (p.reason || 'HTTP ' + p.status); });
      }
    };
  });

  // QR / link target: remember the code, collect a name if needed, join.
  route('#/join/:code', (params) => {
    const code = net.normaliseCode(params.code);
    if (myName()) { net.joinRoom(code, myName()).then(r => { r.close(); saveRoomRef(code); go('#/room/' + code); }).catch(e => { toast(e.message); go('#/online?join=' + code); }); return html`<section class="card center"><p>Joining room ${code}…</p></section>`; }
    go('#/online?join=' + code);
    return html``;
  });

  route('#/room/:code', (params) => {
    const code = net.normaliseCode(params.code);
    if (!net.configured()) { go('#/online'); return html``; }
    let cfg = null; // host's pending game config in the lobby
    let unsub = [];
    const app = () => document.getElementById('app');

    function render() {
      if (!room) return;
      if (deferRender) return;
      const d = room.data || {};
      // A new deal (game started, next round) closes any open role card.
      const roundKey = d.meta && d.state ? `${d.meta.game}:${d.state.deal || ''}:${d.state.phase === 'reveal'}` : 'lobby'; // leaving the reveal phase closes the card too
      if (roundKey !== lastRoundKey) { lastRoundKey = roundKey; shown = false; }
      let body;
      if (room.status === 'ended' || !d.meta) {
        body = html`<section class="card center"><h2>This room has ended</h2><a class="btn primary" href="#/online">Back</a></section>`;
      } else {
        const host = amHost(d);
        const gameId = d.meta.game;
        const g = GAMES[gameId];
        if (!g || !d.state) {
          // Lobby
          const ps = players(d);
          if (host && !cfg) cfg = null;
          body = html`
            ${topBar(d, 'Lobby')}
            ${host ? inviteCard(d, true) : ''}
            <section class="card">
              <h3>${plural(ps.length, 'player')} ${host ? '' : html`<span class="muted small">· host: ${nameOf(d, d.meta.host)}</span>`}</h3>
              <div class="chips">${ps.map(p => html`<span class="chip sm">${dot(p.pid)}${p.name}${p.pid === d.meta.host ? ' 👑' : ''}${host && p.pid !== room.me ? html` <button type="button" class="kick" data-action="kick" data-pid="${p.pid}" aria-label="remove ${p.name}">×</button>` : ''}</span>`)}</div>
            </section>
            ${host ? (cfg ? html`
              <section class="card">
                <div class="row between"><h3 style="margin:0">${GAMES[cfg.game].title}</h3><button type="button" class="btn sm" data-action="cancelcfg">Back</button></div>
                <p class="muted small">${GAMES[cfg.game].blurb}</p>
                ${GAMES[cfg.game].setup(d, cfg)}
                <button type="button" class="btn primary big" data-action="start" style="margin-top:.9rem" ${ps.length < GAMES[cfg.game].min ? 'disabled' : ''}>Start with ${plural(ps.length, 'player')}</button>
                ${ps.length < GAMES[cfg.game].min ? html`<p class="muted small center">Needs at least ${GAMES[cfg.game].min}.</p>` : ''}
              </section>` : html`
              <h3 style="margin-top:.4rem">Pick a game</h3>
              <div class="tiles">${Object.entries(GAMES).map(([k, gg]) => html`<button type="button" class="tile ${k === 'imposter' ? 'lemon' : k === 'mafia' ? 'grape' : k === 'vote' ? 'sky' : 'mint'}" data-action="choose" data-v="${k}"><b>${gg.title}</b><span>${gg.min}+ players</span></button>`)}</div>
              <div class="row" style="margin-top:.8rem"><button type="button" class="btn sm danger" data-action="endroom">End room</button></div>`)
              : html`<section class="card center"><p class="muted">Waiting for ${nameOf(d, d.meta.host)} to pick a game…</p></section>${inviteCard(d, false)}`}`;
        } else {
          body = html`${topBar(d, g.title)}${g.view(d)}${hostBar(d)}`;
        }
      }
      const markup = String(body);
      if (markup !== lastMarkup) {
        const y = window.scrollY;
        app().innerHTML = markup;
        lastMarkup = markup;
        window.scrollTo(0, Math.min(y, document.body.scrollHeight));
      }
      window.GP.ui.resetActions();
      bindActions(room.data || {});
    }
    let lastMarkup = '';
    let lastRoundKey = '';
    rerender = render;

    function bindActions(d) {
      on('leave', () => go('#/online'));
      on('share', async () => {
        const url = net.joinUrl(room.code), title = 'Join my PlayAnywhere room', text = 'Room code ' + room.code;
        if (window.GP.native && window.GP.native.share(title, text, url)) return; // Android app: native share sheet
        try { if (navigator.share) await navigator.share({ title, text, url }); else { await navigator.clipboard.writeText(url); toast('Link copied'); } } catch (e) { /* cancelled */ }
      });
      on('kick', (el) => room.update({ [`players/${el.dataset.pid}`]: null, [`acts/${el.dataset.pid}`]: null, [`priv/${el.dataset.pid}`]: null }));
      on('choose', (el) => { cfg = Object.assign({ game: el.dataset.v }, GAMES[el.dataset.v].defaults(d)); render(); });
      on('cancelcfg', () => { cfg = null; render(); });
      on('cfg', (el) => { const v = el.dataset.v; cfg[el.dataset.k] = v === '' ? false : (/^\d+$/.test(v) ? +v : v); render(); });
      on('start', () => { const g = GAMES[cfg.game]; const patch = g.start(d, cfg); cfg = null; hostWrite(patch); });
      on('lobby', () => hostWrite({ 'meta/game': 'lobby', state: null, priv: null, acts: null }));
      on('endroom', (el) => {
        // Two taps within 3 s, no modal dialog.
        if (el.dataset.armed) { const ended = room.code; room.remove('').then(() => { net.forgetHosted(ended); saveRoomRef(null); go('#/online'); }); return; }
        el.dataset.armed = '1'; const label = el.textContent; el.textContent = 'Tap again to end for everyone';
        setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = label; } }, 3000);
      });
      const g = d.meta && GAMES[d.meta.game];
      if (g && d.state && g.actions) g.actions(d);
    }

    room = null;
    (async () => {
      try {
        room = await net.joinRoom(code, myName() || 'Player');
      } catch (e) {
        app().innerHTML = String(html`<section class="card center"><h2>Could not join</h2><p class="muted">${e.message}</p><a class="btn primary" href="#/online">Back</a></section>`);
        return;
      }
      saveRoomRef(code);
      // Bursts of changes (ten votes landing together) are drawn once per frame, not ten times.
      let frame = null;
      unsub.push(room.on('change', (d) => { hostLoop(d); if (!frame) frame = requestAnimationFrame(() => { frame = null; render(); }); }));
      unsub.push(room.on('status', () => { const pill = document.querySelector('.online-top .pill'); if (pill) { pill.textContent = STATUS_LABEL[room.status] || room.status; pill.className = 'pill st-' + room.status; } if (room.status === 'ended') render(); }));
      unsub.push(room.on('error', (m) => toast(m)));
      document.addEventListener('focusin', onFocusIn); document.addEventListener('focusout', onFocusOut);
      hostLoop(room.data); render();
    })();
    const onFocusIn = (e) => { if (e.target.matches('input, textarea')) deferRender = true; };
    const onFocusOut = () => { deferRender = false; render(); };

    return {
      html: html`<section class="card center"><p class="muted">Connecting to room ${code}…</p></section>`,
      onLeave() { unsub.forEach(u => u()); document.removeEventListener('focusin', onFocusIn); document.removeEventListener('focusout', onFocusOut); if (room) room.close(); room = null; deferRender = false; pendingKey = null; }
    };
  });
})();
