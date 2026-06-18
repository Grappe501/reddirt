import { assertAdminApi } from "@/lib/admin/require-admin";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;
  return Response.json({ ok: true, record: loadForumTranscriptLab() });
}
