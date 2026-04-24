/**
 * OPENAI-KEY-OPS-1: Load .env + .env.local (local overrides), smoke-test embeddings API.
 * Does not print the API key.
 *
 * Usage (from RedDirt/): npm run test:openai-key
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Parse KEY=value lines (same spirit as load-red-dirt-env; no shell export syntax).
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function loadEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  let text = fs.readFileSync(filePath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/\\n/g, "\n");
    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

/**
 * .env then .env.local — later file wins (matches Next / load-red-dirt-env).
 */
function loadMergedLocalEnv() {
  const base = loadEnvFile(path.join(root, ".env"));
  const local = loadEnvFile(path.join(root, ".env.local"));
  return { ...base, ...local };
}

function safeErrMessage(err) {
  const raw = err instanceof Error ? err.message : String(err);
  return raw.replace(/\b(sk-[a-zA-Z0-9_-]{12,})\b/g, "sk-…");
}

async function main() {
  const merged = loadMergedLocalEnv();
  const apiKey = merged.OPENAI_API_KEY?.trim();
  const model =
    merged.OPENAI_EMBEDDING_MODEL?.trim() || process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small";

  if (!apiKey) {
    console.error(
      "FAIL: OPENAI_API_KEY not found in .env or .env.local (after merge). Run npm run setup:openai-key.",
    );
    process.exit(1);
  }

  const input = "OpenAI key smoke test";

  try {
    const client = new OpenAI({ apiKey });
    const res = await client.embeddings.create({
      model,
      input: input.slice(0, 8000),
    });
    const row = res.data?.[0];
    const dims = row?.embedding?.length ?? 0;
    console.log("SUCCESS: embeddings request completed.");
    console.log("Model:", model);
    console.log("Embedding dimensions:", dims);
  } catch (e) {
    const status = /** @type {{ status?: number }} */ (e)?.status;
    console.log("FAIL: embeddings request failed.");
    console.log("Model:", model);
    if (typeof status === "number") console.log("HTTP status:", status);
    console.log("Error:", safeErrMessage(e));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(safeErrMessage(err));
  process.exit(1);
});
