# GroupPlay

A website that tells a group what to play. One person answers four questions (how many people, phones, who is playing, what you have) and gets games that fit, with rules written to be read aloud. Includes host tools (timer, scoreboard, team divider, buzzer, random picker, musical-chairs referee) and phone-based games (Mafia narrator, Imposter, Heads Up, prompt decks).

Design constraints, in priority order:

1. **Works with no internet after the first visit.** Everything is precached by a service worker. Total first load is about 60 KB compressed.
2. **No build step, no dependencies.** Plain HTML, CSS and JavaScript. Edit a file, save, deploy. It even runs from a folder on disk (double-click `index.html`); only offline caching needs a real HTTPS host.
3. **Phone is a facilitator, not the game.** Most games in the catalogue need no phone at all.
4. **Nothing leaves the phone.** No accounts, no analytics, no server. Bookmarks, scores and game state live in localStorage.

## Folder layout

```
index.html            app shell (single page, hash routing)
css/app.css           all styles, light + dark
js/games.js           THE GAME DATABASE — the thing you will edit most (see SCHEMA.md)
js/decks.js           prompt decks: charades words, Bollywood titles, truth/dare, etc.
js/explainers.js      ANIMATED EXPLAINERS per game (see EXPLAINERS.md) — 3–6 captioned steps each
js/explain.js         the explainer engine: clay blob people, props, moves, fx, player controls
js/engine.js          recommendation filters + scoring, seeded random
js/store.js           localStorage wrapper
js/audio.js           synthesised sounds (no audio files)
js/ui.js              template helper, router, event delegation, toast, wake lock, speech
js/app.js             home, wizard, results, game page, browse, saved, tools index
js/tools.js           timer, random stop, scoreboard, teams, buzzer, picker
js/play.js            Mafia narrator, Imposter, Heads Up, prompt deck viewer
js/version.js         version string shown on the About page (written by release script)
js/config.js          ONE setting: relayUrl, which switches "Play together" on (see MULTIPLAYER.md)
js/net.js             live rooms over HTTP + Server-Sent Events (Firebase REST protocol, no SDK)
js/qr.js              QR code encoder (no library) for the join link
js/online.js          Play together: lobby, Imposter, Mafia (silent night), Quick Vote, Buzzer
sw.js                 service worker (cache-first precache; VERSION bumped per release)
manifest.webmanifest  PWA install metadata
icons/                app icons
_headers              Netlify / Cloudflare Pages cache headers
tools/validate-games.js   checks games.js + decks.js against the schema
tools/validate-explainers.js  checks explainers.js against EXPLAINERS.md
tools/release.js          validates, then bumps the version in sw.js and js/version.js
tools/relay.js            live-room server + static server; run it on a hotspot laptop for no-internet play
tools/test-qr.js          encodes sample strings and decodes them with OpenCV
MULTIPLAYER.md        how to switch on Play together (Firebase in 5 minutes, or the relay)
SCHEMA.md             how to write a game entry
EXPLAINERS.md         how to write an animated explainer
```

## Adding or editing games

1. Open `js/games.js`, copy an existing entry, change it. Field meanings and allowed values are in `SCHEMA.md`.
2. Run `node tools/validate-games.js`. Fix anything it reports. It also prints a coverage summary (how many games for elders, for 2–3 people, with no props, and so on) so you can see gaps.
3. Release (below).

Never change an existing game's `id`: bookmarks and "played tonight" are keyed on it.

## Adding an animated explainer

Open `js/explainers.js`, add an entry under the game's id following `EXPLAINERS.md` (3–6 steps; each step is a caption plus who stands where, what they hold, what moves). Run `node tools/validate-explainers.js`. Open the game page to watch it. Everything is drawn in code: an explainer costs about half a kilobyte.

## Design

Claymorphism: soft double shadows, big radii, squishy press (`transform: scale(.94)` + inset shadow), spring easing. Every tappable element plays a short synthesised "pop"; the bell in the header mutes those (game sounds such as the timer alarm and buzzer still play). All motion is disabled under `prefers-reduced-motion`.

## Releasing

```
node tools/release.js
```

This validates the content and bumps `VERSION` in `sw.js`. **If you skip this, phones that already have the site keep the old files forever** — the service worker only re-downloads when `sw.js` changes. Then deploy the whole folder.

### Netlify

Drag the folder onto app.netlify.com/drop, or connect the repository with no build command and publish directory `.` (the folder root). `_headers` is picked up automatically.

### Cloudflare Pages

Create a project, framework preset *None*, build command empty, output directory `/`. `_headers` is picked up automatically.

Both give HTTPS, which the service worker and the "install to home screen" prompt require.

## Play together (multiplayer)

Off until `relayUrl` is set in `js/config.js`. `MULTIPLAYER.md` has the two ways to switch it on. For local development, `node tools/relay.js` serves the site on port 8787 with multiplayer already wired to itself.

## Testing locally

Any static server works. For example `python3 -m http.server 8080` in this folder, then open `http://localhost:8080`. Service workers are allowed on `localhost` without HTTPS.

`node tools/test-engine.js` runs the recommendation engine checks.

## Browser support

Modern Android Chrome and iOS Safari. Uses `localStorage`, Web Audio, Service Worker, optional Screen Wake Lock and Speech Synthesis (both degrade silently when missing). No polyfills.

## Later ideas (deliberately not built yet)

- Hindi / Telugu / Marathi text layer: keep English keys, add a translations file; the UI already keeps all text in JS.
- "Suggest a game" link to a form, then curated into `games.js` by hand.
- More online games (drawing, trivia). The lobby and room protocol are generic; see MULTIPLAYER.md.
