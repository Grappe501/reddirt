/**
 * AI Debate Prep Tutor — time-boxed modes, political debate coaching framework, operator sequences.
 */
import fs from "node:fs";
import path from "node:path";
import {
  DEBATE_PREP_TUTOR_HUB_HREF,
  getTutorModeConfig,
  listTutorModes,
  POLITICAL_DEBATE_COACH_FRAMEWORK,
  TUTOR_MODE_CONFIGS,
  type DebatePrepTutorMode,
  type TutorModeConfig,
} from "@/lib/intelligence/v4/debatePrepTutorPackageClient";

export {
  DEBATE_PREP_TUTOR_HUB_HREF,
  getTutorModeConfig,
  listTutorModes,
  POLITICAL_DEBATE_COACH_FRAMEWORK,
  TUTOR_MODE_CONFIGS,
  type DebatePrepTutorMode,
  type TutorModeConfig,
};

type TutorSequenceStep = { toolId: string; label: string; why: string };

function loadTutorSequencesFromPackage(): { sequenceId: string; steps: TutorSequenceStep[] }[] {
  try {
    const filePath = path.join(process.cwd(), "data/intelligence/debate-agent-tooling-package.json");
    const pkg = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      sequences?: { sequenceId: string; steps: TutorSequenceStep[] }[];
    };
    return pkg.sequences ?? [];
  } catch {
    return [];
  }
}

export function getTutorSequenceSteps(sequenceId: string | null): TutorSequenceStep[] {
  if (!sequenceId) return [];
  const seq = loadTutorSequencesFromPackage().find((s) => s.sequenceId === sequenceId);
  return seq?.steps ?? [];
}
