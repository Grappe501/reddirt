import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { updateDiligenceEntry } from "@/lib/intelligence/v4/opponentDiligenceLogStore";
import type { OpponentDiligenceSubjectId } from "@/lib/intelligence/v4/opponentDiligenceRegistry";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  subjectId: z.enum(["kelly-grappe", "kim-hammer", "michael-packo"]),
  entryId: z.string().min(1),
  result: z.enum(["CLEAN", "HIT_REQUIRES_COUNSEL", "NOT_SEARCHED", "IN_PROGRESS"]).optional(),
  staffInitials: z.string().max(8).nullable().optional(),
  counselReviewed: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  debateStageLine: z.string().max(500).nullable().optional(),
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

  const { subjectId, entryId, ...patch } = parsed.data;
  const result = updateDiligenceEntry(subjectId as OpponentDiligenceSubjectId, entryId, patch);

  return Response.json(result, { status: result.ok ? 200 : 400 });
}
