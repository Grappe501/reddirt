/**
 * Debate Command Course v9 — catalog, progress, anatomy, extended responses.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  DEBATE_COURSE_MODULES,
} from "../src/lib/election-plan/debate-prep-course-catalog-v9";
import { getDebateCourseProgress } from "../src/lib/election-plan/debate-prep-course-progress";
import { DEBATE_ANATOMY_SEGMENTS } from "../src/lib/election-plan/debate-prep-debate-anatomy-v9";
import {
  EXTENDED_RESPONSE_IDS,
  EXTENDED_RESPONSE_NARRATIVES,
} from "../src/lib/election-plan/debate-prep-extended-responses-v9";
import {
  EP_DEBATE_PREP_ANATOMY_HREF,
  EP_DEBATE_PREP_RESPONSES_HREF,
} from "../src/lib/election-plan/debate-prep-links";

assert.equal(DEBATE_COURSE_MODULES.length, 8);
assert.ok(DEBATE_COURSE_MODULES[7]!.isCommandReplay);
assert.equal(DEBATE_COURSE_MODULES[7]!.hoursTarget, 3);
assert.ok(DEBATE_ANATOMY_SEGMENTS.length >= 7);
assert.ok(EXTENDED_RESPONSE_NARRATIVES.length >= 8);
assert.equal(EXTENDED_RESPONSE_IDS.length, EXTENDED_RESPONSE_NARRATIVES.length);

const progress = getDebateCourseProgress();
assert.equal(progress.modules.length, 8);
assert.ok(progress.recommendedModuleNumber >= 1 && progress.recommendedModuleNumber <= 8);

const V9_VERSION = "debate-prep-system-v9.0-debate-command-course-public";
const v9Source = fs.readFileSync(
  path.join(process.cwd(), "src/lib/election-plan/debate-prep-system-v9.ts"),
  "utf8",
);
assert.ok(v9Source.includes(V9_VERSION));
assert.ok(v9Source.includes("DEBATE_COMMAND_COURSE_TITLE"));
assert.ok(v9Source.includes("buildDebatePrepSystemV9Snapshot"));

const root = path.join(process.cwd(), "src");
assert.ok(fs.existsSync(path.join(root, "components/election-plan/ElectionPlanDebateCourseHubPanel.tsx")));
assert.ok(fs.existsSync(path.join(root, "app/election-plan/(portal)/debate-prep/anatomy/page.tsx")));
assert.ok(fs.existsSync(path.join(root, "app/election-plan/(portal)/debate-prep/responses/page.tsx")));

const subnav = fs.readFileSync(path.join(root, "components/election-plan/ElectionPlanDebatePrepSubnav.tsx"), "utf8");
assert.ok(subnav.includes("studentCourseTabs"));
const studentBlock = subnav.slice(subnav.indexOf("studentCourseTabs"), subnav.indexOf("const fullTabs"));
assert.ok(!studentBlock.includes("forum-lab"), "student subnav should hide forum lab");
assert.ok(!studentBlock.includes("Forum lab"), "student subnav should hide forum lab label");

const forumLayout = fs.readFileSync(
  path.join(root, "app/election-plan/(portal)/debate-prep/forum-lab/layout.tsx"),
  "utf8",
);
assert.ok(forumLayout.includes("isForumLabPublicHidden"));
assert.equal(EP_DEBATE_PREP_ANATOMY_HREF, "/election-plan/debate-prep/anatomy");
assert.equal(EP_DEBATE_PREP_RESPONSES_HREF, "/election-plan/debate-prep/responses");

console.log(
  `test-debate-prep-course-v9: OK (${DEBATE_COURSE_MODULES.length} modules, ${EXTENDED_RESPONSE_NARRATIVES.length} responses, ${DEBATE_ANATOMY_SEGMENTS.length} anatomy segments)`,
);
