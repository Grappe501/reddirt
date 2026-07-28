/**
 * Canonical volunteer interest taxonomy — stable keys for public forms.
 */

export type VolunteerInterestItem = {
  key: string;
  label: string;
  description: string;
  active: boolean;
  displayOrder: number;
  group: string;
  workflowRoutingHint?: string;
};

export const VOLUNTEER_INTEREST_TAXONOMY: readonly VolunteerInterestItem[] = [
  { key: "canvassing", label: "Canvassing", description: "Door knocking and neighborhood walks", active: true, displayOrder: 10, group: "field" },
  { key: "phone_banking", label: "Phone banking", description: "Outbound voter and supporter calls", active: true, displayOrder: 20, group: "field" },
  { key: "texting", label: "Texting", description: "Peer-to-peer or broadcast texting support", active: true, displayOrder: 30, group: "field" },
  { key: "voter_registration", label: "Voter registration", description: "Registration drives and assistance", active: true, displayOrder: 40, group: "field" },
  { key: "events", label: "Events", description: "Event setup, hosting, and staffing", active: true, displayOrder: 50, group: "events", workflowRoutingHint: "events" },
  { key: "county_organizing", label: "County organizing", description: "Local county team building", active: true, displayOrder: 60, group: "organizing" },
  { key: "data_entry", label: "Data entry", description: "Lists, entry, and spreadsheet help", active: true, displayOrder: 70, group: "ops" },
  { key: "digital_outreach", label: "Digital outreach", description: "Online outreach and list growth", active: true, displayOrder: 80, group: "digital" },
  { key: "social_media", label: "Social media", description: "Social posting and community management", active: true, displayOrder: 90, group: "digital", workflowRoutingHint: "social_media" },
  { key: "photography", label: "Photography", description: "Campaign photography", active: true, displayOrder: 100, group: "creative" },
  { key: "video", label: "Video", description: "Video capture and editing help", active: true, displayOrder: 110, group: "creative" },
  { key: "graphic_design", label: "Graphic design", description: "Graphics and layout", active: true, displayOrder: 120, group: "creative" },
  { key: "writing", label: "Writing", description: "Copy, letters, and storytelling", active: true, displayOrder: 130, group: "creative" },
  { key: "research", label: "Research", description: "Issue and county research support", active: true, displayOrder: 140, group: "research" },
  { key: "election_protection", label: "Election protection", description: "Voter help and election-day support", active: true, displayOrder: 150, group: "field" },
  { key: "business_outreach", label: "Business outreach", description: "Small-business relationship building", active: true, displayOrder: 160, group: "outreach" },
  { key: "nonprofit_outreach", label: "Nonprofit outreach", description: "Nonprofit and civic group outreach", active: true, displayOrder: 170, group: "outreach" },
  { key: "faith_community_outreach", label: "Faith / community outreach", description: "Faith and community-network outreach", active: true, displayOrder: 180, group: "outreach" },
  { key: "youth_engagement", label: "Youth engagement", description: "Youth and campus engagement", active: true, displayOrder: 190, group: "outreach", workflowRoutingHint: "youth_outreach" },
  { key: "senior_outreach", label: "Senior outreach", description: "Senior community outreach", active: true, displayOrder: 200, group: "outreach" },
  { key: "transportation", label: "Transportation", description: "Rides and logistics support", active: true, displayOrder: 210, group: "ops" },
  { key: "accessibility_support", label: "Accessibility support", description: "Access and accommodation support", active: true, displayOrder: 220, group: "ops" },
  { key: "office_admin", label: "Office / administrative support", description: "Admin and office help", active: true, displayOrder: 230, group: "ops" },
  { key: "hosting", label: "Hosting", description: "Hosting gatherings and house meetings", active: true, displayOrder: 240, group: "events" },
  { key: "fundraising", label: "Fundraising", description: "Fundraising support", active: true, displayOrder: 250, group: "finance", workflowRoutingHint: "fundraising" },
  { key: "yard_signs", label: "Yard signs", description: "Sign distribution and placement", active: true, displayOrder: 260, group: "field" },
  { key: "relational_organizing", label: "Relational organizing", description: "Power-of-5 and relational asks", active: true, displayOrder: 270, group: "organizing", workflowRoutingHint: "power_of_five" },
  { key: "other", label: "Other", description: "Other interest — see notes", active: true, displayOrder: 999, group: "other" },
] as const;

const ACTIVE_KEYS = new Set(VOLUNTEER_INTEREST_TAXONOMY.filter((i) => i.active).map((i) => i.key));

/** Map preferredRole / legacy tokens into taxonomy keys where possible. */
const LEGACY_ALIASES: Record<string, string> = {
  events: "events",
  social_media: "social_media",
  power_of_five: "relational_organizing",
  youth_outreach: "youth_engagement",
  womens_outreach: "other",
  fundraising: "fundraising",
  not_sure: "other",
  hosting: "hosting",
};

export type NormalizedInterests = {
  keys: string[];
  unknownCapturedAsOther: string[];
};

export function normalizeVolunteerInterests(raw: string[] | undefined | null): NormalizedInterests {
  const keys = new Set<string>();
  const unknownCapturedAsOther: string[] = [];

  for (const token of raw ?? []) {
    const t = token.trim().toLowerCase().replace(/^pref_role:/, "");
    if (!t) continue;
    if (ACTIVE_KEYS.has(t)) {
      keys.add(t);
      continue;
    }
    if (LEGACY_ALIASES[t]) {
      keys.add(LEGACY_ALIASES[t]!);
      continue;
    }
    unknownCapturedAsOther.push(token.trim().slice(0, 80));
    keys.add("other");
  }

  return {
    keys: Array.from(keys),
    unknownCapturedAsOther,
  };
}

export function listActiveVolunteerInterests(): VolunteerInterestItem[] {
  return VOLUNTEER_INTEREST_TAXONOMY.filter((i) => i.active).slice().sort((a, b) => a.displayOrder - b.displayOrder);
}
