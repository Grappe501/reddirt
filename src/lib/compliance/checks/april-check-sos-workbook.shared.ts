import { CHECK_SOS_FIELDS } from "./check-sos-field-catalog";
import type {
  AprilCheckSosEntry,
  AprilCheckSourceImage,
  AprilCheckSosWorkbook,
  AprilCheckSosWorkbookStats,
  CheckReviewFilter,
} from "./april-check-sos-types";

export type {
  AprilCheckSosEntry,
  AprilCheckSourceImage,
  AprilCheckSosWorkbook,
  AprilCheckSosWorkbookStats,
  CheckReviewFilter,
} from "./april-check-sos-types";

export function getAprilCheckSosWorkbookStats(workbook: AprilCheckSosWorkbook): AprilCheckSosWorkbookStats {
  let extracted = 0;
  let reviewed = 0;
  let withAmount = 0;
  let withName = 0;
  let readyForSos = 0;
  let donationFolderImages = 0;
  for (const img of workbook.sourceImages) {
    if (img.imageCategory === "donation_folder") donationFolderImages += 1;
  }
  for (const e of workbook.entries) {
    if (e.extractedAt || e.extraction) extracted += 1;
    if (e.reviewed) reviewed += 1;
    if (e.fields.amount?.trim()) withAmount += 1;
    if (e.fields.contributorFullName?.trim()) withName += 1;
    if (getEntryMissingRequired(e).length === 0) readyForSos += 1;
  }
  return {
    sourceImageCount: workbook.sourceImages.length,
    donationFolderImages,
    totalChecks: workbook.entries.length,
    extracted,
    reviewed,
    withAmount,
    withName,
    readyForSos,
  };
}

export function getEntryMissingRequired(entry: AprilCheckSosEntry): string[] {
  const missing: string[] = [];
  for (const def of CHECK_SOS_FIELDS) {
    if (!def.required) continue;
    if (!entry.fields[def.key]?.trim()) missing.push(def.label);
  }
  return missing;
}

export type EntryReviewStatus = "not_extracted" | "incomplete" | "ready" | "reviewed";

export function getEntryReviewStatus(entry: AprilCheckSosEntry): EntryReviewStatus {
  if (entry.reviewed) return "reviewed";
  if (!entry.extractedAt && !entry.extraction) return "not_extracted";
  if (getEntryMissingRequired(entry).length > 0) return "incomplete";
  return "ready";
}

export function filterCheckEntries(entries: AprilCheckSosEntry[], filter: CheckReviewFilter): AprilCheckSosEntry[] {
  switch (filter) {
    case "donation_only":
      return entries.filter((e) => e.imageCategory === "donation_folder");
    case "not_extracted":
      return entries.filter((e) => getEntryReviewStatus(e) === "not_extracted");
    case "needs_review":
      return entries.filter((e) => {
        const s = getEntryReviewStatus(e);
        return s === "not_extracted" || s === "incomplete" || s === "ready";
      });
    case "reviewed":
      return entries.filter((e) => e.reviewed);
    default:
      return entries;
  }
}

export function entryStatusLabel(status: EntryReviewStatus): { text: string; className: string } {
  switch (status) {
    case "reviewed":
      return { text: "Reviewed", className: "bg-emerald-100 text-emerald-900" };
    case "ready":
      return { text: "Ready to file", className: "bg-sky-100 text-sky-900" };
    case "incomplete":
      return { text: "Missing fields", className: "bg-amber-100 text-amber-950" };
    default:
      return { text: "Not extracted", className: "bg-slate-200 text-slate-800" };
  }
}

export function entryDisplayLabel(entry: AprilCheckSosEntry): string {
  const n = (entry.checkIndexOnImage ?? 0) + 1;
  const total = entry.checksOnImageCount;
  if (total && total > 1) return `Check ${n} of ${total} on ${entry.imageFileName}`;
  return `Check on ${entry.imageFileName}`;
}

export function groupEntriesByImage(entries: AprilCheckSosEntry[]): Map<string, AprilCheckSosEntry[]> {
  const map = new Map<string, AprilCheckSosEntry[]>();
  for (const e of entries) {
    const list = map.get(e.imageRelativePath) ?? [];
    list.push(e);
    map.set(e.imageRelativePath, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.checkIndexOnImage ?? 0) - (b.checkIndexOnImage ?? 0));
  }
  return map;
}

export function normalizeLegacyEntry(entry: AprilCheckSosEntry): AprilCheckSosEntry {
  return {
    ...entry,
    checkIndexOnImage: entry.checkIndexOnImage ?? 0,
    imageCategory: entry.imageCategory ?? "other",
  };
}
