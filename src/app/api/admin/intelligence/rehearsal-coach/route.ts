import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  assignRehearsalCoachEncounter,
  clearRehearsalCoachState,
  pinRehearsalCoachDrill,
  unpinRehearsalCoachDrill,
} from "@/lib/intelligence/v4/phase16P7RehearsalCoachState";
import {
  buildDrillPinHref,
  buildDrillPinLabel,
} from "@/lib/intelligence/v4/phase16P7StaffCoach";

export const dynamic = "force-dynamic";

const encounterIdSchema = z.enum(["debate-prep", "acca-panel", "clerk-meeting", "purchase-walkthrough"]);
const queueIdSchema = z.enum(["standard-tonight", "sos-speak-order", "trap-pivot"]);

const assignSchema = z.object({
  action: z.literal("assign-scenario"),
  encounterId: encounterIdSchema,
});

const pinSchema = z.object({
  action: z.literal("pin-drill"),
  queueId: queueIdSchema,
  cardNumber: z.number().int().min(1).max(12),
});

const unpinSchema = z.object({
  action: z.literal("unpin-drill"),
  pinId: z.string().uuid(),
});

const clearSchema = z.object({
  action: z.literal("clear"),
});

const bodySchema = z.discriminatedUnion("action", [assignSchema, pinSchema, unpinSchema, clearSchema]);

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

  switch (parsed.data.action) {
    case "assign-scenario": {
      const state = assignRehearsalCoachEncounter(parsed.data.encounterId);
      return Response.json({ ok: true, state });
    }
    case "pin-drill": {
      const { queueId, cardNumber } = parsed.data;
      const state = pinRehearsalCoachDrill({
        queueId,
        cardNumber,
        label: buildDrillPinLabel(queueId, cardNumber),
        href: buildDrillPinHref(queueId, cardNumber),
      });
      return Response.json({ ok: true, state });
    }
    case "unpin-drill": {
      const state = unpinRehearsalCoachDrill(parsed.data.pinId);
      return Response.json({ ok: true, state });
    }
    case "clear": {
      const state = clearRehearsalCoachState();
      return Response.json({ ok: true, state });
    }
  }
}
