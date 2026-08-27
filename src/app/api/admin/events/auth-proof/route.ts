import { PERMISSIONS } from "@/lib/event-pm/auth/permissions";
import { authErrorResponse, logEventPmAudit, requireEventPmPermission } from "@/lib/event-pm/auth/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await requireEventPmPermission(PERMISSIONS.EVENT_VIEW_ALL);
    return Response.json({
      ok: true,
      actor: {
        userId: actor.userId,
        email: actor.email,
        role: actor.role,
        campaignKey: actor.campaignKey,
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST() {
  try {
    const actor = await requireEventPmPermission(PERMISSIONS.EVENT_PROJECT_UPDATE);
    const auditId = await logEventPmAudit(actor, {
      action: "event_pm.auth_proof",
      entityType: "event_project_manager",
      entityId: null,
      metadata: { slice: "P0-S5", proof: "authorized mutation + audit attribution" },
    });
    return Response.json({ ok: true, auditId });
  } catch (error) {
    return authErrorResponse(error);
  }
}
