import { after, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { retryFailedDecisionSimulationChunks } from "@/lib/agents/decision-simulation/jobs";
import { decisionSimWorkerOrigin, kickDecisionSimulationWorker } from "@/lib/agents/decision-simulation/worker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const { jobId } = await context.params;
  const job = await retryFailedDecisionSimulationChunks(jobId);
  if (!job) return NextResponse.json({ ok: false, error: "Job not found." }, { status: 404 });
  const origin = decisionSimWorkerOrigin(request);
  after(() => {
    void kickDecisionSimulationWorker(jobId, origin);
  });
  return NextResponse.json({ ok: true, job });
}
