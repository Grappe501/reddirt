/**
 * FIELD-1: Read-only field geography seam (`FieldUnit` / `FieldAssignment` → positions + seats).
 * @see docs/field-structure-foundation.md
 */

import { FieldUnitType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isValidPositionId, type PositionId } from "./positions";

export const FIELD1_PACKET = "FIELD-1" as const;

/** County / hyper-local field leadership roles in ROLE-1 (see `positions.ts`). */
export const COUNTY_FIELD_LEADER_POSITION_IDS: readonly PositionId[] = [
  "county_regional_coordinator",
  "field_organizer",
] as const;

export async function listFieldUnits(options?: { parentId?: string | null }) {
  const parentId = options?.parentId;
  return prisma.fieldUnit.findMany({
    where:
      parentId === undefined
        ? {}
        : { parentId: parentId === null ? null : parentId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function getFieldAssignments(options?: { fieldUnitId?: string; positionId?: string; userId?: string }) {
  return prisma.fieldAssignment.findMany({
    where: {
      ...(options?.fieldUnitId ? { fieldUnitId: options.fieldUnitId } : {}),
      ...(options?.positionId ? { positionId: options.positionId } : {}),
      ...(options?.userId ? { userId: options.userId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      fieldUnit: true,
      user: { select: { id: true, name: true, email: true } },
      positionSeat: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
}

/**
 * County-typed `FieldUnit` rows with assignments whose `positionId` is a **county / field lead** in ROLE-1.
 * Empty assignments do not create rows; units with no leader assignments still appear.
 */
export async function getFieldLeadersByCounty() {
  const leaderSet = new Set<string>(COUNTY_FIELD_LEADER_POSITION_IDS);
  const units = await prisma.fieldUnit.findMany({
    where: { type: FieldUnitType.COUNTY },
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: {
          positionId: { in: [...leaderSet] },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          positionSeat: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return units;
}

/**
 * Defensive: drop assignments whose `positionId` is not a known `PositionId` (bad data or legacy string).
 */
export function isAssignmentPositionIdValid(positionId: string): positionId is PositionId {
  return isValidPositionId(positionId);
}
