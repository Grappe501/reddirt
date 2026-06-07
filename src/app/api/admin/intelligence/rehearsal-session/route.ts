import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { clearRehearsalSessionMemory } from "@/lib/intelligence/v4/phase16P6SessionMemoryState";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  action: z.literal("clear"),
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

  const state = clearRehearsalSessionMemory();
  return Response.json({ ok: true, state });
}
