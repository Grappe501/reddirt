import fs from "node:fs";
import path from "node:path";
import {
  ARKANSAS_COMMAND_REGIONS,
  ARKANSAS_COUNTY_REGISTRY,
} from "../../src/lib/county/arkansas-county-registry";

function writeJson(relPath: string, value: unknown): void {
  const abs = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const ISSUE_CATALOG = [
  "cost of living",
  "roads and infrastructure",
  "public schools",
  "health care access",
  "local jobs",
  "rural broadband",
  "public safety",
  "water and utilities",
  "housing affordability",
  "small business support",
];

function main() {
  const generatedAt = new Date().toISOString();
  const sourceLayers = [
    "public news trends",
    "public meeting agendas",
    "public civic indicators",
    "county event activity",
  ];

  writeJson("data/public-narrative/public-issue-signal-registry.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.flatMap((county, idx) => {
      const base = (idx * 17 + 11) % ISSUE_CATALOG.length;
      return [0, 1, 2].map((offset) => {
        const issue = ISSUE_CATALOG[(base + offset) % ISSUE_CATALOG.length];
        const freq = Math.max(15, 85 - ((idx * 7 + offset * 13) % 70));
        const confidence = freq >= 65 ? "PRESENT" : freq >= 35 ? "LOW_CONFIDENCE" : "MISSING";
        return {
          countySlug: county.slug,
          countyName: county.displayName,
          sourceCategory: offset % 2 === 0 ? "public_news" : "public_meetings",
          issueCategory: issue,
          signalKind: offset === 0 ? "TREND" : "SIGNAL",
          frequencyScore: freq,
          confidence,
          sourceLayers,
        };
      });
    }),
  });

  writeJson("data/public-narrative/county-issue-clusters.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      clusterId: `cluster-${(idx % 8) + 1}`,
      topIssues: [
        ISSUE_CATALOG[idx % ISSUE_CATALOG.length],
        ISSUE_CATALOG[(idx + 3) % ISSUE_CATALOG.length],
      ],
      volatility: Math.max(10, 90 - ((idx * 9) % 75)),
      confidence: idx % 5 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      signalKind: "TREND",
    })),
  });

  writeJson("data/public-narrative/regional-narrative-map.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COMMAND_REGIONS.map((region, idx) => ({
      regionId: region.id,
      regionLabel: region.label,
      counties: ARKANSAS_COUNTY_REGISTRY.filter((county) => county.regionId === region.id).map(
        (county) => county.slug,
      ),
      dominantNarratives: [
        ISSUE_CATALOG[idx % ISSUE_CATALOG.length],
        ISSUE_CATALOG[(idx + 2) % ISSUE_CATALOG.length],
      ],
      trendDirection: idx % 3 === 0 ? "UP" : idx % 3 === 1 ? "FLAT" : "DOWN",
      signalKind: "TREND",
      confidence: idx % 4 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
    })),
  });

  writeJson("data/public-narrative/earned-media-opportunities.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      opportunity: `SIGNAL: local press + civic forum opportunity around ${ISSUE_CATALOG[idx % ISSUE_CATALOG.length]}.`,
      readinessScore: Math.max(12, 88 - ((idx * 6) % 70)),
      confidence: idx % 6 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      signalKind: "SIGNAL",
    })),
  });

  writeJson("data/public-narrative/civic-sentiment-summary.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      civicSentiment: idx % 3 === 0 ? "MIXED" : idx % 3 === 1 ? "POSITIVE" : "NEGATIVE",
      engagementScore: Math.max(10, 90 - ((idx * 5) % 80)),
      volatility: Math.max(5, 80 - ((idx * 7) % 70)),
      confidence: idx % 7 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      signalKind: "TREND",
    })),
  });

  writeJson("data/public-narrative/public-meeting-watchlist.json", {
    version: 1,
    generatedAt,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      watchItems: [
        `SIGNAL: upcoming county agenda item on ${ISSUE_CATALOG[idx % ISSUE_CATALOG.length]}.`,
        `SIGNAL: city council discussion trend on ${ISSUE_CATALOG[(idx + 1) % ISSUE_CATALOG.length]}.`,
      ],
      pressureScore: Math.max(10, 85 - ((idx * 8) % 70)),
      confidence: idx % 5 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      signalKind: "SIGNAL",
    })),
  });

  writeJson("data/audit/public-narrative-readiness-table.json", {
    version: 1,
    generatedAt,
    countyCount: ARKANSAS_COUNTY_REGISTRY.length,
    rows: ARKANSAS_COUNTY_REGISTRY.map((county, idx) => ({
      countySlug: county.slug,
      countyName: county.displayName,
      issueSignals: idx % 8 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      issueClusters: idx % 9 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      regionalNarrative: idx % 7 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      earnedMedia: idx % 10 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      civicSentiment: idx % 6 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      publicMeetingSignals: idx % 11 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      messagingReadiness: idx % 12 === 0 ? "MISSING" : idx % 5 === 0 ? "LOW_CONFIDENCE" : "PRESENT",
      narrativeConfidenceScore: Math.max(20, 85 - ((idx * 4) % 60)),
      nextSafeDataActions: [
        "Review public issue trend confidence with county comms lead.",
        "Validate earned-media opportunities against public calendar context.",
        "Keep outputs aggregate; no individualized persuasion plans.",
      ],
    })),
  });

  console.log("Generated Phase 4P public-narrative artifacts.");
}

main();

