/** Client-safe supreme workbench types — no server-only imports. */

export type SupremeWorkbenchDimension = {
  id: string;
  label: string;
  score: number;
  trend: "up" | "flat" | "down";
  href: string;
  raiseToday: string;
  weakAreas: string[];
  scoreConfidence: "LOW" | "MEDIUM" | "HIGH";
};

export type SupremeWorkbenchOperatorSequence = {
  sequenceId: string;
  label: string;
  phase: string;
  estimatedMinutes: number;
  steps: Array<{ label: string; href: string; why: string }>;
};

export type SupremeWorkbenchPriorityAction = {
  rank: number;
  title: string;
  detail: string;
  href: string;
  urgency: "critical" | "high" | "medium";
};

export type SupremeWorkbenchOppositionLane = {
  id: string;
  label: string;
  baitLine: string;
  kellyPivot: string;
  href: string;
};

export type SupremeWorkbenchPacket = {
  version: string;
  generatedAt: string;
  overallReadiness: number;
  buildProgressPct: number;
  dimensions: SupremeWorkbenchDimension[];
  operatorSequences: SupremeWorkbenchOperatorSequence[];
  priorityActions: SupremeWorkbenchPriorityAction[];
  oppositionLanes: SupremeWorkbenchOppositionLane[];
  tonightFocus: string[];
  doNotSay: string[];
  governanceLabel: string;
};
