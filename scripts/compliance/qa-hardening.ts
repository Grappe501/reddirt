import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { COMPLIANCE_ROUTE_REGISTRY } from "../../src/lib/compliance/compliance-route-registry";
import { buildFilingReadinessReport } from "../../src/lib/compliance/filing-readiness/build-filing-readiness-report";
import { evaluateApprovalGuards } from "../../src/lib/compliance/approval/approval-guards";
import { loadApprovalQueues, loadApprovalItems } from "../../src/lib/compliance/approval/approval-storage";
import { auditComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/compliance-rule-index";
import { loadComplianceRuleCorpus } from "../../src/lib/compliance/knowledge/load-compliance-rule-corpus";
import { checkComplianceStorageHealth } from "../../src/lib/compliance/storage/storage-health";
import type { ApprovalItem } from "../../src/lib/compliance/approval/approval-types";

const REQUIRED_SCRIPTS = [
  "compliance:rules:build",
  "compliance:rules:audit",
  "compliance:qa-full",
  "compliance:qa-hardening",
  "compliance:qa-approval",
  "compliance:qa-reconciliation",
  "compliance:qa-filing-export",
  "compliance:qa-tasks",
  "compliance:qa-mobile",
  "compliance:qa-approvals",
  "compliance:qa-storage",
  "compliance:qa-rule-retrieval",
  "compliance:qa-receipts",
  "compliance:qa-coverage",
  "compliance:qa-filing",
] as const;

function assertGitignorePatterns() {
  const gitignore = readFileSync(path.join(process.cwd(), ".gitignore"), "utf8");
  const required = [
    "data/compliance/cash/*.json",
    "data/compliance/receipts/*.json",
    "data/compliance/money/*.json",
    "data/compliance/approval/*.json",
    "data/compliance/filings/*.json",
  ];
  for (const pattern of required) {
    if (!gitignore.includes(pattern)) throw new Error(`.gitignore missing pattern: ${pattern}`);
  }
}

function assertRoutePagesExist() {
  const appRoot = path.join(process.cwd(), "src", "app", "admin", "(board)", "compliance");
  for (const route of COMPLIANCE_ROUTE_REGISTRY) {
    const relative = route.replace("/admin/compliance", "").replace(/^\//, "") || "page.tsx";
    const pagePath = relative === "page.tsx" ? path.join(appRoot, "page.tsx") : path.join(appRoot, relative, "page.tsx");
    if (!existsSync(pagePath)) throw new Error(`Missing page for route ${route}: ${pagePath}`);
  }
}

function assertApprovalQueueShape(items: ApprovalItem[]) {
  if (!items.length) return;
  const sample = items[0];
  if (!sample.fields?.length) throw new Error("Approval item missing fields array");
  if (!Array.isArray(sample.evidence)) throw new Error("Approval item missing evidence array");
  const blocked: ApprovalItem = {
    ...sample,
    missingFields: ["Donor"],
    evidence: [],
    fields: sample.fields.map((field) => ({ ...field, validationStatus: field.key === "donorFullName" ? "missing" as const : field.validationStatus })),
  };
  if (evaluateApprovalGuards(blocked).canApprove) throw new Error("Receipt/approval guard must block missing evidence/fields");
}

function assertFilingReadinessHonest(report: Awaited<ReturnType<typeof buildFilingReadinessReport>>) {
  if (report.humanReviewRequired !== true) throw new Error("Filing readiness must require human review");
  if (report.overallStatus === "green" && report.blockers.length > 0) {
    throw new Error("Filing readiness cannot be green while blockers exist");
  }
  if (report.overallStatus === "green" && report.readinessGrade?.status === "red") {
    throw new Error("Filing readiness cannot be green when hard gate grade is red");
  }
}

async function main() {
  const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8")) as { scripts?: Record<string, string> };
  const missingScripts = REQUIRED_SCRIPTS.filter((name) => !packageJson.scripts?.[name]);
  if (missingScripts.length) throw new Error(`Missing package scripts: ${missingScripts.join(", ")}`);

  assertGitignorePatterns();
  assertRoutePagesExist();

  const [queues, items, readiness, corpus, storage] = await Promise.all([
    loadApprovalQueues(),
    loadApprovalItems(),
    buildFilingReadinessReport(),
    loadComplianceRuleCorpus(),
    checkComplianceStorageHealth(),
  ]);
  const ruleAudit = auditComplianceRuleCorpus(corpus);

  assertApprovalQueueShape(items);
  assertFilingReadinessHonest(readiness);

  if (!ruleAudit.topicCoverage.length) throw new Error("Rule topics must be visible in corpus audit");

  console.log(
    JSON.stringify(
      {
        status: "ok",
        routes: COMPLIANCE_ROUTE_REGISTRY.length,
        approvalQueues: queues.length,
        approvalItems: items.length,
        filingReadiness: readiness.overallStatus,
        filingBlockers: readiness.blockers.length,
        ruleTopics: ruleAudit.topicCoverage.length,
        storageReady: storage.ready,
        storageSummary: storage.summary,
        localFallback: storage.localFallbackActive,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
