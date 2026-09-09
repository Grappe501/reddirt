import type { DecisionSimulationChannel } from "../contracts";
import { parseCorrespondencePaste } from "../correspondence-intake/parse";
import { clipEvidenceText } from "./clip";
import {
  EVIDENCE_PROVENANCE_VERSION,
  PRIOR_CORRESPONDENCE_EXCERPT_MAX,
  type PriorCorrespondenceAttachment,
} from "./contracts";

export function attachPriorCorrespondence(input: {
  paste: string;
  channel: DecisionSimulationChannel;
  title?: string;
  occurredAt?: string;
  sourceUrl?: string;
  actorId?: string;
  id?: string;
}): PriorCorrespondenceAttachment | null {
  const parsed = parseCorrespondencePaste(input.paste, input.channel);
  const excerpt = clipEvidenceText(parsed.body, PRIOR_CORRESPONDENCE_EXCERPT_MAX);
  if (!excerpt) return null;
  const title =
    input.title?.trim() ||
    parsed.fields.subject ||
    parsed.fields.re ||
    parsed.fields.headline ||
    parsed.fields.question ||
    `${input.channel} prior artifact`;
  return {
    id: input.id ?? `prior-corr-${Date.now()}`,
    version: EVIDENCE_PROVENANCE_VERSION,
    channel: input.channel,
    title,
    bodyExcerpt: excerpt,
    occurredAt: input.occurredAt?.trim() || parsed.fields.date || undefined,
    sourceUrl: input.sourceUrl?.trim() || undefined,
    actorId: input.actorId,
    provenance: "OPERATOR_ATTACHED",
    sourceState: "OBSERVED",
    connectorsEnabled: false,
  };
}

export function formatPriorCorrespondencePromptBlock(
  attachments?: Array<{
    channel: DecisionSimulationChannel;
    bodyExcerpt: string;
    occurredAt?: string;
    provenance: string;
  }>,
): string {
  if (!attachments?.length) return "";
  const rows = attachments.slice(0, 4).map((item) => {
    const when = item.occurredAt ?? "undated";
    return `${item.channel} ${when} [${item.provenance}]: ${item.bodyExcerpt}`;
  });
  return [
    `PRIOR CORRESPONDENCE (${EVIDENCE_PROVENANCE_VERSION}, OPERATOR_ATTACHED, n=${attachments.length}).`,
    "These are operator-pasted artifacts, not a mailbox fetch and not first-party writing corpus.",
    ...rows,
    attachments.length > 4 ? `${attachments.length - 4} additional attached artifacts were not expanded in this prompt.` : "",
    "Do not invent missing letters, recipients, or quotes. Do not send or post.",
  ]
    .filter(Boolean)
    .join("\n");
}
