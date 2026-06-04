import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  KELLY_ADVERSARIAL_MIRROR_REL,
  KELLY_MIRROR_DEFAULT_TRIGGER_WORD,
  type KellyAdversarialMirrorFile,
} from "@/lib/intelligence/kellyAdversarialMirrorTypes";

export type {
  KellyAdversarialMirrorFile,
  KellyAttackVector,
  KellyCounterResponse,
  KellyMirrorGovernance,
  KellyOpponentSimulation,
  KellyResearchFinding,
} from "@/lib/intelligence/kellyAdversarialMirrorTypes";
export { KELLY_ADVERSARIAL_MIRROR_REL } from "@/lib/intelligence/kellyAdversarialMirrorTypes";

export function loadKellyAdversarialMirror(repoRoot?: string): KellyAdversarialMirrorFile | null {
  const root = repoRoot ?? process.cwd();
  const filePath = path.join(root, KELLY_ADVERSARIAL_MIRROR_REL);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as KellyAdversarialMirrorFile;
  } catch {
    return null;
  }
}

export function getKellyMirrorTriggerWord(repoRoot?: string): string {
  return loadKellyAdversarialMirror(repoRoot)?.hiddenPathway.triggerWord ?? KELLY_MIRROR_DEFAULT_TRIGGER_WORD;
}
