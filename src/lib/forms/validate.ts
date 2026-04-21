import { ZodError, type ZodSchema } from "zod";

export type FieldErrors = Record<string, string>;

export function formatZodErrors(err: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_form";
    if (!out[path]) out[path] = issue.message;
  }
  return out;
}

export function safeParseJson<T>(schema: ZodSchema<T>, data: unknown) {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true as const, data: r.data };
  return { ok: false as const, errors: formatZodErrors(r.error) };
}
