/* Play modes that run on the phone: Mafia narrator, Imposter (one phone or everyone's), Heads Up, prompt decks. */
(function () {
  'use strict';
  const { html, raw, route, go, on, toast, keepAwake, speech, fmtTime, plural } = window.GP.ui;
  const audio = window.GP.audio;
  const store = window.GP.store;
  const engine = window.GP.engine;
  const DECKS = window.GP_DECKS;

  const backLink = (query) => query && query.game ? `#/game/${query.game}` : '#/tools';
  const header = (title, query, extra) => html`<div class="row between" style="margin-bottom:.6rem"><h2 style="margin:0">${title}</h2><div class="row">${extra || ''}<a class="btn sm" href="${backLink(query)}">Done</a></div></div>`;
  const speakBtn = (text) => speech.available() ? html`<button type="button" class="btn sm ghost" data-action="speak" data-text="${text}" aria-label="read aloud">🔊</button>` : '';
  const playerNames = (n) => {
    const names = store.getState('names', []);
    return Array.from({ length: n }, (_, i) => names[i] || 'Player ' + (i + 1));
  };

  // ==========================================================================
  // MAFIA NARRATOR
  // ==========================================================================
  const ROLE = {
    mafia: { label: 'MAFIA', cls: 'mafia', blurb: 'At night, open your eyes when called and silently agree on a victim with the other Mafia. By day, act innocent.' },
    doctor: { label: 'DOCTOR', cls: 'special', blurb: 'At night, choose one person to protect. You may protect yourself. If the Mafia picked that person, they survive.' },
    detective: { label: 'DETECTIVE', cls: 'special', blurb: 'At night, point at one person. The narrator will nod if they are Mafia. Use it wisely; do not reveal yourself too early.' },
    villager: { label: 'VILLAGER', cls: 'village', blurb: 'You have no special power. Watch, listen, and vote out the Mafia by day.' }
  };

  function suggestedRoles(n) {
    return { mafia: Math.max(1, Math.floor(n / 4)), doctor: n >= 6, detective: n >= 7 };
  }

  function dealRoles(n, opts) {
    const roles = [];
    for (let i = 0; i < opts.mafia; i++) roles.push('mafia');
    if (opts.doctor) roles.push('doctor');
    if (opts.detective) roles.push('detective');
    while (roles.length < n) roles.push('villager');
    return engine.shuffle(roles);
  }

  function winner(players) {
    const alive = players.filter(p => p.alive);
    const mafia = alive.filter(p => p.role === 'mafia').length;
    if (mafia === 0) return 'village';
    if (mafia >= alive.length - mafia) return 'mafia';
    return null;
  }

  route('#/tool/mafia', (params, query) => {
    let g = store.getState('mafia', null);
    const save = () => store.setState('mafia', g);
    const reset = () => { store.clearState('mafia'); g = null; };
    const rerender = () => { save(); window.GP.ui.render(); };

    // --- Setup -----------------------------------------------------------
    if (!g || g.phase === 'setup') {
      const n = (g && g.n) || Math.max(6, Math.min(20, store.getConfig().people - 1));
      const sug = suggestedRoles(n);
      const opts = (g && g.opts) || sug;
      const view = html`
        ${header('Mafia', query)}
        <section class="card">
          <p class="muted">You are the narrator; you do not play. Set how many <b>players</b> there are (not counting you).</p>
          <div class="stepper">
            <button type="button" class="btn" data-action="n" data-v="-1" aria-label="fewer">−</button>
            <input type="number" inputmode="numeric" min="5" max="20" value="${n}" data-input="nInput" aria-label="players">
            <button type="button" class="btn" data-action="n" data-v="1" aria-label="more">+</button>
          </div>
          <hr>
          <div class="row between"><span>Mafia</span><div class="row"><button type="button" class="btn sm" data-action="mafia" data-v="-1">−</button><b style="min-width:2ch;text-align:center">${opts.mafia}</b><button type="button" class="btn sm" data-action="mafia" data-v="1">+</button></div></div>
          <div class="row between" style="margin-top:.4rem"><span>Doctor</span><button type="button" class="chip sm ${opts.doctor ? 'on' : ''}" data-action="doc">${opts.doctor ? 'Yes' : 'No'}</button></div>
          <div class="row between" style="margin-top:.4rem"><span>Detective</span><button type="button" class="chip sm ${opts.detective ? 'on' : ''}" data-action="det">${opts.detective ? 'Yes' : 'No'}</button></div>
          <p class="muted small" style="margin-top:.6rem">Villagers: ${n - opts.mafia - (opts.doctor ? 1 : 0) - (opts.detective ? 1 : 0)}. Suggested for ${n}: ${sug.mafia} Mafia${sug.doctor ? ', Doctor' : ''}${sug.detective ? ', Detective' : ''}.</p>
          <p class="muted small">Names come from the Picker / Team divider list if you filled it; otherwise players are numbered. Tell each person their number.</p>
          <button type="button" class="btn primary big" data-action="start">Deal roles</button>
        </section>`;
      return {
        html: view,
        onMount() {
          const upd = (patch) => { g = Object.assign({ phase: 'setup', n, opts }, g || {}, patch); rerender(); };
          const clampOpts = (nn, o) => { o.mafia = Math.max(1, Math.min(Math.floor(nn / 2), o.mafia)); return o; };
          on('n', (el) => { const nn = Math.max(5, Math.min(20, n + (+el.dataset.v))); upd({ n: nn, opts: clampOpts(nn, Object.assign({}, suggestedRoles(nn))) }); });
          on('nInput', (el) => { const nn = parseInt(el.value, 10); if (nn >= 5 && nn <= 20) { g = Object.assign({ phase: 'setup' }, g || {}, { n: nn, opts: clampOpts(nn, Object.assign({}, suggestedRoles(nn))) }); save(); } });
          on('mafia', (el) => upd({ opts: clampOpts(n, Object.assign({}, opts, { mafia: opts.mafia + (+el.dataset.v) })) }));
          on('doc', () => upd({ opts: Object.assign({}, opts, { doctor: !opts.doctor }) }));
          on('det', () => upd({ opts: Object.assign({}, opts, { detective: !opts.detective }) }));
          on('start', () => {
            const names = playerNames(n);
            const roles = dealRoles(n, opts);
            g = { phase: 'reveal', n, opts, idx: 0, shown: false, night: 0, log: [], players: names.map((name, i) => ({ name, role: roles[i], alive: true })) };
            rerender();
          });
        }
      };
    }

    // --- Role reveal (pass the phone) ----------------------------------
    if (g.phase === 'reveal') {
      const p = g.players[g.idx];
      const last = g.idx === g.players.length - 1;
      const view = g.shown
        ? html`<div class="reveal ${ROLE[p.role].cls}"><p class="muted">${p.name}, you are</p><div class="role">${ROLE[p.role].label}</div><p>${ROLE[p.role].blurb}</p>${p.role === 'mafia' && g.opts.mafia > 1 ? html`<p class="small">Other Mafia: ${g.players.filter(x => x.role === 'mafia' && x !== p).map(x => x.name).join(', ')}</p>` : ''}<button type="button" class="btn big" data-action="hide">${last ? 'Hide and give the phone to the narrator' : 'Hide and pass the phone'}</button></div>`
        : html`<div class="reveal hidden-role"><p class="muted">Pass the phone to</p><div class="role">${p.name}</div><p class="muted">${g.idx + 1} of ${g.players.length}</p><button type="button" class="btn primary big" data-action="show">Tap to see your role</button><p class="muted small">Make sure nobody else can see the screen.</p></div>`;
      return {
        html: html`${header('Mafia · roles', query)}${view}`,
        onMount() {
          on('show', () => { g.shown = true; rerender(); });
          on('hide', () => { if (last) { g.phase = 'night'; g.night = 1; g.step = 0; g.shown = false; } else { g.idx++; g.shown = false; } rerender(); });
        }
      };
    }

    // --- Night ----------------------------------------------------------
    const alive = g.players.filter(p => p.alive);
    const names = (role) => g.players.filter(p => p.role === role).map(p => p.name + (p.alive ? '' : ' (dead)')).join(', ') || 'none';
    const pickList = (action, exclude) => html`<div class="chips" style="margin-top:.6rem">${alive.filter(p => !exclude || !exclude(p)).map(p => html`<button type="button" class="chip" data-action="${action}" data-name="${p.name}">${p.name}</button>`)}</div>`;
    const say = (text) => html`<p class="callout" style="font-size:1.1rem">“${text}” ${speakBtn(text)}</p>`;
    const status = html`<p class="muted small">Alive: ${alive.length} · Mafia alive: ${alive.filter(p => p.role === 'mafia').length} · ${g.phase === 'day' ? 'Day' : 'Night'} ${g.night}</p>`;

    if (g.phase === 'night') {
      const doctorAlive = g.players.some(p => p.role === 'doctor' && p.alive);
      const detectiveAlive = g.players.some(p => p.role === 'detective' && p.alive);
      // Each step: body (script line + any picker) and `advance`: true when a plain "Next" button should follow.
      const steps = [];
      steps.push({ advance: true, body: say('Everyone, close your eyes and put your heads down. Night ' + g.night + ' begins.') });
      steps.push({ advance: false, body: html`${say('Mafia, open your eyes. Look at each other. Silently choose someone to kill, then point.')}<p class="small"><b>Mafia are:</b> ${names('mafia')}</p><p class="muted small">Tap who they chose:</p>${pickList('kill')}` });
      steps.push({ advance: true, body: html`${say('Mafia, close your eyes.')}<p class="muted small">Victim: <b>${g.kill || '—'}</b></p>` });
      if (g.opts.doctor) {
        steps.push({ advance: false, body: doctorAlive
          ? html`${say('Doctor, open your eyes. Choose one person to save.')}<p class="small"><b>Doctor:</b> ${names('doctor')}</p>${pickList('save')}`
          : html`${say('Doctor, open your eyes. Choose one person to save.')}<p class="muted small">The doctor is dead. Say the line anyway so nobody can tell, wait a few seconds, then continue.</p><button type="button" class="btn primary big" data-action="skipSave">Continue</button>` });
        steps.push({ advance: true, body: say('Doctor, close your eyes.') });
      }
      if (g.opts.detective) {
        steps.push({ advance: false, body: detectiveAlive
          ? html`${say('Detective, open your eyes. Point at one person you suspect.')}<p class="small"><b>Detective:</b> ${names('detective')}</p>${pickList('investigate')}`
          : html`${say('Detective, open your eyes. Point at one person you suspect.')}<p class="muted small">The detective is dead. Say the line, pause, then continue.</p><button type="button" class="btn primary big" data-action="skipInv">Continue</button>` });
        steps.push({ advance: true, body: html`${g.investigated ? html`<p class="callout"><b>${g.investigated}</b> is ${g.players.find(p => p.name === g.investigated).role === 'mafia' ? html`<b style="color:var(--danger)">MAFIA — nod YES</b>` : html`<b style="color:var(--ok)">not Mafia — shake NO</b>`}</p>` : ''}${say('Detective, close your eyes.')}` });
      }
      const stepIndex = Math.min(g.step, steps.length - 1);
      const isLast = stepIndex === steps.length - 1;
      const step = steps[stepIndex];
      const advanceBtn = !step.advance ? '' : isLast
        ? html`<button type="button" class="btn primary big" data-action="dawn">Everyone wake up →</button>`
        : html`<button type="button" class="btn primary big" data-action="next">Next</button>`;
      return {
        html: html`${header('Mafia · night ' + g.night, query, html`<button type="button" class="btn sm danger" data-action="abandon">End</button>`)}${status}<section class="card">${step.body}${advanceBtn}</section>`,
        onMount() {
          on('speak', (el) => speech.speak(el.dataset.text));
          on('next', () => { g.step++; rerender(); });
          on('kill', (el) => { g.kill = el.dataset.name; g.step++; rerender(); });
          on('save', (el) => { g.save = el.dataset.name; g.step++; rerender(); });
          on('skipSave', () => { g.save = null; g.step++; rerender(); });
          on('investigate', (el) => { g.investigated = el.dataset.name; g.step++; rerender(); });
          on('skipInv', () => { g.investigated = null; g.step++; rerender(); });
          on('dawn', () => {
            const died = g.kill && g.kill !== g.save ? g.kill : null;
            if (died) { const p = g.players.find(x => x.name === died); if (p) p.alive = false; }
            g.log.push(`Night ${g.night}: ${died ? died + ' was killed' : 'nobody died'}`);
            g.phase = 'day'; g.died = died; g.kill = null; g.save = null; g.investigated = null; g.voted = null;
            rerender();
          });
          on('abandon', () => { reset(); go('#/tool/mafia'); });
        }
      };
    }

    // --- Day --------------------------------------------------------------
    if (g.phase === 'day') {
      const w = winner(g.players);
      if (w && !g.voted) {
        return {
          html: html`${header('Mafia · game over', query)}<div class="reveal ${w === 'mafia' ? 'mafia' : 'village'}"><div class="role">${w === 'mafia' ? 'MAFIA WIN' : 'VILLAGE WINS'}</div><p>${g.players.map(p => `${p.name}: ${ROLE[p.role].label.toLowerCase()}${p.alive ? '' : ' (dead)'}`).join(' · ')}</p><button type="button" class="btn big" data-action="again">Play again</button></div>`,
          onMount() { on('again', () => { const keep = { n: g.n, opts: g.opts }; reset(); g = Object.assign({ phase: 'setup' }, keep); rerender(); }); }
        };
      }
      const voteDone = !!g.voted;
      const w2 = voteDone ? winner(g.players) : null;
      return {
        html: html`
          ${header('Mafia · day ' + g.night, query, html`<button type="button" class="btn sm danger" data-action="abandon">End</button>`)}${status}
          <section class="card">
            ${say('Everyone, open your eyes. ' + (g.died ? g.died + ' was killed in the night.' : 'The doctor did their job: nobody died.'))}
            ${!voteDone ? html`
              <p>Let the group discuss and accuse. When they have decided, tap who they voted out:</p>
              ${pickList('vote')}
              <button type="button" class="btn block" data-action="novote" style="margin-top:.6rem">Nobody was voted out</button>
            ` : html`
              <p class="callout"><b>${g.voted === '(none)' ? 'Nobody was eliminated.' : g.voted + ' was ' + ROLE[g.players.find(p => p.name === g.voted).role].label + '.'}</b></p>
              ${w2 ? html`<div class="reveal ${w2 === 'mafia' ? 'mafia' : 'village'}" style="min-height:auto"><div class="role">${w2 === 'mafia' ? 'MAFIA WIN' : 'VILLAGE WINS'}</div><p class="small">${g.players.map(p => `${p.name}: ${ROLE[p.role].label.toLowerCase()}`).join(' · ')}</p><button type="button" class="btn big" data-action="again">Play again</button></div>`
                  : html`<button type="button" class="btn primary big" data-action="tonight">Night ${g.night + 1} →</button>`}
            `}
          </section>
          ${g.log.length ? html`<section class="card flat"><details><summary class="muted">Game log</summary><ul class="plain">${g.log.map(l => html`<li>${l}</li>`)}</ul></details></section>` : ''}`,
        onMount() {
          on('speak', (el) => speech.speak(el.dataset.text));
          on('vote', (el) => { const p = g.players.find(x => x.name === el.dataset.name); if (p) p.alive = false; g.voted = el.dataset.name; g.log.push(`Day ${g.night}: ${g.voted} voted out (${p.role})`); rerender(); });
          on('novote', () => { g.voted = '(none)'; g.log.push(`Day ${g.night}: no one voted out`); rerender(); });
          on('tonight', () => { g.phase = 'night'; g.night++; g.step = 0; g.died = null; rerender(); });
          on('again', () => { const keep = { n: g.n, opts: g.opts }; reset(); g = Object.assign({ phase: 'setup' }, keep); rerender(); });
          on('abandon', () => { reset(); go('#/tool/mafia'); });
        }
      };
    }
    reset();
    return html`<section class="card"><p>Game state was reset.</p><a class="btn" href="#/tool/mafia">Start again</a></section>`;
  });

  // ==========================================================================
  // IMPOSTER (one phone passed around, or everyone's phone with a shared code)
  // ==========================================================================
  const IMPOSTER_DECKS = ['imposter', 'places', 'bollywood', 'twenty'];
  const deckItem = (deckId, idx) => {
    const it = DECKS[deckId].items[idx];
    return typeof it === 'string' ? { word: it, category: DECKS[deckId].title } : it;
  };

  /** Deterministic assignment. Same inputs → same word and same imposters on every phone, no network. */
  function assign(code, n, k, deckId) {
    const seed = engine.hash(`${code.toUpperCase()}|${n}|${k}|${deckId}`);
    const rand = engine.rng(seed);
    const items = DECKS[deckId].items;
    const item = deckItem(deckId, Math.floor(rand() * items.length));
    const order = engine.shuffle(Array.from({ length: n }, (_, i) => i), rand);
    return { item, imposters: new Set(order.slice(0, k)) };
  }
  const newCode = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };

  route('#/tool/imposter', (params, query) => {
    let s = Object.assign({ mode: 'pass', n: Math.min(12, Math.max(4, store.getConfig().people)), k: 1, deck: 'imposter', code: newCode(), idx: 0, shown: false, stage: 'setup', player: 1 }, store.getState('imposter', {}));
    if (!DECKS[s.deck]) s.deck = 'imposter';
    const save = () => store.setState('imposter', s);
    const rerender = () => { save(); window.GP.ui.render(); };
    const deckChips = html`<div class="chips">${IMPOSTER_DECKS.map(d => html`<button type="button" class="chip sm ${s.deck === d ? 'on' : ''}" data-action="deck" data-v="${d}">${DECKS[d].title}</button>`)}</div>`;

    if (s.stage === 'setup') {
      return {
        html: html`
          ${header('Imposter', query)}
          <section class="card">
            <div class="option-list">
              <button type="button" class="option ${s.mode === 'pass' ? 'on' : ''}" data-action="mode" data-v="pass"><b>One phone, pass it around</b><span>Each person taps to see their word, hides it, passes on.</span></button>
              <button type="button" class="option ${s.mode === 'all' ? 'on' : ''}" data-action="mode" data-v="all"><b>Everyone on their own phone</b><span>No internet needed. Everyone opens this page and types the same code.</span></button>
              <button type="button" class="option ${s.mode === 'join' ? 'on' : ''}" data-action="mode" data-v="join"><b>I'm joining someone's game</b><span>Enter the code the host gave you.</span></button>
            </div>
          </section>
          ${s.mode !== 'join' ? html`
          <section class="card">
            <div class="row between"><span>Players</span><div class="row"><button type="button" class="btn sm" data-action="n" data-v="-1">−</button><b style="min-width:2ch;text-align:center">${s.n}</b><button type="button" class="btn sm" data-action="n" data-v="1">+</button></div></div>
            <div class="row between" style="margin-top:.4rem"><span>Imposters</span><div class="row"><button type="button" class="btn sm" data-action="k" data-v="-1">−</button><b style="min-width:2ch;text-align:center">${s.k}</b><button type="button" class="btn sm" data-action="k" data-v="1">+</button></div></div>
            <hr>
            <label class="field">Word deck</label>${deckChips}
            ${s.mode === 'all' ? html`<hr><p class="muted small">Players: <b>${s.n}</b> · Imposters: <b>${s.k}</b> · Deck: <b>${DECKS[s.deck].title}</b>. Give everyone a player number from 1 to ${s.n} and read out this code:</p><p class="center"><kbd class="code">${s.code}</kbd> <button type="button" class="btn sm" data-action="newcode">New code</button></p><p class="muted small">Everyone must choose the same players, imposters and deck. Each phone works out the roles from the code — nothing is sent anywhere.</p>` : ''}
            <button type="button" class="btn primary big" data-action="go" style="margin-top:.8rem">${s.mode === 'pass' ? 'Start passing the phone' : 'I’m player… (choose)'}</button>
          </section>` : html`
          <section class="card">
            <label class="field" for="imp-code">Code from the host</label>
            <input class="text" id="imp-code" maxlength="4" autocapitalize="characters" autocomplete="off" value="${s.joinCode || ''}" data-input="joinCode" placeholder="e.g. K7PQ" style="font-size:1.5rem;letter-spacing:.2em;text-transform:uppercase">
            <div class="row between" style="margin-top:.6rem"><span>Players (host's number)</span><div class="row"><button type="button" class="btn sm" data-action="n" data-v="-1">−</button><b style="min-width:2ch;text-align:center">${s.n}</b><button type="button" class="btn sm" data-action="n" data-v="1">+</button></div></div>
            <div class="row between" style="margin-top:.4rem"><span>Imposters</span><div class="row"><button type="button" class="btn sm" data-action="k" data-v="-1">−</button><b style="min-width:2ch;text-align:center">${s.k}</b><button type="button" class="btn sm" data-action="k" data-v="1">+</button></div></div>
            <hr><label class="field">Word deck (same as host)</label>${deckChips}
            <button type="button" class="btn primary big" data-action="go" style="margin-top:.8rem">I’m player… (choose)</button>
          </section>`}`,
        onMount() {
          on('mode', (el) => { s.mode = el.dataset.v; rerender(); });
          on('n', (el) => { s.n = Math.max(3, Math.min(30, s.n + (+el.dataset.v))); s.k = Math.min(s.k, Math.floor((s.n - 1) / 2)); rerender(); });
          on('k', (el) => { s.k = Math.max(1, Math.min(Math.floor((s.n - 1) / 2), s.k + (+el.dataset.v))); rerender(); });
          on('deck', (el) => { s.deck = el.dataset.v; rerender(); });
          on('newcode', () => { s.code = newCode(); rerender(); });
          on('joinCode', (el) => { s.joinCode = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); save(); });
          on('go', () => {
            if (s.mode === 'join') { if (!s.joinCode || s.joinCode.length < 4) { toast('Enter the 4-character code'); return; } }
            if (s.mode === 'pass') { s.code = newCode(); s.idx = 0; s.shown = false; s.stage = 'reveal'; }
            else s.stage = 'choose';
            rerender();
          });
        }
      };
    }

    const code = s.mode === 'join' ? s.joinCode : s.code;
    const roles = assign(code, s.n, s.k, s.deck);
    const roleView = (i, nextLabel, nextAction) => roles.imposters.has(i)
      ? html`<div class="reveal imposter"><p class="muted">Player ${i + 1}</p><div class="role">IMPOSTER</div><p>You do not know the word. Category: <b>${roles.item.category}</b>. Listen, blend in, and figure it out.</p><button type="button" class="btn big" data-action="${nextAction}">${nextLabel}</button></div>`
      : html`<div class="reveal word"><p class="muted">Player ${i + 1} · the secret word is</p><div class="role">${roles.item.word}</div><p class="muted">Category: ${roles.item.category}. Give clues that prove you know it, without handing it to the imposter.</p><button type="button" class="btn big" data-action="${nextAction}">${nextLabel}</button></div>`;

    if (s.stage === 'choose') {
      return {
        html: html`${header('Imposter', query)}<section class="card"><p>Code <kbd class="code">${code}</kbd> · ${s.n} players · ${plural(s.k, 'imposter')} · ${DECKS[s.deck].title}</p><p class="muted">Which player number are you? Only look at your own.</p><div class="chips">${Array.from({ length: s.n }, (_, i) => html`<button type="button" class="chip" data-action="me" data-v="${i}">${i + 1}</button>`)}</div><button type="button" class="btn block" data-action="back" style="margin-top:.8rem">Back to setup</button></section>`,
        onMount() {
          on('me', (el) => { s.player = +el.dataset.v; s.stage = 'mine'; rerender(); });
          on('back', () => { s.stage = 'setup'; rerender(); });
        }
      };
    }
    if (s.stage === 'mine') {
      return {
        html: html`${header('Imposter', query)}${roleView(s.player, 'Hide', 'hide')}<p class="muted small center" style="margin-top:.6rem">Go round the circle: one clue word each. Two rounds, then vote.</p><a class="btn block" href="#/tool/timer?game=${query.game || ''}" style="margin-top:.6rem">Open a timer</a>`,
        onMount() { on('hide', () => { s.stage = 'choose'; rerender(); }); }
      };
    }
    // Pass-the-phone reveal
    if (s.stage === 'reveal') {
      const last = s.idx === s.n - 1;
      return {
        html: html`${header('Imposter', query)}${s.shown
          ? roleView(s.idx, last ? 'Hide — everyone has seen theirs' : 'Hide and pass the phone', 'hide')
          : html`<div class="reveal hidden-role"><p class="muted">Pass the phone to</p><div class="role">Player ${s.idx + 1}</div><p class="muted">${s.idx + 1} of ${s.n}</p><button type="button" class="btn primary big" data-action="show">Tap to see your word</button></div>`}`,
        onMount() {
          on('show', () => { s.shown = true; rerender(); });
          on('hide', () => { if (last) { s.stage = 'discuss'; s.starter = 1 + Math.floor(Math.random() * s.n); } else { s.idx++; s.shown = false; } rerender(); });
        }
      };
    }
    // Discussion / reveal
    return {
      html: html`${header('Imposter', query)}<section class="card center"><h3>Everyone has their word</h3><p class="muted">Player ${s.starter || 1} starts. Go round the circle: one clue each. After two rounds, everyone points at a suspect.</p><div class="grid-2"><a class="btn" href="#/tool/timer?game=${query.game || ''}">Timer</a><button type="button" class="btn danger" data-action="revealAll">Reveal answer</button></div>${s.revealed ? html`<p class="callout" style="margin-top:.8rem">The word was <b>${roles.item.word}</b>. Imposter${s.k > 1 ? 's' : ''}: <b>${Array.from(roles.imposters).map(i => 'Player ' + (i + 1)).join(', ')}</b></p>` : ''}<button type="button" class="btn primary block" data-action="again" style="margin-top:.8rem">New round</button></section>`,
      onMount() {
        on('revealAll', () => { s.revealed = true; rerender(); });
        on('again', () => { s.stage = 'setup'; s.revealed = false; s.code = newCode(); rerender(); });
      }
    };
  });

  // ==========================================================================
  // HEADS UP (word on forehead; a teammate taps ✓ / pass)
  // ==========================================================================
  const HEADSUP_DECKS = ['charades', 'bollywood', 'twenty', 'pictionary', 'imposter'];
  route('#/tool/headsup', (params, query) => {
    let deck = store.getState('headsup.deck', 'charades');
    if (!HEADSUP_DECKS.includes(deck)) deck = 'charades';
    let secs = parseInt(store.getState('headsup.secs', 60), 10) || 60;
    let words = [], i = 0, got = [], passed = [], endAt = 0, tick = null, stage = 'setup';

    const wordOf = (idx) => { const it = DECKS[deck].items[idx]; return typeof it === 'string' ? it : it.word; };
    const setupView = () => html`
      ${header('Heads Up', query)}
      <section class="card">
        <p class="muted">One person holds the phone on their forehead, screen facing the others. The others act or describe. A friend taps <b>Got it</b> or <b>Pass</b>.</p>
        <label class="field">Deck</label>
        <div class="chips">${HEADSUP_DECKS.map(d => html`<button type="button" class="chip sm ${deck === d ? 'on' : ''}" data-action="deck" data-v="${d}">${DECKS[d].title}</button>`)}</div>
        <label class="field" style="margin-top:.8rem">Seconds</label>
        <div class="chips">${[30, 45, 60, 90].map(n => html`<button type="button" class="chip sm ${secs === n ? 'on' : ''}" data-action="secs" data-v="${n}">${n}</button>`)}</div>
        <button type="button" class="btn primary big" data-action="start" style="margin-top:1rem">Start</button>
      </section>`;
    const playView = () => html`
      <div class="row between"><b id="hu-time" class="display-mid" style="padding:0">${fmtTime(secs)}</b><span class="muted">✓ <span id="hu-score">0</span></span></div>
      <div class="display-word tall" id="hu-word">${wordOf(words[i])}</div>
      <div class="pad-grid"><button type="button" class="btn pad red" data-action="pass">Pass →</button><button type="button" class="btn pad green" data-action="got">Got it ✓</button></div>`;
    const resultView = () => html`
      ${header('Heads Up · result', query)}
      <section class="card center"><div class="display-big" style="font-size:4rem">${got.length}</div><p class="muted">correct in ${secs} seconds</p></section>
      <section class="card">${got.length ? html`<h3>Got</h3><p>${got.join(', ')}</p>` : ''}${passed.length ? html`<h3>Passed</h3><p class="muted">${passed.join(', ')}</p>` : ''}</section>
      <div class="grid-2"><button type="button" class="btn big" data-action="setup">Change deck</button><button type="button" class="btn primary big" data-action="start">Next player</button></div>`;

    const mount = (v) => { document.getElementById('app').innerHTML = String(v); };
    const stop = () => { clearInterval(tick); tick = null; keepAwake(false); document.body.dataset.awake = '0'; };
    const next = () => { i++; if (i >= words.length) { words = engine.shuffle(words); i = 0; } const w = document.getElementById('hu-word'); if (w) w.textContent = wordOf(words[i]); const sc = document.getElementById('hu-score'); if (sc) sc.textContent = got.length; };
    const finish = () => { stop(); audio.alarm(); stage = 'result'; mount(resultView()); };
    const start = () => {
      words = engine.shuffle(DECKS[deck].items.map((_, idx) => idx)); i = 0; got = []; passed = [];
      stage = 'countdown';
      mount(html`<div class="reveal hidden-role"><p class="muted">Phone on forehead, screen facing the group</p><div class="display-big" id="hu-cd">3</div></div>`);
      let c = 3; audio.beep();
      const cd = setInterval(() => { c--; const el = document.getElementById('hu-cd'); if (c > 0) { if (el) el.textContent = c; audio.beep(); } else { clearInterval(cd); audio.whistle(); begin(); } }, 1000);
    };
    const begin = () => {
      stage = 'play'; mount(playView());
      keepAwake(true); document.body.dataset.awake = '1';
      endAt = Date.now() + secs * 1000;
      let lastBeep = -1;
      tick = setInterval(() => {
        const left = Math.ceil((endAt - Date.now()) / 1000);
        const t = document.getElementById('hu-time'); if (t) { t.textContent = fmtTime(Math.max(0, left)); t.classList.toggle('warn', left <= 5); }
        if (left <= 3 && left > 0 && left !== lastBeep) { lastBeep = left; audio.beep(); }
        if (left <= 0) finish();
      }, 200);
    };
    return {
      html: setupView(),
      onMount() {
        on('deck', (el) => { deck = el.dataset.v; store.setState('headsup.deck', deck); mount(setupView()); });
        on('secs', (el) => { secs = +el.dataset.v; store.setState('headsup.secs', secs); mount(setupView()); });
        on('start', start);
        on('got', () => { if (stage !== 'play') return; got.push(wordOf(words[i])); audio.ding(); next(); });
        on('pass', () => { if (stage !== 'play') return; passed.push(wordOf(words[i])); audio.tick(); next(); });
        on('setup', () => { stage = 'setup'; mount(setupView()); });
      },
      onLeave() { stop(); }
    };
  });

  // ==========================================================================
  // PROMPT DECKS (charades words, truth/dare, would-you-rather, letters, …)
  // ==========================================================================
  const DECK_GROUPS = [
    ['charades', 'bollywood', 'pictionary', 'taboo', 'twenty', 'imposter', 'places'],
    ['truth', 'dare', 'wouldyourather', 'neverhave', 'story-starters', 'debate', 'antakshari-letters']
  ];
  route('#/tool/prompts/:deck', (params, query) => {
    const deckId = DECKS[params.deck] ? params.deck : 'charades';
    const deck = DECKS[deckId];
    // Shuffled order persisted per deck so you never see repeats until the deck is exhausted.
    let order = store.getState('deck.' + deckId, null);
    if (!order || !Array.isArray(order.seq) || order.seq.length !== deck.items.length) order = { seq: engine.shuffle(deck.items.map((_, i) => i)), pos: -1 };
    const saveOrder = () => store.setState('deck.' + deckId, order);
    const pair = deckId === 'truth' || deckId === 'dare';

    const renderItem = (it) => {
      if (typeof it === 'string') return html`<div class="display-word ${it.length > 40 ? 'long' : ''}">${it}</div>`;
      if (it.avoid) return html`<div class="display-word">${it.word}</div><p class="center muted">Do not say:</p><div class="chips" style="justify-content:center">${it.avoid.map(a => html`<span class="chip sm">${a}</span>`)}</div>`;
      return html`<div class="display-word">${it.word}</div><p class="center muted">${it.category}</p>`;
    };
    const current = () => order.pos < 0 ? html`<div class="display-word muted" style="font-weight:600;font-size:1.3rem">Tap “Next” to draw</div>` : renderItem(deck.items[order.seq[order.pos]]);
    const view = () => html`
      ${header(deck.title, query)}
      <section class="card">
        <div id="pr-item">${current()}</div>
        ${pair ? html`<div class="grid-2"><a class="btn big ${deckId === 'truth' ? 'primary' : ''}" href="#/tool/prompts/truth${query.game ? '?game=' + query.game : ''}" data-action="draw" data-deck="truth">Truth</a><a class="btn big ${deckId === 'dare' ? 'primary' : ''}" href="#/tool/prompts/dare${query.game ? '?game=' + query.game : ''}" data-action="draw" data-deck="dare">Dare</a></div>`
          : html`<button type="button" class="btn primary big" data-action="next">Next</button>`}
        <p class="muted small center" style="margin-top:.6rem"><span id="pr-count">${Math.max(0, order.pos + 1)}</span> of ${deck.items.length} drawn · <button type="button" class="btn sm ghost" data-action="reshuffle">reshuffle</button></p>
      </section>
      <section class="card flat">
        <p class="muted small" style="margin-bottom:.4rem">Other decks</p>
        ${DECK_GROUPS.map(grp => html`<div class="chips" style="margin-bottom:.4rem">${grp.map(d => html`<a class="chip sm ${d === deckId ? 'on' : ''}" href="#/tool/prompts/${d}${query.game ? '?game=' + query.game : ''}">${DECKS[d].title}</a>`)}</div>`)}
      </section>`;
    const draw = () => {
      order.pos++;
      if (order.pos >= order.seq.length) { order = { seq: engine.shuffle(deck.items.map((_, i) => i)), pos: 0 }; toast('Deck finished — reshuffled'); }
      saveOrder();
      document.getElementById('pr-item').innerHTML = String(current());
      const c = document.getElementById('pr-count'); if (c) c.textContent = order.pos + 1;
      audio.tick();
    };
    return {
      html: view(),
      onMount() {
        on('next', draw);
        on('reshuffle', () => { order = { seq: engine.shuffle(deck.items.map((_, i) => i)), pos: -1 }; saveOrder(); document.getElementById('pr-item').innerHTML = String(current()); const c = document.getElementById('pr-count'); if (c) c.textContent = '0'; });
        on('draw', (el) => {
          if (el.dataset.deck === deckId) { draw(); return; }
          store.setState('deck.autodraw', true);
          go(el.getAttribute('href'));
        });
        if (pair && store.getState('deck.autodraw', false)) { store.clearState('deck.autodraw'); draw(); }
      }
    };
  });
})();
