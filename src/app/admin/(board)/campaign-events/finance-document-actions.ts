"use server";

import { revalidatePath } from "next/cache";
import { appendGlobalUserObservation } from "@/lib/agents/user-intelligence/user-observations";
import { loadCalendarEventDrilldown, serializeCalendarRows } from "@/lib/campaign-events/load-campaign-calendar-events";
import { uploadFinanceDocument, setFinanceDocumentApproval } from "@/lib/campaign-events/finance/finance-document-store";

export async function uploadFinanceDocumentAction(formData: FormData) {
  const recordId = String(formData.get("recordId") ?? "");
  const file = formData.get("file");
  if (!recordId || !(file instanceof File)) throw new Error("Missing record or file");
  const loaded = await loadCalendarEventDrilldown(recordId);
  if (!loaded) throw new Error("Event not found");
  const [row] = serializeCalendarRows([loaded.row]);
  const bytes = Buffer.from(await file.arrayBuffer());
  const doc = await uploadFinanceDocument({
    eventRecordId: recordId,
    eventTitle: row.calendar.title,
    period: row.dateYmd.slice(0, 7),
    county: row.county ?? "",
    bytes,
    originalFilename: file.name,
    mimeType: file.type || "application/octet-stream",
    uploaderName: String(formData.get("uploaderName") ?? "Admin"),
    uploaderEmail: String(formData.get("uploaderEmail") ?? "admin@campaign.local"),
    caption: String(formData.get("caption") ?? ""),
  });
  appendGlobalUserObservation({
    event: "receipt_uploaded",
    actor: "admin",
    role: "campaign_manager",
    recordId,
    pathname: `/admin/campaign-events/${recordId}`,
  });
  revalidatePath(`/admin/campaign-events/${recordId}`);
  return { ok: true as const, document: doc };
}

export async function approveFinanceDocumentAction(documentId: string, actor = "admin") {
  const doc = await setFinanceDocumentApproval({ documentId, status: "approved", actor });
  revalidatePath(`/admin/campaign-events/${doc.eventRecordId}`);
  return { ok: true as const, document: doc };
}
