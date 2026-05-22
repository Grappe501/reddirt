import { MARCH_2026_LEDGER_PERIOD } from "../constants";
import {
  seedCampaignEventRecordsForPeriod,
  type PeriodSeedReport,
} from "./seed-period";

/** @deprecated Prefer seedCampaignEventRecordsForPeriod — kept for March-specific imports */
export type MarchSeedReport = PeriodSeedReport;

export async function seedMarchCampaignEventRecords(): Promise<MarchSeedReport> {
  return seedCampaignEventRecordsForPeriod(MARCH_2026_LEDGER_PERIOD);
}
