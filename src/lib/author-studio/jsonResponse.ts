import { NextResponse } from "next/server";
import type { AuthorStudioPostResponse, AuthorStudioStructuredOutputKind } from "./types";

export function authorStudioJson(
  input: {
    ok: boolean;
    route: string;
    produces: AuthorStudioStructuredOutputKind | null;
    data: unknown;
    message?: string;
  },
  init?: { status?: number }
): NextResponse<AuthorStudioPostResponse> {
  const body: AuthorStudioPostResponse = {
    ok: input.ok,
    version: 1,
    route: input.route,
    produces: input.produces,
    data: input.data,
    ...(input.message != null ? { message: input.message } : {}),
  };
  return NextResponse.json(body, { status: init?.status ?? (input.ok ? 200 : 500) });
}
