import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Load `.env` then `.env.local` from the repo root; **later file wins** (same as Next.js).
 *
 * Previous ingest logic only filled `process.env` when a key was missing, so a placeholder or
 * stale `OPENAI_API_KEY` in `.env` could block the real key in `.env.local`, causing 401s.
 */
export function loadRedDirtEnv(repoRoot: string): void {
  const merged = new Map<string, string>();

  for (const name of [".env", ".env.local"] as const) {
    const p = path.join(repoRoot, name);
    if (!existsSync(p)) continue;
    let text = readFileSync(p, "utf8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    for (const line of text.split("\n")) {
      if (/^\s*#/.test(line) || /^\s*$/.test(line)) continue;
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1]!;
      let val = m[2]!.trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/\\n/g, "\n");
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      merged.set(key, val);
    }
  }

  for (const [key, val] of merged) {
    process.env[key] = val;
  }
}
