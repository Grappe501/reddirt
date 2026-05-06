#!/usr/bin/env node
/**
 * REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0 — validate queue + status + next recommendation JSON.
 * Run: cd RedDirt && node scripts/validate-selfbuild-queue.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const QUEUE = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_queue.json");
const STATUS = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_queue_status.json");
const NEXT = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_next_recommendation.json");

const REQUIRED_FIRST_FIVE = [
  "REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0",
  "REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0",
  "REDDIRT-SELFBUILD-DEPENDENCY-GRAPH-1.0",
  "REDDIRT-SELFBUILD-QUEUE-GENERATOR-1.0",
  "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0",
];

const ITEM_KEYS = [
  "queueId",
  "sliceId",
  "phase",
  "title",
  "priority",
  "riskLevel",
  "readinessState",
  "v2Layers",
  "blocked",
  "blockedBy",
  "requiredBeforeStart",
  "allowedPaths",
  "forbiddenPaths",
  "proofRequired",
  "checksRequired",
  "mustNotDo",
  "expectedOutputs",
  "finalReturnFormat",
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const errors = [];
  for (const p of [QUEUE, STATUS, NEXT]) {
    if (!fs.existsSync(p)) errors.push(`Missing: ${path.relative(ROOT, p)} (run generate-selfbuild-queue.mjs)`);
  }

  let queue;
  let status;
  let next;
  if (!errors.length) {
    try {
      queue = readJson(QUEUE);
      status = readJson(STATUS);
      next = readJson(NEXT);
    } catch (e) {
      errors.push(e.message || String(e));
    }
  }

  if (!errors.length) {
    if (queue.schemaVersion !== "1.0") errors.push("queue schemaVersion must be 1.0");
    if (!Array.isArray(queue.items)) errors.push("queue.items must be an array");
    if (!queue.queuePolicy || typeof queue.queuePolicy !== "object") errors.push("queue.queuePolicy must be an object");

    const items = queue.items;
    for (let i = 0; i < REQUIRED_FIRST_FIVE.length; i++) {
      if (!items[i] || items[i].sliceId !== REQUIRED_FIRST_FIVE[i]) {
        errors.push(`Queue item index ${i} must be sliceId ${REQUIRED_FIRST_FIVE[i]} (got ${items[i]?.sliceId})`);
      }
    }

    for (const it of items) {
      for (const k of ITEM_KEYS) {
        if (!(k in it)) errors.push(`Queue item ${it.sliceId || it.queueId} missing field: ${k}`);
      }
      if (!Array.isArray(it.mustNotDo) || it.mustNotDo.length === 0) {
        errors.push(`Queue item ${it.sliceId} must have non-empty mustNotDo`);
      }
      if (!Array.isArray(it.checksRequired) || it.checksRequired.length === 0) {
        errors.push(`Queue item ${it.sliceId} must have non-empty checksRequired`);
      }
    }

    for (const it of items) {
      if (it.blocked && (!Array.isArray(it.blockedBy) || it.blockedBy.length === 0)) {
        errors.push(`Blocked queue item ${it.sliceId} must list blockedBy reasons`);
      }
      if (it.sliceId === "REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0" && !it.blocked) {
        errors.push("Live send item must remain blocked until hosted proof");
      }
    }

    const liveIdx = items.findIndex((i) => i.sliceId === "REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0");
    const hostIdx = items.findIndex((i) => i.sliceId === "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0");
    if (liveIdx >= 0 && hostIdx >= 0 && liveIdx <= hostIdx) {
      errors.push("REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0 must appear after REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0 in queue order");
    }
    const live = items.find((i) => i.sliceId === "REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0");
    if (live && !live.blocked) errors.push("REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0 must have blocked: true until hosted proof");
    if (live && !(live.requiredBeforeStart || []).includes("REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0")) {
      errors.push("LIVE-SEND must list REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0 in requiredBeforeStart");
    }

    if (status.nextRecommendedSlice !== "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0") {
      errors.push("queue_status.nextRecommendedSlice must be REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0");
    }
    if (next.nextRecommendedSlice !== "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0") {
      errors.push("next_recommendation.nextRecommendedSlice must be REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0");
    }
    if (next.nextRecommendedSlice === "REDDIRT-EMAIL-LIVE-SEND-PROOF-1.0" && next.safeToStart === true) {
      errors.push("next_recommendation must not mark LIVE-SEND safe before hosted DB proof");
    }

    const hosted = items.find((i) => i.sliceId === "REDDIRT-EMAIL-HOSTED-DB-PROOF-1.0");
    if (hosted && hosted.blocked) errors.push("Hosted DB proof item should not be blocked when queue marks it next");

    const statusKeys = [
      "totalQueueItems",
      "completed",
      "ready",
      "blocked",
      "highRisk",
      "productionProofItems",
      "nextRecommendedSlice",
      "blockedProductionGates",
      "currentLane",
    ];
    for (const k of statusKeys) {
      if (!(k in status)) errors.push(`queue_status missing: ${k}`);
    }

    const nextKeys = [
      "schemaVersion",
      "generatedAt",
      "nextRecommendedSlice",
      "reason",
      "whyNow",
      "safeToStart",
      "blockedBy",
      "requiredChecksBeforeStart",
      "requiredHumanApprovals",
      "mustNotDo",
      "expectedOutputs",
    ];
    for (const k of nextKeys) {
      if (!(k in next)) errors.push(`next_recommendation missing: ${k}`);
    }
  }

  const ok = errors.length === 0;
  console.log("");
  console.log("=== validate-selfbuild-queue ===");
  if (ok) {
    console.log("STATUS: PASS");
    console.log("");
    console.log("  Queue, status, and next-recommendation JSON validated.");
    console.log("");
  } else {
    console.log("STATUS: FAIL");
    console.log("");
    errors.forEach((e) => console.log(`  - ${e}`));
    console.log("");
  }
  process.exit(ok ? 0 : 1);
}

main();
