/**
 * `datetime-local` value uses local time without timezone. Round-trip for editing scheduled fields.
 */
export function toDatetimeLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseDatetimeLocalToUtc(value: string | null | undefined): Date | null {
  if (value == null || !String(value).trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
