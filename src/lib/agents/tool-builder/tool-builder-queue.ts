import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { ToolBuildTicket, ToolBuildTicketStatus } from "./tool-builder-types";
import { loadGlobalUserObservations } from "@/lib/agents/user-intelligence/user-observations";

const REL = "data/campaign-events/ai-tool-builder-queue.json";

function queuePath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), REL);
}

export function loadToolBuildQueue(repoRoot?: string): ToolBuildTicket[] {
  const p = queuePath(repoRoot);
  if (!existsSync(p)) return getSeedTickets();
  try {
    const raw = JSON.parse(readFileSync(p, "utf8"));
    const arr = Array.isArray(raw) ? (raw as ToolBuildTicket[]) : [];
    return arr.length > 0 ? arr : getSeedTickets();
  } catch {
    return getSeedTickets();
  }
}

export function saveToolBuildQueue(tickets: ToolBuildTicket[], repoRoot?: string): void {
  const p = queuePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify(tickets, null, 2), "utf8");
}

export function createToolBuildTicket(
  partial: Omit<ToolBuildTicket, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: ToolBuildTicketStatus;
  },
  repoRoot?: string,
): ToolBuildTicket {
  const all = loadToolBuildQueue(repoRoot);
  const ticket: ToolBuildTicket = {
    id: `tbt_${Date.now().toString(36)}`,
    status: partial.status ?? "proposed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priorityScore: scoreToolBuildPriority(partial),
    ...partial,
  };
  all.unshift(ticket);
  saveToolBuildQueue(all, repoRoot);
  return ticket;
}

export function updateToolBuildTicketStatus(
  id: string,
  status: ToolBuildTicketStatus,
  reviewerNotes?: string,
  repoRoot?: string,
): ToolBuildTicket | undefined {
  const all = loadToolBuildQueue(repoRoot);
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return undefined;
  all[idx] = {
    ...all[idx],
    status,
    reviewerNotes: reviewerNotes ?? all[idx].reviewerNotes,
    updatedAt: new Date().toISOString(),
  };
  saveToolBuildQueue(all, repoRoot);
  return all[idx];
}

export function scoreToolBuildPriority(partial: {
  riskLevel: ToolBuildTicket["riskLevel"];
  expectedImpact: string;
  workflowAffected: string;
}): number {
  let score = 50;
  if (partial.expectedImpact.toLowerCase().includes("high")) score += 20;
  if (partial.workflowAffected.includes("reimbursement")) score += 15;
  if (partial.workflowAffected.includes("volunteer")) score += 12;
  if (partial.riskLevel === "low") score += 5;
  if (partial.riskLevel === "high") score -= 10;
  return Math.min(100, Math.max(0, score));
}

export function convertWorkflowProblemToToolSpec(problem: string, workflow: string): Partial<ToolBuildTicket> {
  const slug = problem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  return {
    source: "workflow_observation",
    observedProblem: problem,
    workflowAffected: workflow,
    proposedToolName: `kelly-${slug}-assistant`,
    proposedToolContract: `Detect ${problem}; recommend human-gated next step.`,
    dataNeeded: ["ledger snapshot", "observations"],
    uiNeeded: ["admin panel card", "command center row"],
    routeIntegration: ["/admin/ai-command-center"],
    testPlan: ["npm run agents:test-tool-builder"],
    riskLevel: workflow.includes("email") || workflow.includes("calendar") ? "medium" : "low",
    expectedImpact: "Reduce repeated operator friction",
  };
}

export function detectToolGapsFromObservations(repoRoot?: string): ToolBuildTicket[] {
  const obs = loadGlobalUserObservations(repoRoot);
  const gaps: ToolBuildTicket[] = [];
  const abandoned = obs.filter((o) => o.event === "abandoned_flow" || o.event === "flow_abandoned").length;
  const noSearch = obs.filter((o) => o.event === "no_results_search").length;
  const finance = obs.filter((o) => o.event === "financial_gap_detected" || o.event === "receipt_missing_detected").length;
  if (abandoned >= 2) {
    gaps.push({
      ...convertWorkflowProblemToToolSpec("operators abandon reimbursement flow", "reimbursement"),
      id: "gap_reimbursement_friction",
      status: "proposed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityScore: 72,
    } as ToolBuildTicket);
  }
  if (noSearch >= 2) {
    gaps.push({
      ...convertWorkflowProblemToToolSpec("navigation search misses routes", "dashboard_navigation"),
      id: "gap_dashboard_simplify",
      status: "proposed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityScore: 65,
    } as ToolBuildTicket);
  }
  if (finance >= 1) {
    gaps.push({
      ...convertWorkflowProblemToToolSpec("receipt and mileage gaps repeat", "finance"),
      id: "gap_finance_helper",
      status: "proposed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priorityScore: 70,
    } as ToolBuildTicket);
  }
  return gaps;
}

function getSeedTickets(): ToolBuildTicket[] {
  const now = new Date().toISOString();
  const base = (id: string, partial: Omit<ToolBuildTicket, "id" | "createdAt" | "updatedAt">): ToolBuildTicket => ({
    id,
    createdAt: now,
    updatedAt: now,
    ...partial,
    priorityScore: scoreToolBuildPriority(partial),
  });
  return [
    base("seed_volunteer_staffing", {
      source: "sprint_seed",
      observedProblem: "Events lack volunteer slots filled before promotion",
      workflowAffected: "volunteer_management",
      proposedToolName: "volunteer-staffing-gap-tool",
      proposedToolContract: "Surface unfilled roles per event; recommend coordinator actions.",
      dataNeeded: ["volunteer profiles", "event assignments"],
      uiNeeded: ["workbench card", "volunteer command center"],
      routeIntegration: ["/admin/volunteers", "/admin/campaign-events/workbench"],
      testPlan: ["agents:test-volunteer-system"],
      riskLevel: "low",
      expectedImpact: "High — fewer last-minute staffing scrambles",
      status: "proposed",
    }),
    base("seed_power_of_five", {
      source: "sprint_seed",
      observedProblem: "County Power of 5 gaps not visible in one panel",
      workflowAffected: "county_intelligence",
      proposedToolName: "county-power-of-five-gap-tool",
      proposedToolContract: "Aggregate PO5 gaps per county with training links.",
      dataNeeded: ["county intelligence snapshot"],
      uiNeeded: ["/admin/county-intelligence panel"],
      routeIntegration: ["/admin/county-intelligence"],
      testPlan: ["agents:test-county-intelligence"],
      riskLevel: "low",
      expectedImpact: "Medium — faster field prioritization",
      status: "backlog",
    }),
    base("seed_reimbursement_friction", {
      source: "sprint_seed",
      observedProblem: "Treasurer flow has repeated mileage/receipt detours",
      workflowAffected: "reimbursement",
      proposedToolName: "reimbursement-friction-reducer",
      proposedToolContract: "Single guided path from gaps → readiness → print gate.",
      dataNeeded: ["finance snapshot", "mileage gaps"],
      uiNeeded: ["/admin/campaign-events/reimbursement wizard strip"],
      routeIntegration: ["/admin/campaign-events/reimbursement"],
      testPlan: ["agents:test-tool-builder"],
      riskLevel: "medium",
      expectedImpact: "High — faster month close",
      status: "proposed",
    }),
    base("seed_dashboard_simplify", {
      source: "sprint_seed",
      observedProblem: "New admins see too many modules at once",
      workflowAffected: "dashboard_builder",
      proposedToolName: "dashboard-simplification-tool",
      proposedToolContract: "Simple mode caps blocks; training-locked modules explained.",
      dataNeeded: ["training progress", "role level"],
      uiNeeded: ["/admin/ai-command-center/dashboard-builder/preview"],
      routeIntegration: ["/admin/training", "/admin/onboarding"],
      testPlan: ["agents:test-dashboard-modules"],
      riskLevel: "low",
      expectedImpact: "High — calmer first-week UX",
      status: "accepted",
    }),
    base("seed_email_audience_safety", {
      source: "sprint_seed",
      observedProblem: "Audience selection risk before send",
      workflowAffected: "communications",
      proposedToolName: "email-audience-safety-tool",
      proposedToolContract: "Preview audience size; require human confirm; respect EMAIL_SEND_ENABLED.",
      dataNeeded: ["audience segments", "draft metadata"],
      uiNeeded: ["email command center gate panel"],
      routeIntegration: ["/admin/workbench/email-command-center"],
      testPlan: ["manual send gate checklist"],
      riskLevel: "high",
      expectedImpact: "Critical — prevents accidental blast",
      status: "proposed",
    }),
  ];
}
