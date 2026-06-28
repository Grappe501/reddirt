#!/usr/bin/env node
/**
 * Audit global hrefs in leader-roster.json connections against App Router pages.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "src", "app");
const roster = JSON.parse(fs.readFileSync(path.join(ROOT, "data/volunteers/leader-roster.json"), "utf8"));

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
  const noHash = pathname.split("#")[0];
  return noHash.replace(/\/$/, "") || "/";
}

function routeMatches(pathname, routes) {
  const p = normalizePath(pathname);
  if (routes.has(p)) return true;
  for (const route of routes) {
    const pattern = route
      .split("/")
      .map((seg) => (seg.startsWith(":") ? "[^/]+" : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      .join("/");
    if (new RegExp(`^${pattern}$`).test(p)) return true;
  }
  return false;
}

const routes = collectRoutes(APP);
const hrefs = new Map();

for (const leader of roster.leaders ?? []) {
  for (const conn of leader.connections ?? []) {
    if (conn.kind !== "global" || !conn.href?.startsWith("/")) continue;
    const list = hrefs.get(conn.href) ?? [];
    list.push(`${leader.slug} → ${conn.label ?? conn.href}`);
    hrefs.set(conn.href, list);
  }
}

const missing = [];
for (const [href, sources] of [...hrefs.entries()].sort()) {
  if (!routeMatches(href, routes)) missing.push({ href, sources });
}

console.log("\n=== Leader roster global href audit ===");
console.log(`Unique global hrefs: ${hrefs.size}`);
console.log(`Missing routes: ${missing.length}\n`);

if (missing.length) {
  for (const { href, sources } of missing) {
    console.log(href);
    for (const s of sources.slice(0, 3)) console.log(`  ${s}`);
    if (sources.length > 3) console.log(`  … +${sources.length - 3} more`);
  }
  process.exit(1);
}

console.log("All leader-roster global hrefs resolve to portal routes.");
