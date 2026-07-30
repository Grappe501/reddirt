/**
 * Public submission intake audit — WorkflowAction on create path.
 */

import { WorkflowActionKind, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ConsentWriteSummary } from "@/lib/forms/public-form-consent";

export async function recordPublicFormWorkflowAction(params: {
  workflowIntakeId: string;
  formType: string;
  sourcePage?: string | null;
  sourceComponent?: string | null;
  sourceCampaign?: string | null;
  interestKeys?: string[];
  consentSummary?: ConsentWriteSummary | null;
  result?: string;
}): Promise<string> {
  const metadata: Prisma.InputJsonValue = {
    actorType: "public_visitor_system_intake",
    formType: params.formType,
    sourcePage: params.sourcePage ?? null,
    sourceComponent: params.sourceComponent ?? null,
    sourceCampaign: params.sourceCampaign ?? null,
    interestKeys: (params.interestKeys ?? []).slice(0, 40),
    consent: params.consentSummary
      ? {
          email: params.consentSummary.email,
          sms: params.consentSummary.sms,
          phoneNoted: params.consentSummary.phoneNoted,
        }
      : null,
    result: params.result ?? "created",
  };

  const action = await prisma.workflowAction.create({
    data: {
      workflowIntakeId: params.workflowIntakeId,
      actorUserId: null,
      kind: WorkflowActionKind.OTHER,
      summary: `Public ${params.formType} submission received`,
      metadata,
    },
    select: { id: true },
  });

  return action.id;
}
