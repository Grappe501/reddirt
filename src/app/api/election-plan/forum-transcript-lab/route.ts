import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { getForumTranscriptLabPayload } from "@/lib/intelligence/v4/forumTranscriptLabRouteHandlers";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!(await requireElectionPlanApiSession())) {
    return Response.json({ ok: false, error: "session" }, { status: 401 });
  }
  return Response.json(getForumTranscriptLabPayload());
}
