import type { VolunteerTeamLaneId } from "@/lib/volunteers/types";

/** Work branch templates — orthogonal to hierarchy tier; some sections overlap by design. */
export const WORK_BRANCH_IDS = [
  "comms",
  "fundraising",
  "events",
  "volunteer_management",
  "coalition",
  "voter_registration",
  "county_field",
  "campus",
] as const;

export type WorkBranchId = (typeof WORK_BRANCH_IDS)[number];

export type WorkBranchTemplate = {
  id: WorkBranchId;
  label: string;
  description: string;
  /** Maps to volunteer team lane drill-down when present */
  teamLaneId?: VolunteerTeamLaneId;
  sections: Array<{
    id: string;
    label: string;
    description: string;
    overlapsWith?: WorkBranchId[];
  }>;
  crmTouchpoints: string[];
};

export const WORK_BRANCH_TEMPLATES: Record<WorkBranchId, WorkBranchTemplate> = {
  comms: {
    id: "comms",
    label: "Comms",
    description: "Local message distribution, social coordination, and earned media support.",
    teamLaneId: "comms",
    sections: [
      { id: "message_hub", label: "Message hub", description: "Shareable conversation prompts for your geography." },
      { id: "content_calendar", label: "Content calendar", description: "Align local narrative with statewide message engine." },
      { id: "lte_pipeline", label: "LTE / citizen voices", description: "Letters to the editor and local newspaper registry.", overlapsWith: ["coalition"] },
    ],
    crmTouchpoints: ["message_recipients", "media_contacts", "field_log"],
  },
  fundraising: {
    id: "fundraising",
    label: "Fundraising",
    description: "Grassroots asks, ride-alongs, donor stewardship, and event revenue.",
    teamLaneId: "fundraising",
    sections: [
      { id: "donor_pipeline", label: "Donor pipeline", description: "Track asks, thank-yous, and 48-hour follow-up." },
      { id: "ride_alongs", label: "Ride-alongs", description: "Coordinate Kelly or surrogate donor conversations." },
      { id: "event_revenue", label: "Event revenue", description: "Fundraising events and host committees.", overlapsWith: ["events"] },
    ],
    crmTouchpoints: ["donor_contacts", "ask_log", "field_log"],
  },
  events: {
    id: "events",
    label: "Events",
    description: "Plan, execute, and follow up on local events — roles, attendance, relational next steps.",
    teamLaneId: "events",
    sections: [
      { id: "event_calendar", label: "Event calendar", description: "Upcoming stops, Mobilize pages, and shift assignments." },
      { id: "event_command", label: "Event command", description: "Event workbench — leadership ≠ city leadership." },
      { id: "post_event", label: "Post-event follow-up", description: "Relational closeout and Po5 commitments.", overlapsWith: ["volunteer_management"] },
    ],
    crmTouchpoints: ["event_attendees", "volunteer_shifts", "field_log"],
  },
  volunteer_management: {
    id: "volunteer_management",
    label: "Volunteer management",
    description: "Recruit, welcome, assign, and retain volunteers — vol HQ integration.",
    teamLaneId: "operations",
    sections: [
      { id: "operator_roster", label: "Operator roster", description: "3-letter codes, capabilities, and field-entry whitelist." },
      { id: "leader_roster", label: "Leader roster", description: "Personal command surfaces and lane assignments." },
      { id: "intake_activation", label: "Intake & activation", description: "Form → review → placement → workbench unlock.", overlapsWith: ["county_field"] },
      { id: "team_health", label: "Team health", description: "My Five completeness, open slots, and follow-up queues." },
    ],
    crmTouchpoints: ["team_roster", "field_operators", "my_five", "open_leadership_slots"],
  },
  coalition: {
    id: "coalition",
    label: "Coalition",
    description: "Faith, labor, NAACP, and community validator relationships.",
    teamLaneId: "coalition",
    sections: [
      { id: "validator_pipeline", label: "Validator pipeline", description: "Introduction and endorsement pathways." },
      { id: "coalition_workbench", label: "Coalition workbench", description: "Program hub relationships and intel pages." },
      { id: "faith_labor", label: "Faith & labor", description: "Respectful civic engagement without partisan preaching.", overlapsWith: ["comms"] },
    ],
    crmTouchpoints: ["validator_contacts", "relationship_log"],
  },
  voter_registration: {
    id: "voter_registration",
    label: "Voter registration",
    description: "Registration drives, Help 10, and turnout pairing.",
    teamLaneId: "voter-registration",
    sections: [
      { id: "reg_drives", label: "Registration drives", description: "Tabling, campus, and community registration events." },
      { id: "help_ten", label: "Help 10", description: "Ten-voter commitment journey — separate from My Five." },
      { id: "turnout_pairing", label: "Turnout pairing", description: "Registration → relational follow-up → vote plan." },
    ],
    crmTouchpoints: ["registered_contacts", "help_ten_roster"],
  },
  county_field: {
    id: "county_field",
    label: "County field",
    description: "County playbook, community workbenches, and weekly field reporting.",
    teamLaneId: "county",
    sections: [
      { id: "county_playbook", label: "County playbook", description: "Top priorities and registration lane for the county." },
      { id: "community_wbs", label: "Community workbenches", description: "City and program workbenches inside the county." },
      { id: "weekly_report", label: "Weekly county report", description: "Activity report to campaign ops.", overlapsWith: ["volunteer_management"] },
    ],
    crmTouchpoints: ["county_contacts", "field_log", "leadership_slots"],
  },
  campus: {
    id: "campus",
    label: "Campus / youth",
    description: "Student volunteers, tabling, and campus appearances.",
    teamLaneId: "campus",
    sections: [
      { id: "campus_captains", label: "Campus captains", description: "Recruit and coordinate student leaders." },
      { id: "tabling", label: "Tabling & registration", description: "Mobilize event for every public tabling shift." },
      { id: "freshman_week", label: "Freshman Week", description: "Campus blitz readiness checklist." },
    ],
    crmTouchpoints: ["student_contacts", "campus_roster"],
  },
};

const LANE_TO_BRANCH: Partial<Record<VolunteerTeamLaneId, WorkBranchId>> = {
  county: "county_field",
  events: "events",
  fundraising: "fundraising",
  comms: "comms",
  campus: "campus",
  coalition: "coalition",
  "voter-registration": "voter_registration",
  operations: "volunteer_management",
};

export function branchesForTeamLanes(laneIds: VolunteerTeamLaneId[]): WorkBranchTemplate[] {
  const seen = new Set<WorkBranchId>();
  const out: WorkBranchTemplate[] = [];
  for (const lane of laneIds) {
    const branchId = LANE_TO_BRANCH[lane];
    if (!branchId || seen.has(branchId)) continue;
    seen.add(branchId);
    out.push(WORK_BRANCH_TEMPLATES[branchId]);
  }
  return out;
}

/** Flex / statewide leaders get volunteer management branch even without operations lane. */
export function branchesForLeader(laneIds: VolunteerTeamLaneId[], includeVolMgmt: boolean): WorkBranchTemplate[] {
  const branches = branchesForTeamLanes(laneIds);
  if (includeVolMgmt && !branches.some((b) => b.id === "volunteer_management")) {
    branches.push(WORK_BRANCH_TEMPLATES.volunteer_management);
  }
  return branches;
}
