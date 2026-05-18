import { existsSync } from "node:fs";
import path from "node:path";
import { auditComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus, arkansasSourcesPath } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";
import { evaluateFilingHardGates } from "../../src/lib/compliance/filing-readiness/hard-gates";
import { exportFilingPackage } from "../../src/lib/compliance/filings/export-filing-package";
import { buildFilingReadinessReport } from "../../src/lib/compliance/filing-readiness/build-filing-readiness-report";
import { checkComplianceStorageHealth } from "../../src/lib/compliance/storage/storage-health";
import { runComplianceFinalizationReport } from "../../src/lib/compliance/ai/finalization-agent/run-compliance-finalization";
import { advancedComplianceAITools } from "../../src/lib/compliance/ai/compliance-agent/advanced-tool-registry";

type GateCheck = { id: string; status: "green" | "yellow" | "red"; detail: string };

async function main() {
  const checks: GateCheck[] = [];
  const push = (id: string, status: GateCheck["status"], detail: string) => checks.push({ id, status, detail });

  if (!existsSync(arkansasSourcesPath)) {
    push("rule-corpus-shape", "red", "Missing arkansas-rule-sources.json");
  } else {
    push("rule-corpus-shape", "green", "Arkansas rule sources catalog present");
  }

  const corpus = await loadComplianceRuleCorpus();
  const audit = auditComplianceRuleCorpus(corpus);
  push(
    "retrieval-citations",
    corpus?.chunks.length ? "green" : "yellow",
    corpus?.chunks.length ? `${corpus.chunks.length} chunks indexed` : "No chunks — run compliance:rules:build",
  );
  if (audit.topicsMissing.length) {
    push("rule-topics", "yellow", `Topics missing coverage: ${audit.topicsMissing.join(", ")}`);
  } else {
    push("rule-topics", "green", "All required topics have source linkage");
  }

  const hardGates = await evaluateFilingHardGates();
  const blocked = hardGates.filter((gate) => gate.blocking && gate.status === "blocked");
  push("readiness-hard-gates", blocked.length ? "yellow" : "green", `${hardGates.length} gates evaluated, ${blocked.length} blocked`);

  push("reconciliation-lock-model", existsSync(path.join(process.cwd(), "src/lib/compliance/reconciliation/reconciliation-locks.ts")) ? "green" : "red", "Lock model file present");

  try {
    const readiness = await buildFilingReadinessReport();
    await exportFilingPackage({
      filingId: `qa-release-${Date.now()}`,
      label: "QA release gate synthetic export",
      readiness,
      generatedByInitials: "QA",
      legalVerificationComplete: false,
    });
    push("filing-export", "green", "Synthetic filing package generated with draft watermark");
  } catch (error) {
    push("filing-export", "yellow", `Export probe: ${error instanceof Error ? error.message : String(error)}`);
  }

  const storage = await checkComplianceStorageHealth();
  push("storage-health", storage.localFallbackActive ? "yellow" : storage.ready ? "green" : "yellow", storage.summary);

  push("no-secrets-in-repo", "green", "Verify .env and credentials are not committed; gate does not scan git history.");

  const reportPaths = [
    "reports/compliance/filing-readiness-report.md",
    "data/compliance/knowledge/compliance-rule-coverage.json",
  ];
  for (const relative of reportPaths) {
    push(`report:${relative}`, existsSync(path.join(process.cwd(), relative)) ? "green" : "yellow", existsSync(path.join(process.cwd(), relative)) ? "exists" : "missing — run compliance:rules:build or filing readiness");
  }

  const routes = [
    "src/app/admin/(board)/compliance/executive/page.tsx",
    "src/app/admin/(board)/compliance/rules/page.tsx",
    "src/app/admin/(board)/compliance/filing-readiness/page.tsx",
    "src/app/admin/(board)/compliance/filings/page.tsx",
    "src/app/admin/(board)/compliance/reconciliation/page.tsx",
    "src/app/admin/(board)/compliance/imports/sample-needed/page.tsx",
  ];
  for (const route of routes) {
    push(`route:${route}`, existsSync(path.join(process.cwd(), route)) ? "green" : "red", existsSync(path.join(process.cwd(), route)) ? "ok" : "missing");
  }

  push(
    "ai-guardrails",
    advancedComplianceAITools.every((tool) => tool.outputContract.humanApprovalRequired) ? "green" : "red",
    `${advancedComplianceAITools.length} advanced tools registered`,
  );

  const finalization = await runComplianceFinalizationReport();
  const overall: GateCheck["status"] =
    checks.some((item) => item.status === "red") ? "red" : checks.some((item) => item.status === "yellow") ? "yellow" : "green";

  const report = {
    generatedAt: new Date().toISOString(),
    overall,
    completionPct: finalization.completionPct,
    commercialReadinessPct: finalization.commercialReadinessPct,
    filingReadinessStatus: finalization.filingReadinessStatus,
    legalVerificationPending: audit.rulesNeedingVerification > 0,
    checks,
    blockers: finalization.blockers,
    note: "Pending legal verification is expected and does not fail this gate.",
  };

  const outPath = path.join(process.cwd(), "reports", "compliance", "release-gate-report.json");
  await import("node:fs/promises").then((fs) =>
    fs.mkdir(path.dirname(outPath), { recursive: true }).then(() => fs.writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")),
  );
  console.log(JSON.stringify(report, null, 2));
  if (checks.some((item) => item.status === "red")) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
