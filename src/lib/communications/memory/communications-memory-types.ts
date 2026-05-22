export type CommunicationsMemoryEntry = {
  id: string;
  contactId?: string;
  countySlug?: string;
  category:
    | "interaction"
    | "promise"
    | "volunteer_interest"
    | "host_note"
    | "leadership_note"
    | "county_concern"
    | "unresolved_outreach"
    | "preference";
  summary: string;
  createdAt: string;
  updatedAt: string;
  humanReviewed: boolean;
};

export type CommunicationsMemoryStore = {
  entries: CommunicationsMemoryEntry[];
  updatedAt: string;
};
