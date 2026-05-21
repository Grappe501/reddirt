import { listMasterRegistryTools } from "../master-tool-registry";
import type { MasterToolRegistryEntry } from "../master-tool-registry/types";
import type { ClassifiedIntent } from "./agent-runtime-types";
import { guardToolExecution } from "./tool-execution-guard";
import type { ToolRouteResult } from "./agent-runtime-types";

export function routeToolsForIntent(intent: ClassifiedIntent, role: string): ToolRouteResult {
  const all = listMasterRegistryTools();
  const suggestedIds = new Set(intent.suggestedToolIds);

  const candidates = all.filter(
    (t) =>
      suggestedIds.has(t.id) ||
      t.id.includes(intent.task.split("_")[0] ?? "") ||
      intent.suggestedToolIds.some((sid) => t.name.toLowerCase().includes(sid.replace(/-/g, " "))),
  );

  const pool = candidates.length >= 3 ? candidates : [...candidates, ...pickByDomain(all, intent.domain)].slice(0, 12);

  const recommended: MasterToolRegistryEntry[] = [];
  const blocked: ToolRouteResult["blocked"] = [];
  const requiredHumanApprovals: string[] = [];

  for (const tool of dedupeById(pool)) {
    const guard = guardToolExecution(tool, intent.riskLevel);
    if (guard.allowed) {
      if (recommended.length < 6) recommended.push(tool);
    } else {
      blocked.push({ tool, reason: guard.reason });
      if (tool.humanApprovalRequired) {
        requiredHumanApprovals.push(`${tool.name}: use UI at ${tool.routeBindings[0] ?? intent.likelyRoute}`);
      }
    }
  }

  const actionLinks = buildActionLinks(intent, role);

  return {
    recommended,
    blocked,
    explanation: `Matched ${recommended.length} safe tool(s); ${blocked.length} blocked for auto-exec.`,
    requiredHumanApprovals,
    actionLinks,
  };
}

function pickByDomain(tools: MasterToolRegistryEntry[], domain: string): MasterToolRegistryEntry[] {
  const map: Record<string, string[]> = {
    travel: ["travel", "reimbursement", "mileage"],
    calendar: ["calendar", "google", "promotion"],
    approval: ["approval", "email"],
    agent_tooling: ["agent", "orchestration", "global"],
    dashboard_ux: ["dashboard", "next-action"],
  };
  const keys = map[domain] ?? ["campaign"];
  return tools.filter((t) => keys.some((k) => t.domain.includes(k) || t.purpose.toLowerCase().includes(k)));
}

function dedupeById(tools: MasterToolRegistryEntry[]): MasterToolRegistryEntry[] {
  const seen = new Set<string>();
  return tools.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

function buildActionLinks(intent: ClassifiedIntent, role: string): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [
    { label: "Primary route", href: intent.likelyRoute },
    { label: "AI command center", href: "/admin/ai-command-center" },
  ];
  if (intent.domain === "travel") {
    links.push({ label: "Travel approval wizard", href: intent.likelyRoute.replace("reimbursement", "review") + "&mode=travel_needs_approval&autostart=1" });
  }
  if (role === "candidate") {
    links.push({ label: "Candidate dashboard", href: `/admin/candidate-dashboard?month=${intent.likelyRoute.match(/month=([^&]+)/)?.[1] ?? "2026-04"}` });
  }
  return links.slice(0, 5);
}
