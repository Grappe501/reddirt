/**
 * Shared Author Studio POST body shape (additive with legacy top-level fields).
 *
 * Client sends:
 * ```json
 * {
 *   "context": { "socialContentItemId"?: string, "campaignEventId"?: string, "workflowIntakeId"?: string },
 *   "intent"?: string,
 *   "input"?: { ... route-specific fields ... },
 *   "mode"?: "preview" | "apply"
 * }
 * ```
 * `mergeAuthorStudioV2WithLegacy` flattens this so existing Zod route schemas can validate
 * the same request after preprocess.
 */
import { z } from "zod";

export const authorStudioContextFieldSchema = z.object({
  socialContentItemId: z.string().min(1).optional(),
  campaignEventId: z.string().min(1).optional(),
  workflowIntakeId: z.string().min(1).optional(),
});

export type AuthorStudioContextField = z.infer<typeof authorStudioContextFieldSchema>;

export const authorStudioRequestModeSchema = z.enum(["preview", "apply"]).default("apply");

export type AuthorStudioRequestMode = z.infer<typeof authorStudioRequestModeSchema>;

export type AuthorStudioV2RequestBody = {
  context?: AuthorStudioContextField;
  intent?: string;
  input?: unknown;
  mode?: AuthorStudioRequestMode;
  /** @deprecated use context + input; still accepted for older clients */
  actionLabel?: string;
  stateSnapshot?: string;
};

const RESERVED_ROOT = new Set([
  "context",
  "input",
  "mode",
  "intent",
  "actionLabel",
  "stateSnapshot",
  "version",
]);

/**
 * Merges v2 `context` / `input` / top-level `intent` into a flat object for legacy Zod route schemas.
 * `input` values override existing keys when the same key exists at the root (route payload from UI lives in `input`).
 */
export function mergeAuthorStudioV2WithLegacy(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return raw;
  }
  const o = raw as Record<string, unknown>;
  const asPersistence = new Set([
    "preview",
    "apply_to_master",
    "replace_master",
    "save_draft",
    "save_alternate",
  ]);
  const rootIntentPersistence =
    typeof o.intent === "string" && asPersistence.has(o.intent.trim()) ? o.intent.trim() : null;

  const out: Record<string, unknown> = { ...o };

  const ctx = o.context;
  if (ctx != null && typeof ctx === "object" && !Array.isArray(ctx)) {
    const c = ctx as Record<string, unknown>;
    if (c.socialContentItemId != null) out.socialContentItemId = c.socialContentItemId;
    if (c.campaignEventId != null) out.campaignEventId = c.campaignEventId;
    if (c.workflowIntakeId != null) out.workflowIntakeId = c.workflowIntakeId;
  }

  if (o.input != null && typeof o.input === "object" && !Array.isArray(o.input)) {
    for (const [k, v] of Object.entries(o.input as Record<string, unknown>)) {
      out[k] = v;
    }
  }

  if (rootIntentPersistence != null && out.persistenceIntent == null) {
    out.persistenceIntent = rootIntentPersistence;
  }
  if (typeof out.intent === "string" && asPersistence.has(out.intent.trim())) {
    delete out.intent;
  }
  return out;
}

/** Strict typing helper for `input` in application code. */
export function isRecord(u: unknown): u is Record<string, unknown> {
  return u != null && typeof u === "object" && !Array.isArray(u);
}
