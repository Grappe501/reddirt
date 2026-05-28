import fs from "node:fs";
import path from "node:path";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relPath), "utf8")) as T;
}

type EvidenceStatus =
  | "VERIFIED_FACT"
  | "REPORTED_CLAIM"
  | "INTERPRETATION"
  | "RESEARCH_QUESTION"
  | "NEEDS_REVIEW";

type SourceConfidence = "LOW" | "MEDIUM" | "HIGH";

type AuthoredWritingsFile = {
  generatedAt: string;
  items: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
    publisher: string;
    url: string;
    summary: string;
    themes: string[];
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  openGaps: string[];
};

type BackgroundDeepProfileFile = {
  generatedAt: string;
  education: {
    college: Array<{
      institution: string;
      credential: string;
      source: string;
      evidenceStatus: EvidenceStatus;
      sourceConfidence: SourceConfidence;
    }>;
    highSchool: Array<{
      status: string;
      notes: string;
      evidenceStatus: EvidenceStatus;
      sourceConfidence: SourceConfidence;
    }>;
  };
  communityAndCivicWork: Array<{
    topic: string;
    detail: string;
    sources: string[];
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  awardsAndRecognition: Array<{
    title: string;
    source: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  businessBackground: Array<{
    item: string;
    detail: string;
    source: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
};

type ManagementCapacityFile = {
  generatedAt: string;
  targetRole: string;
  capacitySignals: Array<{
    signal: string;
    evidence: string;
    sources: string[];
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    relevanceToSosOperations: "LOW" | "MEDIUM" | "HIGH";
  }>;
  questionsForFurtherValidation: string[];
};

type DebateArchiveFile = {
  generatedAt: string;
  kimHammerDirectDebateAssets: Array<{
    id: string;
    title: string;
    url: string;
    assetType: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  secretaryOfStateDebateArchive: Array<{
    id: string;
    title: string;
    url: string;
    participants?: string[];
    assetType: string;
    sourceConfidence: SourceConfidence;
    evidenceStatus: EvidenceStatus;
  }>;
  likelySosDebateQuestionThemes: string[];
  openGaps: string[];
};

type ResponseModelFile = {
  generatedAt: string;
  scenarios: Array<{
    theme: string;
    expectedHammerResponse: string;
    likelyEvidenceAnchor: string[];
    kellyResponsePath: string;
    bridgeLine: string;
    riskToAvoid: string;
  }>;
  evidenceStatus: EvidenceStatus;
  sourceConfidence: SourceConfidence;
};

type NetworkInfluenceFile = {
  generatedAt: string;
  clusters: Array<{
    id: string;
    label: string;
    description: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    nodes: string[];
    sources: string[];
  }>;
  openGaps: string[];
};

type LegislationPatternsFile = {
  generatedAt: string;
  patternLanes: Array<{
    id: string;
    label: string;
    description: string;
    supportingBillIds: string[];
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  narrativeUseGuidance: string[];
  openGaps: string[];
};

type Kh3VulnerabilityMatrixFile = {
  generatedAt: string;
  matrix: Array<{
    area: string;
    vulnerabilityType: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    emotionalPotency: number;
    mediaViability: number;
    suburbanResonance: number;
    ruralResonance: number;
    donorResonance: number;
    persuasionUtility: number;
  }>;
};

type NarrativeTestingFile = {
  generatedAt: string;
  frames: Array<{
    id: string;
    label: string;
    strongestEvidence: string[];
    weakPoints: string[];
    likelyRebuttal: string;
    defensiveCounter: string;
  }>;
};

type MediaStatementsArchiveFile = {
  generatedAt: string;
  entries: Array<{
    id: string;
    kind: string;
    title: string;
    date: string;
    source: string;
    url: string;
    notableStatement: string;
    consistencyRisk: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  openGaps: string[];
};

type CountyExposureMapFile = {
  generatedAt: string;
  countyExposure: Array<{
    segment: string;
    workingHypothesis: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
    priority: "LOW" | "MEDIUM" | "HIGH";
  }>;
  requiredDataToComplete: string[];
  note: string;
};

type ModernSosContrastFile = {
  generatedAt: string;
  contrastRows: Array<{
    hammerLane: string;
    kellyLane: string;
    useCase: string[];
  }>;
  guardrails: string[];
};

type RapidResponseAppendixFile = {
  generatedAt: string;
  evidenceLocker: Array<{
    id: string;
    category: string;
    asset: string;
    verificationStatus: string;
    sourceConfidence: SourceConfidence;
  }>;
  quoteVerificationRules: string[];
  pushbackPreparedness: string[];
};

type BillRelationshipGraphFile = {
  generatedAt: string;
  nodes: Array<{ id: string; type: string; label: string }>;
  edges: Array<{
    from: string;
    to: string;
    relationship: string;
    evidenceStatus: EvidenceStatus;
    sourceConfidence: SourceConfidence;
  }>;
  openGaps: string[];
};

type TimelineHeatmapFile = {
  generatedAt: string;
  periods: Array<{
    window: string;
    activityLevel: "LOW" | "MEDIUM" | "HIGH";
    notes: string;
    evidenceStatus: EvidenceStatus;
  }>;
  openGaps: string[];
};

type DirectDemocracyFile = {
  generatedAt: string;
  summary: string;
  lanes: Array<{
    lane: string;
    status: string;
    evidenceStatus: EvidenceStatus;
  }>;
  nextPassRequirements: string[];
};

type PublicDebateEvidenceBoardFile = {
  generatedAt: string;
  purpose: string;
  items: Array<{
    id: string;
    topic: string;
    claim: string;
    supportingEvidence: Array<{ summary: string; url: string }>;
    challengingEvidence: Array<{ summary: string; url: string }>;
    confidenceTier:
      | "TIER_1_PUBLIC_DEPLOYABLE"
      | "TIER_2_NEEDS_CORROBORATION"
      | "TIER_3_INTERNAL_ONLY"
      | "TIER_4_HIGH_CAUTION";
    confidenceScore: number;
    citationStatus: "CITED" | "PARTIAL" | "UNCITED";
    externalUseStatus:
      | "READY_WITH_CITATION"
      | "USE_WITH_CAUTION"
      | "INTERNAL_ONLY"
      | "DO_NOT_USE_EXTERNALLY";
    legalRisk: "LOW" | "MEDIUM" | "HIGH";
    humanReviewRequired: boolean;
  }>;
};

export function loadKimHammerKh3Workbench() {
  const kh2 = loadKimHammerKh2Workbench();

  const authoredWritings = readJson<AuthoredWritingsFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-authored-writings.json",
  );
  const deepProfile = readJson<BackgroundDeepProfileFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-background-deep-profile.json",
  );
  const managementCapacity = readJson<ManagementCapacityFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-management-capacity-assessment.json",
  );
  const debateArchive = readJson<DebateArchiveFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-debate-archive-index.json",
  );
  const responseModel = readJson<ResponseModelFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-response-model.json",
  );
  const networkInfluence = readJson<NetworkInfluenceFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-network-influence-map.json",
  );
  const legislationPatterns = readJson<LegislationPatternsFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-legislation-patterns.json",
  );
  const kh3Vulnerabilities = readJson<Kh3VulnerabilityMatrixFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-vulnerability-matrix.json",
  );
  const narrativeTesting = readJson<NarrativeTestingFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-narrative-testing.json",
  );
  const mediaStatementsArchive = readJson<MediaStatementsArchiveFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-media-statements-archive.json",
  );
  const countyExposureMap = readJson<CountyExposureMapFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-county-exposure-map.json",
  );
  const modernSosContrast = readJson<ModernSosContrastFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-modern-sos-contrast.json",
  );
  const rapidResponseAppendix = readJson<RapidResponseAppendixFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-rapid-response-appendix.json",
  );
  const billRelationshipGraph = readJson<BillRelationshipGraphFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-bill-relationship-graph.json",
  );
  const timelineHeatmap = readJson<TimelineHeatmapFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-timeline-heatmap.json",
  );
  const directDemocracyFile = readJson<DirectDemocracyFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-kh3-direct-democracy-file.json",
  );
  const publicDebateEvidenceBoard = readJson<PublicDebateEvidenceBoardFile>(
    "data/opposition/kim-hammer-profile/kim-hammer-public-debate-evidence-board.json",
  );

  const summary = {
    writingItems: authoredWritings.items.length,
    civicItems: deepProfile.communityAndCivicWork.length,
    managementSignals: managementCapacity.capacitySignals.length,
    debateAssets:
      debateArchive.kimHammerDirectDebateAssets.length +
      debateArchive.secretaryOfStateDebateArchive.length,
    networkClusters: networkInfluence.clusters.length,
    legislationPatterns: legislationPatterns.patternLanes.length,
    vulnerabilityRows: kh3Vulnerabilities.matrix.length,
    narrativeFrames: narrativeTesting.frames.length,
    mediaArchiveEntries: mediaStatementsArchive.entries.length,
    countyExposureSegments: countyExposureMap.countyExposure.length,
    contrastRows: modernSosContrast.contrastRows.length,
    rapidResponseAssets: rapidResponseAppendix.evidenceLocker.length,
    graphNodeCount: billRelationshipGraph.nodes.length,
    heatmapPeriods: timelineHeatmap.periods.length,
    publicDebateItems: publicDebateEvidenceBoard.items.length,
    publicReadyClaims: publicDebateEvidenceBoard.items.filter(
      (item) => item.externalUseStatus === "READY_WITH_CITATION",
    ).length,
    cautionClaims: publicDebateEvidenceBoard.items.filter(
      (item) => item.externalUseStatus !== "READY_WITH_CITATION",
    ).length,
    topOpenGaps: [
      ...authoredWritings.openGaps.slice(0, 2),
      ...networkInfluence.openGaps.slice(0, 2),
      ...legislationPatterns.openGaps.slice(0, 2),
      ...debateArchive.openGaps.slice(0, 2),
      ...managementCapacity.questionsForFurtherValidation.slice(0, 2),
    ],
  };

  return {
    kh2,
    authoredWritings,
    deepProfile,
    managementCapacity,
    debateArchive,
    responseModel,
    networkInfluence,
    legislationPatterns,
    kh3Vulnerabilities,
    narrativeTesting,
    mediaStatementsArchive,
    countyExposureMap,
    modernSosContrast,
    rapidResponseAppendix,
    billRelationshipGraph,
    timelineHeatmap,
    directDemocracyFile,
    publicDebateEvidenceBoard,
    summary,
  };
}

