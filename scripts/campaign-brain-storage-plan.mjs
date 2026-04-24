/**
 * BRAIN-STORAGE-1: Print the governed multi-step plan for storing campaign ingest tree as brain material.
 * Does not read secrets or touch the database.
 *
 * Usage (from RedDirt/): npm run brain:storage:plan
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INGEST_ROOT =
  process.env.CAMPAIGN_INGEST_ROOT?.trim() || "H:\\SOSWebsite\\campaign information for ingestion";

function line(s) {
  console.log(s);
}

line("");
line("=== BRAIN-STORAGE-1 — Campaign brain storage plan (operator) ===");
line("");
line(`Ingest root: ${INGEST_ROOT}`);
line(`Runbook: ${path.join(root, "docs", "CAMPAIGN_BRAIN_STORAGE_RUNBOOK.md")}`);
line("");
line("Prerequisites:");
line("  1. DATABASE_URL + local Postgres");
line("  2. OPENAI_API_KEY valid (npm run test:openai-key)");
line("  3. Election JSON gate: npm run ingest:election-audit:json → COMPLETE");
line("");
line("Suggested order (see runbook for flags and finance governance):");
line("  A. npm run ingest:election-audit:json");
line("  B. npm run brain:ingest:tree:briefing   (strategy / briefing-shaped material)");
line("  C. npm run brain:ingest:tree:comms     (comms-shaped material)");
line("  D. npm run brain:ingest:tree:training  (community-training-shaped material)");
line("  E. npm run ingest:campaign-root-loose (root-level comms only; skip if already imported)");
line("  F. After each batch: note mediaIngestBatchId from CLI JSON → npm run repair:owned-media-embeddings -- --batch-id <id>");
line("  G. npm run ingest (RedDirt repo docs → SearchChunk) if site/guide markdown should stay in RAG");
line("  H. Finance: ComplianceDocument / FinancialTransaction via workbench — not bulk SearchChunk");
line("");
line("Governance: folder ingest uses --brain-governed to skip electionResults, filing-detail folders,");
line("  and obvious donor/transaction/committee filenames from RAG embedding.");
line("");
