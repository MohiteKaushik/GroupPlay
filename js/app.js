/* Main views: home, wizard, results, game detail, browse, saved, tools index. Boot + service worker. */
(function () {
  'use strict';
  const { html, raw, route, go, back, on, toast, plural, titleCase } = window.GP.ui;
  const engine = window.GP.engine;
  const store = window.GP.store;
  const GAMES = window.GP_GAMES;
  const byId = Object.create(null);
  GAMES.forEach(g => { byId[g.id] = g; });

  const LABEL = {
    energy: { chill: 'Chill', medium: 'Medium', high: 'High energy' },
    contact: { none: 'No touching', light: 'Light contact', close: 'Close contact' },
    phone: { none: 'No phone needed', host: 'Phone helps', pass: 'Pass the phone', all: 'Everyone needs a phone' },
    category: { physical: 'Physical', word: 'Word', social: 'Social deduction', music: 'Music', drawing: 'Drawing', trivia: 'Trivia', relay: 'Race / relay', icebreaker: 'Icebreaker', kids: 'Kids', brain: 'Brain' },
    ages: { kids: 'Kids (under 10)', teens: 'Teens', adults: 'Adults', elders: 'Elders (60+)' }
  };
  const PROP_ORDER = ['paper', 'music', 'balloons', 'ball', 'chairs', 'cups', 'blindfold', 'spoons', 'cards', 'rope', 'cloth', 'bowl', 'bottle', 'bucket', 'coins', 'torch'];
  const TOOL_LABEL = {
    timer: 'Timer', scoreboard: 'Scoreboard', teams: 'Team divider', buzzer: 'Buzzer', picker: 'Random picker',
    'random-stop': 'Random stop (music referee)', mafia: 'Mafia narrator', imposter: 'Imposter', headsup: 'Heads Up'
  };
  const toolLabel = (tool) => tool.startsWith('prompts:') ? (window.GP_DECKS[tool.slice(8)] || {}).title || 'Prompts' : TOOL_LABEL[tool] || tool;
  const toolHref = (tool) => tool.startsWith('prompts:') ? `#/tool/prompts/${tool.slice(8)}` : `#/tool/${tool}`;

  // --- Shared pieces -------------------------------------------------------
  function gameCard(game, opts) {
    opts = opts || {};
    const played = opts.played;
    return html`
      <a class="card game-card ${played ? 'played' : ''}" href="#/game/${game.id}">
        <div class="row between">
          <h3>${game.name}</h3>
          ${played ? html`<span class="tag ok">played tonight</span>` : ''}
        </div>
        <p class="tagline">${game.tagline}</p>
        <div class="tags">
          <span class="tag">${game.players.min}–${game.players.max === 99 ? '∞' : game.players.max} people</span>
          <span class="tag">${game.minutes} min</span>
          <span class="tag">${LABEL.energy[game.energy]}</span>
          ${game.props.length ? html`<span class="tag">${game.props.map(p => engine.PROP_LABELS[p]).join(', ')}</span>` : html`<span class="tag ok">no props</span>`}
          ${game.phone === 'none' ? html`<span class="tag">no phone</span>` : ''}
          ${opts.reason ? html`<span class="tag warn">${opts.reason}</span>` : ''}
        </div>
      </a>`;
  }

  function progress(step) {
    return html`<div class="progress">${[1, 2, 3, 4].map(i => html`<i class="${i <= step ? 'done' : ''}"></i>`)}</div>`;
  }

  function configSummary(cfg) {
    const bits = [plural(cfg.people, 'person', 'people'), cfg.phone === 'all' ? 'everyone has a phone' : 'one phone', cfg.ages.map(a => a).join(' + '), cfg.space];
    if (cfg.energy !== 'any') bits.push(LABEL.energy[cfg.energy].toLowerCase());
    if (cfg.contact === 'none') bits.push('no touching');
    return bits.join(' · ');
  }

  // --- Home ----------------------------------------------------------------
  route('#/', () => {
    const cfg = store.getConfig();
    const played = store.getPlayedSet().size;
    const saved = store.getBookmarks().size;
    const hasConfig = !!store.getState('configured', false);
    return html`
      <div class="home-hero">
        <h1>What shall we play?</h1>
        <p class="muted">Answer four quick questions. Get games your group can play right now. Works without internet once it has loaded.</p>
      </div>
      <div class="tiles">
        <a class="tile accent" href="#/wizard/1"><b>Find a game</b><span>Group size, who's playing, what you have</span></a>
        ${hasConfig ? html`<a class="tile grape" href="#/results"><b>Last setup</b><span>${configSummary(cfg)}</span></a>` : ''}
        <a class="tile sky" href="#/browse"><b>Browse all</b><span>${GAMES.length} games</span></a>
        <a class="tile lemon" href="#/saved"><b>Saved</b><span>${saved ? plural(saved, 'bookmark') : 'Nothing saved yet'}${played ? ` · ${played} played tonight` : ''}</span></a>
        <a class="tile mint" href="#/tools"><b>Host tools</b><span>Timer, scores, teams, buzzer, Mafia…</span></a>
        <a class="tile grape" href="#/online"><b>Play together</b><span>Everyone joins with a code or QR</span></a>
      </div>
      <p class="foot">No account, no tracking, nothing leaves this phone. <a href="#/about">About</a></p>`;
  });

  route('#/about', () => html`
    <section class="card">
      <h2>About GroupPlay</h2>
      <p>Built for the moment when a group is together, bored, and nobody can remember a single game. One person needs a phone; nobody needs to download anything.</p>
      <p>After the first visit the whole site is stored on your phone and works with no signal. Bookmarks and scores are saved on this phone only.</p>
      <p>Sounds are generated on the phone, so there are no audio files to download. Voice narration uses your phone's built-in speech.</p>
      <p class="muted small">Version ${window.GP_VERSION || 'dev'} · ${GAMES.length} games</p>
      <a class="btn" href="#/">Back</a>
    </section>`);

  // --- Wizard --------------------------------------------------------------
  route('#/wizard/:step', (params) => {
    const step = Math.min(4, Math.max(1, parseInt(params.step, 10) || 1));
    const cfg = store.getConfig();
    const save = (patch) => { store.setConfig(Object.assign(cfg, patch)); };
    const chip = (group, value, label, sub) => html`<button type="button" class="chip ${cfg[group] === value ? 'on' : ''}" data-action="pick" data-group="${group}" data-value="${value}">${label}${sub ? html` <span class="sub">${sub}</span>` : ''}</button>`;
    const multi = (group, value, label) => html`<button type="button" class="chip ${cfg[group].includes(value) ? 'on' : ''}" data-action="toggle" data-group="${group}" data-value="${value}">${label}</button>`;
    const option = (group, value, title, desc) => html`<button type="button" class="option ${cfg[group] === value ? 'on' : ''}" data-action="pick" data-group="${group}" data-value="${value}"><b>${title}</b><span>${desc}</span></button>`;

    let body;
    if (step === 1) {
      body = html`
        <h2>How many people are playing?</h2>
        <p class="muted">Count everyone who will join in, including you.</p>
        <div class="stepper">
          <button type="button" class="btn" data-action="dec" aria-label="fewer">−</button>
          <input type="number" inputmode="numeric" min="2" max="99" value="${cfg.people}" data-input="people" aria-label="number of people">
          <button type="button" class="btn" data-action="inc" aria-label="more">+</button>
        </div>
        <div class="chips" style="margin-top:.8rem">${[4, 6, 8, 10, 15, 20, 30].map(n => html`<button type="button" class="chip sm ${cfg.people === n ? 'on' : ''}" data-action="setPeople" data-value="${n}">${n}</button>`)}</div>`;
    } else if (step === 2) {
      body = html`
        <h2>Phones</h2>
        <p class="muted">Most games need no phone at all. This decides whether phone-based games show up.</p>
        <div class="option-list">
          ${option('phone', 'pass', 'Just this phone', 'The host reads rules, runs the timer, and can pass the phone around for secret roles.')}
          ${option('phone', 'all', 'Everyone has a phone', 'Adds games where each person needs their own screen. No internet needed for them either.')}
        </div>`;
    } else if (step === 3) {
      body = html`
        <h2>Who is playing?</h2>
        <p class="muted">Pick every group that is present. Games must suit all of them.</p>
        <div class="chips">${['kids', 'teens', 'adults', 'elders'].map(a => multi('ages', a, LABEL.ages[a]))}</div>
        <hr>
        <h3>Physical contact</h3>
        <p class="muted small">Some games involve holding hands, tagging or tangling up. Set what this group is comfortable with.</p>
        <div class="chips">${chip('contact', 'none', 'None')}${chip('contact', 'light', 'Light', 'tagging, passing')}${chip('contact', 'close', 'Anything goes')}</div>
        <hr>
        <h3>Energy</h3>
        <div class="chips">${chip('energy', 'any', 'Any')}${chip('energy', 'chill', 'Sitting & chill')}${chip('energy', 'medium', 'Medium')}${chip('energy', 'high', 'Running around')}</div>`;
    } else {
      const propChip = (p) => html`<button type="button" class="chip ${cfg.props.includes(p) ? 'on' : ''}" data-action="toggle" data-group="props" data-value="${p}">${titleCase(engine.PROP_LABELS[p])}</button>`;
      body = html`
        <h2>Where, and what do you have?</h2>
        <div class="chips">${chip('space', 'indoor', 'Indoors')}${chip('space', 'outdoor', 'Outdoors / open yard')}</div>
        <hr>
        <h3>Things within reach</h3>
        <p class="muted small">Only tick what you can actually get right now. Games without any props always show.</p>
        <div class="chips">${PROP_ORDER.map(propChip)}</div>
        <div class="row" style="margin-top:.6rem"><button type="button" class="btn sm" data-action="allProps">Select all</button><button type="button" class="btn sm" data-action="noProps">Clear</button></div>`;
    }

    return {
      html: html`
        <section class="card">
          ${progress(step)}
          ${body}
          <div class="wizard-nav">
            ${step > 1 ? html`<a class="btn" href="#/wizard/${step - 1}">Back</a>` : html`<a class="btn" href="#/">Cancel</a>`}
            ${step < 4 ? html`<a class="btn primary" href="#/wizard/${step + 1}" data-action="next">Next</a>` : html`<a class="btn primary" href="#/results" data-action="finish">Show games</a>`}
          </div>
        </section>`,
      onMount(root) {
        const rerender = () => window.GP.ui.render();
        on('pick', (el) => { save({ [el.dataset.group]: el.dataset.value }); rerender(); });
        on('toggle', (el) => {
          const list = cfg[el.dataset.group].slice();
          const i = list.indexOf(el.dataset.value);
          if (i >= 0) list.splice(i, 1); else list.push(el.dataset.value);
          if (el.dataset.group === 'ages' && !list.length) { toast('Pick at least one group'); return; }
          save({ [el.dataset.group]: list }); rerender();
        });
        on('inc', () => { save({ people: cfg.people + 1 }); rerender(); });
        on('dec', () => { save({ people: cfg.people - 1 }); rerender(); });
        on('setPeople', (el) => { save({ people: +el.dataset.value }); rerender(); });
        on('people', (el) => { const n = parseInt(el.value, 10); if (n >= 2 && n <= 99) save({ people: n }); });
        on('allProps', () => { save({ props: PROP_ORDER.slice() }); rerender(); });
        on('noProps', () => { save({ props: [] }); rerender(); });
        on('next', () => { go(`#/wizard/${step + 1}`); });
        on('finish', () => { store.setState('configured', true); store.setState('seed', Date.now()); go('#/results'); });
      }
    };
  });

  // --- Results -------------------------------------------------------------
  route('#/results', (params, query) => {
    const cfg = store.getConfig();
    const played = store.getPlayedSet();
    const bookmarked = store.getBookmarks();
    let seed = parseInt(store.getState('seed', 0), 10);
    if (!seed) { seed = Date.now(); store.setState('seed', seed); }
    const { matches, excluded } = engine.recommend(GAMES, cfg, { playedTonight: played, bookmarked, seed });
    const quick = query.sort === 'quick';
    const list = quick ? matches.slice().sort((a, b) => a.game.minutes - b.game.minutes) : matches;
    const fresh = matches.filter(m => !played.has(m.game.id));

    return {
      html: html`
        <section class="card flat" style="padding:.75rem 1rem">
          <div class="row between">
            <div><b>${configSummary(cfg)}</b></div>
            <a class="btn sm" href="#/wizard/1">Edit</a>
          </div>
        </section>
        ${matches.length ? html`
          <button type="button" class="btn primary big" data-action="surprise">🎲 Surprise me</button>
          <div class="row between" style="margin:.9rem 0 .5rem">
            <span class="muted">${plural(matches.length, 'game')} fit${fresh.length !== matches.length ? html` · ${matches.length - fresh.length} already played` : ''}</span>
            <div class="chips">
              <a class="chip sm ${quick ? '' : 'on'}" href="#/results">Best match</a>
              <a class="chip sm ${quick ? 'on' : ''}" href="#/results?sort=quick">Quickest</a>
            </div>
          </div>
          ${list.map(m => gameCard(m.game, { played: played.has(m.game.id) }))}
        ` : html`
          <section class="card"><h2>Nothing fits that exactly</h2><p class="muted">Usually this is the age mix plus "no touching" plus a very small or very large group. Loosen one thing below.</p><a class="btn primary" href="#/wizard/3">Change who's playing</a></section>`}
        ${excluded.length ? html`
          <section class="card flat excluded-list">
            <details>
              <summary>${plural(excluded.length, 'game')} left out — see why</summary>
              <ul class="plain" style="list-style:none;padding:0;margin-top:.5rem">
                ${excluded.map(x => html`<li><a href="#/game/${x.game.id}">${x.game.name}</a><span>${x.reason}</span></li>`)}
              </ul>
            </details>
          </section>` : ''}`,
      onMount() {
        const surprise = () => {
          const pool = fresh.length ? fresh : matches;
          const top = pool[0].score;
          const cands = pool.filter(m => m.score >= top - 1);
          const choice = cands[Math.floor(Math.random() * cands.length)];
          store.setState('seed', Date.now()); // next visit reshuffles ties
          go(`#/game/${choice.game.id}?surprise=1`);
        };
        on('surprise', surprise);
        if (matches.length && store.getState('autoSurprise', false)) { store.clearState('autoSurprise'); surprise(); }
      }
    };
  });

  // --- Game detail ---------------------------------------------------------
  route('#/game/:id', (params, query) => {
    const game = byId[params.id];
    if (!game) return html`<section class="card"><h2>Game not found</h2><a class="btn" href="#/browse">Browse games</a></section>`;
    const cfg = store.getConfig();
    const reason = store.getState('configured', false) ? engine.exclusionReason(game, cfg) : null;
    const isSaved = store.getBookmarks().has(game.id);
    const isPlayed = store.getPlayedSet().has(game.id);
    const explainerSteps = (window.GP_EXPLAINERS || {})[game.id];
    let explainer = null;
    return {
      html: html`
        ${query.surprise ? html`<div class="row between" style="margin-bottom:.6rem"><span class="muted">🎲 Picked for you</span><a class="btn sm" href="#/results" data-action="again">Another one</a></div>` : ''}
        <section class="card">
          <h1>${game.name}</h1>
          <p class="muted">${game.tagline}</p>
          <div class="facts">
            <div class="fact"><b>${game.players.min}–${game.players.max === 99 ? '∞' : game.players.max}</b><span>people</span></div>
            <div class="fact"><b>~${game.minutes}</b><span>minutes</span></div>
            <div class="fact"><b>${LABEL.energy[game.energy]}</b><span>energy</span></div>
          </div>
          <div class="tags">
            <span class="tag">${LABEL.category[game.category]}</span>
            <span class="tag">${LABEL.contact[game.contact]}</span>
            <span class="tag">${LABEL.phone[game.phone]}</span>
            ${game.teams ? html`<span class="tag">teams</span>` : ''}
            ${game.props.length ? game.props.map(p => html`<span class="tag accent">needs ${engine.PROP_LABELS[p]}</span>`) : html`<span class="tag ok">no props</span>`}
            <span class="tag">good for: ${game.ages.join(', ')}</span>
          </div>
          ${reason ? html`<p class="callout" style="margin-top:.8rem"><b>For your current group:</b> ${reason}.</p>` : ''}
        </section>
        ${explainerSteps ? html`<div id="explainer"></div>` : ''}
        <section class="card">
          <h3>Setup</h3>
          <p>${game.setup}</p>
          <h3>How to play</h3>
          <ol class="rules">${game.rules.map(r => html`<li>${r}</li>`)}</ol>
          ${game.variations && game.variations.length ? html`<h3 style="margin-top:1rem">Variations</h3><ul class="plain">${game.variations.map(v => html`<li>${v}</li>`)}</ul>` : ''}
          ${game.tips ? html`<p class="callout" style="margin-top:1rem"><b>Host tip:</b> ${game.tips}</p>` : ''}
        </section>
        ${game.tool ? html`<a class="btn primary big" href="${toolHref(game.tool)}?game=${game.id}">Open ${toolLabel(game.tool)} →</a>` : ''}
        <div class="actions-sticky">
          <button type="button" class="btn" data-action="save">${isSaved ? '★ Saved' : '☆ Save'}</button>
          <button type="button" class="btn ${isPlayed ? 'ok' : ''}" data-action="played">${isPlayed ? '✓ Played tonight' : 'Mark as played'}</button>
          <button type="button" class="btn" data-action="back">Back</button>
        </div>`,
      onMount() {
        if (explainerSteps && window.GP.explain) explainer = window.GP.explain.mount(document.getElementById('explainer'), explainerSteps);
        on('save', (el) => { const now = store.toggleBookmark(game.id); el.textContent = now ? '★ Saved' : '☆ Save'; toast(now ? 'Saved' : 'Removed'); });
        on('played', (el) => { const now = store.togglePlayed(game.id); el.textContent = now ? '✓ Played tonight' : 'Mark as played'; el.classList.toggle('ok', now); toast(now ? 'Won’t be suggested again tonight' : 'Back in the pool'); });
        on('back', back);
        on('again', () => { store.setState('autoSurprise', true); go('#/results'); });
      },
      onLeave() { if (explainer) explainer.destroy(); }
    };
  });

  // --- Browse --------------------------------------------------------------
  route('#/browse', (params, query) => {
    const q = (query.q || '').toLowerCase();
    const cat = query.cat || '';
    const played = store.getPlayedSet();
    const list = GAMES.filter(g => (!cat || g.category === cat) && (!q || (g.name + ' ' + g.tagline + ' ' + (g.tags || []).join(' ')).toLowerCase().includes(q)))
      .slice().sort((a, b) => a.name.localeCompare(b.name));
    const cats = Object.keys(LABEL.category).filter(c => GAMES.some(g => g.category === c));
    const link = (c) => `#/browse?${[c ? `cat=${c}` : '', q ? `q=${encodeURIComponent(q)}` : ''].filter(Boolean).join('&')}`;
    return {
      html: html`
        <section class="card flat" style="padding:.75rem 1rem">
          <input class="text" type="search" placeholder="Search ${GAMES.length} games" value="${query.q || ''}" data-input="search" aria-label="search games">
          <div class="chips" style="margin-top:.6rem">
            <a class="chip sm ${cat ? '' : 'on'}" href="${link('')}">All</a>
            ${cats.map(c => html`<a class="chip sm ${cat === c ? 'on' : ''}" href="${link(c)}">${LABEL.category[c]}</a>`)}
          </div>
        </section>
        <p class="muted small">${plural(list.length, 'game')}</p>
        ${list.length ? list.map(g => gameCard(g, { played: played.has(g.id) })) : html`<section class="card"><p>No game matches that search.</p></section>`}`,
      onMount() {
        let t;
        on('search', (el) => {
          clearTimeout(t);
          const v = el.value;
          t = setTimeout(() => {
            const hash = `#/browse?${[cat ? `cat=${cat}` : '', v ? `q=${encodeURIComponent(v)}` : ''].filter(Boolean).join('&')}`;
            history.replaceState(null, '', hash);
            window.GP.ui.render();
            const inp = document.querySelector('[data-input="search"]');
            if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
          }, 250);
        });
      }
    };
  });

  // --- Saved + tonight -----------------------------------------------------
  route('#/saved', () => {
    const saved = Array.from(store.getBookmarks()).map(id => byId[id]).filter(Boolean);
    const playedMap = store.getPlayed();
    const played = Object.keys(playedMap).sort((a, b) => playedMap[b] - playedMap[a]).map(id => byId[id]).filter(Boolean);
    return {
      html: html`
        <h2>Saved games</h2>
        ${saved.length ? saved.map(g => gameCard(g)) : html`<section class="card"><p class="muted">Tap ☆ Save on any game and it will be here, even with no signal. This is the replacement for "I saved that reel somewhere".</p></section>`}
        <div class="row between" style="margin-top:1rem"><h2 style="margin:0">Played tonight</h2>${played.length ? html`<button type="button" class="btn sm" data-action="clear">Clear</button>` : ''}</div>
        <p class="muted small">Clears itself after 12 hours. Played games sink to the bottom of suggestions.</p>
        ${played.length ? played.map(g => gameCard(g, { played: true })) : html`<section class="card"><p class="muted">Nothing yet.</p></section>`}`,
      onMount() { on('clear', () => { store.clearPlayed(); window.GP.ui.render(); toast('Cleared'); }); }
    };
  });

  // --- Tools index ---------------------------------------------------------
  route('#/tools', () => html`
    <h2>Host tools</h2>
    <p class="muted">Everything a host needs on one phone. No internet.</p>
    <div class="tiles">
      <a class="tile" href="#/tool/timer"><b>⏱ Timer</b><span>Big digits, loud alarm</span></a>
      <a class="tile" href="#/tool/random-stop"><b>🎵 Random stop</b><span>Beeps at random: musical chairs referee</span></a>
      <a class="tile" href="#/tool/scoreboard"><b>🏆 Scoreboard</b><span>Teams or players, saved</span></a>
      <a class="tile" href="#/tool/teams"><b>👥 Team divider</b><span>Fair random teams</span></a>
      <a class="tile" href="#/tool/buzzer"><b>🔔 Buzzer</b><span>Sounds for judging</span></a>
      <a class="tile" href="#/tool/picker"><b>🎯 Picker</b><span>Who goes first? Who's it?</span></a>
    </div>
    <h2 style="margin-top:1.2rem">Play on the phone</h2>
    <div class="tiles">
      <a class="tile" href="#/tool/mafia"><b>🕵️ Mafia narrator</b><span>Secret roles + full script</span></a>
      <a class="tile" href="#/tool/imposter"><b>🤫 Imposter</b><span>One phone or everyone's, no internet</span></a>
      <a class="tile" href="#/tool/headsup"><b>🙆 Heads Up</b><span>Word on forehead, 60 seconds</span></a>
      <a class="tile" href="#/tool/prompts/charades"><b>🃏 Prompt decks</b><span>Charades, Bollywood, Taboo, Truth…</span></a>
    </div>
    <h2 style="margin-top:1.2rem">On everyone's phone</h2>
    <div class="tiles">
      <a class="tile grape" href="#/online"><b>📡 Play together</b><span>Imposter, Mafia, Quick Vote, Buzzer — join by code or QR</span></a>
    </div>`);

  // --- Boot ----------------------------------------------------------------
  function initOfflineBadge() {
    const badge = document.getElementById('offline-badge');
    const set = (text, ready) => { badge.textContent = text; badge.classList.toggle('ready', !!ready); };
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') { set('Online only'); return; }
    // True when this page was already served by a service worker: any install from now on is an update.
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.register('sw.js').then(reg => {
      if (hadController) set('Works offline', true);
      else set('Saving for offline…');
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'activated') {
            set('Works offline', true);
            if (hadController) toast('Updated to the latest version');
          }
        });
      });
    }).catch(() => set('Online only'));
    // A controller change after the page already had one means a new version took over: reload once to run it.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      set('Works offline', true);
      if (hadController && !reloaded) { reloaded = true; location.reload(); }
    });
  }

  function initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    const paint = () => { const m = window.GP.audio.isMuted(); btn.textContent = m ? '🔕' : '🔔'; btn.classList.toggle('off', m); btn.setAttribute('aria-pressed', String(!m)); };
    btn.addEventListener('click', () => { window.GP.audio.setMuted(!window.GP.audio.isMuted()); paint(); if (!window.GP.audio.isMuted()) window.GP.audio.boop(); toast(window.GP.audio.isMuted() ? 'Button sounds off' : 'Button sounds on'); });
    paint();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSoundToggle();
    initOfflineBadge();
    window.GP.ui.render();
  });
})();
