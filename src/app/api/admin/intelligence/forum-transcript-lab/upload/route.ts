import { assertAdminApi } from "@/lib/admin/require-admin";
import { handleForumTranscriptLabPost } from "@/lib/intelligence/v4/forumTranscriptLabRouteHandlers";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;
  return handleForumTranscriptLabPost(req);
}
