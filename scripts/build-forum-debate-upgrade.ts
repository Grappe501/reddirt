/**
 * Build forum-debate-upgrade-v1.json from forum-transcript-lab analysis artifacts.
 *
 * Usage: node scripts/run-with-h-drive-env.cjs npx tsx scripts/build-forum-debate-upgrade.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadForumTranscriptLab } from "../src/lib/intelligence/v4/forumTranscriptLab";
import type { ForumDebateUpgradeRecord } from "../src/lib/intelligence/v4/forumDebateUpgrade";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "data/intelligence/forum-debate-upgrade-v1.json");

const lab = loadForumTranscriptLab();
const analysis = lab.analysis;
const deep = lab.deepAnalysis;

if (!lab.transcriptText || lab.transcriptText.length < 50) {
  console.error("No forum transcript — run forum:ingest-acca-drop or forum:ingest-youtube-acca first.");
  process.exitCode = 1;
  process.exit(1);
}

const capitalizeMoves = [
  ...(analysis?.capitalizeMoves ?? []),
  ...(deep?.commandDrills?.map((d) => ({
    trigger: d.ifTheySay,
    kellyLine: d.youSay,
    why: d.thenScan,
  })) ?? []),
].slice(0, 24);

const commandDrills = (deep?.commandDrills ?? []).slice(0, 16);

const techniquePatches: ForumDebateUpgradeRecord["techniquePatches"] = [];
if (analysis?.hammerThemes?.length) {
  techniquePatches.push({
    topicId: "hammer-attacks",
    addendum: `Hammer ACCA forum themes: ${analysis.hammerThemes.slice(0, 5).join(" · ")}`,
  });
}
if (analysis?.pakkoThemes?.length) {
  techniquePatches.push({
    topicId: "three-way",
    addendum: `Pakko ACCA forum themes: ${analysis.pakkoThemes.slice(0, 5).join(" · ")}`,
  });
}
if (analysis?.hammerThemes?.length) {
  techniquePatches.push({
    topicId: "three-way-pivot",
    addendum: `Hammer forum tells: ${analysis.hammerThemes.slice(0, 4).join(" · ")}`,
  });
}
if (analysis?.pakkoThemes?.length) {
  techniquePatches.push({
    topicId: "split-the-table",
    addendum: `Pakko forum tells: ${analysis.pakkoThemes.slice(0, 4).join(" · ")}`,
  });
}
if (capitalizeMoves.length) {
  techniquePatches.push({
    topicId: "capitalize-moves",
    addendum: `${capitalizeMoves.length} forum-derived capitalize moves wired into Day 5 command drills.`,
  });
}

const record: ForumDebateUpgradeRecord = {
  version: 1,
  builtAt: new Date().toISOString(),
  sourceUpdatedAt: lab.updatedAt,
  transcriptChars: lab.transcriptText.length,
  executiveBrief: deep?.executiveBrief ?? analysis?.summary ?? "",
  capitalizeMoves,
  commandDrills,
  hammerThemes: analysis?.hammerThemes ?? [],
  pakkoThemes: analysis?.pakkoThemes ?? [],
  predictedQuestions: analysis?.predictedDebateQuestions ?? [],
  watchForTells: analysis?.watchForTells ?? [],
  claimsGateNotes: analysis?.claimsGateNotes ?? [],
  techniquePatches,
};

mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(record, null, 2), "utf8");
console.log(
  JSON.stringify(
    {
      ok: true,
      path: path.relative(root, outPath),
      capitalizeMoves: record.capitalizeMoves.length,
      commandDrills: record.commandDrills.length,
      techniquePatches: record.techniquePatches.length,
    },
    null,
    2,
  ),
);
