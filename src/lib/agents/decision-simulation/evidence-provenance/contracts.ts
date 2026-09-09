import type { DecisionSimulationChannel } from "../contracts";
import type { WritingActorId } from "../writing-intelligence/contracts";

export const EVIDENCE_PROVENANCE_VERSION = "evidence-provenance-1.0" as const;
export const PRIOR_CORRESPONDENCE_LIBRARY_KEY = "dec-sim-prior-correspondence-1.0";
export const EVIDENCE_CLAIM_MAX = 220;
export const PRIOR_CORRESPONDENCE_EXCERPT_MAX = 280;

export type EvidenceProvenanceKind = "FIRST_PARTY" | "DISCOVERY_ONLY" | "OPERATOR_ATTACHED" | "MISSING";
export type EvidenceClaimSourceState = "OBSERVED" | "INFERRED" | "HYPOTHESIS";

export type EvidenceClaim = {
  id: string;
  actorId: string;
  claim: string;
  sourceState: EvidenceClaimSourceState;
  provenance: EvidenceProvenanceKind;
  sourceLabel: string;
  sourceUrl?: string;
  publishedAt?: string;
  topic: string;
  notes?: string;
};

export type PriorCorrespondenceAttachment = {
  id: string;
  version: typeof EVIDENCE_PROVENANCE_VERSION;
  channel: DecisionSimulationChannel;
  title: string;
  bodyExcerpt: string;
  occurredAt?: string;
  sourceUrl?: string;
  actorId?: string;
  provenance: "OPERATOR_ATTACHED";
  sourceState: "OBSERVED";
  connectorsEnabled: false;
};

export type EvidenceProvenanceSnapshot = {
  version: typeof EVIDENCE_PROVENANCE_VERSION;
  actorId: string;
  claimCount: number;
  attachedCount: number;
  missingCount: number;
  claims: EvidenceClaim[];
  attachments: PriorCorrespondenceAttachment[];
  missing: string[];
};

export type ResearchedActorId = Extract<WritingActorId, "chris-jones-ar02" | "french-hill-ar02">;
