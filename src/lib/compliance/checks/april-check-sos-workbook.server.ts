import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { listApril26ImageFiles } from "../approval/april26-source";
import type { CheckSosFieldKey } from "./check-sos-field-catalog";
import { formatSosAmount, formatSosDate } from "./check-sos-field-catalog";
import type { CheckExtraction } from "./check-extraction-types";
import { extractChecksFromImageWithOpenAI } from "./extract-check-with-openai";
import { prepareCheckImageForVision } from "./prepare-check-image-for-vision";
import type { AprilCheckImageCategory, AprilCheckSosEntry, AprilCheckSosWorkbook, AprilCheckSourceImage } from "./april-check-sos-types";
import { getAprilCheckSosWorkbookStats, normalizeLegacyEntry } from "./april-check-sos-workbook.shared";

const STORE_PATH = path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-entries.json");

export type { AprilCheckSosEntry, AprilCheckSosWorkbook, AprilCheckSourceImage, AprilCheckImageCategory } from "./april-check-sos-types";

const DONATION_FOLDER_MARKER = /checks donations/i;

export function entryId(relativePath: string, checkIndexOnImage: number): string {
  return createHash("sha256").update(`${relativePath}#${checkIndexOnImage}`).digest("hex").slice(0, 16);
}

function imageCategory(relativePath: string): AprilCheckImageCategory {
  const base = path.basename(relativePath).toLowerCase();
  if (DONATION_FOLDER_MARKER.test(relativePath)) return "donation_folder";
  if (/^att\./i.test(base)) return "attachment";
  if (/check/i.test(relativePath)) return "donation_folder";
  return "other";
}

/** Primary source: `April26/Checks donations …/Checks donations/*.HEIC` (7 photos, multiple checks each). */
export function listDonationCheckPhotoImages(
  images: Awaited<ReturnType<typeof listApril26ImageFiles>>,
): Array<{ relativePath: string; absolutePath: string }> {
  const checks = images.filter((img) => DONATION_FOLDER_MARKER.test(img.relativePath));
  const byBase = new Map<string, { relativePath: string; absolutePath: string }>();
  for (const img of checks) {
    const base = path.basename(img.relativePath).toLowerCase();
    const existing = byBase.get(base);
    if (!existing || img.relativePath.length > existing.relativePath.length) {
      byBase.set(base, { relativePath: img.relativePath, absolutePath: img.absolutePath });
    }
  }
  return [...byBase.values()].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

/** Legacy: all check-like images including email attachments. */
export function dedupeAprilCheckImages(
  images: Awaited<ReturnType<typeof listApril26ImageFiles>>,
): Array<{ relativePath: string; absolutePath: string }> {
  const checks = images.filter(
    (img) =>
      img.kind === "check" ||
      /check/i.test(img.relativePath) ||
      /^att\./i.test(path.basename(img.relativePath)),
  );
  const byBase = new Map<string, { relativePath: string; absolutePath: string }>();
  for (const img of checks) {
    const base = path.basename(img.relativePath).toLowerCase();
    const existing = byBase.get(base);
    if (!existing || img.relativePath.length > existing.relativePath.length) {
      byBase.set(base, { relativePath: img.relativePath, absolutePath: img.absolutePath });
    }
  }
  return [...byBase.values()].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function fieldsFromExtraction(
  extraction?: CheckExtraction,
  overrides?: Partial<Record<CheckSosFieldKey, string>>,
): Record<CheckSosFieldKey, string> {
  const fullName =
    extraction?.contributorFullName?.trim() ||
    [extraction?.contributorFirstName, extraction?.contributorLastName].filter(Boolean).join(" ").trim() ||
    "";
  const base: Record<CheckSosFieldKey, string> = {
    contributionType: "Check",
    contributorFullName: fullName,
    contributorFirstName: extraction?.contributorFirstName?.trim() ?? "",
    contributorLastName: extraction?.contributorLastName?.trim() ?? "",
    address1: extraction?.address1?.trim() ?? "",
    address2: extraction?.address2?.trim() ?? "",
    city: extraction?.city?.trim() ?? "",
    state: extraction?.state?.trim() ?? "",
    zip: extraction?.zip?.trim() ?? "",
    employer: extraction?.employer?.trim() ?? "",
    occupation: extraction?.occupation?.trim() ?? "",
    amount: formatSosAmount(extraction?.amount),
    checkNumber: extraction?.checkNumber?.trim() ?? "",
    checkDate: formatSosDate(extraction?.checkDate),
    receivedDate: formatSosDate(extraction?.receivedDate ?? extraction?.checkDate),
    depositedDate: "",
    memo: extraction?.memo?.trim() ?? "",
  };
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (value != null) base[key as CheckSosFieldKey] = value;
    }
  }
  return base;
}

function buildSourceImageRecord(img: { relativePath: string; absolutePath: string }, prior?: AprilCheckSourceImage): AprilCheckSourceImage {
  return {
    relativePath: img.relativePath,
    fileName: path.basename(img.relativePath),
    sourceFolder: path.dirname(img.relativePath).replace(/\\/g, "/"),
    imageCategory: imageCategory(img.relativePath),
    extractedAt: prior?.extractedAt,
    checkCount: prior?.checkCount,
    imageWarnings: prior?.imageWarnings,
  };
}

function createEntryFromExtraction(
  img: { relativePath: string; absolutePath: string },
  checkIndexOnImage: number,
  checksOnImageCount: number,
  extraction: CheckExtraction,
  prior?: AprilCheckSosEntry,
): AprilCheckSosEntry {
  const extractedFields = fieldsFromExtraction(extraction);
  const fields = prior?.fields ? { ...extractedFields, ...prior.fields } : extractedFields;
  return {
    id: prior?.id ?? entryId(img.relativePath, checkIndexOnImage),
    imageRelativePath: img.relativePath,
    imageFileName: path.basename(img.relativePath),
    sourceFolder: path.dirname(img.relativePath).replace(/\\/g, "/"),
    imageCategory: imageCategory(img.relativePath),
    checkIndexOnImage,
    checksOnImageCount,
    fields,
    extraction,
    extractedAt: new Date().toISOString(),
    reviewed: prior?.reviewed ?? false,
    operatorNotes: prior?.operatorNotes,
  };
}

function normalizeWorkbook(raw: AprilCheckSosWorkbook): AprilCheckSosWorkbook {
  const entries = (raw.entries ?? []).map((e) => normalizeLegacyEntry(e));
  const sourceImages = raw.sourceImages ?? [];
  return { ...raw, entries, sourceImages };
}

export async function loadAprilCheckSosWorkbook(): Promise<AprilCheckSosWorkbook | null> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return normalizeWorkbook(JSON.parse(raw) as AprilCheckSosWorkbook);
  } catch {
    return null;
  }
}

export async function saveAprilCheckSosWorkbook(workbook: AprilCheckSosWorkbook): Promise<void> {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(workbook, null, 2)}\n`, "utf8");
}

export async function buildAprilCheckSosWorkbook(options?: { extract?: boolean }): Promise<AprilCheckSosWorkbook> {
  const existing = await loadAprilCheckSosWorkbook();
  const allImages = await listApril26ImageFiles();
  const donationImages = listDonationCheckPhotoImages(allImages);

  const priorSourceByPath = new Map(existing?.sourceImages.map((s) => [s.relativePath, s]) ?? []);
  const sourceImages = donationImages.map((img) => buildSourceImageRecord(img, priorSourceByPath.get(img.relativePath)));

  const priorEntriesByKey = new Map(
    (existing?.entries ?? []).map((e) => [`${e.imageRelativePath}#${e.checkIndexOnImage ?? 0}`, e]),
  );

  let entries: AprilCheckSosEntry[] = (existing?.entries ?? [])
    .map((e) => normalizeLegacyEntry(e))
    .filter((e) => donationImages.some((d) => d.relativePath === e.imageRelativePath) || e.imageCategory !== "donation_folder");

  if (options?.extract) {
    entries = entries.filter((e) => e.imageCategory !== "donation_folder");
    for (const img of donationImages) {
      const added = await extractChecksForImage(img, priorEntriesByKey);
      entries.push(...added.entries);
      const src = sourceImages.find((s) => s.relativePath === img.relativePath);
      if (src) {
        src.extractedAt = new Date().toISOString();
        src.checkCount = added.checkCount;
        src.imageWarnings = added.imageWarnings;
      }
    }
  }

  entries.sort((a, b) => {
    const pathCmp = a.imageRelativePath.localeCompare(b.imageRelativePath);
    if (pathCmp !== 0) return pathCmp;
    return (a.checkIndexOnImage ?? 0) - (b.checkIndexOnImage ?? 0);
  });

  const workbook: AprilCheckSosWorkbook = {
    generatedAt: new Date().toISOString(),
    april26Dir: process.env.COMPLIANCE_APRIL26_DIR ?? "(default ../Compliance/April26)",
    sourceImages,
    entries,
  };
  await saveAprilCheckSosWorkbook(workbook);
  return workbook;
}

async function extractChecksForImage(
  img: { relativePath: string; absolutePath: string },
  priorByKey: Map<string, AprilCheckSosEntry>,
): Promise<{ entries: AprilCheckSosEntry[]; checkCount: number; imageWarnings?: string[] }> {
  const vision = await prepareCheckImageForVision(img.absolutePath);
  const result = await extractChecksFromImageWithOpenAI(vision);
  const checkCount = result.checks.length;
  const entries = result.checks.map((extraction, index) => {
    const prior = priorByKey.get(`${img.relativePath}#${index}`);
    return createEntryFromExtraction(img, index, checkCount, extraction, prior);
  });
  return { entries, checkCount, imageWarnings: result.imageWarnings };
}

/** Vision-extract every physical check visible on one source photo. Replaces prior rows for that photo. */
export async function extractAprilCheckSosImage(relativePath: string): Promise<{
  workbook: AprilCheckSosWorkbook;
  entries: AprilCheckSosEntry[];
  checkCount: number;
} | null> {
  const workbook = (await loadAprilCheckSosWorkbook()) ?? (await buildAprilCheckSosWorkbook());
  const allImages = await listApril26ImageFiles();
  const img =
    listDonationCheckPhotoImages(allImages).find((i) => i.relativePath === relativePath) ??
    dedupeAprilCheckImages(allImages).find((i) => i.relativePath === relativePath);
  if (!img) return null;

  const priorByKey = new Map(
    workbook.entries
      .filter((e) => e.imageRelativePath === relativePath)
      .map((e) => [`${e.imageRelativePath}#${e.checkIndexOnImage ?? 0}`, e]),
  );

  const added = await extractChecksForImage(img, priorByKey);
  workbook.entries = [
    ...workbook.entries.filter((e) => e.imageRelativePath !== relativePath),
    ...added.entries,
  ];
  workbook.entries.sort((a, b) => {
    const pathCmp = a.imageRelativePath.localeCompare(b.imageRelativePath);
    if (pathCmp !== 0) return pathCmp;
    return (a.checkIndexOnImage ?? 0) - (b.checkIndexOnImage ?? 0);
  });

  let src = workbook.sourceImages.find((s) => s.relativePath === relativePath);
  if (!src) {
    src = buildSourceImageRecord(img);
    workbook.sourceImages.push(src);
    workbook.sourceImages.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  }
  src.extractedAt = new Date().toISOString();
  src.checkCount = added.checkCount;
  src.imageWarnings = added.imageWarnings;

  await saveAprilCheckSosWorkbook(workbook);
  return { workbook, entries: added.entries, checkCount: added.checkCount };
}

/** Re-extract the whole source photo for this check row. */
export async function extractAprilCheckSosEntry(id: string): Promise<AprilCheckSosEntry | null> {
  const workbook = (await loadAprilCheckSosWorkbook()) ?? (await buildAprilCheckSosWorkbook());
  const entry = workbook.entries.find((e) => e.id === id);
  if (!entry) return null;
  const result = await extractAprilCheckSosImage(entry.imageRelativePath);
  if (!result) return null;
  return result.entries.find((e) => e.checkIndexOnImage === entry.checkIndexOnImage) ?? result.entries[0] ?? null;
}

export async function addManualCheckOnImage(relativePath: string): Promise<AprilCheckSosEntry | null> {
  const workbook = (await loadAprilCheckSosWorkbook()) ?? (await buildAprilCheckSosWorkbook());
  const onImage = workbook.entries.filter((e) => e.imageRelativePath === relativePath);
  const nextIndex = onImage.length ? Math.max(...onImage.map((e) => e.checkIndexOnImage ?? 0)) + 1 : 0;
  const img = workbook.sourceImages.find((s) => s.relativePath === relativePath);
  const entry: AprilCheckSosEntry = {
    id: entryId(relativePath, nextIndex),
    imageRelativePath: relativePath,
    imageFileName: path.basename(relativePath),
    sourceFolder: img?.sourceFolder ?? path.dirname(relativePath).replace(/\\/g, "/"),
    imageCategory: img?.imageCategory ?? imageCategory(relativePath),
    checkIndexOnImage: nextIndex,
    checksOnImageCount: (img?.checkCount ?? onImage.length) + 1,
    fields: fieldsFromExtraction(),
    reviewed: false,
  };
  workbook.entries.push(entry);
  await saveAprilCheckSosWorkbook(workbook);
  return entry;
}

export async function updateAprilCheckSosEntry(
  id: string,
  patch: { fields?: Partial<Record<CheckSosFieldKey, string>>; reviewed?: boolean; operatorNotes?: string },
): Promise<AprilCheckSosEntry | null> {
  const workbook = (await loadAprilCheckSosWorkbook()) ?? (await buildAprilCheckSosWorkbook());
  const entry = workbook.entries.find((e) => e.id === id);
  if (!entry) return null;
  if (patch.fields) entry.fields = { ...entry.fields, ...patch.fields };
  if (patch.reviewed != null) entry.reviewed = patch.reviewed;
  if (patch.operatorNotes != null) entry.operatorNotes = patch.operatorNotes;
  await saveAprilCheckSosWorkbook(workbook);
  return entry;
}

export function workbookToCsv(workbook: AprilCheckSosWorkbook): string {
  const headers = [
    "id",
    "imageFileName",
    "checkIndexOnImage",
    "checksOnImageCount",
    "imageCategory",
    "contributionType",
    "checkDate",
    "amount",
    "contributorFullName",
    "contributorFirstName",
    "contributorLastName",
    "address1",
    "address2",
    "city",
    "state",
    "zip",
    "employer",
    "occupation",
    "checkNumber",
    "receivedDate",
    "depositedDate",
    "memo",
    "reviewed",
    "confidence",
  ];
  const lines = [headers.join(",")];
  for (const e of workbook.entries) {
    const f = e.fields;
    const row = [
      e.id,
      e.imageFileName,
      String((e.checkIndexOnImage ?? 0) + 1),
      e.checksOnImageCount ?? "",
      e.imageCategory,
      f.contributionType,
      f.checkDate,
      f.amount,
      f.contributorFullName,
      f.contributorFirstName,
      f.contributorLastName,
      f.address1,
      f.address2,
      f.city,
      f.state,
      f.zip,
      f.employer,
      f.occupation,
      f.checkNumber,
      f.receivedDate,
      f.depositedDate,
      f.memo,
      e.reviewed ? "yes" : "no",
      e.extraction?.confidence ?? "",
    ].map((c) => csvEscape(String(c ?? "")));
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function getAprilCheckSosStorePath(): string {
  return STORE_PATH;
}

export async function importAprilCheckSosWorkbook(workbook: AprilCheckSosWorkbook): Promise<AprilCheckSosWorkbook> {
  const normalized = normalizeWorkbook({
    ...workbook,
    generatedAt: workbook.generatedAt || new Date().toISOString(),
    sourceImages: workbook.sourceImages ?? [],
    entries: workbook.entries ?? [],
  });
  await saveAprilCheckSosWorkbook(normalized);
  return normalized;
}

export async function getApril26ChecksStatus(): Promise<{
  april26Dir: string;
  folderExists: boolean;
  checkImageCount: number;
  donationPhotoCount: number;
  workbookEntryCount: number;
  storeExists: boolean;
  stats: ReturnType<typeof getAprilCheckSosWorkbookStats>;
}> {
  const { april26FolderExists, getApril26Dir } = await import("../approval/april26-source");
  const folderExists = await april26FolderExists();
  const dir = getApril26Dir();
  const allImages = await listApril26ImageFiles();
  const donationPhotos = listDonationCheckPhotoImages(allImages);
  const store = await loadAprilCheckSosWorkbook();
  let storeExists = false;
  try {
    await readFile(STORE_PATH);
    storeExists = true;
  } catch {
    storeExists = false;
  }
  const workbook = store ?? { generatedAt: "", april26Dir: dir, sourceImages: [], entries: [] };
  return {
    april26Dir: dir,
    folderExists,
    checkImageCount: dedupeAprilCheckImages(allImages).length,
    donationPhotoCount: donationPhotos.length,
    workbookEntryCount: store?.entries.length ?? 0,
    storeExists,
    stats: getAprilCheckSosWorkbookStats(workbook),
  };
}
