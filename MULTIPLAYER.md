# Playing together online

"Play together" lets one phone host a room and everyone else join by a 6-character code or a QR code. Games then run on every phone at once: secret roles land on the right phone, votes and buzzes count instantly.

The site itself stays static (Netlify / Cloudflare Pages). Live rooms need one small extra piece: a place that keeps a connection open to every phone and pushes changes. PlayAnywhere talks to it with plain HTTP (`fetch` + the browser's built-in `EventSource`), so there is no SDK to download and the whole client is about 5 KB. Two options speak the same protocol:

| | Firebase Realtime Database | `tools/relay.js` |
|---|---|---|
| Cost | Free (Spark plan: 100 simultaneous connections, 10 GB/month) | Free |
| Setup | 5 minutes, once | `node tools/relay.js` |
| Internet needed | Yes (server in Singapore, ~60–100 ms from India) | **No** — run it on a laptop connected to a phone hotspot |
| Reliability | Google-run, always on | As reliable as the laptop |
| Use it for | The public site | Village nights with no signal, local testing |

## Option A — Firebase (for the hosted site)

1. Go to https://console.firebase.google.com and create a project (any name, Analytics off).
2. In the left menu: **Build → Realtime Database → Create database**. Pick the **Singapore (asia-southeast1)** location. Start in **locked mode**.
3. Open the **Rules** tab, replace everything with the rules below, and **Publish**:

```json
{
  "rules": {
    "rooms": {
      "$code": {
        ".read": "$code.matches(/^([A-Z2-9]{6}|PING00)$/)",
        ".write": "$code.matches(/^[A-Z2-9]{6}$/)",
        "players": {
          "$pid": {
            "name": { ".validate": "newData.isString() && newData.val().length <= 24" }
          }
        }
      }
    }
  }
}
```

   (Firebase's rule language only allows `^` at the very start of a pattern and `$` at the very end, so alternatives must sit inside one group as above. If the editor rejects `{6}`, spell the six characters out: `/^([A-Z2-9][A-Z2-9][A-Z2-9][A-Z2-9][A-Z2-9][A-Z2-9]|PING00)$/`.)

   Only `rooms/<6-character code>` can be read or written; nothing else in the database is reachable. Codes are random, so a room is only reachable by someone who has the code. (A room's data is readable by anyone with the code — fine for family games, but it means a determined player could peek at `priv/` in the browser's network tab. Don't bet money on it.)

4. On the **Data** tab, copy the database URL shown at the top. It looks like `https://groupplay-12345-default-rtdb.asia-southeast1.firebasedatabase.app`.
5. Open `js/config.js` and paste it:

```js
window.GP_CONFIG = {
  relayUrl: 'https://groupplay-12345-default-rtdb.asia-southeast1.firebasedatabase.app',
  joinBase: ''
};
```

6. Release (`node tools/release.js`) and deploy. Open the site → **Play together** → it should say "Server reachable (xx ms)".

Rooms are tiny (a few KB) and are not deleted automatically on Firebase. Once in a while, open the Data tab and delete `rooms` — or leave it; the free quota is 1 GB.

## Option B — the relay on a laptop (no internet)

```
node tools/relay.js
```

It prints something like `http://192.168.43.17:8787/`. Everyone connects to the same Wi-Fi or hotspot and opens that address. The relay serves the site **and** the rooms, and it writes its own `js/config.js` pointing at itself, so nothing needs editing. Rooms idle for 6 hours are deleted; add `--persist rooms.json` to survive a restart.

You can also host the relay on a free Node host (Render, Fly.io, Railway) and put its URL in `js/config.js` instead of Firebase. Free hosts sleep when idle and take 20–60 s to wake up, which is why Firebase is the better default for the public site.

## How it works (so you can add games)

Everything about a room is one small JSON tree that every phone streams:

```
rooms/<CODE>
  meta    { host, game, created }          written by the host only
  players { <pid>: { name, joined, seen } } each phone writes its own entry (seen = heartbeat every 25 s)
  state   { ...public game state }          host only
  priv    { <pid>: { ...secret per player } } host only; each phone reads its own
  acts    { <pid>: { ...that player's inputs } } each phone writes its own
```

No two phones ever write the same field, so nothing can conflict, and the host's phone is the only thing that runs game logic. If the host's phone reloads, it reconnects, sees `meta.host` is itself, and carries on. If a player reloads they land back in the same seat (the player id is kept in the browser).

A game in `js/online.js` is an object with `start(data, cfg)` (returns the patch that begins a round), `hostTick(data)` (returns a patch when the state should advance, e.g. everyone has voted, or `null`), `view(data)` (HTML for the current phone) and `actions(data)` (button handlers). Look at `GAMES.vote` for the smallest example.

Bandwidth: a ten-player session uses roughly 2–4 KB per player per minute. The initial page load is the same ~95 KB as always and is cached offline; only room traffic needs the network.
