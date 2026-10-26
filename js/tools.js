/* Host tools: timer, random stop, scoreboard, team divider, buzzer, picker. */
(function () {
  'use strict';
  const { html, route, on, toast, keepAwake, fmtTime, plural } = window.GP.ui;
  const audio = window.GP.audio;
  const store = window.GP.store;
  const engine = window.GP.engine;

  const backLink = (query) => query && query.game ? `#/game/${query.game}` : '#/tools';
  const header = (title, query) => html`<div class="row between" style="margin-bottom:.6rem"><h2 style="margin:0">${title}</h2><a class="btn sm" href="${backLink(query)}">Done</a></div>`;

  /** Names list shared by Scoreboard, Teams and Picker so you type them once. */
  const getNames = () => store.getState('names', []);
  const setNames = (names) => store.setState('names', names.map(n => n.trim()).filter(Boolean).slice(0, 60));
  const parseNames = (text) => text.split(/\n|,/).map(s => s.trim()).filter(Boolean);
  const nameEditor = (names, hint) => html`
    <label class="field" for="names">Names (one per line or comma-separated)</label>
    <textarea class="text" id="names" data-input="names" placeholder="Ravi, Priya, Amma, ...">${names.join('\n')}</textarea>
    ${hint ? html`<p class="muted small" style="margin-top:.3rem">${hint}</p>` : ''}`;

  // --- Timer ---------------------------------------------------------------
  route('#/tool/timer', (params, query) => {
    const presets = [30, 60, 90, 120, 180, 300];
    let total = parseInt(store.getState('timer.total', 60), 10) || 60;
    let endAt = null;     // timestamp when running
    let remaining = total; // seconds, when paused
    let tick = null;
    let lastBeep = -1;

    const view = () => html`
      ${header('Timer', query)}
      <section class="card">
        <div class="display-big" id="t-display">${fmtTime(total)}</div>
        <div class="grid-2">
          <button type="button" class="btn primary big" data-action="start" id="t-start">Start</button>
          <button type="button" class="btn big" data-action="reset">Reset</button>
        </div>
        <hr>
        <div class="chips" id="t-presets">${presets.map(s => html`<button type="button" class="chip sm ${s === total ? 'on' : ''}" data-action="preset" data-value="${s}">${s < 60 ? s + 's' : (s / 60) + ' min'}</button>`)}</div>
        <div class="row" style="margin-top:.6rem">
          <button type="button" class="btn sm" data-action="adjust" data-value="-30">−30s</button>
          <button type="button" class="btn sm" data-action="adjust" data-value="-10">−10s</button>
          <button type="button" class="btn sm" data-action="adjust" data-value="10">+10s</button>
          <button type="button" class="btn sm" data-action="adjust" data-value="30">+30s</button>
        </div>
        <p class="muted small" style="margin-top:.8rem">Screen stays awake while the timer runs. Turn the volume up.</p>
      </section>`;

    const display = () => document.getElementById('t-display');
    const render = (secs) => {
      const d = display();
      if (!d) return;
      d.textContent = fmtTime(Math.max(0, secs));
      d.classList.toggle('warn', secs <= 10 && secs > 0);
    };
    const stopTick = () => { clearInterval(tick); tick = null; };
    const stop = (finished) => {
      stopTick();
      endAt = null;
      keepAwake(false);
      document.body.dataset.awake = '0';
      const b = document.getElementById('t-start');
      if (b) b.textContent = finished ? 'Again' : 'Resume';
      if (finished) { remaining = total; audio.alarm(); }
    };
    const start = () => {
      if (remaining <= 0) remaining = total;
      endAt = Date.now() + remaining * 1000;
      keepAwake(true);
      document.body.dataset.awake = '1';
      const b = document.getElementById('t-start');
      if (b) b.textContent = 'Pause';
      lastBeep = -1;
      tick = setInterval(() => {
        const left = Math.ceil((endAt - Date.now()) / 1000);
        render(left);
        if (left <= 3 && left > 0 && left !== lastBeep) { lastBeep = left; audio.beep(); }
        if (left <= 0) { remaining = 0; stop(true); render(0); }
      }, 200);
    };
    const pause = () => {
      remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      stop(false);
    };

    return {
      html: view(),
      onMount() {
        on('start', () => { audio.tick(); if (endAt) pause(); else start(); });
        on('reset', () => { stop(false); remaining = total; render(total); const b = document.getElementById('t-start'); if (b) b.textContent = 'Start'; });
        on('preset', (el) => { total = +el.dataset.value; store.setState('timer.total', total); stop(false); remaining = total; render(total); document.querySelectorAll('#t-presets .chip').forEach(c => c.classList.toggle('on', +c.dataset.value === total)); const b = document.getElementById('t-start'); if (b) b.textContent = 'Start'; });
        on('adjust', (el) => {
          total = Math.min(3600, Math.max(5, total + (+el.dataset.value)));
          store.setState('timer.total', total);
          if (endAt) { endAt += (+el.dataset.value) * 1000; } else { remaining = total; render(total); }
          document.querySelectorAll('#t-presets .chip').forEach(c => c.classList.toggle('on', +c.dataset.value === total));
        });
      },
      onLeave() { stop(false); }
    };
  });

  // --- Random stop (musical chairs / statues / pass the parcel referee) ----
  // The phone itself can be the music: a generated looping tune that cuts off at random moments.
  route('#/tool/random-stop', (params, query) => {
    let cfg = Object.assign({ min: 5, max: 20, tune: true, resume: 4 }, store.getState('randomstop', {}));
    let phase = 'idle'; // idle | playing | stopped
    let timer = null;
    let tune = null;

    const save = () => store.setState('randomstop', cfg);
    const view = () => html`
      ${header('Random stop', query)}
      <section class="card center">
        <p class="muted">Press Start. The phone plays a tune and stops it at a random moment. Use it for Musical Chairs, Statues, Pass the Parcel, Hot Potato.</p>
        <div class="display-word" id="rs-status">Ready</div>
        <button type="button" class="btn primary big" data-action="toggle" id="rs-btn">Start</button>
      </section>
      <section class="card">
        <div class="row between"><span>Stop after</span><b id="rs-range">${cfg.min}–${cfg.max} s</b></div>
        <div class="row" style="margin-top:.4rem">
          <button type="button" class="btn sm" data-action="range" data-k="min" data-v="-1">min −</button>
          <button type="button" class="btn sm" data-action="range" data-k="min" data-v="1">min +</button>
          <button type="button" class="btn sm" data-action="range" data-k="max" data-v="-1">max −</button>
          <button type="button" class="btn sm" data-action="range" data-k="max" data-v="1">max +</button>
        </div>
        <hr>
        <div class="row between"><span>Resume by itself after the stop</span><button type="button" class="chip sm ${cfg.resume ? 'on' : ''}" data-action="resume">${cfg.resume ? cfg.resume + ' s' : 'Off'}</button></div>
        <div class="row between" style="margin-top:.4rem"><span>Play a tune (off = beep only, use your own music)</span><button type="button" class="chip sm ${cfg.tune ? 'on' : ''}" data-action="tune">${cfg.tune ? 'On' : 'Off'}</button></div>
      </section>`;

    const setStatus = (text, cls) => { const el = document.getElementById('rs-status'); if (el) { el.textContent = text; el.style.color = cls === 'stop' ? 'var(--danger)' : cls === 'go' ? 'var(--ok)' : ''; } };
    const scheduleStop = () => {
      const secs = cfg.min + Math.random() * (cfg.max - cfg.min);
      timer = setTimeout(doStop, secs * 1000);
    };
    const play = () => {
      phase = 'playing';
      setStatus('♪ Playing', 'go');
      if (cfg.tune) { if (!tune) tune = makeTune(); tune.start(); } else { audio.ding(); }
      scheduleStop();
      const b = document.getElementById('rs-btn'); if (b) b.textContent = 'Stop';
    };
    const doStop = () => {
      clearTimeout(timer);
      phase = 'stopped';
      if (tune) tune.stop();
      audio.buzzer();
      setStatus('STOP!', 'stop');
      const b = document.getElementById('rs-btn'); if (b) b.textContent = 'Go again';
      if (cfg.resume) timer = setTimeout(() => { if (phase === 'stopped') play(); }, cfg.resume * 1000);
    };
    const halt = () => { clearTimeout(timer); if (tune) tune.stop(); phase = 'idle'; setStatus('Ready'); const b = document.getElementById('rs-btn'); if (b) b.textContent = 'Start'; keepAwake(false); document.body.dataset.awake = '0'; };

    return {
      html: view(),
      onMount() {
        on('toggle', () => {
          if (phase === 'idle' || phase === 'stopped') { keepAwake(true); document.body.dataset.awake = '1'; clearTimeout(timer); play(); }
          else halt();
        });
        on('range', (el) => {
          cfg[el.dataset.k] = Math.max(2, Math.min(90, cfg[el.dataset.k] + (+el.dataset.v)));
          if (cfg.min > cfg.max) { if (el.dataset.k === 'min') cfg.max = cfg.min; else cfg.min = cfg.max; }
          save();
          const r = document.getElementById('rs-range'); if (r) r.textContent = `${cfg.min}–${cfg.max} s`;
        });
        on('resume', (el) => { cfg.resume = cfg.resume === 0 ? 4 : cfg.resume === 4 ? 8 : 0; save(); el.textContent = cfg.resume ? cfg.resume + ' s' : 'Off'; el.classList.toggle('on', !!cfg.resume); });
        on('tune', (el) => { cfg.tune = !cfg.tune; save(); el.textContent = cfg.tune ? 'On' : 'Off'; el.classList.toggle('on', cfg.tune); if (!cfg.tune && tune) tune.stop(); });
      },
      onLeave() { halt(); }
    };
  });

  /** A small generated tune: looping arpeggio pattern over a four-chord progression. Original, not a copyrighted melody. */
  function makeTune() {
    const chords = [[262, 330, 392], [294, 349, 440], [330, 392, 494], [349, 440, 523]]; // C, Dm, Em, F triads
    const stepMs = 170;
    let running = false;
    let step = 0;
    let timer = null;
    const playStep = () => {
      if (!running) return;
      const chord = chords[Math.floor(step / 8) % chords.length];
      const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
      const note = chord[pattern[step % 8]] * (step % 16 >= 8 ? 2 : 1);
      audio.tone(note, 0.16, { type: 'triangle', volume: 0.3 });
      if (step % 4 === 0) audio.tone(chord[0] / 2, 0.3, { type: 'sine', volume: 0.25 });
      step++;
      timer = setTimeout(playStep, stepMs);
    };
    return {
      start() { if (running) return; running = true; playStep(); },
      stop() { running = false; clearTimeout(timer); }
    };
  }

  // --- Scoreboard ----------------------------------------------------------
  route('#/tool/scoreboard', (params, query) => {
    let rows = store.getState('scoreboard', null);
    if (!rows) rows = getNames().slice(0, 12).map(n => ({ name: n, score: 0 }));
    const save = () => store.setState('scoreboard', rows);
    const view = () => {
      const max = rows.reduce((m, r) => Math.max(m, r.score), 0);
      return html`
        ${header('Scoreboard', query)}
        <section class="card">
          ${rows.length ? rows.map((r, i) => html`
            <div class="score-row ${max > 0 && r.score === max ? 'lead' : ''}">
              <span class="name" data-action="rename" data-i="${i}">${r.name}</span>
              <button type="button" class="btn" data-action="minus" data-i="${i}" aria-label="minus">−</button>
              <span class="val">${r.score}</span>
              <button type="button" class="btn primary" data-action="plus" data-i="${i}" aria-label="plus">+</button>
            </div>`) : html`<p class="muted">Add players or teams below.</p>`}
        </section>
        <section class="card">
          <div class="row">
            <input class="text" style="flex:1" id="sb-name" placeholder="Team or player name" aria-label="name">
            <button type="button" class="btn primary" data-action="add">Add</button>
          </div>
          <div class="row" style="margin-top:.6rem">
            <button type="button" class="btn sm" data-action="quick" data-n="2">Team A / B</button>
            <button type="button" class="btn sm" data-action="quick" data-n="3">3 teams</button>
            <button type="button" class="btn sm" data-action="quick" data-n="4">4 teams</button>
            <button type="button" class="btn sm" data-action="zero">Reset scores</button>
            <button type="button" class="btn sm danger" data-action="clear">Remove all</button>
          </div>
        </section>`;
    };
    const rerender = () => { save(); document.getElementById('app').innerHTML = String(view()); };
    return {
      html: view(),
      onMount() {
        on('plus', (el) => { rows[+el.dataset.i].score++; audio.tick(); rerender(); });
        on('minus', (el) => { rows[+el.dataset.i].score--; audio.tick(); rerender(); });
        on('add', () => {
          const inp = document.getElementById('sb-name');
          const name = (inp.value || '').trim();
          if (!name) { inp.focus(); return; }
          rows.push({ name, score: 0 }); rerender();
          const n = document.getElementById('sb-name'); if (n) n.focus();
        });
        on('quick', (el) => { const n = +el.dataset.n; rows = Array.from({ length: n }, (_, i) => ({ name: 'Team ' + String.fromCharCode(65 + i), score: 0 })); rerender(); });
        on('zero', () => { rows.forEach(r => { r.score = 0; }); rerender(); });
        on('clear', () => { rows = []; rerender(); });
        on('rename', (el) => {
          // Inline edit: swap the name for an input; commit on Enter / blur.
          const i = +el.dataset.i;
          const input = document.createElement('input');
          input.className = 'text'; input.value = rows[i].name; input.style.flex = '1'; input.setAttribute('aria-label', 'rename');
          const commit = () => { const v = input.value.trim(); if (v) rows[i].name = v; rerender(); };
          input.addEventListener('blur', commit);
          input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); if (e.key === 'Escape') { input.value = rows[i].name; input.blur(); } });
          el.replaceWith(input);
          input.focus(); input.select();
        });
      }
    };
  });

  // --- Team divider --------------------------------------------------------
  route('#/tool/teams', (params, query) => {
    let names = getNames();
    let count = parseInt(store.getState('teams.count', 2), 10) || 2;
    let teams = store.getState('teams.result', null);
    const view = () => html`
      ${header('Team divider', query)}
      <section class="card">
        ${nameEditor(names, 'No names? Enter a number of people instead and it will deal numbers.')}
        <div class="row" style="margin-top:.6rem">
          <label class="field" style="margin:0">Teams:</label>
          ${[2, 3, 4, 5, 6].map(n => html`<button type="button" class="chip sm ${count === n ? 'on' : ''}" data-action="count" data-value="${n}">${n}</button>`)}
        </div>
        <div class="row" style="margin-top:.6rem">
          <input class="text" style="width:120px" type="number" inputmode="numeric" min="2" max="99" placeholder="or: people" id="tm-n" aria-label="number of people">
          <button type="button" class="btn primary" data-action="make" style="flex:1">Make teams</button>
        </div>
      </section>
      <div id="tm-out">${teams ? renderTeams(teams) : ''}</div>`;
    const renderTeams = (t) => html`${t.map((members, i) => html`<div class="team-box t${i % 6}"><h3>Team ${String.fromCharCode(65 + i)} <span class="muted small">(${members.length})</span></h3>${members.join(', ')}</div>`)}
      <button type="button" class="btn block" data-action="make">Shuffle again</button>`;
    return {
      html: view(),
      onMount() {
        on('names', (el) => { names = parseNames(el.value); setNames(names); });
        on('count', (el) => { count = +el.dataset.value; store.setState('teams.count', count); document.querySelectorAll('[data-action="count"]').forEach(c => c.classList.toggle('on', +c.dataset.value === count)); });
        on('make', () => {
          const nInput = parseInt((document.getElementById('tm-n') || {}).value, 10);
          let pool = names.length >= 2 ? names : (nInput >= 2 ? Array.from({ length: nInput }, (_, i) => 'Player ' + (i + 1)) : null);
          if (!pool) { toast('Enter names or a number of people'); return; }
          if (count > pool.length) { toast('More teams than people'); return; }
          const shuffled = engine.shuffle(pool);
          teams = Array.from({ length: count }, () => []);
          shuffled.forEach((p, i) => teams[i % count].push(p));
          store.setState('teams.result', teams);
          store.setState('scoreboard', teams.map((_, i) => ({ name: 'Team ' + String.fromCharCode(65 + i), score: 0 })));
          audio.drumroll(0.8);
          document.getElementById('tm-out').innerHTML = String(renderTeams(teams));
        });
      }
    };
  });

  // --- Buzzer / soundboard -------------------------------------------------
  route('#/tool/buzzer', (params, query) => ({
    html: html`
      ${header('Buzzer', query)}
      <div class="pad-grid">
        <button type="button" class="btn pad red" data-action="s" data-s="buzzer">❌ Wrong</button>
        <button type="button" class="btn pad green" data-action="s" data-s="ding">✅ Correct</button>
        <button type="button" class="btn pad blue" data-action="s" data-s="whistle">🏁 Whistle</button>
        <button type="button" class="btn pad yellow" data-action="s" data-s="horn">📣 Horn</button>
        <button type="button" class="btn pad purple" data-action="s" data-s="drumroll">🥁 Drumroll</button>
        <button type="button" class="btn pad teal" data-action="count">3 · 2 · 1 · GO</button>
      </div>
      <p class="muted small center" style="margin-top:1rem">Sounds are generated on the phone. Nothing to download.</p>`,
    onMount() {
      on('s', (el) => { const fn = audio[el.dataset.s]; if (fn) fn(el.dataset.s === 'drumroll' ? 2 : undefined); });
      on('count', (el) => {
        el.disabled = true;
        [0, 1000, 2000].forEach(d => setTimeout(audio.beep, d));
        setTimeout(() => { audio.whistle(); el.disabled = false; }, 3000);
      });
    }
  }));

  // --- Picker --------------------------------------------------------------
  route('#/tool/picker', (params, query) => {
    let names = getNames();
    const view = () => html`
      ${header('Random picker', query)}
      <section class="card">
        <div class="picker-result" id="pk-out"><span class="muted" style="font-size:1rem;font-weight:500">Who goes first? Who's "it"?</span></div>
        <div class="grid-2">
          <button type="button" class="btn primary big" data-action="pickName">Pick a person</button>
          <button type="button" class="btn big" data-action="pickNum">Pick a number</button>
        </div>
        <div class="grid-3" style="margin-top:.6rem">
          <button type="button" class="btn" data-action="coin">Coin</button>
          <button type="button" class="btn" data-action="dice">Dice</button>
          <button type="button" class="btn" data-action="order">Turn order</button>
        </div>
      </section>
      <section class="card">
        ${nameEditor(names, 'Leave empty and "Pick a person" will pick a number between 1 and the group size instead.')}
        <div class="row" style="margin-top:.5rem"><label class="field" for="pk-n" style="margin:0">Group size</label><input class="text" style="width:90px" id="pk-n" type="number" inputmode="numeric" min="2" max="99" value="${store.getConfig().people}" aria-label="group size"></div>
      </section>`;
    const show = (text, sub) => {
      const out = document.getElementById('pk-out');
      if (!out) return;
      out.innerHTML = '';
      const b = document.createElement('div'); b.textContent = text; out.appendChild(b);
      if (sub) { const s = document.createElement('div'); s.className = 'muted small'; s.style.fontWeight = '500'; s.textContent = sub; out.appendChild(s); }
    };
    const reveal = (final, pool) => {
      audio.drumroll(1.2);
      let i = 0;
      const spin = setInterval(() => { show(pool[i++ % pool.length]); }, 70);
      setTimeout(() => { clearInterval(spin); show(final); audio.ding(); }, 1250);
    };
    const groupSize = () => Math.max(2, parseInt((document.getElementById('pk-n') || {}).value, 10) || store.getConfig().people);
    return {
      html: view(),
      onMount() {
        on('names', (el) => { names = parseNames(el.value); setNames(names); });
        on('pickName', () => {
          const pool = names.length >= 2 ? names : Array.from({ length: groupSize() }, (_, i) => '#' + (i + 1));
          reveal(pool[Math.floor(Math.random() * pool.length)], pool);
        });
        on('pickNum', () => { const n = groupSize(); const pool = Array.from({ length: n }, (_, i) => String(i + 1)); reveal(pool[Math.floor(Math.random() * n)], pool); });
        on('coin', () => reveal(Math.random() < 0.5 ? 'Heads' : 'Tails', ['Heads', 'Tails']));
        on('dice', () => reveal(String(1 + Math.floor(Math.random() * 6)), ['1', '2', '3', '4', '5', '6']));
        on('order', () => {
          const pool = names.length >= 2 ? names : Array.from({ length: groupSize() }, (_, i) => '#' + (i + 1));
          const order = engine.shuffle(pool);
          audio.drumroll(0.8);
          const out = document.getElementById('pk-out');
          out.innerHTML = '';
          const ol = document.createElement('ol'); ol.style.cssText = 'font-size:1.1rem;text-align:left;margin:0;padding-left:1.5rem;font-weight:600';
          order.forEach(n => { const li = document.createElement('li'); li.textContent = n; ol.appendChild(li); });
          out.appendChild(ol);
        });
      }
    };
  });
})();
