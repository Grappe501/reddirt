import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { listSavedDecisionSimulationActors } from "@/lib/agents/decision-simulation/saved-actors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const actors = await listSavedDecisionSimulationActors();
  return NextResponse.json({
    ok: true,
    actors,
    generic: {
      id: "generic",
      name: "Generic model",
      version: "dashboard-generic-actor-1.0",
      badge: "HYPOTHESIS MODEL",
    },
  });
}
