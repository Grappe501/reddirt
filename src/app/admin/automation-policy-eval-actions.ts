"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";

const ECC_AUTOMATION = "/admin/workbench/email-command-center/automation";
const ECC_DAILY = "/admin/workbench/email-command-center/daily";

/**
 * EMAIL-AUTOMATION-POLICY-ACTIVATION-1.0 + EMAIL-AUTOMATION-POLICY-DETAILS-1.0 — refresh server-rendered policy evaluation (snapshot-derived).
 * `revalidatePath` only — does not start workers, send mail, mutate audiences/contacts, or run cron.
 */
export async function evaluateAutomationPoliciesNowAction(): Promise<void> {
  await requireAdminAction();
  revalidatePath(ECC_AUTOMATION);
  revalidatePath(ECC_DAILY);
  revalidatePath("/admin/workbench/email-command-center");
  redirect(`${ECC_AUTOMATION}?notice=policy_eval_refreshed`);
}
