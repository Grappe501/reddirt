import { loadPublicdataEnv } from "../src/lib/civic-intelligence/env/loadPublicdataEnv";
import {
  diagnose,
  seedCensus,
  seedBls,
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
  if (cmd === "census:seed" || cmd === "bls:seed" || cmd === "all") {
    const status =
      cmd === "all"
        ? null
        : (result as { status?: string }).status;
    if (status === "failed") process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
