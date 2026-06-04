import "server-only";

import fs from "node:fs";
import path from "node:path";

export type { KellyRoadStoriesFile, KellyRoadStory } from "@/lib/intelligence/kellyRoadStoriesTypes";
import type { KellyRoadStoriesFile } from "@/lib/intelligence/kellyRoadStoriesTypes";

const REL = "data/opposition/kelly-road-stories.json";

export function loadKellyRoadStories(repoRoot: string = process.cwd()): KellyRoadStoriesFile {
  const abs = path.join(repoRoot, REL);
  if (!fs.existsSync(abs)) {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      instructions: "",
      storySlots: [],
      candidateAddPrompt: "",
    };
  }
  return JSON.parse(fs.readFileSync(abs, "utf8")) as KellyRoadStoriesFile;
}
