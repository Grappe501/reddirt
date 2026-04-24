/**
 * OPENAI-KEY-OPS-1: Prompt for a new OpenAI API key, write to .env + .env.local, mask-print only.
 * Does not print, commit, or log the full key.
 *
 * Usage (from RedDirt/): npm run setup:openai-key
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env");
const envLocalPath = path.join(root, ".env.local");
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * @param {string} promptText
 * @returns {Promise<string>}
 */
function readSecretLine(promptText) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY) {
      reject(
        new Error(
          "stdin is not a terminal. Run from an interactive PowerShell or cmd in the RedDirt folder.",
        ),
      );
      return;
    }

    stdout.write(promptText);

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let secret = "";

    const cleanup = () => {
      try {
        stdin.setRawMode(false);
      } catch {
        /* ignore */
      }
      stdin.pause();
      stdin.removeListener("data", onData);
    };

    const onData = (key) => {
      const s = typeof key === "string" ? key : key.toString("utf8");

      if (s === "\u0004") {
        cleanup();
        stdout.write("\n");
        resolve(secret.trim());
        return;
      }

      const nl = s.indexOf("\n");
      const cr = s.indexOf("\r");
      if (nl >= 0 || cr >= 0) {
        const end = Math.min(...[nl, cr].filter((i) => i >= 0));
        secret += s.slice(0, end);
        cleanup();
        stdout.write("\n");
        resolve(secret.trim());
        return;
      }

      if (s === "\u0003") {
        cleanup();
        stdout.write("\n");
        process.exit(130);
      }

      if (s === "\u007f" || s === "\b" || (s.length === 1 && s.charCodeAt(0) === 8)) {
        secret = secret.slice(0, -1);
        return;
      }

      if (s === "\u001b") return;
      if (s.startsWith("\u001b[")) return;

      secret += s;
    };

    stdin.on("data", onData);
  });
}

/**
 * @param {string} filePath
 * @param {string} key
 * @param {string} value
 */
function upsertEnvFileLine(filePath, key, value) {
  const needsQuotes = /[\s#"'\\]/.test(value);
  const safe = needsQuotes ? `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : value;
  const newLine = `${key}=${safe}`;

  let content = "";
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, "utf8");
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  }

  const lines = content.split(/\r?\n/);
  const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=`);
  let found = false;
  const next = lines.map((line) => {
    if (re.test(line)) {
      found = true;
      return newLine;
    }
    return line;
  });

  if (!found) {
    const trimmed = next.join("\n").replace(/\s+$/, "");
    const prefix = trimmed.length ? `${trimmed}\n` : "";
    fs.writeFileSync(filePath, `${prefix}${newLine}\n`, "utf8");
    return;
  }

  fs.writeFileSync(filePath, next.join("\n").replace(/\s+$/, "") + "\n", "utf8");
}

/**
 * Append KEY=value only if no line sets KEY (does not overwrite).
 * @param {string} filePath
 * @param {string} key
 * @param {string} value
 */
function ensureEnvKeyIfMissing(filePath, key, value) {
  let content = "";
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, "utf8");
    if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  }
  const re = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=`, "m");
  if (re.test(content)) return;

  const needsQuotes = /[\s#"'\\]/.test(value);
  const safe = needsQuotes ? `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"` : value;
  const newLine = `${key}=${safe}`;
  const trimmed = content.replace(/\s+$/, "");
  const prefix = trimmed.length ? `${trimmed}\n` : "";
  fs.writeFileSync(filePath, `${prefix}${newLine}\n`, "utf8");
}

/**
 * @param {string} key
 */
function maskedKeyLabel(key) {
  const t = key.trim();
  if (t.length < 8) return "sk-…(too short)";
  return `sk-...${t.slice(-4)}`;
}

/**
 * @param {string} key
 */
function validateOpenAiKeyFormat(key) {
  const t = key.trim();
  if (!t.startsWith("sk-")) {
    return { ok: false, message: "Key must start with sk-." };
  }
  if (t.length < 40) {
    return { ok: false, message: "Key looks too short for a valid OpenAI API secret." };
  }
  return { ok: true };
}

async function main() {
  console.log(
    "OPENAI-KEY-OPS-1: writes OPENAI_API_KEY to .env and .env.local (input hidden where TTY supports it).\n" +
      "Next.js and scripts: prefer .env.local for secrets; .env is updated too so CLIs that only read .env still work.\n",
  );

  const apiKey = await readSecretLine("Paste new OpenAI API key: ");
  if (!apiKey) {
    console.error("No key entered.");
    process.exit(1);
  }

  const fmt = validateOpenAiKeyFormat(apiKey);
  if (!fmt.ok) {
    console.error(fmt.message);
    process.exit(1);
  }

  upsertEnvFileLine(envPath, "OPENAI_API_KEY", apiKey);
  upsertEnvFileLine(envLocalPath, "OPENAI_API_KEY", apiKey);

  ensureEnvKeyIfMissing(envPath, "OPENAI_EMBEDDING_MODEL", DEFAULT_EMBEDDING_MODEL);
  ensureEnvKeyIfMissing(envLocalPath, "OPENAI_EMBEDDING_MODEL", DEFAULT_EMBEDDING_MODEL);

  console.log("\nUpdated:", path.relative(root, envPath) || ".env");
  console.log("Updated:", path.relative(root, envLocalPath) || ".env.local");
  console.log("Key fingerprint (masked):", maskedKeyLabel(apiKey));
  console.log("\nNext: npm run test:openai-key\n");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
