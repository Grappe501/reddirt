import source from "../../../../data/campaign-brain/coalition-workbenches.registry.source.json";

export type CoalitionIntelSection = { key: string; label: string };

export type CoalitionVolunteerPathway = {
  key: string;
  label: string;
  labelEs?: string;
};

export type CoalitionWorkbenchProfile = {
  slug: string;
  name: string;
  tagline: string;
  locale: string;
  frameworkNote?: string;
  leadRole?: string;
  intelSections: CoalitionIntelSection[];
  volunteerPathways: CoalitionVolunteerPathway[];
};

type SourceFile = {
  workbenches: CoalitionWorkbenchProfile[];
};

const file = source as SourceFile;

export function getCoalitionWorkbenchRegistry(): CoalitionWorkbenchProfile[] {
  return file.workbenches;
}

export function getCoalitionWorkbenchProfile(slug: string): CoalitionWorkbenchProfile | undefined {
  return file.workbenches.find((w) => w.slug === slug);
}

export function isCoalitionWorkbenchSlug(slug: string): boolean {
  return file.workbenches.some((w) => w.slug === slug);
}
