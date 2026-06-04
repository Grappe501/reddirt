import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { appendKellySuggestion } from "@/lib/legislature/videoArchiveRoomManifest";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  text: z.string().min(3).max(4000),
  category: z.enum(["opening", "closing", "rebuttal", "coaching", "other"]),
  createdBy: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const row = appendKellySuggestion(parsed.data.text, parsed.data.category, parsed.data.createdBy);
  return Response.json({ ok: true, row });
}
