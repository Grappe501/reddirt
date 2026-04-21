/**
 * Voter file helpers. **Registration baseline** is centralized in
 * `@/config/campaign-registration-baseline` — import from there for ETL and UI.
 */
import {
  getCampaignRegistrationBaselineDisplayCentral,
  getCampaignRegistrationBaselineUtc,
} from "@/config/campaign-registration-baseline";

export const REGISTRATION_METRICS_BASELINE_UTC = getCampaignRegistrationBaselineUtc();

export function registrationBaselineDisplayCentral(): string {
  return getCampaignRegistrationBaselineDisplayCentral();
}
