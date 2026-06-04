import fs from "node:fs";
import path from "node:path";

export type PackoResearchTask = {
  id: string;
  task: string;
  status: string;
  owner: string;
  deliverable: string;
};

export type MichaelPackoScaffold = {
  candidateId: string;
  displayName: string;
  party: string;
  office: string;
  electionYear: number;
  status: string;
  lastUpdated: string;
  summary: string;
  researchPriorities: PackoResearchTask[];
  provisionalThemes: string[];
  kellyPositioning: {
    inClerkRooms: string;
    inDebate: string;
    claimsGate: string;
  };
  routesWhenLive: Record<string, string>;
};

const SCAFFOLD_PATH = path.join(
  process.cwd(),
  "data",
  "opposition",
  "michael-packo-profile",
  "michael-packo-opposition-scaffold.json",
);

export function loadMichaelPackoScaffold(): MichaelPackoScaffold | null {
  try {
    const raw = fs.readFileSync(SCAFFOLD_PATH, "utf8");
    return JSON.parse(raw) as MichaelPackoScaffold;
  } catch {
    return null;
  }
}

export function packoOpenTaskCount(scaffold: MichaelPackoScaffold): number {
  return scaffold.researchPriorities.filter((t) => t.status === "OPEN").length;
}
