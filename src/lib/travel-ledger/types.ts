export type TravelLedgerStorageMode = "json-fallback";

export type TravelCity = {
  city: string;
  state: string;
  label?: string;
};

export type TravelLedgerReviewStatus =
  | "needs_review"
  | "needs_location"
  | "ready_for_approval"
  | "modified"
  | "needs_more_info"
  | "denied";

export type TravelLedgerApprovalStatus = "not_approved" | "approved" | "approved_with_changes";

export type TravelLedgerItem = {
  id: string;
  date: string;
  month: string;
  sourceType: "manual_entry" | "calendar_import";
  sourceTitles: string[];
  travelCities: TravelCity[];
  routeText: string;
  baseRoundTripMiles: number;
  driveAroundPct: number;
  driveAroundMiles: number;
  driveAroundMilesOverride?: number;
  driveAroundOverrideReason?: string;
  totalReimbursableMiles: number;
  mileageRate: number;
  reimbursementAmount: number;
  businessPurpose: string;
  classification:
    | "campaign_travel"
    | "campaign_meeting"
    | "house_party"
    | "county_event"
    | "admin"
    | "virtual"
    | "personal"
    | "duplicate"
    | "unknown";
  reviewStatus: TravelLedgerReviewStatus;
  approvalStatus: TravelLedgerApprovalStatus;
  reviewerInitials?: string;
  reviewerNote?: string;
  approvedAt?: string;
  approvedBy?: string;
  hasManualChanges: boolean;
  auditIssues: string[];
  createdAt: string;
  updatedAt: string;
};

export type TravelLedgerAuditLogEntry = {
  id: string;
  itemId: string;
  action:
    | "wizard_session_created"
    | "wizard_item_saved"
    | "wizard_item_skipped"
    | "wizard_session_completed"
    | "manual_trip_created"
    | "manual_trip_modified"
    | "approved"
    | "denied"
    | "needs_more_info"
    | "voice_command";
  before?: unknown;
  after?: unknown;
  note?: string;
  actor: string;
  actorInitials?: string;
  createdAt: string;
};

export type TravelLedgerWizardSession = {
  id: string;
  title: string;
  reviewerInitials: string;
  reviewerName?: string;
  startDate: string;
  endDate: string;
  status: "in_progress" | "completed";
  itemIds: string[];
  completedItemIds: string[];
  skippedItemIds: string[];
  needsMoreInfoItemIds: string[];
  currentItemId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TravelLedgerInvoice = {
  id: string;
  month: string;
  invoiceNumber: string;
  status: "draft" | "ready" | "approved";
  totalTrips: number;
  totalApprovedMiles: number;
  totalAmountDue: number;
  generatedAt: string;
};

export type TravelLedgerSettings = {
  mileageRate: number;
  rateLabel: string;
  effectiveDate: string;
  payeeName: string;
  billToName: string;
  paymentTerms: string;
  memo: string;
};
