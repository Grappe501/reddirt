import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getKimHammerV4ModuleEntry,
  shouldRenderKimHammerV4Module,
} from "../src/lib/intelligence/kimHammerV4ModuleRegistry";

const entry = getKimHammerV4ModuleEntry("evidence-command");
assert.ok(entry?.preserveCustomPageInLaunchMode, "evidence-command must preserve custom page in launch mode");
assert.equal(shouldRenderKimHammerV4Module("evidence-command", true), false);

const shell = fs.readFileSync(
  path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/KimHammerBriefingPageShell.tsx"),
  "utf8",
);
assert.ok(shell.includes("preserveCustomPage"), "shell must skip launch stub for preserveCustomPage modules");

const page = fs.readFileSync(
  path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx"),
  "utf8",
);
assert.ok(page.includes("EvidenceCommandDebateWeekLead"), "page must render debate-week lead");
assert.ok(page.includes("debateWeekMode={launchMode}"), "dashboard must receive debateWeekMode");

const dashboard = fs.readFileSync(
  path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
  "utf8",
);
assert.ok(dashboard.includes("DEBATE_WEEK_QUICK_LINKS"), "dashboard must define debate-week quick links");
assert.ok(dashboard.includes("!debateWeekMode && nsi7Summary"), "NSI panels hidden in debate week");

console.log("test-evidence-command-launch-mode: OK");
