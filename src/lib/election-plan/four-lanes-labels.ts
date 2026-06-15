/** Canonical four-lane labels — source: four-lanes-dashboard.json */

export type FourLaneId = "lane1" | "lane2" | "lane3" | "lane4";

export const FOUR_LANE_DEFINITIONS: Record<
  FourLaneId,
  {
    number: 1 | 2 | 3 | 4;
    shortName: string;
    voteGoal: string;
    fullLabel: string;
    tableHeader: string;
  }
> = {
  lane1: {
    number: 1,
    shortName: "Democratic Retention",
    voteGoal: "hold baseline Democratic votes",
    fullLabel: "Lane 1 — Democratic Retention",
    tableHeader: "Lane 1 · Retention",
  },
  lane2: {
    number: 2,
    shortName: "Democratic Reactivation",
    voteGoal: "recover drop-off Democrats who skipped 2022",
    fullLabel: "Lane 2 — Democratic Reactivation",
    tableHeader: "Lane 2 · Reactivation",
  },
  lane3: {
    number: 3,
    shortName: "New Voter Registration",
    voteGoal: "register 50,000 new voters statewide",
    fullLabel: "Lane 3 — New Voter Registration",
    tableHeader: "Lane 3 · Registration",
  },
  lane4: {
    number: 4,
    shortName: "Republican / Independent Conversion",
    voteGoal: "relationship persuasion · 12% peel model",
    fullLabel: "Lane 4 — Republican / Independent Conversion",
    tableHeader: "Lane 4 · Conversion",
  },
};

export function fourLaneIdFromNumber(n: 1 | 2 | 3 | 4): FourLaneId {
  return `lane${n}` as FourLaneId;
}

/** e.g. Lane 1 — Democratic Retention (hold baseline Democratic votes) */
export function laneDescriptiveLabel(id: FourLaneId): string {
  const d = FOUR_LANE_DEFINITIONS[id];
  return `${d.fullLabel} (${d.voteGoal})`;
}

export function laneDescriptiveLabelByNumber(n: 1 | 2 | 3 | 4): string {
  return laneDescriptiveLabel(fourLaneIdFromNumber(n));
}

export const FOUR_LANE_STRATEGY_SUMMARY =
  "Four-lane plurality strategy — retention + reactivation + registration + conversion";
