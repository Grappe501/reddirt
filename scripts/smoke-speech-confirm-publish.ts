/**
 * Smoke: Speech confirm/publish parity (audit #4).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-speech-confirm-publish.ts
 */
import Module from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";

const originalLoad = (Module as unknown as { _load: (...args: unknown[]) => unknown })._load;
(Module as unknown as { _load: (...args: unknown[]) => unknown })._load = function (...args: unknown[]) {
  const request = String(args[0] ?? "");
  const normalized = request.replace(/\\/g, "/");
  if (
    request === "server-only" ||
    normalized.includes("/server-only/") ||
    normalized.endsWith("/server-only")
  ) {
    return {};
  }
  return originalLoad.apply(this, args);
};

async function main() {
  const { CAMPAIGN_MEDIA_REGISTRY } = await import("../src/content/media/campaign-media-registry");
  const { applySpeechEvidenceOverlay } = await import(
    "../src/lib/campaign-media/apply-evidence-overlay"
  );
  const { isPublicMedia } = await import("../src/lib/media/campaign-transcript");
  const { loadSpeechEvidenceStore, saveSpeechEvidenceStore } = await import(
    "../src/lib/campaign-media/evidence-store"
  );
  const { applySpeechEvidenceBatch } = await import(
    "../src/lib/campaign-media/batch-speech-evidence"
  );
  const {
    applySpeechPublishBatch,
    undoLastBatchSpeechPublish,
  } = await import("../src/lib/campaign-media/batch-speech-publish");
  const { buildSpeechConfirmQueue } = await import(
    "../src/lib/campaign-media/speech-confirm-queue"
  );
  const { buildSpeechReadinessMatrix } = await import(
    "../src/lib/campaign-media/speech-readiness"
  );
  const {
    proposeSpeechPlacement,
    applySpeechPlacementProposal,
    undoSpeechPlacement,
    getCurrentSpeechPlacementSnapshot,
    HOMEPAGE_VIDEO_CURATION_FILE_REL,
  } = await import("../src/lib/campaign-media/speech-placement");

  const speech =
    CAMPAIGN_MEDIA_REGISTRY.find((m) => m.publicationStatus !== "PUBLISHED") ??
    CAMPAIGN_MEDIA_REGISTRY[0];
  if (!speech) {
    console.error("FAIL: no media registry speech");
    process.exit(1);
  }

  const store0 = loadSpeechEvidenceStore();
  const prev = store0.speeches[speech.id] ? { ...store0.speeches[speech.id] } : null;

  // Overlay apply parity: hold blocks public even if PUBLISHED on base
  const held = applySpeechEvidenceOverlay(speech, {
    approvedForPublic: false,
    publicationStatus: "PUBLISHED",
    counties: ["Pulaski"],
    homepageCandidate: true,
  });
  if (held.homepageEligible !== true) {
    console.error("FAIL: homepageCandidate not applied", held.homepageEligible);
    process.exit(1);
  }
  if (isPublicMedia(held) !== false) {
    console.error("FAIL: approvedForPublic:false should hold off isPublicMedia", held);
    process.exit(1);
  }

  const batch = applySpeechEvidenceBatch({
    speechIds: [speech.id],
    applyFields: ["counties", "whatThisProves", "doNotClaim"],
    patch: {
      counties: ["Pulaski"],
      whatThisProves: "Spoke with county clerks about election access.",
      doNotClaim: ["Do not invent turnout numbers."],
    },
  });
  if (!batch.ok || batch.applied !== 1) {
    console.error("FAIL: batch save", batch);
    process.exit(1);
  }

  const refused = applySpeechPublishBatch({
    speechIds: [speech.id],
    action: "publish",
    allowEmptyCounty: false,
  });
  // should succeed because we saved Pulaski
  if (!refused.ok || !refused.runId) {
    console.error("FAIL: publish with county", refused);
    process.exit(1);
  }

  const afterPublish = loadSpeechEvidenceStore().speeches[speech.id];
  if (afterPublish?.publicationStatus !== "PUBLISHED" || afterPublish.approvedForPublic !== true) {
    console.error("FAIL: publish flags", afterPublish);
    process.exit(1);
  }

  const emptySkip = applySpeechPublishBatch({
    speechIds: ["__missing_speech__"],
    action: "publish",
  });
  if (emptySkip.ok) {
    console.error("FAIL: expected missing speech to fail", emptySkip);
    process.exit(1);
  }

  const undone = undoLastBatchSpeechPublish();
  if (!undone.ok || undone.runId !== refused.runId) {
    console.error("FAIL: undo publish", undone);
    process.exit(1);
  }

  const queue = buildSpeechConfirmQueue();
  if (!queue.totals || typeof queue.totals.noCounty !== "number") {
    console.error("FAIL: confirm queue", queue);
    process.exit(1);
  }
  const matrix = buildSpeechReadinessMatrix({ speechIds: [speech.id] });
  if (!matrix.rows.some((r) => r.id === speech.id)) {
    console.error("FAIL: readiness missing speech", matrix.rows);
    process.exit(1);
  }

  // Placement propose → apply → undo
  const beforeVideo = readFileSync(
    path.join(process.cwd(), HOMEPAGE_VIDEO_CURATION_FILE_REL),
    "utf8",
  );
  const beforeSnap = getCurrentSpeechPlacementSnapshot();
  const proposal = proposeSpeechPlacement({ persist: true });
  const applied = applySpeechPlacementProposal({
    proposalId: proposal.id,
    confirmCurate: true,
  });
  if (!applied.ok || !applied.undoSnapshotId) {
    console.error("FAIL: speech placement apply", applied);
    process.exit(1);
  }
  const midVideo = readFileSync(path.join(process.cwd(), HOMEPAGE_VIDEO_CURATION_FILE_REL), "utf8");
  // May or may not change depending on candidates — undo must restore either way
  const placeUndone = undoSpeechPlacement({
    undoSnapshotId: applied.undoSnapshotId,
    confirmCurate: true,
  });
  if (!placeUndone.ok) {
    console.error("FAIL: placement undo", placeUndone);
    process.exit(1);
  }
  const afterVideo = readFileSync(
    path.join(process.cwd(), HOMEPAGE_VIDEO_CURATION_FILE_REL),
    "utf8",
  );
  if (afterVideo !== beforeVideo) {
    console.error("FAIL: placement undo did not restore file");
    process.exit(1);
  }
  void midVideo;
  void beforeSnap;

  // Restore speech overlay to prior
  const restore = loadSpeechEvidenceStore();
  if (prev) restore.speeches[speech.id] = prev;
  else delete restore.speeches[speech.id];
  saveSpeechEvidenceStore(restore);

  const refuseCurate = applySpeechPlacementProposal({
    proposalId: proposal.id,
    confirmCurate: false,
  });
  if (refuseCurate.ok || !String(refuseCurate.message).includes("confirmCurate")) {
    console.error("FAIL: confirmCurate gate", refuseCurate);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        speechId: speech.id,
        publishRunId: refused.runId,
        placementProposalId: proposal.id,
        holdBlocksPublic: true,
        queueNoCounty: queue.totals.noCounty,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-speech-confirm-publish");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
