export const TALENT_FOUNDRY_SOURCE = "talent-foundry-kelly-beta" as const;

export const INTERVIEW_STATUSES = [
  "not_reviewed",
  "no_interview_yet",
  "interview_requested",
  "interview_assigned",
  "interview_complete",
] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  not_reviewed: "Not reviewed",
  no_interview_yet: "No interview yet",
  interview_requested: "Interview requested",
  interview_assigned: "Interview assigned",
  interview_complete: "Interview complete",
};

export const INTERN_DECISIONS = ["pending", "yes", "no"] as const;
export type InternDecision = (typeof INTERN_DECISIONS)[number];

export const INTERN_DECISION_LABELS: Record<InternDecision, string> = {
  pending: "Pending",
  yes: "Yes — considering for paid intern",
  no: "No — not the paid intern (still in campaign)",
};

export const CONFIRMED_PATHWAYS = [
  "paid_intern",
  "volunteer",
  "local_leader",
  "campus_leader",
  "remote",
  "headquarters",
  "events_road",
  "other",
] as const;

export type ConfirmedPathway = (typeof CONFIRMED_PATHWAYS)[number];

export const PATHWAY_LABELS: Record<ConfirmedPathway, string> = {
  paid_intern: "Paid intern consideration",
  volunteer: "Volunteer",
  local_leader: "Local leader",
  campus_leader: "Campus / school leader",
  remote: "Remote contributor",
  headquarters: "Headquarters / office",
  events_road: "Events / road support",
  other: "Other",
};

export const AREA_ASSIGNMENTS = [
  { id: "social", label: "Social media" },
  { id: "office", label: "Office operations" },
  { id: "field", label: "Field" },
  { id: "events", label: "Events" },
  { id: "comms", label: "Communications / PR" },
  { id: "creative", label: "Graphic design / creative" },
  { id: "fundraising", label: "Fundraising" },
  { id: "leadership", label: "Volunteer leadership" },
  { id: "research", label: "Research / data" },
  { id: "tech", label: "Digital / technology" },
  { id: "driving", label: "Driving / travel" },
  { id: "community", label: "Community organizing" },
  { id: "campus", label: "Campus organizing" },
  { id: "remote", label: "Remote support" },
  { id: "other", label: "Other" },
] as const;

export type AreaAssignmentId = (typeof AREA_ASSIGNMENTS)[number]["id"];

export const EVIDENCE_CATEGORIES = [
  { id: "leadership_readiness", label: "Leadership readiness", dimensions: ["leadership_readiness"] },
  { id: "passion", label: "Passion / mission commitment", dimensions: ["passion"] },
  { id: "availability", label: "Availability / flexibility", dimensions: ["availability"] },
  { id: "willingness_to_volunteer", label: "Willingness to volunteer", dimensions: ["willingness_to_volunteer"] },
  { id: "skill_breadth", label: "Skill breadth", dimensions: ["skill_breadth"] },
  { id: "interpersonal", label: "Interpersonal strength", dimensions: ["interpersonal"] },
  { id: "trust_discretion", label: "Trust / discretion evidence", dimensions: ["trust_discretion"] },
  { id: "written_communication", label: "Written communication", dimensions: ["written_communication"] },
  { id: "verbal_communication", label: "Verbal communication", dimensions: ["verbal_communication"] },
  { id: "logic_judgment", label: "Logic / judgment", dimensions: ["logic_judgment"] },
  { id: "delegation", label: "Delegation", dimensions: ["delegation"] },
  { id: "people_development", label: "People development", dimensions: ["people_development"] },
  { id: "big_picture", label: "Big-picture thinking", dimensions: ["big_picture"] },
  { id: "leadership_desire", label: "Desire to lead", dimensions: ["leadership_desire"] },
  { id: "follow_through", label: "Follow-through", dimensions: ["follow_through"] },
] as const;
