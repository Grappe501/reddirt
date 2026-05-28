import fs from "node:fs";
import path from "node:path";
import {
  KIM_HAMMER_EXPORT_FILTER,
  loadKimHammerEvidenceIndex,
} from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  canExportClaim,
  getSafetyBlockers,
  passesReviewExportGate,
  passesTierOneSafetyCriteria,
} from "@/lib/opposition/kimHammerPublicationSafety";
import { KIM_HAMMER_REVIEW_STATUSES } from "@/lib/opposition/types/kimHammerEvidence";
import type { KimHammerClaim } from "@/lib/opposition/types/kimHammerEvidence";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function main() {
  const required = [
    "data/opposition/kim-hammer-profile/kim-hammer-intelligence-gaps.json",
    "data/opposition/kim-hammer-profile/kim-hammer-public-debate-evidence-board.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-claim-graph.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-risk-register.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh4-publication-safety.json",
    "src/lib/opposition/kimHammerEvidenceIndex.ts",
    "src/lib/opposition/types/kimHammerEvidence.ts",
    "src/lib/opposition/kimHammerPublicationSafety.ts",
    "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandFilters.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
  ];

  required.forEach((p) =>
    assert(fs.existsSync(path.join(process.cwd(), p)), `Missing evidence index artifact: ${p}`),
  );

  const filtersSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandFilters.tsx"),
    "utf8",
  );
  assert(filtersSource.includes("exportReadyOnly"), "Evidence command filters must support export-ready toggle.");
  assert(filtersSource.includes("reviewStatus"), "Evidence command filters must filter by review status.");
  assert(filtersSource.includes("publicationTier"), "Evidence command filters must filter by publication tier.");
  assert(filtersSource.includes("legalRisk"), "Evidence command filters must filter by legal risk.");
  assert(filtersSource.includes("taskStatus"), "Evidence command filters must filter by task status.");
  assert(filtersSource.includes("Clear filters"), "Evidence command filters must include clear filters action.");
  assert(filtersSource.includes("confidenceNeed"), "Evidence command filters must reference confidence need.");
  assert(filtersSource.includes("externalReadiness"), "Evidence command filters must reference external readiness.");

  const pageSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/page.tsx"),
    "utf8",
  );
  const dashboardSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx"),
    "utf8",
  );
  assert(dashboardSource.includes("Review bottleneck summary"), "Dashboard must include review bottleneck summary.");
  assert(dashboardSource.includes("Export-ready summary"), "Dashboard must include export-ready summary.");
  assert(dashboardSource.includes("Safety blocker summary"), "Dashboard must include safety blocker summary.");
  assert(dashboardSource.includes("Source-risk indicators"), "Dashboard must include source-risk indicators.");
  assert(dashboardSource.includes("Task status analytics"), "Dashboard must include task status analytics.");
  assert(dashboardSource.includes("/admin/intelligence/kim-hammer/attack-surface"), "Dashboard must link to attack surface.");
  assert(dashboardSource.includes("/admin/intelligence/kim-hammer/narrative-drift-monitor"), "Dashboard must link to narrative drift monitor.");
  assert(pageSource.includes("EvidenceCommandDashboard"), "Evidence command page must render dashboard component.");

  const index = loadKimHammerEvidenceIndex();

  assert(index.claims.length >= 4, "Unified index must include debate-board claims.");
  assert(index.retrievalTasks.length >= 7, "Unified index must include KH-3B retrieval tasks.");
  assert(
    index.publicationSafety.rules.some((rule) => rule.severity === "BLOCKER"),
    "Publication safety must define blocker rules.",
  );

  const debateClaims = index.claims.filter((claim) => claim.indexSource === "PUBLIC_DEBATE_BOARD");
  const graphClaims = index.claims.filter((claim) => claim.indexSource === "CLAIM_GRAPH");

  assert(debateClaims.length === index.publicDebateEvidenceBoard.items.length, "Debate claims must mirror board items.");
  assert(graphClaims.length === index.claimGraph.claims.length, "Graph claims must mirror claim graph rows.");

  assert(index.metrics.totalClaims === debateClaims.length + graphClaims.length, "Total claims must sum indexed sources.");
  assert(index.metrics.retrievalTasks === index.intelligenceGaps.gaps.length, "Retrieval task count must match gaps file.");

  assert(
    index.metrics.exportReadyClaims === index.exportReadyClaims.length,
    "Export-ready metric must match export-ready claim list.",
  );
  assert(
    index.metrics.blockedClaims === index.blockedClaims.length,
    "Blocked metric must match blocked claim list.",
  );
  assert(
    index.metrics.reviewNeededClaims === index.reviewNeededClaims.length,
    "Review-needed metric must match review-needed claim list.",
  );

  assert(
    index.metrics.exportReadyClaims === 2,
    `Expected 2 export-ready debate claims at baseline; got ${index.metrics.exportReadyClaims}.`,
  );
  assert(
    index.claims.filter(canExportClaim).length === index.metrics.exportReadyClaims,
    "canExportClaim gate must match export-ready metrics count.",
  );
  assert(
    index.exportReadyClaims.every((claim) => canExportClaim(claim)),
    "Export-ready claim list must pass centralized publication safety gate.",
  );
  assert(
    index.exportReadyClaims.every(
      (claim) =>
        claim.externalUseStatus === KIM_HAMMER_EXPORT_FILTER.externalUseStatus &&
        claim.citationStatus === KIM_HAMMER_EXPORT_FILTER.citationStatus &&
        (claim.confidenceTier ?? claim.verificationTier) === KIM_HAMMER_EXPORT_FILTER.confidenceTier &&
        claim.legalRisk === KIM_HAMMER_EXPORT_FILTER.legalRisk,
    ),
    "Export-ready claims must pass the KH-4 export filter.",
  );

  assert(index.metrics.blockedClaims >= 1, "At least one claim must be safety-blocked at baseline.");
  assert(
    index.blockedClaims.some((claim) => claim.id === "pdeb-004-civic-affiliation-claims"),
    "Civic affiliation claim must be blocked by publication safety rules.",
  );
  const blockedClaim = index.blockedClaims.find(
    (claim) => claim.id === "pdeb-004-civic-affiliation-claims",
  );
  assert(
    blockedClaim &&
      getSafetyBlockers(blockedClaim, index.publicationSafety.rules).includes("rule-tier-4-block"),
    "Blocked claim safety blockers must be returned consistently from publication safety gate.",
  );

  assert(index.metrics.reviewNeededClaims >= 2, "Review-needed claims must include caution and blocked rows.");

  const tierTotal = Object.values(index.metrics.tierDistribution).reduce((sum, count) => sum + count, 0);
  assert(tierTotal === index.metrics.totalClaims, "Tier distribution must cover all indexed claims.");
  assert(
    index.metrics.tierDistribution.TIER_1_PUBLIC_DEPLOYABLE >= 2,
    "Tier distribution must include TIER_1 debate-ready claims.",
  );

  assert(
    index.riskRegister.risks.length >= 1,
    "Risk register must remain linked into the unified evidence index.",
  );

  assert(
    index.retrievalTasks.every((task) => typeof task.taskStatus === "string"),
    "Every KH-3B task must include taskStatus after Step 5 upgrade.",
  );
  assert(
    index.retrievalTasks.every((task) => typeof task.owner === "string"),
    "Every KH-3B task must include owner after Step 5 upgrade.",
  );

  const taskStatusTotal = Object.values(index.metrics.taskStatusCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  assert(
    taskStatusTotal === index.metrics.retrievalTasks,
    "Task status counts must sum to retrieval task total.",
  );
  assert(
    index.metrics.taskStatusCounts.IN_PROGRESS >= 1,
    "Baseline task board should include at least one in-progress task.",
  );

  index.publicDebateEvidenceBoard.items.forEach((item) => {
    assert(
      item.reviewStatus && KIM_HAMMER_REVIEW_STATUSES.includes(item.reviewStatus),
      `Debate-board claim ${item.id} must have a valid reviewStatus.`,
    );
  });

  const reviewStatusTotal = Object.values(index.metrics.reviewStatusCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  assert(
    reviewStatusTotal === index.metrics.totalClaims,
    "Review status counts must cover all indexed claims.",
  );

  const legacyTierOneClaim: KimHammerClaim = {
    id: "legacy-export-fallback-test",
    text: "Legacy claim without reviewStatus should retain export eligibility when Tier 1 criteria pass.",
    externalUseStatus: "READY_WITH_CITATION",
    citationStatus: "CITED",
    confidenceTier: "TIER_1_PUBLIC_DEPLOYABLE",
    legalRisk: "LOW",
  };
  assert(
    passesReviewExportGate(legacyTierOneClaim),
    "Legacy fallback must pass review export gate when reviewStatus is unset.",
  );
  assert(
    canExportClaim(legacyTierOneClaim),
    "Legacy fallback must preserve export eligibility for Tier 1 claims.",
  );

  const reviewBlockedTierOneClaim: KimHammerClaim = {
    ...legacyTierOneClaim,
    id: "review-blocked-tier-one-test",
    reviewStatus: "NEEDS_REVIEW",
  };
  assert(
    passesTierOneSafetyCriteria(reviewBlockedTierOneClaim),
    "Review-blocked test claim should still pass Tier 1 safety criteria.",
  );
  assert(
    !canExportClaim(reviewBlockedTierOneClaim),
    "Explicit NEEDS_REVIEW status must block export even when Tier 1 criteria pass.",
  );

  console.log("Kim Hammer unified evidence index checks passed.");
  console.log(
    JSON.stringify(
      {
        totalClaims: index.metrics.totalClaims,
        exportReadyClaims: index.metrics.exportReadyClaims,
        blockedClaims: index.metrics.blockedClaims,
        retrievalTasks: index.metrics.retrievalTasks,
        reviewNeededClaims: index.metrics.reviewNeededClaims,
        safetyBlockers: index.metrics.safetyBlockers,
        tierDistribution: index.metrics.tierDistribution,
        taskStatusCounts: index.metrics.taskStatusCounts,
        reviewStatusCounts: index.metrics.reviewStatusCounts,
      },
      null,
      2,
    ),
  );
}

main();
