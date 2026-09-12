/**
 * Central 2026 election calendar for Kelly SOS public pages.
 *
 * Neighbor-facing dates follow the Arkansas Secretary of State
 * 2026 Election Calendar (Rev. 7-2026). County clerks set early-voting
 * sites and can confirm a mailed application.
 */
export const ELECTION_DAY_2026 = "2026-11-03";

/** Monday after the statutory Sunday (Oct 4) — Ark. Code § 7-1-108. */
export const VOTER_REGISTRATION_DEADLINE_2026 = "2026-10-05";

export const VOTER_REGISTRATION_DEADLINE_STATUS = "published on the Arkansas Secretary of State 2026 election calendar" as const;

export const EARLY_VOTING_BEGINS_2026 = "2026-10-19";
export const EARLY_VOTING_ENDS_2026 = "2026-11-02";
export const ABSENTEE_MAIL_APPLICATION_DEADLINE_2026 = "2026-10-27";
export const ABSENTEE_IN_PERSON_DEADLINE_2026 = "2026-10-30";
export const GENERAL_RUNOFF_2026 = "2026-12-01";
export const GENERAL_RUNOFF_REGISTRATION_DEADLINE_2026 = "2026-11-02";

export const SOS_2026_ELECTION_CALENDAR_HREF =
  "https://www.sos.arkansas.gov/uploads/elections/2026_Election_Calendar_Rev._7-2026_.pdf";
export const SOS_VOTER_REGISTRATION_INFO_HREF =
  "https://www.sos.arkansas.gov/elections/voter-information/voter-registration-information";

/** Statewide campaign ambition for new voter registrations (integer target). */
export const GLOBAL_NEW_VOTER_REGISTRATION_GOAL = 50_000;

export type NeighborElectionDate = {
  ymd: string;
  title: string;
  detail: string;
};

export function formatElectionDateLong(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/** Dates neighbors need for the November 3 general election. */
export const NEIGHBOR_ELECTION_DATES_2026: readonly NeighborElectionDate[] = [
  {
    ymd: VOTER_REGISTRATION_DEADLINE_2026,
    title: "Register to vote",
    detail:
      "Deadline to apply for the November 3 general election. Mail is dated by the postmark. If you are close to the deadline, apply in person with your county clerk.",
  },
  {
    ymd: EARLY_VOTING_BEGINS_2026,
    title: "Early voting begins",
    detail:
      "In-person early voting is 8:00 a.m.–6:00 p.m. Monday–Friday and 10:00 a.m.–4:00 p.m. Saturday. Your county clerk posts the sites.",
  },
  {
    ymd: ABSENTEE_MAIL_APPLICATION_DEADLINE_2026,
    title: "Absentee application by mail, fax, or email",
    detail:
      "County clerk must receive the absentee ballot application by this date if you send it by mail, fax, or email.",
  },
  {
    ymd: ABSENTEE_IN_PERSON_DEADLINE_2026,
    title: "In-person absentee application or return",
    detail:
      "Last day to apply in person for an absentee ballot, or to hand-deliver a completed absentee ballot, by the close of regular clerk hours.",
  },
  {
    ymd: EARLY_VOTING_ENDS_2026,
    title: "Last day of early voting",
    detail: "Early voting ends at 5:00 p.m. the Monday before Election Day.",
  },
  {
    ymd: ELECTION_DAY_2026,
    title: "Election Day",
    detail:
      "Polls are open 7:30 a.m.–7:30 p.m. Mailed absentee ballots must reach the county clerk by 7:30 p.m., except military and overseas voters who have a later received-by date.",
  },
  {
    ymd: GENERAL_RUNOFF_2026,
    title: "County and municipal runoff (if needed)",
    detail: `Only if a local race needs a runoff. Register by ${formatElectionDateLong(GENERAL_RUNOFF_REGISTRATION_DEADLINE_2026)} to vote in that election. Polls 7:30 a.m.–7:30 p.m.`,
  },
];
