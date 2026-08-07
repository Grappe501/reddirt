/**
 * Local staff editor for Kelly Across Arkansas.
 * Serves standalone/arkansas-visits on 127.0.0.1 and writes edits into
 * src/data/kelly-county-visits/kelly-county-visits.ts.
 *
 * Usage: npm run visits:edit
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { updateStop, addStop, getStop } = require("./apply-kelly-visit-edits.cjs");

const root = path.resolve(__dirname, "..");
const staticRoot = path.join(root, "standalone", "arkansas-visits");
const HOST = "127.0.0.1";
const PORT = Number(process.env.VISITS_EDIT_PORT || 8877);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
};

function sendJson(res, status, body) {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(raw);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function loadPayload() {
  const file = path.join(staticRoot, "data", "public-visits.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function regenerateStandalone() {
  const r = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "run-with-h-drive-env.cjs"), "node", "./scripts/build-arkansas-visits-standalone.cjs"],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        TEMP: "H:\\SOSWebsite\\.local-ops\\tmp",
        TMP: "H:\\SOSWebsite\\.local-ops\\tmp",
      },
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (r.status !== 0) {
    const msg = (r.stderr || r.stdout || "standalone rebuild failed").trim();
    const err = new Error(msg);
    err.code = "REGEN_FAILED";
    throw err;
  }
  return (r.stdout || "").trim();
}

function safeJoin(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const full = path.normalize(path.join(staticRoot, rel));
  if (!full.startsWith(staticRoot)) return null;
  return full;
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, { ok: true, editor: true });
  }

  if (req.method === "GET" && url.pathname === "/api/stops") {
    try {
      const payload = loadPayload();
      return sendJson(res, 200, { ...payload, editor: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message || String(err) });
    }
  }

  const stopMatch = url.pathname.match(/^\/api\/stops\/([^/]+)$/);

  if (req.method === "GET" && stopMatch) {
    const id = decodeURIComponent(stopMatch[1]);
    const stop = getStop(id);
    if (!stop) return sendJson(res, 404, { error: `Stop not found: ${id}` });
    return sendJson(res, 200, { stop });
  }

  if (req.method === "PUT" && stopMatch) {
    const id = decodeURIComponent(stopMatch[1]);
    try {
      const body = await readBody(req);
      const stop = updateStop(id, body);
      const log = regenerateStandalone();
      const payload = loadPayload();
      return sendJson(res, 200, { ok: true, stop, payload, log });
    } catch (err) {
      const status = err.code === "NOT_FOUND" ? 404 : err.code === "REGEN_FAILED" ? 500 : 400;
      return sendJson(res, status, { error: err.message || String(err) });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/stops") {
    try {
      const body = await readBody(req);
      const stop = addStop(body);
      const log = regenerateStandalone();
      const payload = loadPayload();
      return sendJson(res, 201, { ok: true, stop, payload, log });
    } catch (err) {
      const status = err.code === "CONFLICT" ? 409 : err.code === "REGEN_FAILED" ? 500 : 400;
      return sendJson(res, status, { error: err.message || String(err) });
    }
  }

  return sendJson(res, 404, { error: "Unknown API route" });
}

function serveStatic(req, res, url) {
  let filePath = safeJoin(url.pathname);
  if (!filePath) {
    res.writeHead(400).end("Bad path");
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end("Method not allowed");
      return;
    }
    // Pretty stop detail routes: /stop/new and /stop/:id
    if (url.pathname === "/stop" || url.pathname === "/stop/" || /^\/stop\//.test(url.pathname)) {
      const stopPage = path.join(staticRoot, "stop.html");
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      fs.createReadStream(stopPage).pipe(res);
      return;
    }
    serveStatic(req, res, url);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) sendJson(res, 500, { error: err.message || String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Kelly Across Arkansas editor → http://${HOST}:${PORT}/`);
  console.log(`Stop detail pages → http://${HOST}:${PORT}/stop/<id>`);
  console.log(`Edit mode writes to src/data/kelly-county-visits/kelly-county-visits.ts`);
  console.log(`API: GET/PUT/POST /api/stops`);
});
