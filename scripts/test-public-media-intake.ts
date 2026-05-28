import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { rmSync, mkdirSync, cpSync } from "node:fs";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";
import {
  dedupeMediaFindings,
  loadApprovedMediaSources,
  loadPublicMediaIntakeQueue,
  normalizePublicMediaFinding,
  PUBLIC_MEDIA_INTAKE_QUEUE_REL,
  summarizeMediaIntakeQueue,
} from "@/lib/intelligence/publicMediaIntake";
import {
  fetchApprovedRssFeed,
  parseRssItems,
  runPublicMediaIntakePass,
  shouldSkipSource,
} from "@/lib/intelligence/publicFeedFetcher";
import { loadMediaSourceRegistry } from "@/lib/intelligence/publicMediaMonitor";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import {
  loadPublicMediaIntakeAuditLog,
  PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL,
  updateMediaFindingReviewStatus,
} from "@/lib/intelligence/publicMediaReviewWorkflow";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  PUBLIC_MEDIA_INTAKE_QUEUE_REL,
  PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL,
  "data/intelligence/arkansas-media-source-registry.json",
  "data/intelligence/fixtures/nsi8-dry-run-feed.xml",
  "src/lib/intelligence/publicMediaIntake.ts",
  "src/lib/intelligence/publicFeedFetcher.ts",
  "src/lib/intelligence/publicMediaReviewWorkflow.ts",
  "src/app/admin/(board)/intelligence/media-intake/page.tsx",
];

function setupTempRepo(): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nsi8-media-intake-"));
  const intelDir = path.join(tempDir, "data/intelligence");
  mkdirSync(path.join(intelDir, "fixtures"), { recursive: true });
  mkdirSync(path.join(intelDir, "backups"), { recursive: true });

  for (const rel of [
    PUBLIC_MEDIA_INTAKE_QUEUE_REL,
    PUBLIC_MEDIA_INTAKE_AUDIT_LOG_REL,
    "data/intelligence/arkansas-media-source-registry.json",
    "data/intelligence/fixtures/nsi8-dry-run-feed.xml",
  ]) {
    cpSync(path.join(process.cwd(), rel), path.join(tempDir, rel));
  }

  return tempDir;
}

async function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-8 artifact: ${relPath}`);
  }

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-8"), "Morning brief must integrate NSI-8 media intake section.");

  const auditBrowser = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerAuditBrowser.ts"),
    "utf8",
  );
  assert(auditBrowser.includes("MEDIA_INTAKE_REVIEW"), "Audit browser must include MEDIA_INTAKE_REVIEW.");

  const queue = loadPublicMediaIntakeQueue();
  assert(queue.findings.length >= 1, "Intake queue must load seeded findings.");

  const registry = loadMediaSourceRegistry();
  assert(registry.sources.length >= 5, "Source registry must include fixture + placeholders.");

  const approved = loadApprovedMediaSources();
  assert(approved.length === 1, `Expected 1 approved source; got ${approved.length}.`);
  assert(approved[0]!.sourceId === "nsi8-dry-run-fixture", "Approved source must be dry-run fixture.");

  const skipped = registry.sources
    .filter((row) => row.approvedForFetch !== true)
    .map((row) =>
      shouldSkipSource({
        sourceId: row.sourceId,
        name: row.name,
        sourceType: row.sourceType,
        url: row.url,
        rssUrl: row.rssUrl,
        region: row.region,
        countiesCovered: row.countiesCovered,
        topics: row.topics,
        ingestionMethod: row.ingestionMethod,
        robotsPolicyStatus: row.robotsPolicyStatus,
        reviewStatus: row.reviewStatus,
        approvedForFetch: false,
        sourceReliability: row.sourceReliability ?? "UNVERIFIED",
        allowedUse: row.allowedUse ?? "NONE",
        lastFetchedAt: row.lastFetchedAt ?? null,
        lastSuccessfulFetchAt: row.lastSuccessfulFetchAt ?? null,
        failureCount: row.failureCount ?? 0,
      }),
    );
  assert(skipped.every((row) => row.skip), "Unapproved sources must be skipped.");

  const fixtureXml = fs.readFileSync(
    path.join(process.cwd(), "data/intelligence/fixtures/nsi8-dry-run-feed.xml"),
    "utf8",
  );
  const parsed = parseRssItems(fixtureXml);
  assert(parsed.length === 2, `Dry-run feed must parse 2 items; got ${parsed.length}.`);

  const intakePass = await runPublicMediaIntakePass({ dryRun: true });
  assert(intakePass.fetchedSources === 1, "Dry-run pass must fetch approved fixture source.");
  assert(intakePass.newFindings >= 0, "Intake pass must complete dedupe step.");

  const normalized = normalizePublicMediaFinding({
    source: approved[0]!,
    title: "Test Arkansas Secretary of State Pulaski SB487",
    summary: "Kim Hammer election law discussion in Pulaski County.",
    canonicalUrl: "https://example.com/nsi8-test-unique",
  });
  assert(normalized.reviewStatus === "NEEDS_REVIEW", "Finding must default NEEDS_REVIEW.");
  assert(normalized.publicationSafety === "NON_PUBLISHABLE", "Finding must default NON_PUBLISHABLE.");
  assert(normalized.claimStatus === "NOT_A_CLAIM", "Finding must default NOT_A_CLAIM.");
  assert(normalized.humanReviewRequired === true, "Finding must require human review.");
  assert(normalized.relevanceScore > 0, "Relevance scoring must compute.");

  const dedupe = dedupeMediaFindings([normalized], queue.findings);
  assert(dedupe.unique.length === 1, "Unique finding must pass dedupe against existing queue.");

  const duplicate = dedupeMediaFindings(
    [{ ...normalized, contentHash: queue.findings[0]!.contentHash, findingId: "dup-test" }],
    queue.findings,
  );
  assert(duplicate.duplicates.length === 1, "Duplicate detection must flag matching content hash.");

  const feedResult = await fetchApprovedRssFeed(approved[0]!, { dryRun: true });
  assert(feedResult.ok && feedResult.itemCount === 2, "Fixture RSS fetch must return 2 items.");

  const summary = summarizeMediaIntakeQueue();
  assert(summary.pendingReviewCount >= 1, "Queue summary must count pending review.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.mediaIntakeSummary.totalFindings >= 1, "Brain must include media intake summary.");
  assert(brain.topPendingMediaFindings.length >= 1, "Brain must surface pending media findings.");

  const evidenceBefore = loadKimHammerEvidenceIndex();
  const citationsBefore = loadKimHammerCitationLocker();
  const claimCountBefore = evidenceBefore.claims.length;
  const citationCountBefore = citationsBefore.citations.length;
  const exportReadyBefore = evidenceBefore.metrics.exportReadyClaims;

  const tempRepo = setupTempRepo();
  try {
    const result = updateMediaFindingReviewStatus(
      {
        findingId: "media-finding-nsi8-seed-001",
        nextStatus: "IN_REVIEW",
        operator: "NSI-8 test",
        operatorNotes: "Workflow verification.",
        changedByRoute: "scripts/test-public-media-intake",
      },
      tempRepo,
    );
    assert(result.ok, "Review workflow must update finding status.");
    assert(fs.existsSync(path.join(tempRepo, result.ok ? result.backupPath : "")), "Workflow must create backup.");

    const auditLog = loadPublicMediaIntakeAuditLog(tempRepo);
    assert(auditLog.entries.length === 1, "Audit log must record workflow mutation.");

    const timeline = loadKimHammerUnifiedAuditTimeline(tempRepo);
    assert(
      timeline.entries.some((row) => row.kind === "MEDIA_INTAKE_REVIEW"),
      "Unified audit timeline must include MEDIA_INTAKE_REVIEW.",
    );
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }

  const evidenceAfter = loadKimHammerEvidenceIndex();
  const citationsAfter = loadKimHammerCitationLocker();
  assert(evidenceAfter.claims.length === claimCountBefore, "Intake must not create claims.");
  assert(citationsAfter.citations.length === citationCountBefore, "Intake must not create citations.");
  assert(
    evidenceAfter.metrics.exportReadyClaims === exportReadyBefore && exportReadyBefore === 2,
    `Export-ready count must remain 2; got ${evidenceAfter.metrics.exportReadyClaims}.`,
  );

  console.log("NSI-8 public media intake: all checks passed.");
  console.log(
    JSON.stringify(
      {
        queueFindings: queue.findings.length,
        approvedSources: approved.length,
        skippedSources: skipped.length,
        dryRunItemsParsed: parsed.length,
        exportReadyClaims: evidenceAfter.metrics.exportReadyClaims,
        route: "/admin/intelligence/media-intake",
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
