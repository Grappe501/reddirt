import { addDays, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { approxCountyCenter } from "@/lib/opportunities/approx-county-center";

const TZ = "America/Chicago";

export type WeekBoardDay = {
  weekday: string;
  ymd: string;
  items: CampaignCalendarItem[];
};

/** Strip admin-only drill-down for client props (Week View map + board). */
export function stripCalendarItemForWeekClient(i: CampaignCalendarItem): CampaignCalendarItem {
  const { drillDown: _ignored, ...rest } = i;
  return { ...rest };
}

export function buildWeekBoardDays(mondayYmd: string, items: CampaignCalendarItem[]): WeekBoardDay[] {
  const mon = parse(mondayYmd, "yyyy-MM-dd", new Date());
  const days: WeekBoardDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i);
    const ymd = formatInTimeZone(d, TZ, "yyyy-MM-dd");
    const weekday = formatInTimeZone(d, TZ, "EEEE");
    const dayItems = items.filter((it) => formatInTimeZone(new Date(it.start), TZ, "yyyy-MM-dd") === ymd);
    days.push({ weekday, ymd, items: dayItems });
  }
  return days;
}

export type WeekMapMarker = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  badge: string;
  county?: string;
};

function jitter(id: string, lat: number, lng: number): { lat: number; lng: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const dLat = ((h % 200) - 100) / 50_000;
  const dLng = (((h / 200) >>> 0) % 200 - 100) / 50_000;
  return { lat: lat + dLat, lng: lng + dLng };
}

export function buildWeekMapModel(
  items: CampaignCalendarItem[],
  badgeById: Record<string, string>,
): { markers: WeekMapMarker[]; polyline: [number, number][] } {
  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const markers: WeekMapMarker[] = [];
  const polyline: [number, number][] = [];
  for (const it of sorted) {
    const county = it.county?.trim();
    const base = county ? approxCountyCenter(county) : { lat: 34.75, lng: -92.35 };
    const { lat, lng } = jitter(it.id, base.lat, base.lng);
    markers.push({
      id: it.id,
      title: it.title,
      lat,
      lng,
      badge: badgeById[it.id] ?? it.calendarStatus,
      county,
    });
    polyline.push([lat, lng]);
  }
  return { markers, polyline };
}

export function weekRouteTightness(itemCount: number): "comfortable" | "busy_but_safe" | "too_tight" {
  if (itemCount > 36) return "too_tight";
  if (itemCount > 20) return "busy_but_safe";
  return "comfortable";
}
