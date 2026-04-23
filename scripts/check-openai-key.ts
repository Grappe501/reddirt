/**
 * Verify OPENAI_API_KEY without printing it. Usage: npx tsx scripts/check-openai-key.ts
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Next’s loader never applies file values for keys already in `process.env`. Drop the shell
 * copy before loading so `.env.local` wins; then fall back to the shell value if no file set it
 * (CI / one-off export).
 */
const shellKey = process.env.OPENAI_API_KEY?.trim();
delete process.env.OPENAI_API_KEY;
loadEnvConfig(root);

async function main() {
  const key = process.env.OPENAI_API_KEY?.trim() || shellKey;
  const model = process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small";

  if (!key) {
    console.error(
      "No OPENAI_API_KEY in .env / .env.local or the shell. Run `npm run set:openai` or export the key.",
    );
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
