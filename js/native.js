/* Bridge to the Android app shell. Inside the app, the native side injects `window.GPNative`
 * (see android/app/src/main/java/.../MainActivity.java); in a browser it does not exist and
 * everything here reports "not available", so callers fall back to the web APIs.
 *
 * Why this exists: Android's embedded web engine has no speech synthesis, no screen wake lock and
 * no share sheet. The app provides those natively and this file is the only place that knows it.
 */
(function () {
  'use strict';
  const N = window.GPNative || null;
  const has = (name) => !!N && typeof N[name] === 'function';

  // Text-to-speech: one utterance at a time; the native side reports the end by utterance id.
  let ttsSeq = 0;
  const ttsWaiting = Object.create(null); // id → { onend, onerror }
  window.GP_onNative = function (kind, id, event) {
    if (kind !== 'tts') return;
    const cb = ttsWaiting[id];
    if (!cb) return;
    delete ttsWaiting[id];
    try { if (event === 'end') { if (cb.onend) cb.onend(); } else if (cb.onerror) cb.onerror(event); } catch (e) { console.error(e); }
  };

  const native = {
    /** True inside the Android app. */
    isApp: !!N,
    canSpeak: has('speak'),
    /** Speak text with the phone's own voice. Callbacks fire at most once. Returns false if unavailable. */
    speak(text, cb) {
      if (!has('speak')) return false;
      const id = 'u' + (++ttsSeq);
      // A new utterance replaces the previous one; drop its callbacks so a late "stopped" report is ignored.
      Object.keys(ttsWaiting).forEach(k => { delete ttsWaiting[k]; });
      ttsWaiting[id] = cb || {};
      try { N.speak(String(text), id); return true; } catch (e) { delete ttsWaiting[id]; return false; }
    },
    stopSpeaking() {
      Object.keys(ttsWaiting).forEach(k => { delete ttsWaiting[k]; });
      if (has('stopSpeaking')) { try { N.stopSpeaking(); } catch (e) { /* ignore */ } }
    },
    canKeepAwake: has('keepAwake'),
    keepAwake(on) { if (has('keepAwake')) { try { N.keepAwake(!!on); } catch (e) { /* ignore */ } } },
    canShare: has('share'),
    share(title, text, url) { if (!has('share')) return false; try { N.share(String(title || ''), String(text || ''), String(url || '')); return true; } catch (e) { return false; } }
  };

  window.GP = window.GP || {};
  window.GP.native = native;
})();
