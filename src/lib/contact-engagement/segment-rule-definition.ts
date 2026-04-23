import { z } from "zod";

/**
 * Typed, storage-only shape for `CommsPlanAudienceSegment.ruleDefinitionJson`.
 * **Not evaluated** in CE-4; validated on write for safe future evaluation.
 */
export const segmentRuleConditionFieldSchema = z.string().min(1).max(120);

export const segmentRuleConditionSchema = z.object({
  field: segmentRuleConditionFieldSchema,
  operator: z.string().min(1).max(64),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  values: z.array(z.union([z.string(), z.number()])).optional(),
  source: z.string().max(120).optional(),
});

export const segmentRuleDefinitionSchema = z
  .object({
    version: z.string().min(1).max(32).default("1"),
    logic: z.enum(["AND", "OR"]),
    conditions: z.array(segmentRuleConditionSchema).max(200),
    notes: z.string().max(2000).optional(),
    labels: z.record(z.string().max(500)).optional(),
  })
  .strict();

export type SegmentRuleDefinitionV1 = z.infer<typeof segmentRuleDefinitionSchema>;

/** Default empty rule for static segments. */
export const emptyRuleDefinitionJson: Readonly<Record<string, never>> = Object.freeze({});

const MINIMAL_FOR_DYNAMIC = segmentRuleDefinitionSchema;

function isEmptyObject(x: unknown): boolean {
  return typeof x === "object" && x !== null && !Array.isArray(x) && Object.keys(x as object).length === 0;
}

/**
 * - **Dynamic:** must match `segmentRuleDefinitionSchema` (storage for future eval).
 * - **Static:** `{}` or optional small hint object (not evaluated); not required to be a full rule tree.
 */
export function parseRuleDefinitionForStorage(
  raw: unknown,
  options: { isDynamic: boolean }
): { ok: true; json: object } | { ok: false; error: string } {
  if (raw == null || isEmptyObject(raw)) {
    if (options.isDynamic) {
      return { ok: false, error: "Dynamic segments need a rule definition (at minimum version, logic, and a conditions array)." };
    }
    return { ok: true, json: {} };
  }
  if (options.isDynamic) {
    const p = MINIMAL_FOR_DYNAMIC.safeParse(raw);
    if (!p.success) {
      return { ok: false, error: p.error.issues[0]?.message ?? "Invalid rule definition." };
    }
    return { ok: true, json: p.data as object };
  }
  const asRecord = z.record(z.unknown()).safeParse(raw);
  if (!asRecord.success) {
    return { ok: false, error: "Static segment rule/hint JSON must be a single JSON object." };
  }
  const ser = JSON.stringify(asRecord.data);
  if (ser.length > 50_000) {
    return { ok: false, error: "Rule/hint JSON is too large." };
  }
  return { ok: true, json: asRecord.data as object };
}

export function isRuleDefinitionStructurallyValid(raw: unknown): boolean {
  if (raw == null) return true;
  return segmentRuleDefinitionSchema.safeParse(raw).success;
}
