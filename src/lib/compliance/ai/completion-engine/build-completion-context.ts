import { buildAprilExpenditureInventory } from "../../inventory/build-april-expenditure-inventory";
import { buildComplianceBrainSnapshot } from "../brain/build-compliance-brain";
import { buildComplianceExpertBundle } from "../expert/build-compliance-expert";
import { buildDeployReadinessReport } from "../expert/build-deploy-readiness";
import { buildReconciliationProgress } from "../../reconciliation/build-reconciliation-progress";
import { buildRuleReviewWorkflow } from "../../knowledge/build-rule-review-workflow";
import { buildOrchestratorPackage } from "../orchestrator/build-orchestrator";
import { resolveBankSource } from "../../april26/bank-source-adapter";

export async function buildCompletionContext() {
  const [brain, expertBundle, inventory, recon, rules, deploy, bank, orchestrator] = await Promise.all([
    buildComplianceBrainSnapshot(),
    buildComplianceExpertBundle(),
    buildAprilExpenditureInventory(),
    buildReconciliationProgress(),
    buildRuleReviewWorkflow(),
    buildDeployReadinessReport(),
    resolveBankSource(),
    buildOrchestratorPackage(),
  ]);
  return {
    brain,
    expert: expertBundle.expert,
    progress: expertBundle.progress,
    inventory,
    recon,
    rules,
    deploy,
    bank,
    orchestrator,
  };
}
