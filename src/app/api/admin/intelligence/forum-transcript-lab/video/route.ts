import { assertAdminApi } from "@/lib/admin/require-admin";
import { loadForumTranscriptLab } from "@/lib/intelligence/v4/forumTranscriptLab";
import { resolveForumLocalVideoAbsolute } from "@/lib/intelligence/v4/forumLocalVideoPath";
import { streamLocalVideoFile } from "@/lib/intelligence/v4/streamLocalVideoFile";

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const record = loadForumTranscriptLab();
  const abs = resolveForumLocalVideoAbsolute(record);
  if (!abs) {
    return new Response("No local forum video on disk", { status: 404 });
  }

  return streamLocalVideoFile(abs, req);
}
