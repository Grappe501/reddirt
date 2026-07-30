/**
 * Smoke: Curated Placement Propose — diff + gated apply + undo.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-curated-placement.ts
 */
import Module from "node:module";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
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
  const { proposeCuratedPlacement, getCurrentCuratedPlacementSnapshot } = await import(
    "../src/lib/campaign-media/curated-placement-propose"
  );
  const {
    applyCuratedPlacementProposal,
    undoCuratedPlacement,
    writeCuratedPlacementStub,
  } = await import("../src/lib/campaign-media/curated-placement-apply");
  const { CURATED_PLACEMENT_STUB_REL, HOMEPAGE_CURATION_FILE_REL } = await import(
    "../src/lib/campaign-media/curated-placement-types"
  );

  const beforeSnap = getCurrentCuratedPlacementSnapshot();
  const fileAbs = path.join(process.cwd(), HOMEPAGE_CURATION_FILE_REL);
  if (!existsSync(fileAbs)) {
    console.error("FAIL: homepage curation file missing");
    process.exit(1);
  }
  const beforeSource = readFileSync(fileAbs, "utf8");

  const refuse = applyCuratedPlacementProposal({
    proposalId: "does-not-exist",
    confirmCurate: false,
  });
  if (refuse.ok || !String(refuse.message).includes("confirmCurate")) {
    console.error("FAIL: expected confirmCurate gate", refuse);
    process.exit(1);
  }

  const proposal = proposeCuratedPlacement({
    allowHero: false,
    persist: true,
    galleryMax: 8,
    acrossMax: 5,
  });
  if (!proposal.id.startsWith("cplace-")) {
    console.error("FAIL: bad proposal id", proposal.id);
    process.exit(1);
  }
  if (proposal.heroId !== null) {
    console.error("FAIL: hero must stay null without allowHero", proposal.heroId);
    process.exit(1);
  }
  if (!proposal.diffs.length) {
    console.error("FAIL: empty diffs", proposal);
    process.exit(1);
  }
  const gallery = proposal.diffs.find((d) => d.surface === "homepageGallery");
  if (!gallery || gallery.proposed.length < 1) {
    console.error("FAIL: empty gallery proposed", gallery);
    process.exit(1);
  }

  const stub = writeCuratedPlacementStub(proposal);
  if (!stub.ok || !existsSync(path.join(process.cwd(), CURATED_PLACEMENT_STUB_REL))) {
    console.error("FAIL: stub write", stub);
    process.exit(1);
  }

  const applied = applyCuratedPlacementProposal({
    proposalId: proposal.id,
    confirmCurate: true,
  });
  if (!applied.ok || !applied.undoSnapshotId) {
    console.error("FAIL: apply", applied);
    process.exit(1);
  }

  const midSource = readFileSync(fileAbs, "utf8");
  if (midSource === beforeSource) {
    console.error("FAIL: apply did not rewrite homepage file");
    process.exit(1);
  }
  if (!midSource.includes("HOMEPAGE_HERO_PHOTO_ID") || !midSource.includes("= null")) {
    // hero may still be null — ensure constant exists
    if (!midSource.includes("HOMEPAGE_HERO_PHOTO_ID")) {
      console.error("FAIL: hero constant missing after apply");
      process.exit(1);
    }
  }
  if (!midSource.includes("const HOMEPAGE_GALLERY_MAX")) {
    console.error("FAIL: apply wiped HOMEPAGE_GALLERY_MAX tail");
    process.exit(1);
  }

  const undone = undoCuratedPlacement({
    undoSnapshotId: applied.undoSnapshotId,
    confirmCurate: true,
  });
  if (!undone.ok) {
    console.error("FAIL: undo", undone);
    process.exit(1);
  }
  const afterSource = readFileSync(fileAbs, "utf8");
  if (afterSource !== beforeSource) {
    console.error("FAIL: undo did not restore exact prior source");
    process.exit(1);
  }

  const afterSnap = getCurrentCuratedPlacementSnapshot();
  if (JSON.stringify(afterSnap) !== JSON.stringify(beforeSnap)) {
    console.error("FAIL: snapshot drift after undo", { beforeSnap, afterSnap });
    process.exit(1);
  }

  // Cleanup smoke stub noise is fine to leave; remove only if we created a throwaway path
  try {
    // keep stub for operator inspection — optional delete of nothing
    void unlinkSync;
  } catch {
    /* ignore */
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        proposalId: proposal.id,
        undoSnapshotId: applied.undoSnapshotId,
        galleryProposed: gallery.proposed.length,
        heroNullWithoutAllowHero: true,
        applyThenUndoRestored: true,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-curated-placement");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
