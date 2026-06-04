/**
 * Kelly Grappe candidate dossier loader — friendly candidate alignment profile.
 */
import fs from "node:fs";
import path from "node:path";

export type KellyCoreStrength = {
  id: string;
  strength: string;
  evidenceStatus: string;
  debateUse: string;
};

export type KellyExperienceTheme = {
  theme: string;
  sosFunctions: string[];
  debateLine: string;
};

export type KellyCandidateDossierFile = {
  candidateId: string;
  displayName: string;
  party: string;
  office: string;
  dossierStatus: string;
  classification: string;
  executiveSummary: string;
  coreStrengths: KellyCoreStrength[];
  experienceToOfficeThemes: KellyExperienceTheme[];
  thirtySecondBioFramework: {
    past: string[];
    present: string[];
    future: string[];
  };
  relatedRoutes: Record<string, string>;
  researchGaps?: string[];
};

const OPPOSITION_ROOT = path.join(process.cwd(), "data/opposition");

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(OPPOSITION_ROOT, rel), "utf8")) as T;
}

export function loadKellyGrappeCandidateDossier(): KellyCandidateDossierFile {
  return readJson("kelly-grappe-profile/kelly-grappe-candidate-dossier.json");
}

export const KELLY_DOSSIER_CANDIDATE = {
  candidateId: "kelly-grappe" as const,
  displayName: "Kelly Grappe",
  party: "Democratic",
  status: "PRODUCTION",
  classification: "CANDIDATE_EYES_ONLY",
  href: "/admin/intelligence/candidate-dossiers/kelly-grappe",
};

/** All candidates with dossiers — Kelly first (friendly), then opponents. */
export const ALL_CANDIDATE_DOSSIER_ENTRIES = [
  KELLY_DOSSIER_CANDIDATE,
  {
    candidateId: "kim-hammer" as const,
    displayName: "Kim Hammer",
    party: "Republican",
    status: "PRODUCTION",
    classification: "OPPOSITION",
    href: "/admin/intelligence/opponents/dossiers/kim-hammer",
  },
  {
    candidateId: "michael-packo" as const,
    displayName: "Dr. Michael Pakko",
    party: "Libertarian",
    status: "PARTIAL_VERIFIED",
    classification: "OPPOSITION",
    href: "/admin/intelligence/opponents/dossiers/michael-packo",
  },
] as const;
