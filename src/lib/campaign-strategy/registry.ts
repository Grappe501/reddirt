import type { StrategyDoc } from "./types";
import { futureCountyDocument } from "./strategy-docs/appendix-and-future";

const ALL: StrategyDoc[] = [futureCountyDocument];

const byPath = new Map<string, StrategyDoc>(ALL.map((d) => [d.path, d]));

export function getStrategyDoc(pathKey: string): StrategyDoc | null {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  return byPath.get(key) ?? null;
}

export function listAllStrategyDocs(): StrategyDoc[] {
  return ALL;
}
