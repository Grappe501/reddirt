import { z } from "zod";
import { buildComplianceExpertBundle } from "./build-compliance-expert";
import { buildComplianceBrainSnapshot } from "../brain/build-compliance-brain";
import { buildQueueBurndownReport } from "../../approval/queue-burn-down-export";
import { getQueueItems } from "../../approval/load-approval-queue";
import { APRIL_2026_QUEUE_ID } from "../../approval/build-approval-queue";

export const completionAcceleratorSchema = z.object({
  generatedAt: z.string(),
  commitBase: z.string(),
  top10Actions: z.array(
    z.object({
      priority: z.number(),
      title: z.string(),
      owner: z.string(),
      command: z.string().optional(),
      href: z.string().optional(),
      why: z.string(),
    }),
  ),
  fastestLaunchPath: z.array(z.string()),
  fastestFilingPath: z.array(z.string()),
  fastestQueuePath: z.array(z.string()),
  safestItemsFirst: z.array(z.string()),
  humanOnly: z.array(z.string()),
  steveOnly: z.array(z.string()),
  sourceFileOnly: z.array(z.string()),
  sinceLastPass: z.array(z.string()),
  beforeDeploy: z.array(z.string()),
});

export type CompletionAccelerator = z.infer<typeof completionAcceleratorSchema>;

export async function buildCompletionAccelerator(): Promise<CompletionAccelerator> {
  const brain = await buildComplianceBrainSnapshot();
  const [bundle, items] = await Promise.all([
    buildComplianceExpertBundle(),
    getQueueItems(APRIL_2026_QUEUE_ID),
  ]);
  const burndown = await buildQueueBurndownReport(APRIL_2026_QUEUE_ID, items);
  const expert = bundle.expert;

  const fromActions = expert.top5Now.map((a, i) => ({
    priority: i + 1,
    title: a.title,
    owner: a.owner,
    command: a.command,
    href: a.href,
    why: a.description,
  }));

  const fromRisks = expert.top5Risks.slice(0, 5).map((r, i) => ({
    priority: fromActions.length + i + 1,
    title: `Risk: ${r.title}`,
    owner: r.owner,
    command: undefined,
    href: undefined,
    why: r.mitigation,
  }));

  const top10Actions = [...fromActions, ...fromRisks].slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    commitBase: brain.commitBase,
    top10Actions,
    fastestLaunchPath: [
      "Add bank CSV → npm run compliance:bank:qa",
      "Operator launch rehearsal checklist",
      "npm run compliance:deploy-readiness",
      "Netlify production verify (browser)",
      "Storage + RLS (Steve)",
    ],
    fastestFilingPath: expert.whatWouldMakeFilingGreen.slice(0, 6),
    fastestQueuePath: [
      `Start categories: ${burndown.startHere.join(", ") || "rule_review"}`,
      burndown.nextBestItemId ? `Next best: ${burndown.nextBestItemId}` : "Run next-best on queue page",
      "npm run compliance:queue-burndown",
      "Use filters: near_eligible, low_confidence",
    ],
    safestItemsFirst: burndown.rows
      .filter((r) => r.blockerCategory !== "rule_review" && r.confidence >= 95)
      .slice(0, 10)
      .map((r) => r.id),
    humanOnly: expert.needsHumanReview,
    steveOnly: expert.needsSteveApproval,
    sourceFileOnly: expert.needsSourceEvidence,
    sinceLastPass: [
      "UX pass 2 — stepper, quick filters, bank operator states",
      "completion-accelerator + deploy-readiness scripts",
      "queue-burndown.json with impact labels",
    ],
    beforeDeploy: [
      "npm run compliance:deploy-readiness",
      "npm run build",
      "No tasks JSON staged; no unredacted exports",
      "COMPLIANCE_NETLIFY_PRODUCTION_VERIFY.md",
    ],
  };
}
