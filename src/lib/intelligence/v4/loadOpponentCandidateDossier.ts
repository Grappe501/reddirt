/**
 * Unified opponent candidate dossier loaders — Hammer (production) + Pakko (expanded scaffold).
 */
import fs from "node:fs";
import path from "node:path";

export type DossierClaim = {
  claim: string;
  classification: string;
  evidenceStatus: string;
  sourceHint?: string;
  kellyRebuttalFrame?: string;
};

export type LeadStoryWatch = {
  id: string;
  headline: string;
  watchFor: string;
  priority: string;
  dateContext?: string;
  href?: string;
  evidenceStatus?: string;
  sources?: string[];
};

export type CandidateDossierFile = {
  candidateId: string;
  displayName: string;
  party: string;
  office: string;
  dossierStatus: string;
  executiveSummary: string;
  whatTheyClaim: DossierClaim[];
  leadStoriesToWatch: LeadStoryWatch[];
  researchGaps?: string[];
  relatedRoutes: Record<string, string>;
};

export type StrengthEntry = {
  id: string;
  strength: string;
  evidenceStatus: string;
  sourceConfidence: string;
  debateImpact?: string;
  sources: string[];
};

export type WeaknessEntry = {
  id: string;
  weakness: string;
  evidenceStatus: string;
  sourceConfidence: string;
  riskLevel: string;
  debateUsefulness: string;
  saferWording: string;
  sources: string[];
};

const OPPOSITION_ROOT = path.join(process.cwd(), "data/opposition");

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(OPPOSITION_ROOT, rel), "utf8")) as T;
}

export function loadKimHammerCandidateDossier(): CandidateDossierFile {
  return readJson("kim-hammer-profile/kim-hammer-candidate-dossier.json");
}

export function loadMichaelPackoCandidateDossier(): CandidateDossierFile {
  return readJson("michael-packo-profile/michael-packo-candidate-dossier.json");
}

export function loadCandidateDossier(candidateId: "kim-hammer" | "michael-packo"): CandidateDossierFile {
  return candidateId === "kim-hammer" ? loadKimHammerCandidateDossier() : loadMichaelPackoCandidateDossier();
}

export function loadKimHammerStrengths(): { strengths: StrengthEntry[] } {
  return readJson("kim-hammer-profile/kim-hammer-strengths-matrix.json");
}

export function loadKimHammerWeaknesses(): { weaknesses: WeaknessEntry[] } {
  return readJson("kim-hammer-profile/kim-hammer-vulnerability-matrix.json");
}

export function loadMichaelPackoStrengths(): { strengths: StrengthEntry[] } {
  return readJson("michael-packo-profile/michael-packo-strengths-matrix.json");
}

export function loadMichaelPackoWeaknesses(): { weaknesses: WeaknessEntry[] } {
  return readJson("michael-packo-profile/michael-packo-vulnerability-matrix.json");
}

export function loadMichaelPackoBioTimeline() {
  return readJson<{
    displayName: string;
    residence?: string;
    spellingNote?: string;
    education?: Array<{ year: number; credential: string }>;
    timeline: Array<{ year: string; event: string; evidenceStatus: string; sources: string[] }>;
  }>("michael-packo-profile/michael-packo-bio-timeline.json");
}

export function loadMichaelPackoContrast() {
  return readJson<{
    contrastFrames: Array<{ frame: string; packoPositionSummary: string; kellyContrast: string }>;
    kellyDoNot: string[];
    kellyDo: string[];
  }>("michael-packo-profile/michael-packo-contrast-vs-kelly.json");
}

export const OPPONENT_DOSSIER_CANDIDATES = [
  {
    candidateId: "kim-hammer" as const,
    displayName: "Kim Hammer",
    party: "Republican",
    status: "PRODUCTION",
    href: "/admin/intelligence/opponents/dossiers/kim-hammer",
  },
  {
    candidateId: "michael-packo" as const,
    displayName: "Dr. Michael Pakko",
    party: "Libertarian",
    status: "PARTIAL_VERIFIED",
    href: "/admin/intelligence/opponents/dossiers/michael-packo",
  },
];
