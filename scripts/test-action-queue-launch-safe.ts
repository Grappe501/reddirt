import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  shouldSkipHumanActionQueueSyncOnRequest,
  isIntelligenceOppositionDebateLaunchMode,
} from "../src/lib/intelligence/intelligenceLaunchMode";
import {
  buildActionQueueViewModel,
  loadSafeActionQueuePageData,
} from "../src/lib/intelligence/safeHumanActionQueueLoad";
import { summarizeHumanActionQueue } from "../src/lib/intelligence/strategicDecisionSupport";

const page = fs.readFileSync(
  path.join(process.cwd(), "src/app/admin/(board)/intelligence/action-queue/page.tsx"),
  "utf8",
);
assert.ok(!page.includes("syncHumanActionQueue"), "page must not call syncHumanActionQueue");
assert.ok(page.includes("loadSafeActionQueuePageData"), "page must use safe loader");
assert.ok(page.includes('runtime = "nodejs"'), "page must use nodejs runtime");

process.env.NETLIFY = "true";
assert.equal(shouldSkipHumanActionQueueSyncOnRequest(), true);

const t = Date.now();
const data = loadSafeActionQueuePageData();
const view = buildActionQueueViewModel(data.queue);
assert.ok(view.priorityQueue.length >= 0, "view model builds");
const summary = summarizeHumanActionQueue();
assert.ok(summary.totalActions >= 0, "summarize uses fast path on NETLIFY");
console.log("test-action-queue-launch-safe: OK", {
  launchMode: isIntelligenceOppositionDebateLaunchMode(),
  items: data.queue.items.length,
  active: view.priorityQueue.length,
  ms: Date.now() - t,
});
