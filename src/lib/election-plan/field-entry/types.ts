export const FIELD_ENTRY_CATEGORIES = [
  { value: "follower", label: "Follower / supporter" },
  { value: "volunteer", label: "Volunteer" },
  { value: "leader", label: "Leader (Po5 / captain)" },
  { value: "email_contact", label: "Email list contact" },
  { value: "conversation", label: "Meaningful conversation" },
  { value: "house_party", label: "House party / host" },
  { value: "other", label: "Other field result" },
] as const;

export type FieldEntryCategory = (typeof FIELD_ENTRY_CATEGORIES)[number]["value"];

export type FieldEntryRow = {
  id: string;
  operatorInitials: string;
  operatorDisplayName: string;
  category: FieldEntryCategory;
  label: string;
  description: string | null;
  quantity: number;
  countySlug: string;
  citySlug: string | null;
  createdAt: string;
};

export type FieldEntryRollup = {
  category: FieldEntryCategory;
  label: string;
  totalQuantity: number;
  entryCount: number;
};

export type FieldEntryLocationSummary = {
  entries: FieldEntryRow[];
  rollups: FieldEntryRollup[];
  totalQuantity: number;
};
