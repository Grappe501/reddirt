/**
 * One-command wrapper: run device ingest (mounted phone / camera / USB) using the TS core.
 * From RedDirt root:
 *   node scripts/media-ingest-from-device.mjs -- --from "E:\\Phone\\DCIM" [--public] [--comms]
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = path.join(here, "..");

const r = spawnSync("npx", ["tsx", "scripts/ingest-campaign-device.ts", ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: projectRoot,
  shell: true,
  env: process.env,
});
process.exit(r.status ?? 1);
