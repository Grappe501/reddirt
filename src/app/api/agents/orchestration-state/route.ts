import { NextResponse } from "next/server";
import { buildOrchestrationStatePayload } from "@/lib/agents/orchestration/build-orchestration-payload";
import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";
import { USER_PERSONAS } from "@/lib/agents/user-intelligence/user-personas";

export const dynamic = "force-dynamic";

const VALID_ROLES = new Set<CampaignUserRole>(Object.keys(USER_PERSONAS) as CampaignUserRole[]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get("period") ?? "2026-04";
    const pathname = url.searchParams.get("pathname") ?? "/admin/ai-command-center";
    const roleParam = url.searchParams.get("role") ?? "campaign_manager";
    const role = VALID_ROLES.has(roleParam as CampaignUserRole)
      ? (roleParam as CampaignUserRole)
      : "campaign_manager";

    const payload = await buildOrchestrationStatePayload(period, { pathname, role });
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Orchestration state failed";
    return NextResponse.json(
      {
        ok: false,
        generatedAt: new Date().toISOString(),
        errors: [message],
        safety: {
          humanGateRequired: true,
          autoExecutionDisabled: true,
          restrictedActions: ["mass-email-send", "gcal-promote-without-approval", "finance-transaction-post", "voter-file-export", "autonomous-outreach"],
        },
      },
      { status: 200 },
    );
  }
}
