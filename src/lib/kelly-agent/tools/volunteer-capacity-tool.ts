import "server-only";

import type { CountyVolunteerCapacityRow } from "@/lib/field-ops/volunteer-capacity-types";
import { loadVolunteerCapacityModelFile } from "@/lib/field-ops/load-volunteer-capacity-model";

export type VolunteerCapacityToolOutput = {
  statewide: {
    countiesModeled: number;
    totalEventStaffingNeed: number;
    totalHousePartyHostNeed: number;
    totalFollowUpVolunteerNeed: number;
    totalPhoneBankCapacityNeedHours: number;
    totalPostcardCapacityNeedEstimate: number;
    countiesNeedingLocalGuides: number;
    countiesNeedingAccessSupport: number;
  };
  counties: CountyVolunteerCapacityRow[];
  warnings: string[];
};

export function loadVolunteerCapacityToolOutput(repoRoot?: string): VolunteerCapacityToolOutput | null {
  const file = loadVolunteerCapacityModelFile(repoRoot);
  if (!file) return null;
  const counties = file.counties;
  const accessLevels = new Set(["needs_bilingual_materials", "needs_local_partner"]);
  const statewide = {
    countiesModeled: counties.length,
    totalEventStaffingNeed: counties.reduce((s, c) => s + c.eventStaffingNeed, 0),
    totalHousePartyHostNeed: counties.reduce((s, c) => s + c.housePartyHostNeed, 0),
    totalFollowUpVolunteerNeed: counties.reduce((s, c) => s + c.followUpVolunteerNeed, 0),
    totalPhoneBankCapacityNeedHours: counties.reduce((s, c) => s + c.phoneBankCapacityNeedHours, 0),
    totalPostcardCapacityNeedEstimate: counties.reduce((s, c) => s + c.postcardCapacityNeedEstimate, 0),
    countiesNeedingLocalGuides: counties.filter((c) => c.localGuideNeed > 0).length,
    countiesNeedingAccessSupport: counties.filter((c) => accessLevels.has(c.hispanicCommunityAccessNeed)).length,
  };
  return { statewide, counties, warnings: file.warnings };
}
