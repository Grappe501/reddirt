import { getBlocksForRole, getBlockById, type DashboardBlockId } from "./dashboard-component-registry";
import { interpretDashboardRequest, type InterpretedDashboardRequest } from "./dashboard-request-interpreter";
import { guardDashboardBlocks } from "./dashboard-safety-guard";
import { planDashboardLayout } from "./dashboard-layout-planner";

export type DashboardBlueprintBlock = {
  id: DashboardBlockId;
  title: string;
  purpose: string;
  emphasis: "primary" | "secondary";
  routeLinks: { label: string; href: string }[];
  aiExplanation: string;
  safetyNotes: string;
  emptyState: string;
};

export type DashboardBlueprint = {
  id: string;
  createdAt: string;
  campaign: "kelly-sos";
  request: InterpretedDashboardRequest;
  title: string;
  blocks: DashboardBlueprintBlock[];
  layoutRows: ReturnType<typeof planDashboardLayout>;
  requiredDataSources: string[];
  requiredTools: string[];
  missingCapabilities: string[];
  safestNextActions: { label: string; href: string; why: string }[];
  humanSupervisorRequired: boolean;
  doNotTouchAreas: string[];
  saveKey: string;
};

export function buildDashboardBlueprint(input: {
  roleLabel: string;
  taskDescription: string;
  experience?: string;
  detailLevel?: "simple" | "standard" | "power";
  freeformRequest?: string;
  month?: string;
}): DashboardBlueprint {
  const request = interpretDashboardRequest(input);
  const candidates = getBlocksForRole(request.targetRole);
  const safety = guardDashboardBlocks(candidates, request);
  const layout = planDashboardLayout(safety.allowedBlocks, request);

  const blockIdSet = new Set(layout.flatMap((r) => r.blockIds));
  const blocks: DashboardBlueprintBlock[] = [];
  for (const row of layout) {
    for (const id of row.blockIds) {
      const def = getBlockById(id);
      if (!def || blocks.some((b) => b.id === id)) continue;
      blocks.push({
        id,
        title: def.title,
        purpose: def.purpose,
        emphasis: row.emphasis,
        routeLinks: def.routeLinks.map((l) => ({
          ...l,
          href: l.href.replace("2026-03", request.month),
        })),
        aiExplanation: def.aiExplanation,
        safetyNotes: def.safetyNotes,
        emptyState: def.emptyState,
      });
    }
  }

  const requiredDataSources = [...new Set(safety.allowedBlocks.map((b) => b.readsFrom))];
  const requiredTools = ["workflow-router-v1", "executive-summary-builder", "dashboard-safety-guard"];
  const missingCapabilities: string[] = [];
  if (request.keywords.includes("volunteer")) {
    missingCapabilities.push("Full volunteer CRM dashboard — scaffold only");
  }
  if (safety.blockedBlocks.length) {
    missingCapabilities.push(`${safety.blockedBlocks.length} block(s) withheld for safety`);
  }

  const safestNextActions = blocks
    .flatMap((b) => b.routeLinks.map((l) => ({ label: l.label, href: l.href, why: b.aiExplanation })))
    .slice(0, 5);

  const title =
    input.freeformRequest?.trim().slice(0, 80) ||
    `${request.targetRole} dashboard — ${request.taskLabel}`;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const id = `bp_${Date.now().toString(36)}`;

  return {
    id,
    createdAt: new Date().toISOString(),
    campaign: "kelly-sos",
    request,
    title,
    blocks,
    layoutRows: layout,
    requiredDataSources,
    requiredTools,
    missingCapabilities,
    safestNextActions,
    humanSupervisorRequired: safety.humanSupervisorRequired,
    doNotTouchAreas: safety.doNotTouchAreas,
    saveKey: `kelly-dashboard-blueprint-${slug}`,
  };
}
