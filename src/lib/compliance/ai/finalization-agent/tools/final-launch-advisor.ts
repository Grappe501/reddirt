import type { FinalizationInspectorResult } from "../inspector-types";
import { runAllFinalizationInspectors } from "./index";

export async function inspectFinalLaunch(): Promise<FinalizationInspectorResult & { nextActions: string[] }> {
  const inspectors = await runAllFinalizationInspectors();
  const avg = Math.round(inspectors.reduce((sum, item) => sum + item.score, 0) / Math.max(inspectors.length, 1));
  const blockers = inspectors.filter((item) => item.status === "red").map((item) => item.label);
  const nextActions = [
    ...blockers.map((label) => `Resolve blocker: ${label}`),
    "Compliance officer sign-off on rule topics with official sources but pending legal review",
    "Run compliance:qa-release before any external beta",
  ];
  return {
    id: "final-launch",
    label: "Final Launch Advisor",
    score: avg,
    status: avg >= 85 ? "green" : avg >= 65 ? "yellow" : "red",
    explanation: blockers.length ? `${blockers.length} subsystem(s) red.` : "No red subsystems — proceed to officer review.",
    nextActions,
  };
}
