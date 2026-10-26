/* Animated explainer engine. Draws clay-style blob people and props on an SVG stage and plays
 * data-driven steps (see EXPLAINERS.md). No assets: everything is vector drawn here.
 */
(function () {
  'use strict';
  const W = 320, H = 200;
  const NS = 'http://www.w3.org/2000/svg';
  const PALETTE = ['#ff8f6b', '#6bc6ff', '#ffd166', '#9be38a', '#c9a0ff', '#ff9ed2', '#7fe0d4', '#ffb86b', '#a7b8ff', '#f4a1a1', '#8ad4ff', '#e3c56b', '#b4e39b', '#d6a9ff', '#ffc0e3', '#9ee8df'];
  const SKIN = ['#f7c9a3', '#e8b088', '#d9986f', '#c98356'];
  const TRANSITION = 0.6; // seconds for glides between steps
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------------------------------------------------------------- layouts
  const CIRCLE = { cx: 160, cy: 108, rx: 118, ry: 60 };
  function onEllipse(angle, scale) {
    scale = scale == null ? 1 : scale;
    return { x: CIRCLE.cx + Math.sin(angle) * CIRCLE.rx * scale, y: CIRCLE.cy - Math.cos(angle) * CIRCLE.ry * scale + 22 };
  }
  const circleAngle = (i, n) => (i / n) * Math.PI * 2;

  function layoutPositions(layout, n, chairs) {
    const people = [], chairPos = [];
    if (layout === 'row') {
      const gap = Math.min(42, 280 / Math.max(1, n - 1));
      const x0 = 160 - gap * (n - 1) / 2;
      for (let i = 0; i < n; i++) people.push({ x: x0 + gap * i, y: 140 });
    } else if (layout === 'teams') {
      const half = Math.ceil(n / 2);
      for (let i = 0; i < n; i++) {
        const left = i < half, k = left ? i : i - half, cnt = left ? half : n - half;
        const col = Math.floor(k / 4), rowI = k % 4;
        const rows = Math.min(4, cnt - col * 4);
        const y = 118 - (rows - 1) * 16 + rowI * 32 + 12;
        people.push({ x: left ? 84 - col * 34 : 236 + col * 34, y });
      }
    } else if (layout === 'pair') {
      for (let i = 0; i < n; i++) {
        if (i === 0) people.push({ x: 112, y: 140 });
        else if (i === 1) people.push({ x: 208, y: 140 });
        else people.push({ x: 60 + ((i - 2) * 50) % 220, y: 92 });
      }
    } else if (layout === 'scatter') {
      // Two staggered rows with a little jitter: looks loose, never overlaps.
      const top = Math.ceil(n / 2), bottom = n - top;
      const place = (count, y, shift) => { const gap = count > 1 ? Math.min(64, 250 / (count - 1)) : 0; const x0 = 160 - gap * (count - 1) / 2 + shift; for (let i = 0; i < count; i++) people.push({ x: x0 + gap * i, y: y + (i % 2 ? 10 : -6) }); };
      place(top, 100, -8);
      place(bottom, 168, 14);
    } else if (layout === 'chairs') {
      const k = chairs == null ? Math.max(1, n - 1) : chairs;
      for (let i = 0; i < k; i++) chairPos.push(onEllipse(circleAngle(i, k) + Math.PI / k, 0.55));
      for (let i = 0; i < n; i++) people.push(onEllipse(circleAngle(i, n), 1));
    } else { // circle
      for (let i = 0; i < n; i++) people.push(onEllipse(circleAngle(i, n), 1));
    }
    return { people, chairs: chairPos };
  }

  // ---------------------------------------------------------------- drawing
  function drawPerson(i) {
    const g = el('g', { class: 'ex-person' });
    const color = PALETTE[i % PALETTE.length];
    const skin = SKIN[(i * 7) % SKIN.length];
    el('ellipse', { class: 'ex-shadow', cx: 0, cy: 2, rx: 14, ry: 4 }, g);
    el('circle', { class: 'ex-ring', cx: 0, cy: -20, r: 26 }, g);
    el('rect', { class: 'ex-arm ex-arm-l', x: -19, y: -24, width: 8, height: 18, rx: 4, fill: color }, g);
    el('rect', { class: 'ex-arm ex-arm-r', x: 11, y: -24, width: 8, height: 18, rx: 4, fill: color }, g);
    el('rect', { class: 'ex-body', x: -13, y: -28, width: 26, height: 28, rx: 12, fill: color }, g);
    el('circle', { class: 'ex-head', cx: 0, cy: -38, r: 11.5, fill: skin }, g);
    el('path', { class: 'ex-hair', d: 'M-10,-42 Q0,-54 10,-42 Q4,-47 0,-46 Q-4,-47 -10,-42Z', fill: '#3a2a25' }, g);
    const face = el('g', { class: 'ex-face' }, g);
    el('circle', { class: 'ex-eye', cx: -4, cy: -39, r: 1.8 }, face);
    el('circle', { class: 'ex-eye', cx: 4, cy: -39, r: 1.8 }, face);
    el('path', { class: 'ex-eye-shut', d: 'M-6,-39 Q-4,-37 -2,-39 M2,-39 Q4,-37 6,-39', fill: 'none', stroke: '#3a2a25', 'stroke-width': 1.4 }, face);
    el('path', { class: 'ex-mouth ex-mouth-smile', d: 'M-4,-34 Q0,-30 4,-34', fill: 'none', stroke: '#3a2a25', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, face);
    el('path', { class: 'ex-mouth ex-mouth-sad', d: 'M-4,-32 Q0,-35 4,-32', fill: 'none', stroke: '#3a2a25', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, face);
    el('ellipse', { class: 'ex-mouth ex-mouth-open', cx: 0, cy: -33, rx: 3, ry: 3.6, fill: '#7a2e2e' }, face);
    el('rect', { class: 'ex-blind', x: -11, y: -43, width: 22, height: 7, rx: 2, fill: '#2b2b2b' }, face);
    el('path', { class: 'ex-shades', d: 'M-10,-41 h8 v4 h-8z M2,-41 h8 v4 h-8z', fill: '#111' }, face);
    el('path', { class: 'ex-cap', d: 'M-12,-44 Q0,-56 12,-44 L16,-43 L-12,-43Z', fill: '#d9480f' }, g);
    el('path', { class: 'ex-x', d: 'M-16,-46 L16,-4 M16,-46 L-16,-4', stroke: '#e03131', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    el('text', { class: 'ex-label', x: 0, y: 14, 'text-anchor': 'middle' }, g);
    const b = el('g', { class: 'ex-bubble' }, g);
    el('rect', { x: -34, y: -78, width: 68, height: 18, rx: 9 }, b);
    el('path', { d: 'M-4,-60 L0,-54 L4,-60Z' }, b);
    el('text', { x: 0, y: -65, 'text-anchor': 'middle' }, b);
    return g;
  }

  const PROPS = {
    parcel(g) { el('rect', { x: -12, y: -18, width: 24, height: 18, rx: 3, fill: '#e9b44c' }, g); el('path', { d: 'M0,-18 v18 M-12,-9 h24', stroke: '#d9480f', 'stroke-width': 2.5 }, g); },
    gift(g) { el('rect', { x: -12, y: -18, width: 24, height: 18, rx: 3, fill: '#e03131' }, g); el('path', { d: 'M0,-18 v18 M-12,-9 h24', stroke: '#ffd166', 'stroke-width': 2.5 }, g); el('circle', { cx: 0, cy: -18, r: 3.5, fill: '#ffd166' }, g); },
    chair(g) { el('rect', { x: -9, y: -4, width: 18, height: 6, rx: 2, fill: '#b08968' }, g); el('rect', { x: 6, y: -22, width: 4, height: 20, rx: 2, fill: '#b08968' }, g); el('path', { d: 'M-7,2 v8 M7,2 v8', stroke: '#8a6a4e', 'stroke-width': 3 }, g); },
    ball(g) { el('circle', { cx: 0, cy: -9, r: 9, fill: '#e5484d' }, g); el('path', { d: 'M-8,-13 Q0,-6 8,-13', fill: 'none', stroke: '#fff', 'stroke-width': 2 }, g); },
    balloon(g) { el('path', { d: 'M0,-4 L0,6', stroke: '#777', 'stroke-width': 1 }, g); el('ellipse', { cx: 0, cy: -17, rx: 9.5, ry: 12, fill: '#f28ab2' }, g); el('path', { d: 'M-2,-5 L0,-2 L2,-5Z', fill: '#f28ab2' }, g); el('ellipse', { cx: -3, cy: -22, rx: 2, ry: 3, fill: '#fff', opacity: .6 }, g); },
    note(g) { el('circle', { cx: -4, cy: -4, r: 4.5, fill: '#5b5bd6' }, g); el('path', { d: 'M0,-5 v-16 h8', stroke: '#5b5bd6', 'stroke-width': 2.5, fill: 'none' }, g); },
    phone(g) { el('rect', { x: -7, y: -22, width: 14, height: 22, rx: 3, fill: '#2b2b2b' }, g); el('rect', { x: -5, y: -19, width: 10, height: 15, rx: 1, fill: '#8ad4ff' }, g); },
    paper(g) { el('rect', { x: -8, y: -21, width: 16, height: 21, rx: 1.5, fill: '#fff', stroke: '#bbb' }, g); el('path', { d: 'M-5,-16 h10 M-5,-12 h10 M-5,-8 h7', stroke: '#999', 'stroke-width': 1.2 }, g); },
    cup(g) { el('path', { d: 'M-8,-18 h16 l-2,18 h-12z', fill: '#4cc38a' }, g); },
    spoon(g) { el('rect', { x: -1.5, y: -22, width: 3, height: 16, rx: 1.5, fill: '#999' }, g); el('ellipse', { cx: 0, cy: -4, rx: 5, ry: 3.5, fill: '#aaa' }, g); el('circle', { cx: 0, cy: -8, r: 4.5, fill: '#ffd400' }, g); },
    rope(g) { el('path', { d: 'M-30,-8 h60', stroke: '#b08968', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); el('path', { d: 'M-24,-11 l4,6 M-14,-11 l4,6 M-4,-11 l4,6 M6,-11 l4,6 M16,-11 l4,6', stroke: '#8a6a4e', 'stroke-width': 1.5 }, g); },
    stones(g) { [[14, 0], [12, -5], [10, -10], [8, -15], [6, -19], [5, -23], [4, -26]].forEach(([w, y], i) => el('rect', { x: -w, y: y - 4, width: w * 2, height: 4.5, rx: 2, fill: i % 2 ? '#9a9a9a' : '#b5b5b5' }, g)); },
    bowl(g) { el('path', { d: 'M-12,-10 Q0,6 12,-10 Z', fill: '#9c6b3f' }, g); el('ellipse', { cx: 0, cy: -10, rx: 12, ry: 3.5, fill: '#c98b5a' }, g); },
    chit(g) { el('rect', { x: -6, y: -9, width: 12, height: 9, rx: 1, fill: '#fff', stroke: '#bbb', transform: 'rotate(-12)' }, g); },
    potato(g) { el('ellipse', { cx: 0, cy: -8, rx: 10, ry: 7, fill: '#b9834d' }, g); el('circle', { cx: -3, cy: -9, r: 1.2, fill: '#8a5a2b' }, g); el('circle', { cx: 4, cy: -6, r: 1.2, fill: '#8a5a2b' }, g); },
    line(g) { el('path', { d: 'M-120,0 h240', stroke: '#c9a27e', 'stroke-width': 3, 'stroke-dasharray': '10 6', 'stroke-linecap': 'round' }, g); },
    timer(g) { el('circle', { cx: 0, cy: -12, r: 11, fill: '#fff', stroke: '#2b2b2b', 'stroke-width': 2.5 }, g); el('path', { d: 'M0,-12 v-7 M0,-12 h5', stroke: '#2b2b2b', 'stroke-width': 2, 'stroke-linecap': 'round' }, g); el('rect', { x: -3, y: -27, width: 6, height: 3, fill: '#2b2b2b' }, g); },
    star(g) { el('path', { d: 'M0,-22 L4,-14 L13,-13 L6,-7 L8,2 L0,-3 L-8,2 L-6,-7 L-13,-13 L-4,-14Z', fill: '#ffd166', stroke: '#e0a800', 'stroke-width': 1 }, g); },
    text(g, p) { const t = String(p.text || ''); const w = Math.max(30, t.length * 7.5 + 14); el('rect', { x: -w / 2, y: -20, width: w, height: 20, rx: 10, fill: '#2b2b2b' }, g); el('text', { x: 0, y: -6, 'text-anchor': 'middle', fill: '#fff', 'font-size': 11, 'font-weight': 800 }, g).textContent = t; },
    x(g) { el('path', { d: 'M-8,-18 L8,-2 M8,-18 L-8,-2', stroke: '#e03131', 'stroke-width': 4, 'stroke-linecap': 'round' }, g); },
    tick(g) { el('path', { d: 'M-9,-10 L-3,-3 L10,-18', stroke: '#2b8a3e', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); },
    hat(g) { el('path', { d: 'M-12,-6 Q0,-22 12,-6 L16,-5 L-16,-5Z', fill: '#d9480f' }, g); }
  };
  function drawProp(p) {
    const g = el('g', { class: 'ex-prop' });
    (PROPS[p.type] || PROPS.star)(g, p);
    return g;
  }

  const FX = {
    music(g) { for (let i = 0; i < 3; i++) { const w = el('g', { transform: `translate(${262 + i * 18},70)` }, g); const n = el('g', { class: 'ex-fx-note', style: `animation-delay:${i * 0.6}s` }, w); PROPS.note(n); } },
    stop(g) { const w = el('g', { transform: 'translate(160,112)' }, g); const t = el('g', { class: 'ex-fx-stop' }, w); el('rect', { x: -40, y: -16, width: 80, height: 30, rx: 15, fill: '#e03131' }, t); el('text', { x: 0, y: 5, 'text-anchor': 'middle', fill: '#fff', 'font-size': 16, 'font-weight': 900 }, t).textContent = 'STOP'; },
    timer(g) { const t = el('g', { transform: 'translate(28,44)' }, g); PROPS.timer(t); const h = el('g', { transform: 'translate(0,-12)' }, t); el('path', { class: 'ex-fx-hand', d: 'M0,0 v-8', stroke: '#e03131', 'stroke-width': 2, 'stroke-linecap': 'round' }, h); },
    confetti(g) { for (let i = 0; i < 18; i++) el('rect', { class: 'ex-fx-conf', x: 10 + i * 17, y: -10, width: 5, height: 8, rx: 1, fill: PALETTE[i % PALETTE.length], style: `animation-delay:${(i % 6) * 0.35}s; animation-duration:${2.2 + (i % 4) * 0.4}s` }, g); },
    zzz(g) { ['z', 'z', 'z'].forEach((c, i) => { const w = el('g', { transform: `translate(${268 + i * 12},50)` }, g); el('text', { class: 'ex-fx-z', x: 0, y: 0, 'font-size': 12 + i * 3, 'font-weight': 800, fill: '#5b5bd6', style: `animation-delay:${i * 0.5}s` }, w).textContent = c; }); },
    whistle(g) { const t = el('g', { transform: 'translate(30,40)' }, g); el('path', { d: 'M-12,0 h16 a7,7 0 1 1 0,14 h-16 a7,7 0 1 1 0,-14z', fill: '#2b2b2b' }, t); el('path', { class: 'ex-fx-sound', d: 'M12,-6 q6,13 0,26 M20,-10 q9,17 0,34', fill: 'none', stroke: '#5b5bd6', 'stroke-width': 2, 'stroke-linecap': 'round' }, t); },
    night(g) { el('rect', { x: 0, y: 0, width: W, height: H, fill: '#1b2742', opacity: .35 }, g); el('path', { d: 'M292,26 a12,12 0 1 0 10,19 a9,9 0 1 1 -10,-19z', fill: '#ffe08a' }, g); }
  };

  // ---------------------------------------------------------------- player
  function mount(container, steps, opts) {
    opts = opts || {};
    container.innerHTML = '';
    container.classList.add('explainer');
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ex-stage', role: 'img', 'aria-label': 'animated explainer' }, container);
    el('rect', { x: 0, y: 0, width: W, height: H, rx: 18, class: 'ex-floor' }, svg);
    el('ellipse', { cx: 160, cy: 150, rx: 150, ry: 34, class: 'ex-rug' }, svg);
    const layerChairs = el('g', {}, svg), layerPeople = el('g', {}, svg), layerProps = el('g', {}, svg), layerArrows = el('g', {}, svg), layerFx = el('g', {}, svg);

    const caption = document.createElement('p');
    caption.className = 'ex-caption';
    container.appendChild(caption);
    const bar = document.createElement('div');
    bar.className = 'ex-bar';
    bar.innerHTML = '<button type="button" class="btn icon ex-prev" aria-label="previous step">‹</button>' +
      '<button type="button" class="btn icon primary ex-play" aria-label="play or pause">❚❚</button>' +
      '<button type="button" class="btn icon ex-next" aria-label="next step">›</button>' +
      '<div class="ex-dots" role="tablist"></div>' +
      '<button type="button" class="btn icon ex-voice" aria-label="read captions aloud" title="Read captions aloud">🔈</button>';
    container.appendChild(bar);
    const dots = bar.querySelector('.ex-dots');
    steps.forEach((_, i) => { const d = document.createElement('i'); d.dataset.i = i; dots.appendChild(d); });

    // Entity registry: people by index, props by id, chairs by index.
    const people = [], chairs = [], props = new Map();
    const state = { layout: 'circle', n: 0, chairs: null };
    let stepIndex = -1, stepStart = 0, playing = !prefersReduced, raf = null, lastT = 0, holdTimer = null, voice = false;
    let arrows = [];
    let destroyed = false;
    try { voice = localStorage.getItem('gp.explain.voice') === '1'; } catch (e) { /* ignore */ }

    const makeEntity = (node, layer, isPerson) => { layer.appendChild(node); return { node, isPerson: !!isPerson, from: { x: 160, y: 120, o: 0 }, base: { x: 160, y: 120, o: 1 }, cur: { x: 160, y: 120, s: 1, r: 0, o: 0 }, moves: [], dying: false }; };
    const setTransform = (e) => { e.node.setAttribute('transform', `translate(${e.cur.x.toFixed(1)},${e.cur.y.toFixed(1)}) rotate(${e.cur.r.toFixed(1)}) scale(${e.cur.s.toFixed(3)})`); e.node.setAttribute('opacity', e.cur.o.toFixed(2)); };

    function anchor(spec, positions) {
      if (!spec) return { x: 160, y: 120 };
      if (typeof spec === 'object') return { x: spec.x, y: spec.y };
      const s = String(spec);
      const named = { center: { x: 160, y: 120 }, left: { x: 40, y: 125 }, right: { x: 280, y: 125 }, top: { x: 160, y: 50 }, bottom: { x: 160, y: 175 }, corner: { x: 36, y: 72 }, corner2: { x: 284, y: 72 } };
      if (named[s]) return named[s];
      let m = s.match(/^p(\d+)(?:\.(hand|head))?$/);
      if (m) { const p = positions.people[+m[1]] || { x: 160, y: 120 }; if (m[2] === 'hand') return { x: p.x + 16, y: p.y - 10 }; if (m[2] === 'head') return { x: p.x, y: p.y - 60 }; return { x: p.x, y: p.y }; }
      m = s.match(/^c(\d+)$/);
      if (m) { const c = positions.chairs[+m[1]]; return c ? { x: c.x, y: c.y } : { x: 160, y: 120 }; }
      m = s.match(/^mid:(\d+),(\d+)$/);
      if (m) { const a = positions.people[+m[1]], b = positions.people[+m[2]]; if (a && b) return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8 }; }
      return { x: 160, y: 120 };
    }

    function applyStep(i, instant) {
      const step = steps[i];
      stepIndex = i;
      stepStart = performance.now();
      if (step.layout) state.layout = step.layout;
      if (step.people) state.n = Math.max(1, Math.min(16, step.people));
      if (step.chairs != null) state.chairs = step.chairs;
      if (state.layout !== 'chairs') state.chairs = null;
      const pos = layoutPositions(state.layout, state.n, state.chairs);
      const now = performance.now();
      const snapshot = (e) => { e.from = { x: e.cur.x, y: e.cur.y, o: e.cur.o }; e.t0 = now; };

      // People
      while (people.length < state.n) { const e = makeEntity(drawPerson(people.length), layerPeople, true); e.cur.x = 160; e.cur.y = 110; people.push(e); }
      people.forEach((e, k) => {
        snapshot(e);
        e.moves = [];
        if (k < state.n) {
          e.base = { x: pos.people[k].x, y: pos.people[k].y, o: 1 };
          const st = (step.states && step.states[k]) || 'normal';
          e.node.setAttribute('class', 'ex-person st-' + st);
          const lbl = e.node.querySelector('.ex-label'); lbl.textContent = (step.labels && step.labels[k]) || '';
          const bub = e.node.querySelector('.ex-bubble'); const bt = (step.bubbles && step.bubbles[k]) || ''; bub.style.display = bt ? '' : 'none'; bub.querySelector('text').textContent = bt;
          // Keep bubbles on the stage: shift sideways for people at the top edge, clamp near the left/right edges.
          let bdx = e.base.x < 40 ? 40 - e.base.x : e.base.x > 280 ? 280 - e.base.x : 0, bdy = 0;
          if (e.base.y < 96) { bdx += e.base.x < 160 ? 46 : -46; bdy = 36; }
          bub.setAttribute('transform', bdx || bdy ? `translate(${bdx},${bdy})` : '');
          if (bt) layerPeople.appendChild(e.node); // a speaking person is drawn on top so the bubble is never hidden behind a neighbour
        } else { e.base = { x: e.cur.x, y: e.cur.y, o: 0 }; }
      });
      // Chairs
      const chairCount = pos.chairs.length;
      while (chairs.length < chairCount) { const e = makeEntity(drawProp({ type: 'chair' }), layerChairs); chairs.push(e); }
      chairs.forEach((e, k) => { snapshot(e); e.base = k < chairCount ? { x: pos.chairs[k].x, y: pos.chairs[k].y, o: 1 } : { x: e.cur.x, y: e.cur.y, o: 0 }; });
      // Props
      const wanted = new Set();
      (step.props || []).forEach(p => {
        wanted.add(p.id);
        let e = props.get(p.id);
        if (!e || e.type !== p.type || e.text !== p.text) { if (e) e.node.remove(); e = makeEntity(drawProp(p), layerProps); e.type = p.type; e.text = p.text; const a = anchor(p.at, pos); e.cur.x = a.x; e.cur.y = a.y; props.set(p.id, e); }
        snapshot(e);
        const a = anchor(p.at, pos);
        e.base = { x: a.x, y: a.y, o: 1 };
        e.size = p.size || 1;
        e.moves = [];
        e.dying = false;
      });
      props.forEach((e, id) => { if (!wanted.has(id)) { snapshot(e); e.base = { x: e.cur.x, y: e.cur.y, o: 0 }; e.moves = []; e.dying = true; } });
      // Moves
      (step.moves || []).forEach(m => {
        const target = /^p\d+$/.test(m.id) ? people[+m.id.slice(1)] : props.get(m.id);
        if (!target) return;
        const mv = Object.assign({ dur: 1.5 }, m);
        if (mv.to) mv.toPos = anchor(mv.to, pos);
        if (mv.path) mv.pathPos = mv.path.map(a => anchor(a, pos));
        if (mv.orbit) { mv.n = state.n; mv.scale = state.layout === 'chairs' ? 0.78 : 0.82; }
        mv.startPos = { x: target.base.x, y: target.base.y };
        target.moves.push(mv);
      });
      // Arrows (pointing)
      layerArrows.innerHTML = '';
      arrows = [];
      if (step.point) for (const k in step.point) { const a = el('path', { class: 'ex-arrow', fill: 'none' }, layerArrows); arrows.push({ from: +k, to: +step.point[k], node: a }); }
      // Fx
      layerFx.innerHTML = '';
      (step.fx || []).forEach(f => { if (FX[f]) { const g = el('g', { class: 'ex-fx' }, layerFx); FX[f](g); } });
      // Caption + dots
      caption.textContent = step.say || '';
      dots.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', k === i));
      // While playing, scheduleHold() narrates and advances when the voice finishes. Paused: just read it out.
      if (!playing && voice && step.say && window.GP && window.GP.ui) window.GP.ui.speech.speak(step.say);
      if (instant) { [...people, ...chairs, ...props.values()].forEach(e => { e.cur.x = e.base.x; e.cur.y = e.base.y; e.cur.o = e.base.o; }); }
      scheduleHold();
      if (!raf) raf = requestAnimationFrame(frame);
    }

    /* How long a step stays on screen.
     * Voice on: until the narration has actually finished (plus a beat), so long captions are never cut off;
     *           a safety timer covers browsers whose speech engine never reports the end.
     * Voice off: an estimate of how long the caption takes to read, never shorter than the step's own animation.
     * Manual prev/next always wins: it bumps `speakToken` so stale speech callbacks are ignored. */
    let speakToken = 0, safetyTimer = null;
    function scheduleHold() {
      clearTimeout(holdTimer); clearTimeout(safetyTimer);
      speakToken++;
      if (!playing) return;
      const step = steps[stepIndex];
      const say = step.say || '';
      const longest = (step.moves || []).reduce((m, mv) => Math.max(m, mv.loop ? 0 : (mv.dur || 1.5) + (mv.at || 0)), 0);
      const animTime = Math.max(1.5, step.hold || longest + 1);           // seconds the picture needs
      const readTime = say ? 1.4 + say.length * 0.055 : 2;                // ~18 chars/s silent reading, plus a beat
      const advance = () => { if (!destroyed && playing) applyStep((stepIndex + 1) % steps.length); };
      const speech = window.GP && window.GP.ui && window.GP.ui.speech;
      if (voice && say && speech && speech.available()) {
        const token = speakToken;
        const started = performance.now();
        const finished = () => {
          if (token !== speakToken || destroyed) return;   // user moved on, or a cancelled utterance reporting late
          clearTimeout(safetyTimer);
          const elapsed = (performance.now() - started) / 1000;
          holdTimer = setTimeout(advance, Math.max(0.8, animTime - elapsed) * 1000);
        };
        safetyTimer = setTimeout(finished, (readTime * 2.5 + 3) * 1000); // speech engine went silent without telling us
        const ok = speech.speak(say, { onend: finished, onerror: finished });
        if (!ok) { clearTimeout(safetyTimer); holdTimer = setTimeout(advance, Math.max(animTime, readTime) * 1000); }
      } else {
        holdTimer = setTimeout(advance, Math.min(14, Math.max(animTime, readTime)) * 1000);
      }
    }

    function applyMoves(e, t, baseX, baseY) {
      let x = baseX, y = baseY, s = e.size || 1, r = 0, o = null;
      for (const m of e.moves) {
        const d = m.dur || 1.5;
        if (m.to) {
          let k = clamp01(t / d);
          if (m.loop) { const c = (t / d) % 2; k = c < 1 ? c : 2 - c; }
          x = lerp(m.startPos.x, m.toPos.x, easeInOut(k)); y = lerp(m.startPos.y, m.toPos.y, easeInOut(k));
        }
        if (m.path) {
          const segs = m.pathPos.length - 1;
          if (segs >= 1) {
            let k = m.loop ? (t / d) % 1 : clamp01(t / d);
            const seg = Math.min(segs - 1, Math.floor(k * segs)), kk = k * segs - seg;
            const a = m.pathPos[seg], b = m.pathPos[seg + 1];
            x = lerp(a.x, b.x, kk); y = lerp(a.y, b.y, kk);
          }
        }
        if (m.orbit) {
          const [from, to] = m.orbit;
          let k = m.loop ? (t / d) % 1 : clamp01(t / d);
          k = easeInOut(k);
          let a0 = circleAngle(from, m.n), a1 = circleAngle(to, m.n);
          if (a1 <= a0) a1 += Math.PI * 2;
          const p = onEllipse(lerp(a0, a1, k), m.scale);
          x = p.x; y = e.isPerson ? p.y : p.y - 14;
        }
        if (m.bounce) y -= 7 * Math.abs(Math.sin(t * 4));
        if (m.shake) x += 3 * Math.sin(t * 28);
        if (m.spin) r += (t * 360 / d) % 360;
        if (m.grow) s *= lerp(1, 1.5, clamp01(t / d));
        if (m.shrink) s *= lerp(1, 0.4, clamp01(t / d));
        if (m.pop) { const at = m.at || 1.5; if (t >= at) { const k = clamp01((t - at) / 0.3); s *= 1 + k * 0.8; o = 1 - k; } }
        if (m.fall) { const k = clamp01(t / d); y += easeOut(k) * 34; r += (m.id && /^p/.test(m.id) ? 0 : easeOut(k) * 40); if (k > 0.6) o = 1 - (k - 0.6) / 0.4 * 0.5; }
      }
      return { x, y, s, r, o };
    }

    function frame(now) {
      raf = null;
      if (destroyed) return;
      const t = Math.max(0, (now - stepStart) / 1000); // rAF timestamps can precede the stepStart capture
      const all = [...people, ...chairs, ...props.values()];
      for (const e of all) {
        const k = prefersReduced ? 1 : easeInOut(clamp01((now - (e.t0 || now)) / (TRANSITION * 1000)));
        const bx = lerp(e.from.x, e.base.x, k), by = lerp(e.from.y, e.base.y, k), bo = lerp(e.from.o, e.base.o, k);
        const r = e.moves.length && !prefersReduced ? applyMoves(e, t, bx, by) : { x: bx, y: by, s: e.size || 1, r: 0, o: null };
        e.cur.x = r.x; e.cur.y = r.y; e.cur.s = r.s; e.cur.r = r.r; e.cur.o = r.o == null ? bo : Math.min(bo, r.o);
        setTransform(e);
      }
      for (const a of arrows) {
        const p = people[a.from], q = people[a.to];
        if (!p || !q) continue;
        const dx = q.cur.x - p.cur.x, dy = (q.cur.y - 20) - (p.cur.y - 24), len = Math.hypot(dx, dy) || 1;
        const sx = p.cur.x + dx / len * 18, sy = p.cur.y - 24 + dy / len * 18, ex = q.cur.x - dx / len * 22, ey = q.cur.y - 20 - dy / len * 22;
        const ux = dx / len, uy = dy / len;
        a.node.setAttribute('d', `M${sx},${sy} L${ex},${ey} M${ex - ux * 6 - uy * 5},${ey - uy * 6 + ux * 5} L${ex},${ey} L${ex - ux * 6 + uy * 5},${ey - uy * 6 - ux * 5}`);
      }
      const still = all.every(e => e.moves.length === 0 && now - (e.t0 || 0) > TRANSITION * 1000) && arrows.length === 0;
      if (!still || playing) raf = requestAnimationFrame(frame);
    }

    // --- controls ---------------------------------------------------------
    const playBtn = bar.querySelector('.ex-play');
    const setPlaying = (p) => { playing = p; playBtn.textContent = p ? '❚❚' : '▶'; playBtn.classList.toggle('primary', p); if (p) { stepStart = performance.now(); scheduleHold(); if (!raf) raf = requestAnimationFrame(frame); } else { clearTimeout(holdTimer); clearTimeout(safetyTimer); speakToken++; if (window.GP && window.GP.ui) window.GP.ui.speech.stop(); } };
    const voiceBtn = bar.querySelector('.ex-voice');
    const setVoice = (v) => { voice = v; voiceBtn.textContent = v ? '🔊' : '🔈'; voiceBtn.classList.toggle('primary', v); try { localStorage.setItem('gp.explain.voice', v ? '1' : '0'); } catch (e) { /* ignore */ } };
    if (!window.GP || !window.GP.ui || !window.GP.ui.speech.available()) voiceBtn.style.display = 'none';
    setVoice(voice);
    bar.addEventListener('click', (ev) => {
      const b = ev.target.closest('button, .ex-dots i');
      if (!b) return;
      if (b.classList.contains('ex-prev')) { applyStep((stepIndex - 1 + steps.length) % steps.length); }
      else if (b.classList.contains('ex-next')) { applyStep((stepIndex + 1) % steps.length); }
      else if (b.classList.contains('ex-play')) { setPlaying(!playing); }
      else if (b.classList.contains('ex-voice')) { setVoice(!voice); if (playing) { stepStart = performance.now(); scheduleHold(); } else if (voice) window.GP.ui.speech.speak(steps[stepIndex].say || ''); else window.GP.ui.speech.stop(); }
      else if (b.dataset.i != null) { applyStep(+b.dataset.i); }
    });
    svg.addEventListener('click', () => setPlaying(!playing));
    const onVis = () => { if (document.hidden) clearTimeout(holdTimer); else if (playing) scheduleHold(); };
    document.addEventListener('visibilitychange', onVis);

    applyStep(0, true);
    setPlaying(playing);

    return {
      destroy() { destroyed = true; clearTimeout(holdTimer); clearTimeout(safetyTimer); speakToken++; if (raf) cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); if (window.GP && window.GP.ui) window.GP.ui.speech.stop(); },
      goto: (i) => applyStep(i), play: () => setPlaying(true), pause: () => setPlaying(false)
    };
  }

  window.GP = window.GP || {};
  window.GP.explain = { mount, layoutPositions, PROPS: Object.keys(PROPS), FX: Object.keys(FX) };
})();
