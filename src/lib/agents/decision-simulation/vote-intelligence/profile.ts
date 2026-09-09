import {
  ADMINISTRATION_POSITION_RULE,
  CURRENT_CONGRESS,
  HILL_VOTE_ACTOR_ID,
  PARTISAN_METHODOLOGY,
  VOTE_INTELLIGENCE_AS_OF,
  VOTE_INTELLIGENCE_VERSION,
  type ActorLegislativeRecord,
  type IssueAlignment,
  type LegislativeBehaviorProfile,
  type LegislativeIssueTag,
  type LegislativeRate,
  type LegislativeVoteEvidence,
  type VoteTemporalWindowId,
} from "./contracts";
import { rate } from "./classify";
import { discoverHillVoteCorpus } from "./discover";
import { loadVotesFromCorpus } from "./load";
import { temporalSlices } from "./temporal";

function hasClass(vote: LegislativeVoteEvidence, label: LegislativeVoteEvidence["classes"][number]) {
  return vote.classes.includes(label);
}

function alignmentRate(
  votes: LegislativeVoteEvidence[],
  withClass: LegislativeVoteEvidence["classes"][number],
  againstClass: LegislativeVoteEvidence["classes"][number],
  methodology: string,
): LegislativeRate {
  const known = votes.filter((vote) => hasClass(vote, withClass) || hasClass(vote, againstClass));
  return rate(known.filter((vote) => hasClass(vote, withClass)).length, known.length, methodology);
}

function issueRows(votes: LegislativeVoteEvidence[]): IssueAlignment[] {
  const issues = new Map<LegislativeIssueTag, LegislativeVoteEvidence[]>();
  for (const vote of votes) {
    for (const issue of vote.issueTags) {
      const list = issues.get(issue) ?? [];
      list.push(vote);
      issues.set(issue, list);
    }
  }
  return [...issues.entries()]
    .map(([issue, subset]) => ({
      issue,
      voteCount: subset.length,
      partyAlignment: alignmentRate(
        subset,
        "VOTED_WITH_PARTY",
        "VOTED_AGAINST_PARTY",
        "Share of issue votes where Hill's recorded vote matches a documented party position.",
      ),
      documentedAdminAlignment: alignmentRate(
        subset,
        "VOTED_WITH_DOCUMENTED_ADMINISTRATION",
        "VOTED_AGAINST_DOCUMENTED_ADMINISTRATION",
        ADMINISTRATION_POSITION_RULE,
      ),
      originalLabels: [...new Set(subset.flatMap((vote) => vote.originalTopicLabels))].slice(0, 8),
    }))
    .sort((a, b) => b.voteCount - a.voteCount);
}

export function buildLegislativeRecordMeta(
  votes: LegislativeVoteEvidence[],
  sourcePath: string | null,
  searchedNames: string[],
): ActorLegislativeRecord {
  const dates = votes.map((vote) => vote.voteDate).filter((value): value is string => Boolean(value)).sort();
  const congresses = [...new Set(votes.map((vote) => vote.congress).filter((value): value is number => typeof value === "number"))].sort(
    (a, b) => a - b,
  );
  const provenanceQuality = !sourcePath ? "MISSING" : votes.length === 0 ? "PARTIAL" : "USABLE";
  return {
    actorId: HILL_VOTE_ACTOR_ID,
    sourceCorpus: sourcePath ? pathBase(sourcePath) : null,
    sourcePath,
    congresses,
    chamber: "HOUSE",
    voteCount: votes.length,
    dateRange: { start: dates[0] ?? null, end: dates[dates.length - 1] ?? null },
    lastUpdated: votes.length ? VOTE_INTELLIGENCE_AS_OF : null,
    provenanceQuality,
    coverageEstimate:
      provenanceQuality === "MISSING"
        ? "0 — source directory not located"
        : `${votes.length} loaded records; completeness unknown`,
    searchedNames,
  };
}

function pathBase(sourcePath: string): string {
  const parts = sourcePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || sourcePath;
}

export function buildLegislativeBehaviorProfile(votes: LegislativeVoteEvidence[], record: ActorLegislativeRecord): LegislativeBehaviorProfile {
  const partyAlignment = alignmentRate(
    votes,
    "VOTED_WITH_PARTY",
    "VOTED_AGAINST_PARTY",
    "Hill vote equals documented party position. Unknown party position is excluded, not guessed.",
  );
  const documentedAdminAlignment = alignmentRate(
    votes,
    "VOTED_WITH_DOCUMENTED_ADMINISTRATION",
    "VOTED_AGAINST_DOCUMENTED_ADMINISTRATION",
    ADMINISTRATION_POSITION_RULE,
  );
  return {
    actorId: HILL_VOTE_ACTOR_ID,
    version: VOTE_INTELLIGENCE_VERSION,
    generatedAt: VOTE_INTELLIGENCE_AS_OF,
    record,
    partyAlignment,
    partyDefection: rate(
      partyAlignment.denominator - partyAlignment.numerator,
      partyAlignment.denominator,
      "Complement of party-alignment among votes with a documented party position.",
    ),
    documentedAdminAlignment,
    documentedAdminDefection: rate(
      documentedAdminAlignment.denominator - documentedAdminAlignment.numerator,
      documentedAdminAlignment.denominator,
      "Complement of documented administration-alignment. Missing administration position stays unknown.",
    ),
    bipartisanRate: rate(votes.filter((vote) => hasClass(vote, "BIPARTISAN_MAJORITY")).length, votes.length, "Share of loaded votes meeting the bipartisan-majority rule."),
    highlyPartisanRate: rate(votes.filter((vote) => hasClass(vote, "HIGHLY_PARTISAN")).length, votes.length, PARTISAN_METHODOLOGY),
    proceduralRate: rate(votes.filter((vote) => hasClass(vote, "PROCEDURAL")).length, votes.length, "Question-text rule for procedural motions."),
    substantiveRate: rate(votes.filter((vote) => hasClass(vote, "SUBSTANTIVE")).length, votes.length, "Votes not classified procedural."),
    amendmentRate: rate(votes.filter((vote) => hasClass(vote, "AMENDMENT")).length, votes.length, "Question contains amendment."),
    finalPassageRate: rate(votes.filter((vote) => hasClass(vote, "FINAL_PASSAGE")).length, votes.length, "Question contains passage/final passage."),
    issueAlignment: issueRows(votes),
    temporal: temporalSlices(votes),
    uncertainty: [
      record.provenanceQuality === "MISSING" ? "Vote-tracker directory was not found. Metrics are unknown." : "Coverage is only as complete as the source corpus.",
      "Party alignment excludes votes without a documented party position.",
      ADMINISTRATION_POSITION_RULE,
      PARTISAN_METHODOLOGY,
      `Current Congress constant is ${CURRENT_CONGRESS} as of ${VOTE_INTELLIGENCE_AS_OF}.`,
      "These rates are legislative counts, not psychological claims.",
    ],
  };
}

export function loadHillLegislativeIntelligence(cwd = process.cwd()): {
  discovery: ReturnType<typeof discoverHillVoteCorpus>;
  votes: LegislativeVoteEvidence[];
  profile: LegislativeBehaviorProfile;
} {
  const discovery = discoverHillVoteCorpus(cwd);
  const votes = loadVotesFromCorpus(discovery.path);
  const record = buildLegislativeRecordMeta(votes, discovery.path, discovery.searchedNames);
  return { discovery, votes, profile: buildLegislativeBehaviorProfile(votes, record) };
}

export function windowVotes(votes: LegislativeVoteEvidence[], window: VoteTemporalWindowId): LegislativeVoteEvidence[] {
  return votes.filter((vote) => {
    if (window === "ALL_TIME_AVAILABLE") return true;
    if (window === "CURRENT_CONGRESS") return vote.congress === CURRENT_CONGRESS;
    if (!vote.voteDate) return false;
    const days = (Date.parse(`${VOTE_INTELLIGENCE_AS_OF}T12:00:00.000Z`) - Date.parse(vote.voteDate)) / 86_400_000;
    if (!Number.isFinite(days)) return false;
    if (window === "LAST_24_MONTHS") return days <= 730;
    if (window === "LAST_12_MONTHS") return days <= 365;
    return days <= 90;
  });
}
