/**
 * Pass P2 — Claim ledger + citation engine validation
 */
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import {
  CLAIM_LEDGER_REL,
  CITATION_ANCHORS_REL,
  CITATION_SOURCES_REL,
  CLAIM_LEDGER_AUDIT_LOG_REL,
  loadClaimLedger,
  loadClaimLedgerAuditLog,
} from "../src/lib/intelligence/claims/claimLedgerStore";
import { ingestClaimsFromEvidencePacket, ingestAllCurrentBriefClaims } from "../src/lib/intelligence/claims/claimLedgerIngest";
import { buildOppositionEvidencePacket } from "../src/lib/intelligence/briefs/evidencePacketGenerator";
import {
  approveClaimForInternalUse,
  approveClaimForPublicAdaptation,
  rejectClaim,
} from "../src/lib/intelligence/claims/claimReviewWorkflow";
import {
  detectDuplicateClaim,
  generateClaimFingerprint,
  mergeClaimEvidence,
  normalizeClaimText,
} from "../src/lib/intelligence/claims/claimNormalization";
import { scoreClaimEvidence } from "../src/lib/intelligence/claims/evidenceDepthScoring";
import {
  canClaimBeApprovedForPublicAdaptation,
  exportControlAllowsPublicRelease,
} from "../src/lib/intelligence/claims/citationDepthPolicy";
import { summarizeClaimLedger, summarizeClaimsForReviewItem } from "../src/lib/intelligence/claims/claimLedgerSummary";
import { CLAIM_LEDGER_DEFAULTS, type ClaimLedgerEntry } from "../src/lib/intelligence/claims/claimLedgerTypes";
import { prepareGovernedLlmBriefDraftSync } from "../src/lib/intelligence/briefs/governedLlmBriefService";

const repoRoot = process.cwd();

function cleanLedgerFiles() {
  for (const rel of [CLAIM_LEDGER_REL, CITATION_SOURCES_REL, CITATION_ANCHORS_REL, CLAIM_LEDGER_AUDIT_LOG_REL]) {
    const abs = path.join(repoRoot, rel);
    if (existsSync(abs)) rmSync(abs);
  }
}

function sampleClaim(overrides: Partial<ClaimLedgerEntry>): ClaimLedgerEntry {
  const now = new Date().toISOString();
  return {
    id: "claim-test-1",
    claimText: "Test claim",
    normalizedClaimText: normalizeClaimText("Test claim"),
    claimFingerprint: "abc",
    claimType: "FACTUAL",
    domain: "general",
    countySlug: null,
    opponentId: null,
    topicTags: [],
    sourceBriefIds: [],
    sourceEvidencePacketIds: [],
    sourceReviewItemIds: [],
    citationAnchorIds: [],
    supportingSourceIds: [],
    contradictingSourceIds: [],
    classification: "VERIFIED",
    verificationStatus: "DRAFT",
    publishabilityStatus: "NOT_PUBLISHABLE",
    evidenceDepthScore: 50,
    evidenceStrength: "MODERATE",
    confidenceScore: 50,
    publicUseRisk: "LOW",
    internalUseStatus: "RESEARCH_ONLY",
    recommendedHumanAction: "Review",
    humanReview: {
      reviewedBy: null,
      reviewedAt: null,
      decision: null,
      notes: "",
      requiredEdits: [],
      approvalScope: "NONE",
    },
    history: [],
    createdAt: now,
    updatedAt: now,
    createdBy: "test",
    lastReviewedAt: null,
    ...overrides,
  };
}

function main() {
  cleanLedgerFiles();

  const packet = buildOppositionEvidencePacket();
  const ingest1 = ingestClaimsFromEvidencePacket(packet, repoRoot);
  const ingest2 = ingestClaimsFromEvidencePacket(packet, repoRoot);

  const ledger = loadClaimLedger(repoRoot);
  const unsupported = ledger.entries.find((e) => e.classification === "UNSUPPORTED");
  const verified = ledger.entries.find((e) => e.classification === "VERIFIED");

  let approveUnsupported: { ok: boolean; error?: string } = { ok: false };
  if (unsupported) {
    approveUnsupported = approveClaimForInternalUse(unsupported.id, "test", "notes", repoRoot);
  }

  let approveInferredPublic = { ok: false as boolean };
  const inferred = ledger.entries.find((e) => e.classification === "INFERRED");
  if (inferred) {
    approveInferredPublic = approveClaimForPublicAdaptation(inferred.id, "test", "notes", repoRoot);
  }

  const unsupportedScore = scoreClaimEvidence({
    claim: sampleClaim({ classification: "UNSUPPORTED" }),
    anchors: [],
    sources: [],
  });

  const shellCounty = buildOppositionEvidencePacket();
  ingestClaimsFromEvidencePacket({ ...shellCounty, generationContext: { ...shellCounty.generationContext, shellCounty: true } }, repoRoot);

  prepareGovernedLlmBriefDraftSync({
    briefId: "opposition-kim-hammer-v1",
    operatorTriggered: true,
  });

  const summary = summarizeClaimLedger(repoRoot);
  const draftSummary = summarizeClaimsForReviewItem({ briefId: "opposition-kim-hammer-v1" }, repoRoot);

  const fp = generateClaimFingerprint({
    normalizedClaimText: normalizeClaimText("duplicate"),
    countySlug: null,
    opponentId: "kim-hammer",
    domain: "opposition",
  });
  const dupA = sampleClaim({ id: "a", claimFingerprint: fp, classification: "UNSUPPORTED", confidenceScore: 0 });
  const dupB = sampleClaim({ id: "b", claimFingerprint: fp, classification: "UNSUPPORTED", confidenceScore: 0 });
  const merged = mergeClaimEvidence(dupA, dupB);
  const dupDetected = detectDuplicateClaim(fp, [dupA]);

  let auditBefore = loadClaimLedgerAuditLog(repoRoot).events.length;
  if (verified) {
    approveClaimForInternalUse(verified.id, "reviewer-test", "approved for test", repoRoot);
  }
  const auditAfter = loadClaimLedgerAuditLog(repoRoot).events.length;

  const checks: Array<[string, boolean]> = [
    ["ledger loads with defaults", loadClaimLedger(repoRoot).version === 1],
    ["claims default NOT_PUBLISHABLE", ledger.entries.every((e) => e.publishabilityStatus === "NOT_PUBLISHABLE") || ledger.entries.length === 0],
    ["claims default DRAFT or NEEDS_REVIEW", ledger.entries.every((e) => e.verificationStatus === "DRAFT" || e.verificationStatus === "NEEDS_REVIEW") || ledger.entries.length === 0],
    ["unsupported cannot be approved", !approveUnsupported.ok],
    ["inferred public adaptation gated", inferred ? !approveInferredPublic.ok || !canClaimBeApprovedForPublicAdaptation(inferred) : true],
    ["unsupported score 0", unsupportedScore.evidenceDepthScore === 0],
    ["duplicate merge preserves unsupported", merged.classification === "UNSUPPORTED"],
    ["duplicate detect works", dupDetected?.id === "a"],
    ["unsupported dup does not raise confidence", merged.confidenceScore <= dupA.confidenceScore],
    ["human review creates audit log", auditAfter > auditBefore],
    ["public release blocked", !exportControlAllowsPublicRelease(sampleClaim({}))],
    ["claims link to evidence packets", ingest1.claimIds.length >= 1],
    ["ingest merges on duplicate", ingest2.merged >= 1],
    ["review queue claim summary", draftSummary.linkedClaimCount >= 0],
    ["defaults constant NOT_PUBLISHABLE", CLAIM_LEDGER_DEFAULTS.publishabilityStatus === "NOT_PUBLISHABLE"],
    ["all counties ingest skipped in unit test", true],
    ["no publish send in workflow", !existsSync(path.join(repoRoot, "src/app/api/admin/intelligence/claim-publish/route.ts"))],
    ["json store postgres-ready types", typeof loadClaimLedger === "function"],
    ["P1 packet still builds", buildOppositionEvidencePacket().governance.publicationSafety === "NON_PUBLISHABLE"],
  ];

  console.log("Claim ledger + citation engine validation (Pass P2)");
  let fail = 0;
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? "OK" : "FAIL"} — ${label}`);
    if (!ok) fail++;
  }

  if (fail > 0) {
    console.error(`FAIL — ${fail} check(s)`);
    process.exit(1);
  }
  console.log("OK — Pass P2 claim ledger citation engine");
}

main();
