/** Campaign week math — Monday start in IANA time zone (default America/Chicago). */

export const DEFAULT_CAMPAIGN_TZ = "America/Chicago";

export function ymdInTimeZone(d: Date, timeZone: string): string {
  return d.toLocaleDateString("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
}

/** Mon=0 … Sun=6 in calendar (Gregorian) space for a Y-M-D at UTC noon. */
function weekdayMon0FromYmd(ymd: string): number {
  const [y, m, d0] = ymd.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d0, 12, 0, 0)).getUTCDay();
  return (w + 6) % 7;
}

export function addCalendarDays(ymd: string, n: number): string {
  const [y, m, d0] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d0 + n, 12, 0, 0));
  const y2 = t.getUTCFullYear();
  const mo2 = t.getUTCMonth() + 1;
  const d2 = t.getUTCDate();
  return `${y2}-${String(mo2).padStart(2, "0")}-${String(d2).padStart(2, "0")}`;
}

/** Monday of the ISO week containing this calendar day (in Gregorian terms). */
export function mondayYmd(ymd: string): string {
  const d0 = weekdayMon0FromYmd(ymd);
  return addCalendarDays(ymd, -d0);
}

export function weekKeyFromDate(d: Date, timeZone: string = DEFAULT_CAMPAIGN_TZ): string {
  return mondayYmd(ymdInTimeZone(d, timeZone));
}

/** Stable DB key: UTC midnight of that Monday’s calendar Y-M-D. */
export function weekStartDateFromKey(weekKey: string): Date {
  const [y, m, d] = weekKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function weekKeyFromParam(raw: string | undefined | null, timeZone: string = DEFAULT_CAMPAIGN_TZ): string {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    return weekKeyFromDate(new Date(), timeZone);
  }
  return mondayYmd(raw.trim());
}

export function addWeeks(weekKey: string, n: number): string {
  const [y, m, d0] = weekKey.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d0 + 7 * n, 12, 0, 0));
  return mondayYmd(
    `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`
  );
}

export function endOfWeekExclusive(weekKey: string): Date {
  const [y, m, d0] = weekKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d0 + 7, 0, 0, 0, 0));
}

export const ROLE_STRIP_KEYS = [
  { key: "candidate", label: "Candidate" },
  { key: "campaignManager", label: "Campaign Manager" },
  { key: "field", label: "Field" },
  { key: "comms", label: "Comms" },
  { key: "volunteerCoordinator", label: "Volunteer Coordinator" },
  { key: "social", label: "Social / Content" },
  { key: "countyLeads", label: "County Leads" },
] as const;

export type RoleStripKey = (typeof ROLE_STRIP_KEYS)[number]["key"];
