import type { ElectoralImportance, OpportunityLevel, OrganizationalReadiness } from "./types";

/** Leadership-aligned dimension overrides (doctrine exemplars). CM lock replaces draft heuristics. */
export type LeadershipCountyOverride = {
  electoralImportance?: ElectoralImportance;
  opportunityLevel?: OpportunityLevel;
  organizationalReadiness?: OrganizationalReadiness;
  notes?: string;
};

/** Must-win counties — failure breaks statewide path (doctrine). */
export const CRITICAL_ELECTORAL_COUNTIES = new Set([
  "Pulaski",
  "Washington",
  "Benton",
  "Faulkner",
  "Saline",
  "Craighead",
]);

/** Growth counties — statewide advantage when gains materialize (doctrine). */
export const GROWTH_ELECTORAL_COUNTIES = new Set(["White", "Lonoke", "Garland", "Sebastian"]);

export const LEADERSHIP_COUNTY_OVERRIDES: Record<string, LeadershipCountyOverride> = {
  Benton: {
    electoralImportance: "critical",
    opportunityLevel: "high",
    organizationalReadiness: "moderate",
    notes: "Leadership exemplar — Critical + high opportunity + moderate readiness.",
  },
  Pulaski: {
    electoralImportance: "critical",
    opportunityLevel: "medium",
    organizationalReadiness: "strong",
    notes: "Leadership exemplar — Critical but strong readiness → surrogate/volunteer before Kelly.",
  },
  Montgomery: {
    electoralImportance: "maintenance",
    opportunityLevel: "low",
    organizationalReadiness: "weak",
    notes: "Leadership exemplar — maintenance county; weak ops still ranks below Critical counties.",
  },
  White: {
    electoralImportance: "important",
    opportunityLevel: "high",
    organizationalReadiness: "weak",
    notes: "Growth county — volunteer captain before Kelly unless Tier 1 event.",
  },
  Craighead: {
    electoralImportance: "critical",
    opportunityLevel: "medium",
    organizationalReadiness: "strong",
    notes: "Leadership exemplar — strong readiness → surrogate OK.",
  },
  Washington: {
    electoralImportance: "critical",
    opportunityLevel: "medium",
    organizationalReadiness: "moderate",
    notes: "Must-win NWA anchor.",
  },
  Faulkner: {
    electoralImportance: "critical",
    opportunityLevel: "medium",
    organizationalReadiness: "moderate",
    notes: "Must-win Central corridor.",
  },
  Saline: {
    electoralImportance: "critical",
    opportunityLevel: "medium",
    organizationalReadiness: "moderate",
    notes: "Must-win Central metro adjacency.",
  },
  Lonoke: { electoralImportance: "important", opportunityLevel: "high", organizationalReadiness: "moderate" },
  Garland: { electoralImportance: "important", opportunityLevel: "medium", organizationalReadiness: "moderate" },
  Sebastian: { electoralImportance: "important", opportunityLevel: "medium", organizationalReadiness: "moderate" },
};
