import type { FieldEntryLocationSummary } from "@/lib/election-plan/field-entry/types";
import { loadFieldEntriesForLocation } from "@/lib/election-plan/field-entry/load-field-entries";
import { resolveLeaderGeographyScope } from "@/lib/volunteers/leader-scope";
import {
  ensureVolunteerLeaderOperator,
  loadLeaderOperatorRecord,
} from "@/lib/volunteers/ensure-leader-operator";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderFieldLogContext = {
  countySlug: string;
  countyName: string;
  citySlug: string | null;
  summary: FieldEntryLocationSummary;
  operatorInitials: string;
  operatorReady: boolean;
  operatorSource: "roster" | "election_plan" | null;
};

export async function buildLeaderFieldLogContext(
  leader: VolunteerLeader,
  opts?: { isSelf?: boolean },
): Promise<LeaderFieldLogContext | null> {
  const scope = resolveLeaderGeographyScope(leader);
  if (!scope.primaryCountySlug) return null;

  const countyConn = leader.connections.find((c) => c.kind === "county");
  const countyName =
    countyConn?.kind === "county" ? countyConn.county.replace(/\s+County$/i, "").trim() : scope.primaryCountySlug;

  const summary = await loadFieldEntriesForLocation({
    countySlug: scope.primaryCountySlug,
    citySlug: scope.primaryCitySlug,
  });

  if (!opts?.isSelf) {
    return {
      countySlug: scope.primaryCountySlug,
      countyName,
      citySlug: scope.primaryCitySlug,
      summary,
      operatorInitials: leader.initials,
      operatorReady: false,
      operatorSource: null,
    };
  }

  await ensureVolunteerLeaderOperator(leader);
  const op = await loadLeaderOperatorRecord(leader.initials);

  return {
    countySlug: scope.primaryCountySlug,
    countyName,
    citySlug: scope.primaryCitySlug,
    summary,
    operatorInitials: leader.initials,
    operatorReady: Boolean(op?.capabilities.includes("field_entry")),
    operatorSource: op ? "roster" : null,
  };
}
