/**
 * Phase 0 — Pakko command center route and contrast gate checks.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadMichaelPackoQuotes } from "../src/lib/intelligence/opponents/loadMichaelPackoQuotes";
import { loadMichaelPackoScaffold } from "../src/lib/intelligence/opponents/loadMichaelPackoScaffold";
import {
  getPackoCommandCenterLinkAuditRoutes,
  PACKO_COMMAND_CENTER_ROUTES,
} from "../src/lib/intelligence/opponents/packoCommandCenterRoutes";
import { getPackoContrastGateStatus } from "../src/lib/intelligence/v4/packoContrastGate";
import { PHASE_A_COMMAND_NAV_ITEMS } from "../src/lib/intelligence/phaseACommandNav";

const APP_ROOT = path.join(process.cwd(), "src/app/admin/(board)/intelligence");

function assertRouteExists(routePath: string) {
  const rel = routePath.replace(/^\/admin\/intelligence\/?/, "");
  if (!rel) {
    assert.ok(fs.existsSync(path.join(APP_ROOT, "page.tsx")), "Missing hub page");
    return;
  }
  const segments = rel.split("/").filter(Boolean);
  let dir = APP_ROOT;
  for (const seg of segments) {
    const dynamic = fs.readdirSync(dir, { withFileTypes: true }).find((d) => d.isDirectory() && d.name.startsWith("["));
    if (dynamic) {
      dir = path.join(dir, dynamic.name);
      continue;
    }
    dir = path.join(dir, seg);
  }
  const page = path.join(dir, "page.tsx");
  assert.ok(fs.existsSync(page), `Missing page for route ${routePath}: ${page}`);
}

for (const route of getPackoCommandCenterLinkAuditRoutes()) {
  assertRouteExists(route);
}

const phaseANav = PHASE_A_COMMAND_NAV_ITEMS.find((i) => i.href === PACKO_COMMAND_CENTER_ROUTES.hub);
assert.ok(phaseANav, "Pakko command center must be in Phase A sidebar nav");

const quotes = loadMichaelPackoQuotes();
assert.ok(quotes.quotes.length >= 4, "Pakko quote ledger must have >=4 sourced quotes");

const scaffold = loadMichaelPackoScaffold();
assert.ok(scaffold, "Pakko opposition scaffold must exist");
const packo01 = scaffold!.researchPriorities.find((t) => t.id === "PACKO-01");
const packo02 = scaffold!.researchPriorities.find((t) => t.id === "PACKO-02");
assert.equal(packo01?.status, "PARTIAL", "PACKO-01 must be PARTIAL for Phase 0 gate");
assert.equal(packo02?.status, "PARTIAL", "PACKO-02 must be PARTIAL for Phase 0 gate");

const gate = getPackoContrastGateStatus();
assert.equal(gate.blocked, false, "Contrast gate must open after PACKO-01/02 PARTIAL");

assert.equal(
  scaffold!.routesWhenLive.commandCenter,
  PACKO_COMMAND_CENTER_ROUTES.hub,
  "Scaffold commandCenter route must match hub",
);

console.log("test-pakko-command-center: OK");
console.log(`  routes: ${getPackoCommandCenterLinkAuditRoutes().join(", ")}`);
console.log(`  quotes: ${quotes.quotes.length}`);
console.log(`  contrast gate: ${gate.blocked ? "blocked" : "open"}`);
