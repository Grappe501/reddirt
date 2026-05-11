import type { Team } from "@/types/dashboard";

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Production KPI ids for Women's Outreach lane (geographic team rollup).
 * When present with numeric targets, the lane score is their equal-weight average (each capped 0–100%).
 */
export const KELLY_VOS_WOMENS_LANE_KPI_IDS = [
  "k-t-womens-leads",
  "k-t-womens-gatherings",
  "k-t-womens-regs",
  "k-t-womens-referrals",
  "k-t-womens-family-events",
] as const;

/**
 * Production KPI ids for Community Regions lane (sub-teams, events, regs, admin review cadence).
 * When present, blended with downstream GOTV category (35% downstream, 65% community KPI average).
 */
export const KELLY_VOS_COMMUNITY_REGION_KPI_IDS = [
  "k-t-community-leads",
  "k-t-community-teams",
  "k-t-community-events",
  "k-t-community-regs",
  "k-t-community-review",
] as const;

function averageKpiPercent(team: Team, ids: readonly string[]): number | null {
  const parts: number[] = [];
  for (const id of ids) {
    const k = team.kpis.find((x) => x.id === id);
    if (k && k.target != null && k.target > 0) {
      parts.push(clampPct((k.value / k.target) * 100));
    }
  }
  if (parts.length === 0) return null;
  return clampPct(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/**
 * Lane roll-up for the team Overview (Social, Events, P5/VR, Youth, Women's, Community, GOTV).
 * Women's and Community use dedicated KPI averages when hydrated; otherwise legacy GOTV-derived fallbacks.
 */
export function buildVosLaneTwentySquareRows(team: Team): { id: string; label: string; percent: number }[] {
  const fos = team.fieldOperatingSystem;
  const g = fos?.gotvReadiness;
  const byId = (id: string, fallback: number) => g?.categories.find((c) => c.id === id)?.score ?? fallback;

  const social = clampPct((byId("weekly", 48) + byId("events", 45)) / 2);
  const events = byId("events", 44);
  const p5vr = clampPct((byId("p5", 50) + byId("vr", 52)) / 2);

  let youth = 38;
  const yo = team.youthOutreach;
  if (yo?.twentySquareYouthMetrics.length) {
    const sum = yo.twentySquareYouthMetrics.reduce((a, m) => a + m.percent, 0);
    youth = clampPct(sum / yo.twentySquareYouthMetrics.length);
  }

  const womensMetric = averageKpiPercent(team, KELLY_VOS_WOMENS_LANE_KPI_IDS);
  const womensOutreach = womensMetric ?? clampPct(byId("training", 40) * 0.75);

  const communityMetric = averageKpiPercent(team, KELLY_VOS_COMMUNITY_REGION_KPI_IDS);
  const downstreamScore = byId("downstream", 42);
  const communityRegions =
    communityMetric != null ? clampPct(communityMetric * 0.65 + downstreamScore * 0.35) : downstreamScore;

  const gotv = g?.compositeScore ?? 40;

  return [
    { id: "lane-social", label: "Social Media", percent: social },
    { id: "lane-events", label: "Events", percent: events },
    { id: "lane-p5vr", label: "Power of 5 / VR", percent: p5vr },
    { id: "lane-youth", label: "Youth Outreach", percent: youth },
    { id: "lane-womens", label: "Women's Outreach", percent: womensOutreach },
    { id: "lane-community", label: "Community Regions", percent: communityRegions },
    { id: "lane-gotv", label: "GOTV readiness", percent: gotv },
  ];
}
