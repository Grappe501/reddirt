import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";

import source from "../../../data/campaign-brain/field-event-worksheets.source.json";

type SourceWorksheet = Partial<{
  accomplishment: string;
  messaging: string;
  volunteers: string;
  localContact: string;
  localContactRole: string;
  runOfDay: string;
  logisticsTravel: string;
  logisticsVenue: string;
  logisticsMaterials: string;
  logisticsNotes: string;
}>;

export function getExecutiveCalendarEntry(
  data: ElectionPlanWorkbenchSnapshot,
  eventId: string,
): ExecutiveCalendarEntry | undefined {
  return data.executiveCalendar.entries.find((e) => e.id === eventId);
}

export function getSourceWorksheetOverrides(eventId: string): SourceWorksheet | undefined {
  return (source.worksheets as Record<string, SourceWorksheet>)[eventId];
}

export function findForwardMotionMatch(
  data: ElectionPlanWorkbenchSnapshot,
  entry: ExecutiveCalendarEntry,
) {
  return data.forwardMotion.stops.find(
    (s) => s.date === entry.startDate && s.eventName.toLowerCase().includes(entry.label.slice(0, 12).toLowerCase()),
  );
}
