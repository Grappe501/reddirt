export type CountyMemoryAdditiveEntry = {
  at: string;
  sourceEventId: string;
  eventTitle: string;
  summary: string;
};

export type CountyMemoryRecord = {
  countySlug: string;
  countyLabel: string;
  updatedAt: string;
  eventCount: number;
  recurringIssues: string[];
  recurringVolunteers: string[];
  recurringHosts: string[];
  recurringDonors: string[];
  strongestMessaging: string[];
  weakMessaging: string[];
  turnoutPatterns: string[];
  geographyPatterns: string[];
  bestEventFormats: string[];
  organizerReliability: string[];
  relationshipGraphPlaceholder: string;
  recentEventIds: string[];
  additiveLog: CountyMemoryAdditiveEntry[];
};
