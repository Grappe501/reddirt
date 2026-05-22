import { readFile } from "node:fs/promises";
import path from "node:path";
import { completionEngineSchema } from "./completion-engine-types";
import { z } from "zod";

const DONOR_PII = [/\bfirst_name\b/i, /\bemployer_name\b/i];

export async function assertCompletionEnginePackage(): Promise<void> {
  const enginePath = path.join(process.cwd(), "data", "compliance", "ai", "completion-engine.json");
  const raw = await readFile(enginePath, "utf8");
  const engine = completionEngineSchema.parse(JSON.parse(raw));

  if (engine.filingStatus === "green" && engine.overallPercentComplete < 90) {
    throw new Error("Suspicious filing green with low completion");
  }

  for (const pattern of DONOR_PII) {
    if (pattern.test(raw)) throw new Error(`Donor PII in completion-engine.json: ${pattern}`);
  }

  const auditMd = await readFile(path.join(process.cwd(), "docs", "compliance", "COMPLIANCE_APRIL_AUDIT_CHECKLIST.md"), "utf8");
  if (!auditMd.includes("What we NEED")) {
    throw new Error("Audit checklist missing have/need columns");
  }
  if (/123 Main St|Fake Address/i.test(auditMd)) {
    throw new Error("Fabricated address in audit checklist");
  }

  const checklist = z
    .object({
      summary: z.object({ totalChecks: z.number(), totalLedgerExpenditures: z.number() }),
    })
    .parse(JSON.parse(await readFile(path.join(process.cwd(), "data", "compliance", "ai", "april-audit-checklist.json"), "utf8")));

  if (checklist.summary.totalChecks === 0 && checklist.summary.totalLedgerExpenditures === 0) {
    throw new Error("Audit checklist empty — run from environment with April26 or bank chunks");
  }
}
