import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import {
  getDebatePrepTutorPayload,
  handleDebatePrepTutorPost,
} from "@/lib/intelligence/v4/debatePrepTutorRouteHandlers";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function GET() {
  if (!(await requireElectionPlanApiSession())) {
    return Response.json({ ok: false, error: "session" }, { status: 401 });
  }
  return Response.json(getDebatePrepTutorPayload());
}

export async function POST(req: Request) {
  if (!(await requireElectionPlanApiSession())) {
    return Response.json({ ok: false, error: "session" }, { status: 401 });
  }
  return handleDebatePrepTutorPost(req, {
    generatedForRoute: "/election-plan/debate-prep/tutor",
    rateLimitKey: "election-plan-debate-prep-tutor",
  });
}
