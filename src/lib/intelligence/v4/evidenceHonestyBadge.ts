/**
 * Phase 15 P5 — Evidence honesty badge tiers for candidate-facing surfaces.
 */

export type EvidenceHonestyTier =
  | "verified"
  | "needs_review"
  | "human_review"
  | "non_publishable"
  | "reference_only"
  | "research_question"
  | "thin_evidence";

export type EvidenceHonestyBadge = {
  tier: EvidenceHonestyTier;
  label: string;
  kellyMessage: string;
  stageSafe: boolean;
};

const TIER_META: Record<
  EvidenceHonestyTier,
  { label: string; kellyMessage: string; stageSafe: boolean }
> = {
  verified: {
    label: "Verified",
    kellyMessage: "Ledger or source verified — still rehearse before any live adaptation.",
    stageSafe: true,
  },
  needs_review: {
    label: "Needs review",
    kellyMessage: "Staff is verifying — use research-question framing, not asserted facts.",
    stageSafe: false,
  },
  human_review: {
    label: "Human review",
    kellyMessage: "Quote or clip may be accurate but needs staff sign-off before stage.",
    stageSafe: false,
  },
  non_publishable: {
    label: "Not for stage",
    kellyMessage: "Internal draft only — never read aloud or cite as proof on stage.",
    stageSafe: false,
  },
  reference_only: {
    label: "Reference only",
    kellyMessage: "Context and pacing — not proof of opponent behavior.",
    stageSafe: false,
  },
  research_question: {
    label: "Research question",
    kellyMessage: "Cite statute pattern only — no numeric or video proof until verified.",
    stageSafe: false,
  },
  thin_evidence: {
    label: "Thin evidence",
    kellyMessage: "Archive gap or low confidence — do not imply we have video or data proof.",
    stageSafe: false,
  },
};

function badge(tier: EvidenceHonestyTier): EvidenceHonestyBadge {
  const meta = TIER_META[tier];
  return { tier, ...meta };
}

export function resolveEvidenceHonestyFromText(raw: string): EvidenceHonestyBadge {
  const text = raw.toUpperCase();
  if (text.includes("REFERENCE_ONLY") || text.includes("REFERENCE ONLY")) return badge("reference_only");
  if (text.includes("NON_PUBLISHABLE") || text.includes("NOT_PUBLISHABLE") || text.includes("INTERNAL_DRAFT")) {
    return badge("non_publishable");
  }
  if (text.includes("HUMAN_REVIEW") || text.includes("CLAIM_CHECK")) return badge("human_review");
  if (text.includes("NEEDS_RESEARCH") || text.includes("RESEARCH_QUESTION")) return badge("research_question");
  if (text.includes("THIN") || text.includes("LOW CONFIDENCE") || text.includes("NOT_SEARCHED")) {
    return badge("thin_evidence");
  }
  if (text.includes("NEEDS_REVIEW") || text.includes("VERIFY") || text.includes("INTERPRETATION")) {
    return badge("needs_review");
  }
  if (text === "OK" || text.startsWith("OK ") || text.includes("VERIFIED") || text.includes("APPROVED")) {
    return badge("verified");
  }
  return badge("needs_review");
}

export function resolveEvidenceHonestyFromSpeakerVerification(
  speakerVerification: string,
): EvidenceHonestyBadge {
  const v = speakerVerification.toUpperCase();
  if (v.includes("VERIFIED_FACT") || v.includes("VERIFIED_QUOTE")) return badge("human_review");
  if (v.includes("NEEDS") || v.includes("UNVERIFIED")) return badge("needs_review");
  return badge("thin_evidence");
}

export function resolveEvidenceHonestyFromConfidence(confidence: string): EvidenceHonestyBadge {
  if (confidence === "HIGH") return badge("human_review");
  if (confidence === "MEDIUM") return badge("needs_review");
  return badge("thin_evidence");
}

export const EVIDENCE_HONESTY_TIER_ORDER: EvidenceHonestyTier[] = [
  "verified",
  "human_review",
  "needs_review",
  "research_question",
  "reference_only",
  "non_publishable",
  "thin_evidence",
];
