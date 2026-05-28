import fs from "node:fs";
import path from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

function main() {
  const required = [
    "data/opposition/kim-hammer-profile/kim-hammer-authored-writings.json",
    "data/opposition/kim-hammer-profile/kim-hammer-background-deep-profile.json",
    "data/opposition/kim-hammer-profile/kim-hammer-management-capacity-assessment.json",
    "data/opposition/kim-hammer-profile/kim-hammer-debate-archive-index.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-response-model.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-network-influence-map.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-legislation-patterns.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-vulnerability-matrix.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-narrative-testing.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-media-statements-archive.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-county-exposure-map.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-modern-sos-contrast.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-rapid-response-appendix.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-bill-relationship-graph.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-timeline-heatmap.json",
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-direct-democracy-file.json",
    "data/opposition/kim-hammer-profile/kim-hammer-public-debate-evidence-board.json",
    "docs/opposition/KIM_HAMMER_KH3_DEEP_RESEARCH.md",
    "src/app/admin/(board)/intelligence/kim-hammer/writings/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/background-deep/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/management-capacity/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/debate-archive/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/response-model/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/kh3-operational/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/network-influence/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/pattern-analysis/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/vulnerability-matrix-kh3/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/narrative-testing/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/county-exposure/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/modern-sos-contrast/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/rapid-response/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/bill-relationship-graph/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/timeline-heatmap/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/direct-democracy/page.tsx",
    "src/app/admin/(board)/intelligence/kim-hammer/public-debate-evidence/page.tsx",
  ];
  required.forEach((p) => assert(fs.existsSync(path.join(process.cwd(), p)), `Missing required KH-3 artifact: ${p}`));

  const writings = readJson<{ items: Array<{ url: string; evidenceStatus: string }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-authored-writings.json",
  );
  assert(writings.items.length >= 2, "Expected at least 2 authored writing records.");
  assert(writings.items.every((x) => x.url.startsWith("http")), "All writing items need source URLs.");

  const deep = readJson<{
    communityAndCivicWork: Array<{ evidenceStatus: string }>;
    businessBackground: Array<{ evidenceStatus: string }>;
  }>("data/opposition/kim-hammer-profile/kim-hammer-background-deep-profile.json");
  assert(deep.communityAndCivicWork.length > 0, "Community/civic work section must not be empty.");
  assert(deep.businessBackground.length > 0, "Business background section must not be empty.");

  const debate = readJson<{
    likelySosDebateQuestionThemes: string[];
  }>("data/opposition/kim-hammer-profile/kim-hammer-debate-archive-index.json");
  assert(debate.likelySosDebateQuestionThemes.length >= 4, "Debate archive must include likely question themes.");

  const responseModel = readJson<{ scenarios: Array<{ theme: string; kellyResponsePath: string }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-response-model.json",
  );
  assert(responseModel.scenarios.length >= 2, "Response model must include multiple scenarios.");
  assert(responseModel.scenarios.every((s) => s.kellyResponsePath.length > 0), "Every scenario needs response path.");

  const network = readJson<{ clusters: Array<{ id: string }>; openGaps: string[] }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-network-influence-map.json",
  );
  assert(network.clusters.length >= 2, "KH-3 network map must include multiple clusters.");

  const vulnerability = readJson<{ matrix: Array<{ area: string; persuasionUtility: number }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-vulnerability-matrix.json",
  );
  assert(vulnerability.matrix.length >= 3, "KH-3 vulnerability matrix needs multiple rows.");
  assert(vulnerability.matrix.every((x) => x.persuasionUtility >= 1 && x.persuasionUtility <= 5), "Vulnerability scores must be 1-5.");

  const modernContrast = readJson<{ contrastRows: Array<{ hammerLane: string; kellyLane: string }> }>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-modern-sos-contrast.json",
  );
  assert(modernContrast.contrastRows.length >= 2, "KH-3 modern contrast needs multiple rows.");

  const publicDebate = readJson<{
    items: Array<{ confidenceScore: number; citationStatus: string; externalUseStatus: string }>;
  }>("data/opposition/kim-hammer-profile/kim-hammer-public-debate-evidence-board.json");
  assert(publicDebate.items.length >= 3, "Public debate board must include multiple evidence items.");
  assert(
    publicDebate.items.every((item) => item.confidenceScore >= 0 && item.confidenceScore <= 1),
    "Public debate confidence scores must be between 0 and 1.",
  );
  assert(
    publicDebate.items.some((item) => item.externalUseStatus === "READY_WITH_CITATION"),
    "Public debate board should include at least one externally ready claim.",
  );

  console.log("KH-3 deep research checks passed.");
}

main();

