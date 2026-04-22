import { CampaignEventType } from "@prisma/client";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";

export type PublicCalendarSearchState = {
  view: "list" | "month";
  range: "all_upcoming" | "this_week" | "this_month";
  county: string;
  type: "ALL" | CampaignEventType;
  venue: "all" | "virtual" | "in_person" | "unspecified";
  /** YYYY-MM for month view calendar focus */
  calMonth: string;
};

const DEFAULT_STATE: PublicCalendarSearchState = {
  view: "list",
  range: "all_upcoming",
  county: "",
  type: "ALL",
  venue: "all",
  calMonth: "",
};

function ymdInDefaultTz(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PUBLIC_CALENDAR_DEFAULT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(d)
    .replace(/\//g, "-");
}

export function defaultCalMonthYmd(d = new Date()): string {
  return ymdInDefaultTz(d).slice(0, 7);
}

const SET = new Set<string>(Object.values(CampaignEventType));

export function parsePublicCalendarParams(
  sp: Record<string, string | string[] | undefined>
): PublicCalendarSearchState {
  const g = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const view = g("view") === "month" ? "month" : "list";
  const rangeRaw = g("range");
  const range =
    rangeRaw === "this_week" || rangeRaw === "this_month" || rangeRaw === "all_upcoming" ? rangeRaw : "all_upcoming";
  const county = (g("county") ?? "").trim();
  const typeRaw = (g("type") ?? "ALL").trim();
  const type: "ALL" | CampaignEventType =
    typeRaw === "ALL" || SET.has(typeRaw) ? (typeRaw as "ALL" | CampaignEventType) : "ALL";
  const vRaw = (g("venue") ?? "all").trim();
  const venue: PublicCalendarSearchState["venue"] =
    vRaw === "virtual" || vRaw === "in_person" || vRaw === "unspecified" ? vRaw : "all";
  const calMonth = (g("m") ?? "").trim() || defaultCalMonthYmd();
  return { ...DEFAULT_STATE, view, range, county, type, venue, calMonth };
}

export function buildCalendarHref(updates: Partial<PublicCalendarSearchState> & { view?: "list" | "month" }) {
  const u = new URLSearchParams();
  const merged: PublicCalendarSearchState = {
    ...{
      view: "list",
      range: "all_upcoming",
      county: "",
      type: "ALL",
      venue: "all",
      calMonth: defaultCalMonthYmd(),
    },
    ...updates,
  };
  u.set("view", merged.view);
  u.set("range", merged.range);
  if (merged.county) u.set("county", merged.county);
  if (merged.type && merged.type !== "ALL") u.set("type", merged.type);
  if (merged.venue && merged.venue !== "all") u.set("venue", merged.venue);
  if (merged.view === "month") u.set("m", merged.calMonth);
  return u.toString() ? `?${u.toString()}` : "";
}
