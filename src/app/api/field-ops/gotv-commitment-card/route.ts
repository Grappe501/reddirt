import { NextResponse } from "next/server";

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { gotvCommitmentCardSchema, persistGotvCommitmentCard } from "@/lib/field-ops/gotv-commitment-card";
import { formatZodErrors } from "@/lib/forms/validate";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`gotv-commit:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "rate_limited", retryAfterMs: rl.retryAfterMs }, { status: 429 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = gotvCommitmentCardSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation", fields: formatZodErrors(parsed.error) }, { status: 400 });
  }

  if (parsed.data.website) return NextResponse.json({ ok: true, accepted: true }, { status: 200 });

  const result = await persistGotvCommitmentCard(parsed.data);
  return NextResponse.json(result);
}
