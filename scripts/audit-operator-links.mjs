#!/usr/bin/env node
/**
 * Audit internal hrefs in operators / ladder / dashboard slice against Next.js app routes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "src", "app");

const SCAN_DIRS = [
  "src/lib/volunteers",
  "src/lib/volunteers/ops-work-items",
  "src/lib/volunteers/volunteer-lifecycle",
  "src/app/admin/(board)/my-work",
  "src/app/election-plan/(portal)/operators/my-work",
  "src/lib/coalition",
  "src/lib/events",
  "src/lib/voter-registration",
  "src/lib/comms",
  "src/components/volunteers",
  "src/components/election-plan/ElectionPlanOperatorsHubPanels.tsx",
  "src/components/election-plan/ElectionPlanOperatorsSubnav.tsx",
  "src/components/coalition",
  "src/components/events",
  "src/components/voter-registration",
  "src/components/comms",
  "src/components/admin/campaign-events/dashboard/CampaignManagerOpsDashboard.tsx",
  "src/components/admin/volunteers/VolunteerIntelligencePanel.tsx",
  "src/app/election-plan/(portal)/operators",
];

const HREF_RE =
  /href:\s*["'`](\/[^"'`#?]+(?:\?[^"'`]*)?)["'`]|href=\{?["'`](\/[^"'`#?]+(?:\?[^"'`]*)?)["'`]|href=\{\`(\/[^`#?]+(?:\?[^`]*)?)\`\}/g;

function extractHref(match) {
  return match[1] ?? match[2] ?? match[3];
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const stat = fs.statSync(dir);
  if (stat.isFile() && /\.(tsx?|jsx?)$/.test(dir)) {
    out.push(dir);
    return out;
  }
  if (!stat.isDirectory()) return out;
  for (const name of fs.readdirSync(dir)) {
    walk(path.join(dir, name), out);
  }
  return out;
}

function collectRoutes(dir, prefix = "") {
  const routes = new Set();
  if (!fs.existsSync(dir)) return routes;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name.startsWith("(") && name.endsWith(")")) {
        for (const r of collectRoutes(full, prefix)) routes.add(r);
      } else if (name.startsWith("[")) {
        const seg = name.replace(/^\[(.+)\]$/, ":$1");
        for (const r of collectRoutes(full, `${prefix}/${seg}`)) routes.add(r);
      } else {
        for (const r of collectRoutes(full, `${prefix}/${name}`)) routes.add(r);
      }
    } else if (name === "page.tsx" || name === "page.ts") {
      routes.add(prefix || "/");
    }
  }
  return routes;
}

function normalizePath(href) {
  const [pathname] = href.split("?");
  return pathname.replace(/\/$/, "") || "/";
}

function routeMatches(pathname, routes) {
  const p = normalizePath(pathname);
  if (routes.has(p)) return true;
  for (const route of routes) {
    const pattern = route
      .split("/")
      .map((seg) => (seg.startsWith(":") ? "[^/]+" : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      .join("/");
    const re = new RegExp(`^${pattern}$`);
    if (re.test(p)) return true;
  }
  return false;
}

const files = [];
for (const rel of SCAN_DIRS) {
  const abs = path.join(ROOT, rel);
  walk(abs, files);
}

const hrefs = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  HREF_RE.lastIndex = 0;
  while ((m = HREF_RE.exec(text)) !== null) {
    const href = extractHref(m);
    if (!href?.startsWith("/")) continue;
    const relFile = path.relative(ROOT, file);
    if (!hrefs.has(href)) hrefs.set(href, []);
    hrefs.get(href).push(relFile);
  }
}

const routes = collectRoutes(APP);

const missing = [];
const ok = [];

for (const [href, sources] of [...hrefs.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const pathname = normalizePath(href);
  if (routeMatches(pathname, routes)) {
    ok.push({ href, sources });
  } else {
    missing.push({ href, pathname, sources });
  }
}

console.log(`\n=== Operator / ladder link audit ===`);
console.log(`Routes indexed: ${routes.size}`);
console.log(`Unique hrefs scanned: ${hrefs.size}`);
console.log(`OK: ${ok.length} | MISSING: ${missing.length}\n`);

if (missing.length) {
  console.log("--- MISSING / NO ROUTE MATCH ---");
  for (const { href, pathname, sources } of missing) {
    console.log(`\n${href}`);
    console.log(`  path: ${pathname}`);
    console.log(`  sources: ${[...new Set(sources)].slice(0, 4).join(", ")}${sources.length > 4 ? "…" : ""}`);
  }
}

process.exit(missing.length ? 1 : 0);
