import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { persistObservedOutcomeOnJob } from "@/lib/agents/decision-simulation/jobs";
import type { OutcomeCompareInput } from "@/lib/agents/decision-simulation/observed-outcome/contracts";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const ip = clientIp(request);
  const rl = rateLimit(`decision-simulator-outcome:${ip}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many outcome attachments. Try again shortly.", retryAfterMs: rl.retryAfterMs },
      { status: 429 },
    );
  }

  const { jobId } = await context.params;
  const body = (await request.json()) as OutcomeCompareInput;
  if (!body.actualResponse?.trim()) {
    return NextResponse.json({ ok: false, error: "Observed public response is required." }, { status: 400 });
  }
  if (!body.closestFuture?.trim()) {
    return NextResponse.json({ ok: false, error: "Closest future is required." }, { status: 400 });
  }

  const saved = await persistObservedOutcomeOnJob(jobId, {
    actualResponse: body.actualResponse,
    closestFuture: body.closestFuture,
    observedFrame: body.observedFrame,
    notes: body.notes,
    actorId: body.actorId,
    branches: Array.isArray(body.branches) ? body.branches : [],
  });
  if (!saved.ok) return NextResponse.json(saved, { status: saved.status });
  return NextResponse.json({ ok: true, job: saved.job });
}
