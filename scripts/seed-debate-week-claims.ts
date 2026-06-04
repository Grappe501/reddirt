/**
 * P2 — Seed debate-week claims into the governed claim ledger.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedDebateWeekClaims } from "../src/lib/intelligence/claims/debateClaimsSeed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const result = seedDebateWeekClaims(path.join(__dirname, ".."));
  console.log("Debate week claims seed (P2)");
  console.log("  added:", result.added);
  console.log("  updated:", result.updated);
  console.log("  debate-domain total:", result.totalDebate);
}

main();
