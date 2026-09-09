export const WRITING_INTELLIGENCE_VERSION = "writing-intelligence-1.0" as const;
export const WRITING_RETRIEVAL_DATE = "2026-09-09";

export type WritingActorId = "chris-jones-ar02" | "french-hill-ar02";

export type WritingSourceType =
  | "SUBSTACK"
  | "OFFICIAL_NEWSLETTER"
  | "OFFICIAL_STATEMENT"
  | "SPEECH"
  | "INTERVIEW_TRANSCRIPT"
  | "SOCIAL_POST"
  | "CAMPAIGN_ARTICLE"
  | "OTHER";

export type WritingProvenance = "FIRST_PARTY" | "DISCOVERY_ONLY";

export type AuthorshipConfidence = "DIRECT_AUTHOR" | "OFFICIAL_OFFICE" | "ATTRIBUTED" | "UNCERTAIN";

export type RetrievalQuality = "FULL_PUBLIC" | "PARTIAL_PUBLIC" | "METADATA_ONLY";

export type IssueVoiceId =
  | "ECONOMIC"
  | "ATTACK_CONTRAST"
  | "BIPARTISAN"
  | "PERSONAL"
  | "FAITH_VALUES"
  | "POLICY_EXPLANATION"
  | "CRISIS"
  | "COMMUNITY"
  | "TECHNOLOGY"
  | "FUNDRAISING_CAMPAIGN"
  | "CALL_TO_ACTION";

export type TemporalWindowId = "ALL_TIME" | "LAST_24_MONTHS" | "LAST_12_MONTHS" | "LAST_90_DAYS";

export type EvidenceState = "OBSERVED" | "INFERRED" | "HYPOTHESIS";

export type WritingSource = {
  id: string;
  actorId: WritingActorId;
  canonicalUrl: string;
  title: string;
  publishedAt: string;
  sourceType: WritingSourceType;
  provenance: WritingProvenance;
  authorshipConfidence: AuthorshipConfidence;
  retrievalDate: string;
  topicTags: string[];
  wordCountEstimate: number;
  sourceFingerprint: string;
  retrievalQuality: RetrievalQuality;
  excerpt: string;
};

export type LinguisticFeatures = {
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  sentenceLengthVariance: number;
  avgParagraphLength: number;
  questionRate: number;
  imperativeRate: number;
  fragmentRate: number;
  listMarkerRate: number;
  shortPunchRate: number;
  repetitionRate: number;
  parallelRate: number;
  threePartRate: number;
  longSetupShortCloseRate: number;
};

export type RhetoricScores = {
  metaphor: number;
  analogy: number;
  anecdote: number;
  statistics: number;
  authority: number;
  moralFraming: number;
  personalNarrative: number;
  localExample: number;
  opponentContrast: number;
  rhetoricalQuestion: number;
  callToAction: number;
  optimismAfterDiagnosis: number;
  institutionalProcess: number;
};

export type StructureHits = {
  jonesArc: number;
  hillArc: number;
};

export type MotifHit = {
  motif: string;
  count: number;
};

export type DerivedWritingRecord = {
  source: WritingSource;
  issueVoices: IssueVoiceId[];
  features: LinguisticFeatures;
  rhetoric: RhetoricScores;
  structure: StructureHits;
  motifs: MotifHit[];
  lexical: {
    technical: number;
    religious: number;
    arkansas: number;
    political: number;
    abstraction: number;
  };
};

export type EvidenceBackedTrait = {
  label: string;
  value: string;
  sourceState: EvidenceState;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  evidenceSourceIds: string[];
  notes?: string;
};

export type ComparisonAxis = {
  id: string;
  label: string;
  score: number;
  methodology: string;
};

export type TemporalSlice = {
  window: TemporalWindowId;
  documentCount: number;
  newestSourceDate: string | null;
  oldestSourceDate: string | null;
  topThemes: string[];
  rhetoric: RhetoricScores;
};

export type ActorWritingIntelligence = {
  actorId: WritingActorId;
  version: string;
  generatedAt: string;
  documentCount: number;
  newestSourceDate: string | null;
  oldestSourceDate: string | null;
  authorship: Record<AuthorshipConfidence, number>;
  sourceTypes: Partial<Record<WritingSourceType, number>>;
  topThemes: string[];
  fingerprint: {
    lexicalNotes: string[];
    syntax: LinguisticFeatures;
    rhetoric: RhetoricScores;
    structure: StructureHits;
    motifs: Array<MotifHit & { share: number; recency: string }>;
  };
  issueVoices: Array<{
    id: IssueVoiceId;
    documentCount: number;
    share: number;
    rhetoric: RhetoricScores;
  }>;
  decisionTendencies: EvidenceBackedTrait[];
  temporal: TemporalSlice[];
  drift: {
    voiceDrift: string;
    issueDrift: string;
    rhetoricalDrift: string;
    partisanshipDrift: string;
    messagePriorityDrift: string;
  };
  comparison: ComparisonAxis[];
  uncertainty: string[];
  sources: WritingSource[];
  evidenceCounts: Record<EvidenceState, number>;
};

export type VoiceSimilarityScore = {
  voiceSimilarityScore: number;
  lexicalSimilarity: number;
  rhythmSimilarity: number;
  structuralSimilarity: number;
  rhetoricalSimilarity: number;
  issueStyleSimilarity: number;
  channelStyleSimilarity: number;
  methodology: string;
};

export type WritingPromptPacket = {
  actorId: string;
  lines: string[];
  sourceRefs: string[];
};
