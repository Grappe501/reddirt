import source from "../../../../data/campaign-brain/social-media-workbenches.registry.source.json";

export type SmosIntelSection = { key: string; label: string };

export type SmosVolunteerPathway = { key: string; label: string };

export type SmosWorkbenchCategory = "core" | "writing" | "platform" | "production";

export type SmosWorkbenchProfile = {
  slug: string;
  name: string;
  category: SmosWorkbenchCategory;
  tagline: string;
  frameworkNote?: string;
  pipelineStatuses?: string[];
  ideaBuckets?: string[];
  assignmentRoles?: string[];
  approvalChain?: string[];
  submissionTypes?: string[];
  mediaImageTags?: string[];
  mediaVideoTags?: string[];
  intelSections?: SmosIntelSection[];
  volunteerPathways?: SmosVolunteerPathway[];
};

type SourceFile = {
  workbenches: SmosWorkbenchProfile[];
};

const file = source as SourceFile;

export function getSmosWorkbenchRegistry(): SmosWorkbenchProfile[] {
  return file.workbenches;
}

export function getSmosWorkbenchProfile(slug: string): SmosWorkbenchProfile | undefined {
  return file.workbenches.find((w) => w.slug === slug);
}

export function getSmosWorkbenchesByCategory(category: SmosWorkbenchCategory): SmosWorkbenchProfile[] {
  return file.workbenches.filter((w) => w.category === category);
}

export function isSmosWorkbenchSlug(slug: string): boolean {
  return file.workbenches.some((w) => w.slug === slug);
}
