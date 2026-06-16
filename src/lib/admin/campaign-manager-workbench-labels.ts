/**
 * User-facing name for `/admin` — Steve's Campaign Manager workbench.
 * Route paths stay `/admin`; only titles and chrome use these labels.
 */

export const CAMPAIGN_MANAGER_WORKBENCH_NAME = "Campaign Manager";

export const CAMPAIGN_MANAGER_WORKBENCH_HEADLINE = "Your workbench";

export const CAMPAIGN_MANAGER_WORKBENCH_TAGLINE =
  "Kelly Grappe for SOS — statewide command center, calendar, field, and fundraising.";

export const CAMPAIGN_MANAGER_WORKBENCH_EYEBROW = "Kelly Campaign OS";

export function campaignManagerPageTitle(section?: string): string {
  if (!section?.trim()) return CAMPAIGN_MANAGER_WORKBENCH_NAME;
  return `${section.trim()} · ${CAMPAIGN_MANAGER_WORKBENCH_NAME}`;
}
