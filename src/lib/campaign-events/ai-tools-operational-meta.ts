import type { AiToolEntry, AiToolStatus } from "./ai-tools-master-catalog";
import { getContractById } from "./ai-tools/tool-contract";
import { SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS } from "./ai-tools/sprint4-approval-email-tools";
import { SPRINT5_PROMOTION_TOOL_CONTRACTS } from "./calendar-promotion/sprint5-promotion-tools";
import { GLOBAL_AGENT_ORCHESTRATION_TOOL_CONTRACTS } from "./ai-tools/sprint-global-agent-tools";
import { AGENT_INTELLIGENCE_TOOL_CONTRACTS } from "./ai-tools/sprint-agent-intelligence-tools";
import { SPRINT2_AGENT_TOOL_CONTRACTS } from "./ai-tools/sprint-agent-intelligence-2-tools";
import { SPRINT3_AGENT_TOOL_CONTRACTS } from "./ai-tools/sprint-agent-intelligence-3-tools";

export type AiToolOperationalMeta = {
  implementationFiles: string[];
  relatedRoutes: string[];
  inputData: string;
  outputData: string;
  availableNow: boolean;
  blocksAutomation: boolean;
  nextBuildStep: string;
  testChecklist: string[];
};

const AUTOMATION_BLOCK_KEYWORDS = /no send|not built|no gcal|no sms|voter file|fin-1|not running|email not/i;

/** Per-tool operational overrides (id → meta). */
export const TOOL_OPERATIONAL_META: Record<string, Partial<AiToolOperationalMeta>> = {
  "intake-normalized-json": {
    implementationFiles: ["src/lib/campaign-events/persistence/seed-period.ts", "scripts/seed-campaign-events-month.ts"],
    relatedRoutes: ["/admin/campaign-events/workbench"],
    inputData: "calendar-items.normalized.json",
    outputData: "CampaignEventLedgerRecord rows",
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "Add May month when approved",
    testChecklist: ["npm run campaign-events:seed-april", "Re-run idempotent", "factCard preserved"],
  },
  "fc-infer-assumptions": {
    implementationFiles: ["src/lib/campaign-events/infer-event-assumptions.ts"],
    relatedRoutes: ["/admin/campaign-events/review", "/admin/campaign-events/[recordId]"],
    inputData: "Calendar item + all calendar context",
    outputData: "EventAiInference + factCard prefill",
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "Optional LLM layer behind same interface",
    testChecklist: ["Open month review", "Verify assumptions panel", "No bulk write without save"],
  },
  "cri-city-county-assist": {
    implementationFiles: ["src/lib/campaign-events/month-readiness/location-inference-assist.ts"],
    relatedRoutes: ["/admin/campaign-events/review?focus=missing_city"],
    inputData: "Title, location, notes, peer ledger rows",
    outputData: "where.city, where.county (via save)",
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "ZIP geocoder integration",
    testChecklist: ["Accept city guess", "humanLocks block overwrite", "County from alias memory"],
  },
  "mr-mileage-assist": {
    implementationFiles: [
      "src/lib/campaign-events/month-readiness/mileage-inference-assist.ts",
      "src/lib/campaign-events/persistence/travel-calc.ts",
    ],
    relatedRoutes: ["/admin/campaign-events/review?focus=missing_mileage"],
    inputData: "Origin rules + destination city",
    outputData: "roundTripMiles, reimbursementAmount",
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "Link to travel-ledger trip rows",
    testChecklist: ["Tue/Fri LR origin", "Save & recalculate", "Travel report totals update"],
  },
  "appr-summary-build": {
    implementationFiles: ["src/lib/campaign-events/month-review/approval-summary-builder.ts"],
    relatedRoutes: ["/admin/campaign-events/review"],
    inputData: "Workbench row + inference",
    outputData: "Plain-language approval summary",
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "Wire to approval package email body",
    testChecklist: ["Summary matches blockers", "Recommendation label correct"],
  },
  "appr-package-build": {
    implementationFiles: ["src/lib/campaign-events/approval-package.ts", "src/components/admin/campaign-events/ApprovalPackagePreviewPanel.tsx"],
    relatedRoutes: ["/admin/campaign-calendar/approval-package/[recordId]"],
    inputData: "Ledger row",
    outputData: "ApprovalPackagePayload",
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "Enable email send with signed links",
    testChecklist: ["Preview shows candidate emails", "Actions disabled", "Recipients from approval-recipients.ts"],
  },
  "appr-month-wizard": {
    implementationFiles: [
      "src/components/admin/campaign-events/month-review/MonthReviewWizard.tsx",
      "src/lib/campaign-events/month-review/month-review-queue.ts",
    ],
    relatedRoutes: ["/admin/campaign-events/review"],
    inputData: "Period ledger rows",
    outputData: "_review.decision, factCard patches",
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "Bulk approve still disabled by design",
    testChecklist: ["Speed mode shortcuts", "Focus filters", "Denied rows retained"],
  },
  "tl-month-report": {
    implementationFiles: [
      "src/lib/campaign-events/travel-report/travel-report-logic.ts",
      "src/components/admin/campaign-events/travel-report/MonthlyTravelReport.tsx",
    ],
    relatedRoutes: ["/admin/campaign-events/travel-report"],
    inputData: "Period CampaignEventLedgerRecord",
    outputData: "Report lines + CSV",
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "PDF export",
    testChecklist: ["April month loads", "CSV download", "Totals footer"],
  },
  "rpt-month-readiness": {
    implementationFiles: [
      "src/lib/campaign-events/month-readiness/build-month-readiness.ts",
      "src/app/admin/(board)/campaign-events/month-readiness/page.tsx",
    ],
    relatedRoutes: ["/admin/campaign-events/month-readiness"],
    inputData: "Period rows + normalized JSON",
    outputData: "Readiness score + quick action links",
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "Auto-refresh after each review save",
    testChecklist: ["April quick cards", "Score band", "Duplicate id warning"],
  },
  "conf-schedule": {
    implementationFiles: ["src/lib/campaign-events/conflicts.ts"],
    relatedRoutes: ["/admin/campaign-events/review?mode=conflicts"],
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "Auto-resolve suggestions",
    testChecklist: ["Overlapping events flagged", "Decision clears score factor"],
  },
  "conf-work-hours": {
    implementationFiles: ["src/lib/campaign-events/work-schedule.ts"],
    relatedRoutes: ["/admin/campaign-events/review?mode=work_hours"],
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "Calendar block integration",
    testChecklist: ["Mon-Fri warning", "Hold on approve"],
  },
  "cri-county-link": {
    implementationFiles: ["src/lib/county/county-workbench-event-links.ts", "src/components/admin/CountyWorkbenchLink.tsx"],
    relatedRoutes: ["/admin/counties/[slug]", "/admin/campaign-events/workbench"],
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "Embed county intel panel inline",
    testChecklist: ["Link resolves for known county", "WB ↗ when env set"],
  },
  "email-draft-scaffold": {
    implementationFiles: ["src/components/admin/campaign-events/EmailDraftScaffoldModal.tsx", "src/lib/campaign-events/email-draft-builder.ts"],
    relatedRoutes: ["/admin/campaign-events/review"],
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "SendGrid transport",
    testChecklist: ["Draft saves on record", "No outbound send"],
  },
  "appr-email-send": {
    implementationFiles: [
      "src/lib/campaign-events/approval-email/approval-email-send.ts",
      "src/lib/campaign-events/approval-email/approval-email-template.ts",
      "src/components/admin/campaign-events/ApprovalPackageSendPanel.tsx",
    ],
    relatedRoutes: ["/admin/campaign-calendar/approval-package/[recordId]", "/campaign-events/approval/[token]"],
    blocksAutomation: true,
    availableNow: true,
    nextBuildStep: "Enable EMAIL_SEND_ENABLED in production when ready",
    testChecklist: [
      "EMAIL_SEND_ENABLED=false → skipped_disabled log",
      "Dry-run script",
      "Token decision writes ledger only",
    ],
  },
  "rpt-csv-export": {
    implementationFiles: ["src/components/admin/campaign-events/travel-report/MonthlyTravelReport.tsx"],
    relatedRoutes: ["/admin/campaign-events/travel-report"],
    availableNow: true,
    blocksAutomation: false,
    testChecklist: ["Download CSV for April", "No server-side PII log"],
  },
  "cal-views-os": {
    implementationFiles: [
      "src/app/admin/(board)/campaign-calendar/timeline/page.tsx",
      "src/app/admin/(board)/campaign-calendar/month/page.tsx",
    ],
    relatedRoutes: [
      "/admin/campaign-calendar/timeline",
      "/admin/campaign-calendar/month",
      "/admin/campaign-calendar/week",
      "/admin/campaign-calendar/day",
    ],
    availableNow: true,
    blocksAutomation: false,
    testChecklist: ["Timeline loads period", "Drilldown from event card"],
  },
  "saas-planner-scaffold": {
    implementationFiles: ["src/components/admin/campaign-calendar/FranklinPlannerScaffold.tsx"],
    relatedRoutes: ["/admin/campaign-calendar/day", "/admin/campaign-calendar/agenda"],
    availableNow: true,
    blocksAutomation: false,
    nextBuildStep: "Sync notes to ledger optional field",
    testChecklist: ["localStorage persists", "No server write"],
  },
  "rpt-travel-summarizer": {
    implementationFiles: ["src/lib/campaign-events/travel-report/travel-report-logic.ts"],
    relatedRoutes: ["/admin/campaign-events/travel-report"],
    availableNow: true,
    blocksAutomation: false,
  },
  "hotwash-media-upload": {
    implementationFiles: [
      "src/lib/campaign-events/media/media-storage.ts",
      "src/components/admin/campaign-events/hot-wash/HotWashMediaSection.tsx",
    ],
    relatedRoutes: ["/admin/campaign-events/[recordId]"],
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "AI-enrich metadata on upload (event tags, faces)",
    testChecklist: ["Upload image from Hot Wash", "File in pending/uploader path", "Index row created"],
  },
  "campaign-manager-media-approval": {
    implementationFiles: [
      "src/app/admin/(board)/campaign-events/media-approval/page.tsx",
      "src/components/admin/campaign-events/hot-wash/MediaApprovalQueue.tsx",
    ],
    relatedRoutes: ["/admin/campaign-events/media-approval"],
    availableNow: true,
    blocksAutomation: true,
    nextBuildStep: "Bulk approve with safeguards",
    testChecklist: ["Approve moves to approved/", "Reject keeps file", "Pending queue updates"],
  },
  "rpt-readiness-score": {
    implementationFiles: ["src/lib/campaign-events/month-readiness/month-readiness-score.ts"],
    relatedRoutes: ["/admin/campaign-events/month-readiness"],
    availableNow: true,
    blocksAutomation: false,
  },
};

function sprint4OperationalOverride(tool: AiToolEntry): Partial<AiToolOperationalMeta> | undefined {
  const c =
    getContractById(SPRINT4_APPROVAL_EMAIL_TOOL_CONTRACTS, tool.id) ??
    getContractById(SPRINT5_PROMOTION_TOOL_CONTRACTS, tool.id) ??
    getContractById(GLOBAL_AGENT_ORCHESTRATION_TOOL_CONTRACTS, tool.id) ??
    getContractById(AGENT_INTELLIGENCE_TOOL_CONTRACTS, tool.id) ??
    getContractById(SPRINT2_AGENT_TOOL_CONTRACTS, tool.id) ??
    getContractById(SPRINT3_AGENT_TOOL_CONTRACTS, tool.id);
  if (!c) return undefined;
  return {
    implementationFiles: [c.deterministicHelperPath],
    relatedRoutes: c.routesUsingTool,
    inputData: c.inputs,
    outputData: c.outputs,
    availableNow: c.currentStatus === "functional" || c.currentStatus === "partial",
    blocksAutomation:
      c.humanApprovalRequired || c.riskLevel === "blocked" || /no send|no gcal|human/i.test(c.guardrails),
    nextBuildStep: c.futureAutomationPath,
    testChecklist: c.testChecklist,
  };
}

export function deriveOperationalMeta(tool: AiToolEntry): AiToolOperationalMeta {
  const override = TOOL_OPERATIONAL_META[tool.id] ?? sprint4OperationalOverride(tool);
  const blocksFromGuard = AUTOMATION_BLOCK_KEYWORDS.test(tool.guardrails);
  const blocksFromStatus =
    tool.status === "idea" &&
    /email|sms|gcal|send|sync write|voter|fin-1/i.test(`${tool.name} ${tool.purpose} ${tool.futureRoute}`);

  const availableDefault = tool.status === "functional" || tool.status === "partial";

  return {
    implementationFiles: override?.implementationFiles ?? inferFilesFromRoute(tool.futureRoute),
    relatedRoutes: override?.relatedRoutes ?? inferRoutes(tool.futureRoute),
    inputData: override?.inputData ?? tool.reads,
    outputData: override?.outputData ?? tool.writes,
    availableNow: override?.availableNow ?? availableDefault,
    blocksAutomation: override?.blocksAutomation ?? blocksFromGuard ?? blocksFromStatus,
    nextBuildStep: override?.nextBuildStep ?? defaultNextBuildStep(tool),
    testChecklist: override?.testChecklist ?? defaultTestChecklist(tool),
  };
}

function inferFilesFromRoute(route: string): string[] {
  if (route.endsWith(".ts") || route.endsWith(".tsx")) return [route.startsWith("src/") ? route : `src/lib/campaign-events/${route}`];
  return [];
}

function inferRoutes(route: string): string[] {
  if (route.startsWith("/admin")) return [route.split("?")[0]];
  if (route.startsWith("npm ")) return [];
  return [];
}

function defaultNextBuildStep(tool: AiToolEntry): string {
  switch (tool.status) {
    case "functional":
      return "Harden tests and document edge cases";
    case "partial":
      return "Complete remaining UI wiring and operator docs";
    case "scaffolded":
      return "Implement core logic and connect to ledger save path";
    default:
      return "Define schema + API contract, then scaffold UI entry point";
  }
}

function defaultTestChecklist(tool: AiToolEntry): string[] {
  return [
    `Verify trigger: ${tool.trigger}`,
    `Confirm reads: ${tool.reads}`,
    tool.humanApprovalRequired ? "Human approval path tested" : "Safe without approval gate",
    tool.writes === "—" || tool.writes.startsWith("—") ? "Read-only — no DB writes" : `Writes: ${tool.writes}`,
  ];
}

export type EnrichedAiTool = AiToolEntry & AiToolOperationalMeta & { lifecycleTitle: string };

export function maturityPoints(status: AiToolStatus): number {
  switch (status) {
    case "functional":
      return 100;
    case "partial":
      return 65;
    case "scaffolded":
      return 30;
    default:
      return 5;
  }
}

export function computeToolSystemReadinessScore(tools: EnrichedAiTool[]): number {
  if (!tools.length) return 0;
  const sum = tools.reduce((acc, t) => acc + maturityPoints(t.status), 0);
  return Math.round((sum / tools.length) * 10) / 10;
}
