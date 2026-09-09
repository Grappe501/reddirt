export type VoteValue = "Yea" | "Nay" | "Present" | "Not Voting";
export type PartyPosition = "Yea" | "Nay" | "Split" | "Unknown";
export type TrumpPosition = "Support" | "Oppose" | "Neutral" | "Ambiguous" | "No documented position";
export type ClassificationConfidence = "high" | "medium" | "low";

export type VoteSource = {
  label: string;
  url: string;
  sourceType: string;
  primary?: boolean;
  publishedDate?: string;
};

export type VoteRecord = {
  congress: number;
  rollCall: number;
  date: string;
  measure: string;
  question?: string;
  issueArea?: string;
  hillVote: VoteValue;

  republicanYea: number;
  republicanNay: number;
  democratYea: number;
  democratNay: number;

  partyMajorityPosition: PartyPosition;
  democratMajorityPosition: PartyPosition;
  republicanUnityPct: number | null;
  democratUnityPct: number | null;
  partiesOpposed: boolean;
  highPartisanship: boolean;
  partisanshipScore: number | null;
  hillAlignedWithGop: boolean | null;
  partyBreak: boolean;

  trumpPosition: TrumpPosition;
  trumpAligned: boolean | null;
  trumpBreak: boolean;
  doubleBreak: boolean;
  highlyPartisanGopAlignment: boolean;
  highlyPartisanTrumpAlignment: boolean;
  highlyPartisanDoubleAlignment: boolean;

  classificationConfidence: ClassificationConfidence;
  trumpEvidenceSummary?: string;
  trumpEvidenceStatus?: "verified" | "provisional" | "ambiguous" | "rejected";
  trumpEvidenceSources?: VoteSource[];
  plainLanguageSummary?: string;
  notes?: string;
  sources: VoteSource[];
};
