import assert from "node:assert/strict";

import { CHAPTERS } from "../src/content/macroscopic-life/catalog";
import { loadChapterMarkdown, loadFrontMatter, loadOpening } from "../src/lib/macroscopic-life/load-manuscript";

assert.ok(loadOpening().includes("There is a world inside you."));
assert.ok(loadFrontMatter().includes("THE MICROBE IS A PERSPECTIVE"));

for (const chapter of CHAPTERS) {
  const markdown = loadChapterMarkdown(chapter);
  assert.ok(markdown.length > 400, `chapter ${chapter.number} too short`);
  assert.doesNotMatch(markdown, /^# PUB-/m, `chapter ${chapter.number} leaked editorial log`);
}

console.log(`macroscopic-life manuscripts: ${CHAPTERS.length} chapters ok`);
