import fs from "node:fs";
import path from "node:path";
import {
  loadArkansasMediaSourceRegistry,
  resolveSourcesByCounty,
  resolveSourcesByRegion,
  resolveSourcesByTopic,
  summarizeCoverageGaps,
  summarizeFetchApprovedSources,
  summarizeManualReviewSources,
  summarizeSourceCoverage,
} from "@/lib/intelligence/mediaSourceDiscovery";
import { loadPublicMediaIntakeQueue } from "@/lib/intelligence/publicMediaIntake";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FIELDS = [
  "sourceId",
  "name",
  "sourceType",
  "url",
  "region",
  "countiesCovered",
  "topics",
  "ingestionMethod",
  "approvedForFetch",
  "reviewStatus",
  "robotsPolicyStatus",
  "sourceReliability",
  "allowedUse",
  "aiAccessLevel",
  "lastVerifiedAt",
  "verificationMethod",
  "mediaMarket",
] as const;

const REQUIRED_FILES = [
  "data/intelligence/arkansas-media-source-registry.json",
  "docs/intelligence/ARKANSAS_MEDIA_SOURCE_COVERAGE_MATRIX.md",
  "docs/intelligence/PUBLIC_MEDIA_FETCH_SAFETY_NOTES.md",
  "src/lib/intelligence/mediaSourceDiscovery.ts",
  "src/app/admin/(board)/intelligence/media-intake/page.tsx",
];

const MIN_SOURCE_COUNT = 25;

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-9 artifact: ${relPath}`);
  }

  const dashboardSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/media-intake/MediaIntakeDashboard.tsx"),
    "utf8",
  );
  assert(dashboardSource.includes("NSI-9"), "Media intake UI must include NSI-9 source coverage sections.");

  const morningBrief = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/morning-brief/page.tsx"),
    "utf8",
  );
  assert(morningBrief.includes("NSI-9"), "Morning brief must include NSI-9 source coverage summary.");

  const registry = loadArkansasMediaSourceRegistry();
  assert(registry.sources.length >= MIN_SOURCE_COUNT, `Expected >= ${MIN_SOURCE_COUNT} sources; got ${registry.sources.length}.`);

  for (const source of registry.sources) {
    for (const field of REQUIRED_FIELDS) {
      assert(
        field in source && (source as Record<string, unknown>)[field] !== undefined,
        `Source ${source.sourceId} missing field: ${field}`,
      );
    }
  }

  const fetchApproved = summarizeFetchApprovedSources();
  assert(fetchApproved.length === 1, `Expected 1 fetch-approved source; got ${fetchApproved.length}.`);
  assert(fetchApproved[0]!.sourceId === "nsi8-dry-run-fixture", "Only dry-run fixture may be fetch-approved.");

  for (const source of registry.sources) {
    if (source.approvedForFetch === true) {
      assert(
        source.verificationMethod && source.lastVerifiedAt,
        `Fetch-approved source ${source.sourceId} must have verification metadata.`,
      );
    }
    if (source.approvedForFetch === true && source.sourceId !== "nsi8-dry-run-fixture") {
      throw new Error(`External source ${source.sourceId} must not be fetch-approved without NSI-10 robots review.`);
    }
  }

  const withRss = registry.sources.filter((row) => row.rssUrl);
  for (const source of withRss) {
    if (source.approvedForFetch !== true) {
      assert(source.rssUrl!.startsWith("http") || source.rssUrl!.startsWith("data/"), `Invalid rssUrl on ${source.sourceId}`);
    }
  }

  const coverage = summarizeSourceCoverage();
  assert(coverage.totalSources === registry.sources.length, "Coverage summary must match registry count.");
  assert(coverage.manualReviewCount >= 1, "Must count manual review sources.");

  const gaps = summarizeCoverageGaps();
  assert(gaps.discoveryPriorities.length >= 1, "Must emit discovery priorities.");

  const pulaski = resolveSourcesByCounty("pulaski");
  assert(pulaski.length >= 3, "Pulaski must resolve multiple sources.");

  const legislation = resolveSourcesByTopic("legislation");
  assert(legislation.length >= 2, "Legislation topic must resolve sources.");

  const central = resolveSourcesByRegion("central-arkansas");
  assert(central.length >= 2, "Central Arkansas region must resolve sources.");

  const manual = summarizeManualReviewSources();
  assert(manual.length >= fetchApproved.length, "Manual review list must include non-fetch sources.");

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

  console.log("NSI-9 Arkansas media source discovery: all checks passed.");
  console.log(
    JSON.stringify(
      {
        totalSources: registry.sources.length,
        fetchApproved: fetchApproved.length,
        rssKnown: withRss.length,
        manualReview: coverage.manualReviewCount,
        exportReadyClaims: evidence.metrics.exportReadyClaims,
        route: "/admin/intelligence/media-intake",
      },
      null,
      2,
    ),
  );
}

main();
