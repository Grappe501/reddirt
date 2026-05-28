import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import {
  buildKimHammerExportLineage,
  exportHistoryForCitation,
  exportHistoryForClaim,
  getCurrentExportReadyLineage,
  KIM_HAMMER_EXPORT_HISTORY_REL,
  loadKimHammerExportHistory,
  summarizeKimHammerExportControl,
} from "@/lib/opposition/kimHammerExportControl";
import {
  KIM_HAMMER_EXPORT_AUDIT_LOG_REL,
  recordKimHammerExportEvent,
} from "@/lib/opposition/kimHammerExportWorkflow";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const PROFILE_REL = "data/opposition/kim-hammer-profile";

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerExportControl.ts",
  "src/lib/opposition/kimHammerExportWorkflow.ts",
  "src/lib/opposition/types/kimHammerExportControl.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerExportControlCenterBrowser.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/export-control-center/page.tsx",
  KIM_HAMMER_EXPORT_HISTORY_REL,
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kh-export-control-"));
  const profileDir = path.join(tempDir, PROFILE_REL);
  mkdirSync(profileDir, { recursive: true });

  const seedFiles = [
    "kim-hammer-public-debate-evidence-board.json",
    "kim-hammer-kh4-claim-graph.json",
    "kim-hammer-intelligence-gaps.json",
    "kim-hammer-kh4-risk-register.json",
    "kim-hammer-kh4-publication-safety.json",
    "kim-hammer-citation-locker.json",
    "kim-hammer-export-history.json",
    "kim-hammer-export-audit-log.json",
  ];

  for (const fileName of seedFiles) {
    cpSync(path.join(process.cwd(), PROFILE_REL, fileName), path.join(profileDir, fileName));
  }

  return tempDir;
}

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing V3-E artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(registrySource.includes('"export-control-center"'), "Briefing registry must include export-control-center.");

  const history = loadKimHammerExportHistory();
  assert(history.entries.length >= 1, "Production export history must seed dry-run entry.");
  assert(
    history.entries[0]?.claimIds.includes("pdeb-003-debate-question-patterns"),
    "Seeded export must include export-ready debate claim.",
  );

  const summary = summarizeKimHammerExportControl();
  assert(summary.exportReadyClaimCount === 2, "Export control must report 2 export-ready claims.");
  assert(summary.totalExports === history.entries.length, "Summary must match history count.");

  const lineage = getCurrentExportReadyLineage();
  assert(lineage.claimIds.length === 2, "Current lineage must include 2 export-ready claims.");
  assert(lineage.citations.length >= 3, "Current lineage must resolve supporting citations.");

  const pdeb001History = exportHistoryForClaim("pdeb-001-election-integrity-record");
  assert(pdeb001History.length >= 1, "Claim export history lookup must resolve seeded dry run.");

  const citationHistory = exportHistoryForCitation("cite-pbs-debate-2022");
  assert(citationHistory.length >= 1, "Citation export history lookup must resolve seeded dry run.");

  const tempRepo = setupTempRepo();

  try {
    const recordResult = recordKimHammerExportEvent(
      {
        operator: "Export control test",
        changedByRoute: "test-kim-hammer-export-control-center",
        format: "JSON",
        scope: "STATEWIDE",
        exportNotes: "Test governed export record.",
      },
      tempRepo,
    );
    assert(recordResult.ok, `Record export failed: ${!recordResult.ok ? recordResult.error : ""}`);
    assert(recordResult.claimCount === 2, "Recorded export must include 2 claims.");
    assert(recordResult.citationCount >= 3, "Recorded export must resolve citation lineage.");

    const tempHistory = loadKimHammerExportHistory(tempRepo);
    assert(tempHistory.entries.length === 2, "Temp repo must have seeded + new export entry.");

    const tempLineage = buildKimHammerExportLineage(
      recordResult.ok ? ["pdeb-001-election-integrity-record", "pdeb-003-debate-question-patterns"] : [],
      tempRepo,
      recordResult.ok ? recordResult.exportId : undefined,
      recordResult.ok ? recordResult.packetVersion : undefined,
    );
    assert(tempLineage.narrativeIds.length >= 0, "Lineage builder must complete without error.");

    const timeline = loadKimHammerUnifiedAuditTimeline(tempRepo);
    assert(timeline.exportEventCount >= 1, "Export events must appear in unified audit timeline.");
    assert(
      timeline.entries.some((entry) => entry.kind === "EXPORT_EVENT"),
      "Unified timeline must include EXPORT_EVENT entries.",
    );

    assert(
      fs.existsSync(path.join(tempRepo, KIM_HAMMER_EXPORT_AUDIT_LOG_REL)),
      "Export audit log must exist after record.",
    );

    const backupDir = path.join(tempRepo, PROFILE_REL, "backups");
    assert(fs.existsSync(backupDir), "Export record must create backups.");
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  console.log("Kim Hammer export control center checks passed.");
  console.log(
    JSON.stringify(
      {
        productionExportHistory: history.entries.length,
        exportReadyClaims: summary.exportReadyClaimCount,
        currentLineageCitations: lineage.citations.length,
        route: "/admin/intelligence/kim-hammer/export-control-center",
      },
      null,
      2,
    ),
  );
}

main();
