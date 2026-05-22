export type EventBlueprintType =
  | "successful_house_party"
  | "successful_county_meeting"
  | "successful_fundraiser"
  | "successful_speaking_event"
  | "successful_volunteer_event";

export type EventBlueprint = {
  id: string;
  type: EventBlueprintType;
  title: string;
  learnedFromEventIds: string[];
  prepTimeline: string;
  materials: string;
  volunteerNeeds: string;
  roomSetup: string;
  messaging: string;
  risks: string;
  idealAttendance: string;
  followUpPattern: string;
  createdAt: string;
  updatedAt: string;
};

export type EventBlueprintIndex = {
  version: 1;
  blueprints: EventBlueprint[];
};
