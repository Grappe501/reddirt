export type FieldActivationKey = "phoneBank" | "postcards" | "canvassing";

export type FieldActivationOption = {
  enabled: boolean;
  notes: string;
  /** Override default lead-time date (YYYY-MM-DD) */
  scheduledDate?: string;
};

export type FieldPrepTask = {
  id: string;
  label: string;
  done: boolean;
  dueDate?: string;
};

export type FieldEventWorksheet = {
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
  fieldNotes: string;
  prepTasks: FieldPrepTask[];
  activations: Record<FieldActivationKey, FieldActivationOption>;
  updatedAt: string;
};

export type FieldOperationalTask = {
  id: string;
  eventId: string;
  eventLabel: string;
  eventDate: string;
  date: string;
  type: FieldActivationKey | "prep" | "event_day";
  label: string;
  source: "activation" | "prep" | "run_of_day";
};

export const DEFAULT_PREP_TASKS: Omit<FieldPrepTask, "done">[] = [
  { id: "venue", label: "Confirm venue, time, and point of contact" },
  { id: "validators", label: "Local validator / host outreach complete" },
  { id: "mobilize", label: "Mobilize draft reviewed (human approval before publish)" },
  { id: "facebook", label: "Facebook event draft reviewed" },
  { id: "volunteers", label: "Volunteer shifts assigned" },
  { id: "comms", label: "Kelly briefing / talking points locked" },
  { id: "materials", label: "Signs, literature, and swag packed" },
];

export const ACTIVATION_LEAD_DAYS: Record<FieldActivationKey, number> = {
  phoneBank: 7,
  postcards: 14,
  canvassing: 3,
};

export const ACTIVATION_LABELS: Record<FieldActivationKey, string> = {
  phoneBank: "Phone bank",
  postcards: "Postcards / writing party",
  canvassing: "Canvassing",
};
