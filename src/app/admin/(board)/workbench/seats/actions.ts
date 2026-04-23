"use server";

import { PositionSeatStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isValidPositionId } from "@/lib/campaign-engine/positions";
import { prisma } from "@/lib/db";

const STATUSES: PositionSeatStatus[] = [
  "VACANT",
  "FILLED",
  "ACTING",
  "SHADOW",
];

function parseStatus(s: string | null | undefined): PositionSeatStatus {
  if (s && STATUSES.includes(s as PositionSeatStatus)) {
    return s as PositionSeatStatus;
  }
  return "VACANT";
}

/**
 * SEAT-1: staffing metadata only. Does not re-route UWR-1, does not enforce permissions.
 */
export async function setPositionSeatState(formData: FormData): Promise<void> {
  const positionKey = String(formData.get("positionKey") ?? "");
  if (!isValidPositionId(positionKey)) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[setPositionSeatState] invalid positionKey");
    }
    return;
  }

  const userIdRaw = (formData.get("userId") as string | null) ?? "";
  const userId = userIdRaw.trim() === "" ? null : userIdRaw.trim();
  if (userId) {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    if (!u) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("[setPositionSeatState] user not found");
      }
      return;
    }
  }

  const statusIn = parseStatus((formData.get("status") as string) ?? "VACANT");
  const actingForRaw = String(formData.get("actingForPositionKey") ?? "").trim();
  const actingForPositionKey =
    actingForRaw && isValidPositionId(actingForRaw) ? actingForRaw : null;

  const status: PositionSeatStatus = userId
    ? statusIn === "VACANT"
      ? "FILLED"
      : statusIn
    : "VACANT";

  await prisma.positionSeat.upsert({
    where: { positionKey },
    create: {
      positionKey,
      userId,
      status,
      actingForPositionKey: userId && status === "ACTING" ? actingForPositionKey : null,
    },
    update: {
      userId,
      status,
      actingForPositionKey: userId && status === "ACTING" ? actingForPositionKey : null,
    },
  });

  revalidatePath("/admin/workbench/seats");
  revalidatePath("/admin/workbench/positions");
  revalidatePath(`/admin/workbench/positions/${positionKey}`);
}
