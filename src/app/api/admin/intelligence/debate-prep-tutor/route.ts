import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  getDebatePrepTutorPayload,
  handleDebatePrepTutorPost,
} from "@/lib/intelligence/v4/debatePrepTutorRouteHandlers";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

export async function GET() {
  const denied = await assertAdminApi();
  if (denied) return denied;
  return Response.json(getDebatePrepTutorPayload());
}

export async function POST(req: Request) {
  const denied = await assertAdminApi();
  if (denied) return denied;
  return handleDebatePrepTutorPost(req, {
    generatedForRoute: "/admin/intelligence/debate-prep-tutor",
  });
}
