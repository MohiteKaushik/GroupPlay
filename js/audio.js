/* Sounds synthesised with the Web Audio API. Zero audio files, zero bytes downloaded.
 * The AudioContext is created lazily on the first user gesture (browser autoplay rules).
 */
(function () {
  'use strict';

  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem('gp.sound') === '0'; } catch (e) { /* ignore */ }

  function context() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** Play one tone. freq in Hz, duration in seconds, type = oscillator type. */
  function tone(freq, duration, opts) {
    if (muted && opts && opts.ui) return; // the mute toggle silences UI pops only; game sounds (alarm, buzzer) always play
    const ac = context();
    if (!ac) return;
    opts = opts || {};
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, ac.currentTime + duration);
    const vol = opts.volume || 0.4;
    gain.gain.setValueAtTime(0.0001, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration + 0.05);
  }

  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }

  const sounds = {
    /** Short confirmation tick for button presses in timers. */
    tick() { tone(1200, 0.04, { volume: 0.15, type: 'square' }); },
    /** Pleasant "correct" chime. */
    ding() { tone(880, 0.12); setTimeout(() => tone(1320, 0.25), 90); vibrate(40); },
    /** Harsh "wrong / time's up" buzzer. */
    buzzer() { tone(140, 0.6, { type: 'sawtooth', volume: 0.5 }); vibrate([120, 60, 120]); },
    /** Three rising beeps then a long one: timer finished. */
    alarm() {
      [0, 180, 360].forEach((d, i) => setTimeout(() => tone(700 + i * 120, 0.12, { type: 'square', volume: 0.3 }), d));
      setTimeout(() => tone(1000, 0.7, { type: 'square', volume: 0.35 }), 560);
      vibrate([200, 100, 200, 100, 500]);
    },
    /** Whistle: start / stop signal for races. */
    whistle() { tone(2200, 0.5, { type: 'sine', slideTo: 2600, volume: 0.45 }); vibrate(150); },
    /** Air-horn style blast. */
    horn() { tone(220, 0.9, { type: 'sawtooth', volume: 0.5, slideTo: 200 }); tone(330, 0.9, { type: 'sawtooth', volume: 0.3 }); vibrate(400); },
    /** Drum roll: rapid low ticks for reveals. */
    drumroll(seconds) {
      const n = Math.round((seconds || 1.5) * 16);
      for (let i = 0; i < n; i++) setTimeout(() => tone(150 + (i % 2) * 30, 0.05, { type: 'triangle', volume: 0.25 }), i * 62);
    },
    /** Countdown beep (last 3 seconds). */
    beep() { tone(900, 0.1, { type: 'square', volume: 0.25 }); },
    /** UI: soft clay "pop" for ordinary buttons and chips. */
    tap() { tone(520, 0.07, { type: 'sine', slideTo: 300, volume: 0.18, ui: true }); },
    /** UI: brighter two-note "boop" for primary actions. */
    boop() { tone(420, 0.08, { type: 'triangle', slideTo: 640, volume: 0.2, ui: true }); setTimeout(() => tone(760, 0.1, { type: 'sine', volume: 0.16, ui: true }), 70); },
    /** UI: toggle on/off click. */
    click(on) { tone(on ? 900 : 500, 0.05, { type: 'square', volume: 0.1, ui: true }); }
  };
  const isMuted = () => muted;
  function setMuted(m) { muted = !!m; try { localStorage.setItem('gp.sound', muted ? '0' : '1'); } catch (e) { /* ignore */ } }

  /** Call once on the first tap anywhere so later sounds are allowed to play. */
  function unlock() { context(); }

  window.GP = window.GP || {};
  window.GP.audio = Object.assign({ unlock, vibrate, tone, isMuted, setMuted }, sounds);
})();
