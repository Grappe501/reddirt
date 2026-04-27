/**
 * Interactive: prompt for ELEVENLABS_API_KEY (hidden), optional ELEVENLABS_VOICE_ID, verify key, save to .env.local.
 *
 * Does not add @elevenlabs/elevenlabs-js; verification uses GET /v1/user. Netlify: add the same env vars
 * in Site settings → Environment variables.
 *
 * Usage (from H:\\SOSWebsite\\RedDirt):
 *   npm run set:elevenlabs
 *   node scripts/set-elevenlabs-env.cjs
 *
 * You can also pass the key only (for CI) — not recommended; prefer interactive:
 *   ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... node scripts/set-elevenlabs-env.cjs --from-env
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
          "stdin is not a terminal. Run from PowerShell or cmd in the RedDirt folder, or use --from-env with ELEVENLABS_API_KEY set.",
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

      if (s === "\u001b" || s.startsWith("\u001b[")) {
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
 */
async function verifyElevenLabsKey(apiKey) {
  const res = await fetch("https://api.elevenlabs.io/v1/user", {
    method: "GET",
    headers: { "xi-api-key": apiKey },
  });
  return res;
}

/**
 * @returns {Promise<string>}
 */
function readVisibleLine(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer).trim());
    });
  });
}

async function main() {
  const fromEnv = process.argv.includes("--from-env");
  let apiKey = process.env.ELEVENLABS_API_KEY?.trim() ?? "";
  let voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() ?? "";

  if (fromEnv) {
    if (!apiKey) {
      console.error("Set ELEVENLABS_API_KEY in the environment, or run without --from-env for interactive input.");
      process.exit(1);
    }
  } else {
    console.log(
      "ElevenLabs — saves to .env.local (not committed; same as other local secrets).\n" +
        "API key: paste in the dark and press Enter.\n",
    );
    apiKey = await readSecretLine("ELEVENLABS_API_KEY: ");
    if (!apiKey) {
      console.error("No API key entered.");
      process.exit(1);
    }

    if (!voiceId) {
      voiceId = await readVisibleLine(
        "ELEVENLABS_VOICE_ID (from Elevenlabs voice library; Enter to save key only and add ID later): ",
      );
    }
  }

  process.stdout.write("Verifying API key with ElevenLabs… ");
  const res = await verifyElevenLabsKey(apiKey);
  if (!res.ok) {
    process.stdout.write("failed.\n");
    const t = await res.text();
    console.error(`HTTP ${res.status}`);
    console.error(t.slice(0, 500));
    process.exit(1);
  }
  process.stdout.write("ok.\n");

  upsertEnvFileLine(envLocal, "ELEVENLABS_API_KEY", apiKey);
  if (voiceId) {
    upsertEnvFileLine(envLocal, "ELEVENLABS_VOICE_ID", voiceId);
  }

  console.log(`\nWrote to ${path.relative(process.cwd(), envLocal) || ".env.local"}`);
  console.log("  ELEVENLABS_API_KEY=***");
  if (voiceId) {
    console.log(`  ELEVENLABS_VOICE_ID=${voiceId}`);
  } else {
    console.log("  (Add ELEVENLABS_VOICE_ID in .env.local when you have a voice id from the ElevenLabs library.)");
  }
  console.log(
    "\nFor Netlify: add the same variable names in Site settings → Environment variables.\n" +
      "Restart the dev server after changing .env.local.\n",
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
