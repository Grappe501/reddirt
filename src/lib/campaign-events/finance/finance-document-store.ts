import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import type { FinanceDocumentIndex, FinanceDocumentRecord, FinanceDocumentType } from "./finance-document-types";

const INDEX_REL = "data/campaign-events/finance/finance-documents-index.json";
const ROOT_REL = "data/campaign-events/finance";

function indexPath(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), INDEX_REL);
}

function financeRoot(repoRoot?: string) {
  return path.join(repoRoot ?? process.cwd(), ROOT_REL);
}

export function newFinanceDocumentId(): string {
  return `fin-${Date.now()}-${randomBytes(4).toString("hex")}`;
}

export function classifyFinanceDocument(filename: string, mime: string): FinanceDocumentType {
  const n = filename.toLowerCase();
  if (/hotel|lodging/.test(n)) return "hotel_confirmation";
  if (/fuel|gas/.test(n)) return "fuel_receipt";
  if (/invoice/.test(n)) return "invoice";
  if (/reimburse/.test(n)) return "reimbursement_form";
  if (/memo/.test(n)) return "expense_memo";
  if (mime.startsWith("image/") || /receipt/.test(n)) return "receipt";
  return "other";
}

async function loadIndex(repoRoot?: string): Promise<FinanceDocumentIndex> {
  const p = indexPath(repoRoot);
  if (!existsSync(p)) return { version: 1, items: [] };
  try {
    const raw = JSON.parse(await readFile(p, "utf8")) as FinanceDocumentIndex;
    return raw?.version === 1 && Array.isArray(raw.items) ? raw : { version: 1, items: [] };
  } catch {
    return { version: 1, items: [] };
  }
}

async function saveIndex(index: FinanceDocumentIndex, repoRoot?: string) {
  const p = indexPath(repoRoot);
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(index, null, 2), "utf8");
}

export async function listFinanceDocumentsForEvent(eventRecordId: string): Promise<FinanceDocumentRecord[]> {
  const index = await loadIndex();
  return index.items.filter((i) => i.eventRecordId === eventRecordId);
}

export async function listFinanceDocumentsForMonth(period: string): Promise<FinanceDocumentRecord[]> {
  const index = await loadIndex();
  return index.items.filter((i) => i.period === period);
}

export async function getFinanceDocumentById(id: string): Promise<FinanceDocumentRecord | null> {
  const index = await loadIndex();
  return index.items.find((i) => i.id === id) ?? null;
}

export async function upsertFinanceDocument(record: FinanceDocumentRecord): Promise<void> {
  const index = await loadIndex();
  const idx = index.items.findIndex((i) => i.id === record.id);
  if (idx >= 0) index.items[idx] = record;
  else index.items.push(record);
  await saveIndex(index);
}

export async function uploadFinanceDocument(input: {
  eventRecordId: string;
  eventTitle: string;
  period: string;
  county: string;
  bytes: Buffer;
  originalFilename: string;
  mimeType: string;
  uploaderName: string;
  uploaderEmail: string;
  documentType?: FinanceDocumentType;
  caption?: string;
}): Promise<FinanceDocumentRecord> {
  const id = newFinanceDocumentId();
  const safeName = `${id}-${input.originalFilename.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(0, 80)}`;
  const relDir = path.join(input.period, input.eventRecordId, "pending");
  const absDir = path.join(financeRoot(), relDir);
  await mkdir(absDir, { recursive: true });
  const relPath = path.join(relDir, safeName).replace(/\\/g, "/");
  await writeFile(path.join(financeRoot(), relPath), input.bytes);

  const now = new Date().toISOString();
  const record: FinanceDocumentRecord = {
    id,
    documentType: input.documentType ?? classifyFinanceDocument(input.originalFilename, input.mimeType),
    eventRecordId: input.eventRecordId,
    eventTitle: input.eventTitle,
    period: input.period,
    county: input.county || "—",
    uploaderName: input.uploaderName.trim() || "Admin",
    uploaderEmail: input.uploaderEmail.trim() || "admin@campaign.local",
    originalFilename: input.originalFilename,
    storedPath: relPath,
    mimeType: input.mimeType || "application/octet-stream",
    approvalStatus: "pending",
    reimbursementStatus: "not_linked",
    caption: input.caption?.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await upsertFinanceDocument(record);
  return record;
}

export async function setFinanceDocumentApproval(input: {
  documentId: string;
  status: FinanceDocumentRecord["approvalStatus"];
  actor: string;
}): Promise<FinanceDocumentRecord> {
  const existing = await getFinanceDocumentById(input.documentId);
  if (!existing) throw new Error("Finance document not found.");
  const now = new Date().toISOString();
  let storedPath = existing.storedPath;
  if (input.status === "approved") {
    const filename = path.basename(existing.storedPath);
    const approvedRel = path.join(existing.period, existing.eventRecordId, "approved", filename).replace(/\\/g, "/");
    const fromAbs = path.join(financeRoot(), existing.storedPath);
    const toAbs = path.join(financeRoot(), approvedRel);
    try {
      await mkdir(path.dirname(toAbs), { recursive: true });
      await rename(fromAbs, toAbs);
      storedPath = approvedRel;
    } catch {
      /* keep pending path if move fails */
    }
  }
  const updated: FinanceDocumentRecord = {
    ...existing,
    approvalStatus: input.status,
    storedPath,
    updatedAt: now,
    approvedBy: input.status === "approved" ? input.actor : existing.approvedBy,
    approvedAt: input.status === "approved" ? now : existing.approvedAt,
  };
  await upsertFinanceDocument(updated);
  return updated;
}
