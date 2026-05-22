import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCommunicationsBundle } from "../src/lib/campaign-events/communications/load-communications-bundle";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const b = loadCommunicationsBundle();
  console.log("Communications bundle test");
  console.log("  templates:", b.templates.length);
  console.log("  sources:", b.sources.length);
  console.log("  risks:", b.risks.length);
  console.log("  mass:", b.massEmailStatus);

  const ok = b.templates.length >= 6 && b.massEmailStatus === "blocked" && b.unifiedSourceCount >= 6;
  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — communications bundle loads");
}

main();
