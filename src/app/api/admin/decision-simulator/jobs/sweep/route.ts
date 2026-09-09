import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  decisionSimWorkerOrigin,
  isDecisionSimWorkerAuthorized,
  sweepActiveDecisionSimulationWorkers,
} from "@/lib/agents/decision-simulation/worker";
import { isDecisionSimSite } from "@/lib/site/decision-sim-site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function POST(request: Request) {
  if (!isDecisionSimSite()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "not-dec-sim-site" });
  }
  const workerOk = isDecisionSimWorkerAuthorized(request);
  if (!workerOk) {
    const denied = await assertAdminApi();
    if (denied) return denied;
  }
  const sweep = await sweepActiveDecisionSimulationWorkers(decisionSimWorkerOrigin(request));
  return NextResponse.json({ ok: true, ...sweep });
}
