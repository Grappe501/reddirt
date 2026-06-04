import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { OpponentMediaCatalog, OpponentMediaEntry } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";

export type { OpponentMediaCatalog, OpponentMediaEntry } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";
export { isYoutubeUrl } from "@/lib/intelligence/opponents/opponentMediaCatalogTypes";

const CATALOG_REL = "data/opposition/opponent-media-catalog.json";

export function loadOpponentMediaCatalog(repoRoot: string = process.cwd()): OpponentMediaCatalog {
  const abs = path.join(repoRoot, CATALOG_REL);
  if (!fs.existsSync(abs)) {
    return { version: 1, generatedAt: new Date().toISOString(), candidates: [] };
  }
  return JSON.parse(fs.readFileSync(abs, "utf8")) as OpponentMediaCatalog;
}

export function listOpponentMedia(
  opponentId: string,
  catalog?: OpponentMediaCatalog,
): OpponentMediaEntry[] {
  const c = catalog ?? loadOpponentMediaCatalog();
  return c.candidates.filter((e) => e.opponentId === opponentId);
}

export function findOpponentMediaById(id: string, catalog?: OpponentMediaCatalog): OpponentMediaEntry | undefined {
  const c = catalog ?? loadOpponentMediaCatalog();
  return c.candidates.find((e) => e.id === id);
}
