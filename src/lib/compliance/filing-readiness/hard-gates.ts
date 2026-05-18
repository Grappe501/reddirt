import { loadApprovalEvents } from "../approvals/approval-storage";
import { loadStagedMoneyMovements } from "../money/money-movement-storage";
import { loadDocumentMetadata } from "../storage/document-storage";
import { loadReconciliationMatches } from "../reconciliation/reconciliation-workbench-storage";
import { loadComplianceRuleCorpus } from "../knowledge/load-compliance-rule-corpus";
import { auditComplianceRuleCorpus } from "../knowledge/compliance-rule-index";
import { loadFilingSnapshots } from "../filings/filing-storage";
import type { FilingReadinessReport } from "./filing-readiness-types";
import { getCurrentFilingPeriod } from "./arkansas-filing-periods";

export type FilingHardGate = {
  id: string;
  label: string;
  status: "passed" | "warning" | "blocked" | "overridden";
  blocking: boolean;
  explanation: string;
  relatedRecordIds: string[];
  overrideAllowed: boolean;
  overrideReasonRequired: boolean;
  overrideInitials?: string;
  overrideReason?: string;
  overriddenAt?: string;
};

export type FilingHardGateInput = {
  overrides?: Array<{
    gateId: string;
    initials: string;
    reason: string;
    at?: string;
  }>;
};

export async function evaluateFilingHardGates(input: FilingHardGateInput = {}): Promise<FilingHardGate[]> {
  const [movements, matches, documents, corpus, approvalEvents, filings] = await Promise.all([
    loadStagedMoneyMovements(),
    loadReconciliationMatches(),
    loadDocumentMetadata(),
    loadComplianceRuleCorpus(),
    loadApprovalEvents(),
    loadFilingSnapshots(),
  ]);
  const audit = auditComplianceRuleCorpus(corpus);
  const period = getCurrentFilingPeriod();
  const overrideMap = new Map((input.overrides ?? []).map((item) => [item.gateId, item]));
  const gates: FilingHardGate[] = [
    gate("money-approved", "All included money movements approved", movements.filter((item) => item.approvalStatus !== "approved").map((item) => item.id), {
      blocking: true,
      pass: movements.every((item) => item.approvalStatus === "approved") || movements.length === 0,
      explanation: "Every money movement in the filing window must be treasurer-approved.",
    }),
    gate("documentation-complete", "Required documentation complete or overridden", documents.filter((item) => !item.sha256).map((item) => item.id), {
      blocking: true,
      pass: documents.length > 0,
      explanation: "Supporting documents must be indexed with hashes.",
      overrideAllowed: true,
    }),
    gate("bank-matches-locked", "Bank matches approved/locked or overridden", matches.filter((item) => item.status !== "locked" && item.status !== "ignored").map((item) => item.id), {
      blocking: true,
      pass: matches.length === 0 || matches.every((item) => item.status === "locked" || item.status === "ignored"),
      explanation: "Open reconciliation matches block filing readiness.",
      overrideAllowed: true,
    }),
    gate("rule-topics-official", "Required rule topics have official sources", audit.topicCoverage.filter((topic) => !topic.hasOfficialSource).map((topic) => topic.topic), {
      blocking: true,
      pass: audit.topicCoverage.every((topic) => topic.hasOfficialSource),
      explanation: "Each required topic needs an official Arkansas source loaded (human legal review may still be required).",
    }),
    gate("filing-period-verified", "Filing period / due date verified or overridden", [], {
      blocking: true,
      pass: period.sourceStatus === "verified",
      explanation: period.sourceNote,
      overrideAllowed: true,
    }),
    gate("treasurer-approval", "Treasurer / candidate approval chain complete", approvalEvents.filter((item) => item.role === "treasurer").map((item) => item.id), {
      blocking: true,
      pass: approvalEvents.some((item) => item.role === "treasurer" && (item.stage === "approved" || item.stage === "filing_certified")),
      explanation: "Treasurer approval event required before export.",
      overrideAllowed: true,
    }),
    gate("filing-snapshot", "Filing snapshot generated", filings.map((item) => item.id), {
      blocking: true,
      pass: filings.length > 0,
      explanation: "Generate a draft filing package snapshot.",
    }),
    gate("audit-manifest", "Audit manifest generated", filings.flatMap((item) => item.auditHashManifest.map((entry) => entry.path)), {
      blocking: true,
      pass: filings.some((item) => item.auditHashManifest.length > 0),
      explanation: "Filing package must include hash manifest.",
    }),
  ];
  return gates.map((item) => applyOverride(item, overrideMap.get(item.id)));
}

function gate(
  id: string,
  label: string,
  relatedRecordIds: string[],
  options: { blocking: boolean; pass: boolean; explanation: string; overrideAllowed?: boolean },
): FilingHardGate {
  return {
    id,
    label,
    status: options.pass ? "passed" : "blocked",
    blocking: options.blocking,
    explanation: options.explanation,
    relatedRecordIds,
    overrideAllowed: options.overrideAllowed ?? false,
    overrideReasonRequired: true,
  };
}

function applyOverride(gate: FilingHardGate, override?: { initials: string; reason: string; at?: string }): FilingHardGate {
  if (!override) return gate;
  return {
    ...gate,
    status: "overridden",
    blocking: false,
    overrideInitials: override.initials.trim().toUpperCase(),
    overrideReason: override.reason,
    overriddenAt: override.at ?? new Date().toISOString(),
    explanation: `${gate.explanation} (Override: ${override.reason})`,
  };
}

export function filingHardGateSummary(gates: FilingHardGate[]): Pick<FilingReadinessReport, "overallStatus" | "blockers" | "warnings"> {
  const blockers = gates.filter((gate) => gate.blocking && gate.status === "blocked").map((gate) => `${gate.label}: ${gate.explanation}`);
  const warnings = gates.filter((gate) => gate.status === "overridden" || gate.status === "warning").map((gate) => `${gate.label}: ${gate.explanation}`);
  const overallStatus = blockers.length ? "red" : warnings.length ? "yellow" : "green";
  return { overallStatus, blockers, warnings };
}
