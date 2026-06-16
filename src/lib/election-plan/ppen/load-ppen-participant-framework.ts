import source from "../../../../data/campaign-brain/ppen-participant-framework.source.json";

export type PpenCoreObject = {
  key: string;
  label: string;
  question: string;
  description: string;
};

export type PpenAccessLevel = { level: number; key: string; label: string };

export type PpenProfileField = { key: string; label: string; required: boolean };

export type PpenParticipationContext = { key: string; label: string; example: string };

export type PpenParticipationField = { key: string; label: string; required: boolean };

export type PpenJourneyTrack = { key: string; label: string; optional: boolean };

export type PpenMyJourneyField = {
  key: string;
  label: string;
  format: string;
  example?: string;
};

export type PpenImpactMetric = { key: string; label: string; section: string };

export type PpenWorkbenchSection = { key: string; label: string };

export type PpenIntakeStep = { key: string; label: string; phase: string };

export type PpenOsLayer = {
  key: string;
  label: string;
  position: number;
  includes?: string[];
};

type SourceFile = typeof source;

const file = source as SourceFile;

export function getPpenCoreObjects(): PpenCoreObject[] {
  return file.coreObjects;
}

export function getPpenAccessLevels(): PpenAccessLevel[] {
  return file.accessLevels;
}

export function getPpenPersonFields(): PpenProfileField[] {
  return file.personFields;
}

/** @deprecated use getPpenPersonFields */
export function getPpenParticipantProfileFields(): PpenProfileField[] {
  return getPpenPersonFields();
}

export function getPpenParticipationContexts(): PpenParticipationContext[] {
  return file.participationContexts;
}

export function getPpenParticipationFields(): PpenParticipationField[] {
  return file.participationFields;
}

export function getPpenJourneyTracks(): PpenJourneyTrack[] {
  return file.journeyTracks;
}

export function getPpenMyJourneyHomeFields(): PpenMyJourneyField[] {
  return file.myJourneyHomeFields;
}

export function getPpenImpactMetrics(): PpenImpactMetric[] {
  return file.impactMetrics;
}

export function getPpenWorkbenchOperatingSections(): PpenWorkbenchSection[] {
  return file.workbenchOperatingSections;
}

export function getPpenIntakeActivationPipeline(): PpenIntakeStep[] {
  return file.intakeActivationPipeline;
}

export function getPpenOsLayers(): PpenOsLayer[] {
  return file.osLayers;
}

/** @deprecated use getPpenIntakeActivationPipeline */
export function getPpenActivationWorkflow(): PpenIntakeStep[] {
  return getPpenIntakeActivationPipeline();
}

export function getPpenMyFiveMetrics(): { key: string; label: string }[] {
  return [
    { key: "participants", label: "Participants" },
    { key: "my_five_completion_pct", label: "My Five Completion" },
    { key: "network_impact", label: "Network Impact (people)" },
  ];
}

export function getPpenHelpTenMetrics(): { key: string; label: string }[] {
  return [
    { key: "people_assisted", label: "People Assisted" },
    { key: "registration_verification", label: "Registration Verification" },
    { key: "vote_plans", label: "Vote Plans" },
  ];
}
