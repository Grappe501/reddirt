/**
 * Phase 11 P4 — Seed philosophy graph claims into governed ledger.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedPhilosophyGraphClaims } from "../src/lib/intelligence/claims/philosophyGraphClaimsSeed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const result = seedPhilosophyGraphClaims(path.join(__dirname, ".."));
  console.log("Philosophy graph claims seed (P4)");
  console.log("  added:", result.added);
  console.log("  updated:", result.updated);
  console.log("  philosophy-domain total:", result.totalPhilosophy);
}

main();
