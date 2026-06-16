import type { FieldEntryLocationSummary } from "@/lib/election-plan/field-entry/types";
import type { CountyStrikeTeam } from "@/lib/election-plan/load-county-strike-team";
import { getStrikeRoleLabels } from "@/lib/election-plan/load-county-strike-team";

import {
  getCountyV4HelpTenMetrics,
  getCountyV4LeadershipRoles,
  getCountyV4MyFiveMetrics,
  getCountyV4PipelineStages,
} from "./load-county-v4-framework";

export type CountyLeadershipSlot = {
  key: string;
  label: string;
  assigneeName: string | null;
  status: "OPEN" | "assigned" | "vacant" | "recruiting";
  /** PPEN A.0b — leadership opportunity applications for this role */
  interestedCandidates: number;
};

export type CountyRecordMetric = {
  key: string;
  label: string;
  count: number | null;
  drillAnchor: string | null;
  note: string | null;
};

export type CountyWorkbenchV4OperationalView = {
  leadership: CountyLeadershipSlot[];
  openPositions: CountyLeadershipSlot[];
  volunteerPipeline: CountyRecordMetric[];
  fieldLogVolunteers: number;
  fieldLogLeaders: number;
  myFive: CountyRecordMetric[];
  helpTen: CountyRecordMetric[];
  ppenLive: boolean;
};

function rollupQty(summary: FieldEntryLocationSummary | undefined, category: string): number {
  return summary?.rollups.find((r) => r.category === category)?.totalQuantity ?? 0;
}

export function buildCountyWorkbenchV4OperationalView(
  strikeTeam: CountyStrikeTeam | undefined,
  fieldEntrySummary: FieldEntryLocationSummary | undefined,
): CountyWorkbenchV4OperationalView {
  const roleLabels = getStrikeRoleLabels();
  const frameworkRoles = getCountyV4LeadershipRoles();

  const leadership: CountyLeadershipSlot[] = frameworkRoles.map((role) => {
    const strikeKey = role.strikeTeamKey;
    const strikeRole = strikeKey && strikeTeam?.roles[strikeKey];
    const label = strikeKey ? (roleLabels[strikeKey] ?? role.label) : role.label;
    if (!strikeRole) {
      return { key: role.key, label, assigneeName: null, status: "OPEN", interestedCandidates: 0 };
    }
    const assigned = strikeRole.status === "assigned" && strikeRole.name.trim().length > 0;
    return {
      key: role.key,
      label,
      assigneeName: assigned ? strikeRole.name.trim() : null,
      status: assigned ? "assigned" : strikeRole.status === "recruiting" ? "recruiting" : "OPEN",
      interestedCandidates: 0,
    };
  });

  const openPositions = leadership.filter((s) => s.status !== "assigned");

  const fieldLogVolunteers = rollupQty(fieldEntrySummary, "volunteer");
  const fieldLogLeaders = rollupQty(fieldEntrySummary, "leader");

  /** PPEN application pipeline — 0 until PPEN pilot gate; field log shown separately */
  const volunteerPipeline: CountyRecordMetric[] = getCountyV4PipelineStages().map((stage) => ({
    key: stage.key,
    label: stage.label,
    count: 0,
    drillAnchor: "volunteer-pipeline",
    note: `Awaiting ${stage.recordSource} records (PPEN pilot gate)`,
  }));

  const zeroMetric = (defs: ReturnType<typeof getCountyV4MyFiveMetrics>, note: string): CountyRecordMetric[] =>
    defs.map((d) => ({
      key: d.key,
      label: d.label,
      count: d.key.includes("pct") ? null : 0,
      drillAnchor: null,
      note,
    }));

  const ppenNote = "PPEN records — pilot gate: Sherwood + Jacksonville before county rollups";

  return {
    leadership,
    openPositions,
    volunteerPipeline,
    fieldLogVolunteers,
    fieldLogLeaders,
    myFive: zeroMetric(getCountyV4MyFiveMetrics(), ppenNote),
    helpTen: zeroMetric(getCountyV4HelpTenMetrics(), ppenNote),
    ppenLive: false,
  };
}
