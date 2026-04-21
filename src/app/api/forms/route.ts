import { NextResponse } from "next/server";
import { formSubmissionSchema } from "@/lib/forms/schemas";
import { formatZodErrors } from "@/lib/forms/validate";
import { persistFormSubmission } from "@/lib/forms/handlers";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { databaseUnavailableResponse, isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`forms:${ip}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = formSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", fields: formatZodErrors(parsed.error) },
      { status: 400 },
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, accepted: true }, { status: 200 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(databaseUnavailableResponse(), { status: 503 });
  }

  try {
    const result = await persistFormSubmission(parsed.data);
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "persist_failed" }, { status: 500 });
  }
}
