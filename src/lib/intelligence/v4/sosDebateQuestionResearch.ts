import fs from "node:fs";
import path from "node:path";
import "server-only";

import type { SosDebateQuestionResearchFile } from "@/lib/intelligence/v4/sosDebateQuestionBank";

export function loadSosDebateQuestionResearch(): SosDebateQuestionResearchFile | null {
  try {
    const abs = path.join(process.cwd(), "data/intelligence/sos-debate-question-research.json");
    return JSON.parse(fs.readFileSync(abs, "utf8")) as SosDebateQuestionResearchFile;
  } catch {
    return null;
  }
}
