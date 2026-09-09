import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { listBuiltInPersonalities } from "@/lib/agents/decision-simulation/personality-catalog";
import { listSavedDecisionSimulationActors } from "@/lib/agents/decision-simulation/saved-actors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await assertAdminApi();
  if (denied) return denied;
  const saved = await listSavedDecisionSimulationActors();
  return NextResponse.json({
    ok: true,
    catalog: listBuiltInPersonalities().map((item) => ({
      id: item.id,
      name: item.name,
      office: item.office,
      version: item.version,
      badge: item.badge,
      evidenceQuality: item.evidenceQuality,
      uncertaintyLevel: item.uncertaintyLevel,
      sources: item.sources,
    })),
    saved,
    generic: {
      id: "generic",
      name: "Generic model",
      version: "dashboard-generic-actor-1.0",
      badge: "HYPOTHESIS MODEL",
    },
  });
}
