/**
 * Smoke: Evidence Publish Queue + density snapshot + Unknown skip on approve.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-evidence-publish-queue.ts
 */
import Module from "node:module";
import { existsSync, readFileSync } from "node:fs";
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
  const { buildEvidencePublishQueue, publishQueueTurboTargetIds } = await import(
    "../src/lib/campaign-media/evidence-publish-queue"
  );
  const { refreshEvidenceDensitySnapshot } = await import(
    "../src/lib/campaign-media/evidence-density-snapshot"
  );
  const { applyPhotoPublishBatch } = await import("../src/lib/campaign-media/batch-photo-publish");

  const queue = buildEvidencePublishQueue();
  if (!queue.totals || typeof queue.totals.unknownCounty !== "number") {
    console.error("FAIL: queue totals", queue);
    process.exit(1);
  }
  if (queue.pathSteps.length < 4) {
    console.error("FAIL: path steps", queue.pathSteps);
    process.exit(1);
  }
  if (
    queue.totals.unknownCounty <= 40 &&
    queue.totals.unknownCounty !== queue.buckets.unknownCounty.length
  ) {
    console.error(
      "FAIL: unknown bucket length mismatch",
      queue.totals.unknownCounty,
      queue.buckets.unknownCounty.length,
    );
    process.exit(1);
  }

  const targets = publishQueueTurboTargetIds(5);
  if (targets.some((id) => !id)) {
    console.error("FAIL: empty turbo target id", targets);
    process.exit(1);
  }

  // Unknown county must not Approve.
  const unknownId = queue.buckets.unknownCounty[0]?.id;
  if (unknownId) {
    const attempt = applyPhotoPublishBatch({
      photoIds: [unknownId],
      action: "approve",
      refreshAlbums: false,
    });
    if (attempt.applied > 0 || attempt.skippedUnknownCounty < 1) {
      console.error("FAIL: Unknown county was approved", attempt);
      process.exit(1);
    }
  }

  const snapshot = refreshEvidenceDensitySnapshot({
    updateDensityDoc: true,
    evening: {
      publishedToday: "smoke: 0 (gate check)",
      createdNotPublished: `smoke: ${queue.totals.unknownCounty} unknown`,
      note: "smoke-evidence-publish-queue",
    },
  });
  const snapAbs = path.join(process.cwd(), "data/campaign-media/evidence-density-snapshot.json");
  if (!existsSync(snapAbs)) {
    console.error("FAIL: snapshot file missing");
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(snapAbs, "utf8")) as { queue?: { totals?: { unknownCounty?: number } } };
  if (raw.queue?.totals?.unknownCounty !== queue.totals.unknownCounty) {
    console.error("FAIL: snapshot unknown mismatch", raw.queue?.totals, queue.totals);
    process.exit(1);
  }

  const densityAbs = path.join(process.cwd(), "docs/website/EVIDENCE_DENSITY.md");
  const density = readFileSync(densityAbs, "utf8");
  if (!density.includes(`${queue.totals.unknownCounty} Unknown-county live stills`)) {
    console.error("FAIL: density doc not updated with unknown count");
    process.exit(1);
  }
  if (!snapshot.densityDocUpdated) {
    console.error("FAIL: densityDocUpdated false", snapshot.densityDocNote);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        unknown: queue.totals.unknownCounty,
        needsApproval: queue.totals.needsApproval,
        approved: queue.totals.approvedPublic,
        confirmedCounties: queue.confirmedCounties,
        turboTargetsSample: targets,
        unknownApproveSkipped: Boolean(unknownId),
        densityDocNote: snapshot.densityDocNote,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-evidence-publish-queue");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
