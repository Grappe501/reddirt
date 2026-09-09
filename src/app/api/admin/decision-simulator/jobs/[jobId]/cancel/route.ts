import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { cancelDecisionSimulationJob } from "@/lib/agents/decision-simulation/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const { jobId } = await context.params;
  const job = await cancelDecisionSimulationJob(jobId);
  if (!job) return NextResponse.json({ ok: false, error: "Job not found." }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}
