import type { EventItem, FieldAttendance } from "@/content/types";

export const FIELD_PIN = {
  unscheduled: "#e8f0fa",
  suggested: "#ca913d",
  tentative: "#2563eb",
  confirmed: "#4a6b55",
} as const satisfies Record<FieldAttendance, string>;

export function getFieldAttendance(e: EventItem): FieldAttendance {
  if (e.type !== "Fairs and Festivals") return "unscheduled";
  return e.fieldAttendance ?? "unscheduled";
}

/** Card shell: border/background; consistent with map pin semantics. */
export function fairFieldCardClass(att: FieldAttendance): string {
  switch (att) {
    case "suggested":
      return "border-kelly-gold/50 bg-kelly-gold/10 shadow-[0_0_0_1px_rgba(202,145,61,0.18)]";
    case "tentative":
      return "border-blue-600/40 bg-blue-50/40 shadow-[0_0_0_1px_rgba(37,99,235,0.1)]";
    case "confirmed":
      return "border-kelly-success/50 bg-kelly-success/10 shadow-[0_0_0_1px_rgba(74,107,85,0.15)]";
    default:
      return "border-kelly-text/10 bg-[var(--color-surface-elevated)]";
  }
}
