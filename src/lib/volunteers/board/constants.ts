export const VOLUNTEER_BOARD_SESSION_COOKIE = "reddirt_volunteer_board_session";

export const VOLUNTEER_BOARD_ACTIVITY_OPTIONS = [
  { id: "voter_registration", label: "Voter registration help" },
  { id: "phone_text", label: "Phone / text banking" },
  { id: "events", label: "Events & tabling" },
  { id: "canvassing", label: "Door knocking / canvassing" },
  { id: "data_entry", label: "Data entry & follow-ups" },
  { id: "social", label: "Social media & content" },
  { id: "fundraising", label: "Grassroots fundraising" },
  { id: "leadership", label: "Team or county leadership" },
] as const;

export type VolunteerBoardActivityId = (typeof VOLUNTEER_BOARD_ACTIVITY_OPTIONS)[number]["id"];
