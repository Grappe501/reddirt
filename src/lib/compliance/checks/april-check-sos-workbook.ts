import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { listApril26ImageFiles } from "../approval/april26-source";
import type { CheckSosFieldKey } from "./check-sos-field-catalog";
import { formatSosAmount, formatSosDate } from "./check-sos-field-catalog";
import type { CheckExtraction } from "./check-extraction-types";
import { extractCheckWithOpenAI } from "./extract-check-with-openai";
import { prepareCheckImageForVision } from "./prepare-check-image-for-vision";

const STORE_PATH = path.join(process.cwd(), "data", "compliance", "checks", "april-check-sos-entries.json");

export type AprilCheckSosEntry = {
  id: string;
  imageRelativePath: string;
  imageFileName: string;
  sourceFolder: string;
  fields: Record<CheckSosFieldKey, string>;
  extraction?: CheckExtraction;
  extractedAt?: string;
  reviewed: boolean;
  operatorNotes?: string;
};

export type AprilCheckSosWorkbook = {
  generatedAt: string;
  april26Dir: string;
  entries: AprilCheckSosEntry[];
};

function entryId(relativePath: string): string {
  return createHash("sha256").update(relativePath).digest("hex").slice(0, 16);
}

export function dedupeAprilCheckImages(
  images: Awaited<ReturnType<typeof listApril26ImageFiles>>,
): Array<{ relativePath: string; absolutePath: string }> {
  const checks = images.filter(
    (img) => img.kind === "check" || /check/i.test(img.relativePath),
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

function fieldsFromExtraction(extraction?: CheckExtraction, overrides?: Partial<Record<CheckSosFieldKey, string>>): Record<CheckSosFieldKey, string> {
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

export async function loadAprilCheckSosWorkbook(): Promise<AprilCheckSosWorkbook | null> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as AprilCheckSosWorkbook;
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
  const images = dedupeAprilCheckImages(await listApril26ImageFiles());
  const existingByPath = new Map(existing?.entries.map((e) => [e.imageRelativePath, e]) ?? []);

  const entries: AprilCheckSosEntry[] = [];
  for (const img of images) {
    const prior = existingByPath.get(img.relativePath);
    let extraction = prior?.extraction;
    if (options?.extract) {
      const vision = await prepareCheckImageForVision(img.absolutePath);
      extraction = await extractCheckWithOpenAI(vision);
    }
    const extractedFields = fieldsFromExtraction(extraction);
    const fields = prior?.fields ? { ...extractedFields, ...prior.fields } : extractedFields;
    entries.push({
      id: prior?.id ?? entryId(img.relativePath),
      imageRelativePath: img.relativePath,
      imageFileName: path.basename(img.relativePath),
      sourceFolder: path.dirname(img.relativePath).replace(/\\/g, "/"),
      fields,
      extraction: extraction ?? prior?.extraction,
      extractedAt: options?.extract ? new Date().toISOString() : prior?.extractedAt,
      reviewed: prior?.reviewed ?? false,
      operatorNotes: prior?.operatorNotes,
    });
  }

  const workbook: AprilCheckSosWorkbook = {
    generatedAt: new Date().toISOString(),
    april26Dir: process.env.COMPLIANCE_APRIL26_DIR ?? "(default ../Compliance/April26)",
    entries,
  };
  await saveAprilCheckSosWorkbook(workbook);
  return workbook;
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

export async function extractAprilCheckSosEntry(id: string): Promise<AprilCheckSosEntry | null> {
  const workbook = (await loadAprilCheckSosWorkbook()) ?? (await buildAprilCheckSosWorkbook());
  const entry = workbook.entries.find((e) => e.id === id);
  if (!entry) return null;
  const images = dedupeAprilCheckImages(await listApril26ImageFiles());
  const img = images.find((i) => i.relativePath === entry.imageRelativePath);
  if (!img) return null;
  const vision = await prepareCheckImageForVision(img.absolutePath);
  const extraction = await extractCheckWithOpenAI(vision);
  entry.extraction = extraction;
  entry.extractedAt = new Date().toISOString();
  entry.fields = { ...entry.fields, ...fieldsFromExtraction(extraction, entry.fields) };
  await saveAprilCheckSosWorkbook(workbook);
  return entry;
}

export function workbookToCsv(workbook: AprilCheckSosWorkbook): string {
  const headers = [
    "id",
    "imageFileName",
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
