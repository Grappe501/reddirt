import { NextResponse } from "next/server";
import {
  buildOrchestrationErrorPayload,
  buildOrchestrationStatePayload,
} from "@/lib/agents/orchestration/build-orchestration-payload";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import { USER_PERSONAS } from "@/lib/agents/user-intelligence/user-personas";

export const dynamic = "force-dynamic";

const VALID_ROLES = new Set<CampaignUserRole>(Object.keys(USER_PERSONAS) as CampaignUserRole[]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "2026-04";
  const pathname = url.searchParams.get("pathname") ?? "/admin/orchestration";
  const roleParam = url.searchParams.get("role") ?? "campaign_manager";
  const role = VALID_ROLES.has(roleParam as CampaignUserRole)
    ? (roleParam as CampaignUserRole)
    : "campaign_manager";

  try {
    const payload = await buildOrchestrationStatePayload(period, { pathname, role });
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Orchestration state failed";
    const payload = buildOrchestrationErrorPayload(message, { period, role, pathname });
    return NextResponse.json(payload, { status: 200 });
  }
}
