export const VOTER_CONTACT_STATUSES = [
  { value: "new_contact", label: "New contact" },
  { value: "follow_up", label: "Follow-up scheduled" },
  { value: "converted_volunteer", label: "Volunteer" },
  { value: "converted_donor", label: "Donor" },
  { value: "converted_leader", label: "Leadership" },
] as const;

export type VoterContactStatus = (typeof VOTER_CONTACT_STATUSES)[number]["value"];

export type VoterContactRow = {
  id: string;
  operatorInitials: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  interestVolunteer: boolean;
  interestDonor: boolean;
  interestLeadership: boolean;
  interestHost: boolean;
  notes: string | null;
  hasPhoto: boolean;
  photoDataUrl: string | null;
  countySlug: string;
  citySlug: string | null;
  workbenchSlug: string | null;
  eventSlug: string | null;
  eventLabel: string | null;
  status: VoterContactStatus;
  createdAt: string;
  updatedAt: string;
};

export type VoterContactListSummary = {
  contacts: VoterContactRow[];
  total: number;
};
