import {
  CommunicationObjective,
  CommunicationPlanStatus,
} from "@prisma/client";
import type { CommunicationPlanListQuery } from "./types";

const STATUSES = new Set<string>(Object.values(CommunicationPlanStatus));
const OBJECTIVES = new Set<string>(Object.values(CommunicationObjective));

/**
 * Map URL search params to Packet 2 `listCommunicationPlans` options (read-only list route).
 */
export function communicationPlanListQueryFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): CommunicationPlanListQuery {
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
  };

  const out: CommunicationPlanListQuery = {
    take: 100,
    orderByField: "updatedAt",
    orderDirection: "desc",
  };

  const status = get("status");
  if (status && STATUSES.has(status)) {
    out.status = status as CommunicationPlanStatus;
  }

  const objective = get("objective");
  if (objective && OBJECTIVES.has(objective)) {
    out.objective = objective as CommunicationObjective;
  }

  const ownerUserId = get("owner");
  if (ownerUserId?.trim()) {
    out.ownerUserId = ownerUserId.trim();
  }

  const q = get("q");
  if (q?.trim()) {
    out.search = q.trim();
  }

  const needsAction = get("needsAction");
  if (needsAction === "1" || needsAction === "true") {
    out.needsAction = true;
  }

  const sort = get("sort");
  if (sort === "scheduled_asc") {
    out.orderByField = "scheduledAt";
    out.orderDirection = "asc";
  } else if (sort === "updated_asc") {
    out.orderByField = "updatedAt";
    out.orderDirection = "asc";
  } else if (sort === "created_desc") {
    out.orderByField = "createdAt";
    out.orderDirection = "desc";
  }

  return out;
}
