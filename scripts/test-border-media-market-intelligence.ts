import fs from "node:fs";
import path from "node:path";
import { loadArkansasMediaSourceRegistry } from "@/lib/intelligence/mediaSourceDiscovery";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  computeMediaCoverageGaps,
  computeMediaMarketReadinessSignals,
  loadMediaMarketProfiles,
  resolveCountyMediaMarketProfile,
  resolveCrossStateSourcesForCounty,
  summarizeBorderMediaCoverage,
  summarizeManualReviewBurden,
} from "@/lib/intelligence/mediaMarketIntelligence";
import {
  recommendBorderMarketMonitoringPriorities,
  recommendLocalPaperReviewPriorities,
  summarizeBorderMediaIntelligence,
  summarizeCampaignIntelligenceState,
  summarizeEdgeCountyCoverageGaps,
} from "@/lib/intelligence/intelligenceBrainCoordinator";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "docs/intelligence/ARKANSAS_BORDER_MEDIA_MARKET_MAP.md",
  "docs/intelligence/ARKANSAS_EDGE_COUNTY_MEDIA_COVERAGE_MATRIX.md",
  "data/intelligence/arkansas-media-source-registry.json",
  "src/lib/intelligence/types/mediaMarketIntelligence.ts",
  "src/lib/intelligence/mediaMarketIntelligence.ts",
  "src/app/admin/(board)/intelligence/media-intake/page.tsx",
  "src/app/admin/(board)/intelligence/morning-brief/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx",
];

const CROSS_STATE_BORDER_FIELDS = [
  "homeMarket",
  "state",
  "arkansasBorderCountiesInfluenced",
  "borderMarketRelevance",
  "localInfluenceScore",
  "monitoringPriority",
] as const;

const EDGE_COUNTIES = [
  "pulaski",
  "benton",
  "washington",
  "sebastian",
  "craighead",
  "crittenden",
  "miller",
  "union",
  "mississippi",
  "lee",
];

const MIN_CROSS_STATE_SOURCES = 10;

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-9B artifact: ${relPath}`);
  }

  const dashboardSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/media-intake/MediaIntakeDashboard.tsx"),
    "utf8",
  );
  assert(dashboardSource.includes("NSI-9B"), "Media intake UI must include NSI-9B border market sections.");
  assert(dashboardSource.includes("borderCountyFilter"), "Media intake must filter by border county.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-9B"), "Morning brief must include NSI-9B border media warnings.");

  const countyPanel = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx"),
    "utf8",
  );
  assert(countyPanel.includes("Local media environment"), "County briefing must render local media environment section.");

  const profiles = loadMediaMarketProfiles();
  assert(profiles.length >= 10, `Expected >= 10 media market profiles; got ${profiles.length}.`);

  const registry = loadArkansasMediaSourceRegistry();
  const crossState = registry.sources.filter((row) => row.state && row.state !== "AR");
  assert(
    crossState.length >= MIN_CROSS_STATE_SOURCES,
    `Expected >= ${MIN_CROSS_STATE_SOURCES} cross-state sources; got ${crossState.length}.`,
  );

  for (const source of crossState) {
    for (const field of CROSS_STATE_BORDER_FIELDS) {
      assert(
        field in source && (source as Record<string, unknown>)[field] !== undefined,
        `Cross-state source ${source.sourceId} missing field: ${field}`,
      );
    }
    assert(source.reviewStatus === "NEEDS_REVIEW", `Cross-state source ${source.sourceId} must be NEEDS_REVIEW.`);
    assert(source.approvedForFetch !== true, `Cross-state source ${source.sourceId} must not be fetch-approved.`);
  }

  const borderSummary = summarizeBorderMediaCoverage();
  assert(borderSummary.crossStateSourceCount >= MIN_CROSS_STATE_SOURCES, "Border summary must count cross-state sources.");
  assert(borderSummary.edgeCountyCount >= EDGE_COUNTIES.length, "Border summary must count edge counties.");
  assert(borderSummary.fetchApprovedCrossState === 0, "No cross-state source may be fetch-approved in NSI-9B.");

  for (const countyId of EDGE_COUNTIES) {
    const profile = resolveCountyMediaMarketProfile(countyId);
    assert(profile, `County media profile must resolve for ${countyId}.`);
    assert(profile!.readinessSignals.length >= 1, `${countyId} must emit readiness signals.`);
    assert(
      profile!.readinessSignals.some((s) => s.signal === "MANUAL_REVIEW_REQUIRED"),
      `${countyId} must require manual review signal.`,
    );
  }

  const crittendenCross = resolveCrossStateSourcesForCounty("crittenden");
  assert(crittendenCross.length >= 1, "Crittenden must resolve cross-state sources.");

  const gaps = computeMediaCoverageGaps();
  assert(gaps.length >= 1, "Must compute media coverage gaps.");

  const signals = computeMediaMarketReadinessSignals();
  assert(signals.length >= EDGE_COUNTIES.length, "Must compute border readiness signals.");

  const manualBurden = summarizeManualReviewBurden();
  assert(manualBurden.totalManualCrossState >= MIN_CROSS_STATE_SOURCES, "Manual review burden must count cross-state sources.");

  const brain = summarizeCampaignIntelligenceState();
  assert(brain.borderMediaCoverageWarnings.length >= 1, "Brain must emit border media warnings.");
  assert(brain.borderMonitoringPriorities.length >= 1, "Brain must emit border monitoring priorities.");

  assert(summarizeEdgeCountyCoverageGaps().length >= 1, "Edge county coverage gaps must summarize.");
  assert(recommendBorderMarketMonitoringPriorities().length >= 1, "Border market priorities must recommend.");
  assert(recommendLocalPaperReviewPriorities().length >= 1, "Local paper priorities must recommend.");

  summarizeBorderMediaIntelligence();

  const queue = loadPublicMediaIntakeQueue();
  assert(
    queue.findings.every(
      (row) =>
        row.publicationSafety === "NON_PUBLISHABLE" &&
        row.claimStatus === "NOT_A_CLAIM" &&
        row.humanReviewRequired === true,
    ),
    "Queue findings must remain non-publishable and not claims.",
  );

  const evidence = loadKimHammerEvidenceIndex();
  assert(
    evidence.metrics.exportReadyClaims === 2,
    `Export-ready count must remain 2; got ${evidence.metrics.exportReadyClaims}.`,
  );

  console.log("NSI-9B border media market intelligence: all checks passed.");
  console.log(
    JSON.stringify(
      {
        mediaMarkets: profiles.length,
        crossStateSources: crossState.length,
        edgeCounties: EDGE_COUNTIES.length,
        coverageGaps: gaps.length,
        readinessSignals: signals.length,
        exportReadyClaims: evidence.metrics.exportReadyClaims,
        routes: [
          "/admin/intelligence/media-intake",
          "/admin/intelligence/morning-brief",
          "/admin/intelligence/kim-hammer/counties/crittenden",
        ],
      },
      null,
      2,
    ),
  );
}

main();
