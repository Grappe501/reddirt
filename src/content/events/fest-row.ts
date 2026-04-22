/**
 * Input row for `src/content/events/arkansas-festivals-2026.ts` and guide supplement files.
 */
export type FestRow = {
  slug: string;
  title: string;
  s: { m: number; d: number };
  e?: { m: number; d: number };
  city: string;
  countySlug: string;
  note?: string;
  /**
   * Manual only. Algorithm assigns `suggested` for computed coverage; does not override
   * `tentative` or `confirmed`.
   */
  fieldAttendance?: "tentative" | "confirmed";
};
