/**
 * Hardening: every Campaign OS nav href must resolve to an admin page route.
 */
import { buildCampaignOsNavGroups } from "../src/lib/dashboard-orchestration/campaign-os-nav-config";
import { existsSync } from "node:fs";
import path from "node:path";

const ADMIN = path.join(process.cwd(), "src", "app", "admin");

function pageCandidates(segments: string[]): string[] {
  const out: string[] = [];
  const bases = [
    path.join(ADMIN, "(board)", ...segments, "page.tsx"),
    path.join(ADMIN, ...segments, "page.tsx"),
  ];
  out.push(...bases);
  if (segments.length > 0) {
    const last = segments[segments.length - 1]!;
    const parentBoard = path.join(ADMIN, "(board)", ...segments.slice(0, -1));
    const parentRoot = path.join(ADMIN, ...segments.slice(0, -1));
    out.push(path.join(parentBoard, `[${last}]`, "page.tsx"));
    out.push(path.join(parentBoard, `[${last}Id]`, "page.tsx"));
    out.push(path.join(parentRoot, `[${last}]`, "page.tsx"));
    out.push(path.join(parentRoot, `[${last}Id]`, "page.tsx"));
  }
  return out;
}

function resolveAdminRoute(href: string): boolean {
  const pathname = href.split("?")[0] ?? href;
  if (!pathname.startsWith("/admin")) return false;
  const rel = pathname.replace(/^\/admin\/?/, "").trim();
  const segments = rel ? rel.split("/").filter(Boolean) : [];
  return pageCandidates(segments).some((p) => existsSync(p));
}

function main() {
  const groups = buildCampaignOsNavGroups("2026-03");
  const missing: string[] = [];
  for (const g of groups) {
    for (const link of g.links) {
      if (!resolveAdminRoute(link.href)) missing.push(`${g.id}: ${link.href}`);
    }
  }
  const total = groups.reduce((n, g) => n + g.links.length, 0);
  console.log("Campaign OS nav route verification");
  console.log("  groups:", groups.length);
  console.log("  links:", total);
  if (missing.length) {
    console.error("MISSING routes:");
    for (const m of missing) console.error("  -", m);
    process.exit(1);
  }
  console.log("OK — all nav hrefs resolve to page.tsx");
}

main();
