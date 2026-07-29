import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  EVIDENCE_AI_MEMORY_REL,
  type EvidenceAiMemoryExample,
  type EvidenceAiMemoryStore,
} from "@/lib/campaign-media/evidence-ai-types";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

export function emptyEvidenceAiMemory(): EvidenceAiMemoryStore {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Confirmed Evidence Workbench examples used as few-shot context for AI suggestions. Never treat Unconfirmed guesses as memory.",
    examples: [],
  };
}

export function loadEvidenceAiMemory(): EvidenceAiMemoryStore {
  const p = abs(EVIDENCE_AI_MEMORY_REL);
  if (!existsSync(p)) return emptyEvidenceAiMemory();
  return JSON.parse(readFileSync(p, "utf8")) as EvidenceAiMemoryStore;
}

export function rememberConfirmedEvidenceExample(example: EvidenceAiMemoryExample): void {
  const county = example.county.trim();
  const city = example.city.trim();
  if (!county || county === "Unknown" || !city || city === "Unknown") {
    // Do not learn Unknown geography
    return;
  }
  const store = loadEvidenceAiMemory();
  const next = store.examples.filter((e) => !(e.assetKind === example.assetKind && e.assetId === example.assetId));
  next.unshift({ ...example, updatedAt: new Date().toISOString() });
  store.examples = next.slice(0, 80);
  store.updatedAt = new Date().toISOString();
  writeJsonAtomic(EVIDENCE_AI_MEMORY_REL, store);
}

export function formatMemoryForPrompt(limit = 12): string {
  const examples = loadEvidenceAiMemory().examples.slice(0, limit);
  if (examples.length === 0) {
    return "No confirmed examples yet. Prefer Unknown over guessing.";
  }
  return examples
    .map(
      (e, i) =>
        `${i + 1}. [${e.assetKind}/${e.assetId}] county=${e.county}; city=${e.city}` +
        (e.venue ? `; venue=${e.venue}` : "") +
        (e.eventName ? `; event=${e.eventName}` : "") +
        (e.peopleVisible?.length ? `; people=${e.peopleVisible.join(", ")}` : "") +
        (e.whatThisProves ? `; proves=${e.whatThisProves}` : "") +
        (e.captionOrTitle ? `; title=${e.captionOrTitle}` : ""),
    )
    .join("\n");
}

export function ensurePacketsDir(): string {
  const dir = abs("data/campaign-media/intelligence-packets");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeEvidencePacketFile(packetId: string, data: unknown): string {
  const dir = ensurePacketsDir();
  const file = path.join(dir, `${packetId}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return path.relative(process.cwd(), file).split(path.sep).join("/");
}
