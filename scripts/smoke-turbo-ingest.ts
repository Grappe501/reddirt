/**
 * Smoke: Turbo Ingest identify + website-fit (heuristic path, no OpenAI required).
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-turbo-ingest.ts
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
  const { buildWebsiteSurfaceInventory } = await import(
    "../src/lib/campaign-media/website-surface-catalog"
  );
  const { scorePhotoWebsiteFit } = await import("../src/lib/campaign-media/website-fit-scorer");
  const { listCampaignPhotosLive } = await import("../src/lib/campaign-media/list-campaign-photos-live");
  const { runTurboIngest, getTurboIngestDashboard, heuristicIdentifyPhoto } = await import(
    "../src/lib/campaign-media/turbo-ingest"
  );
  const { getTurboProposal } = await import("../src/lib/campaign-media/turbo-ingest-store");

  const live = listCampaignPhotosLive();
  if (!live.length) {
    console.error("FAIL: no live photos");
    process.exit(1);
  }

  const inventory = buildWebsiteSurfaceInventory(live);
  if (!inventory.surfaces.length) {
    console.error("FAIL: no surfaces", inventory);
    process.exit(1);
  }

  const sample =
    live.find((p) => p.campaign.county && p.campaign.county !== "Unknown") ?? live[0];
  const unknownish =
    live.find((p) => !p.campaign.county || p.campaign.county === "Unknown") ??
    CAMPAIGN_PHOTO_REGISTRY[0];

  const fitKnown = scorePhotoWebsiteFit({ photo: sample, inventory });
  if (!fitKnown.rankings.length || !fitKnown.best) {
    console.error("FAIL: fit rankings empty", fitKnown);
    process.exit(1);
  }

  const heur = heuristicIdentifyPhoto(unknownish);
  if (!heur.county) {
    console.error("FAIL: heuristic suggestion missing county", heur);
    process.exit(1);
  }

  const run = await runTurboIngest({
    photoIds: [unknownish.id, sample.id].filter(Boolean).slice(0, 2),
    intakeFirst: false,
    useAi: false,
    maxPhotos: 2,
    maxAi: 0,
  });
  if (!run.ok || run.identified < 1) {
    console.error("FAIL: turbo run", run);
    process.exit(1);
  }

  const proposal = getTurboProposal(unknownish.id);
  if (!proposal || !proposal.fit.rankings.length) {
    console.error("FAIL: proposal missing", proposal);
    process.exit(1);
  }

  const dash = getTurboIngestDashboard();
  if (dash.inventory.livePhotoCount < 1) {
    console.error("FAIL: dashboard inventory", dash);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        identified: run.identified,
        bestKnown: fitKnown.best.surface,
        bestKnownScore: fitKnown.best.score,
        heuristicCounty: heur.county,
        proposalBest: proposal.fit.bestSurface,
        pending: dash.pending,
        homepageLive: inventory.homepageGalleryLive,
        albums: inventory.countyAlbumCount,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-turbo-ingest");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
