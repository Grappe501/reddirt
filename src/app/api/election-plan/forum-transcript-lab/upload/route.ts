import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import { handleForumTranscriptLabPost } from "@/lib/intelligence/v4/forumTranscriptLabRouteHandlers";

export const dynamic = "force-dynamic";
/** Next.js requires a literal — Netlify/serverless cap. */
export const maxDuration = 120;

export async function POST(req: Request): Promise<Response> {
  if (!(await requireElectionPlanApiSession())) {
    return Response.json({ ok: false, error: "session" }, { status: 401 });
  }
  return handleForumTranscriptLabPost(req);
}
