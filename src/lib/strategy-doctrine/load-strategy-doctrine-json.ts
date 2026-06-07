import { readFile } from "fs/promises";
import path from "node:path";
import { STRATEGY_DOCTRINE_DIR, findStrategyDoctrineEntry } from "./strategy-doctrine-nav";

export type StrategyDoctrineJsonLoadResult =
  | { kind: "doc"; json: unknown; raw: string; sourceFile: string; pathKey: string }
  | { kind: "absent" }
  | { kind: "error"; sourceFile: string; message: string; pathKey: string };

/** Load JSON artifact from `data/strategy-doctrine/` by pathKey. */
export async function loadStrategyDoctrineJson(pathKey: string): Promise<StrategyDoctrineJsonLoadResult> {
  const entry = findStrategyDoctrineEntry(pathKey);
  if (!entry) return { kind: "absent" };

  const full = path.join(process.cwd(), STRATEGY_DOCTRINE_DIR, entry.fileName);
  try {
    const raw = await readFile(full, "utf8");
    const json = JSON.parse(raw) as unknown;
    return { kind: "doc", json, raw, sourceFile: entry.fileName, pathKey: entry.pathKey };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown read error";
    if ((e as NodeJS.ErrnoException).code === "ENOENT") {
      return { kind: "absent" };
    }
    return { kind: "error", sourceFile: entry.fileName, message, pathKey: entry.pathKey };
  }
}
