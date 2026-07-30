/**
 * Production confidence route ledger against a running server.
 * Usage: node scripts/production-confidence-routes.cjs [baseUrl]
 */
const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const base = process.argv[2] || "http://127.0.0.1:3457";
const outPath = path.join(__dirname, "..", "docs", "website", "ROUTE_VERIFICATION_LEDGER.md");

const ROUTES = [
  "/",
  "/about",
  "/about/journey",
  "/priorities",
  "/get-involved",
  "/campaign-photos",
  "/endorsements",
  "/kelly-speaks",
  "/contact",
  "/updates",
  "/donate",
  "/privacy",
  "/accessibility",
  "/voter-registration",
  "/from-the-road",
  "/events",
  "/campaign-calendar",
];

function fetchStatus(url, redirects = 0) {
  return new Promise((resolve) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { timeout: 90000 }, (res) => {
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
        if (body.length < 200000) body += c;
      });
      res.on("end", () => resolve({ status, body, finalUrl: url }));
    });
    req.on("error", (err) => resolve({ status: 0, body: "", error: err.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, body: "", error: "timeout" });
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
      if (u.origin === new URL(base).origin) hrefs.add(u.pathname + u.search);
    } catch {
      /* ignore */
    }
  }
  return [...hrefs];
}

(async () => {
  const rows = [];
  for (const route of ROUTES) {
    const r = await fetchStatus(new URL(route, base).toString());
    rows.push({ route, status: r.status, error: r.error || "", bytes: r.body.length });
    console.log(`${r.status || "ERR"} ${route}${r.error ? ` (${r.error})` : ""}`);
  }

  const home = await fetchStatus(new URL("/", base).toString());
  const checks = {
    governmentThatWorks: /Government That Works/i.test(home.body),
    meetKelly: /Meet Kelly/i.test(home.body),
    endorsements: /Endorsements/i.test(home.body) && /AFL-CIO|Education Association|Josh Irby|Progressive Arkansas Women/i.test(home.body),
    campaignPhotos: /Campaign Photos|Latest Campaign Photos/i.test(home.body),
    draftBadge: /ContentPendingBadge|Draft/i.test(home.body) && /Meet Kelly[\s\S]{0,200}Draft/i.test(home.body),
  };

  const sampleLinks = extractInternalHrefs(home.body, base).slice(0, 35);
  const linkRows = [];
  for (const p of sampleLinks) {
    const r = await fetchStatus(new URL(p, base).toString());
    linkRows.push({ path: p, status: r.status, error: r.error || "" });
    if (!r.status || r.status >= 400) console.log(`BROKEN ${r.status || "ERR"} ${p}`);
  }

  const okRoutes = rows.filter((r) => r.status === 200).length;
  const brokenLinks = linkRows.filter((r) => !r.status || r.status >= 400);

  const md = [
    "# Route verification ledger",
    "",
    "**Pass:** `KELLY-PUBLIC-PRODUCTION-CONFIDENCE-1.0`",
    `**Base URL:** \`${base}\``,
    `**When:** ${new Date().toISOString()}`,
    "",
    "## Primary public routes",
    "",
    "| Route | Status | Bytes | Notes |",
    "| --- | ---: | ---: | --- |",
    ...rows.map((r) => `| \`${r.route}\` | ${r.status || "ERR"} | ${r.bytes} | ${r.error || (r.status === 200 ? "OK" : "FAIL")} |`),
    "",
    `**Routes OK:** ${okRoutes}/${ROUTES.length}`,
    "",
    "## Homepage content smoke",
    "",
    `| Check | Result |`,
    `| --- | --- |`,
    `| Government That Works | ${checks.governmentThatWorks ? "✅" : "❌"} |`,
    `| Meet Kelly | ${checks.meetKelly ? "✅" : "❌"} |`,
    `| Endorsements (named) | ${checks.endorsements ? "✅" : "❌"} |`,
    `| Campaign photos band | ${checks.campaignPhotos ? "✅" : "❌"} |`,
    `| Accidental draft badge near Meet Kelly | ${checks.draftBadge ? "⚠️ present" : "✅ absent"} |`,
    "",
    "## Homepage outbound sample",
    "",
    `Checked ${linkRows.length} internal hrefs from \`/\`. Broken: **${brokenLinks.length}**.`,
    "",
    brokenLinks.length
      ? ["| Path | Status | Error |", "| --- | ---: | --- |", ...brokenLinks.map((b) => `| \`${b.path}\` | ${b.status || "ERR"} | ${b.error} |`)].join("\n")
      : "_No broken links in sample._",
    "",
  ].join("\n");

  fs.writeFileSync(outPath, md);
  console.log("---");
  console.log(`Wrote ${outPath}`);
  console.log(`routes_ok=${okRoutes}/${ROUTES.length} broken_links=${brokenLinks.length}`);
  if (okRoutes < ROUTES.length || brokenLinks.length) process.exitCode = 1;
})();
