/**
 * Day 2 debate-prep v2.0 — ACCA study clips + film clip panel exit criteria.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  DAY2_FILM_ROOM_CLIP_IDS,
  listAccaForumStudyClips,
  accaForumClipEmbedSrc,
} from "../src/lib/election-plan/acca-forum-study-clips";
import { DEBATE_PREP_DAY2_RELEASE_VERSION } from "../src/lib/election-plan/debate-prep-day2-release";

const clips = listAccaForumStudyClips(DAY2_FILM_ROOM_CLIP_IDS);
assert.equal(clips.length, DAY2_FILM_ROOM_CLIP_IDS.length, "Day 2 film clips must resolve");
for (const clip of clips) {
  assert.ok(clip.startSeconds >= 0, `${clip.id} startSeconds`);
  assert.ok(clip.durationSeconds >= 30, `${clip.id} duration`);
  assert.ok(clip.watchFor.length > 10, `${clip.id} watchFor`);
  assert.ok(accaForumClipEmbedSrc(clip).includes("start="), `${clip.id} embed src`);
}

const root = path.join(process.cwd(), "src");
assert.ok(fs.existsSync(path.join(root, "components/election-plan/ElectionPlanDay2FilmClipPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "components/election-plan/AccaForumClipEmbed.tsx")));
assert.ok(fs.existsSync(path.join(root, "lib/election-plan/acca-forum-study-clips.ts")));

const blockPage = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/days/[dayId]/blocks/[blockId]/page.tsx"),
  "utf8",
);
assert.ok(blockPage.includes("ElectionPlanDay2FilmClipPanel"), "b2-film should render clip panel");
assert.ok(blockPage.includes("ElectionPlanFilmTellWorksheetPanel"), "b2-film should keep worksheet");

const worksheet = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanFilmTellWorksheetPanel.tsx"), "utf8");
assert.ok(!worksheet.includes("AccaForumYoutubeEmbed"), "worksheet should defer to clip panel");

assert.equal(DEBATE_PREP_DAY2_RELEASE_VERSION, "day-2-read-the-table-v2.0.0");

console.log(`test-debate-prep-day2-v2: OK (${clips.length} ACCA study clips · Day 2 v2.0.0)`);
