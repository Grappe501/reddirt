import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  appendSessionDebriefCapture,
  confirmPreStageChecklist,
} from "@/lib/intelligence/v4/phase16P4SessionDebriefState";

export const dynamic = "force-dynamic";

const captureSchema = z.object({
  action: z.literal("capture"),
  feltRisky: z.array(z.string().min(1).max(500)).max(10),
  staffFollowUps: z.array(z.string().min(1).max(500)).max(10),
  encounterHint: z.string().max(120).optional(),
});

const checklistIdSchema = z.enum([
  "claims-clear",
  "encounter-selected",
  "ipad-ready",
  "evidence-honesty",
  "safe-lines-reviewed",
]);

const checklistSchema = z.object({
  action: z.literal("confirm-checklist"),
  confirmedIds: z.array(checklistIdSchema).max(5),
});

const bodySchema = z.discriminatedUnion("action", [captureSchema, checklistSchema]);

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

  if (parsed.data.action === "confirm-checklist") {
    const state = confirmPreStageChecklist(parsed.data.confirmedIds);
    return Response.json({ ok: true, state });
  }

  const capture = appendSessionDebriefCapture({
    feltRisky: parsed.data.feltRisky,
    staffFollowUps: parsed.data.staffFollowUps,
    encounterHint: parsed.data.encounterHint,
  });

  return Response.json({ ok: true, capture });
}
