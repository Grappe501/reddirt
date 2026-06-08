/**
 * Intelligence search v5 — collegiate professor layer on smart-v4 orchestration.
 */
import {
  runIntelligenceSearchV4,
  type IntelligenceSearchV4Result,
  type RunIntelligenceSearchV4Options,
  getProfileSearchSuggestions,
  getSreShortcutsForIntent,
  INTEL_SEARCH_V4_VERSION,
} from "@/lib/intelligence/intelligenceSearchV4";
import {
  analyzeQueryProfessorLens,
  generateIntelProfessorBrief,
  type IntelProfessorBrief,
} from "@/lib/intelligence/intelligenceProfessorBrief";
import { DEBATE_PREP_PROFESSOR_HUB_HREF } from "@/lib/intelligence/v4/debatePrepProfessorV5";

export const INTEL_SEARCH_V5_VERSION = "smart-v5.0";

export type IntelligenceSearchV5Result = IntelligenceSearchV4Result & {
  version: typeof INTEL_SEARCH_V5_VERSION;
  professorBrief: IntelProfessorBrief | null;
  professorLens: {
    academicFrame: string;
    debateDiscipline: string;
    recommendedDepth: "survey" | "seminar" | "moot";
  } | null;
  tutorHref: string;
};

export type RunIntelligenceSearchV5Options = RunIntelligenceSearchV4Options & {
  includeProfessorBrief?: boolean;
  searchMode?: "smart" | "quick" | "professor";
};

export async function runIntelligenceSearchV5(
  options: RunIntelligenceSearchV5Options,
): Promise<IntelligenceSearchV5Result> {
  const searchMode = options.searchMode ?? "smart";
  const wantProfessor = options.includeProfessorBrief ?? searchMode === "professor";

  const base = await runIntelligenceSearchV4({
    ...options,
    mode: searchMode === "professor" ? "smart" : searchMode,
    includeBrief: options.includeBrief ?? wantProfessor,
  });

  let professorBrief: IntelProfessorBrief | null = null;
  let professorLens: IntelligenceSearchV5Result["professorLens"] = null;

  if (wantProfessor && base.results.length > 0) {
    professorBrief = await generateIntelProfessorBrief(options.query, base.results, base.smart);
    professorLens = await analyzeQueryProfessorLens(options.query);
  }

  return {
    ...base,
    version: INTEL_SEARCH_V5_VERSION,
    professorBrief,
    professorLens,
    tutorHref: DEBATE_PREP_PROFESSOR_HUB_HREF,
  };
}

export { getProfileSearchSuggestions, getSreShortcutsForIntent, INTEL_SEARCH_V4_VERSION, runIntelligenceSearchV4 };
