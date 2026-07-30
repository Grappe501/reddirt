/**
 * Smoke: Pass 9 batch publish / hold (restores prior overlays).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-batch-photo-publish.ts
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
  const { applyPhotoPublishBatch, loadBatchPublishRuns } = await import(
    "../src/lib/campaign-media/batch-photo-publish"
  );

  const photo = CAMPAIGN_PHOTO_REGISTRY.find((p) => {
    const county = (p.campaign.county ?? "").trim();
    return county && county !== "Unknown";
  });
  if (!photo) {
    console.error("FAIL: no registry photo with confirmed county");
    process.exit(1);
  }

  const storeBefore = loadPhotoEvidenceStore();
  const prev = storeBefore.photos[photo.id] ? { ...storeBefore.photos[photo.id] } : null;

  const held = applyPhotoPublishBatch({
    photoIds: [photo.id],
    action: "hold",
    refreshAlbums: false,
  });
  if (!held.ok) {
    console.error("FAIL: hold", held.message);
    process.exit(1);
  }
  const afterHold = loadPhotoEvidenceStore().photos[photo.id];
  if (afterHold?.approvedForPublic !== false || afterHold?.homepageCandidate !== false) {
    console.error("FAIL: hold flags", afterHold);
    process.exit(1);
  }

  const approved = applyPhotoPublishBatch({
    photoIds: [photo.id],
    action: "approve",
    refreshAlbums: false,
  });
  if (!approved.ok || !approved.runId) {
    console.error("FAIL: approve", approved);
    process.exit(1);
  }
  const afterApprove = loadPhotoEvidenceStore().photos[photo.id];
  if (afterApprove?.approvedForPublic !== true) {
    console.error("FAIL: approve flag", afterApprove);
    process.exit(1);
  }

  const runs = loadBatchPublishRuns();
  if (!runs.runs.some((r) => r.id === approved.runId)) {
    console.error("FAIL: run not ledgered", approved.runId);
    process.exit(1);
  }

  // Restore
  const restore = loadPhotoEvidenceStore();
  if (prev) restore.photos[photo.id] = prev;
  else delete restore.photos[photo.id];
  savePhotoEvidenceStore(restore);

  console.log(
    JSON.stringify(
      {
        ok: true,
        photoId: photo.id,
        holdApplied: held.applied,
        approveRunId: approved.runId,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-batch-photo-publish");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
