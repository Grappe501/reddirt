import path from "node:path";
import { buildFilingReadinessReport } from "../filing-readiness/build-filing-readiness-report";
import { buildFilingBlockerBurnDown } from "../filing-readiness/filing-blocker-burn-down";
import { resolveBankSource } from "../april26/bank-source-adapter";

export type FilingImpactReport = {
  generatedAt: string;
  filingOverallBefore: string;
  filingOverallAfter: string;
  blockersBefore: string[];
  blockersAfter: string[];
  blockersRemoved: string[];
  blockersRemaining: string[];
  needsHumanReview: string[];
  needsSourceEvidence: string[];
  needsSteveApproval: string[];
  greenConditions: Array<{ id: string; condition: string }>;
  bankSourceUnlock: boolean;
};

export async function buildFilingImpactReport(): Promise<FilingImpactReport> {
  const [filing, burnDown, bank] = await Promise.all([
    buildFilingReadinessReport(),
    buildFilingBlockerBurnDown(),
    resolveBankSource(),
  ]);

  const blockersAfter = burnDown.blockers.map((b) => b.id);
  const bankSourceUnlock = bank.canSatisfyBankRequirement;

  const blockersBefore = [...blockersAfter];
  if (bankSourceUnlock && blockersBefore.includes("bank-csv")) {
    /* would have been removed */
  } else if (!bankSourceUnlock && !blockersBefore.includes("bank-csv")) {
    blockersBefore.push("bank-csv");
  }

  const blockersRemoved = blockersBefore.filter((id) => !blockersAfter.includes(id));
  const blockersRemaining = blockersAfter;

  return {
    generatedAt: new Date().toISOString(),
    filingOverallBefore: filing.overallStatus,
    filingOverallAfter: filing.overallStatus,
    blockersBefore,
    blockersAfter,
    blockersRemoved: bankSourceUnlock ? ["bank-csv", ...blockersRemoved] : blockersRemoved,
    blockersRemaining,
    needsHumanReview: burnDown.blockers.filter((b) => b.category === "rules").map((b) => b.id),
    needsSourceEvidence: burnDown.blockers.filter((b) => b.sourceDependency).map((b) => b.id),
    needsSteveApproval: burnDown.blockers.filter((b) => b.severity === "critical" && !b.operatorFixableToday).map((b) => b.id),
    greenConditions: burnDown.blockers.map((b) => ({ id: b.id, condition: b.greenCondition })),
    bankSourceUnlock,
  };
}

export async function writeFilingImpactReport(): Promise<FilingImpactReport> {
  const report = await buildFilingImpactReport();
  const out = path.join(process.cwd(), "data", "compliance", "ai", "filing-impact.json");
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return report;
}
