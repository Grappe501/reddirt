/** Client-safe opposition strategy layer types — v6.2 */

export type OppositionStrategyTrapLane = {
  id: string;
  title: string;
  stepCoveragePct: number;
  href: string;
  baitLine: string;
  kellyPivot: string;
};

export type OppositionStrategyMove = {
  id: string;
  name: string;
  whenToUse: string;
  execution: string;
  secondRound: string;
};

export type OppositionStrategyDefenseVector = {
  id: string;
  title: string;
  prepPriority: string;
  verificationStatus: string;
  href: string;
};

export type OppositionStrategyLayerPacket = {
  version: string;
  generatedAt: string;
  overallOffenseReadiness: number;
  curatedBillPct: number;
  integrity2021BillCount: number;
  petition2025BillCount: number;
  trapLanes: OppositionStrategyTrapLane[];
  offensiveMoves: OppositionStrategyMove[];
  defenseVectors: OppositionStrategyDefenseVector[];
  crossExamStarters: string[];
  debateDayOffenseSequence: Array<{
    phase: string;
    minutes: number;
    steps: Array<{ label: string; href: string }>;
  }>;
  governanceLabel: string;
};
