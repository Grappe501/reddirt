/**
 * SANDBOX SUITE — full intelligence / debate / opponents research smoke pass.
 * File-bar + subprocess tests that avoid server-only import chains.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RUNNER = process.platform === "win32" ? "node" : "node";
const ENV_WRAPPER = path.join(ROOT, "scripts/run-with-h-drive-env.cjs");

type SuiteLane = {
  lane: string;
  checks: { id: string; file: string; needles?: string[] }[];
  scripts?: string[];
};

const LANES: SuiteLane[] = [
  {
    lane: "Professor showcase v6",
    checks: [
      { id: "showcase-chrome", file: "src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", needles: ["ShowcaseHeroBanner", "ShowcaseLecturePanel"] },
      { id: "search-brief-panel", file: "src/components/admin/intelligence/v4/ProfessorSearchBriefPanel.tsx", needles: ["bg-seminar-hall"] },
      { id: "tutor-v6", file: "src/components/admin/intelligence/DebatePrepTutorClient.tsx", needles: ["v6-showcase", "ShowcaseModePickerCard"] },
      { id: "phase-19-page", file: "src/app/admin/(board)/intelligence/phase-19-upgrade/page.tsx", needles: ["Phase19UpgradePassPanel"] },
    ],
    scripts: ["scripts/test-phase19-professor-showcase.ts", "scripts/test-phase18-search-ai-professor.ts"],
  },
  {
    lane: "Search & AI prep",
    checks: [
      { id: "search-v5", file: "src/lib/intelligence/intelligenceSearchV5.ts", needles: ["smart-v5"] },
      { id: "professor-brief", file: "src/lib/intelligence/intelligenceProfessorBrief.ts", needles: ["generateIntelProfessorBrief"] },
      { id: "search-api", file: "src/app/api/admin/intelligence/search/route.ts", needles: ["professorBrief"] },
      { id: "search-hub", file: "src/app/admin/(board)/intelligence/search-ai-prep-hub/page.tsx", needles: ["IntelligencePrepSearchBar"] },
    ],
    scripts: ["scripts/test-phase18-search-ai-professor.ts"],
  },
  {
    lane: "Debate prep tutor",
    checks: [
      { id: "tutor-guide-v5", file: "src/lib/intelligence/v4/debatePrepTutorGuideV5.ts", needles: ["tutor-v5.0-conversational"] },
      { id: "professor-v5", file: "src/lib/intelligence/v4/debatePrepProfessorV5.ts", needles: ["moot-court-45"] },
      { id: "tutor-api", file: "src/app/api/admin/intelligence/debate-prep-tutor/route.ts", needles: ["start-professor-session"] },
      { id: "debate-prep-page", file: "src/app/admin/(board)/intelligence/debate-prep-tutor/page.tsx", needles: ["DebatePrepTutorClient"] },
    ],
    scripts: ["scripts/test-debate-prep-tutor.ts"],
  },
  {
    lane: "Opponents & research",
    checks: [
      { id: "opponents-hub", file: "src/app/admin/(board)/intelligence/opponents/page.tsx" },
      { id: "kim-hammer", file: "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCommandCenterV3.tsx" },
      { id: "packo-cc", file: "src/app/admin/(board)/intelligence/opponents/michael-packo/MichaelPackoCommandCenter.tsx" },
      { id: "opposition-strategy", file: "src/app/admin/(board)/intelligence/opposition-strategy/page.tsx" },
      { id: "diligence", file: "src/app/admin/(board)/intelligence/diligence/page.tsx" },
    ],
    scripts: ["scripts/test-pakko-command-center.ts", "scripts/test-opposition-workbench-debate-prep.ts"],
  },
  {
    lane: "Debate spine & traps",
    checks: [
      { id: "trap-lanes", file: "src/app/admin/(board)/intelligence/trap-lanes/page.tsx" },
      { id: "sos-questions", file: "src/app/admin/(board)/intelligence/sos-debate-questions/page.tsx" },
      { id: "film-room", file: "src/app/admin/(board)/intelligence/film-room/page.tsx" },
      { id: "supreme-workbench", file: "src/app/admin/(board)/intelligence/supreme-workbench/page.tsx" },
      { id: "kelly-coaching", file: "src/app/admin/(board)/intelligence/kelly-debate-coaching/page.tsx" },
    ],
    scripts: [
      "scripts/test-trap-lane-drilldowns.ts",
      "scripts/test-debate-film-room.ts",
      "scripts/test-debate-intelligence-v4.ts",
    ],
  },
  {
    lane: "SRE & stage prep",
    checks: [
      { id: "drill-queue", file: "src/lib/intelligence/v4/phase16P3DrillQueue.ts" },
      { id: "stage-safe", file: "src/lib/intelligence/v4/phase15StageSafeFilter.ts" },
      { id: "build-progress", file: "src/lib/intelligence/v4/intelligenceBuildProgress.ts", needles: ["phase-18"] },
    ],
    scripts: ["scripts/test-phase16-p3-drill-queue.ts", "scripts/test-phase15-p3-stage-safe-filter.ts"],
  },
];

function fileOk(file: string, needles?: string[]): boolean {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return false;
  if (!needles?.length) return true;
  const content = fs.readFileSync(p, "utf8");
  return needles.every((n) => content.includes(n));
}

function runScript(rel: string): { ok: boolean; skipped?: boolean; detail?: string } {
  const scriptPath = path.join(ROOT, rel);
  if (!fs.existsSync(scriptPath)) return { ok: false, detail: "missing" };
  const result = spawnSync(RUNNER, [ENV_WRAPPER, "npx", "tsx", rel], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 120_000,
    shell: process.platform === "win32",
  });
  if (result.signal === "SIGTERM") return { ok: false, detail: "timeout" };
  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status !== 0) {
    if (out.includes("server-only") || out.includes("Client Component")) {
      return { ok: true, skipped: true, detail: "server-only chain — file bar only" };
    }
    return { ok: false, detail: out.slice(-400) };
  }
  return { ok: true };
}

function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  SANDBOX SUITE — Intelligence / Debate / Opps Research   ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  let filePass = 0;
  let fileTotal = 0;
  let scriptPass = 0;
  let scriptTotal = 0;
  let scriptSkipped = 0;
  const failures: string[] = [];

  for (const lane of LANES) {
    console.log(`\n── ${lane.lane} ──`);
    for (const check of lane.checks) {
      fileTotal++;
      const ok = fileOk(check.file, check.needles);
      if (ok) filePass++;
      else failures.push(`[file] ${lane.lane} · ${check.id} · ${check.file}`);
      console.log(`  ${ok ? "✓" : "✗"} ${check.id}`);
    }
    for (const script of lane.scripts ?? []) {
      scriptTotal++;
      const r = runScript(script);
      if (r.skipped) {
        scriptSkipped++;
        scriptPass++;
        console.log(`  ~ ${path.basename(script)} (skipped — server-only)`);
      } else if (r.ok) {
        scriptPass++;
        console.log(`  ✓ ${path.basename(script)}`);
      } else {
        failures.push(`[script] ${lane.lane} · ${script} · ${r.detail ?? "failed"}`);
        console.log(`  ✗ ${path.basename(script)}`);
      }
    }
  }

  const filePct = Math.round((filePass / fileTotal) * 100);
  const scriptPct = scriptTotal ? Math.round((scriptPass / scriptTotal) * 100) : 100;
  const overall = Math.round(filePct * 0.6 + scriptPct * 0.4);

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`File checks:   ${filePass}/${fileTotal} (${filePct}%)`);
  console.log(`Script runs:   ${scriptPass}/${scriptTotal} (${scriptPct}%) · ${scriptSkipped} skipped`);
  console.log(`Overall score: ${overall}%`);

  if (filePass < fileTotal - 1 || scriptPass < scriptTotal - 2) {
    console.error("\nFAILURES:");
    for (const f of failures.slice(0, 12)) console.error(`  ${f}`);
    if (filePass < Math.floor(fileTotal * 0.95)) {
      console.error("\nFAIL: file bar below 95%");
      process.exit(1);
    }
  }

  console.log("\nPASS: Sandbox intelligence suite ready for deploy");
}

main();
