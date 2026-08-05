export type VisitStatus =
  | "completed"
  | "scheduled"
  | "needs-review"
  | "canceled"
  | "declined"
  | "virtual"
  | "private"
  | "duplicate";

export type KellyCampaignStop = {
  id: string;
  date: string;
  endDate?: string;
  title: string;
  publicTitle?: string;
  city?: string;
  counties: string[];
  status: VisitStatus;
  includeOnPublicPage: boolean;
  confidence: "confirmed" | "likely" | "uncertain";
  notes?: string;
  sourceType?: "calendar" | "local-file" | "manual";
};
