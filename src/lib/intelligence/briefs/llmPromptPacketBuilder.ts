import type { ClassifiedClaim } from "./claimClassification";
import { classifyEvidencePacketClaims } from "./claimClassification";
import type { EvidencePacket } from "./evidencePacketTypes";
import { summarizeUnsupportedClaimRisk } from "./unsupportedClaimDetector";

export type LlmPromptClaimLedgerEntry = {
  claimText: string;
  classification: ClassifiedClaim["classification"];
  sourceAnchorIds: string[];
  publicUseRisk: ClassifiedClaim["publicUseRisk"];
  notes: string;
};

export type LlmPromptCitationMapEntry = {
  anchorId: string;
  label: string;
  usedByClaims: string[];
};

export type LlmPromptPacket = {
  packetId: string;
  evidencePacketId: string;
  briefId: string;
  briefType: string;
  systemInstructions: string[];
  evidenceBlock: string;
  claimLedgerPreview: LlmPromptClaimLedgerEntry[];
  citationMap: LlmPromptCitationMapEntry[];
  forbiddenBehaviors: string[];
  requiredOutputShape: string[];
  governanceHeader: string;
  publishabilityStatus: "NOT_PUBLISHABLE";
  reviewStatus: "PENDING_HUMAN_REVIEW";
};

export type LlmBriefDraftOutput = {
  draftTitle: string;
  internalBriefDraft: string;
  claimLedger: LlmPromptClaimLedgerEntry[];
  citationMap: LlmPromptCitationMapEntry[];
  unsupportedClaims: string[];
  researchGaps: string[];
  recommendedHumanReview: string[];
  publishabilityStatus: "NOT_PUBLISHABLE";
  reviewStatus: "PENDING_HUMAN_REVIEW";
  generationMode: "EVIDENCE_SYNTHESIS_ONLY" | "LLM_ASSISTED" | "LLM_DEFERRED";
};

const GOVERNANCE_HEADER =
  "INTERNAL DRAFT ONLY | NON_PUBLISHABLE | HUMAN_REVIEW_REQUIRED | NOT PUBLIC CONTENT";

const SYSTEM_INSTRUCTIONS = [
  "Use ONLY the evidence provided in this packet.",
  "Do NOT invent facts, names, dates, quotes, events, laws, bill numbers, or statistics.",
  "Do NOT write public-facing copy or recommend publishing.",
  "Mark weak claims as research gaps — do not state them as facts.",
  "Preserve citation placeholders and source anchor references.",
  "Produce internal campaign-use language only.",
  "Separate verified facts from inferences explicitly.",
  "Include confidence and risk warnings for every section.",
  "Output a claim ledger mapping each statement to VERIFIED, INFERRED, UNSUPPORTED, or NEEDS_REVIEW.",
];

const FORBIDDEN = [
  "Inventing quotes or attributions",
  "Adding opponent motives without RESEARCH_QUESTION tier",
  "Publishing or send recommendations",
  "County registration goals from planning proxies",
  "Public social posts or press-ready copy",
];

export function buildLlmPromptPacket(evidencePacket: EvidencePacket): LlmPromptPacket {
  const classified = classifyEvidencePacketClaims(evidencePacket);
  const risk = summarizeUnsupportedClaimRisk(evidencePacket);

  const claimLedgerPreview: LlmPromptClaimLedgerEntry[] = classified.map((c) => ({
    claimText: c.claimText,
    classification: c.classification,
    sourceAnchorIds: c.sourceAnchorIds,
    publicUseRisk: c.publicUseRisk,
    notes: c.reason,
  }));

  const citationMap: LlmPromptCitationMapEntry[] = evidencePacket.sourceAnchors.map((a) => ({
    anchorId: a.anchorId,
    label: a.label,
    usedByClaims: classified
      .filter((c) => c.sourceAnchorIds.some((id) => id.includes(a.label)))
      .map((c) => c.claimText.slice(0, 80)),
  }));

  const evidenceBlock = [
    `# Evidence packet: ${evidencePacket.title}`,
    `Subject: ${evidencePacket.subject}`,
    `Confidence: ${evidencePacket.confidenceScore}/100 · Risk: ${evidencePacket.riskLevel}`,
    "",
    "## Evidence summary",
    ...evidencePacket.evidenceSummary.map((line) => `- ${line}`),
    "",
    "## Verified claim candidates",
    ...evidencePacket.verifiedClaimCandidates.map((c) => `- ${c.claimText}`),
    "",
    "## Inferred / unverified candidates",
    ...evidencePacket.inferredClaimCandidates.map((c) => `- [${c.tierHint}] ${c.claimText}`),
    "",
    "## Research gaps",
    ...evidencePacket.researchGaps.map((g) => `- [${g.severity}] ${g.description}`),
    "",
    "## Unsupported claim warnings",
    ...risk.warnings.map((w) => `- ${w}`),
    "",
    "## Source anchors (required for any cited statement)",
    ...evidencePacket.sourceAnchors.map((a) => `- ${a.anchorId}: ${a.label}`),
  ].join("\n");

  return {
    packetId: `lpp-${evidencePacket.id}`,
    evidencePacketId: evidencePacket.id,
    briefId: evidencePacket.briefId,
    briefType: String(evidencePacket.briefType),
    systemInstructions: SYSTEM_INSTRUCTIONS,
    evidenceBlock,
    claimLedgerPreview,
    citationMap,
    forbiddenBehaviors: FORBIDDEN,
    requiredOutputShape: [
      "draftTitle",
      "internalBriefDraft",
      "claimLedger[]",
      "citationMap[]",
      "unsupportedClaims[]",
      "researchGaps[]",
      "recommendedHumanReview[]",
      "publishabilityStatus: NOT_PUBLISHABLE",
      "reviewStatus: PENDING_HUMAN_REVIEW",
    ],
    governanceHeader: GOVERNANCE_HEADER,
    publishabilityStatus: "NOT_PUBLISHABLE",
    reviewStatus: "PENDING_HUMAN_REVIEW",
  };
}

export function buildDeterministicDraftFromEvidence(
  evidencePacket: EvidencePacket,
  promptPacket: LlmPromptPacket,
): LlmBriefDraftOutput {
  const classified = classifyEvidencePacketClaims(evidencePacket);
  const unsupported = classified
    .filter((c) => c.classification === "UNSUPPORTED" || c.classification === "NEEDS_REVIEW")
    .map((c) => `${c.classification}: ${c.claimText}`);

  const internalBriefDraft = [
    GOVERNANCE_HEADER,
    "",
    `# ${evidencePacket.title} — Internal Draft (Evidence Synthesis)`,
    "",
    "## Situation summary",
    ...evidencePacket.evidenceSummary.map((line) => `- ${line}`),
    "",
    "## Verified facts (human review still required)",
    ...classified
      .filter((c) => c.classification === "VERIFIED")
      .slice(0, 8)
      .map((c) => `- ${c.claimText} [${c.sourceAnchorIds.join(", ") || "no anchor"}]`),
    "",
    "## Inferences (internal only — not public copy)",
    ...classified
      .filter((c) => c.classification === "INFERRED")
      .slice(0, 6)
      .map((c) => `- ${c.claimText}`),
    "",
    "## Research gaps",
    ...evidencePacket.researchGaps.map((g) => `- ${g.description}`),
    "",
    "## Risk warnings",
    ...evidencePacket.unsupportedClaimWarnings.map((w) => `- ${w}`),
    "",
    "## Operator next action",
    "Review claim ledger in LLM review queue. No promotion without human approval.",
    "",
    `Generation mode: EVIDENCE_SYNTHESIS_ONLY · Packet confidence ${evidencePacket.confidenceScore}/100`,
  ].join("\n");

  return {
    draftTitle: `${evidencePacket.title} — LLM Review Draft`,
    internalBriefDraft,
    claimLedger: promptPacket.claimLedgerPreview,
    citationMap: promptPacket.citationMap,
    unsupportedClaims: unsupported,
    researchGaps: evidencePacket.researchGaps.map((g) => g.description),
    recommendedHumanReview: evidencePacket.operatorInstructions,
    publishabilityStatus: "NOT_PUBLISHABLE",
    reviewStatus: "PENDING_HUMAN_REVIEW",
    generationMode: "EVIDENCE_SYNTHESIS_ONLY",
  };
}

export function buildLlmMessages(promptPacket: LlmPromptPacket): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system",
      content: [
        promptPacket.governanceHeader,
        "",
        ...promptPacket.systemInstructions.map((line) => `- ${line}`),
        "",
        "Forbidden:",
        ...promptPacket.forbiddenBehaviors.map((line) => `- ${line}`),
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        promptPacket.evidenceBlock,
        "",
        "Required JSON output fields:",
        ...promptPacket.requiredOutputShape.map((line) => `- ${line}`),
        "",
        "Respond with structured internal brief draft only. NOT public copy.",
      ].join("\n"),
    },
  ];
}
