/**
 * P3 — Kim Hammer module registry + v4 route consolidation.
 */
import {
  KIM_HAMMER_V4_MODULES,
  listKimHammerV4MigratedModuleIds,
  shouldRenderKimHammerV4Module,
} from "../src/lib/intelligence/kimHammerV4ModuleRegistry";
import { KIM_HAMMER_MODULE_HREFS } from "../src/lib/opposition/kimHammerBriefingRegistry";
import { loadDebateIntelligenceV4HubPacket } from "../src/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "../src/lib/intelligence/v4/debateOperatorNarratives";
import fs from "node:fs";
import path from "node:path";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const moduleIds = listKimHammerV4MigratedModuleIds();
assert(moduleIds.length >= 40, `expected >=40 v4 modules, got ${moduleIds.length}`);

const debateCore = [
  "debate-profile",
  "contrast-vs-kelly",
  "rebuttal-prep",
  "strengths-weaknesses",
  "intelligence-gaps",
  "themes",
  "timeline",
  "integrity-foundation-2021",
];
for (const id of debateCore) {
  assert(Boolean(KIM_HAMMER_V4_MODULES[id]?.preferV4), `${id} should prefer v4`);
  assert(shouldRenderKimHammerV4Module(id, true), `${id} launch v4`);
  assert(shouldRenderKimHammerV4Module(id, false), `${id} full-mode v4`);
}

assert(getSurfaceGuide("debateProfile") != null, "debateProfile guide");
assert(getSurfaceGuide("contrastVsKelly") != null, "contrastVsKelly guide");
assert(getSurfaceGuide("rebuttalPrep") != null, "rebuttalPrep guide");

const hub = loadDebateIntelligenceV4HubPacket();
assert(hub.likelyArguments.length >= 6, "hub packet loads likely arguments");
assert(hub.rebuttalPlaybook.length >= 6, "hub packet loads rebuttals");

const shellPath = path.join(
  process.cwd(),
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerBriefingPageShell.tsx",
);
const shellSrc = fs.readFileSync(shellPath, "utf8");
assert(shellSrc.includes("KimHammerV4ModuleBody"), "shell wires v4 module body");
assert(shellSrc.includes("shouldRenderKimHammerV4Module"), "shell uses P3 gate");

const pageCount = Object.keys(KIM_HAMMER_MODULE_HREFS).length;
assert(pageCount >= 40, `registry hrefs ${pageCount}`);

console.log("Debate intelligence P3");
console.log("  v4 modules registered:", moduleIds.length);
console.log("  module hrefs:", pageCount);
console.log("  debate-core v4:", debateCore.join(", "));
console.log("OK — P3 module consolidation ready");
