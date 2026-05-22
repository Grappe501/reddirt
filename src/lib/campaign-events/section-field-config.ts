import type { EditableFactSectionId } from "./constants";
import type { CampaignEventFactCardData } from "./fact-card-data";
import type { FactField, FactCardSection } from "./types";

type FieldConfig = { key: string; label: string; helper?: string; inputType?: "text" | "textarea" | "select"; options?: string[] };

export const SECTION_FIELD_CONFIG: Record<EditableFactSectionId, FieldConfig[]> = {
  when: [
    { key: "arrivalTime", label: "Arrival time" },
    { key: "setupTime", label: "Setup time" },
    { key: "departureTime", label: "Departure time" },
    { key: "volunteerArrivalTime", label: "Volunteer arrival time" },
  ],
  where: [
    { key: "venueName", label: "Venue name" },
    { key: "address", label: "Address", helper: "Optional for mileage — city is enough." },
    { key: "city", label: "City" },
    { key: "county", label: "County" },
    { key: "parkingNotes", label: "Parking notes" },
    { key: "roomLocation", label: "Room / table / booth" },
    { key: "mapsLink", label: "Maps link" },
  ],
  why: [
    { key: "eventType", label: "Event type" },
    { key: "campaignPurpose", label: "Campaign purpose" },
    { key: "strategicObjective", label: "Strategic objective" },
    { key: "targetAudience", label: "Target audience" },
    { key: "fundraisingOpportunity", label: "Fundraising opportunity" },
  ],
  who: [
    { key: "hostName", label: "Host name" },
    { key: "hostOrganization", label: "Host organization" },
    { key: "hostPhone", label: "Host phone" },
    { key: "hostEmail", label: "Host email" },
    { key: "campaignPointPerson", label: "Campaign point person" },
    {
      key: "kellyAttendanceMode",
      label: "Kelly attendance",
      inputType: "select",
      options: ["in_person", "zoom", "not_attending", "unknown"],
    },
    { key: "volunteersNeeded", label: "Volunteers needed?" },
    { key: "volunteerCount", label: "Volunteer count" },
    { key: "volunteerMeetup", label: "Volunteer meetup time/place" },
  ],
  what: [
    { key: "candidateRole", label: "Candidate role" },
    { key: "speakingSlot", label: "Speaking slot?" },
    { key: "speakingTime", label: "Speaking time" },
    { key: "marketingTable", label: "Marketing table?" },
    { key: "materialsNeeded", label: "Materials needed" },
    { key: "yardSigns", label: "Yard signs" },
    { key: "literature", label: "Literature" },
    { key: "banner", label: "Banner" },
    { key: "donationQrForms", label: "Donation QR / forms" },
    { key: "volunteerSignupSheets", label: "Volunteer signup sheets" },
  ],
  travel: [
    { key: "assumedOriginCity", label: "Assumed origin city" },
    { key: "originOverrideCity", label: "Origin override city", helper: "Overrides Tue/Fri LR or Rose Bud default." },
    { key: "assumedDestinationCity", label: "Assumed destination city" },
    { key: "destinationOverrideCity", label: "Destination override city" },
    { key: "travelStartPointLabel", label: "Travel start label" },
    { key: "travelEndPointLabel", label: "Travel end label" },
    { key: "roundTripMiles", label: "Round trip miles", helper: "Recalculated on save when destination city is set." },
    { key: "travelTimeMinutes", label: "Travel time (minutes)" },
    { key: "reimbursementStatus", label: "Reimbursement status" },
  ],
};

export function buildEditableFactSection(
  sectionId: EditableFactSectionId,
  factCard: CampaignEventFactCardData,
  meta: Pick<FactCardSection, "title" | "helper" | "defaultCollapsed" | "emphasis">,
): FactCardSection {
  const data = factCard[sectionId] as Record<string, string | undefined>;
  const fields: FactField[] = SECTION_FIELD_CONFIG[sectionId].map((cfg) => {
    const raw = data[cfg.key];
    const text =
      raw == null || raw === ""
        ? ""
        : typeof raw === "string"
          ? raw
          : String(raw);
    const trimmed = text.trim();
    return {
      key: cfg.key,
      label: cfg.label,
      value: trimmed || undefined,
      status: trimmed ? "known" : "missing",
      helper: cfg.helper,
    };
  });
  return { id: sectionId, ...meta, fields };
}
