/**
 * Interactive wizard: paste Google Calendar OAuth + site URLs into .env.local
 * with step-by-step Google Cloud Console hints.
 *
 * Usage (from RedDirt root):
 *   npm run set:google-calendar-env
 *   node scripts/set-google-calendar-env.cjs
 *
 * Code references:
 *   - Callback route: src/app/api/calendar/google/callback/route.ts
 *   - Webhook:        src/app/api/calendar/google/webhook/route.ts
 *   - Cron:           src/app/api/calendar/google/cron-sync/route.ts
 *   - Env resolution: src/lib/calendar/env.ts
 *   - OAuth scope:    src/lib/integrations/google/oauth.ts
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const crypto = require("crypto");

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
          "stdin is not a terminal. Run from PowerShell or cmd in the RedDirt folder, not from a non-interactive task.",
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

function printReference() {
  console.log(`
================================================================================
REDIRT — GOOGLE CALENDAR (from this repo; no hunting)
================================================================================

OAuth scope requested by the app:
  https://www.googleapis.com/auth/calendar
  (full calendar scope — read/write; see src/lib/integrations/google/oauth.ts)

Environment variables (src/lib/calendar/env.ts):
  GOOGLE_CALENDAR_CLIENT_ID
  GOOGLE_CALENDAR_CLIENT_SECRET
  GOOGLE_CALENDAR_REDIRECT_URI   (optional if NEXT_PUBLIC_SITE_URL is set)
  NEXT_PUBLIC_SITE_URL           (used to build default redirect + webhook base)
  CALENDAR_CRON_SECRET           (required for secured cron endpoint)
  GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING  (optional: true/false)

Exact HTTP routes:
  OAuth callback (must match Google Cloud "Authorized redirect URIs" EXACTLY):
    {NEXT_PUBLIC_SITE_URL}/api/calendar/google/callback
    Example local:  http://localhost:3000/api/calendar/google/callback

  Gmail OAuth (different path — only if you use staff Gmail connect):
    {NEXT_PUBLIC_SITE_URL}/api/gmail/oauth/callback

  Webhook (Google push; production must be HTTPS, publicly reachable):
    {NEXT_PUBLIC_SITE_URL}/api/calendar/google/webhook

  Cron fallback (your scheduler calls this with a secret query param):
    GET {NEXT_PUBLIC_SITE_URL}/api/calendar/google/cron-sync?key=<CALENDAR_CRON_SECRET>

Admin UI to complete OAuth after env is set:
  /admin/workbench/calendar   (Calendar HQ)

IMPORTANT — Google Cloud mismatch fix:
  Your OAuth client must NOT use .../api/calendar/google/oauth/callback
  The app implements:        .../api/calendar/google/callback
  (no "oauth" segment). Update Authorized redirect URIs in Google Cloud.

Authorized JavaScript origins (Google Cloud):
  Add http://localhost:3000 and your production https:// origin if the consent
  popup or docs recommend it; redirect URI accuracy matters most for this flow.

Docs in repo:
  docs/google-integration-readiness-checklist.md
================================================================================
`);
}

function printGoogleCloudSteps() {
  console.log(`
--------------------------------------------------------------------------------
GOOGLE CLOUD CONSOLE — follow while this script waits for your pastes
--------------------------------------------------------------------------------
1) Open https://console.cloud.google.com/ and select your project.

2) APIs & Services → Library → search "Google Calendar API" → Enable.

3) APIs & Services → OAuth consent screen
   - User type: External (typical) or Internal (Workspace only).
   - Fill app name, support email, developer contact.
   - Testing mode: add every Google account that will connect as a Test user.

4) APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: e.g. RedDirt Calendar
   - Authorized redirect URIs — add EXACTLY (two lines for local + prod if needed):
       http://localhost:3000/api/calendar/google/callback
       https://YOUR-PRODUCTION-DOMAIN/api/calendar/google/callback
   - If you use Gmail OAuth in this app, also add:
       http://localhost:3000/api/gmail/oauth/callback
   - Authorized JavaScript origins — add:
       http://localhost:3000
       https://YOUR-PRODUCTION-DOMAIN

5) Copy the Client ID and Client Secret from that screen (you will paste them next).

6) After saving .env.local, connect the calendar from /admin/workbench/calendar
   so tokens land on your CalendarSource row.

7) Production: schedule GET /api/calendar/google/cron-sync?key=... every 5–15 min.

--------------------------------------------------------------------------------
`);
}

/**
 * @param {readline.Interface} rl
 * @param {string} prompt
 * @param {string} [defaultValue]
 */
function askLine(rl, prompt, defaultValue) {
  const hint = defaultValue !== undefined && defaultValue !== "" ? ` [${defaultValue}]` : "";
  return new Promise((resolve) => {
    rl.question(`${prompt}${hint}: `, (answer) => {
      const t = answer.trim();
      resolve(t || (defaultValue !== undefined ? defaultValue : ""));
    });
  });
}

async function main() {
  printReference();
  printGoogleCloudSteps();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log("Paste values when prompted. Press Ctrl+C to abort.\n");

    const siteDefault = "http://localhost:3000";
    const siteUrlRaw = await askLine(
      rl,
      `NEXT_PUBLIC_SITE_URL (public site base, no trailing slash)`,
      siteDefault,
    );
    const siteUrl = siteUrlRaw.replace(/\/$/, "") || siteDefault.replace(/\/$/, "");

    const defaultRedirect = `${siteUrl}/api/calendar/google/callback`;

    const clientId = await askLine(rl, "GOOGLE_CALENDAR_CLIENT_ID (from Google Cloud Credentials)", "");
    if (!clientId) {
      console.error("Client ID is required.");
      process.exit(1);
    }

    rl.close();

    const clientSecret = await readSecretLine("GOOGLE_CALENDAR_CLIENT_SECRET (hidden paste): ");
    if (!clientSecret) {
      console.error("Client secret is required.");
      process.exit(1);
    }

    const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
    const redirectIn = await askLine(
      rl2,
      `GOOGLE_CALENDAR_REDIRECT_URI (Enter alone to use ${defaultRedirect})`,
      defaultRedirect,
    );
    rl2.close();
    const redirectUri = redirectIn.trim() || defaultRedirect;

    const cronSecretIn = await readSecretLine(
      "CALENDAR_CRON_SECRET (hidden; Enter alone to auto-generate 32 bytes hex): ",
    );
    const cronSecret =
      cronSecretIn.trim() || crypto.randomBytes(32).toString("hex");

    const rl3 = readline.createInterface({ input: process.stdin, output: process.stdout });
    const autoPub = (
      await askLine(rl3, "GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING (true/false, default false)", "false")
    )
      .trim()
      .toLowerCase();
    rl3.close();

    const autoPublishVal =
      autoPub === "true" || autoPub === "1" || autoPub === "yes" ? "true" : "false";

    upsertEnvFileLine(envLocal, "NEXT_PUBLIC_SITE_URL", siteUrl);
    upsertEnvFileLine(envLocal, "GOOGLE_CALENDAR_CLIENT_ID", clientId);
    upsertEnvFileLine(envLocal, "GOOGLE_CALENDAR_CLIENT_SECRET", clientSecret);
    upsertEnvFileLine(envLocal, "GOOGLE_CALENDAR_REDIRECT_URI", redirectUri);
    upsertEnvFileLine(envLocal, "CALENDAR_CRON_SECRET", cronSecret);
    upsertEnvFileLine(envLocal, "GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING", autoPublishVal);

    console.log(`
Wrote to ${path.relative(process.cwd(), envLocal) || ".env.local"}:
  NEXT_PUBLIC_SITE_URL
  GOOGLE_CALENDAR_CLIENT_ID
  GOOGLE_CALENDAR_CLIENT_SECRET
  GOOGLE_CALENDAR_REDIRECT_URI=${redirectUri}
  CALENDAR_CRON_SECRET=(saved)
  GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING=${autoPublishVal}

Next: restart dev server, fix Google redirect URI if it still has /oauth/ in the path,
then open /admin/workbench/calendar and connect Google.
`);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

main();
