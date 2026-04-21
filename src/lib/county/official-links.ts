/**
 * Official Arkansas voter registration lookup. Do not substitute campaign-owned “lookup”
 * pages — the site’s role is to send people to the state tool, with help around it.
 *
 * @see https://www.sos.arkansas.gov/ — Voter / registration pages may move; keep URL in env.
 */
const DEFAULT_AR_VOTER_LOOKUP = "https://www.voterview.ar-nova.org/voterview";

export function getArVoterRegistrationLookupUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AR_VOTER_LOOKUP_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_AR_VOTER_LOOKUP;
}

/** Native voter registration command center (Kelly-branded shell; official lookup is a handoff). */
export function getVoterRegistrationCenterHref(countySlug?: string | null): string {
  const base = "/voter-registration";
  if (!countySlug?.trim()) return base;
  return `${base}?county=${encodeURIComponent(countySlug.trim())}`;
}

export function getRegistrationHelpHref(): string {
  return "/voter-registration#help";
}

export function getVolunteerInCountyHref(countySlug: string): string {
  return `/get-involved?ref_county=${encodeURIComponent(countySlug)}#volunteer`;
}

export function getHostOrVisitRequestHref(): string {
  return "/host-a-gathering";
}

export function getReferForRegistrationHelpHref(): string {
  return "/voter-registration#refer";
}

export function getCountyRegistrationTeamHref(countySlug: string): string {
  return `/voter-registration?county=${encodeURIComponent(countySlug)}#volunteer`;
}

export function getLocalIssueSubmissionHref(): string {
  return "/get-involved";
}
