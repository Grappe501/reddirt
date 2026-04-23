/**
 * Prompt for OPENAI_API_KEY (hidden), verify against the embeddings API, save to .env.local.
 *
 * Next.js @next/env will NOT override OPENAI_API_KEY from files if it is already set in the
 * process environment (Windows “Environment variables”, shell profile, etc.). If checks still
 * fail after this script, remove OPENAI_API_KEY from system/user env and open a new terminal.
 *
 * Usage (from repo root / RedDirt):
 *   npm run set:openai
 *   node scripts/set-openai-key.cjs
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");

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
          "stdin is not a terminal. Run this from PowerShell or cmd in the RedDirt folder, not from a non-interactive task.",
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

      if (s === "\u001b") {
        return;
      }
      if (s.startsWith("\u001b[")) {
        return;
      }

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
 * @param {string} apiKey
 * @param {string} model
 */
async function verifyKey(apiKey, model) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: "key check" }),
  });
  return res;
}

async function main() {
  console.log(
    "This saves OPENAI_API_KEY to .env.local (standard place for local secrets in Next.js).\n" +
      "Input is hidden. Paste your key and press Enter.\n",
  );

  const apiKey = await readSecretLine("OpenAI API key: ");
  if (!apiKey) {
    console.error("No key entered.");
    process.exit(1);
  }

  const model =
    process.env.OPENAI_EMBEDDING_MODEL?.trim() ||
    (() => {
      try {
        const envPath = path.join(root, ".env.local");
        if (fs.existsSync(envPath)) {
          const m = fs.readFileSync(envPath, "utf8").match(/^OPENAI_EMBEDDING_MODEL=(.+)$/m);
          if (m) return m[1].trim().replace(/^["']|["']$/g, "");
        }
      } catch {
        /* ignore */
      }
      return "text-embedding-3-small";
    })();

  process.stdout.write("Verifying key with OpenAI… ");
  const res = await verifyKey(apiKey, model);
  if (!res.ok) {
    process.stdout.write("failed.\n");
    const detail = await res.text();
    console.error(`HTTP ${res.status}`);
    console.error(detail.slice(0, 600));
    process.exit(1);
  }
  process.stdout.write("ok.\n");

  upsertEnvFileLine(envLocal, "OPENAI_API_KEY", apiKey);
  console.log(`\nWrote OPENAI_API_KEY to ${path.relative(process.cwd(), envLocal) || ".env.local"}`);
  console.log(
    "\nIf npm run check:openai still fails: remove OPENAI_API_KEY from Windows User/System " +
      "environment variables (or shell profile), then open a new terminal—otherwise the old key " +
      "can override .env.local.\n",
  );

  console.log("Running npm run check:openai …\n");
  const env = { ...process.env };
  delete env.OPENAI_API_KEY;
  const check = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "check:openai"], {
    cwd: root,
    stdio: "inherit",
    shell: false,
    env,
  });
  if (check.status !== 0) {
    process.exit(check.status ?? 1);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
