import { z } from "zod";
import { authorStudioJson } from "./jsonResponse";
import { parseAuthorStudioData } from "./outputSchemas";
import type { AuthorStudioStructuredOutputKind } from "./types";

export function authorStudioValidationError(route: string, err: z.ZodError) {
  return authorStudioJson(
    {
      ok: false,
      route,
      produces: null,
      data: null,
      message: err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") || "Invalid request",
    },
    { status: 400 }
  );
}

/**
 * Enforces the `produces` + structured `data` contract on success responses.
 */
export function authorStudioSuccess(
  route: string,
  produces: AuthorStudioStructuredOutputKind,
  data: unknown,
  message?: string
) {
  const p = parseAuthorStudioData(produces, data);
  if (!p.success) {
    return authorStudioJson(
      {
        ok: false,
        route,
        produces,
        data: null,
        message: p.error.issues.map((i) => i.message).join("; ") || "Response schema mismatch",
      },
      { status: 500 }
    );
  }
  return authorStudioJson({ ok: true, route, produces, data: p.data, ...(message != null ? { message } : {}) });
}

export function authorStudioServerError(route: string, e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  return authorStudioJson({ ok: false, route, produces: null, data: null, message: msg }, { status: 500 });
}

/** Contract-shaped failure (e.g. missing required context for apply). */
export function authorStudioRequestError(route: string, message: string, status = 400) {
  return authorStudioJson({ ok: false, route, produces: null, data: null, message }, { status });
}
