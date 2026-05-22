import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getApril26DataDir } from "./paths";
import type {
  April26AiChunk,
  April26PayoutBatch,
  April26ReconciliationCandidate,
  April26SourceDocumentRecord,
  IngestApril26Report,
} from "./types";

export type { IngestApril26Report };

const SUMMARY_FILE = "ingest-summary.json";
const REGISTRY_FILE = "source-documents.json";
const CHUNKS_FILE = "ai-chunks.json";
const PAYOUTS_FILE = "payout-batches.json";
const RECON_FILE = "reconciliation-candidates.json";

function dataPath(fileName: string): string {
  return path.join(getApril26DataDir(), fileName);
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function saveApril26IngestSummaryOnly(summary: IngestApril26Report): Promise<void> {
  await writeJson(dataPath(SUMMARY_FILE), summary);
}

export async function saveApril26IngestArtifacts(input: {
  summary: IngestApril26Report;
  registry: April26SourceDocumentRecord[];
  chunks: April26AiChunk[];
  payoutBatches: April26PayoutBatch[];
  reconciliationCandidates: April26ReconciliationCandidate[];
}): Promise<void> {
  await Promise.all([
    writeJson(dataPath(SUMMARY_FILE), input.summary),
    writeJson(dataPath(REGISTRY_FILE), input.registry),
    writeJson(dataPath(CHUNKS_FILE), input.chunks),
    writeJson(dataPath(PAYOUTS_FILE), input.payoutBatches),
    writeJson(dataPath(RECON_FILE), input.reconciliationCandidates),
  ]);
}

export async function loadApril26IngestSummary(): Promise<IngestApril26Report | null> {
  return readJson<IngestApril26Report | null>(dataPath(SUMMARY_FILE), null);
}

export async function loadApril26SourceDocuments(): Promise<April26SourceDocumentRecord[]> {
  return readJson(dataPath(REGISTRY_FILE), []);
}

export async function loadApril26AiChunks(): Promise<April26AiChunk[]> {
  return readJson(dataPath(CHUNKS_FILE), []);
}

export async function loadApril26PayoutBatches(): Promise<April26PayoutBatch[]> {
  return readJson(dataPath(PAYOUTS_FILE), []);
}

export async function loadApril26ReconciliationCandidates(): Promise<April26ReconciliationCandidate[]> {
  return readJson(dataPath(RECON_FILE), []);
}
