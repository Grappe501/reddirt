import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import {
  filterKimHammerAuditTimeline,
  groupAuditEntriesBySubject,
  loadKimHammerUnifiedAuditTimeline,
} from "@/lib/opposition/kimHammerAuditBrowser";
import {
  KIM_HAMMER_REVIEW_AUDIT_LOG_REL,
  updateKimHammerClaimReviewStatus,
} from "@/lib/opposition/kimHammerReviewWorkflow";
import {
  KIM_HAMMER_TASK_AUDIT_LOG_REL,
  updateKimHammerRetrievalTask,
} from "@/lib/opposition/kimHammerTaskWorkflow";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const PROFILE_REL = "data/opposition/kim-hammer-profile";

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerAuditBrowser.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerAuditLogBrowser.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/audit-log/page.tsx",
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kh-audit-browser-"));
  const profileDir = path.join(tempDir, PROFILE_REL);
  mkdirSync(profileDir, { recursive: true });

  const seedFiles = [
    "kim-hammer-public-debate-evidence-board.json",
    "kim-hammer-kh4-claim-graph.json",
    "kim-hammer-intelligence-gaps.json",
    "kim-hammer-kh4-risk-register.json",
    "kim-hammer-kh4-publication-safety.json",
    "kim-hammer-claim-review-audit-log.json",
    "kim-hammer-task-audit-log.json",
  ];

  for (const fileName of seedFiles) {
    cpSync(path.join(process.cwd(), PROFILE_REL, fileName), path.join(profileDir, fileName));
  }

  return tempDir;
}

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing audit browser artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(registrySource.includes('"audit-log"'), "Briefing registry must include audit-log module.");

  const dashboardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(dashboardSource.includes("/audit-log"), "Evidence Command dashboard must link to audit log.");

  const emptyTimeline = loadKimHammerUnifiedAuditTimeline();
  assert(emptyTimeline.totalEntries === 0, "Production audit logs should start empty in test baseline.");
  assert(Array.isArray(emptyTimeline.entries), "Unified timeline must expose entries array.");

  const tempRepo = setupTempRepo();

  try {
    updateKimHammerClaimReviewStatus(
      {
        claimId: "pdeb-002-management-readiness",
        nextStatus: "BLOCKED",
        reviewer: "Audit browser test",
        reviewNotes: "Temporary block for audit timeline verification.",
        changedByRoute: "scripts/test-kim-hammer-audit-browser",
      },
      tempRepo,
    );

    updateKimHammerRetrievalTask(
      {
        taskId: "kh3b-pre-legislative-authored-writings",
        operator: "Audit browser test",
        nextStatus: "READY_FOR_REVIEW",
        completionNotes: "Audit browser integration test.",
        changedByRoute: "scripts/test-kim-hammer-audit-browser",
      },
      tempRepo,
    );

    const timeline = loadKimHammerUnifiedAuditTimeline(tempRepo);
    assert(timeline.totalEntries === 2, `Expected 2 unified audit entries; got ${timeline.totalEntries}.`);
    assert(timeline.claimReviewCount === 1, "Timeline must include claim review count.");
    assert(timeline.retrievalTaskCount === 1, "Timeline must include retrieval task count.");
    assert(
      timeline.entries[0]!.changedAt >= timeline.entries[1]!.changedAt,
      "Timeline must sort newest-first by changedAt.",
    );

    const claimOnly = filterKimHammerAuditTimeline(timeline, { kind: "CLAIM_REVIEW" });
    assert(claimOnly.length === 1 && claimOnly[0]!.subjectId.includes("pdeb-002"), "Claim filter must work.");

    const operatorFiltered = filterKimHammerAuditTimeline(timeline, {
      operatorQuery: "Audit browser test",
    });
    assert(operatorFiltered.length === 2, "Operator filter must match both audit kinds.");

    const grouped = groupAuditEntriesBySubject(timeline.entries);
    assert(grouped.size === 2, "Subject grouping must produce one bucket per subject/kind.");

    assert(
      fs.existsSync(path.join(tempRepo, KIM_HAMMER_REVIEW_AUDIT_LOG_REL)),
      "Claim review audit log must exist in temp repo.",
    );
    assert(
      fs.existsSync(path.join(tempRepo, KIM_HAMMER_TASK_AUDIT_LOG_REL)),
      "Task audit log must exist in temp repo.",
    );
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  console.log("Kim Hammer audit log browser checks passed.");
  console.log(
    JSON.stringify(
      {
        productionAuditEntries: emptyTimeline.totalEntries,
        auditArtifacts: [KIM_HAMMER_REVIEW_AUDIT_LOG_REL, KIM_HAMMER_TASK_AUDIT_LOG_REL],
        route: "/admin/intelligence/kim-hammer/audit-log",
      },
      null,
      2,
    ),
  );
}

main();
