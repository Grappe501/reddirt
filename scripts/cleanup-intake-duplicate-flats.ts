/**
 * One-shot cleanup: remove accidental -2/-3 intake duplicate drafts + flat copies
 * created before basename-reuse fix. Does not touch registry or nested originals.
 *
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/cleanup-intake-duplicate-flats.ts
 */
import Module from "node:module";
import { existsSync, rmSync } from "node:fs";
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
  const { CAMPAIGN_PHOTO_REGISTRY } = await import("../src/content/media/campaign-photo-registry");
  const { loadPhotoIngestDrafts, savePhotoIngestDrafts } = await import(
    "../src/lib/campaign-media/evidence-store"
  );

  const registryIds = new Set(CAMPAIGN_PHOTO_REGISTRY.map((p) => p.id));
  const drafts = loadPhotoIngestDrafts();
  const root = path.join(process.cwd(), "public", "media", "campaign-photos");
  const removedIds: string[] = [];
  const removedFiles: string[] = [];

  const keep = drafts.photos.filter((p) => {
    const m = p.id.match(/^(.*)-([2-9]|\d{2,})$/);
    if (!m) return true;
    const base = m[1];
    // Only strip when base id already exists in registry or as another draft without suffix.
    const baseKnown =
      registryIds.has(base) || drafts.photos.some((o) => o.id === base && o.id !== p.id);
    if (!baseKnown) return true;
    removedIds.push(p.id);
    const flat = path.basename(p.src);
    const abs = path.join(root, flat);
    if (existsSync(abs) && flat.includes(p.id)) {
      rmSync(abs, { force: true });
      removedFiles.push(flat);
    }
    return false;
  });

  savePhotoIngestDrafts({ ...drafts, photos: keep });
  console.log(JSON.stringify({ ok: true, removedIds, removedFiles, kept: keep.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
