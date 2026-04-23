/**
 * Text preview for interpretation context (E-2B+).
 * Cost note: `CommunicationMessage.bodyText` is still read in full from Postgres when selected;
 * we only *store* a bounded preview in memory for heuristics/composer. A future hardening is a
 * targeted query (e.g. `LEFT("bodyText", n)` via `$queryRaw`) for hot paths — see `context.ts` TODO.
 */
export const MESSAGE_BODY_PREVIEW_MAX_CHARS = 500;

/**
 * Truncate user-facing preview (single place for all interpretation pipelines).
 */
export function clampMessageBodyPreview(raw: string | null | undefined, max = MESSAGE_BODY_PREVIEW_MAX_CHARS): string | null {
  if (raw == null) return null;
  const t = String(raw);
  if (!t.length) return null;
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
