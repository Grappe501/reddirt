export const VOTE_INTELLIGENCE_VERSION = "hill-vote-evidence-bridge-1.0" as const;
export const VOTE_INTELLIGENCE_AS_OF = "2026-09-09";
export const CURRENT_CONGRESS = 119;
export const HILL_VOTE_ACTOR_ID = "french-hill-ar02" as const;

export const VOTE_CORPUS_DIR_CANDIDATES = [
  "french-hil-vote-tracker",
  "french-hill-vote-tracker",
  "hill-vote-tracker",
  "hill-vote",
  "vote-tracker",
] as const;

export type LegislativeIssueTag =
  | "ECONOMY"
  | "TAX"
  | "BUDGET"
  | "BANKING"
  | "FINANCIAL_SERVICES"
  | "HEALTHCARE"
  | "IMMIGRATION"
  | "DEFENSE"
  | "FOREIGN_POLICY"
  | "AGRICULTURE"
  | "EDUCATION"
  | "LABOR"
  | "ENERGY"
  | "ENVIRONMENT"
  | "TECHNOLOGY"
  | "AI"
  | "PRIVACY"
  | "ELECTIONS"
  | "GOVERNMENT_REFORM"
  | "CIVIL_RIGHTS"
  | "CRIMINAL_JUSTICE"
  | "INFRASTRUCTURE"
  | "HOUSING"
  | "VETERANS"
  | "ARKANSAS_SPECIFIC"
  | "OTHER";

export type VoteChoice = "YEA" | "NAY" | "PRESENT" | "NOT_VOTING" | "UNKNOWN";
export type ProvenanceQuality = "MISSING" | "PARTIAL" | "USABLE";
export type VoteTemporalWindowId =
  | "ALL_TIME_AVAILABLE"
  | "CURRENT_CONGRESS"
  | "LAST_24_MONTHS"
  | "LAST_12_MONTHS"
  | "LAST_90_DAYS";

export type FactualVoteClass =
  | "VOTED_WITH_PARTY"
  | "VOTED_AGAINST_PARTY"
  | "VOTED_WITH_REPUBLICAN_MAJORITY"
  | "VOTED_AGAINST_REPUBLICAN_MAJORITY"
  | "VOTED_WITH_DOCUMENTED_ADMINISTRATION"
  | "VOTED_AGAINST_DOCUMENTED_ADMINISTRATION"
  | "BIPARTISAN_MAJORITY"
  | "NARROW_PARTISAN"
  | "HIGHLY_PARTISAN"
  | "UNANIMOUS"
  | "NEAR_UNANIMOUS"
  | "PROCEDURAL"
  | "SUBSTANTIVE"
  | "FINAL_PASSAGE"
  | "AMENDMENT"
  | "MOTION"
  | "NOMINATION";

export type ActorLegislativeRecord = {
  actorId: string;
  sourceCorpus: string | null;
  sourcePath: string | null;
  congresses: number[];
  chamber: "HOUSE" | "UNKNOWN";
  voteCount: number;
  dateRange: { start: string | null; end: string | null };
  lastUpdated: string | null;
  provenanceQuality: ProvenanceQuality;
  coverageEstimate: string;
  searchedNames: string[];
};

export type LegislativeVoteEvidence = {
  voteId: string;
  rollCallNumber: string | null;
  congress: number | null;
  session: number | null;
  voteDate: string | null;
  billNumber: string | null;
  billTitle: string | null;
  originalTopicLabels: string[];
  question: string | null;
  actorVote: VoteChoice;
  result: string | null;
  partyPosition: VoteChoice;
  presidentPosition: VoteChoice;
  leadershipPosition: VoteChoice;
  republicanMajorityPosition: VoteChoice;
  issueTags: LegislativeIssueTag[];
  sourceUrl: string | null;
  sourceAuthority: string | null;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  classes: FactualVoteClass[];
  partySplit: {
    republicanYea: number | null;
    republicanNay: number | null;
    democraticYea: number | null;
    democraticNay: number | null;
    totalYea: number | null;
    totalNay: number | null;
  };
};

export type LegislativeRate = {
  numerator: number;
  denominator: number;
  rate: number | null;
  methodology: string;
};

export type IssueAlignment = {
  issue: LegislativeIssueTag;
  voteCount: number;
  partyAlignment: LegislativeRate;
  documentedAdminAlignment: LegislativeRate;
  originalLabels: string[];
};

export type LegislativeTemporalSlice = {
  window: VoteTemporalWindowId;
  voteCount: number;
  partyAlignment: LegislativeRate;
  documentedAdminAlignment: LegislativeRate;
  bipartisanRate: LegislativeRate;
  highlyPartisanRate: LegislativeRate;
};

export type LegislativeBehaviorProfile = {
  actorId: string;
  version: string;
  generatedAt: string;
  record: ActorLegislativeRecord;
  partyAlignment: LegislativeRate;
  partyDefection: LegislativeRate;
  documentedAdminAlignment: LegislativeRate;
  documentedAdminDefection: LegislativeRate;
  bipartisanRate: LegislativeRate;
  highlyPartisanRate: LegislativeRate;
  proceduralRate: LegislativeRate;
  substantiveRate: LegislativeRate;
  amendmentRate: LegislativeRate;
  finalPassageRate: LegislativeRate;
  issueAlignment: IssueAlignment[];
  temporal: LegislativeTemporalSlice[];
  uncertainty: string[];
};

export type LegislativeOutlierViewId =
  | "AGAINST_REPUBLICAN_POSITION"
  | "AGAINST_DOCUMENTED_ADMINISTRATION"
  | "WITH_DEMOCRATS_AGAINST_MOST_REPUBLICANS"
  | "STRONG_BIPARTISAN"
  | "HIGHLY_PARTISAN_REPUBLICAN_MAJORITY"
  | "HIGHEST_DEFECTION_ISSUES"
  | "MOST_ALIGNED_ISSUES";

export type LegislativeOutlierView = {
  id: LegislativeOutlierViewId;
  voteIds: string[];
  notes: string;
};

export type LegislativePromptPacket = {
  actorId: string;
  lines: string[];
  sourceRefs: string[];
};

export type EvidenceGraphPrepEdge = {
  fromType: "ACTOR" | "VOTE" | "BILL" | "ISSUE" | "PARTY_POSITION" | "ADMINISTRATION_POSITION";
  fromId: string;
  toType: "VOTE" | "BILL" | "ISSUE" | "PARTY_POSITION" | "ADMINISTRATION_POSITION";
  toId: string;
};

export const PARTISAN_METHODOLOGY = [
  "HIGHLY_PARTISAN requires known party-split counts.",
  "Minority-party support for the winning side must be < 0.20.",
  "Majority-party support for the winning side must be >= 0.80.",
  "If either split is missing, the vote is not labeled highly partisan.",
  "NARROW_PARTISAN means a known winning-side share between 0.50 and 0.55 of Yea+Nay.",
  "A Republican-only majority is not treated as a Trump/administration position.",
].join(" ");

export const ADMINISTRATION_POSITION_RULE =
  "Administration/president alignment is classified only when the source record contains an explicit president or administration position. Party-line Republican votes are not a substitute.";
