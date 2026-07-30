/**
 * Smoke: Pass 10 undo last batch publish.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-batch-publish-undo.ts
 */
import Module from "node:module";

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
  const { CAMPAIGN_PHOTO_REGISTRY } = await import("../src/content/media/campaign-photo-registry");
  const { loadPhotoEvidenceStore, savePhotoEvidenceStore } = await import(
    "../src/lib/campaign-media/evidence-store"
  );
  const {
    applyPhotoPublishBatch,
    undoLastBatchPublish,
    getUndoableBatchPublishRuns,
  } = await import("../src/lib/campaign-media/batch-photo-publish");
  const { listEvidenceBatchOperations } = await import("../src/lib/campaign-media/evidence-batch-ops");

  const photo = CAMPAIGN_PHOTO_REGISTRY.find((p) => {
    const county = (p.campaign.county ?? "").trim();
    return county && county !== "Unknown";
  });
  if (!photo) {
    console.error("FAIL: no confirmed-county photo");
    process.exit(1);
  }

  const store0 = loadPhotoEvidenceStore();
  const prev = store0.photos[photo.id] ? { ...store0.photos[photo.id] } : null;

  const held = applyPhotoPublishBatch({
    photoIds: [photo.id],
    action: "hold",
    refreshAlbums: false,
  });
  if (!held.ok || !held.runId) {
    console.error("FAIL: hold", held);
    process.exit(1);
  }

  const undoable = getUndoableBatchPublishRuns();
  if (!undoable.some((r) => r.id === held.runId)) {
    console.error("FAIL: run not undoable", held.runId, undoable.map((r) => r.id));
    process.exit(1);
  }

  const undone = undoLastBatchPublish({ refreshAlbums: false });
  if (!undone.ok || undone.runId !== held.runId) {
    console.error("FAIL: undo", undone);
    process.exit(1);
  }

  const after = loadPhotoEvidenceStore().photos[photo.id];
  if (prev == null) {
    if (after) {
      console.error("FAIL: expected overlay removed", after);
      process.exit(1);
    }
  } else if (after?.approvedForPublic !== prev.approvedForPublic) {
    console.error("FAIL: overlay not restored", { prev, after });
    process.exit(1);
  }

  const ops = listEvidenceBatchOperations(10);
  if (!ops.some((o) => o.id === held.runId && o.undoneAt)) {
    console.error("FAIL: history missing undone flag", ops.find((o) => o.id === held.runId));
    process.exit(1);
  }

  const restore = loadPhotoEvidenceStore();
  if (prev) restore.photos[photo.id] = prev;
  else delete restore.photos[photo.id];
  savePhotoEvidenceStore(restore);

  console.log(JSON.stringify({ ok: true, runId: held.runId, restored: undone.restored }, null, 2));
  console.log("OK smoke-batch-publish-undo");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
