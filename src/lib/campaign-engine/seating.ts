/**
 * SEAT-1 + ASSIGN-2: Position seat occupancy read model + roll-up hints (read-first).
 * `PositionSeat` in Prisma is staffing metadata only — no UWR-1 routing, no RBAC, no auto-reassignment.
 * @see docs/position-seating-foundation.md
 * @see docs/delegation-and-coverage-foundation.md
 * @see docs/seat-aware-assignment-foundation.md
 */
import { PositionSeatStatus, type PositionSeat, type User } from "@prisma/client";
import { prisma } from "../db";
import type { SeatAssignmentContext, SeatStatusForAssignment } from "./assignment";
import {
  ALL_POSITION_IDS,
  getChildPositions,
  type PositionId,
  type PositionNode,
  POSITION_TREE,
} from "./positions";

export const SEAT1_PACKET = "SEAT-1" as const;

export type { PositionSeatStatus };

export type EnrichedUser = { id: string; name: string | null; email: string };

/** Merged view: every ROLE-1 position has a seat row (synthetic if DB has no row). */
export type PositionSeatRow = {
  position: PositionNode;
  /** DB row, if we created or upserted one; otherwise `null` = never staff-tracked, treated vacant. */
  record: (PositionSeat & { user: User | null }) | null;
  /** Effective state for display: vacant when no user or explicit VACANT. */
  effectiveStatus: PositionSeatStatus;
  /** When vacant, work attention is conceptually inherited by the parent (CM coverage story). */
  rollUpTo: PositionId | null;
  displayUser: EnrichedUser | null;
  /** For ACTING, optional from DB. */
  actingForPositionKey: string | null;
};

export type PositionSeatForWorkbench = {
  hasRecord: boolean;
  effectiveStatus: PositionSeatStatus;
  /** Empty when vacant / unknown. */
  displayUser: EnrichedUser | null;
  /** Parent in ROLE-1 tree (context for “vacant → roll up”). */
  parentId: PositionId | null;
  /** When vacant, which position key is “up” (same as `parentId`). */
  rollUpToPositionId: PositionId | null;
  actingForPositionKey: string | null;
  notes: string | null;
};

export type CoverageSummary = {
  totalPositions: number;
  withDbRow: number;
  vacant: number;
  filled: number;
  acting: number;
  shadow: number;
  /** Positions with no occupant; parent may be CM or another director. */
  vacantPositionKeys: PositionId[];
  /** Vacant node ids whose parent is campaign_manager (CM coverage gap signal). */
  vacantUnderCampaignManager: number;
};

/**
 * All ROLE-1 positions with current seat data (one synthetic row per position when no DB record).
 */
export async function listPositionSeats(): Promise<PositionSeatRow[]> {
  const [rows, nodes] = await Promise.all([
    prisma.positionSeat.findMany({ include: { user: true } }),
    Promise.resolve([...POSITION_TREE]),
  ]);
  const byKey = new Map(rows.map((r) => [r.positionKey, r] as const));
  return nodes
    .filter((p) => ALL_POSITION_IDS.includes(p.id))
    .map((position) => buildSeatRow(position, byKey.get(position.id) ?? null));
}

/**
 * One position’s seat; if no row in DB, returns synthetic vacant (not persisted).
 */
export async function getSeatForPosition(
  positionId: PositionId,
): Promise<PositionSeatRow> {
  const pos = POSITION_TREE.find((p) => p.id === positionId);
  if (!pos) {
    throw new Error(`Unknown position: ${positionId}`);
  }
  const row = await prisma.positionSeat.findUnique({
    where: { positionKey: positionId },
    include: { user: true },
  });
  return buildSeatRow(pos, row);
}

/**
 * All seats a user is linked to (can be more than one in v1; not forbidden).
 */
export async function getSeatsForUser(userId: string): Promise<PositionSeatRow[]> {
  const rows = await prisma.positionSeat.findMany({
    where: { userId },
    include: { user: true },
  });
  return rows
    .map((r) => {
      const pos = POSITION_TREE.find((p) => p.id === r.positionKey);
      return pos ? buildSeatRow(pos, r) : null;
    })
    .filter((x): x is PositionSeatRow => x != null);
}

/**
 * Counts and lists for the coverage / CM story (read-only).
 */
export async function getCoverageSummary(): Promise<CoverageSummary> {
  const all = await listPositionSeats();
  let withDbRow = 0;
  let vacant = 0;
  let filled = 0;
  let acting = 0;
  let shadow = 0;
  const vacantPositionKeys: PositionId[] = [];
  let vacantUnderCampaignManager = 0;
  for (const r of all) {
    if (r.record) withDbRow += 1;
    switch (r.effectiveStatus) {
      case "VACANT":
        vacant += 1;
        vacantPositionKeys.push(r.position.id);
        if (r.position.parentId === "campaign_manager") vacantUnderCampaignManager += 1;
        break;
      case "FILLED":
        filled += 1;
        break;
      case "ACTING":
        acting += 1;
        break;
      case "SHADOW":
        shadow += 1;
        break;
      default:
        break;
    }
  }
  return {
    totalPositions: all.length,
    withDbRow,
    vacant,
    filled,
    acting,
    shadow,
    vacantPositionKeys,
    vacantUnderCampaignManager,
  };
}

/**
 * For position workbench: who sits here, and roll-up if vacant. No work reassignment.
 */
export async function getPositionWorkbenchSeatContext(
  positionId: PositionId,
): Promise<PositionSeatForWorkbench> {
  const row = await getSeatForPosition(positionId);
  return {
    hasRecord: row.record != null,
    effectiveStatus: row.effectiveStatus,
    displayUser: row.displayUser,
    parentId: row.position.parentId,
    rollUpToPositionId: row.rollUpTo,
    actingForPositionKey: row.record?.actingForPositionKey ?? null,
    notes: row.record?.notes ?? null,
  };
}

/**
 * When a sub-seat is vacant, “attention” conceptually rolls to the parent in the org tree
 * (CM sees coverage gaps; does not move queue rows in SEAT-1).
 */
export function getRollupTargetPositionId(positionId: PositionId): PositionId | null {
  const n = POSITION_TREE.find((p) => p.id === positionId);
  return n?.parentId ?? null;
}

function parentDisplayName(positionId: PositionId | null): string | null {
  if (!positionId) return null;
  return POSITION_TREE.find((p) => p.id === positionId)?.displayName ?? null;
}

/**
 * ASSIGN-2: join seat row + ROLE-1 tree for assignment / workbench copy. Read-only.
 */
export async function getSeatAssignmentContext(
  positionId: PositionId,
): Promise<SeatAssignmentContext> {
  const row = await getSeatForPosition(positionId);
  const parentId = row.position.parentId;
  const vacant = row.effectiveStatus === "VACANT";
  const eff: SeatStatusForAssignment = !row.record
    ? "SYNTHETIC_VACANT"
    : row.record && !row.displayUser
      ? "VACANT"
      : (row.effectiveStatus as SeatStatusForAssignment);
  return {
    positionId,
    seatOccupantUserId: row.displayUser?.id ?? null,
    structuralParentPositionId: parentId,
    inheritedAttentionToPositionId: vacant ? parentId : null,
    inheritedAttentionToDisplayName: vacant ? parentDisplayName(parentId) : null,
    effectiveSeatStatus: eff,
    actingForPositionKey: row.actingForPositionKey,
    hasPersistedSeatRow: row.record != null,
    domainAssignmentIsUserScopedOnly: true,
    recommendedAssigneeUserId: null,
  };
}

function buildSeatRow(
  position: PositionNode,
  record: (PositionSeat & { user: User | null }) | null,
): PositionSeatRow {
  const rollUpTo = position.parentId;
  if (!record) {
    return {
      position,
      record: null,
      effectiveStatus: "VACANT",
      rollUpTo,
      displayUser: null,
      actingForPositionKey: null,
    };
  }
  const hasUser = record.userId != null && record.user != null;
  let effectiveStatus: PositionSeatStatus;
  if (!hasUser) {
    effectiveStatus = "VACANT";
  } else {
    // If DB row has a user but status was left VACANT, treat as filled for display (metadata inconsistency).
    effectiveStatus = record.status === "VACANT" ? "FILLED" : record.status;
  }
  const displayUser: EnrichedUser | null = record.user
    ? { id: record.user.id, name: record.user.name, email: record.user.email }
    : null;
  return {
    position,
    record,
    effectiveStatus,
    rollUpTo,
    displayUser,
    actingForPositionKey: record.actingForPositionKey,
  };
}

/**
 * “Risky” = vacant seat with at least one child position in the tree (shallow org hole).
 * Heuristic: not workload-based (no load engine in SEAT-1).
 */
export function getVacantSeatsWithUnfilledSubtrees(rows: PositionSeatRow[]): PositionId[] {
  const risky = new Set<PositionId>();
  const byId = new Map(rows.map((r) => [r.position.id, r] as const));
  for (const r of rows) {
    if (r.effectiveStatus !== "VACANT") continue;
    const children = getChildPositions(r.position.id);
    for (const ch of children) {
      if (byId.get(ch.id)?.effectiveStatus === "VACANT") {
        risky.add(r.position.id);
        break;
      }
    }
  }
  return [...risky];
}
