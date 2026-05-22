import type { EventPlanningData, PackListItem, PackListItemKey, VolunteerPlan } from "./event-planning-types";

export const PACK_LIST_TEMPLATES: { key: PackListItemKey; label: string }[] = [
  { key: "literature", label: "Literature" },
  { key: "signs", label: "Yard signs / hand signs" },
  { key: "banner", label: "Banner" },
  { key: "tablecloth", label: "Tablecloth" },
  { key: "donation_qr", label: "QR / donation forms" },
  { key: "volunteer_signup", label: "Volunteer signup sheets" },
  { key: "speech_notes", label: "Speech notes" },
  { key: "special_attire", label: "Special attire" },
  { key: "weather_gear", label: "Weather gear" },
  { key: "custom", label: "Custom items" },
];

export function defaultPackList(): PackListItem[] {
  return PACK_LIST_TEMPLATES.map((t) => ({
    id: `pack-${t.key}`,
    key: t.key,
    label: t.label,
    status: "needed",
    notes: "",
  }));
}

export function emptyVolunteerPlan(): VolunteerPlan {
  return {
    volunteersNeeded: "",
    numberNeeded: "",
    roles: "",
    volunteerCaptain: "",
    arrivalTime: "",
    meetupLocation: "",
    reminderStatus: "not_scheduled",
  };
}

export function emptyEventPlanningData(): EventPlanningData {
  return {
    runOfShow: [],
    packList: defaultPackList(),
    volunteerPlan: emptyVolunteerPlan(),
    contacts: {
      host: "",
      hostPhone: "",
      venue: "",
      campaignPointPerson: "",
      volunteerCaptain: "",
      candidateHandler: "",
      mediaContact: "",
      emergencyContact: "",
    },
    candidateBrief: {
      summary: "",
      talkingPoints: "",
      peopleToKnow: "",
      strategicPurpose: "",
      travelNotes: "",
      timingNotes: "",
      risks: "",
    },
    cmBrief: {
      logisticsSummary: "",
      missingItems: "",
      ownerAssignments: "",
      deadlines: "",
      risks: "",
      nextActions: "",
    },
    budget: {
      estimatedCosts: "",
      actualCosts: "",
      reimbursementNotes: "",
      receiptsPlaceholder: "",
      notes: "",
    },
    sectionCompleted: {},
  };
}
