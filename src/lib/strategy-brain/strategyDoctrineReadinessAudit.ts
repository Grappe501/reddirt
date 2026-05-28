import fs from "node:fs";
import path from "node:path";
import type { StrategyDoctrineReadinessTableFile } from "./strategyDoctrineTypes";

export function strategyDoctrineReadinessAudit(): {
  rowCount: number;
  expectedCount: number;
  missing: string[];
  needsReview: string[];
} {
  const abs = path.join(process.cwd(), "data/audit/strategy-doctrine-readiness-table.json");
  const readiness = JSON.parse(fs.readFileSync(abs, "utf8")) as StrategyDoctrineReadinessTableFile;
  return {
    rowCount: readiness.rows.length,
    expectedCount: 8,
    missing: readiness.rows.filter((row) => row.status === "MISSING").map((row) => row.artifact),
    needsReview: readiness.rows.filter((row) => row.reviewStatus === "NEEDS_REVIEW").map((row) => row.artifact),
  };
}

