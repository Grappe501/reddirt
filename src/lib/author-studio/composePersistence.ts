/**
 * Maps Author Studio compose POST fields to a single persistence intent.
 * Prefer `persistenceIntent` when set; otherwise infer from legacy `mode` / `applyToWorkItem`.
 *
 * - **preview** — return `draft_set` only; no `SocialContentItem` or `SocialContentDraft` writes.
 * - **apply_to_master** / **replace_master** — write `compose.master` to `SocialContentItem.bodyCopy` when `socialContentItemId` is present (same DB effect; messaging differs).
 * - **save_draft** — insert `SocialContentDraft` (alternate); does not set `SocialContentItem.bodyCopy`.
 * - **apply_to_master** / **replace_master** — update master + record an applied snapshot draft (`isApplied`); see `composeWorkItemWriteBack.ts`.
 */

export const COMPOSE_PERSISTENCE_INTENTS = [
  "preview",
  "apply_to_master",
  "replace_master",
  "save_draft",
] as const;

export type ComposePersistenceIntent = (typeof COMPOSE_PERSISTENCE_INTENTS)[number];

export function resolveComposePersistenceIntent(body: {
  persistenceIntent?: string | null;
  mode?: string | null;
  applyToWorkItem?: boolean | null;
}): ComposePersistenceIntent {
  const pi = body.persistenceIntent?.trim();
  if (
    pi === "preview" ||
    pi === "apply_to_master" ||
    pi === "replace_master" ||
    pi === "save_draft"
  ) {
    return pi;
  }
  if (body.mode === "preview") return "preview";
  if (body.applyToWorkItem === false) return "preview";
  if (body.mode === "apply") return "apply_to_master";
  return "apply_to_master";
}
