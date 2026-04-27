import type { PowerOf5RelationalChartBundle } from "@/lib/campaign-engine/county-dashboards/types";

export type RelationalChartScaleInput = {
  invited: number;
  activated: number;
  /** Meaningful relational touches / week rollup (demo). */
  conversations: number;
  followUpsDue: number;
  /** Optional override for funnel third bar (else derived from activated). */
  teamsLinkedApprox?: number;
};

/**
 * Deterministic demo relational charts — same math family for state, region, and county payloads.
 * Labels stay aggregate; never emit individual identifiers.
 */
export function buildPowerOf5RelationalChartDemo(input: RelationalChartScaleInput): PowerOf5RelationalChartBundle {
  const { invited, activated, conversations, followUpsDue } = input;
  const teamsLinked = input.teamsLinkedApprox ?? Math.max(0, Math.round(activated * 0.52));

  return {
    conversationsTrend: [
      { label: "W−3", value: Math.max(0, Math.round(conversations * 0.72)) },
      { label: "W−2", value: Math.max(0, Math.round(conversations * 0.8)) },
      { label: "W−1", value: Math.max(0, Math.round(conversations * 0.92)) },
      { label: "This W", value: conversations },
    ],
    inviteActivateFunnel: [
      { label: "Invited", value: invited },
      { label: "Activated", value: activated },
      { label: "Teams linked (est.)", value: teamsLinked },
    ],
    followUpCadence: [
      { label: "Due <7d", value: Math.max(0, Math.round(followUpsDue * 0.52)) },
      { label: "Due 7–14d", value: Math.max(0, Math.round(followUpsDue * 0.28)) },
      { label: "Due 14+d", value: Math.max(0, Math.round(followUpsDue * 0.2)) },
    ],
  };
}
