/**
 * Audit resolveLeaderWorkPages hrefs for every roster leader against App Router pages.
 * Run: npm run kelly:ops:audit (included) or tsx scripts/audit-leader-work-pages.ts
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import leaderRoster from "../data/volunteers/leader-roster.json";
import { resolveLeaderWorkPages } from "../src/lib/volunteers/resolve-leader-work-pages";
import type { VolunteerLeader } from "../src/lib/volunteers/types";

const ROOT = process.cwd();
const APP = path.join(ROOT, "src", "app");

function collectRoutes(dir: string, prefix = ""): Set<string> {
  const routes = new Set<string>();
  if (!existsSync(dir)) return routes;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
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

function normalizePath(href: string): string {
  const [pathname] = href.split("?");
  const noHash = pathname.split("#")[0];
  return noHash.replace(/\/$/, "") || "/";
}

function routeMatches(pathname: string, routes: Set<string>): boolean {
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

function main() {
  const routes = collectRoutes(APP);
  const leaders = (leaderRoster.leaders ?? []) as VolunteerLeader[];
  const hrefSources = new Map<string, string[]>();
  let pageCount = 0;

  for (const leader of leaders) {
    const payload = resolveLeaderWorkPages(leader, { isSelf: false });
    pageCount += payload.pages.length;
    for (const page of payload.pages) {
      const base = normalizePath(page.href);
      if (base.startsWith("#")) continue;
      const list = hrefSources.get(base) ?? [];
      list.push(`${leader.slug} → ${page.id}`);
      hrefSources.set(base, list);
    }
    // commandUp/down
    for (const cmd of [payload.commandUp, payload.commandDown]) {
      if (!cmd?.href || cmd.href.startsWith("#")) continue;
      const base = normalizePath(cmd.href);
      const list = hrefSources.get(base) ?? [];
      list.push(`${leader.slug} → command`);
      hrefSources.set(base, list);
    }
  }

  const missing: Array<{ href: string; sources: string[] }> = [];
  for (const [href, sources] of [...hrefSources.entries()].sort()) {
    if (!routeMatches(href, routes)) missing.push({ href, sources });
  }

  console.log("\n=== Leader work pages href audit ===");
  console.log(`Leaders scanned: ${leaders.length}`);
  console.log(`Total work page rows: ${pageCount}`);
  console.log(`Unique hrefs: ${hrefSources.size}`);
  console.log(`Missing routes: ${missing.length}\n`);

  if (missing.length) {
    for (const { href, sources } of missing) {
      console.log(href);
      for (const s of sources.slice(0, 3)) console.log(`  ${s}`);
      if (sources.length > 3) console.log(`  … +${sources.length - 3} more`);
    }
    process.exit(1);
  }

  console.log("All leader work page hrefs resolve to App Router routes.\n");
}

main();
