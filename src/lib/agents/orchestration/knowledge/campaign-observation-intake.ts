/**
 * Observation intake — convert raw notes and signals into structured CampaignObservation.
 * Auto-suggest only; sensitive/strategic content requires human approval per memory model.
 */

import type { UserObservationEntry } from "@/lib/agents/user-intelligence/user-observations";
import type { CampaignDomainId } from "../campaign-state-types";
import type {
  CampaignKnowledgeEntity,
  CampaignKnowledgeEdge,
  CampaignLesson,
  CampaignObservation,
  CampaignObservationApprovalStatus,
  CampaignObservationSensitivity,
  CampaignObservationType,
} from "./campaign-knowledge-types";

const PROHIBITED_PATTERNS = [/ssn/i, /password/i, /api[_-]?key/i, /secret/i, /voter file row/i];

export type RawObservationInput = {
  title: string;
  rawText?: string;
  source: string;
  type?: CampaignObservationType;
  domains?: CampaignDomainId[];
  counties?: string[];
  people?: string[];
  tags?: string[];
  sensitivity?: CampaignObservationSensitivity;
  approvalStatus?: CampaignObservationApprovalStatus;
};

function obsId(ref: string): string {
  return `obs:${ref}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
}

function domainFromPath(pathname?: string): CampaignDomainId {
  if (!pathname) return "campaign_management";
  if (pathname.includes("county")) return "county";
  if (pathname.includes("communication") || pathname.includes("email")) return "communications";
  if (pathname.includes("reimbursement") || pathname.includes("finance")) return "finance";
  if (pathname.includes("volunteer")) return "volunteer";
  if (pathname.includes("workbench") || pathname.includes("campaign-events")) return "event_planning";
  if (pathname.includes("compliance")) return "compliance";
  return "campaign_management";
}

function containsProhibitedContent(text: string): boolean {
  return PROHIBITED_PATTERNS.some((p) => p.test(text));
}

function inferType(input: RawObservationInput): CampaignObservationType {
  if (input.type) return input.type;
  const t = `${input.title} ${input.rawText ?? ""} ${input.source}`.toLowerCase();
  if (t.includes("hot wash") || t.includes("hotwash")) return "event_hot_wash";
  if (t.includes("county")) return "county_signal";
  if (t.includes("email") || t.includes("comms")) return "comms_signal";
  if (t.includes("volunteer")) return "volunteer_signal";
  if (t.includes("finance") || t.includes("reimbursement")) return "finance_signal";
  if (t.includes("compliance")) return "compliance_signal";
  if (t.includes("calendar") || t.includes("schedule")) return "scheduling_signal";
  if (t.includes("media")) return "media_signal";
  if (t.includes("workflow")) return "workflow_outcome";
  if (t.includes("recommendation")) return "recommendation_feedback";
  return "staff_note";
}

function defaultSensitivity(type: CampaignObservationType): CampaignObservationSensitivity {
  if (type === "finance_signal" || type === "compliance_signal" || type === "human_decision") return "sensitive";
  if (type === "county_signal" || type === "event_hot_wash") return "strategic";
  return "internal";
}

export function intakeRawObservation(input: RawObservationInput): CampaignObservation | null {
  const combined = `${input.title} ${input.rawText ?? ""}`;
  if (containsProhibitedContent(combined)) return null;

  const now = new Date().toISOString();
  const type = inferType(input);
  const sensitivity = input.sensitivity ?? defaultSensitivity(type);
  const requiresApproval = sensitivity === "sensitive" || sensitivity === "strategic";
  const approvalStatus = input.approvalStatus ?? (requiresApproval ? "proposed" : "approved");
  const id = obsId(`${type}:${input.source}:${now}`);

  const suggestedEntities: Partial<CampaignKnowledgeEntity>[] = [
    {
      id,
      type: "observation",
      label: input.title.slice(0, 100),
      summary: input.rawText?.slice(0, 300) ?? input.title,
      domains: input.domains ?? ["campaign_management"],
    },
  ];

  for (const county of input.counties ?? []) {
    suggestedEntities.push({
      id: `county:${county}`,
      type: "county",
      label: county,
      summary: `Referenced in observation: ${input.title}`,
      counties: [county],
      domains: ["county"],
    });
  }

  const suggestedEdges: Partial<CampaignKnowledgeEdge>[] = (input.counties ?? []).map((c) => ({
    fromId: id,
    toId: `county:${c}`,
    relationship: "involved_county" as const,
    confidence: 70,
    evidence: [input.title],
  }));

  const suggestedLessons: Partial<CampaignLesson>[] = [];
  if (type === "event_hot_wash" || type === "workflow_outcome") {
    suggestedLessons.push({
      type: type === "event_hot_wash" ? "event_learning" : "workflow_learning",
      title: `Lesson from: ${input.title.slice(0, 60)}`,
      summary: input.rawText?.slice(0, 200) ?? input.title,
      whyItMatters: "Hot wash and workflow outcomes teach the campaign what to repeat or avoid.",
      domains: input.domains ?? ["event_planning"],
      approvalStatus: "proposed",
      actionability: "medium",
    });
  }

  return {
    id,
    type,
    title: input.title,
    summary: input.rawText?.slice(0, 500) ?? input.title,
    rawText: input.rawText,
    domains: input.domains ?? ["campaign_management"],
    counties: input.counties ?? [],
    people: input.people ?? [],
    source: input.source,
    confidence: requiresApproval ? 55 : 72,
    sensitivity,
    approvalStatus,
    createdAt: now,
    evidence: input.tags ?? [],
    suggestedEntities,
    suggestedEdges,
    suggestedLessons,
  };
}

export function intakeFromUserObservationEntries(entries: UserObservationEntry[]): CampaignObservation[] {
  const out: CampaignObservation[] = [];
  for (const o of entries.slice(-40)) {
    const typeMap: Partial<Record<string, CampaignObservationType>> = {
      hotwash_completed: "event_hot_wash",
      county_signal_detected: "county_signal",
      flow_abandoned: "tool_usage_signal",
      abandoned_flow: "tool_usage_signal",
      strategic_signal_detected: "human_decision",
    };
    const obs = intakeRawObservation({
      title: o.event.replaceAll("_", " "),
      source: `user-observation:${o.event}`,
      type: typeMap[o.event] ?? "staff_note",
      domains: [domainFromPath(o.pathname)],
      tags: o.pathname ? [o.pathname] : [],
      sensitivity: o.event.includes("strategic") ? "strategic" : "internal",
    });
    if (obs) out.push(obs);
  }
  return out;
}

export function mergeObservations(...lists: CampaignObservation[][]): CampaignObservation[] {
  const map = new Map<string, CampaignObservation>();
  for (const list of lists) for (const o of list) map.set(o.id, o);
  return [...map.values()].slice(-80);
}
