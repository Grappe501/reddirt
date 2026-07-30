/**
 * Smoke: Evidence Ship Checklist report + graduation stub.
 * From RedDirt:
 *   node scripts/run-with-h-drive-env.cjs node ./node_modules/tsx/dist/cli.mjs scripts/smoke-evidence-ship-checklist.ts
 */
import Module from "node:module";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
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
    buildEvidenceShipReport,
    writeRegistryGraduationStub,
    EVIDENCE_SHIP_REPORTS_REL,
    REGISTRY_GRADUATION_STUB_REL,
  } = await import("../src/lib/campaign-media/evidence-ship-report");

  const markerRel = "data/campaign-media/_smoke-ship-marker.json";
  const markerAbs = path.join(process.cwd(), markerRel);
  mkdirSync(path.dirname(markerAbs), { recursive: true });
  writeFileSync(
    markerAbs,
    `${JSON.stringify({ purpose: "smoke-evidence-ship-checklist", at: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );

  const report = buildEvidenceShipReport({ persist: true, includeDerivativeScan: true });
  if (!report.checklist.length) {
    console.error("FAIL: empty checklist", report);
    process.exit(1);
  }
  if (!report.commitMessageTemplate.includes("Ship Evidence overlays")) {
    console.error("FAIL: commit template", report.commitMessageTemplate);
    process.exit(1);
  }
  const hit = report.dirtyPaths.some((d) => d.path.replace(/\\/g, "/").endsWith("_smoke-ship-marker.json"));
  if (!hit) {
    console.error(
      "FAIL: smoke marker not in dirty paths",
      {
        branch: report.branch,
        gitNote: report.gitNote,
        warnings: report.warnings,
        totals: report.totals,
        sample: report.dirtyPaths.slice(0, 20).map((d) => `${d.status} ${d.path}`),
      },
    );
    process.exit(1);
  }
  if (report.totals.overlayJsonDirty < 1) {
    console.error("FAIL: expected overlayJsonDirty >= 1", report.totals);
    process.exit(1);
  }

  const storeAbs = path.join(process.cwd(), EVIDENCE_SHIP_REPORTS_REL);
  if (!existsSync(storeAbs)) {
    console.error("FAIL: ship reports store missing");
    process.exit(1);
  }
  const store = JSON.parse(readFileSync(storeAbs, "utf8")) as { reports?: unknown[] };
  if (!Array.isArray(store.reports) || !store.reports.length) {
    console.error("FAIL: ship reports not persisted", store);
    process.exit(1);
  }

  const stub = writeRegistryGraduationStub({ onlyReady: true });
  if (!stub.ok) {
    console.error("FAIL: stub", stub);
    process.exit(1);
  }
  const stubAbs = path.join(process.cwd(), REGISTRY_GRADUATION_STUB_REL);
  if (!existsSync(stubAbs)) {
    console.error("FAIL: stub file missing");
    process.exit(1);
  }
  const stubText = readFileSync(stubAbs, "utf8");
  if (!stubText.includes("Do not auto-apply") || !stubText.includes("CAMPAIGN_PHOTO_REGISTRY")) {
    console.error("FAIL: stub content", stubText.slice(0, 400));
    process.exit(1);
  }

  try {
    unlinkSync(markerAbs);
  } catch {
    /* ignore */
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        branch: report.branch,
        dirtyCount: report.totals.dirtyCount,
        overlayJsonDirty: report.totals.overlayJsonDirty,
        derivativeLocalOnly: report.totals.derivativeLocalOnly,
        checklistReady: report.checklistReady,
        stubCandidates: stub.candidateCount,
        warnings: report.warnings.length,
      },
      null,
      2,
    ),
  );
  console.log("OK smoke-evidence-ship-checklist");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
