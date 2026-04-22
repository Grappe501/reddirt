import type { EventItem, FieldAttendance } from "@/content/types";

export const FIELD_PIN = {
  unscheduled: "#f5f2ed",
  suggested: "#ea580c",
  tentative: "#2563eb",
  confirmed: "#6e7f5f",
} as const satisfies Record<FieldAttendance, string>;

export function getFieldAttendance(e: EventItem): FieldAttendance {
  if (e.type !== "Fairs and Festivals") return "unscheduled";
  return e.fieldAttendance ?? "unscheduled";
}

/** Card shell: border/background; consistent with map pin semantics. */
export function fairFieldCardClass(att: FieldAttendance): string {
  switch (att) {
    case "suggested":
      return "border-amber-500/45 bg-amber-50/50 shadow-[0_0_0_1px_rgba(234,88,12,0.12)]";
    case "tentative":
      return "border-blue-600/40 bg-blue-50/40 shadow-[0_0_0_1px_rgba(37,99,235,0.1)]";
    case "confirmed":
      return "border-field-green/50 bg-field-green/10 shadow-[0_0_0_1px_rgba(110,127,95,0.15)]";
    default:
      return "border-deep-soil/10 bg-[var(--color-surface-elevated)]";
  }
}
