/**
 * Base volunteer workbench template — inherited by every upstream leadership tier.
 * CRM path: contacts → follow-ups → field log → team roster → full participation layer.
 */

export type WorkbenchTemplateSection = {
  id: string;
  label: string;
  anchor: string;
  description: string;
  /** Included in volunteer-management / CRM rollup */
  crmModule?: boolean;
};

export type VolunteerCrmModule = {
  id: string;
  label: string;
  description: string;
  href: string;
  status: "live" | "planned";
};

export const VOLUNTEER_WORKBENCH_SECTIONS: WorkbenchTemplateSection[] = [
  {
    id: "my_five",
    label: "My Five",
    anchor: "#power-of-5",
    description: "Five trusted contacts — foundation for relational organizing and branch growth.",
    crmModule: true,
  },
  {
    id: "team_roster",
    label: "Team roster",
    anchor: "#power-of-5",
    description: "Deputies, co-leads, and branch contacts under your Power of 5.",
    crmModule: true,
  },
  {
    id: "field_log",
    label: "Field log",
    anchor: "#field-log",
    description: "Conversations, volunteers, and leader contacts tagged with your operator initials.",
    crmModule: true,
  },
  {
    id: "people_followups",
    label: "People & follow-ups",
    anchor: "#next-actions",
    description: "Open tasks and relational follow-ups — CRM queue before full participation layer.",
    crmModule: true,
  },
  {
    id: "training",
    label: "Training & tools",
    anchor: "#training",
    description: "Power of 5 walkthrough, onboarding, and campaign-wide resources.",
  },
];

/** Tier-specific sections stacked on top of the volunteer base. */
export const TIER_EXTENSION_SECTIONS: Record<
  string,
  WorkbenchTemplateSection[]
> = {
  city: [
    {
      id: "community_workbench",
      label: "Community workbench",
      anchor: "#areas",
      description: "City leadership slots, relationships, events, and field log for your city.",
      crmModule: true,
    },
    {
      id: "city_leadership",
      label: "City leadership slots",
      anchor: "#leadership-gaps",
      description: "Assign open roles on the community workbench — city leader owns slot fills.",
      crmModule: true,
    },
    {
      id: "local_events",
      label: "Local events",
      anchor: "#calendar",
      description: "City calendar, event command, and post-event relational follow-up.",
    },
  ],
  county: [
    {
      id: "county_playbook",
      label: "County playbook",
      anchor: "#areas",
      description: "County strategy, registration lane, and strike-team coordination.",
    },
    {
      id: "city_workbenches",
      label: "City workbenches in county",
      anchor: "#hierarchy",
      description: "Every city community workbench nested under your county — upstream access to all.",
      crmModule: true,
    },
    {
      id: "county_kpi",
      label: "County KPI rollup",
      anchor: "#kpi",
      description: "Record-backed leadership fills, field logs, and relationships across the county.",
      crmModule: true,
    },
  ],
  cluster: [
    {
      id: "multi_county",
      label: "Multi-county dashboard",
      anchor: "#hierarchy",
      description: "Corridor or regional rollups across connected counties.",
      crmModule: true,
    },
    {
      id: "cluster_coordinators",
      label: "Cluster coordinators",
      anchor: "#hierarchy",
      description: "County and city leaders in your cluster — volunteer pipeline across geography.",
      crmModule: true,
    },
  ],
  assistant_campaign_manager: [
    {
      id: "operators_command",
      label: "Operators command",
      anchor: "#hierarchy",
      description: "Full leader roster, field operator admin, and command heatmap.",
    },
    {
      id: "statewide_lanes",
      label: "All work branches",
      anchor: "#work-branches",
      description: "Comms, fundraising, events, volunteer management — every lane drill-down open.",
    },
  ],
  campaign_manager: [
    {
      id: "campaign_os",
      label: "Campaign OS",
      anchor: "#hierarchy",
      description: "Election Plan command, war room, escalations, and statewide CRM rollups.",
      crmModule: true,
    },
    {
      id: "escalations",
      label: "Escalations",
      anchor: "#next-actions",
      description: "Blocked work, open leadership slots, and cross-branch escalations.",
    },
  ],
};

export function volunteerCrmModules(opts: {
  isSelf: boolean;
  leaderSlug: string;
  fieldOperatorHref: string;
}): VolunteerCrmModule[] {
  const self = opts.isSelf ? "/election-plan/operators/leaders/me" : `/election-plan/operators/leaders/${opts.leaderSlug}`;
  return [
    {
      id: "my_five",
      label: "My Five contacts",
      description: "Core relational network — every upstream tier sees the same participant CRM fields.",
      href: `${self}#power-of-5`,
      status: "live",
    },
    {
      id: "team_roster",
      label: "Team roster",
      description: "Branch contacts and deputies — volunteer management integration point.",
      href: `${self}#power-of-5`,
      status: "live",
    },
    {
      id: "field_log",
      label: "Field log",
      description: "Operator-tagged conversations and volunteer captures.",
      href: `${self}#field-log`,
      status: "live",
    },
    {
      id: "field_operators",
      label: "Field operators",
      description: "3-letter whitelist and operator capabilities — vol HQ integration.",
      href: opts.fieldOperatorHref,
      status: "live",
    },
    {
      id: "relational_contact",
      label: "Relational contacts (PPEN)",
      description: "Full participation-layer CRM — merges field log, My Five, and voter contact.",
      href: "/admin/relational-contacts",
      status: "planned",
    },
    {
      id: "volunteer_intake",
      label: "Volunteer intake queue",
      description: "Website form → activation → placement → workbench unlock.",
      href: "/admin/volunteers/intake",
      status: "planned",
    },
  ];
}
