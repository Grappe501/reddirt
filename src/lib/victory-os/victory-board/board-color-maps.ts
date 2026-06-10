/**
 * Victory OS Sprint 4 — pin colors and sizes from decision-derived intelligence.
 */

import type { CountyOpsStatus, ElectoralImportance } from "../types";
import type { VictoryBoardMapLayer } from "./types";

const ELECTORAL_COLOR: Record<ElectoralImportance, string> = {
  critical: "#b91c1c",
  important: "#c2410c",
  helpful: "#1d4ed8",
  maintenance: "#71717a",
};

const OPS_COLOR: Record<CountyOpsStatus, string> = {
  red: "#dc2626",
  yellow: "#ca8a04",
  green: "#16a34a",
};

export function priorityToColor(score: number): string {
  if (score >= 75) return "#b91c1c";
  if (score >= 50) return "#c2410c";
  if (score >= 30) return "#ca8a04";
  return "#16a34a";
}

export function pinStyleForLayer(
  layer: VictoryBoardMapLayer,
  input: {
    deploymentPriority: number;
    opsStatus: CountyOpsStatus;
    electoralImportance: ElectoralImportance;
    decisionRank: number | null;
    inTop10: boolean;
  },
): { fillColor: string; strokeColor: string; pinSize: number } {
  switch (layer) {
    case "ops_status":
      return {
        fillColor: OPS_COLOR[input.opsStatus],
        strokeColor: "#ffffff",
        pinSize: input.opsStatus === "red" ? 14 : input.inTop10 ? 12 : 10,
      };
    case "electoral_importance":
      return {
        fillColor: ELECTORAL_COLOR[input.electoralImportance],
        strokeColor: "#ffffff",
        pinSize: input.electoralImportance === "critical" ? 14 : 10,
      };
    case "decision_rank":
      if (input.decisionRank != null && input.decisionRank <= 3) {
        return { fillColor: "#1e3a5f", strokeColor: "#fbbf24", pinSize: 16 };
      }
      if (input.inTop10) {
        return { fillColor: "#1e3a5f", strokeColor: "#ffffff", pinSize: 13 };
      }
      return { fillColor: "#a1a1aa", strokeColor: "#ffffff", pinSize: 8 };
    case "deployment_priority":
    default:
      return {
        fillColor: priorityToColor(input.deploymentPriority),
        strokeColor: input.inTop10 ? "#1e3a5f" : "#ffffff",
        pinSize: Math.min(16, 8 + Math.round(input.deploymentPriority / 12)),
      };
  }
}

export function layerLegend(layer: VictoryBoardMapLayer): { color: string; label: string }[] {
  switch (layer) {
    case "ops_status":
      return [
        { color: OPS_COLOR.red, label: "Red ops" },
        { color: OPS_COLOR.yellow, label: "Yellow ops" },
        { color: OPS_COLOR.green, label: "Green ops" },
      ];
    case "electoral_importance":
      return [
        { color: ELECTORAL_COLOR.critical, label: "Critical" },
        { color: ELECTORAL_COLOR.important, label: "Important" },
        { color: ELECTORAL_COLOR.helpful, label: "Helpful" },
        { color: ELECTORAL_COLOR.maintenance, label: "Maintenance" },
      ];
    case "decision_rank":
      return [
        { color: "#1e3a5f", label: "Top 10 decision" },
        { color: "#a1a1aa", label: "Not in Top 10" },
      ];
    default:
      return [
        { color: "#b91c1c", label: "Priority 75+" },
        { color: "#c2410c", label: "50–74" },
        { color: "#ca8a04", label: "30–49" },
        { color: "#16a34a", label: "Below 30" },
      ];
  }
}

export { ELECTORAL_COLOR, OPS_COLOR };
