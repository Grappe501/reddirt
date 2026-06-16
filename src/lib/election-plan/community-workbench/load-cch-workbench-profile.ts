import source from "../../../../data/campaign-brain/campaign-communications-workbenches.registry.source.json";

export type CchIntelSection = { key: string; label: string };

export type CchVolunteerPathway = { key: string; label: string };

export type CchWorkbenchCategory = "hub" | "feeds" | "operations";

export type CchWorkbenchProfile = {
  slug: string;
  name: string;
  category: CchWorkbenchCategory;
  tagline: string;
  frameworkNote?: string;
  pipelineStatuses?: string[];
  ideaBuckets?: string[];
  assignmentRoles?: string[];
  approvalChain?: string[];
  submissionTypes?: string[];
  mediaImageTags?: string[];
  mediaVideoTags?: string[];
  intelSections?: CchIntelSection[];
  volunteerPathways?: CchVolunteerPathway[];
};

type SourceFile = {
  workbenches: CchWorkbenchProfile[];
};

const file = source as SourceFile;

export function getCchWorkbenchRegistry(): CchWorkbenchProfile[] {
  return file.workbenches;
}

export function getCchWorkbenchProfile(slug: string): CchWorkbenchProfile | undefined {
  return file.workbenches.find((w) => w.slug === slug);
}

export function getCchWorkbenchesByCategory(category: CchWorkbenchCategory): CchWorkbenchProfile[] {
  return file.workbenches.filter((w) => w.category === category);
}

export function isCchWorkbenchSlug(slug: string): boolean {
  return file.workbenches.some((w) => w.slug === slug);
}
