import { writeFileSync } from "node:fs";
import path from "node:path";
import { buildLegislativeOutlierViews } from "../src/lib/agents/decision-simulation/vote-intelligence/outliers";
import { loadHillLegislativeIntelligence } from "../src/lib/agents/decision-simulation/vote-intelligence/profile";

const { discovery, votes, profile } = loadHillLegislativeIntelligence();
const outliers = buildLegislativeOutlierViews(votes, profile);
const derived = {
  actorId: profile.actorId,
  version: profile.version,
  generatedAt: profile.generatedAt,
  sourceCorpus: profile.record.sourceCorpus,
  sourcePath: discovery.path,
  provenanceQuality: profile.record.provenanceQuality,
  voteCount: profile.record.voteCount,
  dateRange: profile.record.dateRange,
  congresses: profile.record.congresses,
  coverageEstimate: profile.record.coverageEstimate,
  searchedNames: profile.record.searchedNames,
  partyAlignment: { numerator: profile.partyAlignment.numerator, denominator: profile.partyAlignment.denominator, rate: profile.partyAlignment.rate },
  partyDefection: { numerator: profile.partyDefection.numerator, denominator: profile.partyDefection.denominator, rate: profile.partyDefection.rate },
  documentedAdminAlignment: {
    numerator: profile.documentedAdminAlignment.numerator,
    denominator: profile.documentedAdminAlignment.denominator,
    rate: profile.documentedAdminAlignment.rate,
  },
  documentedAdminDefection: {
    numerator: profile.documentedAdminDefection.numerator,
    denominator: profile.documentedAdminDefection.denominator,
    rate: profile.documentedAdminDefection.rate,
  },
  bipartisanRate: { numerator: profile.bipartisanRate.numerator, denominator: profile.bipartisanRate.denominator, rate: profile.bipartisanRate.rate },
  highlyPartisanRate: { numerator: profile.highlyPartisanRate.numerator, denominator: profile.highlyPartisanRate.denominator, rate: profile.highlyPartisanRate.rate },
  topIssues: profile.issueAlignment.slice(0, 8).map((row) => `${row.issue} n=${row.voteCount}`),
  recentOutliers: (outliers.find((view) => view.id === "AGAINST_REPUBLICAN_POSITION")?.voteIds ?? []).slice(0, 8),
  sampleVoteRefs: votes.slice(0, 12).map((vote) => `${vote.voteId} ${vote.billNumber ?? ""} ${vote.voteDate ?? ""}`.trim()),
  uncertainty: profile.uncertainty,
};

const out = path.join("src/lib/agents/decision-simulation/vote-intelligence/data/hill-derived.json");
writeFileSync(out, `${JSON.stringify(derived, null, 2)}\n`);
console.log(`Wrote ${out} votes=${derived.voteCount} found=${discovery.found}`);
