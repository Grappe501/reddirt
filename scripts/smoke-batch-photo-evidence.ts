/**
 * Smoke: batch photo evidence field apply.
 * Avoids importing server-only modules — exercises batch-photo-evidence via tsx + shim.
 *
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node --require ./scripts/tsx-server-only-shim.cjs --import ./scripts/tsx-server-only-register.mjs ./node_modules/tsx/dist/cli.mjs scripts/smoke-batch-photo-evidence.ts
 */
import Module from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Belt-and-suspenders: patch CJS load before any src import resolves server-only.
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
  const { applyPhotoEvidenceBatch, buildBatchPatchFromLoose } = await import(
    "../src/lib/campaign-media/batch-photo-evidence"
  );
  const { loadPhotoEvidenceStore, savePhotoEvidenceStore } = await import(
    "../src/lib/campaign-media/evidence-store"
  );
  const { listCampaignPhotosLive } = await import("../src/lib/campaign-media/list-campaign-photos-live");

  const live = listCampaignPhotosLive();
  const ids = live.slice(0, 2).map((p) => p.id);
  if (ids.length < 2) {
    console.error("FAIL: need at least 2 live photos");
    process.exit(1);
  }

  const marker = `batch-smoke-${Date.now()}`;
  const before = loadPhotoEvidenceStore();
  const prevA = before.photos[ids[0]!];
  const prevB = before.photos[ids[1]!];

  const result = applyPhotoEvidenceBatch({
    photoIds: ids,
    applyFields: ["eventName", "whatThisProves"],
    patch: buildBatchPatchFromLoose({
      eventName: marker,
      whatThisProves: "Smoke batch: listened / visited (synthetic).",
    }),
    consentConfirmed: false,
    refreshAlbums: false,
    rememberMemory: false,
  });

  if (!result.ok || result.applied !== 2) {
    console.error("FAIL: batch apply", result);
    process.exit(1);
  }

  const after = loadPhotoEvidenceStore();
  if (after.photos[ids[0]!]?.eventName !== marker || after.photos[ids[1]!]?.eventName !== marker) {
    console.error("FAIL: overlays not updated");
    process.exit(1);
  }

  const restore = loadPhotoEvidenceStore();
  if (prevA) restore.photos[ids[0]!] = prevA;
  else delete restore.photos[ids[0]!];
  if (prevB) restore.photos[ids[1]!] = prevB;
  else delete restore.photos[ids[1]!];
  savePhotoEvidenceStore(restore);

  void path;
  void pathToFileURL;

  console.log(JSON.stringify({ ok: true, ids, applied: result.applied, marker, restored: true }, null, 2));
  console.log("OK smoke-batch-photo-evidence");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
