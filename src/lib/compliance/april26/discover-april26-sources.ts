import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";
import * as XLSX from "xlsx";
import {
  BANK_CSV_NAME,
  ETHICS_XLSX_NAME,
  GOODCHANGE_CSV_NAME,
  getApril26Dir,
} from "./paths";
import type { April26SourceInventory } from "./types";

export async function discoverApril26Sources(): Promise<April26SourceInventory> {
  const sourceDir = getApril26Dir();
  const warnings: string[] = [];
  let folderExists = false;
  try {
    const info = await stat(sourceDir);
    folderExists = info.isDirectory();
  } catch {
    warnings.push(`April26 folder not found at ${sourceDir}`);
  }

  const goodChangeCsvFound = folderExists ? await fileExists(path.join(sourceDir, GOODCHANGE_CSV_NAME)) : false;
  const ethicsWorkbookFound = folderExists ? await fileExists(path.join(sourceDir, ETHICS_XLSX_NAME)) : false;
  const bankCsvFound = folderExists ? await fileExists(path.join(sourceDir, BANK_CSV_NAME)) : false;

  let sheetsFound: string[] = [];
  if (ethicsWorkbookFound) {
    try {
      const wb = XLSX.readFile(path.join(sourceDir, ETHICS_XLSX_NAME), { bookSheets: true });
      sheetsFound = wb.SheetNames;
    } catch {
      warnings.push("Ethics workbook present but could not read sheet names.");
    }
  }

  const images = folderExists ? await walkImages(sourceDir) : [];
  const checkImageCount = images.filter((image) => image.kind === "check").length;
  const receiptImageCount = images.filter((image) => image.kind === "receipt").length;
  const inKindImageCount = images.filter((image) => image.kind === "in_kind").length;

  if (!goodChangeCsvFound) warnings.push("GoodChange CSV missing.");
  if (!ethicsWorkbookFound) warnings.push("Ethics workbook missing.");
  if (!bankCsvFound) warnings.push("bank-april-2026.csv missing — reconciliation blocked until added.");

  return {
    folderExists,
    sourceDir,
    goodChangeCsvFound,
    ethicsWorkbookFound,
    bankCsvFound,
    sheetsFound,
    checkImageCount,
    receiptImageCount,
    inKindImageCount,
    warnings,
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function walkImages(
  sourceDir: string,
): Promise<Array<{ relativePath: string; absolutePath: string; kind: "check" | "receipt" | "in_kind" }>> {
  const results: Array<{ relativePath: string; absolutePath: string; kind: "check" | "receipt" | "in_kind" }> = [];
  async function walk(relative: string) {
    let entries;
    try {
      entries = await readdir(path.join(sourceDir, relative), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await walk(rel);
      else if (/\.(jpe?g|heic|png)$/i.test(entry.name)) {
        const lower = rel.toLowerCase();
        const kind = lower.includes("check") ? "check" : lower.startsWith("att.") ? "in_kind" : "receipt";
        results.push({
          relativePath: rel.replace(/\\/g, "/"),
          absolutePath: path.join(sourceDir, rel),
          kind,
        });
      }
    }
  }
  await walk("");
  return results;
}

export function classifyImagePath(relative: string): "check_image" | "receipt_image" | "in_kind_image" {
  const lower = relative.toLowerCase();
  if (lower.includes("check")) return "check_image";
  if (lower.startsWith("att.") || lower.includes("inkind") || lower.includes("in kind")) return "in_kind_image";
  if (lower.includes("receipt")) return "receipt_image";
  return "receipt_image";
}
