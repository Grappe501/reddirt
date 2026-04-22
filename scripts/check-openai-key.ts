/**
 * Verify OPENAI_API_KEY without printing it. Usage: npx tsx scripts/check-openai-key.ts
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(root);

const key = process.env.OPENAI_API_KEY?.trim();
const model = process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small";

async function main() {
  if (!key) {
    console.error("No OPENAI_API_KEY found in .env or .env.local (after loadEnvConfig).");
    process.exit(1);
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: "key check" }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error(`OpenAI key check failed: HTTP ${res.status}`);
    console.error(detail.slice(0, 500));
    process.exit(1);
  }

  console.log(`OpenAI key is valid (embeddings model: ${model}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
