import type { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import type { summarizeDebateCommandMessaging } from "@/lib/intelligence/campaignMessagingIntelligence";
import type { DebateScenarioPrepSummary } from "@/lib/intelligence/types/strategicScenarioSimulation";
import type { listFlaggedBillCivicSummaries } from "@/lib/intelligence/kimHammerBillCivicIntelligence";

export const LAUNCH_KH2_STUB = {
  likelyArguments: { arguments: [] },
} as unknown as ReturnType<typeof loadKimHammerKh2Workbench>;

export const LAUNCH_DEBATE_MESSAGING_STUB = {
  flaggedBills: [],
  philosophyConsistency: [],
  strategicRiskWarnings: [],
} as unknown as ReturnType<typeof summarizeDebateCommandMessaging>;

export const LAUNCH_SCENARIO_PREP_STUB = {
  likelyOpponentAttacks: [],
  debateTrapWarnings: [],
  evidenceDependencies: [],
  weakCitationWarnings: [],
  whatNotToSay: [],
  bridgeLineGuidance: [],
  countySensitiveNotes: [],
  doctrineSafeResponseNotes: [],
} as unknown as DebateScenarioPrepSummary;

export const LAUNCH_CIVIC_SUMMARIES_STUB: ReturnType<typeof listFlaggedBillCivicSummaries> = [];
