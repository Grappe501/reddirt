import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE } from "./constants";

export type KellyAttendanceModeValue = "in_person" | "zoom" | "not_attending" | "unknown";

export type CampaignEventFactCardWhen = {
  arrivalTime?: string;
  setupTime?: string;
  departureTime?: string;
  volunteerArrivalTime?: string;
};

export type CampaignEventFactCardWhere = {
  venueName?: string;
  address?: string;
  city?: string;
  county?: string;
  /** ZIP helps confirm county — flag when missing on campaign events. */
  zipCode?: string;
  parkingNotes?: string;
  roomLocation?: string;
  mapsLink?: string;
};

export type CampaignEventFactCardWhy = {
  eventType?: string;
  campaignPurpose?: string;
  strategicObjective?: string;
  targetAudience?: string;
  fundraisingOpportunity?: string;
};

export type CampaignEventFactCardWho = {
  hostName?: string;
  hostOrganization?: string;
  hostPhone?: string;
  hostEmail?: string;
  campaignPointPerson?: string;
  kellyAttendanceMode?: KellyAttendanceModeValue;
  volunteersNeeded?: string;
  volunteerCount?: string;
  volunteerMeetup?: string;
};

export type CampaignEventFactCardWhat = {
  candidateRole?: string;
  speakingSlot?: string;
  speakingTime?: string;
  marketingTable?: string;
  materialsNeeded?: string;
  yardSigns?: string;
  literature?: string;
  banner?: string;
  donationQrForms?: string;
  volunteerSignupSheets?: string;
};

export type CampaignEventFactCardTravel = {
  assumedOriginCity?: string;
  assumedDestinationCity?: string;
  travelStartPointLabel?: string;
  travelEndPointLabel?: string;
  originOverrideAllowed?: boolean;
  destinationOverrideAllowed?: boolean;
  originOverrideCity?: string;
  destinationOverrideCity?: string;
  roundTripMiles?: number;
  travelTimeMinutes?: number;
  reimbursementRate?: number;
  reimbursementAmount?: number;
  mileageSource?: string;
  reimbursementStatus?: string;
};

export type CampaignEventFactCardData = {
  when: CampaignEventFactCardWhen;
  where: CampaignEventFactCardWhere;
  why: CampaignEventFactCardWhy;
  who: CampaignEventFactCardWho;
  what: CampaignEventFactCardWhat;
  travel: CampaignEventFactCardTravel;
};

export function emptyFactCardData(): CampaignEventFactCardData {
  return {
    when: {},
    where: {},
    why: {},
    who: { kellyAttendanceMode: "unknown" },
    what: {},
    travel: {
      originOverrideAllowed: true,
      destinationOverrideAllowed: true,
      reimbursementRate: CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE,
      reimbursementStatus: "not_submitted",
    },
  };
}

export function parseFactCardData(raw: unknown): CampaignEventFactCardData {
  const base = emptyFactCardData();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    when: { ...base.when, ...(asRecord(o.when) as CampaignEventFactCardWhen) },
    where: { ...base.where, ...(asRecord(o.where) as CampaignEventFactCardWhere) },
    why: { ...base.why, ...(asRecord(o.why) as CampaignEventFactCardWhy) },
    who: { ...base.who, ...(asRecord(o.who) as CampaignEventFactCardWho) },
    what: { ...base.what, ...(asRecord(o.what) as CampaignEventFactCardWhat) },
    travel: { ...base.travel, ...(asRecord(o.travel) as CampaignEventFactCardTravel) },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function countEditableGaps(data: CampaignEventFactCardData): number {
  const checks: Array<string | undefined> = [
    data.when.arrivalTime,
    data.where.city,
    data.why.campaignPurpose,
    data.who.hostName,
    data.what.candidateRole,
    data.travel.assumedDestinationCity,
  ];
  return checks.filter((v) => !v?.trim()).length;
}
