import {
  CampaignEventStatus,
  EventWorkflowState,
  type CampaignEvent,
  type CampaignTask,
  type User,
} from "@prisma/client";
import { TimeMatrixQuadrant } from "@prisma/client";

export type ChecklistSection = "prep" | "comms" | "staffing" | "followUp";

export type ChecklistItem = { id: string; label: string; done: boolean };

export type ExecutionChecklist = Record<ChecklistSection, ChecklistItem[]>;

const defaultLabels: Record<ChecklistSection, string[]> = {
  prep: ["Venue & permits confirmed", "Run of show", "Signage / wayfinding", "Supplies & merch"],
  comms: ["List sent", "Reminders scheduled", "Press / social draft", "RSVP / signup link tested"],
  staffing: ["Lead assigned", "Volunteer roles covered", "Training / briefing sent", "Day-of check-in person"],
  followUp: ["Thank-you / recap planned", "Media capture task", "Data / signups export", "Donor / volunteer follow-up"],
};

function genId() {
  return `c${Math.random().toString(36).slice(2, 9)}`;
}

export function ensureExecutionChecklist(raw: unknown): ExecutionChecklist {
  const o = (raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}) as Partial<
    Record<ChecklistSection, unknown>
  >;
  const out: ExecutionChecklist = { prep: [], comms: [], staffing: [], followUp: [] };
  (Object.keys(out) as ChecklistSection[]).forEach((section) => {
    const list = o[section];
    if (Array.isArray(list) && list.length > 0) {
      out[section] = list
        .map((x) => {
          if (x && typeof x === "object" && "label" in x) {
            const l = (x as { id?: string; label: string; done?: boolean });
            return { id: l.id || genId(), label: String(l.label), done: Boolean(l.done) };
          }
          return null;
        })
        .filter(Boolean) as ChecklistItem[];
    } else {
      out[section] = defaultLabels[section].map((label) => ({ id: genId(), label, done: false }));
    }
  });
  return out;
}

function checklistCompletion(check: ExecutionChecklist) {
  const all = (["prep", "comms", "staffing", "followUp"] as const).flatMap((k) => check[k]);
  if (all.length === 0) return 0;
  return all.filter((i) => i.done).length / all.length;
}

export function computeEventHealthScore(input: {
  event: CampaignEvent & { county?: { displayName: string } | null; ownerUser?: Pick<User, "id" | "name" | "email"> | null };
  tasks: { status: CampaignTask["status"]; timeMatrixQuadrant: CampaignTask["timeMatrixQuadrant"] }[];
  checklist: ExecutionChecklist;
}): { score0to100: number; factors: string[] } {
  const factors: string[] = [];
  let pts = 50;

  if (input.event.campaignIntent && input.event.campaignIntent.trim().length > 8) {
    pts += 10;
  } else {
    factors.push("Add campaign intent (why this event exists).");
  }

  if (input.event.county) {
    pts += 8;
  } else {
    factors.push("No county — assign geographic impact.");
  }

  if (input.event.ownerUserId) {
    pts += 7;
  } else {
    factors.push("No owner — assign a lead.");
  }

  if (input.event.status === CampaignEventStatus.CANCELLED || input.event.eventWorkflowState === EventWorkflowState.CANCELED) {
    return { score0to100: 0, factors: ["Event cancelled."] };
  }

  if (input.event.eventWorkflowState === EventWorkflowState.COMPLETED) {
    return { score0to100: 100, factors: ["Stage: completed."] };
  }

  if (input.event.timeMatrixQuadrant === TimeMatrixQuadrant.Q2) {
    pts += 5;
  }

  const openTasks = input.tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length;
  if (openTasks > 4) {
    factors.push("Heavy open task load.");
    pts -= 5;
  } else if (openTasks === 0) {
    pts += 5;
  }

  const c = checklistCompletion(input.checklist);
  pts += Math.round(15 * c);
  if (c < 0.35) {
    factors.push("Checklists are mostly open — close prep, comms, staffing, and follow-up.");
  }

  const d = (input.event.endAt.getTime() - new Date().getTime()) / 36e5;
  if (d < 24 && c < 0.5) {
    factors.push("Event soon — complete remaining execution items.");
  }

  return { score0to100: Math.max(0, Math.min(100, Math.round(pts))), factors };
}
