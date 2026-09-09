import { getCampaignPrioritySnapshot } from "../campaign-priorities";
import { getMediaClips } from "../media-research";
import { hillLegislativeCorpusIsMissing } from "../vote-intelligence/dashboard";
import { clipEvidenceText } from "./clip";
import {
  EVIDENCE_CLAIM_MAX,
  EVIDENCE_PROVENANCE_VERSION,
  type EvidenceClaim,
  type EvidenceProvenanceSnapshot,
  type PriorCorrespondenceAttachment,
} from "./contracts";

const MISSING = [
  "Hill roll-call corpus is MISSING. No vote totals are claimed.",
  "Democrat-Gazette paywall text and broadcast transcripts were not stored.",
  "Prior correspondence exists only when an operator attaches a paste. No mailbox connector.",
  "A generated six-move sequence is not evidence about a real person.",
];

function researched(actorId?: string): actorId is "chris-jones-ar02" | "french-hill-ar02" {
  return actorId === "chris-jones-ar02" || actorId === "french-hill-ar02";
}

function catalogClaims(actorId: "chris-jones-ar02" | "french-hill-ar02"): EvidenceClaim[] {
  const priorities = getCampaignPrioritySnapshot(actorId)?.priorities ?? [];
  const campaign = priorities.map((priority) => ({
    id: `claim-${actorId}-${priority.id}`,
    actorId,
    claim: clipEvidenceText(`${priority.label}: ${priority.summary}`, EVIDENCE_CLAIM_MAX),
    sourceState: "OBSERVED" as const,
    provenance: "FIRST_PARTY" as const,
    sourceLabel: priority.sourceTitle,
    sourceUrl: priority.sourceUrl,
    publishedAt: "2026-09-09",
    topic: priority.label,
    notes: "Living campaign page. ATTRIBUTED office/campaign voice.",
  }));

  const media = getMediaClips(actorId).map((clip) => ({
    id: `claim-${clip.id}`,
    actorId,
    claim: clipEvidenceText(clip.quote, EVIDENCE_CLAIM_MAX),
    sourceState: (clip.quoteKind === "PARAPHRASE" ? "INFERRED" : "OBSERVED") as EvidenceClaim["sourceState"],
    provenance: "DISCOVERY_ONLY" as const,
    sourceLabel: clip.outlet,
    sourceUrl: clip.url,
    publishedAt: clip.publishedAt,
    topic: clip.topics[0] ?? "MEDIA",
    notes: clip.notes,
  }));

  const votes =
    actorId === "french-hill-ar02" && hillLegislativeCorpusIsMissing(actorId)
      ? [
          {
            id: "claim-hill-votes-missing",
            actorId,
            claim: "Hill roll-call metrics are unknown until a first-party vote corpus is attached.",
            sourceState: "HYPOTHESIS" as const,
            provenance: "MISSING" as const,
            sourceLabel: "Vote-tracker directory not located",
            topic: "LEGISLATIVE_RECORD",
            notes: "Missing stays missing. Do not invent a vote.",
          },
        ]
      : [];

  return [...campaign, ...media, ...votes];
}

function attachmentClaims(attachments: PriorCorrespondenceAttachment[], actorId: string): EvidenceClaim[] {
  return attachments
    .filter((item) => !item.actorId || item.actorId === actorId)
    .map((item) => ({
      id: `claim-${item.id}`,
      actorId: item.actorId ?? actorId,
      claim: clipEvidenceText(item.bodyExcerpt, EVIDENCE_CLAIM_MAX),
      sourceState: item.sourceState,
      provenance: item.provenance,
      sourceLabel: item.title,
      sourceUrl: item.sourceUrl,
      publishedAt: item.occurredAt,
      topic: item.channel,
      notes: "Operator-attached paste. Not a mailbox fetch.",
    }));
}

export function getEvidenceProvenanceSnapshot(
  actorId?: string,
  attachments: PriorCorrespondenceAttachment[] = [],
): EvidenceProvenanceSnapshot | null {
  if (!researched(actorId) && attachments.length === 0) return null;
  const id = actorId && researched(actorId) ? actorId : actorId || "unattributed";
  const claims = [...(researched(actorId) ? catalogClaims(actorId) : []), ...attachmentClaims(attachments, id)];
  return {
    version: EVIDENCE_PROVENANCE_VERSION,
    actorId: id,
    claimCount: claims.length,
    attachedCount: attachments.filter((item) => !item.actorId || item.actorId === id).length,
    missingCount: claims.filter((item) => item.provenance === "MISSING").length,
    claims,
    attachments: attachments.filter((item) => !item.actorId || item.actorId === id),
    missing: MISSING,
  };
}

export function formatEvidenceProvenancePromptLine(
  actorId?: string,
  attachments: PriorCorrespondenceAttachment[] = [],
  writingSourceIds: string[] = [],
): string {
  const snap = getEvidenceProvenanceSnapshot(actorId, attachments);
  if (!snap) return "";
  const counts = {
    FIRST_PARTY: 0,
    DISCOVERY_ONLY: 0,
    OPERATOR_ATTACHED: 0,
    MISSING: 0,
  };
  for (const claim of snap.claims) counts[claim.provenance] += 1;
  const refs = writingSourceIds.slice(0, 6).join(", ");
  return `Provenance ${EVIDENCE_PROVENANCE_VERSION}: FIRST_PARTY=${counts.FIRST_PARTY} DISCOVERY_ONLY=${counts.DISCOVERY_ONLY} ATTACHED=${counts.OPERATOR_ATTACHED} MISSING=${counts.MISSING}. Evidence refs: ${refs || "none"}. Missing stays missing. Claims are not generated language.`;
}
