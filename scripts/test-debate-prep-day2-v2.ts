/**
 * Day 2 debate-prep v3.1 — ACCA transcript briefs + film clip panel exit criteria.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  DAY2_FILM_ROOM_CLIP_IDS,
  listAccaForumStudyClips,
} from "../src/lib/election-plan/acca-forum-study-clips";
import { buildAccaClipBriefs } from "../src/lib/election-plan/load-acca-forum-clip-briefs";
import { DEBATE_PREP_DAY2_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day2-release";

const clips = listAccaForumStudyClips(DAY2_FILM_ROOM_CLIP_IDS);
assert.equal(clips.length, DAY2_FILM_ROOM_CLIP_IDS.length, "Day 2 forum briefs must resolve");
for (const clip of clips) {
  assert.ok(clip.startSeconds >= 0, `${clip.id} startSeconds`);
  assert.ok(clip.durationSeconds >= 30, `${clip.id} duration`);
  assert.ok(clip.watchFor.length > 10, `${clip.id} watchFor`);
}

const briefs = buildAccaClipBriefs(DAY2_FILM_ROOM_CLIP_IDS);
assert.equal(briefs.length, DAY2_FILM_ROOM_CLIP_IDS.length, "Day 2 briefs must build");
for (const brief of briefs) {
  assert.ok(brief.label.length > 3, `${brief.clipId} label`);
  assert.ok(brief.kellyPivotHint.length > 10, `${brief.clipId} pivot hint`);
}

const root = path.join(process.cwd(), "src");
assert.ok(fs.existsSync(path.join(root, "components/election-plan/ElectionPlanDay2FilmClipPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "components/election-plan/AccaForumClipBriefsPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "lib/election-plan/load-acca-forum-clip-briefs.ts")));

const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPage.includes("ElectionPlanDay2FilmClipPanel"), "b2-film should render brief panel");
assert.ok(blockPage.includes("ElectionPlanFilmTellWorksheetPanel"), "b2-film should keep worksheet");

const worksheet = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanFilmTellWorksheetPanel.tsx"), "utf8");
assert.ok(worksheet.includes("transcript briefs"), "worksheet should reference transcript briefs");
assert.ok(!worksheet.toLowerCase().includes("watch"), "worksheet should not assign video watching");

const filmPanel = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanDay2FilmClipPanel.tsx"), "utf8");
assert.ok(filmPanel.includes("AccaForumClipBriefsPanel"), "Day 2 panel uses briefs panel");
assert.ok(!filmPanel.includes("AccaForumClipEmbed"), "Day 2 panel should not embed YouTube");

assert.equal(DEBATE_PREP_DAY2_RELEASE_VERSION, "day-2-read-the-table-v3.1.0");

console.log("debate-prep-day2-v2 tests passed");
