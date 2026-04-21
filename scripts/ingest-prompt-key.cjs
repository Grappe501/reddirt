/**
 * Prompt for OPENAI_API_KEY in the terminal (hidden input), optionally save to .env.local,
 * then run the doc ingest (embeddings → DB for search/RAG).
 *
 * Usage:
 *   npm run ingest:interactive
 *   node scripts/ingest-prompt-key.cjs
 *   node scripts/ingest-prompt-key.cjs --save     # save to .env.local without asking
 *   node scripts/ingest-prompt-key.cjs --no-save  # never write .env.local
 *
 * If OPENAI_API_KEY is already set, you can pass --use-env to skip the prompt.
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");

function parseArgs(argv) {
  return {
    save: argv.includes("--save"),
    noSave: argv.includes("--no-save"),
    useEnv: argv.includes("--use-env"),
  };
}

/** Match launch-dev.cjs: let repo `.env` win over a machine-level DATABASE_URL. */
function envForSubprocess(extra) {
  const env = { ...process.env, ...extra };
  delete env.DATABASE_URL;
  return env;
}

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
          "stdin is not a terminal. Set OPENAI_API_KEY in the environment or run from an interactive shell.",
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

      // Backspace (Unix / some terminals) or Ctrl+H
      if (s === "\u007f" || s === "\b" || (s.length === 1 && s.charCodeAt(0) === 8)) {
        secret = secret.slice(0, -1);
        return;
      }

      // Ignore lone escape sequences (arrow keys, etc.)
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
 * @param {string} question
 * @returns {Promise<boolean>}
 */
function askYesNo(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${question} [y/N] `, (ans) => {
      rl.close();
      resolve(/^y(es)?$/i.test(String(ans).trim()));
    });
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

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  let apiKey = "";

  if (flags.useEnv) {
    apiKey = String(process.env.OPENAI_API_KEY ?? "").trim();
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set. Unset --use-env or export the key first.");
      process.exit(1);
    }
    console.log("Using OPENAI_API_KEY from the environment (--use-env).\n");
  } else {
    if (process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim()) {
      console.log(
        "Note: OPENAI_API_KEY is already in this shell. This prompt will replace it for ingest only.\n" +
          "      To skip typing, run: npm run ingest:interactive -- --use-env\n",
      );
    }
    apiKey = await readSecretLine("OpenAI API key (hidden; paste and press Enter): ");
  }

  if (!apiKey) {
    console.error("No API key provided.");
    process.exit(1);
  }

  const envLocalPath = path.join(root, ".env.local");
  let shouldSave = false;
  if (!flags.noSave) {
    if (flags.save) {
      shouldSave = true;
    } else {
      shouldSave = await askYesNo("Save OPENAI_API_KEY to .env.local for future runs?");
    }
  }

  if (shouldSave) {
    upsertEnvFileLine(envLocalPath, "OPENAI_API_KEY", apiKey);
    console.log(`Updated ${path.relative(process.cwd(), envLocalPath) || ".env.local"}\n`);
  }

  console.log("→ Running ingest…\n");
  const result = spawnSync("npx", ["tsx", "scripts/ingest-docs.ts"], {
    cwd: root,
    env: envForSubprocess({ OPENAI_API_KEY: apiKey }),
    stdio: "inherit",
    shell: true,
  });

  process.exit(result.status ?? 1);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
