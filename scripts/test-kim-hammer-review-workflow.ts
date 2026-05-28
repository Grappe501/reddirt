import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { canExportClaim, loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  getAllowedReviewTransitions,
  KIM_HAMMER_CLAIM_GRAPH_REL,
  KIM_HAMMER_DEBATE_BOARD_REL,
  KIM_HAMMER_REVIEW_AUDIT_LOG_REL,
  KIM_HAMMER_REVIEW_BACKUP_DIR_REL,
  loadKimHammerClaimReviewAuditLog,
  resolveKimHammerClaimReviewSource,
  updateKimHammerClaimReviewStatus,
} from "@/lib/opposition/kimHammerReviewWorkflow";
import type { KimHammerPublicDebateEvidenceBoardFile } from "@/lib/opposition/types/kimHammerEvidence";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerReviewWorkflow.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/review-actions.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/EvidenceCommandReviewPanel.tsx",
  "data/opposition/kim-hammer-profile/kim-hammer-claim-review-audit-log.json",
];

const PROFILE_REL = "data/opposition/kim-hammer-profile";

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kh-review-workflow-"));
  const profileDir = path.join(tempDir, PROFILE_REL);
  mkdirSync(profileDir, { recursive: true });

  const seedFiles = [
    "kim-hammer-public-debate-evidence-board.json",
    "kim-hammer-kh4-claim-graph.json",
    "kim-hammer-intelligence-gaps.json",
    "kim-hammer-kh4-risk-register.json",
    "kim-hammer-kh4-publication-safety.json",
    "kim-hammer-claim-review-audit-log.json",
  ];

  for (const fileName of seedFiles) {
    cpSync(path.join(process.cwd(), PROFILE_REL, fileName), path.join(profileDir, fileName));
  }

  return tempDir;
}

function readJson<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), "utf8")) as T;
}

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing review workflow artifact: ${relPath}`);
  }

  const evidenceCommandPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx"),
    "utf8",
  );
  assert(
    evidenceCommandPage.includes("EvidenceCommandReviewPanel"),
    "Evidence command page must mount live review workflow panel.",
  );

  const publicDebatePage = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/public-debate-evidence/page.tsx",
    ),
    "utf8",
  );
  assert(
    publicDebatePage.includes("KimHammerClaimReviewControls"),
    "Public debate evidence page must include per-claim review controls.",
  );

  const reviewActionsSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/review-actions.ts"),
    "utf8",
  );
  assert(
    reviewActionsSource.includes("requireAdminAction"),
    "Review actions must require admin authentication.",
  );
  assert(
    reviewActionsSource.includes("updateKimHammerClaimReviewStatus"),
    "Review actions must delegate to JSON write-back service.",
  );

  const transitions = getAllowedReviewTransitions("NEEDS_REVIEW");
  assert(
    transitions.includes("APPROVED_FOR_EXTERNAL_USE") && !transitions.includes("NEEDS_REVIEW"),
    "Allowed transitions must exclude current status and include promotion targets.",
  );

  assert(
    resolveKimHammerClaimReviewSource("pdeb-001-election-integrity-record")?.sourceFile ===
      KIM_HAMMER_DEBATE_BOARD_REL,
    "Debate-board claims must resolve to debate-board source file.",
  );
  assert(
    resolveKimHammerClaimReviewSource("claim-election-integrity-central")?.sourceFile ===
      KIM_HAMMER_CLAIM_GRAPH_REL,
    "Claim-graph claims must resolve to claim-graph source file.",
  );

  const baselineIndex = loadKimHammerEvidenceIndex();
  assert(
    baselineIndex.metrics.exportReadyClaims === 2,
    `Baseline export-ready count must remain 2 before isolated temp mutation; got ${baselineIndex.metrics.exportReadyClaims}.`,
  );

  const tempRepo = setupTempRepo();

  try {
    const blockResult = updateKimHammerClaimReviewStatus(
      {
        claimId: "pdeb-001-election-integrity-record",
        nextStatus: "NEEDS_REVIEW",
        reviewer: "Review workflow test",
        reviewNotes: "Temporary demotion for export-gate regression check.",
        changedByRoute: "scripts/test-kim-hammer-review-workflow",
      },
      tempRepo,
    );

    assert(blockResult.ok, `Review update must succeed in temp repo: ${!blockResult.ok && blockResult.error}`);
    assert(blockResult.ok && blockResult.previousStatus === "APPROVED_FOR_EXTERNAL_USE", "Previous status must be captured.");
    assert(blockResult.ok && blockResult.nextStatus === "NEEDS_REVIEW", "Next status must be applied.");

    const backupDir = path.join(tempRepo, KIM_HAMMER_REVIEW_BACKUP_DIR_REL);
    assert(existsSync(backupDir), "Backup directory must be created on mutation.");
    const backupFiles = fs.readdirSync(backupDir);
    assert(backupFiles.length >= 1, "At least one backup file must be created before JSON write-back.");
    assert(
      blockResult.ok && blockResult.backupPath.includes("kim-hammer-public-debate-evidence-board"),
      "Backup path must reference the mutated source file.",
    );

    const auditLog = loadKimHammerClaimReviewAuditLog(tempRepo);
    assert(auditLog.entries.length >= 1, "Audit log must append an entry for each transition.");
    const auditEntry = auditLog.entries[auditLog.entries.length - 1]!;
    assert(auditEntry.auditId.length > 0, "Audit entry must include auditId.");
    assert(auditEntry.claimId === "pdeb-001-election-integrity-record", "Audit entry must include claimId.");
    assert(auditEntry.sourceFile === KIM_HAMMER_DEBATE_BOARD_REL, "Audit entry must include sourceFile.");
    assert(auditEntry.previousStatus === "APPROVED_FOR_EXTERNAL_USE", "Audit entry must include previousStatus.");
    assert(auditEntry.nextStatus === "NEEDS_REVIEW", "Audit entry must include nextStatus.");
    assert(auditEntry.reviewer === "Review workflow test", "Audit entry must include reviewer.");
    assert(typeof auditEntry.reviewNotes === "string", "Audit entry must include reviewNotes.");
    assert(auditEntry.changedAt.length > 0, "Audit entry must include changedAt.");
    assert(
      auditEntry.changedByRoute === "scripts/test-kim-hammer-review-workflow",
      "Audit entry must include changedByRoute.",
    );
    assert(auditEntry.backupPath.length > 0, "Audit entry must include backupPath.");

    const board = readJson<KimHammerPublicDebateEvidenceBoardFile>(
      tempRepo,
      KIM_HAMMER_DEBATE_BOARD_REL,
    );
    const updatedItem = board.items.find((item) => item.id === "pdeb-001-election-integrity-record");
    assert(updatedItem?.reviewStatus === "NEEDS_REVIEW", "Debate-board JSON must reflect updated reviewStatus.");
    assert(updatedItem?.reviewer === "Review workflow test", "Debate-board JSON must reflect reviewer.");
    assert(
      updatedItem?.reviewNotes === "Temporary demotion for export-gate regression check.",
      "Debate-board JSON must reflect reviewNotes.",
    );

    const tempIndex = loadKimHammerEvidenceIndex(tempRepo);
    assert(
      tempIndex.metrics.exportReadyClaims === 1,
      `Demoting export-approved Tier 1 claim must reduce export-ready count to 1; got ${tempIndex.metrics.exportReadyClaims}.`,
    );

    const demotedClaim = tempIndex.claims.find((claim) => claim.id === "pdeb-001-election-integrity-record");
    assert(demotedClaim && !canExportClaim(demotedClaim), "NEEDS_REVIEW must block export even for Tier 1 claim.");

    const noop = updateKimHammerClaimReviewStatus(
      {
        claimId: "pdeb-001-election-integrity-record",
        nextStatus: "NEEDS_REVIEW",
        reviewer: "Review workflow test",
        reviewNotes: "No-op attempt.",
        changedByRoute: "scripts/test-kim-hammer-review-workflow",
      },
      tempRepo,
    );
    assert(!noop.ok, "No-op review transition must be rejected.");

    const graphResult = updateKimHammerClaimReviewStatus(
      {
        claimId: "claim-election-integrity-central",
        nextStatus: "APPROVED_FOR_INTERNAL_USE",
        reviewer: "Graph reviewer",
        reviewNotes: "Graph claim internal approval retained.",
        changedByRoute: "scripts/test-kim-hammer-review-workflow",
      },
      tempRepo,
    );
    assert(!graphResult.ok, "Unchanged graph claim transition must be rejected when status matches.");

    const graphPromotion = updateKimHammerClaimReviewStatus(
      {
        claimId: "claim-election-integrity-central",
        nextStatus: "NEEDS_REVIEW",
        reviewer: "Graph reviewer",
        reviewNotes: "Send graph claim back to review queue.",
        changedByRoute: "scripts/test-kim-hammer-review-workflow",
      },
      tempRepo,
    );
    assert(graphPromotion.ok, "Claim-graph JSON write-back must succeed.");

    const graphFile = readJson<{ claims: Array<{ id: string; reviewStatus?: string }> }>(
      tempRepo,
      KIM_HAMMER_CLAIM_GRAPH_REL,
    );
    const graphClaim = graphFile.claims.find((claim) => claim.id === "claim-election-integrity-central");
    assert(graphClaim?.reviewStatus === "NEEDS_REVIEW", "Claim-graph JSON must reflect updated reviewStatus.");

    assert(
      existsSync(path.join(tempRepo, KIM_HAMMER_REVIEW_AUDIT_LOG_REL)),
      "Audit log file must exist after mutations.",
    );
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  const productionAudit = loadKimHammerClaimReviewAuditLog();
  assert(Array.isArray(productionAudit.entries), "Production audit log must remain readable after temp tests.");

  console.log("Kim Hammer live review workflow checks passed.");
  console.log(
    JSON.stringify(
      {
        governedClaimSources: [KIM_HAMMER_DEBATE_BOARD_REL, KIM_HAMMER_CLAIM_GRAPH_REL],
        auditLogPath: KIM_HAMMER_REVIEW_AUDIT_LOG_REL,
        backupDir: KIM_HAMMER_REVIEW_BACKUP_DIR_REL,
        baselineExportReadyClaims: baselineIndex.metrics.exportReadyClaims,
      },
      null,
      2,
    ),
  );
}

main();
