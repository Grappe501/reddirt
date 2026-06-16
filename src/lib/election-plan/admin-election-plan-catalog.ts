import "server-only";

export type {
  AdminElectionPlanCatalog,
  AdminElectionPlanLink,
  AdminElectionPlanSection,
} from "@/lib/election-plan/admin-election-plan-catalog-types";
export { ADMIN_ELECTION_PLAN_HREF } from "@/lib/election-plan/admin-election-plan-href";
export { buildAdminElectionPlanCatalogFromSnapshot } from "@/lib/election-plan/admin-election-plan-catalog-build";

import { buildAdminElectionPlanCatalogFromSnapshot } from "@/lib/election-plan/admin-election-plan-catalog-build";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";

/** Full election-plan link registry for admin operators — every workbench and portal route. */
export function buildAdminElectionPlanCatalog() {
  return buildAdminElectionPlanCatalogFromSnapshot(loadElectionPlanSnapshot());
}
