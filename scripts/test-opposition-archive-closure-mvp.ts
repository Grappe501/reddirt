/**
 * Pass P3 — Opposition archive closure MVP validation
 */
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { generateOppositionResearchBrief } from "../src/lib/intelligence/briefs/oppositionDebateBriefGenerator";
import { buildDebateCommandCenterState } from "../src/lib/opposition/debateCommandCenter";
import { runDailyIntelligenceAgentPass } from "../src/lib/intelligence/intelligenceAgentOrchestrator";
import { exportControlAllowsPublicRelease } from "../src/lib/intelligence/claims/citationDepthPolicy";
import { ingestAllKimHammerArchiveSources } from "../src/lib/opposition/oppositionArchiveIngest";
import {
  loadOppositionArchive,
  OPPOSITION_ARCHIVE_AUDIT_LOG_REL,
  OPPOSITION_ARCHIVE_ITEMS_REL,
  OPPOSITION_CLIP_RECORDS_REL,
  OPPOSITION_QUOTE_RECORDS_REL,
  OPPOSITION_RETRIEVAL_TASKS_REL,
  OPPOSITION_SOURCE_RECORDS_REL,
  OPPOSITION_WRITING_RECORDS_REL,
} from "../src/lib/opposition/oppositionArchiveStore";
import { loadOppositionArchiveRollup } from "../src/lib/opposition/oppositionBriefConfidence";
import { generateOppositionCitationCoverageReport } from "../src/lib/opposition/oppositionCitationBinder";
import { OPPOSITION_ARCHIVE_GOVERNANCE } from "../src/lib/opposition/oppositionArchiveTypes";

const repoRoot = process.cwd();

type TestResult = { name: string; pass: boolean; detail?: string };

const results: TestResult[] = [];

function assert(name: string, condition: boolean, detail?: string) {
  results.push({ name, pass: condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"} — ${name}${detail ? `: ${detail}` : ""}`);
}

function cleanArchiveFiles() {
  for (const rel of [
    OPPOSITION_ARCHIVE_ITEMS_REL,
    OPPOSITION_SOURCE_RECORDS_REL,
    OPPOSITION_QUOTE_RECORDS_REL,
    OPPOSITION_CLIP_RECORDS_REL,
    OPPOSITION_WRITING_RECORDS_REL,
    OPPOSITION_RETRIEVAL_TASKS_REL,
    OPPOSITION_ARCHIVE_AUDIT_LOG_REL,
  ]) {
    const abs = path.join(repoRoot, rel);
    if (existsSync(abs)) rmSync(abs);
  }
}

function main() {
  cleanArchiveFiles();

  ingestAllKimHammerArchiveSources(repoRoot);
  const bundle = loadOppositionArchive(repoRoot);
  assert("Archive store loads", bundle.items.items.length > 0);

  const countBefore = bundle.items.items.length;
  ingestAllKimHammerArchiveSources(repoRoot);
  const countAfter = loadOppositionArchive(repoRoot).items.items.length;
  assert("Ingest does not duplicate items", countBefore === countAfter, `${countBefore} === ${countAfter}`);

  assert(
    "Writings ingested or flagged",
    bundle.writings.records.length >= 3,
    `writings=${bundle.writings.records.length}`,
  );

  assert(
    "Debate clips ingested or flagged",
    bundle.clips.records.length >= 1,
    `clips=${bundle.clips.records.length}`,
  );

  assert(
    "Retrieval tasks all represented",
    bundle.retrievalTasks.tasks.length === 7,
    `tasks=${bundle.retrievalTasks.tasks.length}`,
  );

  const falselyComplete = bundle.retrievalTasks.tasks.filter((t) => t.closureStatus === "CLOSED");
  assert(
    "No retrieval task marked complete without evidence",
    falselyComplete.length === 0,
    falselyComplete.map((t) => t.id).join(", ") || "none",
  );

  const quotesWithoutCitation = bundle.quotes.records.filter((q) => !q.citationSourceId && q.usable);
  assert(
    "Quotes without citations flagged unusable",
    quotesWithoutCitation.length === 0,
    `bad=${quotesWithoutCitation.length}`,
  );

  const clipsNoSource = bundle.clips.records.filter((c) => !c.url && !c.retrievalNeeded);
  assert(
    "Clips without source flagged retrieval-needed",
    clipsNoSource.length === 0,
    `bad=${clipsNoSource.length}`,
  );

  const writingsNoSource = bundle.writings.records.filter((w) => !w.url && !w.retrievalNeeded);
  assert(
    "Writings without source flagged retrieval-needed",
    writingsNoSource.length === 0,
    `bad=${writingsNoSource.length}`,
  );

  const citation = generateOppositionCitationCoverageReport(repoRoot);
  assert(
    "Archive items link to citation sources where possible",
    citation.archiveItemsWithCitation > 0,
    `withCitation=${citation.archiveItemsWithCitation}`,
  );

  assert(
    "Archive items link to claim ledger where possible",
    bundle.items.items.some((i) => i.claimIds.length > 0),
    "export-ready claim archive items",
  );

  const rollup = loadOppositionArchiveRollup(repoRoot);
  const brief = generateOppositionResearchBrief();
  assert(
    "Opposition confidence computed not hardcoded",
    brief.confidenceScore === rollup.oppositionBriefConfidenceEstimate,
    `brief=${brief.confidenceScore} rollup=${rollup.oppositionBriefConfidenceEstimate}`,
  );

  assert(
    "Confidence basis mentions archive metrics",
    brief.confidenceBasis.includes("sources="),
    brief.confidenceBasis,
  );

  const debate = buildDebateCommandCenterState();
  assert(
    "Debate command receives archive rollup",
    debate.oppositionArchive.archiveItemCount > 0,
    `items=${debate.oppositionArchive.archiveItemCount}`,
  );

  assert(
    "Debate command receives film gap signals",
    typeof debate.oppositionArchive.filmRoomGapNote === "string" && debate.oppositionArchive.filmRoomGapNote.length > 0,
  );

  const packet = runDailyIntelligenceAgentPass({ repoRoot, syncActionQueue: false });
  assert(
    "AI Brain receives archive rollup",
    packet.brainAnswers.strongestOppositionEvidence.length >= 1,
  );
  assert(
    "AI Brain retrieval task signal",
    packet.brainAnswers.topRetrievalTaskToClose.length >= 1,
  );

  for (const label of OPPOSITION_ARCHIVE_GOVERNANCE.labels) {
    assert(`Governance label: ${label}`, rollup.governance.labels.includes(label));
  }

  assert(
    "All outputs NON_PUBLISHABLE",
    brief.publishabilityStatus === "NOT_PUBLISHABLE" && packet.publicationSafety === "NON_PUBLISHABLE",
  );

  assert(
    "KH-4 export controls respected",
    !exportControlAllowsPublicRelease({
      classification: "UNSUPPORTED",
      verificationStatus: "DRAFT",
    } as import("../src/lib/intelligence/claims/claimLedgerTypes").ClaimLedgerEntry),
  );

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  if (failed.length) process.exit(1);
}

main();
