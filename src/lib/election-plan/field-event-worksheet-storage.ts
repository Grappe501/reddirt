import type {
  FieldActivationKey,
  FieldEventWorksheet,
  FieldOperationalTask,
  FieldPrepTask,
} from "@/lib/election-plan/field-event-worksheet-types";
import {
  ACTIVATION_LABELS,
  ACTIVATION_LEAD_DAYS,
  DEFAULT_PREP_TASKS,
} from "@/lib/election-plan/field-event-worksheet-types";

export const FIELD_EVENT_WORKSHEET_STORAGE_KEY = "kgrappe-field-event-worksheets-v1";

export type ExecutiveCalendarEntry = {
  id: string;
  startDate: string;
  endDate: string | null;
  label: string;
  city: string | null;
  county: string;
  category: string;
  status: string;
  source: string;
  eventType?: string;
  notes?: string;
};

function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function defaultWorksheet(entry: ExecutiveCalendarEntry): FieldEventWorksheet {
  const place = entry.city ? `${entry.city}, ${entry.county} County` : `${entry.county} County`;
  return {
    accomplishment: `What we are trying to accomplish at ${entry.label} in ${place} — fill from field intelligence and county/city brief.`,
    messaging: `Localized message for ${place} — competent SOS service, Arkansas everyday life, Big Table framing.`,
    volunteers: "",
    localContact: "",
    localContactRole: "",
    runOfDay: `Run of day for ${entry.startDate}:\n\n• Travel / arrival\n• Setup\n• Kelly program\n• Volunteer shifts\n• Departure / debrief`,
    logisticsTravel: "",
    logisticsVenue: "",
    logisticsMaterials: "",
    logisticsNotes: "",
    fieldNotes: "",
    prepTasks: DEFAULT_PREP_TASKS.map((t) => ({ ...t, done: false })),
    activations: {
      phoneBank: { enabled: false, notes: "" },
      postcards: { enabled: false, notes: "" },
      canvassing: { enabled: false, notes: "" },
    },
    updatedAt: new Date().toISOString(),
  };
}

export function scaffoldWorksheet(
  entry: ExecutiveCalendarEntry,
  overrides?: Partial<FieldEventWorksheet>,
): FieldEventWorksheet {
  const base = defaultWorksheet(entry);
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    prepTasks: overrides.prepTasks ?? base.prepTasks,
    activations: overrides.activations ?? base.activations,
    updatedAt: overrides.updatedAt ?? base.updatedAt,
  };
}

export function loadAllWorksheets(): Record<string, FieldEventWorksheet> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FIELD_EVENT_WORKSHEET_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FieldEventWorksheet>) : {};
  } catch {
    return {};
  }
}

export function saveWorksheet(eventId: string, worksheet: FieldEventWorksheet): void {
  const all = loadAllWorksheets();
  all[eventId] = { ...worksheet, updatedAt: new Date().toISOString() };
  localStorage.setItem(FIELD_EVENT_WORKSHEET_STORAGE_KEY, JSON.stringify(all));
}

export function getWorksheet(eventId: string, entry: ExecutiveCalendarEntry): FieldEventWorksheet {
  const all = loadAllWorksheets();
  return all[eventId] ?? defaultWorksheet(entry);
}

export function activationScheduledDate(
  eventDate: string,
  key: FieldActivationKey,
  option: FieldEventWorksheet["activations"][FieldActivationKey],
): string {
  if (option.scheduledDate) return option.scheduledDate;
  return addDaysYmd(eventDate, -ACTIVATION_LEAD_DAYS[key]);
}

export function buildOperationalTasks(
  entry: ExecutiveCalendarEntry,
  worksheet: FieldEventWorksheet,
): FieldOperationalTask[] {
  const tasks: FieldOperationalTask[] = [];
  const eventDate = entry.startDate;

  (Object.keys(worksheet.activations) as FieldActivationKey[]).forEach((key) => {
    const opt = worksheet.activations[key];
    if (!opt.enabled) return;
    tasks.push({
      id: `${entry.id}-${key}`,
      eventId: entry.id,
      eventLabel: entry.label,
      eventDate,
      date: activationScheduledDate(eventDate, key, opt),
      type: key,
      label: `${ACTIVATION_LABELS[key]} — ${entry.label}`,
      source: "activation",
    });
  });

  worksheet.prepTasks.forEach((t) => {
    if (!t.dueDate) return;
    tasks.push({
      id: `${entry.id}-prep-${t.id}`,
      eventId: entry.id,
      eventLabel: entry.label,
      eventDate,
      date: t.dueDate,
      type: "prep",
      label: t.label,
      source: "prep",
    });
  });

  tasks.push({
    id: `${entry.id}-event-day`,
    eventId: entry.id,
    eventLabel: entry.label,
    eventDate,
    date: eventDate,
    type: "event_day",
    label: `Event day — ${entry.label}`,
    source: "run_of_day",
  });

  return tasks.sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

export function buildAllOperationalTasks(
  entries: ExecutiveCalendarEntry[],
  worksheets: Record<string, FieldEventWorksheet>,
): FieldOperationalTask[] {
  const today = new Date().toISOString().slice(0, 10);
  return entries
    .flatMap((entry) => buildOperationalTasks(entry, worksheets[entry.id] ?? defaultWorksheet(entry)))
    .filter((t) => t.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
}

export function exportWorksheetsJson(entries: ExecutiveCalendarEntry[]): string {
  const worksheets = loadAllWorksheets();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      events: entries
        .filter((e) => worksheets[e.id])
        .map((e) => ({ eventId: e.id, label: e.label, startDate: e.startDate, worksheet: worksheets[e.id] })),
    },
    null,
    2,
  );
}
