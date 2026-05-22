import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadEnv(".env");
loadEnv(".env.local");

const secret = (process.env.ADMIN_SECRET ?? "").trim();
const test = (process.argv[2] ?? "").trim();
const hash = (s) => createHash("sha256").update(s, "utf8").digest();
const matches = Boolean(secret && test && hash(test).equals(hash(secret)));

console.log(
  JSON.stringify({
    adminSecretSet: Boolean(secret),
    adminSecretLength: secret.length,
    passphraseMatches: matches,
    hint: !secret ? "Set ADMIN_SECRET in .env or .env.local" : matches ? "ok" : "ADMIN_SECRET does not match entered passphrase",
  }),
);
