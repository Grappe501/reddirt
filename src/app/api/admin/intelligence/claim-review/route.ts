import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  approveClaimForInternalUse,
  approveClaimForPublicAdaptation,
  rejectClaim,
  requireMoreEvidence,
  submitClaimForReview,
  retireClaim,
} from "@/lib/intelligence/claims/claimReviewWorkflow";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  claimId: z.string().min(1),
  action: z.enum([
    "submit_review",
    "approve_internal",
    "approve_public_adaptation",
    "reject",
    "retire",
    "require_evidence",
  ]),
  notes: z.string().optional(),
  reviewer: z.string().min(1),
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

  const { claimId, action, notes = "", reviewer } = parsed.data;

  let result: { ok: true } | { ok: false; error: string };
  switch (action) {
    case "submit_review":
      result = submitClaimForReview(claimId, reviewer);
      break;
    case "approve_internal":
      result = approveClaimForInternalUse(claimId, reviewer, notes);
      break;
    case "approve_public_adaptation":
      result = approveClaimForPublicAdaptation(claimId, reviewer, notes);
      break;
    case "reject":
      result = rejectClaim(claimId, reviewer, notes);
      break;
    case "retire":
      result = retireClaim(claimId, reviewer, notes);
      break;
    case "require_evidence":
      result = requireMoreEvidence(claimId, reviewer, notes);
      break;
    default:
      result = { ok: false, error: "unknown action" };
  }

  return Response.json(result, { status: result.ok ? 200 : 400 });
}
