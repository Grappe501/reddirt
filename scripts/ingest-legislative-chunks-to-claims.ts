#!/usr/bin/env tsx
import { ingestTranscriptChunksIntoClaimLedger, loadTranscriptChunks } from "../src/lib/legislature/legislativeClaimIngest";
import { ingestLegislativeChunksIntoOppositionArchive } from "../src/lib/legislature/legislativeOppositionIngest";

function main() {
  const chunks = loadTranscriptChunks();
  const claims = ingestTranscriptChunksIntoClaimLedger(chunks);
  const opp = ingestLegislativeChunksIntoOppositionArchive(chunks);
  console.log(JSON.stringify({ claims, opposition: opp }, null, 2));
}

main();
