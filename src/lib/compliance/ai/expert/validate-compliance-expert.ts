import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  completionProgressSchema,
  complianceCoachSchema,
  complianceExpertSnapshotSchema,
  complianceUxAuditSchema,
} from "./compliance-expert-types";

const AI_DIR = path.join(process.cwd(), "data", "compliance", "ai");

export async function validateComplianceExpertArtifacts(): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];

  const files: { name: string; schema: { safeParse: (d: unknown) => { success: boolean; error?: { message: string } } } }[] = [
    { name: "expert-snapshot.json", schema: complianceExpertSnapshotSchema },
    { name: "completion-progress.json", schema: completionProgressSchema },
    { name: "operator-coach.json", schema: complianceCoachSchema },
    { name: "filing-coach.json", schema: complianceCoachSchema },
    { name: "rule-coach.json", schema: complianceCoachSchema },
    { name: "reconciliation-coach.json", schema: complianceCoachSchema },
    { name: "ux-audit.json", schema: complianceUxAuditSchema },
  ];

  for (const { name, schema } of files) {
    try {
      const raw = await readFile(path.join(AI_DIR, name), "utf8");
      const parsed = schema.safeParse(JSON.parse(raw));
      if (!parsed.success) errors.push(`${name}: ${parsed.error?.message ?? "invalid"}`);
    } catch (e) {
      errors.push(`${name}: ${e instanceof Error ? e.message : "missing"}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
