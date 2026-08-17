/**
 * Central election calendar constants for 2026 general (Arkansas / Kelly SOS).
 *
 * Public dates follow the Arkansas Secretary of State 2026 Election Calendar
 * (Rev. 6-2025). https://www.sos.arkansas.gov/uploads/elections/2026_Election_Calendar_Rev._6-2025_.pdf
 *
 * Do not use partner working-document dates when they conflict with this calendar.
 * ADBC July 2026 church plan listed registration as Oct 7 and early vote as Oct 20-Nov 1.
 */
export const ELECTION_DAY_2026 = "2026-11-03";

/** Monday, October 5, 2026. Statutory 30-day mark is Sunday, October 4; SOS calendar uses Monday, October 5. */
export const VOTER_REGISTRATION_DEADLINE_2026 = "2026-10-05";

/** Human-readable pipeline status for compliance — not a substitute for county-clerk confirmation of local hours. */
export const VOTER_REGISTRATION_DEADLINE_STATUS = "Arkansas SOS 2026 Election Calendar" as const;

/** Early voting begins Monday, October 19, 2026 (8:00 a.m.-6:00 p.m. weekday hours in statute). */
export const EARLY_VOTING_START_2026 = "2026-10-19";

/** Early voting ends 5:00 p.m. Monday, November 2, 2026 (Monday before Election Day). */
export const EARLY_VOTING_END_2026 = "2026-11-02";

/** Statewide campaign ambition for new voter registrations (integer target). */
export const GLOBAL_NEW_VOTER_REGISTRATION_GOAL = 50_000;
