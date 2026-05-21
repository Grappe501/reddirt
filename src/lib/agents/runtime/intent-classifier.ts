import type { AgentDomain } from "../orchestration/cross-domain-context-composer";
import type { AgentRiskLevel, ClassifiedIntent } from "./agent-runtime-types";

type PatternRule = {
  test: RegExp;
  domain: AgentDomain;
  task: string;
  urgency: ClassifiedIntent["urgency"];
  riskLevel: AgentRiskLevel;
  routeSuffix: string;
  neededData: string[];
  humanApproval: boolean;
  tools: string[];
};

const RULES: PatternRule[] = [
  {
    test: /reimbursement|reimburse|memo|travel request|mileage/i,
    domain: "travel",
    task: "reimbursement_workflow",
    urgency: "today",
    riskLevel: "low",
    routeSuffix: "/admin/campaign-events/reimbursement",
    neededData: ["travel_queue", "month_status"],
    humanApproval: false,
    tools: ["mr-reimburse-dollar", "adaptive-next-action-engine", "next-action-recommender"],
  },
  {
    test: /calendar stale|sync stale|out of date|json stale/i,
    domain: "calendar",
    task: "calendar_sync_health",
    urgency: "today",
    riskLevel: "low",
    routeSuffix: "/admin/campaign-events/calendar-sync",
    neededData: ["calendar_sync_snapshot"],
    humanApproval: false,
    tools: ["calendar-sync-truth", "cross-domain-context-composer"],
  },
  {
    test: /promote|google calendar|gcal|write to google/i,
    domain: "calendar",
    task: "calendar_promotion",
    urgency: "today",
    riskLevel: "high",
    routeSuffix: "/admin/campaign-events/calendar-promotion",
    neededData: ["promotion_readiness"],
    humanApproval: true,
    tools: ["promotion-readiness-checker", "high-risk-action-blocker"],
  },
  {
    test: /approve|deny|hold|pending approval/i,
    domain: "approval",
    task: "approval_queue",
    urgency: "now",
    riskLevel: "high",
    routeSuffix: "/admin/campaign-events/review",
    neededData: ["pending_approvals"],
    humanApproval: true,
    tools: ["appr-month-wizard", "next-action-recommender"],
  },
  {
    test: /missing mileage|fix mileage|city|county|travel log/i,
    domain: "travel",
    task: "travel_data_fix",
    urgency: "today",
    riskLevel: "low",
    routeSuffix: "/admin/campaign-events/travel-log",
    neededData: ["mileage_gaps"],
    humanApproval: false,
    tools: ["mr-rt-miles", "workflow-friction-detector"],
  },
  {
    test: /what should i do|next action|what.?s next|urgent/i,
    domain: "dashboard_ux",
    task: "next_action",
    urgency: "now",
    riskLevel: "low",
    routeSuffix: "/admin/campaign-manager-dashboard",
    neededData: ["dashboard_snapshot"],
    humanApproval: false,
    tools: ["adaptive-next-action-engine", "cross-domain-context-composer"],
  },
  {
    test: /email|host follow|draft.*(email|message)/i,
    domain: "approval",
    task: "email_draft",
    urgency: "today",
    riskLevel: "high",
    routeSuffix: "/admin/campaign-events/ai-tools",
    neededData: ["approval_email_scaffold"],
    humanApproval: true,
    tools: ["email-tone-adapter", "approval-package-copy-improver", "writing-observation-capture"],
  },
  {
    test: /briefing|candidate brief/i,
    domain: "approval",
    task: "candidate_briefing",
    urgency: "this_week",
    riskLevel: "medium",
    routeSuffix: "/admin/candidate-dashboard",
    neededData: ["upcoming_events"],
    humanApproval: true,
    tools: ["candidate-briefing-writer", "plain-language-simplifier"],
  },
  {
    test: /county|workbench/i,
    domain: "county",
    task: "county_ops",
    urgency: "when_ready",
    riskLevel: "low",
    routeSuffix: "/admin/counties",
    neededData: ["county_registry"],
    humanApproval: false,
    tools: ["cri-county-link"],
  },
  {
    test: /broken|gap|what is wrong|blocker|stuck/i,
    domain: "agent_tooling",
    task: "ops_diagnosis",
    urgency: "today",
    riskLevel: "low",
    routeSuffix: "/admin/ai-command-center",
    neededData: ["gap_analyzer", "friction"],
    humanApproval: false,
    tools: ["campaign-gap-analyzer", "workflow-friction-detector"],
  },
  {
    test: /send (the )?email|sms|text blast|publish|post transaction|finalize reimburse/i,
    domain: "agent_tooling",
    task: "blocked_automation",
    urgency: "now",
    riskLevel: "blocked",
    routeSuffix: "/admin/ai-command-center",
    neededData: [],
    humanApproval: true,
    tools: ["high-risk-action-blocker", "agent-guardrail-monitor"],
  },
];

export function classifyIntent(message: string, pathname: string, period: string): ClassifiedIntent {
  const raw = message.trim();
  const lower = raw.toLowerCase();

  for (const rule of RULES) {
    if (rule.test.test(lower)) {
      const href = rule.routeSuffix.includes("?")
        ? rule.routeSuffix
        : `${rule.routeSuffix}?month=${period}`;
      return {
        domain: rule.domain,
        task: rule.task,
        urgency: rule.urgency,
        riskLevel: rule.riskLevel,
        likelyRoute: href,
        neededData: rule.neededData,
        humanApprovalRequired: rule.humanApproval,
        suggestedToolIds: rule.tools,
        rawMessage: raw,
      };
    }
  }

  const domain = inferDomainFromPath(pathname);
  return {
    domain,
    task: "general_help",
    urgency: "when_ready",
    riskLevel: "low",
    likelyRoute: pathname.includes("?") ? pathname : `${pathname.split("?")[0]}?month=${period}`,
    neededData: ["dashboard_snapshot"],
    humanApprovalRequired: false,
    suggestedToolIds: ["cross-domain-context-composer", "unified-agent-runtime"],
    rawMessage: raw,
  };
}

function inferDomainFromPath(pathname: string): AgentDomain {
  if (pathname.includes("reimbursement") || pathname.includes("travel")) return "travel";
  if (pathname.includes("calendar-sync") || pathname.includes("calendar-promotion")) return "calendar";
  if (pathname.includes("review")) return "approval";
  if (pathname.includes("ai-command-center")) return "agent_tooling";
  if (pathname.includes("candidate-dashboard")) return "approval";
  return "dashboard_ux";
}
