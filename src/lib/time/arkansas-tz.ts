import { toDate } from "date-fns-tz";

const TZ = "America/Chicago";

/** Wall clock in Arkansas (handles DST) → UTC `Date` for Prisma. */
export function parseArkansasLocalDateTime(isoDate: string, timeHm: string): Date {
  const t = timeHm.length === 5 ? `${timeHm}:00` : timeHm;
  const s = `${isoDate} ${t}`.replace("T", " ");
  return toDate(s, { timeZone: TZ });
}
