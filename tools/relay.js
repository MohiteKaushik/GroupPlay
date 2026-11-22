#!/usr/bin/env node
/* PlayAnywhere relay: a tiny live-room server speaking the same REST + Server-Sent-Events protocol as the
 * Firebase Realtime Database (the subset js/net.js uses). Also serves the site itself, so a laptop on a
 * phone hotspot can run the whole thing with NO internet: everyone opens http://<laptop-ip>:8787/.
 *
 *   node tools/relay.js                 # serves ../ (the site) + rooms on port 8787
 *   node tools/relay.js --port 9000 --dir /path/to/site --persist rooms.json
 *
 * Node 18+, no dependencies. Rooms idle for 6 hours are deleted.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const PORT = parseInt(opt('port', process.env.PORT || '8787'), 10);
const DIR = path.resolve(opt('dir', path.join(__dirname, '..')));
const PERSIST = opt('persist', '');
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };

// --- data tree ---------------------------------------------------------------
let root = {};
const touched = new Map(); // room code → last write time
if (PERSIST && fs.existsSync(PERSIST)) { try { root = JSON.parse(fs.readFileSync(PERSIST, 'utf8')) || {}; } catch (e) { console.error('could not read', PERSIST); } }
let persistTimer = null;
const persist = () => { if (!PERSIST) return; clearTimeout(persistTimer); persistTimer = setTimeout(() => fs.writeFile(PERSIST, JSON.stringify(root), () => {}), 500); };

const segs = (p) => String(p || '').split('/').filter(Boolean);
function getAt(obj, ss) { let cur = obj; for (const s of ss) { if (cur == null || typeof cur !== 'object') return null; cur = cur[s]; } return cur === undefined ? null : cur; }
function setAt(ss, value) {
  if (!ss.length) { root = value == null ? {} : value; return; }
  let cur = root;
  for (let i = 0; i < ss.length - 1; i++) { if (cur[ss[i]] == null || typeof cur[ss[i]] !== 'object') cur[ss[i]] = {}; cur = cur[ss[i]]; }
  if (value == null) delete cur[ss[ss.length - 1]]; else cur[ss[ss.length - 1]] = value;
  // prune empty parents like Firebase does
  for (let i = ss.length - 1; i > 0; i--) { const parent = getAt(root, ss.slice(0, i)); if (parent && typeof parent === 'object' && !Object.keys(parent).length) setAt(ss.slice(0, i), null); else break; }
}
function resolveServerValues(v, now) {
  if (v && typeof v === 'object') {
    if (v['.sv'] === 'timestamp') return now;
    const out = Array.isArray(v) ? [] : {};
    for (const k of Object.keys(v)) { const r = resolveServerValues(v[k], now); if (r !== null && r !== undefined) out[k] = r; }
    return out;
  }
  return v === undefined ? null : v;
}

// --- subscribers ----------------------------------------------------------------
const subs = new Set(); // { prefix: string[], res }
function send(res, event, payload) { res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`); }
function broadcast(writePath, value) {
  for (const s of subs) {
    const p = s.prefix, w = writePath;
    const isPrefix = (a, b) => a.length <= b.length && a.every((x, i) => x === b[i]);
    if (isPrefix(p, w)) send(s.res, 'put', { path: '/' + w.slice(p.length).join('/'), data: value });
    else if (isPrefix(w, p)) send(s.res, 'put', { path: '/', data: getAt(root, p) });
  }
}
function broadcastPatch(basePath, map) {
  for (const s of subs) {
    const p = s.prefix;
    const isPrefix = (a, b) => a.length <= b.length && a.every((x, i) => x === b[i]);
    if (isPrefix(p, basePath)) send(s.res, 'patch', { path: '/' + basePath.slice(p.length).join('/'), data: map });
    else if (isPrefix(basePath, p)) send(s.res, 'put', { path: '/', data: getAt(root, p) });
  }
}
setInterval(() => { for (const s of subs) s.res.write('event: keep-alive\ndata: null\n\n'); }, 30000).unref();
setInterval(() => { // expire idle rooms
  const now = Date.now();
  for (const [code, t] of touched) if (now - t > ROOM_TTL_MS) { touched.delete(code); setAt(['rooms', code], null); broadcast(['rooms', code], null); persist(); }
}, 10 * 60 * 1000).unref();

// --- http --------------------------------------------------------------------
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (url.pathname.endsWith('.json')) return handleData(req, res, url);
  return serveStatic(req, res, url);
});

function handleData(req, res, url) {
  const ss = segs(decodeURIComponent(url.pathname.slice(0, -5)));
  if (ss[0] !== 'rooms' || (ss.length > 1 && !/^[A-Z0-9]{4,8}$/.test(ss[1]))) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end('{"error":"only /rooms/<CODE>/... is served"}'); }
  if (req.method === 'GET') {
    if ((req.headers.accept || '').includes('text/event-stream')) {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      const sub = { prefix: ss, res };
      subs.add(sub);
      send(res, 'put', { path: '/', data: getAt(root, ss) });
      req.on('close', () => subs.delete(sub));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(getAt(root, ss)));
  }
  let body = '';
  req.on('data', c => { body += c; if (body.length > 256 * 1024) { res.writeHead(413); res.end(); req.destroy(); } });
  req.on('end', () => {
    let val = null;
    if (req.method !== 'DELETE') { try { val = body ? JSON.parse(body) : null; } catch (e) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end('{"error":"invalid JSON"}'); } }
    const now = Date.now();
    if (ss[1]) touched.set(ss[1], now);
    if (req.method === 'PUT' || req.method === 'DELETE') {
      const v = resolveServerValues(val, now);
      setAt(ss, v); broadcast(ss, v);
    } else if (req.method === 'PATCH') {
      if (!val || typeof val !== 'object') { res.writeHead(400); return res.end(); }
      // Multi-path update: apply everything, then tell each subscriber in ONE event so nobody sees a half-applied state.
      const resolved = {};
      for (const k of Object.keys(val)) { const p = ss.concat(segs(k)); const v = resolveServerValues(val[k], now); setAt(p, v); resolved[segs(k).join('/')] = v; }
      broadcastPatch(ss, resolved);
    } else if (req.method === 'POST') {
      const key = '-' + now.toString(36) + Math.random().toString(36).slice(2, 8);
      const v = resolveServerValues(val, now);
      setAt(ss.concat(key), v); broadcast(ss.concat(key), v);
      res.writeHead(200, { 'Content-Type': 'application/json' }); persist(); return res.end(JSON.stringify({ name: key }));
    } else { res.writeHead(405); return res.end(); }
    persist();
    if (url.searchParams.get('print') === 'silent') { res.writeHead(204); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getAt(root, ss)));
  });
}

function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  if (p === '/js/config.js') { // when the relay serves the site, the site talks to the relay: no config editing needed
    res.writeHead(200, { 'Content-Type': MIME['.js'], 'Cache-Control': 'no-cache' });
    return res.end("window.GP_CONFIG = { relayUrl: location.origin, joinBase: '' };\n");
  }
  const file = path.normalize(path.join(DIR, p));
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('not found'); }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' || file.endsWith('sw.js') ? 'no-cache' : 'public, max-age=3600', 'Content-Length': st.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`PlayAnywhere relay on port ${PORT}, serving ${DIR}`);
  const ips = Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log('Open on phones (same Wi-Fi / hotspot):');
  (ips.length ? ips : ['127.0.0.1']).forEach(ip => console.log(`  http://${ip}:${PORT}/`));
  console.log(`In js/config.js set relayUrl to that same address (without the trailing slash) when serving from here.`);
});
