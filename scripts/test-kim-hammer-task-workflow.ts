import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  getAllowedTaskTransitions,
  KIM_HAMMER_INTELLIGENCE_GAPS_REL,
  KIM_HAMMER_TASK_AUDIT_LOG_REL,
  KIM_HAMMER_TASK_BACKUP_DIR_REL,
  loadKimHammerTaskAuditLog,
  updateKimHammerRetrievalTask,
} from "@/lib/opposition/kimHammerTaskWorkflow";
import type { KimHammerIntelligenceGapsFile } from "@/lib/opposition/types/kimHammerEvidence";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const PROFILE_REL = "data/opposition/kim-hammer-profile";

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerTaskWorkflow.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/task-actions.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/EvidenceCommandTaskPanel.tsx",
  "data/opposition/kim-hammer-profile/kim-hammer-task-audit-log.json",
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kh-task-workflow-"));
  const profileDir = path.join(tempDir, PROFILE_REL);
  mkdirSync(profileDir, { recursive: true });

  const seedFiles = [
    "kim-hammer-intelligence-gaps.json",
    "kim-hammer-public-debate-evidence-board.json",
    "kim-hammer-kh4-claim-graph.json",
    "kim-hammer-kh4-risk-register.json",
    "kim-hammer-kh4-publication-safety.json",
    "kim-hammer-task-audit-log.json",
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
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing task workflow artifact: ${relPath}`);
  }

  const evidenceCommandPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx"),
    "utf8",
  );
  assert(
    evidenceCommandPage.includes("EvidenceCommandTaskPanel"),
    "Evidence command page must mount task execution panel.",
  );

  const gapsPage = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/intelligence-gaps/page.tsx"),
    "utf8",
  );
  assert(
    gapsPage.includes("KimHammerRetrievalTaskControls"),
    "Intelligence gaps page must include per-task execution controls.",
  );

  const taskActionsSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/task-actions.ts"),
    "utf8",
  );
  assert(taskActionsSource.includes("requireAdminAction"), "Task actions must require admin auth.");
  assert(
    taskActionsSource.includes("updateKimHammerRetrievalTask"),
    "Task actions must delegate to JSON write-back service.",
  );

  const transitions = getAllowedTaskTransitions("ASSIGNED");
  assert(
    transitions.includes("IN_PROGRESS") && !transitions.includes("ASSIGNED"),
    "Allowed task transitions must exclude current status.",
  );

  const baselineIndex = loadKimHammerEvidenceIndex();
  assert(
    baselineIndex.metrics.retrievalTasks === 7,
    `Baseline retrieval task count must remain 7; got ${baselineIndex.metrics.retrievalTasks}.`,
  );
  assert(
    baselineIndex.metrics.exportReadyClaims === 2,
    "Task workflow must not alter export-ready claim count.",
  );

  const tempRepo = setupTempRepo();

  try {
    const updateResult = updateKimHammerRetrievalTask(
      {
        taskId: "kh3b-pre-legislative-authored-writings",
        operator: "Task workflow test",
        nextStatus: "READY_FOR_REVIEW",
        completionNotes: "Archive sweep complete; pending human review of two newsletter sources.",
        changedByRoute: "scripts/test-kim-hammer-task-workflow",
      },
      tempRepo,
    );

    assert(updateResult.ok, `Task update must succeed: ${!updateResult.ok && updateResult.error}`);
    assert(
      updateResult.ok && updateResult.previousStatus === "IN_PROGRESS",
      "Previous task status must be captured.",
    );
    assert(
      updateResult.ok && updateResult.nextStatus === "READY_FOR_REVIEW",
      "Next task status must be applied.",
    );

    assert(existsSync(path.join(tempRepo, KIM_HAMMER_TASK_BACKUP_DIR_REL)), "Backup directory must be created.");
    const backupFiles = fs.readdirSync(path.join(tempRepo, KIM_HAMMER_TASK_BACKUP_DIR_REL));
    assert(backupFiles.length >= 1, "At least one task backup file must be created.");

    const auditLog = loadKimHammerTaskAuditLog(tempRepo);
    assert(auditLog.entries.length >= 1, "Task audit log must append an entry.");
    const auditEntry = auditLog.entries[auditLog.entries.length - 1]!;
    assert(auditEntry.auditId.length > 0, "Audit entry must include auditId.");
    assert(auditEntry.taskId === "kh3b-pre-legislative-authored-writings", "Audit must include taskId.");
    assert(auditEntry.sourceFile === KIM_HAMMER_INTELLIGENCE_GAPS_REL, "Audit must include sourceFile.");
    assert(auditEntry.previousStatus === "IN_PROGRESS", "Audit must include previousStatus.");
    assert(auditEntry.nextStatus === "READY_FOR_REVIEW", "Audit must include nextStatus.");
    assert(auditEntry.operator === "Task workflow test", "Audit must include operator.");
    assert(auditEntry.changedAt.length > 0, "Audit must include changedAt.");
    assert(auditEntry.changedByRoute.includes("test-kim-hammer-task-workflow"), "Audit must include changedByRoute.");
    assert(auditEntry.backupPath.length > 0, "Audit must include backupPath.");

    const gaps = readJson<KimHammerIntelligenceGapsFile>(tempRepo, KIM_HAMMER_INTELLIGENCE_GAPS_REL);
    const updatedTask = gaps.gaps.find((task) => task.id === "kh3b-pre-legislative-authored-writings");
    assert(updatedTask?.taskStatus === "READY_FOR_REVIEW", "Gaps JSON must reflect updated taskStatus.");
    assert(updatedTask?.lastUpdated, "Gaps JSON must update lastUpdated.");

    const tempIndex = loadKimHammerEvidenceIndex(tempRepo);
    assert(
      tempIndex.metrics.taskStatusCounts.READY_FOR_REVIEW >= 1,
      "Evidence index must recompute task status counts after task update.",
    );

    const noop = updateKimHammerRetrievalTask(
      {
        taskId: "kh3b-pre-legislative-authored-writings",
        operator: "Task workflow test",
        changedByRoute: "scripts/test-kim-hammer-task-workflow",
      },
      tempRepo,
    );
    assert(!noop.ok, "No-op task update must be rejected.");

    const ownerUpdate = updateKimHammerRetrievalTask(
      {
        taskId: "kh3b-long-tail-video-forum-record",
        operator: "Assignment desk",
        owner: "Video archive lead",
        nextStatus: "IN_PROGRESS",
        changedByRoute: "scripts/test-kim-hammer-task-workflow",
      },
      tempRepo,
    );
    assert(ownerUpdate.ok, "Owner and status update must succeed.");

    assert(
      existsSync(path.join(tempRepo, KIM_HAMMER_TASK_AUDIT_LOG_REL)),
      "Task audit log file must exist after mutations.",
    );
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  console.log("Kim Hammer retrieval task workflow checks passed.");
  console.log(
    JSON.stringify(
      {
        retrievalTasks: baselineIndex.metrics.retrievalTasks,
        taskStatusCounts: baselineIndex.metrics.taskStatusCounts,
        exportReadyClaims: baselineIndex.metrics.exportReadyClaims,
        auditLogPath: KIM_HAMMER_TASK_AUDIT_LOG_REL,
      },
      null,
      2,
    ),
  );
}

main();
