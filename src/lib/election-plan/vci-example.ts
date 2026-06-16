import type { ElectionPlanCounty } from "@/lib/election-plan/types";

export type VciExample = {
  county: string;
  rank: number;
  vci: number;
  explanation: string;
};

/** Top-ranked county from the built snapshot — not a static illustration. */
export function getVciExampleFromCounties(counties: ElectionPlanCounty[]): VciExample | null {
  if (counties.length === 0) return null;
  const top = [...counties].sort((a, b) => a.vciRank - b.vciRank)[0];
  if (!top) return null;
  return {
    county: top.county,
    rank: top.vciRank,
    vci: top.vci,
    explanation: `${top.county} ranks #${top.vciRank} in the planning model (${top.primaryMission ?? "multi-lane"} mission · ${top.tier ?? "tier"} county).`,
  };
}
