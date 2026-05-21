import "server-only";

import { appendWritingStyleObservation, type WritingStyleObservation } from "./writing-style-observations";
import type { WritingObservationMeta } from "./writing-observation-types";

export type { WritingObservationMeta } from "./writing-observation-types";

const MAX_SNIPPET = 80;

export function captureWritingObservation(meta: WritingObservationMeta): WritingStyleObservation {
  const source: WritingStyleObservation["source"] = meta.acceptedAsIs
    ? "accepted_edit"
    : meta.userEdited
      ? "accepted_edit"
      : "explicit_note";

  return appendWritingStyleObservation({
    source,
    field: meta.textType.slice(0, 48),
    audience: meta.audience?.slice(0, 32),
    note: [
      meta.role,
      meta.plainLanguageRequested ? "plain-language" : null,
      meta.shortened ? "shortened" : null,
      meta.expanded ? "expanded" : null,
      meta.toneChanged ? "tone-changed" : null,
    ]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 200),
    beforeSnippet: undefined,
    afterSnippet: meta.snippetHint ? meta.snippetHint.slice(0, MAX_SNIPPET) : undefined,
  });
}
