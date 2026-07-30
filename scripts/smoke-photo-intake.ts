/**
 * Smoke: unified photo intake (flatten + queue one nested file).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-photo-intake.ts
 */
import Module from "node:module";
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
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
  const {
    intakeOneCampaignPhoto,
    getPhotoIntakeStatus,
    listDiskPhotoIngestCandidates,
  } = await import("../src/lib/campaign-media/photo-ingest");
  const { loadPhotoIngestDrafts, savePhotoIngestDrafts } = await import(
    "../src/lib/campaign-media/evidence-store"
  );

  const root = path.join(process.cwd(), "public", "media", "campaign-photos");
  const nestDir = path.join(root, "_intake-smoke-nest");
  mkdirSync(nestDir, { recursive: true });

  const flatImages = readdirSync(root).filter((n) => {
    try {
      return /\.(jpe?g|png|webp)$/i.test(n) && !n.startsWith("smoke-intake-");
    } catch {
      return false;
    }
  });
  if (!flatImages.length) {
    console.error("FAIL: need at least one flat image in campaign-photos for smoke");
    process.exit(1);
  }

  const nestName = `smoke-intake-${Date.now()}.jpg`;
  const nestRel = `_intake-smoke-nest/${nestName}`;
  copyFileSync(path.join(root, flatImages[0]), path.join(nestDir, nestName));

  const draftsBefore = loadPhotoIngestDrafts();
  const beforeJson = JSON.stringify(draftsBefore);

  const candidates = listDiskPhotoIngestCandidates();
  const hit = candidates.find((c) => c.relativePath === nestRel);
  if (!hit || !hit.nested) {
    console.error("FAIL: nested smoke file not scanned", { nestRel, hit });
    process.exit(1);
  }

  const result = intakeOneCampaignPhoto(nestRel);
  if (!result.ok) {
    console.error("FAIL: intakeOne", result);
    process.exit(1);
  }
  if (!result.flattened) {
    console.error("FAIL: expected nested flatten copy", result);
    process.exit(1);
  }

  const status = getPhotoIntakeStatus();
  const flatAbs = path.join(root, path.basename(result.photo.src));

  // Restore drafts snapshot; remove only the smoke flat copy + nest folder.
  savePhotoIngestDrafts(JSON.parse(beforeJson));
  if (existsSync(flatAbs) && path.basename(flatAbs).startsWith("smoke-intake-")) {
    rmSync(flatAbs, { force: true });
  }
  rmSync(nestDir, { recursive: true, force: true });

  console.log(
    JSON.stringify(
      {
        ok: true,
        photoId: result.photo.id,
        flattened: result.flattened,
        nextStep: status.nextStep,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-photo-intake");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
