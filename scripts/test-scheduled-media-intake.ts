import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { KIM_HAMMER_INTELLIGENCE_GAPS_REL } from "@/lib/opposition/kimHammerTaskWorkflow";
import { KIM_HAMMER_CITATION_LOCKER_REL } from "@/lib/opposition/kimHammerCitationLocker";
import {
  canFetchMediaSource,
  getFeedApprovalBlockers,
  resolveFetchEligibleSources,
  summarizeFeedApprovalReadiness,
} from "@/lib/intelligence/mediaFeedApprovalGate";
import {
  dismissFindingAfterReview,
  loadMediaDerivedCitationCandidates,
  loadMediaDerivedTaskDrafts,
  loadMediaFindingPromotionLog,
  promoteFindingToCitationCandidateDraft,
  promoteFindingToRetrievalTaskDraft,
} from "@/lib/intelligence/mediaFindingPromotionWorkflow";
import {
  loadPublicMediaIntakeQueue,
  PUBLIC_MEDIA_INTAKE_QUEUE_REL,
} from "@/lib/intelligence/publicMediaIntake";
import {
  loadPublicMediaIntakeRunLog,
  PUBLIC_MEDIA_INTAKE_RUN_LOG_REL,
  runDryRunPublicMediaIntake,
} from "@/lib/intelligence/scheduledPublicMediaIntake";
import { loadArkansasMediaSourceRegistry } from "@/lib/intelligence/mediaSourceDiscovery";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import { updateMediaFindingReviewStatus } from "@/lib/intelligence/publicMediaReviewWorkflow";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "src/lib/intelligence/scheduledPublicMediaIntake.ts",
  "src/lib/intelligence/mediaFeedApprovalGate.ts",
  "src/lib/intelligence/mediaFindingPromotionWorkflow.ts",
  PUBLIC_MEDIA_INTAKE_RUN_LOG_REL,
  "data/intelligence/media-finding-promotion-log.json",
  "data/intelligence/media-derived-task-drafts.json",
  "data/intelligence/media-derived-citation-candidates.json",
  "src/app/admin/(board)/intelligence/media-intake/MediaIntakeDashboard.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/MediaDerivedCitationCandidatesPanel.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/MediaDerivedRetrievalTaskDraftsPanel.tsx",
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nsi10-media-intake-"));
  const intelDir = path.join(tempDir, "data/intelligence");
  mkdirSync(path.join(intelDir, "fixtures"), { recursive: true });
  mkdirSync(path.join(intelDir, "backups"), { recursive: true });
  mkdirSync(path.join(tempDir, "data/opposition/kim-hammer-profile"), { recursive: true });

  for (const rel of [
    PUBLIC_MEDIA_INTAKE_QUEUE_REL,
    "data/intelligence/public-media-intake-audit-log.json",
    "data/intelligence/arkansas-media-source-registry.json",
    "data/intelligence/fixtures/nsi8-dry-run-feed.xml",
    PUBLIC_MEDIA_INTAKE_RUN_LOG_REL,
    "data/intelligence/media-finding-promotion-log.json",
    "data/intelligence/media-derived-task-drafts.json",
    "data/intelligence/media-derived-citation-candidates.json",
    KIM_HAMMER_INTELLIGENCE_GAPS_REL,
    KIM_HAMMER_CITATION_LOCKER_REL,
  ]) {
    cpSync(path.join(process.cwd(), rel), path.join(tempDir, rel));
  }

  return tempDir;
}

async function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-10 artifact: ${relPath}`);
  }

  const dashboard = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/media-intake/MediaIntakeDashboard.tsx"),
    "utf8",
  );
  assert(dashboard.includes("NSI-10"), "Media intake UI must include NSI-10 promotion sections.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-10"), "Morning brief must include NSI-10 intake/promotion summary.");

  const auditBrowser = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerAuditBrowser.ts"),
    "utf8",
  );
  assert(auditBrowser.includes("MEDIA_INTAKE_RUN"), "Audit browser must include MEDIA_INTAKE_RUN.");
  assert(auditBrowser.includes("MEDIA_FINDING_PROMOTION"), "Audit browser must include MEDIA_FINDING_PROMOTION.");

  const registry = loadArkansasMediaSourceRegistry();
  const eligible = resolveFetchEligibleSources();
  assert(eligible.length === 1, `Expected 1 fetch-eligible source; got ${eligible.length}.`);
  assert(eligible[0]!.sourceId === "nsi8-dry-run-fixture", "Only dry-run fixture may be fetch-eligible.");

  for (const source of registry.sources) {
    if (source.sourceId === "nsi8-dry-run-fixture") continue;
    assert(!canFetchMediaSource(source), `Source ${source.sourceId} must be blocked by feed gate.`);
    const blockers = getFeedApprovalBlockers(source);
    assert(blockers.length >= 1, `Source ${source.sourceId} must have blockers.`);
  }

  const readiness = summarizeFeedApprovalReadiness();
  assert(readiness.fetchEligibleCount === 1, "Feed readiness must count 1 eligible source.");
  assert(readiness.blockedFeedCount === registry.sources.length - 1, "All other sources must be blocked.");

  const evidenceBefore = loadKimHammerEvidenceIndex();
  const lockerBefore = loadKimHammerCitationLocker();
  const taskCountBefore = evidenceBefore.retrievalTasks.length;
  const citationCountBefore = lockerBefore.citations.length;
  const exportReadyBefore = evidenceBefore.metrics.exportReadyClaims;

  const tempRepo = setupTempRepo();
  try {
    const dryRun = await runDryRunPublicMediaIntake({
      repoRoot: tempRepo,
      writeQueue: false,
      operator: "NSI-10 test",
    });
    assert(dryRun.run.mode === "DRY_RUN", "Default mode must be DRY_RUN.");
    assert(dryRun.run.fetchedSourceCount === 1, "Dry-run must fetch fixture source.");
    assert(dryRun.wroteQueue === false, "Dry-run must not write queue by default.");

    const runLog = loadPublicMediaIntakeRunLog(tempRepo);
    assert(runLog.runs.length === 1, "Run log must record dry-run.");
    assert(runLog.runs[0]!.runId, "Run entry must include runId.");

    const queueBefore = loadPublicMediaIntakeQueue(tempRepo).findings.length;

    const queuePath = path.join(tempRepo, PUBLIC_MEDIA_INTAKE_QUEUE_REL);
    const emptyQueue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
    emptyQueue.findings = [];
    fs.writeFileSync(queuePath, `${JSON.stringify(emptyQueue, null, 2)}\n`);

    const liveDry = await runDryRunPublicMediaIntake({
      repoRoot: tempRepo,
      writeQueue: true,
      operator: "NSI-10 test write",
    });
    assert(liveDry.wroteQueue === true, "Explicit writeQueue must append new findings when queue empty.");
    const queueAfter = loadPublicMediaIntakeQueue(tempRepo).findings.length;
    assert(queueAfter >= 2, "Queue must contain fixture findings after write pass.");

    const secondPass = await runDryRunPublicMediaIntake({
      repoRoot: tempRepo,
      writeQueue: true,
      operator: "NSI-10 dedupe test",
    });
    assert(
      secondPass.run.duplicateFindingCount >= 1 || secondPass.run.newFindingCount === 0,
      "Second pass must not re-add duplicate findings.",
    );

    for (const finding of loadPublicMediaIntakeQueue(tempRepo).findings) {
      assert(finding.publicationSafety === "NON_PUBLISHABLE", "Finding must remain NON_PUBLISHABLE.");
      assert(finding.claimStatus === "NOT_A_CLAIM", "Finding must remain NOT_A_CLAIM.");
      assert(finding.humanReviewRequired === true, "Finding must require human review.");
    }

    const targetFinding = loadPublicMediaIntakeQueue(tempRepo).findings[0]!;
    updateMediaFindingReviewStatus(
      {
        findingId: targetFinding.findingId,
        nextStatus: "IN_REVIEW",
        operator: "NSI-10 test",
        changedByRoute: "scripts/test-scheduled-media-intake",
      },
      tempRepo,
    );

    const taskResult = promoteFindingToRetrievalTaskDraft(
      {
        findingId: targetFinding.findingId,
        operator: "NSI-10 test",
        changedByRoute: "scripts/test-scheduled-media-intake",
      },
      tempRepo,
    );
    assert(taskResult.ok, "Task draft promotion must succeed.");
    assert(taskResult.targetDraftId, "Task promotion must create draft ID.");

    const citationFinding = loadPublicMediaIntakeQueue(tempRepo).findings[1]!;
    updateMediaFindingReviewStatus(
      {
        findingId: citationFinding.findingId,
        nextStatus: "ACCEPTED_FOR_RESEARCH",
        operator: "NSI-10 test",
        changedByRoute: "scripts/test-scheduled-media-intake",
      },
      tempRepo,
    );

    const citationResult = promoteFindingToCitationCandidateDraft(
      {
        findingId: citationFinding.findingId,
        operator: "NSI-10 test",
        changedByRoute: "scripts/test-scheduled-media-intake",
      },
      tempRepo,
    );
    assert(citationResult.ok, "Citation candidate promotion must succeed.");

    const tasks = loadMediaDerivedTaskDrafts(tempRepo);
    const citations = loadMediaDerivedCitationCandidates(tempRepo);
    assert(tasks.drafts.length >= 1, "Task drafts file must contain draft.");
    assert(citations.candidates.length >= 1, "Citation candidates file must contain candidate.");
    assert(tasks.drafts[0]!.reviewStatus === "DRAFT", "Task draft must be DRAFT status.");
    assert(citations.candidates[0]!.humanReviewRequired === true, "Citation candidate must require review.");

    const promotionLog = loadMediaFindingPromotionLog(tempRepo);
    assert(promotionLog.entries.length >= 2, "Promotion log must record events.");

    const timeline = loadKimHammerUnifiedAuditTimeline(tempRepo);
    assert(
      timeline.entries.some((row) => row.kind === "MEDIA_INTAKE_RUN"),
      "Audit timeline must include intake runs.",
    );
    assert(
      timeline.entries.some((row) => row.kind === "MEDIA_FINDING_PROMOTION"),
      "Audit timeline must include promotions.",
    );

    const gapsAfter = JSON.parse(
      fs.readFileSync(path.join(tempRepo, KIM_HAMMER_INTELLIGENCE_GAPS_REL), "utf8"),
    );
    const lockerAfter = JSON.parse(
      fs.readFileSync(path.join(tempRepo, KIM_HAMMER_CITATION_LOCKER_REL), "utf8"),
    );
    assert(
      gapsAfter.gaps.length === taskCountBefore,
      "Promotion must not mutate KH-3B task board JSON.",
    );
    assert(
      lockerAfter.citations.length === citationCountBefore,
      "Promotion must not mutate citation locker cards.",
    );
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.scheduledIntakeReadiness.fetchEligibleCount === 1, "Brain must surface feed readiness.");
  assert(brain.promotionQueueSummary !== undefined, "Brain must include promotion queue summary.");

  const evidenceAfter = loadKimHammerEvidenceIndex();
  assert(
    evidenceAfter.metrics.exportReadyClaims === exportReadyBefore && exportReadyBefore === 2,
    `Export-ready count must remain 2; got ${evidenceAfter.metrics.exportReadyClaims}.`,
  );

  console.log("NSI-10 scheduled media intake + promotion: all checks passed.");
  console.log(
    JSON.stringify(
      {
        fetchEligible: eligible.length,
        blockedSources: registry.sources.length - eligible.length,
        exportReadyClaims: evidenceAfter.metrics.exportReadyClaims,
        routes: [
          "/admin/intelligence/media-intake",
          "/admin/intelligence/kim-hammer/citation-locker",
          "/admin/intelligence/kim-hammer/intelligence-gaps",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
