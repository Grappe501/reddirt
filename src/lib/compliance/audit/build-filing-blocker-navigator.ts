import { buildFilingBlockerBurnDown } from "../filing-readiness/filing-blocker-burn-down";
import { buildAprilAuditSpreadsheetPackage } from "./build-april-audit-spreadsheet";

export type FilingBlockerNavEntry = {
  id: string;
  label: string;
  route: string;
  owner: string;
  sourceCount: number;
  nextAction: string;
  doneCondition: string;
  relatedSpreadsheetFilter: string;
  aiCanAssist: boolean;
  humanReviewRequired: boolean;
};

export type FilingBlockerNavigator = {
  generatedAt: string;
  filingStatus: string;
  blockers: FilingBlockerNavEntry[];
};

export async function buildFilingBlockerNavigator(): Promise<FilingBlockerNavigator> {
  const [burnDown, audit] = await Promise.all([buildFilingBlockerBurnDown(), buildAprilAuditSpreadsheetPackage()]);

  const blockers: FilingBlockerNavEntry[] = burnDown.blockers.map((b) => ({
    id: b.id,
    label: b.label,
    route: b.href,
    owner: b.role,
    sourceCount: b.count,
    nextAction: b.nextAction,
    doneCondition: b.greenCondition,
    relatedSpreadsheetFilter: spreadsheetFilterForBlocker(b.id, audit),
    aiCanAssist: b.id !== "rules" && b.id !== "treasurer-signoff",
    humanReviewRequired: true,
  }));

  blockers.push({
    id: "april-audit-spreadsheet",
    label: "Complete April audit spreadsheet",
    route: "/admin/compliance/ernie",
    owner: "Ernie (operator)",
    sourceCount: audit.summary.mainRowCount,
    nextAction: "Fill human_answer and operator_notes in april-2026-compliance-audit.csv; run import preview.",
    doneCondition: "All critical rows reviewed; import preview shows no unsafe rows.",
    relatedSpreadsheetFilter: "workflow_area in (checks, ledger, address, in_kind)",
    aiCanAssist: true,
    humanReviewRequired: true,
  });

  return {
    generatedAt: new Date().toISOString(),
    filingStatus: "red",
    blockers,
  };
}

function spreadsheetFilterForBlocker(
  id: string,
  audit: { summary: { mainRowCount: number; checks: number; ledger: number; ruleReviewItems: number; reconciliation: number } },
): string {
  const s = audit.summary;
  switch (id) {
    case "rules":
      return `workflow_area=rule_review (${s.ruleReviewItems} rows)`;
    case "queue":
      return "See Ernie workflow — avoid generic queue first";
    case "bank":
    case "reconciliation":
      return `workflow_area=reconciliation (${s.reconciliation} rows)`;
    default:
      return `See docs/compliance/audit/april-2026-compliance-audit.csv`;
  }
}

export function renderFilingBlockerNavigatorMarkdown(nav: FilingBlockerNavigator): string {
  const lines = [
    "# Filing blocker navigator",
    "",
    `Generated: ${nav.generatedAt}`,
    "",
    `**Filing status:** ${nav.filingStatus} (honest — not green until sign-off)`,
    "",
    "| Blocker | Owner | Count | Route | Next action | Spreadsheet filter |",
    "| --- | --- | ---: | --- | --- | --- |",
  ];
  for (const b of nav.blockers) {
    lines.push(
      `| ${b.label} | ${b.owner} | ${b.sourceCount} | ${b.route} | ${b.nextAction.slice(0, 80)} | ${b.relatedSpreadsheetFilter} |`,
    );
  }
  lines.push("", "Regenerate: `npm run compliance:filing-blocker-navigator`", "");
  return lines.join("\n");
}
