import { ORCHESTRATOR_ENFORCED_RULES, ORCHESTRATOR_UNSAFE_SHORTCUTS, type DecisionGuard, type OrchestratorAction } from "./orchestrator-types";

const UNSAFE_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /batch.*rule_review|rule_review.*batch/i, label: "batch_approve_rule_review" },
  { pattern: /auto[- ]?approve|approve all/i, label: "auto_approve" },
  { pattern: /filing.*green|mark filing green/i, label: "fake_filing_green" },
  { pattern: /lower confidence|threshold.*9[0-7]/i, label: "lower_confidence_threshold_below_98" },
  { pattern: /invent.*bank|fake.*transaction/i, label: "invent_bank_csv_or_transactions" },
  { pattern: /commit.*tasks\.json/i, label: "commit_data_compliance_tasks_json" },
  { pattern: /migrate deploy|db migration.*without/i, label: "apply_db_migration_without_steve_approval" },
  { pattern: /assume.*netlify.*bank|production bank.*without/i, label: "assume_production_bank_unverified" },
];

function scanText(text: string): string | null {
  for (const { pattern, label } of UNSAFE_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

export function guardOrchestratorAction(
  action: OrchestratorAction,
  context: { productionBankVerified: boolean; filingOverall: string },
): { passed: boolean; notes: string[] } {
  const notes: string[] = [];
  const blob = `${action.title} ${action.whyItMatters} ${action.estimatedImpact.summary}`;
  const hit = scanText(blob);
  if (hit) {
    return { passed: false, notes: [`Blocked unsafe pattern: ${hit}`] };
  }
  if (action.estimatedImpact.filingBlockersDelta < -5) {
    return { passed: false, notes: ["Impact claims unrealistic filing blocker reduction"] };
  }
  if (context.filingOverall !== "green" && /filing green|ready to file/i.test(blob)) {
    return { passed: false, notes: ["Cannot recommend filing-ready language while filing is red/yellow"] };
  }
  if (/production.*bank/i.test(blob) && !context.productionBankVerified) {
    notes.push("Production bank not verified — local/dev bank source may not exist on Netlify");
  }
  return { passed: true, notes };
}

export function buildDecisionGuard(input: {
  commitBase: string;
  actions: OrchestratorAction[];
  productionBankVerified: boolean;
  filingOverall: string;
}): DecisionGuard {
  const blockedRecommendations: DecisionGuard["blockedRecommendations"] = [];
  for (const action of input.actions) {
    const g = guardOrchestratorAction(action, {
      productionBankVerified: input.productionBankVerified,
      filingOverall: input.filingOverall,
    });
    if (!g.passed && g.notes[0]) {
      blockedRecommendations.push({
        actionId: action.id,
        reason: g.notes.join("; "),
        unsafePattern: g.notes[0],
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    commitBase: input.commitBase,
    allGuardsPassed: blockedRecommendations.length === 0,
    blockedRecommendations,
    unsafeShortcuts: [...ORCHESTRATOR_UNSAFE_SHORTCUTS],
    enforcedRules: [...ORCHESTRATOR_ENFORCED_RULES],
    productionBankAssumption: {
      verified: input.productionBankVerified,
      note: input.productionBankVerified
        ? "Production bank import verified via env or validated chunks on this host."
        : "Do not assume Netlify has bank data until treasurer re-imports after deploy (see COMPLIANCE_NETLIFY_BANK_IMPORT.md).",
    },
  };
}
