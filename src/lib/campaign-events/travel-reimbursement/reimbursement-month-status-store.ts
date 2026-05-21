import { createJsonRepository } from "@/lib/compliance/persistence/compliance-repository";

export type ReimbursementMonthStatusValue = "draft" | "needs_review" | "ready" | "finalized";

export type ReimbursementMonthStatusHistoryEntry = {
  at: string;
  by: string;
  action: "mark_ready" | "finalize" | "reopen_draft" | "auto_note";
  note?: string;
};

export type ReimbursementMonthStatusRecord = {
  status: ReimbursementMonthStatusValue;
  finalizedAt?: string;
  finalizedBy?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  updatedAt: string;
  history: ReimbursementMonthStatusHistoryEntry[];
};

export type ReimbursementStatusFile = {
  months: Record<string, ReimbursementMonthStatusRecord>;
};

const repo = createJsonRepository<ReimbursementStatusFile>("data/campaign-events/reimbursement-status.json", {
  months: {},
});

export async function loadReimbursementStatusFile(): Promise<ReimbursementStatusFile> {
  return repo.load();
}

export async function getReimbursementMonthRecord(month: string): Promise<ReimbursementMonthStatusRecord | null> {
  const file = await loadReimbursementStatusFile();
  return file.months[month] ?? null;
}

export async function saveReimbursementMonthRecord(
  month: string,
  record: ReimbursementMonthStatusRecord,
): Promise<void> {
  const file = await loadReimbursementStatusFile();
  file.months[month] = record;
  await repo.save(file);
}
