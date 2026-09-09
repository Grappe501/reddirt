import fs from "node:fs";
import path from "node:path";
import { loadTrumpEvidence, trumpEvidenceKey } from "../src/lib/trump-evidence";

const records = loadTrumpEvidence();
const seen = new Set<string>();
let errors = 0;

for (const record of records) {
  const key = trumpEvidenceKey(record);
  if (seen.has(key)) {
    console.error(`Duplicate Trump evidence record: ${key}`);
    errors++;
  }
  seen.add(key);

  if (!record.summary?.trim()) {
    console.error(`Missing summary: ${key}`);
    errors++;
  }

  if (!record.sources?.length) {
    console.error(`Missing sources: ${key}`);
    errors++;
  }

  if (record.evidenceStatus === "verified") {
    const hasHouse = record.sources.some((source) => source.sourceType === "house");
    const hasPositionEvidence = record.sources.some((source) => ["official-trump", "archive", "news"].includes(source.sourceType));
    if (!hasHouse) {
      console.error(`Verified record lacks House vote source: ${key}`);
      errors++;
    }
    if (!hasPositionEvidence) {
      console.error(`Verified record lacks Trump-position evidence: ${key}`);
      errors++;
    }
  }

  for (const source of record.sources ?? []) {
    try {
      new URL(source.url);
    } catch {
      console.error(`Invalid source URL in ${key}: ${source.url}`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`Trump evidence validation failed with ${errors} error(s).`);
  process.exit(1);
}

const evidencePath = path.join(process.cwd(), "data", "trump-evidence.json");
if (!fs.existsSync(evidencePath)) {
  console.error("Trump evidence file missing.");
  process.exit(1);
}

console.log(`Trump evidence validation passed: ${records.length} record(s).`);
