import { addDays, startOfWeek } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";

const TZ = "America/Chicago";

export type WeekRange = {
  /** Monday 00:00 wall in Chicago as ISO instant string */
  startIso: string;
  /** Next Monday 00:00 (exclusive upper bound) */
  endExclusiveIso: string;
  mondayYmd: string;
  label: string;
};

/** `anchorYmd` optional Monday yyyy-mm-dd; defaults to Monday of current week (Chicago). */
export function getChicagoWeekRange(anchorYmd?: string): WeekRange {
  const base =
    anchorYmd && /^\d{4}-\d{2}-\d{2}$/.test(anchorYmd)
      ? toDate(`${anchorYmd} 12:00:00`, { timeZone: TZ })
      : toDate(formatInTimeZone(new Date(), TZ, "yyyy-MM-dd") + " 12:00:00", { timeZone: TZ });
  const mon = startOfWeek(base, { weekStartsOn: 1 });
  const nextMon = addDays(mon, 7);
  const mondayYmd = formatInTimeZone(mon, TZ, "yyyy-MM-dd");
  return {
    startIso: formatInTimeZone(mon, TZ, "yyyy-MM-dd'T'00:00:00XXX"),
    endExclusiveIso: formatInTimeZone(nextMon, TZ, "yyyy-MM-dd'T'00:00:00XXX"),
    mondayYmd,
    label: `${mondayYmd} week (Mon–Sun, ${TZ})`,
  };
}
