import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type {
  ParticipationRollup,
  VoterFileCityRollup,
  VoterFileCountyRollup,
  VoterFileLocationRollupsFile,
} from "@/lib/voter-file/location-rollups-types";

const ROLLUPS_PATH = path.join(process.cwd(), "data/election/voter-file-location-rollups.json");

let cached: VoterFileLocationRollupsFile | null | undefined;

function loadRollupsFile(): VoterFileLocationRollupsFile | null {
  if (cached !== undefined) return cached;
  if (!existsSync(ROLLUPS_PATH)) {
    cached = null;
    return null;
  }
  try {
    cached = JSON.parse(readFileSync(ROLLUPS_PATH, "utf8")) as VoterFileLocationRollupsFile;
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function getVoterFileRollupsMeta(): Pick<VoterFileLocationRollupsFile, "builtAt" | "sourceFiles" | "featuredContests"> | null {
  const file = loadRollupsFile();
  if (!file) return null;
  return {
    builtAt: file.builtAt,
    sourceFiles: file.sourceFiles,
    featuredContests: file.featuredContests,
  };
}

export function getCountyVoterFileRollup(countySlug: string): VoterFileCountyRollup | null {
  const file = loadRollupsFile();
  if (!file) return null;
  return file.counties[countySlug] ?? null;
}

export function getCityVoterFileRollup(citySlug: string): VoterFileCityRollup | null {
  const file = loadRollupsFile();
  if (!file) return null;
  return file.cities[citySlug] ?? null;
}

export function getParticipationForContest(
  participation: ParticipationRollup[],
  contestKey: string,
): ParticipationRollup | undefined {
  return participation.find((p) => p.contestKey === contestKey);
}

export function participationRate(participated: number, registered: number): number | null {
  if (!registered || registered <= 0) return null;
  return Math.round((participated / registered) * 1000) / 10;
}

export function partyShare(partyCount: number, total: number): number | null {
  if (!total || total <= 0) return null;
  return Math.round((partyCount / total) * 1000) / 10;
}
