import type { EventItem, FieldAttendance } from "@/content/types";

export const FIELD_PIN = {
  unscheduled: "#e8f0fa",
  suggested: "#ca913d",
  tentative: "#2563eb",
  confirmed: "#4a6b55",
  surrogate: "#dc2626",
  caution: "#d97706",
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
    case "surrogate":
      return "border-2 border-red-600 bg-red-50/40 shadow-[0_0_0_1px_rgba(220,38,38,0.15)]";
    case "caution":
      return "border-2 border-amber-500 bg-amber-50 shadow-[0_0_0_1px_rgba(217,119,6,0.2)]";
    default:
      return "border-kelly-text/10 bg-[var(--color-surface-elevated)]";
  }
}
