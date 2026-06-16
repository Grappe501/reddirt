/**
 * Election Plan portal route audit — static hrefs from catalog + registry.
 * Run: npm run election-plan:audit:routes
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { buildAdminElectionPlanCatalogFromSnapshot } from "../../src/lib/election-plan/admin-election-plan-catalog-build";
import { loadElectionPlanSnapshotFromDisk } from "../../src/lib/election-plan/election-plan-snapshot-disk";
import { EXECUTIVE_BOOK_CHAPTERS } from "../../src/lib/election-plan/executiveBookChapters";
import { getVolunteerAcademy } from "../../src/lib/election-plan/load-volunteer-academy";
import { KELLY_SOS_PLATFORM } from "../../src/lib/election-plan/kelly-sos-platform";

const ROOT = process.cwd();
const PORTAL_ROOT = path.join(ROOT, "src/app/election-plan/(portal)");

function collectPortalStaticRoutes(dir: string, prefix = "/election-plan"): string[] {
  const routes: string[] = [];
  if (!existsSync(dir)) return routes;

  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (name.startsWith("(") && name.endsWith(")")) {
        routes.push(...collectPortalStaticRoutes(full, prefix));
        continue;
      }
      if (name.startsWith("[") && name.endsWith("]")) {
        routes.push(...collectPortalStaticRoutes(full, `${prefix}/${name}`));
        continue;
      }
      routes.push(...collectPortalStaticRoutes(full, `${prefix}/${name}`));
      continue;
    }
    if (name === "page.tsx") {
      routes.push(prefix.replace(/\/$/, "") || prefix);
    }
  }
  return routes;
}

function normalizeHref(href: string): string {
  const base = href.split("#")[0]?.split("?")[0] ?? href;
  return base.replace(/\/$/, "") || "/";
}

function isDynamicRoutePattern(route: string): boolean {
  return route.includes("[");
}

function routeExists(staticRoutes: Set<string>, href: string): boolean {
  const base = normalizeHref(href);
  if (staticRoutes.has(base)) return true;
  // Dynamic segment match: /election-plan/counties/faulkner → /election-plan/counties/[countySlug]
  const parts = base.split("/").filter(Boolean);
  for (const staticRoute of staticRoutes) {
    const staticParts = staticRoute.split("/").filter(Boolean);
    if (staticParts.length !== parts.length) continue;
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      const sp = staticParts[i]!;
      const pp = parts[i]!;
      if (sp.startsWith("[") && sp.endsWith("]")) continue;
      if (sp !== pp) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function collectCatalogHrefs(): string[] {
  const catalog = buildAdminElectionPlanCatalogFromSnapshot(loadElectionPlanSnapshotFromDisk());
  const hrefs: string[] = [];
  const walk = (link: { href: string; related?: { href: string }[] }) => {
    hrefs.push(link.href);
    for (const rel of link.related ?? []) hrefs.push(rel.href);
  };
  for (const link of catalog.smokeTestLinks) walk(link);
  for (const section of catalog.sections) {
    for (const link of section.links) walk(link);
  }
  for (const ch of EXECUTIVE_BOOK_CHAPTERS) hrefs.push(ch.href);
  for (const p of KELLY_SOS_PLATFORM.planks) hrefs.push(`/election-plan/platform/${p.slug}`);
  for (const pos of getVolunteerAcademy().positions) {
    hrefs.push(`/election-plan/academy/${pos.slug}`);
    hrefs.push(`/election-plan/academy/training/${pos.slug}`);
  }
  return [...new Set(hrefs)].filter((h) => h.startsWith("/election-plan"));
}

function main() {
  const staticRoutes = new Set(
    collectPortalStaticRoutes(PORTAL_ROOT).map(normalizeHref),
  );
  const hrefs = collectCatalogHrefs();
  const missing: string[] = [];
  const ok: string[] = [];

  for (const href of hrefs) {
    const base = normalizeHref(href);
    if (base.includes("[") || base.includes("undefined")) continue;
    if (routeExists(staticRoutes, base)) {
      ok.push(href);
    } else {
      missing.push(href);
    }
  }

  console.log("Election Plan portal route audit\n");
  console.log(`Static app routes: ${staticRoutes.size}`);
  console.log(`Catalog hrefs checked: ${hrefs.length}`);
  console.log(`Resolved: ${ok.length}`);
  console.log(`Missing page.tsx: ${missing.length}\n`);

  if (missing.length) {
    console.log("MISSING (no matching page.tsx under (portal)):");
    for (const m of missing.sort()) console.log(`  ${m}`);
    process.exitCode = 1;
  } else {
    console.log("All catalog hrefs resolve to portal routes.");
  }
}

main();
