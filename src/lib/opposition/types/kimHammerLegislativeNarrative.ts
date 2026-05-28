/** KH-0B legislative narrative intelligence types — bills as strategic objects, not index rows. */

export type KimHammerLegislativeEvidenceStatus =
  | "VERIFIED_FACT"
  | "REPORTED_CLAIM"
  | "INTERPRETATION"
  | "NEEDS_REVIEW";

export type KimHammerLegislativeEvidenceTier =
  | "TIER_1_PUBLIC_DEPLOYABLE"
  | "TIER_2_NEEDS_CORROBORATION"
  | "TIER_3_INTERNAL_ONLY"
  | "NEEDS_REVIEW";

export type KimHammerLegislativePublicationRisk = "LOW" | "MEDIUM" | "HIGH";

export type KimHammerStrategicBriefing = {
  howToMessage: string[];
  debateImpact: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  oppositionSetup: string[];
  kellyMessageHelp: string[];
  campaignAlignment: {
    alignsWithKelly: string[];
    conflictsWithKelly: string[];
    neutralOrContextual: string[];
  };
};

export type KimHammerBillNarrativeIntelligence = {
  billNumber: string;
  actNumber?: string | null;
  sessionYear: string;
  packageId?: string;
  evidenceStatus: KimHammerLegislativeEvidenceStatus;
  plainEnglishSummary: string;
  billNarrative: string;
  countyImpactNarrative: string;
  operationalBurdenNarrative: string;
  courtRiskNarrative?: string;
  debateFrames: string[];
  counterArguments: string[];
  supporterArguments: string[];
  evidenceTier: KimHammerLegislativeEvidenceTier;
  publicationRisk: KimHammerLegislativePublicationRisk;
  strategicBriefing: KimHammerStrategicBriefing;
  sourceLinks: string[];
  governanceNotes: string[];
};

export type KimHammerLegislativeNarrativesFile = {
  generatedAt: string;
  narrativeVersion: string;
  governanceRule: string;
  bills: KimHammerBillNarrativeIntelligence[];
};

export type KimHammerIntegrityFoundationPackage = {
  generatedAt: string;
  packageId: string;
  title?: string;
  sessionYear: string;
  billNumbers: string[];
  actNumbers: Array<string | number>;
  evidenceStatus: KimHammerLegislativeEvidenceStatus | Record<string, string>;
  plainEnglishSummary: string;
  narrativeArc: string[];
  evolutionLink: {
    precedes: string[];
    followedBy: string[];
  };
  strategicBriefing: KimHammerStrategicBriefing | unknown;
  sourceLinks: Array<string | { billNumber: string; url: string; label: string }>;
  governanceNotes: string[];
};

export type KimHammerCountyBurdenActor = {
  id?: string;
  name?: string;
  role: string;
  authorityScope?: string;
  typicalPressurePoints?: string[];
  statutoryRelationship?: string;
  evidenceStatus?: KimHammerLegislativeEvidenceStatus;
};

export type KimHammerCountyBurdenTheme = {
  id?: string;
  themeId?: string;
  label?: string;
  description?: string;
  linkedBillNumbers?: string[];
  linkedBills?: string[];
  sessions?: string[];
  plainEnglish?: string;
  kellyContrastFrame: string;
  debateUse: string;
  evidenceStatus: KimHammerLegislativeEvidenceStatus;
};

export type KimHammerCountyAdministrationBurdenFile = {
  generatedAt: string;
  layerVersion: string;
  evidenceStatus?: KimHammerLegislativeEvidenceStatus | Record<string, string>;
  title?: string;
  doctrineLabel?: string;
  plainEnglishSummary?: string;
  doctrineSummary?: string[];
  actors: KimHammerCountyBurdenActor[];
  burdenThemes: KimHammerCountyBurdenTheme[];
  strategicBriefing: KimHammerStrategicBriefing | unknown;
  sourceLinks?: string[] | Array<{ billNumber: string; url: string; label: string }>;
  governanceNotes: string[];
};

export type KimHammerLegislativeChronologyYear = {
  year: string;
  office: "State Senate" | "State House" | "Unknown";
  primarySponsorCount: number;
  coSponsorCount: number;
  electionRelatedSponsorCount: number;
  enactedElectionBillNumbers: string[];
  narrativeSummary: string;
  evidenceStatus: KimHammerLegislativeEvidenceStatus;
  linkedPackageIds: string[];
};

export type KimHammerLegislativeChronologyFile = {
  generatedAt: string;
  subject: string;
  tenureNote: string;
  years: KimHammerLegislativeChronologyYear[];
  arcHeadline: string;
  arcParagraphs: string[];
  governanceNotes: string[];
};
