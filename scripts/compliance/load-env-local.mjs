import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

/** Load `.env.local` / `.env` into process.env for compliance CLI scripts (Next dev loads these automatically). */
export function loadEnvLocal(cwd = process.cwd()) {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(cwd, name);
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}
