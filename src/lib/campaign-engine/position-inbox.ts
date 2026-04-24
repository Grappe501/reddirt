/**
 * WB-CORE-1 + ASSIGN-2: Position-scoped inbox + workbench summary (read-only; no RBAC).
 * Builds on UWR-1 (`open-work.ts`) with explicit, narrow heuristics per supported `PositionId`.
 * Seat-occupant reads (`getOpenWorkForSeat`, `getOpenWorkForSeatOccupant`, `getSeatInboxWorkAlignment`) live in `open-work.ts`.
 * @see docs/position-workbench-foundation.md
 * @see docs/seat-aware-assignment-foundation.md
 */
import { OpenWorkSourceModel } from "./assignment";
import type { UnifiedOpenWorkItem, UnifiedOpenWorkQueryOptions } from "./open-work";
import {
  POSITION_TREE,
  type PositionId,
} from "./positions";

export const WB_CORE1_PACKET = "WB-CORE-1" as const;

export type PositionInboxSupportLevel = "full" | "partial" | "destinations_only";

/**
 * How to narrow the merged UWR-1 set for this position. Not persisted — planning field only.
 * "cm_triage" = same merge as `getOpenWorkForCampaignManager`.
 * "comms_lean" = email + intake (excludes generic tasks — tasks are not proven comms work in v1).
 * "field_lean" = intake + task (excludes email queue — not default field-ops in v1 heuristics).
 */
export type PositionInboxHeuristic = "cm_triage" | "comms_lean" | "field_lean" | "none";

export type PositionInboxConfig = {
  positionId: PositionId;
  supportLevel: PositionInboxSupportLevel;
  includedUwr1Sources: readonly (keyof typeof OpenWorkSourceModel)[];
  heuristic: PositionInboxHeuristic;
  /** Honest limitations for UI/docs */
  heuristicNote: string;
};

const COMMS_LEAN_SOURCES: (keyof typeof OpenWorkSourceModel)[] = [
  "EmailWorkflowItem",
  "WorkflowIntake",
];

const FIELD_LEAN_SOURCES: (keyof typeof OpenWorkSourceModel)[] = [
  "WorkflowIntake",
  "CampaignTask",
];

const SUPPORTED: Partial<Record<PositionId, PositionInboxConfig>> = {
  campaign_manager: {
    positionId: "campaign_manager",
    supportLevel: "full",
    includedUwr1Sources: [
      "EmailWorkflowItem",
      "WorkflowIntake",
      "CampaignTask",
      "CommunicationThread",
      "ArkansasFestivalIngest",
    ] as (keyof typeof OpenWorkSourceModel)[],
    heuristic: "cm_triage",
    heuristicNote:
      "CM triage slice = UWR-2 `getOpenWorkForCampaignManager`: unassigned (email, intake, task, actionable threads) + escalated email + pending festival ingests.",
  },
  communications_director: {
    positionId: "communications_director",
    supportLevel: "partial",
    includedUwr1Sources: COMMS_LEAN_SOURCES,
    heuristic: "comms_lean",
    heuristicNote: "Narrow: email + workflow intake. Generic tasks are excluded (no comms task typing in v1).",
  },
  email_comms_manager: {
    positionId: "email_comms_manager",
    supportLevel: "partial",
    includedUwr1Sources: COMMS_LEAN_SOURCES,
    heuristic: "comms_lean",
    heuristicNote: "Same as comms lean: triage + intake sources only; not a guarantee all rows belong to this seat in reality.",
  },
  volunteer_coordinator: {
    positionId: "volunteer_coordinator",
    supportLevel: "partial",
    includedUwr1Sources: FIELD_LEAN_SOURCES,
    heuristic: "field_lean",
    heuristicNote: "Intake + tasks; no email queue. Intake is not always volunteer-originated — filter is structural, not intent-classified.",
  },
  field_director: {
    positionId: "field_director",
    supportLevel: "partial",
    includedUwr1Sources: FIELD_LEAN_SOURCES,
    heuristic: "field_lean",
    heuristicNote: "Intake + tasks. Festival/field ingests and other field rails are not in UWR-1 v1; see workbench map.",
  },
};

function isAllowedSource(
  item: UnifiedOpenWorkItem,
  included: readonly (keyof typeof OpenWorkSourceModel)[],
): boolean {
  return included.includes(item.source as keyof typeof OpenWorkSourceModel);
}

function mergeDedupe(a: UnifiedOpenWorkItem[], b: UnifiedOpenWorkItem[]): UnifiedOpenWorkItem[] {
  const m = new Map<string, UnifiedOpenWorkItem>();
  for (const it of [...a, ...b]) {
    const k = `${it.source}:${it.id}`;
    if (!m.has(k)) m.set(k, it);
  }
  return [...m.values()];
}

function capItems(items: UnifiedOpenWorkItem[], max: number): UnifiedOpenWorkItem[] {
  return items.slice(0, max);
}

/**
 * UWR-1 merge for comms-lean: unassigned + escalated email, then filter to email + intake.
 */
async function getCommsLeanInbox(
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  const { getUnassignedOpenWork, getEscalatedOpenWork } = await import("./open-work");
  const [un, esc] = await Promise.all([getUnassignedOpenWork(options), getEscalatedOpenWork(options)]);
  const merged = mergeDedupe(
    un.filter((i) => isAllowedSource(i, COMMS_LEAN_SOURCES)),
    esc.filter((i) => isAllowedSource(i, COMMS_LEAN_SOURCES)),
  );
  const sort = merged.sort((a, b) => b._uwr1SortKey - a._uwr1SortKey);
  return capItems(sort, options?.maxTotal ?? 200);
}

/**
 * Unassigned only, then filter to intake + task (and optionally re-sort).
 */
async function getFieldLeanInbox(
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  const { getUnassignedOpenWork } = await import("./open-work");
  const un = await getUnassignedOpenWork(options);
  const filtered = un.filter((i) => isAllowedSource(i, FIELD_LEAN_SOURCES));
  const sort = filtered.sort((a, b) => b._uwr1SortKey - a._uwr1SortKey);
  return capItems(sort, options?.maxTotal ?? 200);
}

export function getPositionInboxConfigOrNull(
  positionId: string,
): PositionInboxConfig | null {
  return SUPPORTED[positionId as PositionId] ?? null;
}

/**
 * Inbox list for a position when we have a defined heuristic. Unsupported positions: empty list (see summary).
 */
export async function getInboxForPosition(
  positionId: PositionId,
  options?: UnifiedOpenWorkQueryOptions,
): Promise<UnifiedOpenWorkItem[]> {
  const cfg = getPositionInboxConfigOrNull(positionId);
  if (!cfg) return [];
  if (cfg.heuristic === "cm_triage") {
    const { getOpenWorkForCampaignManager } = await import("./open-work");
    return getOpenWorkForCampaignManager(options);
  }
  if (cfg.heuristic === "comms_lean") {
    return getCommsLeanInbox(options);
  }
  if (cfg.heuristic === "field_lean") {
    return getFieldLeanInbox(options);
  }
  return [];
}

export function getHighPriorityInboxItemsForPosition(
  items: readonly UnifiedOpenWorkItem[],
  max: number = 12,
): UnifiedOpenWorkItem[] {
  const out: UnifiedOpenWorkItem[] = [];
  for (const it of items) {
    const esc = it.escalationLabel;
    const pr = (it.priorityLabel ?? "").toString();
    if (
      esc != null && esc.length > 0
      || pr === "URGENT"
      || pr === "HIGH"
    ) {
      out.push(it);
    }
  }
  return out.slice(0, max);
}

export type WorkbenchSummaryForPosition = {
  positionId: PositionId;
  displayName: string;
  parent: { id: PositionId; displayName: string } | null;
  supportLevel: PositionInboxSupportLevel;
  config: PositionInboxConfig | null;
  includedDestinations: readonly string[];
  filterStrategy: "user_assignee_none_yet" | "structural_uwr1_only";
  guidanceSlotsEmpty: true;
  /** Inbox count from last fetch when provided */
  itemCount?: number;
};

function positionNode(
  id: PositionId,
): (typeof POSITION_TREE)[number] | null {
  return POSITION_TREE.find((n) => n.id === id) ?? null;
}

/**
 * Read-only: role + parent + linked routes. No user seating — `filterStrategy` is always structural for v1.
 */
export function getWorkbenchSummaryForPosition(
  positionId: PositionId,
  opts?: { itemCount?: number },
): WorkbenchSummaryForPosition {
  const n = positionNode(positionId);
  if (!n) {
    return {
      positionId,
      displayName: positionId,
      parent: null,
      supportLevel: "destinations_only",
      config: null,
      includedDestinations: [],
      filterStrategy: "structural_uwr1_only",
      guidanceSlotsEmpty: true,
      itemCount: opts?.itemCount,
    };
  }
  const parent = n.parentId ? positionNode(n.parentId) : null;
  const cfg = getPositionInboxConfigOrNull(positionId);
  return {
    positionId,
    displayName: n.displayName,
    parent: parent ? { id: parent.id, displayName: parent.displayName } : null,
    supportLevel: cfg?.supportLevel ?? "destinations_only",
    config: cfg,
    includedDestinations: [...n.workbenchRouteHints],
    filterStrategy: "structural_uwr1_only",
    guidanceSlotsEmpty: true,
    itemCount: opts?.itemCount,
  };
}
