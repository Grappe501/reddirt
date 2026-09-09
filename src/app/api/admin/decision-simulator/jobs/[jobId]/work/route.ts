import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  isDecisionSimWorkerAuthorized,
  kickDecisionSimulationWorker,
  processDecisionSimulationJobChunk,
} from "@/lib/agents/decision-simulation/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 26;

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const workerOk = isDecisionSimWorkerAuthorized(request);
  if (!workerOk) {
    const denied = await assertAdminApi();
    if (denied) return denied;
  }
  const { jobId } = await context.params;
  try {
    const result = await processDecisionSimulationJobChunk(jobId);
    if (!result.done && result.job) {
      const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || new URL(request.url).origin;
      await kickDecisionSimulationWorker(jobId, origin);
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Worker failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
