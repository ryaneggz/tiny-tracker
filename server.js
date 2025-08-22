// server.js
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const cors = require("cors");

// --- DB bootstrap ---
const db = new Database(path.join(__dirname, "events.db"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    ip TEXT,
    ua TEXT,
    url TEXT,
    ref TEXT,
    uid TEXT,
    kind TEXT DEFAULT 'pixel'  -- 'pixel' or 'beacon'
  );
`);

// 1×1 transparent GIF bytes
const GIF_1PX = Buffer.from([
  0x47,0x49,0x46,0x38,0x39,0x61,0x01,0x00,0x01,0x00,0x80,0x00,0x00,0x00,0x00,0x00,0xff,0xff,0xff,0x21,0xf9,0x04,0x01,0x00,0x00,0x00,0x00,
  0x2c,0x00,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0x02,0x02,0x44,0x01,0x00
]);

const app = express();

// Enable CORS for all routes with credentials support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // For local development, allow localhost on any port
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }
    
    // Allow file:// protocol for local HTML files
    if (origin === 'null') {
      return callback(null, true);
    }
    
    // Add your production domain here when deployed
    // if (origin === 'https://yourdomain.com') {
    //   return callback(null, true);
    // }
    
    return callback(null, true); // Allow all origins for now - restrict as needed
  },
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));

// Serve static files from website directory
app.use(express.static(path.join(__dirname, "website")));

// Utility: best-effort client IP
function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return req.socket?.remoteAddress || "?";
}

// Enhanced table structure for click tracking
try {
  db.exec(`
    ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT 'page_view';
    ALTER TABLE events ADD COLUMN event_name TEXT;
    ALTER TABLE events ADD COLUMN element_tag TEXT;
    ALTER TABLE events ADD COLUMN element_text TEXT;
    ALTER TABLE events ADD COLUMN link_url TEXT;
    ALTER TABLE events ADD COLUMN button_type TEXT;
    ALTER TABLE events ADD COLUMN form_id TEXT;
    ALTER TABLE events ADD COLUMN duration INTEGER;
    ALTER TABLE events ADD COLUMN client_timestamp INTEGER;
  `);
} catch (err) {
  // Ignore errors if columns already exist
}

const insertEvent = db.prepare(`
  INSERT INTO events (ts, ip, ua, url, ref, uid, kind, event_type, event_name, element_tag, element_text, link_url, button_type, form_id, duration, client_timestamp)
  VALUES (@ts, @ip, @ua, @url, @ref, @uid, @kind, @event_type, @event_name, @element_tag, @element_text, @link_url, @button_type, @form_id, @duration, @client_timestamp)
`);

// --- 1) Pixel endpoint (GET) ---
app.get("/pixel.gif", (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  insertEvent.run({
    ts: now,
    ip: clientIp(req),
    ua: req.headers["user-agent"] || "",
    url: String(req.query.u || ""),
    ref: String(req.query.r || ""),
    uid: String(req.query.uid || ""),
    kind: "pixel",
    event_type: String(req.query.event_type || 'page_view'),
    event_name: null,
    element_tag: null,
    element_text: null,
    link_url: null,
    button_type: null,
    form_id: null,
    duration: null,
    client_timestamp: null,
  });
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  res.setHeader("Content-Type", "image/gif");
  res.end(GIF_1PX);
});

// --- 2) Enhanced Beacon endpoint (POST JSON) ---
app.post("/event", (req, res) => {
  const now = Math.floor(Date.now() / 1000);
  const { 
    url = "", 
    ref = "", 
    uid = "",
    event_type = "page_view",
    event_name = null,
    element_tag = null,
    element_text = null,
    link_url = null,
    button_type = null,
    form_id = null,
    duration = null,
    timestamp = null
  } = req.body || {};
  
  insertEvent.run({
    ts: now,
    ip: clientIp(req),
    ua: req.headers["user-agent"] || "",
    url: String(url),
    ref: String(ref),
    uid: String(uid),
    kind: "beacon",
    event_type: String(event_type),
    event_name: event_name ? String(event_name) : null,
    element_tag: element_tag ? String(element_tag) : null,
    element_text: element_text ? String(element_text).substring(0, 200) : null,
    link_url: link_url ? String(link_url) : null,
    button_type: button_type ? String(button_type) : null,
    form_id: form_id ? String(form_id) : null,
    duration: duration ? parseInt(duration) : null,
    client_timestamp: timestamp ? parseInt(timestamp) : null
  });
  res.setHeader("Cache-Control", "no-store");
  res.status(204).end();
});

// --- 3) Super-basic stats dashboard ---
app.get("/stats", (req, res) => {
  const hours = Math.max(1, Math.min(24 * 30, parseInt(req.query.hours || "24", 10)));
  const since = Math.floor(Date.now() / 1000) - hours * 3600;

  const total = db.prepare("SELECT COUNT(*) AS c FROM events WHERE ts >= ?").get(since).c;

  const byUrl = db
    .prepare("SELECT url, COUNT(*) AS c FROM events WHERE ts >= ? GROUP BY url ORDER BY c DESC LIMIT 100")
    .all(since);

  const clickEvents = db
    .prepare("SELECT event_name, COUNT(*) AS c FROM events WHERE ts >= ? AND event_type = 'click' AND event_name IS NOT NULL GROUP BY event_name ORDER BY c DESC LIMIT 50")
    .all(since);

  const eventTypes = db
    .prepare("SELECT event_type, COUNT(*) AS c FROM events WHERE ts >= ? GROUP BY event_type ORDER BY c DESC")
    .all(since);

  const uniques = db
    .prepare("SELECT COUNT(DISTINCT COALESCE(NULLIF(uid,''), ip)) AS u FROM events WHERE ts >= ?")
    .get(since).u;

  const byHour = db
    .prepare(`
      SELECT strftime('%Y-%m-%d %H:00:00', datetime(ts, 'unixepoch')) AS bucket,
             COUNT(*) AS c
      FROM events
      WHERE ts >= ?
      GROUP BY bucket
      ORDER BY bucket ASC
    `)
    .all(since);

  // minimal HTML (no external deps)
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const urlRows = byUrl.map(r => `<tr><td>${esc(r.url)}</td><td style="text-align:right">${r.c}</td></tr>`).join("");
  const clickRows = clickEvents.map(r => `<tr><td>${esc(r.event_name)}</td><td style="text-align:right">${r.c}</td></tr>`).join("");
  const eventTypeRows = eventTypes.map(r => `<tr><td>${esc(r.event_type)}</td><td style="text-align:right">${r.c}</td></tr>`).join("");

  const series = JSON.stringify(byHour);

  res.type("html").send(`
<!doctype html>
<meta charset="utf-8">
<title>Tiny Tracker — last ${hours}h</title>
<style>
  body{font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin:24px; line-height:1.4}
  table{border-collapse:collapse; width:100%; max-width:900px}
  th,td{border:1px solid #ddd; padding:8px}
  th{background:#f5f5f5; text-align:left}
  .kpis{display:flex; gap:24px; margin-bottom:12px}
  .kpis div{background:#f8f8f8; padding:10px 14px; border:1px solid #eee; border-radius:6px}
  #chart{width:900px; max-width:100%; height:240px; border:1px solid #eee; margin:16px 0; position:relative}
</style>
<h1>Tiny Tracker</h1>
<div class="kpis">
  <div>Total events: <b>${total}</b></div>
  <div>Unique visitors: <b>${uniques}</b></div>
  <div>Window: <b>${hours}h</b> (<a href="?hours=1">1h</a> · <a href="?hours=24">24h</a> · <a href="?hours=168">7d</a>)</div>
</div>

<h2>Events per hour</h2>
<canvas id="chart"></canvas>

<h2>Event Types</h2>
<table>
  <tr><th>Event Type</th><th style="text-align:right">Count</th></tr>
  ${eventTypeRows || "<tr><td colspan='2' style='text-align:center;color:#999'>No data yet</td></tr>"}
</table>

<h2>Top Click Events</h2>
<table>
  <tr><th>Event Name</th><th style="text-align:right">Clicks</th></tr>
  ${clickRows || "<tr><td colspan='2' style='text-align:center;color:#999'>No click events yet</td></tr>"}
</table>

<h2>Top URLs</h2>
<table>
  <tr><th>URL</th><th style="text-align:right">Views</th></tr>
  ${urlRows || "<tr><td colspan='2' style='text-align:center;color:#999'>No data yet</td></tr>"}
</table>

<script>
  // tiny vanilla chart
  (function(){
    var data = ${series}; // [{bucket:"YYYY-mm-dd HH:00:00", c:n}, ...]
    var cvs = document.getElementById('chart');
    var dpr = window.devicePixelRatio || 1;
    cvs.width = cvs.clientWidth * dpr;
    cvs.height = cvs.clientHeight * dpr;
    var ctx = cvs.getContext('2d');
    ctx.scale(dpr, dpr);

    var w = cvs.clientWidth, h = cvs.clientHeight, pad = 24;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#ddd';
    // axes
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    var max = 0;
    for (var i=0;i<data.length;i++) if (data[i].c > max) max = data[i].c;
    max = Math.max(1, max);

    var n = data.length || 1;
    var xstep = (w - pad*2) / Math.max(1, n-1);

    // grid + labels (sparse)
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    for (var y=0; y<=4; y++) {
      var v = Math.round(max * (y/4));
      var yy = h - pad - (h - pad*2) * (y/4);
      ctx.strokeStyle = '#eee';
      ctx.beginPath(); ctx.moveTo(pad, yy); ctx.lineTo(w - pad, yy); ctx.stroke();
      ctx.fillText(String(v), 4, yy - 2);
    }

    // line
    ctx.strokeStyle = '#444';
    ctx.beginPath();
    for (var i=0;i<n;i++){
      var x = pad + xstep * i;
      var y = h - pad - ((h - pad*2) * (data[i]?.c || 0) / max);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  })();
</script>
  `);
});

// --- start server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`tiny-tracker listening on http://localhost:${PORT}`);
});
