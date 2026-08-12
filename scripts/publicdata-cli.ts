import { loadPublicdataEnv } from "../src/lib/civic-intelligence/env/loadPublicdataEnv";
import {
  diagnose,
  seedCensus,
  seedBls,
  seedBaselineAlignedBds,
  seedBaselineAlignedCpsVoting,
  seedPass6SeriesArrays,
  seedPass7EiaSeries,
  seedPass8FdicHrsa,
  seedPass9Nass,
  seedCountyNassFarmStructure,
  seedPass10FredBea,
  crosscheck,
  validateWarehouse,
  exportCc,
  report,
  runAll,
  ensureDirs,
  repoRoot,
} from "../src/lib/civic-intelligence/services/publicdata";

async function main() {
  loadPublicdataEnv(repoRoot());
  ensureDirs();
  const cmd = process.argv[2] || "diagnose";
  let result: unknown;
  switch (cmd) {
    case "diagnose":
      result = await diagnose();
      break;
    case "census:seed":
      result = await seedCensus();
      break;
    case "bls:seed":
      result = await seedBls();
      break;
    case "aligned:bds":
      result = await seedBaselineAlignedBds();
      break;
    case "aligned:cps-voting":
      result = await seedBaselineAlignedCpsVoting();
      break;
    case "pass6:series":
      result = await seedPass6SeriesArrays();
      break;
    case "pass7:eia":
      result = await seedPass7EiaSeries();
      break;
    case "pass8:fdic-hrsa":
      result = await seedPass8FdicHrsa();
      break;
    case "pass9:nass":
      result = await seedPass9Nass();
      break;
    case "county:nass":
      result = await seedCountyNassFarmStructure();
      break;
    case "pass10:fred":
      result = await seedPass10FredBea();
      break;
    case "aligned:all":
      result = {
        bds: await seedBaselineAlignedBds(),
        cps_voting: await seedBaselineAlignedCpsVoting(),
        validate: validateWarehouse(),
        export: exportCc(),
      };
      break;
    case "crosscheck":
      result = crosscheck();
      break;
    case "validate":
      result = validateWarehouse();
      break;
    case "export:cc":
      result = exportCc();
      break;
    case "report":
      result = report();
      break;
    case "all":
      result = await runAll();
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      process.exit(2);
  }
  console.log(JSON.stringify(result, null, 2));
  if (
    cmd === "validate" &&
    result &&
    typeof result === "object" &&
    "ok" in result &&
    (result as { ok: boolean }).ok === false
  ) {
    process.exit(1);
  }
  if (
    cmd === "census:seed" ||
    cmd === "bls:seed" ||
    cmd === "aligned:bds" ||
    cmd === "aligned:cps-voting" ||
    cmd === "pass6:series" ||
    cmd === "pass7:eia" ||
    cmd === "pass8:fdic-hrsa" ||
    cmd === "pass9:nass" ||
    cmd === "county:nass" ||
    cmd === "pass10:fred" ||
    cmd === "all"
  ) {
    const status = (result as { status?: string }).status;
    if (status === "failed") process.exit(1);
  }
  if (cmd === "aligned:all") {
    const r = result as {
      bds?: { status?: string };
      cps_voting?: { status?: string };
    };
    if (r.bds?.status === "failed" || r.cps_voting?.status === "failed") {
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
