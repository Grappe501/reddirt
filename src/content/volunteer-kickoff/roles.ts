export type LocalRoleId =
  | "county_lead"
  | "local_events"
  | "community_outreach"
  | "local_media"
  | "voter_registration"
  | "canvassing"
  | "local_gotv"
  | "event_host";

export type CampaignTeamId =
  | "volunteer_leadership"
  | "social_creative"
  | "logistics"
  | "statewide_outreach"
  | "data_technology"
  | "project_organizer"
  | "fundraising"
  | "strike_team"
  | "statewide_gotv";

export const LOCAL_ROLES: readonly {
  id: LocalRoleId;
  title: string;
  blurb: string;
}[] = [
  {
    id: "county_lead",
    title: "County Lead Organizer",
    blurb: "Main campaign connection in your county—build the team, prep visits, stay linked to staff.",
  },
  {
    id: "local_events",
    title: "Local Events Team",
    blurb: "Town halls, rallies, festivals, parades, cookouts, and candidate events.",
  },
  {
    id: "community_outreach",
    title: "Community Outreach Team",
    blurb: "Reach organizations, faith leaders, neighborhoods, civic groups, and local candidates.",
  },
  {
    id: "local_media",
    title: "Local Media Contact",
    blurb: "Newspapers, radio, community publications, local TV, online groups, and podcasts.",
  },
  {
    id: "voter_registration",
    title: "Local Voter Registration Team",
    blurb: "Organize registration opportunities and share accurate registration information.",
  },
  {
    id: "canvassing",
    title: "Local Canvassing Team",
    blurb: "Door hangers, neighborhood outreach, and community conversations.",
  },
  {
    id: "local_gotv",
    title: "Local GOTV Team",
    blurb: "Early vote and Election Day support—lawful contact, rides, visibility, and coordination.",
  },
  {
    id: "event_host",
    title: "Local Event Host",
    blurb: "Offer a venue, host a meet-and-greet, or invite Kelly to an existing gathering.",
  },
] as const;

export const CAMPAIGN_TEAMS: readonly {
  id: CampaignTeamId;
  title: string;
  blurb: string;
  recognize?: string;
  priority?: boolean;
}[] = [
  {
    id: "volunteer_leadership",
    title: "Volunteer Leadership Team",
    blurb: "Recruit, welcome, connect people to roles, and support county teams.",
    recognize: "Carol Egan · Sue Farris",
  },
  {
    id: "social_creative",
    title: "Social Media & Creative",
    blurb: "Design, video, photography, writing, short-form content, and amplification.",
    recognize: "Leann Solice",
  },
  {
    id: "logistics",
    title: "Logistics & Scheduling",
    blurb: "Calendar, travel, lodging, routes, materials, and candidate prep.",
  },
  {
    id: "statewide_outreach",
    title: "Statewide Outreach",
    blurb: "Media booking, phone banking, community recruitment, and event promotion.",
    recognize: "Kimberly Sawyer",
  },
  {
    id: "data_technology",
    title: "Data & Technology",
    blurb: "Databases, maps, volunteer systems, websites, and reporting tools.",
  },
  {
    id: "project_organizer",
    title: "Campaign Project Organizer",
    blurb: "Assign tasks, track deadlines, follow up with leaders, and surface bottlenecks.",
    priority: true,
  },
  {
    id: "fundraising",
    title: "Grassroots Fundraising",
    blurb: "Community-hosted fundraisers, small-dollar outreach, and regional goals.",
    recognize: "Sara Rampona",
  },
  {
    id: "strike_team",
    title: "Traveling Strike Teams",
    blurb: "Saturday deployments across five regions ahead of priority campaign visits.",
  },
  {
    id: "statewide_gotv",
    title: "Statewide GOTV",
    blurb: "Final-month turnout: regional leads, rides, outreach, and Election Day support.",
  },
] as const;

export const STRIKE_REGIONS = [
  { id: "northwest", label: "Northwest Arkansas" },
  { id: "northeast", label: "Northeast Arkansas" },
  { id: "southwest", label: "Southwest Arkansas" },
  { id: "southeast", label: "Southeast Arkansas" },
  { id: "central", label: "Central Arkansas" },
] as const;

export const LOCAL_ROLE_LABELS: Record<LocalRoleId, string> = Object.fromEntries(
  LOCAL_ROLES.map((r) => [r.id, r.title]),
) as Record<LocalRoleId, string>;

export const CAMPAIGN_TEAM_LABELS: Record<CampaignTeamId, string> = Object.fromEntries(
  CAMPAIGN_TEAMS.map((t) => [t.id, t.title]),
) as Record<CampaignTeamId, string>;
