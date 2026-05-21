"use server";

import { revalidatePath } from "next/cache";
import { loadCalendarEventDrilldown } from "@/lib/campaign-events/load-campaign-calendar-events";
import {
  loadApprovalEmailContext,
  mapTokenLinksForPayload,
} from "@/lib/campaign-events/approval-email/load-approval-email-context";
import { sendApprovalPackageEmail } from "@/lib/campaign-events/approval-email/approval-email-send";
import { buildApprovalPackage, buildApprovalPackageWithLogs } from "@/lib/campaign-events/approval-package";
import { getApprovalEmailConfig } from "@/lib/campaign-events/approval-email/approval-email-config";
import { buildApprovalEmailBodies } from "@/lib/campaign-events/approval-email/approval-email-template";
import { buildApprovalEmailAssist } from "@/lib/campaign-events/approval-email/approval-email-assist";

function revalidateSurfaces(recordId: string) {
  revalidatePath("/admin/campaign-events/workbench");
  revalidatePath("/admin/campaign-events");
  revalidatePath(`/admin/campaign-events/${recordId}`);
  revalidatePath(`/admin/campaign-calendar/approval-package/${recordId}`);
  revalidatePath("/admin/candidate-dashboard");
  revalidatePath("/admin/campaign-manager-dashboard");
}

export async function loadApprovalPackageBundleAction(recordId: string) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) return { ok: false as const, error: "not_found" };
  const ctx = await loadApprovalEmailContext(recordId);
  const tokenLinks = mapTokenLinksForPayload(ctx);
  const payload = buildApprovalPackageWithLogs(loaded.row, ctx.logs, tokenLinks);
  return {
    ok: true as const,
    payload,
    emailContext: {
      config: {
        sendEnabled: ctx.config.sendEnabled,
        readyToSend: ctx.config.readyToSend,
        disabledReason: ctx.config.disabledReason,
        missingConfig: ctx.config.missingConfig,
        provider: ctx.config.provider,
        fromEmail: ctx.config.fromEmail,
        fromName: ctx.config.fromName,
        baseUrl: ctx.config.baseUrl,
      },
      logs: ctx.logs,
      lastLog: ctx.lastLog,
      tokenLinks,
    },
  };
}

export async function sendApprovalPackageEmailAction(
  recordId: string,
  options?: { testToSelf?: string },
) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) return { ok: false as const, error: "not_found" };
  const result = await sendApprovalPackageEmail({
    row: loaded.row,
    createdBy: options?.testToSelf ? "operator-test" : "admin",
    testToSelf: options?.testToSelf,
  });
  revalidateSurfaces(recordId);
  return { ok: true as const, result };
}

export async function previewApprovalEmailBodiesAction(recordId: string) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) return { ok: false as const, error: "not_found" };
  const config = getApprovalEmailConfig();
  const assist = buildApprovalEmailAssist(loaded.row);
  const payload = buildApprovalPackage(loaded.row);
  const placeholderLinks = {
    review: `${config.baseUrl}/campaign-events/approval/(token)`,
    approve: `${config.baseUrl}/campaign-events/approval/(token)`,
    hold: `${config.baseUrl}/campaign-events/approval/(token)`,
    deny: `${config.baseUrl}/campaign-events/approval/(token)`,
    requestInfo: `${config.baseUrl}/campaign-events/approval/(token)`,
  };
  const bodies = buildApprovalEmailBodies({ payload, assist, links: placeholderLinks });
  return {
    ok: true as const,
    subject: assist.subject,
    html: bodies.html,
    text: bodies.text,
    config: { readyToSend: config.readyToSend, disabledReason: config.disabledReason },
  };
}

export async function dryRunApprovalEmailAction(recordId: string) {
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) return { ok: false as const, error: "not_found" };
  const result = await sendApprovalPackageEmail({
    row: loaded.row,
    createdBy: "dry-run",
    dryRun: true,
  });
  return { ok: true as const, result };
}
