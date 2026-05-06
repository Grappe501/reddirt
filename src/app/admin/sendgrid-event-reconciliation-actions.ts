"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import {
  reconcileRecentSendGridEvents,
  reconcileSendGridEvent,
} from "@/lib/email-command-center/sendgrid-event-reconciliation";

const ECC = "/admin/workbench/email-command-center";

function revalidateReconciliationSurfaces() {
  revalidatePath(`${ECC}/analytics`);
  revalidatePath(`${ECC}/sendgrid`);
  revalidatePath(`${ECC}/daily`);
  revalidatePath(`${ECC}/send-execution`);
  revalidatePath(ECC);
}

function trim(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function reconcileRecentSendGridEventsAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const limitRaw = trim(fd, "limit");
  const parsed = parseInt(limitRaw, 10);
  const limit = Number.isFinite(parsed) ? Math.min(120, Math.max(5, parsed)) : 40;
  const res = await reconcileRecentSendGridEvents(limit);
  revalidateReconciliationSurfaces();
  redirect(
    `${ECC}/analytics?reconcileNotice=${encodeURIComponent(
      `Reconciled batch: processed ${res.processed}, matched ${res.matched}, skipped ${res.skipped}, unmatched ${res.unmatched}, errors ${res.failed}.`,
    )}#reconciliation`,
  );
}

export async function reconcileSendGridEventAction(fd: FormData): Promise<void> {
  await requireAdminAction();
  const eventId = trim(fd, "eventId");
  if (!eventId) redirect(`${ECC}/analytics?error=${encodeURIComponent("Missing event id.")}#reconciliation`);
  const r = await reconcileSendGridEvent(eventId);
  revalidateReconciliationSurfaces();
  if (!r.ok) {
    redirect(`${ECC}/analytics?error=${encodeURIComponent(r.reason.slice(0, 200))}#reconciliation`);
  }
  redirect(
    `${ECC}/analytics?reconcileNotice=${encodeURIComponent(`Event ${eventId.slice(-8)} → ${r.outcome}`)}#reconciliation`,
  );
}
