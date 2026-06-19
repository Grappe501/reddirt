import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";
import {
  getDebatePrepPackageProgressPayload,
  handleDebatePrepPackageProgressPost,
} from "@/lib/intelligence/v4/debatePrepPackageProgressRouteHandlers";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!(await requireElectionPlanApiSession())) {
    return Response.json({ ok: false, error: "session" }, { status: 401 });
  }
  return Response.json(getDebatePrepPackageProgressPayload());
}

export async function POST(req: Request): Promise<Response> {
  if (!(await requireElectionPlanApiSession())) {
    return Response.json({ ok: false, error: "session" }, { status: 401 });
  }
  return handleDebatePrepPackageProgressPost(req);
}
