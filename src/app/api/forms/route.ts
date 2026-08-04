import { NextResponse } from "next/server";
import { formSubmissionSchema } from "@/lib/forms/schemas";
import { formatZodErrors } from "@/lib/forms/validate";
import { persistFormSubmission } from "@/lib/forms/handlers";
import { formCorsPreflight, withFormCors } from "@/lib/forms/cors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { databaseUnavailableResponse, isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: Request) {
  return formCorsPreflight(req);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`forms:${ip}`, 12, 60_000);
  if (!rl.ok) {
    return withFormCors(
      req,
      NextResponse.json(
        { ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs },
        { status: 429 },
      ),
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return withFormCors(req, NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 }));
  }

  const parsed = formSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    return withFormCors(
      req,
      NextResponse.json(
        { ok: false, error: "validation", fields: formatZodErrors(parsed.error) },
        { status: 400 },
      ),
    );
  }

  if (parsed.data.website) {
    return withFormCors(req, NextResponse.json({ ok: true, accepted: true }, { status: 200 }));
  }

  if (!isDatabaseConfigured()) {
    return withFormCors(req, NextResponse.json(databaseUnavailableResponse(), { status: 503 }));
  }

  try {
    const result = await persistFormSubmission(parsed.data);
    const res = NextResponse.json({
      ok: true,
      submissionId: result.submissionId,
      userId: result.userId,
      workflowIntakeId: result.workflowIntakeId,
      volunteerTeamSlug: result.volunteerTeamSlug ?? null,
    });
    if (result.volunteerTeamSlug && result.userId) {
      const { setTeamAccessCookieOnResponse } = await import("@/lib/volunteer-ops/team-access-cookie");
      setTeamAccessCookieOnResponse(res, { userId: result.userId, teamSlug: result.volunteerTeamSlug });
    }
    return withFormCors(req, res);
  } catch (e) {
    console.error(e);
    return withFormCors(req, NextResponse.json({ ok: false, error: "persist_failed" }, { status: 500 }));
  }
}
