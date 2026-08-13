import type { CountyCampaignState, CountyUpcomingIndicator } from "@/lib/events/county-campaign-summary";

export type CountyMapFeature = {
  key: string;
  name: string;
  d: string;
  publicState: CountyCampaignState;
  upcomingIndicator: CountyUpcomingIndicator;
  visited: boolean;
  href: string | null;
  ariaLabel: string;
  visitedLabel: string;
  upcomingHeading: string | null;
  upcomingLines: Array<{ href: string; text: string }>;
};
