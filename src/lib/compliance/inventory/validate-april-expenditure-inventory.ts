import { readFile } from "node:fs/promises";
import path from "node:path";
import { aprilExpenditureInventorySchema } from "./april-expenditure-inventory-types";

const DONOR_PII_PATTERNS = [
  /\bemployer\s*:\s*\w+/i,
  /\boccupation\s*:\s*\w+/i,
  /\bfirst_name\b/i,
  /\blast_name\b/i,
  /\bbilling_city\b/i,
];

export async function assertAprilExpenditureInventoryPackage(jsonPath?: string): Promise<void> {
  const file = jsonPath ?? path.join(process.cwd(), "data", "compliance", "ai", "april-expenditure-inventory.json");
  const mdPath = path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_APRIL_EXPENDITURE_INVENTORY.md");
  const raw = await readFile(file, "utf8");
  const parsed = aprilExpenditureInventorySchema.parse(JSON.parse(raw));
  await readFile(mdPath, "utf8");

  const sum = parsed.summary;
  const exact = parsed.matchTable.filter((m) => m.matchKind === "exact").length;
  const likely = parsed.matchTable.filter((m) => m.matchKind === "likely").length;
  if (sum.exactMatchCount !== exact) {
    throw new Error(`exactMatchCount ${sum.exactMatchCount} !== matchTable exact rows ${exact}`);
  }
  if (sum.likelyMatchCount !== likely) {
    throw new Error(`likelyMatchCount ${sum.likelyMatchCount} !== matchTable likely rows ${likely}`);
  }

  for (const check of parsed.uploadedChecks) {
    if (check.addressPresent && !check.addressValue?.trim()) {
      throw new Error(`Uploaded check ${check.id} marked address present but empty`);
    }
  }

  for (const gap of parsed.addressGaps) {
    if (/123 Main St|Fake Address|Invented/i.test(gap.payeeVendor)) {
      throw new Error("Suspected fabricated address placeholder in gap list");
    }
  }

  const blob = JSON.stringify(parsed);
  for (const pattern of DONOR_PII_PATTERNS) {
    if (pattern.test(blob)) {
      throw new Error(`Donor PII pattern detected in inventory JSON: ${pattern}`);
    }
  }

  const fabricated = parsed.uploadedChecks.filter(
    (c) => c.addressPresent && c.addressValue && /unknown vendor/i.test(c.addressValue),
  );
  if (fabricated.length) {
    throw new Error("Fabricated address values detected");
  }
}
