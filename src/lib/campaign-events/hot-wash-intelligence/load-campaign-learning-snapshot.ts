import { loadAllCountyMemories } from "../county-memory/county-memory-store";
import { summarizeCountyTrends } from "../county-memory/county-memory-builder";
import { loadBlueprintIndex } from "../event-blueprints/blueprint-store";

export type CampaignLearningSnapshot = {
  countyCount: number;
  topIssues: string[];
  topFormats: string[];
  blueprintCount: number;
  volunteerSignals: number;
  donorSignals: number;
  recurringBlockers: string[];
};

export async function loadCampaignLearningSnapshot(): Promise<CampaignLearningSnapshot> {
  const records = await loadAllCountyMemories();
  const trends = summarizeCountyTrends(records);
  const blueprints = await loadBlueprintIndex();

  let volunteerSignals = 0;
  let donorSignals = 0;
  for (const r of records) {
    volunteerSignals += r.recurringVolunteers.length;
    donorSignals += r.recurringDonors.length;
  }

  return {
    countyCount: trends.countiesWithSignals,
    topIssues: trends.topIssues,
    topFormats: trends.topFormats,
    blueprintCount: blueprints.blueprints.length,
    volunteerSignals,
    donorSignals,
    recurringBlockers: trends.topIssues.slice(0, 4),
  };
}
