/**
 * Smoke: batch photo derivatives (sharp) — non-destructive.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs npx --yes tsx scripts/smoke-batch-photo-derivatives.ts
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
  const { batchCreatePhotoDerivatives, listPhotoDerivatives } = await import(
    "../src/lib/campaign-media/media-derivatives"
  );

  const live = listCampaignPhotosLive().filter((p) => {
    const abs = path.join(process.cwd(), "public", p.src.replace(/^\//, ""));
    return existsSync(abs);
  });
  const ids = live.slice(0, 2).map((p) => p.id);
  if (ids.length < 2) {
    console.error("FAIL: need 2 on-disk photos");
    process.exit(1);
  }

  const result = await batchCreatePhotoDerivatives({
    photoIds: ids,
    kinds: ["thumb", "web_max"],
    note: "smoke-batch-derivatives",
  });

  if (!result.ok || result.createdCount < 2) {
    console.error("FAIL:", result);
    process.exit(1);
  }

  for (const id of ids) {
    const listed = listPhotoDerivatives(id);
    if (!listed.some((d) => d.kind === "thumb")) {
      console.error("FAIL: missing thumb for", id);
      process.exit(1);
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        batchRunId: result.batchRunId,
        createdCount: result.createdCount,
        totalOps: result.totalOps,
        ids,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-batch-photo-derivatives");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
