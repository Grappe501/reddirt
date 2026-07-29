/**
 * Smoke: promote derivative → publicSrcOverride (restores afterward).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-promote-photo-derivative.ts
 */
import Module from "node:module";
import { existsSync } from "node:fs";
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
  const { listCampaignPhotosLive } = await import("../src/lib/campaign-media/list-campaign-photos-live");
  const { createPhotoDerivative, listPhotoDerivatives } = await import(
    "../src/lib/campaign-media/media-derivatives"
  );
  const { applyPhotoEvidenceOverlay } = await import("../src/lib/campaign-media/apply-evidence-overlay");
  const {
    promotePhotoDerivative,
    clearPhotoPublicSrcOverride,
    previewPromotePlacement,
  } = await import("../src/lib/campaign-media/promote-photo-derivative");
  const { loadPhotoEvidenceStore } = await import("../src/lib/campaign-media/evidence-store");

  const live = listCampaignPhotosLive().filter((p) => {
    const abs = path.join(process.cwd(), "public", p.src.replace(/^\//, ""));
    return existsSync(abs) && !p.src.includes("campaign-derivatives");
  });
  const photo = live[0];
  if (!photo) {
    console.error("FAIL: no on-disk photo");
    process.exit(1);
  }

  let deriv = listPhotoDerivatives(photo.id).find((d) => d.kind === "web_max");
  if (!deriv) {
    const created = await createPhotoDerivative({ photoId: photo.id, kind: "web_max", maxEdge: 800 });
    if (!created.ok) {
      console.error("FAIL: create derivative", created.error);
      process.exit(1);
    }
    deriv = created.record;
  }

  const preview = previewPromotePlacement({
    photoId: photo.id,
    publicSrcOverride: deriv.publicSrc,
    homepageCandidate: true,
    heroLevel: "FEATURE",
  });
  if (!preview.ok) {
    console.error("FAIL: preview", preview.error);
    process.exit(1);
  }

  const before = loadPhotoEvidenceStore().photos[photo.id];
  const promoted = promotePhotoDerivative({
    photoId: photo.id,
    derivativeId: deriv.id,
    setAsPublicSrc: true,
    homepageCandidate: true,
    heroLevel: "FEATURE",
    consentConfirmed: true,
  });
  if (!promoted.ok || promoted.publicSrc !== deriv.publicSrc) {
    console.error("FAIL: promote", promoted);
    process.exit(1);
  }

  const store = loadPhotoEvidenceStore();
  const merged = applyPhotoEvidenceOverlay(photo, store.photos[photo.id]);
  if (merged.src !== deriv.publicSrc) {
    console.error("FAIL: overlay src not applied", merged.src);
    process.exit(1);
  }

  clearPhotoPublicSrcOverride(photo.id);
  // Restore prior overlay fields if we had any (avoid leaving homepage flags from smoke).
  if (before) {
    const { savePhotoEvidenceStore } = await import("../src/lib/campaign-media/evidence-store");
    const restore = loadPhotoEvidenceStore();
    restore.photos[photo.id] = before;
    savePhotoEvidenceStore(restore);
  } else {
    const { savePhotoEvidenceStore } = await import("../src/lib/campaign-media/evidence-store");
    const restore = loadPhotoEvidenceStore();
    delete restore.photos[photo.id];
    savePhotoEvidenceStore(restore);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        photoId: photo.id,
        derivative: deriv.publicSrc,
        placementPreview: promoted.placementPreview,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-promote-photo-derivative");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
