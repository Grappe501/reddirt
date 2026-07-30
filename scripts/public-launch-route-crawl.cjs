/**
 * Public launch route crawl + broken-link sample (local HTTP).
 * Usage: node scripts/public-launch-route-crawl.cjs [baseUrl]
 */
const http = require("node:http");
const https = require("node:https");
const { URL } = require("node:url");

const base = process.argv[2] || "http://127.0.0.1:3456";

const ROUTES = [
  "/",
  "/about",
  "/about/journey",
  "/priorities",
  "/get-involved",
  "/campaign-photos",
  "/endorsements",
  "/kelly-speaks",
  "/updates",
  "/donate",
  "/privacy",
  "/accessibility",
  "/contact",
  "/voter-registration",
  "/from-the-road",
  "/events",
];

function fetchStatus(url, redirects = 0) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { timeout: 60000 }, (res) => {
      const status = res.statusCode || 0;
      if ([301, 302, 307, 308].includes(status) && res.headers.location && redirects < 5) {
        const next = new URL(res.headers.location, url).toString();
        res.resume();
        fetchStatus(next, redirects + 1).then(resolve);
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => {
        if (body.length < 250000) body += c;
      });
      res.on("end", () => resolve({ status, body, finalUrl: url }));
    });
    req.on("error", (err) => resolve({ status: 0, body: "", error: err.message, finalUrl: url }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, body: "", error: "timeout", finalUrl: url });
    });
  });
}

function extractInternalHrefs(html, pageUrl) {
  const hrefs = new Set();
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1];
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) {
      continue;
    }
    try {
      const u = new URL(raw, pageUrl);
      if (u.origin === new URL(base).origin) {
        hrefs.add(u.pathname + u.search);
      }
    } catch {
      /* ignore */
    }
  }
  return [...hrefs];
}

async function main() {
  const routeResults = [];
  for (const route of ROUTES) {
    const url = new URL(route, base).toString();
    const r = await fetchStatus(url);
    routeResults.push({ route, status: r.status, error: r.error || null, bytes: r.body.length });
    console.log(`${r.status || "ERR"} ${route}${r.error ? ` (${r.error})` : ""}`);
  }

  const home = await fetchStatus(new URL("/", base).toString());
  const sampleLinks = extractInternalHrefs(home.body, base).slice(0, 40);
  const linkResults = [];
  for (const path of sampleLinks) {
    const r = await fetchStatus(new URL(path, base).toString());
    linkResults.push({ path, status: r.status, error: r.error || null });
    if (!r.status || r.status >= 400) {
      console.log(`BROKEN ${r.status || "ERR"} ${path}${r.error ? ` (${r.error})` : ""}`);
    }
  }

  const routeFails = routeResults.filter((r) => !r.status || r.status >= 400);
  const linkFails = linkResults.filter((r) => !r.status || r.status >= 400);
  console.log("---");
  console.log(`routes_ok=${ROUTES.length - routeFails.length}/${ROUTES.length}`);
  console.log(`home_links_checked=${linkResults.length} broken=${linkFails.length}`);
  if (routeFails.length || linkFails.length) process.exitCode = 1;
}

main();
